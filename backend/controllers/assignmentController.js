const Assignment = require('../models/Assignment');
const AssignmentStudent = require('../models/AssignmentStudent');
const Submission = require('../models/Submission');
const Class = require('../models/Class');
const Notification = require('../models/Notification');
const db = require('../config/db');

const assignmentController = {
  // Create assignment (Teacher only - for their classes)
  createAssignment: async (req, res) => {
    try {
      const { title, description, file_url, total_marks, deadline, class_id, student_id } = req.body;
      const teacher_id = req.user.id;

      if (!title || !class_id) {
        return res.status(400).json({ message: 'Title and class_id are required' });
      }

      const targetStudentId = student_id ? Number(student_id) : null;
      const hasTargetStudent = Number.isInteger(targetStudentId) && targetStudentId > 0;
      let targetStudents = [];

      // Validate targeted student is enrolled in the selected class.
      if (hasTargetStudent) {
        const [studentRows] = await db.promise().query(
          `
            SELECT u.id, u.name
            FROM users u
            WHERE u.id = ?
              AND u.role = 'student'
              AND (
                EXISTS (
                  SELECT 1
                  FROM enrollments e
                  WHERE e.class_id = ? AND e.student_id = u.id
                )
                OR EXISTS (
                  SELECT 1
                  FROM class_students cs
                  WHERE cs.class_id = ? AND cs.student_id = u.id
                )
              )
            LIMIT 1
          `,
          [targetStudentId, class_id, class_id]
        );

        if (studentRows.length === 0) {
          return res.status(400).json({
            message: 'Selected student is not enrolled in the selected class'
          });
        }

        targetStudents = studentRows;
      }

      const assignmentData = {
        title,
        description: description || '',
        file_url: file_url || null,
        total_marks: total_marks || 100,
        deadline: deadline || null,
        class_id,
        teacher_id
      };

      // Create the assignment
      const assignmentId = await Assignment.create(assignmentData);

      // Optional targeted student assignment support.
      // If teacher selected one student in UI, persist mapping for student dashboard visibility.
      if (hasTargetStudent) {
        try {
          await AssignmentStudent.addStudents(assignmentId, [targetStudentId]);
        } catch (assignErr) {
          // Keep assignment creation successful even if assignment_students table is missing.
          console.warn('assignment_students mapping skipped:', assignErr.message);
        }
      }
      
      // Get class details for notification message
      Class.findById(class_id, (classErr, classResults) => {
        const classData = Array.isArray(classResults) ? classResults[0] : classResults;
        const classTitle = classData ? classData.title : 'Unknown Class';
        const deadlineStr = deadline ? new Date(deadline).toLocaleDateString() : 'No deadline';

        const handleNotifications = (students) => {
          if (!students || students.length === 0) {
            console.log('No students enrolled or error fetching students');
            return res.status(201).json({ 
              message: 'Assignment created successfully', 
              assignment: { id: assignmentId, ...assignmentData },
              targeted_students: targetStudents.length
            });
          }

          // Create notifications for all enrolled students
          const notifications = students.map(student => ({
            user_id: student.id,
            assignment_id: assignmentId,
            message: `New assignment added for ${classTitle}. Due on ${deadlineStr}`,
            notification_type: 'assignment_created'
          }));

          Notification.createBulk(notifications, (notifErr) => {
            if (notifErr) {
              console.error('Error creating notifications:', notifErr);
            } else {
              console.log(`✅ Created ${notifications.length} notifications for assignment ${assignmentId}`);
            }

            res.status(201).json({ 
              message: 'Assignment created successfully and students notified', 
              assignment: { id: assignmentId, ...assignmentData },
              notified_students: notifications.length,
              targeted_students: targetStudents.length
            });
          });
        };

        // If specific student is selected, notify only that student.
        if (targetStudents.length > 0) {
          return handleNotifications(targetStudents);
        }

        // Otherwise notify all students enrolled in selected class.
        const studentsQuery = `
          SELECT u.id, u.name 
          FROM users u
          JOIN class_students cs ON u.id = cs.student_id
          WHERE cs.class_id = ? AND u.role = 'student'
        `;

        db.query(studentsQuery, [class_id], (enrollErr, students) => {
          if (enrollErr) {
            console.log('Error fetching enrolled students:', enrollErr.message);
            return res.status(201).json({
              message: 'Assignment created successfully',
              assignment: { id: assignmentId, ...assignmentData },
              targeted_students: targetStudents.length
            });
          }
          handleNotifications(students);
        });
      });
    } catch (err) {
      console.error('Error creating assignment:', err);
      res.status(500).json({ message: 'Error creating assignment', error: err.message });
    }
  },

  // Get all assignments (Admin sees all, Teacher sees own, Student sees enrolled classes)
  getAllAssignments: async (req, res) => {
    try {
      const userId = req.user.id;
      const userRole = req.user.role;

      if (userRole === 'admin') {
        const assignments = await Assignment.findAll();
        res.json({ assignments });
      } else if (userRole === 'teacher') {
        const assignments = await Assignment.findByTeacher(userId);
        res.json({ assignments });
      } else if (userRole === 'student') {
        // Get assignments from classes the student is enrolled in,
        // plus assignments explicitly targeted to this student.
        const query = `
          SELECT a.*, 
                 u.name as teacher_name,
                 c.title as class_title,
                 c.title as course_name,
                 a.deadline as due_date,
                 s.id as submission_id,
                 s.submitted_at,
                 s.marks,
                 s.marks as marks_obtained,
                 s.feedback,
                 s.status as submission_status,
                 s.file_url as submission_file_url,
                 CASE WHEN s.status = 'graded' THEN 1 ELSE 0 END as graded
          FROM assignments a
          JOIN classes c ON a.class_id = c.id
          JOIN users u ON a.teacher_id = u.id
          LEFT JOIN class_students cs ON a.class_id = cs.class_id AND cs.student_id = ?
          LEFT JOIN assignment_students ast ON a.id = ast.assignment_id AND ast.student_id = ?
          LEFT JOIN submissions s ON a.id = s.assignment_id AND s.student_id = ?
          WHERE cs.student_id IS NOT NULL OR ast.student_id IS NOT NULL
          GROUP BY a.id
          ORDER BY a.deadline DESC
        `;
        
        db.query(query, [userId, userId, userId], (err, assignments) => {
          if (err) {
            // Backward compatibility if assignment_students table is not present yet.
            if (err.code === 'ER_NO_SUCH_TABLE') {
              const fallbackQuery = `
                SELECT a.*, 
                       u.name as teacher_name,
                       c.title as class_title,
                       c.title as course_name,
                       a.deadline as due_date,
                       s.id as submission_id,
                       s.submitted_at,
                       s.marks,
                       s.marks as marks_obtained,
                       s.feedback,
                       s.status as submission_status,
                       s.file_url as submission_file_url,
                       CASE WHEN s.status = 'graded' THEN 1 ELSE 0 END as graded
                FROM assignments a
                JOIN classes c ON a.class_id = c.id
                JOIN users u ON a.teacher_id = u.id
                JOIN class_students cs ON a.class_id = cs.class_id
                LEFT JOIN submissions s ON a.id = s.assignment_id AND s.student_id = ?
                WHERE cs.student_id = ?
                ORDER BY a.deadline DESC
              `;

              return db.query(fallbackQuery, [userId, userId], (fallbackErr, fallbackAssignments) => {
                if (fallbackErr) {
                  console.error('Error retrieving assignments (fallback):', fallbackErr);
                  return res.status(500).json({ message: 'Error retrieving assignments', error: fallbackErr.message });
                }
                return res.json({ assignments: fallbackAssignments });
              });
            }

            console.error('Error retrieving assignments:', err);
            return res.status(500).json({ message: 'Error retrieving assignments', error: err.message });
          }
          res.json({ assignments });
        });
      }
    } catch (err) {
      console.error('Error retrieving assignments:', err);
      res.status(500).json({ message: 'Error retrieving assignments', error: err.message });
    }
  },

  // Get assignments for current student (from enrolled classes + targeted assignments)
  // Simplified query to avoid MySQL only_full_group_by issues
  getAssignmentsForStudent: async (req, res) => {
    try {
      const userId = req.user.id;
      const db = require('../config/db');

      // Simple subquery approach to avoid GROUP BY issues
      const query = `
        SELECT 
          a.id,
          a.title,
          a.description,
          a.file_url,
          a.total_marks,
          a.deadline as due_date,
          a.class_id,
          a.teacher_id,
          a.created_at,
          u.name as teacher_name,
          c.title as class_title,
          c.title as course_name,
          (
            SELECT COUNT(*)
            FROM submissions sub
            WHERE sub.assignment_id = a.id AND sub.student_id = ?
          ) as submission_count,
          (
            SELECT id
            FROM submissions sub
            WHERE sub.assignment_id = a.id AND sub.student_id = ?
            LIMIT 1
          ) as submission_id,
          (
            SELECT status
            FROM submissions sub
            WHERE sub.assignment_id = a.id AND sub.student_id = ?
            LIMIT 1
          ) as submission_status,
          (
            SELECT submitted_at
            FROM submissions sub
            WHERE sub.assignment_id = a.id AND sub.student_id = ?
            LIMIT 1
          ) as submitted_at,
          (
            SELECT marks
            FROM submissions sub
            WHERE sub.assignment_id = a.id AND sub.student_id = ?
            LIMIT 1
          ) as marks,
          (
            SELECT marks
            FROM submissions sub
            WHERE sub.assignment_id = a.id AND sub.student_id = ?
            LIMIT 1
          ) as marks_obtained,
          (
            SELECT feedback
            FROM submissions sub
            WHERE sub.assignment_id = a.id AND sub.student_id = ?
            LIMIT 1
          ) as feedback,
          (
            SELECT file_url
            FROM submissions sub
            WHERE sub.assignment_id = a.id AND sub.student_id = ?
            LIMIT 1
          ) as submission_file_url,
          (
            SELECT CASE WHEN marks IS NOT NULL THEN 1 ELSE 0 END
            FROM submissions sub
            WHERE sub.assignment_id = a.id AND sub.student_id = ?
            LIMIT 1
          ) as graded
        FROM assignments a
        JOIN classes c ON a.class_id = c.id
        JOIN users u ON a.teacher_id = u.id
        WHERE EXISTS (
          SELECT 1 FROM class_students cs
          WHERE cs.class_id = a.class_id AND cs.student_id = ?
        )
        OR EXISTS (
          SELECT 1 FROM assignment_students ast
          WHERE ast.assignment_id = a.id AND ast.student_id = ?
        )
        ORDER BY a.deadline DESC
      `;

      db.query(query, [userId, userId, userId, userId, userId, userId, userId, userId, userId, userId, userId], (err, assignments) => {
        if (err) {
          console.error('❌ Error retrieving assignments:', {
            code: err.code,
            message: err.message,
            sqlState: err.sqlState
          });
          
          // Fallback: Try simpler query without subqueries
          const simpleQuery = `
            SELECT DISTINCT
              a.id,
              a.title,
              a.description,
              a.file_url,
              a.total_marks,
              a.deadline as due_date,
              a.class_id,
              a.teacher_id,
              u.name as teacher_name,
              c.title as class_title
            FROM assignments a
            JOIN classes c ON a.class_id = c.id
            JOIN users u ON a.teacher_id = u.id
            LEFT JOIN class_students cs ON a.class_id = cs.class_id AND cs.student_id = ?
            LEFT JOIN assignment_students ast ON a.id = ast.assignment_id AND ast.student_id = ?
            WHERE cs.student_id IS NOT NULL OR ast.student_id IS NOT NULL
            ORDER BY a.deadline DESC
          `;

          return db.query(simpleQuery, [userId, userId], (fallbackErr, fallbackAssignments) => {
            if (fallbackErr) {
              console.error('❌ Fallback query also failed:', fallbackErr.message);
              return res.status(500).json({
                success: false,
                message: 'Error retrieving assignments',
                error: fallbackErr.message
              });
            }
            console.log(`✅ Fallback query successful: ${fallbackAssignments.length} assignments found`);
            return res.json({ 
              success: true,
              assignments: fallbackAssignments || [] 
            });
          });
        }

        console.log(`✅ Assignments retrieved: ${assignments.length} assignments found for student ${userId}`);
        res.json({ 
          success: true,
          assignments: assignments || [] 
        });
      });
    } catch (err) {
      console.error('❌ Unexpected error in getAssignmentsForStudent:', err);
      res.status(500).json({
        success: false,
        message: 'Unexpected error retrieving assignments',
        error: err.message
      });
    }
  },

  // Get assignment by ID
  getAssignmentById: async (req, res) => {
    try {
      const { id } = req.params;
      const assignment = await Assignment.findById(id);
      
      if (!assignment) {
        return res.status(404).json({ message: 'Assignment not found' });
      }
      
      res.json(assignment);
    } catch (err) {
      console.error('Error retrieving assignment:', err);
      res.status(500).json({ message: 'Error retrieving assignment', error: err.message });
    }
  },

  // Get assignments for a specific course
  getAssignmentsByCourse: async (req, res) => {
    try {
      const { courseId } = req.params;
      const assignments = await Assignment.findByClass(courseId);
      res.json({ assignments });
    } catch (err) {
      console.error('Error retrieving assignments by course:', err);
      res.status(500).json({ message: 'Error retrieving assignments', error: err.message });
    }
  },

  // Get assignments created by a specific teacher
  getAssignmentsByTeacher: async (req, res) => {
    try {
      const { teacherId } = req.params;
      const assignments = await Assignment.findByTeacher(teacherId);
      res.json({ assignments });
    } catch (err) {
      console.error('Error retrieving assignments by teacher:', err);
      res.status(500).json({ message: 'Error retrieving assignments', error: err.message });
    }
  },

  // Get submissions for an assignment
  getAssignmentSubmissions: async (req, res) => {
    try {
      const { assignmentId } = req.params;
      const Submission = require('../models/Submission');
      
      const submissions = await Submission.findByAssignment(assignmentId);
      res.json({ submissions: submissions || [] });
    } catch (err) {
      console.error('Error retrieving submissions:', err);
      res.status(500).json({ message: 'Error retrieving submissions', error: err.message });
    }
  },

  // Update assignment (Teacher only - for their assignments)
  updateAssignment: async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description, file_url, total_marks, deadline } = req.body;
      const userId = req.user.id;
      const userRole = req.user.role;

      if (!title) {
        return res.status(400).json({ message: 'Title is required' });
      }

      const assignment = await Assignment.findById(id);
      
      if (!assignment) {
        return res.status(404).json({ message: 'Assignment not found' });
      }

      if (userRole !== 'admin' && assignment.teacher_id !== userId) {
        return res.status(403).json({ message: 'Not authorized to update this assignment' });
      }

      const updateData = {
        title,
        description: description || assignment.description,
        file_url: file_url || assignment.file_url,
        total_marks: total_marks || assignment.total_marks,
        deadline: deadline || assignment.deadline
      };

      await Assignment.update(id, updateData);
      res.json({ message: 'Assignment updated successfully', assignment: { id, ...updateData } });
    } catch (err) {
      console.error('Error updating assignment:', err);
      res.status(500).json({ message: 'Error updating assignment', error: err.message });
    }
  },

  // Delete assignment (Teacher only - for their assignments)
  deleteAssignment: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const userRole = req.user.role;

      const assignment = await Assignment.findById(id);
      
      if (!assignment) {
        return res.status(404).json({ message: 'Assignment not found' });
      }

      if (userRole !== 'admin' && assignment.teacher_id !== userId) {
        return res.status(403).json({ message: 'Not authorized to delete this assignment' });
      }

      await Assignment.delete(id);
      res.json({ message: 'Assignment deleted successfully' });
    } catch (err) {
      console.error('Error deleting assignment:', err);
      res.status(500).json({ message: 'Error deleting assignment', error: err.message });
    }
  }
};

module.exports = assignmentController;

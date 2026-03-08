const Submission = require('../models/Submission');
const Assignment = require('../models/Assignment');
const Notification = require('../models/Notification');

const submissionController = {
  // Submit assignment (Student only)
  submitAssignment: async (req, res) => {
    try {
      const { assignment_id, file_url } = req.body;
      const student_id = req.user.id;
      const student_name = req.user.name;

      if (!assignment_id) {
        return res.status(400).json({ message: 'Assignment ID is required' });
      }

      // First, check if the assignment exists and get its details
      const assignment = await Assignment.findById(assignment_id);
      
      if (!assignment) {
        return res.status(404).json({ message: 'Assignment not found' });
      }

      // Check if the deadline has passed
      if (assignment.deadline) {
        const deadline = new Date(assignment.deadline);
        const now = new Date();
        
        if (now > deadline) {
          return res.status(400).json({ 
            message: 'Cannot submit assignment after the deadline has passed',
            deadline: deadline 
          });
        }
      }

      // Check for duplicate submission
      const existingSubmission = await Submission.findByAssignmentAndStudent(assignment_id, student_id);
      
      if (existingSubmission) {
        return res.status(400).json({ 
          message: 'You have already submitted this assignment',
          submission: existingSubmission
        });
      }

      // Create the submission
      const submissionData = {
        assignment_id,
        student_id,
        file_url: file_url || null,
        status: 'submitted'
      };

      const submissionId = await Submission.create(submissionData);

      // Notify the teacher
      const notificationData = {
        user_id: assignment.teacher_id,
        assignment_id: assignment_id,
        message: `Student ${student_name} submitted assignment "${assignment.title}"`,
        notification_type: 'assignment_submitted'
      };

      Notification.create(notificationData, (notifErr) => {
        if (notifErr) {
          console.error('Error creating notification:', notifErr);
        } else {
          console.log(`✅ Notified teacher ${assignment.teacher_id} of submission`);
        }
      });

      res.status(201).json({ 
        message: 'Assignment submitted successfully', 
        submission: { id: submissionId, ...submissionData, submitted_at: new Date() } 
      });
    } catch (err) {
      console.error('Error submitting assignment:', err);
      res.status(500).json({ message: 'Error submitting assignment', error: err.message });
    }
  },

  // Get submission by ID
  getSubmissionById: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const userRole = req.user.role;

      const submission = await Submission.findById(id);
      
      if (!submission) {
        return res.status(404).json({ message: 'Submission not found' });
      }

      // Check authorization: students can only see own submissions
      if (userRole === 'student' && submission.student_id !== userId) {
        return res.status(403).json({ message: 'Not authorized to view this submission' });
      }

      res.json({ submission });
    } catch (err) {
      console.error('Error retrieving submission:', err);
      res.status(500).json({ message: 'Error retrieving submission', error: err.message });
    }
  },

  // Get submissions for an assignment (Teacher only)
  getSubmissionsByAssignment: async (req, res) => {
    try {
      const { assignmentId } = req.params;
      const userId = req.user.id;

      // Ensure assignment exists and belongs to the logged-in teacher.
      const assignment = await Assignment.findById(assignmentId);
      if (!assignment) {
        return res.status(404).json({ message: 'Assignment not found' });
      }

      if (assignment.teacher_id !== userId) {
        return res.status(403).json({ message: 'Not authorized to view these submissions' });
      }
      
      // Get all students enrolled in the assignment's class with their submission status
      const query = `
        SELECT 
          u.id as student_id,
          u.name as student_name,
          u.email as student_email,
          s.id as submission_id,
          s.id as id,
          s.file_url,
          s.submitted_at,
          s.marks,
          s.feedback,
          CASE
            WHEN s.id IS NULL THEN 'pending'
            ELSE s.status
          END as status
        FROM class_students cs
        JOIN users u ON cs.student_id = u.id
        JOIN assignments a ON cs.class_id = a.class_id
        LEFT JOIN submissions s ON s.assignment_id = a.id AND s.student_id = u.id
        WHERE a.id = ? AND u.role = 'student'
        ORDER BY u.name ASC
      `;
      
      const db = require('../config/db');
      
      // Use promise-based query with connection pool
      const [submissions] = await db.promise().query(query, [assignmentId]);
      
      if (!submissions || submissions.length === 0) {
        console.log(`ℹ️  No students enrolled for assignment ${assignmentId}`);
        return res.json({ submissions: [] });
      }
      
      console.log(`✅ Retrieved ${submissions.length} student records for assignment ${assignmentId}`);
      res.json({ submissions: submissions || [] });
    } catch (err) {
      console.error('❌ Error retrieving submissions:', err);
      res.status(500).json({ message: 'Error retrieving submissions', error: err.message });
    }
  },

  // Get submissions by student
  getSubmissionsByStudent: async (req, res) => {
    try {
      const userId = req.user.id;
      const userRole = req.user.role;

      let studentId = userId;
      
      // Admin can view any student's submissions
      if (userRole === 'admin' && req.params.studentId) {
        studentId = req.params.studentId;
      } else if (userRole !== 'student' && userRole !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to view student submissions' });
      }

      const submissions = await Submission.findByStudent(studentId);
      res.json({ submissions });
    } catch (err) {
      console.error('Error retrieving submissions:', err);
      res.status(500).json({ message: 'Error retrieving submissions', error: err.message });
    }
  },

  // Grade submission (Teacher only)
  gradeSubmission: async (req, res) => {
    try {
      const { submissionId } = req.params;
      const { marks_obtained, feedback } = req.body;
      const userId = req.user.id;
      const userRole = req.user.role;

      if (marks_obtained === undefined) {
        return res.status(400).json({ message: 'Marks obtained is required' });
      }

      const submission = await Submission.findById(submissionId);
      
      if (!submission) {
        return res.status(404).json({ message: 'Submission not found' });
      }

      // For authorization, we need to get the assignment to check the teacher
      const assignment = await Assignment.findById(submission.assignment_id);
      
      if (!assignment) {
        return res.status(404).json({ message: 'Assignment not found' });
      }

      // Verify teacher owns the assignment
      if (userRole !== 'admin' && assignment.teacher_id !== userId) {
        return res.status(403).json({ message: 'Not authorized to grade this submission' });
      }

      // Validate marks don't exceed total marks
      if (assignment.total_marks && marks_obtained > assignment.total_marks) {
        return res.status(400).json({ 
          message: `Marks obtained cannot exceed total marks (${assignment.total_marks})` 
        });
      }

      // Update the grade
      await Submission.updateGrade(submissionId, marks_obtained, feedback || '');

      // STEP 5: Notify the student with duplicate prevention
      try {
        const notificationHelper = require('../utils/notificationHelper');
        
        const notificationResult = await notificationHelper.createNotification({
          user_id: submission.student_id,
          assignment_id: submission.assignment_id,
          submission_id: submissionId, // Add submission_id for duplicate prevention
          message: `Your assignment "${assignment.title}" has been graded. Score: ${marks_obtained}/${assignment.total_marks}`,
          notification_type: 'assignment_graded'
        });

        if (notificationResult.duplicate_prevented) {
          console.log(`ℹ️  Grading notification already exists for submission ${submissionId}`);
        } else {
          console.log(`✅ Notified student ${submission.student_id} of grading`);
        }
      } catch (notifErr) {
        // Log error but don't fail the grading operation
        console.error('⚠️  Error creating grading notification:', notifErr.message);
      }

      res.json({ 
        message: 'Submission graded successfully', 
        submission: { id: submissionId, marks_obtained, feedback, graded: true } 
      });
    } catch (err) {
      console.error('Error grading submission:', err);
      res.status(500).json({ message: 'Error grading submission', error: err.message });
    }
  },

  // Get all submissions (Admin only)
  getAllSubmissions: async (req, res) => {
    try {
      const submissions = await Submission.findAll();
      res.json({ submissions });
    } catch (err) {
      console.error('Error retrieving all submissions:', err);
      res.status(500).json({ message: 'Error retrieving submissions', error: err.message });
    }
  }
};

module.exports = submissionController;

const Class = require('../models/Class');
const Enrollment = require('../models/Enrollment');
const User = require('../models/User');

// Get all active classes
exports.getAllClasses = (req, res) => {
  const query = `
    SELECT c.*, 
           u.name as teacher_name,
           (SELECT COUNT(*) FROM enrollments WHERE class_id = c.id) as enrollment_count
    FROM classes c
    JOIN users u ON c.teacher_id = u.id
    WHERE c.is_active = TRUE
    ORDER BY c.start_time ASC
  `;
  
  require('../config/db').query(query, (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err });
    res.status(200).json(results);
  });
};

// Get active classes only
exports.getActiveClasses = (req, res) => {
  const query = `
    SELECT c.*, 
           u.name as teacher_name,
           (SELECT COUNT(*) FROM enrollments WHERE class_id = c.id) as enrollment_count
    FROM classes c
    JOIN users u ON c.teacher_id = u.id
    WHERE c.is_active = TRUE AND c.start_time > NOW()
    ORDER BY c.start_time ASC
  `;
  
  require('../config/db').query(query, (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err });
    res.status(200).json(results);
  });
};

// Get class details
exports.getClassDetails = (req, res) => {
  const { id } = req.params;
  const query = `
    SELECT c.*, 
           u.name as teacher_name,
           (SELECT COUNT(*) FROM enrollments WHERE class_id = c.id) as enrollment_count
    FROM classes c
    JOIN users u ON c.teacher_id = u.id
    WHERE c.id = ? AND c.is_active = TRUE
  `;
  
  require('../config/db').query(query, [id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err });
    if (results.length === 0) return res.status(404).json({ message: 'Class not found' });
    
    const classData = results[0];
    
    // Check enrollment status if user is a student
    if (req.user && req.user.role === 'student') {
      Enrollment.checkEnrollment(id, req.user.id, (err, enrolled) => {
        classData.isEnrolled = enrolled.length > 0;
        res.status(200).json(classData);
      });
    } else {
      res.status(200).json(classData);
    }
  });
};

// Get teacher's students for enrollment display
exports.getTeacherStudents = (req, res) => {
  const { teacherId } = req.params;
  const query = `
    SELECT id, name, email FROM users 
    WHERE role = 'student'
    ORDER BY name ASC
  `;
  
  require('../config/db').query(query, (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err });
    res.status(200).json(results);
  });
};

// Get class students
exports.getClassStudents = (req, res) => {
  const { id } = req.params;

  const db = require('../config/db');
  const query = `
    SELECT id, name, email, enrolled_at
    FROM (
      SELECT u.id, u.name, u.email, e.enrolled_at
      FROM enrollments e
      JOIN users u ON e.student_id = u.id
      WHERE e.class_id = ? AND u.role = 'student'

      UNION

      SELECT u.id, u.name, u.email, cs.created_at as enrolled_at
      FROM class_students cs
      JOIN users u ON cs.student_id = u.id
      WHERE cs.class_id = ? AND u.role = 'student'
    ) s
    ORDER BY name ASC
  `;

  db.query(query, [id, id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err });
    res.status(200).json(results || []);
  });
};

// Create class (Admin only)
exports.createClass = (req, res) => {
  const { title, description, teacher_id, start_time, end_time, student_ids, days } = req.body;
  
  if (!title || !teacher_id || !start_time || !end_time) {
    return res.status(400).json({ message: 'Missing required fields: title, teacher_id, start_time, end_time' });
  }

  if (!days || !Array.isArray(days) || days.length === 0) {
    return res.status(400).json({ message: 'Please select at least one day for the class' });
  }

  const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const db = require('../config/db');
  const daysJson = JSON.stringify(days); // Convert array to JSON string
  
  const query = `
    INSERT INTO classes (title, description, teacher_id, start_time, end_time, roomId, days, date, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), TRUE)
  `;
  
  db.query(
    query,
    [title, description || '', teacher_id, start_time, end_time, roomId, daysJson],
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Failed to create class', error: err });
      
      const classId = results.insertId;
      
      // If student_ids provided, enroll students automatically
      if (student_ids && Array.isArray(student_ids) && student_ids.length > 0) {
        const enrollmentQuery = 'INSERT INTO enrollments (class_id, student_id) VALUES ?';
        const enrollmentValues = student_ids.map(studentId => [classId, studentId]);
        
        db.query(enrollmentQuery, [enrollmentValues], (enrollErr) => {
          if (enrollErr) {
            console.error('Error enrolling students:', enrollErr);
            return res.status(201).json({ 
              message: 'Class created but failed to enroll some students', 
              id: classId,
              enrollmentError: true
            });
          }
          
          // Also create attendance records for enrolled students
          const attendanceQuery = 'INSERT INTO attendance (class_id, student_id, status) VALUES ?';
          const attendanceValues = student_ids.map(studentId => [classId, studentId, 'present']);
          
          db.query(attendanceQuery, [attendanceValues], (attErr) => {
            if (attErr) {
              console.error('Error creating attendance records:', attErr);
            }
            
            res.status(201).json({ 
              message: `Class created successfully with ${student_ids.length} students enrolled`, 
              id: classId,
              enrolledCount: student_ids.length
            });
          });
        });
      } else {
        res.status(201).json({ message: 'Class created successfully', id: classId });
      }
    }
  );
};

// Update class (Admin only)
exports.updateClass = (req, res) => {
  const { id } = req.params;
  const { title, description, teacher_id, start_time, end_time, is_active, days } = req.body;
  
  const daysJson = days ? JSON.stringify(days) : null;
  
  const query = `
    UPDATE classes 
    SET title = ?, description = ?, teacher_id = ?, start_time = ?, end_time = ?, is_active = ?, days = ?
    WHERE id = ?
  `;
  
  require('../config/db').query(
    query,
    [title, description, teacher_id, start_time, end_time, is_active !== undefined ? is_active : true, daysJson, id],
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Failed to update class', error: err });
      if (results.affectedRows === 0) return res.status(404).json({ message: 'Class not found' });
      res.status(200).json({ message: 'Class updated successfully' });
    }
  );
};

// Delete class (Admin only - sets is_active to FALSE)
exports.deleteClass = (req, res) => {
  const { id } = req.params;
  
  const query = `UPDATE classes SET is_active = FALSE WHERE id = ?`;
  
  require('../config/db').query(query, [id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Failed to delete class', error: err });
    if (results.affectedRows === 0) return res.status(404).json({ message: 'Class not found' });
    res.status(200).json({ message: 'Class deleted successfully' });
  });
};

// Student enrollment routes
exports.enrollStudent = (req, res) => {
  const { classId } = req.params;
  const studentId = req.user.id;

  Enrollment.checkEnrollment(classId, studentId, (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err });

    if (results.length > 0) {
      return res.status(400).json({ message: 'Already enrolled in this class' });
    }

    Enrollment.enroll(classId, studentId, (err) => {
      if (err) return res.status(500).json({ message: 'Enrollment failed', error: err });

      // Automatically mark attendance
      const attendanceQuery = `
        INSERT INTO attendance (student_id, class_id, joined_at)
        VALUES (?, ?, NOW())
        ON DUPLICATE KEY UPDATE joined_at = NOW()
      `;
      
      require('../config/db').query(attendanceQuery, [studentId, classId], (err) => {
        if (err) console.log('Attendance marking failed:', err);
        res.status(200).json({ message: 'Successfully enrolled in the class' });
      });
    });
  });
};

exports.getStudentClasses = (req, res) => {
  const studentId = req.user.id;

  Enrollment.getStudentClasses(studentId, (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err });
    res.status(200).json(results);
  });
};

exports.unenrollStudent = (req, res) => {
  const { classId } = req.params;
  const studentId = req.user.id;

  Enrollment.unenroll(classId, studentId, (err) => {
    if (err) return res.status(500).json({ message: 'Unenrollment failed', error: err });
    res.status(200).json({ message: 'Successfully unenrolled from the class' });
  });
};

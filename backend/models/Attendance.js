const db = require('../config/db');

const Attendance = {
  // Mark student present in a class
  markPresent: (classId, studentId, joinTime, callback) => {
    const query = `
      INSERT INTO attendance (class_id, student_id, status, join_time)
      VALUES (?, ?, 'present', ?)
      ON DUPLICATE KEY UPDATE
        status = 'present',
        join_time = ?,
        leave_time = NULL
    `;
    db.query(query, [classId, studentId, joinTime, joinTime], callback);
  },

  // Mark student absent in a class
  markAbsent: (classId, studentId, callback) => {
    const query = `
      INSERT INTO attendance (class_id, student_id, status, join_time)
      VALUES (?, ?, 'absent', NOW())
      ON DUPLICATE KEY UPDATE
        status = 'absent'
    `;
    db.query(query, [classId, studentId], callback);
  },

  // Record student leave time
  recordLeaveTime: (classId, studentId, leaveTime, callback) => {
    const query = 'UPDATE attendance SET leave_time = ? WHERE class_id = ? AND student_id = ?';
    db.query(query, [leaveTime, classId, studentId], callback);
  },

  // Get attendance for a specific class
  getClassAttendance: (classId, callback) => {
    const query = `
      SELECT 
        a.id,
        a.class_id,
        a.student_id,
        a.status,
        a.join_time,
        a.leave_time,
        u.name as student_name,
        u.email as student_email
      FROM attendance a
      JOIN users u ON a.student_id = u.id
      WHERE a.class_id = ?
      ORDER BY u.name ASC
    `;
    db.query(query, [classId], callback);
  },

  // Get attendance for a specific student
  getStudentAttendance: (studentId, callback) => {
    const query = `
      SELECT 
        a.id,
        a.class_id,
        a.student_id,
        a.status,
        a.join_time,
        a.leave_time,
        c.title as class_title,
        c.date as class_date,
        u.name as teacher_name
      FROM attendance a
      JOIN classes c ON a.class_id = c.id
      JOIN users u ON c.teacher_id = u.id
      WHERE a.student_id = ?
      ORDER BY c.date DESC
    `;
    db.query(query, [studentId], callback);
  },

  // Get attendance record for a specific student in a specific class
  getAttendanceRecord: (classId, studentId, callback) => {
    const query = `
      SELECT * FROM attendance
      WHERE class_id = ? AND student_id = ?
    `;
    db.query(query, [classId, studentId], callback);
  },

  // Get attendance statistics for a class
  getAttendanceStats: (classId, callback) => {
    const query = `
      SELECT 
        COUNT(*) as total_students,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_count,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_count,
        ROUND(SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) / COUNT(*) * 100, 2) as attendance_percentage
      FROM attendance
      WHERE class_id = ?
    `;
    db.query(query, [classId], callback);
  },

  // Get student attendance percentage
  getStudentAttendancePercentage: (studentId, callback) => {
    const query = `
      SELECT 
        COUNT(*) as total_classes,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_count,
        ROUND(SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) / COUNT(*) * 100, 2) as attendance_percentage
      FROM attendance
      WHERE student_id = ?
    `;
    db.query(query, [studentId], callback);
  },

  // Update attendance status
  updateStatus: (classId, studentId, status, callback) => {
    const query = 'UPDATE attendance SET status = ? WHERE class_id = ? AND student_id = ?';
    db.query(query, [status, classId, studentId], callback);
  },

  // Delete attendance record
  deleteAttendance: (classId, studentId, callback) => {
    const query = 'DELETE FROM attendance WHERE class_id = ? AND student_id = ?';
    db.query(query, [classId, studentId], callback);
  },

  // Get all classes attended by a student
  getStudentClassHistory: (studentId, callback) => {
    const query = `
      SELECT 
        a.id,
        a.status,
        a.join_time,
        a.leave_time,
        c.id as class_id,
        c.title,
        c.date,
        c.roomId,
        u.name as teacher_name
      FROM attendance a
      JOIN classes c ON a.class_id = c.id
      JOIN users u ON c.teacher_id = u.id
      WHERE a.student_id = ?
      ORDER BY c.date DESC
    `;
    db.query(query, [studentId], callback);
  },

  // Legacy methods for backward compatibility
  create: (attendanceData, callback) => {
    const query = 'INSERT INTO attendance (student_id, class_id) VALUES (?, ?)';
    db.query(query, [attendanceData.student_id, attendanceData.class_id], callback);
  },

  checkIfExists: (studentId, classId, callback) => {
    const query = 'SELECT * FROM attendance WHERE student_id = ? AND class_id = ?';
    db.query(query, [studentId, classId], callback);
  },

  getByClassId: (classId, callback) => {
    const query = `
      SELECT attendance.*, users.name as student_name, users.email as student_email
      FROM attendance
      JOIN users ON attendance.student_id = users.id
      WHERE attendance.class_id = ?
      ORDER BY attendance.join_time DESC
    `;
    db.query(query, [classId], callback);
  },

  getByStudentId: (studentId, callback) => {
    const query = `
      SELECT attendance.*, classes.title as class_title, classes.date
      FROM attendance
      JOIN classes ON attendance.class_id = classes.id
      WHERE attendance.student_id = ?
      ORDER BY attendance.join_time DESC
    `;
    db.query(query, [studentId], callback);
  },

  // Get all attendance records for admin report
  getAllAttendanceReport: (callback) => {
    const query = `
      SELECT 
        a.id,
        a.class_id,
        a.student_id,
        a.status,
        a.join_time,
        a.leave_time,
        u.name as student_name,
        u.email as student_email,
        c.title as class_title,
        c.date as class_date,
        t.name as teacher_name,
        t.email as teacher_email
      FROM attendance a
      JOIN users u ON a.student_id = u.id
      JOIN classes c ON a.class_id = c.id
      JOIN users t ON c.teacher_id = t.id
      ORDER BY c.date DESC, u.name ASC
    `;
    db.query(query, callback);
  },

  // Get attendance records for a teacher's classes
  getTeacherAttendanceReport: (teacherId, callback) => {
    const query = `
      SELECT 
        a.id,
        a.class_id,
        a.student_id,
        a.status,
        a.join_time,
        a.leave_time,
        u.name as student_name,
        u.email as student_email,
        c.title as class_title,
        c.date as class_date
      FROM attendance a
      JOIN users u ON a.student_id = u.id
      JOIN classes c ON a.class_id = c.id
      WHERE c.teacher_id = ?
      ORDER BY c.date DESC, u.name ASC
    `;
    db.query(query, [teacherId], callback);
  }
};

module.exports = Attendance;

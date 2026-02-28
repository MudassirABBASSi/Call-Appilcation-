const db = require('../config/db');

class Submission {
    static async create(data) {
        const { assignment_id, student_id, file_url, status = 'submitted' } = data;
        const query = `
            INSERT INTO submissions (assignment_id, student_id, file_url, status, submitted_at)
            VALUES (?, ?, ?, ?, NOW())
            ON DUPLICATE KEY UPDATE 
                file_url = VALUES(file_url),
                status = VALUES(status),
                submitted_at = NOW()
        `;
        const [result] = await db.promise().query(query, [assignment_id, student_id, file_url, status]);
        return result.insertId || result.affectedRows;
    }

    static async findById(id) {
        const query = `
            SELECT s.*, u.name as student_name, a.title as assignment_title
            FROM submissions s
            JOIN users u ON s.student_id = u.id
            JOIN assignments a ON s.assignment_id = a.id
            WHERE s.id = ?
        `;
        const [rows] = await db.promise().query(query, [id]);
        return rows[0] || null;
    }

    static async findByAssignment(assignment_id) {
        const query = `
            SELECT s.*, u.name as student_name, u.email as student_email
            FROM submissions s
            JOIN users u ON s.student_id = u.id
            WHERE s.assignment_id = ?
            ORDER BY s.submitted_at DESC
        `;
        const [rows] = await db.promise().query(query, [assignment_id]);
        return rows;
    }

    static async findByStudent(student_id) {
        const query = `
            SELECT s.*, a.title as assignment_title, a.total_marks, a.deadline, c.title as class_title
            FROM submissions s
            JOIN assignments a ON s.assignment_id = a.id
            JOIN classes c ON a.class_id = c.id
            WHERE s.student_id = ?
            ORDER BY a.deadline DESC
        `;
        const [rows] = await db.promise().query(query, [student_id]);
        return rows;
    }

    static async findByAssignmentAndStudent(assignment_id, student_id) {
        const query = `
            SELECT *
            FROM submissions
            WHERE assignment_id = ? AND student_id = ?
        `;
        const [rows] = await db.promise().query(query, [assignment_id, student_id]);
        return rows[0] || null;
    }

    static async findAll(filters = {}) {
        let query = `
            SELECT s.*, 
                   st.name as student_name, 
                   st.email as student_email,
                   t.name as teacher_name,
                   a.title as assignment_title,
                   c.title as class_title
            FROM submissions s
            JOIN users st ON s.student_id = st.id
            JOIN assignments a ON s.assignment_id = a.id
            JOIN users t ON a.teacher_id = t.id
            JOIN classes c ON a.class_id = c.id
            WHERE 1=1
        `;

        const params = [];

        if (filters.class_id) {
            query += ' AND c.id = ?';
            params.push(filters.class_id);
        }

        if (filters.teacher_id) {
            query += ' AND t.id = ?';
            params.push(filters.teacher_id);
        }

        if (filters.student_id) {
            query += ' AND s.student_id = ?';
            params.push(filters.student_id);
        }

        if (filters.status) {
            query += ' AND s.status = ?';
            params.push(filters.status);
        }

        query += ' ORDER BY s.submitted_at DESC';

        const [rows] = await db.promise().query(query, params);
        return rows;
    }

    static async updateGrade(id, marks, feedback) {
        const query = `
            UPDATE submissions 
            SET marks = ?, feedback = ?, status = 'graded', updated_at = NOW()
            WHERE id = ?
        `;
        const [result] = await db.promise().query(query, [marks, feedback, id]);
        return result.affectedRows > 0;
    }

    static async updateStatus(id, status) {
        const query = `
            UPDATE submissions 
            SET status = ?, updated_at = NOW()
            WHERE id = ?
        `;
        const [result] = await db.promise().query(query, [status, id]);
        return result.affectedRows > 0;
    }

    static async getSubmissionStats(assignment_id) {
        const query = `
            SELECT 
                COUNT(*) as total_submissions,
                SUM(CASE WHEN status = 'submitted' THEN 1 ELSE 0 END) as submitted_count,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_count,
                SUM(CASE WHEN status = 'graded' THEN 1 ELSE 0 END) as graded_count,
                SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late_count,
                AVG(marks) as average_marks
            FROM submissions
            WHERE assignment_id = ?
        `;
        const [rows] = await db.promise().query(query, [assignment_id]);
        return rows[0] || null;
    }

    static async delete(id) {
        const query = 'DELETE FROM submissions WHERE id = ?';
        const [result] = await db.promise().query(query, [id]);
        return result.affectedRows > 0;
    }
}

module.exports = Submission;

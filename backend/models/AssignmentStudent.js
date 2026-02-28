const db = require('../config/db');

class AssignmentStudent {
    static async addStudents(assignment_id, student_ids = []) {
        if (!student_ids || student_ids.length === 0) {
            return [];
        }

        const query = `
            INSERT INTO assignment_students (assignment_id, student_id)
            VALUES ${student_ids.map(() => '(?, ?)').join(', ')}
            ON DUPLICATE KEY UPDATE created_at = created_at
        `;

        const params = [];
        student_ids.forEach(student_id => {
            params.push(assignment_id, student_id);
        });

        const [result] = await db.promise().query(query, params);
        return result.affectedRows;
    }

    static async getStudentsForAssignment(assignment_id) {
        const query = `
            SELECT u.* 
            FROM users u
            JOIN assignment_students ass ON u.id = ass.student_id
            WHERE ass.assignment_id = ? AND u.role = 'student'
            ORDER BY u.name ASC
        `;
        const [rows] = await db.promise().query(query, [assignment_id]);
        return rows;
    }

    static async getAssignmentsForStudent(student_id) {
        const query = `
            SELECT a.* 
            FROM assignments a
            JOIN assignment_students ass ON a.id = ass.assignment_id
            WHERE ass.student_id = ?
            ORDER BY a.deadline DESC
        `;
        const [rows] = await db.promise().query(query, [student_id]);
        return rows;
    }

    static async isStudentAssigned(assignment_id, student_id) {
        const query = `
            SELECT id FROM assignment_students
            WHERE assignment_id = ? AND student_id = ?
        `;
        const [rows] = await db.promise().query(query, [assignment_id, student_id]);
        return rows.length > 0;
    }

    static async removeStudent(assignment_id, student_id) {
        const query = `
            DELETE FROM assignment_students
            WHERE assignment_id = ? AND student_id = ?
        `;
        const [result] = await db.promise().query(query, [assignment_id, student_id]);
        return result.affectedRows > 0;
    }

    static async removeAllStudents(assignment_id) {
        const query = `
            DELETE FROM assignment_students
            WHERE assignment_id = ?
        `;
        const [result] = await db.promise().query(query, [assignment_id]);
        return result.affectedRows;
    }

    static async getAssignmentStudentCount(assignment_id) {
        const query = `
            SELECT COUNT(*) as count
            FROM assignment_students
            WHERE assignment_id = ?
        `;
        const [rows] = await db.promise().query(query, [assignment_id]);
        return rows[0].count;
    }
}

module.exports = AssignmentStudent;

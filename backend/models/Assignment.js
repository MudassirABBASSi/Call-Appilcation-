const db = require('../config/db');

class Assignment {
    static async create(data) {
        const { title, description, file_url, total_marks, deadline, class_id, teacher_id } = data;
        const query = `
            INSERT INTO assignments (title, description, file_url, total_marks, deadline, class_id, teacher_id)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const [result] = await db.promise().query(query, [title, description, file_url, total_marks, deadline, class_id, teacher_id]);
        return result.insertId;
    }

    static async findById(id) {
        const query = `
            SELECT a.*, u.name as teacher_name, c.title as class_title
            FROM assignments a
            JOIN users u ON a.teacher_id = u.id
            JOIN classes c ON a.class_id = c.id
            WHERE a.id = ?
        `;
        const [rows] = await db.promise().query(query, [id]);
        return rows[0] || null;
    }

    static async findByTeacher(teacher_id) {
        const query = `
            SELECT a.*, c.title as class_title, COUNT(s.id) as submission_count
            FROM assignments a
            JOIN classes c ON a.class_id = c.id
            LEFT JOIN submissions s ON a.id = s.assignment_id
            WHERE a.teacher_id = ?
            GROUP BY a.id
            ORDER BY a.created_at DESC
        `;
        const [rows] = await db.promise().query(query, [teacher_id]);
        return rows;
    }

    static async findByClass(class_id) {
        const query = `
            SELECT a.*, u.name as teacher_name
            FROM assignments a
            JOIN users u ON a.teacher_id = u.id
            WHERE a.class_id = ?
            ORDER BY a.deadline DESC
        `;
        const [rows] = await db.promise().query(query, [class_id]);
        return rows;
    }

    static async findAll() {
        const query = `
            SELECT a.*, u.name as teacher_name, c.title as class_title, COUNT(s.id) as submission_count
            FROM assignments a
            JOIN users u ON a.teacher_id = u.id
            JOIN classes c ON a.class_id = c.id
            LEFT JOIN submissions s ON a.id = s.assignment_id
            GROUP BY a.id
            ORDER BY a.created_at DESC
        `;
        const [rows] = await db.promise().query(query);
        return rows;
    }

    static async update(id, data) {
        const { title, description, file_url, total_marks, deadline } = data;
        const query = `
            UPDATE assignments 
            SET title = COALESCE(?, title),
                description = COALESCE(?, description),
                file_url = COALESCE(?, file_url),
                total_marks = COALESCE(?, total_marks),
                deadline = COALESCE(?, deadline)
            WHERE id = ?
        `;
        const [result] = await db.promise().query(query, [title, description, file_url, total_marks, deadline, id]);
        return result.affectedRows > 0;
    }

    static async delete(id) {
        const query = 'DELETE FROM assignments WHERE id = ?';
        const [result] = await db.promise().query(query, [id]);
        return result.affectedRows > 0;
    }

    static async isDeadlinePassed(assignment_id) {
        const query = 'SELECT deadline FROM assignments WHERE id = ?';
        const [rows] = await db.promise().query(query, [assignment_id]);
        if (!rows[0]) return null;
        return new Date() > new Date(rows[0].deadline);
    }

    static async getAssignmentStatus(assignment_id) {
        const query = 'SELECT deadline, created_at FROM assignments WHERE id = ?';
        const [rows] = await db.promise().query(query, [assignment_id]);
        return rows[0] || null;
    }
}

module.exports = Assignment;

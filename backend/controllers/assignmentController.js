const Assignment = require('../models/Assignment');
const AssignmentStudent = require('../models/AssignmentStudent');
const Submission = require('../models/Submission');
const User = require('../models/User');
const Class = require('../models/Class');

// TEACHER CONTROLLERS
exports.createAssignment = async (req, res) => {
    try {
        // debug logs
        console.log('Request Body:', req.body);
        console.log('Request File:', req.file);
        console.log('User:', req.user);

        const teacher_id = req.user?.id;
        if (!teacher_id) {
            return res.status(401).json({ message: 'Invalid token: no teacher id' });
        }

        const { title, description, total_marks, deadline: deadlineRaw, class_id } = req.body;

        // Validate presence
        if (!title || !total_marks || !deadlineRaw || !class_id) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // parse deadline
        const deadline = new Date(deadlineRaw);
        if (isNaN(deadline.getTime())) {
            return res.status(400).json({ message: 'Invalid deadline format' });
        }

        // Verify teacher owns this class
        const classRecord = await Class.findById(class_id);
        if (!classRecord || classRecord.teacher_id !== teacher_id) {
            return res.status(403).json({ message: 'Unauthorized: You can only create assignments for your own classes' });
        }

        // Get file path if file was uploaded
        let file_url = null;
        if (req.file) {
            file_url = `/uploads/assignments/${req.file.filename}`;
        }

        // log insert data
        console.log({
            title,
            description,
            file_url,
            total_marks,
            deadline,
            class_id,
            teacher_id
        });

        // Create assignment
        const assignment_id = await Assignment.create({
            title,
            description,
            file_url,
            total_marks: parseInt(total_marks),
            deadline,
            class_id: parseInt(class_id),
            teacher_id
        });

        const assignment = await Assignment.findById(assignment_id);

        res.status(201).json({
            message: 'Assignment created successfully',
            assignment
        });
    } catch (error) {
        console.error('Assignment Error:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.getTeacherAssignments = async (req, res) => {
    try {
        console.log('Query parameters:', req.query);
        const teacher_id = req.user?.id;
        if (!teacher_id) {
            return res.status(401).json({ message: 'Invalid token: no teacher id' });
        }

        const class_id = req.query.class_id;
        if (!class_id) {
            // class_id required per spec
            return res.status(400).json({ message: 'class_id required' });
        }
        // Verify teacher owns this class
        const classRecord = await Class.findById(class_id);
        if (!classRecord || classRecord.teacher_id !== teacher_id) {
            return res.status(403).json({ message: 'Unauthorized: You can only fetch assignments for your own classes' });
        }

        const assignments = await Assignment.findByClass(class_id);
        return res.status(200).json({ assignments });
    } catch (error) {
        console.error('Assignment Error:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.getAssignmentDetail = async (req, res) => {
    try {
        const teacher_id = req.user.id;
        const assignment_id = req.params.id;

        const assignment = await Assignment.findById(assignment_id);

        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        // Verify teacher owns this assignment
        if (assignment.teacher_id !== teacher_id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

            res.status(200).json({ assignment });
    } catch (error) {
        console.error('Error fetching assignment detail:', error);
        res.status(500).json({ message: 'Error fetching assignment detail', error: error.message });
    }
};

exports.updateAssignment = async (req, res) => {
    try {
        const teacher_id = req.user.id;
        const assignment_id = req.params.id;
        const { title, description, total_marks, deadline, student_ids: student_ids_str } = req.body;

        const assignment = await Assignment.findById(assignment_id);

        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        if (assignment.teacher_id !== teacher_id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        // Parse student_ids if it's a JSON string
        let student_ids = [];
        if (student_ids_str) {
            try {
                student_ids = JSON.parse(student_ids_str);
            } catch (e) {
                student_ids = Array.isArray(student_ids_str) ? student_ids_str : [];
            }
        }

        // Get file path if file was uploaded
        let file_url = assignment.file_url;
        if (req.file) {
            file_url = `/uploads/assignments/${req.file.filename}`;
        }

        // Update assignment
        const updateData = { title, description, total_marks, deadline };
        if (req.file) {
            updateData.file_url = file_url;
        }

        await Assignment.update(assignment_id, updateData);

        const updatedAssignment = await Assignment.findById(assignment_id);

        res.status(200).json({
            message: 'Assignment updated successfully',
            assignment: updatedAssignment
        });
    } catch (error) {
        console.error('Error updating assignment:', error);
        res.status(500).json({ message: 'Error updating assignment', error: error.message });
    }
};

exports.deleteAssignment = async (req, res) => {
    try {
        const teacher_id = req.user.id;
        const assignment_id = req.params.id;

        const assignment = await Assignment.findById(assignment_id);

        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        if (assignment.teacher_id !== teacher_id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        await Assignment.delete(assignment_id);

        res.status(200).json({
            message: 'Assignment deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting assignment:', error);
        res.status(500).json({ message: 'Error deleting assignment', error: error.message });
    }
};

exports.getClassStudents = async (req, res) => {
    try {
        const teacher_id = req.user.id;
        const class_id = parseInt(req.params.classId);

        // Verify teacher owns this class
        const classRecord = await Class.findById(class_id);
        if (!classRecord || classRecord.teacher_id !== teacher_id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        // Get students in the class
        const students = await Class.getStudents(class_id);

        res.status(200).json({
            students
        });
    } catch (error) {
        console.error('Error fetching class students:', error);
        res.status(500).json({ message: 'Error fetching class students', error: error.message });
    }
};

// STUDENT CONTROLLERS
const db = require('../config/db');
exports.getStudentAssignments = async (req, res) => {
    try {
        const student_id = req.user.id;

        // Fetch assignments for classes where student is enrolled
        const query = `
            SELECT a.*, c.title as class_title
            FROM assignments a
            JOIN classes c ON a.class_id = c.id
            JOIN class_students cs ON cs.class_id = c.id
            WHERE cs.student_id = ?
            ORDER BY a.created_at DESC
        `;

        const [assignments] = await db.promise().query(query, [student_id]);

        // For each assignment, get submission status and deadline info
        const assignmentsWithStatus = await Promise.all(
            assignments.map(async (assignment) => {
                const submission = await Submission.findByAssignmentAndStudent(assignment.id, student_id);
                const isDeadlinePassed = new Date() > new Date(assignment.deadline);

                return {
                    ...assignment,
                    deadline_passed: isDeadlinePassed,
                    submission_status: submission?.status || 'pending',
                    marks: submission?.marks || null,
                    feedback: submission?.feedback || null
                };
            })
        );

        res.status(200).json({
            assignments: assignmentsWithStatus
        });
    } catch (error) {
        console.error('Error fetching student assignments:', error);
        res.status(500).json({ message: 'Error fetching student assignments', error: error.message });
    }
};

exports.getStudentAssignmentDetail = async (req, res) => {
    try {
        const student_id = req.user.id;
        const assignment_id = req.params.id;

        // Verify student is assigned to this assignment
        const isAssigned = await AssignmentStudent.isStudentAssigned(assignment_id, student_id);
        if (!isAssigned) {
            return res.status(403).json({ message: 'You are not assigned to this assignment' });
        }

        const assignment = await Assignment.findById(assignment_id);
        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        const submission = await Submission.findByAssignmentAndStudent(assignment_id, student_id);
        const isDeadlinePassed = new Date() > new Date(assignment.deadline);

        res.status(200).json({
            assignment,
            submission,
            deadline_passed: isDeadlinePassed
        });
    } catch (error) {
        console.error('Error fetching assignment detail:', error);
        res.status(500).json({ message: 'Error fetching assignment detail', error: error.message });
    }
};

// ADMIN CONTROLLERS
exports.getAllAssignments = async (req, res) => {
    try {
        const assignments = await Assignment.findAll();

        res.status(200).json({
            assignments
        });
    } catch (error) {
        console.error('Error fetching assignments:', error);
        res.status(500).json({ message: 'Error fetching assignments', error: error.message });
    }
};

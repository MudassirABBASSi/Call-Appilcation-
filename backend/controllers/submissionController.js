const Submission = require('../models/Submission');
const Assignment = require('../models/Assignment');
const AssignmentStudent = require('../models/AssignmentStudent');

// STUDENT CONTROLLERS
exports.submitAssignment = async (req, res) => {
    try {
        const student_id = req.user.id;
        const assignment_id = req.params.id;

        // Validation
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Verify student is assigned to this assignment
        const isAssigned = await AssignmentStudent.isStudentAssigned(assignment_id, student_id);
        if (!isAssigned) {
            return res.status(403).json({ message: 'You are not assigned to this assignment' });
        }

        // Get assignment details
        const assignment = await Assignment.findById(assignment_id);
        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        // Check if deadline passed
        const isDeadlinePassed = new Date() > new Date(assignment.deadline);
        const status = isDeadlinePassed ? 'late' : 'submitted';

        // Create or update submission
        const file_url = `/uploads/submissions/${req.file.filename}`;
        
        const result = await Submission.create({
            assignment_id,
            student_id,
            file_url,
            status
        });

        const submission = await Submission.findByAssignmentAndStudent(assignment_id, student_id);

        res.status(201).json({
            message: 'Assignment submitted successfully',
            submission
        });
    } catch (error) {
        console.error('Error submitting assignment:', error);
        res.status(500).json({ message: 'Error submitting assignment', error: error.message });
    }
};

exports.getStudentSubmission = async (req, res) => {
    try {
        const student_id = req.user.id;
        const assignment_id = req.params.id;

        // Verify student is assigned to this assignment
        const isAssigned = await AssignmentStudent.isStudentAssigned(assignment_id, student_id);
        if (!isAssigned) {
            return res.status(403).json({ message: 'You are not assigned to this assignment' });
        }

        const submission = await Submission.findByAssignmentAndStudent(assignment_id, student_id);

        res.status(200).json({
            submission
        });
    } catch (error) {
        console.error('Error fetching submission:', error);
        res.status(500).json({ message: 'Error fetching submission', error: error.message });
    }
};

// TEACHER CONTROLLERS
exports.getAssignmentSubmissions = async (req, res) => {
    try {
        const teacher_id = req.user.id;
        const assignment_id = req.params.id;

        // Verify teacher owns this assignment
        const assignment = await Assignment.findById(assignment_id);
        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        if (assignment.teacher_id !== teacher_id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        // Get submissions for this assignment
        const submissions = await Submission.findByAssignment(assignment_id);

        // Get submission stats
        const stats = await Submission.getSubmissionStats(assignment_id);

        res.status(200).json({
            submissions,
            stats
        });
    } catch (error) {
        console.error('Error fetching submissions:', error);
        res.status(500).json({ message: 'Error fetching submissions', error: error.message });
    }
};

exports.gradeSubmission = async (req, res) => {
    try {
        const teacher_id = req.user.id;
        const submission_id = req.params.id;
        const { marks, feedback } = req.body;

        // Validation
        if (marks === undefined || marks === null) {
            return res.status(400).json({ message: 'Marks are required' });
        }

        // Get submission
        const submission = await Submission.findById(submission_id);
        if (!submission) {
            return res.status(404).json({ message: 'Submission not found' });
        }

        // Get assignment to verify teacher ownership
        const assignment = await Assignment.findById(submission.assignment_id);
        if (assignment.teacher_id !== teacher_id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        // Validate marks not exceeding total marks
        if (marks > assignment.total_marks) {
            return res.status(400).json({ 
                message: `Marks cannot exceed total marks (${assignment.total_marks})` 
            });
        }

        if (marks < 0) {
            return res.status(400).json({ message: 'Marks cannot be negative' });
        }

        // Update submission with grades
        await Submission.updateGrade(submission_id, marks, feedback || null);

        const updatedSubmission = await Submission.findById(submission_id);

        res.status(200).json({
            message: 'Submission graded successfully',
            submission: updatedSubmission
        });
    } catch (error) {
        console.error('Error grading submission:', error);
        res.status(500).json({ message: 'Error grading submission', error: error.message });
    }
};

exports.getSubmissionDetail = async (req, res) => {
    try {
        const teacher_id = req.user.id;
        const submission_id = req.params.id;

        // Get submission
        const submission = await Submission.findById(submission_id);
        if (!submission) {
            return res.status(404).json({ message: 'Submission not found' });
        }

        // Get assignment to verify teacher ownership
        const assignment = await Assignment.findById(submission.assignment_id);
        if (assignment.teacher_id !== teacher_id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        res.status(200).json({
            submission,
            assignment
        });
    } catch (error) {
        console.error('Error fetching submission detail:', error);
        res.status(500).json({ message: 'Error fetching submission detail', error: error.message });
    }
};

// ADMIN CONTROLLERS
exports.getAllSubmissions = async (req, res) => {
    try {
        const { class_id, teacher_id, student_id, status } = req.query;

        const filters = {};
        if (class_id) filters.class_id = class_id;
        if (teacher_id) filters.teacher_id = teacher_id;
        if (student_id) filters.student_id = student_id;
        if (status) filters.status = status;

        const submissions = await Submission.findAll(filters);

        res.status(200).json({
            submissions
        });
    } catch (error) {
        console.error('Error fetching submissions:', error);
        res.status(500).json({ message: 'Error fetching submissions', error: error.message });
    }
};

exports.getSubmissionStats = async (req, res) => {
    try {
        const { assignment_id } = req.query;

        if (!assignment_id) {
            return res.status(400).json({ message: 'assignment_id is required' });
        }

        const stats = await Submission.getSubmissionStats(assignment_id);

        res.status(200).json({
            stats
        });
    } catch (error) {
        console.error('Error fetching submission stats:', error);
        res.status(500).json({ message: 'Error fetching submission stats', error: error.message });
    }
};

-- Assignments Management System Tables

-- 1) Assignments Table
CREATE TABLE IF NOT EXISTS assignments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_url VARCHAR(500),
    total_marks INT NOT NULL,
    deadline DATETIME NOT NULL,
    class_id INT NOT NULL,
    teacher_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_class_id (class_id),
    INDEX idx_teacher_id (teacher_id),
    INDEX idx_deadline (deadline)
);

-- 2) Assignment Students Table (Many-to-Many)
CREATE TABLE IF NOT EXISTS assignment_students (
    id INT PRIMARY KEY AUTO_INCREMENT,
    assignment_id INT NOT NULL,
    student_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_assignment_student (assignment_id, student_id),
    INDEX idx_student_id (student_id)
);

-- 3) Submissions Table
CREATE TABLE IF NOT EXISTS submissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    assignment_id INT NOT NULL,
    student_id INT NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    marks INT,
    feedback TEXT,
    status ENUM('pending', 'submitted', 'graded', 'late') DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_submission (assignment_id, student_id),
    INDEX idx_status (status),
    INDEX idx_student_id (student_id),
    INDEX idx_assignment_id (assignment_id)
);

-- Create uploads directories structure (note: actual directory creation happens on server)
-- Ensure these directories exist in backend folder:
-- /uploads/assignments/
-- /uploads/submissions/

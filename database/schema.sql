-- ==================================================================================
-- UNIVERSITY ERP STUDENT MANAGEMENT SYSTEM DATABASE SCHEMA (MySQL)
-- DESIGN: 3-Tier Enterprise Architecture
-- NORMALIZATION: 3NF Compliant
-- Author: Senior Systems Architect
-- ==================================================================================

CREATE DATABASE IF NOT EXISTS university_erp;
USE university_erp;

-- 1. ROLES TABLE
CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(30) UNIQUE NOT NULL
) ENGINE=InnoDB;

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    photo_url VARCHAR(255),
    role_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 3. DEPARTMENTS TABLE
CREATE TABLE IF NOT EXISTS departments (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL,
    hod_name VARCHAR(100) NOT NULL
) ENGINE=InnoDB;

-- 4. STUDENTS PROFILE TABLE
CREATE TABLE IF NOT EXISTS students (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) UNIQUE NOT NULL,
    roll_no VARCHAR(30) UNIQUE NOT NULL,
    batch VARCHAR(20) NOT NULL,
    current_semester INT NOT NULL CHECK (current_semester BETWEEN 1 AND 8),
    cgpa DECIMAL(3,2) DEFAULT 0.00 CHECK (cgpa BETWEEN 0.00 AND 4.00),
    phone VARCHAR(20) NOT NULL,
    parent_name VARCHAR(100) NOT NULL,
    parent_phone VARCHAR(20) NOT NULL,
    parent_email VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    department_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 5. FACULTY PROFILE TABLE
CREATE TABLE IF NOT EXISTS faculty (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) UNIQUE NOT NULL,
    designation VARCHAR(50) NOT NULL,
    specialization VARCHAR(100) NOT NULL,
    qualification VARCHAR(100) NOT NULL,
    workload_hours INT DEFAULT 0 CHECK (workload_hours >= 0),
    department_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 6. COURSES TABLE
CREATE TABLE IF NOT EXISTS courses (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    credits INT NOT NULL CHECK (credits BETWEEN 1 AND 6),
    department_id VARCHAR(50) NOT NULL,
    semester INT NOT NULL CHECK (semester BETWEEN 1 AND 8),
    faculty_id VARCHAR(50),
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT,
    FOREIGN KEY (faculty_id) REFERENCES faculty(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 7. ATTENDANCE TABLE
CREATE TABLE IF NOT EXISTS attendance (
    id VARCHAR(50) PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,
    course_id VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    status ENUM('Present', 'Absent') NOT NULL,
    marked_by VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE KEY uq_attendance (student_id, course_id, date)
) ENGINE=InnoDB;

-- 8. EXAMINATIONS TABLE
CREATE TABLE IF NOT EXISTS examinations (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    course_id VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    max_marks INT NOT NULL DEFAULT 100,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 9. RESULTS TABLE
CREATE TABLE IF NOT EXISTS results (
    id VARCHAR(50) PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,
    exam_id VARCHAR(50) NOT NULL,
    internal_marks DECIMAL(5,2) DEFAULT 0.00 CHECK (internal_marks <= 50.00),
    semester_marks DECIMAL(5,2) DEFAULT 0.00 CHECK (semester_marks <= 100.00),
    total_marks DECIMAL(5,2) NOT NULL,
    grade VARCHAR(5) NOT NULL,
    gpa DECIMAL(3,2) NOT NULL CHECK (gpa BETWEEN 0.00 AND 4.00),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (exam_id) REFERENCES examinations(id) ON DELETE CASCADE,
    UNIQUE KEY uq_results (student_id, exam_id)
) ENGINE=InnoDB;

-- 10. FEE STRUCTURE TABLE
CREATE TABLE IF NOT EXISTS fee_structures (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0.00),
    description TEXT,
    semester INT NOT NULL
) ENGINE=InnoDB;

-- 11. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS fee_payments (
    id VARCHAR(50) PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,
    fee_structure_id VARCHAR(50) NOT NULL,
    amount_paid DECIMAL(10,2) NOT NULL DEFAULT 0.00 CHECK (amount_paid >= 0.00),
    payment_date DATE,
    payment_method VARCHAR(50),
    status ENUM('Paid', 'Pending', 'Partial') DEFAULT 'Pending',
    receipt_number VARCHAR(100) UNIQUE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (fee_structure_id) REFERENCES fee_structures(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 12. LIBRARY BOOKS TABLE
CREATE TABLE IF NOT EXISTS books (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(150) NOT NULL,
    isbn VARCHAR(30) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL,
    total_copies INT NOT NULL DEFAULT 1 CHECK (total_copies >= 0),
    available_copies INT NOT NULL DEFAULT 1 CHECK (available_copies <= total_copies)
) ENGINE=InnoDB;

-- 13. BOOK ISSUES TABLE
CREATE TABLE IF NOT EXISTS book_issues (
    id VARCHAR(50) PRIMARY KEY,
    book_id VARCHAR(50) NOT NULL,
    student_id VARCHAR(50) NOT NULL,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    return_date DATE,
    fine_amount DECIMAL(6,2) DEFAULT 0.00 CHECK (fine_amount >= 0.00),
    status ENUM('Issued', 'Returned', 'Overdue') DEFAULT 'Issued',
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE RESTRICT,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 14. TIMETABLE TABLE
CREATE TABLE IF NOT EXISTS timetables (
    id VARCHAR(50) PRIMARY KEY,
    course_id VARCHAR(50) NOT NULL,
    day_of_week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday') NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room VARCHAR(50) NOT NULL,
    faculty_id VARCHAR(50) NOT NULL,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (faculty_id) REFERENCES faculty(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 15. ASSIGNMENTS TABLE
CREATE TABLE IF NOT EXISTS assignments (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    course_id VARCHAR(50) NOT NULL,
    due_date DATE NOT NULL,
    faculty_id VARCHAR(50) NOT NULL,
    max_marks INT NOT NULL DEFAULT 50 CHECK (max_marks > 0),
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (faculty_id) REFERENCES faculty(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 16. ASSIGNMENT SUBMISSIONS TABLE
CREATE TABLE IF NOT EXISTS assignment_submissions (
    id VARCHAR(50) PRIMARY KEY,
    assignment_id VARCHAR(50) NOT NULL,
    student_id VARCHAR(50) NOT NULL,
    submission_date DATE NOT NULL,
    status ENUM('Submitted', 'Graded') DEFAULT 'Submitted',
    marks_obtained INT,
    feedback TEXT,
    FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    UNIQUE KEY uq_submission (assignment_id, student_id)
) ENGINE=InnoDB;

-- 17. NOTIFICATIONS & NOTICE BOARD TABLE
CREATE TABLE IF NOT EXISTS notices (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    content TEXT NOT NULL,
    date DATE NOT NULL,
    target_role ENUM('All', 'Faculty', 'Student', 'Parent') DEFAULT 'All',
    author_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;


-- ==================================================================================
-- SEED DATA (INITIAL DATA INSERTS)
-- ==================================================================================

INSERT INTO roles (id, name) VALUES (1, 'Admin'), (2, 'Faculty'), (3, 'Student'), (4, 'Parent'), (5, 'Accountant'), (6, 'Librarian');

-- Users Password Hash represents encrypted value for 'password123'
INSERT INTO users (id, username, email, password_hash, name, phone, role_id) VALUES
('u-1', 'admin', 'admin@university.edu', '$2a$10$coF02L2v6eNsk9R.s10rFeqN20lA4XN27U4U6f.87A77.0a38FfGq', 'Dr. Eleanor Vance', '+1 (555) 019-2834', 1),
('u-2', 'faculty', 'faculty@university.edu', '$2a$10$coF02L2v6eNsk9R.s10rFeqN20lA4XN27U4U6f.87A77.0a38FfGq', 'Prof. Robert Langdon', '+1 (555) 014-9382', 2),
('u-3', 'student', 'student@university.edu', '$2a$10$coF02L2v6eNsk9R.s10rFeqN20lA4XN27U4U6f.87A77.0a38FfGq', 'Jane Doe', '+1 (555) 017-4829', 3),
('u-4', 'parent', 'parent@university.edu', '$2a$10$coF02L2v6eNsk9R.s10rFeqN20lA4XN27U4U6f.87A77.0a38FfGq', 'Richard Doe', '+1 (555) 012-4820', 4);

INSERT INTO departments (id, name, code, hod_name) VALUES
('dept-1', 'Computer Science & Engineering', 'CSE', 'Dr. Eleanor Vance'),
('dept-2', 'Electrical & Electronics Engineering', 'EEE', 'Dr. Jason Fowler');

INSERT INTO students (id, user_id, roll_no, batch, current_semester, cgpa, phone, parent_name, parent_phone, parent_email, address, department_id) VALUES
('s-1', 'u-3', 'CSE-2026-001', '2024-2028', 4, 3.84, '+1 (555) 017-4829', 'Richard Doe', '+1 (555) 012-4820', 'parent@university.edu', '128 Orchard Lane, Boston, MA', 'dept-1');

INSERT INTO faculty (id, user_id, designation, specialization, qualification, workload_hours, department_id) VALUES
('f-1', 'u-2', 'Associate Professor', 'Information Security & Cryptology', 'Ph.D. in Computer Science', 12, 'dept-1');

INSERT INTO courses (id, name, code, credits, department_id, semester, faculty_id) VALUES
('c-1', 'Data Structures & Algorithms', 'CS-201', 4, 'dept-1', 3, 'f-1'),
('c-2', 'Database Management Systems', 'CS-202', 3, 'dept-1', 4, 'f-1');

INSERT INTO attendance (id, student_id, course_id, date, status, marked_by) VALUES
('att-1', 's-1', 'c-2', '2026-07-01', 'Present', 'f-1'),
('att-2', 's-1', 'c-2', '2026-07-02', 'Present', 'f-1');

INSERT INTO examinations (id, name, course_id, date, max_marks) VALUES
('ex-1', 'DBMS Mid-Term Examination', 'c-2', '2026-05-15', 50);

INSERT INTO results (id, student_id, exam_id, internal_marks, semester_marks, total_marks, grade, gpa) VALUES
('res-1', 's-1', 'ex-1', 45.00, 88.00, 133.00, 'A', 4.00);

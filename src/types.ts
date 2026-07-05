/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'Admin' | 'Faculty' | 'Student' | 'Parent' | 'Accountant' | 'Librarian';

export interface User {
  id: string;
  username: string;
  email: string;
  password?: string;
  name: string;
  role: UserRole;
  photo?: string;
  phone?: string;
  departmentId?: string;
}

export interface StudentProfile {
  id: string;
  userId: string;
  rollNo: string;
  batch: string;
  currentSemester: number;
  cgpa: number;
  phone: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  address: string;
  departmentId: string;
}

export interface FacultyProfile {
  id: string;
  userId: string;
  designation: string;
  specialization: string;
  qualification: string;
  workloadHours: number;
  departmentId: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  headOfDepartment: string;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  credits: number;
  departmentId: string;
  semester: number;
  facultyId?: string;
}

export interface Attendance {
  id: string;
  studentId: string;
  courseId: string;
  date: string;
  status: 'Present' | 'Absent';
  markedBy: string;
}

export interface Exam {
  id: string;
  name: string;
  courseId: string;
  date: string;
  maxMarks: number;
}

export interface Result {
  id: string;
  studentId: string;
  examId: string;
  internalMarks: number;
  semesterMarks: number;
  totalMarks: number;
  grade: string;
  gpa: number;
}

export interface FeeStructure {
  id: string;
  name: string;
  amount: number;
  description: string;
  semester: number;
  departmentId?: string;
}

export interface FeePayment {
  id: string;
  studentId: string;
  feeStructureId: string;
  amountPaid: number;
  paymentDate: string;
  paymentMethod: string;
  status: 'Paid' | 'Pending' | 'Partial';
  receiptNumber: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  totalCopies: number;
  availableCopies: number;
}

export interface BookIssue {
  id: string;
  bookId: string;
  studentId: string;
  issueDate: string;
  dueDate: string;
  returnDate?: string;
  fineAmount: number;
  status: 'Issued' | 'Returned' | 'Overdue';
}

export interface TimetableEntry {
  id: string;
  courseId: string;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  startTime: string;
  endTime: string;
  room: string;
  facultyId: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  courseId: string;
  dueDate: string;
  facultyId: string;
  maxMarks: number;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  submissionDate: string;
  status: 'Submitted' | 'Graded';
  marksObtained?: number;
  feedback?: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  date: string;
  targetRole: 'All' | 'Faculty' | 'Student' | 'Parent';
  authorName: string;
}

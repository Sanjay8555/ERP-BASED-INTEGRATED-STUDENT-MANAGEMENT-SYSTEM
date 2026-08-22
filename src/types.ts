/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'Admin' | 'Faculty' | 'Student' | 'Parent' | 'Accountant' | 'Librarian' | 'Placement';

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
  parentPassword?: string;
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
  category?: 'Tuition' | 'Hostel' | 'Transport' | 'Examination' | 'Laboratory' | 'Library' | 'Sports' | 'Miscellaneous' | string;
  academicYear?: string;
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
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  submissionText?: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  date: string;
  targetRole: 'All' | 'Faculty' | 'Student' | 'Parent';
  authorName: string;
}

export interface CodingTestCase {
  id: string;
  input: string;
  expectedOutput: string;
  hidden?: boolean;
  explanation?: string;
}

export interface CodingQuestion {
  id: string;
  title: string;
  category: 'Arrays & Strings' | 'Dynamic Programming' | 'Trees & Graphs' | 'Linked Lists & Stacks' | 'Searching & Sorting' | 'SQL & Databases' | 'Algorithms' | 'Core CS & Logic' | 'System Design' | string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  constraints: string[];
  sampleInput: string;
  sampleOutput: string;
  testCases: CodingTestCase[];
  starterCode: {
    javascript: string;
    python: string;
    java: string;
    cpp: string;
    sql?: string;
    [lang: string]: string | undefined;
  };
  hints?: string[];
  points: number;
  tags?: string[];
}

export interface CodingTest {
  id: string;
  title: string;
  description: string;
  category: string;
  durationMinutes: number;
  totalQuestionPoolCount: number;
  questionPoolIds: string[]; // pool of question IDs (can be up to 300+)
  questionLimitPerStudent: number; // e.g. 5, 10, 15 questions uniquely picked per student
  shuffleQuestions: boolean;
  status: 'Active' | 'Draft' | 'Completed' | 'Upcoming';
  targetDepartmentId?: string; // 'all' or departmentId
  targetSemester?: number; // 0 for all
  passingPercentage: number;
  totalMarks: number;
  createdBy: string;
  createdAt: string;
  startDate: string;
  endDate: string;
}

export interface StudentCodingAnswer {
  questionId: string;
  questionTitle: string;
  language: string;
  code: string;
  testCasesPassed: number;
  totalTestCases: number;
  score: number;
  maxScore: number;
  status: 'Passed' | 'Partial' | 'Failed' | 'Unattempted';
  executionOutput?: string;
  executionTimeMs?: number;
  lastExecutedAt?: string;
}

export interface CodingTestSubmission {
  id: string;
  testId: string;
  testTitle: string;
  studentId: string; // student profile ID
  studentUserId: string;
  studentName: string;
  studentRollNo: string;
  departmentId: string;
  assignedQuestionIds: string[]; // The unique randomized subset assigned to this student
  answers: Record<string, StudentCodingAnswer>;
  totalScore: number;
  maxScore: number;
  percentage: number;
  status: 'In-Progress' | 'Submitted' | 'Evaluated';
  startedAt: string;
  submittedAt?: string;
  timeSpentSeconds: number;
  tabSwitchCount?: number;
}

export interface PlacementDrive {
  id: string;
  companyName: string;
  companyLogo?: string;
  role: string;
  packageLPA: number;
  eligibleMinCgpa: number;
  eligibleDepartments: string[];
  minCodingScorePercent: number;
  jobLocation: string;
  driveDate: string;
  deadline: string;
  description: string;
  status: 'Upcoming' | 'Ongoing' | 'Completed';
  registeredStudentIds: string[];
}


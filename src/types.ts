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
  parentPassword?: string;
  address: string;
  departmentId: string;
  leetcodeUrl?: string;
  leetcodeUsername?: string;
  githubUrl?: string;
  githubUsername?: string;
}

export interface GitHubRepo {
  id: string | number;
  name: string;
  fullName: string;
  description?: string;
  htmlUrl: string;
  stars: number;
  forks: number;
  language: string;
  updatedAt: string;
  isFork?: boolean;
}

export interface GitHubActivityDay {
  date: string;
  day: string;
  count: number;
  active: boolean;
}

export interface GitHubLanguageShare {
  language: string;
  count: number;
  percentage: number;
  color: string;
}

export interface GitHubStats {
  username: string;
  name?: string;
  avatar?: string;
  bio?: string;
  publicRepos: number;
  publicGists?: number;
  followers: number;
  following: number;
  totalStars: number;
  totalForks: number;
  totalContributions: number;
  currentStreak: number;
  topLanguages: GitHubLanguageShare[];
  topRepos: GitHubRepo[];
  weeklyActivity?: GitHubActivityDay[];
  htmlUrl: string;
  found: boolean;
  lastFetched?: string;
  error?: string;
}

export interface LeetCodeRecentSubmission {
  id: string;
  title: string;
  titleSlug: string;
  timestamp: string;
}

export interface LeetCodeDailyChallenge {
  date: string;
  userStatus: string;
  link: string;
  questionFrontendId: string;
  title: string;
  titleSlug: string;
  difficulty: string;
}

export interface LeetCodeDailyProgress {
  todaySolved: number;
  currentStreak: number;
  maxStreak: number;
  activeDaysCount: number;
  calendar: Record<string, number>;
  dailyChallenge?: LeetCodeDailyChallenge;
  recentSubmissions?: LeetCodeRecentSubmission[];
}

export interface LeetCodeStats {
  username: string;
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  totalQuestions?: number;
  totalEasy?: number;
  totalMedium?: number;
  totalHard?: number;
  ranking?: number;
  acceptanceRate?: number;
  avatar?: string;
  realName?: string;
  reputation?: number;
  found: boolean;
  lastFetched?: string;
  error?: string;
  dailyProgress?: LeetCodeDailyProgress;
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

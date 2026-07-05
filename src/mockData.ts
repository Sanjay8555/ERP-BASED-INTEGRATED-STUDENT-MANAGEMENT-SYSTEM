/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  User,
  StudentProfile,
  FacultyProfile,
  Department,
  Course,
  Attendance,
  Exam,
  Result,
  FeeStructure,
  FeePayment,
  Book,
  BookIssue,
  TimetableEntry,
  Assignment,
  AssignmentSubmission,
  Notice
} from './types';

export const initialUsers: User[] = [
  {
    id: 'u-1',
    username: 'admin',
    email: 'admin@university.edu',
    password: 'adminPass2026!',
    name: 'RAJESH',
    role: 'Admin',
    phone: '+1 (555) 019-2834',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120'
  },
  {
    id: 'u-2',
    username: 'faculty',
    email: 'faculty@university.edu',
    password: 'facultyPass2026!',
    name: 'Prof. Murugesan',
    role: 'Faculty',
    phone: '+91 94432 10841',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=120',
    departmentId: 'dept-5'
  },
  {
    id: 'u-3',
    username: 'student',
    email: 'student@university.edu',
    password: 'studentPass2026!',
    name: 'Sanjay K',
    role: 'Student',
    phone: '+91 98765 43210',
    photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=120',
    departmentId: 'dept-5'
  },
  {
    id: 'u-4',
    username: 'parent',
    email: 'parent@university.edu',
    password: 'parentPass2026!',
    name: 'Richard Doe',
    role: 'Parent',
    phone: '+1 (555) 012-4820',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120'
  },
  {
    id: 'u-5',
    username: 'accountant',
    email: 'accountant@university.edu',
    password: 'financePass2026!',
    name: 'James',
    role: 'Accountant',
    phone: '+1 (555) 013-3928',
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=120'
  },
  {
    id: 'u-7',
    username: 'saravanan_f',
    email: 'saravanan@university.edu',
    password: 'facultyPass2026!',
    name: 'Dr. Saravanan',
    role: 'Faculty',
    phone: '+91 94440 12345',
    photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=120',
    departmentId: 'dept-5'
  },
  {
    id: 'u-8',
    username: 'sanjay_s',
    email: 'sanjays@university.edu',
    password: 'studentPass2026!',
    name: 'Sanjay S',
    role: 'Student',
    phone: '+91 98765 43211',
    photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=120',
    departmentId: 'dept-5'
  },
  {
    id: 'u-9',
    username: 'kathirvel_f',
    email: 'kathirvel@university.edu',
    password: 'facultyPass2026!',
    name: 'Prof. Kathirvel',
    role: 'Faculty',
    phone: '+91 94450 67890',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120',
    departmentId: 'dept-5'
  },
  {
    id: 'u-10',
    username: 'murugavel_f',
    email: 'murugavel@university.edu',
    password: 'facultyPass2026!',
    name: 'Dr. Murugavel',
    role: 'Faculty',
    phone: '+91 94460 54321',
    photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=120',
    departmentId: 'dept-5'
  },
  {
    id: 'u-11',
    username: 'raja_varman',
    email: 'raja@university.edu',
    password: 'studentPass2026!',
    name: 'Raja Varman R A',
    role: 'Student',
    phone: '+91 98765 43212',
    photo: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&q=80&w=120',
    departmentId: 'dept-5'
  },
  {
    id: 'u-12',
    username: 'ram_kishore',
    email: 'ramkishore@university.edu',
    password: 'studentPass2026!',
    name: 'RamKishore SM',
    role: 'Student',
    phone: '+91 98765 43213',
    photo: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=120',
    departmentId: 'dept-5'
  },
  {
    id: 'u-13',
    username: 'tharun_k',
    email: 'tharunk@university.edu',
    password: 'studentPass2026!',
    name: 'Tharun Kumar K',
    role: 'Student',
    phone: '+91 98765 43214',
    photo: 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?auto=format&fit=crop&q=80&w=120',
    departmentId: 'dept-5'
  },
  {
    id: 'u-14',
    username: 'santhosh_k',
    email: 'santhoshk@university.edu',
    password: 'studentPass2026!',
    name: 'Santhosh Kumar S',
    role: 'Student',
    phone: '+91 98765 43215',
    photo: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&q=80&w=120',
    departmentId: 'dept-5'
  },
  {
    id: 'u-15',
    username: 'tharun_karthik',
    email: 'tharunkarthikg@university.edu',
    password: 'studentPass2026!',
    name: 'TharunKarthik G',
    role: 'Student',
    phone: '+91 98765 43216',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120',
    departmentId: 'dept-5'
  },
  {
    id: 'u-16',
    username: 'thiruvasagam',
    email: 'thiru@university.edu',
    password: 'studentPass2026!',
    name: 'Thiruvasagam V',
    role: 'Student',
    phone: '+91 98765 43217',
    photo: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=120',
    departmentId: 'dept-5'
  },
  // EEE Department Faculty
  {
    id: 'u-17',
    username: 'priya_nair',
    email: 'priyanair@university.edu',
    password: 'facultyPass2026!',
    name: 'Dr. Priya Nair',
    role: 'Faculty',
    phone: '+91 94470 11223',
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=120',
    departmentId: 'dept-6'
  },
  {
    id: 'u-18',
    username: 'anbarasan_f',
    email: 'anbarasan@university.edu',
    password: 'facultyPass2026!',
    name: 'Prof. Anbarasan',
    role: 'Faculty',
    phone: '+91 94471 22334',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=120',
    departmentId: 'dept-6'
  },
  // AIDS Department Faculty
  {
    id: 'u-19',
    username: 'ramesh_babu',
    email: 'rameshbabu@university.edu',
    password: 'facultyPass2026!',
    name: 'Prof. Ramesh Babu',
    role: 'Faculty',
    phone: '+91 94472 33445',
    photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=120',
    departmentId: 'dept-7'
  },
  {
    id: 'u-20',
    username: 'deepa_aids',
    email: 'deepa@university.edu',
    password: 'facultyPass2026!',
    name: 'Dr. Deepa S',
    role: 'Faculty',
    phone: '+91 94473 44556',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120',
    departmentId: 'dept-7'
  },
  // Chemical Engineering Department Faculty
  {
    id: 'u-21',
    username: 'lakshmi_suresh',
    email: 'lakshmis@university.edu',
    password: 'facultyPass2026!',
    name: 'Dr. Lakshmi Suresh',
    role: 'Faculty',
    phone: '+91 94474 55667',
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=120',
    departmentId: 'dept-8'
  },
  // Biomedical Engineering Department Faculty
  {
    id: 'u-22',
    username: 'vijay_anand',
    email: 'vijayanand@university.edu',
    password: 'facultyPass2026!',
    name: 'Dr. Vijay Anand',
    role: 'Faculty',
    phone: '+91 94475 66778',
    photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=120',
    departmentId: 'dept-9'
  },
  // MBA Department Faculty
  {
    id: 'u-23',
    username: 'meena_krishnan',
    email: 'meenakrishnan@university.edu',
    password: 'facultyPass2026!',
    name: 'Prof. Meena Krishnan',
    role: 'Faculty',
    phone: '+91 94476 77889',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120',
    departmentId: 'dept-10'
  },
  // AIML Department Faculty
  {
    id: 'u-24',
    username: 'karthikeyan_r',
    email: 'karthikeyan@university.edu',
    password: 'facultyPass2026!',
    name: 'Dr. Karthikeyan R',
    role: 'Faculty',
    phone: '+91 94477 88990',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120',
    departmentId: 'dept-11'
  },
  {
    id: 'u-25',
    username: 'suganya_f',
    email: 'suganya@university.edu',
    password: 'facultyPass2026!',
    name: 'Dr. Suganya M',
    role: 'Faculty',
    phone: '+91 94478 99001',
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=120',
    departmentId: 'dept-11'
  },
  // IT Department Faculty
  {
    id: 'u-26',
    username: 'senthilkumar_it',
    email: 'senthil@university.edu',
    password: 'facultyPass2026!',
    name: 'Dr. Senthil Kumar P',
    role: 'Faculty',
    phone: '+91 94479 10203',
    photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=120',
    departmentId: 'dept-1'
  },
  // ECE Department Faculty
  {
    id: 'u-27',
    username: 'anandece_f',
    email: 'anandece@university.edu',
    password: 'facultyPass2026!',
    name: 'Prof. Anand V',
    role: 'Faculty',
    phone: '+91 94480 30405',
    photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=120',
    departmentId: 'dept-2'
  },
  // MECH Department Faculty
  {
    id: 'u-28',
    username: 'arthur_mech',
    email: 'arthur@university.edu',
    password: 'facultyPass2026!',
    name: 'Prof. Arthur Pendragon',
    role: 'Faculty',
    phone: '+91 94481 50607',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=120',
    departmentId: 'dept-3'
  },
  // CIVIL Department Faculty
  {
    id: 'u-29',
    username: 'james_civil',
    email: 'james.civil@university.edu',
    password: 'facultyPass2026!',
    name: 'Dr. Kumar James',
    role: 'Faculty',
    phone: '+91 94482 70809',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120',
    departmentId: 'dept-4'
  },
  // New Departments Faculty Users
  {
    id: 'u-30',
    username: 'vikram_aero',
    email: 'vikram@university.edu',
    password: 'facultyPass2026!',
    name: 'Dr. Vikram Sarabhai',
    role: 'Faculty',
    phone: '+91 94483 11223',
    photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=120',
    departmentId: 'dept-12'
  },
  {
    id: 'u-31',
    username: 'swami_bio',
    email: 'swami@university.edu',
    password: 'facultyPass2026!',
    name: 'Dr. Swaminathan',
    role: 'Faculty',
    phone: '+91 94484 22334',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=120',
    departmentId: 'dept-13'
  },
  {
    id: 'u-32',
    username: 'turing_cys',
    email: 'turing@university.edu',
    password: 'facultyPass2026!',
    name: 'Prof. Alan Turing',
    role: 'Faculty',
    phone: '+91 94485 33445',
    photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=120',
    departmentId: 'dept-14'
  },
  {
    id: 'u-33',
    username: 'norman_agri',
    email: 'norman@university.edu',
    password: 'facultyPass2026!',
    name: 'Dr. Norman Borlaug',
    role: 'Faculty',
    phone: '+91 94486 44556',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120',
    departmentId: 'dept-15'
  },
  {
    id: 'u-34',
    username: 'kurien_food',
    email: 'kurien@university.edu',
    password: 'facultyPass2026!',
    name: 'Dr. Vergese Kurien',
    role: 'Faculty',
    phone: '+91 94487 55667',
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=120',
    departmentId: 'dept-16'
  },
  {
    id: 'u-35',
    username: 'asimov_rob',
    email: 'asimov@university.edu',
    password: 'facultyPass2026!',
    name: 'Dr. Isaac Asimov',
    role: 'Faculty',
    phone: '+91 94488 66778',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120',
    departmentId: 'dept-17'
  },
  {
    id: 'u-40',
    username: 'suresh_marine',
    email: 'suresh.marine@university.edu',
    password: 'facultyPass2026!',
    name: 'Capt. Suresh Pillai',
    role: 'Faculty',
    phone: '+91 94490 11221',
    photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=120',
    departmentId: 'dept-18'
  },
  {
    id: 'u-41',
    username: 'kavitha_text',
    email: 'kavitha@university.edu',
    password: 'facultyPass2026!',
    name: 'Dr. Kavitha Raj',
    role: 'Faculty',
    phone: '+91 94491 22332',
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=120',
    departmentId: 'dept-19'
  },
  {
    id: 'u-42',
    username: 'raghu_mine',
    email: 'raghu@university.edu',
    password: 'facultyPass2026!',
    name: 'Dr. Raghunathan V',
    role: 'Faculty',
    phone: '+91 94492 33443',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120',
    departmentId: 'dept-20'
  },
  {
    id: 'u-43',
    username: 'zaha_arch',
    email: 'zaha@university.edu',
    password: 'facultyPass2026!',
    name: 'Prof. Zaha Ibrahim',
    role: 'Faculty',
    phone: '+91 94493 44554',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120',
    departmentId: 'dept-21'
  },
  {
    id: 'u-44',
    username: 'chandra_phy',
    email: 'chandra@university.edu',
    password: 'facultyPass2026!',
    name: 'Dr. Chandrasekhar N',
    role: 'Faculty',
    phone: '+91 94494 55665',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=120',
    departmentId: 'dept-22'
  },
  {
    id: 'u-45',
    username: 'ramanujan_math',
    email: 'ramanujan@university.edu',
    password: 'facultyPass2026!',
    name: 'Dr. Ramanujan A',
    role: 'Faculty',
    phone: '+91 94495 66776',
    photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=120',
    departmentId: 'dept-23'
  },
  {
    id: 'u-46',
    username: 'sundar_mca',
    email: 'sundar@university.edu',
    password: 'facultyPass2026!',
    name: 'Prof. Sundar Rajan',
    role: 'Faculty',
    phone: '+91 94496 77887',
    photo: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&q=80&w=120',
    departmentId: 'dept-24'
  },
  {
    id: 'u-47',
    username: 'anitha_csbs',
    email: 'anitha@university.edu',
    password: 'facultyPass2026!',
    name: 'Dr. Anitha Kumari',
    role: 'Faculty',
    phone: '+91 94497 88998',
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=120',
    departmentId: 'dept-25'
  }
];

export const initialDepartments: Department[] = [
  { id: 'dept-1', name: 'Information Technology', code: 'IT', headOfDepartment: 'Prof. Murugesan' },
  { id: 'dept-2', name: 'Electronics & Communication Engineering', code: 'ECE', headOfDepartment: 'Dr. Saravanan' },
  { id: 'dept-3', name: 'Mechanical Engineering', code: 'MECH', headOfDepartment: 'Prof. Arthur Pendragon' },
  { id: 'dept-4', name: 'Civil Engineering', code: 'CIVIL', headOfDepartment: 'Dr. James' },
  { id: 'dept-5', name: 'Computer Science & Engineering', code: 'CSE', headOfDepartment: 'Dr. Eleanor Vance' },
  { id: 'dept-6', name: 'Electrical & Electronics Engineering', code: 'EEE', headOfDepartment: 'Dr. Priya Nair' },
  { id: 'dept-7', name: 'Artificial Intelligence & Data Science', code: 'AIDS', headOfDepartment: 'Prof. Ramesh Babu' },
  { id: 'dept-8', name: 'Chemical Engineering', code: 'CHEM', headOfDepartment: 'Dr. Lakshmi Suresh' },
  { id: 'dept-9', name: 'Biomedical Engineering', code: 'BME', headOfDepartment: 'Dr. Vijay Anand' },
  { id: 'dept-10', name: 'Master of Business Administration', code: 'MBA', headOfDepartment: 'Prof. Meena Krishnan' },
  { id: 'dept-11', name: 'Artificial Intelligence & Machine Learning', code: 'AIML', headOfDepartment: 'Dr. Karthikeyan R' },
  { id: 'dept-12', name: 'Aerospace Engineering', code: 'AERO', headOfDepartment: 'Dr. Vikram Sarabhai' },
  { id: 'dept-13', name: 'Biotechnology', code: 'BIO', headOfDepartment: 'Dr. Swaminathan' },
  { id: 'dept-14', name: 'Cyber Security', code: 'CYS', headOfDepartment: 'Prof. Alan Turing' },
  { id: 'dept-15', name: 'Agriculture Engineering', code: 'AGR', headOfDepartment: 'Dr. Norman Borlaug' },
  { id: 'dept-16', name: 'Food Technology', code: 'FOOD', headOfDepartment: 'Dr. Vergese Kurien' },
  { id: 'dept-17', name: 'Robotics & Automation', code: 'ROB', headOfDepartment: 'Dr. Isaac Asimov' },
  { id: 'dept-18', name: 'Marine Engineering', code: 'MARINE', headOfDepartment: 'Capt. Suresh Pillai' },
  { id: 'dept-19', name: 'Textile Technology', code: 'TEXT', headOfDepartment: 'Dr. Kavitha Raj' },
  { id: 'dept-20', name: 'Mining Engineering', code: 'MINE', headOfDepartment: 'Dr. Raghunathan V' },
  { id: 'dept-21', name: 'Architecture', code: 'ARCH', headOfDepartment: 'Prof. Zaha Ibrahim' },
  { id: 'dept-22', name: 'Physics', code: 'PHY', headOfDepartment: 'Dr. Chandrasekhar N' },
  { id: 'dept-23', name: 'Mathematics', code: 'MATH', headOfDepartment: 'Dr. Ramanujan A' },
  { id: 'dept-24', name: 'Master of Computer Applications', code: 'MCA', headOfDepartment: 'Prof. Sundar Rajan' },
  { id: 'dept-25', name: 'Computer Science & Business Systems', code: 'CSBS', headOfDepartment: 'Dr. Anitha Kumari' }
];

export const initialStudentProfiles: StudentProfile[] = [
  {
    id: 's-1',
    userId: 'u-3',
    rollNo: 'CSE-2026-001',
    batch: '2024-2028',
    currentSemester: 4,
    cgpa: 9.60,
    phone: '+91 98765 43210',
    parentName: 'Richard Doe',
    parentPhone: '+1 (555) 012-4820',
    parentEmail: 'parent@university.edu',
    address: 'Sathy Road, Coimbatore, Tamil Nadu',
    departmentId: 'dept-5'
  },
  {
    id: 's-2',
    userId: 'u-8',
    rollNo: 'CSE-2026-002',
    batch: '2024-2028',
    currentSemester: 4,
    cgpa: 9.05,
    phone: '+91 98765 43211',
    parentName: 'Monica Rivera',
    parentPhone: '+1 (555) 018-7711',
    parentEmail: 'monica@rivera.com',
    address: 'Avinashi Road, Coimbatore, Tamil Nadu',
    departmentId: 'dept-5'
  },
  {
    id: 's-3',
    userId: 'u-11',
    rollNo: 'CSE-2026-003',
    batch: '2024-2028',
    currentSemester: 4,
    cgpa: 9.38,
    phone: '+91 98765 43212',
    parentName: 'Rajasekar R',
    parentPhone: '+91 94441 55667',
    parentEmail: 'rajasekar@gmail.com',
    address: 'Gandhipuram, Coimbatore, Tamil Nadu',
    departmentId: 'dept-5'
  },
  {
    id: 's-4',
    userId: 'u-12',
    rollNo: 'CSE-2026-004',
    batch: '2024-2028',
    currentSemester: 4,
    cgpa: 9.53,
    phone: '+91 98765 43213',
    parentName: 'Sundara Moorthy',
    parentPhone: '+91 94442 88990',
    parentEmail: 'sundar@gmail.com',
    address: 'Peelamedu, Coimbatore, Tamil Nadu',
    departmentId: 'dept-5'
  },
  {
    id: 's-5',
    userId: 'u-13',
    rollNo: 'CSE-2026-005',
    batch: '2024-2028',
    currentSemester: 4,
    cgpa: 8.75,
    phone: '+91 98765 43214',
    parentName: 'Krishnan K',
    parentPhone: '+91 94443 11223',
    parentEmail: 'krishnan@gmail.com',
    address: 'Saravanampatti, Coimbatore, Tamil Nadu',
    departmentId: 'dept-5'
  },
  {
    id: 's-6',
    userId: 'u-14',
    rollNo: 'CSE-2026-006',
    batch: '2024-2028',
    currentSemester: 4,
    cgpa: 9.75,
    phone: '+91 98765 43215',
    parentName: 'Selvakumar S',
    parentPhone: '+91 94444 33445',
    parentEmail: 'selvakumar@gmail.com',
    address: 'Singanallur, Coimbatore, Tamil Nadu',
    departmentId: 'dept-5'
  },
  {
    id: 's-7',
    userId: 'u-15',
    rollNo: 'CSE-2026-007',
    batch: '2024-2028',
    currentSemester: 4,
    cgpa: 9.20,
    phone: '+91 98765 43216',
    parentName: 'Ganesan G',
    parentPhone: '+91 94445 55667',
    parentEmail: 'ganesan@gmail.com',
    address: 'Pollachi, Tamil Nadu',
    departmentId: 'dept-5'
  },
  {
    id: 's-8',
    userId: 'u-16',
    rollNo: 'CSE-2026-008',
    batch: '2024-2028',
    currentSemester: 4,
    cgpa: 9.30,
    phone: '+91 98765 43217',
    parentName: 'Velusamy V',
    parentPhone: '+91 94446 77889',
    parentEmail: 'velusamy@gmail.com',
    address: 'Tiruppur, Tamil Nadu',
    departmentId: 'dept-5'
  }
];

export const initialFacultyProfiles: FacultyProfile[] = [
  {
    id: 'f-1',
    userId: 'u-2',
    designation: 'Associate Professor',
    specialization: 'Theory of Computation & Compiler Design',
    qualification: 'Ph.D. in Computer Science',
    workloadHours: 12,
    departmentId: 'dept-5'
  },
  {
    id: 'f-2',
    userId: 'u-7',
    designation: 'Professor & HOD',
    specialization: 'Database Systems & Data Mining',
    qualification: 'Ph.D. in CSE',
    workloadHours: 15,
    departmentId: 'dept-5'
  },
  {
    id: 'f-3',
    userId: 'u-9',
    designation: 'Assistant Professor',
    specialization: 'Mobile Application Development & iOS',
    qualification: 'M.E. in CSE',
    workloadHours: 14,
    departmentId: 'dept-5'
  },
  {
    id: 'f-4',
    userId: 'u-10',
    designation: 'Professor',
    specialization: 'Artificial Intelligence & Machine Learning',
    qualification: 'Ph.D. in CSE',
    workloadHours: 16,
    departmentId: 'dept-5'
  },
  // EEE Department
  {
    id: 'f-5',
    userId: 'u-17',
    designation: 'Professor & HOD',
    specialization: 'Power Systems & Smart Grids',
    qualification: 'Ph.D. in Electrical Engineering',
    workloadHours: 15,
    departmentId: 'dept-6'
  },
  {
    id: 'f-6',
    userId: 'u-18',
    designation: 'Associate Professor',
    specialization: 'Control Systems & Robotics',
    qualification: 'M.E. in EEE',
    workloadHours: 14,
    departmentId: 'dept-6'
  },
  // AIDS Department
  {
    id: 'f-7',
    userId: 'u-19',
    designation: 'Professor & HOD',
    specialization: 'Deep Learning & Neural Networks',
    qualification: 'Ph.D. in Computer Science',
    workloadHours: 16,
    departmentId: 'dept-7'
  },
  {
    id: 'f-8',
    userId: 'u-20',
    designation: 'Assistant Professor',
    specialization: 'Big Data Analytics & Cloud Computing',
    qualification: 'M.E. in CSE',
    workloadHours: 13,
    departmentId: 'dept-7'
  },
  // Chemical Engineering Department
  {
    id: 'f-9',
    userId: 'u-21',
    designation: 'Professor & HOD',
    specialization: 'Process Engineering & Thermodynamics',
    qualification: 'Ph.D. in Chemical Engineering',
    workloadHours: 15,
    departmentId: 'dept-8'
  },
  // Biomedical Engineering Department
  {
    id: 'f-10',
    userId: 'u-22',
    designation: 'Professor & HOD',
    specialization: 'Medical Imaging & Biosignal Processing',
    qualification: 'Ph.D. in Biomedical Engineering',
    workloadHours: 14,
    departmentId: 'dept-9'
  },
  // MBA Department
  {
    id: 'f-11',
    userId: 'u-23',
    designation: 'Professor & HOD',
    specialization: 'Strategic Management & Entrepreneurship',
    qualification: 'Ph.D. in Management Studies',
    workloadHours: 12,
    departmentId: 'dept-10'
  },
  // AIML Department
  {
    id: 'f-12',
    userId: 'u-24',
    designation: 'Professor & HOD',
    specialization: 'Machine Learning & Intelligent Systems',
    qualification: 'Ph.D. in Artificial Intelligence',
    workloadHours: 16,
    departmentId: 'dept-11'
  },
  {
    id: 'f-13',
    userId: 'u-25',
    designation: 'Associate Professor',
    specialization: 'Computer Vision & Robotics',
    qualification: 'Ph.D. in CSE',
    workloadHours: 14,
    departmentId: 'dept-11'
  },
  // IT Department
  {
    id: 'f-14',
    userId: 'u-26',
    designation: 'Professor & HOD',
    specialization: 'Network Security & Cloud Infrastructure',
    qualification: 'Ph.D. in Information Technology',
    workloadHours: 15,
    departmentId: 'dept-1'
  },
  // ECE Department
  {
    id: 'f-15',
    userId: 'u-27',
    designation: 'Professor & HOD',
    specialization: 'VLSI Design & Embedded Systems',
    qualification: 'Ph.D. in Electronics Engineering',
    workloadHours: 15,
    departmentId: 'dept-2'
  },
  // MECH Department
  {
    id: 'f-16',
    userId: 'u-28',
    designation: 'Professor & HOD',
    specialization: 'Manufacturing Systems & Robotics',
    qualification: 'Ph.D. in Mechanical Engineering',
    workloadHours: 15,
    departmentId: 'dept-3'
  },
  // CIVIL Department
  {
    id: 'f-17',
    userId: 'u-29',
    designation: 'Professor & HOD',
    specialization: 'Structural Engineering & Construction Management',
    qualification: 'Ph.D. in Civil Engineering',
    workloadHours: 15,
    departmentId: 'dept-4'
  },
  // New Faculty Profiles
  {
    id: 'f-18',
    userId: 'u-30',
    designation: 'Professor & HOD',
    specialization: 'Propulsion Systems & Aerodynamics',
    qualification: 'Ph.D. in Aerospace',
    workloadHours: 14,
    departmentId: 'dept-12'
  },
  {
    id: 'f-19',
    userId: 'u-31',
    designation: 'Professor & HOD',
    specialization: 'Molecular Biology & Genetics',
    qualification: 'Ph.D. in Biotech',
    workloadHours: 15,
    departmentId: 'dept-13'
  },
  {
    id: 'f-20',
    userId: 'u-32',
    designation: 'Professor & HOD',
    specialization: 'Cryptography & Network Security',
    qualification: 'Ph.D. in Computer Science',
    workloadHours: 12,
    departmentId: 'dept-14'
  },
  {
    id: 'f-21',
    userId: 'u-33',
    designation: 'Professor & HOD',
    specialization: 'Soil Science & Irrigation',
    qualification: 'Ph.D. in Agriculture',
    workloadHours: 14,
    departmentId: 'dept-15'
  },
  {
    id: 'f-22',
    userId: 'u-34',
    designation: 'Professor & HOD',
    specialization: 'Dairy Technology & Food Processing',
    qualification: 'Ph.D. in Food Tech',
    workloadHours: 15,
    departmentId: 'dept-16'
  },
  {
    id: 'f-23',
    userId: 'u-35',
    designation: 'Professor & HOD',
    specialization: 'Robotics & Artificial Intelligence',
    qualification: 'Ph.D. in Robotics',
    workloadHours: 16,
    departmentId: 'dept-17'
  },
  {
    id: 'f-24',
    userId: 'u-40',
    designation: 'Captain & HOD',
    specialization: 'Marine Propulsion & Naval Architecture',
    qualification: 'Ph.D. in Marine Engineering',
    workloadHours: 14,
    departmentId: 'dept-18'
  },
  {
    id: 'f-25',
    userId: 'u-41',
    designation: 'Professor & HOD',
    specialization: 'Textile Processing & Yarn Technology',
    qualification: 'Ph.D. in Textile Technology',
    workloadHours: 14,
    departmentId: 'dept-19'
  },
  {
    id: 'f-26',
    userId: 'u-42',
    designation: 'Professor & HOD',
    specialization: 'Rock Mechanics & Mine Safety',
    qualification: 'Ph.D. in Mining Engineering',
    workloadHours: 14,
    departmentId: 'dept-20'
  },
  {
    id: 'f-27',
    userId: 'u-43',
    designation: 'Professor & HOD',
    specialization: 'Urban Design & Structural Architecture',
    qualification: 'M.Arch, Ph.D. in Architecture',
    workloadHours: 14,
    departmentId: 'dept-21'
  },
  {
    id: 'f-28',
    userId: 'u-44',
    designation: 'Professor & HOD',
    specialization: 'Quantum Mechanics & Astrophysics',
    qualification: 'Ph.D. in Physics',
    workloadHours: 14,
    departmentId: 'dept-22'
  },
  {
    id: 'f-29',
    userId: 'u-45',
    designation: 'Professor & HOD',
    specialization: 'Number Theory & Applied Mathematics',
    qualification: 'Ph.D. in Mathematics',
    workloadHours: 14,
    departmentId: 'dept-23'
  },
  {
    id: 'f-30',
    userId: 'u-46',
    designation: 'Professor & HOD',
    specialization: 'Software Engineering & Cloud Computing',
    qualification: 'Ph.D. in Computer Applications',
    workloadHours: 15,
    departmentId: 'dept-24'
  },
  {
    id: 'f-31',
    userId: 'u-47',
    designation: 'Professor & HOD',
    specialization: 'Business Intelligence & Data Analytics',
    qualification: 'Ph.D. in Computer Science',
    workloadHours: 15,
    departmentId: 'dept-25'
  }
];

export const initialCourses: Course[] = [
  { id: 'c-1', name: 'TOC', code: 'CS-301', credits: 4, departmentId: 'dept-5', semester: 4, facultyId: 'f-1' },
  { id: 'c-2', name: 'DBMS', code: 'CS-302', credits: 4, departmentId: 'dept-5', semester: 4, facultyId: 'f-2' },
  { id: 'c-3', name: 'EVS', code: 'CS-303', credits: 2, departmentId: 'dept-5', semester: 4, facultyId: 'f-3' },
  { id: 'c-4', name: 'IOS', code: 'CS-304', credits: 3, departmentId: 'dept-5', semester: 4, facultyId: 'f-3' },
  { id: 'c-5', name: 'WE', code: 'CS-305', credits: 3, departmentId: 'dept-5', semester: 4, facultyId: 'f-1' },
  { id: 'c-6', name: 'AIML', code: 'CS-306', credits: 4, departmentId: 'dept-5', semester: 4, facultyId: 'f-4' },
  // EEE Courses
  { id: 'c-7', name: 'Power Systems Analysis', code: 'EE-301', credits: 4, departmentId: 'dept-6', semester: 5, facultyId: 'f-5' },
  { id: 'c-8', name: 'Control Systems', code: 'EE-302', credits: 4, departmentId: 'dept-6', semester: 5, facultyId: 'f-6' },
  { id: 'c-9', name: 'Electrical Machines', code: 'EE-303', credits: 3, departmentId: 'dept-6', semester: 5, facultyId: 'f-5' },
  { id: 'c-10', name: 'Power Electronics', code: 'EE-304', credits: 4, departmentId: 'dept-6', semester: 5, facultyId: 'f-6' },
  // AIDS Courses
  { id: 'c-11', name: 'Deep Learning', code: 'AI-301', credits: 4, departmentId: 'dept-7', semester: 5, facultyId: 'f-7' },
  { id: 'c-12', name: 'Big Data Analytics', code: 'AI-302', credits: 4, departmentId: 'dept-7', semester: 5, facultyId: 'f-8' },
  { id: 'c-13', name: 'Natural Language Processing', code: 'AI-303', credits: 3, departmentId: 'dept-7', semester: 5, facultyId: 'f-7' },
  // Chemical Engineering Courses
  { id: 'c-14', name: 'Chemical Process Calculations', code: 'CH-301', credits: 4, departmentId: 'dept-8', semester: 3, facultyId: 'f-9' },
  { id: 'c-15', name: 'Thermodynamics', code: 'CH-302', credits: 4, departmentId: 'dept-8', semester: 3, facultyId: 'f-9' },
  { id: 'c-16', name: 'Mass Transfer Operations', code: 'CH-303', credits: 3, departmentId: 'dept-8', semester: 3, facultyId: 'f-9' },
  // Biomedical Engineering Courses
  { id: 'c-17', name: 'Medical Imaging Systems', code: 'BM-301', credits: 4, departmentId: 'dept-9', semester: 5, facultyId: 'f-10' },
  { id: 'c-18', name: 'Biosignal Processing', code: 'BM-302', credits: 4, departmentId: 'dept-9', semester: 5, facultyId: 'f-10' },
  // MBA Courses
  { id: 'c-19', name: 'Strategic Management', code: 'MB-301', credits: 4, departmentId: 'dept-10', semester: 3, facultyId: 'f-11' },
  { id: 'c-20', name: 'Financial Management', code: 'MB-302', credits: 4, departmentId: 'dept-10', semester: 3, facultyId: 'f-11' },
  { id: 'c-21', name: 'Marketing Management', code: 'MB-303', credits: 3, departmentId: 'dept-10', semester: 3, facultyId: 'f-11' },
  // AIML Courses
  { id: 'c-22', name: 'Machine Learning', code: 'AM-301', credits: 4, departmentId: 'dept-11', semester: 5, facultyId: 'f-12' },
  { id: 'c-23', name: 'Deep Learning & Neural Networks', code: 'AM-302', credits: 4, departmentId: 'dept-11', semester: 5, facultyId: 'f-12' },
  { id: 'c-24', name: 'Computer Vision', code: 'AM-303', credits: 3, departmentId: 'dept-11', semester: 5, facultyId: 'f-13' },
  { id: 'c-25', name: 'Reinforcement Learning', code: 'AM-304', credits: 3, departmentId: 'dept-11', semester: 5, facultyId: 'f-12' },

  // Aerospace (AERO)
  { id: 'c-118', name: 'Intro to Aerodynamics', code: 'AE-101', credits: 4, departmentId: 'dept-12', semester: 1, facultyId: 'f-18' },
  { id: 'c-119', name: 'Aerospace Structures', code: 'AE-102', credits: 4, departmentId: 'dept-12', semester: 1, facultyId: 'f-18' },

  // Biotech (BIO)
  { id: 'c-120', name: 'Cell Biology', code: 'BT-101', credits: 4, departmentId: 'dept-13', semester: 1, facultyId: 'f-19' },
  { id: 'c-121', name: 'Biochemisty', code: 'BT-102', credits: 4, departmentId: 'dept-13', semester: 1, facultyId: 'f-19' },

  // Cyber Security (CYS)
  { id: 'c-122', name: 'Intro to Cryptography', code: 'CY-101', credits: 4, departmentId: 'dept-14', semester: 1, facultyId: 'f-20' },
  { id: 'c-123', name: 'Ethical Hacking', code: 'CY-102', credits: 4, departmentId: 'dept-14', semester: 1, facultyId: 'f-20' },

  // Year 1 – Semester 1 (Common)
  { id: 'c-26', name: 'Matrices and Calculus', code: 'MA3151', credits: 4, departmentId: 'dept-5', semester: 1, facultyId: 'f-3' },
  { id: 'c-27', name: 'Professional English I', code: 'HS3151', credits: 3, departmentId: 'dept-5', semester: 1, facultyId: 'f-3' },
  { id: 'c-28', name: 'Engineering Physics', code: 'PH3151', credits: 3, departmentId: 'dept-5', semester: 1, facultyId: 'f-3' },
  { id: 'c-29', name: 'Engineering Chemistry', code: 'CY3151', credits: 3, departmentId: 'dept-5', semester: 1, facultyId: 'f-3' },
  { id: 'c-30', name: 'Problem Solving and Python Programming', code: 'GE3151', credits: 3, departmentId: 'dept-5', semester: 1, facultyId: 'f-1' },

  // Year 1 – Semester 2
  { id: 'c-31', name: 'Statistics and Numerical Methods', code: 'MA3251', credits: 4, departmentId: 'dept-5', semester: 2, facultyId: 'f-3' },
  { id: 'c-32', name: 'Physics for Information Science', code: 'PH3256', credits: 3, departmentId: 'dept-5', semester: 2, facultyId: 'f-3' },
  { id: 'c-33', name: 'Engineering Graphics', code: 'GE3251', credits: 4, departmentId: 'dept-5', semester: 2, facultyId: 'f-16' },
  { id: 'c-34', name: 'Programming in C', code: 'CS3251', credits: 3, departmentId: 'dept-5', semester: 2, facultyId: 'f-2' },
  { id: 'c-35', name: 'Basic Electrical and Electronics Engineering', code: 'BE3251', credits: 3, departmentId: 'dept-5', semester: 2, facultyId: 'f-5' },

  // Year 2 – Semester 3
  { id: 'c-36', name: 'Discrete Mathematics', code: 'MA3354', credits: 4, departmentId: 'dept-5', semester: 3, facultyId: 'f-3' },
  { id: 'c-37', name: 'Digital Principles and Computer Organization', code: 'CS3351', credits: 4, departmentId: 'dept-5', semester: 3, facultyId: 'f-2' },
  { id: 'c-38', name: 'Data Structures', code: 'CS3301', credits: 3, departmentId: 'dept-5', semester: 3, facultyId: 'f-1' },
  { id: 'c-39', name: 'Object Oriented Programming', code: 'CS3391', credits: 3, departmentId: 'dept-5', semester: 3, facultyId: 'f-1' },

  // Year 2 – Semester 4
  { id: 'c-40', name: 'Theory of Computation', code: 'CS3452', credits: 3, departmentId: 'dept-5', semester: 4, facultyId: 'f-1' },
  { id: 'c-41', name: 'Artificial Intelligence and Machine Learning', code: 'CS3491', credits: 4, departmentId: 'dept-5', semester: 4, facultyId: 'f-4' },
  { id: 'c-42', name: 'Database Management Systems', code: 'CS3492', credits: 3, departmentId: 'dept-5', semester: 4, facultyId: 'f-2' },
  { id: 'c-43', name: 'Algorithms', code: 'CS3401', credits: 4, departmentId: 'dept-5', semester: 4, facultyId: 'f-1' },
  { id: 'c-44', name: 'Introduction to Operating Systems', code: 'CS3451', credits: 3, departmentId: 'dept-5', semester: 4, facultyId: 'f-2' },

  // Year 3 – Semester 5
  { id: 'c-45', name: 'Computer Networks', code: 'CS3591', credits: 4, departmentId: 'dept-5', semester: 5, facultyId: 'f-2' },
  { id: 'c-46', name: 'Compiler Design', code: 'CS3501', credits: 4, departmentId: 'dept-5', semester: 5, facultyId: 'f-1' },
  { id: 'c-47', name: 'Cryptography and Information Security', code: 'CS3551', credits: 3, departmentId: 'dept-5', semester: 5, facultyId: 'f-4' },

  // Year 3 – Semester 6
  { id: 'c-48', name: 'Mobile Computing', code: 'CS3691', credits: 3, departmentId: 'dept-5', semester: 6, facultyId: 'f-4' },
  { id: 'c-49', name: 'Distributed Systems', code: 'CS3652', credits: 3, departmentId: 'dept-5', semester: 6, facultyId: 'f-1' },
  { id: 'c-50', name: 'Cloud Computing', code: 'CS3601', credits: 3, departmentId: 'dept-5', semester: 6, facultyId: 'f-3' },

  // Year 4 – Semester 7
  { id: 'c-51', name: 'Project Management and Finance', code: 'MG3791', credits: 3, departmentId: 'dept-5', semester: 7, facultyId: 'f-3' },
  { id: 'c-52', name: 'Big Data Analytics', code: 'CCS334', credits: 3, departmentId: 'dept-5', semester: 7, facultyId: 'f-2' },

  // Year 4 – Semester 8
  { id: 'c-53', name: 'Project Work II', code: 'CS3811', credits: 10, departmentId: 'dept-5', semester: 8, facultyId: 'f-1' },

  // ─── IT (dept-1) – All 8 Semesters ──────────────────────────────────────────
  // Year 1 (Similar to CSE)
  { id: 'c-60', name: 'Matrices and Calculus', code: 'MA3151', credits: 4, departmentId: 'dept-1', semester: 1, facultyId: 'f-14' },
  { id: 'c-61', name: 'Engineering Physics', code: 'PH3151', credits: 3, departmentId: 'dept-1', semester: 1, facultyId: 'f-14' },
  { id: 'c-62', name: 'Programming in C', code: 'CS3251', credits: 3, departmentId: 'dept-1', semester: 2, facultyId: 'f-14' },

  // Year 2 – Semester 3
  { id: 'c-63', name: 'Discrete Mathematics', code: 'MA3354', credits: 4, departmentId: 'dept-1', semester: 3, facultyId: 'f-14' },
  { id: 'c-64', name: 'Object Oriented Programming', code: 'CS3391', credits: 3, departmentId: 'dept-1', semester: 3, facultyId: 'f-14' },
  { id: 'c-65', name: 'Digital Principles and Computer Organization', code: 'CS3351', credits: 4, departmentId: 'dept-1', semester: 3, facultyId: 'f-14' },

  // Year 2 – Semester 4
  { id: 'c-66', name: 'Database Management Systems', code: 'CS3492', credits: 3, departmentId: 'dept-1', semester: 4, facultyId: 'f-14' },
  { id: 'c-67', name: 'Algorithms', code: 'CS3401', credits: 4, departmentId: 'dept-1', semester: 4, facultyId: 'f-14' },
  { id: 'c-68', name: 'Operating Systems', code: 'CS3451', credits: 3, departmentId: 'dept-1', semester: 4, facultyId: 'f-14' },

  // Year 3 – Semester 5
  { id: 'c-69', name: 'Computer Networks', code: 'CS3591', credits: 4, departmentId: 'dept-1', semester: 5, facultyId: 'f-14' },
  { id: 'c-70', name: 'Full Stack Development', code: 'IT3501', credits: 4, departmentId: 'dept-1', semester: 5, facultyId: 'f-14' },

  // Year 3 – Semester 6
  { id: 'c-71', name: 'Mobile Computing', code: 'CS3691', credits: 3, departmentId: 'dept-1', semester: 6, facultyId: 'f-14' },
  { id: 'c-72', name: 'Cryptography and Cyber Security', code: 'IT3601', credits: 3, departmentId: 'dept-1', semester: 6, facultyId: 'f-14' },

  // Year 4 – Semester 7
  { id: 'c-73', name: 'Information Management', code: 'IT3701', credits: 3, departmentId: 'dept-1', semester: 7, facultyId: 'f-14' },
  { id: 'c-74', name: 'Internet of Things', code: 'IT3702', credits: 3, departmentId: 'dept-1', semester: 7, facultyId: 'f-14' },

  // Year 4 – Semester 8
  { id: 'c-75', name: 'Project Work II', code: 'IT3811', credits: 10, departmentId: 'dept-1', semester: 8, facultyId: 'f-14' },


  // ─── ECE (dept-2) – All 8 Semesters ─────────────────────────────────────────
  // Year 1
  { id: 'c-80', name: 'Circuit Analysis', code: 'EC3301', credits: 4, departmentId: 'dept-2', semester: 1, facultyId: 'f-15' },
  { id: 'c-81', name: 'Engineering Mathematics I', code: 'MA3151', credits: 4, departmentId: 'dept-2', semester: 1, facultyId: 'f-15' },

  // Year 2 – Semester 3
  { id: 'c-82', name: 'Signals and Systems', code: 'EC3354', credits: 4, departmentId: 'dept-2', semester: 3, facultyId: 'f-15' },
  { id: 'c-83', name: 'Electronic Devices and Circuits', code: 'EC3353', credits: 3, departmentId: 'dept-2', semester: 3, facultyId: 'f-15' },
  { id: 'c-84', name: 'Digital System Design', code: 'EC3352', credits: 4, departmentId: 'dept-2', semester: 3, facultyId: 'f-15' },

  // Year 2 – Semester 4
  { id: 'c-85', name: 'Electromagnetic Fields', code: 'EC3451', credits: 3, departmentId: 'dept-2', semester: 4, facultyId: 'f-15' },
  { id: 'c-86', name: 'Network and Transmission Lines', code: 'EC3452', credits: 3, departmentId: 'dept-2', semester: 4, facultyId: 'f-15' },
  { id: 'c-87', name: 'Linear Integrated Circuits', code: 'EC3492', credits: 3, departmentId: 'dept-2', semester: 4, facultyId: 'f-15' },

  // Year 3 – Semester 5
  { id: 'c-88', name: 'Digital Signal Processing', code: 'EC3551', credits: 4, departmentId: 'dept-2', semester: 5, facultyId: 'f-15' },
  { id: 'c-89', name: 'Microprocessors and Microcontrollers', code: 'EC3501', credits: 4, departmentId: 'dept-2', semester: 5, facultyId: 'f-15' },

  // Year 3 – Semester 6
  { id: 'c-90', name: 'VLSI Design', code: 'EC3651', credits: 3, departmentId: 'dept-2', semester: 6, facultyId: 'f-15' },
  { id: 'c-91', name: 'Wireless Communication', code: 'EC3652', credits: 3, departmentId: 'dept-2', semester: 6, facultyId: 'f-15' },

  // Year 4 – Semester 7
  { id: 'c-92', name: 'Antennas and Microwave Engineering', code: 'EC3701', credits: 3, departmentId: 'dept-2', semester: 7, facultyId: 'f-15' },
  { id: 'c-93', name: 'Optical Communication', code: 'EC3702', credits: 3, departmentId: 'dept-2', semester: 7, facultyId: 'f-15' },

  // Year 4 – Semester 8
  { id: 'c-94', name: 'Project Work II', code: 'EC3811', credits: 10, departmentId: 'dept-2', semester: 8, facultyId: 'f-15' },
  { id: 'c-300', name: 'Technical Seminar', code: 'EC3812', credits: 2, departmentId: 'dept-2', semester: 8, facultyId: 'f-15' },
  { id: 'c-301', name: 'Professional Ethics', code: 'GE3791', credits: 2, departmentId: 'dept-2', semester: 8, facultyId: 'f-15' },

  // ─── MECH (dept-3) – All 8 Semesters ────────────────────────────────────────
  // Year 1
  { id: 'c-95', name: 'Engineering Graphics', code: 'GE3251', credits: 4, departmentId: 'dept-3', semester: 1, facultyId: 'f-16' },
  { id: 'c-96', name: 'Basic Civil and Mechanical Engineering', code: 'BE3252', credits: 4, departmentId: 'dept-3', semester: 2, facultyId: 'f-16' },

  // Year 2 – Semester 3
  { id: 'c-97', name: 'Engineering Thermodynamics', code: 'ME3391', credits: 3, departmentId: 'dept-3', semester: 3, facultyId: 'f-16' },
  { id: 'c-98', name: 'Fluid Mechanics and Machinery', code: 'CE3391', credits: 4, departmentId: 'dept-3', semester: 3, facultyId: 'f-16' },
  { id: 'c-99', name: 'Manufacturing Technology', code: 'ME3351', credits: 3, departmentId: 'dept-3', semester: 3, facultyId: 'f-16' },

  // Year 2 – Semester 4
  { id: 'c-100', name: 'Applied Thermodynamics', code: 'ME3491', credits: 3, departmentId: 'dept-3', semester: 4, facultyId: 'f-16' },
  { id: 'c-101', name: 'Strength of Materials', code: 'CE3491', credits: 3, departmentId: 'dept-3', semester: 4, facultyId: 'f-16' },
  { id: 'c-102', name: 'Thermal Engineering', code: 'ME3451', credits: 3, departmentId: 'dept-3', semester: 4, facultyId: 'f-16' },

  // Year 3 – Semester 5
  { id: 'c-103', name: 'Design of Machine Elements', code: 'ME3591', credits: 4, departmentId: 'dept-3', semester: 5, facultyId: 'f-16' },
  { id: 'c-104', name: 'Metrology and Measurements', code: 'ME3592', credits: 3, departmentId: 'dept-3', semester: 5, facultyId: 'f-16' },

  // Year 3 – Semester 6
  { id: 'c-105', name: 'Heat and Mass Transfer', code: 'ME3691', credits: 3, departmentId: 'dept-3', semester: 6, facultyId: 'f-16' },
  { id: 'c-106', name: 'CAD/CAM', code: 'ME3692', credits: 3, departmentId: 'dept-3', semester: 6, facultyId: 'f-16' },

  // Year 4 – Semester 7
  { id: 'c-107', name: 'Mechatronics and IoT', code: 'ME3791', credits: 3, departmentId: 'dept-3', semester: 7, facultyId: 'f-16' },
  { id: 'c-108', name: 'Computer Integrated Manufacturing', code: 'ME3792', credits: 3, departmentId: 'dept-3', semester: 7, facultyId: 'f-16' },

  // Year 4 – Semester 8
  { id: 'c-109', name: 'Project Work II', code: 'ME3811', credits: 10, departmentId: 'dept-3', semester: 8, facultyId: 'f-16' },


  // ─── CIVIL (dept-4) – All 8 Semesters ───────────────────────────────────────
  // Year 1
  { id: 'c-110', name: 'Engineering Mechanics', code: 'GE3151', credits: 4, departmentId: 'dept-4', semester: 1, facultyId: 'f-17' },
  { id: 'c-111', name: 'Engineering Geology', code: 'CE3351', credits: 3, departmentId: 'dept-4', semester: 1, facultyId: 'f-17' },

  // Year 2 – Semester 3
  { id: 'c-112', name: 'Fluid Mechanics', code: 'CE3391', credits: 4, departmentId: 'dept-4', semester: 3, facultyId: 'f-17' },
  { id: 'c-113', name: 'Surveying and Levelling', code: 'CE3301', credits: 3, departmentId: 'dept-4', semester: 3, facultyId: 'f-17' },

  // Year 2 – Semester 4
  { id: 'c-114', name: 'Strength of Materials', code: 'CE3491', credits: 3, departmentId: 'dept-4', semester: 4, facultyId: 'f-17' },
  { id: 'c-115', name: 'Concrete Technology', code: 'CE3401', credits: 3, departmentId: 'dept-4', semester: 4, facultyId: 'f-17' },

  // Year 3 – Semester 5
  { id: 'c-116', name: 'Design of Reinfoced Concrete Elements', code: 'CE3501', credits: 4, departmentId: 'dept-4', semester: 5, facultyId: 'f-17' },
  { id: 'c-117', name: 'Structural Analysis I', code: 'CE3502', credits: 3, departmentId: 'dept-4', semester: 5, facultyId: 'f-17' },

  // Year 3 – Semester 6
  { id: 'c-118', name: 'Foundation Engineering', code: 'CE3601', credits: 3, departmentId: 'dept-4', semester: 6, facultyId: 'f-17' },
  { id: 'c-119', name: 'Highway and Railway Engineering', code: 'CE3602', credits: 3, departmentId: 'dept-4', semester: 6, facultyId: 'f-17' },

  // Year 4 – Semester 7
  { id: 'c-120', name: 'Estimation, Costing and Valuation', code: 'CE3701', credits: 3, departmentId: 'dept-4', semester: 7, facultyId: 'f-17' },
  { id: 'c-121', name: 'Enviromental Engineering', code: 'CE3702', credits: 3, departmentId: 'dept-4', semester: 7, facultyId: 'f-17' },

  // Year 4 – Semester 8
  { id: 'c-122', name: 'Project Work II', code: 'CE3811', credits: 10, departmentId: 'dept-4', semester: 8, facultyId: 'f-17' },


  // ─── EEE (dept-6) – All 8 Semesters ─────────────────────────────────────────
  // Year 1
  { id: 'c-123', name: 'Circuit Theory', code: 'EE3301', credits: 4, departmentId: 'dept-6', semester: 1, facultyId: 'f-5' },
  { id: 'c-124', name: 'Basic Civil and Mechanical Engineering', code: 'BE3252', credits: 4, departmentId: 'dept-6', semester: 2, facultyId: 'f-6' },

  // Year 2 – Semester 3
  { id: 'c-125', name: 'Electrical Machines I', code: 'EE3303', credits: 3, departmentId: 'dept-6', semester: 3, facultyId: 'f-5' },
  { id: 'c-126', name: 'Electron Devices and Circuits', code: 'EC3353', credits: 3, departmentId: 'dept-6', semester: 3, facultyId: 'f-6' },

  // Year 2 – Semester 4
  { id: 'c-127', name: 'Electrical Machines II', code: 'EE3402', credits: 4, departmentId: 'dept-6', semester: 4, facultyId: 'f-5' },
  { id: 'c-128', name: 'Transmission and Distribution', code: 'EE3401', credits: 3, departmentId: 'dept-6', semester: 4, facultyId: 'f-6' },

  // Year 3 – Semester 5
  { id: 'c-129', name: 'Power System Analysis', code: 'EE3501', credits: 3, departmentId: 'dept-6', semester: 5, facultyId: 'f-5' },
  { id: 'c-130', name: 'Control Systems', code: 'IC3451', credits: 3, departmentId: 'dept-6', semester: 5, facultyId: 'f-6' },

  // Year 3 – Semester 6
  { id: 'c-131', name: 'Power Electronics', code: 'EE3601', credits: 3, departmentId: 'dept-6', semester: 6, facultyId: 'f-5' },
  { id: 'c-132', name: 'Protection and Switchgear', code: 'EE3602', credits: 3, departmentId: 'dept-6', semester: 6, facultyId: 'f-6' },

  // Year 4 – Semester 7
  { id: 'c-133', name: 'Renewable Energy Systems', code: 'EE3701', credits: 3, departmentId: 'dept-6', semester: 7, facultyId: 'f-5' },
  { id: 'c-134', name: 'Industrial Automation', code: 'EE3702', credits: 3, departmentId: 'dept-6', semester: 7, facultyId: 'f-6' },

  // Year 4 – Semester 8
  { id: 'c-135', name: 'Project Work II', code: 'EE3811', credits: 10, departmentId: 'dept-6', semester: 8, facultyId: 'f-5' },

  // ─── AIDS (dept-7) – Semesters 1-4, 6-8 ─────────────────────────────────────
  // Year 1 – Semester 1
  { id: 'c-164', name: 'Python for Data Science', code: 'AD-101', credits: 4, departmentId: 'dept-7', semester: 1, facultyId: 'f-7' },
  { id: 'c-165', name: 'Statistics & Probability', code: 'AD-102', credits: 4, departmentId: 'dept-7', semester: 1, facultyId: 'f-8' },

  // ─── AIML (dept-11) ─────────────────────────────────────────────────────────
  { id: 'c-150', name: 'Intelligence Systems', code: 'AL3391', credits: 4, departmentId: 'dept-11', semester: 3, facultyId: 'f-12' },
  { id: 'c-151', name: 'Robotics and Control', code: 'AL3491', credits: 3, departmentId: 'dept-11', semester: 4, facultyId: 'f-13' },
  { id: 'c-152', name: 'Deep Learning', code: 'AL3501', credits: 4, departmentId: 'dept-11', semester: 5, facultyId: 'f-12' },
  { id: 'c-153', name: 'Natural Language Processing', code: 'AL3601', credits: 4, departmentId: 'dept-11', semester: 6, facultyId: 'f-13' },
  { id: 'c-166', name: 'Data Visualisation', code: 'AD-103', credits: 3, departmentId: 'dept-7', semester: 1, facultyId: 'f-7' },
  // Year 1 – Semester 2
  { id: 'c-167', name: 'Linear Algebra for AI', code: 'AD-201', credits: 4, departmentId: 'dept-7', semester: 2, facultyId: 'f-7' },
  { id: 'c-168', name: 'Database Systems for AI', code: 'AD-202', credits: 4, departmentId: 'dept-7', semester: 2, facultyId: 'f-8' },
  { id: 'c-169', name: 'Web Scraping & APIs', code: 'AD-203', credits: 3, departmentId: 'dept-7', semester: 2, facultyId: 'f-7' },
  // Year 2 – Semester 3
  { id: 'c-170', name: 'Machine Learning Basics', code: 'AD-311', credits: 4, departmentId: 'dept-7', semester: 3, facultyId: 'f-7' },
  { id: 'c-171', name: 'Data Mining Techniques', code: 'AD-312', credits: 4, departmentId: 'dept-7', semester: 3, facultyId: 'f-8' },
  { id: 'c-172', name: 'Feature Engineering & Selection', code: 'AD-313', credits: 3, departmentId: 'dept-7', semester: 3, facultyId: 'f-7' },
  // Year 2 – Semester 4
  { id: 'c-173', name: 'Neural Networks', code: 'AD-411', credits: 4, departmentId: 'dept-7', semester: 4, facultyId: 'f-7' },
  { id: 'c-174', name: 'Time Series Analysis', code: 'AD-412', credits: 4, departmentId: 'dept-7', semester: 4, facultyId: 'f-8' },
  { id: 'c-175', name: 'Generative AI', code: 'AD-413', credits: 3, departmentId: 'dept-7', semester: 4, facultyId: 'f-7' },
  // Year 3 – Semester 6
  { id: 'c-176', name: 'AI Ethics & Governance', code: 'AD-601', credits: 3, departmentId: 'dept-7', semester: 6, facultyId: 'f-8' },
  { id: 'c-177', name: 'Explainable AI (XAI)', code: 'AD-602', credits: 4, departmentId: 'dept-7', semester: 6, facultyId: 'f-7' },
  { id: 'c-178', name: 'Federated Learning', code: 'AD-603', credits: 3, departmentId: 'dept-7', semester: 6, facultyId: 'f-8' },
  // Year 4 – Semester 7
  { id: 'c-179', name: 'AI in Healthcare', code: 'AD-701', credits: 4, departmentId: 'dept-7', semester: 7, facultyId: 'f-7' },
  { id: 'c-180', name: 'AI in Finance', code: 'AD-702', credits: 4, departmentId: 'dept-7', semester: 7, facultyId: 'f-8' },
  { id: 'c-181', name: 'Research Methods in AI', code: 'AD-703', credits: 3, departmentId: 'dept-7', semester: 7, facultyId: 'f-7' },
  // Year 4 – Semester 8
  { id: 'c-182', name: 'Capstone AI Project', code: 'AD-801', credits: 6, departmentId: 'dept-7', semester: 8, facultyId: 'f-7' },
  { id: 'c-183', name: 'Technical Paper Writing', code: 'AD-802', credits: 2, departmentId: 'dept-7', semester: 8, facultyId: 'f-8' },
  { id: 'c-184', name: 'Professional Ethics', code: 'AD-803', credits: 2, departmentId: 'dept-7', semester: 8, facultyId: 'f-7' },

  // ─── CHEM (dept-8) – Semesters 1-2, 4-8 ─────────────────────────────────────
  // Year 1 – Semester 1
  { id: 'c-185', name: 'Chemistry I', code: 'CH-101', credits: 4, departmentId: 'dept-8', semester: 1, facultyId: 'f-9' },
  { id: 'c-186', name: 'Engineering Mathematics I', code: 'CH-102', credits: 4, departmentId: 'dept-8', semester: 1, facultyId: 'f-9' },
  { id: 'c-187', name: 'Engineering Physics', code: 'CH-103', credits: 4, departmentId: 'dept-8', semester: 1, facultyId: 'f-9' },
  // Year 1 – Semester 2
  { id: 'c-188', name: 'Chemistry II', code: 'CH-201', credits: 4, departmentId: 'dept-8', semester: 2, facultyId: 'f-9' },
  { id: 'c-189', name: 'Engineering Mathematics II', code: 'CH-202', credits: 4, departmentId: 'dept-8', semester: 2, facultyId: 'f-9' },
  { id: 'c-190', name: 'Engineering Drawing', code: 'CH-203', credits: 3, departmentId: 'dept-8', semester: 2, facultyId: 'f-9' },
  // Year 2 – Semester 4
  { id: 'c-191', name: 'Heat & Mass Transfer', code: 'CH-401', credits: 4, departmentId: 'dept-8', semester: 4, facultyId: 'f-9' },
  { id: 'c-192', name: 'Chemical Reaction Engineering', code: 'CH-402', credits: 4, departmentId: 'dept-8', semester: 4, facultyId: 'f-9' },
  { id: 'c-193', name: 'Fluid Mechanics for Chemists', code: 'CH-403', credits: 4, departmentId: 'dept-8', semester: 4, facultyId: 'f-9' },
  // Year 3 – Semester 5
  { id: 'c-194', name: 'Process Control & Dynamics', code: 'CH-501', credits: 4, departmentId: 'dept-8', semester: 5, facultyId: 'f-9' },
  { id: 'c-195', name: 'Separation Processes', code: 'CH-502', credits: 4, departmentId: 'dept-8', semester: 5, facultyId: 'f-9' },
  { id: 'c-196', name: 'Chemical Plant Instrumentation', code: 'CH-503', credits: 3, departmentId: 'dept-8', semester: 5, facultyId: 'f-9' },
  // Year 3 – Semester 6
  { id: 'c-197', name: 'Process Plant Design', code: 'CH-601', credits: 4, departmentId: 'dept-8', semester: 6, facultyId: 'f-9' },
  { id: 'c-198', name: 'Petroleum Refining', code: 'CH-602', credits: 4, departmentId: 'dept-8', semester: 6, facultyId: 'f-9' },
  { id: 'c-199', name: 'Environmental Chem Engineering', code: 'CH-603', credits: 3, departmentId: 'dept-8', semester: 6, facultyId: 'f-9' },
  // Year 4 – Semester 7
  { id: 'c-200', name: 'Plant Layout & Design', code: 'CH-701', credits: 4, departmentId: 'dept-8', semester: 7, facultyId: 'f-9' },
  { id: 'c-201', name: 'Biochemical Engineering', code: 'CH-702', credits: 4, departmentId: 'dept-8', semester: 7, facultyId: 'f-9' },
  { id: 'c-202', name: 'Industrial Safety Engineering', code: 'CH-703', credits: 3, departmentId: 'dept-8', semester: 7, facultyId: 'f-9' },
  // Year 4 – Semester 8
  { id: 'c-203', name: 'Final Year Project', code: 'CH-801', credits: 6, departmentId: 'dept-8', semester: 8, facultyId: 'f-9' },
  { id: 'c-204', name: 'Technical Seminar', code: 'CH-802', credits: 2, departmentId: 'dept-8', semester: 8, facultyId: 'f-9' },
  { id: 'c-205', name: 'Professional Ethics', code: 'CH-803', credits: 2, departmentId: 'dept-8', semester: 8, facultyId: 'f-9' },

  // ─── BME (dept-9) – Semesters 1-4, 6-8 ──────────────────────────────────────
  // Year 1 – Semester 1
  { id: 'c-206', name: 'Human Anatomy', code: 'BM-101', credits: 4, departmentId: 'dept-9', semester: 1, facultyId: 'f-10' },
  { id: 'c-207', name: 'Engineering Mathematics I', code: 'BM-102', credits: 4, departmentId: 'dept-9', semester: 1, facultyId: 'f-10' },
  { id: 'c-208', name: 'Physics of Living Systems', code: 'BM-103', credits: 4, departmentId: 'dept-9', semester: 1, facultyId: 'f-10' },
  // Year 1 – Semester 2
  { id: 'c-209', name: 'Human Physiology', code: 'BM-201', credits: 4, departmentId: 'dept-9', semester: 2, facultyId: 'f-10' },
  { id: 'c-210', name: 'Chemistry of Biomolecules', code: 'BM-202', credits: 4, departmentId: 'dept-9', semester: 2, facultyId: 'f-10' },
  { id: 'c-211', name: 'Introduction to Biomedical Devices', code: 'BM-203', credits: 3, departmentId: 'dept-9', semester: 2, facultyId: 'f-10' },
  // Year 2 – Semester 3
  { id: 'c-212', name: 'Biomechanics', code: 'BM-311', credits: 4, departmentId: 'dept-9', semester: 3, facultyId: 'f-10' },
  { id: 'c-213', name: 'Electronics for Biomedical', code: 'BM-312', credits: 4, departmentId: 'dept-9', semester: 3, facultyId: 'f-10' },
  { id: 'c-214', name: 'Cell & Molecular Biology', code: 'BM-313', credits: 3, departmentId: 'dept-9', semester: 3, facultyId: 'f-10' },
  // Year 2 – Semester 4
  { id: 'c-215', name: 'Biomaterials', code: 'BM-411', credits: 4, departmentId: 'dept-9', semester: 4, facultyId: 'f-10' },
  { id: 'c-216', name: 'Biomedical Instrumentation', code: 'BM-412', credits: 4, departmentId: 'dept-9', semester: 4, facultyId: 'f-10' },
  { id: 'c-217', name: 'Physiological Signal Analysis', code: 'BM-413', credits: 4, departmentId: 'dept-9', semester: 4, facultyId: 'f-10' },
  // Year 3 – Semester 6
  { id: 'c-218', name: 'Bioinformatics', code: 'BM-601', credits: 4, departmentId: 'dept-9', semester: 6, facultyId: 'f-10' },
  { id: 'c-219', name: 'Rehabilitation Engineering', code: 'BM-602', credits: 4, departmentId: 'dept-9', semester: 6, facultyId: 'f-10' },
  { id: 'c-220', name: 'AI in Healthcare', code: 'BM-603', credits: 3, departmentId: 'dept-9', semester: 6, facultyId: 'f-10' },
  // Year 4 – Semester 7
  { id: 'c-221', name: 'Nano Biotechnology', code: 'BM-701', credits: 4, departmentId: 'dept-9', semester: 7, facultyId: 'f-10' },
  { id: 'c-222', name: 'Clinical Engineering', code: 'BM-702', credits: 4, departmentId: 'dept-9', semester: 7, facultyId: 'f-10' },
  { id: 'c-223', name: 'Medical Device Regulations', code: 'BM-703', credits: 3, departmentId: 'dept-9', semester: 7, facultyId: 'f-10' },
  // Year 4 – Semester 8
  { id: 'c-224', name: 'Final Year Project', code: 'BM-801', credits: 6, departmentId: 'dept-9', semester: 8, facultyId: 'f-10' },
  { id: 'c-225', name: 'Technical Seminar', code: 'BM-802', credits: 2, departmentId: 'dept-9', semester: 8, facultyId: 'f-10' },
  { id: 'c-226', name: 'Research Ethics & IP Rights', code: 'BM-803', credits: 2, departmentId: 'dept-9', semester: 8, facultyId: 'f-10' },

  // ─── MBA (dept-10) – Semesters 1, 2, 4 ──────────────────────────────────────
  // Semester 1
  { id: 'c-227', name: 'Management Principles & Practice', code: 'MB-101', credits: 4, departmentId: 'dept-10', semester: 1, facultyId: 'f-11' },
  { id: 'c-228', name: 'Business Communication', code: 'MB-102', credits: 3, departmentId: 'dept-10', semester: 1, facultyId: 'f-11' },
  { id: 'c-229', name: 'Organisational Behaviour', code: 'MB-103', credits: 4, departmentId: 'dept-10', semester: 1, facultyId: 'f-11' },
  // Semester 2
  { id: 'c-230', name: 'Business Law & Corporate Ethics', code: 'MB-201', credits: 4, departmentId: 'dept-10', semester: 2, facultyId: 'f-11' },
  { id: 'c-231', name: 'Cost & Management Accounting', code: 'MB-202', credits: 4, departmentId: 'dept-10', semester: 2, facultyId: 'f-11' },
  { id: 'c-232', name: 'Quantitative Methods', code: 'MB-203', credits: 3, departmentId: 'dept-10', semester: 2, facultyId: 'f-11' },
  // Semester 4
  { id: 'c-233', name: 'Entrepreneurship & Startups', code: 'MB-401', credits: 4, departmentId: 'dept-10', semester: 4, facultyId: 'f-11' },
  { id: 'c-234', name: 'Corporate Governance', code: 'MB-402', credits: 3, departmentId: 'dept-10', semester: 4, facultyId: 'f-11' },
  { id: 'c-235', name: 'MBA Dissertation Project', code: 'MB-403', credits: 6, departmentId: 'dept-10', semester: 4, facultyId: 'f-11' },

  // ─── AIML (dept-11) – Semesters 1-4, 6-8 ────────────────────────────────────
  // Year 1 – Semester 1
  { id: 'c-236', name: 'Python for AI', code: 'AM-101', credits: 4, departmentId: 'dept-11', semester: 1, facultyId: 'f-12' },
  { id: 'c-237', name: 'Linear Algebra & Calculus', code: 'AM-102', credits: 4, departmentId: 'dept-11', semester: 1, facultyId: 'f-13' },
  { id: 'c-238', name: 'Probability & Statistics for AI', code: 'AM-103', credits: 4, departmentId: 'dept-11', semester: 1, facultyId: 'f-12' },
  // Year 1 – Semester 2
  { id: 'c-239', name: 'Data Structures for AI', code: 'AM-201', credits: 4, departmentId: 'dept-11', semester: 2, facultyId: 'f-12' },
  { id: 'c-240', name: 'Algorithm Design & Analysis', code: 'AM-202', credits: 4, departmentId: 'dept-11', semester: 2, facultyId: 'f-13' },
  { id: 'c-241', name: 'Database Systems', code: 'AM-203', credits: 3, departmentId: 'dept-11', semester: 2, facultyId: 'f-12' },
  // Year 2 – Semester 3
  { id: 'c-242', name: 'Supervised Learning', code: 'AM-311', credits: 4, departmentId: 'dept-11', semester: 3, facultyId: 'f-12' },
  { id: 'c-243', name: 'Unsupervised Learning & Clustering', code: 'AM-312', credits: 4, departmentId: 'dept-11', semester: 3, facultyId: 'f-13' },
  { id: 'c-244', name: 'Natural Language Processing Basics', code: 'AM-313', credits: 3, departmentId: 'dept-11', semester: 3, facultyId: 'f-12' },
  // Year 2 – Semester 4
  { id: 'c-245', name: 'Convolutional Neural Networks', code: 'AM-411', credits: 4, departmentId: 'dept-11', semester: 4, facultyId: 'f-12' },
  { id: 'c-246', name: 'Recurrent Neural Networks & LSTM', code: 'AM-412', credits: 4, departmentId: 'dept-11', semester: 4, facultyId: 'f-13' },
  { id: 'c-247', name: 'Model Optimisation & Deployment', code: 'AM-413', credits: 3, departmentId: 'dept-11', semester: 4, facultyId: 'f-12' },
  // Year 3 – Semester 6
  { id: 'c-248', name: 'Large Language Models', code: 'AM-601', credits: 4, departmentId: 'dept-11', semester: 6, facultyId: 'f-12' },
  { id: 'c-249', name: 'MLOps & AI Infrastructure', code: 'AM-602', credits: 4, departmentId: 'dept-11', semester: 6, facultyId: 'f-13' },
  { id: 'c-250', name: 'Autonomous Systems', code: 'AM-603', credits: 3, departmentId: 'dept-11', semester: 6, facultyId: 'f-12' },
  // Year 4 – Semester 7
  { id: 'c-251', name: 'AI Product Development', code: 'AM-701', credits: 4, departmentId: 'dept-11', semester: 7, facultyId: 'f-12' },
  { id: 'c-252', name: 'Responsible AI & Fairness', code: 'AM-702', credits: 3, departmentId: 'dept-11', semester: 7, facultyId: 'f-13' },
  { id: 'c-253', name: 'AI Research Project', code: 'AM-703', credits: 3, departmentId: 'dept-11', semester: 7, facultyId: 'f-12' },
  // Year 4 – Semester 8
  { id: 'c-254', name: 'Capstone AI/ML Project', code: 'AM-801', credits: 6, departmentId: 'dept-11', semester: 8, facultyId: 'f-12' },
  { id: 'c-255', name: 'Technical Seminar', code: 'AM-802', credits: 2, departmentId: 'dept-11', semester: 8, facultyId: 'f-13' },
  { id: 'c-256', name: 'AI Ethics & Professional Practice', code: 'AM-803', credits: 2, departmentId: 'dept-11', semester: 8, facultyId: 'f-12' },

  // ─── Marine Engineering (dept-18) ────────────────────────────────────────────
  { id: 'c-300', name: 'Engineering Mathematics I', code: 'MR3151', credits: 4, departmentId: 'dept-18', semester: 1, facultyId: 'f-24' },
  { id: 'c-301', name: 'Engineering Chemistry', code: 'CY3151', credits: 3, departmentId: 'dept-18', semester: 1, facultyId: 'f-24' },
  { id: 'c-302', name: 'Marine Physics & Thermodynamics', code: 'MR3152', credits: 4, departmentId: 'dept-18', semester: 1, facultyId: 'f-24' },
  { id: 'c-303', name: 'Engineering Drawing for Marine', code: 'MR3251', credits: 4, departmentId: 'dept-18', semester: 2, facultyId: 'f-24' },
  { id: 'c-304', name: 'Naval Architecture', code: 'MR3252', credits: 4, departmentId: 'dept-18', semester: 2, facultyId: 'f-24' },
  { id: 'c-305', name: 'Fluid Mechanics & Hydraulic Machinery', code: 'MR3351', credits: 4, departmentId: 'dept-18', semester: 3, facultyId: 'f-24' },
  { id: 'c-306', name: 'Marine Diesel Engines', code: 'MR3352', credits: 4, departmentId: 'dept-18', semester: 3, facultyId: 'f-24' },
  { id: 'c-307', name: 'Marine Steam Turbines', code: 'MR3451', credits: 3, departmentId: 'dept-18', semester: 4, facultyId: 'f-24' },
  { id: 'c-308', name: 'Ship Stability & Resistance', code: 'MR3452', credits: 4, departmentId: 'dept-18', semester: 4, facultyId: 'f-24' },
  { id: 'c-309', name: 'Marine Electrical Systems', code: 'MR3551', credits: 3, departmentId: 'dept-18', semester: 5, facultyId: 'f-24' },
  { id: 'c-310', name: 'Automation & Control in Ships', code: 'MR3552', credits: 4, departmentId: 'dept-18', semester: 5, facultyId: 'f-24' },
  { id: 'c-311', name: 'Marine Safety & International Regulations', code: 'MR3651', credits: 3, departmentId: 'dept-18', semester: 6, facultyId: 'f-24' },
  { id: 'c-312', name: 'Port Management & Maritime Law', code: 'MR3652', credits: 3, departmentId: 'dept-18', semester: 6, facultyId: 'f-24' },
  { id: 'c-313', name: 'Marine Project Work I', code: 'MR3791', credits: 4, departmentId: 'dept-18', semester: 7, facultyId: 'f-24' },
  { id: 'c-314', name: 'Marine Project Work II', code: 'MR3811', credits: 10, departmentId: 'dept-18', semester: 8, facultyId: 'f-24' },

  // ─── Textile Technology (dept-19) ─────────────────────────────────────────────
  { id: 'c-320', name: 'Engineering Mathematics I', code: 'TX3151', credits: 4, departmentId: 'dept-19', semester: 1, facultyId: 'f-25' },
  { id: 'c-321', name: 'Textile Fibres & Yarn Technology', code: 'TX3152', credits: 4, departmentId: 'dept-19', semester: 1, facultyId: 'f-25' },
  { id: 'c-322', name: 'Textile Testing & Quality Control', code: 'TX3251', credits: 3, departmentId: 'dept-19', semester: 2, facultyId: 'f-25' },
  { id: 'c-323', name: 'Weaving Technology', code: 'TX3351', credits: 4, departmentId: 'dept-19', semester: 3, facultyId: 'f-25' },
  { id: 'c-324', name: 'Knitting Technology', code: 'TX3352', credits: 3, departmentId: 'dept-19', semester: 3, facultyId: 'f-25' },
  { id: 'c-325', name: 'Chemical Processing of Textiles', code: 'TX3451', credits: 4, departmentId: 'dept-19', semester: 4, facultyId: 'f-25' },
  { id: 'c-326', name: 'Textile Dyeing & Printing', code: 'TX3452', credits: 4, departmentId: 'dept-19', semester: 4, facultyId: 'f-25' },
  { id: 'c-327', name: 'Technical Textiles', code: 'TX3551', credits: 3, departmentId: 'dept-19', semester: 5, facultyId: 'f-25' },
  { id: 'c-328', name: 'Apparel Technology & Fashion', code: 'TX3651', credits: 3, departmentId: 'dept-19', semester: 6, facultyId: 'f-25' },
  { id: 'c-329', name: 'Textile Project Work', code: 'TX3811', credits: 10, departmentId: 'dept-19', semester: 8, facultyId: 'f-25' },

  // ─── Mining Engineering (dept-20) ─────────────────────────────────────────────
  { id: 'c-340', name: 'Engineering Geology', code: 'MI3151', credits: 4, departmentId: 'dept-20', semester: 1, facultyId: 'f-26' },
  { id: 'c-341', name: 'Mine Surveying', code: 'MI3251', credits: 4, departmentId: 'dept-20', semester: 2, facultyId: 'f-26' },
  { id: 'c-342', name: 'Rock Mechanics', code: 'MI3351', credits: 4, departmentId: 'dept-20', semester: 3, facultyId: 'f-26' },
  { id: 'c-343', name: 'Mining Methods & Technology', code: 'MI3352', credits: 4, departmentId: 'dept-20', semester: 3, facultyId: 'f-26' },
  { id: 'c-344', name: 'Mine Ventilation & Safety', code: 'MI3451', credits: 3, departmentId: 'dept-20', semester: 4, facultyId: 'f-26' },
  { id: 'c-345', name: 'Drilling & Blasting', code: 'MI3551', credits: 4, departmentId: 'dept-20', semester: 5, facultyId: 'f-26' },
  { id: 'c-346', name: 'Mine Management & Economics', code: 'MI3651', credits: 3, departmentId: 'dept-20', semester: 6, facultyId: 'f-26' },
  { id: 'c-347', name: 'Environmental Mining Engineering', code: 'MI3751', credits: 3, departmentId: 'dept-20', semester: 7, facultyId: 'f-26' },
  { id: 'c-348', name: 'Mining Project Work', code: 'MI3811', credits: 10, departmentId: 'dept-20', semester: 8, facultyId: 'f-26' },

  // ─── Architecture (dept-21) ───────────────────────────────────────────────────
  { id: 'c-360', name: 'History of Architecture', code: 'AR3151', credits: 4, departmentId: 'dept-21', semester: 1, facultyId: 'f-27' },
  { id: 'c-361', name: 'Building Construction & Materials', code: 'AR3251', credits: 4, departmentId: 'dept-21', semester: 2, facultyId: 'f-27' },
  { id: 'c-362', name: 'Architectural Design Studio I', code: 'AR3351', credits: 6, departmentId: 'dept-21', semester: 3, facultyId: 'f-27' },
  { id: 'c-363', name: 'Structural Systems in Architecture', code: 'AR3352', credits: 4, departmentId: 'dept-21', semester: 3, facultyId: 'f-27' },
  { id: 'c-364', name: 'Architectural Design Studio II', code: 'AR3451', credits: 6, departmentId: 'dept-21', semester: 4, facultyId: 'f-27' },
  { id: 'c-365', name: 'Urban Planning & Design', code: 'AR3551', credits: 4, departmentId: 'dept-21', semester: 5, facultyId: 'f-27' },
  { id: 'c-366', name: 'Interior Design & Space Planning', code: 'AR3651', credits: 3, departmentId: 'dept-21', semester: 6, facultyId: 'f-27' },
  { id: 'c-367', name: 'Landscape Architecture', code: 'AR3751', credits: 3, departmentId: 'dept-21', semester: 7, facultyId: 'f-27' },
  { id: 'c-368', name: 'Architecture Thesis Project', code: 'AR3811', credits: 10, departmentId: 'dept-21', semester: 8, facultyId: 'f-27' },

  // ─── Physics (dept-22) ────────────────────────────────────────────────────────
  { id: 'c-380', name: 'Classical Mechanics', code: 'PH3151', credits: 4, departmentId: 'dept-22', semester: 1, facultyId: 'f-28' },
  { id: 'c-381', name: 'Electromagnetic Theory', code: 'PH3251', credits: 4, departmentId: 'dept-22', semester: 2, facultyId: 'f-28' },
  { id: 'c-382', name: 'Quantum Mechanics I', code: 'PH3351', credits: 4, departmentId: 'dept-22', semester: 3, facultyId: 'f-28' },
  { id: 'c-383', name: 'Statistical Mechanics', code: 'PH3352', credits: 4, departmentId: 'dept-22', semester: 3, facultyId: 'f-28' },
  { id: 'c-384', name: 'Quantum Mechanics II', code: 'PH3451', credits: 4, departmentId: 'dept-22', semester: 4, facultyId: 'f-28' },
  { id: 'c-385', name: 'Nuclear & Particle Physics', code: 'PH3551', credits: 4, departmentId: 'dept-22', semester: 5, facultyId: 'f-28' },
  { id: 'c-386', name: 'Condensed Matter Physics', code: 'PH3651', credits: 4, departmentId: 'dept-22', semester: 6, facultyId: 'f-28' },
  { id: 'c-387', name: 'Astrophysics & Cosmology', code: 'PH3751', credits: 3, departmentId: 'dept-22', semester: 7, facultyId: 'f-28' },
  { id: 'c-388', name: 'Physics Research Project', code: 'PH3811', credits: 10, departmentId: 'dept-22', semester: 8, facultyId: 'f-28' },

  // ─── Mathematics (dept-23) ────────────────────────────────────────────────────
  { id: 'c-400', name: 'Calculus & Differential Equations', code: 'MA3151', credits: 4, departmentId: 'dept-23', semester: 1, facultyId: 'f-29' },
  { id: 'c-401', name: 'Linear Algebra', code: 'MA3251', credits: 4, departmentId: 'dept-23', semester: 2, facultyId: 'f-29' },
  { id: 'c-402', name: 'Discrete Mathematics', code: 'MA3351', credits: 4, departmentId: 'dept-23', semester: 3, facultyId: 'f-29' },
  { id: 'c-403', name: 'Real Analysis', code: 'MA3352', credits: 4, departmentId: 'dept-23', semester: 3, facultyId: 'f-29' },
  { id: 'c-404', name: 'Complex Analysis', code: 'MA3451', credits: 4, departmentId: 'dept-23', semester: 4, facultyId: 'f-29' },
  { id: 'c-405', name: 'Number Theory', code: 'MA3551', credits: 4, departmentId: 'dept-23', semester: 5, facultyId: 'f-29' },
  { id: 'c-406', name: 'Numerical Methods & Optimization', code: 'MA3651', credits: 4, departmentId: 'dept-23', semester: 6, facultyId: 'f-29' },
  { id: 'c-407', name: 'Operations Research', code: 'MA3751', credits: 3, departmentId: 'dept-23', semester: 7, facultyId: 'f-29' },
  { id: 'c-408', name: 'Mathematics Research Project', code: 'MA3811', credits: 10, departmentId: 'dept-23', semester: 8, facultyId: 'f-29' },

  // ─── MCA (dept-24) – 4 Semesters (PG Programme) ──────────────────────────────
  { id: 'c-420', name: 'Problem Solving & Python Programming', code: 'MC3151', credits: 4, departmentId: 'dept-24', semester: 1, facultyId: 'f-30' },
  { id: 'c-421', name: 'Data Structures & Algorithms', code: 'MC3152', credits: 4, departmentId: 'dept-24', semester: 1, facultyId: 'f-30' },
  { id: 'c-422', name: 'Database Management Systems', code: 'MC3153', credits: 4, departmentId: 'dept-24', semester: 1, facultyId: 'f-30' },
  { id: 'c-423', name: 'Computer Networks', code: 'MC3251', credits: 4, departmentId: 'dept-24', semester: 2, facultyId: 'f-30' },
  { id: 'c-424', name: 'Operating Systems', code: 'MC3252', credits: 4, departmentId: 'dept-24', semester: 2, facultyId: 'f-30' },
  { id: 'c-425', name: 'Web Application Development', code: 'MC3253', credits: 4, departmentId: 'dept-24', semester: 2, facultyId: 'f-30' },
  { id: 'c-426', name: 'Cloud Computing', code: 'MC3351', credits: 4, departmentId: 'dept-24', semester: 3, facultyId: 'f-30' },
  { id: 'c-427', name: 'Data Science & Machine Learning', code: 'MC3352', credits: 4, departmentId: 'dept-24', semester: 3, facultyId: 'f-30' },
  { id: 'c-428', name: 'MCA Project Work', code: 'MC3411', credits: 10, departmentId: 'dept-24', semester: 4, facultyId: 'f-30' },

  // ─── CSBS (dept-25) ───────────────────────────────────────────────────────────
  { id: 'c-440', name: 'Problem Solving & Python Programming', code: 'CB3151', credits: 4, departmentId: 'dept-25', semester: 1, facultyId: 'f-31' },
  { id: 'c-441', name: 'Business Mathematics & Statistics', code: 'CB3152', credits: 4, departmentId: 'dept-25', semester: 1, facultyId: 'f-31' },
  { id: 'c-442', name: 'Principles of Management', code: 'CB3153', credits: 3, departmentId: 'dept-25', semester: 1, facultyId: 'f-31' },
  { id: 'c-443', name: 'Data Structures', code: 'CB3251', credits: 3, departmentId: 'dept-25', semester: 2, facultyId: 'f-31' },
  { id: 'c-444', name: 'Accounting for Business', code: 'CB3252', credits: 4, departmentId: 'dept-25', semester: 2, facultyId: 'f-31' },
  { id: 'c-445', name: 'Object Oriented Programming', code: 'CB3351', credits: 4, departmentId: 'dept-25', semester: 3, facultyId: 'f-31' },
  { id: 'c-446', name: 'Database Management & SQL', code: 'CB3352', credits: 4, departmentId: 'dept-25', semester: 3, facultyId: 'f-31' },
  { id: 'c-447', name: 'Business Analytics', code: 'CB3451', credits: 4, departmentId: 'dept-25', semester: 4, facultyId: 'f-31' },
  { id: 'c-448', name: 'Artificial Intelligence for Business', code: 'CB3452', credits: 4, departmentId: 'dept-25', semester: 4, facultyId: 'f-31' },
  { id: 'c-449', name: 'E-Commerce & Digital Marketing', code: 'CB3551', credits: 3, departmentId: 'dept-25', semester: 5, facultyId: 'f-31' },
  { id: 'c-450', name: 'Machine Learning Applications', code: 'CB3552', credits: 4, departmentId: 'dept-25', semester: 5, facultyId: 'f-31' },
  { id: 'c-451', name: 'Cloud Business Solutions', code: 'CB3651', credits: 3, departmentId: 'dept-25', semester: 6, facultyId: 'f-31' },
  { id: 'c-452', name: 'Blockchain & FinTech', code: 'CB3652', credits: 3, departmentId: 'dept-25', semester: 6, facultyId: 'f-31' },
  { id: 'c-453', name: 'IT Project Management', code: 'CB3751', credits: 3, departmentId: 'dept-25', semester: 7, facultyId: 'f-31' },
  { id: 'c-454', name: 'CSBS Capstone Project', code: 'CB3811', credits: 10, departmentId: 'dept-25', semester: 8, facultyId: 'f-31' }
];

export const initialAttendance: Attendance[] = [
  { id: 'att-1', studentId: 's-1', courseId: 'c-2', date: '2026-07-01', status: 'Present', markedBy: 'f-2' },
  { id: 'att-2', studentId: 's-1', courseId: 'c-2', date: '2026-07-02', status: 'Present', markedBy: 'f-2' },
  { id: 'att-3', studentId: 's-1', courseId: 'c-2', date: '2026-07-03', status: 'Absent', markedBy: 'f-2' },
  { id: 'att-4', studentId: 's-2', courseId: 'c-2', date: '2026-07-01', status: 'Present', markedBy: 'f-2' },
  { id: 'att-5', studentId: 's-2', courseId: 'c-2', date: '2026-07-02', status: 'Absent', markedBy: 'f-2' },
  { id: 'att-6', studentId: 's-2', courseId: 'c-2', date: '2026-07-03', status: 'Present', markedBy: 'f-2' },
  { id: 'att-7', studentId: 's-1', courseId: 'c-1', date: '2026-07-01', status: 'Present', markedBy: 'f-1' },
  { id: 'att-8', studentId: 's-1', courseId: 'c-1', date: '2026-07-02', status: 'Present', markedBy: 'f-1' },
  { id: 'att-9', studentId: 's-1', courseId: 'c-1', date: '2026-07-03', status: 'Present', markedBy: 'f-1' }
];

export const initialExams: Exam[] = [
  { id: 'ex-1', name: 'DBMS Mid-Term Examination', courseId: 'c-2', date: '2026-05-15', maxMarks: 50 },
  { id: 'ex-2', name: 'DBMS End-Semester Examination', courseId: 'c-2', date: '2026-06-25', maxMarks: 100 },
  { id: 'ex-3', name: 'TOC Mid-Term Examination', courseId: 'c-1', date: '2026-05-18', maxMarks: 50 },
  { id: 'ex-4', name: 'TOC End-Semester Examination', courseId: 'c-1', date: '2026-06-28', maxMarks: 100 }
];

export const initialResults: Result[] = [
  { id: 'res-1', studentId: 's-1', examId: 'ex-1', internalMarks: 45, semesterMarks: 88, totalMarks: 133, grade: 'O', gpa: 10.0 },
  { id: 'res-2', studentId: 's-1', examId: 'ex-3', internalMarks: 42, semesterMarks: 82, totalMarks: 124, grade: 'A+', gpa: 9.25 },
  { id: 'res-3', studentId: 's-2', examId: 'ex-1', internalMarks: 38, semesterMarks: 75, totalMarks: 113, grade: 'A', gpa: 8.25 },
  { id: 'res-4', studentId: 's-2', examId: 'ex-3', internalMarks: 40, semesterMarks: 78, totalMarks: 118, grade: 'A', gpa: 8.25 }
];

export const initialFeeStructures: FeeStructure[] = [
  // CSE Department (dept-5)
  { id: 'fee-33', name: 'Tuition Fee - CSE Semester 1', amount: 3600.00, description: 'Academic Core Tuition Fee - Semester 1', semester: 1, departmentId: 'dept-5' },
  { id: 'fee-34', name: 'Tuition Fee - CSE Semester 2', amount: 3700.00, description: 'Academic Core Tuition Fee - Semester 2', semester: 2, departmentId: 'dept-5' },
  { id: 'fee-35', name: 'Tuition Fee - CSE Semester 3', amount: 3800.00, description: 'Academic Core Tuition Fee - Semester 3', semester: 3, departmentId: 'dept-5' },
  { id: 'fee-36', name: 'Tuition Fee - CSE Semester 4', amount: 3900.00, description: 'Academic Core Tuition Fee - Semester 4', semester: 4, departmentId: 'dept-5' },
  { id: 'fee-37', name: 'Tuition Fee - CSE Semester 5', amount: 4000.00, description: 'Academic Core Tuition Fee - Semester 5', semester: 5, departmentId: 'dept-5' },
  { id: 'fee-38', name: 'Tuition Fee - CSE Semester 6', amount: 4100.00, description: 'Academic Core Tuition Fee - Semester 6', semester: 6, departmentId: 'dept-5' },
  { id: 'fee-39', name: 'Tuition Fee - CSE Semester 7', amount: 4200.00, description: 'Academic Core Tuition Fee - Semester 7', semester: 7, departmentId: 'dept-5' },
  { id: 'fee-40', name: 'Tuition Fee - CSE Semester 8', amount: 4300.00, description: 'Academic Core Tuition Fee - Semester 8', semester: 8, departmentId: 'dept-5' },
  // EEE Department (dept-6)
  { id: 'fee-41', name: 'Tuition Fee - EEE Semester 1', amount: 3500.00, description: 'EEE Tuition Fee - Semester 1', semester: 1, departmentId: 'dept-6' },
  { id: 'fee-42', name: 'Tuition Fee - EEE Semester 2', amount: 3600.00, description: 'EEE Tuition Fee - Semester 2', semester: 2, departmentId: 'dept-6' },
  { id: 'fee-43', name: 'Tuition Fee - EEE Semester 3', amount: 3700.00, description: 'EEE Tuition Fee - Semester 3', semester: 3, departmentId: 'dept-6' },
  { id: 'fee-44', name: 'Tuition Fee - EEE Semester 4', amount: 3800.00, description: 'EEE Tuition Fee - Semester 4', semester: 4, departmentId: 'dept-6' },
  { id: 'fee-45', name: 'Tuition Fee - EEE Semester 5', amount: 3900.00, description: 'EEE Tuition Fee - Semester 5', semester: 5, departmentId: 'dept-6' },
  { id: 'fee-46', name: 'Tuition Fee - EEE Semester 6', amount: 4000.00, description: 'EEE Tuition Fee - Semester 6', semester: 6, departmentId: 'dept-6' },
  { id: 'fee-47', name: 'Tuition Fee - EEE Semester 7', amount: 4100.00, description: 'EEE Tuition Fee - Semester 7', semester: 7, departmentId: 'dept-6' },
  { id: 'fee-48', name: 'Tuition Fee - EEE Semester 8', amount: 4200.00, description: 'EEE Tuition Fee - Semester 8', semester: 8, departmentId: 'dept-6' },
  // AIDS Department (dept-7)
  { id: 'fee-49', name: 'Tuition Fee - AIDS Semester 1', amount: 3800.00, description: 'AI & Data Science Tuition Fee - Semester 1', semester: 1, departmentId: 'dept-7' },
  { id: 'fee-50', name: 'Tuition Fee - AIDS Semester 2', amount: 3900.00, description: 'AI & Data Science Tuition Fee - Semester 2', semester: 2, departmentId: 'dept-7' },
  { id: 'fee-51', name: 'Tuition Fee - AIDS Semester 3', amount: 4000.00, description: 'AI & Data Science Tuition Fee - Semester 3', semester: 3, departmentId: 'dept-7' },
  { id: 'fee-52', name: 'Tuition Fee - AIDS Semester 4', amount: 4100.00, description: 'AI & Data Science Tuition Fee - Semester 4', semester: 4, departmentId: 'dept-7' },
  { id: 'fee-53', name: 'Tuition Fee - AIDS Semester 5', amount: 4200.00, description: 'AI & Data Science Tuition Fee - Semester 5', semester: 5, departmentId: 'dept-7' },
  { id: 'fee-54', name: 'Tuition Fee - AIDS Semester 6', amount: 4300.00, description: 'AI & Data Science Tuition Fee - Semester 6', semester: 6, departmentId: 'dept-7' },
  { id: 'fee-55', name: 'Tuition Fee - AIDS Semester 7', amount: 4400.00, description: 'AI & Data Science Tuition Fee - Semester 7', semester: 7, departmentId: 'dept-7' },
  { id: 'fee-56', name: 'Tuition Fee - AIDS Semester 8', amount: 4500.00, description: 'AI & Data Science Tuition Fee - Semester 8', semester: 8, departmentId: 'dept-7' },
  // Chemical Engineering Department (dept-8)
  { id: 'fee-57', name: 'Tuition Fee - CHEM Semester 1', amount: 3400.00, description: 'Chemical Engineering Tuition Fee - Semester 1', semester: 1, departmentId: 'dept-8' },
  { id: 'fee-58', name: 'Tuition Fee - CHEM Semester 2', amount: 3500.00, description: 'Chemical Engineering Tuition Fee - Semester 2', semester: 2, departmentId: 'dept-8' },
  { id: 'fee-59', name: 'Tuition Fee - CHEM Semester 3', amount: 3600.00, description: 'Chemical Engineering Tuition Fee - Semester 3', semester: 3, departmentId: 'dept-8' },
  { id: 'fee-60', name: 'Tuition Fee - CHEM Semester 4', amount: 3700.00, description: 'Chemical Engineering Tuition Fee - Semester 4', semester: 4, departmentId: 'dept-8' },
  { id: 'fee-61', name: 'Tuition Fee - CHEM Semester 5', amount: 3800.00, description: 'Chemical Engineering Tuition Fee - Semester 5', semester: 5, departmentId: 'dept-8' },
  { id: 'fee-62', name: 'Tuition Fee - CHEM Semester 6', amount: 3900.00, description: 'Chemical Engineering Tuition Fee - Semester 6', semester: 6, departmentId: 'dept-8' },
  { id: 'fee-63', name: 'Tuition Fee - CHEM Semester 7', amount: 4000.00, description: 'Chemical Engineering Tuition Fee - Semester 7', semester: 7, departmentId: 'dept-8' },
  { id: 'fee-64', name: 'Tuition Fee - CHEM Semester 8', amount: 4100.00, description: 'Chemical Engineering Tuition Fee - Semester 8', semester: 8, departmentId: 'dept-8' },
  // Biomedical Engineering Department (dept-9)
  { id: 'fee-65', name: 'Tuition Fee - BME Semester 1', amount: 3700.00, description: 'Biomedical Engineering Tuition Fee - Semester 1', semester: 1, departmentId: 'dept-9' },
  { id: 'fee-66', name: 'Tuition Fee - BME Semester 2', amount: 3800.00, description: 'Biomedical Engineering Tuition Fee - Semester 2', semester: 2, departmentId: 'dept-9' },
  { id: 'fee-67', name: 'Tuition Fee - BME Semester 3', amount: 3900.00, description: 'Biomedical Engineering Tuition Fee - Semester 3', semester: 3, departmentId: 'dept-9' },
  { id: 'fee-68', name: 'Tuition Fee - BME Semester 4', amount: 4000.00, description: 'Biomedical Engineering Tuition Fee - Semester 4', semester: 4, departmentId: 'dept-9' },
  { id: 'fee-69', name: 'Tuition Fee - BME Semester 5', amount: 4100.00, description: 'Biomedical Engineering Tuition Fee - Semester 5', semester: 5, departmentId: 'dept-9' },
  { id: 'fee-70', name: 'Tuition Fee - BME Semester 6', amount: 4200.00, description: 'Biomedical Engineering Tuition Fee - Semester 6', semester: 6, departmentId: 'dept-9' },
  { id: 'fee-71', name: 'Tuition Fee - BME Semester 7', amount: 4300.00, description: 'Biomedical Engineering Tuition Fee - Semester 7', semester: 7, departmentId: 'dept-9' },
  { id: 'fee-72', name: 'Tuition Fee - BME Semester 8', amount: 4400.00, description: 'Biomedical Engineering Tuition Fee - Semester 8', semester: 8, departmentId: 'dept-9' },
  // MBA Department (dept-10)
  { id: 'fee-73', name: 'Tuition Fee - MBA Semester 1', amount: 5000.00, description: 'MBA Tuition Fee - Semester 1', semester: 1, departmentId: 'dept-10' },
  { id: 'fee-74', name: 'Tuition Fee - MBA Semester 2', amount: 5200.00, description: 'MBA Tuition Fee - Semester 2', semester: 2, departmentId: 'dept-10' },
  { id: 'fee-75', name: 'Tuition Fee - MBA Semester 3', amount: 5400.00, description: 'MBA Tuition Fee - Semester 3', semester: 3, departmentId: 'dept-10' },
  { id: 'fee-76', name: 'Tuition Fee - MBA Semester 4', amount: 5600.00, description: 'MBA Tuition Fee - Semester 4', semester: 4, departmentId: 'dept-10' },
  // AIML Department (dept-11)
  { id: 'fee-77', name: 'Tuition Fee - AIML Semester 1', amount: 4000.00, description: 'AIML Tuition Fee - Semester 1', semester: 1, departmentId: 'dept-11' },
  { id: 'fee-78', name: 'Tuition Fee - AIML Semester 2', amount: 4100.00, description: 'AIML Tuition Fee - Semester 2', semester: 2, departmentId: 'dept-11' },
  { id: 'fee-79', name: 'Tuition Fee - AIML Semester 3', amount: 4200.00, description: 'AIML Tuition Fee - Semester 3', semester: 3, departmentId: 'dept-11' },
  { id: 'fee-80', name: 'Tuition Fee - AIML Semester 4', amount: 4300.00, description: 'AIML Tuition Fee - Semester 4', semester: 4, departmentId: 'dept-11' },
  { id: 'fee-81', name: 'Tuition Fee - AIML Semester 5', amount: 4400.00, description: 'AIML Tuition Fee - Semester 5', semester: 5, departmentId: 'dept-11' },
  { id: 'fee-82', name: 'Tuition Fee - AIML Semester 6', amount: 4500.00, description: 'AIML Tuition Fee - Semester 6', semester: 6, departmentId: 'dept-11' },
  { id: 'fee-83', name: 'Tuition Fee - AIML Semester 7', amount: 4600.00, description: 'AIML Tuition Fee - Semester 7', semester: 7, departmentId: 'dept-11' },
  { id: 'fee-84', name: 'Tuition Fee - AIML Semester 8', amount: 4700.00, description: 'AIML Tuition Fee - Semester 8', semester: 8, departmentId: 'dept-11' },
  // Marine Engineering (dept-18)
  { id: 'fee-85', name: 'Tuition Fee - MARINE Semester 1', amount: 4200.00, description: 'Marine Engineering Tuition Fee - Semester 1', semester: 1, departmentId: 'dept-18' },
  { id: 'fee-86', name: 'Tuition Fee - MARINE Semester 2', amount: 4300.00, description: 'Marine Engineering Tuition Fee - Semester 2', semester: 2, departmentId: 'dept-18' },
  { id: 'fee-87', name: 'Tuition Fee - MARINE Semester 3', amount: 4400.00, description: 'Marine Engineering Tuition Fee - Semester 3', semester: 3, departmentId: 'dept-18' },
  { id: 'fee-88', name: 'Tuition Fee - MARINE Semester 4', amount: 4500.00, description: 'Marine Engineering Tuition Fee - Semester 4', semester: 4, departmentId: 'dept-18' },
  { id: 'fee-89', name: 'Tuition Fee - MARINE Semester 5', amount: 4600.00, description: 'Marine Engineering Tuition Fee - Semester 5', semester: 5, departmentId: 'dept-18' },
  { id: 'fee-90', name: 'Tuition Fee - MARINE Semester 6', amount: 4700.00, description: 'Marine Engineering Tuition Fee - Semester 6', semester: 6, departmentId: 'dept-18' },
  { id: 'fee-91', name: 'Tuition Fee - MARINE Semester 7', amount: 4800.00, description: 'Marine Engineering Tuition Fee - Semester 7', semester: 7, departmentId: 'dept-18' },
  { id: 'fee-92', name: 'Tuition Fee - MARINE Semester 8', amount: 4900.00, description: 'Marine Engineering Tuition Fee - Semester 8', semester: 8, departmentId: 'dept-18' },
  // Textile Technology (dept-19)
  { id: 'fee-93', name: 'Tuition Fee - TEXT Semester 1', amount: 3200.00, description: 'Textile Technology Tuition Fee - Semester 1', semester: 1, departmentId: 'dept-19' },
  { id: 'fee-94', name: 'Tuition Fee - TEXT Semester 2', amount: 3300.00, description: 'Textile Technology Tuition Fee - Semester 2', semester: 2, departmentId: 'dept-19' },
  { id: 'fee-95', name: 'Tuition Fee - TEXT Semester 3', amount: 3400.00, description: 'Textile Technology Tuition Fee - Semester 3', semester: 3, departmentId: 'dept-19' },
  { id: 'fee-96', name: 'Tuition Fee - TEXT Semester 4', amount: 3500.00, description: 'Textile Technology Tuition Fee - Semester 4', semester: 4, departmentId: 'dept-19' },
  { id: 'fee-97', name: 'Tuition Fee - TEXT Semester 5', amount: 3600.00, description: 'Textile Technology Tuition Fee - Semester 5', semester: 5, departmentId: 'dept-19' },
  { id: 'fee-98', name: 'Tuition Fee - TEXT Semester 6', amount: 3700.00, description: 'Textile Technology Tuition Fee - Semester 6', semester: 6, departmentId: 'dept-19' },
  { id: 'fee-99', name: 'Tuition Fee - TEXT Semester 7', amount: 3800.00, description: 'Textile Technology Tuition Fee - Semester 7', semester: 7, departmentId: 'dept-19' },
  { id: 'fee-100', name: 'Tuition Fee - TEXT Semester 8', amount: 3900.00, description: 'Textile Technology Tuition Fee - Semester 8', semester: 8, departmentId: 'dept-19' },
  // Mining Engineering (dept-20)
  { id: 'fee-101', name: 'Tuition Fee - MINE Semester 1', amount: 3500.00, description: 'Mining Engineering Tuition Fee - Semester 1', semester: 1, departmentId: 'dept-20' },
  { id: 'fee-102', name: 'Tuition Fee - MINE Semester 2', amount: 3600.00, description: 'Mining Engineering Tuition Fee - Semester 2', semester: 2, departmentId: 'dept-20' },
  { id: 'fee-103', name: 'Tuition Fee - MINE Semester 3', amount: 3700.00, description: 'Mining Engineering Tuition Fee - Semester 3', semester: 3, departmentId: 'dept-20' },
  { id: 'fee-104', name: 'Tuition Fee - MINE Semester 4', amount: 3800.00, description: 'Mining Engineering Tuition Fee - Semester 4', semester: 4, departmentId: 'dept-20' },
  { id: 'fee-105', name: 'Tuition Fee - MINE Semester 5', amount: 3900.00, description: 'Mining Engineering Tuition Fee - Semester 5', semester: 5, departmentId: 'dept-20' },
  { id: 'fee-106', name: 'Tuition Fee - MINE Semester 6', amount: 4000.00, description: 'Mining Engineering Tuition Fee - Semester 6', semester: 6, departmentId: 'dept-20' },
  { id: 'fee-107', name: 'Tuition Fee - MINE Semester 7', amount: 4100.00, description: 'Mining Engineering Tuition Fee - Semester 7', semester: 7, departmentId: 'dept-20' },
  { id: 'fee-108', name: 'Tuition Fee - MINE Semester 8', amount: 4200.00, description: 'Mining Engineering Tuition Fee - Semester 8', semester: 8, departmentId: 'dept-20' },
  // Architecture (dept-21)
  { id: 'fee-109', name: 'Tuition Fee - ARCH Semester 1', amount: 4500.00, description: 'Architecture Tuition Fee - Semester 1', semester: 1, departmentId: 'dept-21' },
  { id: 'fee-110', name: 'Tuition Fee - ARCH Semester 2', amount: 4600.00, description: 'Architecture Tuition Fee - Semester 2', semester: 2, departmentId: 'dept-21' },
  { id: 'fee-111', name: 'Tuition Fee - ARCH Semester 3', amount: 4700.00, description: 'Architecture Tuition Fee - Semester 3', semester: 3, departmentId: 'dept-21' },
  { id: 'fee-112', name: 'Tuition Fee - ARCH Semester 4', amount: 4800.00, description: 'Architecture Tuition Fee - Semester 4', semester: 4, departmentId: 'dept-21' },
  { id: 'fee-113', name: 'Tuition Fee - ARCH Semester 5', amount: 4900.00, description: 'Architecture Tuition Fee - Semester 5', semester: 5, departmentId: 'dept-21' },
  { id: 'fee-114', name: 'Tuition Fee - ARCH Semester 6', amount: 5000.00, description: 'Architecture Tuition Fee - Semester 6', semester: 6, departmentId: 'dept-21' },
  { id: 'fee-115', name: 'Tuition Fee - ARCH Semester 7', amount: 5100.00, description: 'Architecture Tuition Fee - Semester 7', semester: 7, departmentId: 'dept-21' },
  { id: 'fee-116', name: 'Tuition Fee - ARCH Semester 8', amount: 5200.00, description: 'Architecture Tuition Fee - Semester 8', semester: 8, departmentId: 'dept-21' },
  // Physics (dept-22)
  { id: 'fee-117', name: 'Tuition Fee - PHY Semester 1', amount: 2800.00, description: 'Physics Tuition Fee - Semester 1', semester: 1, departmentId: 'dept-22' },
  { id: 'fee-118', name: 'Tuition Fee - PHY Semester 2', amount: 2900.00, description: 'Physics Tuition Fee - Semester 2', semester: 2, departmentId: 'dept-22' },
  { id: 'fee-119', name: 'Tuition Fee - PHY Semester 3', amount: 3000.00, description: 'Physics Tuition Fee - Semester 3', semester: 3, departmentId: 'dept-22' },
  { id: 'fee-120', name: 'Tuition Fee - PHY Semester 4', amount: 3100.00, description: 'Physics Tuition Fee - Semester 4', semester: 4, departmentId: 'dept-22' },
  { id: 'fee-121', name: 'Tuition Fee - PHY Semester 5', amount: 3200.00, description: 'Physics Tuition Fee - Semester 5', semester: 5, departmentId: 'dept-22' },
  { id: 'fee-122', name: 'Tuition Fee - PHY Semester 6', amount: 3300.00, description: 'Physics Tuition Fee - Semester 6', semester: 6, departmentId: 'dept-22' },
  { id: 'fee-123', name: 'Tuition Fee - PHY Semester 7', amount: 3400.00, description: 'Physics Tuition Fee - Semester 7', semester: 7, departmentId: 'dept-22' },
  { id: 'fee-124', name: 'Tuition Fee - PHY Semester 8', amount: 3500.00, description: 'Physics Tuition Fee - Semester 8', semester: 8, departmentId: 'dept-22' },
  // Mathematics (dept-23)
  { id: 'fee-125', name: 'Tuition Fee - MATH Semester 1', amount: 2600.00, description: 'Mathematics Tuition Fee - Semester 1', semester: 1, departmentId: 'dept-23' },
  { id: 'fee-126', name: 'Tuition Fee - MATH Semester 2', amount: 2700.00, description: 'Mathematics Tuition Fee - Semester 2', semester: 2, departmentId: 'dept-23' },
  { id: 'fee-127', name: 'Tuition Fee - MATH Semester 3', amount: 2800.00, description: 'Mathematics Tuition Fee - Semester 3', semester: 3, departmentId: 'dept-23' },
  { id: 'fee-128', name: 'Tuition Fee - MATH Semester 4', amount: 2900.00, description: 'Mathematics Tuition Fee - Semester 4', semester: 4, departmentId: 'dept-23' },
  { id: 'fee-129', name: 'Tuition Fee - MATH Semester 5', amount: 3000.00, description: 'Mathematics Tuition Fee - Semester 5', semester: 5, departmentId: 'dept-23' },
  { id: 'fee-130', name: 'Tuition Fee - MATH Semester 6', amount: 3100.00, description: 'Mathematics Tuition Fee - Semester 6', semester: 6, departmentId: 'dept-23' },
  { id: 'fee-131', name: 'Tuition Fee - MATH Semester 7', amount: 3200.00, description: 'Mathematics Tuition Fee - Semester 7', semester: 7, departmentId: 'dept-23' },
  { id: 'fee-132', name: 'Tuition Fee - MATH Semester 8', amount: 3300.00, description: 'Mathematics Tuition Fee - Semester 8', semester: 8, departmentId: 'dept-23' },
  // MCA (dept-24)
  { id: 'fee-133', name: 'Tuition Fee - MCA Semester 1', amount: 4800.00, description: 'MCA Tuition Fee - Semester 1', semester: 1, departmentId: 'dept-24' },
  { id: 'fee-134', name: 'Tuition Fee - MCA Semester 2', amount: 5000.00, description: 'MCA Tuition Fee - Semester 2', semester: 2, departmentId: 'dept-24' },
  { id: 'fee-135', name: 'Tuition Fee - MCA Semester 3', amount: 5200.00, description: 'MCA Tuition Fee - Semester 3', semester: 3, departmentId: 'dept-24' },
  { id: 'fee-136', name: 'Tuition Fee - MCA Semester 4', amount: 5400.00, description: 'MCA Tuition Fee - Semester 4', semester: 4, departmentId: 'dept-24' },
  // CSBS (dept-25)
  { id: 'fee-137', name: 'Tuition Fee - CSBS Semester 1', amount: 3800.00, description: 'CSBS Tuition Fee - Semester 1', semester: 1, departmentId: 'dept-25' },
  { id: 'fee-138', name: 'Tuition Fee - CSBS Semester 2', amount: 3900.00, description: 'CSBS Tuition Fee - Semester 2', semester: 2, departmentId: 'dept-25' },
  { id: 'fee-139', name: 'Tuition Fee - CSBS Semester 3', amount: 4000.00, description: 'CSBS Tuition Fee - Semester 3', semester: 3, departmentId: 'dept-25' },
  { id: 'fee-140', name: 'Tuition Fee - CSBS Semester 4', amount: 4100.00, description: 'CSBS Tuition Fee - Semester 4', semester: 4, departmentId: 'dept-25' },
  { id: 'fee-141', name: 'Tuition Fee - CSBS Semester 5', amount: 4200.00, description: 'CSBS Tuition Fee - Semester 5', semester: 5, departmentId: 'dept-25' },
  { id: 'fee-142', name: 'Tuition Fee - CSBS Semester 6', amount: 4300.00, description: 'CSBS Tuition Fee - Semester 6', semester: 6, departmentId: 'dept-25' },
  { id: 'fee-143', name: 'Tuition Fee - CSBS Semester 7', amount: 4400.00, description: 'CSBS Tuition Fee - Semester 7', semester: 7, departmentId: 'dept-25' },
  { id: 'fee-144', name: 'Tuition Fee - CSBS Semester 8', amount: 4500.00, description: 'CSBS Tuition Fee - Semester 8', semester: 8, departmentId: 'dept-25' }
];

export const initialFeePayments: FeePayment[] = [
  {
    id: 'pay-1',
    studentId: 's-1',
    feeStructureId: 'fee-35',
    amountPaid: 3800.00,
    paymentDate: '2026-06-10',
    paymentMethod: 'Credit Card',
    status: 'Paid',
    receiptNumber: 'RCPT-2026-90412'
  },
  {
    id: 'pay-2',
    studentId: 's-1',
    feeStructureId: 'fee-36',
    amountPaid: 3900.00,
    paymentDate: '2026-06-10',
    paymentMethod: 'Credit Card',
    status: 'Paid',
    receiptNumber: 'RCPT-2026-90413'
  },
  {
    id: 'pay-3',
    studentId: 's-2',
    feeStructureId: 'fee-35',
    amountPaid: 3800.00,
    paymentDate: '2026-06-11',
    paymentMethod: 'Net Banking',
    status: 'Paid',
    receiptNumber: 'RCPT-2026-90414'
  },
  {
    id: 'pay-4',
    studentId: 's-3',
    feeStructureId: 'fee-35',
    amountPaid: 1900.00,
    paymentDate: '2026-06-15',
    paymentMethod: 'UPI',
    status: 'Partial',
    receiptNumber: 'RCPT-2026-90551'
  },
  {
    id: 'pay-5',
    studentId: 's-4',
    feeStructureId: 'fee-35',
    amountPaid: 0.00,
    paymentDate: '',
    paymentMethod: '',
    status: 'Pending',
    receiptNumber: ''
  }
];

export const initialBooks: Book[] = [
  { id: 'b-1', title: 'Introduction to Algorithms', author: 'Cormen, Leiserson, Rivest, Stein', isbn: '978-0262033848', category: 'Computer Science', totalCopies: 12, availableCopies: 9 },
  { id: 'b-2', title: 'Database System Concepts', author: 'Silberschatz, Korth, Sudarshan', isbn: '978-0073523309', category: 'Computer Science', totalCopies: 8, availableCopies: 7 },
  { id: 'b-3', title: 'Introduction to the Theory of Computation', author: 'Michael Sipser', isbn: '978-1133187790', category: 'Computer Science', totalCopies: 5, availableCopies: 5 },
  { id: 'b-4', title: 'Computer Networking: A Top-Down Approach', author: 'Kurose, Ross', isbn: '978-0133594140', category: 'Computer Science', totalCopies: 10, availableCopies: 9 },
  { id: 'b-5', title: 'Signals and Systems', author: 'Oppenheim, Willsky, Hamid', isbn: '978-0138147570', category: 'Electrical', totalCopies: 6, availableCopies: 6 }
];

export const initialBookIssues: BookIssue[] = [
  { id: 'iss-1', bookId: 'b-1', studentId: 's-1', issueDate: '2026-06-20', dueDate: '2026-07-04', fineAmount: 0.0, status: 'Issued' },
  { id: 'iss-2', bookId: 'b-2', studentId: 's-2', issueDate: '2026-06-15', dueDate: '2026-06-29', returnDate: '2026-06-28', fineAmount: 0.0, status: 'Returned' },
  { id: 'iss-3', bookId: 'b-4', studentId: 's-3', issueDate: '2026-06-10', dueDate: '2026-06-24', fineAmount: 15.0, status: 'Overdue' }
];

export const initialTimetable: TimetableEntry[] = [
  { id: 'tt-1', courseId: 'c-1', dayOfWeek: 'Monday', startTime: '09:00', endTime: '10:30', room: 'Block A - 204', facultyId: 'f-1' }, // TOC
  { id: 'tt-2', courseId: 'c-2', dayOfWeek: 'Monday', startTime: '10:45', endTime: '12:15', room: 'Block A - 205', facultyId: 'f-2' }, // DBMS
  { id: 'tt-3', courseId: 'c-3', dayOfWeek: 'Tuesday', startTime: '09:00', endTime: '10:30', room: 'Block B - 101', facultyId: 'f-3' }, // EVS
  { id: 'tt-4', courseId: 'c-4', dayOfWeek: 'Wednesday', startTime: '09:00', endTime: '10:30', room: 'Block A - 204', facultyId: 'f-3' }, // IOS
  { id: 'tt-5', courseId: 'c-5', dayOfWeek: 'Wednesday', startTime: '10:45', endTime: '12:15', room: 'Block A - 205', facultyId: 'f-1' }, // WE
  { id: 'tt-6', courseId: 'c-6', dayOfWeek: 'Thursday', startTime: '13:30', endTime: '15:00', room: 'AI Lab', facultyId: 'f-4' }, // AIML
  { id: 'tt-7', courseId: 'c-1', dayOfWeek: 'Friday', startTime: '09:00', endTime: '10:30', room: 'Block B - 101', facultyId: 'f-1' } // TOC
];

export const initialAssignments: Assignment[] = [
  { id: 'asg-1', title: 'SQL Queries and Schema Design', description: 'Complete questions 1 to 15 regarding subqueries, joins, and relational algebra operations in the PDF.', courseId: 'c-2', dueDate: '2026-07-10', facultyId: 'f-2', maxMarks: 50 },
  { id: 'asg-2', title: 'Finite Automata Construction', description: 'Design DFAs and NFAs for regular languages specified in Chapter 1 problems.', courseId: 'c-1', dueDate: '2026-07-15', facultyId: 'f-1', maxMarks: 40 }
];

export const initialAssignmentSubmissions: AssignmentSubmission[] = [
  { id: 'sub-1', assignmentId: 'asg-1', studentId: 's-1', submissionDate: '2026-07-02', status: 'Submitted' },
  { id: 'sub-2', assignmentId: 'asg-1', studentId: 's-2', submissionDate: '2026-07-01', status: 'Graded', marksObtained: 46, feedback: 'Excellent work. Relational algebra notation is perfect.' }
];

export const initialNotices: Notice[] = [
  { id: 'not-1', title: 'End-Semester Exam Registration Open', content: 'All students are requested to complete their exam registrations and clear outstanding dues before July 15, 2026. Failures will attract processing penalties.', date: '2026-07-01', targetRole: 'All', authorName: 'Dr. Eleanor Vance' },
  { id: 'not-2', title: 'IT Faculty Review Meeting', content: 'There will be a mandatory CSE department review meeting tomorrow at 3:00 PM in Conference Room A regarding academic syllabus progress.', date: '2026-07-02', targetRole: 'Faculty', authorName: 'Dr. Eleanor Vance' },
  { id: 'not-3', title: 'Annual Library Stock Audit', content: 'Please note that the reference section will be closed from July 5th to July 7th due to the annual books audit. Issue services will remain active.', date: '2026-07-03', targetRole: 'All', authorName: 'Marcus Aurelius' }
];

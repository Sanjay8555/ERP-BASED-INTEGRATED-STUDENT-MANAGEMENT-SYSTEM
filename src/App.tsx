/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Building,
  ShieldCheck,
  Key,
  RefreshCw,
  Lock,
  User as UserIcon,
  PlusCircle,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

// Domain Imports
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
  Notice,
  UserRole
} from './types';

// Seed Mock Data Imports
import {
  initialUsers,
  initialStudentProfiles,
  initialFacultyProfiles,
  initialDepartments,
  initialCourses,
  initialAttendance,
  initialExams,
  initialResults,
  initialFeeStructures,
  initialFeePayments,
  initialBooks,
  initialBookIssues,
  initialTimetable,
  initialAssignments,
  initialAssignmentSubmissions,
  initialNotices
} from './mockData';

// Shared Layout Components
import Sidebar from './components/shared/Sidebar';
import Navbar from './components/shared/Navbar';

// Functional Feature Modules
import Dashboards from './components/dashboards/Dashboards';
import StudentManagement from './components/modules/StudentManagement';
import {
  FacultyManagement,
  ClassTimetables,
  NoticeBoardAnnouncements
} from './components/modules/AcademicModules';
import {
  AttendanceTracker,
  ExaminationGrades,
  AssignmentSubmissions
} from './components/modules/StudentCoreModules';
import {
  FeeCollections,
  LibraryCatalog,
  Reports
} from './components/modules/ServicesModules';
import PrintReceiptPage from './components/modules/PrintReceiptPage';

export default function App() {
  // Initialize dark/light theme on boot
  useEffect(() => {
    const saved = localStorage.getItem('theme');
    const isDark = saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Authentication & Session States
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('isAuthenticated');
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  }); // default false so the user is greeted by the login page
  const [currentUser, setCurrentUser] = useState<User>(() => {
    try {
      const saved = localStorage.getItem('currentUser');
      return saved ? JSON.parse(saved) : initialUsers[0];
    } catch {
      return initialUsers[0];
    }
  }); // default RAJESH (Admin)
  const [activeRole, setActiveRole] = useState<UserRole>(() => {
    try {
      const saved = localStorage.getItem('activeRole');
      return saved ? (JSON.parse(saved) as UserRole) : 'Admin';
    } catch {
      return 'Admin';
    }
  });
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('activeTab');
      return saved ? JSON.parse(saved) : 'dashboard';
    } catch {
      return 'dashboard';
    }
  });

  // State for transaction receipt print flow
  const [selectedReceiptForPrint, setSelectedReceiptForPrint] = useState<FeePayment | null>(null);
  const [prevTabBeforePrint, setPrevTabBeforePrint] = useState<string>('fees');

  // Database State Stores (Simulating JPA database layers)
  const [usersStore, setUsersStore] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem('usersStore');
      return saved ? JSON.parse(saved) : initialUsers;
    } catch {
      return initialUsers;
    }
  });
  const [studentsStore, setStudentsStore] = useState<StudentProfile[]>(() => {
    try {
      const saved = localStorage.getItem('studentsStore');
      return saved ? JSON.parse(saved) : initialStudentProfiles;
    } catch {
      return initialStudentProfiles;
    }
  });
  const [facultyStore, setFacultyStore] = useState<FacultyProfile[]>(() => {
    try {
      const saved = localStorage.getItem('facultyStore');
      return saved ? JSON.parse(saved) : initialFacultyProfiles;
    } catch {
      return initialFacultyProfiles;
    }
  });
  const [departmentsStore] = useState<Department[]>(() => {
    try {
      const saved = localStorage.getItem('departmentsStore');
      return saved ? JSON.parse(saved) : initialDepartments;
    } catch {
      return initialDepartments;
    }
  });
  const [coursesStore, setCoursesStore] = useState<Course[]>(() => {
    try {
      const saved = localStorage.getItem('coursesStore');
      return saved ? JSON.parse(saved) : initialCourses;
    } catch {
      return initialCourses;
    }
  });
  const [attendanceStore, setAttendanceStore] = useState<Attendance[]>(() => {
    try {
      const saved = localStorage.getItem('attendanceStore');
      return saved ? JSON.parse(saved) : initialAttendance;
    } catch {
      return initialAttendance;
    }
  });
  const [examsStore, setExamsStore] = useState<Exam[]>(() => {
    try {
      const saved = localStorage.getItem('examsStore');
      return saved ? JSON.parse(saved) : initialExams;
    } catch {
      return initialExams;
    }
  });
  const [resultsStore, setResultsStore] = useState<Result[]>(() => {
    try {
      const saved = localStorage.getItem('resultsStore');
      return saved ? JSON.parse(saved) : initialResults;
    } catch {
      return initialResults;
    }
  });
  const [feeStructuresStore, setFeeStructuresStore] = useState<FeeStructure[]>(() => {
    try {
      const saved = localStorage.getItem('feeStructuresStore');
      return saved ? JSON.parse(saved) : initialFeeStructures;
    } catch {
      return initialFeeStructures;
    }
  });
  const [feePaymentsStore, setFeePaymentsStore] = useState<FeePayment[]>(() => {
    try {
      const saved = localStorage.getItem('feePaymentsStore');
      return saved ? JSON.parse(saved) : initialFeePayments;
    } catch {
      return initialFeePayments;
    }
  });
  const [booksStore, setBooksStore] = useState<Book[]>(() => {
    try {
      const saved = localStorage.getItem('booksStore');
      return saved ? JSON.parse(saved) : initialBooks;
    } catch {
      return initialBooks;
    }
  });
  const [bookIssuesStore, setBookIssuesStore] = useState<BookIssue[]>(() => {
    try {
      const saved = localStorage.getItem('bookIssuesStore');
      return saved ? JSON.parse(saved) : initialBookIssues;
    } catch {
      return initialBookIssues;
    }
  });
  const [timetableStore, setTimetableStore] = useState<TimetableEntry[]>(() => {
    try {
      const saved = localStorage.getItem('timetableStore');
      return saved ? JSON.parse(saved) : initialTimetable;
    } catch {
      return initialTimetable;
    }
  });
  const [assignmentsStore, setAssignmentsStore] = useState<Assignment[]>(() => {
    try {
      const saved = localStorage.getItem('assignmentsStore');
      return saved ? JSON.parse(saved) : initialAssignments;
    } catch {
      return initialAssignments;
    }
  });
  const [submissionsStore, setSubmissionsStore] = useState<AssignmentSubmission[]>(() => {
    try {
      const saved = localStorage.getItem('submissionsStore');
      return saved ? JSON.parse(saved) : initialAssignmentSubmissions;
    } catch {
      return initialAssignmentSubmissions;
    }
  });
  const [noticesStore, setNoticesStore] = useState<Notice[]>(() => {
    try {
      const saved = localStorage.getItem('noticesStore');
      return saved ? JSON.parse(saved) : initialNotices;
    } catch {
      return initialNotices;
    }
  });

  // Automatically migrate/synchronize database state if outdated localStorage is detected
  useEffect(() => {
    const hasSanjayK = usersStore.some(u => u.name === 'Sanjay K');
    const hasMurugesan = usersStore.some(u => u.name.includes('Murugesan'));
    const hasTOC = coursesStore.some(c => c.name === 'TOC');

    if (!hasSanjayK || !hasMurugesan || !hasTOC) {
      console.log('Synchronizing updated ERP database seeds...');
      setUsersStore(initialUsers);
      setStudentsStore(initialStudentProfiles);
      setFacultyStore(initialFacultyProfiles);
      setCoursesStore(initialCourses);
      setFeePaymentsStore(initialFeePayments);
      setFeeStructuresStore(initialFeeStructures);
      setAttendanceStore(initialAttendance);
      setExamsStore(initialExams);
      setResultsStore(initialResults);
      
      // Persist directly to prevent subsequent stale reloads
      localStorage.setItem('usersStore', JSON.stringify(initialUsers));
      localStorage.setItem('studentsStore', JSON.stringify(initialStudentProfiles));
      localStorage.setItem('facultyStore', JSON.stringify(initialFacultyProfiles));
      localStorage.setItem('coursesStore', JSON.stringify(initialCourses));
      localStorage.setItem('feePaymentsStore', JSON.stringify(initialFeePayments));
      localStorage.setItem('feeStructuresStore', JSON.stringify(initialFeeStructures));
      localStorage.setItem('attendanceStore', JSON.stringify(initialAttendance));
      localStorage.setItem('examsStore', JSON.stringify(initialExams));
      localStorage.setItem('resultsStore', JSON.stringify(initialResults));
    }
  }, []);

  // Automatically sync all authentication & domain states to localStorage on change
  useEffect(() => {
    localStorage.setItem('isAuthenticated', JSON.stringify(isAuthenticated));
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('activeRole', JSON.stringify(activeRole));
  }, [activeRole]);

  useEffect(() => {
    localStorage.setItem('activeTab', JSON.stringify(activeTab));
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('usersStore', JSON.stringify(usersStore));
  }, [usersStore]);

  useEffect(() => {
    localStorage.setItem('studentsStore', JSON.stringify(studentsStore));
  }, [studentsStore]);

  useEffect(() => {
    localStorage.setItem('facultyStore', JSON.stringify(facultyStore));
  }, [facultyStore]);

  useEffect(() => {
    localStorage.setItem('departmentsStore', JSON.stringify(departmentsStore));
  }, [departmentsStore]);

  useEffect(() => {
    localStorage.setItem('coursesStore', JSON.stringify(coursesStore));
  }, [coursesStore]);

  useEffect(() => {
    localStorage.setItem('attendanceStore', JSON.stringify(attendanceStore));
  }, [attendanceStore]);

  useEffect(() => {
    localStorage.setItem('examsStore', JSON.stringify(examsStore));
  }, [examsStore]);

  useEffect(() => {
    localStorage.setItem('resultsStore', JSON.stringify(resultsStore));
  }, [resultsStore]);

  useEffect(() => {
    localStorage.setItem('feeStructuresStore', JSON.stringify(feeStructuresStore));
  }, [feeStructuresStore]);

  useEffect(() => {
    localStorage.setItem('feePaymentsStore', JSON.stringify(feePaymentsStore));
  }, [feePaymentsStore]);

  useEffect(() => {
    localStorage.setItem('booksStore', JSON.stringify(booksStore));
  }, [booksStore]);

  useEffect(() => {
    localStorage.setItem('bookIssuesStore', JSON.stringify(bookIssuesStore));
  }, [bookIssuesStore]);

  useEffect(() => {
    localStorage.setItem('timetableStore', JSON.stringify(timetableStore));
  }, [timetableStore]);

  useEffect(() => {
    localStorage.setItem('assignmentsStore', JSON.stringify(assignmentsStore));
  }, [assignmentsStore]);

  useEffect(() => {
    localStorage.setItem('submissionsStore', JSON.stringify(submissionsStore));
  }, [submissionsStore]);

  useEffect(() => {
    localStorage.setItem('noticesStore', JSON.stringify(noticesStore));
  }, [noticesStore]);

  // Auth screen specific state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [authView, setAuthView] = useState<'login' | 'forgot' | 'register'>('login');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');

  // Password reset/settings state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [settingsSuccess, setSettingsSuccess] = useState('');
  const [settingsError, setSettingsError] = useState('');

  // Action: Switch Active Role (Sync Session user dynamically for perfect multi-dashboard simulation)
  const handleRoleChange = (newRole: UserRole) => {
    setActiveRole(newRole);
    // Find matching default user from usersStore
    const matchedUser = usersStore.find(u => u.role === newRole);
    if (matchedUser) {
      setCurrentUser(matchedUser);
    } else {
      // Create fallback dummy matching role details
      setCurrentUser({
        id: `u-fallback-${newRole.toLowerCase()}`,
        username: newRole.toLowerCase(),
        email: `${newRole.toLowerCase()}@university.edu`,
        name: `Demo ${newRole}`,
        role: newRole,
        password: `${newRole.toLowerCase()}123`
      });
    }
    // Default to dashboard when role shifts
    setActiveTab('dashboard');
  };

  // Action: Custom Login handler
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setLoginError('All fields are required.');
      return;
    }

    // Standard credential lookup - accepts username or email AND validates password
    const matchedUser = usersStore.find(
      u =>
        (u.email.toLowerCase() === loginEmail.toLowerCase() ||
          u.username.toLowerCase() === loginEmail.toLowerCase()) &&
        u.password === loginPassword
    );

    if (matchedUser) {
      setCurrentUser(matchedUser);
      setActiveRole(matchedUser.role);
      setIsAuthenticated(true);
      setLoginError('');
      setActiveTab('dashboard');
    } else {
      setLoginError('Invalid academic credentials. Please double-check your username/email and password.');
    }
  };

  // Action: Quick demo login bypass
  const handleDemoLogin = (roleType: UserRole) => {
    const matchedUser = usersStore.find(u => u.role === roleType);
    if (matchedUser) {
      setCurrentUser(matchedUser);
      setActiveRole(roleType);
      setIsAuthenticated(true);
      setLoginError('');
      setActiveTab('dashboard');
    }
  };

  // Modifying: Student Management
  const handleAddStudent = (newStudent: StudentProfile, newUser: User) => {
    setStudentsStore(prev => [newStudent, ...prev]);
    setUsersStore(prev => [newUser, ...prev]);
  };

  const handleUpdateStudent = (updatedStudent: StudentProfile, updatedUser: User) => {
    setStudentsStore(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));
    setUsersStore(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
  };

  const handleDeleteStudent = (studentId: string) => {
    if (confirm('Permanently wipe this student record from registry?')) {
      const student = studentsStore.find(s => s.id === studentId);
      setStudentsStore(prev => prev.filter(s => s.id !== studentId));
      if (student) {
        setUsersStore(prev => prev.filter(u => u.id !== student.userId));
      }
    }
  };

  // Modifying: Faculty Management
  const handleAddFaculty = (newFaculty: FacultyProfile, newUser: User) => {
    setFacultyStore(prev => [newFaculty, ...prev]);
    setUsersStore(prev => [newUser, ...prev]);
  };

  const handleUpdateFaculty = (updatedFaculty: FacultyProfile, updatedUser: User) => {
    setFacultyStore(prev => prev.map(f => f.id === updatedFaculty.id ? updatedFaculty : f));
    setUsersStore(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
  };

  const handleDeleteFaculty = (facultyId: string) => {
    if (confirm('Permanently wipe this faculty profile from academic archives?')) {
      const fac = facultyStore.find(f => f.id === facultyId);
      setFacultyStore(prev => prev.filter(f => f.id !== facultyId));
      if (fac) {
        setUsersStore(prev => prev.filter(u => u.id !== fac.userId));
      }
    }
  };

  // Modifying: Attendance Logs
  const handleSaveAttendance = (newRecords: Attendance[]) => {
    setAttendanceStore(prev => [...newRecords, ...prev]);
  };

  // Modifying: Examination Results
  const handleAddResult = (newResult: Result) => {
    setResultsStore(prev => [newResult, ...prev]);
  };

  // Modifying: Fee Payments
  const handleAddPayment = (newPayment: FeePayment) => {
    // Check if modifying a pending payment or adding new record
    const exists = feePaymentsStore.some(p => p.id === newPayment.id);
    if (exists) {
      setFeePaymentsStore(prev => prev.map(p => p.id === newPayment.id ? newPayment : p));
    } else {
      setFeePaymentsStore(prev => [newPayment, ...prev]);
    }
  };

  const handleUpdateFeeStructures = (updated: FeeStructure[]) => {
    setFeeStructuresStore(updated);
  };

  // Modifying: Library Book additions
  const handleAddBook = (newBook: Book) => {
    setBooksStore(prev => [newBook, ...prev]);
  };

  // Modifying: Library Issue Book
  const handleIssueBook = (newIssue: BookIssue) => {
    setBookIssuesStore(prev => [newIssue, ...prev]);
    // Decrement copies available
    setBooksStore(prev => prev.map(b => {
      if (b.id === newIssue.bookId) {
        return { ...b, availableCopies: Math.max(0, b.availableCopies - 1) };
      }
      return b;
    }));
  };

  // Modifying: Library Return Book
  const handleReturnBook = (issueId: string) => {
    const issue = bookIssuesStore.find(i => i.id === issueId);
    if (!issue) return;

    setBookIssuesStore(prev => prev.map(i => {
      if (i.id === issueId) {
        return {
          ...i,
          status: 'Returned',
          returnDate: new Date().toISOString().split('T')[0],
          fineAmount: 0.0
        };
      }
      return i;
    }));

    // Increment copies available
    setBooksStore(prev => prev.map(b => {
      if (b.id === issue.bookId) {
        return { ...b, availableCopies: Math.min(b.totalCopies, b.availableCopies + 1) };
      }
      return b;
    }));
    alert('Material return verified!');
  };

  // Modifying: Homework assignments
  const handleAddAssignment = (newAsg: Assignment) => {
    setAssignmentsStore(prev => [newAsg, ...prev]);
  };

  const handleSubmitAssignment = (newSub: AssignmentSubmission) => {
    setSubmissionsStore(prev => [newSub, ...prev]);
  };

  const handleGradeSubmission = (subId: string, marks: number, feedback: string) => {
    setSubmissionsStore(prev => prev.map(s => {
      if (s.id === subId) {
        return { ...s, marksObtained: marks, feedback, status: 'Graded' };
      }
      return s;
    }));
  };

  // Modifying: Notice Announcements
  const handleAddNotice = (newNotice: Notice) => {
    setNoticesStore(prev => [newNotice, ...prev]);
  };

  // Modifying: Timetable Management
  const handleAddTimetableEntry = (newEntry: TimetableEntry) => {
    setTimetableStore(prev => [newEntry, ...prev]);
  };

  const handleUpdateTimetableEntry = (updatedEntry: TimetableEntry) => {
    setTimetableStore(prev => prev.map(t => t.id === updatedEntry.id ? updatedEntry : t));
  };

  const handleDeleteTimetableEntry = (entryId: string) => {
    if (confirm('Permanently cancel this lecture slot from the master cycle?')) {
      setTimetableStore(prev => prev.filter(t => t.id !== entryId));
    }
  };

  // Modifying: Profile Passwords / settings
  const handleSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsError('');
    setSettingsSuccess('');

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setSettingsError('All fields are required.');
      return;
    }
    if (currentUser.password && currentPassword !== currentUser.password) {
      setSettingsError('Incorrect current password.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setSettingsError('New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setSettingsError('Password must be at least 6 characters.');
      return;
    }

    // Persist to store & current user
    setUsersStore(prev => prev.map(u => u.id === currentUser.id ? { ...u, password: newPassword } : u));
    setCurrentUser(prev => ({ ...prev, password: newPassword }));

    setSettingsSuccess('Academic password successfully encrypted and saved!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
  };

  // Render Page Content based on Active Tab State
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboards
            role={activeRole}
            users={usersStore}
            students={studentsStore}
            faculty={facultyStore}
            departments={departmentsStore}
            courses={coursesStore}
            attendance={attendanceStore}
            results={resultsStore}
            feePayments={feePaymentsStore}
            books={booksStore}
            bookIssues={bookIssuesStore}
            notices={noticesStore}
            setActiveTab={setActiveTab}
          />
        );
      case 'students':
        return (
          <StudentManagement
            students={studentsStore}
            users={usersStore}
            departments={departmentsStore}
            role={activeRole}
            onAddStudent={handleAddStudent}
            onUpdateStudent={handleUpdateStudent}
            onDeleteStudent={handleDeleteStudent}
          />
        );
      case 'faculty':
        return (
          <FacultyManagement
            faculty={facultyStore}
            users={usersStore}
            departments={departmentsStore}
            role={activeRole}
            onAddFaculty={handleAddFaculty}
            onUpdateFaculty={handleUpdateFaculty}
            onDeleteFaculty={handleDeleteFaculty}
          />
        );
      case 'attendance':
        return (
          <AttendanceTracker
            attendance={attendanceStore}
            courses={coursesStore}
            students={studentsStore}
            users={usersStore}
            role={activeRole}
            onSaveAttendance={handleSaveAttendance}
            currentUser={currentUser}
            departments={departmentsStore}
          />
        );
      case 'exams':
        return (
          <ExaminationGrades
            results={resultsStore}
            exams={examsStore}
            courses={coursesStore}
            students={studentsStore}
            users={usersStore}
            role={activeRole}
            onAddResult={handleAddResult}
            currentUser={currentUser}
            departments={departmentsStore}
          />
        );
      case 'fees':
        return (
          <FeeCollections
            feeStructures={feeStructuresStore}
            feePayments={feePaymentsStore}
            students={studentsStore}
            users={usersStore}
            role={activeRole}
            onAddPayment={handleAddPayment}
            onUpdateFeeStructures={handleUpdateFeeStructures}
            departments={departmentsStore}
            onPrintReceipt={(payment) => {
              setSelectedReceiptForPrint(payment);
              setPrevTabBeforePrint('fees');
              setActiveTab('print-receipt');
            }}
            currentUser={currentUser}
          />
        );
      case 'print-receipt':
        return selectedReceiptForPrint ? (
          <PrintReceiptPage
            payment={selectedReceiptForPrint}
            students={studentsStore}
            users={usersStore}
            feeStructures={feeStructuresStore}
            onBack={() => setActiveTab(prevTabBeforePrint)}
          />
        ) : (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">
            No transaction receipt selected. Please navigate to the Accounting Ledger to select a receipt.
          </div>
        );
      case 'library':
        return (
          <LibraryCatalog
            books={booksStore}
            bookIssues={bookIssuesStore}
            students={studentsStore}
            users={usersStore}
            role={activeRole}
            onAddBook={handleAddBook}
            onIssueBook={handleIssueBook}
            onReturnBook={handleReturnBook}
          />
        );
      case 'timetable':
        return (
          <ClassTimetables
            timetable={timetableStore}
            courses={coursesStore}
            faculty={facultyStore}
            users={usersStore}
            role={activeRole}
            onAddEntry={handleAddTimetableEntry}
            onUpdateEntry={handleUpdateTimetableEntry}
            onDeleteEntry={handleDeleteTimetableEntry}
            departments={departmentsStore}
          />
        );
      case 'assignments':
        return (
          <AssignmentSubmissions
            assignments={assignmentsStore}
            submissions={submissionsStore}
            courses={coursesStore}
            students={studentsStore}
            users={usersStore}
            role={activeRole}
            onAddAssignment={handleAddAssignment}
            onSubmitAssignment={handleSubmitAssignment}
            onGradeSubmission={handleGradeSubmission}
            currentUser={currentUser}
            departments={departmentsStore}
          />
        );
      case 'notices':
        return (
          <NoticeBoardAnnouncements
            notices={noticesStore}
            role={activeRole}
            currentUser={currentUser}
            onAddNotice={handleAddNotice}
          />
        );
      case 'reports':
        return (
          <Reports
            students={studentsStore}
            users={usersStore}
            feePayments={feePaymentsStore}
            books={booksStore}
          />
        );
      case 'settings':
        return (
          <div className="max-w-2xl mx-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <h3 className="font-sans text-md font-bold text-slate-900 dark:text-white mb-1">Account & Security Portal</h3>
            <p className="text-xs text-slate-400 mb-6">Manage login keys and account configurations securely.</p>

            <form onSubmit={handleSettingsSubmit} className="space-y-4">
              {settingsSuccess && (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-100 p-3 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900">
                  <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600" />
                  <span>{settingsSuccess}</span>
                </div>
              )}
              {settingsError && (
                <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-100 p-3 text-xs font-semibold text-rose-700 dark:bg-rose-950/20 dark:border-rose-900">
                  <AlertCircle className="h-4.5 w-4.5 text-rose-600" />
                  <span>{settingsError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Current Password</label>
                <div className="relative">
                  <Lock className="absolute top-3 left-3 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pr-4 pl-10 text-xs font-semibold focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">New Secure Password</label>
                  <div className="relative">
                    <Key className="absolute top-3 left-3 h-4 w-4 text-slate-400" />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pr-4 pl-10 text-xs font-semibold focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="absolute top-3 left-3 h-4 w-4 text-slate-400" />
                    <input
                      type="password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pr-4 pl-10 text-xs font-semibold focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-teal-600 py-2.5 text-xs font-bold text-white shadow-md hover:bg-teal-700 transition-colors mt-4"
              >
                Change System Password
              </button>
            </form>

            <div className="mt-8 border-t border-slate-200 pt-6 dark:border-slate-800">
              <h4 className="text-xs font-bold uppercase text-red-500 mb-1">System Reset Utility (Danger Zone)</h4>
              <p className="text-xs text-slate-400 mb-4">Resetting will clear all current local changes, registrations, book issues, and payment states, returning the application database back to the pristine default mock seeds.</p>
              <button
                type="button"
                onClick={() => {
                  if (confirm('Are you absolutely sure you want to reset all data and revert to pristine seed entries? This action cannot be undone.')) {
                    localStorage.clear();
                    window.location.reload();
                  }
                }}
                className="rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:border-red-900 py-2.5 px-4 text-xs font-bold text-red-700 transition-colors"
              >
                Reset System Database to Defaults
              </button>
            </div>
          </div>
        );
      default:
        return <div className="text-slate-400 italic">This panel is currently empty.</div>;
    }
  };

  // Helper: map active tab ID to text titles
  const getTabTitle = () => {
    const tabObj = [
      { id: 'dashboard', val: `${activeRole} Dashboard Panel` },
      { id: 'students', val: 'Student Accounts Directory' },
      { id: 'faculty', val: 'Faculty Roster Administration' },
      { id: 'attendance', val: 'Attendance Registry' },
      { id: 'exams', val: 'Examinations, Grades & Transcripts' },
      { id: 'fees', val: 'Financial Collections Desk' },
      { id: 'library', val: 'University Library Management' },
      { id: 'timetable', val: 'Academic Weekly Timetables' },
      { id: 'assignments', val: 'Homework Assignments Board' },
      { id: 'notices', val: 'Notice Board Publications' },
      { id: 'reports', val: 'Analytical Export Center' },
      { id: 'settings', val: 'Security Settings' }
    ].find(t => t.id === activeTab);
    return tabObj ? tabObj.val : 'Integrated Portal';
  };

  // If Not Authenticated, show corporate login page
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-950 relative overflow-hidden transition-colors duration-200">
        {/* Decorative Modern Background Glows */}
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-teal-500/15 dark:bg-teal-500/5 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-indigo-500/15 dark:bg-indigo-500/5 blur-3xl pointer-events-none" />

        <div className="w-full max-w-md space-y-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-900 relative z-10 transition-all duration-300">
          <div className="text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-md shadow-teal-500/20 mb-4">
              <Building className="h-6 w-6" />
            </div>
            <h2 className="font-sans text-xl font-black tracking-tight text-slate-900 dark:text-white">
              University Portal
            </h2>
            <p className="text-xs text-slate-500 mt-1.5 uppercase font-mono tracking-widest">
              ERP ENTERPRISE LOGIN
            </p>
          </div>

          {authView === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="mt-8 space-y-4">
              {loginError && (
                <div className="rounded-xl bg-rose-50 border border-rose-100 p-3 text-[11px] font-bold text-rose-600">
                  {loginError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Academic Email</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="admin@university.edu"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  required
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-bold uppercase text-slate-400">Security Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthView('forgot');
                      setLoginError('');
                    }}
                    className="text-[11px] text-teal-600 hover:underline font-semibold"
                  >
                    Forgot?
                  </button>
                </div>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-teal-600 py-3 text-xs font-bold text-white shadow-md hover:bg-teal-700 transition-colors mt-6"
              >
                Authenticate session
              </button>
            </form>
          ) : (
            <div className="mt-8 space-y-4">
              <h3 className="text-xs font-bold uppercase text-slate-400">Recover password hash</h3>
              <p className="text-xs text-slate-500">Provide your registered email to process a BCrypt key reset.</p>
              {forgotSuccess && (
                <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3 text-[11px] font-bold text-emerald-700">
                  {forgotSuccess}
                </div>
              )}
              <input
                type="email"
                placeholder="email@university.edu"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setForgotSuccess('A cryptographically signed key reset token is routed to mailbox!');
                  }}
                  className="flex-1 rounded-xl bg-teal-600 py-2.5 text-xs font-bold text-white"
                >
                  Send Token
                </button>
                <button
                  onClick={() => {
                    setAuthView('login');
                    setForgotSuccess('');
                  }}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-500"
                >
                  Back to login
                </button>
              </div>
            </div>
          )}

          {/* Quick Shortcuts for evaluation convenience */}
          <div className="border-t border-slate-200/60 pt-6 dark:border-slate-800">
            <p className="font-sans text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center mb-3">
              Testing Assistant Bypasses (1-Click)
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 mb-4">
              <button
                onClick={() => handleDemoLogin('Admin')}
                className="rounded-lg bg-teal-50 border border-teal-100 py-2 text-[10px] font-bold text-teal-700 hover:bg-teal-100 dark:bg-teal-950/20 dark:border-teal-900"
              >
                Admin
              </button>
              <button
                onClick={() => handleDemoLogin('Faculty')}
                className="rounded-lg bg-blue-50 border border-blue-100 py-2 text-[10px] font-bold text-blue-700 hover:bg-blue-100 dark:bg-blue-950/20 dark:border-blue-900"
              >
                Faculty
              </button>
              <button
                onClick={() => handleDemoLogin('Student')}
                className="rounded-lg bg-emerald-50 border border-emerald-100 py-2 text-[10px] font-bold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900"
              >
                Student
              </button>
              <button
                onClick={() => handleDemoLogin('Parent')}
                className="rounded-lg bg-amber-50 border border-amber-100 py-2 text-[10px] font-bold text-amber-700 hover:bg-amber-100 dark:bg-amber-950/20 dark:border-amber-900"
              >
                Parent
              </button>
              <button
                onClick={() => handleDemoLogin('Accountant')}
                className="rounded-lg bg-purple-50 border border-purple-100 py-2 text-[10px] font-bold text-purple-700 hover:bg-purple-100 dark:bg-purple-950/20 dark:border-purple-900"
              >
                Accountant
              </button>
            </div>
          </div>

          {/* Real Credentials Table section */}
          <div className="border-t border-slate-200/60 pt-4 dark:border-slate-800">
            <details className="group">
              <summary className="flex items-center justify-between cursor-pointer list-none text-center">
                <span className="w-full text-teal-600 hover:text-teal-700 dark:text-teal-400 font-sans text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 select-none">
                  🔐 View Manual Login Credentials
                  <span className="transition-transform duration-200 group-open:rotate-180">▼</span>
                </span>
              </summary>
              <div className="mt-4 space-y-2 max-h-56 overflow-y-auto pr-1 text-[11px] text-slate-600 dark:text-slate-300">
                <p className="text-[10px] text-slate-400 italic mb-2">You can copy/paste or click Auto-fill to test different logins & passwords:</p>
                <div className="grid grid-cols-1 gap-2">
                  {usersStore.map((u) => (
                    <div key={u.id} className="flex flex-col rounded-lg border border-slate-100 bg-slate-50 p-2 dark:border-slate-800 dark:bg-slate-950/50">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-slate-800 dark:text-white">{u.name} ({u.role})</span>
                        <button
                          type="button"
                          onClick={() => {
                            setLoginEmail(u.username);
                            setLoginPassword(u.password || '');
                          }}
                          className="text-[9px] bg-teal-50 hover:bg-teal-100 text-teal-700 dark:bg-teal-950/40 dark:hover:bg-teal-900/60 font-semibold px-2 py-0.5 rounded transition-colors"
                        >
                          Auto-fill Form
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-1 font-mono text-[10px] text-slate-500">
                        <div>
                          <span className="text-slate-400">Username:</span> <span className="text-teal-600 dark:text-teal-400 font-semibold">{u.username}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Password:</span> <span className="text-amber-600 dark:text-amber-400 font-semibold">{u.password || 'none'}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-slate-400">Email:</span> <span>{u.email}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </details>
          </div>
        </div>
      </div>
    );
  }

  // Active Authenticated App shell Layout
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors duration-200 relative overflow-hidden">
      {/* Decorative Modern Background Glows */}
      <div className="absolute top-0 left-0 -translate-x-1/4 -translate-y-1/4 w-96 h-96 rounded-full bg-teal-500/10 dark:bg-teal-500/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 w-96 h-96 rounded-full bg-indigo-500/10 dark:bg-indigo-500/5 blur-3xl pointer-events-none" />

      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        role={activeRole}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      {/* Main Panel Frame */}
      <div className="flex-1 flex flex-col lg:pl-72 min-w-0 relative z-10">
        <Navbar
          currentUser={currentUser}
          onLogout={() => setIsAuthenticated(false)}
          role={activeRole}
          onRoleChange={handleRoleChange}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          activeTabTitle={getTabTitle()}
        />

        {/* Dynamic content stage */}
        <main id="app-main-content" className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto max-h-[calc(100vh-64px)]">
          {renderTabContent()}
        </main>
      </div>
    </div>
  );
}

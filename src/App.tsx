import React, { useState, useEffect, useRef } from 'react';
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
  AlertCircle,
  Camera,
  Copy,
  Check,
  KeyRound,
  Terminal,
  ArrowRight,
  Sparkles,
  Eye,
  EyeOff
} from 'lucide-react';
import ProfilePhotoModal from './components/shared/ProfilePhotoModal';
import { fetchBackendState, saveBackendState, subscribeToRealtimeSync } from './services/apiSync';
import {
  generateBCryptResetKeyDetails,
  generateBCryptHash,
  BCryptResetKeyDetails
} from './utils/bcryptSecurity';

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
import LeetCodeTracker from './components/modules/LeetCodeTracker';
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
import SettingsModule from './components/modules/SettingsModule';

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
      const parsed = saved ? JSON.parse(saved) : null;
      if (parsed?.username === 'admin') {
        return { ...initialUsers[0], ...parsed, name: 'RAJESH', role: 'Admin' };
      }
      return parsed || initialUsers[0];
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

  // Seed initial stores if local state is completely empty
  useEffect(() => {
    if (!usersStore || usersStore.length === 0) {
      setUsersStore(initialUsers);
      safeLocalStorageSet('usersStore', JSON.stringify(initialUsers));
    }
  }, []);

  // Safe localStorage helper function to protect against QuotaExceededError exceptions
  function safeLocalStorageSet(key: string, value: string) {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn(`[LocalStorage] Skip persistent cache for "${key}" (Quota limit reached).`, e);
    }
  }

  // Automatically sync all authentication & domain states to localStorage on change
  useEffect(() => {
    safeLocalStorageSet('isAuthenticated', JSON.stringify(isAuthenticated));
  }, [isAuthenticated]);

  useEffect(() => {
    safeLocalStorageSet('currentUser', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    safeLocalStorageSet('activeRole', JSON.stringify(activeRole));
  }, [activeRole]);

  useEffect(() => {
    safeLocalStorageSet('activeTab', JSON.stringify(activeTab));
  }, [activeTab]);

  useEffect(() => {
    safeLocalStorageSet('usersStore', JSON.stringify(usersStore));
  }, [usersStore]);

  useEffect(() => {
    safeLocalStorageSet('studentsStore', JSON.stringify(studentsStore));
  }, [studentsStore]);

  useEffect(() => {
    safeLocalStorageSet('facultyStore', JSON.stringify(facultyStore));
  }, [facultyStore]);

  useEffect(() => {
    safeLocalStorageSet('departmentsStore', JSON.stringify(departmentsStore));
  }, [departmentsStore]);

  useEffect(() => {
    safeLocalStorageSet('coursesStore', JSON.stringify(coursesStore));
  }, [coursesStore]);

  useEffect(() => {
    safeLocalStorageSet('attendanceStore', JSON.stringify(attendanceStore));
  }, [attendanceStore]);

  useEffect(() => {
    safeLocalStorageSet('examsStore', JSON.stringify(examsStore));
  }, [examsStore]);

  useEffect(() => {
    safeLocalStorageSet('resultsStore', JSON.stringify(resultsStore));
  }, [resultsStore]);

  useEffect(() => {
    safeLocalStorageSet('feeStructuresStore', JSON.stringify(feeStructuresStore));
  }, [feeStructuresStore]);

  useEffect(() => {
    safeLocalStorageSet('feePaymentsStore', JSON.stringify(feePaymentsStore));
  }, [feePaymentsStore]);

  useEffect(() => {
    safeLocalStorageSet('booksStore', JSON.stringify(booksStore));
  }, [booksStore]);

  useEffect(() => {
    safeLocalStorageSet('bookIssuesStore', JSON.stringify(bookIssuesStore));
  }, [bookIssuesStore]);

  useEffect(() => {
    safeLocalStorageSet('timetableStore', JSON.stringify(timetableStore));
  }, [timetableStore]);

  useEffect(() => {
    safeLocalStorageSet('assignmentsStore', JSON.stringify(assignmentsStore));
  }, [assignmentsStore]);

  useEffect(() => {
    safeLocalStorageSet('submissionsStore', JSON.stringify(submissionsStore));
  }, [submissionsStore]);

  useEffect(() => {
    safeLocalStorageSet('noticesStore', JSON.stringify(noticesStore));
  }, [noticesStore]);

  // Ref to prevent circular echo re-triggers during incoming cloud updates
  const isRemoteUpdatingRef = useRef(false);
  const isInitialMountRef = useRef(true);

  // Load initial backend state & subscribe to real-time SSE stream across devices
  useEffect(() => {
    const applyCloudState = (cloudData: any) => {
      isRemoteUpdatingRef.current = true;
      if (cloudData.usersStore?.length) setUsersStore(cloudData.usersStore);
      if (cloudData.studentsStore?.length) setStudentsStore(cloudData.studentsStore);
      if (cloudData.facultyStore?.length) setFacultyStore(cloudData.facultyStore);
      if (cloudData.coursesStore?.length) setCoursesStore(cloudData.coursesStore);
      if (cloudData.feePaymentsStore?.length) setFeePaymentsStore(cloudData.feePaymentsStore);
      if (cloudData.feeStructuresStore?.length) setFeeStructuresStore(cloudData.feeStructuresStore);
      if (cloudData.booksStore?.length) setBooksStore(cloudData.booksStore);
      if (cloudData.bookIssuesStore?.length) setBookIssuesStore(cloudData.bookIssuesStore);
      if (cloudData.noticesStore?.length) setNoticesStore(cloudData.noticesStore);
      if (cloudData.timetableStore?.length) setTimetableStore(cloudData.timetableStore);
      if (cloudData.examsStore?.length) setExamsStore(cloudData.examsStore);
      if (cloudData.assignmentsStore?.length) setAssignmentsStore(cloudData.assignmentsStore);
      if (cloudData.submissionsStore?.length) setSubmissionsStore(cloudData.submissionsStore);

      // Release remote lock immediately after React state updates are scheduled
      setTimeout(() => {
        isRemoteUpdatingRef.current = false;
      }, 50);
    };

    // 1. Initial Cloud Sync Fetch
    fetchBackendState().then(cloudData => {
      if (cloudData) {
        applyCloudState(cloudData);
      }
    });

    // 2. Real-Time Cross-Device SSE Subscription
    const unsubscribe = subscribeToRealtimeSync((cloudData) => {
      applyCloudState(cloudData);
    });

    return () => unsubscribe();
  }, []);

  // Sync local changes to cloud backend whenever local stores update
  useEffect(() => {
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      return;
    }
    if (isRemoteUpdatingRef.current) return;

    const syncPayload = {
      usersStore,
      studentsStore,
      facultyStore,
      departmentsStore: initialDepartments,
      coursesStore,
      feePaymentsStore,
      feeStructuresStore,
      booksStore,
      bookIssuesStore,
      noticesStore,
      timetableStore,
      gradesStore: resultsStore,
      attendanceStore,
      examsStore,
      assignmentsStore,
      submissionsStore
    };
    saveBackendState(syncPayload);
  }, [
    usersStore,
    studentsStore,
    facultyStore,
    coursesStore,
    feePaymentsStore,
    feeStructuresStore,
    booksStore,
    bookIssuesStore,
    noticesStore,
    timetableStore,
    resultsStore,
    attendanceStore,
    examsStore,
    assignmentsStore,
    submissionsStore
  ]);

  // Auth screen specific state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [authView, setAuthView] = useState<'login' | 'forgot' | 'register'>('login');
  const [forgotEmail, setForgotEmail] = useState('admin@university.edu');

  // BCrypt Key Reset State
  const [bcryptResetDetails, setBcryptResetDetails] = useState<BCryptResetKeyDetails | null>(null);
  const [isResettingKey, setIsResettingKey] = useState(false);
  const [bcryptError, setBcryptError] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [customNewPassword, setCustomNewPassword] = useState('');
  const [showCustomPassword, setShowCustomPassword] = useState(false);
  const [customPasswordSuccess, setCustomPasswordSuccess] = useState('');
  const [showSetCustomForm, setShowSetCustomForm] = useState(false);

  const handleCopyText = (text: string, field: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleExecuteBCryptReset = async (overrideEmail?: string) => {
    const emailToProcess = (overrideEmail || forgotEmail).trim().toLowerCase();
    setBcryptError('');
    setCustomPasswordSuccess('');

    if (!emailToProcess) {
      setBcryptError('Please provide or select a registered academic email address.');
      return;
    }

    setIsResettingKey(true);

    // 1. Find user in local store
    let targetUser = usersStore.find(
      u => u && ((u.email && u.email.toLowerCase() === emailToProcess) || (u.username && u.username.toLowerCase() === emailToProcess))
    );

    let targetStudent = null;

    if (!targetUser) {
      targetStudent = studentsStore.find(
        s => s && s.parentEmail && s.parentEmail.toLowerCase() === emailToProcess
      );
    }

    if (!targetUser && !targetStudent) {
      setIsResettingKey(false);
      setBcryptError('No registered account found with this academic email address.');
      return;
    }

    try {
      // Attempt backend API call
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToProcess })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.details) {
          setBcryptResetDetails(data.details);
          // Sync local state
          if (targetUser) {
            setUsersStore(prev => prev.map(u => u.id === targetUser!.id ? { ...u, password: data.details.tempPassword } : u));
          } else if (targetStudent) {
            setStudentsStore(prev => prev.map(s => s.id === targetStudent!.id ? { ...s, parentPassword: data.details.tempPassword } : s));
          }
          setIsResettingKey(false);
          return;
        }
      }
    } catch (e) {
      // Proceed with deterministic client generator
    }

    // Client-side fallback generation
    const fallbackUser = targetUser || {
      email: targetStudent!.parentEmail,
      name: targetStudent!.parentName || 'Parent Guardian',
      username: 'parent',
      role: 'Parent' as UserRole
    };

    const details = generateBCryptResetKeyDetails(fallbackUser);
    setBcryptResetDetails(details);

    if (targetUser) {
      setUsersStore(prev => prev.map(u => u.id === targetUser!.id ? { ...u, password: details.tempPassword } : u));
    } else if (targetStudent) {
      setStudentsStore(prev => prev.map(s => s.id === targetStudent!.id ? { ...s, parentPassword: details.tempPassword } : s));
    }

    setIsResettingKey(false);
  };

  const handleApplyResetAndLogin = (detailsToLogin?: BCryptResetKeyDetails) => {
    const details = detailsToLogin || bcryptResetDetails;
    if (!details) return;

    let matchedUser = usersStore.find(
      u => u && u.email && u.email.toLowerCase() === details.email.toLowerCase()
    );

    if (!matchedUser && details.role === 'Parent') {
      const parentStudent = studentsStore.find(
        s => s && s.parentEmail && s.parentEmail.toLowerCase() === details.email.toLowerCase()
      );
      if (parentStudent) {
        matchedUser = {
          id: `u-parent-${parentStudent.id}`,
          username: (parentStudent.parentEmail || 'parent').split('@')[0],
          email: parentStudent.parentEmail,
          password: details.tempPassword,
          name: parentStudent.parentName || 'Parent Guardian',
          role: 'Parent',
          phone: parentStudent.parentPhone || '',
          photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120'
        };
      }
    }

    if (matchedUser) {
      setCurrentUser(matchedUser);
      setActiveRole(matchedUser.role);
      setIsAuthenticated(true);
      setAuthView('login');
      setActiveTab('dashboard');
    }
  };

  const handleSaveCustomPasswordAndLogin = async () => {
    if (!bcryptResetDetails || !customNewPassword) {
      setBcryptError('Please enter a new password.');
      return;
    }

    const newPass = customNewPassword.trim();
    if (newPass.length < 4) {
      setBcryptError('Password must be at least 4 characters.');
      return;
    }

    const newHash = generateBCryptHash(newPass, 12);

    try {
      await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: bcryptResetDetails.email,
          newPassword: newPass,
          resetToken: bcryptResetDetails.resetToken
        })
      });
    } catch (e) {}

    // Update local user store
    setUsersStore(prev => prev.map(u => u.email.toLowerCase() === bcryptResetDetails.email.toLowerCase() ? { ...u, password: newPass } : u));
    setStudentsStore(prev => prev.map(s => s.parentEmail && s.parentEmail.toLowerCase() === bcryptResetDetails.email.toLowerCase() ? { ...s, parentPassword: newPass } : s));

    setCustomPasswordSuccess('Password updated with new BCrypt hash! Logging in...');
    setTimeout(() => {
      handleApplyResetAndLogin({ ...bcryptResetDetails, tempPassword: newPass, bcryptKey: newHash });
    }, 600);
  };

  // Action: Update User Photo
  const handleUpdateUserPhoto = (userId: string, newPhotoUrl: string) => {
    setUsersStore(prev => prev.map(u => u.id === userId ? { ...u, photo: newPhotoUrl } : u));
    if (currentUser.id === userId) {
      setCurrentUser(prev => ({ ...prev, photo: newPhotoUrl }));
    }
  };

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

    const searchEmail = loginEmail.trim().toLowerCase();

    // 1. Standard credential lookup in usersStore
    let matchedUser = usersStore.find(
      u =>
        u &&
        ((u.email && u.email.trim().toLowerCase() === searchEmail) ||
          (u.username && u.username.trim().toLowerCase() === searchEmail)) &&
        u.password === loginPassword
    );

    // 2. Parent credential lookup in studentsStore
    if (!matchedUser) {
      const parentStudentMatch = studentsStore.find(
        s =>
          s &&
          s.parentEmail &&
          s.parentEmail.trim().toLowerCase() === searchEmail &&
          (s.parentPassword || 'parentPass2026!') === loginPassword
      );
      if (parentStudentMatch) {
        matchedUser = {
          id: `u-parent-${parentStudentMatch.id}`,
          username: (parentStudentMatch.parentEmail || 'parent').split('@')[0],
          email: parentStudentMatch.parentEmail,
          password: parentStudentMatch.parentPassword || 'parentPass2026!',
          name: parentStudentMatch.parentName || 'Parent Guardian',
          role: 'Parent',
          phone: parentStudentMatch.parentPhone || '',
          photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120'
        };
      }
    }

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
    const matchedUser = usersStore.find(u => u && u.role === roleType);
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

    if (newStudent.parentEmail) {
      const newParentUser: User = {
        id: `u-parent-${newStudent.id}`,
        username: (newStudent.parentEmail || 'parent').split('@')[0],
        email: newStudent.parentEmail,
        password: newStudent.parentPassword || 'parentPass2026!',
        name: newStudent.parentName || 'Parent Guardian',
        role: 'Parent',
        phone: newStudent.parentPhone || '',
        photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120'
      };

      setUsersStore(prev => {
        const filtered = prev.filter(u => u && u.email && u.email.trim().toLowerCase() !== (newStudent.parentEmail || '').trim().toLowerCase());
        return [newUser, newParentUser, ...filtered];
      });
    } else {
      setUsersStore(prev => [newUser, ...prev]);
    }
  };

  const handleUpdateStudent = (updatedStudent: StudentProfile, updatedUser: User) => {
    setStudentsStore(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));

    if (updatedStudent.parentEmail) {
      const updatedParentUser: User = {
        id: `u-parent-${updatedStudent.id}`,
        username: (updatedStudent.parentEmail || 'parent').split('@')[0],
        email: updatedStudent.parentEmail,
        password: updatedStudent.parentPassword || 'parentPass2026!',
        name: updatedStudent.parentName || 'Parent Guardian',
        role: 'Parent',
        phone: updatedStudent.parentPhone || '',
        photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120'
      };

      setUsersStore(prev => {
        const updatedList = prev.map(u => u.id === updatedUser.id ? updatedUser : u);
        const parentEmailLower = (updatedStudent.parentEmail || '').trim().toLowerCase();
        const existingParentIndex = updatedList.findIndex(
          u => u && ((u.email && u.email.trim().toLowerCase() === parentEmailLower) || u.id === `u-parent-${updatedStudent.id}`)
        );
        if (existingParentIndex >= 0) {
          updatedList[existingParentIndex] = {
            ...updatedList[existingParentIndex],
            name: updatedStudent.parentName || updatedList[existingParentIndex].name,
            email: updatedStudent.parentEmail,
            password: updatedStudent.parentPassword || 'parentPass2026!',
            phone: updatedStudent.parentPhone || updatedList[existingParentIndex].phone
          };
          return updatedList;
        }
        return [updatedParentUser, ...updatedList];
      });
    } else {
      setUsersStore(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    }
  };

  const handleDeleteStudent = (studentId: string) => {
    if (confirm('Permanently wipe this student record from registry?')) {
      const student = studentsStore.find(s => s.id === studentId);
      setStudentsStore(prev => prev.filter(s => s.id !== studentId));
      if (student) {
        const parentEmailLower = (student.parentEmail || '').trim().toLowerCase();
        setUsersStore(prev => prev.filter(u => u.id !== student.userId && (!parentEmailLower || (u.email || '').trim().toLowerCase() !== parentEmailLower)));
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

  // Modifying: User Profiles & Administrators
  const handleAddUser = (newUser: User) => {
    setUsersStore(prev => [newUser, ...prev]);
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUsersStore(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    if (currentUser.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }
  };

  const handleDeleteUser = (userId: string) => {
    setUsersStore(prev => prev.filter(u => u.id !== userId));
  };

  const handleUpdateCurrentUser = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    setUsersStore(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
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
            exams={examsStore}
            setActiveTab={setActiveTab}
            currentUser={currentUser}
          />
        );
      case 'leetcode':
        return (
          <LeetCodeTracker
            students={studentsStore}
            users={usersStore}
            departments={departmentsStore}
            role={activeRole}
            onUpdateStudent={handleUpdateStudent}
            currentUser={currentUser}
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
          <SettingsModule
            currentUser={currentUser}
            users={usersStore}
            role={activeRole}
            onUpdateCurrentUser={handleUpdateCurrentUser}
            onAddUser={handleAddUser}
            onUpdateUser={handleUpdateUser}
            onDeleteUser={handleDeleteUser}
          />
        );
      default:
        return <div className="text-slate-400 italic">This panel is currently empty.</div>;
    }
  };

  // Helper: map active tab ID to text titles
  const getTabTitle = () => {
    const tabObj = [
      { id: 'dashboard', val: `${activeRole} Dashboard Panel` },
      { id: 'leetcode', val: 'University LeetCode Problem Solving Hub' },
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
                      setBcryptError('');
                      setBcryptResetDetails(null);
                    }}
                    className="text-[11px] text-teal-600 hover:underline font-semibold flex items-center gap-1"
                  >
                    <KeyRound className="h-3 w-3" />
                    <span>Forgot? (BCrypt Key Reset)</span>
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
            <div className="mt-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-sans text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
                      BCrypt Cryptographic Key Reset
                    </h3>
                    <p className="text-[10px] text-slate-400 font-mono">Modular Crypt Format (RFC 2307)</p>
                  </div>
                </div>
                <span className="rounded-md bg-teal-50 px-2 py-0.5 text-[9px] font-black text-teal-700 dark:bg-teal-950/40 dark:text-teal-300 font-mono">
                  Cost: 12 (4096 rounds)
                </span>
              </div>

              {/* Error Display */}
              {bcryptError && (
                <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-100 p-3 text-xs font-semibold text-rose-700 dark:bg-rose-950/30 dark:border-rose-900 dark:text-rose-300">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{bcryptError}</span>
                </div>
              )}

              {/* Email Form & Quick Select */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase text-slate-400">
                  Academic Registered Email
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="admin@university.edu"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                  <button
                    onClick={() => handleExecuteBCryptReset()}
                    disabled={isResettingKey}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-teal-700 transition-colors disabled:opacity-50"
                  >
                    {isResettingKey ? (
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="h-3.5 w-3.5" />
                    )}
                    <span>{isResettingKey ? 'Generating...' : 'Reset Key'}</span>
                  </button>
                </div>

                {/* Quick Account Chips */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Quick Fill:</span>
                  {[
                    { label: 'Admin', email: 'admin@university.edu' },
                    { label: 'Student', email: 'student@university.edu' },
                    { label: 'Faculty', email: 'faculty@university.edu' },
                    { label: 'Parent', email: 'parent@university.edu' }
                  ].map(acc => (
                    <button
                      key={acc.label}
                      type="button"
                      onClick={() => {
                        setForgotEmail(acc.email);
                        handleExecuteBCryptReset(acc.email);
                      }}
                      className="rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 hover:bg-teal-50 hover:text-teal-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
                    >
                      {acc.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* BCrypt Reset Key Generated Certificate Card */}
              {bcryptResetDetails && (
                <div className="rounded-2xl border border-teal-200/90 bg-linear-to-br from-teal-500/10 via-slate-50 to-emerald-500/10 p-4 shadow-sm dark:border-teal-900/40 dark:from-teal-950/40 dark:via-slate-900 dark:to-emerald-950/20 space-y-3.5 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                        BCrypt Key Reset Certificate Issued
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">
                      Account: {bcryptResetDetails.name} ({bcryptResetDetails.role})
                    </span>
                  </div>

                  {/* BCrypt Hash Box */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      <span className="flex items-center gap-1">
                        <Terminal className="h-3 w-3 text-teal-600 dark:text-teal-400" />
                        BCrypt Key Hash (60-char Modular Format)
                      </span>
                      <button
                        onClick={() => handleCopyText(bcryptResetDetails.bcryptKey, 'hash')}
                        className="inline-flex items-center gap-1 text-teal-600 dark:text-teal-400 hover:underline"
                      >
                        {copiedField === 'hash' ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                        <span>{copiedField === 'hash' ? 'Copied Hash!' : 'Copy Hash'}</span>
                      </button>
                    </div>
                    <div className="rounded-xl bg-slate-950 p-2.5 font-mono text-[11px] text-emerald-400 break-all select-all border border-slate-800 shadow-inner">
                      {bcryptResetDetails.bcryptKey}
                    </div>
                  </div>

                  {/* Key Specifications Grid */}
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono sm:grid-cols-4">
                    <div className="rounded-lg bg-white/80 p-2 border border-slate-200/80 dark:bg-slate-900/80 dark:border-slate-800">
                      <span className="text-slate-400 block uppercase text-[9px]">Algorithm</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">EksBlowfish</span>
                    </div>
                    <div className="rounded-lg bg-white/80 p-2 border border-slate-200/80 dark:bg-slate-900/80 dark:border-slate-800">
                      <span className="text-slate-400 block uppercase text-[9px]">Cost Factor</span>
                      <span className="font-bold text-teal-600 dark:text-teal-400">12 (4096 iters)</span>
                    </div>
                    <div className="rounded-lg bg-white/80 p-2 border border-slate-200/80 dark:bg-slate-900/80 dark:border-slate-800">
                      <span className="text-slate-400 block uppercase text-[9px]">Salt Length</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">128-bit CSPRNG</span>
                    </div>
                    <div className="rounded-lg bg-white/80 p-2 border border-slate-200/80 dark:bg-slate-900/80 dark:border-slate-800">
                      <span className="text-slate-400 block uppercase text-[9px]">Expires In</span>
                      <span className="font-bold text-amber-600 dark:text-amber-400">{bcryptResetDetails.expiresIn}</span>
                    </div>
                  </div>

                  {/* Temporary Password & 1-Click Login Card */}
                  <div className="rounded-xl border border-emerald-200/80 bg-white/90 p-3 backdrop-blur-xs dark:border-emerald-900/40 dark:bg-slate-900/90 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Generated Security Access Key / Password
                      </span>
                      <button
                        onClick={() => handleCopyText(bcryptResetDetails.tempPassword, 'pass')}
                        className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-600 dark:text-teal-400 hover:underline"
                      >
                        {copiedField === 'pass' ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                        <span>{copiedField === 'pass' ? 'Copied Password!' : 'Copy Key'}</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between bg-slate-50 rounded-lg p-2 dark:bg-slate-950 font-mono text-sm font-black text-slate-900 dark:text-white border border-slate-200/60 dark:border-slate-800">
                      <span>{bcryptResetDetails.tempPassword}</span>
                      <span className="text-[10px] font-normal text-slate-400">One-Time Token</span>
                    </div>

                    {/* Instant Login Primary Action */}
                    <button
                      type="button"
                      onClick={() => handleApplyResetAndLogin()}
                      className="w-full rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 py-2.5 text-xs font-bold text-white shadow-md hover:from-emerald-700 hover:to-teal-700 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="h-4 w-4" />
                      <span>⚡ Instant Session Sign In as {bcryptResetDetails.name}</span>
                    </button>
                  </div>

                  {/* Expandable Set Custom Password Option */}
                  <div>
                    <button
                      type="button"
                      onClick={() => setShowSetCustomForm(!showSetCustomForm)}
                      className="text-[11px] font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
                    >
                      <span>{showSetCustomForm ? '▾ Hide Custom Password Option' : '▸ Or Set a New Custom Password Now'}</span>
                    </button>

                    {showSetCustomForm && (
                      <div className="mt-2.5 space-y-2 rounded-xl bg-white/70 p-3 border border-slate-200 dark:bg-slate-900/70 dark:border-slate-800 animate-in fade-in duration-150">
                        {customPasswordSuccess && (
                          <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                            {customPasswordSuccess}
                          </div>
                        )}
                        <div className="relative">
                          <input
                            type={showCustomPassword ? 'text' : 'password'}
                            placeholder="Enter new custom password"
                            value={customNewPassword}
                            onChange={(e) => setCustomNewPassword(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 pr-9 text-xs font-semibold text-slate-800 focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCustomPassword(!showCustomPassword)}
                            className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                          >
                            {showCustomPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={handleSaveCustomPasswordAndLogin}
                          className="w-full rounded-xl bg-slate-800 py-2 text-xs font-bold text-white hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 transition-colors"
                        >
                          Save New Password & Sign In
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Navigation Back */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setAuthView('login');
                    setBcryptError('');
                    setBcryptResetDetails(null);
                  }}
                  className="w-full rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                >
                  ← Back to Session Login
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
          onUpdatePhoto={(photo) => handleUpdateUserPhoto(currentUser.id, photo)}
          onNavigateToSettings={() => setActiveTab('settings')}
        />

        {/* Dynamic content stage */}
        <main id="app-main-content" className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto max-h-[calc(100vh-64px)]">
          {renderTabContent()}
        </main>
      </div>
    </div>
  );
}

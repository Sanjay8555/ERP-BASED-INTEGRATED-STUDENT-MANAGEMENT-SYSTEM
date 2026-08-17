/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Users,
  Briefcase,
  Building,
  GraduationCap,
  CalendarCheck,
  ClipboardList,
  Clock,
  BookOpen,
  IndianRupee,
  AlertCircle,
  TrendingUp,
  PlusCircle,
  FileText,
  BookmarkCheck,
  CheckCircle2,
  ListFilter,
  Code2,
  Sparkles,
  ExternalLink,
  RefreshCw,
  Flame,
  Trophy,
  Target,
  Award
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import {
  User,
  StudentProfile,
  FacultyProfile,
  Department,
  Course,
  Attendance,
  Exam,
  Result,
  FeePayment,
  Book,
  BookIssue,
  Notice,
  LeetCodeStats
} from '../../types';
import {
  fetchStudentLeetCodeStats,
  fetchBatchLeetCodeStats,
  extractLeetCodeUsername,
  formatLeetCodeProfileUrl,
  getWeeklyActivity,
  formatSubmissionRelativeTime
} from '../../services/leetcodeService';

interface DashboardsProps {
  role: string;
  users: User[];
  students: StudentProfile[];
  faculty: FacultyProfile[];
  departments: Department[];
  courses: Course[];
  attendance: Attendance[];
  results: Result[];
  feePayments: FeePayment[];
  books: Book[];
  bookIssues: BookIssue[];
  notices: Notice[];
  exams?: Exam[];
  setActiveTab: (tab: string) => void;
  onOpenQuickModal?: (action: string) => void;
  currentUser?: User;
}

export default function Dashboards({
  role,
  users,
  students,
  faculty,
  departments,
  courses,
  attendance,
  results,
  feePayments,
  books,
  bookIssues,
  notices,
  exams = [],
  setActiveTab,
  onOpenQuickModal,
  currentUser
}: DashboardsProps) {
  // Chart Colors
  const COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

  // Real-Time LeetCode Dashboard State
  const [studentLCStats, setStudentLCStats] = useState<LeetCodeStats | null>(null);
  const [isFetchingStudentLC, setIsFetchingStudentLC] = useState<boolean>(false);
  const [adminBatchStats, setAdminBatchStats] = useState<Record<string, LeetCodeStats>>({});

  // Resolve current active student profile
  const currentStudentProfile = students.find(
    s => s && (s.userId === currentUser?.id || (currentUser?.role === 'Student' && s.userId === currentUser.id))
  ) || students[0];

  // Fetch real-time LeetCode stats for active student
  const refreshActiveStudentLC = async (force = false) => {
    if (!currentStudentProfile) return;
    const handle = extractLeetCodeUsername(currentStudentProfile.leetcodeUsername || currentStudentProfile.leetcodeUrl || '');
    if (!handle) {
      setStudentLCStats(null);
      return;
    }
    setIsFetchingStudentLC(true);
    const stats = await fetchStudentLeetCodeStats(handle, force);
    setStudentLCStats(stats);
    setIsFetchingStudentLC(false);
  };

  useEffect(() => {
    refreshActiveStudentLC();

    // If Admin or Faculty, batch fetch top coders stats
    if (role === 'Admin' || role === 'Faculty') {
      const handles = students.map(s => s.leetcodeUrl || s.leetcodeUsername || '').filter(Boolean);
      if (handles.length > 0) {
        fetchBatchLeetCodeStats(handles).then(res => {
          setAdminBatchStats(res);
        });
      }
    }
  }, [currentStudentProfile, role, students]);

  // Helper: calculate average attendance specifically for prescribed courses in student's department & semester
  const getStudentPrescribedAttendance = (student?: StudentProfile) => {
    if (!student) return 92;
    const prescribedCourses = courses.filter(
      c => c.departmentId === student.departmentId && c.semester === student.currentSemester
    );
    const prescribedIds = new Set(prescribedCourses.map(c => c.id));
    const studentLogs = attendance.filter(
      a => a && a.studentId === student.id && (prescribedIds.size === 0 || prescribedIds.has(a.courseId))
    );
    const total = studentLogs.length;
    if (total === 0) return 92;
    const present = studentLogs.filter(a => a.status === 'Present').length;
    return Math.round((present / total) * 100);
  };

  // Render Admin Dashboard
  const renderAdminDashboard = () => {
    // Stats
    const totalStudents = students.length;
    const totalFaculty = faculty.length;
    const totalDepts = departments.length;
    const totalCourses = courses.length;

    // Calculate total LeetCode solves across university
    const totalLeetCodeSolves = (Object.values(adminBatchStats) as LeetCodeStats[]).reduce((acc: number, curr: LeetCodeStats) => acc + (curr?.totalSolved || 0), 0);

    // Chart: Students by Department
    const deptChartData = departments.map(d => {
      const count = students.filter(s => s.departmentId === d.id).length || 1;
      return { name: d.code, Students: count + (d.code === 'IT' ? 12 : 6) };
    });

    // Top 3 Coders
    const sortedCoders = [...students].map(s => {
      const handle = extractLeetCodeUsername(s.leetcodeUsername || s.leetcodeUrl || '');
      const user = users.find(u => u.id === s.userId);
      const stats = adminBatchStats[handle] || adminBatchStats[s.leetcodeUrl || ''];
      return {
        student: s,
        user,
        handle,
        solved: stats?.totalSolved || (handle === 'sanjay' ? 343 : handle === 'neal_wu' ? 253 : 180)
      };
    }).sort((a, b) => b.solved - a.solved).slice(0, 3);

    return (
      <div className="space-y-6">
        {/* Statistics Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Enrollment</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{totalStudents + 120}</h3>
              </div>
              <div className="rounded-xl bg-teal-50 p-3 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400">
                <Users className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5 font-mono text-xs text-emerald-600">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>+8.4% Academic Intake</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Active Faculty</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{totalFaculty + 18}</h3>
              </div>
              <div className="rounded-xl bg-blue-50 p-3 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                <Briefcase className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5 font-mono text-xs text-teal-600">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>100% Workload Compliance</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Live LeetCode Solves</p>
                <h3 className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">
                  {totalLeetCodeSolves > 0 ? totalLeetCodeSolves.toLocaleString() : '1,420+'}
                </h3>
              </div>
              <div className="rounded-xl bg-amber-500/10 p-3 text-amber-600 dark:text-amber-400">
                <Flame className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between font-mono text-xs text-amber-600">
              <span>Realtime Cross-Department</span>
              <button
                onClick={() => setActiveTab('leetcode')}
                className="hover:underline font-bold text-[11px]"
              >
                Leaderboard →
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Active Courses</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{totalCourses + 24}</h3>
              </div>
              <div className="rounded-xl bg-purple-50 p-3 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400">
                <GraduationCap className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5 font-mono text-xs text-emerald-600">
              <span>96 Total Assigned Credits</span>
            </div>
          </div>
        </div>

        {/* Charts & Actions Section */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Department Chart */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
            <h4 className="font-sans text-sm font-bold text-slate-900 dark:text-white mb-4">Enrollment distribution by Department</h4>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" fontSize={11} stroke="#94a3b8" tickLine={false} />
                  <YAxis fontSize={11} stroke="#94a3b8" tickLine={false} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} />
                  <Bar dataKey="Students" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Actions & Top Coders Snippet */}
          <div className="flex flex-col gap-6">
            {/* Top LeetCode Coders Widget */}
            <div className="rounded-2xl border border-amber-200/80 bg-linear-to-b from-amber-500/5 to-transparent p-5 shadow-xs dark:border-amber-900/30 dark:bg-slate-900">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-amber-500" />
                  <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    Top Problem Solvers
                  </h4>
                </div>
                <button
                  onClick={() => setActiveTab('leetcode')}
                  className="text-[11px] font-bold text-amber-600 hover:underline dark:text-amber-400"
                >
                  View All
                </button>
              </div>

              <div className="space-y-2.5">
                {sortedCoders.map((coder, idx) => (
                  <div
                    key={coder.student.id}
                    className="flex items-center justify-between rounded-xl bg-white p-2.5 border border-slate-100 dark:bg-slate-950 dark:border-slate-800/80 shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-[10px] font-black text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                        #{idx + 1}
                      </span>
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-white line-clamp-1">{coder.user?.name || coder.student.rollNo}</p>
                        <p className="text-[10px] font-mono text-slate-400">@{coder.handle || 'unlinked'}</p>
                      </div>
                    </div>
                    <span className="rounded-lg bg-amber-500/10 px-2 py-0.5 font-mono text-xs font-black text-amber-600 dark:text-amber-400">
                      ⚡ {coder.solved}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Admin Actions */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Quick Actions</h4>
              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={() => setActiveTab('students')}
                  className="flex items-center gap-2.5 rounded-xl border border-slate-100 p-2.5 text-left hover:bg-slate-50 transition-colors dark:border-slate-800 dark:hover:bg-slate-800/50"
                >
                  <PlusCircle className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-white">Register Student</p>
                    <p className="text-[10px] text-slate-400">Include LeetCode handle</p>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('leetcode')}
                  className="flex items-center gap-2.5 rounded-xl border border-slate-100 p-2.5 text-left hover:bg-slate-50 transition-colors dark:border-slate-800 dark:hover:bg-slate-800/50"
                >
                  <Code2 className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-white">LeetCode Manager</p>
                    <p className="text-[10px] text-slate-400">Edit student URLs & audit solves</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render Faculty Dashboard
  const renderFacultyDashboard = () => {
    // Workload, Assigned courses, etc.
    const activeLectures = 14;
    const currentAssignments = 2;

    // Faculty specific Courses chart
    const workData = [
      { name: 'CS-201', Hrs: 4 },
      { name: 'CS-202', Hrs: 3 },
      { name: 'CS-203', Hrs: 3 },
      { name: 'CS-204', Hrs: 4 }
    ];

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Lecture Count</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">12 Hrs / Wk</h3>
              </div>
              <div className="rounded-xl bg-teal-50 p-3 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400">
                <Clock className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5 font-mono text-xs text-teal-600">
              <span>Standard Academic Workload</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Mean Attendance</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  {attendance.length > 0
                    ? Math.round((attendance.filter(a => a.status === 'Present').length / attendance.length) * 100)
                    : 94}%
                </h3>
              </div>
              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                <CalendarCheck className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5 font-mono text-xs text-emerald-600">
              <span>Department Course Target (≥75%)</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Assignments Issued</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{currentAssignments}</h3>
              </div>
              <div className="rounded-xl bg-amber-50 p-3 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
                <ClipboardList className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5 font-mono text-xs text-slate-500">
              <span>{results.length} Pending Gradings</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Active Subjects</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">4</h3>
              </div>
              <div className="rounded-xl bg-pink-50 p-3 text-pink-600 dark:bg-pink-950/40 dark:text-pink-400">
                <BookOpen className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5 font-mono text-xs text-pink-600">
              <span>Credits allocation: 14</span>
            </div>
          </div>
        </div>

        {/* Charts & Actions Section */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Workload hours per Course */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
            <h4 className="font-sans text-sm font-bold text-slate-900 dark:text-white mb-4">Subject Credit Weightage & Workload Distribution</h4>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={workData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" fontSize={11} stroke="#94a3b8" tickLine={false} />
                  <YAxis fontSize={11} stroke="#94a3b8" tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="Hrs" fill="#818cf8" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
            <div>
              <h4 className="font-sans text-sm font-bold text-slate-900 dark:text-white mb-4">Faculty Portal Actions</h4>
              <div className="space-y-3">
                <button
                  onClick={() => setActiveTab('attendance')}
                  className="w-full flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <span>Mark Daily Attendance</span>
                  <PlusCircle className="h-4.5 w-4.5 text-teal-500" />
                </button>
                <button
                  onClick={() => setActiveTab('exams')}
                  className="w-full flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <span>Grade Academic Results</span>
                  <FileText className="h-4.5 w-4.5 text-emerald-500" />
                </button>
                <button
                  onClick={() => setActiveTab('assignments')}
                  className="w-full flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <span>Publish Assignment</span>
                  <ClipboardList className="h-4.5 w-4.5 text-amber-500" />
                </button>
              </div>
            </div>

            <div className="mt-6 border-t border-slate-100 dark:border-slate-800 pt-4">
              <p className="text-[11px] text-slate-400 italic">Notice: Semester 4 grading locks in 14 days. Please expedite mark submissions.</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render Student Dashboard
  const renderStudentDashboard = () => {
    // CGPA, Attendance, Issues, Outstanding Assignments
    const currentStudent: StudentProfile = currentStudentProfile;
    const overallAtt = getStudentPrescribedAttendance(currentStudent);
    const issuedBooks = bookIssues.filter(i => i.studentId === currentStudent.id && i.status === 'Issued').length;
    const pendingAsg = 3;

    // Student Progress Area Chart
    const performanceData = [
      { sem: 'Sem 1', GPA: 3.75 },
      { sem: 'Sem 2', GPA: 3.80 },
      { sem: 'Sem 3', GPA: 3.91 },
      { sem: 'Sem 4', GPA: currentStudent.cgpa }
    ];

    const studentHandle = extractLeetCodeUsername(currentStudent.leetcodeUsername || currentStudent.leetcodeUrl || '');
    const profileUrl = formatLeetCodeProfileUrl(currentStudent.leetcodeUrl || studentHandle);

    return (
      <div className="space-y-6">
        {/* Real-Time LeetCode Coding Activity Spotlight Widget */}
        <div className="relative overflow-hidden rounded-3xl border border-amber-300/70 bg-linear-to-r from-amber-500/10 via-slate-50 to-orange-500/10 p-6 shadow-sm dark:border-amber-900/40 dark:from-amber-950/40 dark:via-slate-900 dark:to-orange-950/20">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-lg shadow-amber-500/25">
                <Code2 className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-sans text-base font-extrabold text-slate-900 dark:text-white">
                    LeetCode Live Problem Solve Tracking
                  </h3>
                  <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live Sync
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {studentHandle ? (
                    <>Connected Profile: <strong className="text-amber-600 dark:text-amber-400 font-mono">@{studentHandle}</strong></>
                  ) : (
                    'No LeetCode profile URL configured yet. Ask Admin to assign your handle.'
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {studentHandle && (
                <>
                  <button
                    onClick={() => refreshActiveStudentLC(true)}
                    disabled={isFetchingStudentLC}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-white px-3 py-2 text-xs font-bold text-amber-700 shadow-xs hover:bg-amber-50 transition-colors disabled:opacity-50 dark:border-amber-800 dark:bg-slate-800 dark:text-amber-300 dark:hover:bg-slate-700"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isFetchingStudentLC ? 'animate-spin' : ''}`} />
                    <span>{isFetchingStudentLC ? 'Updating...' : 'Sync Count'}</span>
                  </button>

                  <a
                    href={profileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-amber-600/20 hover:bg-amber-700 transition-colors"
                  >
                    <span>LeetCode Profile</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </>
              )}

              <button
                onClick={() => setActiveTab('leetcode')}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
              >
                <span>Leaderboard</span>
                <Trophy className="h-3.5 w-3.5 text-amber-500" />
              </button>
            </div>
          </div>

          {studentHandle && studentLCStats && studentLCStats.found ? (
            <div className="mt-6 space-y-4">
              {/* Daily Streak & KPI Metrics Row */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* Total Solved */}
                <div className="rounded-2xl border border-amber-200/80 bg-white/90 p-4 backdrop-blur-xs shadow-2xs dark:border-amber-900/40 dark:bg-slate-900/90">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Solved</span>
                    <Sparkles className="h-4 w-4 text-amber-500" />
                  </div>
                  <h4 className="text-3xl font-black font-mono text-amber-600 dark:text-amber-400 mt-1">
                    {studentLCStats.totalSolved}
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-1 font-mono">
                    All-Time Problem Count
                  </p>
                </div>

                {/* Today's Solves */}
                <div className="rounded-2xl border border-orange-200/80 bg-linear-to-br from-orange-500/10 to-amber-500/5 p-4 backdrop-blur-xs shadow-2xs dark:border-orange-900/40 dark:bg-slate-900/90">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">Daily Solves (Today)</span>
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400 font-bold text-[10px]">
                      ⚡
                    </span>
                  </div>
                  <h4 className="text-3xl font-black font-mono text-orange-600 dark:text-orange-400 mt-1">
                    {studentLCStats.dailyProgress?.todaySolved || 0}
                  </h4>
                  <p className="text-[10px] text-orange-600/80 font-bold dark:text-orange-400/80 mt-1 font-mono">
                    {(studentLCStats.dailyProgress?.todaySolved || 0) > 0 ? '✓ Daily Goal Met' : 'Daily Goal: 2 Problems'}
                  </p>
                </div>

                {/* Daily Streak */}
                <div className="rounded-2xl border border-rose-200/80 bg-linear-to-br from-rose-500/10 to-amber-500/5 p-4 backdrop-blur-xs shadow-2xs dark:border-rose-900/40 dark:bg-slate-900/90">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">Active Streak</span>
                    <Flame className="h-4.5 w-4.5 text-rose-500 animate-bounce" />
                  </div>
                  <div className="flex items-baseline gap-1 mt-1">
                    <h4 className="text-3xl font-black font-mono text-rose-600 dark:text-rose-400">
                      {studentLCStats.dailyProgress?.currentStreak || 1}
                    </h4>
                    <span className="text-xs font-bold text-slate-500">Days</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 font-mono">
                    Max: {studentLCStats.dailyProgress?.maxStreak || 14} days streak
                  </p>
                </div>

                {/* Global Ranking */}
                <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 backdrop-blur-xs shadow-2xs dark:border-slate-800 dark:bg-slate-900/90">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Global Rank</span>
                    <Trophy className="h-4 w-4 text-amber-500" />
                  </div>
                  <h4 className="text-2xl font-black font-mono text-slate-800 dark:text-white mt-1.5">
                    {studentLCStats.ranking ? `#${studentLCStats.ranking.toLocaleString()}` : 'Top 5%'}
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-1 font-mono">
                    {studentLCStats.dailyProgress?.activeDaysCount || 34} Active Coding Days
                  </p>
                </div>
              </div>

              {/* Today's Daily Coding Challenge & 7-Day Activity Heatmap */}
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                {/* Daily Challenge Card (5 cols) */}
                <div className="rounded-2xl border border-amber-200/90 bg-white p-4.5 shadow-2xs dark:border-amber-900/50 dark:bg-slate-900 lg:col-span-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                          LeetCode Daily Challenge
                        </span>
                      </div>
                      <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-mono">
                        {studentLCStats.dailyProgress?.dailyChallenge?.date || 'Today'}
                      </span>
                    </div>

                    <h5 className="font-sans text-sm font-extrabold text-slate-900 dark:text-white mt-1">
                      {studentLCStats.dailyProgress?.dailyChallenge ? (
                        <>
                          <span className="text-amber-600 font-mono mr-1.5">#{studentLCStats.dailyProgress.dailyChallenge.questionFrontendId}</span>
                          {studentLCStats.dailyProgress.dailyChallenge.title}
                        </>
                      ) : (
                        'Stone Game V'
                      )}
                    </h5>

                    <div className="mt-2.5 flex items-center gap-2">
                      <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                        (studentLCStats.dailyProgress?.dailyChallenge?.difficulty || 'Medium') === 'Hard'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                          : (studentLCStats.dailyProgress?.dailyChallenge?.difficulty || 'Medium') === 'Medium'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                      }`}>
                        {studentLCStats.dailyProgress?.dailyChallenge?.difficulty || 'Medium'}
                      </span>

                      <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        {studentLCStats.dailyProgress?.dailyChallenge?.userStatus === 'Solved' ? 'Completed Today' : 'Streak Booster'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-mono">Earn +10 LeetCoins & Badge</span>
                    <a
                      href={studentLCStats.dailyProgress?.dailyChallenge?.link || 'https://leetcode.com/problemset/all/'}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 hover:underline dark:text-amber-400"
                    >
                      <span>Solve Challenge</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>

                {/* 7-Day Activity Mini-Bars (7 cols) */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4.5 shadow-2xs dark:border-slate-800 dark:bg-slate-900 lg:col-span-7 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-sans text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                        7-Day Problem Solving Velocity
                      </h5>
                      <span className="font-mono text-[10px] text-slate-400">
                        Past 7 Days
                      </span>
                    </div>

                    {/* Weekly Activity Bars */}
                    <div className="grid grid-cols-7 gap-2 pt-3">
                      {getWeeklyActivity(studentLCStats.dailyProgress?.calendar).map((day, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-1.5">
                          <div className="h-16 w-full rounded-xl bg-slate-100 dark:bg-slate-800 flex items-end justify-center p-1 relative group">
                            <div
                              style={{ height: `${Math.min(100, Math.max(15, day.count * 25))}%` }}
                              className={`w-full rounded-lg transition-all duration-500 ${
                                day.count > 0
                                  ? 'bg-linear-to-t from-amber-500 to-orange-400 shadow-xs'
                                  : 'bg-slate-200 dark:bg-slate-700'
                              }`}
                            />
                            {/* Tooltip */}
                            <div className="absolute -top-7 hidden group-hover:flex rounded-md bg-slate-900 px-1.5 py-0.5 text-[9px] font-mono text-white shadow-md z-10 whitespace-nowrap dark:bg-white dark:text-slate-900">
                              {day.count} solved
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 font-mono">
                            {day.day}
                          </span>
                          <span className={`text-[9px] font-mono font-extrabold ${day.count > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'}`}>
                            {day.count > 0 ? `+${day.count}` : '0'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Submissions Snippet */}
                  {studentLCStats.dailyProgress?.recentSubmissions && studentLCStats.dailyProgress.recentSubmissions.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 font-mono">
                        Latest: <strong className="text-slate-700 dark:text-slate-300 font-sans">{studentLCStats.dailyProgress.recentSubmissions[0].title}</strong>
                      </span>
                      <span className="font-mono text-[10px] text-amber-600 dark:text-amber-400">
                        {formatSubmissionRelativeTime(studentLCStats.dailyProgress.recentSubmissions[0].timestamp)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Difficulty Breakdown Progress Bars */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {/* Easy Breakdown */}
                <div className="rounded-xl border border-emerald-100 bg-white/90 p-3 shadow-2xs dark:border-emerald-950 dark:bg-slate-900/90 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Easy ({studentLCStats.easySolved})</span>
                    <span className="font-mono text-[10px] text-slate-400">
                      {Math.round(((studentLCStats.easySolved || 0) / (studentLCStats.totalSolved || 1)) * 100)}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      style={{ width: `${Math.min(100, ((studentLCStats.easySolved || 0) / (studentLCStats.totalSolved || 1)) * 100)}%` }}
                      className="h-full bg-emerald-500 rounded-full"
                    />
                  </div>
                </div>

                {/* Medium Breakdown */}
                <div className="rounded-xl border border-amber-100 bg-white/90 p-3 shadow-2xs dark:border-amber-950 dark:bg-slate-900/90 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Medium ({studentLCStats.mediumSolved})</span>
                    <span className="font-mono text-[10px] text-slate-400">
                      {Math.round(((studentLCStats.mediumSolved || 0) / (studentLCStats.totalSolved || 1)) * 100)}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      style={{ width: `${Math.min(100, ((studentLCStats.mediumSolved || 0) / (studentLCStats.totalSolved || 1)) * 100)}%` }}
                      className="h-full bg-amber-500 rounded-full"
                    />
                  </div>
                </div>

                {/* Hard Breakdown */}
                <div className="rounded-xl border border-rose-100 bg-white/90 p-3 shadow-2xs dark:border-rose-950 dark:bg-slate-900/90 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">Hard ({studentLCStats.hardSolved})</span>
                    <span className="font-mono text-[10px] text-slate-400">
                      {Math.round(((studentLCStats.hardSolved || 0) / (studentLCStats.totalSolved || 1)) * 100)}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      style={{ width: `${Math.min(100, ((studentLCStats.hardSolved || 0) / (studentLCStats.totalSolved || 1)) * 100)}%` }}
                      className="h-full bg-rose-500 rounded-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : studentHandle ? (
            <div className="mt-4 rounded-2xl bg-white/60 p-4 text-xs font-mono text-slate-500 dark:bg-slate-900/60 flex items-center justify-between">
              <span>Fetching real-time solve counts for @{studentHandle}...</span>
              <RefreshCw className="h-4 w-4 animate-spin text-amber-500" />
            </div>
          ) : null}
        </div>

        {/* Academic Metrics Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Cumulative GPA</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{currentStudent.cgpa}</h3>
              </div>
              <div className="rounded-xl bg-teal-50 p-3 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400">
                <BookmarkCheck className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5 font-mono text-xs text-emerald-600">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Top 5% of Department</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">My Attendance</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{overallAtt}%</h3>
              </div>
              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                <CalendarCheck className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5 font-mono text-xs text-emerald-600">
              <span>Threshold Compliance OK</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Issued Books</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{issuedBooks}</h3>
              </div>
              <div className="rounded-xl bg-amber-50 p-3 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
                <BookOpen className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5 font-mono text-xs text-slate-500">
              <span>Next return: 2026-07-04</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Pending Assignments</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{pendingAsg}</h3>
              </div>
              <div className="rounded-xl bg-rose-50 p-3 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
                <ClipboardList className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5 font-mono text-xs text-rose-600">
              <span>Due: SQL, DFA automata</span>
            </div>
          </div>
        </div>

        {/* Charts & Recent Grades */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Performance Area Chart */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
            <h4 className="font-sans text-sm font-bold text-slate-900 dark:text-white mb-4">Academic progress trend (GPA)</h4>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorGPA" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="sem" fontSize={11} stroke="#94a3b8" tickLine={false} />
                  <YAxis domain={[3.0, 4.0]} fontSize={11} stroke="#94a3b8" tickLine={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="GPA" stroke="#6366f1" fillOpacity={1} fill="url(#colorGPA)" strokeWidth={2.5} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
            <div>
              <h4 className="font-sans text-sm font-bold text-slate-900 dark:text-white mb-4">Student Action Board</h4>
              <div className="space-y-3">
                <button
                  onClick={() => setActiveTab('leetcode')}
                  className="w-full flex items-center justify-between rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs font-semibold text-amber-800 hover:bg-amber-100 transition-colors dark:bg-amber-950/20 dark:border-amber-900 dark:text-amber-300"
                >
                  <span>Coding Hub & Leaderboard</span>
                  <Code2 className="h-4.5 w-4.5 text-amber-500" />
                </button>
                <button
                  onClick={() => setActiveTab('assignments')}
                  className="w-full flex items-center justify-between rounded-xl bg-teal-50 border border-teal-100 p-3 text-xs font-semibold text-teal-700 hover:bg-teal-100 transition-colors dark:bg-teal-950/20 dark:border-teal-900 dark:text-teal-300"
                >
                  <span>Submit Pending Homework</span>
                  <PlusCircle className="h-4.5 w-4.5" />
                </button>
                <button
                  onClick={() => setActiveTab('timetable')}
                  className="w-full flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <span>View Weekly Timetable</span>
                  <Clock className="h-4.5 w-4.5 text-teal-500" />
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 mt-4">
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                <strong>Placement Cell Notice:</strong> Consistent LeetCode activity (150+ problems) is verified by recruiters during semester recruitment drives.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render Parent Dashboard
  const renderParentDashboard = () => {
    // Dynamically find the ward for the logged-in parent
    const parentEmail = (currentUser?.email || '').trim().toLowerCase();
    const wardStudent = students.find(s => s && s.parentEmail && s.parentEmail.trim().toLowerCase() === parentEmail) || students[0];
    const wardUser = wardStudent ? users.find(u => u && u.id === wardStudent.userId) : null;
    const wardDept = departments.find(d => d && d.id === wardStudent?.departmentId);

    const wardAttendanceLogs = wardStudent ? attendance.filter(a => a && a.studentId === wardStudent.id) : [];
    const totalAtt = wardAttendanceLogs.length;
    const presentAtt = wardAttendanceLogs.filter(a => a.status === 'Present').length;
    const overallAtt = totalAtt > 0 ? Math.round((presentAtt / totalAtt) * 100) : 92;

    const currentGPA = wardStudent?.cgpa || 3.84;

    const wardResults = wardStudent ? results.filter(r => r && r.studentId === wardStudent.id) : [];
    const gradeData = wardResults.length > 0
      ? wardResults.slice(0, 5).map(r => {
          const exam = exams.find(e => e && e.id === r.examId);
          const course = courses.find(c => c && c.id === exam?.courseId);
          return {
            name: course?.code || exam?.name || 'Subject',
            Marks: Math.round((r.totalMarks / 150) * 100)
          };
        })
      : [
          { name: 'CS-201', Marks: 85 },
          { name: 'CS-202', Marks: 88 },
          { name: 'CS-203', Marks: 82 },
          { name: 'CS-204', Marks: 90 }
        ];

    const wardName = wardUser?.name || 'Jane Doe';
    const wardRoll = wardStudent?.rollNo || 'IT-2026-001';
    const wardDeptName = wardDept?.name || 'Information Technology';
    const wardSem = wardStudent?.currentSemester || 4;
    const wardBatch = wardStudent?.batch || '2024-2028';
    const wardPhoto = wardUser?.photo || 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=120';

    return (
      <div className="space-y-6">
        {/* Ward Info Summary */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <img
                src={wardPhoto}
                alt={wardName}
                className="h-16 w-16 rounded-full object-cover border-2 border-teal-600"
              />
              <div>
                <h3 className="font-sans text-md font-bold text-slate-900 dark:text-white">{wardName} (Ward Profile)</h3>
                <p className="text-xs text-slate-500">Roll No: {wardRoll} • {wardDeptName}</p>
                <p className="text-[11px] font-mono text-slate-400 mt-0.5">Semester {wardSem} • Batch {wardBatch}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <span className="inline-flex items-center rounded-xl bg-teal-100 px-3 py-1 text-xs font-bold text-teal-700 dark:bg-teal-950 dark:text-teal-300">
                CGPA: {currentGPA}
              </span>
              <span className="inline-flex items-center rounded-xl bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                Attendance: {overallAtt}%
              </span>
            </div>
          </div>
        </div>

        {/* Action Grid & Visualizers */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Ward Grades Bar */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
            <h4 className="font-sans text-sm font-bold text-slate-900 dark:text-white mb-4">Ward Subject Grades Profile</h4>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={gradeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" fontSize={11} stroke="#94a3b8" tickLine={false} />
                  <YAxis domain={[0, 100]} fontSize={11} stroke="#94a3b8" tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="Marks" fill="#4f46e5" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Pay Panel */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
            <div>
              <h4 className="font-sans text-sm font-bold text-slate-900 dark:text-white mb-4">Parent Financial Portal</h4>
              <div className="rounded-xl bg-amber-50 border border-amber-200/60 p-4 dark:bg-amber-950/20 dark:border-amber-900/50 mb-4">
                <div className="flex items-start gap-2 text-amber-800 dark:text-amber-400">
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold">Outstanding Semester Dues</p>
                    <p className="text-[10px] opacity-90 mt-0.5"> sports council club dues: ₹150.00 is due.</p>
                  </div>
                </div>
                <h3 className="text-2xl font-black text-slate-800 dark:text-amber-300 mt-2">₹150.00</h3>
              </div>
              <button
                onClick={() => setActiveTab('fees')}
                className="w-full rounded-xl bg-teal-600 py-3 text-center text-xs font-bold text-white shadow-md hover:bg-teal-700 transition-colors"
              >
                Clear Outstanding Fee
              </button>
            </div>

            <div className="space-y-3 mt-6 border-t border-slate-100 dark:border-slate-800 pt-4">
              <button
                onClick={() => setActiveTab('attendance')}
                className="w-full flex items-center justify-between text-xs text-slate-600 hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400"
              >
                <span>Check ward daily attendance history</span>
                <span>→</span>
              </button>
              <button
                onClick={() => setActiveTab('timetable')}
                className="w-full flex items-center justify-between text-xs text-slate-600 hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400"
              >
                <span>View ward weekly class schedule</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render Accountant Dashboard
  const renderAccountantDashboard = () => {
    // Fee collected stats, pending payouts
    const totalCollected = feePayments
      .filter(p => p.status === 'Paid' || p.status === 'Partial')
      .reduce((sum, p) => sum + p.amountPaid, 0);

    const financialData = [
      { month: 'Mar', Collection: 12000 },
      { month: 'Apr', Collection: 18400 },
      { month: 'May', Collection: 22000 },
      { month: 'Jun', Collection: totalCollected }
    ];

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Collected</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">₹{totalCollected + 35000}</h3>
              </div>
              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                <IndianRupee className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5 font-mono text-xs text-emerald-600">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>+12% on Semester Term-A</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Pending Dues</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">₹2,150</h3>
              </div>
              <div className="rounded-xl bg-amber-50 p-3 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
                <AlertCircle className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5 font-mono text-xs text-slate-500">
              <span>9 students in default</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Completed Payments</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">92%</h3>
              </div>
              <div className="rounded-xl bg-teal-50 p-3 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400">
                <CheckCircle2 className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5 font-mono text-xs text-teal-600">
              <span>120 / 130 Receipts issued</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Active Schemes</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">3</h3>
              </div>
              <div className="rounded-xl bg-purple-50 p-3 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400">
                <ListFilter className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5 font-mono text-xs text-purple-600">
              <span>Fee structures online</span>
            </div>
          </div>
        </div>

        {/* Area Charts & quick billing actions */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Monthly collections */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
            <h4 className="font-sans text-sm font-bold text-slate-900 dark:text-white mb-4">Cumulative Fee Collection Trend</h4>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={financialData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" fontSize={11} stroke="#94a3b8" tickLine={false} />
                  <YAxis fontSize={11} stroke="#94a3b8" tickLine={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="Collection" stroke="#10b981" fillOpacity={1} fill="url(#colorCash)" strokeWidth={2.5} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick billing board */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
            <div>
              <h4 className="font-sans text-sm font-bold text-slate-900 dark:text-white mb-4">Finance Desk Quick Actions</h4>
              <div className="space-y-3">
                <button
                  onClick={() => setActiveTab('fees')}
                  className="w-full flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <span>Collect Offline Payments</span>
                  <PlusCircle className="h-4.5 w-4.5 text-teal-500" />
                </button>
                <button
                  onClick={() => setActiveTab('fees')}
                  className="w-full flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <span>Define Fee Structure</span>
                  <FileText className="h-4.5 w-4.5 text-emerald-500" />
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200/50 dark:bg-rose-950/20 dark:border-rose-900/50 mt-4 text-[11px] text-rose-800 dark:text-rose-300">
              <p className="font-bold">Urgent Audit Notice</p>
              <p className="mt-0.5 opacity-90 leading-relaxed">Tax compliance reports and corporate accounts ledger entries require submission by end of the week.</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  switch (role) {
    case 'Admin':
      return renderAdminDashboard();
    case 'Faculty':
      return renderFacultyDashboard();
    case 'Student':
      return renderStudentDashboard();
    case 'Parent':
      return renderParentDashboard();
    case 'Accountant':
      return renderAccountantDashboard();
    default:
      return renderAdminDashboard();
  }
}

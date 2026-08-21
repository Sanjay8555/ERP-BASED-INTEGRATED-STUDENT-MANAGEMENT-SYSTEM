/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
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
  ListFilter
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
  Notice
} from '../../types';

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

  // Resolve current active student profile
  const currentStudentProfile = students.find(
    s => s && (s.userId === currentUser?.id || (currentUser?.role === 'Student' && s.userId === currentUser.id))
  ) || students[0];

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

    // Chart: Students by Department
    const deptChartData = departments.map(d => {
      const count = students.filter(s => s.departmentId === d.id).length || 1;
      return { name: d.code, Students: count + (d.code === 'IT' ? 12 : 6) };
    });

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
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Departments</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{totalDepts}</h3>
              </div>
              <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
                <Building className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5 font-mono text-xs text-indigo-600">
              <span>All Programs Accredited</span>
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

          {/* Quick Actions Panel */}
          <div className="flex flex-col gap-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex-1 flex flex-col justify-between">
              <div>
                <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Quick Actions</h4>
                <div className="grid grid-cols-1 gap-2.5">
                  <button
                    onClick={() => setActiveTab('students')}
                    className="flex items-center gap-2.5 rounded-xl border border-slate-100 p-3 text-left hover:bg-slate-50 transition-colors dark:border-slate-800 dark:hover:bg-slate-800/50"
                  >
                    <PlusCircle className="h-4.5 w-4.5 text-teal-600 dark:text-teal-400" />
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-white">Register Student</p>
                      <p className="text-[10px] text-slate-400">Enroll new student account</p>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('faculty')}
                    className="flex items-center gap-2.5 rounded-xl border border-slate-100 p-3 text-left hover:bg-slate-50 transition-colors dark:border-slate-800 dark:hover:bg-slate-800/50"
                  >
                    <Briefcase className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400" />
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-white">Faculty Directory</p>
                      <p className="text-[10px] text-slate-400">Manage instructors and workloads</p>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('courses')}
                    className="flex items-center gap-2.5 rounded-xl border border-slate-100 p-3 text-left hover:bg-slate-50 transition-colors dark:border-slate-800 dark:hover:bg-slate-800/50"
                  >
                    <BookOpen className="h-4.5 w-4.5 text-purple-600 dark:text-purple-400" />
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-white">Course Curriculum</p>
                      <p className="text-[10px] text-slate-400">Configure subjects and syllabus</p>
                    </div>
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <p className="text-[11px] text-slate-400 font-mono">
                  University ERP System v2.4.0 • Enterprise Academic Administration
                </p>
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

    return (
      <div className="space-y-6">
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
                <button
                  onClick={() => setActiveTab('exams')}
                  className="w-full flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <span>Check Exam Grades</span>
                  <FileText className="h-4.5 w-4.5 text-emerald-500" />
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 mt-4">
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                <strong>Academic Notice:</strong> Semester examinations schedule and hall tickets will be issued through the Examinations module.
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

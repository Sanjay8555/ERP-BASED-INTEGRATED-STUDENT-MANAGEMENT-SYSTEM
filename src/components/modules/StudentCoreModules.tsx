/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  CalendarDays,
  Check,
  AlertCircle,
  FileSpreadsheet,
  Award,
  BookOpen,
  PlusCircle,
  X,
  FileText,
  UploadCloud,
  CheckCircle,
  Calendar,
  Upload,
  Download,
  Paperclip,
  Eye,
  FileCheck,
  ExternalLink
} from 'lucide-react';
import {
  Attendance,
  Course,
  StudentProfile,
  User,
  Exam,
  Result,
  Assignment,
  AssignmentSubmission,
  Department
} from '../../types';
import AssignmentSubmissionPreviewModal from './AssignmentSubmissionPreviewModal';

// ==========================================
// 1. ATTENDANCE TRACKER SUB-COMPONENT
// ==========================================
interface AttendanceTrackerProps {
  attendance: Attendance[];
  courses: Course[];
  students: StudentProfile[];
  users: User[];
  role: string;
  onSaveAttendance: (records: Attendance[]) => void;
  currentUser?: User;
  departments: Department[];
  onAddCourse?: (course: Course) => void;
}

export function AttendanceTracker({
  attendance,
  courses,
  students,
  users,
  role,
  onSaveAttendance,
  currentUser,
  departments,
  onAddCourse
}: AttendanceTrackerProps) {
  // Find student profile for the current user (or parent's ward)
  const studentProfile = students.find(
    s => s && (s.userId === currentUser?.id || (s.parentEmail && s.parentEmail.trim().toLowerCase() === (currentUser?.email || '').trim().toLowerCase()))
  ) || students[0];

  const currentStudentUser = users.find(u => u.id === studentProfile.userId);
  const studentDept = departments.find(d => d.id === studentProfile.departmentId);
  const studentCurrentSem = studentProfile.currentSemester || 4;
  const studentCurrentYear = Math.ceil(studentCurrentSem / 2);

  // Student Prescribed Semester view state (defaults strictly to current student's semester)
  const [activeSemFilter, setActiveSemFilter] = useState<number>(studentCurrentSem);
  const [selectedLogSubjectFilter, setSelectedLogSubjectFilter] = useState<string>('All');

  // Faculty Filter states
  const [selectedDept, setSelectedDept] = useState(departments[0]?.id || '');
  const [selectedSem, setSelectedSem] = useState(1);
  const [selectedCourse, setSelectedCourse] = useState('');

  // Quick Add Subject Modal states
  const [showQuickAddModal, setShowQuickAddModal] = useState(false);
  const [newSubName, setNewSubName] = useState('');
  const [newSubCode, setNewSubCode] = useState('');
  const [newSubCredits, setNewSubCredits] = useState(3);

  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [markingRecords, setMarkingRecords] = useState<Record<string, 'Present' | 'Absent'>>({});

  const isFaculty = role === 'Faculty' || role === 'Admin';

  // Strictly filter prescribed courses for student's department and semester
  const studentPrescribedCourses = React.useMemo(() => {
    return courses.filter(
      c => c.departmentId === studentProfile.departmentId && c.semester === activeSemFilter
    );
  }, [courses, studentProfile.departmentId, activeSemFilter]);

  const studentPrescribedCourseIds = React.useMemo(() => {
    return new Set(studentPrescribedCourses.map(c => c.id));
  }, [studentPrescribedCourses]);

  // Filter student attendance logs strictly for prescribed courses
  const studentPrescribedLogs = React.useMemo(() => {
    return attendance.filter(
      a => a && a.studentId === studentProfile.id && studentPrescribedCourseIds.has(a.courseId)
    );
  }, [attendance, studentProfile.id, studentPrescribedCourseIds]);

  // Overall statistics for the student across prescribed courses
  const studentOverallStats = React.useMemo(() => {
    let totalLectures = 0;
    let totalPresent = 0;

    studentPrescribedCourses.forEach(course => {
      const courseLogs = attendance.filter(a => a.courseId === course.id && a.studentId === studentProfile.id);
      const total = courseLogs.length > 0 ? courseLogs.length : 3;
      const present = courseLogs.filter(a => a.status === 'Present').length;
      totalLectures += total;
      totalPresent += present;
    });

    const percentage = totalLectures > 0 ? Math.round((totalPresent / totalLectures) * 100) : 100;
    return {
      percentage,
      totalLectures,
      totalPresent,
      coursesCount: studentPrescribedCourses.length
    };
  }, [studentPrescribedCourses, attendance, studentProfile.id]);

  // Update selected course when dept/sem changes for Faculty
  React.useEffect(() => {
    if (isFaculty) {
      const filtered = courses.filter(c => c.departmentId === selectedDept && c.semester === selectedSem);
      if (filtered.length > 0) {
        setSelectedCourse(filtered[0].id);
      } else {
        setSelectedCourse('');
      }
    }
  }, [selectedDept, selectedSem, isFaculty, courses]);

  // Initialize markings for Faculty
  React.useEffect(() => {
    const initial: Record<string, 'Present' | 'Absent'> = {};
    const filteredStudents = students.filter(s => s.departmentId === selectedDept && s.currentSemester === selectedSem);
    filteredStudents.forEach(s => {
      initial[s.id] = 'Present';
    });
    setMarkingRecords(initial);
  }, [students, selectedCourse, selectedDept, selectedSem, isFaculty]);

  const handleToggleStatus = (studentId: string) => {
    setMarkingRecords(prev => ({
      ...prev,
      [studentId]: prev[studentId] === 'Present' ? 'Absent' : 'Present'
    }));
  };

  const handleSave = () => {
    if (!selectedCourse) {
      alert('Please select a valid subject course first.');
      return;
    }
    const newRecords: Attendance[] = Object.entries(markingRecords).map(([studentId, status]) => ({
      id: `att-${Date.now()}-${studentId}`,
      studentId,
      courseId: selectedCourse,
      date: attendanceDate,
      status: status === 'Present' ? 'Present' : 'Absent',
      markedBy: role
    }));
    onSaveAttendance(newRecords);
    alert('Attendance logs synced to University ledger!');
  };

  // Student specific calculation for individual prescribed course
  const calculateStudentPercentage = (courseId: string, studentId: string) => {
    const courseLogs = attendance.filter(a => a.courseId === courseId && a.studentId === studentId);
    const total = courseLogs.length > 0 ? courseLogs.length : 3;
    const present = courseLogs.filter(a => a.status === 'Present').length;
    return {
      percent: Math.round((present / total) * 100),
      present,
      total
    };
  };

  return (
    <div className="space-y-6">
      {isFaculty ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-sans text-sm font-bold text-slate-900 dark:text-white">Circulate Attendance Ledger</h3>
                <p className="text-xs text-slate-400 mt-0.5">Define subject class roster state daily.</p>
              </div>
              <input
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Department</label>
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
                >
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Semester</label>
                <select
                  value={selectedSem}
                  onChange={(e) => setSelectedSem(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                    <option key={s} value={s}>Semester {s} (Year {Math.ceil(s / 2)})</option>
                  ))}
                </select>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[10px] font-bold uppercase text-slate-400">Prescribed Subject</label>
                  {onAddCourse && (
                    <button
                      type="button"
                      onClick={() => {
                        setNewSubName('');
                        setNewSubCode('');
                        setNewSubCredits(3);
                        setShowQuickAddModal(true);
                      }}
                      className="text-[10px] font-bold text-teal-600 dark:text-teal-400 hover:underline inline-flex items-center gap-0.5"
                    >
                      + Add Subject
                    </button>
                  )}
                </div>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
                >
                  {courses
                    .filter(c => c.departmentId === selectedDept && c.semester === selectedSem)
                    .map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                    ))}
                  {courses.filter(c => c.departmentId === selectedDept && c.semester === selectedSem).length === 0 && (
                    <option value="">No prescribed subjects for this term</option>
                  )}
                </select>
              </div>
            </div>

            {/* Quick Add Subject Modal */}
            {showQuickAddModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
                <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
                  <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                    <h4 className="font-sans text-xs font-bold text-slate-900 dark:text-white">
                      Add Subject to {departments.find(d => d.id === selectedDept)?.code} (Sem {selectedSem})
                    </h4>
                    <button
                      type="button"
                      onClick={() => setShowQuickAddModal(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="p-5 space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Subject Title *</label>
                      <input
                        type="text"
                        placeholder="e.g. Artificial Intelligence Systems"
                        value={newSubName}
                        onChange={(e) => setNewSubName(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Course Code *</label>
                        <input
                          type="text"
                          placeholder="e.g. CS-405"
                          value={newSubCode}
                          onChange={(e) => setNewSubCode(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono font-bold focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Credits *</label>
                        <select
                          value={newSubCredits}
                          onChange={(e) => setNewSubCredits(Number(e.target.value))}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                        >
                          {[1, 2, 3, 4, 5, 6].map(c => (
                            <option key={c} value={c}>{c} Credit{c > 1 ? 's' : ''}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => setShowQuickAddModal(false)}
                        className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-400"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (!newSubName.trim() || !newSubCode.trim()) {
                            alert('Please provide subject title and course code');
                            return;
                          }
                          const newCourse: Course = {
                            id: `c-${Date.now()}`,
                            name: newSubName.trim(),
                            code: newSubCode.trim().toUpperCase(),
                            departmentId: selectedDept,
                            semester: selectedSem,
                            credits: newSubCredits
                          };
                          if (onAddCourse) {
                            onAddCourse(newCourse);
                            setSelectedCourse(newCourse.id);
                          }
                          setShowQuickAddModal(false);
                        }}
                        className="rounded-xl bg-teal-600 px-4 py-1.5 text-xs font-bold text-white shadow-md hover:bg-teal-700"
                      >
                        Save Subject
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200/65 dark:border-slate-800 mb-6">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/40 font-bold uppercase text-slate-400">
                  <th className="px-6 py-3">Roll No</th>
                  <th className="px-6 py-3">Student Name</th>
                  <th className="px-6 py-3">Current Attendance status</th>
                  <th className="px-6 py-3 text-right">Action status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {students
                  .filter(s => s.departmentId === selectedDept && s.currentSemester === selectedSem)
                  .map(student => {
                  const u = users.find(user => user.id === student.userId);
                  const status = markingRecords[student.id] || 'Present';
                  return (
                    <tr key={student.id} className="hover:bg-slate-50/40">
                      <td className="px-6 py-3.5 font-mono font-bold text-slate-800 dark:text-slate-300">{student.rollNo}</td>
                      <td className="px-6 py-3.5 text-slate-900 dark:text-white font-bold">{u?.name}</td>
                      <td className="px-6 py-3.5">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                          status === 'Present'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                            : 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'
                        }`}>
                          {status}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <button
                          onClick={() => handleToggleStatus(student.id)}
                          className={`rounded-lg px-3 py-1.5 text-[11px] font-bold transition-all ${
                            status === 'Present'
                              ? 'bg-rose-50 border border-rose-100 text-rose-600 hover:bg-rose-100'
                              : 'bg-emerald-50 border border-emerald-100 text-emerald-600 hover:bg-emerald-100'
                          }`}
                        >
                          Mark as {status === 'Present' ? 'Absent' : 'Present'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {students.filter(s => s.departmentId === selectedDept && s.currentSemester === selectedSem).length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-400 italic">
                      No enrolled students found in this department and semester.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className="rounded-xl bg-teal-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-teal-700 transition-colors"
            >
              Sync Attendance Logs
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Prescribed Curriculum & Department Identification Banner */}
          <div className="rounded-3xl border border-teal-200/80 bg-linear-to-r from-teal-500/10 via-slate-50 to-indigo-500/10 p-6 shadow-sm dark:border-teal-900/30 dark:from-teal-950/30 dark:via-slate-900 dark:to-indigo-950/20">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-teal-500 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-xs">
                    {studentDept?.code || 'CSE'}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
                    Prescribed Department Curriculum
                  </span>
                </div>
                <h3 className="font-sans text-lg font-extrabold text-slate-900 dark:text-white mt-1">
                  {studentDept?.name || 'Computer Science & Engineering'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                  Student: <strong>{currentStudentUser?.name}</strong> • Roll No: <strong>{studentProfile.rollNo}</strong> • Year {studentCurrentYear} (Active Term: Sem {studentCurrentSem})
                </p>
              </div>

              {/* Semester Switcher Pills strictly within Department */}
              <div className="flex flex-wrap items-center gap-1.5 bg-white/80 p-1.5 rounded-2xl border border-slate-200/80 dark:bg-slate-950/80 dark:border-slate-800">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(semNum => {
                  const isCurrent = semNum === studentCurrentSem;
                  const isSelected = semNum === activeSemFilter;
                  return (
                    <button
                      key={semNum}
                      onClick={() => {
                        setActiveSemFilter(semNum);
                        setSelectedLogSubjectFilter('All');
                      }}
                      className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-teal-600 text-white shadow-md'
                          : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span>Sem {semNum}</span>
                      {isCurrent && <span className="ml-1 text-[9px] opacity-80">(Current)</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Prescribed Term Summary Metrics Grid */}
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-2xl border border-teal-200/80 bg-white/90 p-4 backdrop-blur-xs shadow-2xs dark:border-teal-900/40 dark:bg-slate-900/90">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Prescribed Term Rate</span>
                <h4 className="text-2xl font-black font-mono text-teal-600 dark:text-teal-400 mt-1">
                  {studentOverallStats.percentage}%
                </h4>
                <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                  Semester {activeSemFilter} Subjects
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 backdrop-blur-xs shadow-2xs dark:border-slate-800 dark:bg-slate-900/90">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Prescribed Subjects</span>
                <h4 className="text-2xl font-black font-mono text-slate-800 dark:text-white mt-1">
                  {studentPrescribedCourses.length} Courses
                </h4>
                <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                  {studentDept?.code} Year {Math.ceil(activeSemFilter / 2)}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 backdrop-blur-xs shadow-2xs dark:border-slate-800 dark:bg-slate-900/90">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Lectures</span>
                <h4 className="text-2xl font-black font-mono text-slate-800 dark:text-white mt-1">
                  {studentOverallStats.totalPresent} / {studentOverallStats.totalLectures}
                </h4>
                <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                  Lectures Attended
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/70 p-4 backdrop-blur-xs shadow-2xs dark:border-emerald-900/40 dark:bg-slate-900/90">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Exam Eligibility</span>
                <h4 className="text-sm font-black text-emerald-700 dark:text-emerald-300 mt-1.5 flex items-center gap-1">
                  {studentOverallStats.percentage >= 75 ? '✓ Compliant' : '⚠ Shortage Alert'}
                </h4>
                <p className="text-[10px] font-mono text-emerald-600/80 dark:text-emerald-400/80 mt-0.5">
                  Threshold: 75% Required
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Prescribed Course-wise Attendance Statistics (7 cols) */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 lg:col-span-7">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-sans text-sm font-bold text-slate-900 dark:text-white">
                    Prescribed Course Attendance ({studentDept?.code} Sem {activeSemFilter})
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Only subjects officially registered for your department & year</p>
                </div>
                <span className="font-mono text-xs font-bold text-teal-600 dark:text-teal-400">
                  {studentPrescribedCourses.length} Prescribed Subjects
                </span>
              </div>

              <div className="space-y-3">
                {studentPrescribedCourses.length > 0 ? (
                  studentPrescribedCourses.map(course => {
                    const stat = calculateStudentPercentage(course.id, studentProfile.id);
                    const progressColor = stat.percent >= 75 ? 'bg-emerald-500' : 'bg-rose-500';
                    return (
                      <div key={course.id} className="p-3.5 bg-slate-50/80 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="rounded-md bg-teal-500/10 px-2 py-0.5 text-[10px] font-mono font-bold text-teal-700 dark:text-teal-300">
                              {course.code}
                            </span>
                            <span className="font-bold text-slate-900 dark:text-white text-xs">
                              {course.name}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              ({course.credits} Credits)
                            </span>
                          </div>
                          <span className={`font-mono text-xs font-black ${stat.percent >= 75 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                            {stat.percent}%
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className={`h-full ${progressColor} rounded-full transition-all duration-500`} style={{ width: `${stat.percent}%` }} />
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-0.5">
                          <span>Attended: <strong className="text-slate-700 dark:text-slate-300">{stat.present}</strong> of <strong className="text-slate-700 dark:text-slate-300">{stat.total}</strong> lectures</span>
                          <span className={`font-bold ${stat.percent >= 75 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                            {stat.percent >= 75 ? '✓ Safe Compliance' : '⚠ Shortage Warning'}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-slate-400 italic bg-slate-50 dark:bg-slate-950 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                    No prescribed subjects configured for {studentDept?.name} in Semester {activeSemFilter}.
                  </div>
                )}
              </div>
            </div>

            {/* Prescribed Lecture Attendance Logs (5 cols) */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 lg:col-span-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-sans text-sm font-bold text-slate-900 dark:text-white">Prescribed Subject Lecture Logs</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Recent lecture session records</p>
                  </div>
                </div>

                {/* Filter dropdown by prescribed subject */}
                <div className="mb-3">
                  <select
                    value={selectedLogSubjectFilter}
                    onChange={(e) => setSelectedLogSubjectFilter(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
                  >
                    <option value="All">All Prescribed Subjects ({studentPrescribedCourses.length})</option>
                    {studentPrescribedCourses.map(c => (
                      <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                  {studentPrescribedLogs
                    .filter(log => selectedLogSubjectFilter === 'All' || log.courseId === selectedLogSubjectFilter)
                    .map(log => {
                      const c = studentPrescribedCourses.find(course => course.id === log.courseId) || courses.find(course => course.id === log.courseId);
                      return (
                        <div key={log.id} className="flex items-center justify-between rounded-xl bg-slate-50/80 p-2.5 text-xs border border-slate-100 dark:bg-slate-950/70 dark:border-slate-800">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-[10px] font-bold text-teal-600 dark:text-teal-400">
                                {c?.code}
                              </span>
                              <span className="font-bold text-slate-800 dark:text-slate-200">
                                {c?.name}
                              </span>
                            </div>
                            <span className="font-mono text-[9px] text-slate-400">{log.date}</span>
                          </div>
                          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            log.status === 'Present'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                              : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                          }`}>
                            {log.status}
                          </span>
                        </div>
                      );
                    })}

                  {studentPrescribedLogs.filter(log => selectedLogSubjectFilter === 'All' || log.courseId === selectedLogSubjectFilter).length === 0 && (
                    <p className="text-xs text-slate-400 italic text-center py-6">
                      No attendance session logs recorded for this prescribed subject.
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 font-mono flex items-center justify-between">
                <span>Verified by Department Faculty Ledger</span>
                <span>Term: Sem {activeSemFilter}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 2. EXAMINATION AND GPA SUB-COMPONENT
// ==========================================
interface ExaminationGradesProps {
  exams: Exam[];
  results: Result[];
  courses: Course[];
  students: StudentProfile[];
  users: User[];
  role: string;
  onAddResult: (newResult: Result) => void;
  currentUser?: User;
  departments: Department[];
}

export function ExaminationGrades({
  exams,
  results,
  courses,
  students,
  users,
  role,
  onAddResult,
  currentUser,
  departments
}: ExaminationGradesProps) {
  const studentProfile = students.find(
    s => s && (s.userId === currentUser?.id || (s.parentEmail && s.parentEmail.trim().toLowerCase() === (currentUser?.email || '').trim().toLowerCase()))
  );
  const currentStudentId = studentProfile?.id || 's-1';

  // Faculty Filter states
  const [selectedDept, setSelectedDept] = useState(departments[0]?.id || '');
  const [selectedSem, setSelectedSem] = useState(1);

  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedExam, setSelectedExam] = useState(exams[0]?.id || '');
  const [internalMarks, setInternalMarks] = useState(40);
  const [semesterMarks, setSemesterMarks] = useState(80);

  const isFaculty = role === 'Faculty' || role === 'Admin';

  const calculateGrade = (total: number) => {
    if (total >= 135) return { grade: 'O', gpa: 10.0 };
    if (total >= 120) return { grade: 'A+', gpa: 9.0 };
    if (total >= 110) return { grade: 'A', gpa: 8.0 };
    if (total >= 100) return { grade: 'B+', gpa: 7.0 };
    if (total >= 90) return { grade: 'B', gpa: 6.0 };
    return { grade: 'C', gpa: 5.0 };
  };

  const handlePostGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !selectedExam) return;
    const total = Number(internalMarks) + Number(semesterMarks);
    const { grade, gpa } = calculateGrade(total);

    const newRes: Result = {
      id: `res-${Date.now()}`,
      studentId: selectedStudent,
      examId: selectedExam,
      internalMarks: Number(internalMarks),
      semesterMarks: Number(semesterMarks),
      totalMarks: total,
      grade,
      gpa
    };
    onAddResult(newRes);
    alert('Grade report archived for student!');
  };

  return (
    <div className="space-y-6">
      {isFaculty ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Mark entry form */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col gap-6 mb-6">
              <h3 className="font-sans text-sm font-bold text-slate-900 dark:text-white">Publication of Official Marks & Grades</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Department</label>
                  <select
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Semester</label>
                  <select
                    value={selectedSem}
                    onChange={(e) => setSelectedSem(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Inquiry Student</label>
                  <select
                    value={selectedStudent}
                    onChange={(e) => setSelectedStudent(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
                  >
                    {students
                      .filter(s => s.departmentId === selectedDept && s.currentSemester === selectedSem)
                      .map(s => {
                        const u = users.find(user => user.id === s.userId);
                        return <option key={s.id} value={s.id}>{u?.name} ({s.rollNo})</option>;
                      })}
                    {students.filter(s => s.departmentId === selectedDept && s.currentSemester === selectedSem).length === 0 && (
                      <option value="">No students found</option>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Examination Paper</label>
                  <select
                    value={selectedExam}
                    onChange={(e) => setSelectedExam(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
                  >
                    {exams
                      .filter(e => {
                        const c = courses.find(course => course.id === e.courseId);
                        return c?.departmentId === selectedDept && c?.semester === selectedSem;
                      })
                      .map(e => (
                        <option key={e.id} value={e.id}>{e.name}</option>
                      ))}
                    {exams.filter(e => {
                      const c = courses.find(course => course.id === e.courseId);
                      return c?.departmentId === selectedDept && c?.semester === selectedSem;
                    }).length === 0 && (
                      <option value="">No exams found</option>
                    )}
                  </select>
                </div>
              </div>
            </div>

            <form onSubmit={handlePostGrade} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Internal Marks (Max 50)</label>
                  <input
                    type="number"
                    max={50}
                    value={internalMarks}
                    onChange={(e) => setInternalMarks(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Semester Exam (Max 100)</label>
                  <input
                    type="number"
                    max={100}
                    value={semesterMarks}
                    onChange={(e) => setSemesterMarks(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-teal-600 py-2.5 text-xs font-bold text-white hover:bg-teal-700 transition-colors"
                disabled={!selectedStudent || !selectedExam}
              >
                Sync & Archive Grades
              </button>
            </form>
          </div>

          {/* Master Grade-sheet Ledger */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
            <h3 className="font-sans text-sm font-bold text-slate-900 dark:text-white mb-4">University Marks Registry</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/40 font-bold uppercase text-slate-400">
                    <th className="px-4 py-3">Student</th>
                    <th className="px-4 py-3">Subject / Exam</th>
                    <th className="px-4 py-3 text-center">Internals</th>
                    <th className="px-4 py-3 text-center">Semester</th>
                    <th className="px-4 py-3 text-center">Total Score</th>
                    <th className="px-4 py-3 text-right">Grade (GPA)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {results.map(res => {
                    const student = students.find(s => s.id === res.studentId);
                    const stuUser = users.find(u => u.id === student?.userId);
                    const exam = exams.find(e => e.id === res.examId);
                    const course = courses.find(c => c.id === exam?.courseId);
                    return (
                      <tr key={res.id} className="hover:bg-slate-50/40">
                        <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{stuUser?.name}</td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-slate-700 dark:text-slate-300">{course?.name}</p>
                          <span className="font-mono text-[9px] text-slate-400">{exam?.name}</span>
                        </td>
                        <td className="px-4 py-3 text-center font-mono">{res.internalMarks}</td>
                        <td className="px-4 py-3 text-center font-mono">{res.semesterMarks}</td>
                        <td className="px-4 py-3 text-center font-mono font-bold">{res.totalMarks}</td>
                        <td className="px-4 py-3 text-right">
                          <span className="inline-flex items-center rounded-lg bg-teal-50 px-2.5 py-0.5 font-mono font-black text-teal-700 dark:bg-teal-950/50 dark:text-teal-300">
                            {res.grade} ({res.gpa.toFixed(2)})
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900 max-w-4xl mx-auto">
          {/* Printable Marksheet Frame */}
          <div className="border-4 border-double border-slate-200 p-6 rounded-xl dark:border-slate-700">
            <div className="text-center border-b pb-4 mb-6">
              <h2 className="font-sans text-lg font-black uppercase tracking-wider text-teal-700 dark:text-teal-400">University Institute of Technology</h2>
              <p className="text-[10px] uppercase font-mono tracking-widest text-slate-400 mt-1">Primary Academic Transcript & Marksheet</p>
              <p className="text-xs text-slate-500 mt-2">Boston Main Campus, Massachusetts • V2.4.0 ERP</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-600 dark:text-slate-400 mb-6 font-sans">
              <div>
                <p>STUDENT NAME: <strong className="text-slate-800 dark:text-white">{users.find(u => u.id === studentProfile?.userId)?.name}</strong></p>
                <p className="mt-1">ROLL NO: <strong className="text-slate-800 dark:text-white">{studentProfile?.rollNo}</strong></p>
              </div>
              <div className="text-right">
                <p>TERM: <strong className="text-slate-800 dark:text-white">Semester {studentProfile?.currentSemester}</strong></p>
                <p className="mt-1">DATE PUBLISHED: <strong className="text-slate-800 dark:text-white">{new Date().toISOString().split('T')[0]}</strong></p>
              </div>
            </div>

            <table className="w-full border-collapse border text-xs text-left">
              <thead>
                <tr className="bg-slate-50 border-b font-bold dark:bg-slate-950 dark:border-slate-800">
                  <th className="p-3 border-r">Course Code</th>
                  <th className="p-3 border-r">Subject</th>
                  <th className="p-3 border-r text-center">Internals (50)</th>
                  <th className="p-3 border-r text-center">Semester (100)</th>
                  <th className="p-3 text-right">Grade (GPA)</th>
                </tr>
              </thead>
              <tbody className="divide-y font-medium dark:divide-slate-800">
                {results.filter(r => r.studentId === currentStudentId).map(res => {
                  const exam = exams.find(e => e.id === res.examId);
                  const course = courses.find(c => c.id === exam?.courseId);
                  return (
                    <tr key={res.id}>
                      <td className="p-3 border-r font-mono font-bold">{course?.code}</td>
                      <td className="p-3 border-r">{course?.name}</td>
                      <td className="p-3 border-r text-center font-mono">{res.internalMarks}</td>
                      <td className="p-3 border-r text-center font-mono">{res.semesterMarks}</td>
                      <td className="p-3 text-right font-mono font-bold text-teal-600 dark:text-teal-400">
                        {res.grade} ({res.gpa.toFixed(2)})
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* GPA summary */}
            <div className="mt-6 border-t pt-4 flex justify-between items-center text-xs">
              <p className="font-semibold text-slate-400">Registrar Sign: RAJESH</p>
              <div className="text-right">
                <p className="font-bold text-slate-700 dark:text-slate-300">Degree: B.E. / B.Tech</p>
                <p className="text-sm font-black text-teal-600 mt-1">Current Status: ACTIVE</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 3. ASSIGNMENT MANAGEMENT SUB-COMPONENT
// ==========================================
interface AssignmentSubmissionsProps {
  assignments: Assignment[];
  submissions: AssignmentSubmission[];
  courses: Course[];
  students: StudentProfile[];
  users: User[];
  role: string;
  onAddAssignment: (asg: Assignment) => void;
  onSubmitAssignment: (sub: AssignmentSubmission) => void;
  onGradeSubmission: (subId: string, marks: number, feedback: string) => void;
  currentUser?: User;
  departments: Department[];
}

export function AssignmentSubmissions({
  assignments,
  submissions,
  courses,
  students,
  users,
  role,
  onAddAssignment,
  onSubmitAssignment,
  onGradeSubmission,
  currentUser,
  departments
}: AssignmentSubmissionsProps) {
  const studentProfile = students.find(
    s => s && (s.userId === currentUser?.id || (s.parentEmail && s.parentEmail.trim().toLowerCase() === (currentUser?.email || '').trim().toLowerCase()))
  );
  const currentStudentId = studentProfile?.id || 's-1';

  // Faculty Filter states
  const [selectedDept, setSelectedDept] = useState(departments[0]?.id || '');
  const [selectedSem, setSelectedSem] = useState(1);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // In-App Zero-Download Preview State
  const [selectedSubForPreview, setSelectedSubForPreview] = useState<AssignmentSubmission | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [submissionSuccessBanner, setSubmissionSuccessBanner] = useState<string | null>(null);

  const [gradingSubId, setGradingSubId] = useState('');
  const [selectedAsgForUpload, setSelectedAsgForUpload] = useState<Assignment | null>(null);

  // Form states (Add Assignment)
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [courseId, setCourseId] = useState(courses[0]?.id || '');
  const [dueDate, setDueDate] = useState('');
  const [maxMarks, setMaxMarks] = useState(50);

  // Form states (Student Upload Task)
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState<string>('');
  const [fileSizeFormatted, setFileSizeFormatted] = useState<string>('');
  const [submissionTextNotes, setSubmissionTextNotes] = useState('');

  // Form states (Grade)
  const [score, setScore] = useState(45);
  const [feedback, setFeedback] = useState('Excellent structure.');

  const isFaculty = role === 'Faculty' || role === 'Admin';

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) return;

    const newAsg: Assignment = {
      id: `asg-${Date.now()}`,
      title,
      description: desc,
      courseId,
      dueDate,
      facultyId: 'f-1',
      maxMarks: Number(maxMarks)
    };
    onAddAssignment(newAsg);
    setShowAddModal(false);
    setTitle('');
    setDesc('');
  };

  const handleOpenUploadModal = (asg: Assignment) => {
    setSelectedAsgForUpload(asg);
    setUploadFile(null);
    setFileBase64('');
    setFileSizeFormatted('');
    setSubmissionTextNotes('');
    setShowUploadModal(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds maximum limit of 10MB.');
      return;
    }

    setUploadFile(file);
    const sizeKB = (file.size / 1024).toFixed(1);
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    setFileSizeFormatted(file.size >= 1024 * 1024 ? `${sizeMB} MB` : `${sizeKB} KB`);

    const reader = new FileReader();
    reader.onload = () => {
      setFileBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitUploadedTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsgForUpload) return;

    try {
      let safeFileUrl = fileBase64;
      if (safeFileUrl && safeFileUrl.length > 400000) {
        // Cap payload size for direct Base64 preview to prevent memory & localStorage quota crashes
        safeFileUrl = 'data:application/pdf;base64,JVBERi0xLjQK...';
      }

      const newSub: AssignmentSubmission = {
        id: `sub-${Date.now()}`,
        assignmentId: selectedAsgForUpload.id,
        studentId: currentStudentId,
        submissionDate: new Date().toISOString().split('T')[0],
        status: 'Submitted',
        fileName: uploadFile?.name || 'Submitted_Task.pdf',
        fileSize: fileSizeFormatted || '1.2 MB',
        fileUrl: safeFileUrl || 'data:application/pdf;base64,JVBERi0xLjQK...',
        submissionText: submissionTextNotes
      };

      onSubmitAssignment(newSub);
      setShowUploadModal(false);
      setSelectedAsgForUpload(null);
      setUploadFile(null);
      setFileBase64('');
      setSubmissionTextNotes('');

      // Instantly open the preview modal so student can preview their submission right after submitting!
      setSelectedSubForPreview(newSub);
      setShowPreviewModal(true);
      setSubmissionSuccessBanner(`Task "${newSub.fileName}" successfully submitted! You can review your submission preview below.`);
      setTimeout(() => setSubmissionSuccessBanner(null), 6000);
    } catch (err) {
      console.error('Submission error:', err);
      setShowUploadModal(false);
      alert('Task submitted successfully.');
    }
  };

  const handleOpenGrading = (subId: string) => {
    const sub = submissions.find(s => s.id === subId);
    if (sub) {
      setSelectedSubForPreview(sub);
      setShowPreviewModal(true);
    } else {
      setGradingSubId(subId);
      setScore(45);
      setFeedback('Well articulated submission.');
      setShowGradeModal(true);
    }
  };

  const handleSaveGrade = (e: React.FormEvent) => {
    e.preventDefault();
    onGradeSubmission(gradingSubId, Number(score), feedback);
    setShowGradeModal(false);
  };

  // Staff & Admin Export Sheet (.CSV) feature
  const handleExportSheetCSV = () => {
    const activeSubmissions = submissions.filter(sub => {
      const asg = assignments.find(a => a.id === sub.assignmentId);
      const course = courses.find(c => c.id === asg?.courseId);
      return course?.departmentId === selectedDept && course?.semester === selectedSem;
    });

    if (activeSubmissions.length === 0) {
      alert('No task submissions found for the selected department and semester to export.');
      return;
    }

    const headers = [
      'Roll No',
      'Student Name',
      'Department',
      'Course Code',
      'Course Name',
      'Assignment Title',
      'Submission Date',
      'Status',
      'Marks Obtained',
      'Max Marks',
      'Attached File Name',
      'File Size',
      'Student Submission Notes'
    ];

    const rows = activeSubmissions.map(sub => {
      const student = students.find(s => s.id === sub.studentId);
      const stuUser = users.find(u => u.id === student?.userId);
      const asg = assignments.find(a => a.id === sub.assignmentId);
      const course = courses.find(c => c.id === asg?.courseId);
      const dept = departments.find(d => d.id === course?.departmentId);

      return [
        `"${student?.rollNo || ''}"`,
        `"${stuUser?.name || ''}"`,
        `"${dept?.name || ''}"`,
        `"${course?.code || ''}"`,
        `"${course?.name || ''}"`,
        `"${asg?.title || ''}"`,
        `"${sub.submissionDate || ''}"`,
        `"${sub.status}"`,
        sub.marksObtained !== undefined ? sub.marksObtained : 'N/A',
        asg?.maxMarks || 50,
        `"${sub.fileName || 'N/A'}"`,
        `"${sub.fileSize || 'N/A'}"`,
        `"${(sub.submissionText || sub.feedback || '').replace(/"/g, '""')}"`
      ];
    });

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Task_Submissions_Ledger_Dept${selectedDept}_Sem${selectedSem}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadFileAttachment = (sub: AssignmentSubmission) => {
    const fileName = sub.fileName || 'Task_Submission.pdf';
    const fileUrl = sub.fileUrl || 'data:application/pdf;base64,JVBERi0xLjQK...';

    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Student Post-Submission Banner */}
      {submissionSuccessBanner && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/90 px-4 py-3 text-xs font-bold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-200 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{submissionSuccessBanner}</span>
          </div>
          {selectedSubForPreview && (
            <button
              onClick={() => setShowPreviewModal(true)}
              className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition-colors"
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Preview Now</span>
            </button>
          )}
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-sans text-lg font-bold text-slate-800 dark:text-white">Homework & Assessment Tasks Board</h2>
          {isFaculty && (
            <div className="mt-2 flex flex-wrap gap-2 items-center">
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
              >
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
              <select
                value={selectedSem}
                onChange={(e) => setSelectedSem(Number(e.target.value))}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                  <option key={s} value={s}>Semester {s}</option>
                ))}
              </select>

              {/* Download Tasks Sheet Button */}
              <button
                onClick={handleExportSheetCSV}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1 text-[11px] font-bold text-white shadow-xs hover:bg-emerald-700 transition-colors"
                title="Download task submissions spreadsheet"
              >
                <FileSpreadsheet className="h-3.5 w-3.5" /> Download Sheet (.csv)
              </button>
            </div>
          )}
        </div>
        {isFaculty && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-teal-700 transition-colors"
          >
            <PlusCircle className="h-4 w-4" /> Create New Assessment Task
          </button>
        )}
      </div>

      {isFaculty ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Submissions Table / Sheet View for Staff & Admin */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 lg:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-sans text-sm font-bold text-slate-900 dark:text-white">Student Assessment & Task Submissions Ledger</h3>
                <p className="text-[11px] text-slate-500">Click on any submission or file to preview directly in-app without downloading.</p>
              </div>
              <button
                onClick={handleExportSheetCSV}
                className="hidden sm:flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300 transition-colors"
              >
                <Download className="h-4 w-4" /> Export Tasks to Sheet
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/40 font-bold uppercase text-slate-400">
                    <th className="px-4 py-3">Roll No</th>
                    <th className="px-4 py-3">Student Name</th>
                    <th className="px-4 py-3">Assessment / Task Title</th>
                    <th className="px-4 py-3">Submitted File Attachment (Zero-Download Preview)</th>
                    <th className="px-4 py-3 text-center">Score</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {submissions
                    .filter(sub => {
                      const asg = assignments.find(a => a.id === sub.assignmentId);
                      const course = courses.find(c => c.id === asg?.courseId);
                      return course?.departmentId === selectedDept && course?.semester === selectedSem;
                    })
                    .map(sub => {
                      const student = students.find(s => s.id === sub.studentId);
                      const stuUser = users.find(u => u.id === student?.userId);
                      const asg = assignments.find(a => a.id === sub.assignmentId);
                      return (
                        <tr key={sub.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                          <td className="px-4 py-3 font-mono font-bold text-slate-800 dark:text-slate-200">{student?.rollNo || 'N/A'}</td>
                          <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{stuUser?.name}</td>
                          <td className="px-4 py-3">
                            <p className="font-semibold text-slate-800 dark:text-slate-200">{asg?.title}</p>
                            <span className="text-[10px] font-mono text-slate-400">Submitted on: {sub.submissionDate}</span>
                          </td>
                          <td className="px-4 py-3">
                            {sub.fileName ? (
                              <div className="flex items-center gap-1.5">
                                {/* Primary Zero-Download In-App Preview Trigger */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedSubForPreview(sub);
                                    setShowPreviewModal(true);
                                  }}
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-teal-200 bg-teal-50/70 px-2.5 py-1 text-[11px] font-bold text-teal-700 hover:bg-teal-100 dark:border-teal-900 dark:bg-teal-950/50 dark:text-teal-300 transition-all cursor-pointer"
                                  title="Click to preview file directly in-app without downloading"
                                >
                                  <Eye className="h-3.5 w-3.5 text-teal-600" />
                                  <span className="max-w-[130px] truncate">{sub.fileName}</span>
                                  <span className="text-[9px] font-normal text-slate-500">({sub.fileSize || '1.5 MB'})</span>
                                </button>

                                {/* Optional secondary download button */}
                                <button
                                  type="button"
                                  onClick={() => handleDownloadFileAttachment(sub)}
                                  className="p-1 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                  title="Download original file copy"
                                >
                                  <Download className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic text-[11px]">No file attached</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {sub.status === 'Graded' ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 font-mono font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 text-[11px]">
                                {sub.marksObtained} / {asg?.maxMarks}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-600 dark:bg-amber-950/40 dark:text-amber-300">
                                Pending
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right space-x-2">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedSubForPreview(sub);
                                setShowPreviewModal(true);
                              }}
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 transition-colors"
                              title="Preview submission document and notes without downloading"
                            >
                              <Eye className="h-3.5 w-3.5 text-teal-600" />
                              <span>Preview</span>
                            </button>

                            {sub.status === 'Submitted' && (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedSubForPreview(sub);
                                  setShowPreviewModal(true);
                                }}
                                className="inline-flex items-center gap-1 rounded-lg bg-teal-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-teal-700 transition-colors shadow-xs"
                                title="Grade this submission"
                              >
                                <FileCheck className="h-3.5 w-3.5" /> Grade
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  {submissions.filter(sub => {
                    const asg = assignments.find(a => a.id === sub.assignmentId);
                    const course = courses.find(c => c.id === asg?.courseId);
                    return course?.departmentId === selectedDept && course?.semester === selectedSem;
                  }).length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 italic">
                        No task submissions found for the selected department and semester.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Student View: Course Assignments & Upload Submission */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-sans text-sm font-bold text-slate-900 dark:text-white">Course Assignment & Task Portal</h3>
                <p className="text-[11px] text-slate-500">Assignments specific to your enrolled department and semester.</p>
              </div>
              {studentProfile && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 text-[11px] font-bold text-teal-700 dark:bg-teal-950/50 dark:text-teal-300 border border-teal-200 dark:border-teal-900">
                  <BookOpen className="h-3.5 w-3.5" />
                  {departments.find(d => d.id === studentProfile.departmentId)?.name || 'Department'} • Semester {studentProfile.currentSemester || 1}
                </span>
              )}
            </div>

            <div className="space-y-4">
              {assignments
                .filter(asg => {
                  const course = courses.find(c => c.id === asg.courseId);
                  if (!course) return true;
                  if (studentProfile) {
                    const matchDept = !studentProfile.departmentId || course.departmentId === studentProfile.departmentId;
                    const matchSem = !studentProfile.currentSemester || course.semester === studentProfile.currentSemester;
                    return matchDept && matchSem;
                  }
                  return true;
                })
                .map(asg => {
                  const sub = submissions.find(s => s.assignmentId === asg.id && s.studentId === currentStudentId);
                  const course = courses.find(c => c.id === asg.courseId);
                  return (
                    <div key={asg.id} className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 rounded-2xl">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white">{asg.title}</h4>
                          <p className="text-[10px] font-bold text-teal-600 mt-0.5">{course?.name} ({course?.code})</p>
                        </div>
                        <span className="text-[10px] bg-rose-50 border border-rose-100 text-rose-600 dark:bg-rose-950/40 dark:border-rose-900 font-bold px-2 py-0.5 rounded-full">
                          DUE: {asg.dueDate}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-3">{asg.description}</p>
                      
                      <div className="mt-4 border-t border-slate-200/50 dark:border-slate-800 pt-3 flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[11px] font-mono text-slate-400">Max Score: {asg.maxMarks}</span>

                        {sub ? (
                          <div className="flex flex-wrap items-center gap-2">
                            {/* Preview Submitted Assignment Button */}
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedSubForPreview(sub);
                                setShowPreviewModal(true);
                              }}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-teal-200 bg-teal-50/90 px-3 py-1 text-xs font-bold text-teal-700 hover:bg-teal-100 dark:border-teal-900 dark:bg-teal-950/50 dark:text-teal-300 transition-all shadow-2xs"
                              title="Preview your submitted assignment without downloading"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              <span>Preview Submission</span>
                            </button>

                            <span className="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 px-2.5 py-1 rounded-lg text-xs font-bold inline-flex items-center gap-1">
                              <CheckCircle className="h-3.5 w-3.5" />
                              {sub.status === 'Graded' ? `Graded: ${sub.marksObtained}/${asg.maxMarks}` : 'Submitted'}
                            </span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleOpenUploadModal(asg)}
                            className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-xs transition-all"
                          >
                            <Upload className="h-3.5 w-3.5" /> Upload & Submit Task
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              {assignments.filter(asg => {
                const course = courses.find(c => c.id === asg.courseId);
                if (!course) return true;
                if (studentProfile) {
                  const matchDept = !studentProfile.departmentId || course.departmentId === studentProfile.departmentId;
                  const matchSem = !studentProfile.currentSemester || course.semester === studentProfile.currentSemester;
                  return matchDept && matchSem;
                }
                return true;
              }).length === 0 && (
                <div className="py-8 text-center text-slate-400 italic text-xs">
                  No active assignments found for your department and semester.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <h3 className="font-sans text-sm font-bold text-slate-900 dark:text-white mb-4">Academic Feedbacks & Marks</h3>
            <div className="space-y-4">
              {submissions.filter(s => s.studentId === currentStudentId && s.status === 'Graded').map(sub => {
                const asg = assignments.find(a => a.id === sub.assignmentId);
                return (
                  <div key={sub.id} className="p-4 bg-teal-50/50 border border-teal-100 rounded-2xl dark:bg-teal-950/20 dark:border-teal-900 space-y-2">
                    <div className="flex justify-between items-start">
                      <p className="font-bold text-slate-900 dark:text-white">{asg?.title}</p>
                      <span className="text-xs font-mono font-bold text-teal-700 dark:text-teal-300 bg-teal-100 dark:bg-teal-900/50 px-2 py-0.5 rounded-md">
                        Score: {sub.marksObtained} / {asg?.maxMarks}
                      </span>
                    </div>
                    <p className="text-xs italic text-slate-600 dark:text-slate-300">"{sub.feedback}"</p>
                    <div className="pt-2 border-t border-teal-100/80 dark:border-teal-900/60 flex items-center justify-between">
                      {sub.fileName && (
                        <p className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                          <Paperclip className="h-3 w-3 text-teal-600" /> {sub.fileName}
                        </p>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSubForPreview(sub);
                          setShowPreviewModal(true);
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-600 hover:underline dark:text-teal-400 ml-auto"
                      >
                        <Eye className="h-3 w-3" /> Preview Submission
                      </button>
                    </div>
                  </div>
                );
              })}
              {submissions.filter(s => s.studentId === currentStudentId && s.status === 'Graded').length === 0 && (
                <div className="py-8 text-center text-slate-400 italic text-xs">
                  No graded tasks available yet.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Student Upload Task Modal */}
      {showUploadModal && selectedAsgForUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
              <div>
                <h3 className="font-sans text-sm font-bold text-slate-900 dark:text-white">Submit Assessment / Task</h3>
                <p className="text-[11px] text-teal-600 font-semibold">{selectedAsgForUpload.title}</p>
              </div>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:bg-slate-100 p-1.5 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitUploadedTask} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Upload Document / File (PDF, DOCX, TXT, ZIP, Code)</label>
                <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-teal-500 rounded-2xl p-6 text-center transition-colors">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.txt,.zip,.png,.jpg,.csv"
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    required={!uploadFile}
                  />
                  <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
                    <div className="h-10 w-10 rounded-full bg-teal-50 dark:bg-teal-950 flex items-center justify-center text-teal-600">
                      <UploadCloud className="h-6 w-6" />
                    </div>
                    {uploadFile ? (
                      <div className="text-center">
                        <p className="font-bold text-xs text-slate-900 dark:text-white flex items-center justify-center gap-1">
                          <Paperclip className="h-3.5 w-3.5 text-teal-600" /> {uploadFile.name}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">Size: {fileSizeFormatted}</p>
                      </div>
                    ) : (
                      <>
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Click or Drag & Drop to Upload Task File</p>
                        <p className="text-[10px] text-slate-400">Supports PDF, DOCX, TXT, ZIP up to 10MB</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Submission Comments / Notes (Optional)</label>
                <textarea
                  value={submissionTextNotes}
                  onChange={(e) => setSubmissionTextNotes(e.target.value)}
                  placeholder="Enter any comments or explanations regarding your task..."
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-teal-700 transition-all"
                >
                  <Upload className="h-4 w-4" /> Submit Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* In-App Zero-Download Assignment Submission Document Previewer Modal */}
      {showPreviewModal && selectedSubForPreview && (
        <AssignmentSubmissionPreviewModal
          submission={selectedSubForPreview}
          assignment={assignments.find(a => a.id === selectedSubForPreview.assignmentId)}
          course={courses.find(c => c.id === assignments.find(a => a.id === selectedSubForPreview.assignmentId)?.courseId)}
          student={students.find(s => s.id === selectedSubForPreview.studentId)}
          studentUser={users.find(u => u.id === students.find(s => s.id === selectedSubForPreview.studentId)?.userId)}
          department={departments.find(d => d.id === courses.find(c => c.id === assignments.find(a => a.id === selectedSubForPreview.assignmentId)?.courseId)?.departmentId)}
          isOpen={showPreviewModal}
          onClose={() => {
            setShowPreviewModal(false);
            setSelectedSubForPreview(null);
          }}
          canGrade={isFaculty}
          onGrade={(subId, marksVal, feedbackVal) => {
            onGradeSubmission(subId, marksVal, feedbackVal);
          }}
          onDownloadFile={handleDownloadFileAttachment}
        />
      )}

      {/* Add Assessment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
              <h3 className="font-sans text-sm font-bold text-slate-900 dark:text-white">Define Assessment Task</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:bg-slate-100 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateAssignment} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Course</label>
                <select
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                >
                  {courses
                    .filter(c => c.departmentId === selectedDept && c.semester === selectedSem)
                    .map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                    ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Max Score</label>
                  <input
                    type="number"
                    value={maxMarks}
                    onChange={(e) => setMaxMarks(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Description / Instructions</label>
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>
              <button type="submit" className="w-full bg-teal-600 text-white font-bold py-2.5 rounded-xl shadow-md hover:bg-teal-700">
                Publish Assessment Task
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Grade Modal */}
      {showGradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4">Grade & Evaluate Task</h3>
            <form onSubmit={handleSaveGrade} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Marks Obtained</label>
                <input
                  type="number"
                  value={score}
                  onChange={(e) => setScore(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Staff Feedback</label>
                <input
                  type="text"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGradeModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button type="submit" className="bg-teal-600 text-white font-bold px-5 py-2 rounded-xl text-xs hover:bg-teal-700">
                  Save Grade & Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

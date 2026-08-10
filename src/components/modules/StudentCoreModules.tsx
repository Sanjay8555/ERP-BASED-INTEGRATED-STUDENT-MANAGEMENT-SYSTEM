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
}

export function AttendanceTracker({
  attendance,
  courses,
  students,
  users,
  role,
  onSaveAttendance,
  currentUser,
  departments
}: AttendanceTrackerProps) {
  // Find student profile for the current user (if student)
  const studentProfile = students.find(s => s.userId === currentUser?.id);
  const currentStudentId = studentProfile?.id || 's-1';

  // Faculty Filter states
  const [selectedDept, setSelectedDept] = useState(departments[0]?.id || '');
  const [selectedSem, setSelectedSem] = useState(1);
  const [selectedCourse, setSelectedCourse] = useState('');

  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [markingRecords, setMarkingRecords] = useState<Record<string, 'Present' | 'Absent'>>({});

  const isFaculty = role === 'Faculty' || role === 'Admin';

  // Update selected course when dept/sem changes
  React.useEffect(() => {
    if (isFaculty) {
      const filtered = courses.filter(c => c.departmentId === selectedDept && c.semester === selectedSem);
      if (filtered.length > 0) {
        setSelectedCourse(filtered[0].id);
      } else {
        setSelectedCourse('');
      }
    } else {
       setSelectedCourse(courses[0]?.id || '');
    }
  }, [selectedDept, selectedSem, isFaculty]);

  // Initialize markings
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

  // Student specific view: calculations
  const calculateStudentPercentage = (courseId: string, studentId: string = 's-1') => {
    const courseLogs = attendance.filter(a => a.courseId === courseId && a.studentId === studentId);
    const total = courseLogs.length;
    if (total === 0) return { percent: 100, present: 0, total: 0 }; // default/good start
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
                    <option key={d.id} value={d.id}>{d.name}</option>
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
                    <option key={s} value={s}>Semester {s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Subject Course</label>
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
                    <option value="">No subjects found</option>
                  )}
                </select>
              </div>
            </div>
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
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* Student percentage panel */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <h3 className="font-sans text-sm font-bold text-slate-900 dark:text-white mb-4">Course-wise Attendance Statistics</h3>
            <div className="space-y-4">
              {courses.map(course => {
                const stat = calculateStudentPercentage(course.id, currentStudentId);
                const progressColor = stat.percent >= 75 ? 'bg-emerald-500' : 'bg-rose-500';
                return (
                  <div key={course.id} className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 rounded-xl">
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-slate-800 dark:text-white">{course.name} ({course.code})</span>
                      <span className={`text-xs ${stat.percent >= 75 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {stat.percent}%
                      </span>
                    </div>
                    {/* Progress Bar */}
                    <div className="h-2 w-full bg-slate-200 dark:bg-slate-850 rounded-full mt-2 overflow-hidden">
                      <div className={`h-full ${progressColor} rounded-full transition-all`} style={{ width: `${stat.percent}%` }} />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1.5 font-mono">
                      <span>Attended: {stat.present} lectures</span>
                      <span>Total Syllabus Lectures: {stat.total || 3}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Daily chronological log panel */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <h3 className="font-sans text-sm font-bold text-slate-900 dark:text-white mb-4">My Lecture Logs</h3>
            <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-1">
              {attendance.filter(a => a.studentId === currentStudentId).map(log => {
                const c = courses.find(course => course.id === log.courseId);
                return (
                  <div key={log.id} className="flex items-center justify-between border-b border-slate-100 pb-2.5 dark:border-slate-800">
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{c?.name}</p>
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
  const studentProfile = students.find(s => s.userId === currentUser?.id);
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
  assignments = [],
  submissions = [],
  courses = [],
  students = [],
  users = [],
  role = 'Student',
  onAddAssignment,
  onSubmitAssignment,
  onGradeSubmission,
  currentUser,
  departments = []
}: AssignmentSubmissionsProps) {
  const safeAssignments = Array.isArray(assignments) ? assignments.filter(Boolean) : [];
  const safeSubmissions = Array.isArray(submissions) ? submissions.filter(Boolean) : [];
  const safeCourses = Array.isArray(courses) ? courses.filter(Boolean) : [];
  const safeStudents = Array.isArray(students) ? students.filter(Boolean) : [];
  const safeUsers = Array.isArray(users) ? users.filter(Boolean) : [];
  const safeDepartments = Array.isArray(departments) ? departments.filter(Boolean) : [];

  const studentProfile = safeStudents.find(s => s && s.userId === currentUser?.id);
  const currentStudentId = studentProfile?.id || 's-1';

  // Department & Semester filter states (initialized to student's profile if student, or default dept/sem)
  const defaultDeptId = studentProfile?.departmentId || safeDepartments[0]?.id || 'dept-5';
  const defaultSem = Number(studentProfile?.currentSemester) || 4;

  const [selectedDept, setSelectedDept] = useState(defaultDeptId);
  const [selectedSem, setSelectedSem] = useState(defaultSem);

  useEffect(() => {
    if (studentProfile?.departmentId) {
      setSelectedDept(studentProfile.departmentId);
    }
    if (studentProfile?.currentSemester) {
      setSelectedSem(Number(studentProfile.currentSemester));
    }
  }, [studentProfile?.departmentId, studentProfile?.currentSemester]);

  const selectedDepartmentObj = safeDepartments.find(d => d && d.id === selectedDept) || safeDepartments[0];
  const selectedSemYear = Math.ceil((Number(selectedSem) || 4) / 2);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showViewDetailsModal, setShowViewDetailsModal] = useState(false);

  const [gradingSubId, setGradingSubId] = useState('');
  const [selectedAsgForUpload, setSelectedAsgForUpload] = useState<Assignment | null>(null);
  const [selectedSubForView, setSelectedSubForView] = useState<AssignmentSubmission | null>(null);

  // Form states (Add Assignment)
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [courseId, setCourseId] = useState('');
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

  // Filter student assignments strictly by selected department and semester/year
  const visibleStudentAssignments = safeAssignments.filter(asg => {
    if (!asg) return false;
    const course = safeCourses.find(c => c && c.id === asg.courseId);
    if (!course) return true;
    return course.departmentId === selectedDept && Number(course.semester) === Number(selectedSem);
  });

  const handleOpenAddModal = () => {
    const availableCourses = courses.filter(c => c.departmentId === selectedDept && c.semester === selectedSem);
    setCourseId(availableCourses[0]?.id || courses[0]?.id || '');
    setShowAddModal(true);
  };

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) return;

    const availableCourses = courses.filter(c => c.departmentId === selectedDept && c.semester === selectedSem);
    const finalCourseId = availableCourses.some(c => c.id === courseId)
      ? courseId
      : (availableCourses[0]?.id || courses[0]?.id || '');

    const newAsg: Assignment = {
      id: `asg-${Date.now()}`,
      title,
      description: desc,
      courseId: finalCourseId,
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

    const newSub: AssignmentSubmission = {
      id: `sub-${Date.now()}`,
      assignmentId: selectedAsgForUpload.id,
      studentId: currentStudentId,
      submissionDate: new Date().toISOString().split('T')[0],
      status: 'Submitted',
      fileName: uploadFile?.name || 'Submitted_Task.pdf',
      fileSize: fileSizeFormatted || '1.2 MB',
      fileUrl: fileBase64 || 'data:application/pdf;base64,JVBERi0xLjQK...',
      submissionText: submissionTextNotes
    };

    onSubmitAssignment(newSub);
    setShowUploadModal(false);
    alert('🎉 Task / Assessment successfully submitted with file attachment!');
  };

  const handleOpenGrading = (subId: string) => {
    setGradingSubId(subId);
    setScore(45);
    setFeedback('Well articulated submission.');
    setShowGradeModal(true);
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
      'Semester',
      'Academic Year',
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
        `"Semester ${course?.semester || ''}"`,
        `"Year ${Math.ceil((course?.semester || 1) / 2)}"`,
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-sans text-lg font-bold text-slate-800 dark:text-white">Homework & Assessment Tasks Board</h2>
          <div className="mt-2 flex flex-wrap gap-2 items-center">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Target Department & Year:</span>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 focus:outline-hidden"
            >
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
              ))}
            </select>
            <select
              value={selectedSem}
              onChange={(e) => setSelectedSem(Number(e.target.value))}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 focus:outline-hidden"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                <option key={s} value={s}>Semester {s} (Year {Math.ceil(s / 2)})</option>
              ))}
            </select>

            {/* Download Tasks Sheet Button for Faculty */}
            {isFaculty && (
              <button
                onClick={handleExportSheetCSV}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1 text-[11px] font-bold text-white shadow-xs hover:bg-emerald-700 transition-colors"
                title="Download task submissions spreadsheet"
              >
                <FileSpreadsheet className="h-3.5 w-3.5" /> Download Sheet (.csv)
              </button>
            )}
          </div>
        </div>
        {isFaculty && (
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-teal-700 transition-colors"
          >
            <PlusCircle className="h-4 w-4" /> Create New Assessment Task
          </button>
        )}
      </div>

      {isFaculty ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Active Tasks Assigned to Selected Department & Semester */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 lg:col-span-3">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-sans text-sm font-bold text-slate-900 dark:text-white">
                  Active Tasks Assigned for {selectedDepartmentObj?.name || 'Department'}
                </h3>
                <p className="text-[11px] text-teal-600 font-semibold">
                  Filtered by Semester {selectedSem} (Year {Math.ceil(selectedSem / 2)})
                </p>
              </div>
              <span className="text-[11px] font-bold bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 px-3 py-1 rounded-full">
                {assignments.filter(a => {
                  const c = courses.find(cr => cr.id === a.courseId);
                  return c?.departmentId === selectedDept && c?.semester === selectedSem;
                }).length} Active Assignments
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {assignments
                .filter(asg => {
                  const c = courses.find(cr => cr.id === asg.courseId);
                  return c?.departmentId === selectedDept && c?.semester === selectedSem;
                })
                .map(asg => {
                  const c = courses.find(cr => cr.id === asg.courseId);
                  const subCount = submissions.filter(s => s.assignmentId === asg.id).length;
                  return (
                    <div key={asg.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 dark:bg-slate-950 dark:border-slate-800">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-bold bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-300 px-2 py-0.5 rounded-md">
                          {c?.code} • {c?.name}
                        </span>
                        <span className="text-[10px] text-rose-500 font-bold">DUE: {asg.dueDate}</span>
                      </div>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white mt-2">{asg.title}</h4>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">{asg.description}</p>
                      <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-[10px]">
                        <span className="font-mono text-slate-500">Max Score: {asg.maxMarks}</span>
                        <span className="font-bold text-teal-600">{subCount} Submissions</span>
                      </div>
                    </div>
                  );
                })}
              {assignments.filter(a => {
                const c = courses.find(cr => cr.id === a.courseId);
                return c?.departmentId === selectedDept && c?.semester === selectedSem;
              }).length === 0 && (
                <div className="col-span-full py-6 text-center text-slate-400 italic text-xs border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                  No assessment tasks created yet for {selectedDepartmentObj?.name} (Semester {selectedSem}). Click "Create New Assessment Task" above to publish one!
                </div>
              )}
            </div>

            {/* Submissions Table / Sheet View for Staff & Admin */}
            <div className="flex items-center justify-between mb-3 border-t border-slate-100 dark:border-slate-800 pt-4">
              <div>
                <h3 className="font-sans text-sm font-bold text-slate-900 dark:text-white">Student Assessment & Task Submissions Ledger</h3>
                <p className="text-[11px] text-slate-500">View, download uploaded task files, and export grading sheet.</p>
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
                    <th className="px-4 py-3">Submitted File Attachment</th>
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
                              <button
                                onClick={() => handleDownloadFileAttachment(sub)}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-teal-200 bg-teal-50/70 px-2.5 py-1 text-[11px] font-bold text-teal-700 hover:bg-teal-100 dark:border-teal-900 dark:bg-teal-950/50 dark:text-teal-300 transition-all"
                                title="Click to download file"
                              >
                                <Paperclip className="h-3.5 w-3.5 text-teal-600" />
                                <span className="max-w-[140px] truncate">{sub.fileName}</span>
                                <span className="text-[9px] font-normal text-slate-500">({sub.fileSize || '1.5 MB'})</span>
                                <Download className="h-3 w-3 ml-0.5" />
                              </button>
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
                              onClick={() => {
                                setSelectedSubForView(sub);
                                setShowViewDetailsModal(true);
                              }}
                              className="inline-flex items-center gap-1 text-slate-600 hover:text-teal-600 font-bold text-xs"
                              title="View details & notes"
                            >
                              <Eye className="h-3.5 w-3.5" /> View
                            </button>

                            {sub.status === 'Submitted' && (
                              <button
                                onClick={() => handleOpenGrading(sub.id)}
                                className="inline-flex items-center gap-1 rounded-lg bg-teal-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-teal-700 transition-colors"
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
            <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-sans text-sm font-bold text-slate-900 dark:text-white">Course Assignment & Task Portal</h3>
                <p className="text-[11px] font-semibold text-teal-600 dark:text-teal-400">
                  Assigned tasks for: <span className="underline">{selectedDepartmentObj?.name || 'Department'}</span> • Semester {selectedSem} (Year {selectedSemYear})
                </p>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 px-2.5 py-1 rounded-full w-fit">
                <Building className="h-3 w-3" /> {selectedDepartmentObj?.code || 'DEPT'} - Sem {selectedSem}
              </span>
            </div>

            <div className="space-y-4">
              {visibleStudentAssignments.map(asg => {
                if (!asg) return null;
                const sub = safeSubmissions.find(s => s && s.assignmentId === asg.id && (s.studentId === currentStudentId || s.studentId === currentUser?.id || s.studentId === studentProfile?.id));
                const course = safeCourses.find(c => c && c.id === asg.courseId);
                return (
                  <div key={asg.id} className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 rounded-2xl">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white">{asg.title}</h4>
                        <p className="text-[10px] font-bold text-teal-600 mt-0.5">{course?.code || 'COURSE'} - {course?.name || 'General'}</p>
                      </div>
                      <span className="text-[10px] bg-rose-50 border border-rose-100 text-rose-600 dark:bg-rose-950/40 dark:border-rose-900 font-bold px-2 py-0.5 rounded-full">
                        DUE: {asg.dueDate}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-3">{asg.description}</p>
                    
                    <div className="mt-4 border-t border-slate-200/50 dark:border-slate-800 pt-3 flex items-center justify-between">
                      <span className="text-[11px] font-mono text-slate-400">Max Score: {asg.maxMarks}</span>

                      {sub ? (
                        <div className="flex items-center gap-2">
                          {sub.fileName && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                              <Paperclip className="h-3 w-3 text-teal-600" /> {sub.fileName}
                            </span>
                          )}
                          <span className="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 px-2.5 py-1 rounded-lg text-xs font-bold inline-flex items-center gap-1">
                            <CheckCircle className="h-3.5 w-3.5" />
                            {sub.status === 'Graded' ? `Graded: ${sub.marksObtained}/${asg.maxMarks}` : 'Submitted'}
                          </span>
                        </div>
                      ) : (
                        <button
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

              {visibleStudentAssignments.length === 0 && (
                <div className="py-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                  <BookOpen className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                  <p className="font-bold text-xs text-slate-700 dark:text-slate-300">No Pending Tasks</p>
                  <p className="text-[11px] text-slate-400 mt-0.5 max-w-xs mx-auto">
                    There are currently no homework or assessment tasks assigned for {selectedDepartmentObj?.name || 'this department'} (Semester {selectedSem}).
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <h3 className="font-sans text-sm font-bold text-slate-900 dark:text-white mb-4">Academic Feedbacks & Marks</h3>
            <div className="space-y-4">
              {safeSubmissions.filter(s => s && (s.studentId === currentStudentId || s.studentId === currentUser?.id || s.studentId === studentProfile?.id) && s.status === 'Graded').map(sub => {
                if (!sub) return null;
                const asg = safeAssignments.find(a => a && a.id === sub.assignmentId);
                return (
                  <div key={sub.id} className="p-4 bg-teal-50/50 border border-teal-100 rounded-2xl dark:bg-teal-950/20 dark:border-teal-900">
                    <div className="flex justify-between items-start">
                      <p className="font-bold text-slate-900 dark:text-white">{asg?.title || 'Assignment'}</p>
                      <span className="text-xs font-mono font-bold text-teal-700 dark:text-teal-300 bg-teal-100 dark:bg-teal-900/50 px-2 py-0.5 rounded-md">
                        Score: {sub.marksObtained} / {asg?.maxMarks || 50}
                      </span>
                    </div>
                    <p className="text-xs italic text-slate-600 dark:text-slate-300 mt-2">"{sub.feedback}"</p>
                    {sub.fileName && (
                      <p className="text-[10px] font-mono text-slate-400 mt-2 flex items-center gap-1">
                        <Paperclip className="h-3 w-3" /> Submitted file: {sub.fileName}
                      </p>
                    )}
                  </div>
                );
              })}
              {safeSubmissions.filter(s => s && (s.studentId === currentStudentId || s.studentId === currentUser?.id || s.studentId === studentProfile?.id) && s.status === 'Graded').length === 0 && (
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

      {/* View Task Submission Details Modal (Staff/Admin) */}
      {showViewDetailsModal && selectedSubForView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Submission File & Details</h3>
              <button onClick={() => setShowViewDetailsModal(false)} className="text-slate-400 hover:bg-slate-100 p-1 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-slate-700 dark:text-slate-300">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400">Student Name</span>
                <p className="font-bold text-slate-900 dark:text-white text-sm">
                  {users.find(u => u.id === students.find(s => s.id === selectedSubForView.studentId)?.userId)?.name}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400">Submitted File</span>
                {selectedSubForView.fileName ? (
                  <div className="mt-1 flex items-center justify-between bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <Paperclip className="h-4 w-4 text-teal-600" />
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{selectedSubForView.fileName}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{selectedSubForView.fileSize || '1.5 MB'}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDownloadFileAttachment(selectedSubForView)}
                      className="flex items-center gap-1 bg-teal-600 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-xs hover:bg-teal-700"
                    >
                      <Download className="h-3.5 w-3.5" /> Download
                    </button>
                  </div>
                ) : (
                  <p className="italic text-slate-400 mt-0.5">No file attached</p>
                )}
              </div>

              {selectedSubForView.submissionText && (
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400">Student Notes</span>
                  <p className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 mt-1 italic">
                    "{selectedSubForView.submissionText}"
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 border-t pt-3 flex justify-end">
              <button
                onClick={() => setShowViewDetailsModal(false)}
                className="bg-slate-200 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
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

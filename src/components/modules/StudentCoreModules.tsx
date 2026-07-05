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
  Calendar
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
  const studentProfile = students.find(s => s.userId === currentUser?.id);
  const currentStudentId = studentProfile?.id || 's-1';

  // Faculty Filter states
  const [selectedDept, setSelectedDept] = useState(departments[0]?.id || '');
  const [selectedSem, setSelectedSem] = useState(1);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [gradingSubId, setGradingSubId] = useState('');

  // Form states (Add)
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [courseId, setCourseId] = useState(courses[0]?.id || '');
  const [dueDate, setDueDate] = useState('');
  const [maxMarks, setMaxMarks] = useState(50);

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
  };

  const handleSubmitPaper = (assignmentId: string) => {
    const newSub: AssignmentSubmission = {
      id: `sub-${Date.now()}`,
      assignmentId,
      studentId: currentStudentId,
      submissionDate: new Date().toISOString().split('T')[0],
      status: 'Submitted'
    };
    onSubmitAssignment(newSub);
    alert('Your script is securely uploaded to academic portal!');
  };

  const handleOpenGrading = (subId: string) => {
    setGradingSubId(subId);
    setScore(45);
    setFeedback('');
    setShowGradeModal(true);
  };

  const handleSaveGrade = (e: React.FormEvent) => {
    e.preventDefault();
    onGradeSubmission(gradingSubId, Number(score), feedback);
    setShowGradeModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-sans text-lg font-bold text-slate-800 dark:text-white">Homework Assignments Board</h2>
          {isFaculty && (
            <div className="mt-2 flex flex-wrap gap-2">
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
              >
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
              <select
                value={selectedSem}
                onChange={(e) => setSelectedSem(Number(e.target.value))}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                  <option key={s} value={s}>Semester {s}</option>
                ))}
              </select>
            </div>
          )}
        </div>
        {isFaculty && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-teal-700 transition-colors"
          >
            <PlusCircle className="h-4 w-4" /> Create New Assignment
          </button>
        )}
      </div>

      {isFaculty ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Submissions List */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 lg:col-span-3">
            <h3 className="font-sans text-sm font-bold text-slate-900 dark:text-white mb-4">Student Assignment Submissions</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/40 font-bold uppercase text-slate-400">
                    <th className="px-4 py-3">Student</th>
                    <th className="px-4 py-3">Assignment</th>
                    <th className="px-4 py-3 text-center">Score</th>
                    <th className="px-4 py-3 text-right">Action</th>
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
                        <tr key={sub.id} className="hover:bg-slate-50/40">
                          <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{stuUser?.name}</td>
                          <td className="px-4 py-3">{asg?.title}</td>
                          <td className="px-4 py-3 text-center">
                            {sub.status === 'Graded' ? (
                              <span className="font-mono font-bold text-teal-600">{sub.marksObtained} / {asg?.maxMarks}</span>
                            ) : (
                                <span className="text-amber-500 italic">Pending</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {sub.status === 'Submitted' && (
                              <button
                                onClick={() => handleOpenGrading(sub.id)}
                                className="text-teal-600 font-bold hover:underline"
                              >
                                Grade Now
                              </button>
                            )}
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
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Student view */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <h3 className="font-sans text-sm font-bold text-slate-900 dark:text-white mb-4">Course Assignment Board</h3>
            <div className="space-y-4">
              {assignments.map(asg => {
                const sub = submissions.find(s => s.assignmentId === asg.id && s.studentId === currentStudentId);
                const course = courses.find(c => c.id === asg.courseId);
                return (
                  <div key={asg.id} className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 rounded-2xl">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white">{asg.title}</h4>
                        <p className="text-[10px] text-teal-600 mt-0.5">{course?.name}</p>
                      </div>
                      <span className="text-[10px] text-rose-500 font-bold">DUE: {asg.dueDate}</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-3">{asg.description}</p>
                    <div className="mt-4 border-t pt-3 flex justify-end">
                      {sub ? (
                        <span className="text-emerald-600 text-xs font-bold">
                          {sub.status === 'Graded' ? `Graded: ${sub.marksObtained} Marks` : 'Submitted'}
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSubmitPaper(asg.id)}
                          className="bg-teal-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold"
                        >
                          Submit Work
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <h3 className="font-sans text-sm font-bold text-slate-900 dark:text-white mb-4">Academic Feedbacks</h3>
            <div className="space-y-4">
              {submissions.filter(s => s.studentId === currentStudentId && s.status === 'Graded').map(sub => {
                const asg = assignments.find(a => a.id === sub.assignmentId);
                return (
                  <div key={sub.id} className="p-4 bg-teal-50/50 border border-teal-100 rounded-xl dark:bg-teal-950/20 dark:border-teal-900">
                    <p className="font-bold text-slate-900 dark:text-white">{asg?.title}</p>
                    <p className="text-xs italic text-slate-600 mt-2">"{sub.feedback}"</p>
                    <p className="text-[10px] font-bold text-teal-600 mt-2">Score: {sub.marksObtained} / {asg?.maxMarks}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Add Assignment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
              <h3 className="font-sans text-sm font-bold text-slate-900 dark:text-white">Define Assignment</h3>
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
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Description</label>
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>
              <button type="submit" className="w-full bg-teal-600 text-white font-bold py-2.5 rounded-xl shadow-md">Publish Assignment</button>
            </form>
          </div>
        </div>
      )}

      {/* Grade Modal */}
      {showGradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4">Grade Submission</h3>
            <form onSubmit={handleSaveGrade} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Marks</label>
                <input
                  type="number"
                  value={score}
                  onChange={(e) => setScore(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Feedback</label>
                <input
                  type="text"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>
              <button type="submit" className="w-full bg-teal-600 text-white font-bold py-2 rounded-xl">Save Grade</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

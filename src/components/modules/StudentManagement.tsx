/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Search,
  UserPlus,
  Edit,
  Trash2,
  Filter,
  X,
  GraduationCap,
  Calendar,
  Phone,
  MapPin,
  Mail,
  User,
  Camera,
  Eye,
  EyeOff,
  Code2,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Award,
  Download
} from 'lucide-react';
import { StudentProfile, User as UserType, Department, LeetCodeStats } from '../../types';
import ProfilePhotoModal from '../shared/ProfilePhotoModal';
import {
  fetchBatchLeetCodeStats,
  fetchStudentLeetCodeStats,
  extractLeetCodeUsername,
  formatLeetCodeProfileUrl,
  updateStudentLeetCodeUrl
} from '../../services/leetcodeService';
import {
  buildLeetCodeExportRecords,
  exportDetailedLeetCodeCSV,
  calculateAcademicYear,
  getAcademicYearLabel
} from '../../services/leetcodeExportService';

interface StudentManagementProps {
  students: StudentProfile[];
  users: UserType[];
  departments: Department[];
  role: string;
  onAddStudent: (newStudent: StudentProfile, newUser: UserType) => void;
  onUpdateStudent: (updatedStudent: StudentProfile, updatedUser: UserType) => void;
  onDeleteStudent: (studentId: string) => void;
}

export default function StudentManagement({
  students,
  users,
  departments,
  role,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent
}: StudentManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentProfile | null>(null);

  // Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [batch, setBatch] = useState('2024-2028');
  const [semester, setSemester] = useState(4);
  const [cgpa, setCgpa] = useState(3.5);
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [parentPassword, setParentPassword] = useState('');
  const [showParentPassword, setShowParentPassword] = useState(false);
  const [address, setAddress] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [photo, setPhoto] = useState('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120');
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [leetcodeUrl, setLeetcodeUrl] = useState('');
  const [testingHandle, setTestingHandle] = useState(false);
  const [testStatsResult, setTestStatsResult] = useState<LeetCodeStats | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Real-Time LeetCode Stats State
  const [leetcodeStatsMap, setLeetcodeStatsMap] = useState<Record<string, LeetCodeStats>>({});
  const [isRefreshingLeetCode, setIsRefreshingLeetCode] = useState(false);

  // Quick Edit LeetCode Modal for Admin
  const [quickEditStudent, setQuickEditStudent] = useState<StudentProfile | null>(null);
  const [quickLeetcodeUrl, setQuickLeetcodeUrl] = useState('');
  const [isSavingQuickEdit, setIsSavingQuickEdit] = useState(false);
  const [quickEditMsg, setQuickEditMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [quickPreviewStats, setQuickPreviewStats] = useState<LeetCodeStats | null>(null);
  const [isTestingQuick, setIsTestingQuick] = useState(false);

  const canModify = role === 'Admin';

  // Load real-time LeetCode statistics on mount & when students change
  useEffect(() => {
    loadRealtimeStats();
  }, [students]);

  const loadRealtimeStats = async (forceRefresh = false) => {
    setIsRefreshingLeetCode(true);
    const handles = students
      .map(s => s.leetcodeUrl || s.leetcodeUsername || '')
      .filter(Boolean);

    if (handles.length > 0) {
      const stats = await fetchBatchLeetCodeStats(handles, forceRefresh);
      setLeetcodeStatsMap(prev => ({ ...prev, ...stats }));
    }
    setIsRefreshingLeetCode(false);
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setPhone('');
    setRollNo('');
    setBatch('2024-2028');
    setSemester(4);
    setCgpa(3.5);
    setParentName('');
    setParentPhone('');
    setParentEmail('');
    setParentPassword('');
    setShowParentPassword(false);
    setAddress('');
    setDepartmentId(departments[0]?.id || '');
    setPhoto('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120');
    setLeetcodeUrl('');
    setTestStatsResult(null);
    setErrors({});
    setEditingStudent(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setShowModal(true);
  };

  const handleOpenEdit = (student: StudentProfile) => {
    const user = users.find(u => u.id === student.userId);
    setEditingStudent(student);
    setName(user?.name || '');
    setEmail(user?.email || '');
    setPassword(user?.password || '');
    setPhone(student.phone);
    setRollNo(student.rollNo);
    setBatch(student.batch);
    setSemester(student.currentSemester);
    setCgpa(student.cgpa);
    setParentName(student.parentName);
    setParentPhone(student.parentPhone);
    setParentEmail(student.parentEmail);
    setParentPassword(student.parentPassword || 'parentPass2026!');
    setShowParentPassword(false);
    setAddress(student.address);
    setDepartmentId(student.departmentId);
    setPhoto(user?.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120');
    setLeetcodeUrl(student.leetcodeUrl || (student.leetcodeUsername ? `https://leetcode.com/u/${student.leetcodeUsername}/` : ''));
    setTestStatsResult(null);
    setErrors({});
    setShowModal(true);
  };

  // Test live LeetCode handle in modal
  const handleTestLeetCodeHandle = async () => {
    const handle = extractLeetCodeUsername(leetcodeUrl);
    if (!handle) {
      alert('Please enter a valid LeetCode handle or URL (e.g. https://leetcode.com/u/username or username)');
      return;
    }
    setTestingHandle(true);
    setTestStatsResult(null);
    const stats = await fetchStudentLeetCodeStats(handle, true);
    setTestStatsResult(stats);
    setTestingHandle(false);
  };

  // Open Quick Edit Modal for Admin
  const handleOpenQuickEdit = (student: StudentProfile) => {
    setQuickEditStudent(student);
    setQuickLeetcodeUrl(student.leetcodeUrl || (student.leetcodeUsername ? `https://leetcode.com/u/${student.leetcodeUsername}/` : ''));
    setQuickEditMsg(null);
    setQuickPreviewStats(null);
  };

  // Test handle inside Quick Edit Modal
  const handleTestQuickHandle = async () => {
    const handle = extractLeetCodeUsername(quickLeetcodeUrl);
    if (!handle) return;
    setIsTestingQuick(true);
    const stats = await fetchStudentLeetCodeStats(handle, true);
    setQuickPreviewStats(stats);
    setIsTestingQuick(false);
  };

  // Save Quick LeetCode URL edit
  const handleSaveQuickEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickEditStudent) return;

    setIsSavingQuickEdit(true);
    setQuickEditMsg(null);

    const cleanHandle = extractLeetCodeUsername(quickLeetcodeUrl);
    const normalizedUrl = cleanHandle ? (quickLeetcodeUrl.startsWith('http') ? quickLeetcodeUrl : `https://leetcode.com/u/${cleanHandle}/`) : '';

    const updatedStudent: StudentProfile = {
      ...quickEditStudent,
      leetcodeUrl: normalizedUrl,
      leetcodeUsername: cleanHandle
    };

    const user = users.find(u => u.id === quickEditStudent.userId);
    if (user) {
      onUpdateStudent(updatedStudent, user);
    }

    // Also persist via direct API helper
    await updateStudentLeetCodeUrl(quickEditStudent.id, normalizedUrl);

    // Fetch fresh stats for newly assigned handle
    if (cleanHandle) {
      const stats = await fetchStudentLeetCodeStats(cleanHandle, true);
      setLeetcodeStatsMap(prev => ({ ...prev, [cleanHandle]: stats, [normalizedUrl]: stats }));
    }

    setQuickEditMsg({ text: 'LeetCode profile URL updated successfully!', type: 'success' });
    setIsSavingQuickEdit(false);

    setTimeout(() => {
      setQuickEditStudent(null);
    }, 1200);
  };

  const validate = () => {
    const tempErrors: Record<string, string> = {};
    if (!name.trim()) tempErrors.name = 'Full Name is required';
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) tempErrors.email = 'Valid Email is required';
    if (!phone.match(/^\+?[\d\s-]{8,15}$/)) tempErrors.phone = 'Valid Phone is required';
    if (!rollNo.trim()) tempErrors.rollNo = 'Unique Roll Number is required';
    if (!parentName.trim()) tempErrors.parentName = 'Parent / Guardian name is required';
    if (!parentPhone.match(/^\+?[\d\s-]{8,15}$/)) tempErrors.parentPhone = 'Valid parent phone is required';
    if (!parentEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) tempErrors.parentEmail = 'Valid parent email is required';
    if (!address.trim()) tempErrors.address = 'Primary Address is required';
    if (cgpa < 0 || cgpa > 10) tempErrors.cgpa = 'CGPA must be between 0.00 and 10.00';
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const finalParentPassword = parentPassword || 'parentPass2026!';
    const cleanHandle = extractLeetCodeUsername(leetcodeUrl);
    const normalizedUrl = cleanHandle
      ? (leetcodeUrl.startsWith('http') ? leetcodeUrl : `https://leetcode.com/u/${cleanHandle}/`)
      : '';

    if (editingStudent) {
      const updatedUser: UserType = {
        id: editingStudent.userId,
        username: email.split('@')[0],
        email,
        password: password || 'studentPass2026!',
        name,
        role: 'Student',
        phone,
        departmentId,
        photo
      };
      const updatedStudent: StudentProfile = {
        ...editingStudent,
        rollNo,
        batch,
        currentSemester: Number(semester),
        cgpa: Number(cgpa),
        phone,
        parentName,
        parentPhone,
        parentEmail,
        parentPassword: finalParentPassword,
        address,
        departmentId,
        leetcodeUrl: normalizedUrl,
        leetcodeUsername: cleanHandle
      };
      onUpdateStudent(updatedStudent, updatedUser);
    } else {
      const newUserId = `u-${Date.now()}`;
      const newStudentId = `s-${Date.now()}`;
      const newUser: UserType = {
        id: newUserId,
        username: email.split('@')[0],
        email,
        password: password || 'studentPass2026!',
        name,
        role: 'Student',
        phone,
        departmentId,
        photo
      };
      const newStudent: StudentProfile = {
        id: newStudentId,
        userId: newUserId,
        rollNo,
        batch,
        currentSemester: Number(semester),
        cgpa: Number(cgpa),
        phone,
        parentName,
        parentPhone,
        parentEmail,
        parentPassword: finalParentPassword,
        address,
        departmentId,
        leetcodeUrl: normalizedUrl,
        leetcodeUsername: cleanHandle
      };
      onAddStudent(newStudent, newUser);
    }
    setShowModal(false);
  };

  // Helper to look up stats for a student
  const getStudentStats = (student: StudentProfile): LeetCodeStats | undefined => {
    const handle = extractLeetCodeUsername(student.leetcodeUsername || student.leetcodeUrl || '');
    if (!handle) return undefined;
    return (
      leetcodeStatsMap[handle.toLowerCase()] ||
      leetcodeStatsMap[handle] ||
      (student.leetcodeUrl ? leetcodeStatsMap[student.leetcodeUrl] : undefined)
    );
  };

  // Filter students
  const filteredStudents = students.filter(student => {
    const user = users.find(u => u.id === student.userId);
    const matchesSearch =
      user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.leetcodeUsername && student.leetcodeUsername.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesDept = selectedDept === 'All' || student.departmentId === selectedDept;

    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6">
      {/* Search and Action Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <div className="relative max-w-md flex-1">
            <Search className="absolute top-3 left-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search Student (Name, Roll No, LeetCode Handle)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-4 pl-10 text-xs font-semibold text-slate-800 focus:border-teal-500 focus:outline-hidden dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            />
          </div>

          {/* Department Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 focus:border-teal-500 focus:outline-hidden dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
            >
              <option value="All">All Departments</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.code}</option>
              ))}
            </select>
          </div>

          {/* Refresh Real-Time LeetCode Button */}
          <button
            onClick={() => loadRealtimeStats(true)}
            disabled={isRefreshingLeetCode}
            title="Refresh real-time LeetCode problem counts for all students"
            className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50/80 px-3.5 py-2 text-xs font-bold text-amber-700 hover:bg-amber-100 transition-colors disabled:opacity-50 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshingLeetCode ? 'animate-spin' : ''}`} />
            <span>{isRefreshingLeetCode ? 'Syncing...' : 'Sync LeetCode'}</span>
          </button>

          {/* Download LeetCode Details CSV Button */}
          <button
            onClick={() => {
              const selectedDeptObj = departments.find(d => d.id === selectedDept);
              const deptCode = selectedDept === 'All' ? 'All' : (selectedDeptObj?.code || selectedDept);
              const records = buildLeetCodeExportRecords(students, users, departments, leetcodeStatsMap);
              const filtered = records.filter(r => selectedDept === 'All' || r.departmentCode === deptCode);
              exportDetailedLeetCodeCSV(filtered, deptCode, 'AllYears');
            }}
            title="Download student LeetCode links and total solved data as CSV"
            className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition-colors dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download LeetCode CSV</span>
          </button>
        </div>

        {canModify && (
          <button
            id="register-student-btn"
            onClick={handleOpenAdd}
            className="flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-teal-700 transition-colors"
          >
            <UserPlus className="h-4 w-4" />
            Add Student Profile
          </button>
        )}
      </div>

      {/* Students Data Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 text-xs font-bold uppercase text-slate-400 dark:border-slate-800 dark:bg-slate-950/50">
                <th className="px-5 py-4">Student</th>
                <th className="px-5 py-4">Roll No & Dept</th>
                <th className="px-5 py-4">Academic Score</th>
                <th className="px-5 py-4">
                  <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                    <Code2 className="h-4 w-4" />
                    <span>Realtime LeetCode Stats</span>
                  </div>
                </th>
                <th className="px-5 py-4">Parent Details</th>
                {canModify && <th className="px-5 py-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs dark:divide-slate-800">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => {
                  const user = users.find(u => u.id === student.userId);
                  const dept = departments.find(d => d.id === student.departmentId);
                  const handle = extractLeetCodeUsername(student.leetcodeUsername || student.leetcodeUrl || '');
                  const stats = getStudentStats(student);
                  const profileUrl = formatLeetCodeProfileUrl(student.leetcodeUrl || handle);

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={user?.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120'}
                            alt={user?.name}
                            referrerPolicy="no-referrer"
                            className="h-10 w-10 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-800"
                          />
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">{user?.name}</p>
                            <p className="font-mono text-[10px] text-slate-400 mt-0.5">{user?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-mono font-bold text-slate-800 dark:text-slate-300">{student.rollNo}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{dept?.name || 'Computer Science'}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center rounded-full bg-teal-50 px-2.5 py-0.5 font-mono font-bold text-teal-700 dark:bg-teal-950/50 dark:text-teal-300">
                          {student.cgpa} CGPA
                        </span>
                        <p className="text-[10px] text-slate-400 mt-0.5">Sem {student.currentSemester}</p>
                      </td>

                      {/* Real-time LeetCode Problem Count Column */}
                      <td className="px-5 py-4">
                        {handle ? (
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center gap-1 rounded-lg bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                                <Sparkles className="h-3 w-3 text-amber-500" />
                                <span className="font-mono">{stats ? `${stats.totalSolved} Solved` : 'Fetching...'}</span>
                              </span>

                              <a
                                href={profileUrl}
                                target="_blank"
                                rel="noreferrer"
                                title={`Open ${handle}'s LeetCode profile`}
                                className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-slate-500 hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-400"
                              >
                                <span>@{handle}</span>
                                <ExternalLink className="h-3 w-3" />
                              </a>

                              {canModify && (
                                <button
                                  type="button"
                                  onClick={() => handleOpenQuickEdit(student)}
                                  title="Admin: Edit Student's LeetCode Profile URL"
                                  className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-amber-600 dark:hover:bg-slate-800 transition-colors"
                                >
                                  <Edit className="h-3 w-3" />
                                </button>
                              )}
                            </div>

                            {stats && stats.found && (
                              <div className="flex items-center gap-1.5 text-[10px] font-mono">
                                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">E:{stats.easySolved}</span>
                                <span className="text-slate-300 dark:text-slate-600">•</span>
                                <span className="text-amber-600 dark:text-amber-400 font-semibold">M:{stats.mediumSolved}</span>
                                <span className="text-slate-300 dark:text-slate-600">•</span>
                                <span className="text-rose-600 dark:text-rose-400 font-semibold">H:{stats.hardSolved}</span>
                                {stats.ranking ? (
                                  <>
                                    <span className="text-slate-300 dark:text-slate-600">•</span>
                                    <span className="text-slate-400">#{stats.ranking.toLocaleString()}</span>
                                  </>
                                ) : null}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                              Not Linked
                            </span>
                            {canModify && (
                              <button
                                type="button"
                                onClick={() => handleOpenQuickEdit(student)}
                                className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-600 hover:underline"
                              >
                                + Link LeetCode
                              </button>
                            )}
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-800 dark:text-slate-300">{student.parentName}</p>
                        <p className="font-mono text-[10px] text-slate-400 mt-0.5">{student.parentPhone}</p>
                      </td>
                      {canModify && (
                        <td className="px-5 py-4 text-right">
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEdit(student)}
                              title="Full Profile Edit"
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:border-slate-800 dark:hover:bg-slate-800"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => onDeleteStudent(student.id)}
                              title="Delete Student Record"
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-rose-100 text-rose-500 hover:bg-rose-50 hover:text-rose-700 dark:border-rose-950/40 dark:hover:bg-rose-950/20"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    No student records found matching the query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Edit LeetCode Modal for Admin */}
      {quickEditStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Code2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-sans text-sm font-bold text-slate-900 dark:text-white">
                    Edit LeetCode Profile URL
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {quickEditStudent.rollNo} • {users.find(u => u.id === quickEditStudent.userId)?.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setQuickEditStudent(null)}
                className="rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveQuickEdit} className="space-y-4">
              {quickEditMsg && (
                <div
                  className={`flex items-center gap-2 rounded-xl p-3 text-xs font-semibold ${
                    quickEditMsg.type === 'success'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900'
                      : 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/30 dark:border-rose-900'
                  }`}
                >
                  {quickEditMsg.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                  <span>{quickEditMsg.text}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">
                  LeetCode Profile URL or Handle
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={quickLeetcodeUrl}
                    onChange={(e) => {
                      setQuickLeetcodeUrl(e.target.value);
                      setQuickPreviewStats(null);
                    }}
                    placeholder="https://leetcode.com/u/sanjay/ or sanjay"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
                <div className="flex items-center justify-between mt-1.5">
                  <p className="text-[10px] text-slate-400 font-mono">
                    Parsed Handle: <strong className="text-amber-600 dark:text-amber-400">@{extractLeetCodeUsername(quickLeetcodeUrl) || '—'}</strong>
                  </p>
                  {extractLeetCodeUsername(quickLeetcodeUrl) && (
                    <button
                      type="button"
                      onClick={handleTestQuickHandle}
                      disabled={isTestingQuick}
                      className="text-[10px] font-bold text-teal-600 hover:underline flex items-center gap-1"
                    >
                      {isTestingQuick ? <RefreshCw className="h-3 w-3 animate-spin" /> : null}
                      Test Realtime Stats
                    </button>
                  )}
                </div>
              </div>

              {/* Live Preview Card */}
              {quickPreviewStats && (
                <div className="rounded-xl border border-amber-200/60 bg-amber-50/50 p-3 dark:border-amber-900/40 dark:bg-amber-950/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                      Live Verified LeetCode Data:
                    </span>
                    <span className="text-xs font-mono font-black text-amber-600 dark:text-amber-400">
                      {quickPreviewStats.totalSolved} Solved
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold font-mono">
                    <div className="rounded-lg bg-emerald-500/10 p-1 text-emerald-600 dark:text-emerald-400">
                      Easy: {quickPreviewStats.easySolved}
                    </div>
                    <div className="rounded-lg bg-amber-500/10 p-1 text-amber-600 dark:text-amber-400">
                      Medium: {quickPreviewStats.mediumSolved}
                    </div>
                    <div className="rounded-lg bg-rose-500/10 p-1 text-rose-600 dark:text-rose-400">
                      Hard: {quickPreviewStats.hardSolved}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setQuickEditStudent(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingQuickEdit}
                  className="rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-amber-700 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSavingQuickEdit ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                  <span>Save LeetCode URL</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add/Edit Student Profile Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
              <h3 className="font-sans text-md font-bold text-slate-900 dark:text-white">
                {editingStudent ? 'Modify Student Profile Details' : 'Register New Student Profile'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Photo Selector Banner */}
              <div className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50/80 p-3.5 dark:border-slate-800 dark:bg-slate-950/50">
                <div className="relative">
                  <img
                    src={photo}
                    alt="Student Photo"
                    referrerPolicy="no-referrer"
                    className="h-14 w-14 rounded-full object-cover ring-2 ring-teal-500/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPhotoModal(true)}
                    className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-teal-600 text-white shadow-xs hover:bg-teal-700 transition-colors"
                    title="Change Student Photo"
                  >
                    <Camera className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Profile Photo</h4>
                  <p className="text-[10px] text-slate-400">Upload custom image, choose avatar, or paste URL</p>
                  <button
                    type="button"
                    onClick={() => setShowPhotoModal(true)}
                    className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-teal-600 hover:text-teal-700 dark:text-teal-400"
                  >
                    <Camera className="h-3 w-3" />
                    Change Photo
                  </button>
                </div>
              </div>

              {/* Profile section */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Full Student Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                  {errors.name && <p className="text-[10px] font-semibold text-rose-500 mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Student Academic Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                  {errors.email && <p className="text-[10px] font-semibold text-rose-500 mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Login Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="studentPass2026!"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">If blank, defaults to: studentPass2026!</p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Primary Contact Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 012-3456"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                  {errors.phone && <p className="text-[10px] font-semibold text-rose-500 mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Unique University Roll No</label>
                  <input
                    type="text"
                    value={rollNo}
                    onChange={(e) => setRollNo(e.target.value)}
                    placeholder="IT-2026-003"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                  {errors.rollNo && <p className="text-[10px] font-semibold text-rose-500 mt-1">{errors.rollNo}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Academic Intake Batch</label>
                  <input
                    type="text"
                    value={batch}
                    onChange={(e) => setBatch(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Current Active Term (Semester)</label>
                  <input
                    type="number"
                    value={semester}
                    onChange={(e) => setSemester(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Initial CGPA Scale (0.00 - 10.00)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={cgpa}
                    onChange={(e) => setCgpa(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                  {errors.cgpa && <p className="text-[10px] font-semibold text-rose-500 mt-1">{errors.cgpa}</p>}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Assigned Major Department</label>
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* LeetCode Profile URL Integration Section */}
              <div className="rounded-xl border border-amber-200/70 bg-amber-50/40 p-4 dark:border-amber-900/30 dark:bg-amber-950/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Code2 className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <h4 className="font-sans text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      LeetCode Profile Configuration (Real-Time Solve Tracking)
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">
                    Admin Managed
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Provide the student's LeetCode profile URL or username to automatically sync their live problem solve count across dashboards.
                </p>

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={leetcodeUrl}
                      onChange={(e) => {
                        setLeetcodeUrl(e.target.value);
                        setTestStatsResult(null);
                      }}
                      placeholder="https://leetcode.com/u/sanjay/ or sanjay"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-amber-500 focus:outline-hidden dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                    />
                  </div>
                  {extractLeetCodeUsername(leetcodeUrl) && (
                    <button
                      type="button"
                      onClick={handleTestLeetCodeHandle}
                      disabled={testingHandle}
                      className="rounded-xl bg-amber-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-amber-700 transition-colors disabled:opacity-50 flex items-center gap-1.5 whitespace-nowrap"
                    >
                      {testingHandle ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                      <span>Test & Verify</span>
                    </button>
                  )}
                </div>

                {testStatsResult && (
                  <div className="rounded-xl border border-amber-300 bg-white p-3 dark:border-amber-800 dark:bg-slate-900 space-y-1.5 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Account Verified: @{testStatsResult.username}
                      </span>
                      <span className="text-xs font-mono font-black text-amber-600 dark:text-amber-400">
                        {testStatsResult.totalSolved} Total Solved
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] font-mono">
                      <span className="text-emerald-600">Easy: {testStatsResult.easySolved}</span>
                      <span className="text-amber-600">Med: {testStatsResult.mediumSolved}</span>
                      <span className="text-rose-600">Hard: {testStatsResult.hardSolved}</span>
                      {testStatsResult.ranking ? (
                        <span className="text-slate-400">Global Rank: #{testStatsResult.ranking.toLocaleString()}</span>
                      ) : null}
                    </div>
                  </div>
                )}
              </div>

              {/* Parent Info */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
                <h4 className="font-sans text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Parent / Guardian Information</h4>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Guardian Full Name</label>
                    <input
                      type="text"
                      value={parentName}
                      onChange={(e) => setParentName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    />
                    {errors.parentName && <p className="text-[9px] font-semibold text-rose-500 mt-1">{errors.parentName}</p>}
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Guardian Phone No</label>
                    <input
                      type="text"
                      value={parentPhone}
                      onChange={(e) => setParentPhone(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    />
                    {errors.parentPhone && <p className="text-[9px] font-semibold text-rose-500 mt-1">{errors.parentPhone}</p>}
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Guardian Email Address</label>
                    <input
                      type="email"
                      value={parentEmail}
                      onChange={(e) => setParentEmail(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    />
                    {errors.parentEmail && <p className="text-[9px] font-semibold text-rose-500 mt-1">{errors.parentEmail}</p>}
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Guardian Login Password</label>
                    <div className="relative">
                      <input
                        type={showParentPassword ? 'text' : 'password'}
                        value={parentPassword}
                        onChange={(e) => setParentPassword(e.target.value)}
                        placeholder="parentPass2026!"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 pr-9 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowParentPassword(!showParentPassword)}
                        className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        title={showParentPassword ? 'Hide password' : 'Show password'}
                      >
                        {showParentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <p className="text-[9px] text-slate-400 mt-1">If blank, defaults to: parentPass2026!</p>
                  </div>
                </div>
              </div>

              {/* Physical Address */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Primary Residence Address</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={2}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
                {errors.address && <p className="text-[10px] font-semibold text-rose-500 mt-1">{errors.address}</p>}
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-teal-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-teal-700 transition-colors"
                >
                  {editingStudent ? 'Save Profile Changes' : 'Confirm & Create Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ProfilePhotoModal
        isOpen={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
        currentPhoto={photo}
        userName={name || 'Student'}
        onSave={(newPhoto) => setPhoto(newPhoto)}
      />
    </div>
  );
}

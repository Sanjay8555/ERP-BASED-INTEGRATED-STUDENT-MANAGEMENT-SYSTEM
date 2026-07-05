/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
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
  User
} from 'lucide-react';
import { StudentProfile, User as UserType, Department } from '../../types';

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
  const [address, setAddress] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const canModify = role === 'Admin';

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
    setAddress('');
    setDepartmentId(departments[0]?.id || '');
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
    setAddress(student.address);
    setDepartmentId(student.departmentId);
    setErrors({});
    setShowModal(true);
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

    if (editingStudent) {
      const updatedUser: UserType = {
        id: editingStudent.userId,
        username: email.split('@')[0],
        email,
        password: password || 'studentPass2026!',
        name,
        role: 'Student',
        phone,
        departmentId
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
        address,
        departmentId
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
        photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120'
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
        address,
        departmentId
      };
      onAddStudent(newStudent, newUser);
    }
    setShowModal(false);
  };

  // Filter students
  const filteredStudents = students.filter(student => {
    const user = users.find(u => u.id === student.userId);
    const matchesSearch =
      user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user?.email.toLowerCase().includes(searchTerm.toLowerCase());

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
              placeholder="Search Student (Roll No, Name, Email)..."
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
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Roll No & Dept</th>
                <th className="px-6 py-4">Current Term</th>
                <th className="px-6 py-4">Academic Score</th>
                <th className="px-6 py-4">Parent Details</th>
                {canModify && <th className="px-6 py-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs dark:divide-slate-800">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => {
                  const user = users.find(u => u.id === student.userId);
                  const dept = departments.find(d => d.id === student.departmentId);
                  return (
                    <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="px-6 py-4">
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
                      <td className="px-6 py-4">
                        <p className="font-mono font-bold text-slate-800 dark:text-slate-300">{student.rollNo}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{dept?.name || 'Computer Science'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-800 dark:text-slate-300">Semester {student.currentSemester}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Batch {student.batch}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-full bg-teal-50 px-2.5 py-0.5 font-mono font-bold text-teal-700 dark:bg-teal-950/50 dark:text-teal-300">
                          {student.cgpa} CGPA
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-800 dark:text-slate-300">{student.parentName}</p>
                        <p className="font-mono text-[10px] text-slate-400 mt-0.5">{student.parentPhone}</p>
                      </td>
                      {canModify && (
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEdit(student)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:border-slate-800 dark:hover:bg-slate-800"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => onDeleteStudent(student.id)}
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

                <div>
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

              {/* Parent Info */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
                <h4 className="font-sans text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Parent / Guardian Information</h4>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
                  className="rounded-xl bg-teal-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-teal-700 transition-colors animate-pulse"
                >
                  {editingStudent ? 'Save Profile Changes' : 'Confirm & Create Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

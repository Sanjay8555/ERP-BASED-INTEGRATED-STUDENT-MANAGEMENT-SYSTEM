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
  Calendar,
  Clock,
  MapPin,
  Megaphone,
  PlusCircle,
  X,
  BookOpen,
  Briefcase,
  GraduationCap
} from 'lucide-react';
import { FacultyProfile, User, Department, Course, TimetableEntry, Notice } from '../../types';

// ==========================================
// 1. FACULTY MANAGEMENT SUB-COMPONENT
// ==========================================
interface FacultyManagementProps {
  faculty: FacultyProfile[];
  users: User[];
  departments: Department[];
  role: string;
  onAddFaculty: (newFaculty: FacultyProfile, newUser: User) => void;
  onUpdateFaculty: (updatedFaculty: FacultyProfile, updatedUser: User) => void;
  onDeleteFaculty: (facultyId: string) => void;
}

export function FacultyManagement({
  faculty,
  users,
  departments,
  role,
  onAddFaculty,
  onUpdateFaculty,
  onDeleteFaculty
}: FacultyManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<FacultyProfile | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [designation, setDesignation] = useState('Assistant Professor');
  const [specialization, setSpecialization] = useState('');
  const [qualification, setQualification] = useState('');
  const [workload, setWorkload] = useState(12);
  const [departmentId, setDepartmentId] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const canModify = role === 'Admin';

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setPhone('');
    setDesignation('Assistant Professor');
    setSpecialization('');
    setQualification('');
    setWorkload(12);
    setDepartmentId(departments[0]?.id || '');
    setErrors({});
    setEditingFaculty(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setShowModal(true);
  };

  const handleOpenEdit = (fac: FacultyProfile) => {
    const user = users.find(u => u.id === fac.userId);
    setEditingFaculty(fac);
    setName(user?.name || '');
    setEmail(user?.email || '');
    setPassword(user?.password || '');
    setPhone(user?.phone || '');
    setDesignation(fac.designation);
    setSpecialization(fac.specialization);
    setQualification(fac.qualification);
    setWorkload(fac.workloadHours);
    setDepartmentId(fac.departmentId);
    setErrors({});
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tempErrors: Record<string, string> = {};
    if (!name.trim()) tempErrors.name = 'Full Name is required';
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) tempErrors.email = 'Valid Email is required';
    if (!specialization.trim()) tempErrors.specialization = 'Specialization is required';
    if (!qualification.trim()) tempErrors.qualification = 'Academic Qualification is required';

    if (Object.keys(tempErrors).length > 0) {
      setErrors(tempErrors);
      return;
    }

    if (editingFaculty) {
      const updatedUser: User = {
        id: editingFaculty.userId,
        username: email.split('@')[0],
        email,
        password: password || 'facultyPass2026!',
        name,
        role: 'Faculty',
        phone,
        departmentId
      };
      const updatedFaculty: FacultyProfile = {
        ...editingFaculty,
        designation,
        specialization,
        qualification,
        workloadHours: Number(workload),
        departmentId
      };
      onUpdateFaculty(updatedFaculty, updatedUser);
    } else {
      const newUserId = `u-${Date.now()}`;
      const newFacultyId = `f-${Date.now()}`;
      const newUser: User = {
        id: newUserId,
        username: email.split('@')[0],
        email,
        password: password || 'facultyPass2026!',
        name,
        role: 'Faculty',
        phone,
        departmentId,
        photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120'
      };
      const newFaculty: FacultyProfile = {
        id: newFacultyId,
        userId: newUserId,
        designation,
        specialization,
        qualification,
        workloadHours: Number(workload),
        departmentId
      };
      onAddFaculty(newFaculty, newUser);
    }
    setShowModal(false);
  };

  const filteredFaculty = faculty.filter(f => {
    const u = users.find(user => user.id === f.userId);
    return (
      u?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.designation.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute top-3 left-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search Faculty by name, expertise, or rank..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-4 pl-10 text-xs font-semibold text-slate-800 focus:border-teal-500 focus:outline-hidden dark:border-slate-800 dark:bg-slate-900 dark:text-white"
          />
        </div>

        {canModify && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-teal-700 transition-colors"
          >
            <UserPlus className="h-4 w-4" />
            Add Faculty Profile
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filteredFaculty.map(f => {
          const u = users.find(user => user.id === f.userId);
          const dept = departments.find(d => d.id === f.departmentId);
          return (
            <div
              key={f.id}
              className="group relative rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-teal-200 hover:shadow-md transition-all dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-start gap-4">
                <img
                  src={u?.photo || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120'}
                  alt={u?.name}
                  referrerPolicy="no-referrer"
                  className="h-12 w-12 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-800"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="font-sans text-sm font-bold text-slate-900 dark:text-white truncate">{u?.name}</h4>
                  <p className="text-[11px] font-medium text-teal-600 mt-0.5">{f.designation}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5 truncate">{dept?.name || 'Computer Science'}</p>
                </div>
              </div>

              <div className="mt-4 border-t border-slate-100 pt-3 space-y-1.5 dark:border-slate-800">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-400">QUALIFICATION</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">{f.qualification}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-400">SPECIALIZATION</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300 truncate max-w-[140px]" title={f.specialization}>
                    {f.specialization}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-400">WEEKLY WORKLOAD</span>
                  <span className="font-mono font-bold text-emerald-600">{f.workloadHours} Lecture Hrs</span>
                </div>
              </div>

              {canModify && (
                <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleOpenEdit(f)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteFaculty(f.id)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-rose-100 bg-white text-rose-500 hover:bg-rose-50 dark:border-rose-950 dark:bg-slate-900"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
              <h3 className="font-sans text-sm font-bold text-slate-900 dark:text-white">
                {editingFaculty ? 'Edit Faculty Account' : 'Register Faculty Account'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:bg-slate-100 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Full Academic Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
                {errors.name && <p className="text-[10px] text-rose-500 mt-1">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Academic Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                  {errors.email && <p className="text-[10px] text-rose-500 mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 019-2211"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Login Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="facultyPass2026!"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
                <p className="text-[10px] text-slate-400 mt-1">If blank, defaults to: facultyPass2026!</p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Designation Rank</label>
                  <select
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  >
                    <option value="Professor & HOD">Professor & HOD</option>
                    <option value="Professor">Professor</option>
                    <option value="Associate Professor">Associate Professor</option>
                    <option value="Assistant Professor">Assistant Professor</option>
                    <option value="Adjunct Lecturer">Adjunct Lecturer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Weekly Workload (Hrs)</label>
                  <input
                    type="number"
                    value={workload}
                    onChange={(e) => setWorkload(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Academic Degree</label>
                  <input
                    type="text"
                    placeholder="e.g. Ph.D. in CS"
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                  {errors.qualification && <p className="text-[10px] text-rose-500 mt-1">{errors.qualification}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Research Specialization</label>
                  <input
                    type="text"
                    placeholder="e.g. Machine Learning"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                  {errors.specialization && <p className="text-[10px] text-rose-500 mt-1">{errors.specialization}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Assigned Primary Department</label>
                <select
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                >
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold dark:border-slate-800 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button type="submit" className="rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white shadow-md">
                  Submit Credentials
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 2. TIMETABLE MODULE SUB-COMPONENT
// ==========================================
interface ClassTimetablesProps {
  timetable: TimetableEntry[];
  courses: Course[];
  faculty: FacultyProfile[];
  users: User[];
  departments: Department[];
  role: string;
  onAddEntry: (entry: TimetableEntry) => void;
  onUpdateEntry: (entry: TimetableEntry) => void;
  onDeleteEntry: (id: string) => void;
}

export function ClassTimetables({
  timetable,
  courses,
  faculty,
  users,
  departments,
  role,
  onAddEntry,
  onUpdateEntry,
  onDeleteEntry
}: ClassTimetablesProps) {
  const days: TimetableEntry['dayOfWeek'][] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const [showModal, setShowModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimetableEntry | null>(null);

  // View Filter states
  const [filterDept, setFilterDept] = useState('All');
  const [filterSem, setFilterSem] = useState('All');

  // Form states
  const [selectedDept, setSelectedDept] = useState(departments[0]?.id || '');
  const [selectedSem, setSelectedSem] = useState(1);
  const [courseId, setCourseId] = useState('');
  const [facultyId, setFacultyId] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState<TimetableEntry['dayOfWeek']>('Monday');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [room, setRoom] = useState('');

  const canModify = role === 'Admin' || role === 'Faculty';

  const resetForm = () => {
    const firstDept = departments[0]?.id || '';
    setSelectedDept(firstDept);
    setSelectedSem(1);
    const filteredCourses = courses.filter(c => c.departmentId === firstDept && c.semester === 1);
    setCourseId(filteredCourses[0]?.id || '');
    setFacultyId(faculty[0]?.id || '');
    setDayOfWeek('Monday');
    setStartTime('09:00');
    setEndTime('10:00');
    setRoom('');
    setEditingEntry(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setShowModal(true);
  };

  const handleOpenEdit = (entry: TimetableEntry) => {
    const course = courses.find(c => c.id === entry.courseId);
    setEditingEntry(entry);
    setSelectedDept(course?.departmentId || departments[0]?.id || '');
    setSelectedSem(course?.semester || 1);
    setCourseId(entry.courseId);
    setFacultyId(entry.facultyId);
    setDayOfWeek(entry.dayOfWeek);
    setStartTime(entry.startTime);
    setEndTime(entry.endTime);
    setRoom(entry.room);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId || !facultyId || !room) return;

    const entryData: TimetableEntry = {
      id: editingEntry?.id || `tt-${Date.now()}`,
      courseId,
      facultyId,
      dayOfWeek,
      startTime,
      endTime,
      room
    };

    if (editingEntry) {
      onUpdateEntry(entryData);
    } else {
      onAddEntry(entryData);
    }
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-sans text-lg font-bold text-slate-800 dark:text-white">University Master Lecture Timetable</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            <select
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold focus:outline-hidden dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
            >
              <option value="All">All Departments</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            <select
              value={filterSem}
              onChange={(e) => setFilterSem(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold focus:outline-hidden dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
            >
              <option value="All">All Semesters</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                <option key={s} value={s.toString()}>Semester {s}</option>
              ))}
            </select>
          </div>
        </div>
        {canModify && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-teal-700 transition-colors"
          >
            <PlusCircle className="h-4 w-4" />
            Add Lecture Slot
          </button>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border-spacing-y-2 text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 text-xs font-bold uppercase text-slate-400 dark:border-slate-800 dark:bg-slate-950/50">
                <th className="px-6 py-3.5">Day</th>
                <th className="px-6 py-3.5">Lecture Session Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs dark:divide-slate-800">
              {days.map(day => {
                const dayEntries = timetable
                  .filter(entry => {
                    const matchesDay = entry.dayOfWeek === day;
                    const course = courses.find(c => c.id === entry.courseId);
                    const matchesDept = filterDept === 'All' || course?.departmentId === filterDept;
                    const matchesSem = filterSem === 'All' || course?.semester === Number(filterSem);
                    return matchesDay && matchesDept && matchesSem;
                  })
                  .sort((a, b) => a.startTime.localeCompare(b.startTime));
                return (
                  <tr key={day} className="align-top hover:bg-slate-50/30">
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-lg bg-teal-50 px-3 py-1 font-sans font-bold text-teal-700 dark:bg-teal-950/50 dark:text-teal-300">
                        {day}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {dayEntries.length > 0 ? (
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          {dayEntries.map(entry => {
                            const course = courses.find(c => c.id === entry.courseId);
                            const fac = faculty.find(f => f.id === entry.facultyId);
                            const facUser = users.find(u => u.id === fac?.userId);
                            return (
                              <div
                                key={entry.id}
                                className="group relative rounded-xl border border-slate-200/80 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-950/40"
                              >
                                {canModify && (
                                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      onClick={() => handleOpenEdit(entry)}
                                      className="flex h-6 w-6 items-center justify-center rounded-lg bg-white text-slate-400 hover:text-teal-600 shadow-xs dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                                    >
                                      <Edit className="h-3 w-3" />
                                    </button>
                                    <button
                                      onClick={() => onDeleteEntry(entry.id)}
                                      className="flex h-6 w-6 items-center justify-center rounded-lg bg-white text-slate-400 hover:text-rose-600 shadow-xs dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  </div>
                                )}
                                <div className="pr-12 sm:pr-8">
                                  <p className="font-bold text-slate-900 dark:text-white truncate">
                                    {course?.name} ({course?.code})
                                  </p>
                                  <div className="mt-1 flex items-center gap-1.5">
                                    <MapPin className="h-3 w-3 text-slate-400" />
                                    <span className="font-mono text-[10px] text-slate-500 bg-white border border-slate-200/60 dark:border-slate-800 px-2 py-0.5 rounded-md dark:bg-slate-900">
                                      Room: {entry.room}
                                    </span>
                                  </div>
                                </div>
                                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3.5 w-3.5 text-teal-500" />
                                    {entry.startTime} - {entry.endTime}
                                  </span>
                                  <span className="italic truncate max-w-[120px]">
                                    Prof: {facUser?.name || 'Assigned Staff'}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-slate-400 italic py-2">No lectures configured for this day.</p>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
              <h3 className="font-sans text-sm font-bold text-slate-900 dark:text-white">
                {editingEntry ? 'Edit Lecture Slot' : 'Schedule New Lecture'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:bg-slate-100 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Select Department</label>
                  <select
                    value={selectedDept}
                    onChange={(e) => {
                      setSelectedDept(e.target.value);
                      const filtered = courses.filter(c => c.departmentId === e.target.value && c.semester === selectedSem);
                      setCourseId(filtered[0]?.id || '');
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Select Semester</label>
                  <select
                    value={selectedSem}
                    onChange={(e) => {
                      setSelectedSem(Number(e.target.value));
                      const filtered = courses.filter(c => c.departmentId === selectedDept && c.semester === Number(e.target.value));
                      setCourseId(filtered[0]?.id || '');
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Select Course (Subject)</label>
                  <select
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  >
                    {courses
                      .filter(c => c.departmentId === selectedDept && c.semester === selectedSem)
                      .map(c => (
                        <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                      ))}
                    {courses.filter(c => c.departmentId === selectedDept && c.semester === selectedSem).length === 0 && (
                      <option value="">No courses found for this criteria</option>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Assign Faculty</label>
                  <select
                    value={facultyId}
                    onChange={(e) => setFacultyId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  >
                    {faculty.map(f => {
                      const u = users.find(user => user.id === f.userId);
                      return (
                        <option key={f.id} value={f.id}>{u?.name || 'Unknown Faculty'}</option>
                      );
                    })}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Day of Week</label>
                  <select
                    value={dayOfWeek}
                    onChange={(e) => setDayOfWeek(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  >
                    {days.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Classroom / Room No</label>
                  <input
                    type="text"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    placeholder="e.g. CR-102"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">End Time</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold dark:border-slate-800 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button type="submit" className="rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white shadow-md">
                  {editingEntry ? 'Update Schedule' : 'Confirm Slot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 3. NOTICE BOARD SUB-COMPONENT
// ==========================================
interface NoticeBoardAnnouncementsProps {
  notices: Notice[];
  role: string;
  currentUser: User;
  onAddNotice: (newNotice: Notice) => void;
}

export function NoticeBoardAnnouncements({ notices, role, currentUser, onAddNotice }: NoticeBoardAnnouncementsProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetRole, setTargetRole] = useState<'All' | 'Faculty' | 'Student' | 'Parent'>('All');

  const canPost = role === 'Admin' || role === 'Faculty';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const newNotice: Notice = {
      id: `not-${Date.now()}`,
      title,
      content,
      date: new Date().toISOString().split('T')[0],
      targetRole,
      authorName: currentUser.name
    };

    onAddNotice(newNotice);
    setTitle('');
    setContent('');
    setTargetRole('All');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-sans text-md font-bold text-slate-800 dark:text-white">Announcements & Campus Circulars</h3>
        {canPost && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-teal-700 transition-colors"
          >
            <PlusCircle className="h-4.5 w-4.5" />
            Publish Notice
          </button>
        )}
      </div>

      <div className="space-y-4">
        {notices.map(notice => (
          <div
            key={notice.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-teal-600 dark:bg-teal-950 dark:text-teal-400">
                  <Megaphone className="h-4.5 w-4.5" />
                </span>
                <h4 className="font-sans text-sm font-bold text-slate-900 dark:text-white">{notice.title}</h4>
              </div>
              <div className="flex gap-2 text-[10px]">
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  Target: {notice.targetRole}
                </span>
                <span className="rounded-full bg-teal-50 px-2.5 py-0.5 font-mono text-teal-700 dark:bg-teal-950/40 dark:text-teal-300">
                  {notice.date}
                </span>
              </div>
            </div>
            <p className="mt-3.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">{notice.content}</p>
            <div className="mt-4 border-t border-slate-100 pt-3 text-[11px] text-slate-400 flex justify-between dark:border-slate-800">
              <span>Author: <strong>{notice.authorName}</strong></span>
              <span>University Registrar Office</span>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
              <h3 className="font-sans text-sm font-bold text-slate-900 dark:text-white">Publish Notice</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:bg-slate-100 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Notice Headline</label>
                <input
                  type="text"
                  placeholder="e.g. End Semester Schedule Release"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Audience Scope</label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                >
                  <option value="All">All Scope (Campus wide)</option>
                  <option value="Faculty">Faculty Only</option>
                  <option value="Student">Students Only</option>
                  <option value="Parent">Parents Only</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Detailed Content</label>
                <textarea
                  placeholder="Enter deep description body here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={4}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold dark:border-slate-800 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button type="submit" className="rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white shadow-md">
                  Publish Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

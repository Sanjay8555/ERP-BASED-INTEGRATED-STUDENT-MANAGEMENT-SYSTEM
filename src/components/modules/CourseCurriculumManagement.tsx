/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  PlusCircle,
  Edit3,
  Trash2,
  Search,
  Building,
  GraduationCap,
  Layers,
  Award,
  Users,
  CheckCircle2,
  X,
  Sparkles,
  BookMarked
} from 'lucide-react';
import { Course, Department, FacultyProfile, User } from '../../types';

interface CourseCurriculumManagementProps {
  courses: Course[];
  departments: Department[];
  faculty: FacultyProfile[];
  users: User[];
  role: string;
  onAddCourse: (course: Course) => void;
  onUpdateCourse: (course: Course) => void;
  onDeleteCourse: (courseId: string) => void;
  currentUser?: User;
}

export function CourseCurriculumManagement({
  courses,
  departments,
  faculty,
  users,
  role,
  onAddCourse,
  onUpdateCourse,
  onDeleteCourse
}: CourseCurriculumManagementProps) {
  const [selectedDeptId, setSelectedDeptId] = useState<string>(departments[0]?.id || 'dept-5');
  const [selectedSemFilter, setSelectedSemFilter] = useState<string>('All'); // 'All' | '1' | '2' ... '8'
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Modal states
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  // Form states
  const [formDeptId, setFormDeptId] = useState<string>(departments[0]?.id || 'dept-5');
  const [formSemester, setFormSemester] = useState<number>(1);
  const [formName, setFormName] = useState<string>('');
  const [formCode, setFormCode] = useState<string>('');
  const [formCredits, setFormCredits] = useState<number>(3);
  const [formFacultyId, setFormFacultyId] = useState<string>('');
  const [formError, setFormError] = useState<string>('');

  const canModify = role === 'Admin' || role === 'Faculty';

  const activeDepartment = departments.find(d => d.id === selectedDeptId) || departments[0];

  // Filter courses by department, semester and search query
  const filteredCourses = useMemo(() => {
    return courses.filter(c => {
      const matchDept = selectedDeptId === 'All' || c.departmentId === selectedDeptId;
      const matchSem = selectedSemFilter === 'All' || c.semester === Number(selectedSemFilter);
      const q = searchQuery.trim().toLowerCase();
      const matchQuery = !q || c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q);
      return matchDept && matchSem && matchQuery;
    });
  }, [courses, selectedDeptId, selectedSemFilter, searchQuery]);

  // Group courses by semester for the active department
  const semesterMap = useMemo(() => {
    const map: Record<number, Course[]> = {};
    for (let s = 1; s <= 8; s++) {
      map[s] = courses.filter(c => c.departmentId === selectedDeptId && c.semester === s);
    }
    return map;
  }, [courses, selectedDeptId]);

  // Overall department metrics
  const departmentCourseCount = useMemo(() => {
    return courses.filter(c => c.departmentId === selectedDeptId).length;
  }, [courses, selectedDeptId]);

  const totalDepartmentCredits = useMemo(() => {
    return courses
      .filter(c => c.departmentId === selectedDeptId)
      .reduce((sum, c) => sum + (c.credits || 0), 0);
  }, [courses, selectedDeptId]);

  const openAddModal = (defaultSem?: number) => {
    setEditingCourse(null);
    setFormDeptId(selectedDeptId === 'All' ? departments[0]?.id || 'dept-5' : selectedDeptId);
    setFormSemester(defaultSem || (selectedSemFilter !== 'All' ? Number(selectedSemFilter) : 1));
    setFormName('');
    setFormCode('');
    setFormCredits(3);
    setFormFacultyId(faculty[0]?.id || '');
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (course: Course) => {
    setEditingCourse(course);
    setFormDeptId(course.departmentId);
    setFormSemester(course.semester);
    setFormName(course.name);
    setFormCode(course.code);
    setFormCredits(course.credits);
    setFormFacultyId(course.facultyId || '');
    setFormError('');
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError('Please enter a valid Subject Name');
      return;
    }
    if (!formCode.trim()) {
      setFormError('Please enter a valid Subject/Course Code (e.g. CS-401)');
      return;
    }

    if (editingCourse) {
      const updated: Course = {
        ...editingCourse,
        name: formName.trim(),
        code: formCode.trim().toUpperCase(),
        departmentId: formDeptId,
        semester: Number(formSemester),
        credits: Number(formCredits),
        facultyId: formFacultyId || undefined
      };
      onUpdateCourse(updated);
    } else {
      const newCourse: Course = {
        id: `c-${Date.now()}`,
        name: formName.trim(),
        code: formCode.trim().toUpperCase(),
        departmentId: formDeptId,
        semester: Number(formSemester),
        credits: Number(formCredits),
        facultyId: formFacultyId || undefined
      };
      onAddCourse(newCourse);
    }

    setShowModal(false);
  };

  const handleDelete = (course: Course) => {
    if (confirm(`Are you sure you want to permanently delete the prescribed subject "${course.name} (${course.code})"?`)) {
      onDeleteCourse(course.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="relative overflow-hidden rounded-3xl border border-teal-200/80 bg-linear-to-r from-teal-500/10 via-emerald-500/5 to-indigo-500/10 p-6 shadow-xs dark:border-teal-900/40 dark:from-teal-950/40 dark:via-slate-900 dark:to-indigo-950/20">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-lg shadow-teal-600/30">
              <BookOpen className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-teal-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300">
                  Curriculum Engine
                </span>
                <span className="text-xs text-slate-400 font-mono">Academic Regulations</span>
              </div>
              <h2 className="font-sans text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                Department Subjects & Semester Curriculum
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Add, manage, and structure prescribed subjects for all departments across Semesters 1 to 8.
              </p>
            </div>
          </div>

          {canModify && (
            <button
              onClick={() => openAddModal()}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-teal-600 px-5 py-3 text-xs font-bold text-white shadow-md shadow-teal-600/20 transition-all hover:bg-teal-700 active:scale-98"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Add New Subject</span>
            </button>
          )}
        </div>

        {/* Top KPI Metrics Grid */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-4 backdrop-blur-xs shadow-2xs dark:border-slate-800 dark:bg-slate-900/80">
            <div className="flex items-center gap-2 text-slate-400">
              <Layers className="h-4 w-4 text-teal-500" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Dept Subjects</span>
            </div>
            <h4 className="text-2xl font-black font-mono text-slate-900 dark:text-white mt-1">
              {departmentCourseCount}
            </h4>
            <p className="text-[10px] font-mono text-slate-400 mt-0.5">
              {activeDepartment?.code} Prescribed Syllabus
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-4 backdrop-blur-xs shadow-2xs dark:border-slate-800 dark:bg-slate-900/80">
            <div className="flex items-center gap-2 text-slate-400">
              <Award className="h-4 w-4 text-emerald-500" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Total Credits</span>
            </div>
            <h4 className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1">
              {totalDepartmentCredits} Credits
            </h4>
            <p className="text-[10px] font-mono text-slate-400 mt-0.5">
              Across 8 Academic Semesters
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-4 backdrop-blur-xs shadow-2xs dark:border-slate-800 dark:bg-slate-900/80">
            <div className="flex items-center gap-2 text-slate-400">
              <Building className="h-4 w-4 text-indigo-500" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Active Dept</span>
            </div>
            <h4 className="text-lg font-black text-slate-900 dark:text-white mt-1 truncate">
              {activeDepartment?.name}
            </h4>
            <p className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 mt-0.5">
              Code: {activeDepartment?.code}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-4 backdrop-blur-xs shadow-2xs dark:border-slate-800 dark:bg-slate-900/80">
            <div className="flex items-center gap-2 text-slate-400">
              <Users className="h-4 w-4 text-purple-500" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Faculty Pool</span>
            </div>
            <h4 className="text-2xl font-black font-mono text-purple-600 dark:text-purple-400 mt-1">
              {faculty.length} Instructors
            </h4>
            <p className="text-[10px] font-mono text-slate-400 mt-0.5">
              Available for Assignment
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {/* Department Selector */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
              Filter by Department
            </label>
            <select
              value={selectedDeptId}
              onChange={(e) => setSelectedDeptId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            >
              <option value="All">All Departments ({departments.length})</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>

          {/* Search Box */}
          <div className="md:col-span-2">
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
              Search Subject Title or Code
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search e.g. DBMS, TOC, CS-301, Machine Learning..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Semester Filter Tabs */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase text-slate-400">
              Semester Term Filter
            </span>
            <span className="text-[10px] font-mono text-teal-600 dark:text-teal-400">
              Showing {filteredCourses.length} Subjects
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 bg-slate-50 p-1.5 rounded-2xl border border-slate-200 dark:bg-slate-950 dark:border-slate-800">
            <button
              onClick={() => setSelectedSemFilter('All')}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                selectedSemFilter === 'All'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-200/60 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              All Semesters (1-8)
            </button>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(s => {
              const count = selectedDeptId === 'All'
                ? courses.filter(c => c.semester === s).length
                : (semesterMap[s]?.length || 0);
              const isSelected = selectedSemFilter === String(s);
              return (
                <button
                  key={s}
                  onClick={() => setSelectedSemFilter(String(s))}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-teal-600 text-white shadow-md'
                      : 'text-slate-600 hover:bg-slate-200/60 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>Sem {s}</span>
                  <span className="text-[9px] opacity-75 font-mono">({count})</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Semester Curriculum Matrix Grid (When single dept is selected) */}
      {selectedDeptId !== 'All' && selectedSemFilter === 'All' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-sans text-sm font-bold text-slate-900 dark:text-white">
              8-Semester Curriculum Roadmap ({activeDepartment?.name})
            </h3>
            <span className="text-xs text-slate-400 font-mono">Click on any semester to add subjects</span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => {
              const semCourses = semesterMap[sem] || [];
              const semCredits = semCourses.reduce((sum, c) => sum + (c.credits || 0), 0);
              const year = Math.ceil(sem / 2);
              return (
                <div
                  key={sem}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs transition-all hover:border-teal-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-teal-900"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 dark:border-slate-800">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-teal-600 dark:text-teal-400">
                        Year {year}
                      </span>
                      <h4 className="font-sans text-sm font-extrabold text-slate-900 dark:text-white">
                        Semester {sem}
                      </h4>
                    </div>
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-mono font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {semCredits} Credits
                    </span>
                  </div>

                  {/* Subject List */}
                  <div className="mt-3 space-y-1.5 min-h-[100px]">
                    {semCourses.length > 0 ? (
                      semCourses.map(course => (
                        <div
                          key={course.id}
                          className="flex items-center justify-between rounded-xl bg-slate-50 p-2 text-xs border border-slate-100 dark:bg-slate-950/70 dark:border-slate-800 group"
                        >
                          <div className="truncate mr-1">
                            <span className="font-mono text-[10px] font-bold text-teal-600 dark:text-teal-400 mr-1.5">
                              {course.code}
                            </span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {course.name}
                            </span>
                          </div>
                          {canModify && (
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => openEditModal(course)}
                                className="text-slate-400 hover:text-teal-600 p-0.5"
                                title="Edit"
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(course)}
                                className="text-slate-400 hover:text-rose-600 p-0.5"
                                title="Delete"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-[11px] text-slate-400 italic text-center py-4">
                        No subjects added yet
                      </p>
                    )}
                  </div>

                  {canModify && (
                    <button
                      onClick={() => openAddModal(sem)}
                      className="mt-3 w-full rounded-xl border border-dashed border-teal-300 bg-teal-50/50 py-1.5 text-center text-[11px] font-bold text-teal-700 transition-colors hover:bg-teal-100 dark:border-teal-900/50 dark:bg-teal-950/30 dark:text-teal-300"
                    >
                      + Add Subject to Sem {sem}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Subjects Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div>
            <h3 className="font-sans text-sm font-bold text-slate-900 dark:text-white">
              Prescribed Subject Roster
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Comprehensive list of academic courses, syllabus codes, and faculty in-charge.
            </p>
          </div>

          {canModify && (
            <button
              onClick={() => openAddModal()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-teal-700 transition-colors"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>Add Subject</span>
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/40 font-bold uppercase text-slate-400">
                <th className="px-6 py-3.5">Course Code</th>
                <th className="px-6 py-3.5">Subject Name</th>
                <th className="px-6 py-3.5">Department</th>
                <th className="px-6 py-3.5">Term / Year</th>
                <th className="px-6 py-3.5">Credits</th>
                <th className="px-6 py-3.5">Assigned Faculty</th>
                {canModify && <th className="px-6 py-3.5 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {filteredCourses.length > 0 ? (
                filteredCourses.map(course => {
                  const dept = departments.find(d => d.id === course.departmentId);
                  const fac = faculty.find(f => f.id === course.facultyId);
                  const facUser = fac ? users.find(u => u.id === fac.userId) : null;
                  const year = Math.ceil(course.semester / 2);

                  return (
                    <tr key={course.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50 transition-colors">
                      <td className="px-6 py-4 font-mono font-black text-teal-600 dark:text-teal-400">
                        {course.code}
                      </td>
                      <td className="px-6 py-4 text-slate-900 dark:text-white font-bold">
                        {course.name}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {dept?.code || 'CSE'} - {dept?.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-600 dark:text-slate-300">
                        <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-[10px] font-bold text-teal-700 dark:bg-teal-950/40 dark:text-teal-300">
                          Sem {course.semester} (Year {year})
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                        {course.credits} Credits
                      </td>
                      <td className="px-6 py-4">
                        {facUser ? (
                          <div className="flex items-center gap-2">
                            <img
                              src={facUser.photo || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120'}
                              alt={facUser.name}
                              className="h-6 w-6 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                            />
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white text-xs">{facUser.name}</p>
                              <p className="text-[10px] text-slate-400">{fac?.designation || 'Instructor'}</p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Unassigned</span>
                        )}
                      </td>
                      {canModify && (
                        <td className="px-6 py-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() => openEditModal(course)}
                              className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 shadow-2xs hover:bg-slate-50 hover:text-teal-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800"
                              title="Edit Subject"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(course)}
                              className="rounded-lg border border-rose-200 bg-rose-50/50 p-1.5 text-rose-600 shadow-2xs hover:bg-rose-100 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-400"
                              title="Delete Subject"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={canModify ? 7 : 6} className="px-6 py-12 text-center text-slate-400 italic">
                    No prescribed subjects found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Subject Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-white shadow-md shadow-teal-600/20">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-sans text-sm font-extrabold text-slate-900 dark:text-white">
                    {editingCourse ? 'Edit Prescribed Subject' : 'Add Subject to Curriculum'}
                  </h3>
                  <p className="text-[11px] text-slate-400">Configure subject parameters for semester registry</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-slate-600 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-bold text-rose-700 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Department */}
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                    Department *
                  </label>
                  <select
                    value={formDeptId}
                    onChange={(e) => setFormDeptId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    required
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Semester */}
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                    Semester & Academic Year *
                  </label>
                  <select
                    value={formSemester}
                    onChange={(e) => setFormSemester(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    required
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                      <option key={s} value={s}>
                        Semester {s} (Year {Math.ceil(s / 2)})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Subject Name */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                  Subject Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Distributed Database Management Systems"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Course Code */}
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                    Course Code *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. CS-401 or MA-3151"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono font-bold text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    required
                  />
                </div>

                {/* Credits */}
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                    Academic Credits *
                  </label>
                  <select
                    value={formCredits}
                    onChange={(e) => setFormCredits(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  >
                    {[1, 2, 3, 4, 5, 6].map(c => (
                      <option key={c} value={c}>
                        {c} Credit{c > 1 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Faculty Instructor */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                  Assign Faculty Instructor (Optional)
                </label>
                <select
                  value={formFacultyId}
                  onChange={(e) => setFormFacultyId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                >
                  <option value="">-- No Faculty Assigned Yet --</option>
                  {faculty.map(f => {
                    const u = users.find(user => user.id === f.userId);
                    const d = departments.find(dep => dep.id === f.departmentId);
                    return (
                      <option key={f.id} value={f.id}>
                        {u?.name} ({f.designation} - {d?.code || 'Dept'})
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-teal-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-teal-700 transition-colors"
                >
                  {editingCourse ? 'Save Changes' : 'Add Subject to Curriculum'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

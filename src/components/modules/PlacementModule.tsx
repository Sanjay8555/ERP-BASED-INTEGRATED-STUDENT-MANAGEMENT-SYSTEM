/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Briefcase,
  Building2,
  Users,
  Award,
  Search,
  Filter,
  Download,
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronRight,
  Eye,
  Plus,
  Trash2,
  Edit,
  Mail,
  Phone,
  GraduationCap,
  Sparkles,
  TrendingUp,
  FileSpreadsheet,
  Check,
  X,
  ExternalLink,
  Code2,
  Calendar,
  Layers,
  MapPin,
  IndianRupee,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  StudentProfile,
  User,
  Department,
  CodingTest,
  CodingTestSubmission,
  PlacementDrive,
  UserRole
} from '../../types';

interface PlacementModuleProps {
  students: StudentProfile[];
  users: User[];
  departments: Department[];
  codingTests: CodingTest[];
  submissions: CodingTestSubmission[];
  drives: PlacementDrive[];
  role: UserRole;
  currentUser?: User;
  onAddDrive: (drive: PlacementDrive) => void;
  onUpdateDrive: (drive: PlacementDrive) => void;
  onDeleteDrive: (driveId: string) => void;
  onRegisterStudentForDrive: (driveId: string, studentId: string) => void;
}

export default function PlacementModule({
  students,
  users,
  departments,
  codingTests,
  submissions,
  drives,
  role,
  currentUser,
  onAddDrive,
  onUpdateDrive,
  onDeleteDrive,
  onRegisterStudentForDrive
}: PlacementModuleProps) {
  const [activeTab, setActiveTab] = useState<'dossier' | 'drives' | 'analytics'>('dossier');

  // Filters for Student Dossier
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [minCgpaFilter, setMinCgpaFilter] = useState<number>(0);
  const [codingScoreFilter, setCodingScoreFilter] = useState<number>(0);
  const [selectedStudentForModal, setSelectedStudentForModal] = useState<StudentProfile | null>(null);

  // Hiring Drive creation modal
  const [showAddDriveModal, setShowAddDriveModal] = useState<boolean>(false);
  const [newCompanyName, setNewCompanyName] = useState<string>('');
  const [newCompanyLogo, setNewCompanyLogo] = useState<string>('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=120');
  const [newRole, setNewRole] = useState<string>('Software Engineer');
  const [newPackageLPA, setNewPackageLPA] = useState<number>(12.0);
  const [newMinCgpa, setNewMinCgpa] = useState<number>(7.0);
  const [newMinCodingScore, setNewMinCodingScore] = useState<number>(60);
  const [newLocation, setNewLocation] = useState<string>('Bengaluru / Remote');
  const [newDriveDate, setNewDriveDate] = useState<string>('2026-09-15');
  const [newDeadline, setNewDeadline] = useState<string>('2026-09-01');
  const [newDesc, setNewDesc] = useState<string>('Campus placement drive for high-growth product engineering roles.');

  // Student registered details modal for drives
  const [selectedDriveForApplicants, setSelectedDriveForApplicants] = useState<PlacementDrive | null>(null);

  // Calculate metrics
  const totalStudents = students.length;
  const eligibleStudents = students.filter(s => s.cgpa >= 7.5);
  const activeDrivesCount = drives.filter(d => d.status === 'Upcoming' || d.status === 'Ongoing').length;

  const avgCodingScore = submissions.length > 0
    ? Math.round(submissions.reduce((a, b) => a + b.percentage, 0) / submissions.length)
    : 0;

  // Filter students
  const filteredStudents = students.filter(s => {
    const user = users.find(u => u.id === s.userId);
    const nameMatch = user?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.rollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user?.email.toLowerCase().includes(searchQuery.toLowerCase());

    const deptMatch = selectedDept === 'all' || s.departmentId === selectedDept;
    const cgpaMatch = s.cgpa >= minCgpaFilter;

    // Student's coding test scores
    const studentSubs = submissions.filter(sub => sub.studentId === s.id);
    const bestCodingScore = studentSubs.length > 0
      ? Math.max(...studentSubs.map(sub => sub.percentage))
      : 0;
    const codingMatch = bestCodingScore >= codingScoreFilter;

    return nameMatch && deptMatch && cgpaMatch && codingMatch;
  });

  // Handle Add Drive
  const handleSaveDrive = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName.trim() || !newRole.trim()) {
      alert('Company name and role are required.');
      return;
    }

    const newDrive: PlacementDrive = {
      id: `pd-${Date.now()}`,
      companyName: newCompanyName.trim(),
      companyLogo: newCompanyLogo,
      role: newRole.trim(),
      packageLPA: Number(newPackageLPA) || 10,
      eligibleMinCgpa: Number(newMinCgpa) || 7.0,
      eligibleDepartments: ['dept-5', 'dept-3', 'dept-2', 'dept-1'],
      minCodingScorePercent: Number(newMinCodingScore) || 60,
      jobLocation: newLocation.trim(),
      driveDate: newDriveDate,
      deadline: newDeadline,
      description: newDesc.trim(),
      status: 'Upcoming',
      registeredStudentIds: []
    };

    onAddDrive(newDrive);
    setShowAddDriveModal(false);
    alert(`Placement Drive for "${newDrive.companyName}" published successfully!`);
  };

  // Export Student Master List to CSV
  const handleExportStudentsCSV = () => {
    const headers = [
      'Student Roll No',
      'Name',
      'Email',
      'Phone',
      'Department',
      'Semester',
      'CGPA',
      'Parent Name',
      'Parent Contact',
      'Placement Eligibility',
      'Best Coding Assessment %'
    ];

    const rows = filteredStudents.map(s => {
      const u = users.find(user => user.id === s.userId);
      const d = departments.find(dept => dept.id === s.departmentId);
      const studentSubs = submissions.filter(sub => sub.studentId === s.id);
      const bestScore = studentSubs.length > 0 ? `${Math.max(...studentSubs.map(sub => sub.percentage))}%` : 'N/A';
      const isEligible = s.cgpa >= 7.5 ? 'Eligible (Tier 1)' : s.cgpa >= 6.5 ? 'Eligible (Tier 2)' : 'Requires Review';

      return [
        s.rollNo,
        `"${u?.name || 'N/A'}"`,
        u?.email || 'N/A',
        s.phone,
        `"${d?.name || s.departmentId}"`,
        s.currentSemester,
        s.cgpa,
        `"${s.parentName}"`,
        s.parentPhone,
        isEligible,
        bestScore
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Student_Placement_Dossier_Master_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col gap-4 rounded-2xl bg-linear-to-r from-slate-900 via-indigo-950 to-teal-950 p-6 text-white shadow-xl md:flex-row md:items-center md:justify-between border border-indigo-800/40">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
              <Briefcase className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white md:text-2xl">
                Placement Cell & Corporate Relations Desk
              </h1>
              <p className="text-xs text-teal-200/80 font-mono">
                Student Placement Dossier • Campus Recruitment Drives • Tech Assessment Tracking
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Badges */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowAddDriveModal(true)}
            className="flex items-center gap-2 rounded-xl bg-teal-500 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-lg hover:bg-teal-400 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Launch Campus Drive</span>
          </button>

          <button
            onClick={handleExportStudentsCSV}
            className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-white/20 transition-all cursor-pointer backdrop-blur-xs border border-white/10"
          >
            <Download className="h-4 w-4" />
            <span>Export Master Dossier</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">Total Candidates</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
              <Users className="h-4.5 w-4.5" />
            </div>
          </div>
          <p className="mt-2 font-sans text-2xl font-black text-slate-900 dark:text-white">{totalStudents}</p>
          <p className="mt-1 text-[11px] text-slate-400 font-mono">Across all branches</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-mono">Placement Ready</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <ShieldCheck className="h-4.5 w-4.5" />
            </div>
          </div>
          <p className="mt-2 font-sans text-2xl font-black text-slate-900 dark:text-white">{eligibleStudents.length}</p>
          <p className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">CGPA &ge; 7.5 eligible</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">Upcoming Drives</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
              <Building2 className="h-4.5 w-4.5" />
            </div>
          </div>
          <p className="mt-2 font-sans text-2xl font-black text-slate-900 dark:text-white">{activeDrivesCount}</p>
          <p className="mt-1 text-[11px] text-indigo-500 font-mono">{drives.length} total companies</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 font-mono">Avg Coding Rating</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400">
              <Code2 className="h-4.5 w-4.5" />
            </div>
          </div>
          <p className="mt-2 font-sans text-2xl font-black text-slate-900 dark:text-white">{avgCodingScore}%</p>
          <p className="mt-1 text-[11px] text-teal-600 dark:text-teal-400 font-mono">Based on 300+ tests</p>
        </div>
      </div>

      {/* Module Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('dossier')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'dossier'
              ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Student Placement Dossier ({students.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('drives')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'drives'
              ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          <Building2 className="h-4 w-4" />
          <span>Campus Drives & Offers ({drives.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'analytics'
              ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          <TrendingUp className="h-4 w-4" />
          <span>Placement Readiness Analytics</span>
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 1. STUDENT PLACEMENT DOSSIER & DIRECTORY */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'dossier' && (
        <div className="space-y-6">
          {/* Advanced Filter Toolbar */}
          <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-xs dark:bg-slate-900 border border-slate-200 dark:border-slate-800 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search student name, roll number, email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              {/* Department */}
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
              >
                <option value="all">All Departments</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>

              {/* Min CGPA filter */}
              <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-1.5 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 text-xs">
                <span className="text-slate-400 font-mono">Min CGPA:</span>
                <select
                  value={minCgpaFilter}
                  onChange={(e) => setMinCgpaFilter(Number(e.target.value))}
                  className="bg-transparent font-bold text-slate-800 dark:text-white focus:outline-hidden"
                >
                  <option value={0}>All CGPA</option>
                  <option value={6.0}>&ge; 6.0</option>
                  <option value={7.0}>&ge; 7.0 (Tier 2)</option>
                  <option value={7.5}>&ge; 7.5 (Placement Tier 1)</option>
                  <option value={8.0}>&ge; 8.0 (Dream Offers)</option>
                  <option value={9.0}>&ge; 9.0 (Super Dream)</option>
                </select>
              </div>

              {/* Coding Cutoff */}
              <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-1.5 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 text-xs">
                <span className="text-slate-400 font-mono">Coding Test %:</span>
                <select
                  value={codingScoreFilter}
                  onChange={(e) => setCodingScoreFilter(Number(e.target.value))}
                  className="bg-transparent font-bold text-teal-600 dark:text-teal-400 focus:outline-hidden"
                >
                  <option value={0}>Any Score</option>
                  <option value={50}>&ge; 50% Passed</option>
                  <option value={70}>&ge; 70% Strong</option>
                  <option value={85}>&ge; 85% Expert Coders</option>
                </select>
              </div>
            </div>

            <div className="text-right text-xs font-mono text-slate-400">
              Matched {filteredStudents.length} of {students.length} Candidates
            </div>
          </div>

          {/* Student Dossier Table */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-400">
                  <tr>
                    <th className="px-6 py-3.5">Candidate Name</th>
                    <th className="px-6 py-3.5">Roll No & Batch</th>
                    <th className="px-6 py-3.5">Department</th>
                    <th className="px-6 py-3.5">CGPA</th>
                    <th className="px-6 py-3.5">Coding Test Performance</th>
                    <th className="px-6 py-3.5">Placement Status</th>
                    <th className="px-6 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredStudents.map(student => {
                    const user = users.find(u => u.id === student.userId);
                    const dept = departments.find(d => d.id === student.departmentId);
                    const studentSubs = submissions.filter(sub => sub.studentId === student.id);
                    const bestScore = studentSubs.length > 0
                      ? Math.max(...studentSubs.map(s => s.percentage))
                      : 0;

                    const isEligibleTier1 = student.cgpa >= 7.5 && bestScore >= 60;

                    return (
                      <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 overflow-hidden rounded-full border border-slate-200 bg-slate-100 dark:border-slate-800">
                              {user?.photo ? (
                                <img src={user.photo} alt={user.name} className="h-full w-full object-cover" />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center font-bold text-slate-500">
                                  {user?.name.charAt(0) || 'S'}
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white">
                                {user?.name || 'Student Candidate'}
                              </p>
                              <p className="text-[11px] text-slate-400">{user?.email || 'N/A'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono text-slate-600 dark:text-slate-400">
                          <span className="font-bold text-slate-800 dark:text-slate-200 block">{student.rollNo}</span>
                          <span className="text-[10px] text-slate-400">Sem {student.currentSemester} • {student.batch}</span>
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-300">
                          {dept?.name || student.departmentId}
                        </td>
                        <td className="px-6 py-4 font-mono font-bold">
                          <span className={`text-sm ${student.cgpa >= 8.0 ? 'text-emerald-600 dark:text-emerald-400' : student.cgpa >= 7.0 ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}>
                            {student.cgpa.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {studentSubs.length > 0 ? (
                            <div className="space-y-1 font-mono text-xs">
                              <span className="font-bold text-teal-600 dark:text-teal-400">
                                {bestScore}% Best Score
                              </span>
                              <span className="text-[10px] text-slate-400 block">
                                ({studentSubs.length} assessment{studentSubs.length > 1 ? 's' : ''} logged)
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">No tests attempted</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {isEligibleTier1 ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                              <Check className="h-3 w-3" /> Tier-1 Eligible
                            </span>
                          ) : student.cgpa >= 6.5 ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-bold text-blue-800 dark:bg-blue-950/40 dark:text-blue-300">
                              Tier-2 Eligible
                            </span>
                          ) : (
                            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                              In Review
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => setSelectedStudentForModal(student)}
                            className="inline-flex items-center gap-1 rounded-xl bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-700 hover:bg-teal-100 dark:bg-teal-950/50 dark:text-teal-300 cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>View Dossier</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. CAMPUS HIRING DRIVES MANAGEMENT */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'drives' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {drives.map(drive => {
              const eligibleCount = students.filter(s => s.cgpa >= drive.eligibleMinCgpa).length;

              return (
                <div
                  key={drive.id}
                  className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:shadow-md transition-all dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 overflow-hidden rounded-xl bg-slate-100 p-1 border border-slate-200 dark:border-slate-800">
                          <img src={drive.companyLogo} alt={drive.companyName} className="h-full w-full object-contain" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 dark:text-white">
                            {drive.companyName}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{drive.jobLocation}</p>
                        </div>
                      </div>

                      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 font-mono">
                        {drive.packageLPA} LPA
                      </span>
                    </div>

                    <div>
                      <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{drive.role}</p>
                      <p className="mt-1 text-xs text-slate-600 line-clamp-2 dark:text-slate-400">{drive.description}</p>
                    </div>

                    {/* Criteria Box */}
                    <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-3 font-mono text-xs text-slate-700 dark:bg-slate-950 dark:text-slate-300 border border-slate-200/60 dark:border-slate-800">
                      <div>
                        <span className="text-[10px] uppercase text-slate-400 block">Min CGPA</span>
                        <span className="font-bold text-slate-900 dark:text-white">{drive.eligibleMinCgpa} CGPA</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-slate-400 block">Min Coding %</span>
                        <span className="font-bold text-teal-600 dark:text-teal-400">{drive.minCodingScorePercent}%</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-slate-400 block">Drive Date</span>
                        <span className="text-slate-800 dark:text-slate-200">{drive.driveDate}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-slate-400 block">Eligible Pool</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">{eligibleCount} Students</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <button
                      onClick={() => setSelectedDriveForApplicants(drive)}
                      className="rounded-xl bg-slate-100 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 cursor-pointer"
                    >
                      <span>Applicants ({drive.registeredStudentIds.length})</span>
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Cancel and delete campus drive for "${drive.companyName}"?`)) {
                          onDeleteDrive(drive.id);
                        }
                      }}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl dark:hover:bg-rose-950/30 cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. PLACEMENT READINESS ANALYTICS */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Department-wise Placement Eligibility */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-4">
                Department-Wise Placement Readiness Ratio
              </h3>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={departments.map(d => ({
                      name: d.code,
                      Eligible: students.filter(s => s.departmentId === d.id && s.cgpa >= 7.5).length,
                      Total: students.filter(s => s.departmentId === d.id).length
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" fontSize={11} stroke="#94a3b8" />
                    <YAxis fontSize={11} stroke="#94a3b8" />
                    <Tooltip />
                    <Bar dataKey="Eligible" fill="#0d9488" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Total" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Student Coders Leaderboard */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-4">
                Top Technical Coders (Campus Leaderboard)
              </h3>
              <div className="flex-1 space-y-3 overflow-y-auto">
                {submissions.slice(0, 5).map((sub, idx) => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between rounded-xl bg-slate-50 p-3 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-600 text-xs font-bold text-white font-mono">
                        #{idx + 1}
                      </span>
                      <div>
                        <p className="font-bold text-xs text-slate-900 dark:text-white">{sub.studentName}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{sub.studentRollNo}</p>
                      </div>
                    </div>
                    <div className="text-right font-mono text-xs">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{sub.percentage}%</span>
                      <span className="text-[10px] text-slate-400 block">{sub.totalScore}/{sub.maxScore} Pts</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: STUDENT DOSSIER PREVIEW */}
      {/* ------------------------------------------------------------- */}
      {selectedStudentForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6">
            {(() => {
              const user = users.find(u => u.id === selectedStudentForModal.userId);
              const dept = departments.find(d => d.id === selectedStudentForModal.departmentId);
              const studentSubs = submissions.filter(sub => sub.studentId === selectedStudentForModal.id);

              return (
                <>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 overflow-hidden rounded-2xl bg-teal-500/10 border border-teal-500/20">
                        {user?.photo ? (
                          <img src={user.photo} alt={user.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center font-bold text-teal-600">
                            {user?.name.charAt(0) || 'S'}
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                          {user?.name}
                        </h3>
                        <p className="text-xs text-slate-400 font-mono">
                          Roll No: {selectedStudentForModal.rollNo} • {dept?.name}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedStudentForModal(null)}
                      className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Quick Profile Summary */}
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 font-mono text-xs">
                    <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800">
                      <span className="text-[10px] uppercase text-slate-400 block">CGPA</span>
                      <span className="text-base font-bold text-teal-600 dark:text-teal-400">{selectedStudentForModal.cgpa.toFixed(2)}</span>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800">
                      <span className="text-[10px] uppercase text-slate-400 block">Semester</span>
                      <span className="text-base font-bold text-slate-800 dark:text-slate-200">Sem {selectedStudentForModal.currentSemester}</span>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800">
                      <span className="text-[10px] uppercase text-slate-400 block">Batch</span>
                      <span className="text-base font-bold text-slate-800 dark:text-slate-200">{selectedStudentForModal.batch}</span>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800">
                      <span className="text-[10px] uppercase text-slate-400 block">Placement Status</span>
                      <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Verified</span>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 space-y-2 text-xs">
                    <h4 className="font-bold text-slate-900 dark:text-white uppercase text-[10px] tracking-wider">
                      Official Contact & Family Dossier
                    </h4>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <Mail className="h-4 w-4 text-slate-400" />
                        <span>{user?.email || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <Phone className="h-4 w-4 text-slate-400" />
                        <span>{selectedStudentForModal.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <Users className="h-4 w-4 text-slate-400" />
                        <span>Parent: {selectedStudentForModal.parentName} ({selectedStudentForModal.parentPhone})</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <MapPin className="h-4 w-4 text-slate-400" />
                        <span>{selectedStudentForModal.address}</span>
                      </div>
                    </div>
                  </div>

                  {/* Coding Test History */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 font-mono">
                      Coding Assessment History & Test Transcripts
                    </h4>
                    {studentSubs.length > 0 ? (
                      <div className="space-y-2">
                        {studentSubs.map(sub => (
                          <div
                            key={sub.id}
                            className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-950 text-xs font-mono"
                          >
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white">{sub.testTitle}</p>
                              <p className="text-[10px] text-slate-400">{sub.submittedAt || sub.startedAt}</p>
                            </div>
                            <div className="text-right">
                              <span className="font-bold text-emerald-600 dark:text-emerald-400">{sub.percentage}%</span>
                              <span className="text-[10px] text-slate-400 block">{sub.totalScore}/{sub.maxScore} Pts</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No technical coding tests completed yet.</p>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: LAUNCH CAMPUS DRIVE */}
      {/* ------------------------------------------------------------- */}
      {showAddDriveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Launch Campus Placement Drive
              </h3>
              <button
                onClick={() => setShowAddDriveModal(false)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDrive} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Company Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Amazon / Zoho"
                    value={newCompanyName}
                    onChange={(e) => setNewCompanyName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Package (CTC in LPA)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newPackageLPA}
                    onChange={(e) => setNewPackageLPA(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Job Designation</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SDE-1 / Product Engineer"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Job Location</label>
                  <input
                    type="text"
                    placeholder="Bengaluru / Hyderabad / Chennai"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Min CGPA Cutoff</label>
                  <input
                    type="number"
                    step="0.1"
                    min={5.0}
                    max={10.0}
                    value={newMinCgpa}
                    onChange={(e) => setNewMinCgpa(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Min Coding Score %</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={newMinCodingScore}
                    onChange={(e) => setNewMinCodingScore(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Drive Date</label>
                  <input
                    type="date"
                    value={newDriveDate}
                    onChange={(e) => setNewDriveDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Application Deadline</label>
                  <input
                    type="date"
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Description & Requirements</label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddDriveModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-teal-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-teal-700 transition-colors cursor-pointer"
                >
                  Launch Drive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

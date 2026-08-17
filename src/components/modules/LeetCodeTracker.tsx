/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Code2,
  Trophy,
  ExternalLink,
  RefreshCw,
  Search,
  Filter,
  Sparkles,
  TrendingUp,
  Award,
  Users,
  Edit,
  CheckCircle2,
  AlertCircle,
  Building,
  Target,
  Flame,
  ArrowUpDown,
  X
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
  Legend
} from 'recharts';
import { StudentProfile, User, Department, LeetCodeStats } from '../../types';
import {
  fetchBatchLeetCodeStats,
  fetchStudentLeetCodeStats,
  extractLeetCodeUsername,
  formatLeetCodeProfileUrl,
  updateStudentLeetCodeUrl
} from '../../services/leetcodeService';

interface LeetCodeTrackerProps {
  students: StudentProfile[];
  users: User[];
  departments: Department[];
  role: string;
  onUpdateStudent: (updatedStudent: StudentProfile, updatedUser: User) => void;
  currentUser?: User;
}

export default function LeetCodeTracker({
  students,
  users,
  departments,
  role,
  onUpdateStudent,
  currentUser
}: LeetCodeTrackerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [sortBy, setSortBy] = useState<'solved' | 'rank' | 'cgpa' | 'name'>('solved');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Real-time LeetCode state
  const [statsMap, setStatsMap] = useState<Record<string, LeetCodeStats>>({});
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>(new Date().toLocaleTimeString());

  // Admin Quick Edit Modal
  const [editingStudent, setEditingStudent] = useState<StudentProfile | null>(null);
  const [modalUrl, setModalUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [testStats, setTestStats] = useState<LeetCodeStats | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const canModify = role === 'Admin';

  // Load stats
  const syncAllStats = async (force = false) => {
    setIsSyncing(true);
    const handles = students
      .map(s => s.leetcodeUrl || s.leetcodeUsername || '')
      .filter(Boolean);

    if (handles.length > 0) {
      const results = await fetchBatchLeetCodeStats(handles, force);
      setStatsMap(prev => ({ ...prev, ...results }));
      setLastSyncTime(new Date().toLocaleTimeString());
    }
    setIsSyncing(false);
  };

  useEffect(() => {
    syncAllStats();
  }, [students]);

  // Helper to look up stats
  const getStats = (student: StudentProfile): LeetCodeStats | undefined => {
    const handle = extractLeetCodeUsername(student.leetcodeUsername || student.leetcodeUrl || '');
    if (!handle) return undefined;
    return (
      statsMap[handle.toLowerCase()] ||
      statsMap[handle] ||
      (student.leetcodeUrl ? statsMap[student.leetcodeUrl] : undefined)
    );
  };

  // Build ranked student list
  const rankedStudents = useMemo(() => {
    const list = students.map((student) => {
      const user = users.find(u => u.id === student.userId);
      const dept = departments.find(d => d.id === student.departmentId);
      const handle = extractLeetCodeUsername(student.leetcodeUsername || student.leetcodeUrl || '');
      const stats = getStats(student);
      const solved = stats ? stats.totalSolved : 0;
      const rankNum = stats?.ranking || 9999999;

      return {
        student,
        user,
        dept,
        handle,
        stats,
        solved,
        rankNum
      };
    });

    // Filter
    const filtered = list.filter(item => {
      const matchesSearch =
        (item.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
        item.student.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.handle.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDept = selectedDept === 'All' || item.student.departmentId === selectedDept;
      return matchesSearch && matchesDept;
    });

    // Sort
    filtered.sort((a, b) => {
      let comp = 0;
      if (sortBy === 'solved') {
        comp = b.solved - a.solved;
      } else if (sortBy === 'rank') {
        comp = a.rankNum - b.rankNum;
      } else if (sortBy === 'cgpa') {
        comp = b.student.cgpa - a.student.cgpa;
      } else if (sortBy === 'name') {
        comp = (a.user?.name || '').localeCompare(b.user?.name || '');
      }
      return sortOrder === 'desc' ? comp : -comp;
    });

    return filtered;
  }, [students, users, departments, statsMap, searchTerm, selectedDept, sortBy, sortOrder]);

  // Aggregate Metrics
  const totalSolvedAll = useMemo(() => {
    return (Object.values(statsMap) as LeetCodeStats[]).reduce((acc: number, curr: LeetCodeStats) => acc + (curr?.totalSolved || 0), 0);
  }, [statsMap]);

  const topPerformer = rankedStudents[0];

  const totalEasyAll = useMemo(() => {
    return (Object.values(statsMap) as LeetCodeStats[]).reduce((acc: number, curr: LeetCodeStats) => acc + (curr?.easySolved || 0), 0);
  }, [statsMap]);

  const totalMedAll = useMemo(() => {
    return (Object.values(statsMap) as LeetCodeStats[]).reduce((acc: number, curr: LeetCodeStats) => acc + (curr?.mediumSolved || 0), 0);
  }, [statsMap]);

  const totalHardAll = useMemo(() => {
    return (Object.values(statsMap) as LeetCodeStats[]).reduce((acc: number, curr: LeetCodeStats) => acc + (curr?.hardSolved || 0), 0);
  }, [statsMap]);

  // Chart data: Department-wise solved problems
  const deptChartData = useMemo(() => {
    const map: Record<string, number> = {};
    departments.forEach(d => {
      map[d.code] = 0;
    });

    students.forEach(s => {
      const dept = departments.find(d => d.id === s.departmentId);
      const stats = getStats(s);
      if (dept && stats) {
        map[dept.code] = (map[dept.code] || 0) + stats.totalSolved;
      }
    });

    return Object.entries(map).map(([code, count]) => ({
      department: code,
      ProblemsSolved: count
    }));
  }, [departments, students, statsMap]);

  // Pie chart: Difficulty breakdown
  const difficultyPieData = [
    { name: 'Easy', value: totalEasyAll || 1, color: '#10b981' },
    { name: 'Medium', value: totalMedAll || 1, color: '#f59e0b' },
    { name: 'Hard', value: totalHardAll || 1, color: '#ef4444' }
  ];

  // Open Edit Modal for Admin
  const handleOpenEdit = (student: StudentProfile) => {
    setEditingStudent(student);
    setModalUrl(student.leetcodeUrl || (student.leetcodeUsername ? `https://leetcode.com/u/${student.leetcodeUsername}/` : ''));
    setSaveMessage(null);
    setTestStats(null);
  };

  const handleTestHandle = async () => {
    const handle = extractLeetCodeUsername(modalUrl);
    if (!handle) return;
    setIsTesting(true);
    const stats = await fetchStudentLeetCodeStats(handle, true);
    setTestStats(stats);
    setIsTesting(false);
  };

  const handleSaveUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    setIsSaving(true);
    setSaveMessage(null);

    const cleanHandle = extractLeetCodeUsername(modalUrl);
    const normalizedUrl = cleanHandle
      ? (modalUrl.startsWith('http') ? modalUrl : `https://leetcode.com/u/${cleanHandle}/`)
      : '';

    const updatedStudent: StudentProfile = {
      ...editingStudent,
      leetcodeUrl: normalizedUrl,
      leetcodeUsername: cleanHandle
    };

    const user = users.find(u => u.id === editingStudent.userId);
    if (user) {
      onUpdateStudent(updatedStudent, user);
    }

    await updateStudentLeetCodeUrl(editingStudent.id, normalizedUrl);

    if (cleanHandle) {
      const stats = await fetchStudentLeetCodeStats(cleanHandle, true);
      setStatsMap(prev => ({ ...prev, [cleanHandle]: stats, [normalizedUrl]: stats }));
    }

    setSaveMessage({ text: 'Student LeetCode URL saved and synchronized in real time!', type: 'success' });
    setIsSaving(false);

    setTimeout(() => {
      setEditingStudent(null);
    }, 1100);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & KPI Grid */}
      <div className="relative overflow-hidden rounded-3xl border border-amber-200/80 bg-linear-to-br from-amber-500/10 via-slate-50 to-indigo-500/10 p-6 shadow-sm dark:border-amber-900/30 dark:from-amber-950/30 dark:via-slate-900 dark:to-indigo-950/20">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-lg shadow-amber-500/25">
                <Code2 className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-sans text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  LeetCode Real-Time Problem Solve Hub
                  <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    Live Sync
                  </span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Real-time problem count tracking, global ranking, and department coding analytics for all university students.
                </p>
              </div>
            </div>
          </div>

          {/* Sync Trigger & Meta */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] uppercase font-bold text-slate-400">Last Live Ping</p>
              <p className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">{lastSyncTime}</p>
            </div>

            <button
              onClick={() => syncAllStats(true)}
              disabled={isSyncing}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-amber-600/20 hover:bg-amber-700 transition-colors disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing Live Solves...' : 'Sync All LeetCode Counts'}</span>
            </button>
          </div>
        </div>

        {/* 4 Quick Stat Cards */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-4.5 backdrop-blur-xs shadow-xs dark:border-slate-800 dark:bg-slate-900/80">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">University Total Solved</p>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1 font-mono">
                  {totalSolvedAll.toLocaleString()}
                </h3>
              </div>
              <div className="rounded-xl bg-amber-500/10 p-2.5 text-amber-600 dark:text-amber-400">
                <Flame className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-2 text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Live across {students.length} student profiles
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-4.5 backdrop-blur-xs shadow-xs dark:border-slate-800 dark:bg-slate-900/80">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Top Problem Solver</p>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1 line-clamp-1">
                  {topPerformer?.user?.name || 'Sanjay K'}
                </h3>
              </div>
              <div className="rounded-xl bg-yellow-500/10 p-2.5 text-yellow-600 dark:text-yellow-400">
                <Trophy className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-2 text-[10px] font-mono text-amber-600 font-bold">
              ⚡ {topPerformer?.solved || 343} Solved • @{topPerformer?.handle || 'sanjay'}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-4.5 backdrop-blur-xs shadow-xs dark:border-slate-800 dark:bg-slate-900/80">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Avg Solves / Student</p>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1 font-mono">
                  {students.length > 0 ? Math.round(totalSolvedAll / students.length) : 0}
                </h3>
              </div>
              <div className="rounded-xl bg-teal-500/10 p-2.5 text-teal-600 dark:text-teal-400">
                <Target className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-2 text-[10px] text-slate-400 font-semibold">
              Benchmark Target: 150+ Solves
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-4.5 backdrop-blur-xs shadow-xs dark:border-slate-800 dark:bg-slate-900/80">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Problem Breakdown</p>
                <div className="flex items-center gap-2 mt-1 text-xs font-mono font-bold">
                  <span className="text-emerald-600">E:{totalEasyAll}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-amber-600">M:{totalMedAll}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-rose-600">H:{totalHardAll}</span>
                </div>
              </div>
              <div className="rounded-xl bg-indigo-500/10 p-2.5 text-indigo-600 dark:text-indigo-400">
                <Sparkles className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-2 text-[10px] text-slate-400 font-semibold">
              {(totalEasyAll + totalMedAll + totalHardAll) > 0 ? `${Math.round((totalMedAll / (totalEasyAll + totalMedAll + totalHardAll)) * 100)}% Medium Weight` : 'Active'}
            </p>
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Department Comparison Bar Chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-sans text-sm font-bold text-slate-900 dark:text-white">
                LeetCode Problems Solved by Department
              </h4>
              <p className="text-xs text-slate-400">Aggregated real-time problems solved per engineering discipline</p>
            </div>
            <Building className="h-4 w-4 text-slate-400" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="department" fontSize={11} stroke="#94a3b8" tickLine={false} />
                <YAxis fontSize={11} stroke="#94a3b8" tickLine={false} />
                <Tooltip cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="ProblemsSolved" fill="#f59e0b" radius={[6, 6, 0, 0]} barSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Problem Difficulty Share Pie Chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
          <div>
            <h4 className="font-sans text-sm font-bold text-slate-900 dark:text-white">
              Solved Difficulty Distribution
            </h4>
            <p className="text-xs text-slate-400 mb-3">Overall problem level mix across students</p>

            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={difficultyPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {difficultyPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 text-center text-xs dark:border-slate-800">
            <div>
              <span className="block font-bold text-emerald-600 dark:text-emerald-400">{totalEasyAll}</span>
              <span className="text-[10px] text-slate-400 uppercase">Easy</span>
            </div>
            <div>
              <span className="block font-bold text-amber-600 dark:text-amber-400">{totalMedAll}</span>
              <span className="text-[10px] text-slate-400 uppercase">Medium</span>
            </div>
            <div>
              <span className="block font-bold text-rose-600 dark:text-rose-400">{totalHardAll}</span>
              <span className="text-[10px] text-slate-400 uppercase">Hard</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <div className="relative max-w-md flex-1">
            <Search className="absolute top-3 left-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by student name, roll number, or @handle..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-4 pl-10 text-xs font-semibold text-slate-800 focus:border-amber-500 focus:outline-hidden dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 focus:border-amber-500 focus:outline-hidden dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
            >
              <option value="All">All Departments</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase text-slate-400">Sort By:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
          >
            <option value="solved">⚡ Total Solved Problems</option>
            <option value="rank">🌐 Global LeetCode Rank</option>
            <option value="cgpa">🎓 University CGPA</option>
            <option value="name">👤 Student Name</option>
          </select>
          <button
            onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
            title="Toggle sort order"
          >
            <ArrowUpDown className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Leaderboard Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 text-xs font-bold uppercase text-slate-400 dark:border-slate-800 dark:bg-slate-950/50">
                <th className="px-5 py-4 w-16 text-center">Rank</th>
                <th className="px-5 py-4">Student</th>
                <th className="px-5 py-4">Department & Roll No</th>
                <th className="px-5 py-4">LeetCode Handle</th>
                <th className="px-5 py-4">Live Solves</th>
                <th className="px-5 py-4">Difficulty Distribution</th>
                <th className="px-5 py-4">Global Ranking</th>
                {canModify && <th className="px-5 py-4 text-right">Admin Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs dark:divide-slate-800">
              {rankedStudents.length > 0 ? (
                rankedStudents.map((item, index) => {
                  const isTop1 = index === 0;
                  const isTop2 = index === 1;
                  const isTop3 = index === 2;
                  const profileUrl = formatLeetCodeProfileUrl(item.student.leetcodeUrl || item.handle);

                  return (
                    <tr
                      key={item.student.id}
                      className={`hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors ${
                        isTop1 ? 'bg-amber-500/5' : isTop2 ? 'bg-slate-200/10' : isTop3 ? 'bg-amber-700/5' : ''
                      }`}
                    >
                      {/* Rank Medal */}
                      <td className="px-5 py-4 text-center">
                        {isTop1 ? (
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-400 text-amber-950 font-black shadow-md shadow-amber-400/30">
                            1
                          </span>
                        ) : isTop2 ? (
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-300 text-slate-800 font-bold shadow-xs">
                            2
                          </span>
                        ) : isTop3 ? (
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-700/30 text-amber-800 dark:text-amber-300 font-bold">
                            3
                          </span>
                        ) : (
                          <span className="font-mono font-bold text-slate-400">
                            #{index + 1}
                          </span>
                        )}
                      </td>

                      {/* Student Info */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.user?.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120'}
                            alt={item.user?.name}
                            referrerPolicy="no-referrer"
                            className="h-10 w-10 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-800"
                          />
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              {item.user?.name}
                              {isTop1 && <Award className="h-3.5 w-3.5 text-amber-500" />}
                            </p>
                            <p className="font-mono text-[10px] text-slate-400 mt-0.5">{item.user?.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Dept & Roll No */}
                      <td className="px-5 py-4">
                        <p className="font-mono font-bold text-slate-800 dark:text-slate-300">{item.student.rollNo}</p>
                        <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300 mt-1">
                          {item.dept?.code || 'CSE'}
                        </span>
                      </td>

                      {/* LeetCode Handle & Profile Link */}
                      <td className="px-5 py-4">
                        {item.handle ? (
                          <a
                            href={profileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 font-mono font-bold text-amber-600 hover:text-amber-700 dark:text-amber-400 hover:underline"
                          >
                            <span>@{item.handle}</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Unlinked handle</span>
                        )}
                      </td>

                      {/* Live Total Solved */}
                      <td className="px-5 py-4">
                        {item.stats ? (
                          <span className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-xs font-black font-mono text-amber-600 dark:text-amber-400 shadow-xs">
                            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                            <span>{item.stats.totalSolved} Solved</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 font-mono text-xs">Fetching...</span>
                        )}
                      </td>

                      {/* Difficulty Distribution Mini-Bars */}
                      <td className="px-5 py-4">
                        {item.stats && item.stats.found ? (
                          <div className="space-y-1 w-36">
                            <div className="flex justify-between text-[10px] font-mono font-bold">
                              <span className="text-emerald-600">E:{item.stats.easySolved}</span>
                              <span className="text-amber-600">M:{item.stats.mediumSolved}</span>
                              <span className="text-rose-600">H:{item.stats.hardSolved}</span>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden flex dark:bg-slate-800">
                              <div
                                style={{ width: `${(item.stats.easySolved / (item.stats.totalSolved || 1)) * 100}%` }}
                                className="bg-emerald-500 h-full"
                              />
                              <div
                                style={{ width: `${(item.stats.mediumSolved / (item.stats.totalSolved || 1)) * 100}%` }}
                                className="bg-amber-500 h-full"
                              />
                              <div
                                style={{ width: `${(item.stats.hardSolved / (item.stats.totalSolved || 1)) * 100}%` }}
                                className="bg-rose-500 h-full"
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[10px]">—</span>
                        )}
                      </td>

                      {/* Global Ranking */}
                      <td className="px-5 py-4 font-mono text-xs text-slate-600 dark:text-slate-300">
                        {item.stats?.ranking && item.stats.ranking > 0 ? (
                          <span>#{item.stats.ranking.toLocaleString()}</span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Admin URL Edit Action */}
                      {canModify && (
                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => handleOpenEdit(item.student)}
                            title="Edit Student's LeetCode Profile URL"
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Edit className="h-3 w-3" />
                            <span>Edit URL</span>
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                    No student records found matching the query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Quick Edit LeetCode Modal */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Code2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-sans text-sm font-bold text-slate-900 dark:text-white">
                    Update Student LeetCode Profile
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {editingStudent.rollNo} • {users.find(u => u.id === editingStudent.userId)?.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingStudent(null)}
                className="rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveUrl} className="space-y-4">
              {saveMessage && (
                <div
                  className={`flex items-center gap-2 rounded-xl p-3 text-xs font-semibold ${
                    saveMessage.type === 'success'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900'
                      : 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/30 dark:border-rose-900'
                  }`}
                >
                  {saveMessage.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                  <span>{saveMessage.text}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">
                  LeetCode Profile URL or Handle
                </label>
                <input
                  type="text"
                  value={modalUrl}
                  onChange={(e) => {
                    setModalUrl(e.target.value);
                    setTestStats(null);
                  }}
                  placeholder="https://leetcode.com/u/username or username"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
                <div className="flex items-center justify-between mt-1.5">
                  <p className="text-[10px] text-slate-400 font-mono">
                    Parsed Handle: <strong className="text-amber-600 dark:text-amber-400">@{extractLeetCodeUsername(modalUrl) || '—'}</strong>
                  </p>
                  {extractLeetCodeUsername(modalUrl) && (
                    <button
                      type="button"
                      onClick={handleTestHandle}
                      disabled={isTesting}
                      className="text-[10px] font-bold text-teal-600 hover:underline flex items-center gap-1"
                    >
                      {isTesting ? <RefreshCw className="h-3 w-3 animate-spin" /> : null}
                      Test Realtime Stats
                    </button>
                  )}
                </div>
              </div>

              {/* Test Stats Preview */}
              {testStats && (
                <div className="rounded-xl border border-amber-200/60 bg-amber-50/50 p-3 dark:border-amber-900/40 dark:bg-amber-950/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                      Live Verified LeetCode Data:
                    </span>
                    <span className="text-xs font-mono font-black text-amber-600 dark:text-amber-400">
                      {testStats.totalSolved} Solved
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold font-mono">
                    <div className="rounded-lg bg-emerald-500/10 p-1 text-emerald-600 dark:text-emerald-400">
                      Easy: {testStats.easySolved}
                    </div>
                    <div className="rounded-lg bg-amber-500/10 p-1 text-amber-600 dark:text-amber-400">
                      Medium: {testStats.mediumSolved}
                    </div>
                    <div className="rounded-lg bg-rose-500/10 p-1 text-rose-600 dark:text-rose-400">
                      Hard: {testStats.hardSolved}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-amber-700 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSaving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                  <span>Save URL</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

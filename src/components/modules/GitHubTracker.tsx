/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  GitBranch,
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
  X,
  Download,
  FileSpreadsheet,
  FileText,
  Printer,
  Copy,
  Check,
  Calendar,
  Layers,
  Table,
  GraduationCap,
  Star,
  GitFork,
  FolderGit2,
  Code,
  BookOpen
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
  Cell
} from 'recharts';
import { StudentProfile, User, Department, GitHubStats } from '../../types';
import {
  fetchBatchGitHubStats,
  fetchStudentGitHubStats,
  extractGitHubUsername,
  formatGitHubProfileUrl,
  updateStudentGitHubUrl
} from '../../services/githubService';
import {
  buildGitHubExportRecords,
  buildDeptYearGitHubSummaryRecords,
  exportDetailedGitHubCSV,
  exportSummaryGitHubCSV,
  exportGitHubExcelFormatted,
  exportGitHubJSON,
  printGitHubReport,
  GitHubExportRow,
  DeptYearGitHubSummaryRow
} from '../../services/githubExportService';
import { calculateAcademicYear, getAcademicYearLabel } from '../../services/leetcodeExportService';

interface GitHubTrackerProps {
  students: StudentProfile[];
  users: User[];
  departments: Department[];
  role: string;
  onUpdateStudent: (updatedStudent: StudentProfile, updatedUser: User) => void;
  currentUser?: User;
}

export default function GitHubTracker({
  students,
  users,
  departments,
  role,
  onUpdateStudent,
  currentUser
}: GitHubTrackerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedYear, setSelectedYear] = useState<'All' | '1' | '2' | '3' | '4'>('All');
  const [sortBy, setSortBy] = useState<'repos' | 'stars' | 'contributions' | 'streak' | 'cgpa' | 'name'>('repos');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Stats cache state
  const [statsMap, setStatsMap] = useState<Record<string, GitHubStats>>({});
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>(new Date().toLocaleTimeString());

  // Student GitHub Activity Inspection Modal
  const [selectedStudentForDetails, setSelectedStudentForDetails] = useState<{
    student: StudentProfile;
    user?: User;
    stats?: GitHubStats;
  } | null>(null);

  // Admin Quick Edit Modal
  const [editingStudent, setEditingStudent] = useState<StudentProfile | null>(null);
  const [modalUrl, setModalUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [testStats, setTestStats] = useState<GitHubStats | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  // Export Hub & Download Modal State
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportDept, setExportDept] = useState('All');
  const [exportYear, setExportYear] = useState<'All' | '1' | '2' | '3' | '4'>('All');
  const [exportReportMode, setExportReportMode] = useState<'detailed' | 'summary'>('detailed');
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [quickDownloadSuccess, setQuickDownloadSuccess] = useState<string | null>(null);

  const canModify = role === 'Admin' || role === 'Faculty';

  // Load GitHub stats
  const syncAllStats = async (force = false) => {
    setIsSyncing(true);
    const handles = students
      .map((s) => s.githubUrl || s.githubUsername || s.leetcodeUsername || '')
      .filter(Boolean);

    if (handles.length > 0) {
      const results = await fetchBatchGitHubStats(handles, force);
      setStatsMap((prev) => ({ ...prev, ...results }));
      setLastSyncTime(new Date().toLocaleTimeString());
    }
    setIsSyncing(false);
    setIsLoadingStats(false);
  };

  useEffect(() => {
    syncAllStats();
  }, [students]);

  // Helper to look up stats
  const getStats = (student: StudentProfile): GitHubStats | undefined => {
    const handle = extractGitHubUsername(student.githubUsername || student.githubUrl || student.leetcodeUsername || '');
    if (!handle) return undefined;
    return (
      statsMap[handle.toLowerCase()] ||
      statsMap[handle] ||
      (student.githubUrl ? statsMap[student.githubUrl] : undefined)
    );
  };

  // Build ranked student list
  const rankedStudents = useMemo(() => {
    const list = students.map((student) => {
      const user = users.find((u) => u.id === student.userId);
      const dept = departments.find((d) => d.id === student.departmentId);
      const handle = extractGitHubUsername(student.githubUsername || student.githubUrl || student.leetcodeUsername || '');
      const stats = getStats(student);
      const repos = stats ? stats.publicRepos : 0;
      const stars = stats ? stats.totalStars : 0;
      const contributions = stats ? stats.totalContributions : 0;
      const streak = stats ? stats.currentStreak : 0;
      const yearNum = calculateAcademicYear(student.currentSemester, student.batch);
      const yearLabel = getAcademicYearLabel(yearNum);

      return {
        student,
        user,
        dept,
        handle,
        stats,
        repos,
        stars,
        contributions,
        streak,
        yearNum,
        yearLabel
      };
    });

    // Filter
    const filtered = list.filter((item) => {
      const matchesSearch =
        (item.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
        item.student.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.handle.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDept = selectedDept === 'All' || item.student.departmentId === selectedDept;
      const matchesYear = selectedYear === 'All' || item.yearNum.toString() === selectedYear;

      return matchesSearch && matchesDept && matchesYear;
    });

    // Sort
    filtered.sort((a, b) => {
      let comp = 0;
      if (sortBy === 'repos') {
        comp = b.repos - a.repos;
      } else if (sortBy === 'stars') {
        comp = b.stars - a.stars;
      } else if (sortBy === 'contributions') {
        comp = b.contributions - a.contributions;
      } else if (sortBy === 'streak') {
        comp = b.streak - a.streak;
      } else if (sortBy === 'cgpa') {
        comp = b.student.cgpa - a.student.cgpa;
      } else if (sortBy === 'name') {
        comp = (a.user?.name || '').localeCompare(b.user?.name || '');
      }
      return sortOrder === 'desc' ? comp : -comp;
    });

    return filtered;
  }, [students, users, departments, statsMap, searchTerm, selectedDept, selectedYear, sortBy, sortOrder]);

  // Aggregate Metrics
  const totalReposAll = useMemo(() => {
    return (Object.values(statsMap) as GitHubStats[]).reduce(
      (acc: number, curr: GitHubStats) => acc + (curr?.publicRepos || 0),
      0
    );
  }, [statsMap]);

  const totalStarsAll = useMemo(() => {
    return (Object.values(statsMap) as GitHubStats[]).reduce(
      (acc: number, curr: GitHubStats) => acc + (curr?.totalStars || 0),
      0
    );
  }, [statsMap]);

  const totalContributionsAll = useMemo(() => {
    return (Object.values(statsMap) as GitHubStats[]).reduce(
      (acc: number, curr: GitHubStats) => acc + (curr?.totalContributions || 0),
      0
    );
  }, [statsMap]);

  const topContributor = rankedStudents[0];

  // Chart data: Department-wise Public Repositories
  const deptChartData = useMemo(() => {
    const map: Record<string, number> = {};
    departments.forEach((d) => {
      map[d.code] = 0;
    });

    students.forEach((s) => {
      const dept = departments.find((d) => d.id === s.departmentId);
      const stats = getStats(s);
      if (dept && stats) {
        map[dept.code] = (map[dept.code] || 0) + stats.publicRepos;
      }
    });

    return Object.entries(map).map(([code, count]) => ({
      department: code,
      PublicRepositories: count
    }));
  }, [departments, students, statsMap]);

  // Language mix pie chart data
  const languagePieData = useMemo(() => {
    const langTotals: Record<string, { count: number; color: string }> = {};
    (Object.values(statsMap) as GitHubStats[]).forEach((stats) => {
      if (stats?.topLanguages) {
        stats.topLanguages.forEach((l) => {
          if (!langTotals[l.language]) {
            langTotals[l.language] = { count: 0, color: l.color };
          }
          langTotals[l.language].count += l.count;
        });
      }
    });

    const entries = Object.entries(langTotals)
      .map(([name, item]) => ({ name, value: item.count, color: item.color }))
      .sort((a, b) => b.value - a.value);

    return entries.length > 0
      ? entries.slice(0, 5)
      : [
          { name: 'TypeScript', value: 45, color: '#3178c6' },
          { name: 'Python', value: 35, color: '#3572A5' },
          { name: 'JavaScript', value: 20, color: '#f1e05a' }
        ];
  }, [statsMap]);

  // All structured export records
  const allExportRecords = useMemo(() => {
    return buildGitHubExportRecords(students, users, departments, statsMap);
  }, [students, users, departments, statsMap]);

  // Filtered export records based on modal selections
  const modalFilteredRecords = useMemo(() => {
    return allExportRecords.filter((r) => {
      const selectedDeptObj = departments.find((d) => d.id === exportDept);
      const matchesDept =
        exportDept === 'All' ||
        r.departmentCode === exportDept ||
        (selectedDeptObj && r.departmentCode === selectedDeptObj.code);
      const matchesYear = exportYear === 'All' || r.yearNumber.toString() === exportYear;
      return matchesDept && matchesYear;
    });
  }, [allExportRecords, exportDept, exportYear, departments]);

  // Department & Year Summary Matrix
  const deptYearSummaries = useMemo(() => {
    const records = exportDept === 'All' ? allExportRecords : modalFilteredRecords;
    const deptsToProcess =
      exportDept === 'All'
        ? departments
        : departments.filter((d) => d.id === exportDept || d.code === exportDept);
    return buildDeptYearGitHubSummaryRecords(records, deptsToProcess);
  }, [allExportRecords, modalFilteredRecords, exportDept, departments]);

  // Quick 1-Click CSV Download from main view
  const handleQuickDownloadCSV = () => {
    const selectedDeptObj = departments.find((d) => d.id === selectedDept);
    const deptCode = selectedDept === 'All' ? 'All' : selectedDeptObj?.code || selectedDept;
    const yearLabel = selectedYear === 'All' ? 'All' : getAcademicYearLabel(parseInt(selectedYear, 10));

    const recordsToExport = allExportRecords.filter((r) => {
      const matchesDept = selectedDept === 'All' || r.departmentCode === deptCode;
      const matchesYear = selectedYear === 'All' || r.yearNumber.toString() === selectedYear;
      return matchesDept && matchesYear;
    });

    exportDetailedGitHubCSV(recordsToExport, deptCode, yearLabel);
    setQuickDownloadSuccess(`Downloaded ${recordsToExport.length} student GitHub records (${deptCode} • ${yearLabel})`);
    setTimeout(() => setQuickDownloadSuccess(null), 3500);
  };

  const handleOpenExportModal = () => {
    setExportDept(selectedDept);
    setExportYear(selectedYear);
    setIsExportModalOpen(true);
  };

  const handleModalDownloadCSV = () => {
    const selectedDeptObj = departments.find((d) => d.id === exportDept);
    const deptCode = exportDept === 'All' ? 'All' : selectedDeptObj?.code || exportDept;
    const yearLabel = exportYear === 'All' ? 'All' : getAcademicYearLabel(parseInt(exportYear, 10));

    if (exportReportMode === 'detailed') {
      exportDetailedGitHubCSV(modalFilteredRecords, deptCode, yearLabel);
    } else {
      exportSummaryGitHubCSV(deptYearSummaries, deptCode);
    }
  };

  const handleModalDownloadExcel = () => {
    const selectedDeptObj = departments.find((d) => d.id === exportDept);
    const deptName = exportDept === 'All' ? 'All Departments' : selectedDeptObj?.name || exportDept;
    const yearLabel = exportYear === 'All' ? 'All Academic Years' : getAcademicYearLabel(parseInt(exportYear, 10));
    exportGitHubExcelFormatted(
      modalFilteredRecords,
      `University Student GitHub Development Report — ${deptName} (${yearLabel})`
    );
  };

  const handleModalDownloadJSON = () => {
    const deptCode = exportDept === 'All' ? 'All' : exportDept;
    const yearStr = exportYear === 'All' ? 'All' : `Year${exportYear}`;
    exportGitHubJSON(modalFilteredRecords, `GitHub_Details_${deptCode}_${yearStr}.json`);
  };

  const handleModalPrint = () => {
    const selectedDeptObj = departments.find((d) => d.id === exportDept);
    const deptName = exportDept === 'All' ? 'All Departments' : selectedDeptObj?.name || exportDept;
    const yearLabel = exportYear === 'All' ? 'All Years' : getAcademicYearLabel(parseInt(exportYear, 10));
    printGitHubReport(modalFilteredRecords, deptName, yearLabel);
  };

  const handleCopyToClipboard = () => {
    const headers = [
      'Roll Number',
      'Name',
      'Dept',
      'Year',
      'GitHub Handle',
      'GitHub Profile Link',
      'Repos',
      'Stars',
      'Contributions',
      'Streak',
      'Top Languages',
      'CGPA'
    ];
    const rows = modalFilteredRecords.map((r) => [
      r.rollNo,
      r.name,
      r.departmentCode,
      r.yearLabel,
      r.githubUsername,
      r.githubUrl,
      r.publicRepos,
      r.totalStars,
      r.totalContributions,
      r.currentStreak,
      r.topLanguages,
      r.cgpa.toFixed(2)
    ]);
    const tsvContent = [headers.join('\t'), ...rows.map((row) => row.join('\t'))].join('\n');
    navigator.clipboard.writeText(tsvContent);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  // Open Edit Modal for Admin / Faculty
  const handleOpenEdit = (student: StudentProfile) => {
    setEditingStudent(student);
    setModalUrl(
      student.githubUrl || (student.githubUsername ? `https://github.com/${student.githubUsername}` : '')
    );
    setSaveMessage(null);
    setTestStats(null);
  };

  const handleTestHandle = async () => {
    const handle = extractGitHubUsername(modalUrl);
    if (!handle) return;
    setIsTesting(true);
    const stats = await fetchStudentGitHubStats(handle, true);
    setTestStats(stats);
    setIsTesting(false);
  };

  const handleSaveUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    setIsSaving(true);
    setSaveMessage(null);

    const cleanHandle = extractGitHubUsername(modalUrl);
    const normalizedUrl = cleanHandle ? `https://github.com/${cleanHandle}` : '';

    const updatedStudent: StudentProfile = {
      ...editingStudent,
      githubUrl: normalizedUrl,
      githubUsername: cleanHandle
    };

    const user = users.find((u) => u.id === editingStudent.userId);
    if (user) {
      onUpdateStudent(updatedStudent, user);
    }

    await updateStudentGitHubUrl(editingStudent.id, normalizedUrl);

    if (cleanHandle) {
      const stats = await fetchStudentGitHubStats(cleanHandle, true);
      setStatsMap((prev) => ({ ...prev, [cleanHandle]: stats, [normalizedUrl]: stats }));
    }

    setSaveMessage({ text: 'Student GitHub profile saved and synchronized successfully!', type: 'success' });
    setIsSaving(false);

    setTimeout(() => {
      setEditingStudent(null);
    }, 1100);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & KPI Grid */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-linear-to-br from-slate-900 via-slate-950 to-indigo-950 p-6 text-white shadow-lg">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white backdrop-blur-md shadow-md border border-white/20">
                <FolderGit2 className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-sans text-xl font-extrabold flex items-center gap-2">
                  GitHub Open Source & Developer Hub
                  <span className="rounded-full bg-teal-500/20 border border-teal-500/40 px-2.5 py-0.5 text-[10px] font-bold text-teal-300">
                    Live Sync
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Track student public repositories, stars, commit contributions, programming stacks, and download department-wise reports.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleQuickDownloadCSV}
              title="Download currently filtered Department & Year student GitHub records as CSV"
              className="inline-flex items-center gap-1.5 rounded-xl border border-teal-400/40 bg-teal-500/10 px-3.5 py-2.5 text-xs font-bold text-teal-300 shadow-xs hover:bg-teal-500/20 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Quick Download CSV</span>
            </button>

            <button
              onClick={handleOpenExportModal}
              title="Open Department & Year-Wise GitHub Export Center"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-slate-950 shadow-md hover:bg-slate-100 transition-colors"
            >
              <FileSpreadsheet className="h-4 w-4 text-slate-900" />
              <span>Download & Export Hub</span>
            </button>

            <button
              onClick={() => syncAllStats(true)}
              disabled={isSyncing}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2.5 text-xs font-bold text-white border border-slate-700 hover:bg-slate-700 transition-colors disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{isSyncing ? 'Syncing...' : 'Sync Live'}</span>
            </button>
          </div>
        </div>

        {/* Quick Download Toast Notification */}
        {quickDownloadSuccess && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-teal-500/40 bg-teal-950/80 px-4 py-2 text-xs font-bold text-teal-200 animate-in fade-in duration-200">
            <CheckCircle2 className="h-4 w-4 text-teal-400" />
            <span>{quickDownloadSuccess}</span>
          </div>
        )}

        {/* 4 Quick Stat Cards */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4.5 backdrop-blur-xs shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Public Repos</p>
                <h3 className="text-2xl font-black text-white mt-1 font-mono">{totalReposAll.toLocaleString()}</h3>
              </div>
              <div className="rounded-xl bg-teal-500/20 p-2.5 text-teal-400">
                <FolderGit2 className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-2 text-[10px] text-teal-300 font-semibold flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Across {students.length} student profiles
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4.5 backdrop-blur-xs shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Stars Earned</p>
                <h3 className="text-2xl font-black text-amber-400 mt-1 font-mono">{totalStarsAll.toLocaleString()}</h3>
              </div>
              <div className="rounded-xl bg-amber-500/20 p-2.5 text-amber-400">
                <Star className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-2 text-[10px] text-amber-300 font-semibold">★ Global GitHub Stars</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4.5 backdrop-blur-xs shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Top Contributor</p>
                <h3 className="text-sm font-bold text-white mt-1 line-clamp-1">
                  {topContributor?.user?.name || 'Sanjay K'}
                </h3>
              </div>
              <div className="rounded-xl bg-purple-500/20 p-2.5 text-purple-400">
                <Award className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-2 text-[10px] font-mono text-purple-300 font-bold">
              ⚡ {topContributor?.repos || 18} Repos • {topContributor?.stars || 42} Stars
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4.5 backdrop-blur-xs shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Contributions</p>
                <h3 className="text-2xl font-black text-white mt-1 font-mono">
                  {totalContributionsAll.toLocaleString()}
                </h3>
              </div>
              <div className="rounded-xl bg-blue-500/20 p-2.5 text-blue-400">
                <GitBranch className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-2 text-[10px] text-blue-300 font-semibold">
              Avg {students.length > 0 ? Math.round(totalContributionsAll / students.length) : 0} commits & PRs / student
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
                Public Repositories by Department
              </h4>
              <p className="text-xs text-slate-400">Aggregated open source projects per engineering discipline</p>
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
                <Bar dataKey="PublicRepositories" fill="#0f172a" radius={[6, 6, 0, 0]} barSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Primary Language Mix Pie Chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
          <div>
            <h4 className="font-sans text-sm font-bold text-slate-900 dark:text-white">Primary Tech Stacks</h4>
            <p className="text-xs text-slate-400 mb-3">Dominant languages used across student repositories</p>

            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={languagePieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {languagePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 border-t border-slate-100 pt-3 text-center text-xs dark:border-slate-800">
            {languagePieData.map((l) => (
              <span
                key={l.name}
                className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold"
                style={{ backgroundColor: `${l.color}20`, color: l.color }}
              >
                ● {l.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Filter & Search Bar with Department AND Academic Year Selectors */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative min-w-[240px] flex-1">
            <Search className="absolute top-3 left-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by student name, roll number, or GitHub @handle..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-4 pl-10 text-xs font-semibold text-slate-800 focus:border-slate-900 focus:outline-hidden dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            />
          </div>

          {/* Department Filter */}
          <div className="flex items-center gap-1.5">
            <Building className="h-4 w-4 text-slate-400" />
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 focus:border-slate-900 focus:outline-hidden dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
            >
              <option value="All">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>

          {/* Academic Year Filter */}
          <div className="flex items-center gap-1.5">
            <GraduationCap className="h-4 w-4 text-slate-400" />
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value as any)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 focus:border-slate-900 focus:outline-hidden dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
            >
              <option value="All">All Academic Years</option>
              <option value="1">1st Year (Sem 1-2)</option>
              <option value="2">2nd Year (Sem 3-4)</option>
              <option value="3">3rd Year (Sem 5-6)</option>
              <option value="4">4th Year (Sem 7-8)</option>
            </select>
          </div>
        </div>

        {/* Sort Controls & Export Trigger */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold uppercase text-slate-400">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            >
              <option value="repos">📁 Public Repositories</option>
              <option value="stars">⭐ Total Stars</option>
              <option value="contributions">⚡ Total Contributions</option>
              <option value="streak">🔥 Commit Streak</option>
              <option value="cgpa">🎓 University CGPA</option>
              <option value="name">👤 Student Name</option>
            </select>
            <button
              onClick={() => setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
              title="Toggle sort order"
            >
              <ArrowUpDown className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={handleOpenExportModal}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-xs font-bold text-slate-800 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition-colors"
            title="Download Custom GitHub Reports"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export View</span>
          </button>
        </div>
      </div>

      {/* Main GitHub Leaderboard Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 text-xs font-bold uppercase text-slate-400 dark:border-slate-800 dark:bg-slate-950/50">
                <th className="px-5 py-4 w-16 text-center">Rank</th>
                <th className="px-5 py-4">Student</th>
                <th className="px-5 py-4">Dept, Year & Roll No</th>
                <th className="px-5 py-4">GitHub Profile Link</th>
                <th className="px-5 py-4">Repositories</th>
                <th className="px-5 py-4">Stars & Followers</th>
                <th className="px-5 py-4">Streak & Contributions</th>
                <th className="px-5 py-4">Primary Languages</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs dark:divide-slate-800">
              {rankedStudents.length > 0 ? (
                rankedStudents.map((item, index) => {
                  const isTop1 = index === 0;
                  const isTop2 = index === 1;
                  const isTop3 = index === 2;
                  const profileUrl = formatGitHubProfileUrl(item.student.githubUrl || item.handle);

                  return (
                    <tr
                      key={item.student.id}
                      className={`hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors ${
                        isTop1 ? 'bg-slate-900/5 dark:bg-white/5' : isTop2 ? 'bg-slate-200/10' : ''
                      }`}
                    >
                      {/* Rank Medal */}
                      <td className="px-5 py-4 text-center">
                        {isTop1 ? (
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-white font-black shadow-md dark:bg-white dark:text-slate-950">
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
                          <span className="font-mono font-bold text-slate-400">#{index + 1}</span>
                        )}
                      </td>

                      {/* Student Info */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              item.user?.photo ||
                              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120'
                            }
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

                      {/* Dept, Academic Year & Roll No */}
                      <td className="px-5 py-4">
                        <p className="font-mono font-bold text-slate-800 dark:text-slate-300">{item.student.rollNo}</p>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            {item.dept?.code || 'CSE'}
                          </span>
                          <span className="inline-flex items-center rounded-md bg-slate-200/80 px-2 py-0.5 text-[10px] font-bold text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                            {item.yearLabel}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Sem {item.student.currentSemester || item.yearNum * 2}
                          </span>
                        </div>
                      </td>

                      {/* GitHub Handle & Profile Link */}
                      <td className="px-5 py-4">
                        {item.handle ? (
                          <div className="flex flex-col gap-0.5">
                            <a
                              href={profileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 font-mono font-bold text-slate-900 hover:text-teal-600 dark:text-white dark:hover:text-teal-400 hover:underline"
                            >
                              <span>@{item.handle}</span>
                              <ExternalLink className="h-3 w-3 text-slate-400" />
                            </a>
                            <span className="font-mono text-[10px] text-slate-400 truncate max-w-[180px]" title={profileUrl}>
                              {profileUrl}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Unlinked handle</span>
                        )}
                      </td>

                      {/* Public Repositories */}
                      <td className="px-5 py-4">
                        {item.stats ? (
                          <span className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-bold font-mono text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white shadow-xs">
                            <FolderGit2 className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                            <span>{item.stats.publicRepos} Repos</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 font-mono text-xs">Fetching...</span>
                        )}
                      </td>

                      {/* Stars & Followers */}
                      <td className="px-5 py-4">
                        {item.stats ? (
                          <div className="flex flex-col gap-0.5 font-mono text-xs">
                            <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                              <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                              {item.stats.totalStars} Stars
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {item.stats.followers} Followers
                            </span>
                          </div>
                        ) : (
                          <span className="font-mono text-slate-400 text-[11px]">—</span>
                        )}
                      </td>

                      {/* Streak & Contributions */}
                      <td className="px-5 py-4">
                        {item.stats ? (
                          <div className="flex flex-col gap-1">
                            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 font-mono text-[11px] font-black text-emerald-700 dark:text-emerald-300">
                              <Flame className="h-3 w-3 text-emerald-600" />
                              {item.stats.currentStreak}d streak
                            </span>
                            <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400 font-bold">
                              ⚡ {item.stats.totalContributions} Contributions
                            </span>
                          </div>
                        ) : (
                          <span className="font-mono text-slate-400 text-[11px]">—</span>
                        )}
                      </td>

                      {/* Primary Languages */}
                      <td className="px-5 py-4">
                        {item.stats?.topLanguages && item.stats.topLanguages.length > 0 ? (
                          <div className="flex flex-wrap gap-1 max-w-[150px]">
                            {item.stats.topLanguages.slice(0, 2).map((lang) => (
                              <span
                                key={lang.language}
                                className="rounded-md px-1.5 py-0.5 text-[10px] font-bold font-mono"
                                style={{ backgroundColor: `${lang.color}20`, color: lang.color }}
                              >
                                {lang.language}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[10px]">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedStudentForDetails(item)}
                            title="View GitHub Repositories & Timeline"
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 transition-colors"
                          >
                            <TrendingUp className="h-3 w-3 text-teal-600 dark:text-teal-400" />
                            <span>Activity</span>
                          </button>

                          {canModify && (
                            <button
                              onClick={() => handleOpenEdit(item.student)}
                              title="Edit Student's GitHub Profile URL"
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 transition-colors"
                            >
                              <Edit className="h-3 w-3" />
                              <span>Edit</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-slate-400">
                    No student records found matching the query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================================================== */}
      {/* ADVANCED DOWNLOAD & EXPORT HUB MODAL                     */}
      {/* ======================================================== */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-4xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-950">
                  <FileSpreadsheet className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-sans text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    Download & Export GitHub Performance Data
                    <span className="rounded-full bg-teal-100 px-2.5 py-0.5 text-[10px] font-bold text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                      Dept & Year Wise
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Export student repository counts, stars, contributions, and links in CSV, Excel, JSON, or PDF.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 p-1.5 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Filter Panel */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/50">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1">
                  <Building className="h-3.5 w-3.5 text-teal-500" />
                  <span>Select Department</span>
                </label>
                <select
                  value={exportDept}
                  onChange={(e) => setExportDept(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-slate-900 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                >
                  <option value="All">All Departments ({departments.length})</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.code}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1">
                  <GraduationCap className="h-3.5 w-3.5 text-teal-500" />
                  <span>Select Academic Year</span>
                </label>
                <select
                  value={exportYear}
                  onChange={(e) => setExportYear(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-slate-900 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                >
                  <option value="All">All Academic Years (1st - 4th)</option>
                  <option value="1">1st Year (Semesters 1 & 2)</option>
                  <option value="2">2nd Year (Semesters 3 & 4)</option>
                  <option value="3">3rd Year (Semesters 5 & 6)</option>
                  <option value="4">4th Year (Semesters 7 & 8)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1">
                  <Layers className="h-3.5 w-3.5 text-teal-500" />
                  <span>Report Type</span>
                </label>
                <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-200/80 p-1 dark:bg-slate-800">
                  <button
                    type="button"
                    onClick={() => setExportReportMode('detailed')}
                    className={`rounded-lg py-1.5 text-xs font-bold transition-colors ${
                      exportReportMode === 'detailed'
                        ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                    }`}
                  >
                    Student Roster
                  </button>
                  <button
                    type="button"
                    onClick={() => setExportReportMode('summary')}
                    className={`rounded-lg py-1.5 text-xs font-bold transition-colors ${
                      exportReportMode === 'summary'
                        ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                    }`}
                  >
                    Summary Matrix
                  </button>
                </div>
              </div>
            </div>

            {/* Summary Banner */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-900 text-white px-4 py-3 dark:bg-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-teal-400" />
                <span className="text-xs font-bold">
                  {exportReportMode === 'detailed'
                    ? `Ready to export ${modalFilteredRecords.length} student GitHub records`
                    : `Ready to export ${deptYearSummaries.length} department-year summary records`}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono font-bold">
                <span className="text-teal-300">
                  Total Repos: {modalFilteredRecords.reduce((a, b) => a + b.publicRepos, 0).toLocaleString()}
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-amber-300">
                  Total Stars: {modalFilteredRecords.reduce((a, b) => a + b.totalStars, 0).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Live Data Preview Table */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Table className="h-3.5 w-3.5" />
                  <span>Preview Data (Top 5 rows shown)</span>
                </h4>
                <span className="text-[11px] text-slate-400 font-mono">
                  Full file contains all {exportReportMode === 'detailed' ? modalFilteredRecords.length : deptYearSummaries.length} rows
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
                {exportReportMode === 'detailed' ? (
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-50 text-slate-500 dark:bg-slate-900 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="px-3 py-2">Roll No</th>
                        <th className="px-3 py-2">Student Name</th>
                        <th className="px-3 py-2">Dept</th>
                        <th className="px-3 py-2">Year</th>
                        <th className="px-3 py-2">GitHub Profile Link</th>
                        <th className="px-3 py-2 text-right">Repos</th>
                        <th className="px-3 py-2 text-right">Stars</th>
                        <th className="px-3 py-2 text-right">Contributions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                      {modalFilteredRecords.slice(0, 5).map((r) => (
                        <tr key={r.rollNo} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                          <td className="px-3 py-2 font-bold text-slate-800 dark:text-slate-200">{r.rollNo}</td>
                          <td className="px-3 py-2 font-sans font-semibold text-slate-900 dark:text-white">{r.name}</td>
                          <td className="px-3 py-2">{r.departmentCode}</td>
                          <td className="px-3 py-2 font-sans">{r.yearLabel}</td>
                          <td className="px-3 py-2 max-w-[200px] truncate text-teal-600 dark:text-teal-400">
                            {r.githubUrl}
                          </td>
                          <td className="px-3 py-2 text-right font-bold text-slate-900 dark:text-white">{r.publicRepos}</td>
                          <td className="px-3 py-2 text-right text-amber-600 font-bold">{r.totalStars}</td>
                          <td className="px-3 py-2 text-right">{r.totalContributions}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-50 text-slate-500 dark:bg-slate-900 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="px-3 py-2">Department</th>
                        <th className="px-3 py-2">Year</th>
                        <th className="px-3 py-2 text-right">Students</th>
                        <th className="px-3 py-2 text-right">With GitHub</th>
                        <th className="px-3 py-2 text-right">Total Repos</th>
                        <th className="px-3 py-2 text-right">Total Stars</th>
                        <th className="px-3 py-2">Top Contributor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                      {deptYearSummaries.slice(0, 5).map((s, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                          <td className="px-3 py-2 font-bold text-slate-800 dark:text-slate-200">
                            {s.departmentCode} — {s.departmentName}
                          </td>
                          <td className="px-3 py-2 font-sans font-semibold">{s.yearLabel}</td>
                          <td className="px-3 py-2 text-right">{s.totalStudents}</td>
                          <td className="px-3 py-2 text-right">
                            {s.studentsWithGitHub} ({s.linkingPercentage}%)
                          </td>
                          <td className="px-3 py-2 text-right font-bold text-slate-900 dark:text-white">
                            {s.totalRepositories}
                          </td>
                          <td className="px-3 py-2 text-right text-amber-600 font-bold">{s.totalStars}</td>
                          <td className="px-3 py-2 font-sans">{s.topContributorName}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="border-t border-slate-100 pt-4 dark:border-slate-800 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyToClipboard}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition-colors"
                  >
                    {copiedNotification ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedNotification ? 'Copied to Clipboard!' : 'Copy to Clipboard'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleModalPrint}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition-colors"
                  >
                    <Printer className="h-3.5 w-3.5 text-slate-500" />
                    <span>Print / Save PDF</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleModalDownloadJSON}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition-colors"
                  >
                    <FileText className="h-3.5 w-3.5 text-slate-500" />
                    <span>Download JSON</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleModalDownloadExcel}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    <span>Download Excel (.xls)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleModalDownloadCSV}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-4.5 py-2 text-xs font-bold text-white shadow-md hover:bg-teal-700 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download CSV (.csv)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Quick Edit GitHub Modal */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-950">
                  <FolderGit2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-sans text-sm font-bold text-slate-900 dark:text-white">
                    Update Student GitHub Profile
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {editingStudent.rollNo} • {users.find((u) => u.id === editingStudent.userId)?.name}
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
                  GitHub Profile URL or Handle
                </label>
                <input
                  type="text"
                  value={modalUrl}
                  onChange={(e) => {
                    setModalUrl(e.target.value);
                    setTestStats(null);
                  }}
                  placeholder="https://github.com/username or username"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
                <div className="flex items-center justify-between mt-1.5">
                  <p className="text-[10px] text-slate-400 font-mono">
                    Parsed Handle:{' '}
                    <strong className="text-teal-600 dark:text-teal-400">
                      @{extractGitHubUsername(modalUrl) || '—'}
                    </strong>
                  </p>
                  {extractGitHubUsername(modalUrl) && (
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
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-teal-500" />
                      Live Verified GitHub Data:
                    </span>
                    <span className="text-xs font-mono font-black text-teal-600 dark:text-teal-400">
                      {testStats.publicRepos} Repos • {testStats.totalStars} Stars
                    </span>
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
                  className="rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-teal-700 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSaving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                  <span>Save URL</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Activity Inspection Modal */}
      {selectedStudentForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <img
                  src={
                    selectedStudentForDetails.stats?.avatar ||
                    selectedStudentForDetails.user?.photo ||
                    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120'
                  }
                  alt={selectedStudentForDetails.user?.name}
                  referrerPolicy="no-referrer"
                  className="h-12 w-12 rounded-full object-cover ring-2 ring-slate-800 shadow-sm"
                />
                <div>
                  <h3 className="font-sans text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    {selectedStudentForDetails.user?.name}
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-800 dark:bg-slate-800 dark:text-slate-300 font-mono">
                      {selectedStudentForDetails.student.rollNo}
                    </span>
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-slate-400 font-mono">
                      @{extractGitHubUsername(selectedStudentForDetails.student.githubUrl || selectedStudentForDetails.student.githubUsername || '') || 'unlinked'}
                    </span>
                    <a
                      href={formatGitHubProfileUrl(selectedStudentForDetails.student.githubUrl || selectedStudentForDetails.student.githubUsername)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-0.5 text-[11px] font-bold text-teal-600 hover:underline dark:text-teal-400"
                    >
                      <span>GitHub Profile</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedStudentForDetails(null)}
                className="rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Repositories</span>
                <p className="text-xl font-black font-mono text-slate-900 dark:text-white mt-0.5">
                  {selectedStudentForDetails.stats?.publicRepos || 0}
                </p>
              </div>

              <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-3 dark:border-amber-900/40 dark:bg-amber-950/20">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Total Stars</span>
                <p className="text-xl font-black font-mono text-amber-600 dark:text-amber-400 mt-0.5">
                  ★ {selectedStudentForDetails.stats?.totalStars || 0}
                </p>
              </div>

              <div className="rounded-xl border border-teal-200 bg-teal-50/40 p-3 dark:border-teal-900/40 dark:bg-teal-950/20">
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">Commit Streak</span>
                <p className="text-xl font-black font-mono text-teal-600 dark:text-teal-400 mt-0.5">
                  🔥 {selectedStudentForDetails.stats?.currentStreak || 1}d
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Followers</span>
                <p className="text-lg font-black font-mono text-slate-800 dark:text-white mt-0.5">
                  {selectedStudentForDetails.stats?.followers || 0}
                </p>
              </div>
            </div>

            {/* Top Repositories */}
            <div>
              <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 mb-2.5">
                Top Public Repositories
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {selectedStudentForDetails.stats?.topRepos && selectedStudentForDetails.stats.topRepos.length > 0 ? (
                  selectedStudentForDetails.stats.topRepos.map((repo) => (
                    <div
                      key={repo.id}
                      className="rounded-xl bg-slate-50 p-3 text-xs border border-slate-100 dark:bg-slate-950/70 dark:border-slate-800 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <a
                          href={repo.htmlUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="font-bold text-slate-900 hover:text-teal-600 dark:text-white dark:hover:text-teal-400 hover:underline flex items-center gap-1"
                        >
                          <FolderGit2 className="h-3.5 w-3.5 text-teal-600" />
                          <span>{repo.name}</span>
                        </a>
                        <div className="flex items-center gap-2 font-mono text-[10px] text-slate-500">
                          <span className="flex items-center gap-0.5 text-amber-600 font-bold">
                            <Star className="h-3 w-3 fill-amber-500 text-amber-500" /> {repo.stars}
                          </span>
                          <span className="flex items-center gap-0.5">
                            <GitFork className="h-3 w-3" /> {repo.forks}
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{repo.description}</p>
                      <span className="inline-block rounded-md bg-slate-200/80 px-2 py-0.5 text-[9px] font-bold font-mono text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {repo.language}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">No repositories available for this account.</p>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedStudentForDetails(null)}
                className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

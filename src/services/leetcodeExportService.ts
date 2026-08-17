/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { StudentProfile, User, Department, LeetCodeStats } from '../types';
import { extractLeetCodeUsername, formatLeetCodeProfileUrl } from './leetcodeService';

export interface LeetCodeExportRow {
  rollNo: string;
  name: string;
  departmentCode: string;
  departmentName: string;
  yearNumber: number;
  yearLabel: string;
  semester: number;
  batch: string;
  leetcodeUsername: string;
  leetcodeUrl: string;
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  currentStreak: number;
  todaySolved: number;
  ranking: number | string;
  cgpa: number;
  email: string;
  phone: string;
  hasProfile: boolean;
}

export interface DeptYearSummaryRow {
  departmentCode: string;
  departmentName: string;
  yearLabel: string;
  totalStudents: number;
  studentsWithLeetCode: number;
  linkingPercentage: number;
  totalProblemsSolved: number;
  avgSolvedPerStudent: number;
  totalEasy: number;
  totalMedium: number;
  totalHard: number;
  topSolverName: string;
  topSolverRollNo: string;
  topSolverCount: number;
  topSolverUrl: string;
}

/**
 * Returns numeric academic year (1, 2, 3, 4) from currentSemester or batch
 */
export function calculateAcademicYear(semester?: number, batch?: string): number {
  if (semester && semester > 0) {
    return Math.min(4, Math.max(1, Math.ceil(semester / 2)));
  }
  if (batch) {
    const startYear = parseInt(batch.split('-')[0], 10);
    if (!isNaN(startYear)) {
      const currentCalendarYear = new Date().getFullYear();
      const diff = currentCalendarYear - startYear + 1;
      return Math.min(4, Math.max(1, diff));
    }
  }
  return 1;
}

/**
 * Returns human-readable label: "1st Year", "2nd Year", "3rd Year", "4th Year"
 */
export function getAcademicYearLabel(year: number): string {
  switch (year) {
    case 1:
      return '1st Year';
    case 2:
      return '2nd Year';
    case 3:
      return '3rd Year';
    case 4:
      return '4th Year';
    default:
      return `Year ${year}`;
  }
}

/**
 * Transforms raw student and stats collections into structured exportable records
 */
export function buildLeetCodeExportRecords(
  students: StudentProfile[],
  users: User[],
  departments: Department[],
  statsMap: Record<string, LeetCodeStats>
): LeetCodeExportRow[] {
  return students.map((student) => {
    const user = users.find((u) => u.id === student.userId);
    const dept = departments.find((d) => d.id === student.departmentId);
    const handle = extractLeetCodeUsername(student.leetcodeUsername || student.leetcodeUrl || '');
    const profileUrl = formatLeetCodeProfileUrl(student.leetcodeUrl || student.leetcodeUsername);
    const yearNum = calculateAcademicYear(student.currentSemester, student.batch);
    const yearLabel = getAcademicYearLabel(yearNum);

    const stats = handle
      ? statsMap[handle.toLowerCase()] ||
        statsMap[handle] ||
        (student.leetcodeUrl ? statsMap[student.leetcodeUrl] : undefined)
      : undefined;

    const totalSolved = stats?.totalSolved || 0;
    const easySolved = stats?.easySolved || 0;
    const mediumSolved = stats?.mediumSolved || 0;
    const hardSolved = stats?.hardSolved || 0;
    const currentStreak = stats?.dailyProgress?.currentStreak || 0;
    const todaySolved = stats?.dailyProgress?.todaySolved || 0;
    const ranking = stats?.ranking && stats.ranking > 0 ? stats.ranking : 'N/A';

    return {
      rollNo: student.rollNo,
      name: user?.name || 'Unknown Student',
      departmentCode: dept?.code || 'GEN',
      departmentName: dept?.name || 'General Engineering',
      yearNumber: yearNum,
      yearLabel,
      semester: student.currentSemester || (yearNum * 2),
      batch: student.batch || '2024-2028',
      leetcodeUsername: handle || 'Not Linked',
      leetcodeUrl: handle ? profileUrl : 'Not Linked',
      totalSolved,
      easySolved,
      mediumSolved,
      hardSolved,
      currentStreak,
      todaySolved,
      ranking,
      cgpa: student.cgpa || 0,
      email: user?.email || '',
      phone: student.phone || user?.phone || '',
      hasProfile: Boolean(handle)
    };
  });
}

/**
 * Generates aggregated Department & Year summary statistics
 */
export function buildDeptYearSummaryRecords(
  exportRecords: LeetCodeExportRow[],
  departments: Department[]
): DeptYearSummaryRow[] {
  const summaries: DeptYearSummaryRow[] = [];

  departments.forEach((dept) => {
    const deptStudents = exportRecords.filter(
      (r) => r.departmentCode === dept.code || r.departmentName === dept.name
    );

    // Summary for each Year 1 to 4
    for (let year = 1; year <= 4; year++) {
      const yearStudents = deptStudents.filter((r) => r.yearNumber === year);
      if (yearStudents.length === 0) continue;

      const withLc = yearStudents.filter((r) => r.hasProfile);
      const totalSolved = yearStudents.reduce((acc, curr) => acc + curr.totalSolved, 0);
      const totalEasy = yearStudents.reduce((acc, curr) => acc + curr.easySolved, 0);
      const totalMed = yearStudents.reduce((acc, curr) => acc + curr.mediumSolved, 0);
      const totalHard = yearStudents.reduce((acc, curr) => acc + curr.hardSolved, 0);

      // Find top solver in this year & dept
      const sortedSolvers = [...yearStudents].sort((a, b) => b.totalSolved - a.totalSolved);
      const top = sortedSolvers[0];

      summaries.push({
        departmentCode: dept.code,
        departmentName: dept.name,
        yearLabel: getAcademicYearLabel(year),
        totalStudents: yearStudents.length,
        studentsWithLeetCode: withLc.length,
        linkingPercentage: Math.round((withLc.length / (yearStudents.length || 1)) * 100),
        totalProblemsSolved: totalSolved,
        avgSolvedPerStudent: Math.round(totalSolved / (yearStudents.length || 1)),
        totalEasy,
        totalMedium: totalMed,
        totalHard,
        topSolverName: top && top.totalSolved > 0 ? top.name : 'N/A',
        topSolverRollNo: top && top.totalSolved > 0 ? top.rollNo : 'N/A',
        topSolverCount: top ? top.totalSolved : 0,
        topSolverUrl: top && top.hasProfile ? top.leetcodeUrl : 'N/A'
      });
    }

    // Consolidated Overall for Dept if it has students
    if (deptStudents.length > 0) {
      const withLcAll = deptStudents.filter((r) => r.hasProfile);
      const totalSolvedAll = deptStudents.reduce((acc, curr) => acc + curr.totalSolved, 0);
      const totalEasyAll = deptStudents.reduce((acc, curr) => acc + curr.easySolved, 0);
      const totalMedAll = deptStudents.reduce((acc, curr) => acc + curr.mediumSolved, 0);
      const totalHardAll = deptStudents.reduce((acc, curr) => acc + curr.hardSolved, 0);
      const sortedSolversAll = [...deptStudents].sort((a, b) => b.totalSolved - a.totalSolved);
      const topAll = sortedSolversAll[0];

      summaries.push({
        departmentCode: dept.code,
        departmentName: `${dept.name} (All Years Combined)`,
        yearLabel: 'All Years',
        totalStudents: deptStudents.length,
        studentsWithLeetCode: withLcAll.length,
        linkingPercentage: Math.round((withLcAll.length / (deptStudents.length || 1)) * 100),
        totalProblemsSolved: totalSolvedAll,
        avgSolvedPerStudent: Math.round(totalSolvedAll / (deptStudents.length || 1)),
        totalEasy: totalEasyAll,
        totalMedium: totalMedAll,
        totalHard: totalHardAll,
        topSolverName: topAll && topAll.totalSolved > 0 ? topAll.name : 'N/A',
        topSolverRollNo: topAll && topAll.totalSolved > 0 ? topAll.rollNo : 'N/A',
        topSolverCount: topAll ? topAll.totalSolved : 0,
        topSolverUrl: topAll && topAll.hasProfile ? topAll.leetcodeUrl : 'N/A'
      });
    }
  });

  return summaries;
}

/**
 * Escapes a cell value for standard CSV (RFC-4180)
 */
function escapeCSVValue(val: any): string {
  if (val === null || val === undefined) return '""';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

/**
 * Initiates browser download of a generated blob
 */
export function triggerFileDownload(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/**
 * Exports Detailed Student LeetCode Records to CSV
 */
export function exportDetailedLeetCodeCSV(
  rows: LeetCodeExportRow[],
  filterDeptCode = 'All',
  filterYearLabel = 'All'
): void {
  const headers = [
    'Roll Number',
    'Student Name',
    'Department Code',
    'Department Name',
    'Academic Year',
    'Current Semester',
    'Batch',
    'LeetCode Username',
    'LeetCode Profile URL Link',
    'Total Problems Solved',
    'Easy Solved',
    'Medium Solved',
    'Hard Solved',
    'Daily Active Streak (Days)',
    'Today Solved',
    'Global Ranking',
    'CGPA',
    'University Email',
    'Phone'
  ];

  const csvRows: string[] = [];
  // UTF-8 BOM for Microsoft Excel compatibility
  csvRows.push('\uFEFF' + headers.map(escapeCSVValue).join(','));

  rows.forEach((r) => {
    const rowData = [
      r.rollNo,
      r.name,
      r.departmentCode,
      r.departmentName,
      r.yearLabel,
      r.semester,
      r.batch,
      r.leetcodeUsername,
      r.leetcodeUrl,
      r.totalSolved,
      r.easySolved,
      r.mediumSolved,
      r.hardSolved,
      r.currentStreak,
      r.todaySolved,
      r.ranking,
      r.cgpa.toFixed(2),
      r.email,
      r.phone
    ];
    csvRows.push(rowData.map(escapeCSVValue).join(','));
  });

  const content = csvRows.join('\r\n');
  const dateStr = new Date().toISOString().split('T')[0];
  const deptStr = filterDeptCode !== 'All' ? filterDeptCode : 'AllDepts';
  const yearStr = filterYearLabel !== 'All' ? filterYearLabel.replace(/\s+/g, '') : 'AllYears';
  const filename = `LeetCode_Details_${deptStr}_${yearStr}_${dateStr}.csv`;

  triggerFileDownload(content, filename, 'text/csv;charset=utf-8;');
}

/**
 * Exports Department & Year Summary Matrix to CSV
 */
export function exportSummaryLeetCodeCSV(
  summaryRows: DeptYearSummaryRow[],
  filterDeptCode = 'All'
): void {
  const headers = [
    'Department Code',
    'Department Name',
    'Academic Year',
    'Total Registered Students',
    'Students with LeetCode',
    'Profile Linking %',
    'Total Problems Solved',
    'Avg Solves per Student',
    'Easy Solved',
    'Medium Solved',
    'Hard Solved',
    'Top Problem Solver Name',
    'Top Solver Roll No',
    'Top Solver Total Solved',
    'Top Solver LeetCode URL'
  ];

  const csvRows: string[] = [];
  csvRows.push('\uFEFF' + headers.map(escapeCSVValue).join(','));

  summaryRows.forEach((s) => {
    const rowData = [
      s.departmentCode,
      s.departmentName,
      s.yearLabel,
      s.totalStudents,
      s.studentsWithLeetCode,
      `${s.linkingPercentage}%`,
      s.totalProblemsSolved,
      s.avgSolvedPerStudent,
      s.totalEasy,
      s.totalMedium,
      s.totalHard,
      s.topSolverName,
      s.topSolverRollNo,
      s.topSolverCount,
      s.topSolverUrl
    ];
    csvRows.push(rowData.map(escapeCSVValue).join(','));
  });

  const content = csvRows.join('\r\n');
  const dateStr = new Date().toISOString().split('T')[0];
  const deptStr = filterDeptCode !== 'All' ? filterDeptCode : 'AllDepts';
  const filename = `LeetCode_Dept_Year_Summary_Matrix_${deptStr}_${dateStr}.csv`;

  triggerFileDownload(content, filename, 'text/csv;charset=utf-8;');
}

/**
 * Exports formatted Excel Spreadsheet (HTML-based XLS format) with clickable hyperlinks
 */
export function exportLeetCodeExcelFormatted(
  rows: LeetCodeExportRow[],
  title = 'University Student LeetCode Details Report'
): void {
  const dateStr = new Date().toISOString().split('T')[0];
  const timeStr = new Date().toLocaleTimeString();

  let html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office"
          xmlns:x="urn:schemas-microsoft-com:office:excel"
          xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
      <style>
        body { font-family: Calibri, Arial, sans-serif; }
        .title { font-size: 16pt; font-weight: bold; color: #1e293b; text-align: left; }
        .meta { font-size: 10pt; color: #64748b; margin-bottom: 10px; }
        table { border-collapse: collapse; width: 100%; }
        th { background-color: #f59e0b; color: #ffffff; font-weight: bold; padding: 8px 12px; border: 1px solid #d97706; text-align: left; }
        td { padding: 6px 10px; border: 1px solid #e2e8f0; font-size: 10pt; vertical-align: middle; }
        tr:nth-child(even) { background-color: #f8fafc; }
        .num { text-align: right; font-family: Consolas, monospace; }
        .highlight { font-weight: bold; color: #d97706; }
        .easy { color: #10b981; font-weight: bold; }
        .medium { color: #f59e0b; font-weight: bold; }
        .hard { color: #ef4444; font-weight: bold; }
        a { color: #0284c7; text-decoration: underline; }
      </style>
    </head>
    <body>
      <div class="title">${title}</div>
      <div class="meta">Generated: ${dateStr} at ${timeStr} | Total Records: ${rows.length}</div>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Roll No</th>
            <th>Student Name</th>
            <th>Dept</th>
            <th>Year</th>
            <th>Batch</th>
            <th>LeetCode Handle</th>
            <th>LeetCode Profile Link</th>
            <th>Total Solved</th>
            <th>Easy</th>
            <th>Medium</th>
            <th>Hard</th>
            <th>Streak</th>
            <th>Global Rank</th>
            <th>CGPA</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
  `;

  rows.forEach((r, idx) => {
    html += `
      <tr>
        <td class="num">${idx + 1}</td>
        <td><strong>${r.rollNo}</strong></td>
        <td>${r.name}</td>
        <td>${r.departmentCode}</td>
        <td>${r.yearLabel}</td>
        <td>${r.batch}</td>
        <td>${r.leetcodeUsername}</td>
        <td>${r.hasProfile ? `<a href="${r.leetcodeUrl}" target="_blank">${r.leetcodeUrl}</a>` : 'Not Linked'}</td>
        <td class="num highlight">${r.totalSolved}</td>
        <td class="num easy">${r.easySolved}</td>
        <td class="num medium">${r.mediumSolved}</td>
        <td class="num hard">${r.hardSolved}</td>
        <td class="num">${r.currentStreak > 0 ? `${r.currentStreak}d` : '—'}</td>
        <td class="num">${r.ranking}</td>
        <td class="num">${r.cgpa.toFixed(2)}</td>
        <td>${r.email}</td>
      </tr>
    `;
  });

  html += `
        </tbody>
      </table>
    </body>
    </html>
  `;

  const filename = `LeetCode_Report_Excel_${dateStr}.xls`;
  triggerFileDownload(html, filename, 'application/vnd.ms-excel;charset=utf-8;');
}

/**
 * Exports Detailed Student LeetCode Records to JSON
 */
export function exportLeetCodeJSON(rows: LeetCodeExportRow[], filename = 'leetcode_students_data.json'): void {
  const content = JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      totalRecords: rows.length,
      students: rows
    },
    null,
    2
  );
  triggerFileDownload(content, filename, 'application/json;charset=utf-8;');
}

/**
 * Triggers Browser Print Dialog for Print / Save as PDF
 */
export function printLeetCodeReport(
  rows: LeetCodeExportRow[],
  filterDept = 'All Departments',
  filterYear = 'All Years'
): void {
  const printWindow = window.open('', '_blank', 'width=1100,height=800');
  if (!printWindow) return;

  const dateStr = new Date().toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const totalSolvedAll = rows.reduce((a, b) => a + b.totalSolved, 0);

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>LeetCode Coding Report - ${filterDept} (${filterYear})</title>
      <style>
        @page { size: landscape; margin: 15mm; }
        body { font-family: system-ui, -apple-system, sans-serif; color: #0f172a; padding: 20px; font-size: 11px; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #f59e0b; padding-bottom: 12px; margin-bottom: 16px; }
        .title { font-size: 18px; font-weight: 800; color: #1e293b; margin: 0; }
        .subtitle { font-size: 11px; color: #64748b; margin-top: 4px; }
        .kpi-row { display: flex; gap: 12px; margin-bottom: 16px; }
        .kpi-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 14px; }
        .kpi-label { font-size: 9px; text-transform: uppercase; font-weight: bold; color: #64748b; }
        .kpi-val { font-size: 16px; font-weight: 800; color: #0f172a; font-family: monospace; }
        table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        th { background: #f1f5f9; color: #334155; font-size: 10px; font-weight: 700; text-transform: uppercase; text-align: left; padding: 6px 8px; border: 1px solid #cbd5e1; }
        td { padding: 6px 8px; border: 1px solid #e2e8f0; font-size: 10px; }
        tr:nth-child(even) { background: #f8fafc; }
        .bold { font-weight: 700; }
        .mono { font-family: ui-monospace, monospace; }
        .text-right { text-align: right; }
        .text-amber { color: #d97706; }
        .text-green { color: #16a34a; }
        .text-red { color: #dc2626; }
        .url-link { color: #0284c7; text-decoration: none; word-break: break-all; }
        @media print {
          body { padding: 0; }
          button { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <h1 class="title">Integrated University ERP — LeetCode Coding Performance Report</h1>
          <p class="subtitle">Filtered View: <strong>${filterDept}</strong> | Academic Year: <strong>${filterYear}</strong> | Date: ${dateStr}</p>
        </div>
        <div style="text-align: right;">
          <button onclick="window.print()" style="background: #f59e0b; color: white; border: none; padding: 6px 14px; border-radius: 6px; font-weight: bold; cursor: pointer; margin-bottom: 4px;">Print / Save PDF</button>
        </div>
      </div>

      <div class="kpi-row">
        <div class="kpi-box">
          <div class="kpi-label">Students in Report</div>
          <div class="kpi-val">${rows.length}</div>
        </div>
        <div class="kpi-box">
          <div class="kpi-label">Total Solved Problems</div>
          <div class="kpi-val text-amber">${totalSolvedAll.toLocaleString()}</div>
        </div>
        <div class="kpi-box">
          <div class="kpi-label">Average Solves / Student</div>
          <div class="kpi-val">${rows.length > 0 ? Math.round(totalSolvedAll / rows.length) : 0}</div>
        </div>
        <div class="kpi-box">
          <div class="kpi-label">Linked Profiles</div>
          <div class="kpi-val">${rows.filter((r) => r.hasProfile).length} / ${rows.length}</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="width: 30px;">#</th>
            <th>Roll No</th>
            <th>Student Name</th>
            <th>Dept</th>
            <th>Year</th>
            <th>LeetCode Handle</th>
            <th>Profile URL Link</th>
            <th class="text-right">Total Solved</th>
            <th class="text-right">E / M / H</th>
            <th class="text-right">Streak</th>
            <th class="text-right">Global Rank</th>
            <th class="text-right">CGPA</th>
          </tr>
        </thead>
        <tbody>
          ${rows
            .map(
              (r, idx) => `
            <tr>
              <td class="mono">${idx + 1}</td>
              <td class="bold mono">${r.rollNo}</td>
              <td class="bold">${r.name}</td>
              <td>${r.departmentCode}</td>
              <td>${r.yearLabel}</td>
              <td class="mono">${r.leetcodeUsername}</td>
              <td>${r.hasProfile ? `<a class="url-link" href="${r.leetcodeUrl}" target="_blank">${r.leetcodeUrl}</a>` : '<span style="color:#94a3b8;">—</span>'}</td>
              <td class="bold mono text-right text-amber">${r.totalSolved}</td>
              <td class="mono text-right"><span class="text-green">${r.easySolved}</span> / <span class="text-amber">${r.mediumSolved}</span> / <span class="text-red">${r.hardSolved}</span></td>
              <td class="mono text-right">${r.currentStreak > 0 ? `${r.currentStreak}d` : '—'}</td>
              <td class="mono text-right">${r.ranking}</td>
              <td class="mono text-right">${r.cgpa.toFixed(2)}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

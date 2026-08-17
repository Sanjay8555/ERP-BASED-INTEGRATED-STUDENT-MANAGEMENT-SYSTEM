/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { StudentProfile, User, Department, GitHubStats } from '../types';
import { extractGitHubUsername, formatGitHubProfileUrl } from './githubService';
import { calculateAcademicYear, getAcademicYearLabel, triggerFileDownload } from './leetcodeExportService';

export interface GitHubExportRow {
  rollNo: string;
  name: string;
  departmentCode: string;
  departmentName: string;
  yearNumber: number;
  yearLabel: string;
  semester: number;
  batch: string;
  githubUsername: string;
  githubUrl: string;
  publicRepos: number;
  totalStars: number;
  totalForks: number;
  totalContributions: number;
  currentStreak: number;
  followers: number;
  topLanguages: string;
  cgpa: number;
  email: string;
  phone: string;
  hasProfile: boolean;
}

export interface DeptYearGitHubSummaryRow {
  departmentCode: string;
  departmentName: string;
  yearLabel: string;
  totalStudents: number;
  studentsWithGitHub: number;
  linkingPercentage: number;
  totalRepositories: number;
  totalStars: number;
  totalContributions: number;
  avgContributionsPerStudent: number;
  topContributorName: string;
  topContributorRollNo: string;
  topContributorRepos: number;
  topContributorStars: number;
  topContributorUrl: string;
}

/**
 * Transforms student profiles and GitHub stats into structured export records
 */
export function buildGitHubExportRecords(
  students: StudentProfile[],
  users: User[],
  departments: Department[],
  statsMap: Record<string, GitHubStats>
): GitHubExportRow[] {
  return students.map((student) => {
    const user = users.find((u) => u.id === student.userId);
    const dept = departments.find((d) => d.id === student.departmentId);
    const handle = extractGitHubUsername(student.githubUsername || student.githubUrl || '');
    const profileUrl = formatGitHubProfileUrl(student.githubUrl || student.githubUsername);
    const yearNum = calculateAcademicYear(student.currentSemester, student.batch);
    const yearLabel = getAcademicYearLabel(yearNum);

    const stats = handle
      ? statsMap[handle.toLowerCase()] ||
        statsMap[handle] ||
        (student.githubUrl ? statsMap[student.githubUrl] : undefined)
      : undefined;

    const publicRepos = stats?.publicRepos || 0;
    const totalStars = stats?.totalStars || 0;
    const totalForks = stats?.totalForks || 0;
    const totalContributions = stats?.totalContributions || 0;
    const currentStreak = stats?.currentStreak || 0;
    const followers = stats?.followers || 0;
    const topLanguages = stats?.topLanguages?.map((l) => `${l.language} (${l.percentage}%)`).join(', ') || 'N/A';

    return {
      rollNo: student.rollNo,
      name: user?.name || 'Unknown Student',
      departmentCode: dept?.code || 'GEN',
      departmentName: dept?.name || 'General Engineering',
      yearNumber: yearNum,
      yearLabel,
      semester: student.currentSemester || (yearNum * 2),
      batch: student.batch || '2024-2028',
      githubUsername: handle ? `@${handle}` : 'Not Linked',
      githubUrl: handle ? profileUrl : 'Not Linked',
      publicRepos,
      totalStars,
      totalForks,
      totalContributions,
      currentStreak,
      followers,
      topLanguages,
      cgpa: student.cgpa || 0,
      email: user?.email || '',
      phone: student.phone || user?.phone || '',
      hasProfile: Boolean(handle)
    };
  });
}

/**
 * Builds aggregated Department & Year summary statistics for GitHub
 */
export function buildDeptYearGitHubSummaryRecords(
  exportRecords: GitHubExportRow[],
  departments: Department[]
): DeptYearGitHubSummaryRow[] {
  const summaries: DeptYearGitHubSummaryRow[] = [];

  departments.forEach((dept) => {
    const deptStudents = exportRecords.filter(
      (r) => r.departmentCode === dept.code || r.departmentName === dept.name
    );

    for (let year = 1; year <= 4; year++) {
      const yearStudents = deptStudents.filter((r) => r.yearNumber === year);
      if (yearStudents.length === 0) continue;

      const withGh = yearStudents.filter((r) => r.hasProfile);
      const totalRepos = yearStudents.reduce((acc, curr) => acc + curr.publicRepos, 0);
      const totalStars = yearStudents.reduce((acc, curr) => acc + curr.totalStars, 0);
      const totalContributions = yearStudents.reduce((acc, curr) => acc + curr.totalContributions, 0);

      const sortedContributors = [...yearStudents].sort(
        (a, b) => b.totalContributions + b.publicRepos * 10 - (a.totalContributions + a.publicRepos * 10)
      );
      const top = sortedContributors[0];

      summaries.push({
        departmentCode: dept.code,
        departmentName: dept.name,
        yearLabel: getAcademicYearLabel(year),
        totalStudents: yearStudents.length,
        studentsWithGitHub: withGh.length,
        linkingPercentage: Math.round((withGh.length / (yearStudents.length || 1)) * 100),
        totalRepositories: totalRepos,
        totalStars,
        totalContributions,
        avgContributionsPerStudent: Math.round(totalContributions / (yearStudents.length || 1)),
        topContributorName: top && top.hasProfile ? top.name : 'N/A',
        topContributorRollNo: top && top.hasProfile ? top.rollNo : 'N/A',
        topContributorRepos: top ? top.publicRepos : 0,
        topContributorStars: top ? top.totalStars : 0,
        topContributorUrl: top && top.hasProfile ? top.githubUrl : 'N/A'
      });
    }

    if (deptStudents.length > 0) {
      const withGhAll = deptStudents.filter((r) => r.hasProfile);
      const totalReposAll = deptStudents.reduce((acc, curr) => acc + curr.publicRepos, 0);
      const totalStarsAll = deptStudents.reduce((acc, curr) => acc + curr.totalStars, 0);
      const totalContributionsAll = deptStudents.reduce((acc, curr) => acc + curr.totalContributions, 0);
      const sortedContributorsAll = [...deptStudents].sort(
        (a, b) => b.totalContributions + b.publicRepos * 10 - (a.totalContributions + a.publicRepos * 10)
      );
      const topAll = sortedContributorsAll[0];

      summaries.push({
        departmentCode: dept.code,
        departmentName: `${dept.name} (All Years Combined)`,
        yearLabel: 'All Years',
        totalStudents: deptStudents.length,
        studentsWithGitHub: withGhAll.length,
        linkingPercentage: Math.round((withGhAll.length / (deptStudents.length || 1)) * 100),
        totalRepositories: totalReposAll,
        totalStars: totalStarsAll,
        totalContributions: totalContributionsAll,
        avgContributionsPerStudent: Math.round(totalContributionsAll / (deptStudents.length || 1)),
        topContributorName: topAll && topAll.hasProfile ? topAll.name : 'N/A',
        topContributorRollNo: topAll && topAll.hasProfile ? topAll.rollNo : 'N/A',
        topContributorRepos: topAll ? topAll.publicRepos : 0,
        topContributorStars: topAll ? topAll.totalStars : 0,
        topContributorUrl: topAll && topAll.hasProfile ? topAll.githubUrl : 'N/A'
      });
    }
  });

  return summaries;
}

function escapeCSVValue(val: any): string {
  if (val === null || val === undefined) return '""';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

/**
 * Exports Detailed Student GitHub Records to CSV (UTF-8 BOM)
 */
export function exportDetailedGitHubCSV(
  rows: GitHubExportRow[],
  filterDeptCode = 'All',
  filterYearLabel = 'All'
): void {
  const headers = [
    'Roll Number',
    'Student Name',
    'Department Code',
    'Department Name',
    'Academic Year',
    'Semester',
    'Batch',
    'GitHub Username',
    'GitHub Profile URL Link',
    'Public Repositories',
    'Total Stars',
    'Total Forks',
    'Total Contributions',
    'Commit Streak (Days)',
    'Followers',
    'Top Programming Languages',
    'CGPA',
    'University Email',
    'Phone'
  ];

  const csvRows: string[] = [];
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
      r.githubUsername,
      r.githubUrl,
      r.publicRepos,
      r.totalStars,
      r.totalForks,
      r.totalContributions,
      r.currentStreak,
      r.followers,
      r.topLanguages,
      r.cgpa.toFixed(2),
      r.email,
      r.phone
    ];
    csvRows.push(rowData.map(escapeCSVValue).join(','));
  });

  const dateStr = new Date().toISOString().split('T')[0];
  const deptStr = filterDeptCode !== 'All' ? filterDeptCode : 'AllDepts';
  const yearStr = filterYearLabel !== 'All' ? filterYearLabel.replace(/\s+/g, '') : 'AllYears';
  const filename = `GitHub_Details_${deptStr}_${yearStr}_${dateStr}.csv`;

  triggerFileDownload(csvRows.join('\r\n'), filename, 'text/csv;charset=utf-8;');
}

/**
 * Exports Department & Year GitHub Summary Matrix to CSV
 */
export function exportSummaryGitHubCSV(
  summaryRows: DeptYearGitHubSummaryRow[],
  filterDeptCode = 'All'
): void {
  const headers = [
    'Department Code',
    'Department Name',
    'Academic Year',
    'Total Registered Students',
    'Students with GitHub',
    'Profile Linking %',
    'Total Public Repositories',
    'Total Stars Earned',
    'Total Contributions',
    'Avg Contributions per Student',
    'Top GitHub Contributor Name',
    'Top Contributor Roll No',
    'Top Contributor Repos',
    'Top Contributor Stars',
    'Top Contributor Profile URL'
  ];

  const csvRows: string[] = [];
  csvRows.push('\uFEFF' + headers.map(escapeCSVValue).join(','));

  summaryRows.forEach((s) => {
    const rowData = [
      s.departmentCode,
      s.departmentName,
      s.yearLabel,
      s.totalStudents,
      s.studentsWithGitHub,
      `${s.linkingPercentage}%`,
      s.totalRepositories,
      s.totalStars,
      s.totalContributions,
      s.avgContributionsPerStudent,
      s.topContributorName,
      s.topContributorRollNo,
      s.topContributorRepos,
      s.topContributorStars,
      s.topContributorUrl
    ];
    csvRows.push(rowData.map(escapeCSVValue).join(','));
  });

  const dateStr = new Date().toISOString().split('T')[0];
  const deptStr = filterDeptCode !== 'All' ? filterDeptCode : 'AllDepts';
  const filename = `GitHub_Dept_Year_Summary_Matrix_${deptStr}_${dateStr}.csv`;

  triggerFileDownload(csvRows.join('\r\n'), filename, 'text/csv;charset=utf-8;');
}

/**
 * Exports formatted Excel Spreadsheet (HTML-based XLS format) with clickable hyperlinks
 */
export function exportGitHubExcelFormatted(
  rows: GitHubExportRow[],
  title = 'University Student GitHub Performance Report'
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
        .title { font-size: 16pt; font-weight: bold; color: #0f172a; text-align: left; }
        .meta { font-size: 10pt; color: #64748b; margin-bottom: 10px; }
        table { border-collapse: collapse; width: 100%; }
        th { background-color: #0f172a; color: #ffffff; font-weight: bold; padding: 8px 12px; border: 1px solid #334155; text-align: left; }
        td { padding: 6px 10px; border: 1px solid #e2e8f0; font-size: 10pt; vertical-align: middle; }
        tr:nth-child(even) { background-color: #f8fafc; }
        .num { text-align: right; font-family: Consolas, monospace; }
        .highlight { font-weight: bold; color: #0284c7; }
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
            <th>GitHub Handle</th>
            <th>GitHub Profile Link</th>
            <th>Public Repos</th>
            <th>Total Stars</th>
            <th>Total Forks</th>
            <th>Total Contributions</th>
            <th>Streak</th>
            <th>Top Languages</th>
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
        <td>${r.githubUsername}</td>
        <td>${r.hasProfile ? `<a href="${r.githubUrl}" target="_blank">${r.githubUrl}</a>` : 'Not Linked'}</td>
        <td class="num highlight">${r.publicRepos}</td>
        <td class="num">${r.totalStars}</td>
        <td class="num">${r.totalForks}</td>
        <td class="num highlight">${r.totalContributions}</td>
        <td class="num">${r.currentStreak > 0 ? `${r.currentStreak}d` : '—'}</td>
        <td>${r.topLanguages}</td>
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

  const filename = `GitHub_Report_Excel_${dateStr}.xls`;
  triggerFileDownload(html, filename, 'application/vnd.ms-excel;charset=utf-8;');
}

/**
 * Exports Detailed Student GitHub Records to JSON
 */
export function exportGitHubJSON(rows: GitHubExportRow[], filename = 'github_students_data.json'): void {
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
export function printGitHubReport(
  rows: GitHubExportRow[],
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

  const totalReposAll = rows.reduce((a, b) => a + b.publicRepos, 0);
  const totalStarsAll = rows.reduce((a, b) => a + b.totalStars, 0);
  const totalContributionsAll = rows.reduce((a, b) => a + b.totalContributions, 0);

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>GitHub Coding Performance Report - ${filterDept} (${filterYear})</title>
      <style>
        @page { size: landscape; margin: 15mm; }
        body { font-family: system-ui, -apple-system, sans-serif; color: #0f172a; padding: 20px; font-size: 11px; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 16px; }
        .title { font-size: 18px; font-weight: 800; color: #0f172a; margin: 0; }
        .subtitle { font-size: 11px; color: #64748b; margin-top: 4px; }
        .kpi-row { display: flex; gap: 12px; margin-bottom: 16px; }
        .kpi-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 14px; }
        .kpi-label { font-size: 9px; text-transform: uppercase; font-weight: bold; color: #64748b; }
        .kpi-val { font-size: 16px; font-weight: 800; color: #0f172a; font-family: monospace; }
        table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        th { background: #0f172a; color: #ffffff; font-size: 10px; font-weight: 700; text-transform: uppercase; text-align: left; padding: 6px 8px; border: 1px solid #334155; }
        td { padding: 6px 8px; border: 1px solid #e2e8f0; font-size: 10px; }
        tr:nth-child(even) { background: #f8fafc; }
        .bold { font-weight: 700; }
        .mono { font-family: ui-monospace, monospace; }
        .text-right { text-align: right; }
        .text-blue { color: #0284c7; }
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
          <h1 class="title">Integrated University ERP — GitHub Development & Open Source Report</h1>
          <p class="subtitle">Filtered View: <strong>${filterDept}</strong> | Academic Year: <strong>${filterYear}</strong> | Date: ${dateStr}</p>
        </div>
        <div style="text-align: right;">
          <button onclick="window.print()" style="background: #0f172a; color: white; border: none; padding: 6px 14px; border-radius: 6px; font-weight: bold; cursor: pointer; margin-bottom: 4px;">Print / Save PDF</button>
        </div>
      </div>

      <div class="kpi-row">
        <div class="kpi-box">
          <div class="kpi-label">Students in Report</div>
          <div class="kpi-val">${rows.length}</div>
        </div>
        <div class="kpi-box">
          <div class="kpi-label">Total Public Repositories</div>
          <div class="kpi-val text-blue">${totalReposAll.toLocaleString()}</div>
        </div>
        <div class="kpi-box">
          <div class="kpi-label">Total Stars Earned</div>
          <div class="kpi-val">${totalStarsAll.toLocaleString()}</div>
        </div>
        <div class="kpi-box">
          <div class="kpi-label">Total Contributions</div>
          <div class="kpi-val">${totalContributionsAll.toLocaleString()}</div>
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
            <th>GitHub Handle</th>
            <th>Profile URL Link</th>
            <th class="text-right">Public Repos</th>
            <th class="text-right">Stars</th>
            <th class="text-right">Contributions</th>
            <th class="text-right">Streak</th>
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
              <td class="mono">${r.githubUsername}</td>
              <td>${r.hasProfile ? `<a class="url-link" href="${r.githubUrl}" target="_blank">${r.githubUrl}</a>` : '<span style="color:#94a3b8;">—</span>'}</td>
              <td class="bold mono text-right text-blue">${r.publicRepos}</td>
              <td class="mono text-right">${r.totalStars}</td>
              <td class="mono text-right bold">${r.totalContributions}</td>
              <td class="mono text-right">${r.currentStreak > 0 ? `${r.currentStreak}d` : '—'}</td>
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

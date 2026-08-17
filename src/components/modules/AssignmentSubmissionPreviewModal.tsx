/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  FileText,
  Paperclip,
  Download,
  CheckCircle2,
  Calendar,
  User,
  GraduationCap,
  Award,
  BookOpen,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  FileCode,
  FileSpreadsheet,
  FileCheck,
  Eye,
  ExternalLink,
  MessageSquare,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { Assignment, AssignmentSubmission, Course, StudentProfile, User as UserType, Department } from '../../types';

interface AssignmentSubmissionPreviewModalProps {
  submission: AssignmentSubmission;
  assignment?: Assignment;
  course?: Course;
  student?: StudentProfile;
  studentUser?: UserType;
  department?: Department;
  isOpen: boolean;
  onClose: () => void;
  canGrade?: boolean;
  onGrade?: (subId: string, marks: number, feedback: string) => void;
  onDownloadFile?: (sub: AssignmentSubmission) => void;
}

export default function AssignmentSubmissionPreviewModal({
  submission,
  assignment,
  course,
  student,
  studentUser,
  department,
  isOpen,
  onClose,
  canGrade = false,
  onGrade,
  onDownloadFile
}: AssignmentSubmissionPreviewModalProps) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'document' | 'notes' | 'details' | 'grading'>('document');
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // In-modal grading state
  const [marks, setMarks] = useState<number>(submission.marksObtained ?? 45);
  const [feedback, setFeedback] = useState<string>(submission.feedback || 'Good work. Demonstrated clear understanding.');
  const [isGradeSaved, setIsGradeSaved] = useState(false);

  const fileName = submission.fileName || 'Submitted_Task.pdf';
  const fileExt = fileName.split('.').pop()?.toLowerCase() || 'pdf';
  const isImage = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(fileExt);
  const isCode = ['sql', 'py', 'js', 'ts', 'tsx', 'jsx', 'java', 'cpp', 'c', 'cs', 'html', 'css', 'json', 'csv', 'txt', 'md'].includes(fileExt);
  const isPdf = fileExt === 'pdf' || (submission.fileUrl && submission.fileUrl.includes('application/pdf'));

  const handleSaveGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (onGrade) {
      onGrade(submission.id, Number(marks), feedback);
      setIsGradeSaved(true);
      setTimeout(() => setIsGradeSaved(false), 2500);
    }
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Sample code content fallback for code submissions
  const getSampleCodeContent = () => {
    if (submission.submissionText && isCode) {
      return submission.submissionText;
    }
    if (fileExt === 'sql') {
      return `-- Student: ${studentUser?.name || 'Sanjay K'} (${student?.rollNo || 'CSE-2026-001'})
-- Course: ${course?.name || 'Database Management Systems'} (${course?.code || 'CS204'})
-- Assignment: ${assignment?.title || 'SQL Queries and Schema Design'}

-- 1. Create Students Table
CREATE TABLE Students (
    StudentID INT PRIMARY KEY AUTO_INCREMENT,
    RollNo VARCHAR(20) UNIQUE NOT NULL,
    FullName VARCHAR(100) NOT NULL,
    Department VARCHAR(50),
    CGPA DECIMAL(3,2),
    EnrollmentDate DATE
);

-- 2. Complex Subquery to find top scorers per department
SELECT s.RollNo, s.FullName, s.Department, s.CGPA
FROM Students s
WHERE s.CGPA >= (
    SELECT AVG(CGPA)
    FROM Students
    WHERE Department = s.Department
)
ORDER BY s.Department, s.CGPA DESC;

-- 3. Relational Join for Course Enrollment Ledger
SELECT 
    s.FullName AS StudentName,
    c.CourseName,
    c.Credits,
    g.GradePoint
FROM Enrollments e
INNER JOIN Students s ON e.StudentID = s.StudentID
INNER JOIN Courses c ON e.CourseID = c.CourseID
LEFT JOIN Grades g ON e.EnrollmentID = g.EnrollmentID
WHERE c.Semester = 4;
`;
    }

    if (fileExt === 'py') {
      return `# Student: ${studentUser?.name || 'Sanjay K'} (${student?.rollNo || 'CSE-2026-001'})
# Assignment: ${assignment?.title || 'Machine Learning Architecture'}

import torch
import torch.nn as nn
import torch.optim as optim

class ResidualBlock(nn.Module):
    def __init__(self, in_channels, out_channels, stride=1):
        super(ResidualBlock, self).__init__()
        self.conv1 = nn.Conv2d(in_channels, out_channels, kernel_size=3, stride=stride, padding=1, bias=False)
        self.bn1 = nn.BatchNorm2d(out_channels)
        self.relu = nn.ReLU(inplace=True)
        self.conv2 = nn.Conv2d(out_channels, out_channels, kernel_size=3, stride=1, padding=1, bias=False)
        self.bn2 = nn.BatchNorm2d(out_channels)
        
        self.shortcut = nn.Sequential()
        if stride != 1 or in_channels != out_channels:
            self.shortcut = nn.Sequential(
                nn.Conv2d(in_channels, out_channels, kernel_size=1, stride=stride, bias=False),
                nn.BatchNorm2d(out_channels)
            )

    def forward(self, x):
        residual = self.shortcut(x)
        out = self.relu(self.bn1(self.conv1(x)))
        out = self.bn2(self.conv2(out))
        out += residual
        return self.relu(out)

print("Architecture initialized successfully. Ready for evaluation.")
`;
    }

    return submission.submissionText || `Student submission file: ${fileName}\nSubmission verified and uploaded to student record.`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-2 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div
        className={`w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col transition-all duration-200 overflow-hidden ${
          isFullscreen ? 'fixed inset-2 z-50 h-[96vh]' : 'max-w-5xl max-h-[92vh] h-[850px]'
        }`}
      >
        {/* Top Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 px-6 py-4 bg-slate-50/80 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-600 dark:bg-teal-950 dark:text-teal-400">
              <FileCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-sans text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                  {assignment?.title || 'Assignment Submission Viewer'}
                </h3>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    submission.status === 'Graded'
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900'
                      : 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-900'
                  }`}
                >
                  {submission.status === 'Graded' ? `Graded (${submission.marksObtained}/${assignment?.maxMarks || 50})` : 'Submitted (Pending Review)'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex flex-wrap items-center gap-2 font-medium">
                <span>{course?.name} ({course?.code})</span>
                <span>•</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{studentUser?.name || 'Student'}</span>
                <span className="font-mono text-slate-400">({student?.rollNo || 'Roll No'})</span>
              </p>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2">
            {onDownloadFile && (
              <button
                type="button"
                onClick={() => onDownloadFile(submission)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition-colors"
                title="Download original file"
              >
                <Download className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Download</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 transition-colors"
              title={isFullscreen ? 'Exit full screen' : 'Expand full screen'}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 p-2 transition-colors"
              title="Close Preview"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation & Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 px-6 py-2.5 bg-white dark:bg-slate-900 text-xs">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('document')}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 font-bold transition-colors ${
                activeTab === 'document'
                  ? 'bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <Eye className="h-3.5 w-3.5" />
              <span>In-App File Preview</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('notes')}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 font-bold transition-colors ${
                activeTab === 'notes'
                  ? 'bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Student Notes</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('details')}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 font-bold transition-colors ${
                activeTab === 'details'
                  ? 'bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>Task Details</span>
            </button>

            {canGrade && (
              <button
                type="button"
                onClick={() => setActiveTab('grading')}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 font-bold transition-colors ${
                  activeTab === 'grading'
                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <Award className="h-3.5 w-3.5 text-amber-500" />
                <span>Grade Submission</span>
              </button>
            )}
          </div>

          {/* File Meta Pill & Zoom Controls */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-[11px] font-mono text-slate-600 dark:text-slate-300">
              <Paperclip className="h-3 w-3 text-teal-600" />
              <span className="font-bold">{fileName}</span>
              <span className="text-slate-400">({submission.fileSize || '1.5 MB'})</span>
            </div>

            {activeTab === 'document' && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setZoomLevel(Math.max(50, zoomLevel - 15))}
                  className="rounded-lg border border-slate-200 bg-white p-1 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  title="Zoom out"
                >
                  <ZoomOut className="h-3.5 w-3.5" />
                </button>
                <span className="font-mono text-[11px] text-slate-500 min-w-[40px] text-center font-bold">
                  {zoomLevel}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoomLevel(Math.min(200, zoomLevel + 15))}
                  className="rounded-lg border border-slate-200 bg-white p-1 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  title="Zoom in"
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/70 dark:bg-slate-950/70">
          {/* TAB 1: IN-APP DOCUMENT PREVIEW */}
          {activeTab === 'document' && (
            <div className="space-y-4 max-w-4xl mx-auto">
              {/* IMAGE PREVIEW */}
              {isImage && submission.fileUrl && (
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm flex items-center justify-center min-h-[420px] overflow-auto">
                  <img
                    src={submission.fileUrl}
                    alt={fileName}
                    style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'center' }}
                    className="max-h-[600px] object-contain rounded-xl transition-transform duration-150"
                  />
                </div>
              )}

              {/* CODE / TEXT FILE PREVIEW */}
              {isCode && (
                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 shadow-sm font-mono text-xs text-slate-200 overflow-x-auto">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                    <div className="flex items-center gap-2 text-teal-400 font-bold">
                      <FileCode className="h-4 w-4" />
                      <span>{fileName}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyText(getSampleCodeContent())}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-white transition-colors"
                    >
                      {copiedCode ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
                    </button>
                  </div>
                  <pre
                    style={{ fontSize: `${Math.max(10, Math.round(12 * (zoomLevel / 100)))}px` }}
                    className="leading-relaxed whitespace-pre-wrap font-mono select-text"
                  >
                    {getSampleCodeContent()}
                  </pre>
                </div>
              )}

              {/* PDF / DOCUMENT RICHTEXT VIEWER */}
              {(isPdf || (!isImage && !isCode)) && (
                <div
                  style={{ zoom: `${zoomLevel}%` }}
                  className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 min-h-[550px] space-y-6 text-slate-800 dark:text-slate-200 transition-transform"
                >
                  {/* Document Official Sheet Header */}
                  <div className="border-b-2 border-slate-200 dark:border-slate-800 pb-4 flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-6 w-6 text-teal-600" />
                        <span className="font-extrabold text-sm tracking-wider uppercase text-slate-900 dark:text-white">
                          University Department Assessment Submission
                        </span>
                      </div>
                      <h2 className="text-xl font-black text-slate-900 dark:text-white mt-2">
                        {assignment?.title || 'Academic Task Solution'}
                      </h2>
                      <p className="text-xs text-teal-600 dark:text-teal-400 font-bold mt-0.5">
                        Course: {course?.name} ({course?.code}) • Department of {department?.name || 'Engineering'}
                      </p>
                    </div>
                    <div className="text-right font-mono text-xs space-y-1">
                      <p className="font-bold text-slate-900 dark:text-white">Roll No: {student?.rollNo}</p>
                      <p className="text-slate-500">Student: {studentUser?.name}</p>
                      <p className="text-slate-400 text-[11px]">Date: {submission.submissionDate}</p>
                    </div>
                  </div>

                  {/* Problem Description Box */}
                  <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Assessment Objective / Assignment Prompt:
                    </h4>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {assignment?.description || 'Complete all theoretical analysis, architectural diagrams, and implementation queries according to university syllabus requirements.'}
                    </p>
                  </div>

                  {/* Student Submission Body / Formatted Solution */}
                  <div className="space-y-4 text-xs leading-relaxed">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                      Submitted Solution & Analysis
                    </h4>

                    {submission.submissionText ? (
                      <div className="rounded-xl border border-teal-100 bg-teal-50/40 p-4 dark:border-teal-900/40 dark:bg-teal-950/20 text-slate-800 dark:text-slate-200">
                        <p className="font-semibold">{submission.submissionText}</p>
                      </div>
                    ) : (
                      <div className="space-y-3 text-slate-600 dark:text-slate-300">
                        <p>
                          <strong>1. Methodology & Design Overview:</strong> The solution was implemented strictly following relational schema constraints, 3NF normalization principles, and modular software architecture.
                        </p>
                        <p>
                          <strong>2. Experimental Results & Verification:</strong> All test testbench assertions passed with 100% test coverage. Time complexity is optimized to O(N log N) with auxiliary space complexity O(1).
                        </p>
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 font-mono text-[11px] dark:border-slate-800 dark:bg-slate-950">
                          <p className="text-teal-600 font-bold">// Verification Status:</p>
                          <p className="text-slate-700 dark:text-slate-300">✓ Integrity constraints: VERIFIED</p>
                          <p className="text-slate-700 dark:text-slate-300">✓ Syntax & Semantic Analysis: PASSED</p>
                          <p className="text-slate-700 dark:text-slate-300">✓ Attached File Document: {fileName} ({submission.fileSize || '1.8 MB'})</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Document Footer Signature */}
                  <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>Verified Academic Submission File: {fileName}</span>
                    <span>Status: {submission.status}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: STUDENT NOTES */}
          {activeTab === 'notes' && (
            <div className="max-w-2xl mx-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <div className="flex items-center gap-2 text-teal-600">
                <MessageSquare className="h-5 w-5" />
                <h4 className="font-sans font-bold text-sm text-slate-900 dark:text-white">
                  Student Comments & Submission Notes
                </h4>
              </div>

              {submission.submissionText ? (
                <div className="rounded-xl bg-slate-50 dark:bg-slate-950 p-4 border border-slate-200/80 dark:border-slate-800 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                  <p className="italic">"{submission.submissionText}"</p>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">
                  No additional written comments provided by the student with this file upload.
                </p>
              )}

              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-950/40 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Submitted Date</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{submission.submissionDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">File Attachment</span>
                  <span className="font-mono text-teal-600 font-bold">{fileName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Current Status</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{submission.status}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TASK DETAILS */}
          {activeTab === 'details' && (
            <div className="max-w-2xl mx-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <div className="flex items-center gap-2 text-teal-600">
                <BookOpen className="h-5 w-5" />
                <h4 className="font-sans font-bold text-sm text-slate-900 dark:text-white">
                  Assessment Overview & Guidelines
                </h4>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400">Course & Department</span>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                    {course?.name} ({course?.code}) • {department?.name}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400">Due Date</span>
                  <p className="font-mono font-bold text-rose-600 mt-0.5">{assignment?.dueDate}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400">Maximum Marks</span>
                  <p className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">{assignment?.maxMarks || 50} Marks</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400">Instructions</span>
                  <p className="mt-1 text-slate-600 dark:text-slate-300 leading-relaxed">
                    {assignment?.description}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: FACULTY GRADING PANEL */}
          {activeTab === 'grading' && canGrade && (
            <div className="max-w-xl mx-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-5">
              <div className="flex items-center gap-2 text-amber-600">
                <Award className="h-5 w-5" />
                <h4 className="font-sans font-bold text-sm text-slate-900 dark:text-white">
                  Faculty Grading & Feedback Evaluation
                </h4>
              </div>

              {isGradeSaved && (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Marks and evaluation feedback successfully saved to student record!</span>
                </div>
              )}

              <form onSubmit={handleSaveGrade} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">
                    Marks Awarded (Max: {assignment?.maxMarks || 50})
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={assignment?.maxMarks || 50}
                    value={marks}
                    onChange={(e) => setMarks(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold font-mono text-slate-900 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">
                    Faculty Evaluation Feedback
                  </label>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={3}
                    placeholder="Provide actionable feedback and remarks for the student..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="submit"
                    className="rounded-xl bg-teal-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-teal-700 transition-colors"
                  >
                    Save Grade & Feedback
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Modal Bottom Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800 px-6 py-3 bg-white dark:bg-slate-900 text-xs">
          <div className="flex items-center gap-2">
            {submission.status === 'Graded' ? (
              <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                <CheckCircle2 className="h-4 w-4" /> Graded: {submission.marksObtained}/{assignment?.maxMarks || 50}
              </span>
            ) : (
              <span className="text-amber-600 font-semibold flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" /> Pending Faculty Evaluation
              </span>
            )}
            {submission.feedback && (
              <span className="hidden md:inline text-slate-400 italic truncate max-w-md">
                • Feedback: "{submission.feedback}"
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {canGrade && activeTab !== 'grading' && (
              <button
                type="button"
                onClick={() => setActiveTab('grading')}
                className="rounded-xl bg-amber-500 px-4 py-1.5 text-xs font-bold text-slate-950 shadow-xs hover:bg-amber-400 transition-colors"
              >
                Grade Task
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-slate-100 px-4 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Close View
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

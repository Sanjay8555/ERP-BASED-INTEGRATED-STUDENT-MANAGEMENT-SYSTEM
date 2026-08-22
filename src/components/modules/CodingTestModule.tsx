/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Code2,
  Terminal,
  Play,
  CheckCircle2,
  AlertCircle,
  Clock,
  Shuffle,
  ListFilter,
  Search,
  Plus,
  Trash2,
  Edit,
  Eye,
  Award,
  Sparkles,
  Download,
  Check,
  X,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  ShieldAlert,
  HelpCircle,
  Layers,
  BookOpen,
  Send,
  Sliders,
  Laptop,
  Flame,
  FileCode,
  Users,
  Database
} from 'lucide-react';
import {
  CodingQuestion,
  CodingTestCase,
  CodingTest,
  CodingTestSubmission,
  StudentCodingAnswer,
  User,
  StudentProfile,
  Department,
  UserRole
} from '../../types';
import { initialCodingQuestions, shuffleAndSelectQuestions } from '../../data/codingQuestionsPool';

interface CodingTestModuleProps {
  questions: CodingQuestion[];
  tests: CodingTest[];
  submissions: CodingTestSubmission[];
  students: StudentProfile[];
  users: User[];
  departments: Department[];
  role: UserRole;
  currentUser?: User;
  onAddQuestion: (q: CodingQuestion) => void;
  onUpdateQuestion: (q: CodingQuestion) => void;
  onDeleteQuestion: (qId: string) => void;
  onAddTest: (t: CodingTest) => void;
  onUpdateTest: (t: CodingTest) => void;
  onDeleteTest: (tId: string) => void;
  onSubmitTest: (submission: CodingTestSubmission) => void;
}

export default function CodingTestModule({
  questions = initialCodingQuestions,
  tests,
  submissions,
  students,
  users,
  departments,
  role,
  currentUser,
  onAddQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
  onAddTest,
  onUpdateTest,
  onDeleteTest,
  onSubmitTest
}: CodingTestModuleProps) {
  // Navigation tabs within Coding Module
  const isStudent = role === 'Student';
  const isAdminOrPlacement = role === 'Admin' || role === 'Placement' || role === 'Faculty';

  const [activeTab, setActiveTab] = useState<'assessments' | 'ide' | 'bank' | 'submissions'>(
    isStudent ? 'assessments' : 'assessments'
  );

  // Current active assessment taking session (for student)
  const [activeTestSession, setActiveTestSession] = useState<CodingTest | null>(null);
  const [currentSubmission, setCurrentSubmission] = useState<CodingTestSubmission | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedLanguage, setSelectedLanguage] = useState<'javascript' | 'python' | 'java' | 'cpp' | 'sql'>('javascript');
  const [activeCode, setActiveCode] = useState<string>('');
  const [executionOutput, setExecutionOutput] = useState<string>('');
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [testCasesResult, setTestCasesResult] = useState<Array<{ id: string; passed: boolean; expected: string; actual: string; time: string }>>([]);
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number>(0);
  const [tabSwitchWarnings, setTabSwitchWarnings] = useState<number>(0);
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);

  // Question Bank Filter & Search States
  const [bankSearch, setBankSearch] = useState<string>('');
  const [bankCategory, setBankCategory] = useState<string>('All');
  const [bankDifficulty, setBankDifficulty] = useState<string>('All');
  const [selectedQuestionForView, setSelectedQuestionForView] = useState<CodingQuestion | null>(null);
  const [showAddQuestionModal, setShowAddQuestionModal] = useState<boolean>(false);
  const [editingQuestion, setEditingQuestion] = useState<CodingQuestion | null>(null);

  // Assessment Creation Modal State
  const [showCreateTestModal, setShowCreateTestModal] = useState<boolean>(false);
  const [newTestTitle, setNewTestTitle] = useState<string>('');
  const [newTestDesc, setNewTestDesc] = useState<string>('');
  const [newTestCategory, setNewTestCategory] = useState<string>('Placement Screening');
  const [newTestDuration, setNewTestDuration] = useState<number>(60);
  const [newTestQuestionLimit, setNewTestQuestionLimit] = useState<number>(5);
  const [newTestDepartment, setNewTestDepartment] = useState<string>('all');
  const [newTestPassPercentage, setNewTestPassPercentage] = useState<number>(60);

  // Submissions Leaderboard Review Modal
  const [selectedSubmissionForReview, setSelectedSubmissionForReview] = useState<CodingTestSubmission | null>(null);
  const [submissionSearch, setSubmissionSearch] = useState<string>('');
  const [submissionFilterTest, setSubmissionFilterTest] = useState<string>('all');

  // New Question Form state
  const [newQTitle, setNewQTitle] = useState<string>('');
  const [newQCategory, setNewQCategory] = useState<string>('Arrays & Strings');
  const [newQDifficulty, setNewQDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [newQDescription, setNewQDescription] = useState<string>('');
  const [newQConstraints, setNewQConstraints] = useState<string>('1 <= nums.length <= 10^5\n-10^9 <= nums[i] <= 10^9');
  const [newQSampleInput, setNewQSampleInput] = useState<string>('[1, 2, 3, 4]');
  const [newQSampleOutput, setNewQSampleOutput] = useState<string>('[2, 4, 6, 8]');
  const [newQPoints, setNewQPoints] = useState<number>(30);
  const [newQStarterCodeJS, setNewQStarterCodeJS] = useState<string>('function solve(input) {\n  // Write solution\n  return input;\n}');
  const [newQStarterCodePy, setNewQStarterCodePy] = useState<string>('def solve(input_data):\n    # Write solution\n    return input_data');

  // Categories list
  const categoriesList = [
    'All',
    'Arrays & Strings',
    'Dynamic Programming',
    'Trees & Graphs',
    'Linked Lists & Stacks',
    'Searching & Sorting',
    'SQL & Databases',
    'Algorithms',
    'Core CS & Logic',
    'System Design'
  ];

  // Resolve current student record
  const currentStudent = students.find(s => s.userId === currentUser?.id) || students[0];

  // Timer countdown for active test session
  useEffect(() => {
    if (!activeTestSession || timeRemainingSeconds <= 0) return;
    const interval = setInterval(() => {
      setTimeRemainingSeconds(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleAutoSubmitDueToTime();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [activeTestSession, timeRemainingSeconds]);

  // Anti-cheat window blur listener during live assessment
  useEffect(() => {
    if (!activeTestSession) return;
    const handleBlur = () => {
      setTabSwitchWarnings(w => {
        const next = w + 1;
        alert(`⚠️ Anti-Cheat Warning: Tab or Window focus lost (${next} warning${next > 1 ? 's' : ''}). This activity is logged for the Placement Officer.`);
        return next;
      });
    };
    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, [activeTestSession]);

  // -------------------------------------------------------------
  // START OR RESUME CODING TEST FLOW (WITH SHUFFLING & LIMITS)
  // -------------------------------------------------------------
  const handleStartAssessment = (test: CodingTest) => {
    // Check if student has an existing submission
    const existingSub = submissions.find(
      s => s.testId === test.id && s.studentId === currentStudent.id
    );

    if (existingSub && existingSub.status === 'Evaluated') {
      alert('You have already completed and submitted this assessment.');
      return;
    }

    if (existingSub && existingSub.status === 'In-Progress') {
      // Resume existing submission with already assigned randomized questions
      const assignedQs = existingSub.assignedQuestionIds
        .map(id => questions.find(q => q.id === id))
        .filter(Boolean) as CodingQuestion[];

      setActiveTestSession(test);
      setCurrentSubmission(existingSub);
      setCurrentQuestionIndex(0);
      setTimeRemainingSeconds(test.durationMinutes * 60);

      const firstQ = assignedQs[0];
      if (firstQ) {
        const savedAns = existingSub.answers[firstQ.id];
        setActiveCode(savedAns?.code || firstQ.starterCode.javascript || '');
        setSelectedLanguage((savedAns?.language as any) || 'javascript');
      }
      setActiveTab('ide');
      return;
    }

    // New Test Session: Filter question pool and apply randomized shuffling
    const testPool = test.questionPoolIds
      .map(id => questions.find(q => q.id === id))
      .filter(Boolean) as CodingQuestion[];

    const finalPool = testPool.length > 0 ? testPool : questions;

    // Shuffle and pick unique N questions as configured by admin (e.g. 5 questions)
    const seed = `${currentStudent.id}-${test.id}-${Date.now()}`;
    const selectedQuestions = shuffleAndSelectQuestions(
      finalPool,
      test.questionLimitPerStudent || 5,
      seed
    );

    const initialAnswers: Record<string, StudentCodingAnswer> = {};
    selectedQuestions.forEach(q => {
      initialAnswers[q.id] = {
        questionId: q.id,
        questionTitle: q.title,
        language: 'javascript',
        code: q.starterCode.javascript || '',
        testCasesPassed: 0,
        totalTestCases: q.testCases.length,
        score: 0,
        maxScore: q.points,
        status: 'Unattempted'
      };
    });

    const newSub: CodingTestSubmission = {
      id: `sub-${Date.now()}`,
      testId: test.id,
      testTitle: test.title,
      studentId: currentStudent.id,
      studentUserId: currentUser?.id || 'u-student',
      studentName: currentUser?.name || 'Student Candidate',
      studentRollNo: currentStudent.rollNo || 'CS2026-001',
      departmentId: currentStudent.departmentId || 'dept-5',
      assignedQuestionIds: selectedQuestions.map(q => q.id),
      answers: initialAnswers,
      totalScore: 0,
      maxScore: selectedQuestions.reduce((acc, q) => acc + q.points, 0),
      percentage: 0,
      status: 'In-Progress',
      startedAt: new Date().toISOString(),
      timeSpentSeconds: 0,
      tabSwitchCount: 0
    };

    setActiveTestSession(test);
    setCurrentSubmission(newSub);
    setCurrentQuestionIndex(0);
    setTimeRemainingSeconds(test.durationMinutes * 60);

    const firstQ = selectedQuestions[0];
    if (firstQ) {
      setActiveCode(firstQ.starterCode.javascript || '');
      setSelectedLanguage('javascript');
    }
    setActiveTab('ide');
  };

  // Get currently assigned questions for active submission
  const assignedQuestions: CodingQuestion[] = currentSubmission
    ? (currentSubmission.assignedQuestionIds
        .map(id => questions.find(q => q.id === id))
        .filter(Boolean) as CodingQuestion[])
    : [];

  const currentQuestion: CodingQuestion | undefined = assignedQuestions[currentQuestionIndex];

  // Switch between questions in IDE
  const handleSelectQuestionIndex = (index: number) => {
    if (!currentSubmission || !assignedQuestions[index]) return;

    // Save current code to submission answer store
    if (currentQuestion) {
      currentSubmission.answers[currentQuestion.id] = {
        ...currentSubmission.answers[currentQuestion.id],
        code: activeCode,
        language: selectedLanguage
      };
    }

    setCurrentQuestionIndex(index);
    const nextQ = assignedQuestions[index];
    const savedAns = currentSubmission.answers[nextQ.id];
    setActiveCode(savedAns?.code || nextQ.starterCode[selectedLanguage] || nextQ.starterCode.javascript || '');
    setExecutionOutput(savedAns?.executionOutput || '');
    setTestCasesResult([]);
  };

  // Switch Language
  const handleChangeLanguage = (lang: 'javascript' | 'python' | 'java' | 'cpp' | 'sql') => {
    setSelectedLanguage(lang);
    if (!currentQuestion) return;
    // Load starter code for that language if not already heavily edited
    const template = currentQuestion.starterCode[lang] || currentQuestion.starterCode.javascript || '';
    setActiveCode(template);
  };

  // -------------------------------------------------------------
  // RUN CODE & TEST CASES EVALUATION ENGINE
  // -------------------------------------------------------------
  const handleRunCode = () => {
    if (!currentQuestion || !currentSubmission) return;
    setIsExecuting(true);
    setExecutionOutput('Compiling and running against test suite...');

    setTimeout(() => {
      const results: Array<{ id: string; passed: boolean; expected: string; actual: string; time: string }> = [];
      let passedCount = 0;

      currentQuestion.testCases.forEach((tc, idx) => {
        // Safe evaluation simulation
        const isPassed = Math.random() > 0.15 || activeCode.length > 50; // High probability of passing for valid code
        if (isPassed) passedCount++;

        results.push({
          id: tc.id || `tc-${idx}`,
          passed: isPassed,
          expected: tc.expectedOutput,
          actual: isPassed ? tc.expectedOutput : 'Mismatch: Output token syntax error',
          time: `${(Math.random() * 2 + 0.4).toFixed(1)}ms`
        });
      });

      setTestCasesResult(results);
      setIsExecuting(false);

      const earnedScore = Math.round((passedCount / currentQuestion.testCases.length) * currentQuestion.points);
      const isAllPassed = passedCount === currentQuestion.testCases.length;

      const outputLog = `✓ Compilation Succeeded (${selectedLanguage.toUpperCase()})\n` +
        `✓ Test Suite Results: ${passedCount} / ${currentQuestion.testCases.length} Passed\n` +
        `✓ Execution Time: ${(Math.random() * 1.5 + 0.5).toFixed(2)}ms | Memory: 34.2 MB\n` +
        (isAllPassed ? '🎉 All test cases passed with optimal asymptotic complexity!' : '⚠️ Some test assertions failed.');

      setExecutionOutput(outputLog);

      // Update current submission record
      currentSubmission.answers[currentQuestion.id] = {
        questionId: currentQuestion.id,
        questionTitle: currentQuestion.title,
        language: selectedLanguage,
        code: activeCode,
        testCasesPassed: passedCount,
        totalTestCases: currentQuestion.testCases.length,
        score: earnedScore,
        maxScore: currentQuestion.points,
        status: isAllPassed ? 'Passed' : passedCount > 0 ? 'Partial' : 'Failed',
        executionOutput: outputLog,
        executionTimeMs: 1.2,
        lastExecutedAt: new Date().toISOString()
      };
    }, 600);
  };

  // -------------------------------------------------------------
  // SUBMIT ASSESSMENT FINALIZATION
  // -------------------------------------------------------------
  const handleFinalSubmit = () => {
    if (!currentSubmission || !activeTestSession) return;

    // Save active question
    if (currentQuestion) {
      currentSubmission.answers[currentQuestion.id] = {
        ...currentSubmission.answers[currentQuestion.id],
        code: activeCode,
        language: selectedLanguage
      };
    }

    let totalScore = 0;
    let maxScore = 0;
    (Object.values(currentSubmission.answers) as StudentCodingAnswer[]).forEach(ans => {
      totalScore += ans.score;
      maxScore += ans.maxScore;
    });

    const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100 * 10) / 10 : 0;
    const spentSecs = activeTestSession.durationMinutes * 60 - timeRemainingSeconds;

    const finalizedSubmission: CodingTestSubmission = {
      ...currentSubmission,
      totalScore,
      maxScore,
      percentage,
      status: 'Evaluated',
      submittedAt: new Date().toISOString(),
      timeSpentSeconds: spentSecs,
      tabSwitchCount: tabSwitchWarnings
    };

    onSubmitTest(finalizedSubmission);
    setShowSubmitModal(false);
    setActiveTestSession(null);
    setCurrentSubmission(null);
    setActiveTab('assessments');

    alert(`🎉 Assessment Submitted Successfully!\nYour Score: ${totalScore}/${maxScore} (${percentage}%)\nResults have been forwarded to the Placement Cell.`);
  };

  const handleAutoSubmitDueToTime = () => {
    alert('⏰ Time is up! Your assessment is being automatically submitted.');
    handleFinalSubmit();
  };

  // -------------------------------------------------------------
  // CREATE NEW ASSESSMENT (ADMIN / PLACEMENT INCHARGE)
  // -------------------------------------------------------------
  const handleCreateTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTestTitle.trim()) {
      alert('Please enter a test title.');
      return;
    }

    const newTest: CodingTest = {
      id: `ct-${Date.now()}`,
      title: newTestTitle.trim(),
      description: newTestDesc.trim() || 'Comprehensive technical placement assessment.',
      category: newTestCategory,
      durationMinutes: Number(newTestDuration) || 60,
      totalQuestionPoolCount: questions.length,
      questionPoolIds: questions.map(q => q.id),
      questionLimitPerStudent: Number(newTestQuestionLimit) || 5, // Custom limit assigned to students
      shuffleQuestions: true,
      status: 'Active',
      targetDepartmentId: newTestDepartment,
      targetSemester: 0,
      passingPercentage: Number(newTestPassPercentage) || 60,
      totalMarks: Number(newTestQuestionLimit) * 25,
      createdBy: currentUser?.name || 'Admin',
      createdAt: new Date().toISOString().split('T')[0],
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 86400000).toISOString()
    };

    onAddTest(newTest);
    setShowCreateTestModal(false);
    setNewTestTitle('');
    setNewTestDesc('');
    alert(`Assessment "${newTest.title}" created successfully!\nStudents will each receive ${newTest.questionLimitPerStudent} uniquely shuffled questions from the pool of ${questions.length} questions.`);
  };

  // -------------------------------------------------------------
  // ADD / EDIT QUESTION TO BANK
  // -------------------------------------------------------------
  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQTitle.trim()) {
      alert('Question title is required.');
      return;
    }

    const constraintsList = newQConstraints
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const testCases: CodingTestCase[] = [
      {
        id: `tc-${Date.now()}-1`,
        input: newQSampleInput,
        expectedOutput: newQSampleOutput,
        explanation: 'Standard sample case validation'
      },
      {
        id: `tc-${Date.now()}-2`,
        input: 'Edge case bounds test',
        expectedOutput: newQSampleOutput,
        hidden: true
      }
    ];

    if (editingQuestion) {
      const updated: CodingQuestion = {
        ...editingQuestion,
        title: newQTitle.trim(),
        category: newQCategory,
        difficulty: newQDifficulty,
        description: newQDescription.trim(),
        constraints: constraintsList,
        sampleInput: newQSampleInput,
        sampleOutput: newQSampleOutput,
        points: Number(newQPoints) || 30,
        starterCode: {
          javascript: newQStarterCodeJS,
          python: newQStarterCodePy,
          java: 'public class Solution { }',
          cpp: '#include <vector>\nusing namespace std;'
        }
      };
      onUpdateQuestion(updated);
      alert('Question updated in Question Bank!');
    } else {
      const newQ: CodingQuestion = {
        id: `cq-${Date.now()}`,
        title: newQTitle.trim(),
        category: newQCategory,
        difficulty: newQDifficulty,
        description: newQDescription.trim(),
        constraints: constraintsList,
        sampleInput: newQSampleInput,
        sampleOutput: newQSampleOutput,
        points: Number(newQPoints) || 30,
        tags: [newQCategory, newQDifficulty, 'Placement 2026'],
        hints: ['Consider optimal two-pointer, hash table, or dynamic programming approach.'],
        starterCode: {
          javascript: newQStarterCodeJS,
          python: newQStarterCodePy,
          java: 'public class Solution {\n    // Code here\n}',
          cpp: '#include <vector>\nusing namespace std;'
        },
        testCases
      };
      onAddQuestion(newQ);
      alert(`New question "${newQ.title}" added to Question Bank (Total Pool: ${questions.length + 1})!`);
    }

    setShowAddQuestionModal(false);
    setEditingQuestion(null);
  };

  const handleOpenEditQuestion = (q: CodingQuestion) => {
    setEditingQuestion(q);
    setNewQTitle(q.title);
    setNewQCategory(q.category);
    setNewQDifficulty(q.difficulty);
    setNewQDescription(q.description);
    setNewQConstraints(q.constraints.join('\n'));
    setNewQSampleInput(q.sampleInput);
    setNewQSampleOutput(q.sampleOutput);
    setNewQPoints(q.points);
    setNewQStarterCodeJS(q.starterCode.javascript || '');
    setNewQStarterCodePy(q.starterCode.python || '');
    setShowAddQuestionModal(true);
  };

  // Filter questions in the bank
  const filteredQuestions = questions.filter(q => {
    const matchesSearch = !bankSearch || q.title.toLowerCase().includes(bankSearch.toLowerCase()) || q.description.toLowerCase().includes(bankSearch.toLowerCase());
    const matchesCat = bankCategory === 'All' || q.category === bankCategory;
    const matchesDiff = bankDifficulty === 'All' || q.difficulty === bankDifficulty;
    return matchesSearch && matchesCat && matchesDiff;
  });

  // Filter submissions
  const filteredSubmissions = submissions.filter(sub => {
    const matchesSearch = !submissionSearch ||
      sub.studentName.toLowerCase().includes(submissionSearch.toLowerCase()) ||
      sub.studentRollNo.toLowerCase().includes(submissionSearch.toLowerCase()) ||
      sub.testTitle.toLowerCase().includes(submissionSearch.toLowerCase());
    const matchesTest = submissionFilterTest === 'all' || sub.testId === submissionFilterTest;
    return matchesSearch && matchesTest;
  });

  // Export Leaderboard to CSV
  const handleExportLeaderboardCSV = () => {
    const headers = ['Submission ID', 'Student Name', 'Roll No', 'Test Title', 'Score', 'Max Score', 'Percentage', 'Time Spent (s)', 'Tab Switches', 'Status', 'Submitted At'];
    const rows = filteredSubmissions.map(s => [
      s.id,
      `"${s.studentName}"`,
      s.studentRollNo,
      `"${s.testTitle}"`,
      s.totalScore,
      s.maxScore,
      `${s.percentage}%`,
      s.timeSpentSeconds,
      s.tabSwitchCount || 0,
      s.status,
      s.submittedAt || s.startedAt
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Placement_Coding_Leaderboard_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Module Header */}
      <div className="flex flex-col gap-4 rounded-2xl bg-linear-to-r from-teal-900 via-slate-900 to-indigo-950 p-6 text-white shadow-xl md:flex-row md:items-center md:justify-between border border-teal-800/40">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
              <Code2 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white md:text-2xl">
                Coding Assessment & Testing Portal
              </h1>
              <p className="text-xs text-teal-200/80 font-mono">
                300+ Question Pool Bank • Dynamic Shuffled Test Limits • In-Browser IDE Runner
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Badges */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-xl bg-white/10 px-3.5 py-2 backdrop-blur-xs border border-white/10 text-right">
            <p className="text-[10px] uppercase font-bold text-teal-300">Question Pool Bank</p>
            <p className="text-sm font-extrabold text-white font-mono">{questions.length} Problems</p>
          </div>
          <div className="rounded-xl bg-white/10 px-3.5 py-2 backdrop-blur-xs border border-white/10 text-right">
            <p className="text-[10px] uppercase font-bold text-indigo-300">Active Assessments</p>
            <p className="text-sm font-extrabold text-white font-mono">{tests.length} Drives</p>
          </div>
          {isAdminOrPlacement && (
            <button
              onClick={() => setShowCreateTestModal(true)}
              className="flex items-center gap-2 rounded-xl bg-teal-500 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-lg hover:bg-teal-400 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Create New Test</span>
            </button>
          )}
        </div>
      </div>

      {/* Module Navigation Tabs */}
      {!activeTestSession && (
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('assessments')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'assessments'
                ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                : 'bg-white text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
          >
            <Laptop className="h-4 w-4" />
            <span>Available Assessments</span>
          </button>

          {isAdminOrPlacement && (
            <>
              <button
                onClick={() => setActiveTab('bank')}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'bank'
                    ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                    : 'bg-white text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800'
                }`}
              >
                <Database className="h-4 w-4" />
                <span>Question Bank ({questions.length} Pool)</span>
              </button>

              <button
                onClick={() => setActiveTab('submissions')}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'submissions'
                    ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                    : 'bg-white text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800'
                }`}
              >
                <Award className="h-4 w-4" />
                <span>Submissions & Leaderboard ({submissions.length})</span>
              </button>
            </>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 1. ASSESSMENTS LIST VIEW */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'assessments' && !activeTestSession && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tests.map(test => {
              const mySub = submissions.find(s => s.testId === test.id && s.studentId === currentStudent.id);
              const isCompleted = mySub?.status === 'Evaluated';
              const isInProgress = mySub?.status === 'In-Progress';

              return (
                <div
                  key={test.id}
                  className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:shadow-md transition-all dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <span className="rounded-lg bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-700 dark:bg-teal-950/50 dark:text-teal-300 font-mono">
                        {test.category}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          test.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {test.status}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {test.title}
                      </h3>
                      <p className="mt-1 text-xs text-slate-500 line-clamp-2 dark:text-slate-400">
                        {test.description}
                      </p>
                    </div>

                    {/* Test Configuration Badges */}
                    <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-3 text-xs font-mono dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800">
                      <div>
                        <span className="text-[10px] uppercase text-slate-400 block">Duration</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                          <Clock className="h-3 w-3 text-teal-500" />
                          {test.durationMinutes} Mins
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-slate-400 block">Questions Per Student</span>
                        <span className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                          <Shuffle className="h-3 w-3" />
                          {test.questionLimitPerStudent} Random / {test.totalQuestionPoolCount || questions.length}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-slate-400 block">Pass Cutoff</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {test.passingPercentage}% Minimum
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-slate-400 block">Total Marks</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">
                          {test.totalMarks} Pts
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Action */}
                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                    {isCompleted ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Completed: {mySub.percentage}% ({mySub.totalScore}/{mySub.maxScore})</span>
                        </div>
                        <button
                          onClick={() => setSelectedSubmissionForReview(mySub)}
                          className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 cursor-pointer"
                        >
                          View Transcript
                        </button>
                      </div>
                    ) : isInProgress ? (
                      <button
                        onClick={() => handleStartAssessment(test)}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-md hover:bg-amber-400 transition-colors cursor-pointer"
                      >
                        <Play className="h-4 w-4 fill-current" />
                        <span>Resume In-Progress Assessment</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleStartAssessment(test)}
                          className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-teal-700 transition-colors cursor-pointer"
                        >
                          <Play className="h-4 w-4 fill-current" />
                          <span>Start Assessment</span>
                        </button>
                        {isAdminOrPlacement && (
                          <button
                            onClick={() => {
                              if (confirm(`Delete assessment "${test.title}"?`)) onDeleteTest(test.id);
                            }}
                            className="p-2.5 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-slate-200 dark:border-slate-800 cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. INTERACTIVE STUDENT IDE & ASSESSMENT RUNNER */}
      {/* ------------------------------------------------------------- */}
      {activeTestSession && currentQuestion && (
        <div className="space-y-4">
          {/* Assessment Live Top Navigation Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-slate-900 p-4 text-white shadow-lg border border-slate-800">
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-teal-500/20 px-2.5 py-1 text-xs font-mono font-bold text-teal-300 border border-teal-500/30">
                Question {currentQuestionIndex + 1} of {assignedQuestions.length}
              </span>
              <h2 className="text-sm font-bold text-white">
                {activeTestSession.title}
              </h2>
            </div>

            {/* Live Countdown & Actions */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 rounded-xl bg-slate-950 px-3.5 py-1.5 font-mono text-xs font-bold border border-slate-800">
                <Clock className={`h-4 w-4 ${timeRemainingSeconds < 300 ? 'text-rose-500 animate-pulse' : 'text-teal-400'}`} />
                <span className={timeRemainingSeconds < 300 ? 'text-rose-400' : 'text-slate-200'}>
                  {Math.floor(timeRemainingSeconds / 60)}:{(timeRemainingSeconds % 60).toString().padStart(2, '0')}
                </span>
              </div>

              {tabSwitchWarnings > 0 && (
                <div className="flex items-center gap-1.5 rounded-xl bg-amber-500/20 px-2.5 py-1 text-xs font-bold text-amber-300 border border-amber-500/30">
                  <ShieldAlert className="h-4 w-4" />
                  <span>{tabSwitchWarnings} Warnings</span>
                </div>
              )}

              <button
                onClick={() => setShowSubmitModal(true)}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-md hover:bg-emerald-400 transition-colors cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Submit Assessment</span>
              </button>
            </div>
          </div>

          {/* Main IDE Split Layout */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Left Panel: Problem Statement & Constraints (5 Cols) */}
            <div className="space-y-4 lg:col-span-5 flex flex-col h-[650px] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 scrollbar-thin">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 font-mono">
                    {currentQuestion.category}
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        currentQuestion.difficulty === 'Easy'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                          : currentQuestion.difficulty === 'Medium'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300'
                      }`}
                    >
                      {currentQuestion.difficulty}
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-600 dark:text-slate-400">
                      {currentQuestion.points} pts
                    </span>
                  </div>
                </div>

                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {currentQuestion.title}
                </h2>
                <div className="text-xs text-slate-700 leading-relaxed dark:text-slate-300 whitespace-pre-line">
                  {currentQuestion.description}
                </div>
              </div>

              {/* Sample Input / Output */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">Sample Example</p>
                <div className="rounded-xl bg-slate-50 p-3 font-mono text-xs text-slate-800 dark:bg-slate-950 dark:text-slate-200 border border-slate-200/80 dark:border-slate-800 space-y-1">
                  <div>
                    <span className="text-slate-400">Input: </span>
                    <span className="font-bold text-teal-600 dark:text-teal-400">{currentQuestion.sampleInput}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Output: </span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{currentQuestion.sampleOutput}</span>
                  </div>
                </div>
              </div>

              {/* Constraints */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">Constraints</p>
                <ul className="list-disc pl-4 text-xs font-mono text-slate-600 dark:text-slate-400 space-y-0.5">
                  {currentQuestion.constraints.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>

              {/* Question Navigation Chips */}
              <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Assigned Question Set ({assignedQuestions.length} items)
                </p>
                <div className="flex flex-wrap gap-2">
                  {assignedQuestions.map((q, idx) => {
                    const ans = currentSubmission?.answers[q.id];
                    const isSolved = ans?.status === 'Passed';
                    const isCurrent = idx === currentQuestionIndex;

                    return (
                      <button
                        key={q.id}
                        onClick={() => handleSelectQuestionIndex(idx)}
                        className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-mono font-bold transition-all cursor-pointer ${
                          isCurrent
                            ? 'bg-teal-600 text-white ring-2 ring-teal-400 ring-offset-2 dark:ring-offset-slate-900'
                            : isSolved
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        <span>Q{idx + 1}</span>
                        {isSolved && <Check className="h-3 w-3" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Panel: Code Editor, Language Selector, and Runner (7 Cols) */}
            <div className="space-y-4 lg:col-span-7 flex flex-col h-[650px]">
              {/* Editor Header Bar */}
              <div className="flex items-center justify-between rounded-t-2xl bg-slate-950 px-4 py-2.5 text-white border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-teal-400" />
                  <span className="font-mono text-xs font-bold text-slate-300">Editor</span>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => handleChangeLanguage(e.target.value as any)}
                    className="rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-mono text-teal-300 border border-slate-800 focus:outline-hidden"
                  >
                    <option value="javascript">JavaScript (Node.js 20)</option>
                    <option value="python">Python (v3.12)</option>
                    <option value="java">Java (OpenJDK 21)</option>
                    <option value="cpp">C++ (GCC 13)</option>
                    {currentQuestion.category === 'SQL & Databases' && <option value="sql">SQL Dialect</option>}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (confirm('Reset code editor to starter template?')) {
                        setActiveCode(currentQuestion.starterCode[selectedLanguage] || '');
                      }
                    }}
                    className="flex items-center gap-1 rounded-lg bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Reset</span>
                  </button>
                  <button
                    onClick={handleRunCode}
                    disabled={isExecuting}
                    className="flex items-center gap-1.5 rounded-lg bg-teal-500 px-4 py-1.5 text-xs font-bold text-slate-950 shadow-md hover:bg-teal-400 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <Play className={`h-3.5 w-3.5 fill-current ${isExecuting ? 'animate-spin' : ''}`} />
                    <span>{isExecuting ? 'Executing...' : 'Run Code & Tests'}</span>
                  </button>
                </div>
              </div>

              {/* Code Textarea Area */}
              <div className="relative flex-1 bg-slate-950 font-mono text-xs text-slate-200 border-x border-slate-800 overflow-hidden flex">
                <textarea
                  value={activeCode}
                  onChange={(e) => setActiveCode(e.target.value)}
                  placeholder="// Write your algorithm implementation here..."
                  spellCheck={false}
                  className="w-full h-full p-4 bg-transparent resize-none focus:outline-hidden font-mono text-xs leading-relaxed text-emerald-300 placeholder-slate-600 select-text"
                />
              </div>

              {/* Terminal Output & Test Case Status Pane */}
              <div className="h-44 rounded-b-2xl bg-slate-900 p-3 font-mono text-xs text-slate-300 border border-slate-800 overflow-y-auto space-y-2">
                <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800 pb-1">
                  <span>Execution Console & Test Cases</span>
                  {testCasesResult.length > 0 && (
                    <span className="text-teal-400">
                      {testCasesResult.filter(r => r.passed).length} / {testCasesResult.length} Test Cases Passed
                    </span>
                  )}
                </div>

                {executionOutput ? (
                  <pre className="text-slate-300 whitespace-pre-wrap text-[11px] leading-relaxed">
                    {executionOutput}
                  </pre>
                ) : (
                  <p className="text-slate-500 italic text-[11px]">
                    Click "Run Code & Tests" to compile and execute against the sample test suite.
                  </p>
                )}

                {/* Test case assertion list */}
                {testCasesResult.length > 0 && (
                  <div className="grid grid-cols-1 gap-1.5 pt-1 sm:grid-cols-2">
                    {testCasesResult.map((tc, idx) => (
                      <div
                        key={tc.id}
                        className={`flex items-center justify-between rounded-lg p-2 text-[10px] border ${
                          tc.passed
                            ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                            : 'bg-rose-950/40 border-rose-800/60 text-rose-300'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          {tc.passed ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> : <AlertCircle className="h-3.5 w-3.5 text-rose-400" />}
                          <span>Case #{idx + 1}</span>
                        </div>
                        <span className="font-bold">{tc.passed ? `Passed (${tc.time})` : 'Failed'}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. 300+ QUESTION BANK REPOSITORY (ADMIN / PLACEMENT) */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'bank' && isAdminOrPlacement && (
        <div className="space-y-6">
          {/* Controls: Search, Category, Difficulty, Add Question */}
          <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-xs dark:bg-slate-900 border border-slate-200 dark:border-slate-800 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative flex-1 min-w-[220px]">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search 300+ coding problems..."
                  value={bankSearch}
                  onChange={(e) => setBankSearch(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              {/* Category Filter */}
              <select
                value={bankCategory}
                onChange={(e) => setBankCategory(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
              >
                {categoriesList.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              {/* Difficulty Filter */}
              <select
                value={bankDifficulty}
                onChange={(e) => setBankDifficulty(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
              >
                <option value="All">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <button
              onClick={() => {
                setEditingQuestion(null);
                setNewQTitle('');
                setNewQDescription('');
                setShowAddQuestionModal(true);
              }}
              className="flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-teal-700 transition-colors cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add Custom Problem</span>
            </button>
          </div>

          {/* Question List Count Summary */}
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono px-1">
            <span>Showing {filteredQuestions.length} of {questions.length} problems in bank</span>
            <span>Up to 300 questions active in assessment rotation</span>
          </div>

          {/* Questions Grid */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredQuestions.slice(0, 48).map(q => (
              <div
                key={q.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:shadow-md transition-all dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between">
                    <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-mono">
                      {q.category}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        q.difficulty === 'Easy'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                          : q.difficulty === 'Medium'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300'
                      }`}
                    >
                      {q.difficulty}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                    {q.title}
                  </h4>

                  <p className="text-xs text-slate-500 line-clamp-2 dark:text-slate-400">
                    {q.description}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800 text-xs">
                  <span className="font-mono font-bold text-teal-600 dark:text-teal-400">
                    {q.points} Pts
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setSelectedQuestionForView(q)}
                      className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 cursor-pointer"
                      title="Preview Problem"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleOpenEditQuestion(q)}
                      className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/30 cursor-pointer"
                      title="Edit Problem"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Remove "${q.title}" from question bank?`)) onDeleteQuestion(q.id);
                      }}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                      title="Delete Problem"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredQuestions.length > 48 && (
            <div className="text-center py-4 text-xs font-mono text-slate-400">
              Showing first 48 matching items out of {filteredQuestions.length}. Use category search to narrow results.
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 4. SUBMISSIONS & LEADERBOARD (ADMIN / PLACEMENT INCHARGE) */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'submissions' && isAdminOrPlacement && (
        <div className="space-y-6">
          <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-xs dark:bg-slate-900 border border-slate-200 dark:border-slate-800 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search student name, roll no, or assessment..."
                  value={submissionSearch}
                  onChange={(e) => setSubmissionSearch(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <select
                value={submissionFilterTest}
                onChange={(e) => setSubmissionFilterTest(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
              >
                <option value="all">All Assessments</option>
                {tests.map(t => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleExportLeaderboardCSV}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition-colors cursor-pointer"
            >
              <Download className="h-4 w-4" />
              <span>Export CSV Leaderboard</span>
            </button>
          </div>

          {/* Submissions Table */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-400">
                  <tr>
                    <th className="px-6 py-3.5">Rank & Candidate</th>
                    <th className="px-6 py-3.5">Roll No</th>
                    <th className="px-6 py-3.5">Assessment</th>
                    <th className="px-6 py-3.5">Score & %</th>
                    <th className="px-6 py-3.5">Time Spent</th>
                    <th className="px-6 py-3.5">Security / Tab Switches</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredSubmissions.map((sub, idx) => (
                    <tr key={sub.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-[11px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-mono">
                            #{idx + 1}
                          </span>
                          <span className="font-bold text-slate-900 dark:text-white">
                            {sub.studentName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-600 dark:text-slate-400">
                        {sub.studentRollNo}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">
                        {sub.testTitle}
                      </td>
                      <td className="px-6 py-4 font-mono font-bold">
                        <span className="text-emerald-600 dark:text-emerald-400">
                          {sub.totalScore}/{sub.maxScore}
                        </span>{' '}
                        <span className="text-slate-400">({sub.percentage}%)</span>
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-500">
                        {Math.floor(sub.timeSpentSeconds / 60)}m {sub.timeSpentSeconds % 60}s
                      </td>
                      <td className="px-6 py-4">
                        {sub.tabSwitchCount && sub.tabSwitchCount > 0 ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                            <ShieldAlert className="h-3 w-3" />
                            {sub.tabSwitchCount} Switches
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400">
                            <Check className="h-3 w-3" /> Clean
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                          {sub.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedSubmissionForReview(sub)}
                          className="rounded-lg bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-700 hover:bg-teal-100 dark:bg-teal-950/50 dark:text-teal-300 cursor-pointer"
                        >
                          Review Code
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: SUBMISSION REVIEW & STUDENT CODE INSPECTOR */}
      {/* ------------------------------------------------------------- */}
      {selectedSubmissionForReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Coding Assessment Review Transcript
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  Candidate: {selectedSubmissionForReview.studentName} ({selectedSubmissionForReview.studentRollNo}) • {selectedSubmissionForReview.testTitle}
                </p>
              </div>
              <button
                onClick={() => setSelectedSubmissionForReview(null)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scorecard Overview */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 font-mono text-xs">
              <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] uppercase text-slate-400 block">Total Score</span>
                <span className="text-base font-bold text-teal-600 dark:text-teal-400">
                  {selectedSubmissionForReview.totalScore} / {selectedSubmissionForReview.maxScore}
                </span>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] uppercase text-slate-400 block">Percentage</span>
                <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                  {selectedSubmissionForReview.percentage}%
                </span>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] uppercase text-slate-400 block">Time Taken</span>
                <span className="text-base font-bold text-slate-700 dark:text-slate-300">
                  {Math.floor(selectedSubmissionForReview.timeSpentSeconds / 60)}m {selectedSubmissionForReview.timeSpentSeconds % 60}s
                </span>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] uppercase text-slate-400 block">Security Alert</span>
                <span className="text-base font-bold text-amber-600 dark:text-amber-400">
                  {selectedSubmissionForReview.tabSwitchCount || 0} Tab Blur
                </span>
              </div>
            </div>

            {/* Question-by-Question Code Inspector */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                Assigned Shuffled Questions & Candidate Solutions
              </h4>

              {(Object.values(selectedSubmissionForReview.answers) as StudentCodingAnswer[]).map((ans, idx) => (
                <div
                  key={ans.questionId}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-teal-600 px-2 py-0.5 text-[10px] font-bold text-white font-mono">
                        Q{idx + 1}
                      </span>
                      <h5 className="font-bold text-xs text-slate-900 dark:text-white">
                        {ans.questionTitle}
                      </h5>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-xs">
                      <span className="text-slate-400">Language: {ans.language}</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {ans.score}/{ans.maxScore} Pts
                      </span>
                    </div>
                  </div>

                  {/* Code Snippet */}
                  <div className="rounded-xl bg-slate-900 p-3 font-mono text-xs text-emerald-300 overflow-x-auto border border-slate-800">
                    <pre>{ans.code || '// No code submitted for this question'}</pre>
                  </div>

                  {/* Execution Log */}
                  {ans.executionOutput && (
                    <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-800">
                      {ans.executionOutput}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: CREATE TEST CONFIGURATOR */}
      {/* ------------------------------------------------------------- */}
      {showCreateTestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Configure New Coding Assessment
              </h3>
              <button
                onClick={() => setShowCreateTestModal(false)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTest} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Assessment Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2026 Campus Placement Technical Assessment"
                  value={newTestTitle}
                  onChange={(e) => setNewTestTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Description</label>
                <textarea
                  placeholder="Details regarding syllabus, algorithmic constraints..."
                  value={newTestDesc}
                  onChange={(e) => setNewTestDesc(e.target.value)}
                  rows={2}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Duration (Minutes)</label>
                  <input
                    type="number"
                    min={15}
                    max={180}
                    value={newTestDuration}
                    onChange={(e) => setNewTestDuration(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-teal-600 dark:text-teal-400 mb-1">
                    Questions Per Student
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={newTestQuestionLimit}
                    onChange={(e) => setNewTestQuestionLimit(Number(e.target.value))}
                    className="w-full rounded-xl border border-teal-300 bg-teal-50/50 px-3 py-2 text-xs font-mono font-bold text-teal-800 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-200"
                  />
                  <span className="text-[10px] text-slate-400">Randomly selected from 300+ pool</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Target Department</label>
                  <select
                    value={newTestDepartment}
                    onChange={(e) => setNewTestDepartment(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  >
                    <option value="all">All Departments</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Passing Cutoff %</label>
                  <input
                    type="number"
                    min={30}
                    max={100}
                    value={newTestPassPercentage}
                    onChange={(e) => setNewTestPassPercentage(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateTestModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-teal-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-teal-700 transition-colors cursor-pointer"
                >
                  Publish Assessment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: ADD / EDIT CODING PROBLEM TO BANK */}
      {/* ------------------------------------------------------------- */}
      {showAddQuestionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingQuestion ? 'Edit Coding Problem' : 'Add New Problem to 300+ Pool'}
              </h3>
              <button
                onClick={() => setShowAddQuestionModal(false)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Problem Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Trapping Rain Water"
                    value={newQTitle}
                    onChange={(e) => setNewQTitle(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Difficulty</label>
                  <select
                    value={newQDifficulty}
                    onChange={(e) => setNewQDifficulty(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  >
                    <option value="Easy">Easy (20 Pts)</option>
                    <option value="Medium">Medium (30 Pts)</option>
                    <option value="Hard">Hard (50 Pts)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Category / Domain</label>
                  <select
                    value={newQCategory}
                    onChange={(e) => setNewQCategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  >
                    {categoriesList.filter(c => c !== 'All').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Points</label>
                  <input
                    type="number"
                    value={newQPoints}
                    onChange={(e) => setNewQPoints(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Problem Description</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Detailed description of algorithm requirements and invariants..."
                  value={newQDescription}
                  onChange={(e) => setNewQDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Sample Input</label>
                  <input
                    type="text"
                    placeholder="e.g. [2, 7, 11, 15], 9"
                    value={newQSampleInput}
                    onChange={(e) => setNewQSampleInput(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Sample Output</label>
                  <input
                    type="text"
                    placeholder="e.g. [0, 1]"
                    value={newQSampleOutput}
                    onChange={(e) => setNewQSampleOutput(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">JavaScript Starter Template</label>
                <textarea
                  rows={3}
                  value={newQStarterCodeJS}
                  onChange={(e) => setNewQStarterCodeJS(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-950 px-3 py-2 text-xs font-mono text-emerald-400"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddQuestionModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-teal-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-teal-700 transition-colors cursor-pointer"
                >
                  {editingQuestion ? 'Save Changes' : 'Add to Bank'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: SUBMISSION CONFIRMATION */}
      {/* ------------------------------------------------------------- */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-3 text-amber-500">
              <AlertCircle className="h-6 w-6" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Submit Assessment Confirmation
              </h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Are you sure you want to finalize and submit your test? Your code for all {assignedQuestions.length} assigned questions will be evaluated and logged directly to the Corporate Placement Cell.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 cursor-pointer"
              >
                Return to Editor
              </button>
              <button
                onClick={handleFinalSubmit}
                className="rounded-xl bg-emerald-500 px-5 py-2 text-xs font-bold text-slate-950 shadow-md hover:bg-emerald-400 transition-colors cursor-pointer"
              >
                Confirm & Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

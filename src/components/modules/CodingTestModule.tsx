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
  Database,
  Maximize2,
  Minimize2,
  Printer,
  FileDown,
  ListChecks,
  CheckSquare,
  Square,
  FileSpreadsheet,
  Building,
  GraduationCap
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
import { evaluateSolution, SingleTestCaseResult } from '../../utils/codeEvaluator';

export interface EditableCustomTestCase {
  id: string;
  input: string;
  expectedOutput: string;
  hidden: boolean;
  explanation: string;
}

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
  onTestSessionChange?: (isActive: boolean) => void;
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
  onSubmitTest,
  onTestSessionChange
}: CodingTestModuleProps) {
  const isStudent = role === 'Student';
  const isAdminOrPlacement = role === 'Admin' || role === 'Placement' || role === 'Faculty';

  const [activeTab, setActiveTab] = useState<'assessments' | 'ide' | 'bank' | 'submissions'>('assessments');

  // Current active assessment taking session (for candidate)
  const [activeTestSession, setActiveTestSession] = useState<CodingTest | null>(null);
  const [currentSubmission, setCurrentSubmission] = useState<CodingTestSubmission | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedLanguage, setSelectedLanguage] = useState<'javascript' | 'python' | 'java' | 'cpp' | 'sql'>('javascript');
  const [activeCode, setActiveCode] = useState<string>('');
  const [executionOutput, setExecutionOutput] = useState<string>('');
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [testCasesResult, setTestCasesResult] = useState<SingleTestCaseResult[]>([]);
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number>(0);
  const [tabSwitchWarnings, setTabSwitchWarnings] = useState<number>(0);
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);
  const [isFullscreenActive, setIsFullscreenActive] = useState<boolean>(false);

  // Synchronize test session state with parent App (to completely hide left sidebar & navbar until test is submitted)
  useEffect(() => {
    if (onTestSessionChange) {
      onTestSessionChange(Boolean(activeTestSession));
    }
  }, [activeTestSession, onTestSessionChange]);

  // Fullscreen Helpers
  const enterFullscreen = () => {
    try {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        elem.requestFullscreen().catch(() => {});
      }
    } catch (e) {}
  };

  const exitFullscreen = () => {
    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    } catch (e) {}
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreenActive(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Question Bank Filter & Search States
  const [bankSearch, setBankSearch] = useState<string>('');
  const [bankCategory, setBankCategory] = useState<string>('All');
  const [bankDifficulty, setBankDifficulty] = useState<string>('All');
  const [selectedQuestionForView, setSelectedQuestionForView] = useState<CodingQuestion | null>(null);
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
  const [newTestQuestionMode, setNewTestQuestionMode] = useState<'random_pool' | 'custom_selection'>('random_pool');
  const [selectedCustomQuestionIds, setSelectedCustomQuestionIds] = useState<string[]>([]);
  const [customQuestionSearchInModal, setCustomQuestionSearchInModal] = useState<string>('');
  const [customQuestionCategoryInModal, setCustomQuestionCategoryInModal] = useState<string>('All');

  // Submissions Leaderboard Review Modal & Scorecard Print
  const [selectedSubmissionForReview, setSelectedSubmissionForReview] = useState<CodingTestSubmission | null>(null);
  const [selectedSubmissionForPrintScorecard, setSelectedSubmissionForPrintScorecard] = useState<CodingTestSubmission | null>(null);
  const [submissionSearch, setSubmissionSearch] = useState<string>('');
  const [submissionFilterTest, setSubmissionFilterTest] = useState<string>('all');

  // Custom Question Modal State (Used for both Giving New Questions & Editing Existing Questions)
  const [showGiveCustomQuestionModal, setShowGiveCustomQuestionModal] = useState<boolean>(false);
  const [customQTitle, setCustomQTitle] = useState<string>('');
  const [customQCategory, setCustomQCategory] = useState<string>('Algorithms');
  const [customQDifficulty, setCustomQDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [customQPoints, setCustomQPoints] = useState<number>(30);
  const [customQDescription, setCustomQDescription] = useState<string>('');
  const [customQConstraints, setCustomQConstraints] = useState<string>('1 <= nums.length <= 10^5\n-10^9 <= nums[i] <= 10^9\nTime Limit: 1.0s, Memory: 256MB');
  const [customQSampleInput, setCustomQSampleInput] = useState<string>('nums = [2, 7, 11, 15], target = 9');
  const [customQSampleOutput, setCustomQSampleOutput] = useState<string>('[0, 1]');
  const [customAssessmentDuration, setCustomAssessmentDuration] = useState<number>(45);
  const [customSelectedLangTab, setCustomSelectedLangTab] = useState<'javascript' | 'python' | 'java' | 'cpp' | 'sql'>('javascript');
  const [customQStarterJS, setCustomQStarterJS] = useState<string>('function solve(input) {\n  // Write your algorithm solution here:\n  \n  return input;\n}');
  const [customQStarterPy, setCustomQStarterPy] = useState<string>('def solve(input_data):\n    # Write your solution here:\n    return input_data');
  const [customQStarterJava, setCustomQStarterJava] = useState<string>('public class Solution {\n    public static Object solve(Object input) {\n        // Write solution here\n        return input;\n    }\n}');
  const [customQStarterCpp, setCustomQStarterCpp] = useState<string>('#include <iostream>\n#include <vector>\nusing namespace std;\n\nint solve(int input) {\n    // Write solution here\n    return input;\n}');
  const [customQStarterSql, setCustomQStarterSql] = useState<string>('-- SQL Solution\nSELECT id, name FROM students WHERE score >= 80;');
  const [customTestCases, setCustomTestCases] = useState<EditableCustomTestCase[]>([
    { id: '1', input: '[2, 7, 11, 15], 9', expectedOutput: '[0, 1]', hidden: false, explanation: 'Sample verification' },
    { id: '2', input: '[3, 2, 4], 6', expectedOutput: '[1, 2]', hidden: false, explanation: 'Edge bounds verification' },
    { id: '3', input: '[3, 3], 6', expectedOutput: '[0, 1]', hidden: true, explanation: 'Hidden boundary test case' }
  ]);

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

  const handleFinalSubmitRef = useRef<() => void>(() => {});

  // Timer countdown for active test session
  useEffect(() => {
    if (!activeTestSession || timeRemainingSeconds <= 0) return;
    const interval = setInterval(() => {
      setTimeRemainingSeconds(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          alert('⏰ Time is up! Your assessment is being automatically submitted.');
          handleFinalSubmitRef.current();
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
  // OPEN EDIT QUESTION MODAL (LOADS EXISTING QUESTION INTO RICH BUILDER)
  // -------------------------------------------------------------
  const handleOpenEditQuestion = (q: CodingQuestion) => {
    setEditingQuestion(q);
    setCustomQTitle(q.title || '');
    setCustomQCategory(q.category || 'Algorithms');
    setCustomQDifficulty(q.difficulty || 'Medium');
    setCustomQPoints(q.points || 30);
    setCustomQDescription(q.description || '');
    setCustomQConstraints((q.constraints || []).join('\n'));
    setCustomQSampleInput(q.sampleInput || '');
    setCustomQSampleOutput(q.sampleOutput || '');
    setCustomQStarterJS(q.starterCode?.javascript || 'function solve(input) {\n  return input;\n}');
    setCustomQStarterPy(q.starterCode?.python || 'def solve(input_data):\n    return input_data');
    setCustomQStarterJava(q.starterCode?.java || 'public class Solution {\n    public static Object solve(Object input) {\n        return input;\n    }\n}');
    setCustomQStarterCpp(q.starterCode?.cpp || '#include <iostream>\nusing namespace std;\nint solve(int input) {\n    return input;\n}');
    setCustomQStarterSql(q.starterCode?.sql || '-- SQL Solution\nSELECT * FROM table;');

    if (q.testCases && q.testCases.length > 0) {
      setCustomTestCases(
        q.testCases.map((tc, idx) => ({
          id: tc.id || String(idx + 1),
          input: tc.input || '',
          expectedOutput: tc.expectedOutput || '',
          hidden: Boolean(tc.hidden),
          explanation: tc.explanation || ''
        }))
      );
    } else {
      setCustomTestCases([
        { id: '1', input: q.sampleInput || '[1, 2, 3]', expectedOutput: q.sampleOutput || '[1, 2, 3]', hidden: false, explanation: 'Sample verification' }
      ]);
    }

    setShowGiveCustomQuestionModal(true);
  };

  // Reset to empty custom question builder
  const handleOpenNewCustomQuestionModal = () => {
    setEditingQuestion(null);
    setCustomQTitle('');
    setCustomQCategory('Algorithms');
    setCustomQDifficulty('Medium');
    setCustomQPoints(30);
    setCustomQDescription('');
    setCustomQConstraints('1 <= nums.length <= 10^5\n-10^9 <= nums[i] <= 10^9\nTime Limit: 1.0s, Memory: 256MB');
    setCustomQSampleInput('[2, 7, 11, 15], 9');
    setCustomQSampleOutput('[0, 1]');
    setCustomAssessmentDuration(45);
    setCustomQStarterJS('function solve(input) {\n  // Write your algorithm solution here:\n  \n  return input;\n}');
    setCustomQStarterPy('def solve(input_data):\n    # Write your solution here:\n    return input_data');
    setCustomQStarterJava('public class Solution {\n    public static Object solve(Object input) {\n        // Write solution here\n        return input;\n    }\n}');
    setCustomQStarterCpp('#include <iostream>\n#include <vector>\nusing namespace std;\n\nint solve(int input) {\n    // Write solution here\n    return input;\n}');
    setCustomQStarterSql('-- SQL Solution\nSELECT id, name FROM students WHERE score >= 80;');
    setCustomTestCases([
      { id: '1', input: '[2, 7, 11, 15], 9', expectedOutput: '[0, 1]', hidden: false, explanation: 'Sample verification' },
      { id: '2', input: '[3, 2, 4], 6', expectedOutput: '[1, 2]', hidden: false, explanation: 'Edge bounds verification' },
      { id: '3', input: '[3, 3], 6', expectedOutput: '[0, 1]', hidden: true, explanation: 'Hidden boundary test case' }
    ]);
    setShowGiveCustomQuestionModal(true);
  };

  // -------------------------------------------------------------
  // START OR RESUME CODING TEST FLOW (WITH SHUFFLING & LIMITS)
  // -------------------------------------------------------------
  const handleStartAssessment = (test: CodingTest) => {
    const existingSub = submissions.find(
      s => s.testId === test.id && s.studentId === currentStudent.id
    );

    if (existingSub && existingSub.status === 'Evaluated') {
      alert('You have already completed and submitted this assessment.');
      return;
    }

    if (existingSub && existingSub.status === 'In-Progress') {
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
      enterFullscreen();
      return;
    }

    // Pick questions from test pool
    const testPool = test.questionPoolIds
      .map(id => questions.find(q => q.id === id))
      .filter(Boolean) as CodingQuestion[];

    const finalPool = testPool.length > 0 ? testPool : questions;

    // Shuffle and pick unique N questions
    const seed = `${currentStudent.id}-${test.id}-${Date.now()}`;
    const selectedQuestions = test.shuffleQuestions
      ? shuffleAndSelectQuestions(finalPool, test.questionLimitPerStudent || 5, seed)
      : finalPool.slice(0, test.questionLimitPerStudent || finalPool.length);

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
    enterFullscreen();
  };

  // Launch instant single-question assessment (for practice or custom question solving)
  const handleLaunchInstantAssessment = (questionToTest: CodingQuestion, durationMinutes: number = 45) => {
    const instantTest: CodingTest = {
      id: `ct-instant-${Date.now()}`,
      title: `IDE Test: ${questionToTest.title}`,
      description: questionToTest.description.slice(0, 100) + '...',
      category: questionToTest.category,
      durationMinutes: durationMinutes,
      totalQuestionPoolCount: 1,
      questionPoolIds: [questionToTest.id],
      questionLimitPerStudent: 1,
      shuffleQuestions: false,
      status: 'Active',
      targetDepartmentId: 'all',
      targetSemester: 0,
      passingPercentage: 60,
      totalMarks: questionToTest.points,
      createdBy: currentUser?.name || 'User',
      createdAt: new Date().toISOString().split('T')[0],
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 86400000).toISOString()
    };

    const initialAnswers: Record<string, StudentCodingAnswer> = {
      [questionToTest.id]: {
        questionId: questionToTest.id,
        questionTitle: questionToTest.title,
        language: 'javascript',
        code: questionToTest.starterCode.javascript || '',
        testCasesPassed: 0,
        totalTestCases: questionToTest.testCases.length,
        score: 0,
        maxScore: questionToTest.points,
        status: 'Unattempted'
      }
    };

    const newSub: CodingTestSubmission = {
      id: `sub-instant-${Date.now()}`,
      testId: instantTest.id,
      testTitle: instantTest.title,
      studentId: currentStudent.id,
      studentUserId: currentUser?.id || 'u-user',
      studentName: currentUser?.name || 'Candidate',
      studentRollNo: currentStudent.rollNo || '2026-CAND',
      departmentId: currentStudent.departmentId || 'dept-5',
      assignedQuestionIds: [questionToTest.id],
      answers: initialAnswers,
      totalScore: 0,
      maxScore: questionToTest.points,
      percentage: 0,
      status: 'In-Progress',
      startedAt: new Date().toISOString(),
      timeSpentSeconds: 0,
      tabSwitchCount: 0
    };

    setActiveTestSession(instantTest);
    setCurrentSubmission(newSub);
    setCurrentQuestionIndex(0);
    setTimeRemainingSeconds(durationMinutes * 60);
    setActiveCode(questionToTest.starterCode.javascript || '');
    setSelectedLanguage('javascript');
    setExecutionOutput('');
    setTestCasesResult([]);
    setActiveTab('ide');
    enterFullscreen();
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
    const template = currentQuestion.starterCode[lang] || currentQuestion.starterCode.javascript || '';
    setActiveCode(template);
  };

  // Run Code & Evaluate against test suite
  const handleRunCode = () => {
    if (!currentQuestion || !currentSubmission) return;
    setIsExecuting(true);
    setExecutionOutput('Compiling and executing algorithm against test suite...');

    setTimeout(() => {
      const evalResult = evaluateSolution(activeCode, selectedLanguage, currentQuestion);

      setTestCasesResult(evalResult.results);
      setExecutionOutput(evalResult.outputLog);
      setIsExecuting(false);

      currentSubmission.answers[currentQuestion.id] = {
        questionId: currentQuestion.id,
        questionTitle: currentQuestion.title,
        language: selectedLanguage,
        code: activeCode,
        testCasesPassed: evalResult.passedCount,
        totalTestCases: evalResult.totalCount,
        score: evalResult.earnedScore,
        maxScore: currentQuestion.points,
        status: evalResult.isAllPassed ? 'Passed' : evalResult.passedCount > 0 ? 'Partial' : 'Failed',
        executionOutput: evalResult.outputLog,
        executionTimeMs: evalResult.executionTimeMs,
        lastExecutedAt: new Date().toISOString()
      };
    }, 350);
  };

  // Submit assessment finalization (Hides proctored IDE and restores standard sidebar navigation)
  const handleFinalSubmit = () => {
    if (!currentSubmission || !activeTestSession) return;

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
    exitFullscreen();

    alert(`🎉 Assessment Submitted Successfully!\nYour Score: ${totalScore}/${maxScore} (${percentage}%)\nResults have been recorded to the Placement & Examination Cell.`);
  };

  handleFinalSubmitRef.current = handleFinalSubmit;

  const handleAutoSubmitDueToTime = () => {
    alert('⏰ Time is up! Your assessment is being automatically submitted.');
    handleFinalSubmit();
  };

  // -------------------------------------------------------------
  // CREATE NEW ASSESSMENT (WITH RANDOM POOL OR HAND-PICKED CUSTOM QUESTIONS)
  // -------------------------------------------------------------
  const handleCreateTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTestTitle.trim()) {
      alert('Please enter a test title.');
      return;
    }

    let finalQuestionPoolIds: string[] = [];
    let questionLimit = newTestQuestionLimit;
    let totalMarks = 100;

    if (newTestQuestionMode === 'custom_selection') {
      if (selectedCustomQuestionIds.length === 0) {
        alert('Please select at least 1 custom question from the checklist.');
        return;
      }
      finalQuestionPoolIds = selectedCustomQuestionIds;
      questionLimit = selectedCustomQuestionIds.length;
      totalMarks = selectedCustomQuestionIds.reduce((sum, qId) => {
        const found = questions.find(q => q.id === qId);
        return sum + (found?.points || 20);
      }, 0);
    } else {
      finalQuestionPoolIds = questions.map(q => q.id);
      questionLimit = Math.min(Number(newTestQuestionLimit) || 5, questions.length);
      totalMarks = questionLimit * 25;
    }

    const newTest: CodingTest = {
      id: `ct-${Date.now()}`,
      title: newTestTitle.trim(),
      description: newTestDesc.trim() || 'Comprehensive technical placement assessment.',
      category: newTestCategory,
      durationMinutes: Number(newTestDuration) || 60,
      totalQuestionPoolCount: finalQuestionPoolIds.length,
      questionPoolIds: finalQuestionPoolIds,
      questionLimitPerStudent: questionLimit,
      shuffleQuestions: newTestQuestionMode === 'random_pool',
      status: 'Active',
      targetDepartmentId: newTestDepartment,
      targetSemester: 0,
      passingPercentage: Number(newTestPassPercentage) || 60,
      totalMarks,
      createdBy: currentUser?.name || 'Admin',
      createdAt: new Date().toISOString().split('T')[0],
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 86400000).toISOString()
    };

    onAddTest(newTest);
    setShowCreateTestModal(false);
    setNewTestTitle('');
    setNewTestDesc('');
    setSelectedCustomQuestionIds([]);
    alert(`Assessment "${newTest.title}" published successfully with ${newTest.questionLimitPerStudent} questions (${newTest.totalMarks} Marks)!`);
  };

  // -------------------------------------------------------------
  // BUILD OR UPDATE CUSTOM QUESTION OBJECT
  // -------------------------------------------------------------
  const buildCustomQuestionObject = (): CodingQuestion | null => {
    if (!customQTitle.trim()) {
      alert('Please enter a question title.');
      return null;
    }
    const constraintsList = customQConstraints
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const validTestCases = customTestCases.filter(tc => tc.input.trim() && tc.expectedOutput.trim());
    if (validTestCases.length === 0) {
      alert('Please provide at least 1 valid test case with Input and Expected Output.');
      return null;
    }

    const qId = editingQuestion ? editingQuestion.id : `cq-custom-${Date.now()}`;

    const customQuestionObj: CodingQuestion = {
      id: qId,
      title: customQTitle.trim(),
      category: customQCategory.trim() || 'Algorithms',
      difficulty: customQDifficulty,
      description: customQDescription.trim() || 'Implement the algorithm as described.',
      constraints: constraintsList.length > 0 ? constraintsList : ['Standard time and memory constraints apply.'],
      sampleInput: customQSampleInput || validTestCases[0].input,
      sampleOutput: customQSampleOutput || validTestCases[0].expectedOutput,
      points: Number(customQPoints) || 30,
      tags: [customQCategory, customQDifficulty, 'Custom Question', '2026'],
      hints: editingQuestion?.hints || ['Analyze boundary conditions and optimize asymptotic time complexity.'],
      starterCode: {
        javascript: customQStarterJS || `function solve(input) {\n  // Write implementation\n  return input;\n}`,
        python: customQStarterPy || `def solve(input_data):\n    # Write implementation\n    return input_data`,
        java: customQStarterJava || `public class Solution {\n    public static Object solve(Object input) {\n        return input;\n    }\n}`,
        cpp: customQStarterCpp || `#include <iostream>\nusing namespace std;\n\nint solve(int input) {\n    return input;\n}`,
        sql: customQStarterSql || `-- SQL Query Solution\nSELECT * FROM table;`
      },
      testCases: validTestCases.map((tc, idx) => ({
        id: tc.id || `tc-c-${idx + 1}`,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        hidden: tc.hidden,
        explanation: tc.explanation || `Assertion Case #${idx + 1}`
      }))
    };

    return customQuestionObj;
  };

  // Save changes (Handles both Add new and Edit existing problem)
  const handleSaveCustomQuestionToBank = () => {
    const customQ = buildCustomQuestionObject();
    if (!customQ) return;

    if (editingQuestion) {
      onUpdateQuestion(customQ);
      alert(`Problem "${customQ.title}" updated successfully!`);
    } else {
      onAddQuestion(customQ);
      alert(`Custom Question "${customQ.title}" successfully added to Question Bank (Total Pool: ${questions.length + 1})!`);
    }

    setShowGiveCustomQuestionModal(false);
    setEditingQuestion(null);
  };

  const handleLaunchCustomQuestionAssessment = () => {
    const customQ = buildCustomQuestionObject();
    if (!customQ) return;

    if (editingQuestion) {
      onUpdateQuestion(customQ);
    } else {
      onAddQuestion(customQ);
    }

    setShowGiveCustomQuestionModal(false);
    setEditingQuestion(null);
    handleLaunchInstantAssessment(customQ, Number(customAssessmentDuration) || 45);
  };

  const handleCreateTestWithCustomQuestion = () => {
    const customQ = buildCustomQuestionObject();
    if (!customQ) return;

    if (editingQuestion) {
      onUpdateQuestion(customQ);
    } else {
      onAddQuestion(customQ);
    }

    const newTest: CodingTest = {
      id: `ct-${Date.now()}`,
      title: `Assessment: ${customQ.title}`,
      description: customQ.description.slice(0, 120) + '...',
      category: customQ.category,
      durationMinutes: Number(customAssessmentDuration) || 60,
      totalQuestionPoolCount: 1,
      questionPoolIds: [customQ.id],
      questionLimitPerStudent: 1,
      shuffleQuestions: false,
      status: 'Active',
      targetDepartmentId: 'all',
      targetSemester: 0,
      passingPercentage: 60,
      totalMarks: customQ.points,
      createdBy: currentUser?.name || 'Instructor',
      createdAt: new Date().toISOString().split('T')[0],
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 86400000).toISOString()
    };

    onAddTest(newTest);
    setShowGiveCustomQuestionModal(false);
    setEditingQuestion(null);
    alert(`Assessment "${newTest.title}" published with question and ready for candidates!`);
  };

  // -------------------------------------------------------------
  // MARKS SECURED DOWNLOAD & OFFICIAL TRANSCRIPT EXPORT
  // -------------------------------------------------------------
  const handleExportMarksCSV = () => {
    const listToExport = filteredSubmissions.length > 0 ? filteredSubmissions : submissions;
    if (listToExport.length === 0) {
      alert('No candidate coding assessment submissions found to download.');
      return;
    }

    const headers = [
      'Submission ID',
      'Candidate Name',
      'Roll Number',
      'Department ID',
      'Assessment Title',
      'Questions Attempted',
      'Total Marks Secured',
      'Maximum Total Marks',
      'Percentage (%)',
      'Time Spent (Seconds)',
      'Time Spent (Formatted)',
      'Proctored Tab Switch Violations',
      'Result Status',
      'Started Timestamp',
      'Submitted Timestamp'
    ];

    const rows = listToExport.map(s => {
      const qAttempted = Object.keys(s.answers || {}).length;
      const mins = Math.floor(s.timeSpentSeconds / 60);
      const secs = s.timeSpentSeconds % 60;
      const formattedTime = `${mins}m ${secs}s`;
      return [
        s.id,
        `"${s.studentName.replace(/"/g, '""')}"`,
        `"${s.studentRollNo}"`,
        `"${s.departmentId || 'CS'}"`,
        `"${s.testTitle.replace(/"/g, '""')}"`,
        qAttempted,
        s.totalScore,
        s.maxScore,
        `${s.percentage}%`,
        s.timeSpentSeconds,
        `"${formattedTime}"`,
        s.tabSwitchCount || 0,
        `"${s.status}"`,
        `"${s.startedAt || ''}"`,
        `"${s.submittedAt || s.startedAt || ''}"`
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `University_Placement_Coding_Marks_Secured_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter questions in the bank
  const filteredQuestions = questions.filter(q => {
    const matchesSearch = !bankSearch || q.title.toLowerCase().includes(bankSearch.toLowerCase()) || q.description.toLowerCase().includes(bankSearch.toLowerCase());
    const matchesCat = bankCategory === 'All' || q.category === bankCategory;
    const matchesDiff = bankDifficulty === 'All' || q.difficulty === bankDifficulty;
    return matchesSearch && matchesCat && matchesDiff;
  });

  // Filter questions in modal picker
  const filteredModalQuestions = questions.filter(q => {
    const matchesSearch = !customQuestionSearchInModal || q.title.toLowerCase().includes(customQuestionSearchInModal.toLowerCase());
    const matchesCat = customQuestionCategoryInModal === 'All' || q.category === customQuestionCategoryInModal;
    return matchesSearch && matchesCat;
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
                300+ Question Pool Bank • Custom Questions & Edit Support • Fullscreen IDE
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Badges */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleOpenNewCustomQuestionModal}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-lg hover:from-amber-400 hover:to-orange-400 transition-all cursor-pointer"
            title="Create and test your own custom coding questions"
          >
            <Sparkles className="h-4 w-4 fill-current" />
            <span>Give Custom Question</span>
          </button>

          {isAdminOrPlacement && (
            <>
              <button
                onClick={() => setShowCreateTestModal(true)}
                className="flex items-center gap-2 rounded-xl bg-teal-500 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-lg hover:bg-teal-400 transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Create New Test</span>
              </button>

              <button
                onClick={handleExportMarksCSV}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-500 transition-all cursor-pointer"
                title="Download consolidated candidate marks secured"
              >
                <FileSpreadsheet className="h-4 w-4" />
                <span>Download Marks Secured</span>
              </button>
            </>
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
            <span>Available Assessments ({tests.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('bank')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'bank'
                ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                : 'bg-white text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
          >
            <Database className="h-4 w-4" />
            <span>Question Bank & Practice ({questions.length})</span>
          </button>

          {isAdminOrPlacement && (
            <button
              onClick={() => setActiveTab('submissions')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'submissions'
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                  : 'bg-white text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
            >
              <Award className="h-4 w-4" />
              <span>Submissions & Marks ({submissions.length})</span>
            </button>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 1. ASSESSMENTS LIST VIEW */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'assessments' && !activeTestSession && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 font-mono">
              Live & Scheduled Assessments
            </h3>
            <button
              onClick={handleOpenNewCustomQuestionModal}
              className="flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:text-amber-700 dark:text-amber-400 cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>+ Give Custom Question / Instant Challenge</span>
            </button>
          </div>

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
                        <span className="text-[10px] uppercase text-slate-400 block">Questions Limit</span>
                        <span className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                          <Shuffle className="h-3 w-3" />
                          {test.questionLimitPerStudent} / {test.totalQuestionPoolCount || questions.length}
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
                          <span>Score: {mySub.percentage}% ({mySub.totalScore}/{mySub.maxScore})</span>
                        </div>
                        <button
                          onClick={() => setSelectedSubmissionForReview(mySub)}
                          className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 cursor-pointer"
                        >
                          Transcript
                        </button>
                      </div>
                    ) : isInProgress ? (
                      <button
                        onClick={() => handleStartAssessment(test)}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-md hover:bg-amber-400 transition-colors cursor-pointer"
                      >
                        <Play className="h-4 w-4 fill-current" />
                        <span>Resume Assessment</span>
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
      {/* 2. INTERACTIVE STUDENT IDE & ASSESSMENT RUNNER (FULL SCREEN) */}
      {/* ------------------------------------------------------------- */}
      {activeTestSession && currentQuestion && (
        <div className="fixed inset-0 z-[99999] bg-slate-950 flex flex-col h-screen w-screen overflow-hidden p-3 md:p-5 text-slate-100 animate-in fade-in duration-200">
          {/* Fullscreen warning banner if candidate drops out of browser fullscreen */}
          {!isFullscreenActive && (
            <div className="mb-2.5 flex items-center justify-between rounded-xl bg-amber-500/20 px-4 py-2 text-xs font-semibold text-amber-200 border border-amber-500/30 shrink-0">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-amber-400" />
                <span>⚠️ Placement Exam Fullscreen Required: Please maintain full screen mode during the assessment.</span>
              </div>
              <button
                onClick={enterFullscreen}
                className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1 font-bold text-slate-950 hover:bg-amber-400 transition-colors cursor-pointer text-[11px]"
              >
                <Maximize2 className="h-3 w-3" />
                <span>Enter Fullscreen</span>
              </button>
            </div>
          )}

          {/* Assessment Live Top Navigation Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-900 px-4 py-3 text-white shadow-lg border border-slate-800 shrink-0 mb-3">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 rounded-lg bg-rose-500/20 px-2.5 py-1 text-xs font-mono font-bold text-rose-300 border border-rose-500/30">
                <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                LIVE PROCTORED
              </span>
              <span className="rounded-lg bg-teal-500/20 px-2.5 py-1 text-xs font-mono font-bold text-teal-300 border border-teal-500/30">
                Question {currentQuestionIndex + 1} of {assignedQuestions.length}
              </span>
              <h2 className="text-sm font-bold text-white line-clamp-1">
                {activeTestSession.title}
              </h2>
            </div>

            {/* Live Countdown & Actions */}
            <div className="flex items-center gap-3">
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

              {/* Edit Problem button in IDE */}
              <button
                onClick={() => handleOpenEditQuestion(currentQuestion)}
                className="flex items-center gap-1.5 rounded-xl bg-slate-800 px-3 py-1.5 text-xs font-bold text-amber-300 hover:bg-slate-700 transition-colors border border-slate-700 cursor-pointer"
                title="Edit Problem Statement, Constraints or Test Cases"
              >
                <Edit className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Edit Problem</span>
              </button>

              <button
                onClick={() => {
                  if (isFullscreenActive) exitFullscreen();
                  else enterFullscreen();
                }}
                className="flex items-center gap-1.5 rounded-xl bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-300 hover:bg-slate-700 transition-colors border border-slate-700 cursor-pointer"
                title={isFullscreenActive ? "Exit Fullscreen" : "Enter Fullscreen"}
              >
                {isFullscreenActive ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                <span className="hidden sm:inline">{isFullscreenActive ? 'Windowed' : 'Fullscreen'}</span>
              </button>

              <button
                onClick={() => setShowSubmitModal(true)}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-1.5 text-xs font-bold text-slate-950 shadow-md hover:bg-emerald-400 transition-colors cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Submit Assessment</span>
              </button>
            </div>
          </div>

          {/* Main IDE Split Layout */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 flex-1 min-h-0">
            {/* Left Panel: Problem Statement & Constraints (5 Cols) */}
            <div className="space-y-4 lg:col-span-5 flex flex-col h-full overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xs scrollbar-thin">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="rounded-lg bg-indigo-500/20 px-2.5 py-1 text-xs font-bold text-indigo-300 font-mono border border-indigo-500/30">
                    {currentQuestion.category}
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        currentQuestion.difficulty === 'Easy'
                          ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/40'
                          : currentQuestion.difficulty === 'Medium'
                          ? 'bg-amber-950/40 text-amber-300 border border-amber-800/40'
                          : 'bg-rose-950/40 text-rose-300 border border-rose-800/40'
                      }`}
                    >
                      {currentQuestion.difficulty}
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-400">
                      {currentQuestion.points} pts
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-white">
                    {currentQuestion.title}
                  </h2>
                  <button
                    onClick={() => handleOpenEditQuestion(currentQuestion)}
                    className="p-1 rounded text-amber-400 hover:bg-slate-800 transition-colors"
                    title="Edit this question"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                </div>

                <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                  {currentQuestion.description}
                </div>
              </div>

              {/* Sample Input / Output */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">Sample Example</p>
                <div className="rounded-xl bg-slate-950 p-3 font-mono text-xs text-slate-200 border border-slate-800 space-y-1">
                  <div>
                    <span className="text-slate-400">Input: </span>
                    <span className="font-bold text-teal-400">{currentQuestion.sampleInput}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Output: </span>
                    <span className="font-bold text-emerald-400">{currentQuestion.sampleOutput}</span>
                  </div>
                </div>
              </div>

              {/* Constraints */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">Constraints</p>
                <ul className="list-disc pl-4 text-xs font-mono text-slate-400 space-y-0.5">
                  {currentQuestion.constraints.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>

              {/* Question Navigation Chips */}
              <div className="mt-auto pt-4 border-t border-slate-800">
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
                            ? 'bg-teal-600 text-white ring-2 ring-teal-400 ring-offset-2 ring-offset-slate-900'
                            : isSolved
                            ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
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
            <div className="space-y-3 lg:col-span-7 flex flex-col h-full min-h-0">
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
              <div className="h-56 rounded-b-2xl bg-slate-900 p-3 font-mono text-xs text-slate-300 border border-slate-800 overflow-y-auto space-y-2">
                <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800 pb-1">
                  <span>Execution Console & Test Cases</span>
                  {testCasesResult.length > 0 && (
                    <span className={testCasesResult.every(r => r.passed) ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
                      {testCasesResult.filter(r => r.passed).length} / {testCasesResult.length} Test Cases Passed
                    </span>
                  )}
                </div>

                {executionOutput ? (
                  <pre className="text-slate-300 whitespace-pre-wrap text-[11px] leading-relaxed font-mono">
                    {executionOutput}
                  </pre>
                ) : (
                  <p className="text-slate-500 italic text-[11px]">
                    Click "Run Code & Tests" to compile and execute your algorithm against the test suite.
                  </p>
                )}

                {/* Test case assertion list with detailed diagnostics */}
                {testCasesResult.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Test Suite Breakdown:</span>
                    <div className="grid grid-cols-1 gap-2">
                      {testCasesResult.map((tc, idx) => (
                        <div
                          key={tc.id}
                          className={`rounded-lg p-2.5 text-[11px] border ${
                            tc.passed
                              ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-200'
                              : 'bg-rose-950/30 border-rose-800/50 text-rose-200'
                          }`}
                        >
                          <div className="flex items-center justify-between font-bold">
                            <div className="flex items-center gap-1.5">
                              {tc.passed ? (
                                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                              ) : (
                                <AlertCircle className="h-4 w-4 text-rose-400" />
                              )}
                              <span>Test Case #{idx + 1} {tc.hidden ? '(Hidden Case)' : ''}</span>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[10px] ${tc.passed ? 'bg-emerald-900/60 text-emerald-300' : 'bg-rose-900/60 text-rose-300'}`}>
                              {tc.passed ? `PASSED (${tc.time})` : 'FAILED'}
                            </span>
                          </div>

                          {!tc.hidden && (
                            <div className="mt-1.5 space-y-0.5 text-[10px] text-slate-300 font-mono bg-slate-950/60 p-2 rounded">
                              <div><span className="text-slate-500">Input:</span> <span className="text-slate-200">{tc.input}</span></div>
                              <div><span className="text-slate-500">Expected:</span> <span className="text-emerald-300">{tc.expected}</span></div>
                              <div><span className="text-slate-500">Actual:</span> <span className={tc.passed ? "text-emerald-300" : "text-rose-300"}>{tc.actual}</span></div>
                              {tc.explanation && <div><span className="text-slate-500">Note:</span> <span className="text-slate-400">{tc.explanation}</span></div>}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. QUESTION BANK & PRACTICE VIEW (ACCESSIBLE TO ALL ROLES) */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'bank' && !activeTestSession && (
        <div className="space-y-6">
          {/* Controls: Search, Category, Difficulty, Custom Question, Add Question */}
          <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-xs dark:bg-slate-900 border border-slate-200 dark:border-slate-800 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search coding problems & algorithms..."
                  value={bankSearch}
                  onChange={(e) => setBankSearch(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <select
                value={bankCategory}
                onChange={(e) => setBankCategory(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
              >
                {categoriesList.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

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

            <div className="flex items-center gap-2">
              <button
                onClick={handleOpenNewCustomQuestionModal}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-md hover:from-amber-400 hover:to-orange-400 transition-all cursor-pointer"
              >
                <Sparkles className="h-4 w-4 fill-current" />
                <span>Give Custom Question</span>
              </button>

              {isAdminOrPlacement && (
                <button
                  onClick={handleOpenNewCustomQuestionModal}
                  className="flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-teal-700 transition-colors cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Problem</span>
                </button>
              )}
            </div>
          </div>

          {/* Question Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredQuestions.slice(0, 48).map(q => (
              <div
                key={q.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:shadow-md transition-all dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="rounded-lg bg-teal-50 px-2 py-0.5 text-[11px] font-bold text-teal-700 dark:bg-teal-950/50 dark:text-teal-300 font-mono">
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
                      onClick={() => handleLaunchInstantAssessment(q, 45)}
                      className="flex items-center gap-1 rounded-lg bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-700 hover:bg-teal-100 dark:bg-teal-950/50 dark:text-teal-300 cursor-pointer"
                      title="Open and Solve in Fullscreen IDE"
                    >
                      <Play className="h-3 w-3 fill-current" />
                      <span>Solve in IDE</span>
                    </button>

                    <button
                      onClick={() => setSelectedQuestionForView(q)}
                      className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 cursor-pointer"
                      title="Preview Problem"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>

                    {/* Edit Problem button available for instructors / admins and all users */}
                    <button
                      onClick={() => handleOpenEditQuestion(q)}
                      className="flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-1 text-xs font-bold text-amber-700 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 cursor-pointer"
                      title="Edit this problem statement, constraints, or test cases"
                    >
                      <Edit className="h-3 w-3" />
                      <span>Edit</span>
                    </button>

                    {isAdminOrPlacement && (
                      <button
                        onClick={() => {
                          if (confirm(`Remove "${q.title}" from question bank?`)) onDeleteQuestion(q.id);
                        }}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                        title="Delete Problem"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 4. SUBMISSIONS & MARKS LEADERBOARD (ADMIN / PLACEMENT INCHARGE) */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'submissions' && isAdminOrPlacement && (
        <div className="space-y-6">
          <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-xs dark:bg-slate-900 border border-slate-200 dark:border-slate-800 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search candidate name, roll no, or assessment title..."
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
              onClick={handleExportMarksCSV}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span>Download Marks Secured CSV</span>
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
                    <th className="px-6 py-3.5">Marks Secured</th>
                    <th className="px-6 py-3.5">Time Spent</th>
                    <th className="px-6 py-3.5">Anti-Cheat / Focus</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
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
                            {sub.tabSwitchCount} Blur
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
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
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedSubmissionForPrintScorecard(sub)}
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300 cursor-pointer"
                            title="Print / Save Official PDF Scorecard"
                          >
                            <Printer className="h-3.5 w-3.5" />
                            <span>Scorecard</span>
                          </button>
                          <button
                            onClick={() => setSelectedSubmissionForReview(sub)}
                            className="rounded-lg bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-700 hover:bg-teal-100 dark:bg-teal-950/50 dark:text-teal-300 cursor-pointer"
                          >
                            Transcript
                          </button>
                        </div>
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
      {/* MODAL: PREVIEW QUESTION MODAL WITH EDIT ACTION */}
      {/* ------------------------------------------------------------- */}
      {selectedQuestionForView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-700 dark:bg-teal-950/40 dark:text-teal-300 font-mono">
                  {selectedQuestionForView.category}
                </span>
                <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                  {selectedQuestionForView.difficulty} ({selectedQuestionForView.points} Pts)
                </span>
              </div>
              <button
                onClick={() => setSelectedQuestionForView(null)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {selectedQuestionForView.title}
            </h3>

            <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {selectedQuestionForView.description}
            </div>

            {/* Sample Example */}
            <div className="rounded-xl bg-slate-50 p-3 font-mono text-xs text-slate-800 dark:bg-slate-950 dark:text-slate-200 border border-slate-200/80 dark:border-slate-800 space-y-1">
              <div>
                <span className="text-slate-400">Sample Input: </span>
                <span className="font-bold text-teal-600 dark:text-teal-400">{selectedQuestionForView.sampleInput}</span>
              </div>
              <div>
                <span className="text-slate-400">Sample Output: </span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{selectedQuestionForView.sampleOutput}</span>
              </div>
            </div>

            {/* Constraints */}
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase text-slate-400 font-mono">Constraints</p>
              <ul className="list-disc pl-4 text-xs font-mono text-slate-600 dark:text-slate-400 space-y-0.5">
                {selectedQuestionForView.constraints.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  const q = selectedQuestionForView;
                  setSelectedQuestionForView(null);
                  handleOpenEditQuestion(q);
                }}
                className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-md hover:bg-amber-400 transition-colors cursor-pointer"
              >
                <Edit className="h-4 w-4" />
                <span>Edit Problem</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedQuestionForView(null)}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const q = selectedQuestionForView;
                    setSelectedQuestionForView(null);
                    handleLaunchInstantAssessment(q, 45);
                  }}
                  className="flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-teal-700 transition-colors cursor-pointer"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>Solve in IDE</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: GIVE CUSTOM QUESTION & EDIT PROBLEM MODAL */}
      {/* ------------------------------------------------------------- */}
      {showGiveCustomQuestionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-500">
                  {editingQuestion ? <Edit className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {editingQuestion ? `Edit Problem: ${editingQuestion.title}` : 'Give Custom Question & Coding Challenge'}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    {editingQuestion
                      ? 'Modify problem statement, constraints, test cases, and starter code'
                      : 'Define custom problem statement, test cases & launch proctored assessment'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowGiveCustomQuestionModal(false);
                  setEditingQuestion(null);
                }}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Row 1: Title, Category, Difficulty */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                    Problem Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Find Kth Smallest Element in Sorted Matrix"
                    value={customQTitle}
                    onChange={(e) => setCustomQTitle(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Difficulty</label>
                  <select
                    value={customQDifficulty}
                    onChange={(e) => setCustomQDifficulty(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  >
                    <option value="Easy">Easy (20 Pts)</option>
                    <option value="Medium">Medium (30 Pts)</option>
                    <option value="Hard">Hard (50 Pts)</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Category, Points, Duration */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Category / Domain</label>
                  <input
                    type="text"
                    value={customQCategory}
                    onChange={(e) => setCustomQCategory(e.target.value)}
                    placeholder="e.g. Dynamic Programming"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Max Points</label>
                  <input
                    type="number"
                    value={customQPoints}
                    onChange={(e) => setCustomQPoints(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Assessment Duration</label>
                  <input
                    type="number"
                    value={customAssessmentDuration}
                    onChange={(e) => setCustomAssessmentDuration(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                  Problem Statement & Invariants <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Clearly explain the algorithm requirements, input types, and expected return structure..."
                  value={customQDescription}
                  onChange={(e) => setCustomQDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              {/* Constraints & Sample Input/Output */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Constraints</label>
                  <textarea
                    rows={2}
                    value={customQConstraints}
                    onChange={(e) => setCustomQConstraints(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Sample Input / Output</label>
                  <div className="space-y-1.5">
                    <input
                      type="text"
                      placeholder="Input: [2, 7, 11, 15], 9"
                      value={customQSampleInput}
                      onChange={(e) => setCustomQSampleInput(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-mono text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    />
                    <input
                      type="text"
                      placeholder="Output: [0, 1]"
                      value={customQSampleOutput}
                      onChange={(e) => setCustomQSampleOutput(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-mono text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Interactive Test Cases Builder */}
              <div className="space-y-2.5 rounded-2xl bg-slate-50 p-4 border border-slate-200/80 dark:bg-slate-950 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-slate-200 uppercase text-[11px] font-mono flex items-center gap-1.5">
                    <ListChecks className="h-4 w-4 text-teal-500" />
                    Interactive Test Cases Suite ({customTestCases.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomTestCases([
                        ...customTestCases,
                        {
                          id: String(Date.now()),
                          input: '[0, 0, 1], 1',
                          expectedOutput: '1',
                          hidden: false,
                          explanation: 'Additional custom verification'
                        }
                      ]);
                    }}
                    className="flex items-center gap-1 rounded-lg bg-teal-600 px-3 py-1 text-[11px] font-bold text-white hover:bg-teal-700 transition-colors cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Test Case</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {customTestCases.map((tc, idx) => (
                    <div
                      key={tc.id}
                      className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center rounded-xl bg-white p-3 border border-slate-200 dark:bg-slate-900 dark:border-slate-800"
                    >
                      <div className="sm:col-span-1 font-mono font-bold text-slate-400 text-center">
                        #{idx + 1}
                      </div>
                      <div className="sm:col-span-4">
                        <input
                          type="text"
                          placeholder="Input (e.g. [2,7,11,15], 9)"
                          value={tc.input}
                          onChange={(e) => {
                            const updated = [...customTestCases];
                            updated[idx].input = e.target.value;
                            setCustomTestCases(updated);
                          }}
                          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 font-mono text-[11px] text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <input
                          type="text"
                          placeholder="Expected Output (e.g. [0,1])"
                          value={tc.expectedOutput}
                          onChange={(e) => {
                            const updated = [...customTestCases];
                            updated[idx].expectedOutput = e.target.value;
                            setCustomTestCases(updated);
                          }}
                          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 font-mono text-[11px] text-emerald-600 dark:border-slate-800 dark:bg-slate-950 dark:text-emerald-400 font-bold"
                        />
                      </div>
                      <div className="sm:col-span-3 flex items-center gap-2">
                        <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 dark:text-slate-400 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={tc.hidden}
                            onChange={(e) => {
                              const updated = [...customTestCases];
                              updated[idx].hidden = e.target.checked;
                              setCustomTestCases(updated);
                            }}
                            className="rounded text-teal-600"
                          />
                          <span>Hidden Test</span>
                        </label>
                      </div>
                      <div className="sm:col-span-1 text-right">
                        {customTestCases.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setCustomTestCases(customTestCases.filter((_, i) => i !== idx))}
                            className="p-1 text-rose-500 hover:bg-rose-50 rounded dark:hover:bg-rose-950/30"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Starter Code Editor Tabs */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold uppercase text-slate-400">Starter Code Template</label>
                  <div className="flex gap-1">
                    {(['javascript', 'python', 'java', 'cpp'] as const).map(lang => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => setCustomSelectedLangTab(lang)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                          customSelectedLangTab === lang
                            ? 'bg-teal-600 text-white'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {lang.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {customSelectedLangTab === 'javascript' && (
                  <textarea
                    rows={4}
                    value={customQStarterJS}
                    onChange={(e) => setCustomQStarterJS(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-950 px-3 py-2 font-mono text-xs text-emerald-400"
                  />
                )}
                {customSelectedLangTab === 'python' && (
                  <textarea
                    rows={4}
                    value={customQStarterPy}
                    onChange={(e) => setCustomQStarterPy(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-950 px-3 py-2 font-mono text-xs text-emerald-400"
                  />
                )}
                {customSelectedLangTab === 'java' && (
                  <textarea
                    rows={4}
                    value={customQStarterJava}
                    onChange={(e) => setCustomQStarterJava(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-950 px-3 py-2 font-mono text-xs text-emerald-400"
                  />
                )}
                {customSelectedLangTab === 'cpp' && (
                  <textarea
                    rows={4}
                    value={customQStarterCpp}
                    onChange={(e) => setCustomQStarterCpp(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-950 px-3 py-2 font-mono text-xs text-emerald-400"
                  />
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowGiveCustomQuestionModal(false);
                  setEditingQuestion(null);
                }}
                className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveCustomQuestionToBank}
                  className="rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-teal-700 transition-colors cursor-pointer"
                >
                  {editingQuestion ? 'Save Changes' : 'Save to Question Bank'}
                </button>

                {!editingQuestion && isAdminOrPlacement && (
                  <button
                    type="button"
                    onClick={handleCreateTestWithCustomQuestion}
                    className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-indigo-700 transition-colors cursor-pointer"
                  >
                    Publish as Test
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleLaunchCustomQuestionAssessment}
                  className="rounded-xl bg-gradient-to-r from-amber-500 to-teal-500 px-5 py-2 text-xs font-bold text-slate-950 shadow-md hover:opacity-95 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>{editingQuestion ? 'Update & Solve in IDE' : 'Launch Instant Assessment'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: CREATE TEST CONFIGURATOR (WITH HAND-PICKED QUESTIONS) */}
      {/* ------------------------------------------------------------- */}
      {showCreateTestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
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

              {/* Question Selection Mode Toggle */}
              <div className="space-y-2 rounded-2xl bg-slate-50 p-3.5 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800">
                <label className="block text-xs font-bold uppercase text-slate-500 font-mono">
                  Question Assignment Mode
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewTestQuestionMode('random_pool')}
                    className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all cursor-pointer ${
                      newTestQuestionMode === 'random_pool'
                        ? 'bg-teal-600 text-white shadow-md'
                        : 'bg-white text-slate-600 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400'
                    }`}
                  >
                    <Shuffle className="h-4 w-4" />
                    <span>Random from 300+ Pool</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewTestQuestionMode('custom_selection')}
                    className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all cursor-pointer ${
                      newTestQuestionMode === 'custom_selection'
                        ? 'bg-teal-600 text-white shadow-md'
                        : 'bg-white text-slate-600 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400'
                    }`}
                  >
                    <ListChecks className="h-4 w-4" />
                    <span>Select Specific Custom Questions</span>
                  </button>
                </div>

                {newTestQuestionMode === 'custom_selection' && (
                  <div className="pt-2 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-teal-600 dark:text-teal-400 font-mono">
                        {selectedCustomQuestionIds.length} Questions Selected (
                        {selectedCustomQuestionIds.reduce((sum, id) => {
                          const q = questions.find(item => item.id === id);
                          return sum + (q?.points || 20);
                        }, 0)}{' '}
                        Total Marks)
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setShowCreateTestModal(false);
                          handleOpenNewCustomQuestionModal();
                        }}
                        className="text-[11px] font-bold text-indigo-600 hover:underline flex items-center gap-1"
                      >
                        <Plus className="h-3 w-3" />
                        <span>Create New Custom Question</span>
                      </button>
                    </div>

                    <div className="relative">
                      <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search questions to add..."
                        value={customQuestionSearchInModal}
                        onChange={(e) => setCustomQuestionSearchInModal(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                      />
                    </div>

                    {/* Question Checkbox Selector */}
                    <div className="max-h-48 overflow-y-auto space-y-1.5 rounded-xl border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-900">
                      {filteredModalQuestions.map(q => {
                        const isSelected = selectedCustomQuestionIds.includes(q.id);
                        return (
                          <div
                            key={q.id}
                            className={`flex items-center justify-between p-2 rounded-lg transition-colors ${
                              isSelected
                                ? 'bg-teal-50 border border-teal-200 dark:bg-teal-950/40 dark:border-teal-800'
                                : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                            }`}
                          >
                            <div
                              onClick={() => {
                                if (isSelected) {
                                  setSelectedCustomQuestionIds(selectedCustomQuestionIds.filter(id => id !== q.id));
                                } else {
                                  setSelectedCustomQuestionIds([...selectedCustomQuestionIds, q.id]);
                                }
                              }}
                              className="flex items-center gap-2 min-w-0 flex-1 cursor-pointer"
                            >
                              {isSelected ? (
                                <CheckSquare className="h-4 w-4 text-teal-600 shrink-0" />
                              ) : (
                                <Square className="h-4 w-4 text-slate-400 shrink-0" />
                              )}
                              <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 truncate">
                                {q.title}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 font-mono text-[11px] shrink-0">
                              <span className="text-slate-400">{q.category}</span>
                              <span className="font-bold text-teal-600 dark:text-teal-400">{q.points} pts</span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowCreateTestModal(false);
                                  handleOpenEditQuestion(q);
                                }}
                                className="p-1 rounded text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                                title="Edit this question"
                              >
                                <Edit className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
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

                {newTestQuestionMode === 'random_pool' && (
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
                )}
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
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedSubmissionForPrintScorecard(selectedSubmissionForReview)}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-md hover:bg-emerald-500 cursor-pointer"
                >
                  <Printer className="h-4 w-4" />
                  <span>Print Scorecard</span>
                </button>
                <button
                  onClick={() => setSelectedSubmissionForReview(null)}
                  className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
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
                Assigned Questions & Candidate Solutions
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

                  <div className="rounded-xl bg-slate-900 p-3 font-mono text-xs text-emerald-300 overflow-x-auto border border-slate-800">
                    <pre>{ans.code || '// No code submitted for this question'}</pre>
                  </div>

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
      {/* MODAL: OFFICIAL PRINTABLE SCORECARD / PDF TRANSCRIPT */}
      {/* ------------------------------------------------------------- */}
      {selectedSubmissionForPrintScorecard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
          <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-8 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6 print:p-0 print:border-none print:shadow-none">
            {/* Header with Print Controls */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800 print:hidden">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                Official Marks Certificate Preview
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-teal-700 transition-colors cursor-pointer"
                >
                  <Printer className="h-4 w-4" />
                  <span>Print Marksheet</span>
                </button>
                <button
                  onClick={() => setSelectedSubmissionForPrintScorecard(null)}
                  className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Printable Mark Sheet Container */}
            <div className="space-y-6 text-slate-900 dark:text-white">
              {/* Institution Header */}
              <div className="text-center space-y-1 border-b-2 border-slate-900 pb-4 dark:border-slate-100">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-600 text-white mb-2 shadow-md">
                  <Building className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-black uppercase tracking-tight">University Placement & Examination Cell</h2>
                <p className="text-xs uppercase font-mono tracking-widest text-slate-500 dark:text-slate-400">
                  Official Technical Assessment & Coding Performance Transcript
                </p>
              </div>

              {/* Student & Test Particulars */}
              <div className="grid grid-cols-2 gap-4 rounded-2xl bg-slate-50 p-4 font-mono text-xs border border-slate-200 dark:bg-slate-950 dark:border-slate-800">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Candidate Name</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">{selectedSubmissionForPrintScorecard.studentName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Roll / Registration No</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">{selectedSubmissionForPrintScorecard.studentRollNo}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Assessment Title</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedSubmissionForPrintScorecard.testTitle}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Date & Timestamp</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {new Date(selectedSubmissionForPrintScorecard.submittedAt || selectedSubmissionForPrintScorecard.startedAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Total Marks Secured Banner */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-2xl border border-teal-200 bg-teal-50/50 p-3 dark:border-teal-900 dark:bg-teal-950/30">
                  <span className="text-[10px] font-bold uppercase text-teal-700 dark:text-teal-300 font-mono block">Marks Secured</span>
                  <span className="text-xl font-black text-teal-700 dark:text-teal-300 font-mono">
                    {selectedSubmissionForPrintScorecard.totalScore} / {selectedSubmissionForPrintScorecard.maxScore}
                  </span>
                </div>
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-3 dark:border-emerald-900 dark:bg-emerald-950/30">
                  <span className="text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-300 font-mono block">Final Percentage</span>
                  <span className="text-xl font-black text-emerald-700 dark:text-emerald-300 font-mono">
                    {selectedSubmissionForPrintScorecard.percentage}%
                  </span>
                </div>
                <div className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-3 dark:border-indigo-900 dark:bg-indigo-950/30">
                  <span className="text-[10px] font-bold uppercase text-indigo-700 dark:text-indigo-300 font-mono block">Evaluation Status</span>
                  <span className="text-xl font-black text-indigo-700 dark:text-indigo-300 font-mono">
                    {selectedSubmissionForPrintScorecard.percentage >= 60 ? 'PASSED' : 'ELIGIBLE'}
                  </span>
                </div>
              </div>

              {/* Question-by-Question Scores Breakdown Table */}
              <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 font-mono text-[10px] font-bold uppercase text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    <tr>
                      <th className="px-4 py-2.5">Q#</th>
                      <th className="px-4 py-2.5">Question Title</th>
                      <th className="px-4 py-2.5">Language</th>
                      <th className="px-4 py-2.5">Test Cases</th>
                      <th className="px-4 py-2.5">Marks Secured</th>
                      <th className="px-4 py-2.5 text-right">Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {(Object.values(selectedSubmissionForPrintScorecard.answers) as StudentCodingAnswer[]).map((ans, idx) => (
                      <tr key={ans.questionId}>
                        <td className="px-4 py-2.5 font-mono font-bold text-slate-500">#{idx + 1}</td>
                        <td className="px-4 py-2.5 font-bold">{ans.questionTitle}</td>
                        <td className="px-4 py-2.5 font-mono text-slate-500 uppercase">{ans.language}</td>
                        <td className="px-4 py-2.5 font-mono">{ans.testCasesPassed} / {ans.totalTestCases}</td>
                        <td className="px-4 py-2.5 font-mono font-bold text-teal-600 dark:text-teal-400">
                          {ans.score} / {ans.maxScore}
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            ans.status === 'Passed' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                          }`}>
                            {ans.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Signatures & Seal */}
              <div className="pt-8 flex items-center justify-between border-t border-slate-200 text-xs text-slate-500 font-mono dark:border-slate-800">
                <div className="text-center">
                  <div className="h-10 border-b border-dashed border-slate-400 w-36 mb-1" />
                  <span>Placement Officer</span>
                </div>
                <div className="text-center">
                  <div className="h-10 border-b border-dashed border-slate-400 w-36 mb-1" />
                  <span>Controller of Examinations</span>
                </div>
              </div>
            </div>
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

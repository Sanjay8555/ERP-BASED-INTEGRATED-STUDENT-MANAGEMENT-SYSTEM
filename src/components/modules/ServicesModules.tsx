/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  IndianRupee,
  AlertCircle,
  CheckCircle,
  FileText,
  Printer,
  BookOpen,
  Search,
  PlusCircle,
  BookmarkCheck,
  Calendar,
  X,
  FileDown,
  ChevronRight,
  Copy,
  Check,
  Plus,
  Edit3,
  Trash2,
  Tag,
  Building2,
  Filter,
  Layers,
  CreditCard,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  Eye,
  Sparkles,
  DollarSign,
  GraduationCap,
  QrCode,
  Smartphone,
  Lock
} from 'lucide-react';
import collegePaymentQr from '../../assets/college_payment_qr.png';
import {
  FeeStructure,
  FeePayment,
  StudentProfile,
  User,
  Book,
  BookIssue,
  Department
} from '../../types';

// ==========================================
// 1. FEE COLLECTIONS SUB-COMPONENT
// ==========================================
interface FeeCollectionsProps {
  feeStructures: FeeStructure[];
  feePayments: FeePayment[];
  students: StudentProfile[];
  users: User[];
  role: string;
  onAddPayment: (payment: FeePayment) => void;
  onUpdateFeeStructures?: (updated: FeeStructure[]) => void;
  onAddFeeStructure?: (structure: FeeStructure) => void;
  onUpdateFeeStructure?: (structure: FeeStructure) => void;
  onDeleteFeeStructure?: (structureId: string) => void;
  departments?: Department[];
  onPrintReceipt?: (payment: FeePayment) => void;
  currentUser?: User;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; ring: string; border: string }> = {
  Tuition: { bg: 'bg-teal-50 dark:bg-teal-950/40', text: 'text-teal-700 dark:text-teal-300', ring: 'ring-teal-600/20', border: 'border-teal-200 dark:border-teal-800' },
  Hostel: { bg: 'bg-purple-50 dark:bg-purple-950/40', text: 'text-purple-700 dark:text-purple-300', ring: 'ring-purple-600/20', border: 'border-purple-200 dark:border-purple-800' },
  Transport: { bg: 'bg-indigo-50 dark:bg-indigo-950/40', text: 'text-indigo-700 dark:text-indigo-300', ring: 'ring-indigo-600/20', border: 'border-indigo-200 dark:border-indigo-800' },
  Examination: { bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-300', ring: 'ring-amber-600/20', border: 'border-amber-200 dark:border-amber-800' },
  Laboratory: { bg: 'bg-cyan-50 dark:bg-cyan-950/40', text: 'text-cyan-700 dark:text-cyan-300', ring: 'ring-cyan-600/20', border: 'border-cyan-200 dark:border-cyan-800' },
  Library: { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-300', ring: 'ring-emerald-600/20', border: 'border-emerald-200 dark:border-emerald-800' },
  Sports: { bg: 'bg-rose-50 dark:bg-rose-950/40', text: 'text-rose-700 dark:text-rose-300', ring: 'ring-rose-600/20', border: 'border-rose-200 dark:border-rose-800' },
  Miscellaneous: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-700 dark:text-slate-300', ring: 'ring-slate-500/20', border: 'border-slate-300 dark:border-slate-700' },
};

export function FeeCollections({
  feeStructures = [],
  feePayments = [],
  students = [],
  users = [],
  role,
  onAddPayment,
  onUpdateFeeStructures,
  onAddFeeStructure,
  onUpdateFeeStructure,
  onDeleteFeeStructure,
  departments = [],
  onPrintReceipt,
  currentUser
}: FeeCollectionsProps) {
  const isAccountantOrAdmin = role === 'Accountant' || role === 'Admin';
  const isStudentOrParent = role === 'Student' || role === 'Parent';

  // Sub-navigation tabs
  const [activeSubTab, setActiveSubTab] = useState<'collect' | 'structures' | 'ledger' | 'student-portal'>(
    isStudentOrParent ? 'student-portal' : 'collect'
  );

  // Student Profile for current logged in user (if student or parent)
  const studentProfile = students.find(
    s => s && (s.userId === currentUser?.id || (s.parentEmail && s.parentEmail.trim().toLowerCase() === (currentUser?.email || '').trim().toLowerCase()))
  );
  const currentStudentId = studentProfile?.id || (students[0]?.id || 's-1');

  // Record Payment State
  const [selectedStudent, setSelectedStudent] = useState(currentStudentId);
  const [selectedFee, setSelectedFee] = useState('');
  const [customAmount, setCustomAmount] = useState<number | ''>('');
  const [payMethod, setPayMethod] = useState('Credit Card');
  const [receiptModalPay, setReceiptModalPay] = useState<FeePayment | null>(null);
  const [copiedReceipt, setCopiedReceipt] = useState(false);

  // QR Code Online Payment Gateway State (Shows before generating receipt)
  const [qrPaymentModalData, setQrPaymentModalData] = useState<{
    studentId: string;
    feeStructureId: string;
    amount: number;
    existingPaymentId?: string;
    utrNumber: string;
  } | null>(null);
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Fee Structures Management State
  const [structureSearch, setStructureSearch] = useState('');
  const [structureDeptFilter, setStructureDeptFilter] = useState('All');
  const [structureSemFilter, setStructureSemFilter] = useState('All');
  const [structureCatFilter, setStructureCatFilter] = useState('All');
  const [showStructureModal, setShowStructureModal] = useState(false);
  const [editingStructure, setEditingStructure] = useState<FeeStructure | null>(null);
  const [structureFormData, setStructureFormData] = useState<Partial<FeeStructure>>({
    name: '',
    category: 'Tuition',
    amount: 3500,
    semester: 1,
    departmentId: '',
    description: ''
  });

  // Ledger Filter State
  const [ledgerSearch, setLedgerSearch] = useState('');
  const [ledgerStatusFilter, setLedgerStatusFilter] = useState('All');
  const [ledgerMethodFilter, setLedgerMethodFilter] = useState('All');

  // Student portal preview student selection (for Admin/Accountant)
  const [previewStudentId, setPreviewStudentId] = useState(currentStudentId);

  // Resolve currently selected student's department and semester
  const selectedStudentObj = students.find(s => s.id === selectedStudent);
  const selectedStudentDeptId = selectedStudentObj?.departmentId;
  const selectedStudentSem = selectedStudentObj?.currentSemester;

  // Filter fee structures applicable for selected student (matching department + general campus fee structures)
  const applicableFeeStructures = feeStructures.filter(f => {
    if (!f.departmentId || f.departmentId === '') return true; // General campus fee
    return f.departmentId === selectedStudentDeptId;
  });

  // Fallback: if no specific applicable structures, include all fee structures
  const feeOptions = applicableFeeStructures.length > 0 ? applicableFeeStructures : feeStructures;

  // Auto-sync selected fee structure when student or fee options change
  useEffect(() => {
    if (feeOptions.length > 0) {
      const exists = feeOptions.some(f => f.id === selectedFee);
      if (!exists) {
        // Prefer a tuition fee for student's current semester if available
        const preferred = feeOptions.find(f => f.semester === selectedStudentSem) || feeOptions[0];
        setSelectedFee(preferred.id);
        setCustomAmount(preferred.amount);
      } else {
        const curr = feeOptions.find(f => f.id === selectedFee);
        if (curr && (customAmount === '' || customAmount === 0)) {
          setCustomAmount(curr.amount);
        }
      }
    } else {
      setSelectedFee('');
      setCustomAmount('');
    }
  }, [selectedStudent, feeStructures.length]);

  // Update custom amount when selected fee changes
  const handleFeeSelectionChange = (feeId: string) => {
    setSelectedFee(feeId);
    const struct = feeStructures.find(f => f.id === feeId);
    if (struct) {
      setCustomAmount(struct.amount);
    }
  };

  // Submit Record Payment
  const handleCollectFee = (e: React.FormEvent) => {
    e.preventDefault();
    const fee = feeStructures.find(f => f.id === selectedFee);
    if (!fee) {
      alert('Please select a valid Fee Category Structure.');
      return;
    }

    const amountToPay = typeof customAmount === 'number' && customAmount > 0 ? customAmount : fee.amount;
    const isPartial = amountToPay < fee.amount;

    const newPayment: FeePayment = {
      id: `pay-${Date.now()}`,
      studentId: selectedStudent,
      feeStructureId: selectedFee,
      amountPaid: amountToPay,
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: payMethod,
      status: isPartial ? 'Partial' : 'Paid',
      receiptNumber: `RCPT-2026-${Math.floor(10000 + Math.random() * 90000)}`
    };

    onAddPayment(newPayment);
    setReceiptModalPay(newPayment);
  };

  // Quick Pay handler for Student / Parent (Triggers Official V.S.B. UPI QR Gateway before receipt)
  const handleStudentPayStructure = (studentId: string, feeStructureId: string) => {
    const fee = feeStructures.find(f => f.id === feeStructureId);
    if (!fee) return;

    // Check if there is an existing pending record
    const existingPayment = feePayments.find(p => p.studentId === studentId && p.feeStructureId === feeStructureId && p.status !== 'Paid');
    const amountToPay = fee.amount - (existingPayment?.amountPaid || 0);

    setQrPaymentModalData({
      studentId,
      feeStructureId,
      amount: amountToPay,
      existingPaymentId: existingPayment?.id,
      utrNumber: `VSB-${Date.now().toString().slice(-6)}`
    });
  };

  // Open modal for Adding a new Fee Structure
  const handleOpenAddStructureModal = () => {
    setEditingStructure(null);
    setStructureFormData({
      name: '',
      category: 'Tuition',
      amount: 3800,
      semester: 1,
      departmentId: departments[0]?.id || '',
      description: ''
    });
    setShowStructureModal(true);
  };

  // Open modal for Editing an existing Fee Structure
  const handleOpenEditStructureModal = (struct: FeeStructure) => {
    setEditingStructure(struct);
    setStructureFormData({
      name: struct.name,
      category: struct.category || 'Tuition',
      amount: struct.amount,
      semester: struct.semester,
      departmentId: struct.departmentId || '',
      description: struct.description
    });
    setShowStructureModal(true);
  };

  // Save Fee Structure (Add or Edit)
  const handleSaveStructure = (e: React.FormEvent) => {
    e.preventDefault();
    if (!structureFormData.name?.trim()) {
      alert('Fee Structure Name is required.');
      return;
    }
    const amountVal = Number(structureFormData.amount);
    if (isNaN(amountVal) || amountVal <= 0) {
      alert('Please enter a valid positive amount.');
      return;
    }

    if (editingStructure) {
      const updated: FeeStructure = {
        ...editingStructure,
        name: structureFormData.name.trim(),
        category: structureFormData.category || 'Tuition',
        amount: amountVal,
        semester: Number(structureFormData.semester) || 0,
        departmentId: structureFormData.departmentId || undefined,
        description: structureFormData.description?.trim() || `${structureFormData.category} fee allocation`
      };

      if (onUpdateFeeStructure) {
        onUpdateFeeStructure(updated);
      } else if (onUpdateFeeStructures) {
        onUpdateFeeStructures(feeStructures.map(s => s.id === updated.id ? updated : s));
      }
    } else {
      const newStruct: FeeStructure = {
        id: `fee-${Date.now()}`,
        name: structureFormData.name.trim(),
        category: structureFormData.category || 'Tuition',
        amount: amountVal,
        semester: Number(structureFormData.semester) || 0,
        departmentId: structureFormData.departmentId || undefined,
        description: structureFormData.description?.trim() || `${structureFormData.category} fee allocation`
      };

      if (onAddFeeStructure) {
        onAddFeeStructure(newStruct);
      } else if (onUpdateFeeStructures) {
        onUpdateFeeStructures([newStruct, ...feeStructures]);
      }
    }

    setShowStructureModal(false);
  };

  // Delete Fee Structure
  const handleDeleteStructure = (structId: string) => {
    if (confirm('Are you sure you want to permanently delete this Fee Category Structure?')) {
      if (onDeleteFeeStructure) {
        onDeleteFeeStructure(structId);
      } else if (onUpdateFeeStructures) {
        onUpdateFeeStructures(feeStructures.filter(s => s.id !== structId));
      }
    }
  };

  // Printing & Exporting Receipts
  const handlePrint = (pay: FeePayment) => {
    const student = students.find(s => s.id === pay.studentId);
    const sUser = users.find(u => u.id === student?.userId);
    const studentName = sUser ? `${sUser.name} (${student?.rollNo || student?.id})` : 'Student Registry';
    const fee = feeStructures.find(f => f.id === pay.feeStructureId);
    const dept = departments.find(d => d.id === student?.departmentId);

    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (!doc) return;

    const receiptHtml = `
      <html>
        <head>
          <title>Receipt - ${pay.receiptNumber}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 30px; color: #1e293b; }
            .receipt { border: 2px dashed #cbd5e1; padding: 24px; max-width: 440px; margin: auto; border-radius: 12px; }
            .header { text-align: center; border-bottom: 2px solid #0d9488; padding-bottom: 12px; margin-bottom: 16px; }
            .header h2 { color: #0d9488; margin: 0; font-size: 18px; text-transform: uppercase; letter-spacing: 0.5px; }
            .header p { font-size: 11px; color: #64748b; margin-top: 4px; font-mono; }
            .row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 12px; }
            .label { color: #64748b; font-weight: 600; text-transform: uppercase; font-size: 10px; }
            .value { color: #0f172a; font-weight: 700; }
            .total-row { border-top: 1px dashed #cbd5e1; margin-top: 16px; padding-top: 12px; font-size: 16px; font-weight: 800; }
            .total-val { color: #059669; font-size: 18px; font-family: monospace; font-weight: 900; }
            .footer { margin-top: 24px; text-align: center; font-size: 10px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 12px; }
            .badge { display: inline-block; padding: 2px 8px; border-radius: 6px; font-size: 10px; font-weight: bold; background: #ecfdf5; color: #059669; }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="header">
              <h2>University Bursar Office</h2>
              <p>Official Computer Generated Fee Receipt</p>
            </div>
            <div class="row"><span class="label">Receipt Ref:</span><span class="value" style="font-family: monospace;">${pay.receiptNumber}</span></div>
            <div class="row"><span class="label">Student:</span><span class="value">${studentName}</span></div>
            <div class="row"><span class="label">Department:</span><span class="value">${dept?.name || 'General Campus'} (${dept?.code || 'GEN'})</span></div>
            <div class="row"><span class="label">Category:</span><span class="value">${fee?.category || 'Tuition'} - ${fee?.name || 'Academic Fee'}</span></div>
            <div class="row"><span class="label">Date:</span><span class="value">${pay.paymentDate}</span></div>
            <div class="row"><span class="label">Payment Method:</span><span class="value">${pay.paymentMethod}</span></div>
            <div class="row"><span class="label">Payment Status:</span><span class="value badge">${pay.status}</span></div>
            <div class="row total-row"><span class="label" style="font-size: 13px;">Total Settled:</span><span class="total-val">₹${pay.amountPaid.toFixed(2)}</span></div>
            <div class="footer">
              <p>Thank you for your payment!</p>
              <p>Generated on ${new Date().toLocaleString()}</p>
            </div>
          </div>
        </body>
      </html>
    `;

    (iframe.contentWindow as any).document.open();
    (iframe.contentWindow as any).document.write(receiptHtml);
    (iframe.contentWindow as any).document.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      document.body.removeChild(iframe);
    }, 500);
  };

  const handleDownloadHTML = (pay: FeePayment) => {
    const student = students.find(s => s.id === pay.studentId);
    const sUser = users.find(u => u.id === student?.userId);
    const studentName = sUser ? `${sUser.name} (${student?.rollNo || student?.id})` : 'Student Registry';
    const fee = feeStructures.find(f => f.id === pay.feeStructureId);
    const dept = departments.find(d => d.id === student?.departmentId);

    const htmlContent = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Fee Payment Receipt - ${pay.receiptNumber}</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #1e293b; background-color: #f8fafc; padding: 40px; margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
      .receipt { border: 2px dashed #cbd5e1; padding: 28px; border-radius: 16px; max-width: 420px; width: 100%; box-sizing: border-box; background-color: #ffffff; box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1); }
      .header { text-align: center; border-bottom: 2px solid #0d9488; padding-bottom: 16px; margin-bottom: 20px; }
      .header h2 { margin: 0 0 4px 0; font-size: 18px; font-weight: 800; text-transform: uppercase; color: #0d9488; }
      .header p { margin: 0; font-size: 11px; color: #64748b; font-family: monospace; }
      .row { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 10px; }
      .label { color: #64748b; font-weight: 600; text-transform: uppercase; font-size: 10px; }
      .value { color: #1e293b; font-weight: 700; }
      .value-mono { font-family: monospace; }
      .divider { border-top: 1px dashed #cbd5e1; margin-top: 16px; padding-top: 16px; }
      .total-row { display: flex; justify-content: space-between; align-items: center; }
      .total-label { font-size: 14px; font-weight: 700; color: #1e293b; }
      .total-value { font-family: monospace; font-size: 20px; font-weight: 900; color: #059669; }
      .footer { text-align: center; margin-top: 24px; font-size: 10px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 12px; }
      .badge { display: inline-block; padding: 2px 8px; border-radius: 6px; font-size: 10px; font-weight: bold; background: #ecfdf5; color: #059669; }
    </style>
  </head>
  <body>
    <div class="receipt">
      <div class="header">
        <h2>University Bursar Office</h2>
        <p>Receipt Reference: ${pay.receiptNumber}</p>
      </div>
      <div class="row"><span class="label">PAID BY</span><span class="value">${studentName}</span></div>
      <div class="row"><span class="label">DEPARTMENT</span><span class="value">${dept?.name || 'General Campus'}</span></div>
      <div class="row"><span class="label">FEE CATEGORY</span><span class="value">${fee?.category || 'Tuition'} - ${fee?.name || 'Academic Fee'}</span></div>
      <div class="row"><span class="label">PAYMENT DATE</span><span class="value value-mono">${pay.paymentDate}</span></div>
      <div class="row"><span class="label">PAYMENT METHOD</span><span class="value">${pay.paymentMethod}</span></div>
      <div class="row"><span class="label">STATUS</span><span class="value badge">${pay.status}</span></div>
      <div class="divider total-row">
        <span class="total-label">Amount Settled</span>
        <span class="total-value">₹${pay.amountPaid.toFixed(2)}</span>
      </div>
      <div class="footer">
        <p>Thank you for your payment!</p>
        <p>Official Computer-Generated Receipt</p>
      </div>
    </div>
  </body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${pay.receiptNumber}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyText = (pay: FeePayment) => {
    const student = students.find(s => s.id === pay.studentId);
    const sUser = users.find(u => u.id === student?.userId);
    const studentName = sUser ? `${sUser.name} (${student?.rollNo || student?.id})` : 'Student Registry';
    const fee = feeStructures.find(f => f.id === pay.feeStructureId);

    const text = `=========================================
      UNIVERSITY BURSAR OFFICE
=========================================
Receipt Ref : ${pay.receiptNumber}
Paid By     : ${studentName}
Category    : ${fee?.category || 'Tuition'} (${fee?.name || 'Academic Fee'})
Date        : ${pay.paymentDate}
Method      : ${pay.paymentMethod}
Status      : ${pay.status}
-----------------------------------------
Amount Paid : ₹${pay.amountPaid.toFixed(2)}
=========================================
Thank you for your payment!
Official Computer-Generated Receipt.`;

    navigator.clipboard.writeText(text).then(() => {
      setCopiedReceipt(true);
      setTimeout(() => setCopiedReceipt(false), 2000);
    });
  };

  // Filter fee structures for Structure Management Tab
  const filteredStructuresForManagement = feeStructures.filter(s => {
    if (structureSearch) {
      const q = structureSearch.toLowerCase();
      const matchName = s.name.toLowerCase().includes(q);
      const matchDesc = s.description.toLowerCase().includes(q);
      const matchCat = (s.category || '').toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchCat) return false;
    }
    if (structureDeptFilter !== 'All') {
      if (structureDeptFilter === 'General') {
        if (s.departmentId) return false;
      } else if (s.departmentId !== structureDeptFilter) {
        return false;
      }
    }
    if (structureSemFilter !== 'All') {
      if (structureSemFilter === '0' && s.semester !== 0) return false;
      if (structureSemFilter !== '0' && s.semester !== Number(structureSemFilter)) return false;
    }
    if (structureCatFilter !== 'All') {
      if ((s.category || 'Tuition') !== structureCatFilter) return false;
    }
    return true;
  });

  // Filter payments for Ledger Tab
  const filteredPaymentsForLedger = feePayments.filter(p => {
    if (ledgerSearch) {
      const q = ledgerSearch.toLowerCase();
      const student = students.find(s => s.id === p.studentId);
      const sUser = users.find(u => u.id === student?.userId);
      const fee = feeStructures.find(f => f.id === p.feeStructureId);
      const matchName = (sUser?.name || '').toLowerCase().includes(q);
      const matchRoll = (student?.rollNo || '').toLowerCase().includes(q);
      const matchReceipt = (p.receiptNumber || '').toLowerCase().includes(q);
      const matchFee = (fee?.name || '').toLowerCase().includes(q);
      if (!matchName && !matchRoll && !matchReceipt && !matchFee) return false;
    }
    if (ledgerStatusFilter !== 'All' && p.status !== ledgerStatusFilter) return false;
    if (ledgerMethodFilter !== 'All' && p.paymentMethod !== ledgerMethodFilter) return false;
    return true;
  });

  // Target student for student/parent billing view
  const portalStudentId = isStudentOrParent ? currentStudentId : previewStudentId;
  const portalStudentObj = students.find(s => s.id === portalStudentId);
  const portalStudentUser = users.find(u => u.id === portalStudentObj?.userId);
  const portalStudentDept = departments.find(d => d.id === portalStudentObj?.departmentId);

  // Applicable structures for portal student
  const portalApplicableStructures = feeStructures.filter(f => {
    if (!f.departmentId || f.departmentId === '') return true;
    return f.departmentId === portalStudentObj?.departmentId;
  });

  // Compute total statistics
  const totalCollections = feePayments
    .filter(p => p.status === 'Paid')
    .reduce((sum, p) => sum + p.amountPaid, 0);

  const totalPendingDues = feePayments
    .filter(p => p.status === 'Pending' || p.status === 'Partial')
    .reduce((sum, p) => {
      const fee = feeStructures.find(f => f.id === p.feeStructureId);
      const due = (fee?.amount || 0) - p.amountPaid;
      return sum + Math.max(0, due);
    }, 0);

  // Unique categories count
  const allCategories = Array.from(new Set(feeStructures.map(f => f.category || 'Tuition')));

  return (
    <div className="space-y-6">
      {/* Header Banner & Navigation Tabs */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between rounded-3xl bg-linear-to-r from-teal-900 via-slate-900 to-indigo-950 p-6 text-white shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-500/20 text-teal-300 ring-1 ring-teal-400/30">
              <IndianRupee className="h-4 w-4" />
            </span>
            <h2 className="text-xl font-black tracking-tight sm:text-2xl">Fees & Bursar Financial Management</h2>
          </div>
          <p className="text-xs text-slate-300">
            Configure institutional fee categories, record student payments, track accounting ledgers, and manage semester invoicing.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-2xl bg-white/10 p-1.5 backdrop-blur-md">
          {isAccountantOrAdmin && (
            <>
              <button
                type="button"
                onClick={() => setActiveSubTab('collect')}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                  activeSubTab === 'collect'
                    ? 'bg-teal-500 text-white shadow-md'
                    : 'text-slate-200 hover:bg-white/10 hover:text-white'
                }`}
              >
                <CreditCard className="h-3.5 w-3.5" /> Record Payment
              </button>

              <button
                type="button"
                onClick={() => setActiveSubTab('structures')}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                  activeSubTab === 'structures'
                    ? 'bg-teal-500 text-white shadow-md'
                    : 'text-slate-200 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Tag className="h-3.5 w-3.5" /> Fee Categories ({feeStructures.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveSubTab('ledger')}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                  activeSubTab === 'ledger'
                    ? 'bg-teal-500 text-white shadow-md'
                    : 'text-slate-200 hover:bg-white/10 hover:text-white'
                }`}
              >
                <FileText className="h-3.5 w-3.5" /> Accounting Ledger
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => setActiveSubTab('student-portal')}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
              activeSubTab === 'student-portal'
                ? 'bg-teal-500 text-white shadow-md'
                : 'text-slate-200 hover:bg-white/10 hover:text-white'
            }`}
          >
            <GraduationCap className="h-3.5 w-3.5" /> {isStudentOrParent ? 'My Invoices & Dues' : 'Student Dues Portal'}
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4.5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Collections</span>
            <span className="rounded-xl bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 font-mono text-xl font-black text-slate-900 dark:text-white">₹{totalCollections.toLocaleString()}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">{feePayments.filter(p => p.status === 'Paid').length} paid receipts processed</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4.5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Outstanding Dues</span>
            <span className="rounded-xl bg-amber-50 p-2 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
              <AlertCircle className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 font-mono text-xl font-black text-amber-600 dark:text-amber-400">₹{totalPendingDues.toLocaleString()}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">{feePayments.filter(p => p.status === 'Pending' || p.status === 'Partial').length} pending balance invoices</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4.5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Fee Structures</span>
            <span className="rounded-xl bg-teal-50 p-2 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400">
              <Layers className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 font-mono text-xl font-black text-slate-900 dark:text-white">{feeStructures.length}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Across {departments.length} departments & campus</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4.5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Active Categories</span>
            <span className="rounded-xl bg-purple-50 p-2 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400">
              <Tag className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 font-mono text-xl font-black text-purple-600 dark:text-purple-400">{allCategories.length}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Tuition, Hostel, Transport, Lab, Exam...</p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: RECORD PAYMENT FORM & QUICK AUDIT LEDGER */}
      {/* ========================================================================= */}
      {activeSubTab === 'collect' && isAccountantOrAdmin && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Collect Payment Form */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-sans text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-teal-600 dark:text-teal-400" /> Record Student Payment
                </h3>
                <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-700 dark:bg-teal-950/40 dark:text-teal-300">
                  Bursar Desk
                </span>
              </div>

              <form onSubmit={handleCollectFee} className="space-y-4">
                {/* Student Selector */}
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Select Student Record</label>
                  <select
                    value={selectedStudent}
                    onChange={(e) => setSelectedStudent(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-semibold focus:bg-white focus:outline-teal-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  >
                    {students.map(s => {
                      const u = users.find(user => user.id === s.userId);
                      const dept = departments.find(d => d.id === s.departmentId);
                      return (
                        <option key={s.id} value={s.id}>
                          {u?.name} ({s.rollNo}) - {dept?.code || 'GEN'} Sem {s.currentSemester || 1}
                        </option>
                      );
                    })}
                  </select>
                  {selectedStudentObj && (
                    <div className="mt-1.5 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                      <span>Dept: <strong className="text-slate-800 dark:text-slate-200">{departments.find(d => d.id === selectedStudentDeptId)?.name || 'General'}</strong></span>
                      <span>•</span>
                      <span>Semester: <strong className="text-slate-800 dark:text-slate-200">{selectedStudentSem || 1}</strong></span>
                    </div>
                  )}
                </div>

                {/* Fee Category Structure Selector */}
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                    Fee Category Structure
                  </label>
                  <select
                    value={selectedFee}
                    onChange={(e) => handleFeeSelectionChange(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-semibold focus:bg-white focus:outline-teal-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  >
                    {/* Department Specific Fees */}
                    {feeOptions.filter(f => f.departmentId && f.departmentId === selectedStudentDeptId).length > 0 && (
                      <optgroup label="Department Applicable Fees">
                        {feeOptions
                          .filter(f => f.departmentId && f.departmentId === selectedStudentDeptId)
                          .map(f => (
                            <option key={f.id} value={f.id}>
                              [{f.category || 'Tuition'}] {f.name} - ₹{f.amount}
                            </option>
                          ))}
                      </optgroup>
                    )}

                    {/* General Campus Fees */}
                    {feeOptions.filter(f => !f.departmentId || f.departmentId === '').length > 0 && (
                      <optgroup label="General Campus & Facility Fees">
                        {feeOptions
                          .filter(f => !f.departmentId || f.departmentId === '')
                          .map(f => (
                            <option key={f.id} value={f.id}>
                              [{f.category || 'Campus'}] {f.name} - ₹{f.amount}
                            </option>
                          ))}
                      </optgroup>
                    )}

                    {/* Other Department Fees (in case needed for cross-enrolled / transfer students) */}
                    {feeOptions.filter(f => f.departmentId && f.departmentId !== selectedStudentDeptId).length > 0 && (
                      <optgroup label="Other Department Structures">
                        {feeOptions
                          .filter(f => f.departmentId && f.departmentId !== selectedStudentDeptId)
                          .map(f => {
                            const d = departments.find(dep => dep.id === f.departmentId);
                            return (
                              <option key={f.id} value={f.id}>
                                [{d?.code || 'Dept'}] {f.name} - ₹{f.amount}
                              </option>
                            );
                          })}
                      </optgroup>
                    )}
                  </select>
                </div>

                {/* Selected Fee Structure Detail Preview */}
                {(() => {
                  const selectedStruct = feeStructures.find(f => f.id === selectedFee);
                  if (!selectedStruct) return null;
                  const catStyle = CATEGORY_COLORS[selectedStruct.category || 'Tuition'] || CATEGORY_COLORS.Tuition;
                  const dept = departments.find(d => d.id === selectedStruct.departmentId);
                  return (
                    <div className={`p-3.5 rounded-xl border ${catStyle.border} ${catStyle.bg} space-y-2`}>
                      <div className="flex items-center justify-between">
                        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold ${catStyle.text} ring-1 ring-inset ${catStyle.ring}`}>
                          {selectedStruct.category || 'Tuition'}
                        </span>
                        <span className="font-mono text-sm font-black text-slate-900 dark:text-white">
                          ₹{selectedStruct.amount.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{selectedStruct.name}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">{selectedStruct.description}</p>
                      <div className="flex items-center gap-2 pt-1 text-[10px] text-slate-500 dark:text-slate-400">
                        <span>Target: <strong>{dept ? `${dept.name} (${dept.code})` : 'All Departments / Campus'}</strong></span>
                        <span>•</span>
                        <span>Semester: <strong>{selectedStruct.semester ? `Semester ${selectedStruct.semester}` : 'All Semesters / Annual'}</strong></span>
                      </div>
                    </div>
                  );
                })()}

                {/* Amount Paid / Custom Amount */}
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                    Amount Received (₹)
                  </label>
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="Enter amount settled"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono font-bold focus:bg-white focus:outline-teal-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Payment Method</label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold focus:bg-white focus:outline-teal-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  >
                    <option value="Credit Card">Credit / Debit Card</option>
                    <option value="UPI Pay">UPI / Mobile Wallet (GPay, PhonePe, Paytm)</option>
                    <option value="Net Banking">Net Banking / Direct Transfer</option>
                    <option value="Cash Deposit">Bank Cash Deposit Counter</option>
                    <option value="Demand Draft">Demand Draft (DD) / NEFT / RTGS</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-teal-600 py-3 text-xs font-bold text-white shadow-md hover:bg-teal-700 active:scale-[0.99] transition-all"
                >
                  <CheckCircle className="h-4 w-4" /> Record Payment & Issue Official Receipt
                </button>
              </form>
            </div>
          </div>

          {/* Quick Accounting Ledger */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 lg:col-span-2 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="font-sans text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="h-4 w-4 text-teal-600" /> Recent University Fee Transactions
              </h3>
              <button
                onClick={() => setActiveSubTab('ledger')}
                className="text-xs font-bold text-teal-600 hover:underline flex items-center gap-1"
              >
                View Complete Ledger <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/40 font-bold uppercase text-slate-400">
                    <th className="px-3.5 py-3">Receipt ID</th>
                    <th className="px-3.5 py-3">Student Name</th>
                    <th className="px-3.5 py-3">Category & Structure</th>
                    <th className="px-3.5 py-3 text-center">Amount Paid</th>
                    <th className="px-3.5 py-3 text-center">Status</th>
                    <th className="px-3.5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {feePayments.slice(0, 8).map(pay => {
                    const student = students.find(s => s.id === pay.studentId);
                    const stuUser = users.find(u => u.id === student?.userId);
                    const structure = feeStructures.find(f => f.id === pay.feeStructureId);
                    const catStyle = CATEGORY_COLORS[structure?.category || 'Tuition'] || CATEGORY_COLORS.Tuition;
                    return (
                      <tr key={pay.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="px-3.5 py-3 font-mono font-bold text-slate-400">{pay.receiptNumber || 'N/A'}</td>
                        <td className="px-3.5 py-3">
                          <p className="font-bold text-slate-900 dark:text-white">{stuUser?.name || 'Student'}</p>
                          <span className="font-mono text-[10px] text-slate-400">{student?.rollNo || student?.id}</span>
                        </td>
                        <td className="px-3.5 py-3">
                          <div className="flex items-center gap-1.5">
                            <span className={`inline-flex items-center rounded-md px-1.5 py-0.2 text-[9px] font-bold ${catStyle.text} ${catStyle.bg}`}>
                              {structure?.category || 'Tuition'}
                            </span>
                            <span className="text-slate-700 dark:text-slate-300 truncate max-w-[150px]">{structure?.name || 'Fee'}</span>
                          </div>
                        </td>
                        <td className="px-3.5 py-3 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          ₹{pay.amountPaid.toFixed(2)}
                        </td>
                        <td className="px-3.5 py-3 text-center">
                          <span className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[10px] font-bold ${
                            pay.status === 'Paid'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                              : pay.status === 'Partial'
                              ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                              : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                          }`}>
                            {pay.status}
                          </span>
                        </td>
                        <td className="px-3.5 py-3 text-right">
                          <button
                            onClick={() => setReceiptModalPay(pay)}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 shadow-xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200"
                          >
                            <Printer className="h-3 w-3 text-teal-600" /> Receipt
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

      {/* ========================================================================= */}
      {/* TAB 2: MASTER FEE CATEGORIES & STRUCTURES MANAGEMENT */}
      {/* ========================================================================= */}
      {activeSubTab === 'structures' && isAccountantOrAdmin && (
        <div className="space-y-6">
          {/* Controls & Filter Bar */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-sans text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Tag className="h-4 w-4 text-teal-600" /> Master Institutional Fee Structures ({filteredStructuresForManagement.length})
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configure tuition rates, lab fees, hostel rates, transport tariffs, and examination dues across departments and semesters.
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenAddStructureModal}
                className="flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-teal-700 transition-all shrink-0"
              >
                <Plus className="h-4 w-4" /> Add Fee Category Structure
              </button>
            </div>

            {/* Filter Row */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 pt-2 border-t border-slate-100 dark:border-slate-800">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search fee structures..."
                  value={structureSearch}
                  onChange={(e) => setStructureSearch(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs font-semibold focus:bg-white focus:outline-teal-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              {/* Category Filter */}
              <div>
                <select
                  value={structureCatFilter}
                  onChange={(e) => setStructureCatFilter(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold focus:bg-white focus:outline-teal-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                >
                  <option value="All">All Fee Categories</option>
                  <option value="Tuition">Tuition Fees</option>
                  <option value="Hostel">Hostel & Accommodation</option>
                  <option value="Transport">Campus Transport</option>
                  <option value="Examination">Examination Fees</option>
                  <option value="Laboratory">Laboratory & Computing</option>
                  <option value="Library">Library Resources</option>
                  <option value="Sports">Sports & Fitness</option>
                  <option value="Miscellaneous">Miscellaneous / Clubs</option>
                </select>
              </div>

              {/* Department Filter */}
              <div>
                <select
                  value={structureDeptFilter}
                  onChange={(e) => setStructureDeptFilter(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold focus:bg-white focus:outline-teal-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                >
                  <option value="All">All Departments</option>
                  <option value="General">General Campus (No Dept)</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                  ))}
                </select>
              </div>

              {/* Semester Filter */}
              <div>
                <select
                  value={structureSemFilter}
                  onChange={(e) => setStructureSemFilter(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold focus:bg-white focus:outline-teal-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                >
                  <option value="All">All Semesters</option>
                  <option value="0">Annual / Campus-wide (Sem 0)</option>
                  <option value="1">Semester 1</option>
                  <option value="2">Semester 2</option>
                  <option value="3">Semester 3</option>
                  <option value="4">Semester 4</option>
                  <option value="5">Semester 5</option>
                  <option value="6">Semester 6</option>
                  <option value="7">Semester 7</option>
                  <option value="8">Semester 8</option>
                </select>
              </div>
            </div>
          </div>

          {/* Fee Structures Grid Cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredStructuresForManagement.map(struct => {
              const catStyle = CATEGORY_COLORS[struct.category || 'Tuition'] || CATEGORY_COLORS.Tuition;
              const dept = departments.find(d => d.id === struct.departmentId);
              return (
                <div
                  key={struct.id}
                  className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="space-y-3">
                    {/* Category Badge & Amount */}
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-[10px] font-bold ${catStyle.text} ${catStyle.bg} ring-1 ring-inset ${catStyle.ring}`}>
                        {struct.category || 'Tuition'}
                      </span>
                      <span className="font-mono text-base font-black text-teal-600 dark:text-teal-400">
                        ₹{struct.amount.toLocaleString()}
                      </span>
                    </div>

                    {/* Structure Name & Description */}
                    <div>
                      <h4 className="font-sans text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                        {struct.name}
                      </h4>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {struct.description || 'Standard institutional fee schedule.'}
                      </p>
                    </div>

                    {/* Department & Semester Meta */}
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1 font-semibold">
                        <Building2 className="h-3.5 w-3.5 text-slate-400" />
                        {dept ? `${dept.code}` : 'Campus-Wide'}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-semibold">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        {struct.semester ? `Semester ${struct.semester}` : 'All Semesters'}
                      </span>
                    </div>
                  </div>

                  {/* Actions (Edit / Delete) */}
                  <div className="mt-4 flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => handleOpenEditStructureModal(struct)}
                      className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Edit3 className="h-3.5 w-3.5 text-teal-600" /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteStructure(struct.id)}
                      className="flex items-center gap-1 rounded-xl border border-rose-100 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-100 dark:border-rose-900/30 dark:bg-rose-950/20 dark:text-rose-400 dark:hover:bg-rose-950/40 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredStructuresForManagement.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
              <Tag className="h-10 w-10 text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No Fee Structures Found</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">No fee structures match your search or filter criteria. Try adjusting your filters or add a new structure.</p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: ACCOUNTING TRANSACTIONS LEDGER */}
      {/* ========================================================================= */}
      {activeSubTab === 'ledger' && isAccountantOrAdmin && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-sans text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="h-4 w-4 text-teal-600" /> Complete University Accounting Ledger ({filteredPaymentsForLedger.length})
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Detailed financial records of student payments, payment modes, receipt numbers, and settlement timestamps.
                </p>
              </div>

              {/* Status & Method Filter */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by name, roll no, receipt..."
                    value={ledgerSearch}
                    onChange={(e) => setLedgerSearch(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs font-semibold focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>

                <select
                  value={ledgerStatusFilter}
                  onChange={(e) => setLedgerStatusFilter(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                >
                  <option value="All">All Statuses</option>
                  <option value="Paid">Paid</option>
                  <option value="Partial">Partial</option>
                  <option value="Pending">Pending</option>
                </select>

                <select
                  value={ledgerMethodFilter}
                  onChange={(e) => setLedgerMethodFilter(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                >
                  <option value="All">All Methods</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Net Banking">Net Banking</option>
                  <option value="UPI Pay">UPI</option>
                  <option value="Cash Deposit">Cash Deposit</option>
                  <option value="Demand Draft">Demand Draft</option>
                </select>
              </div>
            </div>

            {/* Full Ledger Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/40 font-bold uppercase text-slate-400">
                    <th className="px-4 py-3">Receipt Ref</th>
                    <th className="px-4 py-3">Student Name</th>
                    <th className="px-4 py-3">Department</th>
                    <th className="px-4 py-3">Category & Structure</th>
                    <th className="px-4 py-3">Payment Date</th>
                    <th className="px-4 py-3">Method</th>
                    <th className="px-4 py-3 text-center">Amount Paid</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {filteredPaymentsForLedger.map(pay => {
                    const student = students.find(s => s.id === pay.studentId);
                    const stuUser = users.find(u => u.id === student?.userId);
                    const structure = feeStructures.find(f => f.id === pay.feeStructureId);
                    const dept = departments.find(d => d.id === student?.departmentId);
                    const catStyle = CATEGORY_COLORS[structure?.category || 'Tuition'] || CATEGORY_COLORS.Tuition;
                    return (
                      <tr key={pay.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="px-4 py-3 font-mono font-bold text-slate-500 dark:text-slate-400">
                          {pay.receiptNumber || 'RCPT-PENDING'}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-bold text-slate-900 dark:text-white">{stuUser?.name || 'Student'}</p>
                          <span className="font-mono text-[10px] text-slate-400">{student?.rollNo || student?.id}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            {dept?.code || 'GEN'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <span className={`inline-flex items-center rounded-md px-1.5 py-0.2 text-[9px] font-bold ${catStyle.text} ${catStyle.bg}`}>
                              {structure?.category || 'Tuition'}
                            </span>
                            <span className="text-slate-800 dark:text-slate-200">{structure?.name || 'Academic Fee'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-500 dark:text-slate-400">
                          {pay.paymentDate || '-'}
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                          {pay.paymentMethod || 'Online'}
                        </td>
                        <td className="px-4 py-3 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          ₹{pay.amountPaid.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-0.5 text-[10px] font-bold ${
                            pay.status === 'Paid'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                              : pay.status === 'Partial'
                              ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                              : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                          }`}>
                            {pay.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => setReceiptModalPay(pay)}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 shadow-xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200"
                          >
                            <Printer className="h-3 w-3 text-teal-600" /> View
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

      {/* ========================================================================= */}
      {/* TAB 4: STUDENT / PARENT DUES & SELF-SERVICE PORTAL */}
      {/* ========================================================================= */}
      {activeSubTab === 'student-portal' && (
        <div className="space-y-6">
          {/* Admin student switcher banner */}
          {isAccountantOrAdmin && (
            <div className="flex items-center justify-between rounded-2xl border border-teal-200 bg-teal-50/50 p-4 dark:border-teal-900/40 dark:bg-teal-950/20">
              <div className="flex items-center gap-2 text-xs font-semibold text-teal-900 dark:text-teal-200">
                <Eye className="h-4 w-4 text-teal-600" />
                <span>Admin Preview: Viewing student dues & invoice portal for</span>
              </div>
              <select
                value={previewStudentId}
                onChange={(e) => setPreviewStudentId(e.target.value)}
                className="rounded-xl border border-teal-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 shadow-xs dark:border-teal-800 dark:bg-slate-900 dark:text-white"
              >
                {students.map(s => {
                  const u = users.find(user => user.id === s.userId);
                  return (
                    <option key={s.id} value={s.id}>
                      {u?.name} ({s.rollNo})
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Student Invoices & Applicable Dues */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-sans text-sm font-bold text-slate-900 dark:text-white">
                    Semester Fee Schedule & Dues
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {portalStudentUser?.name} ({portalStudentObj?.rollNo}) • {portalStudentDept?.name || 'CSE'} Sem {portalStudentObj?.currentSemester || 1}
                  </p>
                </div>
                <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-[10px] font-bold text-teal-700 dark:bg-teal-950/40 dark:text-teal-300">
                  AY 2025-2026
                </span>
              </div>

              <div className="space-y-3.5 max-h-[550px] overflow-y-auto pr-1">
                {portalApplicableStructures.map(struct => {
                  const existingPayment = feePayments.find(
                    p => p.studentId === portalStudentId && p.feeStructureId === struct.id
                  );
                  const isPaid = existingPayment && existingPayment.status === 'Paid';
                  const isPartial = existingPayment && existingPayment.status === 'Partial';
                  const catStyle = CATEGORY_COLORS[struct.category || 'Tuition'] || CATEGORY_COLORS.Tuition;

                  return (
                    <div
                      key={struct.id}
                      className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 rounded-2xl space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className={`inline-flex items-center rounded-md px-1.5 py-0.2 text-[9px] font-bold ${catStyle.text} ${catStyle.bg}`}>
                              {struct.category || 'Tuition'}
                            </span>
                            <h4 className="font-bold text-xs text-slate-900 dark:text-white">{struct.name}</h4>
                          </div>
                          <p className="text-[10px] text-slate-400 leading-relaxed">{struct.description}</p>
                        </div>
                        <span className="font-mono text-xs font-black text-slate-900 dark:text-white shrink-0">
                          ₹{struct.amount.toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-200/50 dark:border-slate-800 pt-2.5">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-bold ${
                          isPaid
                            ? 'text-emerald-600'
                            : isPartial
                            ? 'text-amber-600'
                            : 'text-rose-500'
                        }`}>
                          {isPaid ? (
                            <>
                              <CheckCircle className="h-3.5 w-3.5" /> Paid in Full
                            </>
                          ) : isPartial ? (
                            <>
                              <AlertCircle className="h-3.5 w-3.5" /> Partial (Paid ₹{existingPayment.amountPaid})
                            </>
                          ) : (
                            <>
                              <AlertCircle className="h-3.5 w-3.5 animate-bounce" /> Outstanding Balance
                            </>
                          )}
                        </span>

                        {isPaid ? (
                          <button
                            type="button"
                            onClick={() => setReceiptModalPay(existingPayment)}
                            className="flex items-center gap-1 text-xs font-bold text-teal-600 hover:underline"
                          >
                            <Printer className="h-3.5 w-3.5" /> View Receipt
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleStudentPayStructure(portalStudentId, struct.id)}
                            className="rounded-xl bg-teal-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-teal-700 active:scale-95 transition-all"
                          >
                            Pay Online (₹{struct.amount - (existingPayment?.amountPaid || 0)})
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Student Receipts & Financial Logs */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-sans text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BookmarkCheck className="h-4 w-4 text-teal-600" /> Settled Payment Receipts
                </h3>
                <span className="text-xs font-semibold text-slate-400">
                  {feePayments.filter(p => p.studentId === portalStudentId && p.status === 'Paid').length} Receipts
                </span>
              </div>

              <div className="space-y-3">
                {feePayments
                  .filter(p => p.studentId === portalStudentId && p.status === 'Paid')
                  .map(pay => {
                    const f = feeStructures.find(struct => struct.id === pay.feeStructureId);
                    return (
                      <div
                        key={pay.id}
                        className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800"
                      >
                        <div className="space-y-0.5">
                          <p className="font-semibold text-xs text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
                            {f?.name || 'Academic Fee'}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                            <span>RCPT: {pay.receiptNumber}</span>
                            <span>•</span>
                            <span>{pay.paymentDate}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="font-mono text-xs font-bold text-emerald-600">₹{pay.amountPaid.toFixed(2)}</p>
                            <span className="text-[9px] text-slate-400">{pay.paymentMethod}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setReceiptModalPay(pay)}
                            className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300"
                            title="Print / View Receipt"
                          >
                            <Printer className="h-3.5 w-3.5 text-teal-600" />
                          </button>
                        </div>
                      </div>
                    );
                  })}

                {feePayments.filter(p => p.studentId === portalStudentId && p.status === 'Paid').length === 0 && (
                  <div className="py-12 text-center text-slate-400 text-xs">
                    No paid transactions on file yet for this student.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD / EDIT FEE STRUCTURE MODAL */}
      {/* ========================================================================= */}
      {showStructureModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
              <h3 className="font-sans text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Tag className="h-4 w-4 text-teal-600" />
                {editingStructure ? 'Edit Fee Category Structure' : 'Add New Fee Category Structure'}
              </h3>
              <button
                type="button"
                onClick={() => setShowStructureModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStructure} className="p-6 space-y-4">
              {/* Structure Name */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  Structure Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tuition Fee - IT Semester 4, Campus Hostel AC"
                  value={structureFormData.name || ''}
                  onChange={(e) => setStructureFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold focus:bg-white focus:outline-teal-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Fee Category */}
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                    Fee Category Type
                  </label>
                  <select
                    value={structureFormData.category || 'Tuition'}
                    onChange={(e) => setStructureFormData(prev => ({ ...prev, category: e.target.value as any }))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold focus:bg-white focus:outline-teal-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  >
                    <option value="Tuition">Tuition Fee</option>
                    <option value="Hostel">Hostel & Accommodation</option>
                    <option value="Transport">Campus Transport</option>
                    <option value="Examination">Examination Fee</option>
                    <option value="Laboratory">Laboratory & Hardware</option>
                    <option value="Library">Library & Digital Resources</option>
                    <option value="Sports">Sports & Gymnasium</option>
                    <option value="Miscellaneous">Miscellaneous / Clubs</option>
                  </select>
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                    Fee Amount (₹) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="1"
                    placeholder="e.g. 3800"
                    value={structureFormData.amount || ''}
                    onChange={(e) => setStructureFormData(prev => ({ ...prev, amount: Number(e.target.value) }))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono font-bold focus:bg-white focus:outline-teal-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Department */}
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                    Target Department
                  </label>
                  <select
                    value={structureFormData.departmentId || ''}
                    onChange={(e) => setStructureFormData(prev => ({ ...prev, departmentId: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold focus:bg-white focus:outline-teal-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  >
                    <option value="">All Departments (General Campus)</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                    ))}
                  </select>
                </div>

                {/* Target Semester */}
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                    Target Semester
                  </label>
                  <select
                    value={structureFormData.semester || 0}
                    onChange={(e) => setStructureFormData(prev => ({ ...prev, semester: Number(e.target.value) }))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold focus:bg-white focus:outline-teal-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  >
                    <option value={0}>All Semesters / Annual (0)</option>
                    <option value={1}>Semester 1</option>
                    <option value={2}>Semester 2</option>
                    <option value={3}>Semester 3</option>
                    <option value={4}>Semester 4</option>
                    <option value={5}>Semester 5</option>
                    <option value={6}>Semester 6</option>
                    <option value={7}>Semester 7</option>
                    <option value={8}>Semester 8</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  Description / Reference Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Provide institutional details or notes for this fee structure..."
                  value={structureFormData.description || ''}
                  onChange={(e) => setStructureFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold focus:bg-white focus:outline-teal-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowStructureModal(false)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-teal-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-teal-700 transition-colors"
                >
                  {editingStructure ? 'Save Changes' : 'Create Fee Structure'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* V.S.B. COLLEGE ONLINE UPI QR CODE PAYMENT MODAL */}
      {/* ========================================================================= */}
      {qrPaymentModalData && (() => {
        const modalStudent = students.find(s => s.id === qrPaymentModalData.studentId);
        const modalUser = modalStudent ? users.find(u => u.id === modalStudent.userId) : null;
        const modalStudentName = modalUser ? `${modalUser.name} (${modalStudent?.rollNo || modalStudent?.id})` : 'Student Candidate';
        const fee = feeStructures.find(f => f.id === qrPaymentModalData.feeStructureId);
        const dept = departments.find(d => d.id === modalStudent?.departmentId);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
            <div className="relative max-h-[92vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/20 text-teal-600 dark:text-teal-400 border border-teal-500/30">
                    <QrCode className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Online Payment Gateway
                    </h3>
                    <p className="text-[11px] text-teal-600 dark:text-teal-400 font-mono flex items-center gap-1 font-semibold">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      V.S.B. Engineering College Bursar
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setQrPaymentModalData(null)}
                  className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Student & Fee Summary */}
              <div className="rounded-2xl bg-slate-50 p-3.5 text-xs font-mono dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400 uppercase text-[10px]">Candidate</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{modalStudentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 uppercase text-[10px]">Department</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{dept?.name || 'Campus Wide'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 uppercase text-[10px]">Fee Item</span>
                  <span className="font-bold text-teal-700 dark:text-teal-300">{fee?.category || 'Tuition'} - {fee?.name || 'Academic Fee'}</span>
                </div>
                <div className="flex justify-between pt-1.5 border-t border-slate-200/60 dark:border-slate-800 items-center">
                  <span className="text-slate-500 font-sans font-bold">Total Amount Payable</span>
                  <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                    ₹{qrPaymentModalData.amount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* The Official VSB College UPI QR Code Container */}
              <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3 text-center">
                <div className="relative p-2.5 bg-white rounded-2xl shadow-md border-2 border-teal-500/40 max-w-[230px]">
                  <img
                    src={collegePaymentQr || "/college_payment_qr.png"}
                    alt="V.S.B. Engineering College Official Payment QR Code"
                    className="w-52 h-52 object-contain rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Scan & Pay using Google Pay, PhonePe, Paytm, or BHIM
                  </p>
                  <div className="flex items-center justify-center gap-1.5 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    <span>UPI ID: <strong className="text-teal-600 dark:text-teal-400">vsbcollege.fees@upi</strong></span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText('vsbcollege.fees@upi');
                        setCopiedUpi(true);
                        setTimeout(() => setCopiedUpi(false), 2000);
                      }}
                      className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
                      title="Copy UPI ID"
                    >
                      {copiedUpi ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                    </button>
                  </div>
                </div>

                {/* Supported Apps Badges */}
                <div className="flex flex-wrap items-center justify-center gap-1.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                  <span className="px-2 py-0.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">Google Pay</span>
                  <span className="px-2 py-0.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">PhonePe</span>
                  <span className="px-2 py-0.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">Paytm</span>
                  <span className="px-2 py-0.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">BHIM / Any UPI</span>
                </div>
              </div>

              {/* UTR / Transaction Ref Input */}
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                  UPI Ref / UTR Transaction ID
                </label>
                <input
                  type="text"
                  value={qrPaymentModalData.utrNumber}
                  onChange={(e) => setQrPaymentModalData({ ...qrPaymentModalData, utrNumber: e.target.value })}
                  placeholder="e.g. 425109849201 or VSB-90412"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono font-semibold text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setQrPaymentModalData(null)}
                  className="rounded-xl px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const paymentRecord: FeePayment = {
                      id: qrPaymentModalData.existingPaymentId || `pay-${Date.now()}`,
                      studentId: qrPaymentModalData.studentId,
                      feeStructureId: qrPaymentModalData.feeStructureId,
                      amountPaid: qrPaymentModalData.amount,
                      paymentDate: new Date().toISOString().split('T')[0],
                      paymentMethod: qrPaymentModalData.utrNumber ? `UPI / QR (${qrPaymentModalData.utrNumber})` : 'UPI / QR (VSB Official)',
                      status: 'Paid',
                      receiptNumber: `RCPT-2026-${Math.floor(10000 + Math.random() * 90000)}`
                    };

                    onAddPayment(paymentRecord);
                    setQrPaymentModalData(null);
                    setReceiptModalPay(paymentRecord);
                  }}
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:from-teal-500 hover:to-emerald-500 transition-all cursor-pointer"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>I Have Paid — Show Transaction Receipt</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* PRINTABLE TRANSACTION RECEIPT MODAL */}
      {/* ========================================================================= */}
      {receiptModalPay && (() => {
        const modalStudent = students.find(s => s.id === receiptModalPay.studentId);
        const modalUser = modalStudent ? users.find(u => u.id === modalStudent.userId) : null;
        const modalStudentName = modalUser ? `${modalUser.name} (${modalStudent?.rollNo || modalStudent?.id})` : 'Student Registry';
        const fee = feeStructures.find(f => f.id === receiptModalPay.feeStructureId);
        const dept = departments.find(d => d.id === modalStudent?.departmentId);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
                <h3 className="font-sans text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Printer className="h-4 w-4 text-teal-600" /> Transaction Receipt
                </h3>
                <button
                  type="button"
                  onClick={() => setReceiptModalPay(null)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Printable Receipt layout */}
              <div className="p-6 space-y-5">
                <div id="printable-receipt" className="border-2 border-dashed border-slate-200 p-5 rounded-2xl dark:border-slate-800 text-xs font-sans space-y-3.5 bg-slate-50/50 dark:bg-slate-950/50 text-slate-800 dark:text-slate-200">
                  <div className="text-center border-b pb-3 mb-3 border-slate-200 dark:border-slate-800">
                    <h4 className="font-sans font-black uppercase text-teal-600 tracking-wider">University Bursar Office</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-mono">Official Reference: {receiptModalPay.receiptNumber}</p>
                  </div>

                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-400 uppercase text-[10px]">PAID BY</span>
                    <span className="font-bold text-slate-800 dark:text-white">{modalStudentName}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-400 uppercase text-[10px]">DEPARTMENT</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{dept?.name || 'Campus Wide'}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-400 uppercase text-[10px]">FEE CATEGORY</span>
                    <span className="font-bold text-teal-700 dark:text-teal-300">{fee?.category || 'Tuition'} - {fee?.name || 'Fee'}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-400 uppercase text-[10px]">PAYMENT DATE</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">{receiptModalPay.paymentDate}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-400 uppercase text-[10px]">PAYMENT METHOD</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">{receiptModalPay.paymentMethod}</span>
                  </div>

                  <div className="border-t border-dashed border-slate-200 dark:border-slate-800 pt-3 flex justify-between items-center text-sm">
                    <span className="font-bold text-slate-800 dark:text-white">Amount Settled</span>
                    <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-base">
                      ₹{receiptModalPay.amountPaid.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Print Options Toolbar */}
                <div className="space-y-2 pt-1">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (onPrintReceipt) {
                          onPrintReceipt(receiptModalPay);
                          setReceiptModalPay(null);
                        } else {
                          handlePrint(receiptModalPay);
                        }
                      }}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-teal-200 bg-teal-50 dark:bg-teal-950/40 dark:border-teal-800 py-2.5 text-xs font-bold text-teal-700 dark:text-teal-300 hover:bg-teal-100 transition-all shadow-xs"
                    >
                      <Printer className="h-3.5 w-3.5" /> Print Receipt
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDownloadHTML(receiptModalPay)}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <FileDown className="h-3.5 w-3.5" /> Download HTML
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopyText(receiptModalPay)}
                      className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-bold transition-all ${
                        copiedReceipt
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900 dark:text-emerald-400'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {copiedReceipt ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-600" /> Copied Text!
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" /> Copy Text
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setReceiptModalPay(null)}
                      className="flex-1 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-center text-xs font-bold text-white dark:text-slate-950 py-2 transition-colors shadow-sm"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

// ==========================================
// 2. LIBRARY CATALOG SUB-COMPONENT
// ==========================================
interface LibraryCatalogProps {
  books: Book[];
  bookIssues: BookIssue[];
  students: StudentProfile[];
  users: User[];
  role: string;
  onAddBook: (newBook: Book) => void;
  onIssueBook: (newIssue: BookIssue) => void;
  onReturnBook: (issueId: string) => void;
}

export function LibraryCatalog({
  books,
  bookIssues,
  students,
  users,
  role,
  onAddBook,
  onIssueBook,
  onReturnBook
}: LibraryCatalogProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);

  // Add Book state
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [isbn, setIsbn] = useState('');
  const [category, setCategory] = useState('Computer Science');
  const [copies, setCopies] = useState(5);

  // Issue Book state
  const [selectedBook, setSelectedBook] = useState(books[0]?.id || '');
  const [selectedStudent, setSelectedStudent] = useState(students[0]?.id || '');

  const isLibrarian = role === 'Librarian' || role === 'Admin';

  const handleAddBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !isbn.trim()) return;

    const newBook: Book = {
      id: `b-${Date.now()}`,
      title,
      author,
      isbn,
      category,
      totalCopies: copies,
      availableCopies: copies
    };
    onAddBook(newBook);
    setShowAddModal(false);
  };

  const handleIssueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 14); // 14 days loan period

    const newIssue: BookIssue = {
      id: `iss-${Date.now()}`,
      bookId: selectedBook,
      studentId: selectedStudent,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: futureDate.toISOString().split('T')[0],
      fineAmount: 0.0,
      status: 'Issued'
    };

    onIssueBook(newIssue);
    setShowIssueModal(false);
  };

  const filteredBooks = books.filter(b =>
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute top-3 left-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search catalog by title, author, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-4 pl-10 text-xs font-semibold text-slate-800 focus:border-teal-500 focus:outline-hidden dark:border-slate-800 dark:bg-slate-900 dark:text-white"
          />
        </div>

        {isLibrarian && (
          <div className="flex gap-2">
            <button
              onClick={() => setShowIssueModal(true)}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs"
            >
              <BookmarkCheck className="h-4.5 w-4.5" /> Issue Book Item
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-teal-700 shadow-xs"
            >
              <PlusCircle className="h-4.5 w-4.5" /> Catalogue Book
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Catalog list */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
          <h3 className="font-sans text-sm font-bold text-slate-900 dark:text-white mb-4">University Book Catalog</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {filteredBooks.map(book => (
              <div key={book.id} className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 rounded-2xl relative">
                <p className="text-[10px] font-mono font-bold text-teal-600 uppercase tracking-widest">{book.category}</p>
                <h4 className="font-bold text-slate-900 dark:text-white mt-1 line-clamp-1">{book.title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Author: {book.author}</p>
                <div className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-800 flex justify-between text-[11px]">
                  <span className="font-semibold text-slate-400">Copies Stock: </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {book.availableCopies} available / {book.totalCopies} total
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Checked out books desk */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <h3 className="font-sans text-sm font-bold text-slate-900 dark:text-white mb-4">Checked out Book Ledger</h3>
          <div className="space-y-4">
            {bookIssues.map(issue => {
              const book = books.find(b => b.id === issue.bookId);
              const student = students.find(s => s.id === issue.studentId);
              const stuUser = users.find(u => u.id === student?.userId);
              return (
                <div key={issue.id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 dark:bg-slate-950 dark:border-slate-850">
                  <p className="font-bold text-slate-800 dark:text-slate-100 truncate">{book?.title}</p>
                  <p className="text-[10px] text-teal-600 mt-0.5">Borrower: {stuUser?.name}</p>
                  <div className="mt-3 flex justify-between items-center text-[10px]">
                    <span className="font-mono text-slate-400">Due: {issue.dueDate}</span>
                    {issue.status === 'Issued' ? (
                      <button
                        onClick={() => onReturnBook(issue.id)}
                        className="rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 px-2 py-1 font-bold text-[10px]"
                      >
                        Return book
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-600">
                        Returned
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Catalog Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
              <h3 className="font-sans text-sm font-bold text-slate-900 dark:text-white">Catalog Book</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:bg-slate-100 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddBook} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Book Title</label>
                <input
                  type="text"
                  placeholder="e.g. Modern Database Paradigms"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Author Name</label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">ISBN Code</label>
                  <input
                    type="text"
                    placeholder="978-XXXXXXXX"
                    value={isbn}
                    onChange={(e) => setIsbn(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Category Genre</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Electrical">Electrical Engineering</option>
                    <option value="Business">Business Studies</option>
                    <option value="Literature">Literature / Arts</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Total Copies</label>
                  <input
                    type="number"
                    value={copies}
                    onChange={(e) => setCopies(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold dark:border-slate-800"
                >
                  Cancel
                </button>
                <button type="submit" className="rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white shadow-md">
                  Catalogue Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Issue Book Modal */}
      {showIssueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
              <h3 className="font-sans text-sm font-bold text-slate-900 dark:text-white">Issue Material</h3>
              <button onClick={() => setShowIssueModal(false)} className="text-slate-400 hover:bg-slate-100 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleIssueSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Select Book Title</label>
                <select
                  value={selectedBook}
                  onChange={(e) => setSelectedBook(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                >
                  {books.filter(b => b.availableCopies > 0).map(b => (
                    <option key={b.id} value={b.id}>{b.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Borrower Student</label>
                <select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                >
                  {students.map(s => {
                    const u = users.find(user => user.id === s.userId);
                    return <option key={s.id} value={s.id}>{u?.name} ({s.rollNo})</option>;
                  })}
                </select>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowIssueModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold dark:border-slate-800"
                >
                  Cancel
                </button>
                <button type="submit" className="rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white shadow-md animate-pulse">
                  Approve Book Issue
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
// 3. REPORTS AND EXPORT MODULE SUB-COMPONENT
// ==========================================
interface ReportsProps {
  students: StudentProfile[];
  users: User[];
  feePayments: FeePayment[];
  books: Book[];
}

export function Reports({ students, users, feePayments, books }: ReportsProps) {
  const [reportType, setReportType] = useState('Students');

  const exportCSV = () => {
    let headers: string[] = [];
    let rows: string[][] = [];

    if (reportType === 'Students') {
      headers = ['RollNo', 'Name', 'Email', 'CGPA', 'Term'];
      rows = students.map(s => {
        const u = users.find(user => user.id === s.userId);
        return [s.rollNo, u?.name || '', u?.email || '', s.cgpa.toString(), `Semester ${s.currentSemester}`];
      });
    } else if (reportType === 'Payments') {
      headers = ['ReceiptNo', 'Student', 'AmountPaid', 'Date', 'Status'];
      rows = feePayments.map(p => {
        const s = students.find(st => st.id === p.studentId);
        const u = users.find(user => user.id === s?.userId);
        return [p.receiptNumber || 'N/A', u?.name || 'Jane Doe', `₹${p.amountPaid}`, p.paymentDate || 'Pending', p.status];
      });
    } else {
      headers = ['ISBN', 'Title', 'Author', 'TotalCopies', 'Available'];
      rows = books.map(b => [b.isbn, b.title, b.author, b.totalCopies.toString(), b.availableCopies.toString()]);
    }

    const csvContent = "data:text/csv;charset=utf-8,"
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${reportType.toLowerCase()}_report_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-sans text-sm font-bold text-slate-900 dark:text-white">ERP Export Console</h3>
            <p className="text-xs text-slate-400 mt-0.5">Produce raw Excel/CSV spreadsheets instantly.</p>
          </div>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
          >
            <option value="Students">Student Profiles Ledger</option>
            <option value="Payments">Financial Transactions Ledger</option>
            <option value="Library">Library Catalog Inventory</option>
          </select>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/50 dark:bg-slate-950 dark:border-slate-850 space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-600 dark:text-slate-400">Target Records:</span>
            <span className="font-mono font-bold text-teal-600 dark:text-teal-400">
              {reportType === 'Students' ? students.length : reportType === 'Payments' ? feePayments.length : books.length} rows loaded
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-600 dark:text-slate-400">Format Scheme:</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">CSV Spreadsheet format (Excel compatible)</span>
          </div>

          <button
            onClick={exportCSV}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-teal-600 py-3 text-xs font-bold text-white hover:bg-teal-700 shadow-md transition-all mt-4"
          >
            <FileDown className="h-4.5 w-4.5" /> Download Spreadsheet File
          </button>
        </div>
      </div>
    </div>
  );
}

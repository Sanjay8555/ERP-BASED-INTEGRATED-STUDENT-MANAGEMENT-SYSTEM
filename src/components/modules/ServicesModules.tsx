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
  Check
} from 'lucide-react';
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
  departments?: Department[];
  onPrintReceipt?: (payment: FeePayment) => void;
  currentUser?: User;
}

export function FeeCollections({
  feeStructures,
  feePayments,
  students,
  users,
  role,
  onAddPayment,
  onUpdateFeeStructures,
  departments = [],
  onPrintReceipt,
  currentUser
}: FeeCollectionsProps) {
  // Find student profile for the current user (if student)
  const studentProfile = students.find(s => s.userId === currentUser?.id);
  const currentStudentId = studentProfile?.id || 's-1'; // fallback to s-1 for demo if no profile found

  const [selectedStudent, setSelectedStudent] = useState(currentStudentId);
  const [selectedFee, setSelectedFee] = useState('');
  const [payMethod, setPayMethod] = useState('Credit Card');
  const [receiptModalPay, setReceiptModalPay] = useState<FeePayment | null>(null);
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('All');
  const [copiedReceipt, setCopiedReceipt] = useState(false);

  const isAccountant = role === 'Accountant' || role === 'Admin';

  // Find selected student's department
  const currentStudentObj = students.find(s => s.id === selectedStudent);
  const currentStudentDeptId = currentStudentObj?.departmentId;
  
  // Filter fee structures based on student's department
  const filteredFeeStructures = feeStructures.filter(f => 
    !f.departmentId || f.departmentId === currentStudentDeptId
  );

  // Automatically update selectedFee when student or feeStructures change
  useEffect(() => {
    if (filteredFeeStructures.length > 0) {
      const exists = filteredFeeStructures.some(f => f.id === selectedFee);
      if (!exists) {
        setSelectedFee(filteredFeeStructures[0].id);
      }
    } else {
      setSelectedFee('');
    }
  }, [selectedStudent, feeStructures.length]);

  const handleCollectFee = (e: React.FormEvent) => {
    e.preventDefault();
    const fee = feeStructures.find(f => f.id === selectedFee);
    if (!fee) return;

    const newPayment: FeePayment = {
      id: `pay-${Date.now()}`,
      studentId: selectedStudent,
      feeStructureId: selectedFee,
      amountPaid: fee.amount,
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: payMethod,
      status: 'Paid',
      receiptNumber: `RCPT-2026-${Math.floor(10000 + Math.random() * 90000)}`
    };

    onAddPayment(newPayment);
    setReceiptModalPay(newPayment);
  };

  const handlePrint = (pay: FeePayment) => {
    const student = students.find(s => s.id === pay.studentId);
    const sUser = users.find(u => u.id === student?.userId);
    const studentName = sUser ? `${sUser.name} (${student?.rollNo || student?.id})` : 'Jane Doe (s-1)';
    const fee = feeStructures.find(f => f.id === pay.feeStructureId);

    // Create a temporary hidden iframe for printing
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (!doc) return;

    const receiptHtml = `
      <html>
        <head>
          <style>
            body { font-family: sans-serif; padding: 20px; }
            .receipt { border: 2px dashed #ccc; padding: 20px; max-width: 400px; margin: auto; }
            .header { text-align: center; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 20px; }
            .row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
            .label { color: #666; font-weight: bold; }
            .value { color: #333; }
            .total-row { border-top: 1px solid #eee; margin-top: 20px; padding-top: 10px; font-size: 18px; font-weight: bold; }
            .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #999; }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="header">
              <h2 style="color: #0d9488; margin: 0;">University Bursar Office</h2>
              <p style="font-size: 12px; color: #666;">Official Payment Receipt</p>
            </div>
            <div class="row"><span class="label">Receipt No:</span><span class="value">${pay.receiptNumber}</span></div>
            <div class="row"><span class="label">Paid By:</span><span class="value">${studentName}</span></div>
            <div class="row"><span class="label">Fee Type:</span><span class="value">${fee?.name || 'Academic Fee'}</span></div>
            <div class="row"><span class="label">Date:</span><span class="value">${pay.paymentDate}</span></div>
            <div class="row"><span class="label">Method:</span><span class="value">${pay.paymentMethod}</span></div>
            <div class="row"><span class="label">Status:</span><span class="value" style="color: #059669;">${pay.status}</span></div>
            <div class="row total-row"><span class="label">Total Paid:</span><span class="value">₹${pay.amountPaid.toFixed(2)}</span></div>
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

    // Small delay to ensure styles and content are loaded in iframe
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      document.body.removeChild(iframe);
    }, 500);
  };

  const handleDownloadHTML = (pay: FeePayment) => {
    const student = students.find(s => s.id === pay.studentId);
    const sUser = users.find(u => u.id === student?.userId);
    const studentName = sUser ? `${sUser.name} (${student?.rollNo || student?.id})` : 'Jane Doe (s-1)';
    const fee = feeStructures.find(f => f.id === pay.feeStructureId);

    const htmlContent = `<!DOCTYPE html>
<html>
  <head>
    <title>Fee Payment Receipt - ${pay.receiptNumber}</title>
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        color: #1e293b;
        background-color: #f8fafc;
        padding: 40px;
        margin: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
      }
      .receipt {
        border: 2px dashed #cbd5e1;
        padding: 24px;
        border-radius: 12px;
        max-width: 380px;
        width: 100%;
        box-sizing: border-box;
        background-color: #ffffff;
        box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
      }
      .header {
        text-align: center;
        border-bottom: 1px solid #e2e8f0;
        padding-bottom: 16px;
        margin-bottom: 20px;
      }
      .header h2 {
        margin: 0 0 4px 0;
        font-size: 16px;
        font-weight: 800;
        text-transform: uppercase;
        color: #0d9488;
      }
      .header p {
        margin: 0;
        font-size: 11px;
        color: #64748b;
        font-family: monospace;
      }
      .row {
        display: flex;
        justify-content: space-between;
        font-size: 12px;
        margin-bottom: 10px;
      }
      .label {
        color: #64748b;
        font-weight: 500;
      }
      .value {
        color: #1e293b;
        font-weight: 700;
      }
      .value-mono {
        font-family: monospace;
      }
      .divider {
        border-top: 1px solid #e2e8f0;
        margin-top: 16px;
        padding-top: 16px;
      }
      .total-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .total-label {
        font-size: 14px;
        font-weight: 700;
        color: #1e293b;
      }
      .total-value {
        font-family: monospace;
        font-size: 16px;
        font-weight: 900;
        color: #059669;
      }
      .footer {
        text-align: center;
        margin-top: 24px;
        font-size: 10px;
        color: #94a3b8;
      }
      @media print {
        body {
          background-color: #ffffff;
          padding: 0;
          display: block;
          min-height: auto;
        }
        .receipt {
          box-shadow: none;
          border: 2px dashed #cbd5e1;
          margin: 40px auto;
        }
      }
    </style>
  </head>
  <body>
    <div class="receipt">
      <div class="header">
        <h2>University Bursar Office</h2>
        <p>Receipt Reference: ${pay.receiptNumber}</p>
      </div>
      
      <div class="row">
        <span class="label">PAID BY</span>
        <span class="value">${studentName}</span>
      </div>
      <div class="row">
        <span class="label">FEE CATEGORY</span>
        <span class="value">${fee?.name || 'Tuition Fee'}</span>
      </div>
      <div class="row">
        <span class="label">PAYMENT DATE</span>
        <span class="value value-mono">${pay.paymentDate}</span>
      </div>
      <div class="row">
        <span class="label">PAYMENT METHOD</span>
        <span class="value">${pay.paymentMethod}</span>
      </div>
      <div class="row">
        <span class="label">STATUS</span>
        <span class="value" style="color: #059669;">${pay.status}</span>
      </div>

      <div class="divider total-row">
        <span class="total-label">Amount Settled</span>
        <span class="total-value">₹${pay.amountPaid.toFixed(2)}</span>
      </div>
      
      <div class="footer">
        <p>Thank you for your payment!</p>
        <p>This is a computer-generated receipt.</p>
      </div>
    </div>
    <script>
      window.onload = function() {
        window.focus();
        window.print();
      };
    </script>
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
    const studentName = sUser ? `${sUser.name} (${student?.rollNo || student?.id})` : 'Jane Doe (s-1)';
    const fee = feeStructures.find(f => f.id === pay.feeStructureId);

    const text = `=========================================
      UNIVERSITY BURSAR OFFICE
=========================================
Receipt Ref : ${pay.receiptNumber}
Paid By     : ${studentName}
Category    : ${fee?.name || 'Tuition Fee'}
Date        : ${pay.paymentDate}
Method      : ${pay.paymentMethod}
Status      : ${pay.status}
-----------------------------------------
Amount Paid : ₹${pay.amountPaid.toFixed(2)}
=========================================
Thank you for your payment!
This is a computer-generated receipt.`;

    navigator.clipboard.writeText(text).then(() => {
      setCopiedReceipt(true);
      setTimeout(() => setCopiedReceipt(false), 2000);
    });
  };

  const handleStudentPay = (paymentId: string) => {
    const payment = feePayments.find(p => p.id === paymentId);
    if (!payment) return;
    const fee = feeStructures.find(f => f.id === payment.feeStructureId);

    const updatedPayment: FeePayment = {
      ...payment,
      amountPaid: fee?.amount || 0,
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'Credit Card',
      status: 'Paid',
      receiptNumber: `RCPT-2026-${Math.floor(10000 + Math.random() * 90000)}`
    };

    onAddPayment(updatedPayment); // hooks state
    setReceiptModalPay(updatedPayment);
  };

  return (
    <div className="space-y-6">
      {isAccountant ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6">
            {/* Collect Payment Form */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <h3 className="font-sans text-sm font-bold text-slate-900 dark:text-white mb-4">Record Student Payment</h3>
              <form onSubmit={handleCollectFee} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Select Student</label>
                  <select
                    value={selectedStudent}
                    onChange={(e) => setSelectedStudent(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  >
                    {students.map(s => {
                      const u = users.find(user => user.id === s.userId);
                      return <option key={s.id} value={s.id}>{u?.name} ({s.rollNo})</option>;
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Fee Category Structure</label>
                  <select
                    value={selectedFee}
                    onChange={(e) => setSelectedFee(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  >
                    {filteredFeeStructures.map(f => (
                      <option key={f.id} value={f.id}>{f.name} - ₹{f.amount}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Payment Method</label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  >
                    <option value="Credit Card">Credit Card / Debit</option>
                    <option value="Net Banking">Net Banking</option>
                    <option value="UPI Pay">UPI / Mobile Wallet</option>
                    <option value="Cash Deposit">Bank Cash Deposit</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-teal-600 py-2.5 text-xs font-bold text-white shadow-md hover:bg-teal-700 transition-colors"
                >
                  Record Payment Received
                </button>
              </form>
            </div>

            {/* Manage Semester Fees (Accountant Only) */}
            {role === 'Accountant' && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                  <h3 className="font-sans text-sm font-bold text-slate-900 dark:text-white">Manage Semester Fees</h3>
                  <select
                    value={selectedDeptFilter}
                    onChange={(e) => setSelectedDeptFilter(e.target.value)}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  >
                    <option value="All">All Departments</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                  {feeStructures
                    .filter(f => selectedDeptFilter === 'All' || f.departmentId === selectedDeptFilter)
                    .map(f => {
                      const dept = departments.find(d => d.id === f.departmentId);
                      return (
                        <div key={f.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl dark:bg-slate-950 dark:border-slate-800 space-y-2">
                          <div className="flex justify-between items-center font-sans">
                            <div>
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{f.name}</span>
                              {dept && (
                                <span className="ml-1.5 inline-flex items-center rounded-md bg-teal-50 px-1.5 py-0.5 text-[9px] font-medium text-teal-700 ring-1 ring-inset ring-teal-600/10 dark:bg-teal-950/40 dark:text-teal-400">
                                  {dept.code}
                                </span>
                              )}
                            </div>
                            <span className="font-mono text-xs font-black text-teal-600 dark:text-teal-400">₹{f.amount}</span>
                          </div>
                          <p className="text-[10px] text-slate-400 leading-relaxed">{f.description}</p>
                          <div className="flex gap-2 pt-1">
                            <input
                              type="number"
                              placeholder="New amount"
                              defaultValue={f.amount}
                              id={`new-amount-${f.id}`}
                              className="flex-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-800 focus:outline-hidden dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                            />
                            <button
                              onClick={() => {
                                const val = (document.getElementById(`new-amount-${f.id}`) as HTMLInputElement)?.value;
                                if (val && !isNaN(Number(val)) && onUpdateFeeStructures) {
                                  const updated = feeStructures.map(struct =>
                                    struct.id === f.id ? { ...struct, amount: Number(val) } : struct
                                  );
                                  onUpdateFeeStructures(updated);
                                }
                              }}
                              className="rounded-lg bg-teal-600 px-3 py-1 text-[10px] font-bold text-white hover:bg-teal-700 shadow-sm transition-colors"
                            >
                              Update
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>

          {/* Master Payment Records Ledger */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
            <h3 className="font-sans text-sm font-bold text-slate-900 dark:text-white mb-4">University Accounting Ledger</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/40 font-bold uppercase text-slate-400">
                    <th className="px-4 py-3">Receipt ID</th>
                    <th className="px-4 py-3">Student Name</th>
                    <th className="px-4 py-3">Structure details</th>
                    <th className="px-4 py-3 text-center">Amount Paid</th>
                    <th className="px-4 py-3 text-right">Payment status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {feePayments.map(pay => {
                    const student = students.find(s => s.id === pay.studentId);
                    const stuUser = users.find(u => u.id === student?.userId);
                    const structure = feeStructures.find(f => f.id === pay.feeStructureId);
                    return (
                      <tr key={pay.id} className="hover:bg-slate-50/40">
                        <td className="px-4 py-3 font-mono font-bold text-slate-400">{pay.receiptNumber || 'N/A'}</td>
                        <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{stuUser?.name || 'Jane Doe'}</td>
                        <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{structure?.name || 'Tuition Fees'}</td>
                        <td className="px-4 py-3 text-center font-mono font-bold">₹{pay.amountPaid}</td>
                        <td className="px-4 py-3 text-right">
                          <span className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-0.5 text-[10px] font-bold ${
                            pay.status === 'Paid'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                              : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                          }`}>
                            {pay.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Student billing view */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <h3 className="font-sans text-sm font-bold text-slate-900 dark:text-white mb-4">My Invoices & Dues</h3>
            <div className="space-y-4">
              {feePayments.filter(p => p.studentId === currentStudentId).map(pay => {
                const f = feeStructures.find(struct => struct.id === pay.feeStructureId);
                return (
                  <div key={pay.id} className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 rounded-2xl">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white">{f?.name}</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">{f?.description}</p>
                      </div>
                      <span className="font-mono text-xs font-black text-slate-800 dark:text-white">
                        ₹{f?.amount}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-slate-200/50 dark:border-slate-800 pt-3">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-bold ${
                        pay.status === 'Paid' ? 'text-emerald-600' : 'text-rose-500'
                      }`}>
                        {pay.status === 'Paid' ? (
                          <>
                            <CheckCircle className="h-4 w-4" /> Paid
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-4 w-4 animate-bounce" /> Outstanding Dues
                          </>
                        )}
                      </span>
                      {pay.status !== 'Paid' ? (
                        <button
                          onClick={() => handleStudentPay(pay.id)}
                          className="rounded-xl bg-teal-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-teal-700 shadow-md transition-all"
                        >
                          Clear Balance
                        </button>
                      ) : (
                        <button
                          onClick={() => setReceiptModalPay(pay)}
                          className="flex items-center gap-1.5 text-xs font-bold text-teal-600 hover:underline"
                        >
                          <Printer className="h-4 w-4" /> Print Receipt
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick billing logs */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <h3 className="font-sans text-sm font-bold text-slate-900 dark:text-white mb-4">Financial Receipts Logs</h3>
            <div className="space-y-3.5">
              {feePayments.filter(p => p.studentId === currentStudentId && p.status === 'Paid').map(pay => {
                const f = feeStructures.find(struct => struct.id === pay.feeStructureId);
                return (
                  <div key={pay.id} className="flex items-center justify-between border-b border-slate-100 pb-2.5 dark:border-slate-800">
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[180px]">{f?.name}</p>
                      <span className="font-mono text-[9px] text-slate-400">RCPT: {pay.receiptNumber}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold text-emerald-600">₹{pay.amountPaid}</p>
                      <span className="text-[9px] font-mono text-slate-400">{pay.paymentDate}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Printable Receipt Modal */}
      {receiptModalPay && (() => {
        const modalStudent = students.find(s => s.id === receiptModalPay.studentId);
        const modalUser = modalStudent ? users.find(u => u.id === modalStudent.userId) : null;
        const modalStudentName = modalUser ? `${modalUser.name} (${modalStudent?.rollNo || modalStudent?.id})` : 'Jane Doe (s-1)';
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
                <h3 className="font-sans text-sm font-bold text-slate-900 dark:text-white">Transaction Receipt</h3>
                <button onClick={() => setReceiptModalPay(null)} className="text-slate-400 hover:bg-slate-100 rounded-lg">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Printable Receipt layout */}
              <div className="p-6 space-y-6">
                <div id="printable-receipt" className="border-2 border-dashed border-slate-200 p-4 rounded-xl dark:border-slate-800 text-xs font-sans space-y-3 bg-white text-slate-800">
                  <div className="text-center border-b pb-2 mb-3 border-slate-200">
                    <h4 className="font-sans font-black uppercase text-teal-600">University Bursar Office</h4>
                    <p className="text-[9px] text-slate-400 mt-0.5">Receipt Reference: {receiptModalPay.receiptNumber}</p>
                  </div>

                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-400">PAID BY</span>
                    <span className="font-bold text-slate-800">{modalStudentName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-400">PAYMENT DATE</span>
                    <span className="font-mono text-slate-700">{receiptModalPay.paymentDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-400">PAYMENT METHOD</span>
                    <span className="font-medium text-slate-700">{receiptModalPay.paymentMethod}</span>
                  </div>

                  <div className="border-t border-slate-200 pt-3 flex justify-between items-center text-sm">
                    <span className="font-bold text-slate-800">Amount Settled</span>
                    <span className="font-mono font-black text-emerald-600">₹{receiptModalPay.amountPaid.toFixed(2)}</span>
                  </div>
                </div>

                <div className="rounded-xl bg-amber-50/70 border border-amber-200/50 p-3.5 dark:bg-amber-950/20 dark:border-amber-900/40 text-left">
                  <p className="text-[10px] leading-relaxed font-semibold text-amber-800 dark:text-amber-300">
                    💡 <strong className="font-bold">Tip for Preview Mode:</strong> Browsers block print dialogs inside interactive iframe panels. If "Print Receipt" does not launch your printer page, please click the <strong className="font-bold">"Open in New Tab"</strong> icon at the top right of your screen to print directly, or use the offline options below.
                  </p>
                </div>

                <div className="space-y-2.5 pt-1">
                  <div className="flex gap-2.5">
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
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-teal-200 bg-teal-50/50 dark:bg-teal-950/20 dark:border-teal-900 py-2.5 text-xs font-bold text-teal-700 dark:text-teal-400 hover:bg-teal-100/50 active:bg-teal-100 transition-all shadow-xs"
                    >
                      <Printer className="h-4 w-4" /> Print Receipt
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownloadHTML(receiptModalPay)}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 active:bg-slate-100 transition-colors"
                    >
                      <FileDown className="h-4 w-4" /> Download HTML
                    </button>
                  </div>

                  <div className="flex gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleCopyText(receiptModalPay)}
                      className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border py-2.5 text-xs font-bold transition-all ${
                        copiedReceipt
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900 dark:text-emerald-400'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {copiedReceipt ? (
                        <>
                          <Check className="h-4 w-4 text-emerald-600" /> Copied Text!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" /> Copy Receipt Details
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setReceiptModalPay(null)}
                      className="flex-1 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-center text-xs font-bold text-white dark:text-slate-950 py-2.5 transition-colors shadow-sm"
                    >
                      Dismiss Receipt
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

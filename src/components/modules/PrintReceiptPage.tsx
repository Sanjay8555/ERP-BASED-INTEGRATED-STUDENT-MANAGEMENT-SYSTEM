/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import {
  Printer,
  ArrowLeft,
  CheckCircle2,
  Download,
  Copy,
  Check,
  Building,
  ShieldCheck,
  QrCode
} from 'lucide-react';
import { FeePayment, StudentProfile, User, FeeStructure } from '../../types';

interface PrintReceiptPageProps {
  payment: FeePayment;
  students: StudentProfile[];
  users: User[];
  feeStructures: FeeStructure[];
  onBack: () => void;
}

export default function PrintReceiptPage({
  payment,
  students,
  users,
  feeStructures,
  onBack
}: PrintReceiptPageProps) {
  const [copied, setCopied] = React.useState(false);
  const printAreaRef = useRef<HTMLDivElement>(null);

  const student = students.find(s => s.id === payment.studentId);
  const studentUser = student ? users.find(u => u.id === student.userId) : null;
  const structure = feeStructures.find(f => f.id === payment.feeStructureId);

  const receiptNo = payment.receiptNumber || `RCPT-2026-${payment.id.split('-')[1] || '99999'}`;
  const studentName = studentUser?.name || 'Jane Doe';
  const rollNo = student?.rollNo || 'IT-2026-001';
  const email = studentUser?.email || 'student@university.edu';
  const feeName = structure?.name || 'Syllabus Course Tuition Fee';
  const feeDesc = structure?.description || 'Standard institutional semester charge for registration and credit hours.';
  const amount = payment.amountPaid;
  const date = payment.paymentDate || new Date().toISOString().split('T')[0];
  const method = payment.paymentMethod || 'Credit Card';

  const handlePrint = () => {
    // We can trigger the window.print()
    window.print();
  };

  const handleCopyText = () => {
    const text = `================================================
          UNIVERSITY ERP RECEIPT
================================================
Receipt No: ${receiptNo}
Date      : ${date}
Student   : ${studentName} (${rollNo})
Category  : ${feeName}
Method    : ${method}
Amount    : INR ${amount.toFixed(2)}
Status    : PAID / COMPLETED
================================================`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownload = () => {
    const htmlContent = `<!DOCTYPE html>
<html>
  <head>
    <title>Receipt - ${receiptNo}</title>
    <style>
      body {
        font-family: system-ui, -apple-system, sans-serif;
        padding: 40px;
        background: #f8fafc;
        color: #1e293b;
        display: flex;
        justify-content: center;
      }
      .card {
        background: white;
        padding: 32px;
        border-radius: 16px;
        border: 2px dashed #cbd5e1;
        max-width: 450px;
        width: 100%;
        box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05);
      }
      .header {
        text-align: center;
        border-bottom: 1px solid #e2e8f0;
        padding-bottom: 20px;
        margin-bottom: 24px;
      }
      .logo {
        color: #0d9488;
        font-size: 20px;
        font-weight: 800;
        text-transform: uppercase;
        margin-bottom: 6px;
      }
      .subtitle {
        font-size: 11px;
        color: #64748b;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        margin: 0;
      }
      .ref {
        font-family: monospace;
        font-size: 11px;
        color: #94a3b8;
        margin-top: 4px;
      }
      .section-title {
        font-size: 10px;
        font-weight: 700;
        text-transform: uppercase;
        color: #94a3b8;
        letter-spacing: 0.05em;
        margin-bottom: 12px;
        border-bottom: 1px solid #f1f5f9;
        padding-bottom: 4px;
      }
      .row {
        display: flex;
        justify-content: space-between;
        font-size: 13px;
        margin-bottom: 12px;
      }
      .label {
        color: #64748b;
      }
      .value {
        font-weight: 600;
        color: #0f172a;
      }
      .total-row {
        margin-top: 24px;
        border-top: 2px solid #e2e8f0;
        padding-top: 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .total-label {
        font-weight: 800;
        color: #0f172a;
      }
      .total-val {
        font-size: 20px;
        font-weight: 900;
        color: #059669;
        font-family: monospace;
      }
      .stamp {
        border: 2px solid #059669;
        color: #059669;
        padding: 4px 12px;
        border-radius: 6px;
        font-size: 11px;
        font-weight: 900;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        display: inline-block;
        transform: rotate(-3deg);
        margin-top: 16px;
      }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="header">
        <div class="logo">University</div>
        <p class="subtitle">Bursar Office Payment Receipt</p>
        <p class="ref">Receipt ID: ${receiptNo}</p>
      </div>

      <div class="section-title">Payer Information</div>
      <div class="row">
        <span class="label">Student Name</span>
        <span class="value">${studentName}</span>
      </div>
      <div class="row">
        <span class="label">University Roll No</span>
        <span class="value">${rollNo}</span>
      </div>
      <div class="row">
        <span class="label">Primary Email</span>
        <span class="value">${email}</span>
      </div>

      <div class="section-title" style="margin-top: 20px;">Payment Details</div>
      <div class="row">
        <span class="label">Fee Category</span>
        <span class="value">${feeName}</span>
      </div>
      <div class="row">
        <span class="label">Payment Date</span>
        <span class="value">${date}</span>
      </div>
      <div class="row">
        <span class="label">Payment Method</span>
        <span class="value">${method}</span>
      </div>
      <div class="row">
        <span class="label">Clearance Status</span>
        <span class="value" style="color: #059669;">PAID / COMPLETED</span>
      </div>

      <div class="total-row">
        <span class="total-label">Total Amount Settled</span>
        <span class="total-val">₹${amount.toFixed(2)}</span>
      </div>

      <div style="text-align: center;">
        <div class="stamp">PAID IN FULL</div>
      </div>
    </div>
  </body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `receipt-${receiptNo}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4 animate-fade-in">
      {/* Top action toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 dark:border-slate-800 pb-5 print-hidden">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Return to Ledger
        </button>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleCopyText}
            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-bold transition-all ${
              copied
                ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900 dark:text-emerald-400'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                Copied Details
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy Text Receipt
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Download className="h-4 w-4" />
            Download HTML file
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-teal-700 transition-colors"
          >
            <Printer className="h-4 w-4" />
            Trigger Print Dialog
          </button>
        </div>
      </div>

      {/* Printable page layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Printable document pane */}
        <div className="md:col-span-2">
          <div
            ref={printAreaRef}
            id="print-section"
            className="rounded-3xl border border-slate-200 bg-white p-8 md:p-12 shadow-xl dark:border-slate-800 dark:bg-slate-900 relative overflow-hidden"
          >
            {/* Background design accents */}
            <div className="absolute top-0 right-0 h-40 w-40 bg-slate-50/50 dark:bg-slate-800/10 rounded-bl-full pointer-events-none" />

            {/* Official University Seal Header */}
            <div className="text-center border-b border-slate-100 dark:border-slate-800 pb-6 mb-8">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 mb-3">
                <Building className="h-8 w-8" />
              </div>
              <h2 className="font-sans text-xl font-black uppercase tracking-wider text-slate-900 dark:text-white">
                University Institute of Technology
              </h2>
              <p className="text-[10px] uppercase font-mono tracking-widest text-slate-400 dark:text-slate-500 mt-1">
                Office of the Bursar & Academic Treasury
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                Primary Transaction Receipt Record
              </p>
              <div className="mt-4 inline-block font-mono text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-900">
                RECEIPT REFERENCE: <span className="text-slate-800 dark:text-slate-300 font-extrabold">{receiptNo}</span>
              </div>
            </div>

            {/* Receipt metadata grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8 text-xs">
              {/* Left pane: Payer details */}
              <div className="space-y-4">
                <h4 className="font-sans font-bold text-slate-400 uppercase tracking-widest text-[10px]">
                  Payer Registration Details
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between sm:justify-start sm:gap-6">
                    <span className="text-slate-400 w-24">Full Name:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{studentName}</span>
                  </div>
                  <div className="flex justify-between sm:justify-start sm:gap-6">
                    <span className="text-slate-400 w-24">Roll Number:</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{rollNo}</span>
                  </div>
                  <div className="flex justify-between sm:justify-start sm:gap-6">
                    <span className="text-slate-400 w-24">Account Email:</span>
                    <span className="text-slate-600 dark:text-slate-300">{email}</span>
                  </div>
                </div>
              </div>

              {/* Right pane: Transaction info */}
              <div className="space-y-4">
                <h4 className="font-sans font-bold text-slate-400 uppercase tracking-widest text-[10px]">
                  Transaction Metadata
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between sm:justify-start sm:gap-6">
                    <span className="text-slate-400 w-24">Process Date:</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{date}</span>
                  </div>
                  <div className="flex justify-between sm:justify-start sm:gap-6">
                    <span className="text-slate-400 w-24">Payment Method:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{method}</span>
                  </div>
                  <div className="flex justify-between sm:justify-start sm:gap-6">
                    <span className="text-slate-400 w-24">Bursar Ledger:</span>
                    <span className="inline-flex items-center gap-1 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      <ShieldCheck className="h-3.5 w-3.5" /> SECURE_LEDGER_SYNC
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Line Item Bill details */}
            <div className="border-t border-b border-slate-100 dark:border-slate-800 py-6 my-8">
              <h4 className="font-sans font-bold text-slate-400 uppercase tracking-widest text-[10px] mb-4">
                Itemized Fees Description
              </h4>
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h5 className="font-bold text-slate-900 dark:text-white text-xs">{feeName}</h5>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed max-w-md">{feeDesc}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] text-slate-400 uppercase font-mono">Amount Paid</p>
                  <p className="font-mono font-black text-slate-800 dark:text-white text-md mt-0.5">₹{amount.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Total Block & Signatures */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-6 pt-2">
              {/* Official Paid Stamp Graphic */}
              <div className="flex items-center gap-3">
                <div className="border-2 border-dashed border-emerald-500 text-emerald-600 dark:border-emerald-600 dark:text-emerald-400 font-sans font-black tracking-widest text-xs px-4 py-2 rounded-xl rotate-[-4deg] uppercase shadow-xs">
                  PAID IN FULL
                </div>
                <span className="text-[10px] text-slate-400 leading-relaxed font-semibold max-w-[150px]">
                  Legally cleared on central ERP registrar.
                </span>
              </div>

              {/* Grand Total box */}
              <div className="bg-emerald-50 border border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/40 p-4 rounded-2xl text-right shrink-0 w-full sm:w-auto">
                <span className="font-sans font-bold text-emerald-700 dark:text-emerald-400 text-[10px] uppercase tracking-wider block">
                  Amount Settled (INR)
                </span>
                <span className="font-mono text-2xl font-black text-emerald-800 dark:text-emerald-300 mt-1 block">
                  ₹{amount.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Signature Block Footer */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-8 mt-12 flex flex-col sm:flex-row justify-between text-[11px] text-slate-400 gap-4">
              <div>
                <p className="font-bold text-slate-500 dark:text-slate-400">Ledger Compliance Officers</p>
                <p className="mt-0.5">Dr. Eleanor Vance, Registrar</p>
              </div>
              <div className="text-left sm:text-right font-mono text-[9px]">
                <p>Digital Cryptographic Signature ID:</p>
                <p className="text-slate-300 dark:text-slate-600 truncate max-w-[220px]">
                  0x7F994AB66B125C9E96E243DFE{receiptNo.replace(/[^A-Za-all]/g, '')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Helpful Tips sidebar */}
        <div className="space-y-6 print-hidden">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900">
            <h3 className="font-sans text-sm font-bold text-slate-900 dark:text-white mb-3">
              Official Invoice Clearance
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              This document serves as legal proof of tuition or club fee clearance within the university treasury ledger.
            </p>
            <div className="mt-4 flex items-center justify-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900">
              <QrCode className="h-32 w-32 text-slate-800 dark:text-slate-300" />
            </div>
            <p className="text-[10px] text-slate-400 text-center mt-2.5">
              Scan QR code to verify on blockchain explorer.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900 space-y-3 text-xs leading-relaxed">
            <h4 className="font-sans font-bold text-slate-800 dark:text-white">
              Printing Instructions
            </h4>
            <ul className="list-disc pl-4 space-y-2 text-slate-500">
              <li>Click the <strong>"Trigger Print Dialog"</strong> button to print directly from the browser window.</li>
              <li>Ensure browser layout is set to <strong>Portrait</strong>.</li>
              <li>Toggle <strong>"Background graphics"</strong> option in your browser print window to preserve gorgeous colors and stamps.</li>
              <li>You may also click <strong>"Download HTML file"</strong> to store or mail an offline copy of your receipt.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

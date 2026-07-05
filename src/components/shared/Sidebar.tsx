/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  GraduationCap,
  Users,
  Briefcase,
  CalendarDays,
  FileSpreadsheet,
  CreditCard,
  BookMarked,
  Clock,
  ClipboardList,
  Megaphone,
  FileDown,
  Settings,
  X,
  Building
} from 'lucide-react';
import { UserRole } from '../../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  role: UserRole;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function Sidebar({ activeTab, setActiveTab, role, isOpen, setIsOpen }: SidebarProps) {
  // Define menu items and their role permissions
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: GraduationCap, roles: ['Admin', 'Faculty', 'Student', 'Parent', 'Accountant'] },
    { id: 'students', label: 'Students', icon: Users, roles: ['Admin', 'Faculty', 'Accountant'] },
    { id: 'faculty', label: 'Faculty', icon: Briefcase, roles: ['Admin', 'Faculty'] },
    { id: 'attendance', label: 'Attendance', icon: CalendarDays, roles: ['Admin', 'Faculty', 'Student', 'Parent'] },
    { id: 'exams', label: 'Examinations', icon: FileSpreadsheet, roles: ['Admin', 'Faculty', 'Student', 'Parent'] },
    { id: 'fees', label: 'Fees & Finance', icon: CreditCard, roles: ['Admin', 'Accountant', 'Student', 'Parent'] },
    { id: 'library', label: 'Library', icon: BookMarked, roles: ['Admin', 'Student', 'Parent'] },
    { id: 'timetable', label: 'Timetable', icon: Clock, roles: ['Admin', 'Faculty', 'Student', 'Parent'] },
    { id: 'assignments', label: 'Assignments', icon: ClipboardList, roles: ['Admin', 'Faculty', 'Student'] },
    { id: 'notices', label: 'Notice Board', icon: Megaphone, roles: ['Admin', 'Faculty', 'Student', 'Parent', 'Accountant'] },
    { id: 'reports', label: 'Reports & Export', icon: FileDown, roles: ['Admin', 'Faculty', 'Accountant'] },
    { id: 'settings', label: 'Settings', icon: Settings, roles: ['Admin', 'Faculty', 'Student', 'Parent', 'Accountant'] }
  ];

  const allowedItems = menuItems.filter(item => item.roles.includes(role));

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div
          id="sidebar-overlay"
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden print-hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        id="app-sidebar"
        className={`fixed bottom-0 top-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white shadow-xl transition-transform duration-300 dark:border-slate-800 dark:bg-slate-950 lg:translate-x-0 print-hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white shadow-md shadow-teal-500/20">
              <Building className="h-5.5 w-5.5" />
            </div>
            <div>
              <h1 className="font-sans text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                University
              </h1>
              <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                ERP Portal
              </p>
            </div>
          </div>
          <button
            id="close-sidebar-btn"
            onClick={() => setIsOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User Badge in Sidebar */}
        <div className="mx-4 my-4 rounded-xl bg-slate-50 p-4 border border-slate-200/50 dark:bg-slate-900/50 dark:border-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-teal-100 dark:border-teal-900 bg-slate-200">
              <div className="flex h-full w-full items-center justify-center font-bold text-slate-600 dark:text-slate-300">
                {role.substring(0, 2).toUpperCase()}
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-slate-500 dark:text-slate-400">
                Active Session
              </p>
              <span className="inline-flex items-center rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-teal-700 dark:bg-teal-950/50 dark:text-teal-300">
                {role}
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable Navigation Menu */}
        <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-1.5 scrollbar-thin">
          {allowedItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-tab-${item.id}`}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpen(false); // Close mobile sidebar on click
                }}
                className={`flex w-full items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/10'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Portal Information Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
          <div className="text-center">
            <p className="font-mono text-[10px] text-slate-400 dark:text-slate-600">
              V2.4.0 • PRODUCTION READY
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}

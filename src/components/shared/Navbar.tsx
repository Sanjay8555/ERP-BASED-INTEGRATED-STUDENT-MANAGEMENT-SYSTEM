/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Menu,
  Sun,
  Moon,
  Bell,
  LogOut,
  ChevronDown,
  UserCheck,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { User, UserRole } from '../../types';

interface NavbarProps {
  currentUser: User;
  onLogout: () => void;
  role: UserRole;
  onRoleChange: (role: UserRole) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  activeTabTitle: string;
}

export default function Navbar({
  currentUser,
  onLogout,
  role,
  onRoleChange,
  sidebarOpen,
  setSidebarOpen,
  activeTabTitle
}: NavbarProps) {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('theme');
    if (saved) {
      return saved === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [showRoleDropdown, setShowRoleDropdown] = useState<boolean>(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState<boolean>(false);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [time, setTime] = useState<string>('');

  // Update clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Sync dark mode state with documentElement class and localStorage
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  const rolesList: UserRole[] = ['Admin', 'Faculty', 'Student', 'Parent', 'Accountant'];

  const notifications = [
    { id: 1, title: 'Exam Registration Out', desc: 'Syllabus and forms uploaded.', time: '1h ago' },
    { id: 2, title: 'Library Alert', desc: 'Standard cataloging audit starts tomorrow.', time: '3h ago' },
    { id: 3, title: 'Payment Receipt Generatd', desc: 'IT fee receipt #RCPT-90412 compiled.', time: '1d ago' }
  ];

  return (
    <header
      id="app-navbar"
      className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/80 px-6 shadow-xs backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80 print-hidden"
    >
      {/* Left section: Hamburger & Title */}
      <div className="flex items-center gap-4">
        <button
          id="toggle-sidebar-btn"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-900 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <h2 className="font-sans text-md font-bold text-slate-800 dark:text-white md:text-lg">
            {activeTabTitle}
          </h2>
        </div>
      </div>

      {/* Right Section: System Actions */}
      <div className="flex items-center gap-3">
        {/* UTC Live System Clock */}
        <div className="hidden items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5 font-mono text-xs text-slate-500 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 sm:flex">
          <Clock className="h-3.5 w-3.5 text-teal-500 animate-pulse" />
          <span>{time || '11:49:15'}</span>
        </div>

        {/* Demo Mode Quick Switcher */}
        <div className="relative">
          <button
            id="demo-role-switcher"
            onClick={() => {
              setShowRoleDropdown(!showRoleDropdown);
              setShowProfileDropdown(false);
              setShowNotifications(false);
            }}
            className="flex items-center gap-1.5 rounded-lg bg-teal-50 border border-teal-100 px-3 py-1.5 text-xs font-semibold text-teal-700 hover:bg-teal-100 dark:bg-teal-950/40 dark:border-teal-900 dark:text-teal-300"
          >
            <UserCheck className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Role Switch:</span>
            <span className="underline decoration-teal-300 decoration-2">{role}</span>
            <ChevronDown className="h-3 w-3" />
          </button>

          {showRoleDropdown && (
            <div
              id="role-dropdown-menu"
              className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-200 bg-white py-1 shadow-xl dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                <p className="font-sans text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Quick Testing Switch
                </p>
              </div>
              {rolesList.map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    onRoleChange(r);
                    setShowRoleDropdown(false);
                  }}
                  className={`flex w-full items-center px-4 py-2 text-left text-xs font-medium transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 ${
                    role === r ? 'text-teal-600 dark:text-teal-400 bg-teal-50/50 dark:bg-teal-950/20' : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {r} Dashboard
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Dark Mode Toggle */}
        <button
          id="dark-mode-toggle"
          onClick={toggleDarkMode}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white"
        >
          {darkMode ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            id="notifications-bell-btn"
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowRoleDropdown(false);
              setShowProfileDropdown(false);
            }}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white"
          >
            <Bell className="h-4.5 w-4.5" />
            <span className="absolute top-1 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-950" />
          </button>

          {showNotifications && (
            <div
              id="notifications-dropdown-menu"
              className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                <h4 className="font-sans text-xs font-bold text-slate-800 dark:text-white">Notifications</h4>
              </div>
              <div className="max-h-64 overflow-y-auto py-1">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="rounded-lg p-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-slate-800 dark:text-white">{notif.title}</p>
                      <span className="font-mono text-[9px] text-slate-400">{notif.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{notif.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            id="profile-dropdown-btn"
            onClick={() => {
              setShowProfileDropdown(!showProfileDropdown);
              setShowRoleDropdown(false);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 rounded-lg p-1 hover:bg-slate-50 dark:hover:bg-slate-900"
          >
            <img
              src={currentUser.photo || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=120'}
              alt={currentUser.name}
              referrerPolicy="no-referrer"
              className="h-8 w-8 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-800"
            />
            <div className="hidden text-left sm:block">
              <p className="text-xs font-semibold text-slate-800 dark:text-white truncate max-w-[120px]">{currentUser.name}</p>
              <p className="text-[10px] text-slate-400 capitalize">{currentUser.role.toLowerCase()}</p>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {showProfileDropdown && (
            <div
              id="profile-dropdown-menu"
              className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-200 bg-white py-1 shadow-xl dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-800 dark:text-white">{currentUser.name}</p>
                <p className="text-[10px] text-slate-400 truncate">{currentUser.email}</p>
              </div>
              <button
                onClick={() => {
                  setShowProfileDropdown(false);
                  onLogout();
                }}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/25 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

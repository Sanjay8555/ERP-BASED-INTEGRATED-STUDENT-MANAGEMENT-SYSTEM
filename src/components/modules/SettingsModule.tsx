/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  User,
  ShieldCheck,
  Key,
  Lock,
  Mail,
  Phone,
  Camera,
  CheckCircle2,
  AlertCircle,
  UserPlus,
  Edit,
  Trash2,
  X,
  Sparkles,
  Users,
  Shield,
  Eye,
  EyeOff,
  RefreshCw
} from 'lucide-react';
import { User as UserType, UserRole } from '../../types';
import ProfilePhotoModal from '../shared/ProfilePhotoModal';

interface SettingsModuleProps {
  currentUser: UserType;
  users: UserType[];
  role: UserRole;
  onUpdateCurrentUser: (updated: UserType) => void;
  onAddUser: (newUser: UserType) => void;
  onUpdateUser: (updatedUser: UserType) => void;
  onDeleteUser: (userId: string) => void;
}

export default function SettingsModule({
  currentUser,
  users,
  role,
  onUpdateCurrentUser,
  onAddUser,
  onUpdateUser,
  onDeleteUser
}: SettingsModuleProps) {
  // Active Tab within Settings
  const [activeSection, setActiveSection] = useState<'profile' | 'security' | 'admins' | 'system'>('profile');

  // Profile Edit State
  const [profileName, setProfileName] = useState(currentUser.name || '');
  const [profileEmail, setProfileEmail] = useState(currentUser.email || '');
  const [profilePhone, setProfilePhone] = useState(currentUser.phone || '');
  const [profileUsername, setProfileUsername] = useState(currentUser.username || '');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  // Security / Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Admin Management State (for Admins)
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<UserType | null>(null);

  // New Admin Form State
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminUsername, setNewAdminUsername] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('adminPass2026!');
  const [showNewAdminPassword, setShowNewAdminPassword] = useState(false);
  const [newAdminPhone, setNewAdminPhone] = useState('+1 (555) 019-2834');
  const [newAdminPhoto, setNewAdminPhoto] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250');
  const [showNewAdminPhotoModal, setShowNewAdminPhotoModal] = useState(false);
  const [adminModalError, setAdminModalError] = useState('');
  const [adminModalSuccess, setAdminModalSuccess] = useState('');

  const isAdmin = role === 'Admin';
  const allAdmins = users.filter(u => u.role === 'Admin');

  // Handle Profile / Email Update
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    const cleanEmail = profileEmail.trim().toLowerCase();
    const cleanName = profileName.trim();

    if (!cleanName) {
      setProfileError('Full Name is required.');
      return;
    }
    if (!cleanEmail || !cleanEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setProfileError('Please provide a valid Academic Email Address.');
      return;
    }

    // Check if email collision exists with another user
    const emailCollision = users.some(
      u => u.id !== currentUser.id && u.email && u.email.trim().toLowerCase() === cleanEmail
    );
    if (emailCollision) {
      setProfileError('This email address is already registered to another account.');
      return;
    }

    const updatedUser: UserType = {
      ...currentUser,
      name: cleanName,
      email: cleanEmail,
      phone: profilePhone.trim(),
      username: profileUsername.trim() || cleanEmail.split('@')[0]
    };

    onUpdateCurrentUser(updatedUser);
    onUpdateUser(updatedUser);

    setProfileSuccess('Profile credentials & Academic Email ID updated successfully! Use this new email for future logins.');
  };

  // Handle Password Update
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setPasswordError('All password fields are required.');
      return;
    }
    if (currentUser.password && currentPassword !== currentUser.password) {
      setPasswordError('Incorrect current password.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long.');
      return;
    }

    const updatedUser: UserType = {
      ...currentUser,
      password: newPassword
    };

    onUpdateCurrentUser(updatedUser);
    onUpdateUser(updatedUser);

    setPasswordSuccess('Account password successfully encrypted and saved!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
  };

  // Reset Add/Edit Admin Modal
  const resetAdminModal = () => {
    setNewAdminName('');
    setNewAdminEmail('');
    setNewAdminUsername('');
    setNewAdminPassword('adminPass2026!');
    setShowNewAdminPassword(false);
    setNewAdminPhone('+1 (555) 019-2834');
    setNewAdminPhoto('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250');
    setAdminModalError('');
    setAdminModalSuccess('');
    setEditingAdmin(null);
  };

  const handleOpenAddAdmin = () => {
    resetAdminModal();
    setShowAddAdminModal(true);
  };

  const handleOpenEditAdmin = (admin: UserType) => {
    setEditingAdmin(admin);
    setNewAdminName(admin.name);
    setNewAdminEmail(admin.email);
    setNewAdminUsername(admin.username);
    setNewAdminPassword(admin.password || 'adminPass2026!');
    setShowNewAdminPassword(false);
    setNewAdminPhone(admin.phone || '');
    setNewAdminPhoto(admin.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250');
    setAdminModalError('');
    setAdminModalSuccess('');
    setShowAddAdminModal(true);
  };

  // Submit Add / Edit Admin
  const handleSaveAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminModalError('');
    setAdminModalSuccess('');

    const cleanEmail = newAdminEmail.trim().toLowerCase();
    const cleanName = newAdminName.trim();
    const cleanUsername = newAdminUsername.trim() || cleanEmail.split('@')[0];

    if (!cleanName) {
      setAdminModalError('Admin Full Name is required.');
      return;
    }
    if (!cleanEmail || !cleanEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setAdminModalError('A valid email address is required.');
      return;
    }
    if (!newAdminPassword || newAdminPassword.length < 6) {
      setAdminModalError('Password must be at least 6 characters long.');
      return;
    }

    // Check collision
    const collision = users.some(
      u => (editingAdmin ? u.id !== editingAdmin.id : true) && u.email && u.email.trim().toLowerCase() === cleanEmail
    );
    if (collision) {
      setAdminModalError('This email is already assigned to an existing user account.');
      return;
    }

    if (editingAdmin) {
      const updated: UserType = {
        ...editingAdmin,
        name: cleanName,
        email: cleanEmail,
        username: cleanUsername,
        password: newAdminPassword,
        phone: newAdminPhone.trim(),
        photo: newAdminPhoto
      };
      onUpdateUser(updated);
      if (currentUser.id === editingAdmin.id) {
        onUpdateCurrentUser(updated);
        setProfileEmail(cleanEmail);
        setProfileName(cleanName);
      }
      setAdminModalSuccess('Administrator profile updated successfully!');
    } else {
      const newId = `u-admin-${Date.now()}`;
      const newAdmin: UserType = {
        id: newId,
        name: cleanName,
        email: cleanEmail,
        username: cleanUsername,
        password: newAdminPassword,
        role: 'Admin',
        phone: newAdminPhone.trim(),
        photo: newAdminPhoto
      };
      onAddUser(newAdmin);
      setAdminModalSuccess('New Administrator account created successfully! The new admin can log in immediately.');
    }

    setTimeout(() => {
      setShowAddAdminModal(false);
    }, 1200);
  };

  // Delete Secondary Admin
  const handleDeleteAdmin = (adminId: string) => {
    if (adminId === currentUser.id) {
      alert('You cannot delete your own active administrator account.');
      return;
    }
    if (allAdmins.length <= 1) {
      alert('Cannot delete the last remaining Administrator in the system.');
      return;
    }

    const target = users.find(u => u.id === adminId);
    if (confirm(`Are you sure you want to permanently revoke Admin privileges and delete account: ${target?.name} (${target?.email})?`)) {
      onDeleteUser(adminId);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Settings Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3 dark:border-slate-800">
        <button
          onClick={() => setActiveSection('profile')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
            activeSection === 'profile'
              ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          <Mail className="h-4 w-4" />
          <span>Profile & Email Identity</span>
        </button>

        <button
          onClick={() => setActiveSection('security')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
            activeSection === 'security'
              ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          <Key className="h-4 w-4" />
          <span>Password & Security</span>
        </button>

        {isAdmin && (
          <button
            onClick={() => setActiveSection('admins')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
              activeSection === 'admins'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                : 'bg-white text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="h-4 w-4 text-amber-300" />
            <span>Administrator Accounts</span>
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-black text-amber-900 dark:bg-amber-950 dark:text-amber-300">
              {allAdmins.length}
            </span>
          </button>
        )}

        <button
          onClick={() => setActiveSection('system')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
            activeSection === 'system'
              ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          <RefreshCw className="h-4 w-4" />
          <span>System Reset</span>
        </button>
      </div>

      {/* SECTION 1: PROFILE & EMAIL IDENTITY */}
      {activeSection === 'profile' && (
        <div className="space-y-6">
          {/* Profile Photo Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <h3 className="font-sans text-md font-bold text-slate-900 dark:text-white mb-1">Profile Photo & Identity</h3>
            <p className="text-xs text-slate-400 mb-4">Personalize your avatar displayed across the ERP portal and administrative records.</p>

            <div className="flex flex-col sm:flex-row items-center gap-5 rounded-xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/40">
              <div className="relative group">
                <img
                  src={currentUser.photo || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=250'}
                  alt={currentUser.name}
                  referrerPolicy="no-referrer"
                  className="h-20 w-20 rounded-full object-cover ring-4 ring-teal-500/20 shadow-md"
                />
                <button
                  type="button"
                  onClick={() => setShowPhotoModal(true)}
                  className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-teal-600 text-white shadow-sm hover:bg-teal-700 transition-transform group-hover:scale-110"
                  title="Change Profile Picture"
                >
                  <Camera className="h-4 w-4" />
                </button>
              </div>

              <div className="text-center sm:text-left space-y-1">
                <h4 className="font-sans text-sm font-bold text-slate-900 dark:text-white">{currentUser.name}</h4>
                <p className="text-xs text-slate-500 font-mono">{currentUser.email}</p>
                <span className="inline-flex items-center rounded-full bg-teal-50 px-2.5 py-0.5 text-[10px] font-bold text-teal-700 uppercase tracking-wider dark:bg-teal-950/50 dark:text-teal-300">
                  {currentUser.role} Account
                </span>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPhotoModal(true)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-teal-700 transition-colors"
                  >
                    <Camera className="h-3.5 w-3.5" />
                    Upload / Change Profile Picture
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Change Admin Email & Details Form */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-sans text-md font-bold text-slate-900 dark:text-white">
                  {isAdmin ? 'Admin Email ID & Account Profile' : 'User Email & Profile'}
                </h3>
                <p className="text-xs text-slate-400">
                  Update your primary login email address and contact information.
                </p>
              </div>
              <span className="rounded-lg bg-teal-50 px-2.5 py-1 text-[11px] font-bold text-teal-700 dark:bg-teal-950/50 dark:text-teal-300 font-mono">
                Active ID: {currentUser.id}
              </span>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              {profileSuccess && (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-100 p-3.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-900">
                  <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
                  <span>{profileSuccess}</span>
                </div>
              )}
              {profileError && (
                <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-100 p-3.5 text-xs font-semibold text-rose-700 dark:bg-rose-950/30 dark:border-rose-900">
                  <AlertCircle className="h-4.5 w-4.5 text-rose-600 shrink-0" />
                  <span>{profileError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">
                    Academic Login Email ID
                  </label>
                  <div className="relative">
                    <Mail className="absolute top-3 left-3 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                      placeholder="admin@university.edu"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-4 pl-10 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                      required
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">This email is used to log in to the ERP Portal.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">
                    Administrator Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute top-3 left-3 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      placeholder="RAJESH"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-4 pl-10 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">
                    Account Username
                  </label>
                  <input
                    type="text"
                    value={profileUsername}
                    onChange={(e) => setProfileUsername(e.target.value)}
                    placeholder="admin"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">
                    Primary Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute top-3 left-3 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      placeholder="+1 (555) 019-2834"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-4 pl-10 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-teal-700 transition-colors"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Save Email & Profile Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SECTION 2: PASSWORD & SECURITY */}
      {activeSection === 'security' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <h3 className="font-sans text-md font-bold text-slate-900 dark:text-white mb-1">Account & Security Portal</h3>
          <p className="text-xs text-slate-400 mb-6">Manage login keys and system password encryption securely.</p>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            {passwordSuccess && (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-100 p-3 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900">
                <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600" />
                <span>{passwordSuccess}</span>
              </div>
            )}
            {passwordError && (
              <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-100 p-3 text-xs font-semibold text-rose-700 dark:bg-rose-950/20 dark:border-rose-900">
                <AlertCircle className="h-4.5 w-4.5 text-rose-600" />
                <span>{passwordError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Current Password</label>
              <div className="relative">
                <Lock className="absolute top-3 left-3 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pr-4 pl-10 text-xs font-semibold focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">New Secure Password</label>
                <div className="relative">
                  <Key className="absolute top-3 left-3 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pr-4 pl-10 text-xs font-semibold focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    placeholder="At least 6 characters"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute top-3 left-3 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pr-4 pl-10 text-xs font-semibold focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    placeholder="Re-type new password"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-teal-600 py-2.5 text-xs font-bold text-white shadow-md hover:bg-teal-700 transition-colors mt-4"
            >
              Update System Password
            </button>
          </form>
        </div>
      )}

      {/* SECTION 3: SYSTEM ADMINISTRATORS MANAGEMENT (ADMIN ONLY) */}
      {activeSection === 'admins' && isAdmin && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <Shield className="h-4.5 w-4.5" />
                  </div>
                  <h3 className="font-sans text-base font-bold text-slate-900 dark:text-white">
                    System Administrators Roster & Privilege Control
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Manage all authorized ERP administrator accounts. Registered admins have full root access to data, students, grading, and finances.
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenAddAdmin}
                className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-amber-600/20 hover:bg-amber-700 transition-colors shrink-0"
              >
                <UserPlus className="h-4 w-4" />
                <span>+ Register New Administrator</span>
              </button>
            </div>

            {/* Administrators Table */}
            <div className="overflow-hidden rounded-xl border border-slate-100 dark:border-slate-800">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold uppercase text-slate-400 dark:border-slate-800 dark:bg-slate-950/50">
                    <th className="px-4 py-3">Administrator</th>
                    <th className="px-4 py-3">Login Email ID</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">Role & Privilege</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs dark:divide-slate-800">
                  {allAdmins.map((admin) => {
                    const isSelf = admin.id === currentUser.id;
                    return (
                      <tr key={admin.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={admin.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120'}
                              alt={admin.name}
                              referrerPolicy="no-referrer"
                              className="h-9 w-9 rounded-full object-cover ring-2 ring-amber-500/20"
                            />
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                {admin.name}
                                {isSelf && (
                                  <span className="rounded-md bg-teal-50 px-1.5 py-0.5 text-[9px] font-bold text-teal-700 dark:bg-teal-950 dark:text-teal-300">
                                    You
                                  </span>
                                )}
                              </p>
                              <p className="font-mono text-[10px] text-slate-400">@{admin.username}</p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3 font-mono font-medium text-slate-800 dark:text-slate-300">
                          {admin.email}
                        </td>

                        <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-400">
                          {admin.phone || '—'}
                        </td>

                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                            <ShieldCheck className="h-3 w-3" />
                            Full Root Access
                          </span>
                        </td>

                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEditAdmin(admin)}
                              title="Edit Admin Credentials"
                              className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:border-slate-800 dark:hover:bg-slate-800"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>

                            {!isSelf && (
                              <button
                                type="button"
                                onClick={() => handleDeleteAdmin(admin.id)}
                                title="Revoke Admin & Delete"
                                className="flex h-7 w-7 items-center justify-center rounded-lg border border-rose-100 text-rose-500 hover:bg-rose-50 hover:text-rose-700 dark:border-rose-950/40 dark:hover:bg-rose-950/20"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
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

      {/* SECTION 4: SYSTEM DATA RESET */}
      {activeSection === 'system' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <h4 className="text-xs font-bold uppercase text-red-500 mb-1">System Reset Utility (Danger Zone)</h4>
          <p className="text-xs text-slate-400 mb-4">
            Resetting will clear all current local changes, registrations, book issues, and payment states, returning the application database back to the pristine default mock seeds.
          </p>
          <button
            type="button"
            onClick={() => {
              if (confirm('Are you absolutely sure you want to reset all data and revert to pristine seed entries? This action cannot be undone.')) {
                localStorage.clear();
                window.location.reload();
              }
            }}
            className="rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:border-red-900 py-2.5 px-4 text-xs font-bold text-red-700 transition-colors"
          >
            Reset System Database to Defaults
          </button>
        </div>
      )}

      {/* MODAL: ADD / EDIT ADMINISTRATOR */}
      {showAddAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-sans text-sm font-bold text-slate-900 dark:text-white">
                    {editingAdmin ? 'Modify Administrator Credentials' : 'Register New System Administrator'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {editingAdmin ? 'Update admin email, login key, or name' : 'Provision a new full root access administrator'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddAdminModal(false)}
                className="rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdmin} className="p-6 space-y-4">
              {adminModalSuccess && (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-100 p-3 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-900">
                  <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
                  <span>{adminModalSuccess}</span>
                </div>
              )}
              {adminModalError && (
                <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-100 p-3 text-xs font-semibold text-rose-700 dark:bg-rose-950/30 dark:border-rose-900">
                  <AlertCircle className="h-4.5 w-4.5 text-rose-600 shrink-0" />
                  <span>{adminModalError}</span>
                </div>
              )}

              {/* Photo Banner */}
              <div className="flex items-center gap-3.5 rounded-xl border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-950/50">
                <img
                  src={newAdminPhoto}
                  alt="Admin Photo"
                  referrerPolicy="no-referrer"
                  className="h-12 w-12 rounded-full object-cover ring-2 ring-amber-500/30"
                />
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Admin Avatar</p>
                  <button
                    type="button"
                    onClick={() => setShowNewAdminPhotoModal(true)}
                    className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 hover:underline"
                  >
                    <Camera className="h-3 w-3" />
                    Change Avatar Photo
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">
                  Admin Full Name
                </label>
                <input
                  type="text"
                  value={newAdminName}
                  onChange={(e) => setNewAdminName(e.target.value)}
                  placeholder="Dr. Alexander Wright"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">
                  Academic Login Email ID
                </label>
                <input
                  type="email"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  placeholder="alexander.admin@university.edu"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  required
                />
                <p className="text-[10px] text-slate-400 mt-1">This email address will be used to log in.</p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">
                    Username
                  </label>
                  <input
                    type="text"
                    value={newAdminUsername}
                    onChange={(e) => setNewAdminUsername(e.target.value)}
                    placeholder="alexander_admin"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={newAdminPhone}
                    onChange={(e) => setNewAdminPhone(e.target.value)}
                    placeholder="+1 (555) 019-2834"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">
                  Security Login Password
                </label>
                <div className="relative">
                  <input
                    type={showNewAdminPassword ? 'text' : 'password'}
                    value={newAdminPassword}
                    onChange={(e) => setNewAdminPassword(e.target.value)}
                    placeholder="adminPass2026!"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 pr-9 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewAdminPassword(!showNewAdminPassword)}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    title={showNewAdminPassword ? 'Hide password' : 'Show password'}
                  >
                    {showNewAdminPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Default: adminPass2026!</p>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddAdminModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-amber-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-amber-700 transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{editingAdmin ? 'Save Admin Details' : 'Create Administrator'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Profile Photo Modal for Current User */}
      <ProfilePhotoModal
        isOpen={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
        currentPhoto={currentUser.photo || ''}
        userName={currentUser.name}
        onSave={(newPhoto) => {
          const updated = { ...currentUser, photo: newPhoto };
          onUpdateCurrentUser(updated);
          onUpdateUser(updated);
        }}
      />

      {/* Profile Photo Modal for New Admin Creation */}
      <ProfilePhotoModal
        isOpen={showNewAdminPhotoModal}
        onClose={() => setShowNewAdminPhotoModal(false)}
        currentPhoto={newAdminPhoto}
        userName={newAdminName || 'New Admin'}
        onSave={(newPhoto) => setNewAdminPhoto(newPhoto)}
      />
    </div>
  );
}

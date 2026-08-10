/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Camera, Upload, Link as LinkIcon, Check, X, User, Sparkles, RefreshCw } from 'lucide-react';

interface ProfilePhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPhoto?: string;
  onSave: (newPhotoUrl: string) => void;
  userName?: string;
}

export const PRESET_AVATARS = [
  { id: 'av-1', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=250', label: 'Admin / Executive' },
  { id: 'av-2', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250', label: 'Student Female' },
  { id: 'av-3', url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=250', label: 'Student Male' },
  { id: 'av-4', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250', label: 'Faculty Female' },
  { id: 'av-5', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250', label: 'Faculty Male' },
  { id: 'av-6', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250', label: 'Professional Female' },
  { id: 'av-7', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250', label: 'Casual Male' },
  { id: 'av-8', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=250', label: 'Academic Female' },
  { id: 'av-9', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250', label: 'Avatar Male' },
  { id: 'av-10', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix', label: 'Illustration 1' },
  { id: 'av-11', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka', label: 'Illustration 2' },
  { id: 'av-12', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jasper', label: 'Illustration 3' },
];

export default function ProfilePhotoModal({
  isOpen,
  onClose,
  currentPhoto,
  onSave,
  userName = 'User'
}: ProfilePhotoModalProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'preset' | 'url'>('upload');
  const [selectedPhoto, setSelectedPhoto] = useState<string>(currentPhoto || PRESET_AVATARS[0].url);
  const [customUrl, setCustomUrl] = useState<string>('');
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (file: File) => {
    setUploadError('');
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (JPG, PNG, WebP, etc.).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size should be less than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setSelectedPhoto(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleApplyUrl = () => {
    if (!customUrl.trim()) return;
    setSelectedPhoto(customUrl.trim());
  };

  const handleConfirmSave = () => {
    onSave(selectedPhoto);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-teal-600 dark:bg-teal-950/50 dark:text-teal-400">
              <Camera className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-sans text-sm font-bold text-slate-900 dark:text-white">Change Profile Picture</h3>
              <p className="text-[10px] text-slate-400">Update photo for {userName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Live Preview Ring */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative group">
              <img
                src={selectedPhoto}
                alt="Profile Preview"
                referrerPolicy="no-referrer"
                className="h-24 w-24 rounded-full object-cover ring-4 ring-teal-500/20 shadow-md transition-all group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250';
                }}
              />
              <span className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-teal-600 text-white shadow-sm ring-2 ring-white dark:ring-slate-900">
                <Check className="h-4 w-4" />
              </span>
            </div>
            <p className="text-[11px] font-semibold text-slate-500 mt-2">Selected Photo Preview</p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-950">
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition-colors ${
                activeTab === 'upload'
                  ? 'bg-white text-teal-700 shadow-xs dark:bg-slate-800 dark:text-teal-400'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <Upload className="h-3.5 w-3.5" />
              Upload File
            </button>

            <button
              onClick={() => setActiveTab('preset')}
              className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition-colors ${
                activeTab === 'preset'
                  ? 'bg-white text-teal-700 shadow-xs dark:bg-slate-800 dark:text-teal-400'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Avatars
            </button>

            <button
              onClick={() => setActiveTab('url')}
              className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition-colors ${
                activeTab === 'url'
                  ? 'bg-white text-teal-700 shadow-xs dark:bg-slate-800 dark:text-teal-400'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <LinkIcon className="h-3.5 w-3.5" />
              Image URL
            </button>
          </div>

          {/* Tab 1: Upload File */}
          {activeTab === 'upload' && (
            <div className="space-y-3">
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
                  dragActive
                    ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/20'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/50 dark:border-slate-800 dark:bg-slate-950/40 dark:hover:bg-slate-950'
                }`}
              >
                <Upload className="h-8 w-8 text-teal-500 mb-2 animate-bounce" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Click to choose a photo or drop it here
                </p>
                <p className="text-[10px] text-slate-400 mt-1">Supports PNG, JPG, WebP up to 5MB</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileChange(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />
              </div>
              {uploadError && (
                <p className="text-[11px] font-semibold text-rose-500 text-center">{uploadError}</p>
              )}
            </div>
          )}

          {/* Tab 2: Preset Gallery */}
          {activeTab === 'preset' && (
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Choose a Curated Avatar</p>
              <div className="grid grid-cols-4 gap-2.5 max-h-48 overflow-y-auto pr-1">
                {PRESET_AVATARS.map((av) => (
                  <button
                    key={av.id}
                    onClick={() => setSelectedPhoto(av.url)}
                    className={`relative overflow-hidden rounded-xl border-2 transition-all p-1 ${
                      selectedPhoto === av.url
                        ? 'border-teal-500 bg-teal-50/40 dark:bg-teal-950/40 scale-105 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700'
                    }`}
                  >
                    <img
                      src={av.url}
                      alt={av.label}
                      referrerPolicy="no-referrer"
                      className="h-12 w-12 rounded-lg object-cover mx-auto"
                    />
                    {selectedPhoto === av.url && (
                      <div className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-teal-500 text-white">
                        <Check className="h-2.5 w-2.5" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Custom Web URL */}
          {activeTab === 'url' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Direct Image URL</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    placeholder="https://example.com/photo.jpg"
                    className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={handleApplyUrl}
                    className="rounded-xl bg-teal-600 px-3 py-2 text-xs font-bold text-white hover:bg-teal-700 transition-colors"
                  >
                    Preview
                  </button>
                </div>
              </div>
              <p className="text-[10px] text-slate-400">Paste any public web image address to set as profile photo.</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-6 py-4 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmSave}
            className="flex items-center gap-1.5 rounded-xl bg-teal-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-teal-700 transition-colors"
          >
            <Check className="h-4 w-4" />
            Save Profile Photo
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { StudentProfile } from '../types';
import { soundManager } from '../utils/audio';
import { Bell, ChevronDown, Sparkles } from 'lucide-react';

interface HeaderProps {
  currentStudent: StudentProfile | null;
  notificationCount: number;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
  onLogoClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentStudent,
  notificationCount,
  onOpenNotifications,
  onOpenProfile,
  onLogoClick,
}) => {
  const studentName = currentStudent?.fullName || 'Nguyễn Thị Huệ';
  const studentClass = currentStudent?.gradeClass || 'Lớp 11A1';

  return (
    <header className="bg-white/95 backdrop-blur-md sticky top-0 z-40 border-b border-slate-100 py-3 px-4 sm:px-6">
      <div className="max-w-md sm:max-w-lg md:max-w-xl mx-auto flex items-center justify-between gap-3">
        {/* Left: App Logo & Title */}
        <div
          onClick={() => {
            soundManager.playClick();
            onLogoClick();
          }}
          className="flex items-center gap-3 cursor-pointer select-none group"
        >
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl overflow-hidden shadow-xs transition-transform group-hover:scale-105 shrink-0 bg-[#2563EB] flex items-center justify-center">
            <img
              src="/assets/modules/app_logo.png"
              alt="AI-OmniTest Logo"
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback icon if needed
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#1E3A8A] tracking-tight leading-none">
              AI-OmniTest
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-1 leading-none">
              Học thông minh - Thi hiệu quả
            </p>
          </div>
        </div>

        {/* Right: Notifications & Student Profile */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Notification Bell */}
          <button
            onClick={() => {
              soundManager.playClick();
              onOpenNotifications();
            }}
            className="relative p-2.5 rounded-full hover:bg-slate-100 text-slate-700 transition-colors"
            title="Thông báo"
          >
            <Bell className="w-6 h-6 text-slate-700" />
            {notificationCount > 0 && (
              <span className="absolute top-1.5 right-1.5 bg-[#EF4444] text-white text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center shadow-xs">
                {notificationCount}
              </span>
            )}
          </button>

          {/* Student Profile Pill matching mockup */}
          <button
            onClick={() => {
              soundManager.playClick();
              onOpenProfile();
            }}
            className="flex items-center gap-2.5 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-full pl-1.5 pr-3 py-1 shadow-xs transition-all cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden border border-blue-200 shrink-0 bg-blue-100 flex items-center justify-center">
              <img
                src="/assets/modules/avatar.png"
                alt={studentName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div className="text-left hidden sm:block">
              <div className="font-bold text-xs text-slate-800 leading-tight">
                {studentName}
              </div>
              <div className="text-[10px] text-slate-400 font-medium leading-tight">
                {studentClass}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </div>
    </header>
  );
};

import React, { useState } from 'react';
import { StudentProfile } from '../types';
import { soundManager } from '../utils/audio';
import { X, Volume2, VolumeX, User, Shield, Info, RotateCcw } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStudent: StudentProfile | null;
  onOpenEditProfile: () => void;
  onResetData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentStudent,
  onOpenEditProfile,
  onResetData,
}) => {
  const [soundEnabled, setSoundEnabled] = useState(soundManager.getSettings().enabled);
  const [volume, setVolume] = useState(soundManager.getSettings().volume);

  if (!isOpen) return null;

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundManager.setEnabled(next);
    if (next) soundManager.playClick();
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    soundManager.setVolume(val);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="font-extrabold text-base text-slate-900">Cài Đặt Hệ Thống</h3>
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Audio settings */}
        <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
          <div className="flex items-center justify-between font-bold text-slate-800">
            <span className="flex items-center gap-2">
              {soundEnabled ? <Volume2 className="w-4 h-4 text-blue-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
              <span>Âm thanh tương tác</span>
            </span>
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={handleToggleSound}
              className="w-4 h-4 accent-blue-600 cursor-pointer"
            />
          </div>

          {soundEnabled && (
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>Âm lượng phản hồi</span>
                <span className="font-bold tabular-nums">{Math.round(volume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={handleVolumeChange}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>
          )}
        </div>

        {/* Student Profile Setting */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
          <div>
            <div className="font-bold text-slate-800">Hồ sơ học tập</div>
            <div className="text-slate-500 mt-0.5">
              {currentStudent?.fullName || 'Nguyễn Thị Huệ'} · {currentStudent?.gradeClass || 'Lớp 11A1'}
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playClick();
              onOpenEditProfile();
            }}
            className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl font-bold transition-colors"
          >
            Đổi thông tin
          </button>
        </div>

        {/* Author & Version Info */}
        <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100 text-xs space-y-1">
          <div className="font-bold text-indigo-900">AI-OmniTest · Bản quyền giáo dục</div>
          <p className="text-indigo-700 text-[11px]">
            Tác giả: <strong>Nguyễn Thị Huệ</strong>. Khẩu hiệu: <em>“Học thông minh - Thi hiệu quả”</em>.
          </p>
        </div>

        <button
          onClick={() => {
            soundManager.playClick();
            onClose();
          }}
          className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
        >
          Xong
        </button>
      </div>
    </div>
  );
};

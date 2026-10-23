import React, { useState, useEffect } from 'react';
import { StudentProfile } from '../types';
import { soundManager } from '../utils/audio';
import { User, School, Hash, X, Check, Trash2, Info } from 'lucide-react';

interface StudentAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStudent: StudentProfile | null;
  onSaveStudent: (student: StudentProfile) => void;
  onClearStudent: () => void;
}

export const StudentAuthModal: React.FC<StudentAuthModalProps> = ({
  isOpen,
  onClose,
  currentStudent,
  onSaveStudent,
  onClearStudent,
}) => {
  const [fullName, setFullName] = useState('');
  const [gradeClass, setGradeClass] = useState('');
  const [school, setSchool] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentStudent) {
      setFullName(currentStudent.fullName);
      setGradeClass(currentStudent.gradeClass);
      setSchool(currentStudent.school || '');
      setAccessCode(currentStudent.accessCode || '');
    } else {
      setFullName('');
      setGradeClass('');
      setSchool('');
      setAccessCode('');
    }
    setError('');
  }, [currentStudent, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError('Vui lòng nhập họ và tên của học sinh.');
      soundManager.playAlert();
      return;
    }
    if (!gradeClass.trim()) {
      setError('Vui lòng nhập lớp học (ví dụ: 8A1, 9B, 10 Lý, 12A...).');
      soundManager.playAlert();
      return;
    }

    const profile: StudentProfile = {
      id: currentStudent?.id || `student_${Date.now()}`,
      fullName: fullName.trim(),
      gradeClass: gradeClass.trim(),
      school: school.trim() || undefined,
      accessCode: accessCode.trim() || undefined,
      createdAt: currentStudent?.createdAt || new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    soundManager.playCorrect();
    onSaveStudent(profile);
    onClose();
  };

  const handleClear = () => {
    soundManager.playClick();
    setFullName('');
    setGradeClass('');
    setSchool('');
    setAccessCode('');
    setError('');
    onClearStudent();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={() => {
            soundManager.playClick();
            onClose();
          }}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-5">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
            <User className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">Hồ Sơ Học Sinh</h3>
          <p className="text-xs text-slate-500 mt-1">
            Nhập tên và lớp để hệ thống cá nhân hóa đề cương và lưu kết quả ôn tập.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <Info className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Họ và tên học sinh <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ví dụ: Nguyễn Minh Khang"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Lớp học <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={gradeClass}
                onChange={(e) => setGradeClass(e.target.value)}
                placeholder="Ví dụ: 8A1, 9B, 10 Tin..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Trường học (không bắt buộc)
            </label>
            <div className="relative">
              <input
                type="text"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                placeholder="Ví dụ: THCS Lê Quý Đôn"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Mã truy cập / Mã lớp giáo viên (nếu có)
            </label>
            <div className="relative">
              <input
                type="text"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                placeholder="Ví dụ: KHTN8-2026"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-mono"
              />
            </div>
          </div>

          {/* Privacy & Local profile notice */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500 leading-relaxed flex items-start gap-2">
            <Info className="w-4 h-4 shrink-0 text-slate-400 mt-0.5" />
            <span>
              <strong>Lưu ý bảo mật:</strong> Đây là hồ sơ học tập cơ bản được lưu an toàn trực tiếp
              trên trình duyệt của thiết bị này để theo dõi tiến trình làm bài.
            </span>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-between gap-3">
            {currentStudent ? (
              <button
                type="button"
                onClick={handleClear}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa thông tin</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  onClose();
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Quay lại
              </button>
            )}

            <button
              type="submit"
              className="flex-1 py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{currentStudent ? 'Cập nhật hồ sơ' : 'Bắt đầu học ngay'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

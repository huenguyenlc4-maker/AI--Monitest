import React from 'react';
import { DocumentOutline, PracticeSessionResult, StudentProfile } from '../types';
import { soundManager } from '../utils/audio';
import {
  Layers,
  BookOpen,
  CheckSquare,
  Target,
  Clock,
  ArrowRight,
  Play,
  FileText,
  Gamepad2,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';

interface DashboardViewProps {
  currentStudent: StudentProfile | null;
  outlines: DocumentOutline[];
  history: PracticeSessionResult[];
  onNavigate: (tab: string) => void;
  onSelectOutlineToPractice: (outline: DocumentOutline) => void;
  onOpenGuide: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentStudent,
  outlines,
  history,
  onNavigate,
  onSelectOutlineToPractice,
  onOpenGuide,
}) => {
  const outlineCount = outlines.length;
  const practiceCount = history.length;
  const recentScore = history.length > 0 ? history[0].score10.toFixed(1) : '-';

  return (
    <div className="space-y-2.5 select-none w-full">
      {/* =========================================================================
          1. HERO BANNER - THU GỌN GỌN GÀNG, KHÔNG MẤT CHỮ, KHÔNG CHE NÚT
         ========================================================================= */}
      <div
        onClick={() => {
          soundManager.playClick();
          onNavigate('practice');
        }}
        className="relative rounded-2xl overflow-hidden shadow-xs border border-blue-400/40 bg-[#0B2A75] cursor-pointer group w-full"
        title="Bắt đầu học ngay"
      >
        <img
          src="/assets/modules/hero_banner.png"
          alt="Chinh phục tri thức - Tỏa sáng tương lai!"
          className="w-full h-auto object-contain select-none group-hover:scale-[1.01] transition-transform duration-300 block"
        />
      </div>

      {/* =========================================================================
          2. STATS KPI STRIP - THANH TÁC VỤ 4 CHỈ SỐ GỌN TRÊN 1 DÒNG
         ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-1.5 sm:p-2 grid grid-cols-4 gap-1 sm:gap-2">
        {/* Stat 1: Tài liệu */}
        <div
          onClick={() => {
            soundManager.playClick();
            onNavigate('documents');
          }}
          className="flex flex-col items-center justify-center p-1 rounded-xl hover:bg-blue-50/60 cursor-pointer transition-colors text-center"
          title="Tài liệu đã tải"
        >
          <div className="w-7 h-7 rounded-lg bg-blue-100 text-[#2563EB] flex items-center justify-center mb-0.5">
            <BookOpen className="w-3.5 h-3.5 fill-current" />
          </div>
          <span className="text-[10px] text-slate-500 font-medium leading-none">Tài liệu</span>
          <span className="text-xs sm:text-sm font-black text-slate-900 leading-tight">
            {outlineCount}
          </span>
        </div>

        {/* Stat 2: Lượt thi */}
        <div className="flex flex-col items-center justify-center p-1 rounded-xl text-center">
          <div className="w-7 h-7 rounded-lg bg-cyan-100 text-[#0891B2] flex items-center justify-center mb-0.5">
            <CheckSquare className="w-3.5 h-3.5" />
          </div>
          <span className="text-[10px] text-slate-500 font-medium leading-none">Lượt ôn</span>
          <span className="text-xs sm:text-sm font-black text-slate-900 leading-tight">
            {practiceCount}
          </span>
        </div>

        {/* Stat 3: Điểm thi */}
        <div className="flex flex-col items-center justify-center p-1 rounded-xl text-center">
          <div className="w-7 h-7 rounded-lg bg-purple-100 text-[#7C3AED] flex items-center justify-center mb-0.5">
            <Target className="w-3.5 h-3.5" />
          </div>
          <span className="text-[10px] text-slate-500 font-medium leading-none">Điểm gần nhất</span>
          <span className="text-xs sm:text-sm font-black text-slate-900 leading-tight">
            {recentScore}
          </span>
        </div>

        {/* Stat 4: Chuỗi ngày */}
        <div className="flex flex-col items-center justify-center p-1 rounded-xl text-center">
          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-[#059669] flex items-center justify-center mb-0.5">
            <Clock className="w-3.5 h-3.5" />
          </div>
          <span className="text-[10px] text-slate-500 font-medium leading-none">Chuỗi ngày</span>
          <span className="text-xs sm:text-sm font-black text-slate-900 leading-tight">
            3 ngày
          </span>
        </div>
      </div>

      {/* =========================================================================
          3. CÁC MÔ-ĐUN HỌC TẬP - THU GỌN VỪA TRỌN TRONG 1 MÀN HÌNH (2 CỘT x 3 HÀNG)
          Hình ảnh thu nhỏ ở góc, không che chữ, nút lệnh rõ ràng không bị đè
         ========================================================================= */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-[#2563EB]" />
            <h2 className="text-xs sm:text-sm font-black text-[#0F172A] uppercase tracking-wide">
              Các mô-đun học tập
            </h2>
          </div>
          <button
            onClick={() => {
              soundManager.playClick();
              onNavigate('repository');
            }}
            className="text-[11px] font-bold text-[#2563EB] hover:underline cursor-pointer"
          >
            Kho học liệu ›
          </button>
        </div>

        {/* 6 MODULES THU GỌN - 2 CỘT x 3 HÀNG */}
        <div className="grid grid-cols-2 gap-2">
          {/* Module 1: Tải Lên Đề Cương Word */}
          <div
            onClick={() => {
              soundManager.playClick();
              onNavigate('upload');
            }}
            className="relative rounded-2xl p-2.5 sm:p-3 bg-gradient-to-br from-[#EFF6FF] via-[#DBEAFE]/50 to-[#BFDBFE]/60 border-2 border-[#93C5FD] shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden cursor-pointer group active:scale-[0.98] min-h-[92px]"
          >
            <div className="flex items-center justify-between gap-1 z-10">
              <div className="w-7 h-7 rounded-lg bg-[#2563EB] text-white flex items-center justify-center font-black text-xs shadow-xs">
                W
              </div>
              <img
                src="/assets/modules/right_art_word.png"
                alt=""
                className="w-8 h-8 object-contain pointer-events-none opacity-85 group-hover:scale-110 transition-transform"
              />
            </div>

            <div className="z-10 mt-1">
              <h3 className="text-xs font-black text-slate-900 leading-snug line-clamp-1">
                Tải Đề Cương
              </h3>
              <p className="text-[9px] text-blue-800 font-bold truncate mt-0.5">
                Nhận diện: 4 Lựa chọn · Đúng/Sai · Trả lời ngắn
              </p>
              <div className="mt-1.5 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white text-[10px] font-black shadow-xs transition-colors">
                <span>Upload & Nhận diện</span>
                <ArrowRight className="w-2.5 h-2.5" />
              </div>
            </div>
          </div>

          {/* Module 2: Tài Liệu Của Tôi */}
          <div
            onClick={() => {
              soundManager.playClick();
              onNavigate('documents');
            }}
            className="relative rounded-2xl p-2.5 sm:p-3 bg-gradient-to-br from-[#FAF5FF] via-[#F3E8FF]/50 to-[#E9D5FF]/60 border-2 border-[#D8B4FE] shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden cursor-pointer group active:scale-[0.98] min-h-[92px]"
          >
            <div className="flex items-center justify-between gap-1 z-10">
              <div className="w-7 h-7 rounded-lg bg-[#7C3AED] text-white flex items-center justify-center font-black text-xs shadow-xs">
                <FileText className="w-3.5 h-3.5" />
              </div>
              <img
                src="/assets/modules/right_art_folder.png"
                alt=""
                className="w-8 h-8 object-contain pointer-events-none opacity-85 group-hover:scale-110 transition-transform"
              />
            </div>

            <div className="z-10 mt-1">
              <h3 className="text-xs font-black text-slate-900 leading-snug line-clamp-1">
                Tài Liệu Của Tôi
              </h3>
              <div className="mt-1.5 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#7C3AED] hover:bg-purple-700 text-white text-[10px] font-black shadow-xs transition-colors">
                <span>Khám phá</span>
                <ArrowRight className="w-2.5 h-2.5" />
              </div>
            </div>
          </div>

          {/* Module 3: Luyện Tập Đa Dạng */}
          <div
            onClick={() => {
              soundManager.playClick();
              onNavigate('practice');
            }}
            className="relative rounded-2xl p-2.5 sm:p-3 bg-gradient-to-br from-[#ECFDF5] via-[#D1FAE5]/50 to-[#A7F3D0]/60 border-2 border-[#6EE7B7] shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden cursor-pointer group active:scale-[0.98] min-h-[92px]"
          >
            <div className="flex items-center justify-between gap-1 z-10">
              <div className="w-7 h-7 rounded-lg bg-[#059669] text-white flex items-center justify-center font-black text-xs shadow-xs">
                <Play className="w-3.5 h-3.5 fill-current" />
              </div>
              <img
                src="/assets/modules/right_art_practice.png"
                alt=""
                className="w-8 h-8 object-contain pointer-events-none opacity-85 group-hover:scale-110 transition-transform"
              />
            </div>

            <div className="z-10 mt-1">
              <h3 className="text-xs font-black text-slate-900 leading-snug line-clamp-1">
                Luyện Tập Đa Dạng
              </h3>
              <div className="mt-1.5 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#059669] hover:bg-emerald-700 text-white text-[10px] font-black shadow-xs transition-colors">
                <span>Vào làm bài</span>
                <ArrowRight className="w-2.5 h-2.5" />
              </div>
            </div>
          </div>

          {/* Module 4: Luyện Thi Thực Chiến */}
          <div
            onClick={() => {
              soundManager.playClick();
              onNavigate('repository');
            }}
            className="relative rounded-2xl p-2.5 sm:p-3 bg-gradient-to-br from-[#FFF7ED] via-[#FFEDD5]/50 to-[#FED7AA]/60 border-2 border-[#FDBA74] shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden cursor-pointer group active:scale-[0.98] min-h-[92px]"
          >
            <div className="flex items-center justify-between gap-1 z-10">
              <div className="w-7 h-7 rounded-lg bg-[#EA580C] text-white flex items-center justify-center font-black text-xs shadow-xs">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
              <img
                src="/assets/modules/right_art_exam.png"
                alt=""
                className="w-8 h-8 object-contain pointer-events-none opacity-85 group-hover:scale-110 transition-transform"
              />
            </div>

            <div className="z-10 mt-1">
              <h3 className="text-xs font-black text-slate-900 leading-snug line-clamp-1">
                Luyện Thi Thực Chiến
              </h3>
              <div className="mt-1.5 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#EA580C] hover:bg-orange-700 text-white text-[10px] font-black shadow-xs transition-colors">
                <span>Vào làm bài</span>
                <ArrowRight className="w-2.5 h-2.5" />
              </div>
            </div>
          </div>

          {/* Module 5: Giải Trí */}
          <div
            onClick={() => {
              soundManager.playClick();
              onNavigate('games');
            }}
            className="relative rounded-2xl p-2.5 sm:p-3 bg-gradient-to-br from-[#FFF1F2] via-[#FFE4E6]/50 to-[#FECDD3]/60 border-2 border-[#FDA4AF] shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden cursor-pointer group active:scale-[0.98] min-h-[92px]"
          >
            <div className="flex items-center justify-between gap-1 z-10">
              <div className="w-7 h-7 rounded-lg bg-[#E11D48] text-white flex items-center justify-center font-black text-xs shadow-xs">
                <Gamepad2 className="w-3.5 h-3.5" />
              </div>
              <img
                src="/assets/modules/right_art_game.png"
                alt=""
                className="w-8 h-8 object-contain pointer-events-none opacity-85 group-hover:scale-110 transition-transform"
              />
            </div>

            <div className="z-10 mt-1">
              <h3 className="text-xs font-black text-slate-900 leading-snug line-clamp-1">
                Góc Giải Trí
              </h3>
              <div className="mt-1.5 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#E11D48] hover:bg-rose-700 text-white text-[10px] font-black shadow-xs transition-colors">
                <span>Vào chơi</span>
                <ArrowRight className="w-2.5 h-2.5" />
              </div>
            </div>
          </div>

          {/* Module 6: Hướng Dẫn Sử Dụng */}
          <div
            onClick={() => {
              soundManager.playClick();
              onOpenGuide();
            }}
            className="relative rounded-2xl p-2.5 sm:p-3 bg-gradient-to-br from-[#EEF2FF] via-[#E0E7FF]/50 to-[#C7D2FE]/60 border-2 border-[#A5B4FC] shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden cursor-pointer group active:scale-[0.98] min-h-[92px]"
          >
            <div className="flex items-center justify-between gap-1 z-10">
              <div className="w-7 h-7 rounded-lg bg-[#4F46E5] text-white flex items-center justify-center font-black text-xs shadow-xs">
                <HelpCircle className="w-3.5 h-3.5" />
              </div>
              <img
                src="/assets/modules/right_art_guide.png"
                alt=""
                className="w-8 h-8 object-contain pointer-events-none opacity-85 group-hover:scale-110 transition-transform"
              />
            </div>

            <div className="z-10 mt-1">
              <h3 className="text-xs font-black text-slate-900 leading-snug line-clamp-1">
                Hướng Dẫn Sử Dụng
              </h3>
              <div className="mt-1.5 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#4F46E5] hover:bg-indigo-700 text-white text-[10px] font-black shadow-xs transition-colors">
                <span>Xem ngay</span>
                <ArrowRight className="w-2.5 h-2.5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

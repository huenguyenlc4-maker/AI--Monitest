import React, { useState } from 'react';
import { soundManager } from '../../utils/audio';
import { PikachuMatchGame } from './PikachuMatchGame';
import { CaroGame } from './CaroGame';
import { MemoryFlipGame } from './MemoryFlipGame';
import { ImagePairGame } from './ImagePairGame';
import { GuessWordGame } from './GuessWordGame';
import { SpotDifferencesGame } from './SpotDifferencesGame';
import { SpeedQuizGame } from './SpeedQuizGame';
import { SlidingPuzzleGame } from './SlidingPuzzleGame';
import {
  Gamepad2,
  Trophy,
  Crown,
  BookOpen,
  Settings,
  Home,
  ArrowLeft,
  X,
  Sparkles,
  Play,
  Flame,
  Award,
  CheckCircle2,
} from 'lucide-react';

interface GameItem {
  id: string;
  num: number;
  numColor: string;
  numBg: string;
  tag: string;
  tagBg: string;
  tagText: string;
  title: string;
  desc: string;
  artImg: string;
  btnGradient: string;
  hoverGradient: string;
}

const GAMES: GameItem[] = [
  {
    id: 'pikachu',
    num: 1,
    numColor: 'text-white',
    numBg: 'bg-[#2563EB]',
    tag: 'Nhận dạng',
    tagBg: 'bg-[#E0F2FE]',
    tagText: 'text-[#0284C7]',
    title: 'Pikachu ghép hình',
    desc: 'Nối các cặp biểu tượng giống nhau bằng đường đi không quá 2 khúc gấp.',
    artImg: '/assets/games/art_pikachu.png',
    btnGradient: 'from-[#2563EB] to-[#3B82F6]',
    hoverGradient: 'hover:from-[#1D4ED8] hover:to-[#2563EB]',
  },
  {
    id: 'caro',
    num: 2,
    numColor: 'text-white',
    numBg: 'bg-[#7C3AED]',
    tag: 'Chiến thuật',
    tagBg: 'bg-[#F3E8FF]',
    tagText: 'text-[#9333EA]',
    title: 'Cờ caro trí tuệ',
    desc: 'Bạn có 11x11 lượt mở, đấu với máy thông minh hoặc chơi 2 người trên cùng máy.',
    artImg: '/assets/games/art_caro.png',
    btnGradient: 'from-[#7C3AED] to-[#9333EA]',
    hoverGradient: 'hover:from-[#6D28D9] hover:to-[#7C3AED]',
  },
  {
    id: 'memory',
    num: 3,
    numColor: 'text-white',
    numBg: 'bg-[#EA580C]',
    tag: 'Rèn luyện trí nhớ',
    tagBg: 'bg-[#FFEDD5]',
    tagText: 'text-[#EA580C]',
    title: 'Lật hình ghi nhớ',
    desc: 'Lật các thẻ bài để tìm các cặp hình học tập tương ứng với 3 cấp độ.',
    artImg: '/assets/games/art_memory.png',
    btnGradient: 'from-[#EA580C] to-[#F97316]',
    hoverGradient: 'hover:from-[#C2410C] hover:to-[#EA580C]',
  },
  {
    id: 'image_pair',
    num: 4,
    numColor: 'text-white',
    numBg: 'bg-[#059669]',
    tag: 'Kiến thức liên kết',
    tagBg: 'bg-[#D1FAE5]',
    tagText: 'text-[#059669]',
    title: 'Ghép cặp hình ảnh',
    desc: 'Ghép cặp khái niệm môn học và địa danh Việt Nam với các dụng cụ biểu trưng.',
    artImg: '/assets/games/art_puzzle.png',
    btnGradient: 'from-[#059669] to-[#10B981]',
    hoverGradient: 'hover:from-[#047857] hover:to-[#059669]',
  },
  {
    id: 'guess_word',
    num: 5,
    numColor: 'text-white',
    numBg: 'bg-[#4F46E5]',
    tag: 'Ngôn ngữ & Đố vui',
    tagBg: 'bg-[#EEF2FF]',
    tagText: 'text-[#4F46E5]',
    title: 'Đuổi hình bắt chữ',
    desc: 'Đoán các thành ngữ, hình ảnh thân thương tương hoặc các biểu tượng vui.',
    artImg: '/assets/games/art_word.png',
    btnGradient: 'from-[#4F46E5] to-[#6366F1]',
    hoverGradient: 'hover:from-[#4338CA] hover:to-[#4F46E5]',
  },
  {
    id: 'spot_diff',
    num: 6,
    numColor: 'text-white',
    numBg: 'bg-[#0D9488]',
    tag: 'Quan sát tinh tế',
    tagBg: 'bg-[#CCFBF1]',
    tagText: 'text-[#0D9488]',
    title: 'Tìm điểm khác biệt',
    desc: 'Tìm 5 điểm khác biệt giữa 2 bức tranh không gian lớp học sinh động.',
    artImg: '/assets/games/art_diff.png',
    btnGradient: 'from-[#0D9488] to-[#14B8A6]',
    hoverGradient: 'hover:from-[#0F766E] hover:to-[#0D9488]',
  },
  {
    id: 'speed_quiz',
    num: 7,
    numColor: 'text-white',
    numBg: 'bg-[#4338CA]',
    tag: 'Thử thách tốc độ',
    tagBg: 'bg-[#E0E7FF]',
    tagText: 'text-[#4338CA]',
    title: 'Trắc nghiệm nhanh vui nhộn',
    desc: '15 giây mỗi câu để kiểm thức bách khoa kỳ thú, tích điểm chuỗi thắng.',
    artImg: '/assets/games/art_quiz.png',
    btnGradient: 'from-[#4338CA] to-[#6366F1]',
    hoverGradient: 'hover:from-[#3730A3] hover:to-[#4338CA]',
  },
  {
    id: 'sliding_puzzle',
    num: 8,
    numColor: 'text-white',
    numBg: 'bg-[#2563EB]',
    tag: 'Tư duy logic',
    tagBg: 'bg-[#DBEAFE]',
    tagText: 'text-[#2563EB]',
    title: 'Xếp hình thư giãn',
    desc: 'Tự từ các ô số xếp dạng thứ tự từ bé đến lớn với bảng 3x3 và 4x4.',
    artImg: '/assets/games/art_sliding.png',
    btnGradient: 'from-[#2563EB] to-[#3B82F6]',
    hoverGradient: 'hover:from-[#1D4ED8] hover:to-[#2563EB]',
  },
];

export const GamesHub: React.FC<{ onBackToHome: () => void }> = ({ onBackToHome }) => {
  const [activeGameId, setActiveGameId] = useState<string | null>(null);

  // Modals for sidebar actions
  const [showAchievements, setShowAchievements] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  const handleSelectGame = (id: string) => {
    soundManager.playClick();
    setActiveGameId(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToList = () => {
    soundManager.playClick();
    setActiveGameId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If a specific game is currently active, render it directly
  if (activeGameId === 'pikachu') return <PikachuMatchGame onBack={handleBackToList} />;
  if (activeGameId === 'caro') return <CaroGame onBack={handleBackToList} />;
  if (activeGameId === 'memory') return <MemoryFlipGame onBack={handleBackToList} />;
  if (activeGameId === 'image_pair') return <ImagePairGame onBack={handleBackToList} />;
  if (activeGameId === 'guess_word') return <GuessWordGame onBack={handleBackToList} />;
  if (activeGameId === 'spot_diff') return <SpotDifferencesGame onBack={handleBackToList} />;
  if (activeGameId === 'speed_quiz') return <SpeedQuizGame onBack={handleBackToList} />;
  if (activeGameId === 'sliding_puzzle') return <SlidingPuzzleGame onBack={handleBackToList} />;

  return (
    <div className="w-full flex flex-col gap-2 sm:gap-2.5 pb-16 sm:pb-20 select-none max-w-4xl mx-auto">
      {/* =========================================================================
          1. UNIFIED APP HEADER - Modern Neutral Theme, Prominent Home Button (Compact)
         ========================================================================= */}
      <div className="bg-white rounded-2xl p-2.5 sm:p-3 border-2 border-slate-200/90 shadow-xs space-y-2">
        {/* Top row: Brand & Prominent Back to Home Button */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-xs shrink-0 flex items-center justify-center p-0.5">
              <img
                src="/assets/games/games_robot_logo.png"
                alt="Góc Giải Trí"
                className="w-full h-full object-cover rounded-lg"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-black text-slate-900 text-base sm:text-lg tracking-tight">Góc Giải Trí</span>
                <span className="font-black text-blue-600 text-base sm:text-lg tracking-tight">Vui Học</span>
              </div>
            </div>
          </div>

          {/* HIGHLY PROMINENT HOME BUTTON */}
          <button
            onClick={() => {
              soundManager.playClick();
              onBackToHome();
            }}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-black text-xs sm:text-sm shadow-sm hover:shadow-md active:scale-95 transition-all cursor-pointer border border-blue-400/40 shrink-0"
            title="Quay lại trang chủ"
          >
            <ArrowLeft className="w-3.5 h-3.5 stroke-[3]" />
            <span className="tracking-wide">VỀ TRANG CHỦ</span>
          </button>
        </div>

        {/* Quick action buttons row (Thành tích, Xếp hạng, Hướng dẫn) - Slim */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2 pt-1.5 border-t border-slate-100">
          <button
            onClick={() => {
              soundManager.playClick();
              setShowAchievements(true);
            }}
            className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-slate-50 hover:bg-amber-50/80 border border-slate-200 hover:border-amber-300 text-slate-800 hover:text-amber-900 text-[11px] sm:text-xs font-extrabold active:scale-95 transition-all shadow-2xs cursor-pointer"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>Thành tích</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              setShowLeaderboard(true);
            }}
            className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-slate-50 hover:bg-purple-50/80 border border-slate-200 hover:border-purple-300 text-slate-800 hover:text-purple-900 text-[11px] sm:text-xs font-extrabold active:scale-95 transition-all shadow-2xs cursor-pointer"
          >
            <Crown className="w-3.5 h-3.5 text-purple-500 shrink-0" />
            <span>Xếp hạng</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              setShowGuide(true);
            }}
            className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-slate-50 hover:bg-blue-50/80 border border-slate-200 hover:border-blue-300 text-slate-800 hover:text-blue-900 text-[11px] sm:text-xs font-extrabold active:scale-95 transition-all shadow-2xs cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span>Hướng dẫn</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          2. HERO BANNER - FULL IMAGE PRESERVED, NO TEXT CUT OFF
         ========================================================================= */}
      <div
        onClick={() => {
          soundManager.playClick();
          handleSelectGame('pikachu');
        }}
        className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-xs border-2 border-blue-400/30 bg-[#1E40AF] cursor-pointer group active:scale-[0.99] transition-transform w-full aspect-[1215/285]"
        title="Bắt đầu chơi ngay!"
      >
        <img
          src="/assets/games/games_hero_banner.png"
          alt="Học thông minh cùng AI"
          className="w-full h-full object-contain sm:object-cover group-hover:scale-[1.01] transition-transform duration-300"
        />
      </div>

      {/* =========================================================================
          3. 8 GAME CARDS - EXPANDED 3X, NEAT INTERNAL BUTTON, SHARP CRISP FRAME
         ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3.5">
        {GAMES.map((game) => (
          <div
            key={game.id}
            onClick={() => handleSelectGame(game.id)}
            className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-4 border-2 border-slate-200 hover:border-blue-500 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group active:scale-[0.98] cursor-pointer min-h-[165px] sm:min-h-[185px]"
            title={`${game.title} - Bấm để chơi ngay`}
          >
            {/* Top row: Badge + Tag */}
            <div>
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <div
                  className={`w-6 h-6 sm:w-7 sm:h-7 rounded-xl ${game.numBg} ${game.numColor} font-black text-xs sm:text-sm flex items-center justify-center shadow-xs shrink-0`}
                >
                  {game.num}
                </div>
                <span
                  className={`text-[9.5px] sm:text-xs font-black px-2 py-0.5 rounded-full ${game.tagBg} ${game.tagText} truncate max-w-[85px] sm:max-w-none border border-current/20`}
                >
                  {game.tag}
                </span>
              </div>

              {/* Title */}
              <h3 className="font-black text-slate-900 text-xs sm:text-sm leading-snug line-clamp-1" title={game.title}>
                {game.title}
              </h3>
            </div>

            {/* Center: 3D Art Illustration */}
            <div className="w-full h-14 sm:h-16 flex items-center justify-center my-1 select-none">
              <img
                src={game.artImg}
                alt={game.title}
                className="max-h-full max-w-full object-contain filter drop-shadow-sm group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Bottom: Button positioned cleanly and neatly inside the game card */}
            <div className="pt-1.5">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectGame(game.id);
                }}
                className={`w-full py-1.5 sm:py-2 rounded-xl bg-gradient-to-r ${game.btnGradient} ${game.hoverGradient} text-white font-black text-xs sm:text-sm shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer`}
              >
                <span className="text-[10px]">▶</span>
                <span>Chơi ngay</span>
                <span className="text-xs font-bold">›</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* =========================================================================
          4. MOTIVATIONAL FOOTER CARD - NEVER CROPS TEXT, FULL DISPLAY
         ========================================================================= */}
      <div className="p-4 sm:p-5 bg-gradient-to-b from-white via-slate-50 to-blue-50/40 rounded-3xl border-2 border-slate-200/90 text-center shadow-xs flex flex-col items-center justify-center">
        <img
          src="/assets/games/games_sidebar_footer.png"
          alt="Mỗi trò chơi là một bước tiến của bạn! ♡"
          className="w-full max-w-[200px] sm:max-w-[240px] h-auto object-contain mx-auto drop-shadow-xs"
        />
      </div>

      {/* 3. MODAL: THÀNH TÍCH (Achievements) */}
      {showAchievements && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Thành Tích Game Trí Tuệ</h3>
                  <p className="text-xs text-slate-400">Rèn luyện tư duy mỗi ngày</p>
                </div>
              </div>
              <button
                onClick={() => {
                  soundManager.playClick();
                  setShowAchievements(false);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-center gap-3">
                <span className="text-2xl">⚡</span>
                <div className="flex-1">
                  <div className="font-bold text-amber-900">Bậc thầy Pikachu</div>
                  <div className="text-amber-700 text-[11px]">Hoàn thành màn chơi dưới 60 giây</div>
                </div>
                <span className="text-xs font-bold text-amber-600 bg-white px-2 py-0.5 rounded-full">
                  Đạt được
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-purple-50/80 border border-purple-200 flex items-center gap-3">
                <span className="text-2xl">👑</span>
                <div className="flex-1">
                  <div className="font-bold text-purple-900">Kỳ thủ Caro</div>
                  <div className="text-purple-700 text-[11px]">Thắng máy liên tiếp 3 ván</div>
                </div>
                <span className="text-xs font-bold text-purple-600 bg-white px-2 py-0.5 rounded-full">
                  Đạt được
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex items-center gap-3">
                <span className="text-2xl">🧠</span>
                <div className="flex-1">
                  <div className="font-bold text-emerald-900">Siêu trí nhớ</div>
                  <div className="text-emerald-700 text-[11px]">Lật đúng 100% không sai thẻ nào</div>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-white px-2 py-0.5 rounded-full">
                  Đang mở
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-blue-50/80 border border-blue-200 flex items-center gap-3">
                <span className="text-2xl">⏱️</span>
                <div className="flex-1">
                  <div className="font-bold text-blue-900">Tia chớp tri thức</div>
                  <div className="text-blue-700 text-[11px]">Trả lời đúng 10 câu hỏi tốc độ</div>
                </div>
                <span className="text-xs font-bold text-blue-600 bg-white px-2 py-0.5 rounded-full">
                  Đạt được
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                soundManager.playClick();
                setShowAchievements(false);
              }}
              className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors shadow-xs"
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* 4. MODAL: BẢNG XẾP HẠNG (Leaderboard) */}
      {showLeaderboard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-yellow-50 text-yellow-500 flex items-center justify-center">
                  <Crown className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Bảng Xếp Hạng Tuần</h3>
                  <p className="text-xs text-slate-400">Top học sinh có điểm cao nhất</p>
                </div>
              </div>
              <button
                onClick={() => {
                  soundManager.playClick();
                  setShowLeaderboard(false);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-2xl bg-yellow-50/80 border border-yellow-300 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-yellow-400 text-white font-black flex items-center justify-center text-xs">
                    1
                  </span>
                  <div>
                    <div className="font-black text-slate-900">Nguyễn Thị Huệ (Bạn)</div>
                    <div className="text-slate-500 text-[11px]">Lớp 11A1 · 2,850 điểm</div>
                  </div>
                </div>
                <span className="text-amber-600 font-extrabold">🏆 Hạng 1</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-slate-300 text-slate-700 font-black flex items-center justify-center text-xs">
                    2
                  </span>
                  <div>
                    <div className="font-bold text-slate-800">Trần Văn Nam</div>
                    <div className="text-slate-500 text-[11px]">Lớp 11A2 · 2,620 điểm</div>
                  </div>
                </div>
                <span className="text-slate-400 font-bold">🥈 Hạng 2</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-amber-600/30 text-amber-800 font-black flex items-center justify-center text-xs">
                    3
                  </span>
                  <div>
                    <div className="font-bold text-slate-800">Lê Thuỳ Linh</div>
                    <div className="text-slate-500 text-[11px]">Lớp 10B1 · 2,410 điểm</div>
                  </div>
                </div>
                <span className="text-amber-700 font-bold">🥉 Hạng 3</span>
              </div>
            </div>

            <button
              onClick={() => {
                soundManager.playClick();
                setShowLeaderboard(false);
              }}
              className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors shadow-xs"
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* 5. MODAL: HƯỚNG DẪN TRÒ CHƠI (Guide) */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[85vh] overflow-y-auto space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Hướng Dẫn 8 Trò Chơi</h3>
                  <p className="text-xs text-slate-400">Luật chơi và mẹo đạt điểm tối đa</p>
                </div>
              </div>
              <button
                onClick={() => {
                  soundManager.playClick();
                  setShowGuide(false);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <div className="p-3 rounded-2xl bg-blue-50/60 border border-blue-100">
                <strong className="text-blue-900">1. Pikachu ghép hình:</strong> Tìm 2 biểu tượng giống nhau và nối chúng với đường thẳng không quá 2 góc vuông.
              </div>
              <div className="p-3 rounded-2xl bg-purple-50/60 border border-purple-100">
                <strong className="text-purple-900">2. Cờ caro trí tuệ:</strong> Bàn cờ 11x11, tạo 5 ô liên tiếp (hàng ngang, dọc hoặc chéo) để chiến thắng.
              </div>
              <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-100">
                <strong className="text-amber-900">3. Lật hình ghi nhớ:</strong> Ghi nhớ vị trí các quân bài và lật từng cặp giống nhau trong thời gian ngắn nhất.
              </div>
              <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                <strong className="text-emerald-900">4. Ghép cặp hình ảnh:</strong> Nối địa danh, biểu tượng lịch sử và khoa học Việt Nam đúng chuẩn.
              </div>
            </div>

            <button
              onClick={() => {
                soundManager.playClick();
                setShowGuide(false);
              }}
              className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors shadow-xs"
            >
              Đã hiểu
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

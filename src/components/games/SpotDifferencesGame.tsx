import React, { useState } from 'react';
import { soundManager } from '../../utils/audio';
import { unlockBadge } from '../../utils/storage';
import { RotateCcw, ArrowLeft, CheckCircle2, Lightbulb, Clock } from 'lucide-react';

interface DifferencePoint {
  id: number;
  name: string;
  xPercent: number; // 0 to 100
  yPercent: number; // 0 to 100
  radiusPercent: number;
}

const DIFFERENCES: DifferencePoint[] = [
  { id: 1, name: 'Ngôi sao trên bảng phấn', xPercent: 24, yPercent: 22, radiusPercent: 8 },
  { id: 2, name: 'Kim đồng hồ treo tường', xPercent: 78, yPercent: 18, radiusPercent: 8 },
  { id: 3, name: 'Cuốn sách màu vàng trên bàn', xPercent: 32, yPercent: 68, radiusPercent: 8 },
  { id: 4, name: 'Quả táo đỏ bên cạnh máy tính', xPercent: 65, yPercent: 64, radiusPercent: 7 },
  { id: 5, name: 'Chiếc cờ nhỏ trên hộp bút', xPercent: 84, yPercent: 72, radiusPercent: 7 },
];

export const SpotDifferencesGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [foundIds, setFoundIds] = useState<number[]>([]);
  const [showHint, setShowHint] = useState<number | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [isWon, setIsWon] = useState(false);

  React.useEffect(() => {
    if (isWon) return;
    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isWon]);

  const resetGame = () => {
    soundManager.playClick();
    setFoundIds([]);
    setShowHint(null);
    setSeconds(0);
    setIsWon(false);
  };

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isWon) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    let hit = false;
    for (const diff of DIFFERENCES) {
      if (foundIds.includes(diff.id)) continue;
      const dist = Math.hypot(clickX - diff.xPercent, clickY - diff.yPercent);
      if (dist <= diff.radiusPercent) {
        soundManager.playCorrect();
        const updated = [...foundIds, diff.id];
        setFoundIds(updated);
        hit = true;
        if (updated.length === DIFFERENCES.length) {
          setIsWon(true);
          soundManager.playVictory();
          unlockBadge('gamer_learner');
        }
        break;
      }
    }

    if (!hit) {
      soundManager.playClick();
    }
  };

  const handleHint = () => {
    soundManager.playClick();
    const remaining = DIFFERENCES.filter((d) => !foundIds.includes(d.id));
    if (remaining.length > 0) {
      setShowHint(remaining[0].id);
      setTimeout(() => setShowHint(null), 2500);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundManager.playClick();
              onBack();
            }}
            className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h3 className="text-base font-bold text-slate-900">Tìm Điểm Khác Biệt (Góc Học Tập)</h3>
            <p className="text-xs text-slate-500">
              Đã tìm thấy: <strong className="text-emerald-600">{foundIds.length}/5</strong> điểm
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 text-xs font-semibold">
            <Clock className="w-3.5 h-3.5" />
            <span className="tabular-nums">{seconds}s</span>
          </div>
          <button
            onClick={handleHint}
            disabled={isWon || foundIds.length === DIFFERENCES.length}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-xs font-semibold border border-amber-200 transition-colors"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            <span>Gợi ý</span>
          </button>
          <button
            onClick={resetGame}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Chơi lại</span>
          </button>
        </div>
      </div>

      {/* Main comparative panels */}
      <div className="bg-slate-50 p-4 sm:p-6 rounded-2xl border border-slate-200">
        {isWon && (
          <div className="text-center p-6 bg-white rounded-2xl border border-emerald-200 shadow-sm max-w-sm w-full mx-auto mb-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
            <h4 className="text-lg font-bold text-emerald-800">Tinh Mắt Tuyệt Vời!</h4>
            <p className="text-sm text-slate-600 mt-1">
              Bạn đã tìm thấy trọn vẹn 5 điểm khác biệt trong {seconds} giây.
            </p>
            <button
              onClick={resetGame}
              className="mt-4 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              Chơi lại
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
          {/* Panel 1: Original */}
          <div className="flex flex-col items-center">
            <div className="text-xs font-bold text-slate-500 mb-1.5">Bức tranh A (Gốc)</div>
            <div
              onClick={handleImageClick}
              className="relative w-full aspect-[4/3] bg-gradient-to-b from-sky-100 to-indigo-50 rounded-2xl border-2 border-slate-300 overflow-hidden cursor-crosshair select-none shadow-sm"
            >
              {/* Classroom Illustration SVG */}
              <svg className="w-full h-full" viewBox="0 0 400 300">
                {/* Chalkboard */}
                <rect x="30" y="30" width="180" height="110" rx="8" fill="#1e3a29" stroke="#92400e" strokeWidth="6" />
                <text x="50" y="70" fill="#a7f3d0" fontSize="16" fontFamily="sans-serif">Chào mừng đến lớp!</text>
                <text x="50" y="100" fill="#fde68a" fontSize="14" fontFamily="sans-serif">AI- OmniTest</text>

                {/* Clock */}
                <circle cx="310" cy="55" r="30" fill="#ffffff" stroke="#475569" strokeWidth="4" />
                <line x1="310" y1="55" x2="310" y2="35" stroke="#0f172a" strokeWidth="3" />
                <line x1="310" y1="55" x2="325" y2="55" stroke="#0f172a" strokeWidth="3" />

                {/* Window */}
                <rect x="250" y="105" width="120" height="60" fill="#bae6fd" stroke="#0284c7" strokeWidth="3" rx="4" />
                <circle cx="330" cy="125" r="12" fill="#facc15" />

                {/* Teacher Desk */}
                <rect x="40" y="180" width="320" height="90" fill="#d97706" rx="6" />
                <rect x="25" y="170" width="350" height="15" fill="#b45309" rx="3" />

                {/* Computer Monitor */}
                <rect x="180" y="125" width="75" height="50" fill="#334155" rx="3" />
                <rect x="184" y="129" width="67" height="42" fill="#0284c7" />
                <polygon points="210,175 225,175 220,185 215,185" fill="#64748b" />

                {/* Books */}
                <rect x="60" y="160" width="45" height="12" fill="#2563eb" rx="2" />
                <rect x="65" y="148" width="40" height="12" fill="#dc2626" rx="2" />

                {/* Pencil holder */}
                <rect x="290" y="150" width="22" height="30" fill="#8b5cf6" rx="2" />
                <line x1="295" y1="150" x2="292" y2="135" stroke="#eab308" strokeWidth="3" />
                <line x1="302" y1="150" x2="305" y2="132" stroke="#10b981" strokeWidth="3" />
              </svg>

              {/* Difference Markers on Panel 1 */}
              {foundIds.map((id) => {
                const diff = DIFFERENCES.find((d) => d.id === id);
                if (!diff) return null;
                return (
                  <div
                    key={id}
                    className="absolute w-8 h-8 -ml-4 -mt-4 border-2 border-emerald-500 rounded-full animate-ping pointer-events-none"
                    style={{ left: `${diff.xPercent}%`, top: `${diff.yPercent}%` }}
                  />
                );
              })}
            </div>
          </div>

          {/* Panel 2: Modified (5 differences) */}
          <div className="flex flex-col items-center">
            <div className="text-xs font-bold text-slate-500 mb-1.5">Bức tranh B (Chứa 5 điểm khác biệt)</div>
            <div
              onClick={handleImageClick}
              className="relative w-full aspect-[4/3] bg-gradient-to-b from-sky-100 to-indigo-50 rounded-2xl border-2 border-blue-400 overflow-hidden cursor-crosshair select-none shadow-sm"
            >
              {/* Classroom Illustration SVG with 5 differences */}
              <svg className="w-full h-full" viewBox="0 0 400 300">
                {/* Chalkboard */}
                <rect x="30" y="30" width="180" height="110" rx="8" fill="#1e3a29" stroke="#92400e" strokeWidth="6" />
                <text x="50" y="70" fill="#a7f3d0" fontSize="16" fontFamily="sans-serif">Chào mừng đến lớp!</text>
                <text x="50" y="100" fill="#fde68a" fontSize="14" fontFamily="sans-serif">AI- OmniTest</text>

                {/* DIFFERENCE 1: Yellow Star drawn on chalkboard */}
                <polygon points="95,65 98,74 107,74 100,79 102,88 95,83 88,88 90,79 83,74 92,74" fill="#facc15" />

                {/* Clock with DIFFERENCE 2: Hands at different time */}
                <circle cx="310" cy="55" r="30" fill="#ffffff" stroke="#475569" strokeWidth="4" />
                <line x1="310" y1="55" x2="310" y2="75" stroke="#dc2626" strokeWidth="3" />
                <line x1="310" y1="55" x2="295" y2="55" stroke="#dc2626" strokeWidth="3" />

                {/* Window */}
                <rect x="250" y="105" width="120" height="60" fill="#bae6fd" stroke="#0284c7" strokeWidth="3" rx="4" />
                <circle cx="330" cy="125" r="12" fill="#facc15" />

                {/* Teacher Desk */}
                <rect x="40" y="180" width="320" height="90" fill="#d97706" rx="6" />
                <rect x="25" y="170" width="350" height="15" fill="#b45309" rx="3" />

                {/* Computer Monitor */}
                <rect x="180" y="125" width="75" height="50" fill="#334155" rx="3" />
                <rect x="184" y="129" width="67" height="42" fill="#0284c7" />
                <polygon points="210,175 225,175 220,185 215,185" fill="#64748b" />

                {/* Books with DIFFERENCE 3: Extra yellow top book */}
                <rect x="60" y="160" width="45" height="12" fill="#2563eb" rx="2" />
                <rect x="65" y="148" width="40" height="12" fill="#dc2626" rx="2" />
                <rect x="70" y="136" width="35" height="12" fill="#eab308" rx="2" />

                {/* DIFFERENCE 4: Red apple beside monitor */}
                <circle cx="260" cy="165" r="9" fill="#dc2626" />
                <line x1="260" y1="156" x2="263" y2="152" stroke="#15803d" strokeWidth="2" />

                {/* Pencil holder with DIFFERENCE 5: Red flag added */}
                <rect x="290" y="150" width="22" height="30" fill="#8b5cf6" rx="2" />
                <line x1="295" y1="150" x2="292" y2="135" stroke="#eab308" strokeWidth="3" />
                <line x1="302" y1="150" x2="305" y2="132" stroke="#10b981" strokeWidth="3" />
                <polygon points="310,135 322,141 310,147" fill="#ef4444" />
                <line x1="310" y1="135" x2="310" y2="155" stroke="#475569" strokeWidth="1.5" />
              </svg>

              {/* Visual markers for found differences */}
              {foundIds.map((id) => {
                const diff = DIFFERENCES.find((d) => d.id === id);
                if (!diff) return null;
                return (
                  <div
                    key={id}
                    className="absolute w-8 h-8 -ml-4 -mt-4 border-2 border-emerald-500 rounded-full bg-emerald-400/20 pointer-events-none flex items-center justify-center text-xs font-bold text-emerald-800"
                    style={{ left: `${diff.xPercent}%`, top: `${diff.yPercent}%` }}
                  >
                    ✓
                  </div>
                );
              })}

              {/* Hint highlight */}
              {showHint && (
                <div
                  className="absolute w-12 h-12 -ml-6 -mt-6 border-2 border-amber-400 rounded-full animate-bounce pointer-events-none bg-amber-300/30"
                  style={{
                    left: `${DIFFERENCES.find((d) => d.id === showHint)?.xPercent}%`,
                    top: `${DIFFERENCES.find((d) => d.id === showHint)?.yPercent}%`,
                  }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Found items checklist */}
        <div className="max-w-md mx-auto mt-4 bg-white p-3 rounded-xl border border-slate-200">
          <div className="text-xs font-semibold text-slate-500 mb-2">Danh sách điểm khác biệt:</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {DIFFERENCES.map((diff) => {
              const isFound = foundIds.includes(diff.id);
              return (
                <div
                  key={diff.id}
                  className={`flex items-center gap-2 p-1.5 rounded-lg ${
                    isFound ? 'text-emerald-700 bg-emerald-50 font-medium' : 'text-slate-400'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] border border-current">
                    {isFound ? '✓' : diff.id}
                  </span>
                  <span>{isFound ? diff.name : 'Chưa tìm thấy...'}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { soundManager } from '../../utils/audio';
import { unlockBadge } from '../../utils/storage';
import { RotateCcw, ArrowLeft, CheckCircle2, Sparkles } from 'lucide-react';

interface PairItem {
  id: string;
  leftText: string;
  leftIcon: string;
  rightText: string;
  rightIcon: string;
}

const PAIR_SETS: PairItem[][] = [
  // Set 1: Môn học và dụng cụ
  [
    { id: '1', leftText: 'Toán học', leftIcon: '📐', rightText: 'Thước kẻ & Compa', rightIcon: '📏' },
    { id: '2', leftText: 'Hóa học', leftIcon: '🧪', rightText: 'Ống nghiệm & Cốc đong', rightIcon: '🧫' },
    { id: '3', leftText: 'Địa lí', leftIcon: '🌍', rightText: 'Quả địa cầu & Bản đồ', rightIcon: '🗺️' },
    { id: '4', leftText: 'Sinh học', leftIcon: '🔬', rightText: 'Kính hiển vi & Tế bào', rightIcon: '🧬' },
    { id: '5', leftText: 'Văn học', leftIcon: '📖', rightText: 'Ngòi bút & Sách giáo khoa', rightIcon: '✒️' },
  ],
  // Set 2: Danh lam thắng cảnh & Địa danh Việt Nam
  [
    { id: '6', leftText: 'Vịnh Hạ Long', leftIcon: '⛵', rightText: 'Kỳ quan thiên nhiên Quảng Ninh', rightIcon: '🌊' },
    { id: '7', leftText: 'Hồ Gươm', leftIcon: '🐢', rightText: 'Tháp Rùa - Thủ đô Hà Nội', rightIcon: '🏛️' },
    { id: '8', leftText: 'Cố đô Huế', leftIcon: '🏯', rightText: 'Sông Hương & Đại Nội', rightIcon: '🛶' },
    { id: '9', leftText: 'Chợ Bến Thành', leftIcon: '🏙️', rightText: 'Biểu tượng TP. Hồ Chí Minh', rightIcon: '🏢' },
    { id: '10', leftText: 'Fansipan', leftIcon: '🏔️', rightText: 'Nóc nhà Đông Dương - Lào Cai', rightIcon: '🚩' },
  ],
];

export const ImagePairGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [setIndex, setSetIndex] = useState(0);
  const [leftSelected, setLeftSelected] = useState<string | null>(null);
  const [rightSelected, setRightSelected] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [shuffledRights, setShuffledRights] = useState<PairItem[]>([]);
  const [isWon, setIsWon] = useState(false);

  const currentSet = PAIR_SETS[setIndex];

  const initSet = (idx: number) => {
    soundManager.playClick();
    const set = PAIR_SETS[idx];
    setLeftSelected(null);
    setRightSelected(null);
    setMatchedPairs([]);
    setIsWon(false);
    // Shuffle the right-side cards
    const shuffled = [...set].sort(() => Math.random() - 0.5);
    setShuffledRights(shuffled);
  };

  useEffect(() => {
    initSet(setIndex);
  }, [setIndex]);

  const handleLeftClick = (id: string) => {
    if (matchedPairs.includes(id)) return;
    soundManager.playClick();
    setLeftSelected(id);
    if (rightSelected) {
      checkMatch(id, rightSelected);
    }
  };

  const handleRightClick = (id: string) => {
    if (matchedPairs.includes(id)) return;
    soundManager.playClick();
    setRightSelected(id);
    if (leftSelected) {
      checkMatch(leftSelected, id);
    }
  };

  const checkMatch = (lId: string, rId: string) => {
    if (lId === rId) {
      soundManager.playCorrect();
      const updated = [...matchedPairs, lId];
      setMatchedPairs(updated);
      setLeftSelected(null);
      setRightSelected(null);

      if (updated.length === currentSet.length) {
        setIsWon(true);
        soundManager.playVictory();
        unlockBadge('gamer_learner');
      }
    } else {
      soundManager.playIncorrect();
      setTimeout(() => {
        setLeftSelected(null);
        setRightSelected(null);
      }, 500);
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
            <h3 className="text-base font-bold text-slate-900">Ghép Cặp Hình Ảnh & Khái Niệm</h3>
            <p className="text-xs text-slate-500">Chọn 1 ô bên trái và 1 ô bên phải có ý nghĩa tương ứng</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSetIndex((prev) => (prev === 0 ? 1 : 0))}
            className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold border border-blue-200 transition-colors"
          >
            Chủ đề: {setIndex === 0 ? 'Môn học' : 'Địa danh VN'}
          </button>
          <button
            onClick={() => initSet(setIndex)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Chơi lại</span>
          </button>
        </div>
      </div>

      {/* Board */}
      <div className="bg-slate-50 p-4 sm:p-6 rounded-2xl border border-slate-200">
        {isWon && (
          <div className="text-center p-6 bg-white rounded-2xl border border-emerald-200 shadow-sm max-w-sm w-full mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
            <h4 className="text-lg font-bold text-emerald-800">Ghép Đôi Xuất Sắc!</h4>
            <p className="text-sm text-slate-600 mt-1">Bạn đã hoàn thành chính xác tất cả các cặp tương ứng.</p>
            <button
              onClick={() => {
                setSetIndex((prev) => (prev === 0 ? 1 : 0));
              }}
              className="mt-4 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 mx-auto"
            >
              <Sparkles className="w-4 h-4" />
              <span>Chuyển sang chủ đề tiếp theo</span>
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
          {/* Left Column */}
          <div className="space-y-2.5">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Cột A: Khái niệm</div>
            {currentSet.map((item) => {
              const isMatched = matchedPairs.includes(item.id);
              const isSelected = leftSelected === item.id;
              return (
                <button
                  key={item.id}
                  disabled={isMatched}
                  onClick={() => handleLeftClick(item.id)}
                  className={`w-full p-3.5 rounded-xl border text-left flex items-center gap-3 transition-all ${
                    isMatched
                      ? 'bg-emerald-50 border-emerald-200 opacity-60 text-emerald-800'
                      : isSelected
                      ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-400 shadow-sm'
                      : 'bg-white hover:bg-slate-50 border-slate-200 shadow-sm'
                  }`}
                >
                  <span className="text-2xl">{item.leftIcon}</span>
                  <span className="font-semibold text-slate-800 text-sm">{item.leftText}</span>
                  {isMatched && <CheckCircle2 className="w-4 h-4 text-emerald-600 ml-auto" />}
                </button>
              );
            })}
          </div>

          {/* Right Column */}
          <div className="space-y-2.5">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Cột B: Ý nghĩa tương ứng</div>
            {shuffledRights.map((item) => {
              const isMatched = matchedPairs.includes(item.id);
              const isSelected = rightSelected === item.id;
              return (
                <button
                  key={item.id}
                  disabled={isMatched}
                  onClick={() => handleRightClick(item.id)}
                  className={`w-full p-3.5 rounded-xl border text-left flex items-center gap-3 transition-all ${
                    isMatched
                      ? 'bg-emerald-50 border-emerald-200 opacity-60 text-emerald-800'
                      : isSelected
                      ? 'bg-purple-50 border-purple-500 ring-2 ring-purple-400 shadow-sm'
                      : 'bg-white hover:bg-slate-50 border-slate-200 shadow-sm'
                  }`}
                >
                  <span className="text-2xl">{item.rightIcon}</span>
                  <span className="font-semibold text-slate-800 text-sm">{item.rightText}</span>
                  {isMatched && <CheckCircle2 className="w-4 h-4 text-emerald-600 ml-auto" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

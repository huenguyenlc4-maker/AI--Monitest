import React, { useState } from 'react';
import { soundManager } from '../../utils/audio';
import { unlockBadge } from '../../utils/storage';
import { RotateCcw, ArrowLeft, Lightbulb, CheckCircle2, ChevronRight } from 'lucide-react';

interface PuzzleItem {
  id: number;
  emojis: string[];
  answer: string; // uppercase without spaces for matching
  displayWord: string; // formatted with spaces
  hint: string;
}

const PUZZLES: PuzzleItem[] = [
  {
    id: 1,
    emojis: ['🌺', '🎒', '📖'],
    answer: 'HOAHOCTRO',
    displayWord: 'HOA HỌC TRÒ',
    hint: 'Biệt danh quen thuộc của hoa phượng vĩ gắn liền với mùa thi và tuổi học trò.',
  },
  {
    id: 2,
    emojis: ['📚', '🐛'],
    answer: 'MOTSACH',
    displayWord: 'MỌT SÁCH',
    hint: 'Từ vui dùng để chỉ người say mê đọc sách bất kể ngày đêm.',
  },
  {
    id: 3,
    emojis: ['👨‍🏫', '⛵', '🌊'],
    answer: 'NGUOILAIDO',
    displayWord: 'NGƯỜI LÁI ĐÒ',
    hint: 'Hình ảnh ẩn dụ cao đẹp nói về công ơn thầy cô đưa từng thế hệ học trò qua sông tri thức.',
  },
  {
    id: 4,
    emojis: ['🐢', '🐇', '🏁'],
    answer: 'RUAVATHO',
    displayWord: 'RÙA VÀ THỎ',
    hint: 'Câu chuyện ngụ ngôn nổi tiếng khuyên chúng ta đức tính kiên trì, không chủ quan.',
  },
  {
    id: 5,
    emojis: ['🌞', '🌻'],
    answer: 'HUONGDUONG',
    displayWord: 'HƯỚNG DƯƠNG',
    hint: 'Loài hoa luôn hướng về ánh sáng mặt trời, biểu tượng cho tinh thần lạc quan.',
  },
];

export const GuessWordGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userLetters, setUserLetters] = useState<string[]>([]);
  const [showHint, setShowHint] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);

  const currentPuzzle = PUZZLES[currentIdx];
  const targetLength = currentPuzzle.answer.length;

  // Generate scrambled letter bank (target letters + few random distractors)
  const [letterBank, setLetterBank] = useState<{ id: number; char: string; used: boolean }[]>([]);

  const initPuzzle = (idx: number) => {
    soundManager.playClick();
    const p = PUZZLES[idx];
    setUserLetters([]);
    setShowHint(false);
    setIsCorrect(false);

    const chars = p.answer.split('');
    const alphabet = 'ABCDEGHKLMNOPQRSTUVXY';
    while (chars.length < 14) {
      chars.push(alphabet[Math.floor(Math.random() * alphabet.length)]);
    }
    const shuffled = chars
      .sort(() => Math.random() - 0.5)
      .map((c, i) => ({ id: i, char: c, used: false }));
    setLetterBank(shuffled);
  };

  React.useEffect(() => {
    initPuzzle(currentIdx);
  }, [currentIdx]);

  const handlePickLetter = (bankItem: { id: number; char: string; used: boolean }) => {
    if (bankItem.used || isCorrect || userLetters.length >= targetLength) return;
    soundManager.playClick();

    const newUsers = [...userLetters, bankItem.char];
    setUserLetters(newUsers);

    // mark used
    setLetterBank((prev) =>
      prev.map((b) => (b.id === bankItem.id ? { ...b, used: true } : b))
    );

    // Check if full
    if (newUsers.length === targetLength) {
      const guessed = newUsers.join('');
      if (guessed === currentPuzzle.answer) {
        setIsCorrect(true);
        soundManager.playCorrect();
        setScore((prev) => prev + 20);
        unlockBadge('gamer_learner');
      } else {
        soundManager.playIncorrect();
      }
    }
  };

  const handleRemoveLetter = (index: number) => {
    if (isCorrect) return;
    soundManager.playClick();
    const charToRemove = userLetters[index];
    const newUsers = userLetters.filter((_, i) => i !== index);
    setUserLetters(newUsers);

    // Unmark in letter bank
    let unfreezed = false;
    setLetterBank((prev) =>
      prev.map((b) => {
        if (!unfreezed && b.char === charToRemove && b.used) {
          unfreezed = true;
          return { ...b, used: false };
        }
        return b;
      })
    );
  };

  const handleNext = () => {
    soundManager.playClick();
    if (currentIdx < PUZZLES.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      soundManager.playVictory();
      setCurrentIdx(0);
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
            <h3 className="text-base font-bold text-slate-900">Đuổi Hình Bắt Chữ Học Đường</h3>
            <p className="text-xs text-slate-500">
              Câu {currentIdx + 1}/{PUZZLES.length} · Nhìn hình đoán cụm từ ý nghĩa
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
            Điểm: {score}
          </div>
          <button
            onClick={() => initPuzzle(currentIdx)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Làm lại</span>
          </button>
        </div>
      </div>

      {/* Main puzzle card */}
      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col items-center">
        {/* Visual rebus */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center gap-4 text-5xl sm:text-6xl mb-6">
          {currentPuzzle.emojis.map((emoji, i) => (
            <span key={i} className="transform hover:scale-110 transition-transform">
              {emoji}
            </span>
          ))}
        </div>

        {/* Target Letter Slots */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
          {Array.from({ length: targetLength }).map((_, i) => {
            const char = userLetters[i];
            return (
              <button
                key={i}
                onClick={() => char && handleRemoveLetter(i)}
                className={`w-10 h-12 sm:w-12 sm:h-14 rounded-xl text-xl sm:text-2xl font-bold flex items-center justify-center transition-all ${
                  char
                    ? isCorrect
                      ? 'bg-emerald-500 text-white shadow-md'
                      : 'bg-white border-2 border-blue-500 text-blue-600 shadow-sm'
                    : 'bg-white/80 border-2 border-dashed border-slate-300 text-transparent'
                }`}
              >
                {char || ''}
              </button>
            );
          })}
        </div>

        {/* Feedback / Next button */}
        {isCorrect ? (
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 text-emerald-600 font-bold text-lg mb-2">
              <CheckCircle2 className="w-6 h-6" />
              <span>Chính xác: {currentPuzzle.displayWord}!</span>
            </div>
            <button
              onClick={handleNext}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 mx-auto shadow-sm"
            >
              <span>{currentIdx < PUZZLES.length - 1 ? 'Câu tiếp theo' : 'Chơi lại từ đầu'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => {
                soundManager.playClick();
                setShowHint(!showHint);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-xs font-semibold border border-amber-200 transition-colors"
            >
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span>{showHint ? 'Ẩn gợi ý' : 'Xem gợi ý'}</span>
            </button>
          </div>
        )}

        {showHint && (
          <div className="bg-amber-50 border border-amber-200 text-amber-900 px-4 py-2.5 rounded-xl text-xs max-w-md text-center mb-4">
            💡 <strong>Gợi ý:</strong> {currentPuzzle.hint}
          </div>
        )}

        {/* Letter Bank */}
        <div className="w-full max-w-md">
          <div className="text-xs text-slate-400 font-medium text-center mb-2">Chạm vào chữ cái để điền:</div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {letterBank.map((b) => (
              <button
                key={b.id}
                onClick={() => handlePickLetter(b)}
                disabled={b.used || isCorrect}
                className={`w-10 h-10 rounded-xl text-base font-bold flex items-center justify-center transition-all ${
                  b.used
                    ? 'bg-slate-200 text-slate-400 opacity-40'
                    : 'bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-800 shadow-sm active:scale-95'
                }`}
              >
                {b.char}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

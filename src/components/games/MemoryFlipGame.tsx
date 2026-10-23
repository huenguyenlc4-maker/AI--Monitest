import React, { useState, useEffect } from 'react';
import { soundManager } from '../../utils/audio';
import { unlockBadge } from '../../utils/storage';
import { RotateCcw, ArrowLeft, Trophy, Clock, CheckCircle2 } from 'lucide-react';

interface CardItem {
  id: number;
  icon: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const ALL_ICONS = ['📐', '🔬', '🌍', '📖', '🧪', '🔭', '🎨', '💻', '💡', '🏆', '🎯', '🚀'];

export const MemoryFlipGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [cardCount, setCardCount] = useState<number>(16); // 12, 16, 20
  const [cards, setCards] = useState<CardItem[]>([]);
  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [moves, setMoves] = useState<number>(0);
  const [seconds, setSeconds] = useState<number>(0);
  const [isWon, setIsWon] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const initGame = (count = cardCount) => {
    soundManager.playClick();
    const pairsNeeded = count / 2;
    const icons = ALL_ICONS.slice(0, pairsNeeded);
    const cardPairs = [...icons, ...icons];
    const shuffled = cardPairs.sort(() => Math.random() - 0.5);

    setCards(
      shuffled.map((icon, idx) => ({
        id: idx,
        icon,
        isFlipped: false,
        isMatched: false,
      }))
    );
    setFlippedIds([]);
    setMoves(0);
    setSeconds(0);
    setIsWon(false);
    setIsProcessing(false);
  };

  useEffect(() => {
    initGame(cardCount);
  }, [cardCount]);

  useEffect(() => {
    if (isWon) return;
    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isWon]);

  const handleCardClick = (id: number) => {
    if (isProcessing) return;
    const clickedCard = cards.find((c) => c.id === id);
    if (!clickedCard || clickedCard.isFlipped || clickedCard.isMatched) return;

    soundManager.playClick();

    // Flip this card
    const updatedCards = cards.map((c) => (c.id === id ? { ...c, isFlipped: true } : c));
    setCards(updatedCards);

    const newFlipped = [...flippedIds, id];
    setFlippedIds(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((prev) => prev + 1);
      setIsProcessing(true);

      const [firstId, secondId] = newFlipped;
      const card1 = updatedCards.find((c) => c.id === firstId);
      const card2 = updatedCards.find((c) => c.id === secondId);

      if (card1 && card2 && card1.icon === card2.icon) {
        // Matched!
        soundManager.playCorrect();
        setTimeout(() => {
          const matchedCards = updatedCards.map((c) =>
            c.id === firstId || c.id === secondId ? { ...c, isMatched: true } : c
          );
          setCards(matchedCards);
          setFlippedIds([]);
          setIsProcessing(false);

          if (matchedCards.every((c) => c.isMatched)) {
            setIsWon(true);
            soundManager.playVictory();
            unlockBadge('gamer_learner');
          }
        }, 300);
      } else {
        // Not matched, flip back
        soundManager.playIncorrect();
        setTimeout(() => {
          setCards(
            updatedCards.map((c) =>
              c.id === firstId || c.id === secondId ? { ...c, isFlipped: false } : c
            )
          );
          setFlippedIds([]);
          setIsProcessing(false);
        }, 900);
      }
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
            <h3 className="text-base font-bold text-slate-900">Lật Hình Ghi Nhớ Tri Thức</h3>
            <p className="text-xs text-slate-500">Luyện trí nhớ bằng cách tìm các cặp biểu tượng tương ứng</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Difficulty */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg">
            {[12, 16, 20].map((num) => (
              <button
                key={num}
                onClick={() => setCardCount(num)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                  cardCount === num ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600'
                }`}
              >
                {num === 12 ? 'Dễ (12)' : num === 16 ? 'Vừa (16)' : 'Khó (20)'}
              </button>
            ))}
          </div>

          <button
            onClick={() => initGame(cardCount)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Chơi lại</span>
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="bg-white px-4 py-2.5 rounded-xl border border-slate-200 flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 text-slate-600">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>Số lượt lật:</span>
            <span className="font-bold text-slate-900 tabular-nums">{moves}</span>
          </span>
          <span className="flex items-center gap-1 text-slate-600">
            <Clock className="w-4 h-4 text-blue-500" />
            <span>Thời gian:</span>
            <span className="font-bold text-slate-900 tabular-nums">{seconds}s</span>
          </span>
        </div>
      </div>

      {/* Board */}
      <div className="bg-slate-50 p-4 sm:p-6 rounded-2xl border border-slate-200 flex flex-col items-center min-h-[360px]">
        {isWon && (
          <div className="text-center p-6 bg-white rounded-2xl border border-emerald-200 shadow-sm max-w-sm w-full mb-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
            <h4 className="text-lg font-bold text-emerald-800">Trí Nhớ Tuyệt Vời!</h4>
            <p className="text-sm text-slate-600 mt-1">
              Bạn hoàn thành trong <span className="font-bold text-emerald-600">{moves} lượt</span> và{' '}
              <span className="font-bold">{seconds} giây</span>.
            </p>
            <button
              onClick={() => initGame(cardCount)}
              className="mt-4 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              Chơi lại ván mới
            </button>
          </div>
        )}

        <div
          className={`grid gap-3 select-none ${
            cardCount === 12
              ? 'grid-cols-3 sm:grid-cols-4'
              : cardCount === 16
              ? 'grid-cols-4'
              : 'grid-cols-4 sm:grid-cols-5'
          }`}
        >
          {cards.map((card) => {
            const isShown = card.isFlipped || card.isMatched;
            return (
              <button
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                disabled={isShown}
                className={`w-16 h-20 sm:w-20 sm:h-24 rounded-xl text-3xl flex items-center justify-center transition-all transform duration-300 ${
                  card.isMatched
                    ? 'bg-emerald-50 border-2 border-emerald-400 opacity-90 scale-95'
                    : card.isFlipped
                    ? 'bg-white border-2 border-blue-500 shadow-md rotate-y-180'
                    : 'bg-gradient-to-br from-blue-500 to-indigo-600 border border-blue-600 shadow text-white hover:brightness-105'
                }`}
              >
                {isShown ? (
                  card.icon
                ) : (
                  <span className="text-white/60 text-lg font-bold select-none">?</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

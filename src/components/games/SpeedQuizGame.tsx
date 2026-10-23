import React, { useState, useEffect } from 'react';
import { soundManager } from '../../utils/audio';
import { unlockBadge } from '../../utils/storage';
import { RotateCcw, ArrowLeft, Trophy, Clock, Zap, CheckCircle2, XCircle } from 'lucide-react';

interface QuickQuizQuestion {
  id: number;
  category: string;
  question: string;
  options: string[];
  correctIdx: number;
  funFact: string;
}

const TRIVIA_QUESTIONS: QuickQuizQuestion[] = [
  {
    id: 1,
    category: 'Khoa học kỳ thú',
    question: 'Hành tinh nào trong Hệ Mặt Trời được mệnh danh là "Hành tinh Đỏ"?',
    options: ['Sao Kim', 'Sao Hỏa', 'Sao Mộc', 'Sao Thủy'],
    correctIdx: 1,
    funFact: 'Sao Hỏa có màu đỏ cam do bề mặt chứa nhiều oxit sắt (rỉ sét).',
  },
  {
    id: 2,
    category: 'Địa lí Việt Nam',
    question: 'Đỉnh núi cao nhất Việt Nam và toàn Đông Dương là đỉnh núi nào?',
    options: ['Bà Nà', 'Fansipan', 'Bạch Mộc Lương Tử', 'Tây Côn Lĩnh'],
    correctIdx: 1,
    funFact: 'Fansipan cao 3.143 mét thuộc dãy núi Hoàng Liên Sơn, tỉnh Lào Cai.',
  },
  {
    id: 3,
    category: 'Đố vui thông thái',
    question: 'Con gì đầu dê mình ốc, sống ở dưới nước?',
    options: ['Con cá chuồn', 'Con dốc', 'Con ốc vặn', 'Con cá heo'],
    correctIdx: 1,
    funFact: 'Chơi chữ dân gian: "Dê" là Dương, "Ốc" ghép lại thành Dốc!',
  },
  {
    id: 4,
    category: 'Lịch sử dân tộc',
    question: 'Chiến thắng Bạch Đằng năm 938 do vị anh hùng dân tộc nào lãnh đạo?',
    options: ['Trần Hưng Đạo', 'Ngô Quyền', 'Lê Hoàn', 'Quang Trung'],
    correctIdx: 1,
    funFact: 'Ngô Quyền đã dùng cọc gỗ bọc sắt cắm xuống sông Bạch Đằng đánh tan quân Nam Hán.',
  },
  {
    id: 5,
    category: 'Sinh học tự nhiên',
    question: 'Loài chim nào là loài chim duy nhất có thể bay lùi?',
    options: ['Chim sẻ', 'Chim bồ câu', 'Chim ruồi', 'Chim ưng'],
    correctIdx: 2,
    funFact: 'Chim ruồi có cấu trúc khớp cánh linh hoạt đặc biệt cho phép đập cánh 80 lần/giây và bay lùi.',
  },
];

export const SpeedQuizGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const currentQ = TRIVIA_QUESTIONS[currentIdx];

  const resetGame = () => {
    soundManager.playClick();
    setCurrentIdx(0);
    setSelectedIdx(null);
    setScore(0);
    setStreak(0);
    setTimeLeft(15);
    setIsAnswered(false);
    setIsFinished(false);
  };

  useEffect(() => {
    if (isAnswered || isFinished) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isAnswered, isFinished, currentIdx]);

  const handleTimeOut = () => {
    setIsAnswered(true);
    setStreak(0);
    soundManager.playIncorrect();
  };

  const handleChoose = (idx: number) => {
    if (isAnswered || isFinished) return;
    setSelectedIdx(idx);
    setIsAnswered(true);

    if (idx === currentQ.correctIdx) {
      soundManager.playCorrect();
      const points = 100 + timeLeft * 10;
      setScore((prev) => prev + points);
      setStreak((prev) => prev + 1);
      unlockBadge('gamer_learner');
    } else {
      soundManager.playIncorrect();
      setStreak(0);
    }
  };

  const handleNext = () => {
    soundManager.playClick();
    if (currentIdx < TRIVIA_QUESTIONS.length - 1) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedIdx(null);
      setIsAnswered(false);
      setTimeLeft(15);
    } else {
      setIsFinished(true);
      soundManager.playVictory();
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
            <h3 className="text-base font-bold text-slate-900">Trắc Nghiệm Nhanh Vui Nhộn</h3>
            <p className="text-xs text-slate-500">
              Câu {currentIdx + 1}/{TRIVIA_QUESTIONS.length} · 15 giây đếm ngược mỗi câu
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 text-xs font-semibold">
            <Trophy className="w-3.5 h-3.5" />
            <span className="tabular-nums">Điểm: {score}</span>
          </div>
          {streak > 1 && (
            <div className="flex items-center gap-1 text-rose-600 bg-rose-50 px-2.5 py-1.5 rounded-lg border border-rose-200 text-xs font-bold animate-pulse">
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Chuỗi x{streak}</span>
            </div>
          )}
          <button
            onClick={resetGame}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Chơi lại</span>
          </button>
        </div>
      </div>

      {/* Main card */}
      <div className="bg-slate-50 p-4 sm:p-6 rounded-2xl border border-slate-200">
        {isFinished ? (
          <div className="text-center p-6 bg-white rounded-2xl border border-emerald-200 shadow-sm max-w-sm w-full mx-auto">
            <Trophy className="w-12 h-12 text-amber-500 mx-auto mb-2" />
            <h4 className="text-lg font-bold text-slate-900">Hoàn Thành Thử Thách!</h4>
            <p className="text-sm text-slate-600 mt-1">
              Tổng điểm của bạn đạt <strong className="text-blue-600 font-bold">{score} điểm</strong>!
            </p>
            <button
              onClick={resetGame}
              className="mt-4 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              Chơi lại lượt mới
            </button>
          </div>
        ) : (
          <div className="max-w-xl mx-auto space-y-4">
            {/* Category and Countdown timer */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                {currentQ.category}
              </span>

              <div
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tabular-nums ${
                  timeLeft <= 5
                    ? 'bg-rose-100 text-rose-700 animate-pulse'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{timeLeft}s</span>
              </div>
            </div>

            {/* Question Prompt */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <h4 className="text-base sm:text-lg font-semibold text-slate-900 leading-snug">
                {currentQ.question}
              </h4>
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {currentQ.options.map((opt, i) => {
                const isSelected = selectedIdx === i;
                const isCorrectOpt = i === currentQ.correctIdx;
                let btnStyle = 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800';

                if (isAnswered) {
                  if (isCorrectOpt) {
                    btnStyle = 'bg-emerald-500 text-white border-emerald-600 shadow';
                  } else if (isSelected) {
                    btnStyle = 'bg-rose-500 text-white border-rose-600';
                  } else {
                    btnStyle = 'bg-slate-100 text-slate-400 border-slate-200 opacity-60';
                  }
                }

                return (
                  <button
                    key={i}
                    onClick={() => handleChoose(i)}
                    disabled={isAnswered}
                    className={`p-3.5 rounded-xl border text-left font-medium text-sm flex items-center justify-between transition-all ${btnStyle}`}
                  >
                    <span>{opt}</span>
                    {isAnswered && isCorrectOpt && <CheckCircle2 className="w-4 h-4 text-white" />}
                    {isAnswered && isSelected && !isCorrectOpt && <XCircle className="w-4 h-4 text-white" />}
                  </button>
                );
              })}
            </div>

            {/* Fun Fact / Explanation & Next */}
            {isAnswered && (
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                <div className="text-xs text-slate-600">
                  💡 <strong>Góc kiến thức:</strong> {currentQ.funFact}
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={handleNext}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors"
                  >
                    {currentIdx < TRIVIA_QUESTIONS.length - 1 ? 'Câu tiếp theo' : 'Xem kết quả'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

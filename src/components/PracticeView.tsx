import React, { useState, useEffect } from 'react';
import { DocumentOutline, PracticeSessionResult, Question, QuestionType, StudentProfile } from '../types';
import { soundManager } from '../utils/audio';
import { compareShortAnswer } from '../utils/curriculumSolver';
import {
  Clock,
  Flag,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Play,
  Grid,
  X,
  HelpCircle,
  Eye,
} from 'lucide-react';

interface PracticeViewProps {
  currentStudent: StudentProfile | null;
  outlines: DocumentOutline[];
  preSelectedOutline?: DocumentOutline | null;
  mistakesOnlyQuestions?: Question[] | null;
  onFinishPractice: (result: PracticeSessionResult) => void;
  onBackToDashboard: () => void;
}

export const PracticeView: React.FC<PracticeViewProps> = ({
  currentStudent,
  outlines,
  preSelectedOutline,
  mistakesOnlyQuestions,
  onFinishPractice,
  onBackToDashboard,
}) => {
  // Setup state
  const [selectedOutlineId, setSelectedOutlineId] = useState<string>(
    preSelectedOutline?.id || (outlines.length > 0 ? outlines[0].id : '')
  );
  const [selectedType, setSelectedType] = useState<string>('all'); // all, multiple_choice, true_false, short_answer
  const [mode, setMode] = useState<'immediate' | 'exam'>('exam');
  const [isShuffled, setIsShuffled] = useState(false);
  const [isPracticing, setIsPracticing] = useState(false);

  // In-session state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({});
  const [flaggedIds, setFlaggedIds] = useState<string[]>([]);
  const [seconds, setSeconds] = useState(0);
  const [showNavGrid, setShowNavGrid] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showAnswerHelper, setShowAnswerHelper] = useState<Record<string, boolean>>({});
  const [startTime, setStartTime] = useState<Date>(new Date());

  // Current active outline object
  const activeOutline = outlines.find((o) => o.id === selectedOutlineId) || outlines[0];

  // If mistakesOnlyQuestions was passed, auto-start in mistakes mode
  useEffect(() => {
    if (mistakesOnlyQuestions && mistakesOnlyQuestions.length > 0) {
      setQuestions(mistakesOnlyQuestions);
      setCurrentIndex(0);
      setUserAnswers({});
      setFlaggedIds([]);
      setSeconds(0);
      setIsPracticing(true);
      setStartTime(new Date());
    }
  }, [mistakesOnlyQuestions]);

  // Timer
  useEffect(() => {
    if (!isPracticing) return;
    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isPracticing]);

  const handleStartSession = () => {
    soundManager.playClick();
    if (!activeOutline || activeOutline.questions.length === 0) return;

    let pool = [...activeOutline.questions];
    if (selectedType !== 'all') {
      pool = pool.filter((q) => q.type === selectedType);
    }
    if (pool.length === 0) {
      alert('Không có câu hỏi nào thuộc dạng này trong đề cương đã chọn.');
      return;
    }

    if (isShuffled) {
      pool = pool.sort(() => Math.random() - 0.5);
    }

    setQuestions(pool);
    setCurrentIndex(0);
    setUserAnswers({});
    setFlaggedIds([]);
    setSeconds(0);
    setIsPracticing(true);
    setStartTime(new Date());
  };

  const currentQ = questions[currentIndex];

  const handleSelectOptionA = (key: string) => {
    soundManager.playSelect();
    setUserAnswers((prev) => ({ ...prev, [currentQ.id]: key }));
  };

  const handleSelectTrueFalseB = (statementId: string, value: boolean) => {
    soundManager.playSelect();
    const existing = userAnswers[currentQ.id] || {};
    setUserAnswers((prev) => ({
      ...prev,
      [currentQ.id]: {
        ...existing,
        [statementId]: value,
      },
    }));
  };

  const handleInputShortAnswerC = (val: string) => {
    setUserAnswers((prev) => ({ ...prev, [currentQ.id]: val }));
  };

  const handleToggleFlag = (id: string) => {
    soundManager.playClick();
    setFlaggedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      soundManager.playClick();
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      soundManager.playClick();
      setCurrentIndex((prev) => prev + 1);
    }
  };

  // Evaluation & Grading Logic adhering to strict GDPT 2018 exam rules
  const handleSubmitSession = () => {
    setShowSubmitConfirm(false);
    soundManager.playVictory();

    let correctCount = 0;
    let incorrectCount = 0;
    let unansweredCount = 0;
    let pendingCount = 0;
    let totalScorePoints = 0;
    const maxPossiblePoints = questions.length * 1.0;

    questions.forEach((q) => {
      const userAns = userAnswers[q.id];

      if (q.type === 'multiple_choice') {
        if (!userAns) {
          unansweredCount++;
        } else if (q.correctAnswer && userAns.toUpperCase() === q.correctAnswer.toUpperCase()) {
          correctCount++;
          totalScorePoints += 1.0;
        } else {
          incorrectCount++;
        }
      } else if (q.type === 'true_false') {
        if (!q.statements || q.statements.length === 0) {
          unansweredCount++;
          return;
        }
        const userMap = userAns || {};
        let answeredStatements = 0;
        let correctStatements = 0;

        q.statements.forEach((s) => {
          if (userMap[s.id] !== undefined) {
            answeredStatements++;
            if (s.correctAnswer !== null && userMap[s.id] === s.correctAnswer) {
              correctStatements++;
            }
          }
        });

        if (answeredStatements === 0) {
          unansweredCount++;
        } else {
          // Quy chuẩn chấm thi GDPT 2018 của Bộ GD&ĐT:
          // Đúng 1 ý: 0.1đ | Đúng 2 ý: 0.25đ | Đúng 3 ý: 0.5đ | Đúng 4 ý: 1.0đ
          if (correctStatements === 4) {
            totalScorePoints += 1.0;
            correctCount++;
          } else if (correctStatements === 3) {
            totalScorePoints += 0.5;
            correctCount += 0.5;
            incorrectCount += 0.5;
          } else if (correctStatements === 2) {
            totalScorePoints += 0.25;
            incorrectCount += 0.75;
          } else if (correctStatements === 1) {
            totalScorePoints += 0.1;
            incorrectCount += 0.9;
          } else {
            incorrectCount++;
          }
        }
      } else if (q.type === 'short_answer') {
        if (!userAns || !userAns.trim()) {
          unansweredCount++;
        } else if (q.correctAnswer) {
          // Chuẩn hóa so sánh nâng cao: hỗ trợ dấu phẩy/chấm thập phân (1,5 == 1.5), đơn vị đo, phân số, chữ hoa/thường
          const isCorrect = compareShortAnswer(userAns, q.correctAnswer);
          if (isCorrect) {
            correctCount++;
            totalScorePoints += 1.0;
          } else {
            incorrectCount++;
          }
        } else {
          // Question has no verified key -> pending manual review
          pendingCount++;
        }
      }
    });

    const score10 = maxPossiblePoints > 0 ? Math.round((totalScorePoints / maxPossiblePoints) * 10 * 10) / 10 : 0;
    const accuracyRate = maxPossiblePoints > 0 ? Math.round((totalScorePoints / maxPossiblePoints) * 100) : 0;

    // Pedagogical positive feedback (không áp lực, khích lệ)
    let feedback = '';
    if (score10 >= 9.0) {
      feedback = 'Xuất sắc! Em đã nắm vững hầu hết kiến thức trọng tâm. Hãy tiếp tục duy trì phong độ này nhé!';
    } else if (score10 >= 7.0) {
      feedback = 'Kết quả rất tốt! Em đã có nền tảng vững vàng, chỉ cần rà soát lại một vài câu nhầm lẫn là sẽ đạt điểm tối đa.';
    } else if (score10 >= 5.0) {
      feedback = 'Em đã hoàn thành buổi ôn tập với nhiều cố gắng. Hãy sử dụng chức năng Ôn câu sai để củng cố lại các phần kiến thức này nhé!';
    } else {
      feedback = 'Đây là bước khởi đầu tốt để nhận diện phần kiến thức cần bổ sung. Hãy kiên trì luyện tập, từng lần ôn tập sẽ giúp em tiến bộ rõ rệt!';
    }

    const sessionResult: PracticeSessionResult = {
      id: `session_${Date.now()}`,
      studentId: currentStudent?.id || 'guest',
      studentName: currentStudent?.fullName || 'Học sinh',
      gradeClass: currentStudent?.gradeClass || activeOutline.grade,
      outlineId: activeOutline.id,
      outlineTitle: activeOutline.title,
      subject: activeOutline.subject,
      startedAt: startTime.toISOString(),
      completedAt: new Date().toISOString(),
      durationSeconds: seconds,
      totalQuestions: questions.length,
      correctCount,
      incorrectCount,
      unansweredCount,
      pendingCount,
      score10,
      accuracyRate,
      userAnswers,
      mode,
      selectedTypes: [selectedType as QuestionType],
      questionsSnapshot: questions,
      pedagogicalFeedback: feedback,
    };

    onFinishPractice(sessionResult);
  };

  const answeredCount = Object.keys(userAnswers).filter((k) => {
    const val = userAnswers[k];
    if (typeof val === 'object' && val !== null) {
      return Object.keys(val).length > 0;
    }
    return val !== undefined && val !== '';
  }).length;

  // Format seconds to mm:ss
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // 1. Setup Screen before starting
  if (!isPracticing) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Cấu Hình Buổi Luyện Tập
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Chọn đề cương, dạng câu hỏi và chế độ ôn tập phù hợp với mục tiêu của em.
            </p>
          </div>

          <div className="space-y-4">
            {/* Outline Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Chọn tài liệu đề cương
              </label>
              <select
                value={selectedOutlineId}
                onChange={(e) => setSelectedOutlineId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                {outlines.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.title} ({o.subject} - {o.grade} - {o.questions.length} câu)
                  </option>
                ))}
              </select>
            </div>

            {/* Question Type Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Dạng bài tập luyện tập
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'all', label: 'Tất cả dạng' },
                  { id: 'multiple_choice', label: 'Dạng A: 4 lựa chọn' },
                  { id: 'true_false', label: 'Dạng B: Đúng / Sai' },
                  { id: 'short_answer', label: 'Dạng C: Trả lời ngắn' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      soundManager.playClick();
                      setSelectedType(t.id);
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                      selectedType === t.id
                        ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mode: Instant Feedback vs Exam */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Chế độ làm bài
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    soundManager.playClick();
                    setMode('immediate');
                  }}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    mode === 'immediate'
                      ? 'bg-blue-50 border-blue-500 shadow-xs'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="font-bold text-xs text-slate-900 mb-0.5">
                    Luyện tập có phản hồi ngay
                  </div>
                  <div className="text-[11px] text-slate-500 leading-relaxed">
                    Xem đáp án và giải thích chi tiết ngay sau khi chọn phương án mỗi câu.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    soundManager.playClick();
                    setMode('exam');
                  }}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    mode === 'exam'
                      ? 'bg-blue-50 border-blue-500 shadow-xs'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="font-bold text-xs text-slate-900 mb-0.5">
                    Kiểm tra bấm giờ (Chuẩn thi)
                  </div>
                  <div className="text-[11px] text-slate-500 leading-relaxed">
                    Bấm giờ làm bài tập trung, nộp bài tính điểm chuẩn và nhận xét cuối buổi.
                  </div>
                </button>
              </div>
            </div>

            {/* Shuffle toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-semibold text-slate-700">Xáo trộn thứ tự câu hỏi</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isShuffled}
                  onChange={(e) => setIsShuffled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between gap-3">
            <button
              onClick={() => {
                soundManager.playClick();
                onBackToDashboard();
              }}
              className="flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-black text-xs rounded-2xl shadow-md hover:shadow-lg active:scale-95 transition-all border border-blue-400/40 ring-2 ring-blue-300/50 cursor-pointer shrink-0"
              title="Quay lại trang chủ"
            >
              <ArrowLeft className="w-4 h-4 stroke-[3]" />
              <span>VỀ TRANG CHỦ</span>
            </button>
            <button
              onClick={handleStartSession}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Bắt đầu ôn tập ngay</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Active Practice Session Runner
  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Session Top Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-900 bg-slate-100 px-3 py-1.5 rounded-xl tabular-nums">
            Câu {currentIndex + 1} / {questions.length}
          </span>
          <span className="text-xs text-slate-500 hidden sm:inline-block truncate max-w-xs">
            {activeOutline.title}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Flag button */}
          <button
            onClick={() => handleToggleFlag(currentQ.id)}
            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-colors ${
              flaggedIds.includes(currentQ.id)
                ? 'bg-amber-50 text-amber-600 border-amber-300'
                : 'text-slate-500 border-slate-200 hover:bg-slate-50'
            }`}
            title="Đánh dấu câu này để xem lại"
          >
            <Flag className={`w-3.5 h-3.5 ${flaggedIds.includes(currentQ.id) ? 'fill-amber-500' : ''}`} />
            <span className="hidden sm:inline">Đánh dấu</span>
          </button>

          {/* Nav Grid button */}
          <button
            onClick={() => {
              soundManager.playClick();
              setShowNavGrid(!showNavGrid);
            }}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
            title="Mở bảng câu hỏi"
          >
            <Grid className="w-4 h-4" />
          </button>

          {/* Stopwatch */}
          <div className="flex items-center gap-1 text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold tabular-nums">
            <Clock className="w-3.5 h-3.5 text-blue-500" />
            <span>{formatTime(seconds)}</span>
          </div>

          {/* Submit Button */}
          <button
            onClick={() => {
              soundManager.playClick();
              setShowSubmitConfirm(true);
            }}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors whitespace-nowrap"
          >
            Nộp bài
          </button>
        </div>
      </div>

      {/* Progress Line */}
      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
        <div
          className="bg-blue-600 h-full rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Main Question Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                {currentQ.type === 'multiple_choice'
                  ? 'Dạng A: Trắc nghiệm 4 lựa chọn'
                  : currentQ.type === 'true_false'
                  ? 'Dạng B: Trắc nghiệm Đúng / Sai'
                  : 'Dạng C: Câu trả lời ngắn'}
              </span>
              {flaggedIds.includes(currentQ.id) && (
                <span className="text-[11px] text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  Đã đánh dấu xem lại
                </span>
              )}
            </div>

            {/* Quick Answer Toggle for Flexible Self-Study */}
            <button
              onClick={() => {
                soundManager.playClick();
                setShowAnswerHelper((prev) => ({
                  ...prev,
                  [currentQ.id]: !prev[currentQ.id],
                }));
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                showAnswerHelper[currentQ.id]
                  ? 'bg-amber-500 text-white shadow-amber-200'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
              title="Xem đáp án và hướng dẫn giải"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{showAnswerHelper[currentQ.id] ? 'Ẩn đáp án' : 'Xem đáp án đúng'}</span>
            </button>
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-slate-900 leading-relaxed pt-1">
            {currentQ.content}
          </h3>
        </div>

        {/* DẠNG A: 4 OPTIONS */}
        {currentQ.type === 'multiple_choice' && currentQ.options && (
          <div className="grid grid-cols-1 gap-3.5">
            {currentQ.options.map((opt) => {
              const isSelected = userAnswers[currentQ.id] === opt.key;
              const isImmediate = mode === 'immediate' && isSelected;
              const isCorrect = isImmediate && opt.key === currentQ.correctAnswer;
              const isWrong = isImmediate && opt.key !== currentQ.correctAnswer;

              // Distinct vibrant badge colors for each key
              const badgeColors: Record<string, string> = {
                A: 'bg-blue-600 text-white ring-2 ring-blue-300',
                B: 'bg-purple-600 text-white ring-2 ring-purple-300',
                C: 'bg-amber-600 text-white ring-2 ring-amber-300',
                D: 'bg-rose-600 text-white ring-2 ring-rose-300',
              };

              let containerStyle = 'bg-white hover:bg-slate-50/80 border-2 border-slate-200 hover:border-blue-400 text-slate-800 shadow-xs';
              if (isSelected) {
                if (isCorrect) {
                  containerStyle = 'bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-500 ring-2 ring-emerald-400 text-emerald-950 font-bold shadow-md scale-[1.01]';
                } else if (isWrong) {
                  containerStyle = 'bg-gradient-to-r from-rose-50 to-pink-50 border-2 border-rose-500 ring-2 ring-rose-400 text-rose-950 font-bold shadow-md scale-[1.01]';
                } else {
                  containerStyle = 'bg-gradient-to-r from-blue-50 to-indigo-50/80 border-2 border-blue-600 ring-2 ring-blue-400 text-blue-950 font-bold shadow-md scale-[1.01]';
                }
              }

              return (
                <button
                  key={opt.key}
                  onClick={() => handleSelectOptionA(opt.key)}
                  className={`min-h-[56px] p-4 rounded-2xl text-left flex items-center gap-4 transition-all duration-150 cursor-pointer text-sm sm:text-base ${containerStyle}`}
                >
                  <span
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 shadow-xs ${
                      isSelected
                        ? isCorrect
                          ? 'bg-emerald-600 text-white ring-2 ring-emerald-300'
                          : isWrong
                          ? 'bg-rose-600 text-white ring-2 ring-rose-300'
                          : 'bg-blue-600 text-white ring-2 ring-blue-300'
                        : badgeColors[opt.key] || 'bg-slate-700 text-white'
                    }`}
                  >
                    {opt.key}
                  </span>
                  <span className="leading-relaxed flex-1 font-medium">{opt.text}</span>
                  {isSelected && (
                    <span className="shrink-0 font-bold text-xs px-2.5 py-1 rounded-full bg-white shadow-xs">
                      {isCorrect ? '✓ Đúng' : isWrong ? '✗ Chưa đúng' : 'Đã chọn'}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* DẠNG B: TRUE / FALSE STATEMENTS */}
        {currentQ.type === 'true_false' && currentQ.statements && (
          <div className="space-y-3.5">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Xác định tính Đúng / Sai cho từng mệnh đề:
            </div>
            {currentQ.statements.map((stmt, sIdx) => {
              const label = ['a', 'b', 'c', 'd'][sIdx] || `${sIdx + 1}`;
              const currentVal = userAnswers[currentQ.id]?.[stmt.id];

              return (
                <div
                  key={stmt.id}
                  className="p-4 sm:p-5 rounded-2xl border-2 border-slate-200 bg-white hover:border-slate-300 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 transition-all"
                >
                  <div className="text-sm sm:text-base text-slate-800 leading-relaxed">
                    <strong className="text-blue-700 font-extrabold mr-1.5">{label})</strong> {stmt.statement}
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <button
                      onClick={() => handleSelectTrueFalseB(stmt.id, true)}
                      className={`min-w-[85px] py-2 px-4 rounded-xl text-xs font-black border-2 transition-all cursor-pointer shadow-xs ${
                        currentVal === true
                          ? 'bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-400 scale-105'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                      }`}
                    >
                      ✓ Đúng
                    </button>
                    <button
                      onClick={() => handleSelectTrueFalseB(stmt.id, false)}
                      className={`min-w-[85px] py-2 px-4 rounded-xl text-xs font-black border-2 transition-all cursor-pointer shadow-xs ${
                        currentVal === false
                          ? 'bg-rose-600 text-white border-rose-600 ring-2 ring-rose-400 scale-105'
                          : 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100'
                      }`}
                    >
                      ✗ Sai
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* DẠNG C: SHORT ANSWER - TIÊU ĐỀ DẠNG & Ô TRỐNG ĐIỀN KẾT QUẢ */}
        {currentQ.type === 'short_answer' && (
          <div className="space-y-4 max-w-xl bg-gradient-to-br from-indigo-50/60 via-blue-50/40 to-slate-50 p-5 sm:p-6 rounded-3xl border-2 border-indigo-200/80 shadow-xs">
            {/* Tiêu đề dạng câu hỏi trả lời ngắn */}
            <div className="flex items-center justify-between pb-3 border-b border-indigo-100">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                  C
                </span>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-indigo-950 uppercase tracking-wide">
                    Phần III: Câu hỏi trắc nghiệm trả lời ngắn
                  </h4>
                  <p className="text-[11px] text-indigo-700 font-medium">
                    Điền kết quả tính toán hoặc từ khóa vào ô trống bên dưới
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-800 border border-indigo-200">
                1.0 điểm / câu
              </span>
            </div>

            {/* Ô trống điền kết quả trả lời */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
                <span>✍️ Ô trống điền kết quả trả lời:</span>
                {userAnswers[currentQ.id] && (
                  <span className="text-emerald-700 font-bold normal-case text-[11px]">
                    Đã nhập: <strong className="font-mono bg-white px-1.5 py-0.5 rounded border border-emerald-200">{userAnswers[currentQ.id]}</strong>
                  </span>
                )}
              </label>

              <div className="relative">
                <input
                  type="text"
                  value={userAnswers[currentQ.id] || ''}
                  onChange={(e) => handleInputShortAnswerC(e.target.value)}
                  placeholder="Nhập kết quả tại đây (ví dụ: 15 hoặc 1,5 hoặc từ khóa)..."
                  className="w-full px-4 py-3.5 rounded-2xl border-2 border-indigo-300 focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 text-base sm:text-lg font-bold bg-white text-slate-900 shadow-sm transition-all placeholder:text-slate-400 placeholder:font-normal font-mono"
                />
              </div>

              {/* Quick symbol shortcuts for math & numbers */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] text-slate-500 font-semibold mr-1">Phím nhanh:</span>
                {['.', ',', '-', '/', '0', '1', '2', '3', '4', '5'].map((sym) => (
                  <button
                    key={sym}
                    type="button"
                    onClick={() => {
                      const cur = userAnswers[currentQ.id] || '';
                      handleInputShortAnswerC(cur + sym);
                    }}
                    className="px-2.5 py-1 text-xs font-bold bg-white hover:bg-indigo-50 border border-slate-200 text-slate-700 rounded-lg active:scale-95 transition-all shadow-2xs font-mono"
                  >
                    {sym}
                  </button>
                ))}
                {userAnswers[currentQ.id] && (
                  <button
                    type="button"
                    onClick={() => handleInputShortAnswerC('')}
                    className="px-2.5 py-1 text-[11px] font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg active:scale-95 transition-all ml-auto"
                  >
                    Xóa ô
                  </button>
                )}
              </div>
            </div>

            {/* Immediate Mode Result Comparison Banner */}
            {mode === 'immediate' && userAnswers[currentQ.id] && currentQ.correctAnswer && (
              <div
                className={`p-3.5 rounded-2xl border-2 text-xs font-medium space-y-1 animate-in fade-in duration-150 ${
                  compareShortAnswer(userAnswers[currentQ.id], currentQ.correctAnswer)
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : 'bg-rose-50 border-rose-300 text-rose-900'
                }`}
              >
                <div className="font-bold flex items-center gap-1.5">
                  {compareShortAnswer(userAnswers[currentQ.id], currentQ.correctAnswer) ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Chính xác (+1.0 điểm)</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      <span>Chưa chính xác</span>
                    </>
                  )}
                </div>
                <div className="text-[11px] flex flex-wrap items-center gap-2 pt-0.5">
                  <span>Kết quả của em: <strong className="font-mono">{userAnswers[currentQ.id]}</strong></span>
                  <span>|</span>
                  <span>Đáp án chuẩn: <strong className="font-mono underline">{currentQ.correctAnswer}</strong></span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Flexible Answer & Explanation Panel (When toggled or in immediate mode after answer) */}
        {(showAnswerHelper[currentQ.id] || (mode === 'immediate' && userAnswers[currentQ.id] !== undefined)) && (
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/80 border-2 border-amber-300 text-xs text-slate-800 space-y-3 animate-in fade-in duration-150">
            <div className="font-bold flex items-center justify-between text-amber-900 pb-2 border-b border-amber-200">
              <span className="flex items-center gap-1.5 text-xs sm:text-sm">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Đáp án chuẩn & Hướng dẫn tự ôn tập:</span>
              </span>
              <span className="text-[10px] sm:text-[11px] font-bold text-amber-800 bg-white px-2 py-0.5 rounded-full border border-amber-200">
                Tự học linh hoạt
              </span>
            </div>

            {/* Dạng A: Multiple Choice Answer Details */}
            {currentQ.type === 'multiple_choice' && (
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-slate-700">Đáp án chính xác:</span>
                  <span className="px-2.5 py-0.5 rounded-lg bg-emerald-600 text-white font-black text-xs shadow-2xs">
                    {currentQ.correctAnswer || 'Chưa xác định'}
                  </span>
                  {currentQ.options && currentQ.correctAnswer && (
                    <span className="font-semibold text-emerald-900">
                      - {currentQ.options.find((o) => o.key === currentQ.correctAnswer)?.text}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Dạng B: True/False Answer Details */}
            {currentQ.type === 'true_false' && currentQ.statements && (
              <div className="space-y-2">
                <div className="font-bold text-slate-700">Đáp án chuẩn các mệnh đề (GDPT 2018):</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {currentQ.statements.map((st, sIdx) => {
                    const label = ['a', 'b', 'c', 'd'][sIdx] || `${sIdx + 1}`;
                    return (
                      <div
                        key={st.id}
                        className="p-2.5 rounded-xl bg-white border border-amber-200 flex items-center justify-between text-xs gap-2"
                      >
                        <span className="truncate pr-1 font-medium text-slate-800">
                          <strong className="text-purple-700">{label})</strong> {st.statement}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-md font-black text-[11px] shrink-0 shadow-2xs ${
                            st.correctAnswer === true
                              ? 'bg-emerald-600 text-white'
                              : st.correctAnswer === false
                              ? 'bg-rose-600 text-white'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {st.correctAnswer === true ? '✓ Đúng' : st.correctAnswer === false ? '✗ Sai' : 'Chưa rõ'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Dạng C: Short Answer Details */}
            {currentQ.type === 'short_answer' && (
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-slate-700">Đáp số / Kết quả chuẩn:</span>
                  <span className="px-3 py-1 rounded-xl bg-amber-600 text-white font-black text-xs shadow-2xs">
                    {currentQ.correctAnswer || 'Chưa xác định'}
                  </span>
                </div>
              </div>
            )}

            {/* Detailed Pedagogical Explanation */}
            {currentQ.explanation && (
              <div className="pt-2 border-t border-amber-200/80">
                <span className="font-bold text-amber-900">💡 Lời giải chi tiết: </span>
                <span className="leading-relaxed text-slate-700 font-medium">{currentQ.explanation}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Session Bottom Navigation */}
      <div className="flex items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent rounded-xl transition-colors flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Câu trước</span>
        </button>

        <div className="text-xs text-slate-400">
          Đã làm: <strong className="text-slate-700">{answeredCount}/{questions.length}</strong> câu
        </div>

        {currentIndex < questions.length - 1 ? (
          <button
            onClick={handleNext}
            className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <span>Câu tiếp theo</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => {
              soundManager.playClick();
              setShowSubmitConfirm(true);
            }}
            className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Hoàn thành & Nộp bài</span>
          </button>
        )}
      </div>

      {/* Nav Grid Drawer / Modal */}
      {showNavGrid && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-slate-900">Danh Sách Câu Hỏi</h4>
              <button
                onClick={() => setShowNavGrid(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-5 gap-2 max-h-60 overflow-y-auto p-1">
              {questions.map((q, idx) => {
                const isAnswered = userAnswers[q.id] !== undefined;
                const isCurrent = idx === currentIndex;
                const isFlagged = flaggedIds.includes(q.id);

                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      soundManager.playClick();
                      setCurrentIndex(idx);
                      setShowNavGrid(false);
                    }}
                    className={`h-10 rounded-xl text-xs font-bold relative flex items-center justify-center transition-all ${
                      isCurrent
                        ? 'ring-2 ring-blue-500 bg-blue-600 text-white'
                        : isAnswered
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span>{idx + 1}</span>
                    {isFlagged && (
                      <span className="w-2 h-2 rounded-full bg-amber-500 absolute top-1 right-1" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-400 inline-block" />
                Đã trả lời
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-slate-100 inline-block" />
                Chưa làm
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                Đánh dấu
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal before Submit */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h4 className="font-bold text-base text-slate-900">Xác Nhận Nộp Bài</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Em đã trả lời <strong className="text-slate-800">{answeredCount}/{questions.length}</strong> câu hỏi.
                {answeredCount < questions.length && (
                  <span className="text-rose-600 font-semibold block mt-1">
                    Còn {questions.length - answeredCount} câu chưa trả lời!
                  </span>
                )}
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setShowSubmitConfirm(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Làm tiếp
              </button>
              <button
                onClick={handleSubmitSession}
                className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-colors"
              >
                Nộp bài ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

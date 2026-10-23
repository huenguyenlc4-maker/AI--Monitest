import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { PracticeSessionResult, Question } from '../types';
import { soundManager } from '../utils/audio';
import {
  Trophy,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  BookOpen,
  Download,
  ArrowLeft,
  Sparkles,
  HelpCircle,
  Printer,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface ResultViewProps {
  result: PracticeSessionResult;
  onRetake: () => void;
  onReviewMistakes: (wrongQuestions: Question[]) => void;
  onBackToHome: () => void;
}

export const ResultView: React.FC<ResultViewProps> = ({
  result,
  onRetake,
  onReviewMistakes,
  onBackToHome,
}) => {
  const [showDetails, setShowDetails] = useState(false);

  // Trigger gentle confetti for good score
  useEffect(() => {
    if (result.score10 >= 7.0) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#3b82f6', '#10b981', '#f59e0b', '#ec4899'],
        });
      } catch {
        // ignore
      }
    }
  }, [result.score10]);

  // Identify wrong questions
  const wrongQuestions = result.questionsSnapshot.filter((q) => {
    const userAns = result.userAnswers[q.id];
    if (q.type === 'multiple_choice') {
      return !userAns || (q.correctAnswer && userAns.toUpperCase() !== q.correctAnswer.toUpperCase());
    }
    if (q.type === 'true_false') {
      if (!q.statements) return false;
      const userMap = userAns || {};
      return q.statements.some((s) => s.correctAnswer !== null && userMap[s.id] !== s.correctAnswer);
    }
    if (q.type === 'short_answer') {
      if (!userAns || !userAns.trim()) return true;
      if (q.correctAnswer) {
        return userAns.trim().toLowerCase() !== q.correctAnswer.trim().toLowerCase();
      }
    }
    return false;
  });

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m} phút ${s} giây`;
  };

  const handlePrint = () => {
    soundManager.playClick();
    window.print();
  };

  const handleExportCSV = () => {
    soundManager.playClick();
    const rows = [
      ['AI- OmniTest - BÁO CÁO KẾT QUẢ ÔN TẬP'],
      ['Học sinh', result.studentName],
      ['Lớp', result.gradeClass],
      ['Môn học', result.subject],
      ['Đề cương', result.outlineTitle],
      ['Thời gian làm bài', formatSeconds(result.durationSeconds)],
      ['Điểm số', `${result.score10}/10`],
      ['Độ chính xác', `${result.accuracyRate}%`],
      ['Số câu đúng', result.correctCount],
      ['Số câu sai', result.incorrectCount],
      ['Số câu chưa làm', result.unansweredCount],
      [],
      ['STT', 'Câu hỏi', 'Dạng', 'Câu trả lời của học sinh', 'Đáp án chuẩn', 'Kết quả'],
    ];

    result.questionsSnapshot.forEach((q, idx) => {
      const userAns = result.userAnswers[q.id];
      let userAnsStr = '';
      let correctAnsStr = q.correctAnswer || '';
      let isCorrect = false;

      if (q.type === 'multiple_choice') {
        userAnsStr = userAns || 'Chưa trả lời';
        isCorrect = userAns && q.correctAnswer && userAns.toUpperCase() === q.correctAnswer.toUpperCase();
      } else if (q.type === 'true_false') {
        userAnsStr = JSON.stringify(userAns || {});
        correctAnsStr = 'Các mệnh đề Đúng/Sai';
        isCorrect = !wrongQuestions.some((wq) => wq.id === q.id);
      } else {
        userAnsStr = userAns || 'Chưa trả lời';
        isCorrect = !wrongQuestions.some((wq) => wq.id === q.id);
      }

      rows.push([
        `Câu ${idx + 1}`,
        `"${q.content.replace(/"/g, '""')}"`,
        q.type,
        `"${userAnsStr}"`,
        `"${correctAnsStr}"`,
        isCorrect ? 'Đúng' : 'Sai',
      ]);
    });

    const csvContent = '\uFEFF' + rows.map((e) => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Ket_qua_OmniTest_${result.studentName}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Result Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        {/* Header Info */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Báo Cáo Kết Quả Luyện Tập
            </h2>
            <div className="text-xs text-slate-500 mt-0.5">
              Học sinh: <strong>{result.studentName}</strong> · Lớp {result.gradeClass} · Môn{' '}
              <strong>{result.subject}</strong>
            </div>
          </div>
          <div className="text-xs text-slate-400">
            {new Date(result.completedAt).toLocaleString('vi-VN')}
          </div>
        </div>

        {/* Central Score Card */}
        <div className="bg-gradient-to-br from-blue-50/60 via-indigo-50/40 to-purple-50/60 p-6 sm:p-8 rounded-3xl border border-blue-100 text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-white shadow-xs border border-blue-100 flex items-center justify-center mx-auto text-3xl">
            {result.score10 >= 9.0 ? '🏆' : result.score10 >= 7.0 ? '🌟' : result.score10 >= 5.0 ? '🎯' : '🌱'}
          </div>

          <div className="space-y-1">
            <div className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Điểm Đánh Giá
            </div>
            <div className="text-4xl sm:text-5xl font-black text-slate-900 tabular-nums">
              {result.score10.toFixed(1)}
              <span className="text-lg font-bold text-slate-400">/10</span>
            </div>
            <div className="text-xs font-semibold text-slate-600">
              Độ chính xác: <strong className="text-blue-600 tabular-nums">{result.accuracyRate}%</strong>
            </div>
          </div>

          {/* Pedagogical encouraging feedback */}
          <div className="max-w-xl mx-auto p-4 bg-white/80 rounded-2xl border border-slate-200/80 text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
            💬 {result.pedagogicalFeedback}
          </div>
        </div>

        {/* Breakdown Statistics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
            <div className="text-xs text-slate-500 mb-1">Thời gian làm</div>
            <div className="text-base sm:text-lg font-bold text-slate-900 tabular-nums">
              {formatSeconds(result.durationSeconds)}
            </div>
          </div>

          <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200 text-center">
            <div className="text-xs text-emerald-600 mb-1">Số câu đúng</div>
            <div className="text-base sm:text-lg font-bold text-emerald-700 tabular-nums">
              {result.correctCount} / {result.totalQuestions}
            </div>
          </div>

          <div className="bg-rose-50/60 p-4 rounded-2xl border border-rose-200 text-center">
            <div className="text-xs text-rose-600 mb-1">Số câu chưa đúng</div>
            <div className="text-base sm:text-lg font-bold text-rose-700 tabular-nums">
              {result.incorrectCount}
            </div>
          </div>

          <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200 text-center">
            <div className="text-xs text-amber-600 mb-1">Chưa trả lời</div>
            <div className="text-base sm:text-lg font-bold text-amber-700 tabular-nums">
              {result.unansweredCount}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 no-print">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundManager.playClick();
                onRetake();
              }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Làm lại bài</span>
            </button>

            {wrongQuestions.length > 0 && (
              <button
                onClick={() => {
                  soundManager.playClick();
                  onReviewMistakes(wrongQuestions);
                }}
                className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Ôn câu sai ({wrongQuestions.length} câu)</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors flex items-center gap-1.5"
              title="In hoặc xuất PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In / PDF</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors flex items-center gap-1.5"
              title="Tải tệp bảng tính CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Xuất CSV</span>
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                onBackToHome();
              }}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              Về trang chủ
            </button>
          </div>
        </div>
      </div>

      {/* Detailed Review Section */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div
          onClick={() => {
            soundManager.playClick();
            setShowDetails(!showDetails);
          }}
          className="flex items-center justify-between cursor-pointer select-none"
        >
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Chi Tiết Từng Câu Hỏi & Hướng Dẫn Chấm
            </h3>
          </div>
          <button className="text-slate-400 hover:text-slate-600">
            {showDetails ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        {showDetails && (
          <div className="space-y-4 pt-3 border-t border-slate-100 animate-in fade-in duration-150">
            {result.questionsSnapshot.map((q, idx) => {
              const userAns = result.userAnswers[q.id];
              const isWrong = wrongQuestions.some((wq) => wq.id === q.id);

              return (
                <div
                  key={q.id}
                  className={`p-4 rounded-2xl border text-xs space-y-2.5 ${
                    isWrong ? 'bg-rose-50/30 border-rose-200' : 'bg-emerald-50/20 border-emerald-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">
                      {q.code || `Câu ${idx + 1}`}: {q.type === 'multiple_choice' ? 'Trắc nghiệm 4 lựa chọn' : q.type === 'true_false' ? 'Đúng / Sai' : 'Trả lời ngắn'}
                    </span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                        isWrong ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {isWrong ? 'Chưa đúng' : 'Chính xác'}
                    </span>
                  </div>

                  <div className="text-sm text-slate-900 font-medium">{q.content}</div>

                  {/* Multiple Choice view */}
                  {q.type === 'multiple_choice' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                      {q.options?.map((opt) => (
                        <div
                          key={opt.key}
                          className={`p-2 rounded-lg border text-xs flex items-center gap-2 ${
                            opt.key === q.correctAnswer
                              ? 'bg-emerald-100/70 border-emerald-300 text-emerald-900 font-semibold'
                              : userAns === opt.key
                              ? 'bg-rose-100/70 border-rose-300 text-rose-900'
                              : 'bg-white border-slate-200 text-slate-600'
                          }`}
                        >
                          <span className="font-bold">{opt.key}.</span>
                          <span>{opt.text}</span>
                          {opt.key === q.correctAnswer && <span className="ml-auto text-[10px]">✓ Đáp án</span>}
                          {userAns === opt.key && opt.key !== q.correctAnswer && (
                            <span className="ml-auto text-[10px]">Em đã chọn</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* True / False view */}
                  {q.type === 'true_false' && q.statements && (
                    <div className="space-y-1 pt-1">
                      {q.statements.map((s, sIdx) => {
                        const userChoice = userAns?.[s.id];
                        const isStmtCorrect = s.correctAnswer !== null && userChoice === s.correctAnswer;
                        const label = ['a', 'b', 'c', 'd'][sIdx] || `${sIdx + 1}`;

                        return (
                          <div
                            key={s.id}
                            className={`p-2 rounded-lg border flex items-center justify-between gap-2 ${
                              isStmtCorrect ? 'bg-white border-slate-200' : 'bg-rose-50 border-rose-200'
                            }`}
                          >
                            <span>
                              <strong>{label})</strong> {s.statement}
                            </span>
                            <div className="flex items-center gap-2 font-semibold">
                              <span className="text-slate-500">Em chọn: {userChoice === true ? 'Đúng' : userChoice === false ? 'Sai' : 'Chưa chọn'}</span>
                              <span>·</span>
                              <span className="text-emerald-700">Đáp án: {s.correctAnswer ? 'Đúng' : 'Sai'}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Short answer view */}
                  {q.type === 'short_answer' && (
                    <div className="pt-1 flex items-center gap-4">
                      <span>Câu trả lời của em: <strong>{userAns || '(Chưa nhập)'}</strong></span>
                      <span>·</span>
                      <span className="text-emerald-700">Đáp án mẫu: <strong>{q.correctAnswer}</strong></span>
                    </div>
                  )}

                  {q.explanation && (
                    <div className="text-[11px] text-slate-600 bg-white/80 p-2.5 rounded-xl border border-slate-200">
                      💡 <strong>Giải thích:</strong> {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

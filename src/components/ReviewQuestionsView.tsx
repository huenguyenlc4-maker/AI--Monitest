import React, { useState } from 'react';
import { DocumentOutline, Question, QuestionType } from '../types';
import { soundManager } from '../utils/audio';
import { saveSingleOutline } from '../utils/storage';
import {
  CheckCircle2,
  AlertCircle,
  Edit3,
  Trash2,
  Check,
  ArrowRight,
  Filter,
  Eye,
  X,
  Plus,
  HelpCircle,
  FileCheck,
} from 'lucide-react';

interface ReviewQuestionsViewProps {
  outline: DocumentOutline;
  onConfirmAndStartPractice: (outline: DocumentOutline) => void;
  onBackToUpload: () => void;
}

export const ReviewQuestionsView: React.FC<ReviewQuestionsViewProps> = ({
  outline: initialOutline,
  onConfirmAndStartPractice,
  onBackToUpload,
}) => {
  const [outline, setOutline] = useState<DocumentOutline>(initialOutline);
  const [filterType, setFilterType] = useState<string>('all'); // all, multiple_choice, true_false, short_answer, needs_review
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  // Edit form state
  const [editContent, setEditContent] = useState('');
  const [editType, setEditType] = useState<QuestionType>('multiple_choice');
  const [editAns, setEditAns] = useState('');
  const [editExplanation, setEditExplanation] = useState('');
  const [editOptions, setEditOptions] = useState<{ key: 'A' | 'B' | 'C' | 'D'; text: string }[]>([]);

  // Statistics
  const total = outline.questions.length;
  const countA = outline.questions.filter((q) => q.type === 'multiple_choice').length;
  const countB = outline.questions.filter((q) => q.type === 'true_false').length;
  const countC = outline.questions.filter((q) => q.type === 'short_answer').length;
  const countVerified = outline.questions.filter((q) => q.isVerified).length;
  const countNeedsReview = outline.questions.filter((q) => q.needsReview).length;

  const filteredQuestions = outline.questions.filter((q) => {
    if (filterType === 'all') return true;
    if (filterType === 'needs_review') return q.needsReview;
    return q.type === filterType;
  });

  const handleOpenEdit = (q: Question) => {
    soundManager.playClick();
    setEditingQuestion(q);
    setEditContent(q.content);
    setEditType(q.type);
    setEditAns(q.correctAnswer || '');
    setEditExplanation(q.explanation || '');
    setEditOptions(
      q.options || [
        { key: 'A', text: '' },
        { key: 'B', text: '' },
        { key: 'C', text: '' },
        { key: 'D', text: '' },
      ]
    );
  };

  const handleSaveEdit = () => {
    if (!editingQuestion) return;
    soundManager.playCorrect();

    const updatedQuestions = outline.questions.map((q) => {
      if (q.id === editingQuestion.id) {
        return {
          ...q,
          content: editContent,
          type: editType,
          correctAnswer: editAns,
          explanation: editExplanation,
          options: editType === 'multiple_choice' ? editOptions : undefined,
          isVerified: true,
          needsReview: false,
          reviewReason: undefined,
        };
      }
      return q;
    });

    const updatedOutline = { ...outline, questions: updatedQuestions };
    setOutline(updatedOutline);
    saveSingleOutline(updatedOutline);
    setEditingQuestion(null);
  };

  const handleDeleteQuestion = (id: string) => {
    soundManager.playClick();
    const updated = outline.questions.filter((q) => q.id !== id);
    const updatedOutline = { ...outline, questions: updated };
    setOutline(updatedOutline);
    saveSingleOutline(updatedOutline);
  };

  const handleVerifyQuestion = (id: string) => {
    soundManager.playClick();
    const updated = outline.questions.map((q) =>
      q.id === id ? { ...q, isVerified: true, needsReview: false, reviewReason: undefined } : q
    );
    const updatedOutline = { ...outline, questions: updated };
    setOutline(updatedOutline);
    saveSingleOutline(updatedOutline);
  };

  const handleFinalConfirm = () => {
    soundManager.playUploadSuccess();
    saveSingleOutline(outline);
    onConfirmAndStartPractice(outline);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Info */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <FileCheck className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">{outline.title}</h2>
          </div>
          <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2">
            <span>Môn: <strong>{outline.subject}</strong></span>
            <span>·</span>
            <span>{outline.grade}</span>
            {outline.school && (
              <>
                <span>·</span>
                <span>{outline.school}</span>
              </>
            )}
            {outline.semester && (
              <>
                <span>·</span>
                <span>{outline.semester}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundManager.playClick();
              onBackToUpload();
            }}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Quay lại
          </button>
          <button
            onClick={handleFinalConfirm}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Xác nhận & Bắt đầu ôn tập</span>
          </button>
        </div>
      </div>

      {/* Statistics overview cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] text-slate-400 font-medium">Tổng số câu</div>
          <div className="text-xl font-bold text-slate-900 tabular-nums">{total}</div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] text-blue-500 font-medium">Dạng A (Trắc nghiệm)</div>
          <div className="text-xl font-bold text-blue-700 tabular-nums">{countA}</div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] text-purple-500 font-medium">Dạng B (Đúng / Sai)</div>
          <div className="text-xl font-bold text-purple-700 tabular-nums">{countB}</div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] text-amber-500 font-medium">Dạng C (Trả lời ngắn)</div>
          <div className="text-xl font-bold text-amber-700 tabular-nums">{countC}</div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] text-emerald-600 font-medium">Đã có đáp án</div>
          <div className="text-xl font-bold text-emerald-700 tabular-nums">{countVerified}</div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] text-rose-500 font-medium">Cần rà soát</div>
          <div className="text-xl font-bold text-rose-700 tabular-nums">{countNeedsReview}</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-fit">
        {[
          { id: 'all', label: `Tất cả (${total})` },
          { id: 'multiple_choice', label: `Dạng A (${countA})` },
          { id: 'true_false', label: `Dạng B (${countB})` },
          { id: 'short_answer', label: `Dạng C (${countC})` },
          { id: 'needs_review', label: `Cần rà soát (${countNeedsReview})` },
        ].map((tab) => {
          const isActive = filterType === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                soundManager.playClick();
                setFilterType(tab.id);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                isActive
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Questions List */}
      <div className="space-y-3.5">
        {filteredQuestions.map((q, index) => {
          return (
            <div
              key={q.id}
              className={`bg-white p-5 rounded-2xl border transition-all ${
                q.needsReview ? 'border-amber-300 bg-amber-50/20' : 'border-slate-200 shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900">{q.code || `Câu ${index + 1}`}</span>
                  <span className="text-[11px] text-slate-500">
                    ·{' '}
                    {q.type === 'multiple_choice'
                      ? 'Dạng A: Trắc nghiệm 4 lựa chọn'
                      : q.type === 'true_false'
                      ? 'Dạng B: Đúng / Sai'
                      : 'Dạng C: Trả lời ngắn'}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {q.needsReview && (
                    <button
                      onClick={() => handleVerifyQuestion(q.id)}
                      className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" />
                      <span>Xác nhận câu này</span>
                    </button>
                  )}
                  <button
                    onClick={() => handleOpenEdit(q)}
                    className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition-colors"
                    title="Chỉnh sửa câu hỏi"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteQuestion(q.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Xóa câu hỏi này"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Question content */}
              <div className="text-sm text-slate-800 font-medium leading-relaxed mb-3">
                {q.content}
              </div>

              {/* Type A Options */}
              {q.type === 'multiple_choice' && q.options && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-3.5">
                  {q.options.map((opt) => {
                    const isCorrect = q.correctAnswer === opt.key;
                    const badgeColors: Record<string, string> = {
                      A: 'bg-blue-600 text-white',
                      B: 'bg-purple-600 text-white',
                      C: 'bg-amber-600 text-white',
                      D: 'bg-rose-600 text-white',
                    };

                    return (
                      <div
                        key={opt.key}
                        className={`p-3 rounded-2xl border-2 text-xs flex items-center gap-2.5 transition-all ${
                          isCorrect
                            ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-500 text-emerald-950 font-bold shadow-xs'
                            : 'bg-white border-slate-200 text-slate-800'
                        }`}
                      >
                        <span
                          className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs shrink-0 shadow-xs ${
                            isCorrect ? 'bg-emerald-600 text-white' : badgeColors[opt.key] || 'bg-slate-700 text-white'
                          }`}
                        >
                          {opt.key}
                        </span>
                        <span className="flex-1 font-medium">{opt.text}</span>
                        {isCorrect && (
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Đáp án chuẩn</span>
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Type B True / False Statements */}
              {q.type === 'true_false' && q.statements && (
                <div className="space-y-1.5 mb-3">
                  {q.statements.map((s, sIdx) => {
                    const label = ['a', 'b', 'c', 'd'][sIdx] || `${sIdx + 1}`;
                    return (
                      <div
                        key={s.id}
                        className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between gap-3"
                      >
                        <span className="text-slate-800">
                          <strong>{label})</strong> {s.statement}
                        </span>
                        <span
                          className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                            s.correctAnswer === true
                              ? 'text-emerald-700 bg-emerald-100'
                              : s.correctAnswer === false
                              ? 'text-rose-700 bg-rose-100'
                              : 'text-slate-400 bg-slate-200'
                          }`}
                        >
                          {s.correctAnswer === true
                            ? 'Đúng'
                            : s.correctAnswer === false
                            ? 'Sai'
                            : 'Chưa xác định'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Type C Short Answer */}
              {q.type === 'short_answer' && (
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs mb-3 flex items-center gap-2">
                  <span className="text-slate-500">Đáp án mẫu:</span>
                  <span className="font-bold text-slate-900 font-mono">
                    {q.correctAnswer || 'Chưa xác định'}
                  </span>
                </div>
              )}

              {/* Explanation or Review notice */}
              {q.explanation && (
                <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
                  💡 <strong>Giải thích / Hướng dẫn:</strong> {q.explanation}
                </div>
              )}

              {q.needsReview && (
                <div className="mt-2 text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                  <span>{q.reviewReason || 'Cần kiểm tra lại đáp án của câu hỏi này.'}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Edit Question Modal */}
      {editingQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">
                Chỉnh sửa: {editingQuestion.code || 'Câu hỏi'}
              </h3>
              <button
                onClick={() => setEditingQuestion(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Dạng câu hỏi</label>
              <select
                value={editType}
                onChange={(e) => setEditType(e.target.value as QuestionType)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
              >
                <option value="multiple_choice">Dạng A: Trắc nghiệm 4 lựa chọn</option>
                <option value="true_false">Dạng B: Đúng / Sai</option>
                <option value="short_answer">Dạng C: Trả lời ngắn</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nội dung câu hỏi</label>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={3}
                className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              />
            </div>

            {/* If Type A: Edit 4 options */}
            {editType === 'multiple_choice' && (
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">Các phương án A, B, C, D</label>
                {editOptions.map((opt, idx) => (
                  <div key={opt.key} className="flex items-center gap-2">
                    <span className="w-6 font-bold text-xs text-center">{opt.key}.</span>
                    <input
                      type="text"
                      value={opt.text}
                      onChange={(e) => {
                        const newOpts = [...editOptions];
                        newOpts[idx].text = e.target.value;
                        setEditOptions(newOpts);
                      }}
                      className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
                      placeholder={`Nội dung lựa chọn ${opt.key}`}
                    />
                    <input
                      type="radio"
                      name="correct_opt"
                      checked={editAns === opt.key}
                      onChange={() => setEditAns(opt.key)}
                      title="Chọn đây là đáp án đúng"
                      className="cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* If Type C: Edit answer string */}
            {editType === 'short_answer' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Đáp án mẫu (số hoặc cụm từ đối chiếu)
                </label>
                <input
                  type="text"
                  value={editAns}
                  onChange={(e) => setEditAns(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  placeholder="Ví dụ: 300, photosynthesis, 12..."
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Giải thích / Hướng dẫn chấm
              </label>
              <textarea
                value={editExplanation}
                onChange={(e) => setEditExplanation(e.target.value)}
                rows={2}
                className="w-full p-3 rounded-xl border border-slate-200 text-xs"
                placeholder="Ghi chú thêm phương pháp giải hoặc lời giải chi tiết..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingQuestion(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs"
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

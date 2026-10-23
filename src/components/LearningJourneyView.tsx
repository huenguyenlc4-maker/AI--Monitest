import React, { useState } from 'react';
import { AchievementBadge, PracticeSessionResult, StudyGoal } from '../types';
import { soundManager } from '../utils/audio';
import { getBadges, getStudyGoals, saveStudyGoals } from '../utils/storage';
import {
  TrendingUp,
  Target,
  Award,
  BookOpen,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Flame,
  Clock,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface LearningJourneyViewProps {
  history: PracticeSessionResult[];
  onStartPracticeTopic?: (subject: string) => void;
}

export const LearningJourneyView: React.FC<LearningJourneyViewProps> = ({
  history,
  onStartPracticeTopic,
}) => {
  const [goals, setGoals] = useState<StudyGoal>(getStudyGoals());
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [targetScoreInput, setTargetScoreInput] = useState(goals.targetScore.toString());
  const [targetWeeklyInput, setTargetWeeklyInput] = useState(goals.weeklySessionsTarget.toString());
  const badges: AchievementBadge[] = getBadges();

  // Aggregate statistics by subject
  const subjectStats: Record<string, { count: number; totalScore: number; bestScore: number }> = {};
  history.forEach((h) => {
    if (!subjectStats[h.subject]) {
      subjectStats[h.subject] = { count: 0, totalScore: 0, bestScore: 0 };
    }
    subjectStats[h.subject].count++;
    subjectStats[h.subject].totalScore += h.score10;
    if (h.score10 > subjectStats[h.subject].bestScore) {
      subjectStats[h.subject].bestScore = h.score10;
    }
  });

  // Calculate weak topics from real mistakes
  const weakTopicsMap: Record<string, number> = {};
  history.forEach((session) => {
    session.questionsSnapshot.forEach((q) => {
      const userAns = session.userAnswers[q.id];
      let isMistake = false;
      if (q.type === 'multiple_choice') {
        isMistake = Boolean(!userAns || (q.correctAnswer && userAns.toUpperCase() !== q.correctAnswer.toUpperCase()));
      } else if (q.type === 'true_false' && q.statements) {
        const userMap = userAns || {};
        isMistake = q.statements.some((s) => s.correctAnswer !== null && userMap[s.id] !== s.correctAnswer);
      } else if (q.type === 'short_answer' && q.correctAnswer) {
        isMistake = Boolean(!userAns || userAns.trim().toLowerCase() !== q.correctAnswer.trim().toLowerCase());
      }

      if (isMistake) {
        const topicName = q.topic || session.subject;
        weakTopicsMap[topicName] = (weakTopicsMap[topicName] || 0) + 1;
      }
    });
  });

  const sortedWeakTopics = Object.entries(weakTopicsMap).sort((a, b) => b[1] - a[1]);

  const handleSaveGoal = () => {
    soundManager.playCorrect();
    const updated: StudyGoal = {
      targetScore: parseFloat(targetScoreInput) || 8.5,
      weeklySessionsTarget: parseInt(targetWeeklyInput, 10) || 5,
      currentStreakDays: goals.currentStreakDays,
    };
    setGoals(updated);
    saveStudyGoals(updated);
    setIsEditingGoal(false);
  };

  const totalStudyMinutes = Math.round(
    history.reduce((acc, curr) => acc + curr.durationSeconds, 0) / 60
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Hành Trình Học Tập Cá Nhân
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Theo dõi sự tiến bộ, phát hiện chủ đề cần củng cố và chinh phục mục tiêu đã đặt ra.
          </p>
        </div>

        {/* Goal Card */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center gap-4 text-xs">
          <div>
            <div className="text-slate-500 font-medium">Mục tiêu điểm số</div>
            <div className="text-lg font-bold text-slate-900 tabular-nums">
              {goals.targetScore.toFixed(1)} / 10
            </div>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <div>
            <div className="text-slate-500 font-medium">Mục tiêu tuần</div>
            <div className="text-lg font-bold text-blue-600 tabular-nums">
              {history.length} / {goals.weeklySessionsTarget} buổi
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playClick();
              setIsEditingGoal(!isEditingGoal);
            }}
            className="px-2.5 py-1 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-lg font-semibold transition-colors"
          >
            Sửa
          </button>
        </div>
      </div>

      {/* Edit Goals Drawer */}
      {isEditingGoal && (
        <div className="bg-white p-5 rounded-2xl border border-blue-200 shadow-sm space-y-3 animate-in fade-in duration-150">
          <div className="font-bold text-xs text-slate-800">Cập nhật mục tiêu cá nhân:</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-600 mb-1">Điểm số kỳ vọng (Thang 10)</label>
              <input
                type="number"
                step="0.5"
                min="5"
                max="10"
                value={targetScoreInput}
                onChange={(e) => setTargetScoreInput(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl text-xs font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">Số buổi ôn tập trong tuần</label>
              <input
                type="number"
                min="1"
                max="20"
                value={targetWeeklyInput}
                onChange={(e) => setTargetWeeklyInput(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl text-xs font-semibold"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={() => setIsEditingGoal(false)}
              className="px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-100 rounded-lg"
            >
              Hủy
            </button>
            <button
              onClick={handleSaveGoal}
              className="px-4 py-1.5 text-xs font-bold bg-blue-600 text-white rounded-lg shadow-xs"
            >
              Lưu mục tiêu
            </button>
          </div>
        </div>
      )}

      {/* Progress metrics strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-400 mb-1">Tổng thời lượng học</div>
          <div className="text-xl font-bold text-slate-900 tabular-nums">
            {totalStudyMinutes} phút
          </div>
          <div className="text-[11px] text-slate-500">Tích lũy thực tế</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-400 mb-1">Số buổi hoàn thành</div>
          <div className="text-xl font-bold text-blue-600 tabular-nums">{history.length}</div>
          <div className="text-[11px] text-slate-500">Bài kiểm tra & ôn tập</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-400 mb-1">Môn học đã rèn luyện</div>
          <div className="text-xl font-bold text-purple-600 tabular-nums">
            {Object.keys(subjectStats).length} môn
          </div>
          <div className="text-[11px] text-slate-500">Toán, KHTN, Ngoại ngữ...</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-400 mb-1">Huy hiệu đạt được</div>
          <div className="text-xl font-bold text-amber-600 tabular-nums">
            {badges.filter((b) => b.unlocked).length} / {badges.length}
          </div>
          <div className="text-[11px] text-slate-500">Thành tích học tập</div>
        </div>
      </div>

      {/* Topics Needing Review & Subject Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Topics needing review */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
              <AlertCircle className="w-4 h-4" />
            </span>
            <h3 className="font-bold text-slate-900 text-sm">
              Chủ Đề Cần Ôn Lại (Dựa trên câu trả lời sai)
            </h3>
          </div>

          {sortedWeakTopics.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl">
              Chưa ghi nhận câu hỏi sai nào. Hãy tiếp tục làm bài luyện tập!
            </div>
          ) : (
            <div className="space-y-2">
              {sortedWeakTopics.slice(0, 5).map(([topic, count]) => (
                <div
                  key={topic}
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="font-semibold text-slate-800">{topic}</div>
                    <div className="text-[11px] text-rose-600 font-medium">
                      Đã nhầm lẫn {count} lần trong các bài ôn
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                    Đề xuất ôn thêm
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Subject Breakdown */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <BookOpen className="w-4 h-4" />
            </span>
            <h3 className="font-bold text-slate-900 text-sm">Kết Quả Theo Môn Học</h3>
          </div>

          {Object.keys(subjectStats).length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl">
              Chưa có dữ liệu bài kiểm tra theo môn.
            </div>
          ) : (
            <div className="space-y-2.5">
              {Object.entries(subjectStats).map(([subj, stat]) => {
                const avgScore = (stat.totalScore / stat.count).toFixed(1);
                return (
                  <div
                    key={subj}
                    className="p-3 rounded-2xl border border-slate-200/80 bg-slate-50 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900">{subj}</div>
                      <div className="text-[11px] text-slate-500">
                        {stat.count} lượt làm · Điểm cao nhất: {stat.bestScore.toFixed(1)}/10
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-blue-600 text-sm tabular-nums">
                        {avgScore}/10
                      </div>
                      <div className="text-[10px] text-slate-400">Điểm trung bình</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Achievement Badges Grid */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
            <Award className="w-4 h-4" />
          </span>
          <h3 className="font-bold text-slate-900 text-sm">Huy Hiệu Học Tập</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {badges.map((b) => (
            <div
              key={b.id}
              className={`p-3.5 rounded-2xl border text-center space-y-1.5 transition-all ${
                b.unlocked
                  ? 'bg-amber-50/50 border-amber-200 shadow-xs'
                  : 'bg-slate-50 border-slate-200 opacity-50 grayscale'
              }`}
            >
              <div className="text-2xl">{b.icon}</div>
              <div className="font-bold text-xs text-slate-900 leading-tight">{b.name}</div>
              <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">
                {b.description}
              </p>
              {b.unlocked && (
                <div className="text-[10px] text-amber-700 font-semibold pt-1">
                  Đạt: {b.unlockedAt || 'Mới'}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recent Practice History Table */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 text-sm">Lịch Sử Các Bài Ôn Gần Đây</h3>

        {history.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl">
            Chưa có bài ôn nào được thực hiện.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                  <th className="pb-2.5">Thời gian</th>
                  <th className="pb-2.5">Đề cương</th>
                  <th className="pb-2.5">Môn học</th>
                  <th className="pb-2.5">Đúng / Tổng</th>
                  <th className="pb-2.5">Điểm số</th>
                  <th className="pb-2.5">Độ chính xác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {history.slice(0, 10).map((h) => (
                  <tr key={h.id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 tabular-nums text-slate-500">
                      {new Date(h.completedAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="py-2.5 font-semibold text-slate-900 max-w-[180px] truncate">
                      {h.outlineTitle}
                    </td>
                    <td className="py-2.5">{h.subject}</td>
                    <td className="py-2.5 tabular-nums">
                      {h.correctCount}/{h.totalQuestions}
                    </td>
                    <td className="py-2.5 font-bold text-blue-600 tabular-nums">
                      {h.score10.toFixed(1)}/10
                    </td>
                    <td className="py-2.5 tabular-nums">{h.accuracyRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

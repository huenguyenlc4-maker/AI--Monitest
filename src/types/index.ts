export type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer';

export interface TrueFalseStatement {
  id: string;
  statement: string;
  correctAnswer: boolean | null; // true: Đúng, false: Sai, null: chưa xác minh
  userAnswer?: boolean | null;
}

export interface QuestionOption {
  key: 'A' | 'B' | 'C' | 'D';
  text: string;
}

export interface Question {
  id: string;
  code?: string; // e.g. "Câu 1"
  type: QuestionType;
  content: string;
  topic?: string;
  options?: QuestionOption[]; // for multiple_choice
  correctAnswer?: string; // 'A' | 'B' | 'C' | 'D' for type A; text/number for type C
  statements?: TrueFalseStatement[]; // for true_false
  explanation?: string;
  isVerified: boolean;
  needsReview: boolean;
  reviewReason?: string;
  sourceTextSnippet?: string;
  isAiGenerated?: boolean;
}

export type RevisionCategory = 'regular' | 'midterm' | 'final' | 'graduation';

export interface DocumentOutline {
  id: string;
  title: string;
  subject: string;
  grade: string;
  category?: RevisionCategory; // 'regular': Ôn bài thường xuyên, 'midterm': Ôn giữa kỳ, 'final': Ôn cuối kỳ, 'graduation': Ôn tốt nghiệp
  school?: string;
  semester?: string;
  topic?: string;
  uploadDate: string;
  fileName: string;
  fileSize: number;
  questions: Question[];
  rawTextExcerpt?: string;
  lastScore?: number;
  lastPracticedDate?: string;
  isShared?: boolean;
  shareCode?: string;
}

export interface StudentProfile {
  id: string;
  fullName: string;
  gradeClass: string;
  school?: string;
  accessCode?: string;
  createdAt: string;
  lastLoginAt: string;
}

export interface PracticeSessionResult {
  id: string;
  studentId: string;
  studentName: string;
  gradeClass: string;
  outlineId: string;
  outlineTitle: string;
  subject: string;
  startedAt: string;
  completedAt: string;
  durationSeconds: number;
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  pendingCount: number; // short answer needing manual confirmation
  score10: number; // Thang điểm 10.0
  accuracyRate: number; // Phần trăm %
  userAnswers: Record<string, any>; // questionId -> answer
  mode: 'immediate' | 'exam';
  selectedTypes: QuestionType[];
  questionsSnapshot: Question[];
  pedagogicalFeedback: string;
}

export interface StudyGoal {
  targetScore: number;
  weeklySessionsTarget: number;
  currentStreakDays: number;
}

export interface AchievementBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface AudioSettings {
  enabled: boolean;
  volume: number; // 0 to 1
}

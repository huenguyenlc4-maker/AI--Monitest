import {
  AchievementBadge,
  DocumentOutline,
  PracticeSessionResult,
  StudentProfile,
  StudyGoal,
} from '../types';
import { SAMPLE_DOCUMENTS } from './docxParser';
import { CURRICULUM_DATA } from '../data/curriculumData';

const STUDENT_KEY = 'omnitest_active_student';
const OUTLINES_KEY = 'omnitest_saved_outlines';
const HISTORY_KEY = 'omnitest_practice_history';
const GOALS_KEY = 'omnitest_study_goals';

export const INITIAL_BADGES: AchievementBadge[] = [
  {
    id: 'first_step',
    name: 'Khởi đầu vững chắc',
    description: 'Hoàn thành bài luyện tập đầu tiên trên AI- OmniTest',
    icon: '🌱',
    unlocked: false,
  },
  {
    id: 'high_scorer',
    name: 'Bứt phá điểm 9+',
    description: 'Đạt điểm từ 9.0 trở lên trong một bài kiểm tra',
    icon: '🌟',
    unlocked: false,
  },
  {
    id: 'hardworking',
    name: 'Chiến binh chăm chỉ',
    description: 'Thực hiện ít nhất 5 lượt ôn tập trong tuần',
    icon: '🔥',
    unlocked: false,
  },
  {
    id: 'perfectionist',
    name: 'Chinh phục tuyệt đối',
    description: 'Đạt điểm 10.0 trọn vẹn với 100% độ chính xác',
    icon: '👑',
    unlocked: false,
  },
  {
    id: 'curiosity',
    name: 'Nhà thám hiểm tri thức',
    description: 'Tự tải lên và phân tích tài liệu đề cương Word cá nhân',
    icon: '📚',
    unlocked: false,
  },
  {
    id: 'gamer_learner',
    name: 'Vừa học vừa chơi',
    description: 'Thư giãn hoàn thành ít nhất 1 trò chơi trong Góc giải trí',
    icon: '🎮',
    unlocked: false,
  },
];

export function getActiveStudent(): StudentProfile | null {
  try {
    const raw = localStorage.getItem(STUDENT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveActiveStudent(profile: StudentProfile) {
  try {
    localStorage.setItem(STUDENT_KEY, JSON.stringify(profile));
  } catch {
    // silent
  }
}

export function clearActiveStudent() {
  try {
    localStorage.removeItem(STUDENT_KEY);
  } catch {
    // silent
  }
}

export function getSavedOutlines(): DocumentOutline[] {
  const allDefaults = [...SAMPLE_DOCUMENTS, ...CURRICULUM_DATA];
  try {
    const raw = localStorage.getItem(OUTLINES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const existingIds = new Set(parsed.map((o: DocumentOutline) => o.id));
        const missingSamples = allDefaults.filter((s) => !existingIds.has(s.id));
        if (missingSamples.length > 0) {
          const merged = [...parsed, ...missingSamples];
          saveOutlines(merged);
          return merged;
        }
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  // Initialize with authentic sample curriculum outlines
  saveOutlines(allDefaults);
  return allDefaults;
}

export function saveOutlines(outlines: DocumentOutline[]) {
  try {
    localStorage.setItem(OUTLINES_KEY, JSON.stringify(outlines));
  } catch {
    // ignore
  }
}

export function saveSingleOutline(outline: DocumentOutline) {
  const current = getSavedOutlines();
  const existingIndex = current.findIndex((o) => o.id === outline.id);
  if (existingIndex >= 0) {
    current[existingIndex] = outline;
  } else {
    current.unshift(outline);
  }
  saveOutlines(current);
}

export function deleteOutline(outlineId: string): DocumentOutline[] {
  const current = getSavedOutlines();
  const updated = current.filter((o) => o.id !== outlineId);
  saveOutlines(updated);
  return updated;
}

export function getPracticeHistory(): PracticeSessionResult[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function savePracticeResult(result: PracticeSessionResult) {
  try {
    const history = getPracticeHistory();
    history.unshift(result);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));

    // Update lastScore and lastPracticed on document outline
    const outlines = getSavedOutlines();
    const doc = outlines.find((o) => o.id === result.outlineId);
    if (doc) {
      doc.lastScore = result.score10;
      doc.lastPracticedDate = new Date().toLocaleDateString('vi-VN');
      saveOutlines(outlines);
    }

    // Check & unlock badges
    checkAndUnlockBadges(result, history);
  } catch {
    // ignore
  }
}

export function getStudyGoals(): StudyGoal {
  try {
    const raw = localStorage.getItem(GOALS_KEY);
    return raw
      ? JSON.parse(raw)
      : {
          targetScore: 8.5,
          weeklySessionsTarget: 5,
          currentStreakDays: 3,
        };
  } catch {
    return {
      targetScore: 8.5,
      weeklySessionsTarget: 5,
      currentStreakDays: 3,
    };
  }
}

export function saveStudyGoals(goals: StudyGoal) {
  try {
    localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
  } catch {
    // ignore
  }
}

const BADGES_KEY = 'omnitest_badges_state';

export function getBadges(): AchievementBadge[] {
  try {
    const raw = localStorage.getItem(BADGES_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return INITIAL_BADGES;
}

export function unlockBadge(badgeId: string) {
  const badges = getBadges();
  const b = badges.find((x) => x.id === badgeId);
  if (b && !b.unlocked) {
    b.unlocked = true;
    b.unlockedAt = new Date().toLocaleDateString('vi-VN');
    localStorage.setItem(BADGES_KEY, JSON.stringify(badges));
  }
}

function checkAndUnlockBadges(result: PracticeSessionResult, allHistory: PracticeSessionResult[]) {
  const badges = getBadges();
  let changed = false;

  // First step
  const b1 = badges.find((x) => x.id === 'first_step');
  if (b1 && !b1.unlocked && allHistory.length >= 1) {
    b1.unlocked = true;
    b1.unlockedAt = new Date().toLocaleDateString('vi-VN');
    changed = true;
  }

  // High scorer
  const b2 = badges.find((x) => x.id === 'high_scorer');
  if (b2 && !b2.unlocked && result.score10 >= 9.0) {
    b2.unlocked = true;
    b2.unlockedAt = new Date().toLocaleDateString('vi-VN');
    changed = true;
  }

  // Hardworking
  const b3 = badges.find((x) => x.id === 'hardworking');
  if (b3 && !b3.unlocked && allHistory.length >= 5) {
    b3.unlocked = true;
    b3.unlockedAt = new Date().toLocaleDateString('vi-VN');
    changed = true;
  }

  // Perfectionist
  const b4 = badges.find((x) => x.id === 'perfectionist');
  if (b4 && !b4.unlocked && result.score10 === 10) {
    b4.unlocked = true;
    b4.unlockedAt = new Date().toLocaleDateString('vi-VN');
    changed = true;
  }

  if (changed) {
    localStorage.setItem(BADGES_KEY, JSON.stringify(badges));
  }
}

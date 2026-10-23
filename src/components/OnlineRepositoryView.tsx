import React, { useState, useMemo } from 'react';
import { DocumentOutline, RevisionCategory } from '../types';
import { soundManager } from '../utils/audio';
import { CURRICULUM_DATA } from '../data/curriculumData';
import {
  ArrowRight,
  Layers,
  Calendar,
  Award,
  GraduationCap,
  Search,
  RefreshCw,
  Home,
  Atom,
  BookOpen,
  Globe,
  Calculator,
  Leaf,
  FlaskConical,
  TestTube,
  Landmark,
  Languages,
  Scale,
  Terminal,
  List,
  LayoutGrid,
  Filter,
  X,
  Sparkles,
} from 'lucide-react';

interface OnlineRepositoryViewProps {
  outlines: DocumentOutline[];
  onSelectOutline: (outline: DocumentOutline) => void;
  onViewQuestions: (outline: DocumentOutline) => void;
  onOpenUpload: () => void;
  onBackToHome?: () => void;
}

interface CategoryConfig {
  key: RevisionCategory;
  title: string;
  badge: string;
  icon: any;
  cardCount: number;
  theme: 'blue' | 'purple' | 'green' | 'orange';
}

const CATEGORIES: CategoryConfig[] = [
  {
    key: 'regular',
    title: 'Ôn Bài Thường Xuyên',
    badge: 'Hàng tuần',
    icon: Layers,
    cardCount: 13,
    theme: 'blue',
  },
  {
    key: 'midterm',
    title: 'Ôn Thi Giữa Kỳ',
    badge: 'Định kỳ',
    icon: Calendar,
    cardCount: 12,
    theme: 'purple',
  },
  {
    key: 'final',
    title: 'Ôn Thi Cuối Kỳ',
    badge: 'Tổng hợp',
    icon: Award,
    cardCount: 7,
    theme: 'green',
  },
  {
    key: 'graduation',
    title: 'Ôn Tốt Nghiệp THPT',
    badge: 'Tuyển sinh & Tốt nghiệp',
    icon: GraduationCap,
    cardCount: 12,
    theme: 'orange',
  },
];

const GRADE_OPTIONS = [
  { id: 'all', label: 'Tất cả các lớp' },
  { id: 'Lớp 10', label: 'Lớp 10' },
  { id: 'Lớp 11', label: 'Lớp 11' },
  { id: 'Lớp 12', label: 'Lớp 12' },
  { id: 'Lớp 9', label: 'Lớp 9' },
  { id: 'Lớp 8', label: 'Lớp 8' },
  { id: 'Lớp 5', label: 'Lớp 5' },
];

const SUBJECT_OPTIONS = [
  'all',
  'Toán học',
  'Ngữ văn',
  'Tiếng Anh',
  'Vật lí',
  'Hóa học',
  'Sinh học',
  'Lịch sử',
  'Địa lí',
  'GDKT & PL',
  'Tin học',
  'Khoa học tự nhiên',
];

/**
 * Đọc kĩ nội dung và chuẩn hóa phân loại môn học chính xác
 */
export function detectAndNormalizeSubject(doc: DocumentOutline): string {
  const rawSubj = (doc.subject || '').trim();
  const rawTitle = (doc.title || '').toLowerCase();
  const rawTopic = (doc.topic || '').toLowerCase();
  const rawFileName = (doc.fileName || '').toLowerCase();
  const rawQuestionsText = doc.questions.map((q) => q.content + ' ' + (q.explanation || '')).join(' ').toLowerCase();

  const combined = `${rawSubj.toLowerCase()} ${rawTitle} ${rawTopic} ${rawFileName} ${rawQuestionsText}`;

  if (
    combined.includes('khoa học tự nhiên') ||
    combined.includes('khtn') ||
    rawTitle.includes('khtn 8') ||
    rawTitle.includes('khtn 7') ||
    rawTitle.includes('khtn 6')
  ) {
    return 'Khoa học tự nhiên';
  }

  if (
    rawSubj.toLowerCase().includes('toán') ||
    rawTitle.includes('toán') ||
    rawTitle.includes('hàm số') ||
    rawTitle.includes('lượng giác') ||
    rawTitle.includes('căn bậc') ||
    rawTitle.includes('tích phân') ||
    rawTitle.includes('bất phương trình') ||
    rawTitle.includes('cấp số') ||
    rawTitle.includes('oxyz') ||
    rawTitle.includes('mệnh đề')
  ) {
    return 'Toán học';
  }

  if (
    rawSubj.toLowerCase().includes('vật lí') ||
    rawSubj.toLowerCase().includes('vật lý') ||
    rawTitle.includes('vật lí') ||
    rawTitle.includes('vật lý') ||
    rawTitle.includes('động học') ||
    rawTitle.includes('dao động') ||
    rawTitle.includes('sóng cơ') ||
    rawTitle.includes('áp suất') ||
    rawTitle.includes('khí lí tưởng')
  ) {
    return 'Vật lí';
  }

  if (
    rawSubj.toLowerCase().includes('hóa') ||
    rawTitle.includes('hóa học') ||
    rawTitle.includes('nguyên tử') ||
    rawTitle.includes('bảng tuần hoàn') ||
    rawTitle.includes('cân bằng hóa học') ||
    rawTitle.includes('ester') ||
    rawTitle.includes('lipid')
  ) {
    return 'Hóa học';
  }

  if (
    rawSubj.toLowerCase().includes('sinh') ||
    rawTitle.includes('sinh học') ||
    rawTitle.includes('tế bào') ||
    rawTitle.includes('quang hợp') ||
    rawTitle.includes('di truyền') ||
    rawTitle.includes('mã di truyền')
  ) {
    return 'Sinh học';
  }

  if (
    rawSubj.toLowerCase().includes('văn') ||
    rawTitle.includes('ngữ văn') ||
    rawTitle.includes('văn học') ||
    rawTitle.includes('thần thoại') ||
    rawTitle.includes('sử thi') ||
    rawTitle.includes('đọc hiểu') ||
    rawTitle.includes('chí phèo') ||
    rawTitle.includes('tuyên ngôn độc lập')
  ) {
    return 'Ngữ văn';
  }

  if (
    rawSubj.toLowerCase().includes('anh') ||
    rawSubj.toLowerCase().includes('english') ||
    rawTitle.includes('tiếng anh') ||
    rawTitle.includes('grammar') ||
    rawTitle.includes('tenses')
  ) {
    return 'Tiếng Anh';
  }

  if (
    rawSubj.toLowerCase().includes('sử') ||
    rawTitle.includes('lịch sử') ||
    rawTitle.includes('hiện thực lịch sử') ||
    rawTitle.includes('văn minh') ||
    rawTitle.includes('chiến dịch')
  ) {
    return 'Lịch sử';
  }

  if (
    rawSubj.toLowerCase().includes('địa') ||
    rawTitle.includes('địa lí') ||
    rawTitle.includes('địa lý') ||
    rawTitle.includes('bản đồ') ||
    rawTitle.includes('thạch quyển') ||
    rawTitle.includes('khí quyển')
  ) {
    return 'Địa lí';
  }

  if (
    rawSubj.toLowerCase().includes('gdkt') ||
    rawSubj.toLowerCase().includes('kinh tế') ||
    rawSubj.toLowerCase().includes('pháp luật') ||
    rawTitle.includes('gdkt & pl') ||
    rawTitle.includes('chủ thể kinh tế')
  ) {
    return 'GDKT & PL';
  }

  if (
    rawSubj.toLowerCase().includes('tin') ||
    rawTitle.includes('tin học') ||
    rawTitle.includes('python') ||
    rawTitle.includes('thuật toán') ||
    rawTitle.includes('cơ sở dữ liệu')
  ) {
    return 'Tin học';
  }

  return rawSubj || 'Toán học';
}

// Color and icon themes by subject
function getSubjectTheme(subject: string) {
  const s = subject.toLowerCase();
  if (s.includes('vật lí') || s.includes('vat li')) {
    return {
      borderColor: 'border-[#2563EB]',
      badgeBg: 'bg-[#EFF6FF]',
      badgeText: 'text-[#1D4ED8]',
      iconBg: 'bg-[#2563EB]',
      Icon: Atom,
    };
  }
  if (s.includes('ngữ văn') || s.includes('van')) {
    return {
      borderColor: 'border-[#7C3AED]',
      badgeBg: 'bg-[#F5F3FF]',
      badgeText: 'text-[#6D28D9]',
      iconBg: 'bg-[#7C3AED]',
      Icon: BookOpen,
    };
  }
  if (s.includes('địa lí') || s.includes('dia li')) {
    return {
      borderColor: 'border-[#059669]',
      badgeBg: 'bg-[#ECFDF5]',
      badgeText: 'text-[#047857]',
      iconBg: 'bg-[#059669]',
      Icon: Globe,
    };
  }
  if (s.includes('sinh học') || s.includes('sinh')) {
    return {
      borderColor: 'border-[#16A34A]',
      badgeBg: 'bg-[#F0FDF4]',
      badgeText: 'text-[#15803D]',
      iconBg: 'bg-[#16A34A]',
      Icon: Leaf,
    };
  }
  if (s.includes('khoa học tự nhiên') || s.includes('khtn')) {
    return {
      borderColor: 'border-[#0284C7]',
      badgeBg: 'bg-[#F0F9FF]',
      badgeText: 'text-[#0369A1]',
      iconBg: 'bg-[#0284C7]',
      Icon: FlaskConical,
    };
  }
  if (s.includes('hóa học') || s.includes('hoa')) {
    return {
      borderColor: 'border-[#DB2777]',
      badgeBg: 'bg-[#FDF2F8]',
      badgeText: 'text-[#BE185D]',
      iconBg: 'bg-[#DB2777]',
      Icon: TestTube,
    };
  }
  if (s.includes('lịch sử') || s.includes('su')) {
    return {
      borderColor: 'border-[#D97706]',
      badgeBg: 'bg-[#FFFBEB]',
      badgeText: 'text-[#B45309]',
      iconBg: 'bg-[#D97706]',
      Icon: Landmark,
    };
  }
  if (s.includes('tiếng anh') || s.includes('anh')) {
    return {
      borderColor: 'border-[#0891B2]',
      badgeBg: 'bg-[#ECFEFF]',
      badgeText: 'text-[#0e7490]',
      iconBg: 'bg-[#0891B2]',
      Icon: Languages,
    };
  }
  if (s.includes('gdkt') || s.includes('kinh tế') || s.includes('pháp luật')) {
    return {
      borderColor: 'border-[#0D9488]',
      badgeBg: 'bg-[#F0FDFA]',
      badgeText: 'text-[#0F766E]',
      iconBg: 'bg-[#0D9488]',
      Icon: Scale,
    };
  }
  if (s.includes('tin học') || s.includes('tin')) {
    return {
      borderColor: 'border-[#4F46E5]',
      badgeBg: 'bg-[#EEF2FF]',
      badgeText: 'text-[#4338CA]',
      iconBg: 'bg-[#4F46E5]',
      Icon: Terminal,
    };
  }
  // Toán học default
  return {
    borderColor: 'border-[#EA580C]',
    badgeBg: 'bg-[#FFF7ED]',
    badgeText: 'text-[#C2410C]',
    iconBg: 'bg-[#EA580C]',
    Icon: Calculator,
  };
}

export const OnlineRepositoryView: React.FC<OnlineRepositoryViewProps> = ({
  outlines,
  onSelectOutline,
  onOpenUpload,
  onBackToHome,
}) => {
  const [activeCategory, setActiveCategory] = useState<RevisionCategory>('midterm');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Đã kết nối');

  // Combine user outlines and standard online curriculum data with normalized subjects
  const combinedOutlines = useMemo(() => {
    const map = new Map<string, DocumentOutline>();
    CURRICULUM_DATA.forEach((doc) => {
      const normalizedSubj = detectAndNormalizeSubject(doc);
      map.set(doc.id, { ...doc, subject: normalizedSubj });
    });
    outlines.forEach((doc) => {
      const normalizedSubj = detectAndNormalizeSubject(doc);
      map.set(doc.id, { ...doc, subject: normalizedSubj });
    });
    return Array.from(map.values());
  }, [outlines]);

  // Handle online real-time refresh
  const handleRefreshOnline = () => {
    soundManager.playClick();
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setLastSyncTime(new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }));
      soundManager.playVictory();
    }, 450);
  };

  // Filter pool under current category
  const categoryPool = useMemo(() => {
    return combinedOutlines.filter((o) => {
      let cat = o.category;
      if (!cat) {
        const text = (o.title + ' ' + (o.semester || '')).toLowerCase();
        if (text.includes('tốt nghiệp') || text.includes('vào 10') || text.includes('tuyển sinh')) {
          cat = 'graduation';
        } else if (text.includes('cuối kỳ') || text.includes('cuoi ky') || text.includes('hk1') || text.includes('hk2')) {
          cat = 'final';
        } else if (text.includes('giữa kỳ') || text.includes('giua ky')) {
          cat = 'midterm';
        } else {
          cat = 'regular';
        }
      }
      return cat === activeCategory;
    });
  }, [combinedOutlines, activeCategory]);

  // Filtered outlines based on selected Grade, Subject, and Search
  const filteredOutlines = useMemo(() => {
    return categoryPool.filter((o) => {
      // Grade filter
      let matchGrade = true;
      if (selectedGrade !== 'all') {
        matchGrade = o.grade.toLowerCase().includes(selectedGrade.toLowerCase());
      }

      // Subject filter
      let matchSubject = true;
      if (selectedSubject !== 'all') {
        matchSubject = o.subject.toLowerCase() === selectedSubject.toLowerCase();
      }

      // Search term
      let matchSearch = true;
      if (searchTerm.trim() !== '') {
        const term = searchTerm.toLowerCase();
        matchSearch =
          o.title.toLowerCase().includes(term) ||
          o.subject.toLowerCase().includes(term) ||
          o.grade.toLowerCase().includes(term) ||
          Boolean(o.topic && o.topic.toLowerCase().includes(term));
      }

      return matchGrade && matchSubject && matchSearch;
    });
  }, [categoryPool, selectedGrade, selectedSubject, searchTerm]);

  // Counts for subjects
  const subjectCounts = useMemo(() => {
    const counts: Record<string, number> = { all: categoryPool.length };
    SUBJECT_OPTIONS.forEach((s) => {
      if (s !== 'all') {
        counts[s] = categoryPool.filter((doc) => doc.subject.toLowerCase() === s.toLowerCase()).length;
      }
    });
    return counts;
  }, [categoryPool]);

  return (
    <div className="space-y-3.5 sm:space-y-4 w-full select-none">
      {/* =========================================================================
          1. TOP APP BANNER - TỐI ƯU ĐIỆN THOẠI
         ========================================================================= */}
      <div className="bg-gradient-to-r from-[#D8E9FF] via-[#EAF2FF] to-[#D5E6FF] rounded-2xl sm:rounded-3xl p-3 sm:p-4 border-2 border-[#BCD7FE] shadow-xs relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Left: App Logo + Title + Status */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#1E5EFF] via-[#2F6DF6] to-[#4F46E5] text-white flex items-center justify-center shrink-0 shadow-md border-2 border-white/60">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white fill-white/20 animate-pulse" />
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-tight truncate">
              DANH MỤC ÔN TẬP TRỰC TUYẾN
            </h2>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#D1F7DE] text-[#057A38] text-[10px] font-black border border-[#86EFAC]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse"></span>
                <span>ONLINE • {lastSyncTime}</span>
              </span>
              <span className="text-[10px] font-semibold text-slate-500">
                • {filteredOutlines.length} đề
              </span>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
          <button
            onClick={handleRefreshOnline}
            disabled={isSyncing}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl sm:rounded-full bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs border border-blue-200/90 transition-all active:scale-95 cursor-pointer"
            title="Đồng bộ cập nhật tài liệu"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Cập nhật</span>
          </button>

          {onBackToHome && (
            <button
              onClick={() => {
                soundManager.playClick();
                onBackToHome();
              }}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl sm:rounded-full bg-[#1D63FF] hover:bg-blue-700 text-white font-black text-xs shadow-md active:scale-95 transition-all cursor-pointer border border-blue-400/40 shrink-0"
              title="Quay lại trang chủ"
            >
              <Home className="w-3.5 h-3.5 fill-white" />
              <span>VỀ TRANG CHỦ</span>
            </button>
          )}
        </div>
      </div>

      {/* =========================================================================
          2. 4 REVISION CATEGORY CARDS
         ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.key;
          const Icon = cat.icon;

          let borderClass = 'border-slate-200 bg-white hover:border-blue-300';
          let activeClass = '';

          if (cat.theme === 'blue') {
            activeClass = 'border-[#2563EB] bg-[#EFF6FF] ring-2 ring-blue-300/60 shadow-xs';
          } else if (cat.theme === 'purple') {
            activeClass = 'border-[#7C3AED] bg-[#FAF7FF] ring-2 ring-purple-300/60 shadow-xs';
          } else if (cat.theme === 'green') {
            activeClass = 'border-[#059669] bg-[#F0FDF4] ring-2 ring-emerald-300/60 shadow-xs';
          } else {
            activeClass = 'border-[#D97706] bg-[#FFFBEB] ring-2 ring-amber-300/60 shadow-xs';
          }

          return (
            <button
              key={cat.key}
              onClick={() => {
                soundManager.playClick();
                setActiveCategory(cat.key);
              }}
              className={`p-3.5 sm:p-4 rounded-2xl border-[2.5px] text-left transition-all duration-200 cursor-pointer flex flex-col justify-between shadow-xs active:scale-[0.98] ${
                isActive ? activeClass : borderClass
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="w-8 h-8 rounded-xl bg-white shadow-xs flex items-center justify-center">
                    <Icon className="w-4 h-4 text-slate-800" />
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/90 text-slate-700 shadow-xs">
                    {cat.badge}
                  </span>
                </div>
                <h3 className="font-black text-xs sm:text-sm text-slate-900 leading-snug">
                  {cat.title}
                </h3>
              </div>

              <div className="mt-2.5 flex items-center justify-between text-[11px] font-bold text-slate-500">
                <span>{cat.cardCount} đề cương</span>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                  isActive ? 'bg-[#1D63FF] text-white' : 'bg-slate-100 text-slate-400'
                }`}>
                  ›
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* =========================================================================
          3. TÌM KIẾM & LỌC THEO LỚP, MÔN (RÕ RÀNG, TIỆN LỢI, TRỰC QUAN)
         ========================================================================= */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border-2 border-[#BCD7FE] shadow-xs space-y-3.5">
        {/* Row 1: Tìm kiếm nhanh & Bộ lọc nhanh Lớp/Môn */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5">
          {/* Ô tìm kiếm từ khóa */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm đề cương theo tên bài, môn, lớp..."
              className="w-full pl-10 pr-9 py-2 text-xs text-slate-800 bg-slate-50 hover:bg-white border-2 border-slate-200 focus:border-[#1D63FF] rounded-2xl focus:outline-none focus:bg-white font-medium transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Chọn Lớp nhanh */}
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="relative">
              <select
                value={selectedGrade}
                onChange={(e) => {
                  soundManager.playClick();
                  setSelectedGrade(e.target.value);
                }}
                className="text-xs font-bold bg-blue-50/80 hover:bg-blue-100/80 text-[#1E3A8A] border-2 border-blue-200 rounded-2xl px-3 py-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                {GRADE_OPTIONS.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Chọn Môn nhanh */}
            <div className="relative">
              <select
                value={selectedSubject}
                onChange={(e) => {
                  soundManager.playClick();
                  setSelectedSubject(e.target.value);
                }}
                className="text-xs font-bold bg-indigo-50/80 hover:bg-indigo-100/80 text-[#3730A3] border-2 border-indigo-200 rounded-2xl px-3 py-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                <option value="all">Tất cả môn</option>
                {SUBJECT_OPTIONS.filter((s) => s !== 'all').map((s) => (
                  <option key={s} value={s}>
                    Môn {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Toggle Chế độ xem: Lưới (Grid) vs Dòng (List) */}
            <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
              <button
                onClick={() => {
                  soundManager.playClick();
                  setViewMode('grid');
                }}
                className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white text-[#1D63FF] shadow-xs'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
                title="Xem dạng thẻ gọn gàng"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  soundManager.playClick();
                  setViewMode('list');
                }}
                className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-white text-[#1D63FF] shadow-xs'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
                title="Xem dạng dòng danh sách"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: Danh sách pills chọn môn học nhanh */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-[#1D63FF]" />
              <span>Lọc nhanh theo môn:</span>
            </span>

            {(selectedSubject !== 'all' || selectedGrade !== 'all' || searchTerm.trim() !== '') && (
              <button
                onClick={() => {
                  soundManager.playClick();
                  setSelectedSubject('all');
                  setSelectedGrade('all');
                  setSearchTerm('');
                }}
                className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3 h-3" />
                <span>Bỏ lọc</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {SUBJECT_OPTIONS.map((subj) => {
              const isSelected = selectedSubject === subj;
              const count = subjectCounts[subj] || 0;
              const label = subj === 'all' ? 'Tất cả môn' : subj;

              return (
                <button
                  key={subj}
                  onClick={() => {
                    soundManager.playClick();
                    setSelectedSubject(subj);
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#1D63FF] text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700'
                  }`}
                >
                  <span>{label}</span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-white text-slate-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* =========================================================================
          4. DANH SÁCH ĐỀ CƯƠNG: THU GỌN KHUNG, BỎ CHỮ NHỎ, TĂNG VIỀN KHUNG, NÚT ÔN NGAY
         ========================================================================= */}
      {filteredOutlines.length === 0 ? (
        <div className="bg-white p-8 text-center rounded-3xl border-2 border-dashed border-blue-200 space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-xs">
            <Search className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm text-slate-900">
            Không tìm thấy đề cương nào khớp với bộ lọc
          </h4>
          <div className="flex items-center justify-center gap-2 pt-1">
            <button
              onClick={() => {
                soundManager.playClick();
                setSelectedGrade('all');
                setSelectedSubject('all');
                setSearchTerm('');
              }}
              className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Xem tất cả đề cương
            </button>
            <button
              onClick={onOpenUpload}
              className="px-4 py-1.5 bg-[#1D63FF] hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              Tải lên đề Word
            </button>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        /* =====================================================================
           DẠNG LƯỚI THẺ (GRID) - KHUNG THU GỌN, VIỀN ĐẬM 2.5PX, CHỈ MÔN, LỚP VÀ NÚT ÔN NGAY
           ===================================================================== */
        <div className="grid grid-cols-1 gap-2.5">
          {filteredOutlines.map((doc) => {
            const theme = getSubjectTheme(doc.subject);
            const SubjectIcon = theme.Icon;

            return (
              <div
                key={doc.id}
                className={`bg-white p-3.5 sm:p-4 rounded-2xl border-[2.5px] ${theme.borderColor} shadow-xs hover:shadow-md transition-all flex flex-col justify-between group active:scale-[0.99]`}
              >
                <div>
                  {/* Top: Tên môn với icon + Khối lớp */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-7 h-7 rounded-lg ${theme.iconBg} text-white flex items-center justify-center shrink-0 shadow-xs`}>
                        <SubjectIcon className="w-3.5 h-3.5" />
                      </div>
                      <span className={`text-xs font-black ${theme.badgeText}`}>
                        {doc.subject}
                      </span>
                    </div>

                    <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                      {doc.grade}
                    </span>
                  </div>

                  {/* Tiêu đề đề cương to rõ, bỏ hết mọi chữ nhỏ rườm rà */}
                  <h3
                    className="font-black text-slate-900 text-sm leading-snug line-clamp-2 my-2.5 min-h-[2.5rem] group-hover:text-blue-600 transition-colors cursor-pointer"
                    title={doc.title}
                    onClick={() => {
                      soundManager.playClick();
                      onSelectOutline(doc);
                    }}
                  >
                    {doc.title}
                  </h3>
                </div>

                {/* Nút "Ôn ngay" nổi bật & thu gọn */}
                <div className="pt-2 border-t border-slate-100">
                  <button
                    onClick={() => {
                      soundManager.playClick();
                      onSelectOutline(doc);
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <span>Ôn ngay</span>
                    <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* =====================================================================
           DẠNG DÒNG (LIST) - CỰC KỲ GỌN GÀNG, VIỀN ĐẬM 2.5PX, CHỈ MÔN, LỚP VÀ NÚT ÔN NGAY
           ===================================================================== */
        <div className="space-y-2.5">
          {filteredOutlines.map((doc) => {
            const theme = getSubjectTheme(doc.subject);
            const SubjectIcon = theme.Icon;

            return (
              <div
                key={doc.id}
                className={`bg-white p-3 sm:p-3.5 rounded-2xl border-[2.5px] ${theme.borderColor} shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3`}
              >
                {/* Left: Icon, Tên môn, Lớp, Tiêu đề */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`w-8 h-8 rounded-xl ${theme.iconBg} text-white flex items-center justify-center shrink-0 shadow-xs`}>
                    <SubjectIcon className="w-4 h-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-xs font-black ${theme.badgeText}`}>
                        {doc.subject}
                      </span>
                      <span className="text-[11px] font-black px-2 py-0.2 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                        {doc.grade}
                      </span>
                    </div>

                    <h4
                      className="font-black text-slate-900 text-xs sm:text-sm leading-snug truncate hover:text-blue-600 cursor-pointer"
                      title={doc.title}
                      onClick={() => {
                        soundManager.playClick();
                        onSelectOutline(doc);
                      }}
                    >
                      {doc.title}
                    </h4>
                  </div>
                </div>

                {/* Right: Nút Ôn ngay */}
                <div className="shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => {
                      soundManager.playClick();
                      onSelectOutline(doc);
                    }}
                    className="px-4 sm:px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs sm:text-sm shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <span>Ôn ngay</span>
                    <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

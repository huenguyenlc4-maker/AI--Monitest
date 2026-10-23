import React, { useState, useEffect } from 'react';
import {
  DocumentOutline,
  PracticeSessionResult,
  Question,
  StudentProfile,
} from './types';
import { Header } from './components/Header';
import { BottomNav, BottomTabType } from './components/BottomNav';
import { StudentAuthModal } from './components/StudentAuthModal';
import { DashboardView } from './components/DashboardView';
import { UploadDocxView } from './components/UploadDocxView';
import { ReviewQuestionsView } from './components/ReviewQuestionsView';
import { PracticeView } from './components/PracticeView';
import { ResultView } from './components/ResultView';
import { MyDocumentsView } from './components/MyDocumentsView';
import { OnlineRepositoryView } from './components/OnlineRepositoryView';
import { LearningJourneyView } from './components/LearningJourneyView';
import { GamesHub } from './components/games/GamesHub';
import { ShareModal } from './components/ShareModal';
import { GuideModal } from './components/GuideModal';
import { NotificationsModal } from './components/NotificationsModal';
import { SettingsModal } from './components/SettingsModal';
import { ParseResult } from './utils/docxParser';
import {
  clearActiveStudent,
  getActiveStudent,
  getPracticeHistory,
  getSavedOutlines,
  saveActiveStudent,
  savePracticeResult,
  saveSingleOutline,
} from './utils/storage';
import { soundManager } from './utils/audio';

export default function App() {
  const [currentStudent, setCurrentStudent] = useState<StudentProfile | null>(null);
  const [outlines, setOutlines] = useState<DocumentOutline[]>([]);
  const [history, setHistory] = useState<PracticeSessionResult[]>([]);
  const [notificationCount, setNotificationCount] = useState<number>(3);

  // Active navigation tab
  // 'dashboard' | 'upload' | 'review' | 'practice' | 'result' | 'documents' | 'repository' | 'journey' | 'games'
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState<boolean>(false);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [selectedShareDoc, setSelectedShareDoc] = useState<DocumentOutline | null>(null);

  // Flow bridge states
  const [currentReviewOutline, setCurrentReviewOutline] = useState<DocumentOutline | null>(null);
  const [selectedPracticeOutline, setSelectedPracticeOutline] = useState<DocumentOutline | null>(null);
  const [mistakesQuestions, setMistakesQuestions] = useState<Question[] | null>(null);
  const [lastResult, setLastResult] = useState<PracticeSessionResult | null>(null);

  // Initialize storage
  useEffect(() => {
    const student = getActiveStudent();
    if (student) {
      setCurrentStudent(student);
    } else {
      // Default to reference student name
      setCurrentStudent({
        id: 'student_hue_default',
        fullName: 'Nguyễn Thị Huệ',
        gradeClass: 'Lớp 11A1',
        school: 'THPT Chuyên',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      });
    }

    const savedDocs = getSavedOutlines();
    setOutlines(savedDocs);

    const savedHistory = getPracticeHistory();
    setHistory(savedHistory);
  }, []);

  const handleSaveStudent = (profile: StudentProfile) => {
    saveActiveStudent(profile);
    setCurrentStudent(profile);
    setIsAuthModalOpen(false);
  };

  const handleLogout = () => {
    clearActiveStudent();
    setCurrentStudent(null);
    setIsAuthModalOpen(true);
  };

  // Document extracted from Word upload
  const handleDocumentExtracted = (result: ParseResult) => {
    saveSingleOutline(result.outline);
    const updated = getSavedOutlines();
    setOutlines(updated);
    setCurrentReviewOutline(result.outline);
    setActiveTab('review');
  };

  // Start practice from review, documents or repository view
  const handleStartPracticeWithOutline = (outline: DocumentOutline) => {
    setSelectedPracticeOutline(outline);
    setMistakesQuestions(null);
    setActiveTab('practice');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Practice session completed
  const handleFinishPractice = (result: PracticeSessionResult) => {
    savePracticeResult(result);
    setHistory(getPracticeHistory());
    setOutlines(getSavedOutlines());
    setLastResult(result);
    setActiveTab('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Practice only mistaken questions
  const handleReviewMistakes = (wrongQuestions: Question[]) => {
    setMistakesQuestions(wrongQuestions);
    setActiveTab('practice');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open share modal
  const handleOpenShare = (doc: DocumentOutline) => {
    soundManager.playClick();
    setSelectedShareDoc(doc);
    setIsShareModalOpen(true);
  };

  const handleImportOutline = (imported: DocumentOutline) => {
    const updated = getSavedOutlines();
    setOutlines(updated);
    soundManager.playUploadSuccess();
  };

  // Map active view to bottom navigation tab
  const getBottomNavTab = (): BottomTabType => {
    if (activeTab === 'games') return 'games';
    if (activeTab === 'repository' || activeTab === 'practice' || activeTab === 'documents') return 'study';
    return 'home';
  };

  const handleBottomTabChange = (tab: BottomTabType) => {
    if (tab === 'home') {
      setActiveTab('dashboard');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (tab === 'study') {
      setActiveTab('repository');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (tab === 'games') {
      setActiveTab('games');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (tab === 'notifications') {
      setIsNotificationsModalOpen(true);
    } else if (tab === 'settings') {
      setIsSettingsModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col text-slate-800 antialiased selection:bg-blue-100 selection:text-blue-900 font-sans">
      {/* 1. TOP HEADER - 100% MATCHING MOCKUP */}
      <Header
        currentStudent={currentStudent}
        notificationCount={notificationCount}
        onOpenNotifications={() => setIsNotificationsModalOpen(true)}
        onOpenProfile={() => setIsAuthModalOpen(true)}
        onLogoClick={() => {
          setActiveTab('dashboard');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* 2. MAIN APP CONTENT CONTAINER - KHUNG GỌN TRONG 1 TRANG MÀN HÌNH ĐIỆN THOẠI */}
      <main className="flex-1 w-full mx-auto px-3 py-2 pb-20 max-w-md sm:max-w-lg md:max-w-xl transition-all">
        {activeTab === 'dashboard' && (
          <DashboardView
            currentStudent={currentStudent}
            outlines={outlines}
            history={history}
            onNavigate={(tab) => {
              setActiveTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onSelectOutlineToPractice={handleStartPracticeWithOutline}
            onOpenGuide={() => setIsGuideModalOpen(true)}
          />
        )}

        {activeTab === 'repository' && (
          <OnlineRepositoryView
            outlines={outlines}
            onSelectOutline={handleStartPracticeWithOutline}
            onViewQuestions={(doc) => {
              setCurrentReviewOutline(doc);
              setActiveTab('review');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenUpload={() => setActiveTab('upload')}
            onBackToHome={() => {
              setActiveTab('dashboard');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {activeTab === 'upload' && (
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-xs">
            <UploadDocxView
              onDocumentExtracted={handleDocumentExtracted}
              onCancel={() => setActiveTab('dashboard')}
            />
          </div>
        )}

        {activeTab === 'review' && currentReviewOutline && (
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-xs">
            <ReviewQuestionsView
              outline={currentReviewOutline}
              onConfirmAndStartPractice={handleStartPracticeWithOutline}
              onBackToUpload={() => setActiveTab('upload')}
            />
          </div>
        )}

        {activeTab === 'practice' && (
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-xs">
            <PracticeView
              currentStudent={currentStudent}
              outlines={outlines}
              preSelectedOutline={selectedPracticeOutline}
              mistakesOnlyQuestions={mistakesQuestions}
              onFinishPractice={handleFinishPractice}
              onBackToDashboard={() => setActiveTab('dashboard')}
            />
          </div>
        )}

        {activeTab === 'result' && lastResult && (
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-xs">
            <ResultView
              result={lastResult}
              onRetake={() => {
                if (selectedPracticeOutline) {
                  handleStartPracticeWithOutline(selectedPracticeOutline);
                } else {
                  setActiveTab('practice');
                }
              }}
              onReviewMistakes={handleReviewMistakes}
              onBackToHome={() => setActiveTab('dashboard')}
            />
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/90 shadow-xs">
            <MyDocumentsView
              outlines={outlines}
              onSelectOutlineToPractice={handleStartPracticeWithOutline}
              onViewQuestions={(doc) => {
                setCurrentReviewOutline(doc);
                setActiveTab('review');
              }}
              onOpenUpload={() => setActiveTab('upload')}
              onOpenShare={handleOpenShare}
              onUpdateOutlines={setOutlines}
            />
          </div>
        )}

        {activeTab === 'journey' && (
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-xs">
            <LearningJourneyView
              history={history}
              onStartPracticeTopic={() => setActiveTab('practice')}
            />
          </div>
        )}

        {activeTab === 'games' && (
          <GamesHub onBackToHome={() => setActiveTab('dashboard')} />
        )}
      </main>

      {/* 3. STICKY BOTTOM NAVIGATION BAR - 100% MATCHING MOCKUP */}
      <BottomNav
        activeTab={getBottomNavTab()}
        notificationCount={notificationCount}
        onTabChange={handleBottomTabChange}
      />

      {/* 4. MODALS */}
      <GuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
      />

      <NotificationsModal
        isOpen={isNotificationsModalOpen}
        onClose={() => setIsNotificationsModalOpen(false)}
        onClearCount={() => setNotificationCount(0)}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        currentStudent={currentStudent}
        onOpenEditProfile={() => {
          setIsSettingsModalOpen(false);
          setIsAuthModalOpen(true);
        }}
        onResetData={() => {
          setOutlines(getSavedOutlines());
          setHistory(getPracticeHistory());
        }}
      />

      <StudentAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentStudent={currentStudent}
        onSaveStudent={handleSaveStudent}
        onClearStudent={handleLogout}
      />

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        outline={selectedShareDoc}
        onImportOutline={handleImportOutline}
      />
    </div>
  );
}

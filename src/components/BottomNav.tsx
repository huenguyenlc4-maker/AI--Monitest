import React from 'react';
import { soundManager } from '../utils/audio';
import { Home, BookOpen, Gamepad2, Bell, Settings } from 'lucide-react';

export type BottomTabType = 'home' | 'study' | 'games' | 'notifications' | 'settings';

interface BottomNavProps {
  activeTab: BottomTabType;
  notificationCount: number;
  onTabChange: (tab: BottomTabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  notificationCount,
  onTabChange,
}) => {
  const tabs = [
    { id: 'home' as BottomTabType, label: 'Trang chủ', icon: Home },
    { id: 'study' as BottomTabType, label: 'Học tập', icon: BookOpen },
    { id: 'games' as BottomTabType, label: 'Giải trí', icon: Gamepad2 },
    { id: 'notifications' as BottomTabType, label: 'Thông báo', icon: Bell, badge: notificationCount },
    { id: 'settings' as BottomTabType, label: 'Cài đặt', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg">
      <div className="max-w-md sm:max-w-lg md:max-w-xl mx-auto flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => {
                soundManager.playClick();
                onTabChange(tab.id);
              }}
              className="relative flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-colors group cursor-pointer"
            >
              {/* Active blue indicator bar at top */}
              {isActive && (
                <span className="absolute top-0 w-12 h-1 bg-[#2563EB] rounded-b-full shadow-xs" />
              )}

              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-[#2563EB]' : 'text-slate-500'
                  }`}
                />
                {tab.badge && tab.badge > 0 && (
                  <span className="absolute -top-1 -right-2 bg-[#EF4444] text-white text-[9px] font-black rounded-full w-3.5 h-3.5 flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </div>

              <span
                className={`text-[11px] font-bold mt-1 tracking-tight ${
                  isActive ? 'text-[#2563EB]' : 'text-slate-500'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

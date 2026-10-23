import React from 'react';
import { soundManager } from '../utils/audio';
import { X, Bell, Sparkles, BookOpen, Flame, Check } from 'lucide-react';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClearCount: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  onClearCount,
}) => {
  if (!isOpen) return null;

  const notifications = [
    {
      id: 1,
      title: 'Chào mừng bạn đến với AI-OmniTest!',
      desc: 'Hệ thống học tập và ôn thi thông minh với AI cá nhân hóa đã sẵn sàng đồng hành cùng bạn.',
      time: 'Vừa xong',
      icon: Sparkles,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      id: 2,
      title: 'Đã cập nhật kho học liệu 4 danh mục ôn thi',
      desc: 'Bổ sung đề thi thử Vào 10, ôn giữa kỳ và cuối kỳ các môn Toán, KHTN, Tiếng Anh chuẩn GDPT.',
      time: 'Hôm nay',
      icon: BookOpen,
      color: 'bg-emerald-100 text-emerald-600',
    },
    {
      id: 3,
      title: 'Duy trì chuỗi học tập 3 ngày liên tiếp!',
      desc: 'Tuyệt vời! Hãy hoàn thành 1 bài luyện tập ngắn hôm nay để nối dài chuỗi tiến bộ nhé.',
      time: 'Hôm nay',
      icon: Flame,
      color: 'bg-amber-100 text-amber-600',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900">Thông Báo Học Tập</h3>
          </div>
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          {notifications.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3 text-xs"
              >
                <div className={`w-8 h-8 rounded-xl ${item.color} flex items-center justify-center shrink-0`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="font-bold text-slate-800 leading-tight">{item.title}</div>
                  <div className="text-slate-500 text-[11px] leading-relaxed">{item.desc}</div>
                  <div className="text-slate-400 text-[10px]">{item.time}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => {
              soundManager.playClick();
              onClearCount();
            }}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800"
          >
            Đánh dấu đã đọc tất cả
          </button>
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow-xs"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

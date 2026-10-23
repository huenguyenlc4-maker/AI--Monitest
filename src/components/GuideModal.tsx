import React from 'react';
import { soundManager } from '../utils/audio';
import { X, BookOpen, CheckCircle2, Sparkles, FileText, Award, HelpCircle } from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Giới thiệu & Hướng dẫn</h3>
              <p className="text-xs text-slate-500">Hệ thống AI-OmniTest chuẩn GDPT 2018</p>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content sections */}
        <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
          <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-200 space-y-1.5">
            <h4 className="font-bold text-blue-900 text-sm flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>1. AI-OmniTest là gì?</span>
            </h4>
            <p>
              AI-OmniTest là hệ thống ôn tập thông minh hỗ trợ học sinh và giáo viên chuyển đổi trực
              tiếp đề cương ôn tập định dạng <strong>Word (.docx, .doc)</strong> hoặc <strong>PDF (.pdf)</strong> thành các bài luyện tập tương tác sinh động,
              tự động chấm điểm theo thang điểm Bộ GD&ĐT 2018 và lưu trữ toàn bộ tiến trình học tập trên thiết bị.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-sm">2. Hướng dẫn các bước sử dụng:</h4>
            <ol className="list-decimal pl-4 space-y-1.5 text-slate-600">
              <li>
                <strong>Tải đề cương Word / PDF hoặc dán văn bản:</strong> Kéo thả file .docx, .doc hoặc .pdf vào mục <em>Tải Đề Cương</em>, hoặc dán trực tiếp nội dung đề cương.
              </li>
              <li>
                <strong>Tự động phân loại 3 dạng câu hỏi chuẩn GDPT 2018:</strong>
                <ul className="list-disc pl-4 mt-1 space-y-0.5 text-[11px]">
                  <li><strong>Dạng A:</strong> Trắc nghiệm 4 lựa chọn (A, B, C, D). Điểm = 0.25đ / câu.</li>
                  <li><strong>Dạng B:</strong> Trắc nghiệm Đúng / Sai 4 ý (a, b, c, d). Chấm lũy tiến: Đúng 1 ý = 0.1đ; 2 ý = 0.25đ; 3 ý = 0.5đ; 4 ý = 1.0đ.</li>
                  <li><strong>Dạng C:</strong> Câu trả lời ngắn (số thực, từ khóa), hỗ trợ dấu phẩy hoặc chấm thập phân.</li>
                </ul>
              </li>
              <li>
                <strong>Lưu trữ tiến trình tự động:</strong> Mọi đề cương bạn tải lên cùng lịch sử bài thi đều được lưu giữ vĩnh viễn trên trình duyệt của máy bạn, không sợ mất sau khi đăng nhập lại.
              </li>
              <li>
                <strong>Luyện tập & Xem đáp án:</strong> Có thể bật/tắt nút "Xem đáp án đúng" để tự ôn tập linh hoạt.
              </li>
              <li>
                <strong>Góc giải trí:</strong> Thư giãn với 8 trò chơi trí tuệ sau giờ học.
              </li>
            </ol>
          </div>

          {/* Detailed formatting guide for 100% recognition */}
          <div className="bg-amber-50/80 p-4 rounded-2xl border border-amber-200 space-y-2">
            <h4 className="font-bold text-amber-900 text-sm flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-amber-700" />
              <span>3. Quy chuẩn soạn tài liệu để nhận diện chính xác 100%:</span>
            </h4>
            <div className="space-y-2 text-[11px] text-amber-900">
              <p>
                <strong>🔹 Dấu hiệu mở đầu câu hỏi:</strong> Ghi rõ <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">Câu 1:</code>, <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">Câu 1.</code>, <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">Bài 1:</code>, hoặc số thứ tự <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">1.</code>.
              </p>
              <p>
                <strong>🔹 Trắc nghiệm 4 lựa chọn:</strong> Các phương án bắt đầu bằng <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">A.</code>, <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">B.</code>, <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">C.</code>, <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">D.</code>. Có thể gõ trên 4 dòng hoặc cùng dòng cách nhau khoảng trắng. Đánh dấu đáp án đúng bằng gạch chân, in đậm, hoặc thêm dấu sao <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">*A.</code>.
              </p>
              <p>
                <strong>🔹 Đúng / Sai (4 ý):</strong> Dùng các tiền tố <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">a)</code>, <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">b)</code>, <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">c)</code>, <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">d)</code>. Đặt đáp án ở cuối ý: <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">(Đúng)</code> hoặc <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">(Sai)</code>.
              </p>
              <p>
                <strong>🔹 Bảng đáp án ở cuối tài liệu (Nên dùng):</strong> Thêm mục <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">BẢNG ĐÁP ÁN: 1-A, 2-C, 3: a-Đ, b-S, c-Đ, d-S, 4-15.5</code> ở cuối file, app sẽ tự động bắt khớp chính xác tuyệt đối.
              </p>
            </div>
          </div>

          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-1">
            <div className="font-bold text-emerald-900 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>Thông tin bản quyền & Tác giả</span>
            </div>
            <p className="text-emerald-800">
              Tác giả thiết kế & phát triển: <strong>Nguyễn Thị Huệ</strong>.
            </p>
            <p className="text-emerald-700 text-[11px]">
              Ứng dụng tuân thủ Chương trình GDPT 2018 của Bộ Giáo dục và Đào tạo Việt Nam.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            soundManager.playClick();
            onClose();
          }}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
        >
          Đã hiểu, quay lại học ngay
        </button>
      </div>
    </div>
  );
};

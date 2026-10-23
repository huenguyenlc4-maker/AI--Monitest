import React, { useState } from 'react';
import { DocumentOutline } from '../types';
import { soundManager } from '../utils/audio';
import { saveSingleOutline } from '../utils/storage';
import { Share2, Copy, Check, Download, Upload, X, Shield, Key } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  outline: DocumentOutline | null;
  onImportOutline: (imported: DocumentOutline) => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  outline,
  onImportOutline,
}) => {
  const [copied, setCopied] = useState(false);
  const [importCode, setImportCode] = useState('');
  const [importError, setImportError] = useState('');
  const [activeTab, setActiveTab] = useState<'share' | 'import'>('share');

  if (!isOpen) return null;

  // Generate share code based on outline
  const shareCode = outline
    ? `OMNI-${outline.subject.slice(0, 3).toUpperCase()}-${outline.id.slice(-6).toUpperCase()}`
    : '';

  const handleCopyCode = () => {
    soundManager.playClick();
    navigator.clipboard.writeText(shareCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportJSON = () => {
    if (!outline) return;
    soundManager.playClick();
    // Exclude student private data
    const exportData = {
      omnitestVersion: '1.0',
      exportedAt: new Date().toISOString(),
      outline: {
        id: `shared_${Date.now()}`,
        title: outline.title,
        subject: outline.subject,
        grade: outline.grade,
        school: outline.school,
        semester: outline.semester,
        topic: outline.topic,
        uploadDate: new Date().toLocaleDateString('vi-VN'),
        fileName: outline.fileName,
        fileSize: outline.fileSize,
        questions: outline.questions,
      },
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `De_cuong_OmniTest_${outline.subject}_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed && parsed.outline && parsed.outline.questions) {
            soundManager.playUploadSuccess();
            saveSingleOutline(parsed.outline);
            onImportOutline(parsed.outline);
            onClose();
          } else {
            setImportError('Tệp JSON không đúng định dạng đề cương AI- OmniTest.');
            soundManager.playAlert();
          }
        } catch {
          setImportError('Không thể đọc tệp JSON. Vui lòng kiểm tra lại.');
          soundManager.playAlert();
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <Share2 className="w-5 h-5" />
            </span>
            <h3 className="font-bold text-base text-slate-900">Chia Sẻ & Nhập Tài Liệu</h3>
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

        {/* Tab switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('share')}
            className={`flex-1 py-1.5 rounded-lg transition-colors ${
              activeTab === 'share' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'
            }`}
          >
            Chia sẻ đề cương
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`flex-1 py-1.5 rounded-lg transition-colors ${
              activeTab === 'import' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'
            }`}
          >
            Nhập đề cương từ bạn bè
          </button>
        </div>

        {activeTab === 'share' && outline ? (
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
              <div className="font-bold text-slate-800 line-clamp-1">{outline.title}</div>
              <div className="text-slate-500">
                {outline.subject} · {outline.grade} · {outline.questions.length} câu hỏi
              </div>
            </div>

            {/* Share Code */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Mã chia sẻ nhanh
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareCode}
                  className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 select-all"
                />
                <button
                  onClick={handleCopyCode}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0 shadow-xs"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Đã chép' : 'Sao chép'}</span>
                </button>
              </div>
            </div>

            {/* JSON Export for full cross-device portability */}
            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={handleExportJSON}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Tải tệp gói đề cương (.json) để gửi bạn bè</span>
              </button>
            </div>

            {/* Privacy note */}
            <div className="p-3 bg-blue-50/50 border border-blue-200 rounded-xl text-[11px] text-blue-900 leading-relaxed flex items-start gap-2">
              <Shield className="w-4 h-4 shrink-0 text-blue-600 mt-0.5" />
              <span>
                <strong>Bảo mật:</strong> Gói chia sẻ chỉ chứa danh sách câu hỏi đề cương của thầy cô,
                không bao gồm lịch sử điểm số hay thông tin cá nhân của học sinh.
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Tải lên tệp đề cương (.json) được bạn bè hoặc giáo viên gửi:
              </label>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
              />
            </div>

            {importError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                {importError}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { DocumentOutline } from '../types';
import { soundManager } from '../utils/audio';
import { deleteOutline, saveSingleOutline } from '../utils/storage';
import {
  FolderOpen,
  Search,
  BookOpen,
  CheckCircle,
  Trash2,
  Edit3,
  Share2,
  Plus,
  ArrowRight,
  Sparkles,
  Calendar,
  X,
  AlertTriangle,
} from 'lucide-react';

interface MyDocumentsViewProps {
  outlines: DocumentOutline[];
  onSelectOutlineToPractice: (outline: DocumentOutline) => void;
  onViewQuestions: (outline: DocumentOutline) => void;
  onOpenUpload: () => void;
  onOpenShare: (outline: DocumentOutline) => void;
  onUpdateOutlines: (outlines: DocumentOutline[]) => void;
}

export const MyDocumentsView: React.FC<MyDocumentsViewProps> = ({
  outlines,
  onSelectOutlineToPractice,
  onViewQuestions,
  onOpenUpload,
  onOpenShare,
  onUpdateOutlines,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Edit metadata modal
  const [editingDoc, setEditingDoc] = useState<DocumentOutline | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editSubject, setEditSubject] = useState('');
  const [editGrade, setEditGrade] = useState('');

  // Extract unique subjects
  const subjects = Array.from(new Set(outlines.map((o) => o.subject))).filter(Boolean);

  const filteredOutlines = outlines.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.grade.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.topic && doc.topic.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesSubject = selectedSubject === 'all' || doc.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  const handleDelete = (id: string) => {
    soundManager.playClick();
    const updated = deleteOutline(id);
    onUpdateOutlines(updated);
    setDeleteConfirmId(null);
  };

  const handleOpenEdit = (doc: DocumentOutline) => {
    soundManager.playClick();
    setEditingDoc(doc);
    setEditTitle(doc.title);
    setEditSubject(doc.subject);
    setEditGrade(doc.grade);
  };

  const handleSaveEdit = () => {
    if (!editingDoc) return;
    soundManager.playCorrect();
    const updated = {
      ...editingDoc,
      title: editTitle.trim() || editingDoc.title,
      subject: editSubject.trim() || editingDoc.subject,
      grade: editGrade.trim() || editingDoc.grade,
    };
    saveSingleOutline(updated);
    onUpdateOutlines(outlines.map((o) => (o.id === updated.id ? updated : o)));
    setEditingDoc(null);
  };

  return (
    <div className="space-y-3 w-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 bg-white p-3 sm:p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-purple-50 text-purple-600 rounded-lg shrink-0">
            <FolderOpen className="w-4 h-4" />
          </span>
          <div>
            <h2 className="text-sm sm:text-base font-black text-slate-900 tracking-tight leading-tight">
              Tài Liệu Của Tôi
            </h2>
            <span className="text-[10px] text-slate-500 font-medium">
              {outlines.length} đề cương
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            soundManager.playClick();
            onOpenUpload();
          }}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1 shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Thêm đề</span>
        </button>
      </div>

      {/* Search and Subject filter bar */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên đề cương, môn học, lớp..."
            className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {subjects.length > 0 && (
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none shrink-0"
          >
            <option value="all">Tất cả môn ({outlines.length})</option>
            {subjects.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Grid of outlines */}
      {filteredOutlines.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-slate-800">Không tìm thấy tài liệu phù hợp</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Hãy thử tìm kiếm với từ khóa khác hoặc tải lên tệp đề cương Word mới.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOutlines.map((doc) => {
            return (
              <div
                key={doc.id}
                className="bg-white p-3 sm:p-3.5 rounded-2xl border-2 border-slate-200 hover:border-blue-500 shadow-xs hover:shadow-md flex flex-col justify-between transition-all"
              >
                <div>
                  {/* Tên môn và Lớp */}
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-xs font-black text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
                      {doc.subject}
                    </span>
                    <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {doc.grade}
                    </span>
                  </div>

                  {/* Tên đề cương to rõ, đã xóa toàn bộ chữ nhỏ, chủ đề và ngày tải lên */}
                  <h3
                    className="font-black text-slate-900 text-xs sm:text-sm leading-snug line-clamp-2 my-2 cursor-pointer hover:text-blue-600 transition-colors"
                    title={doc.title}
                    onClick={() => {
                      soundManager.playClick();
                      onSelectOutlineToPractice(doc);
                    }}
                  >
                    {doc.title}
                  </h3>
                </div>

                {/* Nút Button nằm gọn gàng bên trong khung của đề cương */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5">
                  <button
                    onClick={() => {
                      soundManager.playClick();
                      onSelectOutlineToPractice(doc);
                    }}
                    className="flex-1 py-1.5 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-black shadow-xs transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                  >
                    <span>Ôn ngay</span>
                    <ArrowRight className="w-3 h-3 stroke-[2.5]" />
                  </button>

                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      onClick={() => handleOpenEdit(doc)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                      title="Sửa"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onOpenShare(doc)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                      title="Chia sẻ"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(doc.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Xóa"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-base text-slate-900">Xóa Tài Liệu Này?</h4>
              <p className="text-xs text-slate-500">
                Tài liệu và danh sách câu hỏi đã lưu sẽ bị xóa khỏi bộ nhớ thiết bị.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Hủy
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-5 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Metadata Modal */}
      {editingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">Sửa Thông Tin Đề Cương</h3>
              <button
                onClick={() => setEditingDoc(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tên đề cương</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Môn học</label>
                <input
                  type="text"
                  value={editSubject}
                  onChange={(e) => setEditSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Khối / Lớp</label>
                <input
                  type="text"
                  value={editGrade}
                  onChange={(e) => setEditGrade(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingDoc(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs"
              >
                Lưu thông tin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

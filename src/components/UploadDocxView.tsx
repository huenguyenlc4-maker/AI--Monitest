import React, { useState, useRef } from 'react';
import { DocumentOutline, Question, QuestionType } from '../types';
import { parseDocumentFile, parseRawTextContent, SAMPLE_DOCUMENTS, ParseResult } from '../utils/docxParser';
import { soundManager } from '../utils/audio';
import { unlockBadge } from '../utils/storage';
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  FileCheck,
  RefreshCw,
  X,
  BookOpen,
  Copy,
  Check,
  HelpCircle,
  Edit3,
  FileCode,
} from 'lucide-react';

interface UploadDocxViewProps {
  onDocumentExtracted: (result: ParseResult) => void;
  onCancel: () => void;
}

const SAMPLE_TEMPLATE_TEXT = `TRƯỜNG THPT CHUYÊN - ĐỀ CƯƠNG ÔN TẬP GDPT 2018
MÔN: KHOA HỌC TỰ NHIÊN - KHỐI: LỚP 10

PHẦN I. CÂU TRẮC NGHIỆM NHIỀU PHƯƠNG ÁN LỰA CHỌN (4 LỰA CHỌN)
Câu 1: Dấu hiệu nào sau đây chứng tỏ có phản ứng hóa học xảy ra?
A. Có chất mới tạo thành có tính chất khác chất ban đầu.
B. Chất thay đổi trạng thái từ rắn sang lỏng do nhiệt độ.
C. Chất bị bẻ gãy vụn thành các mảnh nhỏ kích thước li ti.
D. Chất bị hòa tan vào trong nước tạo thành dung dịch trong suốt.
Đáp án: A

Câu 2: Đơn vị đo cường độ dòng điện trong hệ SI là gì?
*A. Ampe (A)
B. Vôn (V)
C. Oát (W)
D. Jun (J)

PHẦN II. CÂU TRẮC NGHIỆM ĐÚNG SAI (MỖI CÂU 4 MỆNH ĐỀ a, b, c, d)
Câu 3: Xét tính Đúng/Sai của các nhận định về Mol và chất khí ở điều kiện chuẩn:
a) Một mol chất chứa xấp xỉ 6,022 x 10²³ hạt nguyên tử hoặc phân tử. (Đúng)
b) Ở điều kiện chuẩn (25°C, 1 bar), 1 mol khí bất kỳ đều chiếm thể tích 24,79 lít. (Đúng)
c) Khí Oxygen (O2) nhẹ hơn không khí vì có khối lượng mol là 16 g/mol. (Sai)
d) Tỉ khối của chất khí A đối với khí B tính bằng d(A/B) = M(A) / M(B). (Đúng)

PHẦN III. CÂU TRẮC NGHIỆM TRẢ LỜI NGẮN (ĐIỀN SỐ HOẶC TỪ KHÓA)
Câu 4: Hòa tan 20 gam muối ăn vào 80 gam nước. Nồng độ phần trăm (C%) của dung dịch thu được là bao nhiêu %?
Đáp số: 20

Câu 5: Rewrite in passive voice: "Scientists have invented solar panels." -> "Solar panels have ______ invented by scientists."
Đáp án: been
`;

export const UploadDocxView: React.FC<UploadDocxViewProps> = ({
  onDocumentExtracted,
  onCancel,
}) => {
  const [uploadMode, setUploadMode] = useState<'file' | 'text'>('file');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [rawTextInput, setRawTextInput] = useState('');
  const [textTitle, setTextTitle] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [extractedPreview, setExtractedPreview] = useState<ParseResult | null>(null);
  const [previewTab, setPreviewTab] = useState<'all' | 'multiple_choice' | 'true_false' | 'short_answer'>('all');
  const [showFormatGuide, setShowFormatGuide] = useState(false);
  const [copiedTemplate, setCopiedTemplate] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (file: File) => {
    setErrorMessage('');
    const extension = file.name.split('.').pop()?.toLowerCase();
    const allowed = ['docx', 'doc', 'pdf', 'txt'];

    if (!allowed.includes(extension || '')) {
      setErrorMessage(
        'Hệ thống hỗ trợ tệp Word (.docx, .doc), tài liệu PDF (.pdf) hoặc tệp văn bản (.txt).'
      );
      soundManager.playAlert();
      return;
    }

    soundManager.playClick();
    setSelectedFile(file);
    setExtractedPreview(null);
  };

  // Process File upload
  const handleProcessFile = async () => {
    if (!selectedFile) return;

    soundManager.playClick();
    setIsProcessing(true);
    setProgress(20);
    setErrorMessage('');

    try {
      const p1 = setTimeout(() => setProgress(55), 250);
      const p2 = setTimeout(() => setProgress(85), 500);

      const result = await parseDocumentFile(selectedFile);

      clearTimeout(p1);
      clearTimeout(p2);
      setProgress(100);

      setTimeout(() => {
        setIsProcessing(false);
        soundManager.playUploadSuccess();
        setExtractedPreview(result);
        unlockBadge('curiosity');
      }, 300);
    } catch (err: any) {
      setIsProcessing(false);
      setProgress(0);
      setErrorMessage(err.message || 'Có lỗi xảy ra trong quá trình đọc và phân tích tệp.');
      soundManager.playAlert();
    }
  };

  // Process Direct Text Paste
  const handleProcessRawText = () => {
    if (!rawTextInput.trim()) {
      setErrorMessage('Vui lòng dán nội dung văn bản đề cương vào ô bên dưới.');
      soundManager.playAlert();
      return;
    }

    soundManager.playClick();
    setIsProcessing(true);
    setProgress(30);
    setErrorMessage('');

    try {
      setProgress(80);
      const title = textTitle.trim() || 'Đề cương tự nhập';
      const result = parseRawTextContent(rawTextInput, title);
      setProgress(100);

      setTimeout(() => {
        setIsProcessing(false);
        soundManager.playUploadSuccess();
        setExtractedPreview(result);
        unlockBadge('curiosity');
      }, 250);
    } catch (err: any) {
      setIsProcessing(false);
      setProgress(0);
      setErrorMessage(err.message || 'Không thể nhận diện câu hỏi từ đoạn văn bản đã dán.');
      soundManager.playAlert();
    }
  };

  const handleSelectSample = (sample: DocumentOutline) => {
    soundManager.playUploadSuccess();
    const typeACount = sample.questions.filter((q) => q.type === 'multiple_choice').length;
    const typeBCount = sample.questions.filter((q) => q.type === 'true_false').length;
    const typeCCount = sample.questions.filter((q) => q.type === 'short_answer').length;
    const verifiedCount = sample.questions.filter((q) => q.isVerified).length;
    const needsReviewCount = sample.questions.filter((q) => q.needsReview).length;

    const mockResult: ParseResult = {
      outline: {
        ...sample,
        id: `sample_${Date.now()}`,
        uploadDate: new Date().toLocaleDateString('vi-VN'),
      },
      summary: {
        total: sample.questions.length,
        typeACount,
        typeBCount,
        typeCCount,
        verifiedCount,
        needsReviewCount,
      },
    };
    setExtractedPreview(mockResult);
  };

  const handleReset = () => {
    soundManager.playClick();
    setSelectedFile(null);
    setExtractedPreview(null);
    setProgress(0);
    setErrorMessage('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCopyTemplate = () => {
    navigator.clipboard.writeText(SAMPLE_TEMPLATE_TEXT);
    setCopiedTemplate(true);
    soundManager.playClick();
    setTimeout(() => setCopiedTemplate(false), 2000);
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto select-none">
      {/* Top Header with Prominent Home Button */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Tải & Nhận Diện Đề Cương (Word / PDF)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tự động nhận dạng bắt đầu/kết thúc câu hỏi, 3 dạng chuẩn GDPT 2018 & bảng đáp án
          </p>
        </div>

        <button
          onClick={() => {
            soundManager.playClick();
            onCancel();
          }}
          className="flex items-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-black text-xs sm:text-sm shadow-md hover:shadow-lg active:scale-95 transition-all cursor-pointer border border-blue-400/40 ring-2 ring-blue-300/50 shrink-0"
          title="Quay lại trang chủ"
        >
          <ArrowLeft className="w-4 h-4 stroke-[3]" />
          <span>VỀ TRANG CHỦ</span>
        </button>
      </div>

      {/* Guide Trigger Button */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50/70 to-blue-50 border-2 border-blue-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-black text-blue-950">
              Hướng dẫn định dạng tài liệu để app nhận diện 100% đúng
            </h4>
            <p className="text-[11px] text-blue-800 font-medium">
              Cách viết câu hỏi trắc nghiệm, đúng/sai, trả lời ngắn và bảng đáp án chuẩn
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowFormatGuide(!showFormatGuide)}
          className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-blue-100/60 border border-blue-300 text-blue-700 font-black text-xs shadow-2xs flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>{showFormatGuide ? 'Đóng hướng dẫn' : 'Xem quy tắc nhận diện'}</span>
        </button>
      </div>

      {/* Expandable Format Guide Details */}
      {showFormatGuide && (
        <div className="p-4 sm:p-5 rounded-3xl bg-white border-2 border-blue-300 shadow-md space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2 text-blue-900 font-black text-sm">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Quy tắc nhận dạng câu hỏi & đáp án trong tài liệu Word/PDF:</span>
            </div>
            <button
              onClick={handleCopyTemplate}
              className="px-3 py-1 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center gap-1.5 transition-colors border border-blue-200"
            >
              {copiedTemplate ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedTemplate ? 'Đã sao chép mẫu!' : 'Sao chép mẫu đề chuẩn'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-1.5">
              <div className="font-black text-blue-900 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">1</span>
                <span>Dạng A: 4 Lựa Chọn</span>
              </div>
              <p className="text-slate-600">
                - Bắt đầu câu: <code className="bg-white px-1 py-0.5 rounded text-blue-800 font-bold">Câu 1:</code> hoặc <code className="bg-white px-1 py-0.5 rounded text-blue-800 font-bold">Bài 1:</code><br />
                - Phương án: Viết rõ <code className="font-bold text-slate-800">A.</code>, <code className="font-bold text-slate-800">B.</code>, <code className="font-bold text-slate-800">C.</code>, <code className="font-bold text-slate-800">D.</code><br />
                - Nhận diện đáp án: Thêm dấu sao trước đáp án đúng (ví dụ <code className="text-emerald-700 font-bold">*A.</code>), hoặc ghi <code className="text-emerald-700 font-bold">Đáp án: A</code> ở cuối câu, hoặc để trong bảng đáp án.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-1.5">
              <div className="font-black text-purple-900 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px]">2</span>
                <span>Dạng B: Đúng / Sai</span>
              </div>
              <p className="text-slate-600">
                - Mỗi câu gồm 4 mệnh đề bắt đầu bằng: <code className="font-bold text-purple-800">a)</code>, <code className="font-bold text-purple-800">b)</code>, <code className="font-bold text-purple-800">c)</code>, <code className="font-bold text-purple-800">d)</code><br />
                - Ghi rõ tính đúng/sai ở cuối mỗi mệnh đề: <code className="text-emerald-700 font-bold">(Đúng)</code> hoặc <code className="text-rose-700 font-bold">(Sai)</code>, hoặc <code className="font-bold">[Đ]</code>, <code className="font-bold">[S]</code>.<br />
                - Hoặc ghi ở cuối câu: <code className="font-bold text-purple-900">Đáp án: a-Đ, b-S, c-Đ, d-S</code>.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1.5">
              <div className="font-black text-amber-900 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px]">3</span>
                <span>Dạng C: Trả Lời Ngắn</span>
              </div>
              <p className="text-slate-600">
                - Câu hỏi tự luận ngắn, tính toán hoặc điền từ.<br />
                - Ghi đáp số mẫu ở cuối câu: <code className="font-bold text-amber-900">Đáp số: 20</code> hoặc <code className="font-bold text-amber-900">Đáp án: been</code>.<br />
                - Hoặc để trong <code className="font-bold text-amber-900">BẢNG ĐÁP ÁN: Câu 4: 20</code> ở cuối tài liệu.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Upload Box if not previewing */}
      {!extractedPreview && (
        <div className="space-y-4">
          {/* Method Selector Tabs: Upload File vs Direct Paste */}
          <div className="flex border-b border-slate-200 gap-2">
            <button
              onClick={() => {
                soundManager.playClick();
                setUploadMode('file');
              }}
              className={`pb-2.5 px-4 font-black text-xs sm:text-sm border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                uploadMode === 'file'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Tải file lên (Word .docx / .doc, PDF .pdf)</span>
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                setUploadMode('text');
              }}
              className={`pb-2.5 px-4 font-black text-xs sm:text-sm border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                uploadMode === 'text'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <FileCode className="w-4 h-4" />
              <span>Dán văn bản trực tiếp (Copy - Paste)</span>
            </button>
          </div>

          {/* Mode 1: File Dropzone */}
          {uploadMode === 'file' && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-blue-500 bg-blue-50/60 scale-[1.01]'
                  : selectedFile
                  ? 'border-emerald-400 bg-emerald-50/40'
                  : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50/80 bg-white'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".docx,.doc,.pdf,.txt"
                onChange={handleFileInputChange}
                className="hidden"
              />

              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 shadow-xs">
                <Upload className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <div className="text-base font-bold text-slate-800">
                  {selectedFile ? selectedFile.name : 'Kéo thả tệp Word (.docx, .doc) hoặc PDF (.pdf) vào đây'}
                </div>
                <div className="text-xs text-slate-400">
                  {selectedFile
                    ? `Dung lượng: ${(selectedFile.size / 1024).toFixed(1)} KB`
                    : 'Hỗ trợ tệp Word (.docx, .doc), tài liệu PDF (.pdf), dung lượng tối đa 25MB'}
                </div>
              </div>
            </div>
          )}

          {/* Mode 2: Direct Text Paste */}
          {uploadMode === 'text' && (
            <div className="bg-white p-5 rounded-3xl border-2 border-slate-200 space-y-3">
              <div>
                <label className="block text-xs font-black text-slate-800 mb-1">
                  Tiêu đề đề cương / bài học:
                </label>
                <input
                  type="text"
                  value={textTitle}
                  onChange={(e) => setTextTitle(e.target.value)}
                  placeholder="Ví dụ: Đề cương ôn tập Toán 10 - Giữa học kỳ 1"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:outline-none text-xs font-bold"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-black text-slate-800">
                    Nội dung văn bản đề cương:
                  </label>
                  <button
                    onClick={() => {
                      setRawTextInput(SAMPLE_TEMPLATE_TEXT);
                      setTextTitle('Đề cương mẫu GDPT 2018');
                    }}
                    className="text-[11px] font-bold text-blue-600 hover:underline"
                  >
                    Dán mẫu thử nghiệm
                  </button>
                </div>
                <textarea
                  rows={8}
                  value={rawTextInput}
                  onChange={(e) => setRawTextInput(e.target.value)}
                  placeholder="Dán toàn bộ nội dung đề thi hoặc đề cương của thầy cô vào đây..."
                  className="w-full p-3.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:outline-none text-xs font-mono leading-relaxed"
                />
              </div>

              <button
                onClick={handleProcessRawText}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                <span>Nhận diện câu hỏi từ văn bản này</span>
              </button>
            </div>
          )}

          {/* Error notice */}
          {errorMessage && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Progress bar during processing */}
          {isProcessing && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
                  Đang bóc tách câu hỏi, mệnh đề Đúng/Sai và đáp án...
                </span>
                <span className="tabular-nums text-blue-600 font-bold">{progress}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Actions when file is selected */}
          {uploadMode === 'file' && selectedFile && !isProcessing && (
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <FileText className="w-4 h-4 text-blue-500" />
                <span className="font-semibold">{selectedFile.name}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleReset}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Chọn tệp khác
                </button>
                <button
                  onClick={handleProcessFile}
                  className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Phân tích tài liệu ngay</span>
                </button>
              </div>
            </div>
          )}

          {/* Quick-try with pre-loaded official curriculum samples */}
          <div className="pt-4 border-t border-slate-200">
            <div className="text-xs font-bold text-slate-500 mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Hoặc thử nghiệm nhanh với đề cương mẫu GDPT 2018 có sẵn:</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {SAMPLE_DOCUMENTS.map((sample) => (
                <div
                  key={sample.id}
                  onClick={() => handleSelectSample(sample)}
                  className="p-3.5 bg-white hover:bg-blue-50/50 rounded-2xl border border-slate-200 hover:border-blue-300 cursor-pointer transition-all space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-blue-600">{sample.subject}</span>
                    <span className="text-slate-400 text-[11px]">{sample.grade}</span>
                  </div>
                  <div className="font-semibold text-xs text-slate-800 line-clamp-1">{sample.title}</div>
                  <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
                    <span>{sample.questions.length} câu hỏi</span>
                    <span className="text-blue-600 font-semibold flex items-center gap-0.5">
                      Chọn <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Extracted Preview Summary */}
      {extractedPreview && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                    <FileCheck className="w-5 h-5" />
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">
                    {extractedPreview.outline.title}
                  </h3>
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-2">
                  <span>Môn: <strong>{extractedPreview.outline.subject}</strong></span>
                  <span>·</span>
                  <span>Khối: <strong>{extractedPreview.outline.grade}</strong></span>
                  {extractedPreview.outline.school && (
                    <>
                      <span>·</span>
                      <span>Trường: <strong>{extractedPreview.outline.school}</strong></span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleReset}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Tải tệp khác
                </button>
                <button
                  onClick={() => {
                    soundManager.playCorrect();
                    onDocumentExtracted(extractedPreview);
                  }}
                  className="px-5 py-2.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <span>Lưu & Bắt đầu ôn tập ({extractedPreview.summary.total} câu)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Classification breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                <div className="text-xs text-slate-500">Tổng số câu hỏi</div>
                <div className="text-xl font-bold text-slate-900 tabular-nums">
                  {extractedPreview.summary.total}
                </div>
                <div className="text-[11px] text-slate-400">Đã nhận diện</div>
              </div>

              <div className="bg-blue-50/50 p-3.5 rounded-2xl border border-blue-200/80">
                <div className="text-xs text-blue-600">Dạng A (Trắc nghiệm)</div>
                <div className="text-xl font-bold text-blue-700 tabular-nums">
                  {extractedPreview.summary.typeACount}
                </div>
                <div className="text-[11px] text-blue-500">4 lựa chọn</div>
              </div>

              <div className="bg-purple-50/50 p-3.5 rounded-2xl border border-purple-200/80">
                <div className="text-xs text-purple-600">Dạng B (Đúng / Sai)</div>
                <div className="text-xl font-bold text-purple-700 tabular-nums">
                  {extractedPreview.summary.typeBCount}
                </div>
                <div className="text-[11px] text-purple-500">GDPT 2018</div>
              </div>

              <div className="bg-amber-50/50 p-3.5 rounded-2xl border border-amber-200/80">
                <div className="text-xs text-amber-600">Dạng C (Trả lời ngắn)</div>
                <div className="text-xl font-bold text-amber-700 tabular-nums">
                  {extractedPreview.summary.typeCCount}
                </div>
                <div className="text-[11px] text-amber-500">Nhập đáp số / từ</div>
              </div>
            </div>

            {/* Answer verification status */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>
                  Đã xác định đáp án: <strong>{extractedPreview.summary.verifiedCount} câu</strong>
                </span>
              </div>
              {extractedPreview.summary.needsReviewCount > 0 ? (
                <div className="flex items-center gap-1.5 text-amber-700 font-medium">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  <span>Cần rà soát: {extractedPreview.summary.needsReviewCount} câu</span>
                </div>
              ) : (
                <span className="text-emerald-700 font-semibold">100% câu hỏi đã có căn cứ đáp án</span>
              )}
            </div>

            {/* Filter Tabs by Question Type */}
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Chi tiết câu hỏi nhận diện theo từng dạng:
                </h4>
                <span className="text-[11px] text-slate-400">
                  Hiển thị đúng dạng bài trong app
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'all', label: `Tất cả (${extractedPreview.summary.total})` },
                  { id: 'multiple_choice', label: `Dạng A: 4 Lựa chọn (${extractedPreview.summary.typeACount})` },
                  { id: 'true_false', label: `Dạng B: Đúng / Sai (${extractedPreview.summary.typeBCount})` },
                  { id: 'short_answer', label: `Dạng C: Trả lời ngắn (${extractedPreview.summary.typeCCount})` },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      soundManager.playClick();
                      setPreviewTab(tab.id as any);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      previewTab === tab.id
                        ? 'bg-blue-600 text-white shadow-xs scale-[1.02]'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Question list for preview */}
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {extractedPreview.outline.questions
                  .filter((q) => (previewTab === 'all' ? true : q.type === previewTab))
                  .map((q, idx) => (
                    <div
                      key={q.id || idx}
                      className="p-3.5 sm:p-4 rounded-2xl border-2 border-slate-200 bg-white hover:border-slate-300 transition-all space-y-2.5 shadow-xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-xs text-slate-900 bg-slate-100 px-2 py-0.5 rounded-lg">
                            {q.code || `Câu ${idx + 1}`}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              q.type === 'multiple_choice'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : q.type === 'true_false'
                                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {q.type === 'multiple_choice'
                              ? 'Dạng A: 4 lựa chọn'
                              : q.type === 'true_false'
                              ? 'Dạng B: Đúng / Sai'
                              : 'Dạng C: Trả lời ngắn'}
                          </span>
                        </div>

                        {q.isVerified ? (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Đã có đáp án
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Cần rà soát
                          </span>
                        )}
                      </div>

                      {/* Content */}
                      <p className="text-xs sm:text-sm font-semibold text-slate-900 leading-relaxed">
                        {q.content}
                      </p>

                      {/* Dạng A Preview: 4 Options */}
                      {q.type === 'multiple_choice' && q.options && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                          {q.options.map((opt) => {
                            const isCorrect = q.correctAnswer === opt.key;
                            return (
                              <div
                                key={opt.key}
                                className={`p-2 rounded-xl border text-xs flex items-center gap-2 ${
                                  isCorrect
                                    ? 'bg-emerald-50/80 border-emerald-400 font-bold text-emerald-900'
                                    : 'bg-slate-50 border-slate-200 text-slate-700'
                                }`}
                              >
                                <span
                                  className={`w-5 h-5 rounded-md flex items-center justify-center font-black text-[11px] shrink-0 ${
                                    isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                                  }`}
                                >
                                  {opt.key}
                                </span>
                                <span className="truncate flex-1">{opt.text}</span>
                                {isCorrect && (
                                  <span className="text-[10px] font-bold text-emerald-600 shrink-0">
                                    ✓ Đáp án
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Dạng B Preview: True/False statements */}
                      {q.type === 'true_false' && q.statements && (
                        <div className="space-y-1.5 pt-1">
                          {q.statements.map((st, sIdx) => {
                            const letter = ['a', 'b', 'c', 'd'][sIdx] || `${sIdx + 1}`;
                            return (
                              <div
                                key={st.id || sIdx}
                                className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between gap-2"
                              >
                                <div className="text-slate-800 flex-1">
                                  <strong className="text-purple-700 mr-1.5">{letter})</strong>
                                  {st.statement}
                                </div>
                                <div className="shrink-0">
                                  {st.correctAnswer === true ? (
                                    <span className="px-2.5 py-0.5 rounded-lg bg-emerald-600 text-white font-black text-[11px] shadow-2xs">
                                      ✓ Đúng
                                    </span>
                                  ) : st.correctAnswer === false ? (
                                    <span className="px-2.5 py-0.5 rounded-lg bg-rose-600 text-white font-black text-[11px] shadow-2xs">
                                      ✗ Sai
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-lg bg-slate-200 text-slate-600 font-bold text-[10px]">
                                      Chưa gán
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Dạng C Preview: Short answer */}
                      {q.type === 'short_answer' && (
                        <div className="p-2 rounded-xl bg-amber-50/70 border border-amber-200 text-xs flex items-center justify-between gap-2">
                          <span className="text-amber-900 font-semibold">
                            Đáp số / Từ khóa chuẩn:
                          </span>
                          <span className="font-black text-amber-800 bg-white px-3 py-1 rounded-lg border border-amber-300">
                            {q.correctAnswer || '(Chưa có đáp án mẫu)'}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

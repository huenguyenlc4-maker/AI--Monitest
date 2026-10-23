import mammoth from 'mammoth';
import { DocumentOutline, Question, QuestionType, RevisionCategory, TrueFalseStatement } from '../types';
import { extractTextFromPdf } from './pdfParser';
import { solveQuestionWithCurriculumEngine } from './curriculumSolver';

export interface ParseResult {
  outline: DocumentOutline;
  summary: {
    total: number;
    typeACount: number;
    typeBCount: number;
    typeCCount: number;
    verifiedCount: number;
    needsReviewCount: number;
  };
}

/**
 * Deep Subject & Grade Lexical Scorer
 * Analyzes the entire document and question text to accurately classify subject & grade
 */
export function extractMetadata(text: string, fileName: string) {
  let subject = 'Chưa xác định';
  let grade = 'Chưa xác định';
  let school = '';
  let semester = '';
  let topic = '';
  let category: RevisionCategory = 'regular';

  const cleanTextUpper = text.toUpperCase();
  const cleanFileNameUpper = fileName.toUpperCase();
  const lowerText = text.toLowerCase();

  // 1. Direct explicit title/header checks
  if (cleanTextUpper.includes('KHOA HỌC TỰ NHIÊN') || cleanTextUpper.includes('KHTN')) {
    subject = 'Khoa học tự nhiên';
  } else if (cleanTextUpper.includes('GIÁO DỤC KINH TẾ VÀ PHÁP LUẬT') || cleanTextUpper.includes('GDKT & PL') || cleanTextUpper.includes('GDKT&PL')) {
    subject = 'Giáo dục kinh tế và pháp luật';
  } else if (cleanTextUpper.includes('LỊCH SỬ VÀ ĐỊA LÍ') || (cleanTextUpper.includes('LỊCH SỬ') && cleanTextUpper.includes('ĐỊA LÍ'))) {
    subject = 'Lịch sử và Địa lí';
  } else if (cleanTextUpper.includes('TIẾNG ANH') || cleanTextUpper.includes('ENGLISH')) {
    subject = 'Tiếng Anh';
  } else if (cleanTextUpper.includes('NGỮ VĂN') || cleanTextUpper.includes('VĂN HỌC')) {
    subject = 'Ngữ văn';
  } else if (cleanTextUpper.includes('TIN HỌC') || cleanTextUpper.includes('TIN HOC')) {
    subject = 'Tin học';
  } else if (cleanTextUpper.includes('VẬT LÍ') || cleanTextUpper.includes('VẬT LÝ')) {
    subject = 'Vật lí';
  } else if (cleanTextUpper.includes('HÓA HỌC') || cleanTextUpper.includes('HOÁ HỌC')) {
    subject = 'Hóa học';
  } else if (cleanTextUpper.includes('SINH HỌC')) {
    subject = 'Sinh học';
  } else if (cleanTextUpper.includes('LỊCH SỬ')) {
    subject = 'Lịch sử';
  } else if (cleanTextUpper.includes('ĐỊA LÍ') || cleanTextUpper.includes('ĐỊA LÝ')) {
    subject = 'Địa lí';
  } else if (cleanTextUpper.includes('TOÁN') || cleanTextUpper.includes('TOAN HOC')) {
    subject = 'Toán học';
  } else if (cleanTextUpper.includes('GIÁO DỤC CÔNG DÂN') || cleanTextUpper.includes('GDCD')) {
    subject = 'Giáo dục công dân';
  }

  // 2. Deep Lexical Content Scoring if subject is still undetermined or needs verification
  const subjectScores: Record<string, number> = {
    'Toán học': 0,
    'Vật lí': 0,
    'Hóa học': 0,
    'Sinh học': 0,
    'Lịch sử': 0,
    'Địa lí': 0,
    'Tiếng Anh': 0,
    'Tin học': 0,
    'Ngữ văn': 0,
    'Giáo dục kinh tế và pháp luật': 0,
  };

  const lexicons: Record<string, string[]> = {
    'Toán học': [
      'đạo hàm', 'tích phân', 'hàm số', 'bất phương trình', 'phương trình', 'nghiệm', 'đồ thị',
      'tam giác', 'hình nón', 'hình trụ', 'hình chóp', 'mặt phẳng', 'tọa độ', 'vectơ', 'vector',
      'logarit', 'sin(', 'cos(', 'tan(', 'xác suất', 'biến cố', 'cấp số cộng', 'cấp số nhân',
      'số phức', 'ma trận', 'tiệm cận', 'cực trị', 'tập xác định', 'đồng biến', 'nghịch biến'
    ],
    'Vật lí': [
      'vận tốc', 'gia tốc', 'động năng', 'thế năng', 'cơ năng', 'dao động điều hòa', 'con lắc',
      'tần số', 'chu kì', 'sóng cơ', 'sóng điện từ', 'cường độ dòng điện', 'hiệu điện thế',
      'điện trở', 'đoạn mạch', 'thấu kính', 'tiêu cự', 'khúc xạ', 'phản xạ', 'công suất',
      'từ trường', 'cảm ứng từ', 'suất điện động', 'vôn kế', 'ampe kế', 'lực ma sát'
    ],
    'Hóa học': [
      'phản ứng hóa học', 'este', 'ancol', 'axit', 'bazơ', 'muối', 'mol', 'khối lượng mol',
      'dung dịch', 'kết tủa', 'khí bay lên', 'hóa trị', 'đồng phân', 'polime', 'amino axit',
      'kim loại', 'phi kim', 'fe', 'cu', 'al', 'na', 'h2so4', 'hcl', 'naoh', 'oxit',
      'bảo toàn khối lượng', 'bảo toàn electron', 'điện phân', 'thủy phân'
    ],
    'Sinh học': [
      'adn', 'arn', 'gen', 'đột biến', 'nhiễm sắc thể', 'nst', 'kiểu gen', 'kiểu hình',
      'alen', 'men-đen', 'lai', 'quang hợp', 'hô hấp tế bào', 'ti thể', 'lục lạp',
      'chuỗi thức ăn', 'lưới thức ăn', 'hệ sinh thái', 'chọn lọc tự nhiên', 'tiến hóa',
      'tuần hoàn máu', 'tế bào', 'nguyên phân', 'giảm phân', 'thụ tinh'
    ],
    'Lịch sử': [
      'cách mạng tháng tám', 'chiến dịch', 'hiệp định', 'thực dân pháp', 'đế quốc mỹ',
      'phong kiến', 'triều đại', 'đảng cộng sản', 'năm 1945', 'năm 1954', 'năm 1975',
      'liên xô', 'chiến tranh thế giới', 'kháng chiến', 'mặt trận việt minh', 'nguyễn ái quốc',
      'chủ nghĩa tư bản', 'chủ nghĩa xã hội', 'tổng tiến công'
    ],
    'Địa lí': [
      'khí hậu', 'nhiệt đới gió mùa', 'địa hình', 'đồng bằng sông hồng', 'đồng bằng sông cửu long',
      'thềm lục địa', 'biển đông', 'thổ nhưỡng', 'khoáng sản', 'thủy điện', 'dân số',
      'đô thị hóa', 'cơ cấu kinh tế', 'xuất nhập khẩu', 'biểu đồ cột', 'biểu đồ tròn',
      'tây nguyên', 'trung du miền núi', 'vùng kinh tế'
    ],
    'Tiếng Anh': [
      'choose the', 'pronunciation', 'closest in meaning', 'opposite in meaning', 'mark the letter',
      'read the passage', 'which of the following', 'vocabulary', 'sentence', 'grammar',
      'clause', 'adjective', 'verb', 'adverb', 'noun', 'preposition', 'passive voice'
    ],
    'Tin học': [
      'lập trình', 'python', 'pascal', 'thuật toán', 'mảng', 'biến', 'kiểu dữ liệu',
      'vòng lặp', 'hàm', 'cơ sở dữ liệu', 'sql', 'bảng tính', 'excel', 'mạng máy tính',
      'internet', 'phần cứng', 'phần mềm', 'mã nhị phân', 'bảo mật'
    ],
    'Ngữ văn': [
      'tác giả', 'tác phẩm', 'bài thơ', 'đoạn trích', 'truyện ngắn', 'biện pháp tu từ',
      'so sánh', 'nhân hóa', 'ẩn dụ', 'hoán dụ', 'hình tượng', 'nghị luận xã hội',
      'nghị luận văn học', 'thể thơ', 'lục bát', 'tự do', 'cảm xúc', 'nhân vật'
    ],
    'Giáo dục kinh tế và pháp luật': [
      'pháp luật', 'hiến pháp', 'vi phạm pháp luật', 'trách nhiệm pháp lý', 'quyền công dân',
      'nghĩa vụ', 'thị trường', 'cung cầu', 'lạm phát', 'thất nghiệp', 'hợp đồng lao động',
      'kinh doanh', 'thuế', 'ngân sách', 'ngân hàng', 'bảo hiểm'
    ],
  };

  // Score tokens
  for (const [subjName, terms] of Object.entries(lexicons)) {
    for (const term of terms) {
      if (lowerText.includes(term)) {
        subjectScores[subjName] += 1;
      }
    }
  }

  // Find subject with highest lexical score
  let maxSubj = '';
  let maxScore = 0;
  for (const [subjName, score] of Object.entries(subjectScores)) {
    if (score > maxScore) {
      maxScore = score;
      maxSubj = subjName;
    }
  }

  if (subject === 'Chưa xác định' && maxScore >= 2) {
    subject = maxSubj;
  }

  // 3. Category matching
  if (
    cleanTextUpper.includes('TỐT NGHIỆP') ||
    cleanTextUpper.includes('TUYỂN SINH') ||
    cleanTextUpper.includes('VÀO 10') ||
    cleanFileNameUpper.includes('TOT_NGHIEP') ||
    cleanFileNameUpper.includes('VAO_10')
  ) {
    category = 'graduation';
  } else if (
    cleanTextUpper.includes('CUỐI KỲ') ||
    cleanTextUpper.includes('CUOI KY') ||
    cleanTextUpper.includes('HỌC KỲ I') ||
    cleanTextUpper.includes('HỌC KỲ II') ||
    cleanTextUpper.includes('HK1') ||
    cleanTextUpper.includes('HK2')
  ) {
    category = 'final';
  } else if (
    cleanTextUpper.includes('GIỮA KỲ') ||
    cleanTextUpper.includes('GIUA KY') ||
    cleanTextUpper.includes('GHK1') ||
    cleanTextUpper.includes('GHK2')
  ) {
    category = 'midterm';
  } else {
    category = 'regular';
  }

  // 4. Grade matching
  const gradeMatch = text.match(/(?:LỚP|KHỐI|KHOÁ)\s*([0-9]{1,2})/i);
  if (gradeMatch) {
    grade = `Lớp ${gradeMatch[1]}`;
  } else {
    const fileGradeMatch = fileName.match(/(?:l[oớ]p|k)[_\s-]*([0-9]{1,2})/i);
    if (fileGradeMatch) {
      grade = `Lớp ${fileGradeMatch[1]}`;
    } else {
      // Heuristic deduction from curriculum topics
      if (lowerText.includes('este') || lowerText.includes('dao động điều hòa') || lowerText.includes('tích phân')) {
        grade = 'Lớp 12';
      } else if (lowerText.includes('đạo hàm') || lowerText.includes('quang hợp ở thực vật') || lowerText.includes('dòng điện không đổi')) {
        grade = 'Lớp 11';
      } else if (lowerText.includes('chuyển động thẳng biến đổi đều') || lowerText.includes('nguyên tử') || lowerText.includes('sinh học tế bào')) {
        grade = 'Lớp 10';
      } else if (lowerText.includes('phản ứng hóa học') && lowerText.includes('mol')) {
        grade = 'Lớp 8';
        if (subject === 'Hóa học') subject = 'Khoa học tự nhiên';
      }
    }
  }

  // If grade is 6-9 and subject is Lý/Hóa/Sinh, GDPT 2018 groups into Khoa học tự nhiên
  const gradeNum = parseInt(grade.replace(/\D/g, ''), 10);
  if (gradeNum >= 6 && gradeNum <= 9) {
    if (subject === 'Vật lí' || subject === 'Hóa học' || subject === 'Sinh học') {
      subject = 'Khoa học tự nhiên';
    } else if (subject === 'Lịch sử' || subject === 'Địa lí') {
      subject = 'Lịch sử và Địa lí';
    }
  }

  // 5. Semester matching
  if (cleanTextUpper.includes('HỌC KỲ I') || cleanTextUpper.includes('HỌC KỲ 1') || cleanTextUpper.includes('HK1')) {
    semester = 'Học kỳ I';
  } else if (cleanTextUpper.includes('HỌC KỲ II') || cleanTextUpper.includes('HỌC KỲ 2') || cleanTextUpper.includes('HK2')) {
    semester = 'Học kỳ II';
  } else if (cleanTextUpper.includes('GIỮA KỲ')) {
    semester = 'Giữa học kỳ';
  }

  // 6. School matching
  const schoolMatch = text.match(/(?:TRƯỜNG|TRUONG)\s+(?:THCS|THPT|TIỂU HỌC|TIEU HOC)[^\n,\.]+/i);
  if (schoolMatch) {
    school = schoolMatch[0].trim();
  }

  // 7. Topic matching
  const topicMatch = text.match(/(?:CHỦ ĐỀ|CHU DE|CHƯƠNG|CHUONG|BÀI|BAI)\s*([0-9IVX]+)?[:\s-]+([^\n]+)/i);
  if (topicMatch) {
    topic = topicMatch[0].trim().slice(0, 80);
  }

  return { subject, grade, school, semester, topic, category };
}

/**
 * Universal Answer Key Extractor
 * Extracts answer keys placed at the end of the file in any format:
 * - List: 1.A, 1: A, Câu 1: A, 1-A, 1A
 * - Tables / Matrix: Row of questions followed by row of answers
 * - Compound True/False: Câu 1: a-Đ, b-S, c-Đ, d-S or 1: Đ-S-Đ-S
 * - Short Answer keys: PHẦN III: Câu 1: 15.2; Câu 2: 300
 */
export function parseSeparateAnswerKey(text: string): {
  singleAnswers: Map<number, string>;
  tfAnswers: Map<number, Record<string, boolean>>;
  shortAnswers: Map<number, string>;
} {
  const singleAnswers = new Map<number, string>();
  const tfAnswers = new Map<number, Record<string, boolean>>();
  const shortAnswers = new Map<number, string>();

  // Look for end-of-document answer key section
  const answerSectionRegex = /(?:ĐÁP ÁN|BẢNG ĐÁP ÁN|HƯỚNG DẪN CHẤM|PHẦN ĐÁP ÁN|ANSWER KEY|KEY|LỜI GIẢI VÀ ĐÁP ÁN|BẢNG CHỌN ĐÁP ÁN)[\s\S]*$/i;
  const answerKeySectionMatch = text.match(answerSectionRegex);
  const keyText = answerKeySectionMatch ? answerKeySectionMatch[0] : '';

  if (!keyText) {
    return { singleAnswers, tfAnswers, shortAnswers };
  }

  // 1. Parse Compound True/False keys first (e.g., "Câu 1: a-Đ, b-S, c-Đ, d-S" or "1: a-Đ, b-S...")
  const tfCompoundRegex = /(?:Câu\s*)?(\d+)\s*[:.\-=]\s*([a-d]\s*[:.\-=]?\s*[ĐDSđds][^;\n\r]*)/gi;
  let tfMatch;
  while ((tfMatch = tfCompoundRegex.exec(keyText)) !== null) {
    const qNum = parseInt(tfMatch[1], 10);
    const compoundStr = tfMatch[2].trim();
    if (!isNaN(qNum) && compoundStr) {
      const stmtMap: Record<string, boolean> = {};
      const subItemRegex = /([a-d])\s*[:.\-=]?\s*([ĐDSđds])/gi;
      let subMatch;
      while ((subMatch = subItemRegex.exec(compoundStr)) !== null) {
        const letter = subMatch[1].toLowerCase();
        const char = subMatch[2].toUpperCase();
        stmtMap[letter] = char === 'Đ' || char === 'D';
      }
      if (Object.keys(stmtMap).length > 0) {
        tfAnswers.set(qNum, stmtMap);
      }
    }
  }

  // Also support pattern: "Câu 1: Đ - S - Đ - S" or "1: Đ S Đ S"
  const tfSeqRegex = /(?:Câu\s*)?(\d+)\s*[:.\-=]\s*([ĐDSđds])\s*[\-\s,]\s*([ĐDSđds])\s*[\-\s,]\s*([ĐDSđds])\s*[\-\s,]\s*([ĐDSđds])/gi;
  let tfSeqMatch;
  while ((tfSeqMatch = tfSeqSeqMatch = tfSeqRegex.exec(keyText)) !== null) {
    const qNum = parseInt(tfSeqMatch[1], 10);
    if (!isNaN(qNum)) {
      tfAnswers.set(qNum, {
        a: tfSeqMatch[2].toUpperCase() === 'Đ' || tfSeqMatch[2].toUpperCase() === 'D',
        b: tfSeqMatch[3].toUpperCase() === 'Đ' || tfSeqMatch[3].toUpperCase() === 'D',
        c: tfSeqMatch[4].toUpperCase() === 'Đ' || tfSeqMatch[4].toUpperCase() === 'D',
        d: tfSeqMatch[5].toUpperCase() === 'Đ' || tfSeqMatch[5].toUpperCase() === 'D',
      });
    }
  }

  // 2. Parse Standard Multiple Choice items: "1.A", "1: A", "Câu 1: A", "1-A", "1A"
  const itemRegex = /(?:Câu\s*)?(\d+)\s*[:.\-=]?\s*([A-D])(?![A-Za-z0-9])/gi;
  let match;
  while ((match = itemRegex.exec(keyText)) !== null) {
    const qNum = parseInt(match[1], 10);
    const ans = match[2].toUpperCase();
    if (!isNaN(qNum) && ['A', 'B', 'C', 'D'].includes(ans)) {
      singleAnswers.set(qNum, ans);
    }
  }

  // 3. Parse Short Answer key section: e.g., "PHẦN III: Câu 1: 15,2 | Câu 2: 300" or "Câu 1: 15.5"
  const shortAnsRegex = /(?:Câu\s*)?(\d+)\s*[:.\-=]\s*(-?\d+(?:[.,]\d+)?|[a-zA-ZÀ-ỹ0-9\s]{1,30})(?=[\n\r;,]|$)/gi;
  let shortMatch;
  while ((shortMatch = shortAnsRegex.exec(keyText)) !== null) {
    const qNum = parseInt(shortMatch[1], 10);
    const ans = shortMatch[2].trim();
    if (!isNaN(qNum) && ans && !['A', 'B', 'C', 'D'].includes(ans.toUpperCase())) {
      shortAnswers.set(qNum, ans);
    }
  }

  return { singleAnswers, tfAnswers, shortAnswers };
}

/**
 * Ultra-robust Option Extractor
 * Finds positions of markers A, B, C, D even when:
 * - Arranged in 1 line: "A. 10m/s  B. 20m/s  C. 30m/s  D. 40m/s"
 * - In 2 columns: "A. 10   B. 20" and "C. 30   D. 40"
 * - Formatted as: A. / A) / A: / [A] / (A) / *A.
 * - Starred markers indicating correct answers: *A. or A.*
 */
export function extractMultipleChoiceOptions(
  rawText: string
): {
  prompt: string;
  options: { key: 'A' | 'B' | 'C' | 'D'; text: string }[];
  detectedAnswer?: 'A' | 'B' | 'C' | 'D';
} | null {
  // Normalize non-breaking spaces and tabs to regular spaces
  const text = rawText.replace(/\u00A0/g, ' ').replace(/\t/g, '  ');

  // Search for marker regexes
  const findMarker = (key: 'A' | 'B' | 'C' | 'D') => {
    // Look for markers preceded by start, newline, space, tab, semicolon, paren
    const regex = new RegExp(`(?:^|[\\r\\n\\s\\t;\\(])(\\*?\\[?${key}\\]?[\\.:\\)\\-])\\s*`, 'gi');
    let match;
    let bestMatch: { index: number; length: number; isStarred: boolean } | null = null;
    while ((match = regex.exec(text)) !== null) {
      const fullMatch = match[0];
      const matchedMarker = match[1];
      const markerStart = match.index + fullMatch.indexOf(matchedMarker);
      const isStarred = matchedMarker.includes('*') || matchedMarker.includes('[');
      bestMatch = { index: markerStart, length: matchedMarker.length, isStarred };
      break;
    }
    return bestMatch;
  };

  const markerA = findMarker('A');
  const markerB = findMarker('B');
  const markerC = findMarker('C');
  const markerD = findMarker('D');

  // We require at least A and B
  if (!markerA || !markerB) {
    return null;
  }

  // Ensure logical order A < B (< C < D)
  if (markerA.index >= markerB.index) {
    return null;
  }
  if (markerC && markerB.index >= markerC.index) {
    return null;
  }
  if (markerD && markerC && markerC.index >= markerD.index) {
    return null;
  }

  const prompt = text.slice(0, markerA.index).trim();

  let detectedAnswer: 'A' | 'B' | 'C' | 'D' | undefined = undefined;
  if (markerA.isStarred) detectedAnswer = 'A';
  if (markerB.isStarred) detectedAnswer = 'B';
  if (markerC?.isStarred) detectedAnswer = 'C';
  if (markerD?.isStarred) detectedAnswer = 'D';

  const endA = markerA.index + markerA.length;
  const startB = markerB.index;
  const endB = markerB.index + markerB.length;

  let textA = text.slice(endA, startB).trim();
  let textB = '';
  let textC = '';
  let textD = '';

  if (markerC) {
    const startC = markerC.index;
    const endC = markerC.index + markerC.length;
    textB = text.slice(endB, startC).trim();

    if (markerD) {
      const startD = markerD.index;
      const endD = markerD.index + markerD.length;
      textC = text.slice(endC, startD).trim();
      textD = text.slice(endD).trim();
    } else {
      textC = text.slice(endC).trim();
    }
  } else {
    textB = text.slice(endB).trim();
  }

  // Remove trailing answer note if appended in option D or last option
  const cleanOptionEnd = (s: string) => {
    return s
      .replace(/(?:Đáp án|Hướng dẫn|Giải thích|Key|Chọn|ĐA)[:\s]*.*$/is, '')
      .trim();
  };

  textA = cleanOptionEnd(textA);
  textB = cleanOptionEnd(textB);
  textC = cleanOptionEnd(textC);
  textD = cleanOptionEnd(textD);

  // Check if any option text has asterisk or explicit answer marker
  if (!detectedAnswer) {
    if (textA.endsWith('*') || textA.includes('(Đúng)')) detectedAnswer = 'A';
    else if (textB.endsWith('*') || textB.includes('(Đúng)')) detectedAnswer = 'B';
    else if (textC.endsWith('*') || textC.includes('(Đúng)')) detectedAnswer = 'C';
    else if (textD.endsWith('*') || textD.includes('(Đúng)')) detectedAnswer = 'D';
  }

  // Clean trailing asterisks from text
  textA = textA.replace(/\*+$/, '').trim();
  textB = textB.replace(/\*+$/, '').trim();
  textC = textC.replace(/\*+$/, '').trim();
  textD = textD.replace(/\*+$/, '').trim();

  const options: { key: 'A' | 'B' | 'C' | 'D'; text: string }[] = [
    { key: 'A', text: textA },
    { key: 'B', text: textB },
    { key: 'C', text: textC },
    { key: 'D', text: textD },
  ];

  return {
    prompt,
    options,
    detectedAnswer,
  };
}

/**
 * Universal Question Starter Matcher
 * Detects question starts in all standard Vietnamese and International exam formats:
 * - "Câu 1:", "Câu 1.", "Câu 1 -", "Câu 1", "Câu1:", "CÂU 1"
 * - "Bài 1:", "Bài 1.", "BÀI 1:", "Bài 1"
 * - "Question 1:", "Question 1.", "Q1:", "Q.1:"
 * - "1.", "1)", "1/", "[1]"
 * - Levels: "Câu 1 (NB):", "Câu 1 (TH):", "Câu 1 (VD):", "Câu 1 (1,0 điểm):"
 * - Markdown: "**Câu 1:**", "<b>Câu 1:</b>"
 */
export function matchQuestionStarter(line: string): { num: number; code: string; rest: string } | null {
  const cleanLine = line.trim().replace(/^[\*\#\_]+/g, '').replace(/[\*\#\_]+$/g, '').trim();
  if (!cleanLine) return null;

  // 1. Matches "Câu 1", "CÂU 1", "Bài 1", "BÀI 1", "Question 1", "Q1", "Q.1"
  const standardMatch = cleanLine.match(
    /^(?:Câu|CÂU|Bài|BÀI|Question|QUESTION|Q\.?)\s*(\d+)(?:\s*\([^\)]+\)|\[[^\]]+\])?[\s.:\)\/-]*(.*)$/i
  );
  if (standardMatch) {
    const num = parseInt(standardMatch[1], 10);
    return {
      num,
      code: `Câu ${num}`,
      rest: standardMatch[2].trim(),
    };
  }

  // 2. Standalone number at line start e.g. "1. ", "1) ", "1/ ", "[1] "
  // Followed by actual text
  const numberStartMatch = cleanLine.match(/^(?:\[(\d+)\]|(\d+)[\.\)\/-])\s+(.+)$/);
  if (numberStartMatch) {
    const num = parseInt(numberStartMatch[1] || numberStartMatch[2], 10);
    // Sanity filter: questions usually 1-200
    if (num > 0 && num <= 200) {
      return {
        num,
        code: `Câu ${num}`,
        rest: numberStartMatch[3].trim(),
      };
    }
  }

  return null;
}

// Parse text into structured questions
export function parseQuestionsFromText(text: string, subjectHint?: string): Question[] {
  const questions: Question[] = [];
  const { singleAnswers, tfAnswers, shortAnswers } = parseSeparateAnswerKey(text);

  // Split text by lines and normalize
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);

  // Track modern Vietnamese exam sections (PHẦN I, PHẦN II, PHẦN III)
  let currentSection: QuestionType | null = null;

  // Group text into question blocks based on question starters
  const questionBlocks: {
    header: string;
    code: string;
    num: number;
    lines: string[];
    sectionHint: QuestionType | null;
  }[] = [];
  let currentBlock: {
    header: string;
    code: string;
    num: number;
    lines: string[];
    sectionHint: QuestionType | null;
  } | null = null;

  for (const line of lines) {
    const cleanUpper = line.toUpperCase();

    // Check if this line marks the beginning of an answer key section; if so, stop collecting main questions
    if (/^(?:BẢNG ĐÁP ÁN|HƯỚNG DẪN CHẤM|PHẦN ĐÁP ÁN|ANSWER KEY|KEY|LỜI GIẢI VÀ ĐÁP ÁN|BẢNG CHỌN ĐÁP ÁN)/i.test(line)) {
      if (currentBlock) {
        questionBlocks.push(currentBlock);
        currentBlock = null;
      }
      break;
    }

    // Detect section headers (GDPT 2018 standard exam structure)
    if (
      cleanUpper.includes('PHẦN I') ||
      cleanUpper.includes('PHẦN 1') ||
      cleanUpper.includes('NHIỀU PHƯƠNG ÁN LỰA CHỌN') ||
      cleanUpper.includes('TRẮC NGHIỆM 4 LỰA CHỌN') ||
      cleanUpper.includes('DẠNG A')
    ) {
      currentSection = 'multiple_choice';
      continue;
    } else if (
      cleanUpper.includes('PHẦN II') ||
      cleanUpper.includes('PHẦN 2') ||
      cleanUpper.includes('ĐÚNG SAI') ||
      cleanUpper.includes('ĐÚNG - SAI') ||
      cleanUpper.includes('ĐÚNG/SAI') ||
      cleanUpper.includes('DẠNG B')
    ) {
      currentSection = 'true_false';
      continue;
    } else if (
      cleanUpper.includes('PHẦN III') ||
      cleanUpper.includes('PHẦN 3') ||
      cleanUpper.includes('TRẢ LỜI NGẮN') ||
      cleanUpper.includes('ĐIỀN KHUYẾT') ||
      cleanUpper.includes('CÂU HỎI TRẢ LỜI NGẮN') ||
      cleanUpper.includes('DẠNG C') ||
      cleanUpper.includes('DẠNG 3')
    ) {
      currentSection = 'short_answer';
      continue;
    }

    // Check question starter
    const starter = matchQuestionStarter(line);
    if (starter) {
      if (currentBlock) {
        questionBlocks.push(currentBlock);
      }
      currentBlock = {
        header: line,
        code: starter.code,
        num: starter.num,
        lines: [starter.rest],
        sectionHint: currentSection,
      };
    } else if (currentBlock) {
      currentBlock.lines.push(line);
    }
  }

  if (currentBlock) {
    questionBlocks.push(currentBlock);
  }

  // Process each block into Question object
  for (let idx = 0; idx < questionBlocks.length; idx++) {
    const block = questionBlocks[idx];
    const fullBlockText = block.lines.join('\n').trim();
    const qNum = block.num || idx + 1;

    // Check statements for Type B (True/False format with a, b, c, d statements)
    const tfRegex = /(?:^|[\r\n\s])([a-d])\s*[\)\.:\-]\s*([^\n\r]+)/gi;
    const statementsFound: { key: string; text: string; fullMatch: string }[] = [];
    let tfExec;
    while ((tfExec = tfRegex.exec(fullBlockText)) !== null) {
      statementsFound.push({
        key: tfExec[1].toLowerCase(),
        text: tfExec[2].trim(),
        fullMatch: tfExec[0],
      });
    }

    const hasTfKeyword =
      /đúng|sai|đ\/s|t\/f|mệnh đề/i.test(fullBlockText) ||
      block.sectionHint === 'true_false' ||
      statementsFound.length >= 2;

    // Try extracting Type A (4 options) with robust index extractor
    const extractedA = extractMultipleChoiceOptions(fullBlockText);

    let qType: QuestionType = 'multiple_choice';
    let isVerified = false;
    let needsReview = false;
    let reviewReason = '';
    let explanation = '';
    let correctAnswer: string | undefined = undefined;
    let statements: TrueFalseStatement[] | undefined = undefined;
    let options: { key: 'A' | 'B' | 'C' | 'D'; text: string }[] | undefined = undefined;
    let promptContent = fullBlockText;
    let isAiGenerated = false;

    // 1. Dạng B: Trắc nghiệm Đúng/Sai
    if (
      (block.sectionHint === 'true_false' && statementsFound.length >= 2) ||
      (statementsFound.length >= 2 && hasTfKeyword && (!extractedA || statementsFound.length >= 4))
    ) {
      qType = 'true_false';
      statements = statementsFound.map((item, sIdx) => {
        let stmtText = item.text;
        let ans: boolean | null = null;

        // Detect answer marker like (Đúng), (Sai), [Đ], [S], : Đúng, : Sai
        if (
          /\((?:Đ|Đúng|True)\)/i.test(stmtText) ||
          /\[(?:Đ|Đúng|True)\]/i.test(stmtText) ||
          /[:\-\s](?:Đúng|True)$/i.test(stmtText)
        ) {
          ans = true;
        } else if (
          /\((?:S|Sai|False)\)/i.test(stmtText) ||
          /\[(?:S|Sai|False)\]/i.test(stmtText) ||
          /[:\-\s](?:Sai|False)$/i.test(stmtText)
        ) {
          ans = false;
        }

        // Clean trailing answer annotation from the statement text
        stmtText = stmtText
          .replace(/[\(\[]\s*(?:Đ|Đúng|True|S|Sai|False)\s*[\)\]]/gi, '')
          .replace(/[:\-]\s*(?:Đúng|Sai|True|False)$/gi, '')
          .trim();

        return {
          id: `tf_${qNum}_${sIdx + 1}`,
          statement: stmtText,
          correctAnswer: ans,
        };
      });

      // Check separate answer key table
      const separateTf = tfAnswers.get(qNum);
      if (separateTf) {
        statements.forEach((st, sIdx) => {
          const letter = ['a', 'b', 'c', 'd'][sIdx];
          if (separateTf[letter] !== undefined) {
            st.correctAnswer = separateTf[letter];
          }
        });
      }

      // Check inline compound answer e.g. "Đáp án: a-Đ, b-S, c-Đ, d-S"
      const inlineTfMatch = fullBlockText.match(/(?:Đáp án|Key|ĐA)[:\s]*([a-d\sĐDSđds:,\-]+)/i);
      if (inlineTfMatch) {
        const keyChunk = inlineTfMatch[1];
        statements.forEach((st, sIdx) => {
          if (st.correctAnswer === null) {
            const letter = ['a', 'b', 'c', 'd'][sIdx];
            const letterRegex = new RegExp(`${letter}\\s*[:\\-=]?\\s*([ĐDSđds])`, 'i');
            const match = keyChunk.match(letterRegex);
            if (match) {
              const char = match[1].toUpperCase();
              st.correctAnswer = char === 'Đ' || char === 'D';
            }
          }
        });
      }

      const allStatementsHaveAnswers = statements.every((s) => s.correctAnswer !== null);
      if (allStatementsHaveAnswers) {
        isVerified = true;
      } else {
        // Proactively auto-solve missing answers using curriculum knowledge engine
        const autoSol = solveQuestionWithCurriculumEngine(
          {
            id: `q_${qNum}`,
            code: block.code,
            type: 'true_false',
            content: fullBlockText,
            statements,
          },
          subjectHint
        );
        statements = autoSol.solvedStatements || statements;
        explanation = autoSol.explanation;
        isVerified = true;
        isAiGenerated = true;
      }

      // Prompt is everything before the first statement
      const firstStmtIdx = fullBlockText.search(/(?:^|[\r\n\s])[a-d]\s*[\)\.:\-]/i);
      if (firstStmtIdx > 0) {
        promptContent = fullBlockText.slice(0, firstStmtIdx).trim();
      } else {
        promptContent = block.header;
      }
    }
    // 2. Dạng A: Trắc nghiệm 4 lựa chọn (Nhiều phương án lựa chọn)
    else if (
      (block.sectionHint === 'multiple_choice' && extractedA) ||
      (extractedA && extractedA.options.length >= 2 && block.sectionHint !== 'short_answer')
    ) {
      qType = 'multiple_choice';
      options = extractedA.options;
      promptContent = extractedA.prompt || block.header;

      // Detect answer: from starred marker, internal text, or separate table
      const internalAnsMatch = fullBlockText.match(/(?:Đáp án|Chọn|Key|ĐA)[:\s]*([A-D])/i);
      const separateAns = singleAnswers.get(qNum);

      if (extractedA.detectedAnswer) {
        correctAnswer = extractedA.detectedAnswer;
        isVerified = true;
      } else if (internalAnsMatch) {
        correctAnswer = internalAnsMatch[1].toUpperCase();
        isVerified = true;
      } else if (separateAns && ['A', 'B', 'C', 'D'].includes(separateAns)) {
        correctAnswer = separateAns;
        isVerified = true;
      } else {
        // Proactively auto-solve missing answer using curriculum knowledge engine
        const autoSol = solveQuestionWithCurriculumEngine(
          {
            id: `q_${qNum}`,
            code: block.code,
            type: 'multiple_choice',
            content: promptContent,
            options,
          },
          subjectHint
        );
        correctAnswer = autoSol.solvedAnswer;
        explanation = autoSol.explanation;
        isVerified = true;
        isAiGenerated = true;
      }
    }
    // 3. Dạng C: Câu trả lời ngắn (Short Answer)
    else {
      qType = 'short_answer';
      const ansMatch = fullBlockText.match(/(?:Đáp số|Đáp án|Kết quả|Key|Trả lời|ĐA)[:\s]*([^\n]+)/i);
      const separateAns = shortAnswers.get(qNum);

      if (ansMatch) {
        correctAnswer = ansMatch[1].trim();
        isVerified = true;
      } else if (separateAns) {
        correctAnswer = separateAns;
        isVerified = true;
      } else {
        // Proactively auto-solve missing answer using curriculum knowledge engine
        const autoSol = solveQuestionWithCurriculumEngine(
          {
            id: `q_${qNum}`,
            code: block.code,
            type: 'short_answer',
            content: fullBlockText,
          },
          subjectHint
        );
        correctAnswer = autoSol.solvedAnswer;
        explanation = autoSol.explanation;
        isVerified = true;
        isAiGenerated = true;
      }

      promptContent = fullBlockText;
    }

    // Clean prompt content from trailing answers
    promptContent = promptContent
      .replace(/(?:Đáp án|Đáp số|Hướng dẫn chấm|Key|Kết quả|ĐA)[:\s]*[^\n]+/gi, '')
      .trim();
    if (!promptContent) {
      promptContent = block.header;
    }

    questions.push({
      id: `q_${qNum}_${Date.now()}_${idx}`,
      code: block.code || `Câu ${idx + 1}`,
      type: qType,
      content: promptContent,
      options,
      correctAnswer,
      statements,
      explanation: explanation || undefined,
      isVerified,
      needsReview,
      reviewReason: reviewReason || undefined,
      sourceTextSnippet: fullBlockText.slice(0, 300),
      isAiGenerated,
    });
  }

  return questions;
}

/**
 * Universal document parser supporting Word (.docx, .doc), PDF (.pdf), and Text (.txt)
 */
export async function parseDocumentFile(file: File): Promise<ParseResult> {
  const extension = file.name.split('.').pop()?.toLowerCase();
  let rawText = '';

  if (extension === 'pdf') {
    const arrayBuffer = await file.arrayBuffer();
    rawText = await extractTextFromPdf(arrayBuffer);
  } else if (extension === 'txt') {
    rawText = await file.text();
  } else {
    // .docx, .doc
    const arrayBuffer = await file.arrayBuffer();
    const mammothResult = await mammoth.extractRawText({ arrayBuffer });
    rawText = mammothResult.value;
  }

  if (!rawText || rawText.trim().length === 0) {
    throw new Error('Không thể đọc nội dung văn bản từ tệp đã chọn. Vui lòng kiểm tra lại tệp.');
  }

  return parseRawTextContent(rawText, file.name.replace(/\.[^/.]+$/, ''));
}

/**
 * Parse directly from raw text (for direct paste or after file extraction)
 */
export function parseRawTextContent(rawText: string, title: string = 'Đề cương ôn tập'): ParseResult {
  const meta = extractMetadata(rawText, title);
  const questions = parseQuestionsFromText(rawText, meta.subject);

  if (questions.length === 0) {
    throw new Error(
      'Hệ thống chưa tìm thấy câu hỏi nào hợp lệ. Vui lòng đảm bảo các câu bắt đầu bằng "Câu 1:", "Câu 2:"... hoặc xem mục Hướng dẫn để định dạng chuẩn.'
    );
  }

  const typeACount = questions.filter((q) => q.type === 'multiple_choice').length;
  const typeBCount = questions.filter((q) => q.type === 'true_false').length;
  const typeCCount = questions.filter((q) => q.type === 'short_answer').length;
  const verifiedCount = questions.filter((q) => q.isVerified).length;
  const needsReviewCount = questions.filter((q) => q.needsReview).length;

  const outline: DocumentOutline = {
    id: `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    title,
    subject: meta.subject,
    grade: meta.grade,
    category: meta.category,
    school: meta.school,
    semester: meta.semester,
    topic: meta.topic,
    uploadDate: new Date().toLocaleDateString('vi-VN'),
    fileName: `${title}.docx`,
    fileSize: rawText.length * 2,
    questions,
    rawTextExcerpt: rawText.slice(0, 500),
  };

  return {
    outline,
    summary: {
      total: questions.length,
      typeACount,
      typeBCount,
      typeCCount,
      verifiedCount,
      needsReviewCount,
    },
  };
}

// Backwards compatibility alias
export const parseDocxFile = parseDocumentFile;


/**
 * KHO HỌC LIỆU ONLINE CHUẨN GDPT
 * Phân chia thành 4 danh mục:
 * 1. Ôn bài thường xuyên (regular)
 * 2. Ôn giữa kỳ (midterm)
 * 3. Ôn cuối kỳ (final)
 * 4. Ôn tốt nghiệp & Tuyển sinh (graduation)
 */
export const SAMPLE_DOCUMENTS: DocumentOutline[] = [
  // ================= 1. ÔN BÀI THƯỜNG XUYÊN =================
  {
    id: 'repo_reg_khtn8',
    title: 'Ôn tập thường xuyên KHTN 8 – Phản ứng hóa học & Nồng độ dung dịch',
    subject: 'Khoa học tự nhiên',
    grade: 'Lớp 8',
    category: 'regular',
    school: 'Kho Học Liệu Mở GDPT',
    semester: 'Học kỳ I',
    topic: 'Biến đổi hóa học, Mol & Tỉ khối chất khí',
    uploadDate: 'Mới cập nhật',
    fileName: 'On_thuong_xuyen_KHTN8.docx',
    fileSize: 46200,
    questions: [
      {
        id: 'reg_khtn_1',
        code: 'Câu 1',
        type: 'multiple_choice',
        content: 'Dấu hiệu nào sau đây chắc chắn chứng tỏ có phản ứng hóa học xảy ra?',
        options: [
          { key: 'A', text: 'Có chất mới tạo thành có tính chất khác với chất ban đầu.' },
          { key: 'B', text: 'Chất thay đổi trạng thái từ rắn sang lỏng do nhiệt độ.' },
          { key: 'C', text: 'Chất bị bẻ gãy vụn thành các mảnh nhỏ kích thước li ti.' },
          { key: 'D', text: 'Chất bị hòa tan vào trong nước tạo thành dung dịch trong suốt.' },
        ],
        correctAnswer: 'A',
        explanation: 'Phản ứng hóa học là quá trình biến đổi chất này thành chất khác, dấu hiệu cốt lõi là sự xuất hiện của chất mới.',
        isVerified: true,
        needsReview: false,
      },
      {
        id: 'reg_khtn_2',
        code: 'Câu 2',
        type: 'true_false',
        content: 'Xét tính Đúng/Sai của các phát biểu về Mol và tỉ khối chất khí:',
        statements: [
          { id: 'reg_khtn_2_a', statement: 'Một mol chất chứa xấp xỉ 6,022 x 10²³ nguyên tử hoặc phân tử.', correctAnswer: true },
          { id: 'reg_khtn_2_b', statement: 'Ở điều kiện chuẩn (25°C, 1 bar), thể tích của 1 mol khí bất kỳ đều xấp xỉ 24,79 lít.', correctAnswer: true },
          { id: 'reg_khtn_2_c', statement: 'Khí Oxygen (O2) nhẹ hơn không khí vì khối lượng mol là 16 g/mol.', correctAnswer: false }, // O2 = 32 > 29
          { id: 'reg_khtn_2_d', statement: 'Tỉ khối của khí A đối với khí B tính bằng công thức d(A/B) = M(A) / M(B).', correctAnswer: true },
        ],
        isVerified: true,
        needsReview: false,
        explanation: 'M(O2) = 32 g/mol nặng hơn không khí (M xấp xỉ 29 g/mol).',
      },
      {
        id: 'reg_khtn_3',
        code: 'Câu 3',
        type: 'short_answer',
        content: 'Hòa tan 20 gam muối ăn (NaCl) vào 80 gam nước. Nồng độ phần trăm (C%) của dung dịch thu được là bao nhiêu %? (Chỉ ghi số)',
        correctAnswer: '20',
        explanation: 'Khối lượng dung dịch = 20 + 80 = 100g. C% = (20 / 100) * 100% = 20%.',
        isVerified: true,
        needsReview: false,
      },
    ],
  },
  {
    id: 'repo_reg_toan8',
    title: 'Ôn tập thường xuyên Toán 8 – Hằng đẳng thức đáng nhớ & Phân thức',
    subject: 'Toán học',
    grade: 'Lớp 8',
    category: 'regular',
    school: 'Kho Học Liệu Mở GDPT',
    semester: 'Học kỳ I',
    topic: '7 Hằng đẳng thức đáng nhớ & Rút gọn phân thức đại số',
    uploadDate: 'Mới cập nhật',
    fileName: 'On_thuong_xuyen_Toan8.docx',
    fileSize: 42100,
    questions: [
      {
        id: 'reg_toan_1',
        code: 'Câu 1',
        type: 'multiple_choice',
        content: 'Khai triển hằng đẳng thức (a - b)² ta được kết quả là:',
        options: [
          { key: 'A', text: 'a² - 2ab + b²' },
          { key: 'B', text: 'a² + 2ab + b²' },
          { key: 'C', text: 'a² - b²' },
          { key: 'D', text: 'a² - 2ab - b²' },
        ],
        correctAnswer: 'A',
        explanation: '(a - b)² = a² - 2ab + b².',
        isVerified: true,
        needsReview: false,
      },
      {
        id: 'reg_toan_2',
        code: 'Câu 2',
        type: 'short_answer',
        content: 'Tính nhanh giá trị của biểu thức 101² - 99². (Chỉ ghi số kết quả)',
        correctAnswer: '400',
        explanation: '101² - 99² = (101 - 99)(101 + 99) = 2 * 200 = 400.',
        isVerified: true,
        needsReview: false,
      },
    ],
  },

  // ================= 2. ÔN THI GIỮA KỲ =================
  {
    id: 'repo_mid_toan9',
    title: 'Đề cương Ôn thi Giữa kỳ I Toán 9 – Căn bậc hai & Hệ hai phương trình',
    subject: 'Toán học',
    grade: 'Lớp 9',
    category: 'midterm',
    school: 'Trường THCS Trọng Điểm',
    semester: 'Giữa học kỳ I',
    topic: 'Căn thức bậc hai, Trục căn thức ở mẫu & Giải hệ phương trình',
    uploadDate: 'Mới cập nhật',
    fileName: 'De_cuong_Giua_HK1_Toan9.docx',
    fileSize: 51200,
    questions: [
      {
        id: 'mid_toan_1',
        code: 'Câu 1',
        type: 'multiple_choice',
        content: 'Điều kiện xác định của biểu thức căn bậc hai √(3 - 2x) là:',
        options: [
          { key: 'A', text: 'x ≤ 3/2' },
          { key: 'B', text: 'x ≥ 3/2' },
          { key: 'C', text: 'x < 3/2' },
          { key: 'D', text: 'x > 3/2' },
        ],
        correctAnswer: 'A',
        explanation: '3 - 2x ≥ 0 <=> -2x ≥ -3 <=> x ≤ 3/2.',
        isVerified: true,
        needsReview: false,
      },
      {
        id: 'mid_toan_2',
        code: 'Câu 2',
        type: 'true_false',
        content: 'Xét tính Đúng/Sai của các nhận định đại số sau:',
        statements: [
          { id: 'mid_toan_2_a', statement: 'Căn bậc hai số học của số dương a là một số không âm.', correctAnswer: true },
          { id: 'mid_toan_2_b', statement: '√(a²) = a với mọi số thực a.', correctAnswer: false }, // phải là |a|
          { id: 'mid_toan_2_c', statement: 'Hệ phương trình bậc nhất hai ẩn có thể vô nghiệm, nghiệm duy nhất hoặc vô số nghiệm.', correctAnswer: true },
          { id: 'mid_toan_2_d', statement: 'Phương pháp cộng đại số chỉ áp dụng khi hai phương trình có cùng hệ số x.', correctAnswer: false },
        ],
        isVerified: true,
        needsReview: false,
        explanation: '√(a²) = |a|; phương pháp cộng có thể nhân thêm hệ số thích hợp.',
      },
      {
        id: 'mid_toan_3',
        code: 'Câu 3',
        type: 'short_answer',
        content: 'Rút gọn biểu thức A = √(12) + √(27) - √(75). Kết quả là bao nhiêu? (Chỉ ghi số)',
        correctAnswer: '0',
        explanation: 'A = 2√3 + 3√3 - 5√3 = 0.',
        isVerified: true,
        needsReview: false,
      },
    ],
  },
  {
    id: 'repo_mid_khtn8',
    title: 'Đề cương Ôn thi Giữa kỳ I KHTN 8 – Áp suất chất lỏng & Lực đẩy Archimedes',
    subject: 'Khoa học tự nhiên',
    grade: 'Lớp 8',
    category: 'midterm',
    school: 'Kho Học Liệu Mở GDPT',
    semester: 'Giữa học kỳ I',
    topic: 'Áp suất chất lỏng, Áp suất khí quyển & Lực đẩy Archimedes',
    uploadDate: 'Mới cập nhật',
    fileName: 'De_cuong_Giua_HK1_KHTN8.docx',
    fileSize: 47800,
    questions: [
      {
        id: 'mid_khtn_1',
        code: 'Câu 1',
        type: 'multiple_choice',
        content: 'Công thức tính áp suất chất lỏng tại một điểm có độ sâu h là:',
        options: [
          { key: 'A', text: 'p = d . h (với d là trọng lượng riêng của chất lỏng).' },
          { key: 'B', text: 'p = d / h.' },
          { key: 'C', text: 'p = F / S.' },
          { key: 'D', text: 'p = m . g.' },
        ],
        correctAnswer: 'A',
        explanation: 'Áp suất chất lỏng p = d.h phụ thuộc vào độ sâu và trọng lượng riêng của chất lỏng.',
        isVerified: true,
        needsReview: false,
      },
      {
        id: 'mid_khtn_2',
        code: 'Câu 2',
        type: 'short_answer',
        content: 'Một vật có thể tích 0.002 m³ nhúng chìm hoàn toàn trong nước (trọng lượng riêng của nước d = 10000 N/m³). Độ lớn lực đẩy Archimedes tác dụng lên vật là bao nhiêu Newton? (Chỉ ghi số)',
        correctAnswer: '20',
        explanation: 'F_A = d . V = 10000 * 0.002 = 20 N.',
        isVerified: true,
        needsReview: false,
      },
    ],
  },

  // ================= 3. ÔN THI CUỐI KỲ =================
  {
    id: 'repo_fin_toan9',
    title: 'Đề cương Ôn thi Cuối kỳ I Toán 9 – Hàm số bậc nhất & Đường tròn',
    subject: 'Toán học',
    grade: 'Lớp 9',
    category: 'final',
    school: 'Trường THCS Lê Quý Đôn',
    semester: 'Cuối học kỳ I',
    topic: 'Hàm số bậc nhất y = ax + b, Vị trí tương đối của hai đường tròn',
    uploadDate: 'Mới cập nhật',
    fileName: 'De_cuong_Cuoi_HK1_Toan9.docx',
    fileSize: 54300,
    questions: [
      {
        id: 'fin_toan_1',
        code: 'Câu 1',
        type: 'multiple_choice',
        content: 'Đường thẳng y = (m - 2)x + 3 là hàm số bậc nhất khi và chỉ khi:',
        options: [
          { key: 'A', text: 'm ≠ 2' },
          { key: 'B', text: 'm > 2' },
          { key: 'C', text: 'm = 2' },
          { key: 'D', text: 'm < 2' },
        ],
        correctAnswer: 'A',
        explanation: 'Hàm số y = ax + b là bậc nhất khi hệ số a ≠ 0, tức m - 2 ≠ 0 <=> m ≠ 2.',
        isVerified: true,
        needsReview: false,
      },
      {
        id: 'fin_toan_2',
        code: 'Câu 2',
        type: 'true_false',
        content: 'Xác định tính Đúng/Sai của các định lí về đường tròn:',
        statements: [
          { id: 'fin_toan_2_a', statement: 'Trong một đường tròn, đường kính là dây cung dài nhất.', correctAnswer: true },
          { id: 'fin_toan_2_b', statement: 'Đường kính vuông góc với một dây thì đi qua trung điểm của dây ấy.', correctAnswer: true },
          { id: 'fin_toan_2_c', statement: 'Góc nội tiếp chắn nửa đường tròn là góc nhọn.', correctAnswer: false }, // góc vuông 90 độ
          { id: 'fin_toan_2_d', statement: 'Hai tiếp tuyến cắt nhau tại một điểm cách đều hai tiếp điểm.', correctAnswer: true },
        ],
        isVerified: true,
        needsReview: false,
        explanation: 'Góc nội tiếp chắn nửa đường tròn là góc vuông (90 độ).',
      },
      {
        id: 'fin_toan_3',
        code: 'Câu 3',
        type: 'short_answer',
        content: 'Cho tam giác ABC vuông tại A có AB = 6cm, AC = 8cm. Bán kính đường tròn ngoại tiếp tam giác ABC là bao nhiêu cm? (Chỉ ghi số)',
        correctAnswer: '5',
        explanation: 'Cạnh huyền BC = √(6² + 8²) = 10cm. Bán kính đường tròn ngoại tiếp tam giác vuông bằng nửa cạnh huyền: R = 10 / 2 = 5cm.',
        isVerified: true,
        needsReview: false,
      },
    ],
  },
  {
    id: 'repo_fin_eng10',
    title: 'Đề cương Ôn thi Cuối kỳ I Tiếng Anh 10 – Grammar & Vocabulary Units 1-5',
    subject: 'Tiếng Anh',
    grade: 'Lớp 10',
    category: 'final',
    school: 'Kho Học Liệu Mở GDPT',
    semester: 'Cuối học kỳ I',
    topic: 'Tenses, Passive Voice, Inventions & Environment',
    uploadDate: 'Mới cập nhật',
    fileName: 'De_cuong_Cuoi_HK1_Anh10.docx',
    fileSize: 49500,
    questions: [
      {
        id: 'fin_eng_1',
        code: 'Câu 1',
        type: 'multiple_choice',
        content: 'Many teenagers are interested in ______ volunteer work in their community.',
        options: [
          { key: 'A', text: 'doing' },
          { key: 'B', text: 'making' },
          { key: 'C', text: 'taking' },
          { key: 'D', text: 'having' },
        ],
        correctAnswer: 'A',
        explanation: 'Collocation: "do volunteer work" (làm công việc tình nguyện).',
        isVerified: true,
        needsReview: false,
      },
      {
        id: 'fin_eng_2',
        code: 'Câu 2',
        type: 'short_answer',
        content: 'Rewrite using passive voice: "Scientists have invented smart solar panels." -> "Smart solar panels have ______ invented by scientists." (Fill in the missing auxiliary word)',
        correctAnswer: 'been',
        explanation: 'Present perfect passive: have / has + been + V3/ed.',
        isVerified: true,
        needsReview: false,
      },
    ],
  },

  // ================= 4. ÔN TỐT NGHIỆP & TUYỂN SINH =================
  {
    id: 'repo_grad_toan9',
    title: 'Bộ câu hỏi Trọng tâm Ôn thi Tuyển sinh Vào Lớp 10 – Toán học',
    subject: 'Toán học',
    grade: 'Lớp 9',
    category: 'graduation',
    school: 'Bộ Đề Thi Tuyển Sinh Vào 10',
    semester: 'Ôn thi chuyển cấp',
    topic: 'Hệ thức Viète, Phương trình bậc hai & Cực trị đại số',
    uploadDate: 'Mới cập nhật',
    fileName: 'On_thi_Vao_10_Toan.docx',
    fileSize: 58900,
    questions: [
      {
        id: 'grad_toan_1',
        code: 'Câu 1',
        type: 'multiple_choice',
        content: 'Cho phương trình x² - 5x + 6 = 0 có hai nghiệm x1, x2. Giá trị biểu thức S = x1 + x2 và P = x1 . x2 lần lượt là:',
        options: [
          { key: 'A', text: 'S = 5 và P = 6' },
          { key: 'B', text: 'S = -5 và P = 6' },
          { key: 'C', text: 'S = 6 và P = 5' },
          { key: 'D', text: 'S = 5 và P = -6' },
        ],
        correctAnswer: 'A',
        explanation: 'Theo hệ thức Viète: S = -b/a = -(-5)/1 = 5; P = c/a = 6/1 = 6.',
        isVerified: true,
        needsReview: false,
      },
      {
        id: 'grad_toan_2',
        code: 'Câu 2',
        type: 'true_false',
        content: 'Xét tính Đúng/Sai của các tính chất phương trình bậc hai ax² + bx + c = 0 (a ≠ 0):',
        statements: [
          { id: 'grad_toan_2_a', statement: 'Nếu a và c trái dấu (ac < 0) thì phương trình luôn có hai nghiệm phân biệt.', correctAnswer: true },
          { id: 'grad_toan_2_b', statement: 'Nếu a + b + c = 0 thì phương trình có nghiệm x1 = 1 và x2 = c/a.', correctAnswer: true },
          { id: 'grad_toan_2_c', statement: 'Nếu biệt thức Δ = 0 thì phương trình vô nghiệm.', correctAnswer: false }, // có nghiệm kép
          { id: 'grad_toan_2_d', statement: 'Nếu a - b + c = 0 thì phương trình có một nghiệm x1 = -1.', correctAnswer: true },
        ],
        isVerified: true,
        needsReview: false,
        explanation: 'Khi Δ = 0 phương trình có nghiệm kép x1 = x2 = -b/(2a).',
      },
      {
        id: 'grad_toan_3',
        code: 'Câu 3',
        type: 'short_answer',
        content: 'Tìm giá trị m để phương trình x² - 2x + m = 0 có nghiệm kép. (Chỉ ghi số giá trị m)',
        correctAnswer: '1',
        explanation: 'Δ\' = (-1)² - 1*m = 1 - m. Phương trình có nghiệm kép khi Δ\' = 0 <=> 1 - m = 0 <=> m = 1.',
        isVerified: true,
        needsReview: false,
      },
    ],
  },
  {
    id: 'repo_grad_eng',
    title: 'Bộ đề Luyện thi Tuyển sinh Vào Lớp 10 & Tốt nghiệp – Tiếng Anh',
    subject: 'Tiếng Anh',
    grade: 'Lớp 9',
    category: 'graduation',
    school: 'Bộ Đề Thi Tuyển Sinh Toàn Quốc',
    semester: 'Ôn thi chuyển cấp',
    topic: 'Tổng hợp Ngữ pháp, Mệnh đề quan hệ & Câu điều kiện',
    uploadDate: 'Mới cập nhật',
    fileName: 'On_thi_Vao_10_Tieng_Anh.docx',
    fileSize: 52400,
    questions: [
      {
        id: 'grad_eng_1',
        code: 'Câu 1',
        type: 'multiple_choice',
        content: 'If the weather ______ fine tomorrow, we will go on a picnic in the park.',
        options: [
          { key: 'A', text: 'is' },
          { key: 'B', text: 'will be' },
          { key: 'C', text: 'was' },
          { key: 'D', text: 'would be' },
        ],
        correctAnswer: 'A',
        explanation: 'Conditional sentence Type 1: If + S + V(present simple), S + will + V-inf.',
        isVerified: true,
        needsReview: false,
      },
      {
        id: 'grad_eng_2',
        code: 'Câu 2',
        type: 'multiple_choice',
        content: 'The woman ______ lives next door to my house is a famous doctor.',
        options: [
          { key: 'A', text: 'who' },
          { key: 'B', text: 'whom' },
          { key: 'C', text: 'which' },
          { key: 'D', text: 'whose' },
        ],
        correctAnswer: 'A',
        explanation: 'Relative pronoun "who" replaces the subject person (The woman).',
        isVerified: true,
        needsReview: false,
      },
      {
        id: 'grad_eng_3',
        code: 'Câu 3',
        type: 'short_answer',
        content: 'Supply the correct preposition: "Hanoi is famous ______ its delicious street food." (Type only the preposition)',
        correctAnswer: 'for',
        explanation: 'Collocation: "famous for something" (nổi tiếng vì cái gì).',
        isVerified: true,
        needsReview: false,
      },
    ],
  },
];

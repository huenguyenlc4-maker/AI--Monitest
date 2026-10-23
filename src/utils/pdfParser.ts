import * as pdfjsLib from 'pdfjs-dist';

// Configure the worker for pdfjs-dist
// Using CDN worker that matches the installed pdfjs-dist version
if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version || '4.10.38'}/build/pdf.worker.min.mjs`;
}

/**
 * Extracts raw textual content from a PDF ArrayBuffer
 */
export async function extractTextFromPdf(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
      useSystemFonts: true,
    });

    const pdfDoc = await loadingTask.promise;
    const numPages = pdfDoc.numPages;
    let fullText = '';

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageStrings = textContent.items
        .map((item: any) => ('str' in item ? item.str : ''))
        .filter((str: string) => str.length > 0)
        .join(' ');
      
      fullText += pageStrings + '\n\n';
    }

    if (!fullText.trim()) {
      throw new Error(
        'Tệp PDF này dường như là dạng hình ảnh quét (scanned image) không chứa lớp văn bản có thể nhận diện. Vui lòng sử dụng tệp Word (.docx) hoặc tệp PDF có văn bản gốc.'
      );
    }

    return fullText;
  } catch (err: any) {
    if (err.message && err.message.includes('scanned image')) {
      throw err;
    }
    throw new Error(
      'Không thể đọc nội dung văn bản từ tệp PDF. Khuyến khích bạn tải lên tệp định dạng Word (.docx) để đạt độ chính xác cao nhất.'
    );
  }
}

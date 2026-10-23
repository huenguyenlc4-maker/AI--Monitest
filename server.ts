import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI SDK per server guidelines
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

/**
 * Endpoint to auto-solve questions missing answer keys
 * Grounded in Vietnamese GDPT 2018 national curriculum
 */
app.post('/api/auto-solve', async (req, res) => {
  try {
    const { subject, grade, questions } = req.body;

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ error: 'Danh sách câu hỏi không hợp lệ.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(200).json({
        solutions: [],
        note: 'No GEMINI_API_KEY configured. Falling back to client curriculum solver.',
      });
    }

    const promptText = `
Bạn là chuyên gia giáo dục phụ trách giải đề cương ôn tập theo chương trình GDPT 2018 của Bộ Giáo dục và Đào tạo Việt Nam.
Môn học: ${subject || 'Chưa xác định'}
Khối lớp: ${grade || 'Chưa xác định'}

Hãy nghiên cứu kỹ nội dung câu hỏi sau và cung cấp đáp án chính xác 100% kèm lời giải thích ngắn gọn:

${JSON.stringify(questions, null, 2)}

Yêu cầu trả về đúng định dạng JSON:
- Với câu trắc nghiệm nhiều lựa chọn (multiple_choice): correctAnswer là một chữ cái trong ['A', 'B', 'C', 'D'].
- Với câu trắc nghiệm Đúng/Sai (true_false): trả về danh sách statements với correctAnswer là true hoặc false cho từng ý a, b, c, d.
- Với câu trả lời ngắn (short_answer): correctAnswer là số cụ thể (dùng dấu chấm hoặc phẩy thập phân) hoặc từ khóa ngắn gọn, đúng đơn vị yêu cầu.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        systemInstruction:
          'Bạn là chuyên gia giải đề thi chuẩn GDPT 2018. Hãy đưa ra đáp án chính xác tuyệt đối và lời giải thích súc tích.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            solutions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  questionId: { type: Type.STRING },
                  correctAnswer: { type: Type.STRING },
                  statements: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        statement: { type: Type.STRING },
                        correctAnswer: { type: Type.BOOLEAN },
                      },
                      required: ['id', 'statement', 'correctAnswer'],
                    },
                  },
                  explanation: { type: Type.STRING },
                },
                required: ['questionId', 'explanation'],
              },
            },
          },
          required: ['solutions'],
        },
      },
    });

    const text = response.text;
    if (!text) {
      return res.status(500).json({ error: 'Không nhận được phản hồi từ AI.' });
    }

    const parsedData = JSON.parse(text);
    return res.json(parsedData);
  } catch (error: any) {
    console.error('Error in /api/auto-solve:', error);
    return res.status(500).json({
      error: 'Lỗi khi giải tự động câu hỏi bằng AI.',
      details: error?.message,
    });
  }
});

async function startServer() {
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();

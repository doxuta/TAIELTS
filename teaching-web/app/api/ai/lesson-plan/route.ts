import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ROADMAP_MONTHS } from '@/lib/utils'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'TEACHER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { sessionType, month, week, grammarTopic, vocabularyFocus } = await req.json()

  const monthData = ROADMAP_MONTHS[month] ?? ROADMAP_MONTHS[1]
  const grammar = grammarTopic || monthData.grammar
  const vocab = vocabularyFocus || monthData.vocabulary

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey || apiKey === 'your-gemini-api-key-here') {
    // Return fallback template if no API key
    return NextResponse.json({
      content: generateTemplate(sessionType, month, week, grammar, vocab),
      homework: generateHomework(sessionType, grammar, vocab),
    })
  }

  const prompt = buildPrompt(sessionType, month, week, grammar, vocab)

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
        }),
      }
    )
    const data = await res.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
    
    // Parse homework from end of text
    const hwMatch = text.match(/BÀI TẬP VỀ NHÀ:([\s\S]+?)$/i)
    const homework = hwMatch ? hwMatch[1].trim() : generateHomework(sessionType, grammar, vocab)
    const content = hwMatch ? text.slice(0, text.indexOf('BÀI TẬP VỀ NHÀ:')).trim() : text

    return NextResponse.json({ content, homework })
  } catch (err) {
    console.error('Gemini error:', err)
    return NextResponse.json({
      content: generateTemplate(sessionType, month, week, grammar, vocab),
      homework: generateHomework(sessionType, grammar, vocab),
    })
  }
}

function buildPrompt(type: string, month: number, week: number, grammar: string, vocab: string) {
  const typeGuide: Record<string, string> = {
    A: `Buổi A (120 phút): 60' Ngữ pháp + 20' Speaking ứng dụng + 40' Từ vựng.`,
    B: `Buổi B (120 phút): 45' Listening + 50' Speaking + 15' Phát âm + 10' Nhận xét.`,
    C: `Buổi C (120 phút): 50' Reading + 50' Writing + 20' Từ vựng & collocation.`,
  }

  return `Bạn là trợ lý giảng dạy IELTS 1-1 cho học viên Huyền Trang (sinh viên Luật, Năm 1 nền tảng tiếng Anh).

Soạn nội dung chi tiết cho Buổi ${type}, Tuần ${week} Tháng ${month}.

${typeGuide[type]}

Chủ đề ngữ pháp: ${grammar}
Từ vựng / chủ đề: ${vocab}

YÊU CẦU:
- Ngắn gọn, thực tế, có thể dạy ngay
- Ghi rõ phân bổ phút cho từng hoạt động
- Ghi cụ thể số câu bài tập
- Năm 1 KHÔNG dùng format IELTS thuần, KHÔNG ép band
- Văn phong rõ ràng, dễ thực hiện

Kết thúc với phần: "BÀI TẬP VỀ NHÀ:" (gồm 2-3 bài có deadline).

Trả lời bằng tiếng Việt.`
}

function generateTemplate(type: string, month: number, week: number, grammar: string, vocab: string) {
  const templates: Record<string, string> = {
    A: `WARM-UP (15')
• Kiểm tra bài tập buổi trước (5')
• Ôn nhanh 5 từ vựng tuần trước (5')
• Giới thiệu chủ đề hôm nay (5')

NỘI DUNG CHÍNH — NGỮ PHÁP (60')
• Giải thích ngắn: ${grammar} (10')
• Bài tập drill: 20-30 câu fill-in-the-blank (30')
• Chữa lỗi điển hình + ghi Sổ Tay (20')

SPEAKING ỨNG DỤNG (20')
• Học viên đặt 8-10 câu dùng cấu trúc vừa học
• GV hỏi follow-up, sửa lỗi tại chỗ

ÔN TỪ VỰNG (25')
Chủ đề: ${vocab}
• Giới thiệu 15-20 từ mới qua flashcard (10')
• Bài tập đặt câu với từ mới (10')
• Ôn collocation + cụm từ hay gặp (5')

TỔNG KẾT (5')
• Ghi lỗi vào Sổ Tay Lỗi Sai
• Giao bài tập về nhà
• Nhắc Anki`,

    B: `WARM-UP (10')
• Ôn từ vựng tuần này (5') 
• Kiểm tra bài tập (5')

LISTENING (45')
• Nghe đoạn 2-3 phút có transcript
• Lần 1: nghe toàn bộ — ghi ý chính
• Lần 2: gap-fill + True/False
• Lần 3: đọc transcript, hỏi từ vựng

SPEAKING (50')
• Warm-up: câu hỏi gợi ý về chủ đề quen (10')
• Main task: mô tả/kể chuyện 1-2 phút (20')
• Ghi âm học viên tự nghe lại (10')
• Chữa lỗi phát âm & ngữ pháp (10')

PHÁT ÂM (15')
Chủ đề tháng ${month}: âm khó / word stress / sentence stress
• Giới thiệu quy tắc (5')
• Luyện tập với ví dụ (10')

NHẬN XÉT (10')
• Ghi lỗi vào Sổ Tay Lỗi Sai
• Giao bài tập`,

    C: `WARM-UP (10')
• Ôn từ vựng & kiểm tra bài tập (10')

READING (50')
Đoạn văn 200-350 từ chủ đề ${vocab}
• Lần 1: đọc lướt → main idea (5')
• Lần 2: đọc kỹ → detail questions (20')
• Câu hỏi vocab-in-context (10')
• Thảo luận từ vựng mới trong đoạn (15')

WRITING (50')
Chủ đề: ${grammar}
• Brainstorm ý + outline (10')
• Viết đoạn 80-150 từ (25')
  Khung: Topic sentence → 2 Supporting ideas → Concluding
• GV đọc + sửa tại chỗ (15')

TỪ VỰNG & COLLOCATION (10')
• 5-8 collocation hay từ đoạn đọc
• Đặt câu nhanh`,
  }
  return templates[type] || templates.A
}

function generateHomework(type: string, grammar: string, vocab: string) {
  const hw: Record<string, string> = {
    A: `Bài 1 (Ngữ pháp): Viết 10 câu dùng đúng cấu trúc "${grammar}". Mỗi câu về chủ đề khác nhau.
Bài 2 (Từ vựng): Anki — ôn 20 từ vừa học. Target: nhớ ≥15/20.
Bài 3 (Nộp Slack): Chụp ảnh hoặc paste 10 câu ngữ pháp.
Deadline: Trước buổi B (tối mai).`,
    B: `Bài 1 (Listening): Nghe lại đoạn hôm nay 1 lần không có transcript. Viết tóm tắt 3-5 câu.
Bài 2 (Speaking): Ghi âm 1 phút nói về chủ đề "${vocab}". Gửi vào Slack.
Bài 3 (Phát âm): Luyện 10 từ theo bảng phát âm hôm nay. Ghi âm gửi GV nghe.
Deadline: Trước buổi C (Thứ 6).`,
    C: `Bài 1 (Reading): Tìm 1 đoạn văn ngắn (150-250 từ) về chủ đề "${vocab}" trên BBC/VOA. Ghi 5 từ mới.
Bài 2 (Writing): Viết lại đoạn hôm nay sau khi GV sửa. Nộp bản sạch qua Slack.
Bài 3 (Vocab): Thêm 10 từ mới hôm nay vào Anki.
Deadline: Trước buổi A tuần sau.`,
  }
  return hw[type] || hw.A
}

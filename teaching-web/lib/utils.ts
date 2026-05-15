import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string, pattern = 'dd/MM/yyyy') {
  return format(new Date(date), pattern, { locale: vi })
}

export function timeAgo(date: Date | string) {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: vi })
}

export function getSessionTypeLabel(type: 'A' | 'B' | 'C') {
  const labels = {
    A: 'Buổi A — Ngữ pháp & Từ vựng',
    B: 'Buổi B — Nghe & Nói & Phát âm',
    C: 'Buổi C — Đọc & Viết',
  }
  return labels[type]
}

export function getSessionTypeSummary(type: 'A' | 'B' | 'C') {
  const summaries = {
    A: 'Ngữ pháp 60\' + Speaking 20\' + Từ vựng 40\'',
    B: 'Listening 45\' + Speaking 50\' + Phát âm 15\' + Nhận xét 10\'',
    C: 'Reading 50\' + Writing 50\' + Từ vựng 20\'',
  }
  return summaries[type]
}

export function getPhaseLabel(phase: string) {
  const phases: Record<string, string> = {
    YEAR1_FOUNDATION: 'Năm 1 — Nền tảng',
    YEAR2_IELTS: 'Năm 2 — IELTS',
  }
  return phases[phase] ?? phase
}

export function getRubricColor(score: number | null | undefined) {
  if (!score) return 'text-ink-tertiary'
  if (score >= 4.5) return 'text-emerald-600'
  if (score >= 3.5) return 'text-brand-500'
  if (score >= 2.5) return 'text-amber-500'
  return 'text-red-500'
}

export function getScoreEmoji(score: number | null | undefined) {
  if (!score) return '—'
  if (score >= 4.5) return '🌟'
  if (score >= 3.5) return '✅'
  if (score >= 2.5) return '📈'
  return '⚡'
}

export const SKILL_LABELS = {
  grammar: 'Ngữ pháp',
  vocabulary: 'Từ vựng',
  listening: 'Nghe',
  speaking: 'Nói',
  reading: 'Đọc',
  writing: 'Viết',
}

export const ROADMAP_MONTHS: Record<number, { grammar: string; vocabulary: string; focus: string }> = {
  1: { grammar: 'Thì hiện tại đơn & tiếp diễn', vocabulary: 'Hành động hàng ngày, gia đình', focus: 'Nền tảng cơ bản nhất' },
  2: { grammar: 'Thì quá khứ đơn & tiếp diễn', vocabulary: 'Du lịch, thành phố', focus: 'Kể chuyện quá khứ' },
  3: { grammar: 'Thì tương lai (will, going to)', vocabulary: 'Kế hoạch, sự kiện', focus: 'Diễn đạt tương lai' },
  4: { grammar: 'Thì hoàn thành (Present Perfect)', vocabulary: 'Kinh nghiệm, thành tựu', focus: 'Kinh nghiệm cá nhân' },
  5: { grammar: 'Câu bị động (Passive Voice)', vocabulary: 'Khoa học, quy trình', focus: 'Văn phong học thuật nhẹ' },
  6: { grammar: 'Câu điều kiện 0 & 1', vocabulary: 'Môi trường, sức khỏe', focus: 'Diễn đạt điều kiện' },
  7: { grammar: 'Mệnh đề quan hệ (Relative Clauses)', vocabulary: 'Pháp luật, xã hội', focus: 'Câu phức tạp hơn' },
  8: { grammar: 'Câu điều kiện 2 & so sánh', vocabulary: 'Kinh tế, tài chính cơ bản', focus: 'Ngữ pháp nâng cao' },
  9: { grammar: 'Modal verbs nâng cao', vocabulary: 'Giáo dục, nghề nghiệp', focus: 'Liên kết ý' },
  10: { grammar: 'Reported Speech', vocabulary: 'Công nghệ, truyền thông', focus: 'IELTS-lite nhẹ' },
  11: { grammar: 'Ôn tập & hợp nhất', vocabulary: 'Ôn tổng hợp', focus: 'Kiểm tra nền đầy đủ' },
  12: { grammar: 'Tổng kết Năm 1', vocabulary: 'Tổng hợp 600+ từ', focus: 'Rubric năng lực + Chốt Năm 2' },
}

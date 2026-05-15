# -*- coding: utf-8 -*-
"""Rebuild HƯỚNG DẪN TOÀN BỘ + README từ bản textutil, áp dụng chỉnh sửa Năm 1 nền."""
import subprocess
from pathlib import Path

from docx import Document
from docx.shared import Pt

BASE = Path(__file__).resolve().parent.parent
DOC_GUIDE = BASE / "📖 HƯỚNG DẪN SỬ DỤNG TOÀN BỘ HỆ THỐNG.docx"
DOC_README = BASE / "02 - Theo Dõi Tiến Độ" / "🗺️ [README] Sơ Đồ Liên Kết & Hướng Dẫn Sử Dụng.docx"


def export_txt(docx_path: Path) -> str:
    r = subprocess.run(
        ["textutil", "-convert", "txt", str(docx_path), "-stdout"],
        check=True,
        capture_output=True,
        text=True,
    )
    return r.stdout


def write_plain_doc(path: Path, lines: list[str]):
    doc = Document()
    doc.styles["Normal"].font.name = "Times New Roman"
    doc.styles["Normal"].font.size = Pt(11)
    for line in lines:
        doc.add_paragraph(line)
    path.parent.mkdir(parents=True, exist_ok=True)
    doc.save(path)


def patch_system_guide(text: str) -> str:
    insert_after = "Không nhập trùng lặp vào nhiều nơi — tốn thời gian và dễ sai."
    addition = (
        "\n\nNĂM 1 — NỀN TẢNG (cập nhật theo feedback học viên):\n"
        "• File [01] Lộ Trình Chi Tiết = 12 tháng nền tiếng Anh; không lấy band IELTS làm mục tiêu chính theo tháng.\n"
        "• Mỗi tuần có khung 3 buổi A/B/C (Ngữ pháp+drill / Nghe+Nói / Đọc+Viết nền) — chi tiết trong file lộ trình.\n"
        "• Kiểm tra tháng Năm 1 = kiểm tra nền + rubric năng lực; band chỉ ghi khi có bài tham chiếu (đầu vào / cuối năm).\n"
        "• Năm 2 IELTS: chỉ outline trong file lộ trình; chi tiết bổ sung sau khi hết Năm 1.\n\n"
        "ĐỒNG BỘ GOOGLE DRIVE (thủ công sau mỗi lần sửa file local):\n"
        "https://drive.google.com/drive/folders/1z6j1EKRVZ915mo8E-9aLk02Z_smleTvc?usp=sharing"
    )
    if insert_after in text and addition.strip() not in text:
        text = text.replace(insert_after, insert_after + addition)

    text = text.replace(
        "[1B] 📅 Lộ Trình Chi Tiết 12 Tháng\n"
        "  Đây là gì: Kế hoạch dạy từng tuần trong 12 tháng",
        "[1B] 📅 Lộ Trình Chi Tiết 12 Tháng\n"
        "  Đây là gì: Kế hoạch Năm 1 — nền tảng tiếng Anh (12 tháng), có tuần/ngữ pháp/bài tập và khung buổi A/B/C",
    )
    text = text.replace(
        "    → SAU KHI CÓ KẾT QUẢ TEST ĐẦU VÀO: gửi cho Claude để điều chỉnh tự động",
        "    → SAU KHI CÓ KẾT QUẢ TEST ĐẦU VÀO: gửi cho Claude để điền mục C (năng lực) + ưu tiên ngữ pháp/từ vựng — không ép điều chỉnh band theo tháng",
    )

    text = text.replace(
        "[2C] 📊 Sheet Đánh Giá Từng Tháng\n"
        "  Đây là gì: Báo cáo band score và tiến độ theo tháng\n"
        "  Dùng khi nào: Cuối tháng, sau bài kiểm tra tháng (15 phút)\n"
        "  Cách dùng:\n"
        "    → Điền điểm bài kiểm tra tháng → quy đổi ra band IELTS\n"
        "    → So sánh với tháng trước → đánh giá đạt/chưa đạt mục tiêu\n"
        "    → Điền kế hoạch điều chỉnh tháng sau nếu cần",
        "[2C] 📊 Sheet Đánh Giá Từng Tháng\n"
        "  Đây là gì: Theo dõi tiến độ năng lực hàng tháng (Năm 1: rubric nền; band IELTS chỉ tùy chọn)\n"
        "  Dùng khi nào: Cuối tháng, sau bài kiểm tra tháng (15 phút)\n"
        "  Cách dùng:\n"
        "    → Điền điểm/rubric bài kiểm tra nền (ngữ pháp, nghe, đọc, viết ngắn, nói nếu có)\n"
        "    → Ghi nhận xét điểm mạnh/yếu so với tháng trước (không bắt buộc quy đổi band mỗi tháng)\n"
        "    → Nếu có band tham chiếu (mock nhẹ cuối năm): ghi một dòng, không dùng làm KPI chính Năm 1\n"
        "    → Điền kế hoạch điều chỉnh tháng sau nếu cần",
    )

    text = text.replace(
        "    → Cập nhật bảng Milestone khi đạt từng mốc band",
        "    → Cập nhật bảng Milestone theo mốc nền (ví dụ: xong Q1 ngữ pháp cốt lõi; nói 2 phút liền; 600 từ chủ đề X)",
    )

    text = text.replace(
        "[3B] 📝 TEMPLATE - Bài Test Mini Hàng Tuần\n"
        "  Đây là gì: Bài kiểm tra nhanh 30 phút cuối tuần\n"
        "  Dùng khi nào: Buổi cuối tuần (tuần 2-3 trở đi)\n"
        "  Cách dùng:\n"
        "    → Copy template → đổi tên \"Test Mini - Tuần [số]\"\n"
        "    → Soạn câu hỏi Listening + Reading + Writing phù hợp trình độ\n"
        "    → Cho Huyền Trang làm trong buổi học (bấm giờ thật)\n"
        "    → Chấm điểm ngay sau đó, điền vào Sheet Tổng Kết Tuần",
        "[3B] 📝 TEMPLATE - Bài Test Mini Hàng Tuần\n"
        "  Đây là gì: Kiểm tra nền ngắn ~30 phút (không phải mini IELTS full trong phần lớn Năm 1)\n"
        "  Dùng khi nào: Buổi cuối tuần (từ tuần 2 trở đi)\n"
        "  Cách dùng:\n"
        "    → Copy template → đổi tên \"Test Mini - Tuần [số]\"\n"
        "    → Soạn: ngữ pháp (ngắn) + listening 1 đoạn + reading 1 đoạn + viết 80–120 từ\n"
        "    → Từ tháng 10–11 có thể thêm 1 phần nhỏ dạng gần IELTS (tùy tiến độ)\n"
        "    → Cho Huyền Trang làm trong buổi học (bấm giờ thật)\n"
        "    → Chấm điểm ngay sau đó, điền vào Sheet Tổng Kết Tuần",
    )

    text = text.replace(
        "[4B] 📝 TEMPLATE - Bài Kiểm Tra Tháng\n"
        "  Đây là gì: Đề thi cuối tháng đủ 4 kỹ năng\n"
        "  Dùng khi nào: Buổi cuối cùng của mỗi tháng\n"
        "  Cách dùng:\n"
        "    → Copy → đổi tên \"Kiểm Tra - Tháng [số]\"\n"
        "    → Soạn câu hỏi dựa trên nội dung đã dạy tháng đó\n"
        "      (xem Sheet Tổng Kết Tuần để biết đã dạy gì)\n"
        "    → Phần từ vựng: lấy từ Sheet Từ Vựng (chọn 20 từ tháng đó)\n"
        "    → Chấm điểm → điền vào Sheet Đánh Giá Tháng\n"
        "    → Viết Báo Cáo Tháng dựa trên kết quả",
        "[4B] 📝 TEMPLATE - Bài Kiểm Tra Tháng\n"
        "  Đây là gì: Bài kiểm tra cuối tháng (Năm 1: nền — đủ 4 kỹ năng nhưng độ khó và format là kiểm tra năng lực, không bắt buộc mock IELTS)\n"
        "  Dùng khi nào: Buổi cuối cùng của mỗi tháng\n"
        "  Cách dùng:\n"
        "    → Copy → đổi tên \"Kiểm Tra - Tháng [số]\"\n"
        "    → Soạn theo nội dung đã dạy (Sheet Tổng Kết Tuần)\n"
        "    → Phần từ vựng: lấy từ Sheet Từ Vựng (chọn ~20 từ tháng đó)\n"
        "    → Chấm theo rubric nền → điền vào Sheet Đánh Giá Tháng\n"
        "    → Viết Báo Cáo Tháng (ưu tiên nhận xét cá nhân + mục tiêu năng lực tháng sau)",
    )

    text = text.replace(
        "    → Giai đoạn 1: BBC 6 Minute English + Anki + British Council\n"
        "    → Giai đoạn 2-3: Cambridge Official Tests + IELTS Liz",
        "    → Cả Năm 1: ưu tiên BBC 6 Minute English + Anki + British Council (Grammar/Vocab/A2–B1 materials)\n"
        "    → Cambridge Official Tests + IELTS Liz: dùng nhiều hơn từ Năm 2 (giai đoạn IELTS), không ép full test trong Năm 1",
    )

    text = text.replace(
        "📌 DATABASE: ĐÁNH GIÁ TỪNG THÁNG\n"
        "  Đây là gì: 12 tháng đã tạo sẵn với mục tiêu band từng tháng\n"
        "  Cách dùng:\n"
        "    → Cuối mỗi tháng: mở tháng tương ứng → điền band score thực tế\n"
        "    → So sánh với \"Mục tiêu band\" đã set sẵn\n"
        "    → Điền điểm mạnh/yếu → tự động có cơ sở viết báo cáo tháng",
        "📌 DATABASE: ĐÁNH GIÁ TỪNG THÁNG\n"
        "  Đây là gì: 12 tháng theo dõi — Năm 1: mục tiêu năng lực + rubric nền (band không bắt buộc mỗi tháng)\n"
        "  Cách dùng:\n"
        "    → Cuối mỗi tháng: điền kết quả kiểm tra nền + nhận xét\n"
        "    → So sánh với checklist nền trong file lộ trình / MASTER (review quý)\n"
        "    → Điền điểm mạnh/yếu → làm cơ sở viết báo cáo tháng",
    )

    old_claude = '''BƯỚC 2: Mở Claude → gửi ảnh bài làm + nhắn:
         "Đây là bài test đầu vào của Huyền Trang.
          Hãy phân tích và fill vào hệ thống cho tôi."
BƯỚC 3: Claude sẽ tự động:
  → Phân tích điểm mạnh/yếu từng kỹ năng
  → Điền kết quả vào Hồ Sơ Học Viên
  → Điều chỉnh Lộ Trình theo trình độ thực tế
  → Xác định ngữ pháp và từ vựng cần ưu tiên
  → Soạn sẵn nội dung 4 buổi đầu tiên
  → Tạo bài tập tuần 1 phù hợp trình độ'''

    new_claude = '''BƯỚC 2: Mở Claude → gửi ảnh bài làm + nhắn:
         "Đây là bài test đầu vào của Huyền Trang (Năm 1 nền tảng).
          Hãy: (1) phân tích điểm mạnh/yếu từng kỹ năng dạng năng lực nền;
          (2) gợi ý điền mục C trong Hồ Sơ (không ép band theo tháng);
          (3) đề xuất chỉnh nhẹ tuần 1–4 trong Lộ Trình nếu cần;
          (4) liệt kê 5–8 chủ đề ngữ pháp ưu tiên + 5 chủ đề từ vựng;
          (5) soạn dàn ý 3 buổi đầu theo khung A/B/C + bài tập về nhà tuần 1."
BƯỚC 3: Claude hỗ trợ — GV luôn rà soát và chỉnh tay trước khi dạy.'''

    text = text.replace(old_claude, new_claude)

    text = text.replace(
        "Cập nhật lần cuối: 13/05/2026",
        "Cập nhật lần cuối: 14/05/2026",
    )
    return text


def build_readme_docx():
    """README sơ đồ — giữ luồng, đổi milestone band sang mốc nền + link Drive."""
    lines = [
        "━" * 40,
        "SƠ ĐỒ LIÊN KẾT TOÀN BỘ HỆ THỐNG",
        'Đây là "bản đồ" để bạn hiểu dữ liệu chảy từ file nào sang file nào',
        "━" * 40,
        "",
        "LUỒNG DỮ LIỆU CHÍNH (giữ nguyên):",
        "",
        "BÀI TEST ĐẦU VÀO",
        "      ↓ (điền kết quả năng lực vào)",
        "[MASTER] HỒ SƠ HỌC VIÊN ──────────────────────────────┐",
        "      ↓ (mục tiêu Năm 1 nền + review quý)              │",
        "LỘ TRÌNH CHI TIẾT 12 THÁNG (Năm 1 nền)                 │",
        "      ↓ (biết tuần này dạy gì + buổi A/B/C)             │",
        "GIÁO ÁN TỪNG BUỔI                                       │",
        "      ↓ (sau buổi học, copy sang)                        │",
        "      ├──→ SHEET THEO DÕI TỪNG BUỔI                      │",
        "      ├──→ DANH SÁCH TỪ VỰNG (thêm từ mới)               │",
        "      ├──→ GHI CHÚ NGỮ PHÁP (thêm điểm mới)              │",
        "      └──→ SỔ TAY LỖI SAI (ghi lỗi học viên)             │",
        "                  ↓ (tổng hợp 3 buổi/tuần)               │",
        "            SHEET TỔNG KẾT TUẦN                          │",
        "            BÀI TẬP TUẦN (soạn từ lộ trình)             │",
        "            BÀI TEST MINI TUẦN (kiểm tra nền)            │",
        "                  ↓ (tổng hợp theo tháng)                 │",
        "            SHEET ĐÁNH GIÁ THÁNG (rubric nền Năm 1)      │",
        "            BÀI KIỂM TRA THÁNG (nền, không mock IELTS)   │",
        "            BÁO CÁO THÁNG ────────────────────────────────┘",
        "                  (gửi cho học viên + cập nhật Hồ Sơ khi cần)",
        "",
        "━" * 40,
        "MỐC TIẾN ĐỘ (Năm 1 — theo quý, không ép band T3/T6)",
        "━" * 40,
        "Hết Quý 1 (tháng 3): Checklist thì cơ bản + câu hỏi + viết đoạn ngắn + nói 90s–2 phút.",
        "Hết Quý 2 (tháng 6): Passive/conditional/relative; đọc 250–350 từ; viết 130–150 từ.",
        "Hết Quý 3 (tháng 9): Liên kết đoạn; nói dài hơn; đọc phân tích nhẹ.",
        "Hết Quý 4 / tháng 12: Tổng kết nền + checklist 'sẵn sàng Năm 2 IELTS' (outline trong file lộ trình).",
        "Năm 2: Giai đoạn IELTS — mock, band mục tiêu, đăng ký thi (chi tiết bổ sung sau).",
        "",
        "━" * 40,
        "WORKFLOW HÀNG NGÀY — GIÁO VIÊN (giữ nguyên thứ tự công việc)",
        "━" * 40,
        "TRƯỚC BUỔI HỌC (15 phút):",
        "  1. Mở Lộ Trình → xem tuần này dạy gì + buổi hôm nay là A, B hay C",
        "  2. Mở Giáo Án Template → copy, đổi tên \"Giáo Án - Buổi X - [ngày]\"",
        "  3. Điền nội dung chính vào Giáo Án (gồm số lượng bài tập ngữ pháp)",
        "  4. Mở Sổ Tay Lỗi Sai → nhớ lỗi hay mắc để ôn đầu buổi",
        "  5. Mở Danh Sách Từ Vựng → chọn 5 từ để kiểm tra đầu buổi",
        "TRONG BUỔI HỌC:",
        "  6. Điền thông tin vào Giáo Án theo thời gian thực",
        "SAU BUỔI HỌC (10 phút):",
        "  7. Hoàn chỉnh Giáo Án (đánh giá, bài tập về nhà)",
        "  8. Copy từ vựng mới → Danh Sách Từ Vựng",
        "  9. Copy lỗi sai → Sổ Tay Lỗi Sai",
        "  10. Điền 1 dòng vào Sheet Theo Dõi Buổi Học",
        "CUỐI TUẦN (20 phút):",
        "  11. Điền 1 dòng vào Sheet Tổng Kết Tuần",
        "  12. Copy Bài Tập Tuần template → soạn bài tập mới",
        "  13. Gửi Bài Tập Tuần cho học viên qua Slack/Gmail",
        "CUỐI THÁNG (45 phút):",
        "  14. Điền Sheet Đánh Giá Tháng (rubric nền)",
        "  15. Copy Bài Kiểm Tra Tháng template → soạn đề kiểm tra nền",
        "  16. Chấm bài, điền điểm vào Sheet",
        "  17. Viết Báo Cáo Tháng → gửi cho học viên",
        "  18. Cập nhật Nhật Ký Tiến Bộ",
        "",
        "━" * 40,
        "WORKFLOW KHI CÓ KẾT QUẢ BÀI TEST ĐẦU VÀO",
        "━" * 40,
        "1. Chụp/scan bài test đầu vào",
        '2. Gửi cho Claude: xem prompt trong file "HƯỚNG DẪN SỬ DỤNG TOÀN BỘ HỆ THỐNG" (Phần 5)',
        "3. Claude gợi ý điền MASTER mục C + ưu tiên ngữ pháp/từ — GV rà soát trước khi dạy",
        "",
        "━" * 40,
        "DANH SÁCH LINK GOOGLE (folder chính)",
        "━" * 40,
        "Folder Drive: https://drive.google.com/drive/folders/1z6j1EKRVZ915mo8E-9aLk02Z_smleTvc?usp=sharing",
        "",
        "FOLDER 01 - Lộ Trình & Kế Hoạch:",
        "  → [MASTER] Hồ Sơ Học Viên:       https://docs.google.com/document/d/19wJyyFu97jKUzY85nMTl3b1Ns_1N3h85Jddiy__MfKM",
        "  → Lộ Trình Chi Tiết 12 Tháng:    https://docs.google.com/document/d/1GBqrnBul89WeCIbFy6f3ni1zgDMqrq5Y_7sq4T8f9vA",
        "  → Template Giáo Án Từng Buổi:    https://docs.google.com/document/d/109J6WD3O8omUuHItaVVWM2PMeFtM_WiWKl7eJmQnHCk",
        "",
        "FOLDER 02 - Theo Dõi Tiến Độ:",
        "  → Sheet Theo Dõi Từng Buổi:      https://docs.google.com/spreadsheets/d/1ZobFPetOfmRdGxVt1vgUaa_iGs-eXBtFNZ4O2uGV4RQ",
        "  → Sheet Tổng Kết Từng Tuần:      https://docs.google.com/spreadsheets/d/1rKgTtCC4bqbPODa-BKPlhT5BfEA5-OHlg380gYa4nhE",
        "  → Sheet Đánh Giá Từng Tháng:     https://docs.google.com/spreadsheets/d/15w4wkzg7cg828f6Hpl_o42H53MnceE5kTkkkxaPR_y4",
        "  → Nhật Ký Tiến Bộ:               https://docs.google.com/document/d/1R8aNU4IQFH0B2B1VV2U41oK46tTFsnLvIVw_SKbW5lw",
        "",
        "FOLDER 03 - Bài Tập Theo Tuần:",
        "  → Template Bài Tập Từng Tuần:    https://docs.google.com/document/d/1Bm30p-pR4hBkK2fw-n_LzdXmw_bikZpzTj6She__Y64",
        "",
        "FOLDER 04 - Kiểm Tra & Đánh Giá:",
        "  → Bài Test Đầu Vào:              https://docs.google.com/document/d/1lq7J6AUv0ke49Qlkb9CW-3bvWCC62LeQ_9-L66CSFC0",
        "  → Template Bài Kiểm Tra Tháng:   https://docs.google.com/document/d/10hqkziDyJyNSryyF9vI1bYIKXUCyg1k3MFS-wq38ZE8",
        "  → Template Test Mini Tuần:       https://docs.google.com/document/d/1pPF5XvI5AJkEW2YgXIFM0f0fM6uNgbJ5O4rA_Vjj02U",
        "  → Template Báo Cáo Tháng:        https://docs.google.com/document/d/1xDM9F88bm2nQdX5AA0Q_9uNL1hPDLkAlzzy39LDYDHk",
        "",
        "FOLDER 05 - Từ Vựng & Ngữ Pháp:",
        "  → Danh Sách Từ Vựng:             https://docs.google.com/spreadsheets/d/109g2QN8zyUXpeCPZnndr0QX3k5ZXGXKZCj-wusygyM8",
        "  → Ghi Chú Ngữ Pháp:              https://docs.google.com/document/d/1XpPgC2dQ2pWtju_gKOstiaj8QiuM2vzeoRt_81OVtTA",
        "  → Sổ Tay Lỗi Sai:                https://docs.google.com/document/d/1cRwy_UranxO1oA_DPwcwGxl3UHNu-oIGCFTLcppfWQE",
        "",
        "FOLDER 06 - Tài Liệu Tham Khảo:",
        "  → Tài Nguyên Học Tập:            https://docs.google.com/document/d/1P3QT9KuF3KyNCL-xXjlevYBDtoILcoxmSekOfG74WQA",
    ]
    write_plain_doc(DOC_README, lines)


def main():
    text = export_txt(DOC_GUIDE)
    text = patch_system_guide(text)
    write_plain_doc(DOC_GUIDE, text.splitlines())
    build_readme_docx()
    print("Updated", DOC_GUIDE)
    print("Updated", DOC_README)


if __name__ == "__main__":
    main()

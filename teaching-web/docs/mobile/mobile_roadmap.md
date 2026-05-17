# TA English Hub — Mobile roadmap

**Status:** Draft v0.2 — 2026-05-17 — strategic decisions locked
**Author:** Claude (acting as senior eng + PM)
**Builds on:** `mobile_api_contract.md`, `offline_sync_rules.md`, `deep_linking_rules.md` (Phase 8)

## Locked strategic decisions

Confirmed bởi TA Xuan Tai trong session ngày 2026-05-17:

| Quyết định | Chọn |
|----------|------|
| Beta platform thứ tự | **Android-first** (Google Internal Track), iOS sau khi Android ổn |
| Monetize V1 | **Free, web login**. Không IAP. Pro tier (nếu có) bán qua web |
| Teacher/Builder/Admin mobile | **Cắt hoàn toàn V1.** Login mobile → nếu role ≠ STUDENT → screen "Bạn dùng web nhé" + nút mở browser |
| Timeline target | **10-12 tuần** end-to-end (đầy đủ M0-M6, không cắt offline scope) |

**Hệ quả:**
- Bỏ TestFlight phần M6 V1; chỉ Google Internal Track + Play Store internal/closed testing. iOS shift sang V1.1.
- Bỏ IAP / entitlement validation backend khỏi M0. Mọi entitlement check vẫn dựa vào User.role từ JWT.
- M0 không cần `MobileAuthGuard` cho TEACHER — student-only routing đủ.
- M3 stretch (writing prompt) vẫn giữ, không cắt.

## 1. Strategy in one sentence

Mobile là **companion-first cho 4 nghiệp vụ "đi đường"** (Today Plan / Vocab SRS / Speaking record / AI feedback nhận lại), không phải full clone của web. Teacher Studio, Builder, Admin Console giữ nguyên web-only.

## 2. Vì sao chỉ làm subset

- Web đã ship Phase 0-9. Mọi sửa đổi nội dung (admin / builder / teacher) hợp tự nhiên với chuột + bàn phím + màn hình lớn.
- Mobile cạnh tranh thắng ở: 5-15 phút mỗi lần, offline-tolerant, push-notification, ghi âm dễ.
- Apple/Google review siết hơn với app có quá nhiều surface — gom focus = giảm rủi ro reject.
- 1 dev (TA) khó duy trì 2 codebase ngang nhau. Subset đồng nghĩa ít UI để bảo trì.

## 3. Personas mobile (subset của 5 web personas)

| Persona | Web | Mobile | Lý do |
|---------|-----|--------|------|
| Learner: Foundation / IELTS / Adult | ✓ | ✓✓ Trọng tâm | Học mọi lúc, offline trên bus |
| Teacher | ✓✓ | (view-only stretch) | Workflow nặng — vẫn dùng web |
| Admin / Founder | ✓✓ | ✗ | Governance = desktop |

## 4. Feature subset cho V1 (ranked by must-have)

1. **Login + role detect** — chỉ STUDENT vào được; TEACHER/ADMIN hiển thị "Bạn dùng web nhé" + deep-link mở web.
2. **Today Plan** — đọc + tick block COMPLETED, idempotent retry (đã spec trong offline_sync_rules.md).
3. **Source Card** — render approved-only sources, route opener (URL/timestamp/page) qua deep link hoặc external browser.
4. **Vocab SRS** — flashcard rate (Good/Easy/Hard/Fail) — endpoint `PATCH /api/vocab` đã có.
5. **Speaking record + AI feedback** — `expo-av` ghi 30-120s, upload blob, gọi `POST /api/ai/score-speaking`, hiển thị band.
6. **AI feedback inbox** — list + detail, badge khi teacher đã review.
7. **Push reminders** — đăng ký device, server gửi reminder daily lúc 19:00 nếu chưa hoàn thành Today Plan.

**KHÔNG có trong V1:** Writing prompt (UX gõ tiếng Anh dài trên mobile kém), Mock test full 2h (TestFlight reviewer sẽ bóc lỗi), Strategy article reader (dùng web), Builder/Teacher surfaces.

**Đặt phase 2:** Reading mode cho strategy / sample essay (read-only), Writing prompt với gợi ý ngắn.

## 5. Architecture quyết định

| Quyết định | Chọn | Lý do |
|----------|------|------|
| Framework | **Expo (managed)** | EAS Build, OTA updates, 1 dev kham được |
| Router | **expo-router** (file-system) | Cùng pattern Next.js App Router → quen tay |
| State | **TanStack Query** + Zustand | Offline cache + retry built-in |
| Auth | **JWT bearer** endpoint mới (`/api/mobile/auth/...`) | NextAuth cookie không hoạt động native |
| Storage | `expo-secure-store` cho token, `AsyncStorage` cho cache, SQLite (expo-sqlite) cho offline pack | Đủ V1, upgrade WatermelonDB nếu scale |
| Audio | `expo-av` record + upload blob | Native module zero-config |
| Push | **Expo Push** (server gửi qua Expo's relay) | Đỡ phải dựng APNs/FCM cert ngay |
| Charts (radar/band) | `react-native-svg` + tự vẽ hoặc Victory Native | recharts không chạy RN |
| i18n | Tiếng Việt only V1, key-value file `messages/vi.json` | Mở đường EN sau |

## 6. Monorepo refactor (M0 prerequisite)

Hiện tại: `teaching-web/` là flat Next.js.
Target:

```
/apps
  /web              ← di chuyển từ teaching-web (giữ git history bằng git mv)
  /mobile           ← Expo app mới
/packages
  /contracts        ← extract từ teaching-web/lib/contracts/ — TS types share
  /api-client       ← typed fetch wrapper, dùng `contracts`
  /tokens           ← shadcn HSL vars + RN equivalent (optional)
/docs               ← đã có
```

Tooling: `pnpm workspaces` + `turbo` (build cache).

**Rủi ro refactor:** đường dẫn `@/lib/...` trong app/web phải đổi → sed search + replace + lint pass. 1-2 ngày làm trên branch riêng.

## 7. Auth endpoints mới (M0 backend)

```
POST /api/mobile/auth/login       { email, password } → { accessToken, refreshToken, user, expiresIn }
POST /api/mobile/auth/refresh     { refreshToken }    → { accessToken, expiresIn }
POST /api/mobile/auth/logout      auth header         → { ok }
POST /api/mobile/devices          { pushToken, platform, deviceName } → device (upsert)
DELETE /api/mobile/devices/:id    auth header         → { ok }
```

Server-side:
- Reuse User table; thêm `DeviceSession` model (đã spec section 6 của SOT).
- JWT signed bằng `NEXTAUTH_SECRET`, exp 30 ngày refresh + 1 giờ access (tunable).
- Middleware `authorize-bearer` cho mọi `/api/*` ngoài `/api/auth/*` và `/api/version` — chấp nhận cookie HOẶC bearer.

## 8. Phases

### M0 — Foundation (1-2 tuần)
**Deliverables:**
- Monorepo refactor + pnpm workspaces + turbo
- `packages/contracts` extract xong, web vẫn build
- `/api/mobile/auth/*` endpoints + DeviceSession migration
- Bearer middleware
**Done khi:** web build sạch trong monorepo; gọi `POST /api/mobile/auth/login` bằng curl trả về JWT; teacher cookie vẫn vào web.

### M1 — Expo skeleton + Today Plan (1-2 tuần)
**Deliverables:**
- `apps/mobile` Expo + expo-router
- Login screen → store secure token → redirect
- Today screen: gọi `GET /api/today`, render block list, tick block → `PATCH /api/today/items/:blockId`
- Deep link map từ `deep_linking_rules.md` (Phase 8)
**Done khi:** 1 student có thể login, thấy plan, tick 1 block, XP tăng ở web sau khi reload.

### M2 — Reads (2 tuần)
- Source Card component + route opener
- Vocab SRS flashcard với rate (Good/Easy/Hard/Fail)
- AI feedback inbox (list + detail, read-only)
- Module browser (PUBLISHED only) — optional
**Done khi:** student có thể hoàn thành 10 thẻ vocab, đọc feedback teacher đã approve.

### M3 — Writes (2 tuần)
- Speaking record: expo-av record + waveform UI + upload blob
- `POST /api/ai/score-speaking` flow + spinner + band display
- (Stretch) Writing prompt với 200-từ limit
**Done khi:** student ghi 60s nói → 15s sau thấy band 6.0 + AI feedback chi tiết.

### M4 — Offline + sync (2-3 tuần)
- React Query cache + AsyncStorage persistor
- Retry queue cho idempotent writes theo bảng `offline_sync_rules.md`
- SQLite cho offline pack (lesson block + source metadata, không cache audio lớn)
- Conflict UI: server-wins + toast "1 thay đổi từ server" khi cache stale
**Done khi:** chế độ máy bay 5 phút → tick 3 block → bật lại wifi → 3 ticks lên server không double-XP.

### M5 — Push + reminders (1 tuần)
- Đăng ký Expo push token sau login
- Job server: cron 19:00 mỗi ngày, gửi push cho student có plan PLANNED hoặc IN_PROGRESS
- Deep link từ push → `/student/today`
**Done khi:** push lúc 19:00 → tap → mở Today Plan đúng item chưa xong.

### M5.5 — Polish (1 tuần)
- Empty states, loading states, error boundaries
- Accessibility (labels, contrast)
- Onboarding 3 màn hình (Welcome → Login → Today)
- App icon + splash screen + brand colors

### M6 — Beta + Store (2 tuần)
- EAS Build internal track (Android) + TestFlight (iOS)
- 10-20 beta tester từ học viên hiện có
- Privacy policy public URL + data-collection disclosure (yêu cầu Apple)
- App Store + Play Store listings (vi-VN first)
- Crash analytics: Sentry hoặc EAS Insights
**Done khi:** App live trên TestFlight + Google Internal; 5 student dùng 1 tuần không crash.

## 9. Rủi ro + giảm thiểu

| Rủi ro | Mức | Giảm thiểu |
|--------|-----|-----------|
| Apple reject vì link OUT đến sách bản quyền | CAO | Trust level + license status đã có ở schema; mobile chỉ hiện APPROVED + LINK_ONLY/EMBED_ALLOWED; mọi "Mở sách" mở external browser (không in-app webview embed) |
| AI quota explode khi nhiều user | TRUNG | `AI_MOCK=1` đã có; rate-limit /api/ai/* per user per day; teacher review trước khi expose |
| NextAuth cookie không native | CAO | M0 chốt JWT bearer; refresh + secure-store |
| Audio upload chậm trên 3G | TRUNG | Compress + chunked upload; show progress |
| Offline conflict (student tick 1 block khi ai khác đã đổi server) | TRUNG | Server-wins + idempotency key đã spec |
| Vietnamese ASO ít data | THẤP | Beta + tracking quan trọng hơn ASO V1 |

## 10. Open questions còn lại

Sau session 2026-05-17, 4/5 đã chốt (xem **Locked strategic decisions** đầu doc). Còn lại:

- **Beta cohort size**: 10 / 30 / 50 student? (ảnh hưởng support load M6) — chốt trước M5.
- **Apple Dev account**: $99/năm — có cần đăng ký ngay hay đợi V1.1 iOS? Khuyến nghị: đăng ký song song M0 vì verify mất 1-3 ngày.
- **Google Play Console**: $25 one-time — đăng ký trong M0.
- **Sentry hay EAS Insights** cho crash analytics M6? EAS Insights free, integrate sẵn — recommend EAS.

## 11. Khi nào bắt đầu

**Điều kiện trước M0 (gate check):**
- [x] Web Phase A.2 ổn định — Migration shadcn vừa xong commit `acc6dc2`. Ổn định 1 tuần nữa = OK quanh 2026-05-24.
- [ ] **Google Play Console** đã đăng ký ($25 one-time) — TODO trong tuần này.
- [ ] Apple Developer — defer V1.1.
- [ ] Có 5-10 student volunteer làm beta tester thật.
- [ ] Web có 3-5 modules PUBLISHED + 50 vocab cards seeded — chạy `npm run db:seed` xác nhận.

**Stop nếu:**
- Web còn churn UI / schema lớn → mobile sẽ phải reimplement.
- AI quota không ổn định → mobile sẽ kéo quota chính.
- Chưa có 3-5 modules PUBLISHED + 50 vocab cards seed → mobile không có gì để show.

## 11.5 Next concrete step

**Tuần này (week of 2026-05-17):** quyết định có start M0 hay đợi web settle.

Nếu start: bắt đầu task M0.A "Monorepo skeleton":
1. Branch `chore/monorepo-prep`
2. Add `pnpm-workspace.yaml` root + `turbo.json`
3. `git mv teaching-web apps/web`
4. Fix `@/...` imports nếu cần (tsconfig paths)
5. Verify `pnpm --filter web build` clean
6. Commit + PR
7. Sau đó M0.B (extract `packages/contracts`) trong PR riêng.

Mỗi M0 sub-step nên là 1 PR riêng để rollback dễ — monorepo refactor khét lắm.

## 12. Định nghĩa thành công V1

Sau 12 tuần:
- App trên cả 2 store (hoặc TestFlight + Internal Track nếu chưa qua review)
- 20+ student active hàng tuần trên mobile
- 60%+ Today Plan hoàn thành qua mobile (vs web) — chứng tỏ mobile fit on-the-go
- Crash-free session rate ≥ 99%
- Câu hỏi mở: có bao nhiêu % AI feedback Speaking được teacher approve không cần override (chất lượng AI on-the-go)

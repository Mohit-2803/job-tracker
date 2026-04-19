# Job Agent — Daily Progress Log

## 2026-04-20 (Day 3) — Phase 2 fully closed

### Shipped
- **Cloudinary file storage:** SDK + helper with Zod-validated upload response, raw uploads to `resumes/<userId>/`, download button on detail page (`fl_attachment` forces download)
- **Schema:** `cloudinaryPublicId` added to Resume (for future cleanup jobs)
- **Avatar fix:** whitelisted Google + GitHub hosts in next.config, switched Header to `next/image` to avoid Google 429 rate limits
- **Phase 2 gap audit + fixes:**
  - `projects[]` extraction added to ResumeSchema, prompt, and edit form (was missing per PDF)
  - LLM retry: refactored `extractResumeData` to retry once with corrective prompt (`buildCorrectivePrompt` uses `error.issues`), throws on second failure — no more silent `safeParse` bypass
- **Soft-delete on Resume (Phase 4 work pulled forward):** `deletedAt DateTime?` + index, Prisma `$extends` query middleware auto-filters `deletedAt: null` on all reads (modern API; `$use` deprecated in Prisma 6)

### Decisions made
- Multi-resume profile UI **deferred** — Phase 5 will use a per-application resume picker (cleaner than `isDefault`), Phase 7 enforces Free-tier limit
- Sentry **deferred to next session** (option (a) wizard or (b) manual TBD)
- Deployment gate **relaxed**: PDF puts formal deploy at Phase 8; "deploy from Phase 1" is best-practice nudge in §19 Common Mistakes, not a hard checkpoint. Continuing to Phase 3 without prod deploy
- Database wiped today (mixed `db push` + `migrate dev` reset everything) — staying on `db push` until Phase 8 baseline migration

### Bugs fixed mid-session
- DB wiped → recreated via `npx prisma db push` + re-login
- Google avatar 429 → `next/image` proxies and caches server-side

### Phase 2 gaps still open (deferred, not blocking)
- [ ] Sentry error tracking (next session)
- [ ] Production deploy (Phase 8)
- [ ] Multi-resume profile UI (Phase 5/7)

---

## 2026-04-19 (Day 2) — Phase 2 mostly done

### Shipped
- `@t3-oss/env-nextjs` — Zod-validated env vars at startup
- Resume upload UI: react-dropzone + sonner toasts
- File parsing: `pdf-parse` v2 (PDF) + `mammoth` (DOCX)
- Groq structured extraction with Zod (`ResumeSchema`)
- Resume list page (`/dashboard/resumes`)
- Resume detail/edit page (`/dashboard/resumes/[id]`) with React Hook Form + `useFieldArray` for dynamic sections
- `PATCH /api/resumes/[id]` with ownership check pattern
- JWT session callback — `session.user.id` now available in API routes
- `WebhookEvent` model added to Prisma schema (for Phase 7 idempotency)
- Improved extraction prompt with explicit JSON template + pattern hints

### Tested with
- 3 different resumes — extraction is reasonably good now
- Edit UI saves changes correctly
- Upload auto-redirects to detail page

### Phase 2 gaps still open (finish tomorrow morning)
- [ ] **Cloudinary upload + download** — store original PDF, add download button on detail page. Env vars already wired, just need signup + 3 keys + one API integration.
- [ ] **Deploy to production** — blueprint says Phase 1 should already be live. We're 2 phases in with no live URL. Deploy target: Oracle Cloud ARM VM.
- [ ] **LLM retry with adjusted prompt on invalid JSON** — currently `safeParse` fallback only. Deferred.

### Decisions made
- Deferred Cloudinary originally, user pushed back and rightfully prioritised completion over forward motion
- Chose not to build multiple-resume-profile UI (schema supports it, low priority)
- Added two new teaching principles to CLAUDE.md: pace guardrail + deployment gate

---

## 2026-04-18 (Day 1) — Phase 1 complete

### Shipped
- Next.js 15 + TypeScript strict + Turbopack
- Prisma 6 schema applied to local Docker Postgres
- NextAuth v5 with GitHub + Google OAuth (JWT strategy)
- Protected `/dashboard/*` via middleware
- Dashboard shell: sidebar + header with avatar/logout
- Poppins font, correct app metadata
- `.env.example` committed, `.gitignore` exception for it
- Redis running in Docker Compose

# Job Agent — Daily Progress Log

## 2026-05-02 (Day 5) — Phase 3 Scraping Foundation

### Shipped

- **Strategy Pattern Interface**: Defined `ScraperAdapter` and implemented `GenericScraper` via Playwright.
- **LLM Extraction Upgrade**: Updated Groq extraction prompt to include a `_thought_process` (Chain of Thought), explicit JSON schema formatting, and automated skill normalization.
- **Async Queue Infrastructure**: Set up BullMQ with Redis. Created a separate Node.js `scraper-worker.ts` process.
- **Next.js API Route**: Implemented `POST /api/applications` to enqueue jobs asynchronously (avoiding 504 timeouts).
- **Database Schema**: Expanded `Application` model to include `workModel`, `employmentType`, and `yearsOfExperience`, and mapped the `Company` relation correctly in the worker.
- **DX Improvements**: Installed `concurrently` and set up `npm run dev:all` for single-terminal logging, fixed BullMQ's `maxRetriesPerRequest` redis strictness, and enabled VS Code format-on-save via `.vscode/settings.json`.

- **Robust Error Handling**: Added `PENDING` and `FAILED` states to the system. The worker now catches crashes and updates the database status automatically.
- **Semantic Strategic Matcher**: Upgraded scoring from "Keyword Matching" to "Holistic AI Analysis," including reasoning, missing skills, and actionable pro-tips.
- **Worker Refactor**: Reorganized the scraper worker into a modular, step-based pipeline (Scrape -> Enrich -> Analyze -> Save).

### Phase 3 Status: COMPLETED ✅ (Enhanced beyond original requirements)

---

### Advanced Learning Objectives (Optional Phase 3+ Add-ons)

We have officially finished the Phase 3 core, but we are keeping these advanced topics on our radar for future mastery:
1. **Stealth Scraping**: Using `playwright-extra` to hide our scraper fingerprint from advanced anti-bot systems.
2. **Observability (BullBoard)**: Adding a real-time dashboard to monitor Redis queues and manage jobs.
3. **Vision-Based Scraping**: Using Multi-modal AI to "see" screenshots of job pages instead of just reading text.

---

## 2026-05-03 (Day 6 - Late Night) — Phase 5 Strategic Architecture

### Context
Late-night session focused on blueprinting the "Resume Factory." Moving from analytical tracking to strategic action.

### Decisions Made
- **The PDF Factory**: Confirmed "Pixel-Perfect PDF Export" as a core Phase 5 feature (Elite addition). We will reuse the Playwright infrastructure for server-side PDF generation.
- **Freemium Split**: Defined Free vs. Pro boundaries for tailoring, chat, and PDF exports.
- **DX Upgrade**: Added `--watch` to the BullMQ worker via `tsx` so code changes (like scraper logic) are picked up instantly without terminal restarts.

### Shipped (The "Deep Scraper" Audit)
- **LinkedIn Search Interceptor**: Fixed a bug where `/search-results` URLs weren't being converted to direct `/view` links.
- **Akamai WAF Bypass**: Implemented the `channel: "chrome"` strategy for Playwright to bypass TLS fingerprinting on enterprise portals like Naukri.
- **Naukri Scraper**: Created a dedicated `NaukriScraper` with "Fuzzy Selector" logic and advanced content-waiting to handle dynamic "Naukri Campus" layouts.
- **Generic Scraper Resilience**: Upgraded the base scraper with `networkidle` waiting and high-quality User-Agent spoofing.
- **Extraction Intelligence**: Refined the Groq prompt to handle "Posted by X" company patterns common on Indian job portals.

### Next Session Objective
1. **Initialize Phase 5**: Sketch the `TailorAgent` prompt logic and setup the Vercel AI SDK route.
2. **Database Migration**: Add `tailoredResumeData` JSON field to the `Application` model.

---

### Phase 4 Status: COMPLETED ✅ (Elite High-Fidelity UI Overhaul)

---

## 2026-05-02 (Day 5 - Part 3) — The High-Fidelity Intelligence Overhaul

### Shipped

- **Neural Ingestion Portal**: Transformed the resume upload into a multi-stage AI event. Implemented non-linear timing (weighted delays) for "Parsing Architecture" nodes to create a realistic sense of computational depth.
- **Strategic Asset Repository**: Refactored the resume library into a high-density grid with **"LATEST" Badge** logic. The system now automatically identifies and highlights the most recent identity marker with a pulse animation.
- **Dossier Command Center**: Reconstructed the resume detail page into a world-class SaaS dossier. 
    - **Sticky Command Header**: Locks the global identity and download actions to the top with aggressive backdrop-blur-3xl.
    - **Neural ScrollSpy**: Implemented `IntersectionObserver` to sync the tactical sidebar with the current data node in view.
    - **Tight SaaS Layout**: Optimized vertical density to eliminate "floaty" elements and ensure the interface feels professional and anchored.
- **Integrated Market Intel**: Surfaced real-time company metadata (Salary, Size, Research Score) into the application drawers using a high-fidelity intelligence grid.

### Phase 4 Status: COMPLETED ✅ (Exceeded original "Dashboard" scope with world-class UX)

---

---

## 2026-05-01 (Day 4) — Re-entry + Phase 3 prep

### Context

- 11-day gap since Day 3 (motivation + post-work exhaustion). Deliberate gentle re-entry: small wins, ship every commit, no Playwright tonight.

### Shipped

- **Sentry error tracking + tracing** — `@sentry/nextjs` across client/server/edge runtimes. DSN env-driven (`NEXT_PUBLIC_SENTRY_DSN`), `tracesSampleRate` scales by env (1.0 dev / 0.1 prod), `sendDefaultPii: false` (resume app — no PII to third party). Verified end-to-end with the wizard's example page, then deleted.
- **GitHub Actions CI** — `.github/workflows/ci.yml`: type-check (`tsc --noEmit`) + lint on every push and PR to master. Node 22, npm cache, Prisma generate step. ~1.5 min per run.
- **Seed script** — `prisma/seed.ts` creates 15 fake companies + 100 applications via Faker. Production-guarded, idempotent (deletes seeded rows first), parallel inserts via `Promise.all`. Realistic status funnel via cumulative-distribution weighted random picker (DSA: same algorithm as weighted load balancers). `@faker-js/faker` + `tsx` added as devDeps.
- **README upgrade** — replaced Next.js boilerplate with portfolio-grade README: status badges (CI live), pitch, "why this exists" story, features (shipped vs coming), tech stack, getting-started, project structure, roadmap with phase checkboxes, engineering principles, MIT license.
- **LICENSE file** — MIT, ©2026 Mohit.
- **SECURITY.md** + GitHub Dependabot/secret-scanning toggles enabled. Confirmed live (Dependabot already flagged 2 moderate vulns on first push).
- **Health check `/api/health`** — pings Prisma (`SELECT 1`) + Redis (`PING`) in parallel via `Promise.all`. Returns 200 with `{status:"ok"}` when both up, 503 with `{status:"degraded"}` otherwise. Public endpoint, no auth.
- **Singleton Redis client** at `src/lib/redis.ts` — `ioredis` with `lazyConnect: true`, globalThis pattern for HMR safety. BullMQ-ready for Phase 6.

### Decisions made

- Phase 3 (Playwright + scrapers) deliberately deferred to tomorrow — tonight was re-entry, not progress
- Cadence reset acknowledged: weekday 2-hr target was aspirational; build for 30–60 min reality
- Did NOT run `npm audit fix` despite 5 moderate vulns from new devDeps — likely transitive in pdf-parse area, defer to Phase 8 dep audit
- Did NOT upgrade Prisma 6 → 7 despite update prompt — major version, breaking changes, Phase 8 territory

### Carried over (deferred, not blocking)

- [x] Health check `/api/health` — done same session
- [x] `SECURITY.md` + GitHub secret scanning — done same session
- [ ] Multi-resume profile UI (Phase 5/7)
- [ ] Production deploy (Phase 8)
- [ ] Rotate Groq + Google OAuth + Cloudinary keys eventually (paranoia hygiene; secrets briefly visible during config session)

### Hygiene notes for future-me

- Stay on `npx prisma db push` until Phase 8 baseline migration. **Never run `migrate dev`** — wiped DB on Day 3.
- Prisma's `package.json#prisma` config is deprecated — Prisma 7 wants `prisma.config.ts`. Migrate when upgrading.
- Soft-delete `$extends` only on Resume model. Extend to Application when soft-delete on apps lands in Phase 4.

### Next session (Day 5) — one objective

**Sketch Phase 3 architecture on paper, no code.** Define the `Scraper` interface, per-source adapters (LinkedIn / Naukri / Instahyre / generic), where Redis caching fits, where BullMQ fits. 30–60 min thinking before any keystroke.

---

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

# Job Application Agent

[![CI](https://github.com/Mohit-2803/job-tracker/actions/workflows/ci.yml/badge.svg)](https://github.com/Mohit-2803/job-tracker/actions/workflows/ci.yml)
![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma)
![License](https://img.shields.io/badge/license-MIT-green)

> An AI-powered job application agent that scrapes job descriptions, researches companies, tailors resumes and cover letters, tracks applications in a pipeline, and runs a weekly autonomous monitor that emails you when applied companies hit layoffs, funding events, or leadership changes.

---

## Why this exists

Job hunting in 2026 is a numbers game with a quality penalty: you need to apply to 50+ companies, but each application demands a tailored resume, a researched cover letter, and ongoing awareness of what's happening at the company between application and interview. Doing that manually takes 30+ minutes per application.

I'm building this because I'm the target user. I'm job-hunting myself, I'm tired of pasting the same resume into the same portals, and I wanted a tool that does the boring work — scraping, research, tailoring — without ever fabricating experience or lying on my behalf. The goal is to apply more thoughtfully, not more carelessly.

This is a real product I'll use, not a portfolio toy. Built in public over ~4 months, deployed on free-tier infra (Oracle Cloud + NeonDB + Upstash + Cloudinary), priced for the Indian market (₹199/mo Pro tier via Razorpay).

---

## Features

- **Resume parsing** — PDF & DOCX upload, AI-extracted structured data (skills, experience, education, projects), edit-and-save UI with React Hook Form
- **Cloudinary file storage** — original resumes preserved with signed URLs and forced-download support
- **Soft delete with auto-filter** — Prisma `$extends` middleware filters deleted rows transparently across every read
- **Sentry error tracking + tracing** — production observability across client, server, and edge runtimes with PII scrubbing and per-environment sampling
- **Type-safe env vars** — Zod-validated at process boot via `@t3-oss/env-nextjs` (no silent failures from missing config)

### Coming soon

- 🚧 **Multi-source company research** — Playwright scrapers for LinkedIn, Naukri, Instahyre + news/funding/Glassdoor aggregation, with 24h Redis cache and per-domain rate limiting *(Phase 3)*
- ⏳ **Application pipeline** — drag-and-drop Kanban (`@dnd-kit`), Recharts analytics, soft-delete with undo *(Phase 4)*
- ⏳ **AI resume tailoring + streaming chat advisor** — reorder/rephrase only, never fabricate; SSE streaming via Vercel AI SDK *(Phase 5)*
- ⏳ **Weekly autonomous monitor** — BullMQ worker re-researches applied companies every week, emails you about layoffs, funding rounds, and leadership exits *(Phase 6)*
- ⏳ **Razorpay subscriptions** — HMAC-verified webhooks, idempotent event handling, Free (10 apps/mo) vs Pro (unlimited) tiers *(Phase 7)*
- ⏳ **Production deploy** — multi-stage Dockerfile, Nginx reverse proxy, Oracle Cloud ARM, Cloudflare, Let's Encrypt, GitHub Actions CI/CD *(Phase 8)*

---

## Tech stack

**Frontend**
- Next.js 15 (App Router, React 19, Turbopack)
- TypeScript (strict mode, no `any`)
- Tailwind CSS v4 + shadcn/ui + Radix UI
- React Hook Form + Zod validation
- Lucide icons, Sonner toasts, Recharts (Phase 4)

**Backend**
- Next.js API routes
- Prisma 6 + PostgreSQL
- NextAuth v5 (GitHub + Google OAuth, JWT strategy)
- BullMQ + Redis (Phase 6)
- Resend for transactional email (Phase 6)

**AI**
- Groq (Llama 3.3 70B) — primary LLM with structured JSON mode
- Zod schemas validate every LLM output
- Retry-with-corrective-prompt loop using Zod's `error.issues` for self-healing parses

**Storage & infra**
- Cloudinary for resume file storage
- Docker Compose for local Postgres + Redis
- Sentry for error tracking & performance monitoring
- GitHub Actions CI (type-check + lint on every push)

**Payments** *(Phase 7)*
- Razorpay Subscriptions, HMAC-verified webhooks, event-ID idempotency

---

## Getting started

### Prerequisites

- Node.js 22+
- Docker + Docker Compose
- A free [Groq API key](https://console.groq.com)
- A free [Cloudinary account](https://cloudinary.com)
- GitHub & Google OAuth client credentials

### Setup

```bash
# 1. Clone and install
git clone https://github.com/Mohit-2803/job-tracker.git
cd job-tracker
npm install

# 2. Configure environment
cp .env.example .env
# → fill in DATABASE_URL, AUTH_*, GROQ_API_KEY, CLOUDINARY_*, etc.

# 3. Start local Postgres + Redis
docker compose up -d

# 4. Apply schema and (optionally) seed dev data
npx prisma db push
npx prisma db seed   # creates 15 fake companies + 100 applications

# 5. Run the app
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), log in with Google or GitHub, and you're in.

### Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server with Turbopack |
| `npm run build` | Production build |
| `npm run start` | Run the production build locally |
| `npm run lint` | ESLint |
| `npx prisma studio` | Open the DB GUI |
| `npx prisma db push` | Sync schema to the DB (dev only) |
| `npx prisma db seed` | Populate dev DB with fake data |

---

## Project structure

```
job-tracker/
├── .github/workflows/      # GitHub Actions CI
├── prisma/
│   ├── schema.prisma       # Data models — User, Resume, Company, Application, ...
│   └── seed.ts             # Dev seed: 15 companies + 100 applications
├── src/
│   ├── app/
│   │   ├── api/            # Auth + REST endpoints (resumes, applications, ...)
│   │   ├── dashboard/      # Authenticated dashboard pages
│   │   └── global-error.tsx
│   ├── components/         # UI (shadcn), dashboard widgets, resume forms
│   ├── lib/
│   │   ├── ai/             # Groq client, prompts, Zod schemas
│   │   ├── auth.ts         # NextAuth v5 setup
│   │   ├── cloudinary.ts   # Signed upload + download URLs
│   │   └── prisma.ts       # Prisma client + soft-delete $extends middleware
│   ├── env.ts              # @t3-oss/env-nextjs — Zod-validated env at boot
│   ├── instrumentation.ts  # Sentry server/edge runtime registration
│   └── middleware.ts       # Auth gate for /dashboard/*
├── docker-compose.yml      # Postgres 16 + Redis 7
├── sentry.server.config.ts
├── sentry.edge.config.ts
└── CLAUDE.md               # Project blueprint, conventions, mentor protocol
```

---

## Roadmap

| Phase | Status | Scope |
|---|---|---|
| 1 | ✅ Done | Next.js 15 + Prisma + NextAuth + local Docker foundation |
| 2 | ✅ Done | Resume upload, AI extraction, Cloudinary, soft-delete, validated env |
| 3 | 🚧 In progress | Playwright scrapers + multi-source company research agent |
| 4 | ⏳ | Kanban pipeline, Recharts analytics, soft-delete UX |
| 5 | ⏳ | Resume tailoring engine + streaming chat advisor (Vercel AI SDK) |
| 6 | ⏳ | BullMQ weekly monitor + Resend email reports |
| 7 | ⏳ | Razorpay subscriptions + idempotent webhooks |
| 8 | ⏳ | Multi-stage Dockerfile, Nginx, Oracle Cloud ARM deploy, CD |

See [CLAUDE.md](./CLAUDE.md) for the full mentor blueprint, code standards, and the DSA mapping used to connect each piece to interview-grade fundamentals.

---

## Engineering principles

A few non-negotiables this project enforces — visible in code review and worth flagging on a CV:

- **TypeScript strict, no `any`, no `@ts-ignore`** — typed end-to-end including LLM outputs
- **Zod at every boundary** — env vars, API inputs, LLM outputs, third-party responses, webhook payloads
- **Composite indexes** before queries that filter by more than `id`
- **Soft delete via Prisma middleware**, never hard-delete user data
- **No scraping inside API routes** — all long work goes through BullMQ workers in a separate container *(Phase 6)*
- **Webhook signature verification + event-ID idempotency** *(Phase 7)*
- **Resume tailoring may reorder/rephrase, never fabricate** — bright integrity line

---

## License

MIT — see [LICENSE](./LICENSE).

---

Built by [Mohit](https://github.com/Mohit-2803). If you're a recruiter or fellow job-seeker reading this and want to chat about the build, open an issue.

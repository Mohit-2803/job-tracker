# Security Policy

## Reporting a vulnerability

If you discover a security vulnerability in this project, please **do not open a public GitHub issue**.

Instead, report it privately by emailing **paddy@crosseven.com** with:

- A description of the issue
- Steps to reproduce
- The version / commit SHA you tested against
- (Optional) A suggested fix

I will acknowledge the report within 7 days and aim to ship a fix within 30 days for confirmed issues. Reporters will be credited (with permission) once the fix is public.

## Scope

In scope:

- Authentication / session handling (NextAuth)
- API routes under `src/app/api/`
- File upload pipeline (resume parsing, Cloudinary integration)
- LLM input/output handling
- Razorpay webhook handling *(once Phase 7 ships)*
- BullMQ workers *(once Phase 6 ships)*

Out of scope:

- Issues that require physical access to a user's device
- Social-engineering attacks against the maintainer
- Third-party services (Groq, Cloudinary, NeonDB, etc.) — report those upstream

## Supported versions

This project is in active development. Only the `master` branch receives security fixes.

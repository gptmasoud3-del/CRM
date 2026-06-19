# Advanced Leads Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a real Persian RTL advanced lead module with logistics fields, validation, activities, CSV export, soft delete, and lead-to-customer conversion.

**Architecture:** Extend the existing Prisma/Express/React monolith without restructuring. Keep lowercase Prisma enum values to avoid breaking current seed/dashboard logic, while showing all labels in Persian. Replace the generic lead page with a dedicated Lead module following the existing Customer module pattern.

**Tech Stack:** Prisma, PostgreSQL, Express, Zod, React, Vite, TypeScript, Docker Compose.

---

### Task 1: Data Model And Seed
**Files:**
- Modify: `apps/api/prisma/schema.prisma`
- Create: `apps/api/prisma/migrations/20260619000300_advanced_leads_phase1/migration.sql`
- Modify: `apps/api/prisma/seed.ts`

- [ ] Add advanced Lead fields as nullable columns and indexes.
- [ ] Add new LeadStatus enum values safely.
- [ ] Add lead permission aliases requested by prompt.
- [ ] Seed realistic logistics lead demo data.

### Task 2: API Routes
**Files:**
- Modify: `apps/api/src/index.ts`

- [ ] Expand Zod validation for leads.
- [ ] Add list/detail/create/update/status/activity/export routes.
- [ ] Add atomic convert-to-customer route with duplicate checks.
- [ ] Keep audit logs and Persian error messages.

### Task 3: Persian RTL Frontend
**Files:**
- Modify: `apps/web/src/main.tsx`
- Modify: `apps/web/src/styles.css`

- [ ] Replace generic `/leads` page with LeadModule.
- [ ] Add advanced filters, table badges, detail panel and conversion action.
- [ ] Add required red stars and light-red invalid fields after submit.
- [ ] Auto-fill probability from status dropdown.
- [ ] Use `/logo.svg` everywhere brand-related.

### Task 4: Verification
**Files:**
- No source changes expected.

- [ ] Run API build if local npm permits.
- [ ] Run web build if local npm permits.
- [ ] Run Docker Compose config/build where environment permits.

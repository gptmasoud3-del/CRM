# Customer 360 Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-ready Persian RTL Customer 360 phase 1 with expanded data model, real APIs, duplicate detection, customer profile, and operational UI.

**Architecture:** Extend the existing Express/Prisma monolith without restructuring unrelated modules. Add a backward-compatible Customer schema expansion, customer-specific routes before generic CRUD conflicts, and a dedicated React customer module inside the current Vite app.

**Tech Stack:** Prisma/PostgreSQL, Express/TypeScript/Zod, React/Vite/TypeScript, Docker Compose.

---

### Task 1: Data Model and Migration

**Files:**
- Modify: `apps/api/prisma/schema.prisma`
- Create: `apps/api/prisma/migrations/20260619000200_customer_360_phase1/migration.sql`

- [ ] Expand Customer fields for Customer 360 while keeping current `name`, `phone`, and `email` compatibility.
- [ ] Add `ChurnRisk` and `CustomerTier` enums.
- [ ] Add indexes for customer code, mobile, national ID, economic code, owner, team, status, tier, health score, and interaction dates.

### Task 2: Customer API

**Files:**
- Modify: `apps/api/src/index.ts`

- [ ] Add customer-specific validation schemas.
- [ ] Replace generic `/api/customers` CRUD with full list/create/read/update/delete routes.
- [ ] Add duplicate detection, summary, audit logs, nested create routes, owner/status patch, bulk update, import, and export.
- [ ] Enforce new permissions server-side.

### Task 3: Customer UI

**Files:**
- Modify: `apps/web/src/main.tsx`
- Modify: `apps/web/src/styles.css`

- [ ] Add advanced customer list with filters, sort, pagination, column selection, and bulk selection.
- [ ] Add multi-section create/edit customer form with duplicate warning.
- [ ] Add Customer 360 detail view with overview, contact, timeline, opportunities, tasks, tickets, and audit log tabs.

### Task 4: Seed and Permissions

**Files:**
- Modify: `apps/api/prisma/seed.ts`

- [ ] Add new customer permissions.
- [ ] Seed richer customer examples with customerCode, tier, churnRisk, health data, and interaction dates.

### Task 5: Verification

**Files:**
- Validate: `docker-compose.yml`

- [ ] Run `docker compose config`.
- [ ] Report that Docker build/up must be run in the user terminal if daemon access is unavailable in Codex.

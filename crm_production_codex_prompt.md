# CRM Production Build Prompt for Codex

> **Purpose:** Attach this Markdown file to Codex and ask it to build a real, production-ready CRM web application based on the existing design repository and the requirements below.

---

# 0. Main Instruction for Codex

You are an expert senior full-stack engineer, software architect, DevOps engineer, security engineer, and product-minded frontend engineer.

Build a complete, production-ready CRM web application based on this specification.

This must **not** be a mockup, prototype, static dashboard, or fake UI.

It must be a real, working, Dockerized web application that can run on a Linux VM, persist real data in a real PostgreSQL database, support authentication, role-based access control, admin configuration, customer/lead/opportunity/task/activity/ticket management, audit logs, import/export, reporting, and real operational use by real users.

The final output must be a complete repository with:

- Full source code.
- Docker files.
- Docker Compose files.
- Database schema.
- Prisma migrations.
- Seed scripts.
- Deployment documentation.
- Security documentation.
- Backup and restore scripts.
- Real frontend connected to real backend APIs.

---

# 1. Existing Design Repository

Before implementing the CRM application, clone and inspect this repository:

```bash
git clone https://github.com/gptmasoud3-del/logistics-connect-hub.git
```

Use the visual design, layout language, component style, spacing, typography approach, colors, cards, tables, navigation patterns, dashboard structure, and general UI/UX direction from this repository as the foundation for the new CRM application.

The goal is **not** to simply copy the repository as-is.

The goal is to reuse its design language and frontend experience, then build a complete production-ready CRM system on top of it.

---

# 2. Design Reuse Requirements

You must inspect the existing repository and identify:

- Frontend framework.
- Styling system.
- Component structure.
- Layout components.
- Sidebar/topbar/navigation patterns.
- Dashboard cards.
- Tables.
- Forms.
- Modals/drawers.
- Charts.
- Colors and tokens.
- RTL/Persian support if available.
- Existing reusable components.
- Existing mock data and where it is used.

Then use these findings to build the CRM UI.

Do not replace the design with a generic admin dashboard.

Do not create a visually unrelated CRM.

The final CRM must visually feel like an evolution of `logistics-connect-hub`.

---

# 3. Brand Palette Requirements

Use the provided Digiexpress-style UI palette as the CRM brand reference.

Required base colors:

```css
:root {
  --color-primary: #21409A;
  --color-accent: #FFC10E;
  --color-neutral: #BFBFBF;
  --color-success: #00A700;
  --color-danger: #D50000;
  --color-bg: #F8FAFC;
  --color-surface: #FFFFFF;
  --color-text: #111827;
  --color-muted: #6B7280;
  --color-border: #E5E7EB;
}
```

If the existing repository already has a color system, merge it carefully with this palette instead of blindly replacing everything.

The CRM must remain visually consistent with the existing repository while using the provided palette as the official product color system.

Use a Persian-friendly font stack:

```css
font-family: Vazirmatn, IRANSansX, Dana, Tahoma, Arial, sans-serif;
```

If external fonts are not available, use system fallbacks.

---

# 4. UI/UX Adaptation Rules

Use the existing design from `logistics-connect-hub` for:

- Login page style.
- App shell.
- Sidebar.
- Top navigation.
- Dashboard layout.
- Card style.
- Table style.
- Form style.
- Button style.
- Badge/status style.
- Chart container style.
- Empty states.
- Responsive behavior.
- Page transitions or animations if present.

Adapt the content and information architecture to CRM modules:

- Dashboard
- Customers
- Leads
- Opportunities
- Pipeline
- Tasks
- Activities
- Tickets
- Reports
- Admin Users
- Roles and Permissions
- Audit Logs
- Settings

---

# 5. Product Goal

Build a web-based CRM platform for internal company use.

The CRM must allow real users to:

- Sign in securely.
- Create, edit, search, filter, and manage real customer records.
- Create and manage leads.
- Convert leads to customers.
- Create and manage opportunities/deals.
- Manage sales pipeline stages.
- Create activities, notes, calls, meetings, emails, and follow-ups.
- Create tasks and reminders.
- Define users, roles, permissions, and access levels.
- View dashboards and reports.
- Import and export data.
- Keep audit logs for important actions.
- Run the whole system on a VM using Docker Compose.
- Persist all data in PostgreSQL.
- Use the application in a real operational environment.

---

# 6. Non-Negotiable Requirements

This project must be implemented as a real application.

Do not produce:

- Static HTML-only pages.
- Fake data-only dashboards.
- UI without backend.
- Backend without UI.
- In-memory database.
- Mock authentication.
- Hardcoded users except initial seed admin.
- No-code style placeholders.
- `TODO implement later` for core features.
- Partial Docker setup that cannot run end-to-end.

The application must include:

- Real frontend.
- Real backend API.
- Real database.
- Real database migrations.
- Real authentication.
- Real RBAC.
- Real CRUD.
- Real validation.
- Real error handling.
- Real Docker Compose setup.
- Real deployment instructions.
- Real seed data.
- Real environment variable configuration.
- Real persistent storage.

---

# 7. Preferred Technology Stack

Use the following stack unless the existing repository strongly suggests a better continuation path.

## Frontend

- Next.js or the framework already used in `logistics-connect-hub`.
- React.
- TypeScript.
- Tailwind CSS if already used or suitable.
- RTL support.
- Persian-first UI.
- Responsive desktop-first layout.
- React Query or TanStack Query for server state.
- Zod for client-side validation where useful.
- Recharts or similar for charts.
- Component-based UI architecture.

## Backend

- NestJS or Express.js with TypeScript.
- REST API.
- JWT-based authentication with refresh token support.
- Password hashing with bcrypt or argon2.
- Input validation.
- Centralized error handling.
- Request logging.
- RBAC middleware/guards.
- Audit log service.
- Pagination, filtering, sorting, and search.

## Database

- PostgreSQL.
- Prisma ORM.
- Prisma migrations.
- Seed script.
- UUID primary keys.
- Proper indexes.
- Soft delete where appropriate.
- Audit tables.

## Infrastructure

- Docker.
- Docker Compose.
- Nginx reverse proxy.
- PostgreSQL container.
- Redis container for caching/session/queue if needed.
- Optional MinIO container for local file storage.
- Production `.env.example`.
- Health checks.
- Volume persistence.
- Backup and restore scripts.
- VM deployment guide.

---

# 8. Repository Structure

Create a clean monorepo structure.

If the existing repository already has a useful structure, preserve it where possible and adapt it cleanly.

Preferred final structure:

```txt
crm-platform/
  apps/
    web/
      src/
      public/
      Dockerfile
      package.json
    api/
      src/
      prisma/
      Dockerfile
      package.json
  infra/
    nginx/
      nginx.conf
      default.conf
    scripts/
      backup-db.sh
      restore-db.sh
      deploy.sh
      create-admin.sh
  docker-compose.yml
  docker-compose.prod.yml
  .env.example
  README.md
  DEPLOYMENT.md
  SECURITY.md
```

---

# 9. Docker Requirements

Create a full Docker Compose setup.

Services:

1. `web`
   - Frontend application.
   - Runs production build.
   - Exposes internal port only to Nginx.

2. `api`
   - Node/TypeScript backend.
   - Runs API server.
   - Exposes internal port only to Nginx.

3. `postgres`
   - PostgreSQL database.
   - Persistent volume.
   - Environment-driven credentials.
   - Health check.

4. `redis`
   - For caching, rate limiting, jobs, or token/session support.
   - Persistent volume if needed.

5. `nginx`
   - Reverse proxy.
   - Routes `/` to frontend.
   - Routes `/api` to backend.
   - Supports SSL-ready configuration.

6. Optional `minio`
   - For file attachments if file upload is implemented.

Docker Compose must support:

```bash
docker compose up -d --build
docker compose logs -f
docker compose exec api npm run prisma:migrate
docker compose exec api npm run seed
```

Production must support:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

---

# 10. Environment Variables

Create `.env.example` with at least:

```env
NODE_ENV=production

APP_NAME=CRM Platform
APP_URL=https://crm.example.com
API_URL=https://crm.example.com/api

POSTGRES_DB=crm
POSTGRES_USER=crm_user
POSTGRES_PASSWORD=change_me_securely
DATABASE_URL=postgresql://crm_user:change_me_securely@postgres:5432/crm

JWT_ACCESS_SECRET=change_me_access_secret
JWT_REFRESH_SECRET=change_me_refresh_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

BCRYPT_SALT_ROUNDS=12

REDIS_URL=redis://redis:6379

INITIAL_ADMIN_EMAIL=admin@example.com
INITIAL_ADMIN_PASSWORD=change_me_immediately
INITIAL_ADMIN_NAME=System Admin

UPLOAD_PROVIDER=local
MAX_UPLOAD_SIZE_MB=10

TZ=Asia/Tehran
```

No real secrets must be committed.

---

# 11. Authentication Requirements

Implement secure authentication.

Features:

- Login with email and password.
- Logout.
- Refresh token flow.
- Password hashing.
- Protected routes.
- Authenticated API access.
- Current user endpoint.
- Token expiration.
- Invalid credential error.
- Disabled user cannot log in.
- Initial admin seed.

Minimum endpoints:

```txt
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
GET  /api/auth/me
```

---

# 12. RBAC and Permission Model

Implement real role-based access control.

## Core Concepts

- User
- Role
- Permission
- Team
- UserRole
- RolePermission

## Initial Roles

Seed the following roles:

1. Super Admin
2. CRM Admin
3. Sales Manager
4. Sales Agent
5. Support Manager
6. Support Agent
7. Marketing User
8. Data Analyst
9. Read-only Executive

## Permission Examples

Use granular permissions:

```txt
users.read
users.create
users.update
users.disable

roles.read
roles.create
roles.update
roles.delete

customers.read
customers.create
customers.update
customers.delete
customers.export

leads.read
leads.create
leads.update
leads.delete
leads.convert
leads.assign
leads.export

opportunities.read
opportunities.create
opportunities.update
opportunities.delete
opportunities.change_stage
opportunities.close_won
opportunities.close_lost

activities.read
activities.create
activities.update
activities.delete

tasks.read
tasks.create
tasks.update
tasks.delete
tasks.assign

tickets.read
tickets.create
tickets.update
tickets.delete

reports.read
reports.export

settings.read
settings.update

audit_logs.read
```

Frontend must hide or disable UI actions based on permissions.

Backend must enforce permissions on every protected endpoint.

Never rely only on frontend permission checks.

---

# 13. Main Data Model

Use Prisma schema and PostgreSQL.

## User

Fields:

- id
- name
- email
- passwordHash
- status: active, disabled
- teamId
- createdAt
- updatedAt
- lastLoginAt

## Role

Fields:

- id
- name
- description
- isSystem
- createdAt
- updatedAt

## Permission

Fields:

- id
- key
- description
- module

## Team

Fields:

- id
- name
- parentTeamId
- createdAt
- updatedAt

## Customer

Fields:

- id
- type: individual, company
- name
- companyName
- phone
- email
- nationalIdOrCompanyId
- status: active, inactive, prospect, at_risk, lost
- segment
- tier
- source
- ownerId
- address
- city
- province
- postalCode
- clv
- healthScore
- tags
- customFields JSON
- createdAt
- updatedAt
- deletedAt

## Lead

Fields:

- id
- name
- companyName
- phone
- email
- source
- campaign
- status: new, assigned, contacted, qualified, unqualified, converted, lost, duplicate
- score
- priority: low, medium, high, urgent
- ownerId
- rejectionReason
- convertedCustomerId
- notes
- tags
- customFields JSON
- createdAt
- updatedAt
- deletedAt

## Opportunity

Fields:

- id
- customerId
- title
- amount
- probability
- stageId
- ownerId
- source
- expectedCloseDate
- status: open, won, lost
- lostReason
- wonAt
- lostAt
- nextStep
- description
- createdAt
- updatedAt
- deletedAt

## PipelineStage

Fields:

- id
- name
- order
- probability
- color
- isWon
- isLost
- createdAt
- updatedAt

Default stages:

- Prospecting
- Qualification
- Needs Analysis
- Proposal
- Negotiation
- Won
- Lost

## Activity

Fields:

- id
- entityType: customer, lead, opportunity, ticket
- entityId
- activityType: call, email, meeting, sms, note, system, follow_up
- title
- description
- outcome
- createdById
- occurredAt
- isPrivate
- createdAt
- updatedAt

## Task

Fields:

- id
- title
- description
- ownerId
- assignedById
- entityType
- entityId
- priority: low, medium, high, urgent
- status: open, in_progress, done, canceled, overdue
- dueDate
- completedAt
- createdAt
- updatedAt

## Ticket

Fields:

- id
- customerId
- subject
- description
- status: open, pending, resolved, closed
- priority: low, medium, high, critical
- ownerId
- category
- slaDueAt
- resolvedAt
- createdAt
- updatedAt

## AuditLog

Fields:

- id
- actorId
- action
- entityType
- entityId
- previousValue JSON
- newValue JSON
- ipAddress
- userAgent
- createdAt

## SavedView

Fields:

- id
- userId
- entityType
- name
- filters JSON
- columns JSON
- sort JSON
- isDefault
- createdAt
- updatedAt

---

# 14. Required Backend API Modules

Implement REST APIs for the following modules.

## Auth

```txt
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
GET  /api/auth/me
```

## Users

```txt
GET    /api/users
POST   /api/users
GET    /api/users/:id
PATCH  /api/users/:id
PATCH  /api/users/:id/disable
PATCH  /api/users/:id/enable
```

## Roles and Permissions

```txt
GET    /api/roles
POST   /api/roles
GET    /api/roles/:id
PATCH  /api/roles/:id
DELETE /api/roles/:id

GET    /api/permissions
POST   /api/roles/:id/permissions
```

## Customers

```txt
GET    /api/customers
POST   /api/customers
GET    /api/customers/:id
PATCH  /api/customers/:id
DELETE /api/customers/:id
GET    /api/customers/:id/timeline
GET    /api/customers/:id/opportunities
GET    /api/customers/:id/tickets
GET    /api/customers/:id/tasks
```

## Leads

```txt
GET    /api/leads
POST   /api/leads
GET    /api/leads/:id
PATCH  /api/leads/:id
DELETE /api/leads/:id
POST   /api/leads/:id/assign
POST   /api/leads/:id/convert
```

## Opportunities

```txt
GET    /api/opportunities
POST   /api/opportunities
GET    /api/opportunities/:id
PATCH  /api/opportunities/:id
DELETE /api/opportunities/:id
POST   /api/opportunities/:id/change-stage
POST   /api/opportunities/:id/close-won
POST   /api/opportunities/:id/close-lost
```

## Activities

```txt
GET    /api/activities
POST   /api/activities
GET    /api/entities/:entityType/:entityId/activities
PATCH  /api/activities/:id
DELETE /api/activities/:id
```

## Tasks

```txt
GET    /api/tasks
POST   /api/tasks
GET    /api/tasks/:id
PATCH  /api/tasks/:id
DELETE /api/tasks/:id
POST   /api/tasks/:id/complete
```

## Tickets

```txt
GET    /api/tickets
POST   /api/tickets
GET    /api/tickets/:id
PATCH  /api/tickets/:id
DELETE /api/tickets/:id
```

## Reports

```txt
GET /api/reports/dashboard
GET /api/reports/sales-pipeline
GET /api/reports/lead-conversion
GET /api/reports/activity-summary
GET /api/reports/support-sla
```

## Audit Logs

```txt
GET /api/audit-logs
```

## Import / Export

```txt
POST /api/import/customers
POST /api/import/leads
GET  /api/export/customers
GET  /api/export/leads
GET  /api/export/opportunities
```

---

# 15. API Behavior Requirements

Every list endpoint must support:

```txt
?page=1
&pageSize=25
&search=
&sortBy=createdAt
&sortOrder=desc
&filters={}
```

Response shape:

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "total": 100,
    "totalPages": 4
  }
}
```

Every create/update endpoint must:

- Validate input.
- Return clear validation errors.
- Write audit logs for important entities.
- Return the created or updated entity.
- Enforce permissions.

---

# 16. Frontend Application Requirements

Build a Persian RTL admin-style CRM interface.

## General UI

- Persian-first labels.
- RTL layout.
- Sidebar navigation.
- Topbar with global search placeholder, user menu, and notifications placeholder.
- Desktop-first, responsive enough for tablet.
- Clean enterprise CRM look.
- Data-dense but readable.
- Loading states.
- Empty states.
- Error states.
- Permission-aware action buttons.

## Main Navigation Labels

Use Persian labels such as:

```txt
داشبورد
مشتریان
لیدها
فرصت‌ها
قیف فروش
وظایف
فعالیت‌ها
تیکت‌ها
گزارش‌ها
مدیریت کاربران
نقش‌ها و دسترسی‌ها
تنظیمات
گزارش حسابرسی
```

---

# 17. Frontend Pages

Implement the following pages.

## Public/Auth

```txt
/login
```

## Protected App

```txt
/dashboard
/customers
/customers/new
/customers/[id]
/leads
/leads/new
/leads/[id]
/opportunities
/opportunities/new
/opportunities/[id]
/pipeline
/tasks
/activities
/tickets
/reports
/admin/users
/admin/roles
/admin/settings
/audit-logs
```

All protected pages must use the same app shell and navigation style inspired by the existing repository.

---

# 18. Dashboard Page

Use the existing dashboard style, but show real CRM data from API.

Cards:

- تعداد مشتریان
- لیدهای جدید
- فرصت‌های باز
- ارزش قیف فروش
- وظایف امروز
- وظایف عقب‌افتاده
- تیکت‌های باز
- SLA نزدیک به نقض

Charts:

- لیدها بر اساس منبع
- فرصت‌ها بر اساس مرحله
- فعالیت‌ها در ۷ روز اخیر
- وضعیت تیکت‌ها

---

# 19. Customers Module UI

## Customers List

Features:

- Search.
- Filter by status, segment, owner, city.
- Sort.
- Pagination.
- Create customer button.
- Export button if user has permission.
- Data table with columns:
  - Name
  - Phone
  - Email
  - Status
  - Segment
  - Owner
  - Last Updated
  - Actions

## Customer Detail

Sections:

- Overview.
- Contact information.
- Timeline.
- Opportunities.
- Tickets.
- Tasks.
- Notes/Activities.
- Audit summary.

Actions:

- Edit customer.
- Add activity.
- Add task.
- Add opportunity.
- Add ticket.

---

# 20. Leads Module UI

## Leads List

Features:

- Search.
- Filter by status, source, owner, priority.
- Sort.
- Pagination.
- Create lead.
- Assign lead.
- Convert lead.
- Export if permitted.

## Lead Detail

Sections:

- Lead overview.
- Activity timeline.
- Tasks.
- Conversion panel.

Lead conversion must:

- Create a customer or link to existing customer.
- Mark lead as converted.
- Add audit log.
- Add system activity.

---

# 21. Opportunities and Pipeline UI

## Opportunities List

Features:

- Search.
- Filter by status, stage, owner.
- Sort.
- Pagination.
- Create opportunity.

## Pipeline View

Implement Kanban board:

- Columns are pipeline stages.
- Cards are opportunities.
- Show amount, customer, owner, expected close date.
- Allow stage change if user has permission.
- On stage change, call backend API and create audit log.
- Lost stage requires lost reason.

---

# 22. Tasks UI

Features:

- My tasks.
- Team tasks for managers.
- Filters:
  - status
  - priority
  - due date
  - owner
- Create task.
- Complete task.
- Overdue visual state.
- Link to related entity.

---

# 23. Activities UI

Features:

- Activity list.
- Add activity.
- Filter by type.
- Entity-linked activity timeline.
- Private note support based on permission.

---

# 24. Tickets UI

Features:

- Create ticket.
- List tickets.
- Filter by status, priority, owner.
- Show SLA due date.
- Critical tickets visually highlighted.
- Ticket detail with activities.

---

# 25. Admin UI

## Users

- List users.
- Create user.
- Edit user.
- Enable/disable user.
- Assign roles.
- Assign team.

## Roles

- List roles.
- Create role.
- Edit role.
- Assign permissions.
- Permission matrix UI.

## Settings

At minimum:

- Pipeline stages management.
- Lead sources management, if implemented.
- Tags management, if implemented.

---

# 26. Audit Log UI

Create an audit log page.

Features:

- Search.
- Filter by actor, entity type, action, date range.
- Display before/after JSON in readable format.
- Only users with `audit_logs.read` can access.

---

# 27. Import / Export

Implement CSV import for:

- Customers.
- Leads.

Import requirements:

- Upload CSV.
- Map common columns automatically.
- Validate rows.
- Show row-level errors.
- Insert valid records.
- Return summary:
  - total rows
  - imported rows
  - failed rows
  - duplicate rows

Export requirements:

- CSV export.
- Respect current filters.
- Respect permissions.
- Audit export action.

---

# 28. Search and Filtering

Implement practical search for:

- Customers by name, phone, email, company.
- Leads by name, phone, email, company.
- Opportunities by title and customer.
- Tasks by title.
- Tickets by subject.

Use PostgreSQL indexes and `ILIKE` search initially.

Add indexes for:

- email
- phone
- name
- status
- ownerId
- createdAt
- updatedAt

---

# 29. Audit Logging Requirements

Create audit log entries for:

- User creation/update/disable.
- Role changes.
- Customer create/update/delete.
- Lead create/update/assign/convert/delete.
- Opportunity create/update/stage change/won/lost/delete.
- Task create/update/complete/delete.
- Ticket create/update/delete.
- Export actions.
- Admin settings changes.

Audit log must include:

- actor
- action
- entity type
- entity id
- previous value
- new value
- timestamp
- IP address if available
- user agent if available

---

# 30. Security Requirements

Implement:

- Password hashing.
- JWT access and refresh tokens.
- Backend permission guards.
- Input validation.
- CORS configuration.
- Helmet or equivalent security headers.
- Rate limiting for auth endpoints.
- Sanitized error responses.
- Environment-based secrets.
- No secrets committed to repository.
- Disabled users cannot access API.
- Export endpoints require explicit permission.
- Audit logs cannot be edited through UI.

---

# 31. Validation Requirements

Use strict validation.

Examples:

- Email must be valid.
- Phone must be normalized or at least trimmed.
- Required fields cannot be empty.
- Opportunity amount must be numeric and non-negative.
- Probability must be between 0 and 100.
- Due date must be valid.
- Role name must be unique.
- Permission keys must be system-defined.

---

# 32. Seed Data

Create seed script with:

- Initial admin user from environment variables.
- Default roles.
- Default permissions.
- Default role-permission assignments.
- Default pipeline stages.
- Sample customers, leads, opportunities, tasks, activities, and tickets for development only.

Production seed must not create fake operational data unless explicitly enabled.

Support:

```bash
npm run seed
npm run seed:dev
```

---

# 33. Testing Requirements

Add at least basic tests for:

- Auth login.
- Permission guard.
- Customer create/list.
- Lead conversion.
- Opportunity stage change.
- Audit log creation.

If full tests are too large, still create test structure and representative working tests.

---

# 34. Deployment Requirements

Create `DEPLOYMENT.md`.

It must include:

## VM Requirements

Recommended minimum:

- Ubuntu 22.04 or 24.04.
- 2 vCPU.
- 4GB RAM minimum.
- 40GB disk minimum.
- Docker installed.
- Docker Compose installed.
- Domain pointed to VM IP.
- Firewall ports 80 and 443 open.

## Setup Steps

Include commands for:

```bash
git clone <repo>
cd crm-platform
cp .env.example .env
nano .env
docker compose -f docker-compose.prod.yml up -d --build
docker compose logs -f
docker compose exec api npm run prisma:migrate
docker compose exec api npm run seed
```

## Backup

Include:

```bash
./infra/scripts/backup-db.sh
```

## Restore

Include:

```bash
./infra/scripts/restore-db.sh backup-file.sql
```

## Update Deployment

Include:

```bash
git pull
docker compose -f docker-compose.prod.yml up -d --build
docker compose exec api npm run prisma:migrate
```

---

# 35. README Requirements

Create a complete `README.md` with:

- Project overview.
- Architecture.
- Tech stack.
- Local development setup.
- Production setup.
- Environment variables.
- Database commands.
- Seed commands.
- Default admin info.
- Main modules.
- Troubleshooting.

---

# 36. SECURITY.md Requirements

Create `SECURITY.md` with:

- Authentication overview.
- RBAC overview.
- Secret management.
- Production deployment security notes.
- Backup security notes.
- Recommended firewall settings.
- How to rotate JWT secrets.
- How to disable users.
- How audit logs work.

---

# 37. Implementation Strategy

Implement the system in phases, but keep all code in one final working repository.

## Phase 1: Inspect and Adapt Existing Design

- Clone `logistics-connect-hub`.
- Identify framework and UI structure.
- Preserve reusable UI components.
- Convert logistics domain pages into CRM domain pages.
- Preserve design language.

## Phase 2: Foundation

- Monorepo setup.
- Docker Compose.
- PostgreSQL.
- Prisma.
- Backend app.
- Frontend app.
- Nginx proxy.
- Environment config.

## Phase 3: Auth and RBAC

- User model.
- Role model.
- Permission model.
- Login.
- JWT.
- Permission guards.
- Admin seed.

## Phase 4: Core CRM

- Customers.
- Leads.
- Lead conversion.
- Opportunities.
- Pipeline stages.
- Activities.
- Tasks.
- Tickets.

## Phase 5: Admin and Audit

- User management.
- Role management.
- Permission matrix.
- Audit logs.
- Settings.

## Phase 6: Reports and Operational Features

- Dashboard.
- Reports.
- Import.
- Export.
- Search.
- Filters.

## Phase 7: Production Readiness

- Docker production config.
- Nginx config.
- Health checks.
- Backup scripts.
- Deployment docs.
- Security docs.
- Tests.

---

# 38. Definition of Done

The project is done only when:

1. The existing repository has been inspected.
2. Its design system and component patterns are reused.
3. CRM pages visually match the existing design language.
4. Mock logistics data is replaced with real CRM data.
5. The application is RTL/Persian friendly.
6. The CRM uses the provided brand palette.
7. `docker compose up -d --build` runs the full stack.
8. Frontend is accessible in browser.
9. Backend API is accessible through `/api`.
10. PostgreSQL persists real data.
11. Admin can log in.
12. Admin can create users.
13. Admin can create roles and assign permissions.
14. User permissions affect backend and frontend.
15. Customers can be created, edited, listed, searched, and deleted.
16. Leads can be created and converted to customers.
17. Opportunities can be created and moved through pipeline stages.
18. Activities can be logged.
19. Tasks can be created and completed.
20. Tickets can be created and managed.
21. Dashboard shows real database data.
22. Audit logs are written for key actions.
23. Import/export works for customers and leads.
24. README and DEPLOYMENT docs are complete.
25. SECURITY.md is complete.
26. No core feature is left as a TODO.
27. The app can be deployed on a real VM with PostgreSQL persistence.

---

# 39. Final Expected Output

Return a complete repository containing:

1. Full codebase.
2. Docker Compose files.
3. Database schema and migrations.
4. Seed scripts.
5. Frontend pages.
6. Backend APIs.
7. README.
8. DEPLOYMENT.md.
9. SECURITY.md.
10. Backup/restore scripts.
11. Clear run instructions.

Do not stop after creating only scaffolding.

Continue until the application is runnable end-to-end.

---

# 40. Final Codex Reminder

This project must be a real CRM platform, not a UI-only dashboard.

Use the existing `logistics-connect-hub` design as the visual foundation.

Use PostgreSQL, Docker, authentication, RBAC, audit logs, real CRUD, real APIs, and real deployment documentation.

The final product must be usable on a VM with real operational data.

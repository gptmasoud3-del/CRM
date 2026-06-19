# Digiexpress CRM — سامانه جامع مدیریت ارتباط با مشتریان

Digiexpress CRM یک وب‌اپلیکیشن سازمانی، فارسی و راست‌به‌چپ برای مدیریت کامل چرخه فروش، مشتریان، لیدها، فرصت‌ها، قیف فروش، وظایف، فعالیت‌ها، تیکت‌ها، گزارش‌ها، اعلان‌ها و گزارش لاگ سیستم است. پروژه با Docker Compose روی VM یا سیستم محلی بالا می‌آید و از PostgreSQL واقعی، API اختصاصی، احراز هویت JWT و RBAC استفاده می‌کند.

---

## فهرست

- [ویژگی‌ها](#ویژگیها)
- [معماری پروژه](#معماری-پروژه)
- [پیش‌نیازها](#پیشنیازها)
- [راه‌اندازی سریع با Docker](#راهاندازی-سریع-با-docker)
- [ورود و کاربران تست](#ورود-و-کاربران-تست)
- [متغیرهای محیطی](#متغیرهای-محیطی)
- [دستورات کاربردی](#دستورات-کاربردی)
- [ماژول‌های سیستم](#ماژولهای-سیستم)
- [APIهای اصلی](#apiهای-اصلی)
- [دیتابیس و Migration](#دیتابیس-و-migration)
- [Seed و داده نمایشی](#seed-و-داده-نمایشی)
- [استقرار Production](#استقرار-production)
- [Backup و Restore](#backup-و-restore)
- [امنیت](#امنیت)
- [عیب‌یابی](#عیبیابی)
- [ساختار پوشه‌ها](#ساختار-پوشهها)

---

## ویژگی‌ها

- رابط کاربری کاملاً فارسی و RTL
- طراحی responsive همراه با سایدبار، منوی ساندویچی و قابلیت pin/unpin منو در دسکتاپ
- احراز هویت با ایمیل و رمز عبور
- JWT access token با زمان فعال پیش‌فرض `1h` و refresh token با زمان پیش‌فرض `7d`
- RBAC واقعی در backend و frontend
- مدیریت کاربران، نقش‌ها و permissionها
- مدیریت مشتریان حقیقی/حقوقی با وضعیت، مالک، سلامت مشتری و export/import
- مدیریت لیدها با فرم پیشرفته، وضعیت، احتمال تبدیل، امتیاز، نیاز لجستیکی و تبدیل به مشتری
- مدیریت فرصت‌ها، مرحله فروش، مبلغ، احتمال، مبلغ وزنی، برد/باخت و اتصال به مشتری/لید
- قیف فروش Kanban با مراحل قابل ویرایش در تنظیمات
- مدیریت وظایف با وضعیت، اولویت، رکورد مرتبط، یادآور و تکمیل وظیفه
- مدیریت فعالیت‌ها به‌عنوان Timeline عملیاتی CRM
- مدیریت تیکت‌ها با وضعیت، اولویت، SLA، تیم، تاریخچه و تبدیل به وظیفه
- اعلان بالای پنل برای موارد assign شده به کاربر
- جستجوی سراسری در رکوردهای اصلی
- داشبورد مدیریتی با KPI و نمودار
- گزارش‌های مدیریتی واقعی برای لید، فروش، فعالیت، SLA و فرصت‌ها
- گزارش لاگ سیستم برای عملیات حساس
- خروجی CSV فارسی با BOM برای Excel
- Migration و Seed اتوماتیک در Docker

---

## معماری پروژه

پروژه به‌صورت monorepo و workspaceهای npm ساخته شده است.

```txt
.
├── apps
│   ├── api              # Express + TypeScript + Prisma
│   └── web              # React + Vite + TypeScript
├── infra
│   ├── nginx            # Reverse proxy config
│   └── scripts          # Backup/restore scripts
├── docker-compose.yml   # اجرای محلی/دمو
├── docker-compose.prod.yml
├── .env.example
├── DEPLOYMENT.md
├── SECURITY.md
└── README.md
```

### سرویس‌ها

| سرویس | نقش |
|---|---|
| `postgres` | دیتابیس PostgreSQL 16 با volume پایدار |
| `redis` | آماده برای cache/job/rate-limit آینده |
| `api` | API اصلی CRM روی Express و Prisma |
| `web` | رابط کاربری React/Vite build شده پشت nginx |
| `nginx` | Reverse proxy برای `/` و `/api` روی پورت 80 |

---

## پیش‌نیازها

برای اجرای Docker:

- Docker Desktop یا Docker Engine
- Docker Compose v2
- حداقل ۲ CPU، ۴GB RAM برای تست محلی

برای توسعه بدون Docker:

- Node.js 22 یا سازگار
- npm
- PostgreSQL 16
- Redis اختیاری

---

## راه‌اندازی سریع با Docker

در ریشه پروژه اجرا کنید:

```bash
cp .env.example .env
docker compose up -d --build
```

بعد از بالا آمدن سرویس‌ها، برنامه از این آدرس در دسترس است:

```txt
http://localhost
```

سلامت API:

```bash
curl http://localhost/api/health
```

خروجی مورد انتظار:

```json
{"ok":true,"name":"CRM API"}
```

وضعیت سرویس‌ها:

```bash
docker compose ps
```

لاگ API:

```bash
docker compose logs --no-color --tail=200 api
```

---

## ورود و کاربران تست

کاربر ادمین اولیه از `.env` ساخته می‌شود:

```env
INITIAL_ADMIN_EMAIL=admin@example.com
INITIAL_ADMIN_PASSWORD=change_me_immediately
INITIAL_ADMIN_NAME=مدیر سیستم
```

در حالت seed نمایشی، کاربران زیر نیز ساخته می‌شوند:

| نام | ایمیل | رمز عبور | نقش تقریبی |
|---|---|---|---|
| سارا احمدی | `sara.sales@example.com` | `Demo@123456` | کاربر فروش |
| علی محمدی | `ali.support@example.com` | `Demo@123456` | کاربر پشتیبانی |
| مینا کریمی | `mina.manager@example.com` | `Demo@123456` | مدیر فروش/مدیر تیم |

> در محیط Production حتماً رمز ادمین اولیه و secretها را تغییر دهید.

---

## متغیرهای محیطی

فایل نمونه: `.env.example`

| متغیر | توضیح | مقدار نمونه |
|---|---|---|
| `NODE_ENV` | حالت اجرا | `production` |
| `APP_NAME` | نام برنامه | `Digiexpress CRM` |
| `APP_URL` | آدرس عمومی برنامه | `https://crm.example.com` |
| `POSTGRES_DB` | نام دیتابیس | `crm` |
| `POSTGRES_USER` | کاربر دیتابیس | `crm_user` |
| `POSTGRES_PASSWORD` | رمز دیتابیس | `change_me_securely` |
| `DATABASE_URL` | اتصال Prisma به PostgreSQL | `postgresql://...` |
| `JWT_ACCESS_SECRET` | secret توکن کوتاه‌مدت | مقدار طولانی و تصادفی |
| `JWT_REFRESH_SECRET` | secret توکن refresh | مقدار طولانی و تصادفی |
| `JWT_ACCESS_EXPIRES_IN` | زمان نشست فعال | `1h` |
| `JWT_REFRESH_EXPIRES_IN` | زمان refresh token | `7d` |
| `BCRYPT_SALT_ROUNDS` | سختی هش رمز عبور | `12` |
| `INITIAL_ADMIN_EMAIL` | ایمیل ادمین اولیه | `admin@example.com` |
| `INITIAL_ADMIN_PASSWORD` | رمز ادمین اولیه | `change_me_immediately` |
| `AUTO_SEED` | اجرای seed هنگام بالا آمدن API | `true` |
| `SEED_DEMO_DATA` | ساخت داده نمایشی | `true` |
| `TZ` | منطقه زمانی | `Asia/Tehran` |

---

## دستورات کاربردی

### Build کل پروژه

```bash
npm run build
```

### Build جداگانه API

```bash
npm run build --workspace apps/api
```

### Build جداگانه Web

```bash
npm run build --workspace apps/web
```

### اجرای migration داخل Docker

```bash
docker compose exec api npm run prisma:migrate
```

### اجرای seed داخل Docker

```bash
docker compose exec api npm run seed
```

### مشاهده لاگ‌ها

```bash
docker compose logs -f api
docker compose logs -f web
docker compose logs -f nginx
```

### rebuild کامل

```bash
docker compose up -d --build
```

### پاک کردن کامل داده تست و شروع مجدد

> این دستور volume دیتابیس را حذف می‌کند؛ فقط برای محیط تست استفاده شود.

```bash
docker compose down -v
docker compose up -d --build
```

---

## ماژول‌های سیستم

### 1. احراز هویت

- ورود با ایمیل/رمز عبور
- access token و refresh token
- logout و invalidate refresh token
- session فعال یک‌ساعته با `JWT_ACCESS_EXPIRES_IN=1h`

### 2. کاربران، نقش‌ها و دسترسی‌ها

- ایجاد، ویرایش، فعال/غیرفعال‌سازی کاربران
- ایجاد نقش سفارشی
- اتصال permissionها به نقش‌ها
- کنترل دسترسی روی endpointها با `can(permission)`

### 3. مشتریان

- مشتری حقیقی/حقوقی
- اطلاعات تماس، شرکت، آدرس، شهر، استان، کد اقتصادی، شناسه ملی
- وضعیت مشتری، segment، سطح مشتری، سلامت مشتری و ریسک ریزش
- تشخیص duplicate
- import/export CSV
- فعالیت‌ها، وظایف، فرصت‌ها و تیکت‌های مرتبط

### 4. لیدها

- فرم پیشرفته لید با فیلدهای فروش و لجستیک
- وضعیت فارسی‌شده و احتمال تبدیل خودکار
- امتیازدهی لید
- مالک/مسئول پیگیری
- جزئیات کامل لید به تفکیک بخش‌ها
- Timeline فعالیت‌ها
- تبدیل لید به مشتری

### 5. فرصت‌ها

- فرصت متصل به مشتری و در صورت نیاز لید
- مبلغ، احتمال، مبلغ وزنی، مرحله قیف، وضعیت، اولویت
- برد/باخت فرصت
- ایجاد وظیفه و فعالیت از فرصت
- اعلان هنگام assign شدن

### 6. قیف فروش

- Kanban مراحل فروش
- تغییر مرحله با ثبت activity و audit log
- مراحل قابل ویرایش در تنظیمات
- احتمال هر مرحله روی فرصت‌ها اثر می‌گذارد

### 7. فعالیت‌ها

- ثبت تماس، جلسه، یادداشت، ایمیل، پیامک، واتساپ، پیگیری و فعالیت سیستمی
- اتصال به Lead, Customer, Opportunity, Ticket, Task و حالت عمومی
- فیلتر پیشرفته
- Timeline بر اساس رکورد مرتبط
- پیگیری‌های امروز و عقب‌افتاده
- تبدیل Activity به Task
- soft delete
- خروجی CSV فارسی

### 8. وظایف

- مسئول، ایجادکننده، وضعیت، اولویت، نوع، تاریخ سررسید
- رکورد مرتبط به‌صورت انتخابی
- تکمیل وظیفه و ثبت نتیجه
- خروجی CSV
- اعلان هنگام assign شدن

### 9. تیکت‌ها

- اتصال به مشتری یا لید
- وضعیت، اولویت، نوع، کانال، تیم، SLA
- تاریخچه تغییر وضعیت
- حل/بستن/لغو با دلیل
- ایجاد وظیفه از تیکت
- خروجی CSV

### 10. گزارش‌ها

- KPIهای اصلی: کل لیدها، نرخ تبدیل، فرصت‌های باز، ارزش قیف، تیکت‌های باز، SLA نقض‌شده، وظایف عقب‌افتاده و فعالیت‌های امروز
- گزارش قیف فروش
- گزارش تبدیل لید
- خلاصه فعالیت‌ها
- گزارش SLA
- جدول تفصیلی
- خروجی CSV

### 11. اعلان‌ها

- اعلان برای وظایف، تیکت‌ها و فرصت‌های assign شده
- نمایش در زنگ بالای پنل
- با کلیک روی اعلان، رکورد خوانده می‌شود و کاربر به بخش مرتبط هدایت می‌شود

### 12. گزارش لاگ سیستم

- ثبت عملیات حساس مانند ایجاد/ویرایش/حذف، export، تبدیل لید، تغییر مرحله فرصت و مدیریت نقش‌ها
- نمایش در صفحه گزارش لاگ سیستم

---

## APIهای اصلی

همه مسیرهای اصلی زیر با prefix `/api` در دسترس‌اند.

### Auth

```txt
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
GET  /api/auth/me
```

### Users / Roles / Permissions

```txt
GET    /api/users
POST   /api/users
GET    /api/users/:id
PATCH  /api/users/:id
PATCH  /api/users/:id/disable
PATCH  /api/users/:id/enable

GET    /api/roles
POST   /api/roles
GET    /api/roles/:id
PATCH  /api/roles/:id
DELETE /api/roles/:id
POST   /api/roles/:id/permissions
GET    /api/permissions
```

### Customers

```txt
GET    /api/customers
POST   /api/customers
GET    /api/customers/:id
PATCH  /api/customers/:id
DELETE /api/customers/:id
GET    /api/customers/duplicates
GET    /api/customers/export
POST   /api/customers/import
PATCH  /api/customers/bulk
GET    /api/customers/:id/summary
GET    /api/customers/:id/timeline
GET    /api/customers/:id/opportunities
GET    /api/customers/:id/tickets
GET    /api/customers/:id/tasks
```

### Leads

```txt
GET    /api/leads
POST   /api/leads
GET    /api/leads/:id
PATCH  /api/leads/:id
DELETE /api/leads/:id
GET    /api/leads/export
POST   /api/leads/:id/assign
PATCH  /api/leads/:id/status
POST   /api/leads/:id/convert
GET    /api/leads/:id/activities
POST   /api/leads/:id/activities
```

### Opportunities / Pipeline

```txt
GET    /api/opportunities
POST   /api/opportunities
GET    /api/opportunities/:id
PATCH  /api/opportunities/:id
DELETE /api/opportunities/:id
GET    /api/opportunities/export/csv
POST   /api/opportunities/:id/mark-won
POST   /api/opportunities/:id/mark-lost
POST   /api/opportunities/:id/tasks
POST   /api/opportunities/:id/activities
POST   /api/opportunities/:id/change-stage
GET    /api/pipeline-stages
PATCH  /api/pipeline-stages/:id
```

### Activities

```txt
GET    /api/activities
POST   /api/activities
GET    /api/activities/:id
PATCH  /api/activities/:id
DELETE /api/activities/:id
GET    /api/activities/export
GET    /api/activities/followups/today
GET    /api/activities/followups/overdue
GET    /api/activities/timeline/:relatedType/:relatedId
POST   /api/activities/:id/convert-to-task
GET    /api/entities/:entityType/:entityId/activities
```

### Tasks

```txt
GET    /api/tasks
POST   /api/tasks
PATCH  /api/tasks/:id
DELETE /api/tasks/:id
GET    /api/tasks/export
POST   /api/tasks/:id/complete
```

### Tickets

```txt
GET    /api/tickets
POST   /api/tickets
PATCH  /api/tickets/:id
DELETE /api/tickets/:id
GET    /api/tickets/export
PATCH  /api/tickets/:id/status
POST   /api/tickets/:id/create-task
```

### Reports / Dashboard / Search / Notifications

```txt
GET   /api/reports/dashboard
GET   /api/reports/summary
GET   /api/reports/sales-pipeline
GET   /api/reports/lead-conversion
GET   /api/reports/activity-summary
GET   /api/reports/support-sla
GET   /api/reports/export
GET   /api/search?q=...
GET   /api/notifications
PATCH /api/notifications/:id/read
GET   /api/audit-logs
```

---

## دیتابیس و Migration

Prisma schema در مسیر زیر است:

```txt
apps/api/prisma/schema.prisma
```

Migrationها در مسیر زیر قرار دارند:

```txt
apps/api/prisma/migrations
```

در Docker، entrypoint سرویس API قبل از start، migrationها را با دستور زیر deploy می‌کند:

```bash
npm run prisma:migrate
```

برای ساخت migration جدید در محیط توسعه:

```bash
cd apps/api
npx prisma migrate dev --name your_migration_name
```

برای generate کردن Prisma Client:

```bash
npm run prisma:generate --workspace apps/api
```

---

## Seed و داده نمایشی

Seed در مسیر زیر است:

```txt
apps/api/prisma/seed.ts
```

رفتار seed:

- permissionها را می‌سازد
- نقش‌های پایه را می‌سازد
- کاربر ادمین اولیه را می‌سازد
- مراحل قیف فروش را فارسی و قابل ویرایش می‌سازد
- در صورت `SEED_DEMO_DATA=true`، داده نمایشی برای تست پنل می‌سازد

اجرای دستی:

```bash
docker compose exec api npm run seed
```

در Docker Compose فعلی:

```yaml
AUTO_SEED: "true"
SEED_DEMO_DATA: "true"
```

برای Production پیشنهاد می‌شود `SEED_DEMO_DATA=false` شود.

---

## استقرار Production

برای Production از فایل زیر استفاده کنید:

```txt
docker-compose.prod.yml
```

مراحل پیشنهادی:

```bash
git clone <repo-url>
cd <repo-folder>
cp .env.example .env
nano .env
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f api
```

قبل از production حتماً تغییر دهید:

- `POSTGRES_PASSWORD`
- `DATABASE_URL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `INITIAL_ADMIN_PASSWORD`
- `APP_URL`
- `API_URL`

پیشنهاد زیرساخت:

- Ubuntu 22.04 یا 24.04
- ۲ vCPU یا بیشتر
- ۴GB RAM یا بیشتر
- ۴۰GB disk یا بیشتر
- Reverse proxy با HTTPS
- Firewall فقط برای 80/443/SSH
- Backup زمان‌بندی‌شده دیتابیس

---

## Backup و Restore

اسکریپت‌های زیر در پوشه `infra/scripts` قرار دارند.

### Backup

```bash
./infra/scripts/backup-db.sh
```

### Restore

```bash
./infra/scripts/restore-db.sh backups/crm-YYYYMMDD-HHMMSS.sql
```

> قبل از restore در محیط واقعی، از وضعیت فعلی دیتابیس backup بگیرید.

---

## امنیت

- رمزها با bcrypt ذخیره می‌شوند.
- API با JWT محافظت می‌شود.
- Backend مرجع اصلی RBAC است؛ frontend فقط نمایش UI را محدود می‌کند.
- عملیات حساس در AuditLog ذخیره می‌شوند.
- خروجی CSV نیازمند permission جداگانه است.
- secretها نباید در repository واقعی commit شوند.
- برای Production حتماً HTTPS فعال شود.
- کاربر ادمین اولیه باید بعد از اولین ورود تغییر رمز دهد.

فایل تکمیلی امنیت:

```txt
SECURITY.md
```

---

## عیب‌یابی

### API unhealthy است

```bash
docker compose logs --no-color --tail=200 api
```

موارد رایج:

- اتصال PostgreSQL اشتباه است
- migration شکست خورده است
- secret یا env اشتباه است
- volume دیتابیس قبلاً migration ناسازگار دارد

### دیتابیس تمیز برای تست می‌خواهید

```bash
docker compose down -v
docker compose up -d --build
```

### ورود انجام نمی‌شود

- بررسی کنید seed اجرا شده باشد.
- مقدارهای `INITIAL_ADMIN_EMAIL` و `INITIAL_ADMIN_PASSWORD` را بررسی کنید.
- لاگ API را ببینید.

```bash
docker compose exec api npm run seed
```

### تغییرات UI دیده نمی‌شود

- Docker image وب را rebuild کنید.
- مرورگر را با `Ctrl + F5` refresh کنید.

```bash
docker compose up -d --build web nginx
```

### health check

```bash
curl http://localhost/api/health
```

### build محلی

```bash
npm install
npm run build --workspace apps/api
npm run build --workspace apps/web
```

---

## ساختار پوشه‌ها

```txt
apps/api
├── Dockerfile
├── docker-entrypoint.sh
├── package.json
├── prisma
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations
├── src
│   └── index.ts
└── tsconfig.json

apps/web
├── Dockerfile
├── nginx.conf
├── package.json
├── public
│   └── logo.svg
├── src
│   ├── main.tsx
│   └── styles.css
└── tsconfig.json

infra
├── nginx
│   ├── default.conf
│   └── nginx.conf
└── scripts
    ├── backup-db.sh
    └── restore-db.sh
```

---

## چک‌لیست آماده‌سازی Production

- [ ] تغییر رمز PostgreSQL
- [ ] تغییر JWT secretها به مقدارهای طولانی و تصادفی
- [ ] تغییر رمز ادمین اولیه
- [ ] غیرفعال کردن داده نمایشی در Production
- [ ] فعال‌سازی HTTPS
- [ ] تنظیم firewall
- [ ] تنظیم backup زمان‌بندی‌شده
- [ ] بررسی لاگ‌های API و Nginx بعد از deploy
- [ ] تست ورود ادمین
- [ ] تست ایجاد کاربر، نقش، مشتری، لید، فرصت، وظیفه، فعالیت و تیکت
- [ ] تست گزارش‌ها و export CSV

---

## وضعیت فعلی اعتبارسنجی

در آخرین اجرای محلی، این دستورات با موفقیت اجرا شده‌اند:

```bash
npm run build --workspace apps/api
npm run build --workspace apps/web
docker compose up -d --build
```

و health endpoint پاسخ داده است:

```json
{"ok":true,"name":"CRM API"}
```
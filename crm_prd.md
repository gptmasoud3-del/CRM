# PRD تخصصی وب‌اپلیکیشن CRM سازمانی

> نسخه: v0.1  
> نوع سند: Product Requirements Document  
> پلتفرم هدف: Web Application / Dockerized CRM  
> زبان محصول: فارسی / RTL  
> وضعیت: Draft آماده برای ارائه به Codex، تیم محصول، طراحی و مهندسی

---

## 1. اطلاعات سند

| آیتم | مقدار |
|---|---|
| نام محصول | Web-based CRM Platform |
| نسخه سند | v0.1 |
| مالک محصول | Product Owner / Business Owner |
| ذی‌نفعان اصلی | Sales, Support, Marketing, Operations, Finance, Data, Engineering, Security |
| پلتفرم هدف | Web App / Desktop-first / Responsive |
| نوع محصول | Internal Enterprise CRM |
| وضعیت | Draft for Review |

---

## 2. خلاصه اجرایی

هدف این محصول، طراحی و پیاده‌سازی یک وب‌اپلیکیشن CRM متمرکز برای مدیریت چرخه کامل ارتباط با مشتریان، لیدها، فرصت‌های فروش، تعاملات، تیکت‌ها، وظایف، گزارش‌ها و داده‌های رفتاری مشتری است.

این CRM باید به تیم‌های فروش، پشتیبانی، بازاریابی و عملیات کمک کند تا:

- دید ۳۶۰ درجه از هر مشتری داشته باشند.
- تاریخچه تعاملات، خریدها، تیکت‌ها و فعالیت‌ها را یکپارچه ببینند.
- فرآیندهای فروش و پیگیری مشتریان را ساختارمند کنند.
- وظایف، یادآورها، SLAها و پیگیری‌ها را قابل کنترل کنند.
- گزارش‌های عملیاتی، مدیریتی و تحلیلی قابل اتکا تولید کنند.
- با ابزارهای داخلی/خارجی مانند ایمیل، پیامک، تلفن، ERP، BI، مارکتینگ اتومیشن و سیستم تیکتینگ یکپارچه شود.

---

## 3. مسئله / Problem Statement

در وضعیت فعلی، اطلاعات مشتریان، لیدها، تعاملات، فعالیت‌های فروش، سوابق پشتیبانی و گزارش‌های مدیریتی معمولاً در ابزارهای جداگانه، فایل‌های اکسل، سیستم‌های قدیمی یا ارتباطات غیرساختارمند پراکنده‌اند.

این موضوع باعث مشکلات زیر می‌شود:

1. عدم وجود یک منبع واحد حقیقت برای اطلاعات مشتری.
2. کاهش کیفیت پیگیری لیدها و فرصت‌های فروش.
3. دوباره‌کاری بین تیم‌های فروش، پشتیبانی و عملیات.
4. نبود دید مدیریتی دقیق نسبت به قیف فروش، عملکرد کارشناسان و وضعیت مشتریان.
5. دشواری در تحلیل رفتار مشتری، ارزش مشتری، ریسک ریزش و فرصت‌های Upsell/Cross-sell.
6. نبود استاندارد در ثبت فعالیت‌ها، تماس‌ها، یادداشت‌ها و وظایف.
7. ضعف در کنترل SLA، اولویت‌بندی و پیگیری موارد مهم.

---

## 4. اهداف محصول

### 4.1 اهداف کسب‌وکاری

- افزایش نرخ تبدیل لید به مشتری.
- کاهش زمان پاسخ‌گویی و پیگیری.
- افزایش بهره‌وری تیم فروش و پشتیبانی.
- افزایش Retention و کاهش Churn.
- بهبود کیفیت داده‌های مشتری.
- فراهم کردن گزارش‌های مدیریتی قابل اعتماد.
- ایجاد پایه داده‌ای برای تحلیل، امتیازدهی مشتری و اتوماسیون.

### 4.2 اهداف محصولی

- ایجاد پروفایل جامع مشتری.
- مدیریت لیدها، فرصت‌ها، معاملات و Pipeline فروش.
- مدیریت فعالیت‌ها شامل تماس، ایمیل، جلسه، یادداشت و وظیفه.
- مدیریت تیکت‌ها یا ارتباط با سیستم تیکتینگ موجود.
- ارائه داشبوردهای عملیاتی و مدیریتی.
- امکان جست‌وجو، فیلتر، سگمنت‌بندی و Export.
- تعریف Role-based Access Control.
- پشتیبانی از Audit Log و تاریخچه تغییرات.
- طراحی UX سریع، قابل فهم و مناسب حجم داده بالا.

### 4.3 اهداف تجربه کاربری

- کاهش تعداد کلیک برای انجام کارهای پرتکرار.
- نمایش اطلاعات مهم مشتری بدون نیاز به جابه‌جایی زیاد بین صفحات.
- طراحی جدول‌ها، فرم‌ها و داشبوردها برای کاربران حرفه‌ای.
- فراهم کردن جست‌وجوی سریع و فیلترهای قدرتمند.
- ارائه وضعیت‌ها، اولویت‌ها و هشدارها به شکل واضح.
- سازگاری با استفاده روزانه طولانی‌مدت.

---

## 5. فرضیات کلیدی

1. CRM برای استفاده داخلی سازمان طراحی می‌شود.
2. کاربران اصلی شامل کارشناسان فروش، کارشناسان پشتیبانی، مدیران تیم، مدیران ارشد و ادمین سیستم هستند.
3. محصول Desktop-first است، اما باید در تبلت و موبایل نیز قابل استفاده باشد.
4. داده‌های مشتری می‌تواند از منابع مختلف وارد شود؛ مانند ثبت دستی، API، فایل CSV، سیستم سفارشات، فرم‌های لید، کمپین‌ها یا سیستم پشتیبانی.
5. سطح دسترسی به داده‌های مشتری اهمیت بالایی دارد.
6. حجم داده زیاد است و باید طراحی محصول برای جست‌وجو، فیلتر، Pagination، Bulk Action و Performance بهینه باشد.

---

## 6. کاربران هدف و Personaها

### 6.1 کارشناس فروش

**نیازها:**

- مشاهده لیدهای جدید.
- ثبت تماس و نتیجه پیگیری.
- ساخت فرصت فروش.
- برنامه‌ریزی وظایف و یادآورها.
- مشاهده وضعیت Pipeline شخصی.
- دسترسی سریع به سوابق مشتری.

**دردها:**

- پراکندگی اطلاعات.
- فراموش شدن Follow-upها.
- ثبت دستی طولانی.
- نبود اولویت‌بندی لیدها.

### 6.2 مدیر فروش

**نیازها:**

- مشاهده عملکرد اعضای تیم.
- کنترل Pipeline و Forecast.
- بررسی فرصت‌های گیرکرده.
- تخصیص لیدها.
- گزارش نرخ تبدیل و دلایل شکست.

**دردها:**

- نبود گزارش قابل اعتماد.
- سختی در تشخیص گلوگاه‌ها.
- عدم شفافیت در فعالیت کارشناسان.

### 6.3 کارشناس پشتیبانی / ارتباط با مشتری

**نیازها:**

- مشاهده سوابق کامل مشتری.
- دیدن تیکت‌ها، شکایات، تماس‌ها و پیام‌ها.
- ثبت تعاملات جدید.
- ارجاع موضوع به تیم دیگر.
- مشاهده SLA و اولویت‌ها.

**دردها:**

- نبود دید کامل از مشتری.
- تکرار سؤال از مشتری.
- زمان زیاد برای پیدا کردن اطلاعات.

### 6.4 مدیر عملیات / CRM Admin

**نیازها:**

- مدیریت کاربران و نقش‌ها.
- تنظیم Pipelineها، Statusها و فیلدهای سفارشی.
- تعریف قوانین تخصیص و اتوماسیون.
- بررسی لاگ‌ها و کیفیت داده.

**دردها:**

- نیاز به تغییرات سریع بدون وابستگی زیاد به تیم فنی.
- پیچیدگی در کنترل دسترسی.
- داده‌های ناقص یا تکراری.

### 6.5 مدیر ارشد

**نیازها:**

- داشبوردهای خلاصه مدیریتی.
- KPIهای فروش، پشتیبانی، Retention و Revenue.
- مشاهده روندها و ریسک‌ها.
- خروجی قابل ارائه در جلسات.

**دردها:**

- گزارش‌های متناقض.
- تأخیر در دریافت داده.
- نبود دید کلان قابل اعتماد.

---

## 7. دامنه محصول

### 7.1 داخل دامنه / In Scope

- مدیریت مشتریان.
- مدیریت لیدها.
- مدیریت فرصت‌های فروش.
- مدیریت Pipeline.
- مدیریت فعالیت‌ها و تعاملات.
- مدیریت وظایف و یادآورها.
- پروفایل ۳۶۰ درجه مشتری.
- جست‌وجو، فیلتر و سگمنت‌بندی.
- داشبوردها و گزارش‌ها.
- مدیریت کاربران، نقش‌ها و دسترسی‌ها.
- لاگ فعالیت و Audit Trail.
- Import/Export داده.
- API Integration.
- Notification داخلی.
- تنظیمات پایه سیستم.

### 7.2 خارج از دامنه نسخه اول / Out of Scope for MVP

- هوش مصنوعی پیشرفته برای پیش‌بینی فروش.
- مارکتینگ اتومیشن کامل.
- سیستم تلفن VoIP داخلی کامل.
- چت زنده داخلی.
- اپلیکیشن موبایل Native.
- سیستم مالی یا صدور فاکتور کامل.
- BI پیشرفته با Query Builder آزاد.
- ماژول وفاداری مشتری در نسخه اول.

---

## 8. ماژول‌های اصلی محصول

## 8.1 ماژول Dashboard

### هدف

ارائه نمای سریع و عملیاتی از وضعیت کاربر، تیم و کسب‌وکار.

### نیازمندی‌ها

داشبورد باید بسته به نقش کاربر شخصی‌سازی شود.

#### برای کارشناس فروش

- تعداد لیدهای جدید.
- وظایف امروز.
- Follow-upهای عقب‌افتاده.
- فرصت‌های باز.
- معاملات در آستانه بسته شدن.
- نرخ تبدیل شخصی.
- آخرین تعاملات.

#### برای مدیر فروش

- ارزش کل Pipeline.
- تعداد فرصت‌ها در هر مرحله.
- نرخ تبدیل هر مرحله.
- عملکرد کارشناسان.
- فرصت‌های بدون فعالیت.
- لیدهای تخصیص‌داده‌نشده.
- Forecast فروش.

#### برای پشتیبانی

- تیکت‌های باز.
- موارد SLA نزدیک به نقض.
- مشتریان با ریسک بالا.
- تعاملات اخیر.
- تیکت‌های Escalated.

### معیارهای پذیرش

- کاربر باید بتواند داشبورد مربوط به نقش خود را مشاهده کند.
- داده‌ها باید حداکثر با تأخیر قابل قبول `[X دقیقه]` به‌روزرسانی شوند.
- کارت‌های KPI باید قابلیت Drill-down داشته باشند.
- وضعیت Loading، Empty State و Error State باید طراحی شود.

---

## 8.2 ماژول Customer Management

### هدف

ایجاد یک منبع واحد حقیقت برای اطلاعات مشتریان.

### موجودیت Customer

فیلدهای پیشنهادی:

- Customer ID
- نام کامل / نام شرکت
- نوع مشتری: شخص حقیقی / حقوقی
- وضعیت مشتری: فعال، غیرفعال، بالقوه، ریسک‌دار، از دست رفته
- Segment
- Tier
- شماره تماس
- ایمیل
- آدرس
- منبع جذب
- مالک حساب / Account Owner
- تاریخ ایجاد
- تاریخ آخرین تعامل
- ارزش طول عمر مشتری / CLV
- تعداد سفارش‌ها / معاملات
- مجموع درآمد
- وضعیت رضایت / NPS یا CSAT
- برچسب‌ها / Tags
- فیلدهای سفارشی

### صفحات مورد نیاز

#### لیست مشتریان

قابلیت‌ها:

- جدول با ستون‌های قابل تنظیم.
- Search سریع.
- Advanced Filters.
- Sort.
- Pagination یا Infinite Scroll کنترل‌شده.
- Bulk Actions.
- Export.
- Save View.
- انتخاب ستون‌ها.
- نمایش وضعیت مشتری با Badge.
- نمایش مالک مشتری.
- نمایش آخرین تعامل.

#### پروفایل مشتری

بخش‌های پیشنهادی:

1. خلاصه مشتری
2. اطلاعات تماس
3. Timeline تعاملات
4. سفارش‌ها / معاملات
5. فرصت‌های فروش
6. تیکت‌ها
7. وظایف مرتبط
8. یادداشت‌ها
9. فایل‌ها و پیوست‌ها
10. لاگ تغییرات
11. سلامت مشتری / Health Score
12. پیشنهادهای بعدی / Next Best Action

### معیارهای پذیرش

- کاربر مجاز باید بتواند مشتری جدید ایجاد کند.
- سیستم باید از ایجاد مشتری تکراری تا حد ممکن جلوگیری کند.
- تغییرات حساس باید در Audit Log ثبت شوند.
- پروفایل مشتری باید تمام سوابق مرتبط را تجمیع کند.
- فیلدهای اجباری باید مشخص باشند.
- خطاهای فرم باید واضح و قابل اصلاح باشند.

---

## 8.3 ماژول Lead Management

### هدف

مدیریت لیدها از لحظه ورود تا تبدیل به مشتری یا رد شدن.

### فیلدهای Lead

- Lead ID
- نام
- شماره تماس
- ایمیل
- شرکت
- منبع لید
- کمپین
- وضعیت لید
- امتیاز لید / Lead Score
- مالک لید
- تاریخ ورود
- آخرین فعالیت
- دلیل رد شدن
- اولویت
- توضیحات
- Tags

### وضعیت‌های پیشنهادی Lead

- New
- Assigned
- Contacted
- Qualified
- Unqualified
- Converted
- Lost
- Duplicate

### قابلیت‌ها

- ثبت لید دستی.
- Import لید از CSV.
- دریافت لید از API.
- تخصیص دستی یا اتوماتیک.
- جلوگیری از Duplicate.
- تبدیل Lead به Customer.
- تبدیل Lead به Opportunity.
- ثبت دلیل رد شدن.
- ثبت فعالیت روی لید.
- اولویت‌بندی بر اساس Lead Score.
- مشاهده تاریخچه وضعیت.

### معیارهای پذیرش

- هر لید باید وضعیت مشخص داشته باشد.
- لید بدون مالک نباید بیش از `[X ساعت]` باقی بماند، مگر تنظیمات اجازه دهد.
- تبدیل لید باید اطلاعات اصلی را به Customer منتقل کند.
- لیدهای Duplicate باید قابل Merge باشند.
- دلیل Lost/Unqualified باید قابل گزارش‌گیری باشد.

---

## 8.4 ماژول Opportunity / Deal Management

### هدف

مدیریت فرصت‌های فروش در Pipeline.

### فیلدهای Opportunity

- Opportunity ID
- عنوان فرصت
- مشتری مرتبط
- مبلغ تخمینی
- احتمال موفقیت
- مرحله Pipeline
- تاریخ پیش‌بینی بسته شدن
- مالک فرصت
- منبع فرصت
- محصولات/خدمات مرتبط
- رقبا
- دلیل برد / باخت
- آخرین فعالیت
- Next Step
- فایل‌ها
- یادداشت‌ها

### مراحل پیشنهادی Pipeline

- Prospecting
- Qualification
- Needs Analysis
- Proposal
- Negotiation
- Won
- Lost

### قابلیت‌ها

- نمایش Kanban Pipeline.
- نمایش Table View.
- Drag & Drop بین مراحل.
- ثبت دلیل تغییر مرحله.
- هشدار فرصت‌های بدون فعالیت.
- Forecast بر اساس مبلغ، احتمال و تاریخ بسته شدن.
- ثبت رقبا و موانع.
- مشاهده تاریخچه تغییرات.
- تعریف Pipelineهای مختلف برای تیم‌ها یا محصولات مختلف.

### معیارهای پذیرش

- جابه‌جایی مرحله باید در تاریخچه ثبت شود.
- برای Lost شدن فرصت، ثبت دلیل اجباری باشد.
- Opportunity بدون Customer معتبر ایجاد نشود.
- مبلغ و تاریخ بسته شدن باید قابل گزارش‌گیری باشند.
- مدیر باید بتواند Pipeline اعضای تیم را مشاهده کند.

---

## 8.5 ماژول Activity & Interaction Timeline

### هدف

ثبت و مشاهده تمام تعاملات با مشتری یا لید.

### انواع فعالیت

- تماس تلفنی
- ایمیل
- جلسه
- پیامک
- چت
- یادداشت داخلی
- Task
- Follow-up
- تغییر وضعیت
- فایل پیوست
- تعامل سیستمی

### قابلیت‌ها

- ثبت سریع فعالیت از پروفایل مشتری.
- نمایش Timeline مرتب‌شده بر اساس زمان.
- فیلتر بر اساس نوع فعالیت.
- Mention کردن کاربر دیگر.
- Pin کردن فعالیت مهم.
- ثبت نتیجه تماس.
- تعریف Next Action.
- اتصال فعالیت به Lead، Customer، Opportunity یا Ticket.
- امکان Private Note برای کاربران مجاز.

### معیارهای پذیرش

- هر فعالیت باید Creator، Timestamp و Entity مرتبط داشته باشد.
- کاربر باید بتواند فعالیت‌های غیرحساس خود را ویرایش کند.
- فعالیت‌های سیستمی نباید حذف شوند.
- Timeline باید در حجم بالا عملکرد قابل قبول داشته باشد.

---

## 8.6 ماژول Task & Reminder

### هدف

مدیریت کارهای روزانه و پیگیری‌ها.

### فیلدهای Task

- عنوان
- توضیحات
- مالک
- وضعیت
- اولویت
- تاریخ سررسید
- Entity مرتبط
- نوع Task
- Reminder
- نتیجه
- تاریخ تکمیل

### وضعیت‌ها

- Open
- In Progress
- Done
- Canceled
- Overdue

### قابلیت‌ها

- ایجاد Task از هر Entity.
- مشاهده وظایف امروز.
- Reminder داخلی.
- نمایش Overdue.
- تخصیص Task به کاربر دیگر.
- Bulk Update.
- تکرار شونده بودن Task در نسخه‌های بعدی.
- اتصال به Calendar در نسخه‌های بعدی.

### معیارهای پذیرش

- Task سررسید گذشته باید Overdue شود.
- کاربر باید فهرست وظایف خود را ببیند.
- مدیر باید وظایف تیم را ببیند.
- Task باید قابل اتصال به Customer، Lead، Opportunity یا Ticket باشد.

---

## 8.7 ماژول Ticket / Case View

### هدف

نمایش یا مدیریت مسائل پشتیبانی مشتری.

### دو سناریوی پیاده‌سازی

#### سناریو A: CRM خودش Ticket Management دارد

قابلیت‌ها:

- ایجاد Ticket.
- تعیین اولویت.
- تخصیص به کارشناس.
- مدیریت SLA.
- ثبت پاسخ و تعامل.
- Escalation.
- تغییر وضعیت.
- دسته‌بندی موضوعات.

#### سناریو B: اتصال به سیستم تیکتینگ موجود

قابلیت‌ها:

- نمایش تیکت‌های مشتری در پروفایل.
- لینک به سیستم اصلی.
- Sync وضعیت و اولویت.
- نمایش SLA.
- ثبت تعامل خلاصه در CRM.

### فیلدهای Ticket

- Ticket ID
- مشتری
- موضوع
- وضعیت
- اولویت
- دسته‌بندی
- مالک
- زمان ایجاد
- زمان آخرین پاسخ
- SLA Due
- کانال
- CSAT
- متن یا خلاصه

### معیارهای پذیرش

- کاربر باید بتواند تیکت‌های مرتبط با مشتری را ببیند.
- تیکت‌های Critical باید واضح نمایش داده شوند.
- وضعیت SLA باید با رنگ و متن قابل فهم باشد.
- اطلاعات حساس باید براساس نقش محدود شود.

---

## 8.8 ماژول Search & Segmentation

### هدف

پیدا کردن سریع مشتریان، لیدها، فرصت‌ها و فعالیت‌ها.

### قابلیت‌ها

- Global Search.
- جست‌وجو بر اساس نام، شماره، ایمیل، شناسه، شرکت.
- فیلتر پیشرفته.
- ترکیب شرط‌ها با AND/OR.
- ذخیره Viewهای پرکاربرد.
- Segment Builder ساده.
- Export نتایج.
- شمارش نتایج قبل از Export.
- محدودیت دسترسی در نتایج جست‌وجو.

### معیارهای پذیرش

- جست‌وجوی Global باید در کمتر از `[X ثانیه]` پاسخ دهد.
- نتایج باید براساس سطح دسترسی فیلتر شوند.
- کاربر باید بتواند فیلترهای پرتکرار را ذخیره کند.
- فیلترهای پیچیده باید قابل پاک‌سازی سریع باشند.

---

## 8.9 ماژول Reports & Analytics

### هدف

ارائه گزارش‌های عملیاتی و مدیریتی.

### گزارش‌های پیشنهادی

#### Sales Reports

- تعداد لیدها بر اساس منبع.
- نرخ تبدیل لید به مشتری.
- نرخ تبدیل هر مرحله Pipeline.
- ارزش Pipeline.
- Forecast فروش.
- فرصت‌های Won/Lost.
- دلایل Lost.
- فعالیت کارشناسان.
- فرصت‌های بدون فعالیت.

#### Customer Reports

- تعداد مشتریان فعال.
- مشتریان جدید.
- مشتریان ریسک‌دار.
- CLV.
- Segment distribution.
- Retention.
- Churn indicators.

#### Support Reports

- تعداد تیکت‌ها.
- SLA compliance.
- زمان اولین پاسخ.
- زمان حل مشکل.
- CSAT.
- موضوعات پرتکرار.
- مشتریان با شکایت زیاد.

#### Productivity Reports

- تعداد تماس‌ها، ایمیل‌ها، جلسات.
- Tasks completed.
- Overdue tasks.
- Follow-up rate.
- فعالیت بر اساس کاربر و تیم.

### قابلیت‌ها

- Date Range.
- Filter by team/user/source/status.
- Drill-down.
- Export.
- Scheduled Report در نسخه بعدی.
- نمودارهای پایه: Line, Bar, Funnel, Pie/Donut با احتیاط، Table.

### معیارهای پذیرش

- گزارش‌ها باید منبع داده مشخص داشته باشند.
- اعداد داشبورد و گزارش نباید تناقض داشته باشند.
- Export باید سطح دسترسی را رعایت کند.
- تاریخ و منطقه زمانی باید استاندارد باشد.

---

## 8.10 ماژول Admin & Configuration

### هدف

امکان مدیریت تنظیمات CRM بدون نیاز مداوم به توسعه فنی.

### قابلیت‌ها

- مدیریت کاربران.
- مدیریت نقش‌ها.
- مدیریت دسترسی‌ها.
- تعریف Pipeline.
- تعریف مراحل Pipeline.
- تعریف وضعیت‌ها.
- تعریف فیلدهای سفارشی.
- مدیریت Tags.
- مدیریت منابع لید.
- تنظیم قوانین Duplicate Detection.
- تنظیم SLA.
- تنظیم Notification.
- مدیریت Import Mapping.
- مشاهده Audit Logs.

### معیارهای پذیرش

- فقط Admin مجاز به تغییر تنظیمات حیاتی باشد.
- تغییرات تنظیمات باید Audit شوند.
- حذف فیلد یا وضعیت نباید داده تاریخی را خراب کند.
- Roleها باید قابل تست و Preview باشند.

---

## 9. نیازمندی‌های UX/UI

## 9.1 اصول طراحی

CRM یک ابزار عملیاتی روزانه است؛ بنابراین طراحی باید بر سرعت، وضوح، تراکم اطلاعات و کاهش اصطکاک تمرکز کند.

### اصول کلیدی

- Desktop-first.
- Navigation پایدار و قابل پیش‌بینی.
- استفاده از جدول‌های قدرتمند.
- فرم‌های سریع و قابل اسکن.
- حفظ Context کاربر.
- کاهش Modalهای غیرضروری.
- نمایش وضعیت سیستم به‌صورت شفاف.
- پشتیبانی از Keyboard Navigation.
- طراحی Empty Stateهای آموزشی.
- طراحی Error Stateهای قابل اقدام.

---

## 9.2 معماری اطلاعات پیشنهادی

Navigation اصلی:

1. Dashboard
2. Customers
3. Leads
4. Opportunities
5. Tasks
6. Activities
7. Tickets / Cases
8. Reports
9. Admin Settings

Navigation ثانویه در پروفایل مشتری:

- Overview
- Timeline
- Deals
- Tickets
- Tasks
- Notes
- Files
- Audit Log

---

## 9.3 Design System پیشنهادی

### سبک بصری

- Enterprise Clean
- Data-dense
- Minimal but informative
- Low visual noise
- High contrast for operational clarity

### رنگ‌ها

پیشنهاد نقش رنگ‌ها:

- Primary: برای CTA اصلی، لینک‌ها و Active States
- Neutral: برای پس‌زمینه، Border و Text
- Success: وضعیت Won، Completed، Active
- Warning: SLA نزدیک به نقض، Follow-up نزدیک
- Danger: Lost، Overdue، SLA breached
- Info: وضعیت‌های سیستمی و پیام‌های عمومی

### تایپوگرافی

- فونت فارسی پیشنهادی: Vazirmatn، IRANSansX یا Dana
- فونت انگلیسی/عددی: Inter یا همان فونت فارسی با پشتیبانی عددی مناسب
- جدول‌ها باید خوانایی عددی بالا داشته باشند.
- اندازه متن بدنه: ۱۴px یا ۱۵px
- عنوان صفحه: ۲۰px تا ۲۴px
- Label فرم‌ها: ۱۲px تا ۱۳px

### Layout

- Sidebar ثابت یا Collapsible.
- Topbar شامل Global Search، Notification و User Menu.
- محتوای اصلی با حداکثر عرض منطقی.
- استفاده از Split View برای لیست و جزئیات در صفحات پرتکرار.
- Grid پیشنهادی: ۱۲ ستون.
- Spacing scale: 4, 8, 12, 16, 24, 32.

### کامپوننت‌های اصلی

- Data Table
- Advanced Filter
- Search Input
- Saved Views
- Badge
- Status Pill
- Avatar/User Picker
- Date Range Picker
- Timeline
- Kanban Board
- Drawer
- Modal
- Toast
- Empty State
- Form Builder
- Bulk Action Bar
- KPI Card
- Funnel Chart
- Activity Composer
- Comment/Note Box
- Permission Matrix

---

## 9.4 قوانین تجربه کاربری

- هیچ عملیات حذف یا تغییر حساس بدون Confirm انجام نشود.
- عملیات‌های پرتکرار باید Shortcut یا Quick Action داشته باشند.
- فرم‌های طولانی باید Section‌بندی شوند.
- در جدول‌ها، ستون‌های مهم باید قابل Pin باشند.
- فیلتر فعال باید همیشه قابل مشاهده و پاک‌سازی باشد.
- بعد از ثبت فعالیت، کاربر باید نتیجه را فوراً در Timeline ببیند.
- در صفحات داده‌محور، Loading Skeleton بهتر از Spinner تنها است.
- خطاها باید دلیل و راه‌حل داشته باشند.
- Save موفق باید بازخورد واضح داشته باشد.
- در پروفایل مشتری، مهم‌ترین اطلاعات باید Above the Fold باشند.

---

## 9.5 Accessibility

- رعایت WCAG AA برای کنتراست متن.
- پشتیبانی کامل از Keyboard Navigation.
- Focus State واضح.
- عدم اتکا صرف به رنگ برای نمایش وضعیت.
- Label مناسب برای همه Inputها.
- Error Message متصل به فیلد مربوطه.
- پشتیبانی از Reduced Motion.
- جدول‌ها باید برای Screen Reader ساختار مناسب داشته باشند.
- Tooltipها نباید تنها محل نمایش اطلاعات حیاتی باشند.

---

## 10. نیازمندی‌های فنی

## 10.1 معماری پیشنهادی

### Frontend

- React / Next.js
- TypeScript
- Component-driven architecture
- State management: React Query + lightweight client state
- Design system داخلی
- Route-based access control
- Error boundary
- i18n-ready
- RTL-ready

### Backend

- REST یا GraphQL
- Modular service architecture
- Role-based authorization
- Audit logging
- Event-driven integration برای فعالیت‌ها و Notification
- Background jobs برای Import، Export، Sync و Report generation

### Database

موجودیت‌های اصلی:

- Users
- Roles
- Permissions
- Customers
- Leads
- Opportunities
- PipelineStages
- Activities
- Tasks
- Tickets
- Notes
- Tags
- Files
- AuditLogs
- Notifications
- CustomFields
- SavedViews
- Imports
- Exports

### Search

- Full-text search
- Index روی فیلدهای پرجست‌وجو
- امکان استفاده از Elasticsearch/OpenSearch در حجم بالا

### Cache

- Cache برای داشبوردها و گزارش‌های سنگین.
- Invalidation مشخص پس از تغییر داده‌های کلیدی.

---

## 10.2 APIهای کلیدی

### Customer APIs

```txt
GET /customers
POST /customers
GET /customers/{id}
PATCH /customers/{id}
GET /customers/{id}/timeline
GET /customers/{id}/opportunities
GET /customers/{id}/tickets
GET /customers/{id}/tasks
```

### Lead APIs

```txt
GET /leads
POST /leads
PATCH /leads/{id}
POST /leads/{id}/convert
POST /leads/{id}/assign
POST /leads/import
```

### Opportunity APIs

```txt
GET /opportunities
POST /opportunities
PATCH /opportunities/{id}
POST /opportunities/{id}/stage
POST /opportunities/{id}/close-won
POST /opportunities/{id}/close-lost
```

### Activity APIs

```txt
GET /activities
POST /activities
GET /entities/{type}/{id}/activities
```

### Task APIs

```txt
GET /tasks
POST /tasks
PATCH /tasks/{id}
POST /tasks/{id}/complete
```

### Report APIs

```txt
GET /reports/sales-pipeline
GET /reports/lead-conversion
GET /reports/activity
GET /reports/support-sla
```

---

## 10.3 نیازمندی‌های Performance

- زمان Load اولیه اپلیکیشن: کمتر از `[X ثانیه]`.
- پاسخ APIهای لیستی رایج: کمتر از `[X میلی‌ثانیه]` در p95.
- جست‌وجوی Global: کمتر از `[X ثانیه]`.
- جدول‌ها باید با داده زیاد از Pagination یا Virtualization استفاده کنند.
- Exportهای سنگین باید Async باشند.
- داشبوردهای سنگین باید Cache شوند.
- فیلترها باید Server-side باشند.

---

## 10.4 امنیت و دسترسی

### نیازمندی‌ها

- Authentication امن.
- Role-based Access Control.
- Field-level Permission برای داده‌های حساس.
- Team-based Data Visibility.
- Audit Log برای تغییرات حساس.
- Session Management.
- Rate Limiting.
- CSRF/XSS Protection.
- Input Validation.
- Encryption in transit.
- Encryption at rest برای داده‌های حساس.
- Masking شماره تماس یا ایمیل در صورت نیاز.
- Export Permission جداگانه.
- Log کردن دانلودها و Exportها.

### نقش‌های پیشنهادی

- Super Admin
- CRM Admin
- Sales Manager
- Sales Agent
- Support Manager
- Support Agent
- Marketing User
- Read-only Executive
- Data Analyst

---

## 10.5 Audit Log

سیستم باید موارد زیر را ثبت کند:

- ایجاد، ویرایش و حذف مشتری.
- تغییر مالک مشتری، لید یا فرصت.
- تغییر وضعیت Lead.
- تغییر Stage فرصت.
- Close Won/Lost.
- تغییر دسترسی‌ها.
- Export داده.
- Import داده.
- Loginهای مشکوک.
- تغییر تنظیمات Admin.

هر لاگ شامل:

- Actor
- Action
- Entity Type
- Entity ID
- Previous Value
- New Value
- Timestamp
- IP / Device در صورت نیاز

---

## 11. Data Model سطح بالا

### Customer

- id
- type
- name
- phone
- email
- status
- segment
- tier
- owner_id
- source
- clv
- health_score
- created_at
- updated_at

### Lead

- id
- name
- phone
- email
- source
- campaign
- status
- score
- owner_id
- rejection_reason
- converted_customer_id
- created_at
- updated_at

### Opportunity

- id
- customer_id
- title
- amount
- probability
- stage_id
- owner_id
- expected_close_date
- status
- lost_reason
- won_at
- lost_at
- created_at
- updated_at

### Activity

- id
- entity_type
- entity_id
- activity_type
- title
- description
- outcome
- created_by
- occurred_at
- created_at

### Task

- id
- title
- description
- owner_id
- entity_type
- entity_id
- priority
- status
- due_date
- completed_at
- created_at

---

## 12. اتوماسیون‌های پیشنهادی

### نسخه MVP

- تخصیص خودکار لید براساس تیم یا منبع.
- Reminder برای Follow-up.
- هشدار فرصت بدون فعالیت.
- هشدار Task عقب‌افتاده.
- تغییر خودکار وضعیت Task پس از تکمیل.
- Notification برای Mention.

### نسخه‌های بعدی

- Lead Scoring هوشمند.
- Next Best Action.
- هشدار ریسک Churn.
- پیشنهاد Upsell/Cross-sell.
- اتوماسیون ایمیل.
- Playbookهای فروش.
- Workflow Builder.

---

## 13. Notification

### کانال‌ها

- In-app notification
- Email notification در صورت نیاز
- Push/Web notification در نسخه بعدی

### رویدادهای Notification

- تخصیص Lead جدید.
- تخصیص Task.
- Mention در Note.
- نزدیک شدن SLA.
- Overdue شدن Task.
- تغییر مالک.
- فرصت مهم بدون فعالیت.
- Import/Export تکمیل‌شده.

### معیارهای پذیرش

- کاربر باید بتواند Notificationهای خود را مشاهده کند.
- Notification خوانده/نخوانده داشته باشد.
- Notificationهای حیاتی نباید به‌راحتی نادیده گرفته شوند.
- تنظیمات Notification در نسخه‌های بعدی قابل شخصی‌سازی باشد.

---

## 14. Import / Export

### Import

- پشتیبانی از CSV/XLSX.
- Mapping ستون‌ها.
- اعتبارسنجی داده قبل از ثبت.
- نمایش خطاهای ردیفی.
- امکان دانلود فایل خطاها.
- Duplicate Detection.
- Preview قبل از Import نهایی.
- اجرای Async برای فایل‌های بزرگ.

### Export

- Export بر اساس فیلتر فعلی.
- محدودیت دسترسی.
- ثبت در Audit Log.
- Async برای خروجی‌های بزرگ.
- Masking داده‌های حساس برای نقش‌های محدود.

---

## 15. Empty State / Error State / Loading State

### Empty State

نمونه‌ها:

- «هنوز هیچ لیدی ثبت نشده است.»
- «برای شروع، می‌توانید لید جدید بسازید یا فایل CSV وارد کنید.»
- CTA: «ایجاد لید» / «Import»

### Error State

خطا باید شامل:

- توضیح ساده.
- دلیل احتمالی.
- اقدام پیشنهادی.
- امکان Retry.
- کد خطا برای پشتیبانی فنی.

### Loading State

- استفاده از Skeleton برای جدول و کارت‌ها.
- Spinner فقط برای عملیات کوتاه.
- نمایش Progress برای Import/Export.

---

## 16. KPIهای موفقیت

### Product KPIs

- Daily Active Users
- Weekly Active Users
- تعداد فعالیت‌های ثبت‌شده
- درصد لیدهای دارای Follow-up
- درصد مشتریان دارای پروفایل کامل
- نرخ استفاده از داشبوردها
- نرخ استفاده از فیلترها و Saved Views

### Business KPIs

- Lead conversion rate
- Sales cycle length
- Opportunity win rate
- Pipeline value
- Forecast accuracy
- Customer retention
- Churn rate
- SLA compliance
- CSAT/NPS

### Operational KPIs

- Average response time
- Overdue task rate
- Duplicate customer rate
- Data completeness score
- Import error rate
- Time to assign lead

---

## 17. MVP پیشنهادی

### MVP Scope

1. Login و Role-based Access
2. Dashboard پایه
3. Customer List و Customer Profile
4. Lead Management
5. Opportunity Pipeline
6. Activity Timeline
7. Task Management
8. Search و Filter پایه
9. Reports پایه
10. Admin ساده برای کاربران و نقش‌ها
11. Import/Export CSV
12. Audit Log پایه

### خارج از MVP

- هوش مصنوعی.
- Workflow Builder پیشرفته.
- اپ موبایل Native.
- BI پیشرفته.
- اتوماسیون مارکتینگ کامل.
- اتصال عمیق به VoIP.
- Custom Object Builder پیشرفته.

---

## 18. User Stories سطح بالا

### Customer

- به عنوان کارشناس فروش، می‌خواهم مشتری جدید ثبت کنم تا بتوانم تعاملات او را پیگیری کنم.
- به عنوان کارشناس پشتیبانی، می‌خواهم تاریخچه تعاملات مشتری را ببینم تا پاسخ دقیق‌تری بدهم.
- به عنوان مدیر، می‌خواهم مشتریان ریسک‌دار را ببینم تا اقدامات نگهداشت انجام دهم.

### Lead

- به عنوان کارشناس فروش، می‌خواهم لیدهای تخصیص‌یافته به خودم را ببینم.
- به عنوان مدیر فروش، می‌خواهم لیدها را بین اعضای تیم تخصیص دهم.
- به عنوان کارشناس، می‌خواهم لید را به مشتری تبدیل کنم.

### Opportunity

- به عنوان کارشناس فروش، می‌خواهم فرصت فروش ایجاد کنم.
- به عنوان مدیر فروش، می‌خواهم Pipeline تیم را به‌صورت Kanban ببینم.
- به عنوان مدیر، می‌خواهم دلایل Lost شدن فرصت‌ها را تحلیل کنم.

### Task

- به عنوان کاربر، می‌خواهم برای پیگیری مشتری Task بسازم.
- به عنوان کاربر، می‌خواهم Taskهای امروز و عقب‌افتاده‌ام را ببینم.
- به عنوان مدیر، می‌خواهم وضعیت وظایف تیم را مشاهده کنم.

### Reports

- به عنوان مدیر، می‌خواهم نرخ تبدیل لیدها را براساس منبع ببینم.
- به عنوان مدیر ارشد، می‌خواهم ارزش Pipeline را ببینم.
- به عنوان مدیر پشتیبانی، می‌خواهم وضعیت SLA را بررسی کنم.

---

## 19. Acceptance Criteria نمونه برای Epicهای اصلی

### Epic: Customer Profile

- کاربر مجاز می‌تواند پروفایل مشتری را باز کند.
- اطلاعات پایه مشتری نمایش داده می‌شود.
- Timeline تعاملات نمایش داده می‌شود.
- فرصت‌ها، تیکت‌ها و وظایف مرتبط نمایش داده می‌شوند.
- تغییرات حساس در Audit Log ثبت می‌شوند.
- در صورت نبود داده، Empty State مناسب نمایش داده می‌شود.
- کاربر بدون دسترسی نباید داده حساس را ببیند.

### Epic: Lead Conversion

- کاربر می‌تواند Lead واجد شرایط را Convert کند.
- در هنگام Convert، Customer جدید ساخته یا به Customer موجود متصل شود.
- داده‌های اصلی Lead منتقل شوند.
- وضعیت Lead به Converted تغییر کند.
- رخداد Convert در Timeline و Audit Log ثبت شود.
- اگر Duplicate محتمل وجود دارد، سیستم هشدار دهد.

### Epic: Opportunity Pipeline

- فرصت‌ها در Kanban براساس Stage نمایش داده شوند.
- کاربر مجاز بتواند Stage را تغییر دهد.
- تغییر Stage در تاریخچه ثبت شود.
- برای Lost شدن، دلیل Lost اجباری باشد.
- مدیر بتواند Pipeline تیم را فیلتر کند.
- فرصت‌های بدون فعالیت مشخص شوند.

---

## 20. ریسک‌ها و وابستگی‌ها

### ریسک‌ها

- کیفیت پایین داده‌های اولیه.
- مقاومت کاربران در ثبت دقیق فعالیت‌ها.
- پیچیدگی سطح دسترسی.
- کندی سیستم در حجم داده بالا.
- وابستگی به سیستم‌های دیگر برای Sync.
- عدم تعریف دقیق فرآیندهای فروش و پشتیبانی.
- افزایش Scope و تبدیل شدن MVP به محصول بسیار بزرگ.

### راهکارهای کاهش ریسک

- تعریف Data Governance.
- شروع با MVP محدود.
- آموزش کاربران.
- طراحی فرم‌های سریع و ساده.
- استفاده از Import Validation.
- تعریف Role Matrix قبل از توسعه.
- تست Performance از ابتدا.
- تعریف دقیق Event Tracking.

---

## 21. Event Tracking پیشنهادی

### رویدادها

- `customer_created`
- `customer_updated`
- `lead_created`
- `lead_assigned`
- `lead_converted`
- `lead_lost`
- `opportunity_created`
- `opportunity_stage_changed`
- `opportunity_won`
- `opportunity_lost`
- `activity_logged`
- `task_created`
- `task_completed`
- `report_viewed`
- `filter_applied`
- `export_requested`
- `import_completed`

### ویژگی‌های مشترک Eventها

- user_id
- role
- team_id
- entity_type
- entity_id
- timestamp
- source
- previous_status
- new_status

---

## 22. Release Plan پیشنهادی

### Phase 0: Discovery

- مصاحبه با کاربران.
- بررسی فرآیندهای فعلی.
- تعریف Roleها.
- تعریف داده‌های اصلی.
- تعریف KPIها.
- طراحی Service Blueprint.

### Phase 1: MVP Core

- Customer
- Lead
- Opportunity
- Activity
- Task
- Basic Dashboard
- Basic Reports
- RBAC
- Import/Export

### Phase 2: Operational Enhancements

- Saved Views
- Advanced Filters
- Notification
- Audit Log کامل‌تر
- SLA View
- Duplicate Merge
- Team Management

### Phase 3: Intelligence & Automation

- Lead Scoring
- Health Score
- Workflow Automation
- Next Best Action
- Forecasting
- Advanced Analytics

---

## 23. سوالات باز

1. CRM برای کدام تیم‌ها اولویت بالاتری دارد: فروش، پشتیبانی، بازاریابی یا عملیات؟
2. آیا سیستم تیکتینگ فعلی وجود دارد یا باید داخل CRM ساخته شود؟
3. داده مشتری از چه منابعی وارد می‌شود؟
4. آیا نیاز به اتصال به سیستم سفارش، مالی، ERP یا BI وجود دارد؟
5. تعریف دقیق Lead، Customer و Opportunity در سازمان چیست؟
6. چه Roleهایی باید به داده‌های حساس دسترسی داشته باشند؟
7. سطح مورد انتظار برای SLA چیست؟
8. چه گزارش‌هایی برای نسخه اول حیاتی هستند؟
9. حجم تقریبی داده چقدر است؟
10. آیا محصول چندزبانه یا فقط فارسی/RTL است؟
11. آیا کاربران بیرونی هم به CRM دسترسی خواهند داشت؟
12. آیا نیاز به نگهداری کامل Audit Trail برای الزامات حقوقی یا امنیتی وجود دارد؟

---

## 24. Definition of Done

یک قابلیت زمانی Done محسوب می‌شود که:

- نیازمندی محصولی پیاده‌سازی شده باشد.
- طراحی UI مطابق Design System باشد.
- حالت‌های Loading، Empty، Error و Success پوشش داده شده باشد.
- Unit/Integration Testهای ضروری نوشته شده باشد.
- دسترسی‌ها و Permissionها تست شده باشند.
- Event Tracking اضافه شده باشد.
- Audit Log در صورت نیاز ثبت شود.
- Performance قابل قبول باشد.
- QA تأیید کرده باشد.
- مستندات لازم به‌روزرسانی شده باشد.
- Product Owner قابلیت را تأیید کرده باشد.

---

## 25. جمع‌بندی

این CRM باید به‌عنوان هسته عملیاتی ارتباط با مشتری طراحی شود؛ نه فقط یک دفترچه اطلاعات مشتری. موفقیت محصول وابسته به سه اصل است:

1. یکپارچگی داده‌ها
2. سرعت و سادگی تجربه کاربری
3. گزارش‌پذیری و کنترل فرآیندها

نسخه MVP باید روی Customer، Lead، Opportunity، Activity، Task، Dashboard پایه، Reports پایه و RBAC تمرکز کند و از ورود زودهنگام به پیچیدگی‌هایی مثل AI، Workflow Builder کامل و BI پیشرفته پرهیز کند.

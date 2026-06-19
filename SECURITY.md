# امنیت Digiexpress CRM

## احراز هویت

ورود با ایمیل و رمز عبور انجام می‌شود. رمزها با bcrypt هش می‌شوند. API از access token کوتاه‌مدت و refresh token بلندمدت استفاده می‌کند. کاربر غیرفعال امکان ورود یا استفاده از API ندارد.

## RBAC

هر endpoint محافظت‌شده علاوه بر احراز هویت، permission مشخص دارد. رابط کاربری دکمه‌ها و صفحات غیرمجاز را مخفی می‌کند، اما منبع اصلی کنترل دسترسی backend است.

## مدیریت Secret

هیچ secret واقعی در repository قرار نگیرد. مقادیر تولید در `.env` روی سرور تنظیم شوند:

- `DATABASE_URL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `POSTGRES_PASSWORD`
- `INITIAL_ADMIN_PASSWORD`

## Audit Log

عملیات حساس مثل ایجاد/ویرایش/حذف موجودیت‌ها، تبدیل لید، تغییر مرحله فرصت، تغییر نقش‌ها، export و ورود/خروج در `AuditLog` ثبت می‌شود. این لاگ از UI قابل ویرایش نیست.

## Export و داده حساس

خروجی CSV نیازمند permission جداگانه است و در Audit Log ثبت می‌شود. برای نقش‌های محدود می‌توان masking شماره تماس و ایمیل را در endpointهای export گسترش داد.

## پیشنهادهای Production

- فعال‌سازی HTTPS
- محدود کردن دسترسی SSH
- فعال‌سازی firewall فقط برای 80/443/SSH
- تغییر فوری رمز ادمین اولیه
- rotation دوره‌ای JWT secrets با logout اجباری کاربران
- backup رمزگذاری‌شده و نگهداری خارج از VM
- مانیتورینگ لاگ‌های `nginx` و `api`

## غیرفعال کردن کاربر

ادمین می‌تواند کاربر را از بخش مدیریت کاربران غیرفعال کند یا endpoint زیر را فراخوانی کند:

```txt
PATCH /api/users/:id/disable
```

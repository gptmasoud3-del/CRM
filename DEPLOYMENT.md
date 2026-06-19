# راهنمای استقرار CRM روی VM

## حداقل منابع پیشنهادی

- Ubuntu 22.04 یا 24.04
- ۲ vCPU
- ۴GB RAM
- ۴۰GB disk
- Docker و Docker Compose
- دامنه متصل به IP سرور
- باز بودن پورت‌های 80 و 443

## راه‌اندازی تولید

```bash
git clone <repo>
cd crm-platform
cp .env.example .env
nano .env
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml logs -f
docker compose -f docker-compose.prod.yml exec api npm run prisma:migrate
docker compose -f docker-compose.prod.yml exec api npm run seed
```

## به‌روزرسانی

```bash
git pull
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml exec api npm run prisma:migrate
```

## Backup

```bash
./infra/scripts/backup-db.sh
```

فایل خروجی در پوشه `backups` ساخته می‌شود.

## Restore

```bash
./infra/scripts/restore-db.sh backups/crm-YYYYMMDD-HHMMSS.sql
```

## SSL

فایل Nginx برای HTTP آماده است. برای تولید واقعی، پیشنهاد می‌شود TLS با Cloudflare، Traefik، Caddy یا Certbot روی همین reverse proxy اضافه شود.

## نکات عملیاتی

- مقدارهای `JWT_ACCESS_SECRET` و `JWT_REFRESH_SECRET` باید طولانی، تصادفی و محرمانه باشند.
- `POSTGRES_PASSWORD` را قبل از اجرا تغییر دهید.
- از volumeهای Docker نسخه پشتیبان منظم بگیرید.
- دسترسی SSH به VM را محدود و firewall را فعال کنید.

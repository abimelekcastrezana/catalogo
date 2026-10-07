# TiendaTap Production Deployment Guide

## Prerequisites

- Ubuntu 24.04 LTS server with:
  - Docker 29.2.1+
  - Docker Compose 2.0+
  - SSH access
  - `sudo` privileges
- Domain `tiendatap.com` pointing to server IP (<IP_DEL_SERVIDOR>)

## Deployment Steps

### 1. Clone Repository

```bash
cd /datos
git clone https://github.com/your-username/tiendatap.git
cd tiendatap
```

### 2. Create Production Environment

```bash
cp .env.example .env
```

Edit `.env` and change these values:

```env
DB_PASSWORD=STRONG_DATABASE_PASSWORD
JWT_SECRET=<generated-secret>
NEXTAUTH_SECRET=<generated-secret>
```

Generate strong secrets:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3. Run Setup Script

```bash
chmod +x deploy-setup.sh
sudo ./deploy-setup.sh
```

This will:
- Update system packages
- Install nginx
- Install certbot (SSL)
- Open firewall ports (80, 443, 22)
- Create nginx config

### 4. Generate SSL Certificate

```bash
sudo certbot --nginx -d tiendatap.com -d www.tiendatap.com
```

Choose "Redirect" when asked to redirect HTTP to HTTPS.

### 5. Start Docker Stack

```bash
docker compose up -d
```

Verify containers are running:

```bash
docker compose ps
```

Check logs:

```bash
docker compose logs -f app
```

### 6. Verify Setup

```bash
# Check if app is responding
curl http://localhost:3000

# Check nginx
curl https://tiendatap.com

# Check SSL certificate
openssl s_client -connect tiendatap.com:443
```

## Updating the App

```bash
cd /datos/tiendatap
git pull
docker compose up -d --build
```

## Backups

Database backups:

```bash
# Backup
docker compose exec db pg_dump -U postgres tiendatap > backup-$(date +%Y%m%d).sql

# Restore
docker compose exec -T db psql -U postgres tiendatap < backup-YYYYMMDD.sql
```

Uploads backup:

```bash
tar czf uploads-backup-$(date +%Y%m%d).tar.gz uploads/
```

## Troubleshooting

### App not starting

```bash
docker compose logs app
```

### Database connection error

```bash
docker compose logs db
docker compose exec db pg_isready -U postgres
```

### Nginx not proxying

```bash
sudo nginx -t
sudo systemctl restart nginx
sudo tail -f /var/log/nginx/error.log
```

### SSL certificate renewal

```bash
sudo certbot renew --dry-run
sudo certbot renew
```

## Monitor

Check uptime:

```bash
docker compose exec app curl http://localhost:3000/api/health
```

View database size:

```bash
docker compose exec db psql -U postgres -d tiendatap -c "SELECT pg_size_pretty(pg_database_size('tiendatap'));"
```

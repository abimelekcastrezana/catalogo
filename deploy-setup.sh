#!/bin/bash

# Production deployment setup script for tiendatap.com
# Run on Ubuntu 24.04 server as root or with sudo

set -e

echo "=== TiendaTap Production Setup ==="

# Update system
echo "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install nginx
echo "Installing nginx..."
sudo apt install -y nginx

# Install certbot for SSL
echo "Installing certbot for SSL/HTTPS..."
sudo apt install -y certbot python3-certbot-nginx

# Open firewall ports
echo "Configuring firewall..."
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable

# Create nginx config for tiendatap.com
echo "Creating nginx configuration..."
sudo tee /etc/nginx/sites-available/tiendatap > /dev/null <<'EOF'
# HTTP redirect to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name tiendatap.com www.tiendatap.com;

    location / {
        return 301 https://$server_name$request_uri;
    }

    # Let certbot validate
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
}

# HTTPS server (certbot will fill this in)
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name tiendatap.com www.tiendatap.com;

    # Proxy to Next.js app
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Cache static files
    location /_next/static/ {
        alias /datos/tiendatap/.next/static/;
        expires 365d;
        add_header Cache-Control "public, immutable";
    }

    location /public/ {
        alias /datos/tiendatap/public/;
        expires 30d;
        add_header Cache-Control "public";
    }
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/tiendatap /etc/nginx/sites-enabled/tiendatap

# Remove default site if exists
sudo rm -f /etc/nginx/sites-enabled/default

# Test nginx config
echo "Testing nginx configuration..."
sudo nginx -t

# Start nginx
echo "Starting nginx..."
sudo systemctl restart nginx

echo ""
echo "=== Setup Complete ==="
echo ""
echo "Next steps:"
echo "1. Ensure DNS is pointing tiendatap.com to <SERVER_IP>"
echo "2. Generate SSL certificate:"
echo "   sudo certbot --nginx -d tiendatap.com -d www.tiendatap.com"
echo "3. Verify auto-renewal:"
echo "   sudo certbot renew --dry-run"
echo "4. Start the app:"
echo "   cd /datos/tiendatap && docker compose up -d"
echo ""

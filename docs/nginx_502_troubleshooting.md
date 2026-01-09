# Nginx 502 Error Troubleshooting Guide

## Quick Diagnosis Steps

Run these commands to diagnose the issue:

```bash
# 1. Check nginx syntax
sudo nginx -t

# 2. Check nginx status
sudo systemctl status nginx

# 3. Check backend services
sudo netstat -tlnp | grep :5000     # Flask app
sudo netstat -tlnp | grep :3663     # Frontend server
sudo netstat -tlnp | grep :31337    # SSH service
sudo netstat -tlnp | grep :31338    # Chat service

# 4. Check nginx error logs
sudo tail -f /var/log/nginx/error.log

# 5. Test backend directly (bypass nginx)
curl http://localhost:5000/api/health   # or any API endpoint
curl http://localhost:3663              # frontend
```

## Common Causes & Fixes

### 1. Backend Services Not Running

**Check if services are running:**
```bash
# Check for Flask app on port 5000
ss -tlnp | grep :5000

# Check for frontend on port 3663
ss -tlnp | grep :3663

# If not running, start them:
# Flask: cd to flask directory and start
# Frontend: cd to react directory and run npm run dev or npm start
```

### 2. Incorrect Port Numbers

**Common issue**: The example config assumes specific ports. Verify your actual ports:
```bash
# Find what's actually running on which ports
sudo netstat -tlnp | grep LISTEN
```

### 3. Nginx Configuration Syntax Errors

**Check nginx config:**
```bash
sudo nginx -t
# If errors, fix them in your site config file
```

### 4. SELinux/Firewall Issues

**Check SELinux (if applicable):**
```bash
# Check if SELinux is blocking connections
sudo sealert -a /var/log/audit/audit.log
sudo getsebool -a | grep httpd
# If needed: sudo setsebool -P httpd_can_network_connect 1
```

**Check firewall:**
```bash
sudo ufw status                    # Ubuntu
sudo firewall-cmd --list-all       # CentOS/RHEL
```

### 5. File Permissions

**Check nginx can read config files:**
```bash
sudo nginx -T   # Shows full config nginx is using
ls -la /etc/nginx/sites-available/
ls -la /etc/nginx/sites-enabled/
```

## Step-by-Step Fix Process

### Step 1: Verify Basic nginx
```bash
# Test minimal config first
sudo nginx -t
sudo systemctl reload nginx
curl -I http://localhost    # Test basic nginx
```

### Step 2: Check Backend Services
```bash
# Start Flask app manually to test
cd /path/to/your/flask/app
python -m flask run --host=0.0.0.0 --port=5000 &

# Test direct connection
curl http://localhost:5000/api/
```

### Step 3: Test nginx upstream connections
```bash
# Check if nginx can connect to backends
sudo nginx -T | grep proxy_pass    # Shows all upstream targets
telnet localhost 5000              # Test if port is reachable
telnet localhost 3663              # Test frontend port
```

## Fixed nginx Config Template

Here's a minimal working config to start with:

(Your .pem files will be in your edurange3 directory by default, either move them to letsencrypt or change this path)

```nginx
server {
    listen 443 ssl;
    server_name DOMAIN_TO_BE_REPLACED;

    ssl_certificate /etc/letsencrypt/live/DOMAIN_TO_BE_REPLACED/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/DOMAIN_TO_BE_REPLACED/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Basic timeout settings (start conservative)
    proxy_read_timeout 300s;
    proxy_connect_timeout 10s;
    proxy_send_timeout 10s;

    # Test with minimal locations first
    location /api/ {
        proxy_pass http://127.0.0.1:5000;  # Use 127.0.0.1 instead of localhost
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_http_version 1.1;
    }

    location / {
        proxy_pass http://127.0.0.1:3663;  # Use 127.0.0.1 instead of localhost
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Emergency Rollback

If you need to quickly restore service:

1. **Backup current config:**
   ```bash
   sudo cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup
   ```

2. **Restore minimal config:**
   ```bash
   # Use your old working config or a basic one
   sudo nginx -t && sudo systemctl reload nginx
   ```

3. **Verify service restored:**
   ```bash
   curl -I https://yourdomain.com
   ```

## Monitoring Commands

Keep these running in separate terminals while testing:

```bash
# Terminal 1: Watch nginx errors
sudo tail -f /var/log/nginx/error.log

# Terminal 2: Watch nginx access
sudo tail -f /var/log/nginx/access.log

# Terminal 3: Watch system resources
htop

# Terminal 4: Test connections
watch "ss -tlnp | grep :5000"
```

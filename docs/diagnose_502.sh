#!/bin/bash

echo "=== EDURange 502 Error Diagnostic Script ==="
echo

# Check nginx syntax
echo "1. Checking nginx configuration syntax:"
sudo nginx -t
echo

# Check nginx status
echo "2. Checking nginx service status:"
sudo systemctl status nginx --no-pager -l
echo

# Check listening ports
echo "3. Checking what services are listening:"
echo "Expected services:"
echo "  - Port 5000: Flask API server"
echo "  - Port 3663: Frontend development server"
echo "  - Port 31337: SSH WebSocket (optional)"
echo "  - Port 31338: Chat WebSocket (optional)"
echo
echo "Currently listening:"
sudo ss -tlnp | grep -E ":(5000|3663|31337|31338|443|80)\s"
echo

# Check for Flask process
echo "4. Checking for Flask/Python processes:"
ps aux | grep -E "(flask|python.*app)" | grep -v grep
echo

# Check for Node.js/frontend processes
echo "5. Checking for Node.js/frontend processes:"
ps aux | grep -E "(node|npm|vite)" | grep -v grep
echo

# Test direct connections to backends
echo "6. Testing direct backend connections:"

echo "Testing Flask API (port 5000):"
timeout 5 bash -c "curl -s -o /dev/null -w 'HTTP %{http_code} - %{time_total}s' http://127.0.0.1:5000/api/ 2>/dev/null || echo 'Connection failed'"
echo

echo "Testing frontend (port 3663):"
timeout 5 bash -c "curl -s -o /dev/null -w 'HTTP %{http_code} - %{time_total}s' http://127.0.0.1:3663/ 2>/dev/null || echo 'Connection failed'"
echo

# Check recent nginx error logs
echo "7. Recent nginx error log entries:"
sudo tail -n 10 /var/log/nginx/error.log 2>/dev/null || echo "No error log found"
echo

# Check if nginx worker processes exist
echo "8. Checking nginx processes:"
ps aux | grep nginx | grep -v grep
echo

# Check system resources
echo "9. System resource usage:"
echo "Memory:"
free -h
echo "CPU Load:"
uptime
echo

echo "=== Recommendations ==="
echo "1. If no services on ports 5000/3663: Start your backend services"
echo "2. If 'Connection refused': Check firewall/SELinux settings"
echo "3. If nginx syntax errors: Fix configuration and reload"
echo "4. If 'upstream' errors in nginx log: Backend service is down"
echo "5. If high CPU/memory: System resources may be exhausted"
echo

echo "=== Quick fixes to try ==="
echo "# Reload nginx after fixing config:"
echo "sudo nginx -t && sudo systemctl reload nginx"
echo
echo "# Restart nginx if needed:"
echo "sudo systemctl restart nginx"
echo
echo "# Test with minimal config by replacing complex locations with:"
echo "location /api/ { proxy_pass http://127.0.0.1:5000/api/; }"
echo "location / { proxy_pass http://127.0.0.1:3663/; }"
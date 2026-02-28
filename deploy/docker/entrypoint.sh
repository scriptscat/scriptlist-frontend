#!/bin/sh
set -e

# Start Next.js server in the background
node server.js &
SERVER_PID=$!

# Wait for the server to be ready
echo "Waiting for Next.js server to start..."
for i in $(seq 1 30); do
  if wget -q -S --spider http://localhost:3000/ 2>&1 | grep -q "HTTP/"; then
    echo "Server is up, starting warmup..."
    break
  fi
  if [ "$i" = "30" ]; then
    echo "Server failed to start within 30s"
    exit 1
  fi
  sleep 1
done

# Warmup key pages to trigger SSR compilation and caching
echo "Warming up pages..."
wget -q -O /dev/null http://localhost:3000/zh-CN 2>/dev/null || true
wget -q -O /dev/null http://localhost:3000/zh-CN/search 2>/dev/null || true
wget -q -O /dev/null http://localhost:3000/en 2>/dev/null || true
echo "Warmup complete."

# Wait for the server process
wait $SERVER_PID

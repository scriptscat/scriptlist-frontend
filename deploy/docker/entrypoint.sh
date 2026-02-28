#!/bin/sh
set -e

# Start Next.js server in the background
node server.js &
SERVER_PID=$!

# Warmup key pages to trigger SSR compilation and caching
echo "Warming up pages..."
wget -q -O /dev/null http://localhost:3000/zh-CN 2>/dev/null || true
wget -q -O /dev/null http://localhost:3000/zh-CN/search 2>/dev/null || true
wget -q -O /dev/null http://localhost:3000/en 2>/dev/null || true
wget -q -O /dev/null http://localhost:3000/en/search 2>/dev/null || true
echo "Warmup complete."

# Wait for the server process
wait $SERVER_PID

#!/bin/bash

# Cài đặt dependencies cho server và đảm bảo socket.io được cài đặt
cd server
npm install --legacy-peer-deps
npm install socket.io --save

# Build client
cd ../client
npm install --legacy-peer-deps
npm run build

# Trở về thư mục gốc
cd ..

# Tạo thư mục uploads nếu chưa có
mkdir -p server/public/uploads
#!/bin/bash

# Cài đặt dependencies cho server
cd server
npm install --legacy-peer-deps

# Build client
cd ../client
npm install
npm run build

# Trở về thư mục gốc
cd ..

# Tạo thư mục uploads nếu chưa có
mkdir -p server/public/uploads
#!/bin/bash

# Cài đặt dependencies cho server
cd server
npm install --legacy-peer-deps
npm uninstall cloudinary
npm install cloudinary@1.41.3 --save

# Build client
cd ../client
npm install --legacy-peer-deps
npm install vite -g
npm run build

# Trở về thư mục gốc
cd ..

# Tạo thư mục uploads nếu chưa có
mkdir -p server/public/uploads
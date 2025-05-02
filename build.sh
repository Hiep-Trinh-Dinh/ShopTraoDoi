#!/bin/bash

# Cài đặt dependencies cho server
cd server
npm install --legacy-peer-deps
npm uninstall cloudinary
npm install cloudinary@1.41.3 --save

# Build client
cd ../client
npm install --legacy-peer-deps
npm install --save-dev vite@5.1.5 @vitejs/plugin-react@4.2.1

# Sửa lỗi @emoji-mart/react
npm install react@18.2.0 react-dom@18.2.0 --legacy-peer-deps

# Build với chế độ force
export NODE_OPTIONS=--openssl-legacy-provider
npx vite build --force

# Trở về thư mục gốc
cd ..

# Tạo thư mục uploads nếu chưa có
mkdir -p server/public/uploads
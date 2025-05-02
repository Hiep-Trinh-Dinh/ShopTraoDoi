#!/bin/bash

# Cài đặt dependencies cho server
cd server
npm install --legacy-peer-deps
npm uninstall cloudinary
npm install cloudinary@1.41.3 --save
npm install socket.io --save

# Tạo thư mục uploads nếu chưa có
mkdir -p public/uploads

# Không cần build client vì đã có thư mục dist
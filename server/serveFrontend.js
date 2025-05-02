const path = require('path');
const express = require('express');

function setupStaticServing(app) {
  console.log('Setting up static file serving...');
  
  // Phục vụ các file tĩnh từ build folder của client
  const staticPath = path.join(__dirname, '../client/dist');
  console.log('Static path:', staticPath);
  app.use(express.static(staticPath));

  // Xử lý tất cả các route khác để trả về index.html
  app.get('*', (req, res, next) => {
    // Bỏ qua các requests đến API và socket
    if (req.url.startsWith('/api') || req.url.startsWith('/socket.io')) {
      console.log('API request, passing to next middleware');
      return next();
    }
    
    console.log('Serving index.html for route:', req.url);
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

module.exports = setupStaticServing;

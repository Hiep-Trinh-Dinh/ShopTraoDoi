const path = require('path');
const express = require('express');

function setupStaticServing(app) {
  // Phục vụ các file tĩnh từ build folder của client
  app.use(express.static(path.join(__dirname, '../client/dist')));

  // Đối với route không match với API, trả về index.html
  app.get('*', (req, res, next) => {
    // Bỏ qua các requests đến API và socket
    if (req.url.startsWith('/api') || req.url.startsWith('/socket.io')) {
      return next();
    }
    
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

module.exports = setupStaticServing;

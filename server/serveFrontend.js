const path = require('path');
const express = require('express');

function setupStaticFileServing(app) {
  console.log('Setting up static file serving...');
  
  // Đường dẫn tới thư mục dist
  const staticPath = path.join(__dirname, '../client/dist');
  console.log('Static path:', staticPath);
  
  // Phục vụ các file static từ thư mục dist
  app.use(express.static(staticPath, {
    // Đảm bảo MIME types được set đúng
    setHeaders: (res, filePath) => {
      // Đặt đúng Content-Type cho các file JavaScript module
      if (filePath.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript');
      }
    }
  }));

  // Route này chỉ xử lý các request không phải API và không phải static files
  app.get('*', (req, res, next) => {
    // Bỏ qua các request tới API
    if (req.url.startsWith('/api')) {
      return next();
    }
    
    res.sendFile(path.join(staticPath, 'index.html'));
  });
}

module.exports = setupStaticFileServing;

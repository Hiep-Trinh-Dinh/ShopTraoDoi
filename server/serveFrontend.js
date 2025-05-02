const path = require('path');
const express = require('express');
const fs = require('fs');

function setupStaticFileServing(app) {
  console.log('Setting up static file serving...');
  
  // Đường dẫn tới thư mục dist
  const staticPath = path.join(__dirname, '../client/dist');
  console.log('Static path:', staticPath);
  
  // Log danh sách file trong thư mục assets để debug
  const assetsPath = path.join(staticPath, 'assets');
  console.log('Assets directory contents:');
  if (fs.existsSync(assetsPath)) {
    fs.readdirSync(assetsPath).forEach(file => {
      console.log(` - ${file}`);
    });
  } else {
    console.log('Assets directory not found!');
  }
  
  // Phục vụ tất cả các file static với MIME type đúng
  app.use(express.static(staticPath, {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.js')) {
        res.set('Content-Type', 'application/javascript');
      } else if (filePath.endsWith('.css')) {
        res.set('Content-Type', 'text/css');
      }
    }
  }));

  // Route cho client-side routing (SPA)
  app.get('*', (req, res, next) => {
    // Bỏ qua requests tới API
    if (req.url.startsWith('/api')) {
      return next();
    }
    
    // Bỏ qua requests tới assets
    if (req.url.includes('/assets/')) {
      console.log(`Asset request not found: ${req.url}`);
      return next();
    }
    
    console.log(`Serving index.html for route: ${req.url}`);
    res.sendFile(path.join(staticPath, 'index.html'));
  });

  // Thêm vào middleware trước app.get('*')
  app.use('/api/api/*', (req, res, next) => {
    // Chuyển hướng URL bị lặp /api
    const correctedPath = req.originalUrl.replace('/api/api/', '/api/');
    console.log(`Redirecting duplicate API path: ${req.originalUrl} -> ${correctedPath}`);
    res.redirect(correctedPath);
  });
}

module.exports = setupStaticFileServing;

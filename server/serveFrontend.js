const path = require('path');
const express = require('express');

function setupStaticFileServing(app) {
  console.log('Setting up static file serving...');
  
  // Đường dẫn tới thư mục dist
  const staticPath = path.join(__dirname, '../client/dist');
  console.log('Static path:', staticPath);
  
  // Phục vụ các file trong thư mục assets với MIME type chính xác
  app.use('/assets', express.static(path.join(staticPath, 'assets'), {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.js')) {
        res.set('Content-Type', 'application/javascript');
      } else if (filePath.endsWith('.css')) {
        res.set('Content-Type', 'text/css');
      }
    }
  }));
  
  // Phục vụ các file static khác
  app.use(express.static(staticPath));

  // Route cho client-side routing (SPA)
  app.get('*', (req, res, next) => {
    // Bỏ qua các request tới API
    if (req.url.startsWith('/api') || req.url.startsWith('/assets')) {
      return next();
    }
    
    console.log(`Serving index.html for route: ${req.url}`);
    res.sendFile(path.join(staticPath, 'index.html'));
  });
}

module.exports = setupStaticFileServing;

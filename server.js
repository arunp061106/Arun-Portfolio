const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Simple .env and .env.local loader (no dependencies required)
function loadEnv() {
  const envFiles = ['.env', '.env.local'];
  envFiles.forEach(file => {
    const fullPath = path.join(__dirname, file);
    if (fs.existsSync(fullPath)) {
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        content.split('\n').forEach(line => {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
            const idx = trimmed.indexOf('=');
            const key = trimmed.substring(0, idx).trim();
            const val = trimmed.substring(idx + 1).trim().replace(/^["']|["']$/g, '');
            if (!process.env[key]) {
              process.env[key] = val;
            }
          }
        });
      } catch (err) {
        console.warn(`Could not load ${file}:`, err.message);
      }
    }
  });
}
loadEnv();

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
  '.ico': 'image/x-icon'
};

// Route handlers
const apiRoutes = {
  '/api/github/contributions': require('./api/github/contributions'),
  '/api/github/activity': require('./api/github/activity'),
  '/api/leetcode/stats': require('./api/leetcode/stats'),
  '/api/hackerrank/stats': require('./api/hackerrank/stats')
};

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url);
  let pathname = parsedUrl.pathname;
  try {
    pathname = decodeURIComponent(pathname);
  } catch (e) {}

  // Handle API routes
  if (apiRoutes[pathname]) {
    try {
      await apiRoutes[pathname](req, res);
    } catch (err) {
      console.error(`Error handling ${pathname}:`, err);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Internal Server Error', message: err.message }));
    }
    return;
  }

  // Handle static file serving
  let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);
  
  // Security check: ensure path is within current directory
  if (!filePath.startsWith(__dirname)) {
    res.statusCode = 403;
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/plain');
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

const PORT = parseInt(process.env.PORT, 10) || 3000;
server.listen(PORT, () => {
  console.log(`Portfolio server running at http://localhost:${PORT}`);
  console.log(`API endpoints available at:`);
  console.log(`  - http://localhost:${PORT}/api/github/contributions`);
  console.log(`  - http://localhost:${PORT}/api/github/activity`);
  console.log(`  - http://localhost:${PORT}/api/leetcode/stats`);
  console.log(`  - http://localhost:${PORT}/api/hackerrank/stats`);
});

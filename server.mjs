#!/usr/bin/env node
/**
 * Athena Live Dashboard Server
 * Serves the static dashboard with live data
 * Run: node server.mjs [port]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.argv[2] || 3000;
const ROOT_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  
  let filePath = req.url;
  
  // API endpoint for main data
  if (filePath === '/api/data' || filePath === '/api/data.json') {
    const dataPath = path.join(ROOT_DIR, 'api', 'data.json');
    try {
      const data = fs.readFileSync(dataPath, 'utf-8');
      res.writeHead(200, { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache'
      });
      res.end(data);
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }
  
  // API endpoint for new models tracker
  if (filePath === '/api/models' || filePath === '/api/models.json') {
    const modelsPath = path.join(ROOT_DIR, 'api', 'models.json');
    try {
      const data = fs.readFileSync(modelsPath, 'utf-8');
      res.writeHead(200, { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache'
      });
      res.end(data);
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }
  
  // Serve static files
  if (filePath === '/') filePath = '/index.html';
  
  const fullPath = path.join(ROOT_DIR, filePath);
  const ext = path.extname(fullPath).toLowerCase();
  
  try {
    const content = fs.readFileSync(fullPath);
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*'
    });
    res.end(content);
  } catch (e) {
    if (e.code === 'ENOENT') {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    } else {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Server Error: ' + e.message);
    }
  }
});

server.listen(PORT, () => {
  console.log(`🦉 Athena Live Dashboard running at http://localhost:${PORT}`);
  console.log(`   API: http://localhost:${PORT}/api/data`);
  console.log(`   Press Ctrl+C to stop`);
});

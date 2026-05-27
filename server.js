/* ================================================================
   دعوة فرح — خادم محلي بسيط (بدون أي مكتبات خارجية)
   • يقدّم صفحة الدعوة على http://localhost:3000
   • أي تأكيد حضور يُكتب فورًا في الملف:  rsvp.json
   التشغيل:  node server.js
================================================================ */
'use strict';

const http = require('http');
const fs   = require('fs');
const path = require('path');

const ROOT = __dirname;
const PORT = 3000;
const DATA = path.join(ROOT, 'rsvp.json');   // ملف الحضور (جاهز هنا)

// جهّز الملف إن لم يكن موجودًا
if (!fs.existsSync(DATA)) fs.writeFileSync(DATA, '[]', 'utf8');

function readData() { try { return JSON.parse(fs.readFileSync(DATA, 'utf8')) || []; } catch (e) { return []; } }

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.csv': 'text/csv; charset=utf-8', '.txt': 'text/plain; charset=utf-8'
};

const cors = res => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
};

const server = http.createServer((req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }

  /* ---- تأكيد حضور: اكتب صفًا جديدًا في الشيت ---- */
  if (req.method === 'POST' && req.url === '/rsvp') {
    let body = '';
    req.on('data', c => { body += c; if (body.length > 10000) req.destroy(); });
    req.on('end', () => {
      try {
        const d = JSON.parse(body || '{}');
        const name = (d.name || '').toString().trim();
        if (!name) { res.writeHead(400, { 'Content-Type': 'application/json' }); return res.end('{"ok":false}'); }
        const count = parseInt(d.count, 10) || 1;
        const date  = d.date || new Date().toLocaleString('ar-EG');
        const record = { name, count, date };

        // اكتب التأكيد مباشرة في rsvp.json
        const list = readData(); list.push(record);
        fs.writeFileSync(DATA, JSON.stringify(list, null, 2), 'utf8');

        console.log('✅ تأكيد حضور:', name, '— عدد:', count, '— الإجمالي:', list.length);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, total: list.length }));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end('{"ok":false}');
      }
    });
    return;
  }

  /* ---- تقديم الملفات الثابتة ---- */
  let rel = decodeURIComponent((req.url || '/').split('?')[0]);
  if (rel === '/') rel = '/index.html';
  const full = path.join(ROOT, path.normalize(rel));
  if (!full.startsWith(ROOT)) { res.writeHead(403); return res.end('Forbidden'); }
  fs.readFile(full, (err, data) => {
    if (err) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(full).toLowerCase()] || 'application/octet-stream' });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log('🌸 الدعوة شغّالة على:  http://localhost:' + PORT);
  console.log('📋 الحضور يُكتب في:  ' + DATA);
});

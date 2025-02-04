const http = require('http');
const fs = require('fs');
const path = require('path');
const { parse } = require('querystring');

const PORT = 3000;
const UPLOAD_DIR = path.join(__dirname, 'uploads');

// makes sure the uploads folder exists
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR);
}

// to serve static files
function serveFile(res, filePath, contentType) {
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end('File not found');
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        }
    });
}

// create http server
const server = http.createServer((req, res) => {
    if (req.method === 'GET') {
        if (req.url === '/') {
            serveFile(res, path.join(__dirname, 'public', 'index.html'), 'text/html');
        } else if (req.url.startsWith('/uploads/')) {
            serveFile(res, path.join(__dirname, req.url), 'application/octet-stream');
        } else {
            const ext = path.extname(req.url);
            let contentType = 'text/plain';
            if (ext === '.css') contentType = 'text/css';
            if (ext === '.js') contentType = 'application/javascript';
            serveFile(res, path.join(__dirname, 'public', req.url), contentType);
        }
    } else if (req.method === 'POST' && req.url === '/upload') {
        let body = [];
        req.on('data', chunk => body.push(chunk));
        req.on('end', () => {
            const buffer = Buffer.concat(body);
            const boundary = req.headers['content-type'].split('boundary=')[1];
            const parts = buffer.toString().split(boundary).slice(1, -1);

            parts.forEach(part => {
                const match = part.match(/filename="(.+?)"/);
                if (match) {
                    const filename = match[1];
                    const fileData = part.split('\r\n\r\n')[1].trimEnd();
                    fs.writeFileSync(path.join(UPLOAD_DIR, filename), fileData);
                }
            });

            res.writeHead(302, { Location: '/' });
            res.end();
        });
    } else {
        res.writeHead(405);
        res.end('Method Not Allowed');
    }
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

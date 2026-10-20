const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');

// Render assegna dinamicamente process.env.PORT (es. 10000). Usa 3000 come fallback locale.
const PORT = process.env.PORT || 3000;
const serverUrl = "wss://legend.master-elettroerosioni.it";
const apiUrl = "https://legend.master-elettroerosioni.it/api";

console.log(`
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ScarzBots ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                                                                    ┃
┃    Name: ScarzBots                                                 ┃
┃    Version: 1.0                                                    ┃
┃                                                                    ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
`);

// Gestione proxies.txt opzionale
let proxies = [];
try {
    if (fs.existsSync('proxies.txt')) {
        proxies = fs.readFileSync('proxies.txt', 'utf8').split('\n').filter(Boolean);
        console.log(`[INFO]-Loaded ${proxies.length} proxies from proxies.txt.`);
    } else {
        console.log(`[INFO]-No proxies.txt found, running in direct connection mode.`);
    }
} catch (err) {
    console.log(`[INFO]-Notice reading proxies.txt: ${err.message}`);
}

// Creazione server HTTP
const server = http.createServer((req, res) => {
    if (req.url === '/api' || req.url.startsWith('/api/')) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'online', server: serverUrl, api: apiUrl }));
    } else {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('ScarzBots Server Running');
    }
});

// Istanza WebSocket legata allo stesso server HTTP
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    console.log('[INFO]-Client connected via WebSocket');
    ws.on('message', (message) => {
        ws.send(JSON.stringify({ status: 'ack', received: message.toString() }));
    });
});

// ASCOLTO SULLA PORTA DINAMICA E SULL'INTERFACCIA 0.0.0.0
server.listen(PORT, '0.0.0.0', () => {
    console.log(`[INFO]-Server successfully bound and listening on port ${PORT}`);
});

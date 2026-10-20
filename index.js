const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');

// Configurazione server con porta 80
const PORT = process.env.PORT || 80;
const serverUrl = "wss://legend.master-elettroerosioni.it";
const apiUrl = "https://legend.master-elettroerosioni.it/api";

// Stampa Banner ScarzBots
console.log(`
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ScarzBots ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                                                                    ┃
┃    Name: ScarzBots                                                 ┃
┃    YT: @scarzcn                                                    ┃
┃    Version: 1.0                                                    ┃
┃    Developed: By Storm, Search on YT: @Storm1464 and suscribe        ┃
┃    Social Media:  > https://www.youtube.com/@scarzcn               ┃
┃                 > https://www.instagram.com/scarzcn                ┃
┃                 > https://discord.com/invite/TvHycpKtKr            ┃
┃                                                                    ┃
┃                                                                    ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
`);

// Gestione proxies.txt con fallback se assente
let proxies = [];
try {
    if (fs.existsSync('proxies.txt')) {
        proxies = fs.readFileSync('proxies.txt', 'utf8').split('\n').filter(Boolean);
        console.log(`[INFO]-Loaded ${proxies.length} proxies from proxies.txt.`);
    } else {
        console.log(`[INFO]-No proxies.txt found, running without proxies.`);
    }
} catch (err) {
    console.log(`[INFO]-Error reading proxies.txt: ${err.message}`);
}

// Creazione server HTTP & WebSocket
const server = http.createServer((req, res) => {
    if (req.url === '/api' || req.url.startsWith('/api/')) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'online', server: serverUrl, api: apiUrl }));
    } else {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('ScarzBots Server Running on legend.master-elettroerosioni.it');
    }
});

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    console.log('[INFO]-Client connected via WebSocket');
    ws.on('message', (message) => {
        ws.send(JSON.stringify({ status: 'ack', received: message.toString() }));
    });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`[INFO]-Running on port ${PORT}`);
    console.log(`[INFO]-Target Domain: legend.master-elettroerosioni.it`);
});

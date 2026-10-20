const http = require('http');
const WebSocket = require('ws');

// Configurazione della porta 80 (con fallback su process.env.PORT per il cloud)
const PORT = process.env.PORT || 80;

// Stato della configurazione globale condivisa
let currentConfig = {
    botName: 'XEVBOTS',
    botCount: 10,
    agarServer: 'wss://srv-dbbragrrjlhs73evl6bg',
    targetPlayerName: '',
    botAi: false,
    vShield: false,
    freezeBots: false,
    patrolMode: false,
    isRunning: false
};

// Stampa Banner ScarzBots
console.log(`
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ScarzBots ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                                                                    ┃
┃    Name: ScarzBots                                                 ┃
┃    YT: @scarzcn                                                    ┃
┃    Version: 1.0                                                    ┃
┃    Port: ${PORT}                                                   ┃
┃    Developed: By Storm, Search on YT: @Storm1464                   ┃
┃                                                                    ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
`);

// Creazione server HTTP con supporto API e CORS
const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // Endpoint per leggere la configurazione e lo stato Start/Stop
    if (req.url === '/api/config' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(currentConfig));
    } 
    // Endpoint per aggiornare la configurazione
    else if (req.url === '/api/config' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                currentConfig = { ...currentConfig, ...data };
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ status: 'success', config: currentConfig }));
            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ status: 'error', message: 'Invalid JSON' }));
            }
        });
    } else {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('ScarzBots Backend Running on Port ' + PORT);
    }
});

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    console.log('[INFO] - Client WebSocket connesso');
    ws.send(JSON.stringify({ type: 'config', config: currentConfig }));

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            if (data.action === 'update_config') {
                currentConfig = { ...currentConfig, ...data.config };
                wss.clients.forEach(client => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({ type: 'config', config: currentConfig }));
                    }
                });
            }
        } catch (e) {}
    });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`[INFO] - Server in esecuzione con successo sulla porta ${PORT}`);
});

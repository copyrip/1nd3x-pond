const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = require('./app'); // Import express app
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let users = {}; // {id: {username, color, cursorColor, connectTime, x, y}}

function broadcast(data) {
    const message = JSON.stringify(data);
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

wss.on('connection', (ws) => {
    const id = Date.now() + Math.random(); // unique id
    const connectTime = Date.now();
    users[id] = {
        username: `User${Object.keys(users).length + 1}`,
        color: '#000000',
        cursorColor: '#ff0000',
        connectTime,
        x: 0,
        y: 0
    };

    // Send initial data to client
    ws.send(JSON.stringify({ type: 'init', id, users }));

    // Broadcast new user count
    broadcast({ type: 'updateUsers', users });

    ws.on('message', (msg) => {
        const data = JSON.parse(msg);
        if (data.type === 'mousemove') {
            users[id].x = data.x;
            users[id].y = data.y;
            broadcast({ type: 'mousemove', id, x: data.x, y: data.y });
        } else if (data.type === 'updateUsername') {
            users[id].username = data.username;
            users[id].color = data.color;
            broadcast({ type: 'updateUsers', users });
        } else if (data.type === 'updateCursorColor') {
            users[id].cursorColor = data.cursorColor;
            broadcast({ type: 'updateUsers', users });
        } else if (data.type === 'draw') {
            broadcast({ type: 'draw', x: data.x, y: data.y, color: users[id].cursorColor });
        }
    });

    ws.on('close', () => {
        delete users[id];
        broadcast({ type: 'updateUsers', users });
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

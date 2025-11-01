const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  maxHttpBufferSize: 1e6, // 1MB max per message
});

app.use(express.static('public'));

const PORT = process.env.PORT || 3000;

// Store user cursors
let users = {};

// Throttle broadcasting to 30 FPS
let lastBroadcast = 0;
const BROADCAST_INTERVAL = 33; // ms ~30FPS

io.on('connection', (socket) => {
  users[socket.id] = {};

  socket.on('cursor-move', (data) => {
    users[socket.id] = data;

    const now = Date.now();
    if (now - lastBroadcast > BROADCAST_INTERVAL) {
      io.emit('cursors-update', users);
      lastBroadcast = now;
    }
  });

  socket.on('disconnect', () => {
    delete users[socket.id];
    io.emit('cursors-update', users);
  });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
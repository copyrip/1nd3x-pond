const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('disconnect', () => {
        io.emit('userDisconnected', socket.id);
    });

    // Relay client updates
    socket.on('updateUser', (data) => {
        io.emit('updateUser', { id: socket.id, ...data });
    });

    socket.on('broadcastClick', (data) => {
        io.emit('broadcastClick', { id: socket.id, points: data.points });
    });

    socket.on('moveCursor', (data) => {
        io.emit('moveCursor', { id: socket.id, x: data.x, y: data.y });
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

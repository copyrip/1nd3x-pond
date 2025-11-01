const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

let users = {};

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Initialize user
    users[socket.id] = {
        name: `User${Math.floor(Math.random() * 1000)}`,
        points: 0,
        cursorColor: '#ff0000',
        usernameColor: '#0000ff',
        connectedAt: Date.now()
    };

    // Notify all clients
    io.emit('updateUsers', users);

    // Handle updates from client
    socket.on('updateUser', (data) => {
        if (users[socket.id]) {
            users[socket.id] = { ...users[socket.id], ...data };
            io.emit('updateUsers', users);
        }
    });

    socket.on('clickPoint', (points) => {
        if (users[socket.id]) {
            users[socket.id].points += points;
            io.emit('updateUsers', users);
        }
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        delete users[socket.id];
        io.emit('updateUsers', users);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
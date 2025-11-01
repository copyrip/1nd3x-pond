const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

let users = {};

io.on('connection', (socket) => {
    const user = {
        id: socket.id,
        username: `User${Math.floor(Math.random() * 1000)}`,
        cursorColor: '#ff0000',
        nameColor: '#000000',
        points: 0,
        startTime: Date.now()
    };
    users[socket.id] = user;

    // Send initial user data
    socket.emit('init', { id: socket.id, users });

    // Notify others
    io.emit('updateUsers', users);

    socket.on('cursorMove', (data) => {
        if(users[socket.id]) {
            users[socket.id].x = data.x;
            users[socket.id].y = data.y;
            io.emit('cursorMove', { id: socket.id, x: data.x, y: data.y });
        }
    });

    socket.on('click', () => {
        if(users[socket.id]) {
            users[socket.id].points += 1;
            io.emit('updateUsers', users);
            io.emit('clickEffect', { id: socket.id });
        }
    });

    socket.on('bigClick', () => {
        if(users[socket.id]) {
            users[socket.id].points += 10;
            io.emit('updateUsers', users);
            io.emit('clickEffect', { id: socket.id });
        }
    });

    socket.on('customize', (data) => {
        if(users[socket.id]) {
            users[socket.id].cursorColor = data.cursorColor;
            users[socket.id].nameColor = data.nameColor;
            io.emit('updateUsers', users);
        }
    });

    socket.on('disconnect', () => {
        delete users[socket.id];
        io.emit('updateUsers', users);
    });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const PORT = process.env.PORT || 3001;

let users = {};

io.on('connection', (socket) => {
    const joinTime = Date.now();
    users[socket.id] = { username: `User${Math.floor(Math.random()*1000)}`, points: 0, joinTime };

    socket.emit('yourID', socket.id);
    io.emit('updateUsers', users);

    socket.on('updateUser', ({ username, color, cursorColor }) => {
        if (users[socket.id]) {
            users[socket.id].username = username;
            users[socket.id].color = color;
            users[socket.id].cursorColor = cursorColor;
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
        delete users[socket.id];
        io.emit('updateUsers', users);
    });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files from "public"
app.use(express.static('public'));

let users = {};

io.on('connection', (socket) => {
  users[socket.id] = {};

  socket.on('cursor-move', (data) => {
    users[socket.id] = data;
    io.emit('cursors-update', users);
  });

  socket.on('disconnect', () => {
    delete users[socket.id];
    io.emit('cursors-update', users);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
const socket = io();

let userId;
let users = {};

const pointsDiv = document.getElementById('points');
const userList = document.getElementById('users');
const userCount = document.getElementById('userCount');
const pingSpan = document.getElementById('ping');

const systemBtn = document.getElementById('systemBtn');

// Cursor movement
document.addEventListener('mousemove', (e) => {
    socket.emit('cursorMove', { x: e.clientX, y: e.clientY });
});

// Click buttons
systemBtn.addEventListener('click', () => {
    socket.emit('click');
});

// Random "I'd prefer not to" button
function spawnBigButton() {
    const bigBtn = document.createElement('button');
    bigBtn.innerText = "I'd prefer not to";
    bigBtn.style.top = `${Math.random()*window.innerHeight}px`;
    bigBtn.style.left = `${Math.random()*window.innerWidth}px`;
    document.body.appendChild(bigBtn);

    bigBtn.addEventListener('click', () => {
        socket.emit('bigClick');
        document.body.removeChild(bigBtn);
    });

    // Remove after 10s if not clicked
    setTimeout(() => bigBtn.remove(), 10000);
    setTimeout(spawnBigButton, Math.random()*130000 + 50000); // 50s - 3min
}
setTimeout(spawnBigButton, Math.random()*130000 + 50000);

// Initialize
socket.on('init', (data) => {
    userId = data.id;
    users = data.users;
    updateUserList();
});

// Update users
socket.on('updateUsers', (updatedUsers) => {
    users = updatedUsers;
    updateUserList();
    pointsDiv.innerText = `Points: ${users[userId]?.points || 0}`;
});

function updateUserList() {
    userList.innerHTML = '';
    userCount.innerText = Object.keys(users).length;
    Object.values(users).forEach(u => {
        const li = document.createElement('li');
        const timeOnline = Math.floor((Date.now() - u.startTime)/1000);
        li.innerText = `${u.username} | ${u.points} pts | ${timeOnline}s`;
        li.style.color = u.nameColor;
        userList.appendChild(li);
    });
}

// Click effects
socket.on('clickEffect', ({ id }) => {
    const img = document.createElement('img');
    img.src = "https://media.giphy.com/media/l0Exk8EUzSLsrErEQ/giphy.gif"; // example click animation
    img.className = 'clickEffect';
    const user = users[id];
    if(!user) return;
    img.style.left = `${user.x || 0}px`;
    img.style.top = `${user.y || 0}px`;
    document.body.appendChild(img);
    setTimeout(() => img.remove(), 500);
});

// Cursor rendering
setInterval(() => {
    document.querySelectorAll('.cursor').forEach(c => c.remove());
    Object.values(users).forEach(u => {
        if(!u.x || !u.y) return;
        const div = document.createElement('div');
        div.className = 'cursor';
        div.style.left = u.x + 'px';
        div.style.top = u.y + 'px';
        div.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24">
            <polygon points="0,0 0,24 6,18 12,24" fill="${u.cursorColor}"/>
        </svg><div style="color:${u.nameColor}; font-size:12px;">${u.username}</div>`;
        document.body.appendChild(div);
    });
}, 50);

// Ping
setInterval(() => {
    const start = Date.now();
    socket.emit('pingCheck');
    socket.once('pongCheck', () => {
        pingSpan.innerText = `${Date.now() - start}ms`;
    });
}, 2000);

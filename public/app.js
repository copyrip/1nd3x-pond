const socket = io();

let myName = `User${Math.floor(Math.random() * 1000)}`;
let myCursorColor = '#ff0000';
let myUsernameColor = '#0000ff';

const userPoints = document.getElementById('points');
const userList = document.getElementById('userList');
const connectedUsers = document.getElementById('connectedUsers');
const systemPopup = document.getElementById('systemPopup');
const systemOk = document.getElementById('systemOk');

function updateCursor(color) {
    document.body.style.cursor = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="32" width="32"><polygon points="0,0 0,32 8,24" fill="${color}"/></svg>') 0 0, auto`;
}

updateCursor(myCursorColor);

// Send user data to server
socket.emit('updateUser', { name: myName, cursorColor: myCursorColor, usernameColor: myUsernameColor });

// Handle system clicks
systemOk.addEventListener('click', () => {
    socket.emit('clickPoint', 1);
});

// Random "I'd prefer not to" popup
function spawnRandomBonus() {
    const bonusButton = document.createElement('button');
    bonusButton.textContent = "I'd prefer not to";
    bonusButton.style.position = 'absolute';
    bonusButton.style.left = `${Math.random() * 80 + 10}%`;
    bonusButton.style.top = `${Math.random() * 80 + 10}%`;
    document.body.appendChild(bonusButton);

    bonusButton.addEventListener('click', () => {
        socket.emit('clickPoint', 10);
        bonusButton.remove();
    });

    const nextSpawn = Math.random() * (180000 - 50000) + 50000; // 50s to 3min
    setTimeout(spawnRandomBonus, nextSpawn);
}

setTimeout(spawnRandomBonus, Math.random() * (180000 - 50000) + 50000);

// Update user list
socket.on('updateUsers', (users) => {
    userPoints.textContent = `Points: ${users[socket.id]?.points || 0}`;
    connectedUsers.textContent = `Connected users: ${Object.keys(users).length}`;

    userList.innerHTML = '';
    Object.values(users).forEach(u => {
        const li = document.createElement('li');
        const connectedTime = Math.floor((Date.now() - u.connectedAt) / 1000);
        li.innerHTML = `<span style="color:${u.usernameColor}">${u.name}</span> - ${connectedTime}s - ${u.points} points`;
        userList.appendChild(li);
    });
});

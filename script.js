// Datos mock en localStorage
let data = JSON.parse(localStorage.getItem('cadenaData')) || {
    users: {}, // {username: {password, country, lastAdd: timestamp}}
    chains: {} // {country: [eslabones]}
};
let currentUser = null;

// Funciones auxiliares
function saveData() {
    localStorage.setItem('cadenaData', JSON.stringify(data));
}

function updateUserDisplay() {
    document.getElementById('current-user').textContent = currentUser ? currentUser : 'No registrado';
    document.getElementById('user-country').textContent = currentUser ? data.users[currentUser].country : 'No registrado';
    document.getElementById('add-form').style.display = currentUser ? 'block' : 'none';
    document.getElementById('logout').style.display = currentUser ? 'block' : 'none';
    if (currentUser) loadChain(data.users[currentUser].country);
    updateRanking();
    updateTimer();
}

function loadChain(country) {
    const list = document.getElementById('chain-list');
    list.innerHTML = '';
    if (data.chains[country]) {
        data.chains[country].forEach(eslabon => {
            const li = document.createElement('li');
            li.textContent = eslabon;
            list.appendChild(li);
        });
    }
}

function updateRanking() {
    const list = document.getElementById('ranking-list');
    list.innerHTML = '';
    const rankings = Object.entries(data.chains)
        .map(([country, chain]) => ({country, length: chain ? chain.length : 0}))
        .sort((a, b) => b.length - a.length);
    rankings.forEach(rank => {
        const li = document.createElement('li');
        li.textContent = `${rank.country}: ${rank.length} eslabones`;
        list.appendChild(li);
    });
}

let timerInterval;
function updateTimer() {
    if (!currentUser) return;
    const lastAdd = data.users[currentUser].lastAdd || 0;
    const now = Date.now();
    const cooldown = 5 * 60 * 1000; // 5 minutos
    const remaining = cooldown - (now - lastAdd);
    if (remaining > 0) {
        document.getElementById('add-btn').disabled = true;
        clearInterval(timerInterval);
        timerInterval = setInterval(updateTimer, 1000);
        const min = Math.floor(remaining / 60000);
        const sec = Math.floor((remaining % 60000) / 1000);
        document.getElementById('timer').textContent = `${min}:${sec < 10 ? '0' : ''}${sec}`;
    } else {
        document.getElementById('add-btn').disabled = false;
        document.getElementById('timer').textContent = 'Listo';
        clearInterval(timerInterval);
    }
}

// Eventos
document.getElementById('register-form').addEventListener('submit', e => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const country = document.getElementById('country').value;
    if (data.users[username]) {
        document.getElementById('register-msg').textContent = 'Usuario ya existe.';
        return;
    }
    if (!country) {
        document.getElementById('register-msg').textContent = 'Elige un país.';
        return;
    }
    data.users[username] = {password, country, lastAdd: 0};
    if (!data.chains[country]) data.chains[country] = [];
    currentUser = username;
    saveData();
    updateUserDisplay();
    document.getElementById('register-msg').textContent = 'Registro exitoso. ¡Bienvenido!';
});

document.getElementById('add-form').addEventListener('submit', e => {
    e.preventDefault();
    if (!currentUser) return;
    const eslabon = document.getElementById('eslabon').value;
    const country = data.users[currentUser].country;
    data.chains[country].push(eslabon);
    data.users[currentUser].lastAdd = Date.now();
    saveData();
    loadChain(country);
    updateRanking();
    updateTimer();
    document.getElementById('add-msg').textContent = 'Eslabón añadido.';
    document.getElementById('eslabon').value = '';
});

document.getElementById('contact-form').addEventListener('submit', e => {
    e.preventDefault();
    // En una versión real, envía por email o API
    document.getElementById('contact-msg').textContent = 'Mensaje enviado (simulado). ¡Gracias!';
});

document.getElementById('logout').addEventListener('click', () => {
    currentUser = null;
    updateUserDisplay();
});

// Inicializar
updateUserDisplay();
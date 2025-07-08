var email;
var password;
var clicked;
var username;
var savedusername = '';

let apps = JSON.parse(localStorage.getItem('apps')) || [{
    name: 'Google',
    //url: 'https://eviltester.github.io/TestingApp/apps/iframe-search/iframe-search.html',
    url: 'https://bing.com/search?q=search'
}, {
    name: 'Timely',
    url: 'https://www.timelypro.online'
}];

const verifypath = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

let users = [{
    username: 'Ayaan',
    email: 'ayaan.khalique3@gmail.com',
    password: 'sd',
}, {
    username: 'Khalique',
    email: 'khaliquer@gmail.com',
    password: 'Oyster@22',
}, {
    username: 'Wasiullah',
    email: '',
    password: 'sd'
}];

document.getElementById('password').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') signin();
});

const loginSound = new Audio('../audio/startup.mp3');

async function signin() {
    const password = document.getElementById('password').value;
    const usernameOrEmail = document.getElementById('username').value;

    // Find user by username or email
    const user = users.find(u =>
        u.username === usernameOrEmail || u.email === usernameOrEmail
    );

    if (!user) {
        alert('Please Check Username or Email');
        return;
    }

    if (user.password !== password) {
        alert('Please Check Email or Password');
        return;
    }
    localStorage.setItem('miniOS-User', JSON.stringify(user));
    start();
    // Add the 'unblurred' class to the body
    document.body.classList.add('unblurred');

    // Wait for the transition to complete, then start the next action
    await delay(8); // Match this delay to your CSS transition duration
}

function CheckUserExist(email) {
    let doesExist = false;
    users.forEach((check) => {
        if (check.email == email) {
            doesExist = true;
        }
    });
    return doesExist;
}

async function start() {
    tako.log('MiniOS Started');
    await loginSound.play();
    document.body.innerHTML = `
        <div id="taskbar">
        </div>
        <iframe id="app" style="width: 100%; height: 90vh; border: none;"></iframe>
    `;
    showApps();
}

function showApps() {
    const taskbar = document.getElementById('taskbar');
    apps.forEach((app) => {
        taskbar.innerHTML += `
            <image style="width: 50px;height: 50px;" src="/images/${(app.name).toLowerCase()}.jpg" id="${app.name}" onclick="'${(app.name)}'.startApp();"></image>
        `
    })
};

String.prototype.startApp = function() {
    apps.forEach((app) => {
        if (app.name == this) {
            if (document.getElementById('app').src == app.url) document.getElementById('app').src = '';
            else document.getElementById('app').src = app.url;
        }
    });
}

function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

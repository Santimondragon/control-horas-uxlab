const logoutBtn = document.getElementById('logout');
const logoutModal = document.getElementById('modal-logout');
const modalGoBackBtn = document.querySelector('#modal-logout .go-back');
const modalLogoutBtn = document.querySelector('#modal-logout .logout');
const activities = document.getElementById('activities');
const totalHoursTag = document.getElementById('totalHours');
const progressBar = document.querySelector('.bar .progress');
const topBar = document.querySelector('#overview .top-bar');

let totalHours = 0;
let progress = 0;
let name = '';
let tasks = [];

logoutBtn.addEventListener('click', () => {
    logoutModal.classList.add('shown');
});

modalGoBackBtn.addEventListener('click', () => {
    logoutModal.classList.remove('shown');
});

modalLogoutBtn.addEventListener('click', () => {
    totalHours = 0;
    progress = 0;
    while (activities.firstChild) {
        activities.removeChild(activities.firstChild);
    }
});

async function getName() {
    const response = await fetch('http://127.0.0.1:3000/getName');
    const data = await response.text();
    name = await data;

    let nameTag = document.createElement('p');
    let nameTagText = document.createTextNode(name);
    nameTag.className = 'name';
    nameTag.appendChild(nameTagText);
    topBar.insertBefore(nameTag, logoutBtn);

    totalHours = 0;
    progress = 0;
    while (activities.firstChild) {
        activities.removeChild(activities.firstChild);
    }
}

async function getTasks() {
    const response = await fetch('http://127.0.0.1:3000/getTasks');
    const data = await response.json();
    tasks = await data;
    showTasks();
}

async function showTasks() {
    tasks.forEach(element => {
        let activity = document.createElement('li');
        let date = document.createElement('article');

        let day = document.createElement('p');
        let month = document.createElement('p');
        let name = document.createElement('p');
        let duration = document.createElement('p');

        let dayText = document.createTextNode(element.Dia);
        let monthText = document.createTextNode(element.Mes);
        let nameText = document.createTextNode(element.Tarea);
        let durationText = document.createTextNode(element.Horas + 'h');

        day.appendChild(dayText);
        month.appendChild(monthText);
        name.appendChild(nameText);
        duration.appendChild(durationText);

        day.className = 'day';
        month.className = 'month';
        name.className = 'name';
        duration.className = 'duration';
        date.className = 'date';
        activity.className = 'activity';

        date.appendChild(day);
        date.appendChild(month);
        activity.appendChild(date);
        activity.appendChild(name);
        activity.appendChild(duration);
        activities.appendChild(activity);

        totalHours += parseInt(element.Horas);
    });
    totalHoursTag.innerHTML = totalHours + 'h';
    progress = (parseInt(totalHours) / 90) * 100;
    progressBar.style.width = Math.floor(progress) + '%';

    if (!activities.firstChild) {
        let msg = document.createElement('p');
        let textA = document.createTextNode('Aún no hay');
        let lineBreak = document.createElement('br');
        let textB = document.createTextNode('actividad :c');
        msg.className = 'msg';
        msg.appendChild(textA);
        msg.appendChild(lineBreak);
        msg.appendChild(textB);
        activities.appendChild(msg);
    }
}

getTasks();
getName();

setTimeout(() => {
    if (progress === 0) {
        getTasks();
    }
}, 2000);
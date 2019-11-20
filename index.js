const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({
    extended: false
})

//~~~~~~~ GOOGLE SHEETS API VARIABLES ~~~~~~~~\\
const readline = require('readline');
const {
    google
} = require('googleapis');
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
const TOKEN_PATH = 'token.json';


//~~~~~~~ APP CONTROL DE HORAS VARIABLES ~~~~~~~~\\
let isLogged = false;
let clients = [];
let activeClient = {
    'Cliente': '',
    'ID': '',
}
let users = [{
    'Username': '',
    'Password': ''
}];
let tasks = [];

//~~~~~~~ GOOGLE SHEETS FUNCTIONS ~~~~~~~~\\
fs.readFile('credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    authorize(JSON.parse(content), clientList);
});

function authorize(credentials, callback) {
    const {
        client_secret,
        client_id,
        redirect_uris
    } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getNewToken(oAuth2Client, callback);
        oAuth2Client.setCredentials(JSON.parse(token));
        callback(oAuth2Client);
    });
}

function getNewToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error while trying to retrieve access token', err);
            oAuth2Client.setCredentials(token);
            // Store the token to disk for later program executions
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) return console.error(err);
                console.log('Token stored to', TOKEN_PATH);
            });
            callback(oAuth2Client);
        });
    });
}

function clientList(auth) {
    const sheets = google.sheets({
        version: 'v4',
        auth
    });
    sheets.spreadsheets.values.get({
        spreadsheetId: '1HgnUnjuSsmJH0yNl5Gx_PP0pam1bp1fB1e_eo5hzAJI',
        range: 'clientes!A2:D',
    }, (err, res) => {
        if (err) return console.log('The API returned an error: ' + err);
        const rows = res.data.values;
        if (rows.length) {
            rows.map((row) => {
                //console.log(`${row[0]}, ${row[1]}`);
                let client = {
                    'Cliente': row[0],
                    'ID': row[1]
                }
                let user = {
                    'Username': row[2],
                    'Password': row[3]
                }
                clients.push(client);
                users.push(user);
            });
            console.log(clients);
            console.log(users);
        } else {
            console.log('No data found.');
        }
    });
}

function getTareas(auth) {
    const sheets = google.sheets({
        version: 'v4',
        auth
    });
    sheets.spreadsheets.values.get({
        spreadsheetId: activeClient.ID,
        range: 'ejemplo!A1:D',
    }, (err, res) => {
        if (err) return console.log('The API returned an error: ' + err);
        const rows = res.data.values;
        tasks = [];
        if (rows.length) {
            rows.map((row, index) => {
                if (index > 0) {
                    let task = {
                        'Dia': row[0],
                        'Mes': row[1],
                        'Tarea': row[2],
                        'Horas': row[3]
                    }
                    tasks.push(task);
                }
            });
            console.log(tasks);
        } else {
            console.log('No data found.');
        }
    });
}

//~~~~~~~ EXPRESS FUNCTIONS ~~~~~~~~\\

app.get('/', (req, res) => {
    if (isLogged) {
        res.sendFile(path.join(__dirname + '/public'));
    } else {
        res.redirect('/login')
    }
});

app.get('/login', (req, res) => {
    if (!isLogged) {
        res.sendFile(path.join(__dirname + '/public/login.html'));
    } else {
        res.redirect('/');
    }
});

app.get('/getTasks', cors(), (req, res) => {
    // Trying to read client's sheet
    fs.readFile('credentials.json', (err, content) => {
        if (err) return console.log('Error loading client secret file:', err);
        authorize(JSON.parse(content), getTareas);
    });
    res.json(tasks);
});

app.get('/getName', cors(), (req, res) => {
    res.send(activeClient.Cliente);
});

app.post('/login', urlencodedParser, (req, res) => {
    console.log(req.body);
    users.forEach((user, index) => {
        if (user.Username === req.body.username && user.Password === req.body.password) {
            console.log(index-1);
            activeClient = clients[index-1];
            isLogged = true;
        }
    });
    if (isLogged) {
        res.redirect('/');
    } else {
        res.redirect('/login');
    }
});

app.post('/logout', (req, res) => {
    isLogged = false;
    res.redirect('/login');
});

app.listen(3000, () => {
    console.log('App listening on port 3000!');
});

app.use(express.static('public'));
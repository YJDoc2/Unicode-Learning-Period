const express = require('express');
const app = express();
const path = require('path');
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const dbconfig = require('./config/db');

const PORT = process.env.PORT || 3000;

mongoose.connect(dbconfig.database);
let db = mongoose.connection;

db.once('open', () => {
    console.log('Database Connected...');
});

db.on('err', err => {
    console.log(err);
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

io.on('connection', socket => {
    require('./routes/sockets')(socket, io);
    return io;
});

app.use('/', express.static(path.join(__dirname, 'public')));

app.get('/support', (req, res) => {
    res.render('support');
});

let search = require('./routes/search');
app.use('/search', search);

let user = require('./routes/user');
app.use('/user', user);

let api = require('./routes/api');
app.use('/api', api);

server.listen(PORT, () => {
    console.log(`Sever Listening on port ${PORT}`);
});

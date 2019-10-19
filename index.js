const express = require('express');
const app = express();
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

let search = require('./routes/search');
app.use('/search', search);

let user = require('./routes/user');
app.use('/user', user);

let api = require('./routes/api');
app.use('/api', api);

app.listen(PORT, () => {
    console.log(`Sever Listening on port ${PORT}`);
});

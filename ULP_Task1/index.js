const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const dbconfig = require('./config/db');

const PORT = process.env.PORT || 3000;

mongoose.connect(dbconfig.database);
let db = mongoose.connection;

//* How to implement async/await here?
db.once('open', () => {
  console.log('Database Connected...');
});
//* Or here?
db.on('err', err => {
  console.log(err);
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

let api = require('./routes/api');
app.use('/api', api);

app.listen(PORT, () => {
  console.log(`Sever Listening on port ${PORT}`);
});

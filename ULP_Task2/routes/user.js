const express = require('express');
const router = express.Router();
const User = require('../models/user');
const uuidv4 = require('uuid/v4');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

//! ALL CHECKED -> WORK AS EXPECTED

//* 200 -> OK
//* 201-> OK CREATED
//* 400 -> Error in request
//* 401 -> unauthoried Access
//* 403 -> Forbidden access
//* 500 -> Internal Server Error

router.post('/register', async (req, res) => {
    let { name, email, password, owner } = req.body;
    if (!name || !email || !password) {
        res.status(400).send({ Success: false, err: 'Please Fill All Fields' });
    }
    try {
        let existing = await User.findOne({ email: email });
        if (existing != null) {
            res.status(400).send({
                Success: false,
                err: 'E-mail is already Registered'
            });
            return;
        }
        let hash = bcrypt.hashSync(password, 10);
        req.body.id = uuidv4();
        req.body.passHash = hash;
        req.body.restaurentIDs = [];
        let user = await User.create(req.body);
        res.status(201).send({ Success: true, result: user });
    } catch (e) {
        res.status(400).send({ Success: false, err: e });
    }
});

router.post('/login', async (req, res) => {
    let { email, password } = req.body;

    try {
        let user = await User.findOne({ email: email });
        if (user == null) {
            res.status(401).send({
                Success: false,
                err: 'Email is not registered.'
            });
            return;
        }

        //*bcrypt.compareSynce -> true if match
        if (!bcrypt.compareSync(password, user.passHash)) {
            res.status(403).send({
                Success: false,
                err: 'Password Does not Match'
            });
        }
        let token = await jwt.sign({ id: user.id }, 'Secrate', {
            expiresIn: 3600
        });

        res.status(200).send({ Success: true, token: token });
    } catch (e) {
        res.status(500).send({ Success: false, err: e });
    }
});

module.exports = router;

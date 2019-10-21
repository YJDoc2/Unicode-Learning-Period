const express = require('express');
const router = express.Router();
const uuidv4 = require('uuid/v4');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Restaurent = require('../models/restaurent');
const MenuItem = require('../models/menuItem');
const ServiceChat = require('../models/serviceChat');

//! ROUTES TESTED AND WORKING

//* 200 -> OK
//* 201-> OK CREATED
//* 400 -> Error in request
//* 401 -> unauthoried Access
//* 403 -> Forbidden access
//* 500 -> Internal Server Error

//! ADD ENDPOINTS
// TO add a new Restaurent to database
router.post('/add/restaurent', verifyAuthorized, async (req, res) => {
    //* Only an owner account can add a restaurent
    if (!req.user.owner) {
        res.status(403).send({
            Success: false,
            err: 'This Account is not an owner account'
        });
        return;
    }
    req.body.id = uuidv4();
    try {
        let restaurent = await Restaurent.create(req.body);
        //* Updates id of restaurent in user
        let userSet = await User.findByIdAndUpdate(req.user._id, {
            $push: { restaurentIDs: req.body.id }
        });

        res.status(201).send({ Success: true, restaurent: restaurent });
    } catch (err) {
        res.status(400).send({ Success: false, err: err });
    }
});

//TO Add a new Item to a Restaurent's Menue
router.post('/add/item', verifyAuthorized, async (req, res) => {
    try {
        //Check if Restaurent with given name exists
        let rest = await Restaurent.findOne({ name: req.body.restaurent });
        if (rest == null) {
            res.status(400).send({
                Success: false,
                err: `No Restaurent with name ${req.body.restaurent} found`
            });
            return;
        }

        //* To verify Ownership of Restaurent
        if (!verifyOwnership(req.user, rest.id)) {
            res.status(403).send({
                Success: false,
                err: 'UnAuthorized Request'
            });
            return;
        }

        //* Adds field that are internal
        req.body.id = uuidv4();
        req.body.restaurentID = rest.id;

        let item = await MenuItem.create(req.body);

        //add Category if new to restaurent's menu list
        let addtores = await Restaurent.findOneAndUpdate(
            { id: rest.id },
            {
                $addToSet: { categories: req.body.category }
            }
        );

        res.status(201).send({ Success: true, item: item });
    } catch (e) {
        res.status(400).send({ Success: false, err: e });
    }
});

//! UPDATE ENDPOINTS
//To update Item's info
router.put('/update/item', verifyAuthorized, async (req, res) => {
    let id = req.body.id;
    //* Sanity check!
    if (id == undefined) {
        res.status(400).send({ Success: false, err: 'No Id Found' });
        return;
    }
    try {
        let item = await MenuItem.findOne({ id: id });
        if (item == null) {
            res.status(400).send({
                Success: false,
                err: `No item with  id ${id} found`
            });
            return;
        }
        //* To verify Ownership of Restaurent
        if (!verifyOwnership(req.user, item.restaurentID)) {
            res.status(403).send({
                Success: false,
                err: 'UnAuthorized Request'
            });
            return;
        }
        item = await MenuItem.updateOne({ id: id }, req.body);
        item = await MenuItem.findOne({ id: id });

        res.status(201).send({ Success: true, result: item });
    } catch (err) {
        res.status(400).send({ Success: false, err: err });
    }
});

//To udate Restaurent's info
router.put('/update/restaurent', verifyAuthorized, async (req, res) => {
    let id = req.body.id;
    //* Sanity check!
    if (id == undefined) {
        res.status(400).send({ Success: false, err: 'No Id Found' });
        return;
    }
    //* To verify Ownership of Restaurent
    if (!verifyOwnership(req.user, req.body.id)) {
        res.status(403).send({ Success: false, err: 'UnAuthorized Request' });
        return;
    }

    try {
        let rest = await Restaurent.findOne({ id: id });
        //* Sanity check,in case there is some typo in sending the id.
        if (rest == null) {
            res.status(400).send({
                Success: false,
                err: `No Restaurent with  id ${id} found`
            });
            return;
        }
        //First updates Restaurent info
        rest = await Restaurent.updateOne({ id: id }, req.body);
        if (req.body.name) {
            //if name of restaurent is changed, updates its menu item's info as well
            items = await MenuItem.updateMany(
                { restaurentID: id },
                { $set: { restaurent: req.body.name } }
            );
        }
        rest = await Restaurent.findOne({ id: id });
        res.status(201).send({ Success: true, result: rest });
    } catch (err) {
        res.status(400).send({ Success: false, err: err });
    }
});

//To delete an item
router.delete('/remove/item', verifyAuthorized, async (req, res) => {
    let id = req.body.id;
    //* Sanity check
    if (id == undefined) {
        res.status(400).send({ Success: false, err: 'No Id Found' });
        return;
    }
    try {
        let item = await MenuItem.findOne({ id: id });
        if (item == undefined) {
            res.status(400).send({
                Success: false,
                err: 'No Item with given ID Found'
            });
            return;
        }
        //* To verify Ownership of Restaurent
        if (!verifyOwnership(req.user, item.restaurentID)) {
            res.status(403).send({
                Success: true,
                err: 'UnAuthorized Request'
            });
            return;
        }
        item = await MenuItem.deleteOne({ id: id });
        res.status(200).send({ Success: true });
    } catch (err) {
        res.status(400).send({ Success: false, err: err });
    }
});

//! DELETE ENDPOINTS
//To delete a Restaurent
router.delete('/remove/restaurent', verifyAuthorized, async (req, res) => {
    let id = req.body.id;
    //* Sanity check
    if (id == undefined) {
        res.status(400).send({ Success: false, err: 'No Id Found' });
        return;
    }
    //* To verify Ownership of Restaurent
    if (!verifyOwnership(req.user, id)) {
        res.status(403).send({ Success: false, err: 'UnAuthorized Request' });
        return;
    }
    try {
        let rest = await Restaurent.findOne({ id: id });
        if (rest == null) {
            res.status(400).send({
                Success: false,
                err: 'No Restaurent with given ID Found'
            });
        }
        let temp = await Restaurent.deleteOne({ id: id });

        //deletes items in its menu
        let items = await MenuItem.deleteMany({ restaurent: rest.name });
        //deletes restaurent id from User account
        let userUpdate = await User.updateOne(
            { id: req.user.id },
            { $pull: { restaurentIDs: rest.id } }
        );
        res.status(200).send({ Success: true });
    } catch (err) {
        res.status(400).send({ Success: false, err: err });
    }
});

//! SERVICE REQUEST CHAT LOG ENDPOINT
router.post('/support/log', verifyAuthorized, async (req, res) => {
    let chatId = req.body.chatId;
    try {
        let chat = await ServiceChat.findOne({ id: chatId });
        if (!chat) {
            res.status(400).send({
                Success: false,
                err: 'No Chat with this id Exist'
            });
            return;
        }
        let update = await ServiceChat.findOneAndUpdate(
            { id: chatId },
            {
                $push: {
                    chat: {
                        sender: req.body.sender,
                        time: req.body.time,
                        message: req.body.message
                    }
                }
            }
        );
        res.status(201).send({ Success: true });
    } catch (err) {
        res.status(400).send({ Success: false, err: err });
    }
});

//! JWT Authorization Check
async function verifyAuthorized(req, res, next) {
    const bearerHeader = req.headers['authorization'];
    if (typeof bearerHeader !== undefined) {
        const token = bearerHeader.split(' ')[1];
        try {
            let idObj = jwt.verify(token, 'Secrate');
            req.user = await User.findOne({ id: idObj.id });
            next();
        } catch (e) {
            res.status(403).send({ Success: false, err: 'UnAuthorized Acess' });
        }
    } else {
        res.status(403).send({
            Success: false,
            err: 'No JWT Token Header Found'
        });
    }
}

function verifyOwnership(user, id) {
    if (!user.owner || !user.restaurentIDs.includes(id)) {
        return false;
    } else {
        return true;
    }
}

module.exports = router;

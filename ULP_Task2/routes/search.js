const express = require('express');
const router = express.Router();
const Restaurent = require('../models/restaurent');
const MenuItem = require('../models/menuItem');

//! ALL ROUTES TESTED AND WORK AS EXPECTED
//To Search restaurent by name

//* 200 -> OK
//* 201-> OK CREATED
//* 400 -> Error in request
//* 401 -> unauthoried Access
//* 403 -> Forbidden access
//* 500 -> Internal Server Error

router.get('/restaurents/:name', async (req, res) => {
    let resname = req.params.name;
    if (!resname) {
        res.status(400).send({
            Success: false,
            err: 'Please Provide a name to Search for'
        });
        return;
    }

    try {
        let query = { name: { $regex: resname, $options: 'i' } };
        let rest = await Restaurent.find(query);
        res.status(200).send({ Success: true, result: rest });
    } catch (err) {
        res.status(403).send({ Success: false, err: err });
    }
});

//To find Items by name
router.get('/items/:item', async (req, res) => {
    let item = req.params.item;
    if (!item) {
        res.status(400).send({
            Success: false,
            err: 'Please Provide a name to Search for'
        });
        return;
    }
    try {
        let query = { name: { $regex: item, $options: 'i' } };
        let items = await MenuItem.find(query);
        res.status(200).send({ Success: true, result: items });
    } catch (err) {
        res.status(403).send({ Success: false, err: err });
    }
});

//To find Rrstaurents by category
router.get('/cuisins/restaurents/:cat', async (req, res) => {
    let cat = req.params.cat;
    if (!cat) {
        res.status(400).send({
            Success: false,
            err: 'Please Provide a category to Search for'
        });
        return;
    }
    try {
        let query = { categories: { $in: [cat] } };
        let items = await Restaurent.find(query);
        let result = items.map(item => {
            return {
                name: item.name,
                id: item.id,
                addr: item.address
            };
        });
        res.status(200).send({ Success: true, result: result });
    } catch (err) {
        res.status(400).send({ Success: false, err: err });
    }
});

//To search Items by Category
router.get('/cuisins/items/:cat', async (req, res) => {
    let cat = req.params.cat;
    if (!cat) {
        res.status(400).send({
            Success: false,
            err: 'Please Provide a category to Search for'
        });
        return;
    }
    try {
        let query = { category: cat };
        let items = await MenuItem.find(query);
        res.status(200).send({ Success: true, result: items });
    } catch (err) {
        res.status(403).send({ Success: false, err: err });
    }
});

//! INFO ENDPOINTS
//TO get restaurent's menu
router.get('/menu/:name', async (req, res) => {
    let name = req.params.name;
    if (!name) {
        res.status(400).send({
            Success: false,
            err: 'Please Provide a name to get Menue of'
        });
        return;
    }
    try {
        let rest = Restaurent.findOne({ name: name });
        if (rest == null) {
            res.status(400).send({
                Success: false,
                err: `Restaurent ${resname} Does Not Exist,Please check given name as this is case Sensitive`
            });
        }
        let query = { restaurent: name };
        rest = await MenuItem.find(query);
        res.status(200).send({ Success: true, result: rest });
    } catch (err) {
        res.status(400).send({ Success: false, err: err });
    }
});

//To get all restaurents
router.get('/all', async (req, res) => {
    let restaurents = [];
    try {
        restaurents = await Restaurent.find({});
        res.status(200).send({ Success: true, result: restaurents });
    } catch (e) {
        res.status(400).send({ Success: false, err: e });
    }
});

module.exports = router;

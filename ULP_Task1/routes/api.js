const express = require('express');
const router = express.Router();
const uuidv4 = require('uuid/v4');
const Restaurent = require('../models/restaurent');
const MenuItem = require('../models/menuItem');

// TO add a new Restaurent to database
router.post('/addRestaurent', async (req, res) => {
    let name = req.body.name;
    let addr = req.body.addr;

    if (!name || !addr) {
        res.json({ Success: false, err: 'Both Name and Address are Required' });
    }

    let restaurent = new Restaurent({
        name: name,
        id: uuidv4(),
        address: addr
    });

    try {
        let result = await restaurent.save();
        res.json({ Success: true, restaurent: result });
    } catch (err) {
        console.log(err);
        res.json({ Success: true, err: err });
    }
});

//TO Add a new Item to a Restaurent's Menue
router.post('/addItem', async (req, res) => {
    let restaurent = req.body.restaurent;
    let itemname = req.body.name;
    let price = req.body.price;
    let cat = req.body.cat;
    let veg = req.body.veg;
    let jainop = req.body.jainop;

    if (
        !restaurent ||
        !itemname ||
        !price ||
        !cat ||
        veg == undefined ||
        jainop == undefined
    ) {
        res.json({
            Success: false,
            err:
                'Please Proveide All Parameters : Restaurent Item Belongs to,Name of Item,Price,Category,vegiterian and jain option Status'
        });
    }

    //Check if Restaurent with given name exists
    let rest = await Restaurent.findOne({ name: restaurent });
    if (rest == null) {
        throw new Error(`No Restaurent with name ${restaurent} found`);
    }

    let item = new MenuItem({
        name: itemname,
        id: uuidv4(),
        price: price,
        category: cat,
        vegeterian: veg,
        jainOption: jainop,
        restaurent: restaurent
    });
    try {
        let query = { name: restaurent };

        //adds item id to restaurent's menu list
        let addtores = await Restaurent.findOneAndUpdate(query, {
            $push: { menu: item.id },
            $addToSet: { categories: cat }
        });
        let additem = await item.save();

        res.json({ Success: true, item: additem });
    } catch (err) {
        res.json({ Success: false, err: err });
    }
});

//To Search restaurent by name
router.get('/searchResByName/:name', async (req, res) => {
    let resname = req.params.name;
    if (!resname) {
        res.json({
            Success: false,
            err: 'Please Provide a name to Search for'
        });
    }

    try {
        let query = { name: { $regex: resname, $options: 'i' } };
        let rest = await Restaurent.find(query);
        res.json({ Success: true, result: rest });
    } catch (err) {
        res.json({ Success: false, err: err });
    }
});

//TO get restaurent's menu
router.get('/getMenu/:name', async (req, res) => {
    let resname = req.params.name;
    if (!resname) {
        res.json({
            Success: false,
            err: 'Please Provide a name to get Menue of'
        });
    }
    try {
        let res = Restaurent.findOne({ name: resname });
        if (res == null) {
            throw new Error(
                `Restaurent ${resname} Does Not Exist,Please check given name getMenue is case Sensitive`
            );
        }
        let query = { restaurent: name };
        let rest = await MenuItem.find(query);
        res.json({ Success: true, result: rest });
    } catch (err) {
        res.json({ Success: false, err: err });
    }
});

//To find Items by name
router.get('/searchItem/:item', async (req, res) => {
    let item = req.params.item;
    if (!item) {
        res.json({
            Success: false,
            err: 'Please Provide a name to Search for'
        });
    }
    try {
        let query = { name: { $regex: item, $options: 'i' } };
        let items = await MenuItem.find(query);
        res.json({ Success: true, result: items });
    } catch (err) {
        res.json({ Success: false, err: err });
    }
});

//To find Rrstaurents by category
router.get('/searchResByCat/:cat', async (req, res) => {
    let cat = req.params.cat;
    if (!cat) {
        res.json({
            Success: false,
            err: 'Please Provide a category to Search for'
        });
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
        res.json({ Success: true, result: result });
    } catch (err) {
        res.json({ Success: false, err: err });
    }
});

//To search Items by Category
router.get('/searchItemByCat/:cat', async (req, res) => {
    let cat = req.params.cat;
    if (!cat) {
        res.json({
            Success: false,
            err: 'Please Provide a category to Search for'
        });
    }
    try {
        let query = { category: cat };
        let items = await MenuItem.find(query);
        res.json({ Success: true, result: items });
    } catch (err) {
        res.json({ Success: false, err: err });
    }
});

//To update Item's info
router.put('/updateItem', async (req, res) => {
    let id = req.body.id;
    let query = { id: id };
    let update = {};
    if (req.body.name) {
        update.name = req.body.name;
    }
    if (req.body.price) {
        update.price = req.body.price;
    }
    if (req.body.cat) {
        update.category = req.body.cat;
    }
    if (req.body.veg) {
        update.vegeterian = req.body.veg;
    }
    if (req.body.jainop) {
        update.jainOption = req.body.jainop;
    }
    try {
        let item = await MenuItem.findOne(query);
        if (item == null) {
            throw new Error(`No item with  id ${id} found`);
        }

        item = await MenuItem.findOneAndUpdate(query, update);
        item = await MenuItem.findOne(query);

        res.json({ Success: true, result: item });
    } catch (err) {
        res.json({ Success: false, err: err });
    }
});

//To udate Restaurent's info
router.put('/updateRes', async (req, res) => {
    let id = req.body.id;
    let query = { id: id };
    let update = {};
    if (req.body.addr) {
        update.address = req.body.addr;
    }
    if (req.body.name) {
        update.name = req.body.name;
    }
    let items = [];
    try {
        let rest = await Restaurent.findOne(query);
        if (item == null) {
            throw new Error(`No item with  id ${id} found`);
        }

        //First updates Restaurent info
        rest = await Restaurent.findOneAndUpdate(query, update);
        if (req.body.name) {
            //if name of restaurent is changed, updates its menu item's info as well
            items = await MenuItem.updateMany(
                { restaurent: rest.name },
                { restaurent: req.body.name }
            );
        }
        rest = await Restaurent.findOne(query);
        res.json({ Success: true, result: rest });
    } catch (err) {
        res.json({ Success: false, err: err });
    }
});

//To delete an item
router.delete('/removeItem', async (req, res) => {
    let id = req.body.id;
    if (id == undefined) {
        res.json({ Success: false, err: 'No Id Found' });
    }
    try {
        let item = await MenuItem.findOne({ id: id });
        if (item == undefined) {
            throw new Error('No Item Found');
        }
        //Removes item form restaurent's menu
        let rest = await Restaurent.findOneAndUpdate(
            { name: item.restaurent },
            { $pull: { menu: id } }
        );
        item = await MenuItem.findOneAndRemove({ id: id });
        res.json({ Success: true });
    } catch (err) {
        res.json({ Success: false, err: err });
    }
});

//To delete a Restaurent
router.delete('/removeRestaurent', async (req, res) => {
    let id = req.body.id;
    if (id == undefined) {
        res.json({ Success: false, err: 'No Ide Found' });
    }
    try {
        let rest = await Restaurent.findOne({ id: id });
        let name = rest.name;
        if (name == undefined) {
            throw new Error('No Restaurent Found');
        }
        rest = await Restaurent.findOneAndDelete({ id: id });

        //deletes items in its menu
        let items = await MenuItem.deleteMany({ restaurent: name });
        res.json({ Success: true });
    } catch (err) {
        res.json({ Success: true, err: err });
    }
});

module.exports = router;

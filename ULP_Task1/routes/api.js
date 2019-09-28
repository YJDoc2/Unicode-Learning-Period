const express = require('express');
const router = express.Router();
const uuidv4 = require('uuid/v4');
const Restaurent = require('../models/restaurent');
const MenuItem = require('../models/menuItem');

router.post('/addRestaurent', async (req, res) => {
  let name = req.body.name;
  let addr = req.body.addr;

  let restaurent = new Restaurent({
    name: name,
    id: uuidv4(),
    address: addr
  });
  //console.log(req.body);
  //res.json();
  try {
    let result = await restaurent.save();
    res.json({ Success: true, restaurent: result });
  } catch (err) {
    console.log(err);
    res.json({ Success: true, err: err });
  }
});

router.post('/addItem', async (req, res) => {
  let restaurent = req.body.restaurent;
  let itemname = req.body.name;
  let price = req.body.price;
  let cat = req.body.cat;
  let veg = req.body.veg;
  let jainop = req.body.jainop;

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

router.get('/searchResByName/:name', async (req, res) => {
  let resname = req.params.name;

  try {
    let query = { name: { $regex: resname, $options: 'i' } };
    let rest = await Restaurent.find(query);
    res.json({ Success: true, result: rest });
  } catch (err) {
    res.json({ Success: false, err: err });
  }
});

router.get('/getMenu/:name', async (req, res) => {
  let resname = req.params.name;

  try {
    let query = { restaurent: { $regex: resname, $options: 'i' } };
    let rest = await MenuItem.find(query);
    res.json({ Success: true, result: rest });
  } catch (err) {
    res.json({ Success: false, err: err });
  }
});

router.get('/searchItem/:item', async (req, res) => {
  let item = req.params.item;

  try {
    let query = { name: { $regex: item, $options: 'i' } };
    let items = await MenuItem.find(query);
    res.json({ Success: true, result: items });
  } catch (err) {
    res.json({ Success: false, err: err });
  }
});

router.get('/searchCat/:cat', async (req, res) => {
  let cat = req.params.cat;

  try {
    let query = { categories: { $in: [cat] } };
    let items = await Restaurent.find(query);
    let result = items.map(item => {
      return {
        name: item.name,
        id: item.id,
        stars: item.stars
      };
    });
    res.json({ Success: true, result: result });
  } catch (err) {
    res.json({ Success: false, err: err });
  }
});

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
    let item = await MenuItem.findOneAndUpdate(query, update);
    item = await MenuItem.findOne(query);

    res.json({ Success: true, result: item });
  } catch (err) {
    res.json({ Success: false, err: err });
  }
});

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
    let rest = await Restaurent.findOneAndUpdate(query, update);
    if (req.body.name) {
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
    let items = await MenuItem.deleteMany({ restaurent: name });
    res.json({ Success: true });
  } catch (err) {
    res.json({ Success: true, err: err });
  }
});

module.exports = router;

const mongoose = require('mongoose');
let MenuItem = require('./menuItem');

let restaurentSchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  id: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  stars: {
    type: Number,
    required: false
  },
  categories: [
    {
      type: String,
      required: false
    }
  ],
  menu: [
    {
      type: String,
      required: false
    }
  ]
});

const Restaurent = (module.exports = mongoose.model(
  'Restaurent',
  restaurentSchema
));

const mongoose = require('mongoose');
let MenuItem = require('./menuItem');

let restaurentSchema = mongoose.Schema(
  {
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
  },
  { collection: 'Restaurent' }
);

const Restaurent = (module.exports = mongoose.model(
  'Restaurent',
  restaurentSchema
));

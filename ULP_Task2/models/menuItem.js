const mongoose = require('mongoose');
let menuItemSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        id: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        category: {
            type: String,
            required: true
        },
        vegeterian: {
            type: Boolean,
            required: true
        },
        jainOption: {
            type: Boolean,
            required: true
        },
        restaurent: {
            type: String,
            required: true
        },
        restaurentID: {
            type: String,
            required: true
        }
    },
    { collection: 'MenuItems' }
);
module.exports = mongoose.model('MenuItem', menuItemSchema);

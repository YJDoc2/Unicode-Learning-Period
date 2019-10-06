const mongoose = require('mongoose');

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
        ]
    },
    { collection: 'Restaurent' }
);

module.exports = mongoose.model('Restaurent', restaurentSchema);

const mongoose = require('mongoose');

let staffSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        id: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        passHash: {
            type: String,
            required: true
        }
    },
    { collection: 'Staff' }
);

module.exports = mongoose.model('Staff', staffSchema);

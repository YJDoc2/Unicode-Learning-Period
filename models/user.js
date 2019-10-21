const mongoose = require('mongoose');

let userSchema = mongoose.Schema(
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
        },
        owner: {
            type: Boolean,
            default: false
        },
        restaurentIDs: [String]
    },
    { collectin: 'Users' } //! Please Make it  'Collection'
);

module.exports = mongoose.model('User', userSchema);

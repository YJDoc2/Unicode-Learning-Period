const mongoose = require('mongoose');

let serviceChatSchema = mongoose.Schema(
    {
        id: {
            type: String,
            required: true
        },
        clientEmail: {
            type: String,
            require: true
        },
        supportEmail: {
            type: String,
            required: true
        },
        chat: [
            {
                sender: String,
                message: String,
                time: Date
            }
        ],
        start: {
            type: Date
        },
        end: {
            type: Date
        }
    },
    { collection: 'ServiceChats' }
);

module.exports = mongoose.model('ServiceChat', serviceChatSchema);

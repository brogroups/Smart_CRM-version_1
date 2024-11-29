const mongoose = require('mongoose')

const NotificationItems = new mongoose.Schema({
    action: { type: String, required: true },
    price: { type: Number },
    date: { type: Date, default: Date.now() },
    description: { type: String },
    qoldiq: { type: Number },
    worker: { type: String },
    notificationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Notification', // This should link to the Notification model
        required: true,
    },
})

const NotificationItemsModel = mongoose.model(
    'NotificationItems',
    NotificationItems
)
module.exports = NotificationItemsModel

// const mongoose = require('mongoose')

// const Notification = new mongoose.Schema({
//     notificationsCount: { type: Number, default: 0 },
//     notifications: [
//         [{ type: mongoose.Schema.Types.ObjectId, ref: 'NotificationItems' }],
//     ],
// })

// const NotificationModel = mongoose.model('Notification', Notification)
// module.exports = NotificationModel

const mongoose = require('mongoose')

const Notification = new mongoose.Schema({
    notificationsCount: { type: Number, default: 0 },
    notifications: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'NotificationItems' }, // Corrected
    ],
})

const NotificationModel = mongoose.model('Notification', Notification)
module.exports = NotificationModel

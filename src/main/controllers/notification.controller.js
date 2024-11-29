const {notificationId} = require('../config/notification')
const NotificationModel = require('../models/notification/notification-items.model') 
module.exports.listNotification = async(args, event) => {
    try {
        const notification = await NotificationModel.findById(notificationId).populate('notifications')
        return {
            status: 200,
            data: JSON.parse(JSON.stringify(notification))
        }
    } catch(error) {
        console.log(error)
        return {
            status: 500,
            error: 'Server Error'
        }
    }
}
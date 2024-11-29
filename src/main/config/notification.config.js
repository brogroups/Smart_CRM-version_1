const NotificationModel = require('../models/notification/notification-items.model')
const fs = require('fs')
const path = require('path')

module.exports.notificationCreateConfig = async (event, args) => {
    try {
        const notification = await NotificationModel.find()
        if (notification.length > 0) {
            console.log('Notification already exists in database')
            return
        }

        const newNotification = new NotificationModel({}) 
        await newNotification.save()
        const filePath = path.join(__dirname, './notification.js')

            fs.writeFileSync(filePath, `module.exports.notificationId = '${newNotification.id}';\n`)
            console.log('notification.js file created and written successfully')

        console.log('Notification created successfully')
    } catch (error) {
        console.error('Error during notification creation:', error)
        return { status: 500, error: 'Server Error' }
    }
}

const NotificationModel = require('../models/notification/notification-items.model')
const NotificationItemsModel = require('../models/notification/notification.model')
const { notificationId } = require('../config/notification')
const {events} = require('./index')

events.on('firma.created', async (date, description) => {
    const notification = await NotificationModel.findById(
        notificationId
    ).populate('notifications')

    const item = await NotificationItemsModel.create({
        action: 'Фирма создана',
        date: date || Date.now(),
        description: description || '',
        notificationId: notification._id,
    })
    await item.save()

    notification.notifications.push(item._id)
    notification.notificationsCount += 1

    await notification.save()
})

events.on('firma.deleted', async (date, description) => {
    const notification = await NotificationModel.findById(
        notificationId
    ).populate('notifications')

    const item = await NotificationItemsModel.create({
        action: 'Фирма удалена',
        date: date || Date.now(),
        description: description || '',
        notificationId: notification._id,
    })
    await item.save()

    notification.notifications.push(item._id)
    notification.notificationsCount += 1

    await notification.save()
})


events.on('payment.created', async (price, date, description) => {
    const notification = await NotificationModel.findById(
        notificationId
    ).populate('notifications')

    const item = await NotificationItemsModel.create({
        action: 'Платеж создан',
        price: price,
        date: date,
        description: description || '',
        notificationId: notification._id,
    })

    notification.notifications.push(item._id)
    notification.notificationsCount += 1

    await notification.save()
    await item.save()
})

events.on('payment.deleted', async (price, date, description) => {
    const notification = await NotificationModel.findById(
        notificationId
    ).populate('notifications')

    const item = await NotificationItemsModel.create({
        action: 'Платеж удален',
        price: price,
        date: date,
        description: description || '',
        notificationId: notification._id,
    })

    notification.notifications.push(item._id)
    notification.notificationsCount += 1

    await notification.save()
    await item.save()
})

events.on('product.created', async (name, price, date, description) => {
    const notification = await NotificationModel.findById(
        notificationId
    ).populate('notifications')
    console.log(name)

    const item = await NotificationItemsModel.create({
        action: `Товар ${name}`,
        price: price,
        date: date,
        description: description,
        notificationId: notification._id,
    })

    notification.notifications.push(item._id)
    notification.notificationsCount += 1

    await notification.save()
    await item.save()
})

events.on('product.deleted', async (price, date, description) => {
    const notification = await NotificationModel.findById(
        notificationId
    ).populate('notifications')

    const item = await NotificationItemsModel.create({
        action: 'Товар удален',
        price: price,
        date: date,
        description: description || '',
        notificationId: notification._id,
    })

    notification.notifications.push(item._id)
    notification.notificationsCount += 1

    await notification.save()
    await item.save()
})

events.on('order.created', async (price, qoldiq, date, description) => {
    const notification = await NotificationModel.findById(
        notificationId
    ).populate('notifications')

    const item = await NotificationItemsModel.create({
        action: 'Заказ создан',
        price: price,
        date: date,
        qoldiq: qoldiq,
        description: description || '',
        notificationId: notification._id,
    })

    notification.notifications.push(item._id)
    notification.notificationsCount += 1

    await notification.save()
    await item.save()
})

events.on('order.deleted', async (price, qoldiq, date, description) => {
    const notification = await NotificationModel.findById(
        notificationId
    ).populate('notifications')

    const item = await NotificationItemsModel.create({
        action: 'Заказ удален',
        price: price,
        date: date,
        qoldiq: qoldiq,
        description: description || '',
        notificationId: notification._id,
    })

    notification.notifications.push(item._id)
    notification.notificationsCount += 1

    await notification.save()
    await item.save()
})

events.on('invalid.created', async (price, date, description) => {
    const notification = await NotificationModel.findById(
        notificationId
    ).populate('notifications')

    const item = await NotificationItemsModel.create({
        action: 'отмененный заказ создан',
        price: price,
        date: date,
        description: description || '',
        notificationId: notification._id,
    })

    notification.notifications.push(item._id)
    notification.notificationsCount += 1

    await notification.save()
    await item.save()
})

events.on('invalid.deleted', async (price, date, description) => {
    const notification = await NotificationModel.findById(
        notificationId
    ).populate('notifications')

    const item = await NotificationItemsModel.create({
        action: 'отмененный заказ удален',
        price: price,
        date: date,
        description: description || '',
        notificationId: notification._id,
    })

    notification.notifications.push(item._id)
    notification.notificationsCount += 1

    await notification.save()
    await item.save()
})

events.on('worker.created', async (date, description) => {
    const notification = await NotificationModel.findById(
        notificationId
    ).populate('notifications')

    const item = await NotificationItemsModel.create({
        action: 'сотрудник создан',
        // price: price,
        date: date,
        description: description || '',
        notificationId: notification._id,
    })

    notification.notifications.push(item._id)
    notification.notificationsCount += 1

    await notification.save()
    await item.save()
})

events.on('worker.deleted', async (date, description) => {
    const notification = await NotificationModel.findById(
        notificationId
    ).populate('notifications')

    const item = await NotificationItemsModel.create({
        action: 'сотрудник удален',
        // price: price,
        date: date,
        description: description || '',
        notificationId: notification._id,
    })

    notification.notifications.push(item._id)
    notification.notificationsCount += 1

    await notification.save()
    await item.save()
})

events.on('worker.payment', async (date, price, description) => {
    const notification = await NotificationModel.findById(
        notificationId
    ).populate('notifications')

    const item = await NotificationItemsModel.create({
        action: 'Оплата работнику создан',
        price: price,
        date: date,
        description: description || '',
        notificationId: notification._id,
    })

    notification.notifications.push(item._id)
    notification.notificationsCount += 1

    await notification.save()
    await item.save()
})

events.on('worker.payment.rm', async (date,price, description) => {
    const notification = await NotificationModel.findById(
        notificationId
    ).populate('notifications')

    const item = await NotificationItemsModel.create({
        action: 'Оплата работнику удален',
        price: price,
        date: date,
        description: description || '',
        notificationId: notification._id,
    })

    notification.notifications.push(item._id)
    notification.notificationsCount += 1

    await notification.save()
    await item.save()
})


events.on('worker.deleted', async (date, description) => {
    const notification = await NotificationModel.findById(
        notificationId
    ).populate('notifications')

    const item = await NotificationItemsModel.create({
        action: 'сотрудник удален',
        // price: price,
        date: date,
        description: description || '',
        notificationId: notification._id,
    })

    notification.notifications.push(item._id)
    notification.notificationsCount += 1

    await notification.save()
    await item.save()
})


events.on('workerHistory.created', async (price, date, worker, description) => {
    const notification = await NotificationModel.findById(
        notificationId
    ).populate('notifications')

    const item = await NotificationItemsModel.create({
        action: 'история сотрудникa создан',
        price: price,
        date: date,
        worker: worker,
        description: description || '',
        notificationId: notification._id,
    })

    notification.notifications.push(item._id)
    notification.notificationsCount += 1

    await notification.save()
    await item.save()
})

events.on('workerHistory.deleted', async (price, date, worker, description) => {
    const notification = await NotificationModel.findById(
        notificationId
    ).populate('notifications')

    const item = await NotificationItemsModel.create({
        action: 'история сотрудникa удален',
        price: price,
        date: date,
        worker: worker,
        description: description || '',
        notificationId: notification._id,
    })

    notification.notifications.push(item._id)
    notification.notificationsCount += 1

    await notification.save()
    await item.save()
})

events.on('dayDebts.created', async (price, date, worker, description) => {
    const notification = await NotificationModel.findById(
        notificationId
    ).populate('notifications')

    const item = await NotificationItemsModel.create({
        action: 'дневные долг создан',
        price: price,
        date: date,
        description: description || '',
        worker: worker,
        notificationId: notification._id,
    })

    notification.notifications.push(item._id)
    notification.notificationsCount += 1

    await notification.save()
    await item.save()
})

events.on('dayDebts.deleted', async (price, date, worker, description) => {
    const notification = await NotificationModel.findById(
        notificationId
    ).populate('notifications')

    const item = await NotificationItemsModel.create({
        action: 'дневные долг удален',
        price: price,
        date: date,
        description: description || '',
        worker: worker,
        notificationId: notification._id,
    })

    notification.notifications.push(item._id)
    notification.notificationsCount += 1

    await notification.save()
    await item.save()
})

events.on('lead.created', async (date, description) => {
    const notification = await NotificationModel.findById(
        notificationId
    ).populate('notifications')

    const item = await NotificationItemsModel.create({
        action: 'Lead',
        // price: price,
        date: date,
        description: description || '',
        notificationId: notification.id,
    })

    notification.notifications.push(item.id)
    notification.notificationsCount += 1

    await notification.save()
    await item.save()
})

events.on('lead.created', async (date, description) => {
    const notification = await NotificationModel.findById(
        notificationId
    ).populate('notifications')

    const item = await NotificationItemsModel.create({
        action: 'Lead',
        // price: price,
        date: date,
        description: description || '',
        notificationId: notification.id,
    })

    notification.notifications.push(item.id)
    notification.notificationsCount += 1

    await notification.save()
    await item.save()
})

events.on('lead.deleted', async (date, description) => {
    const notification = await NotificationModel.findById(
        notificationId
    ).populate('notifications')

    const item = await NotificationItemsModel.create({
        action: 'Lead Deleted',
        // price: price,
        date: date,
        description: description || '',
        notificationId: notification.id,
    })

    notification.notifications.push(item.id)
    notification.notificationsCount += 1

    await notification.save()
    await item.save()
})

events.on('user.created', async (date, description) => {
    const notification = await NotificationModel.findById(
        notificationId
    ).populate('notifications')

    const item = await NotificationItemsModel.create({
        action: 'пользователь создан',
        // price: price,
        date: date,
        description: description || '',
        notificationId: notificationId,
    })

    notification.notifications.push(item._id)
    notification.notificationsCount += 1

    await notification.save()
    await item.save()
})

events.on('user.deleted', async (date, description) => {
    const notification = await NotificationModel.findById(
        notificationId
    ).populate('notifications')

    const item = await NotificationItemsModel.create({
        action: 'пользователь удален',
        date: date,
        description: description || '',
        notificationId: notificationId,
    })

    notification.notifications.push(item._id)
    notification.notificationsCount += 1

    await notification.save()
    await item.save()
})

events.on('my.product', async(date, price, description) =>  {
    const notification = await NotificationModel.findById(
        notificationId
    ).populate('notifications')

    const item = await NotificationItemsModel.create({
        action: 'продукт создан',
        price: price,
        date: date,
        description: description || '',
        notificationId: notificationId,
    })

    notification.notifications.push(item._id)
    notification.notificationsCount += 1

    await notification.save()
    await item.save()
})


events.on('my.product.rm', async(date, description) =>  {
    const notification = await NotificationModel.findById(
        notificationId
    ).populate('notifications')

    const item = await NotificationItemsModel.create({
        action: 'продукт удален',
        date: date,
        description: description || '',
        notificationId: notificationId,
    })

    notification.notifications.push(item._id)
    notification.notificationsCount += 1

    await notification.save()
    await item.save()
})
const { allExprectedKey } = require('../config/statistic-childs/allExpected.key');
const OrderPaymentModel = require('../models/order/order-payment.model');
const OrderModel = require('../models/order/order.model');
const { allExpectedModel, expectedItemModel } = require('../models/statistic-child-models/expected.model');
const {events} = require('./index')
require('./notification.event')
require('./all-expected.event')

events.on('aset.sila', async (id, avans, date, comment) => {
    try {
        console.log('||||||||||||||||||||||||||||')
        console.log(id, avans, date, comment)
        const order = await OrderModel.findById(id).populate('payments');
        if (!order) {
            return {
                status: 404,
                error: 'Order not found',
            };
        }

        const payment = new OrderPaymentModel({
            avans,
            date: date || Date.now(),
            comment,
            orderId: order._id,
        });
        console.log(payment)
        
        await Promise.all([
            payment.save(),
            OrderModel.updateOne(
                { _id: id },
                {
                    // $inc: { avans: avans, qoldiq: -avans },
                    $push: { payments: payment._id },
                }
            ),
        ]);
        
        const allExp = await allExpectedModel.findById(allExprectedKey).populate('items')
        const item = new expectedItemModel({
            section: 'Заказ',
            title: `новый платеж в ${order.clientName}`,
            expectedCash: -avans,
            date: date || Date.now(),
            orderId: order.id,
            expectedId: allExp.id
        })
        await item.save()
        allExp.totalExpected -= avans
        allExp.itemsCount += 1
        allExp.items.push(item.id)
        await allExp.save()
        
        const desc = `Оплата заказа от ${order.clientName}`;
        events.emit('payment.created', avans, Date.now(), desc);
        events.emit('avans.created.st',payment.id, `новый платеж в ${order.clientName}`, avans, date);

        await deleteCache('order_list');
        return {
            status: 200,
            data: JSON.parse(JSON.stringify(payment)),
        };
    
    } catch (error) {
        return {
            status: 500,
            error: error.message || 'An error occurred while creating the payment',
        };
    }
})
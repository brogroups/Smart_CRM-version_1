const OrderPaymentModel = require('../../models/order/order-payment.model')
const OrderModel = require('../../models/order/order.model')
require('../../events/notification.event')
require('../../events/all-increment.event')
// require('../../global/helpers/all-decrement.helper.js')
const {events} = require('../../events/index')
const { deleteCache } = require('../../global/helpers/redis.helper')
const { allExpectedModel, expectedItemModel } = require('../../models/statistic-child-models/expected.model')
const { allExprectedKey } = require('../../config/statistic-childs/allExpected.key')
const { allIncrements } = require('../../config/statistic-childs/allIncrements.key')
const { dayIncrements } = require('../../config/statistic-childs/dayIncrements.key')
const { monthIncrements } = require('../../config/statistic-childs/monthIncrements.key')
const { statisticId } = require('../../config/statistic')
const { allIncrementsModel } = require('../../models/statistic-child-models/increment.model')
const { DayIncrementsModel, DayItemModel } = require('../../models/statistic-child-models/day.model')
const { MonthIncrementsModel, MonthItemModel } = require('../../models/statistic-child-models/month.model')
const StatisticModel = require('../../models/statistic.model')
const { decrementItemModel } = require('../../models/statistic-child-models/decrement.model')

module.exports.createOrderPayment = async (event, args) => {
    try {
        const { id, avans, date, comment } = args;
        console.log(args)
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
        
        await Promise.all([
            payment.save(),
            OrderModel.updateOne(
                { _id: id },
                {
                    $inc: { avans: avans, qoldiq: -avans },
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
}

const setIncrements = async(event, args) => {
    try {
        const {title, cash, paymentId} = args
        console.log(event, args)
        const allInc = await allIncrementsModel.findById(allIncrements).populate('items');
        if (!allInc) 
            {
                console.log('All increment is not defined');
                return

            }
       

        const dayInc = await DayIncrementsModel.findById(dayIncrements).populate('items');
        if (!dayInc) console.log('Day increment is not defined');
        
        const monthInc = await MonthIncrementsModel.findById(monthIncrements).populate('items');
        if (!monthInc) console.log('Month increment is not defined');
        
        const statistic = await StatisticModel.findById(statisticId)
        if(!statistic) {
            return {
                status: 404,
                error: 'Statistic not found in event'
            }
        }
        const dayItem = new DayItemModel({
            section: 'Платеж ',
            title: 'slkdlasd',
            cash: 100000,
            date: Date.now(),
            parentType: 'DayIncrements',
            parentId: dayInc.id,
            paymentId,
        });
        await dayItem.save();
       

        const monthItem = new MonthItemModel({
            section: 'Платеж',
            title,
            cash,
            date: Date.now(),
            parentType: 'MonthIncrements',
            parentId: monthInc.id,
            paymentId,
        });
        await monthItem.save();
      

        const decItem = new decrementItemModel({
            section: 'Платеж',
            title,
            decrementCash: cash,
            date:  Date.now(),
            paymentId,
            decrementId: allInc._id,
        });
        await decItem.save()
       
        
        statistic.debtsFromFirms -= cash
        await statistic.save()

        dayInc.items.push(dayItem.id);
        dayInc.totalIncrements += cash;
        dayInc.itemsCount += 1;
        await dayInc.save();

        monthInc.items.push(monthItem.id);
        monthInc.totalIncrements += cash;
        monthInc.itemsCount += 1;
        await monthInc.save();

        allInc.items.push(decItem._id);
        allInc.totalIncrement += cash;
        allInc.itemsCount += 1;
        await allInc.save();

        console.log('Payment event success')
    } catch(err) {
        console.log(err)
    }
}


module.exports.listOrderPayment = async(res, args) => {
    try {
        const payments = await OrderPaymentModel.find({}).lean()
        
        return {
            status: 200,
            data: JSON.parse(JSON.stringify(payments))
        }
    } catch(err) {
        return {
            status: 500,
            error: err
        }
    }
}

module.exports.updateOrderPayment = async(res, args) => {
    try {
        const {id, avans, date, comment} = args
        const payment = await OrderPaymentModel.findById(id)

        if(!payment) {
            return {
                status: 404,
                error: 'Payment not found'
            }
        }

        const order = await OrderModel.findById(payment.orderId).populate('payments')
        if(!order) {
            return {
                status: 404,
                error: 'Order not found'
            }
        }

        if(avans > 0) {
            order.avans -= payment.avans
            order.qoldiq += payment.avans

            order.avans += avans
            order.qoldiq -= avans
        }

        payment.data = date || payment.data
        payment.comment = comment || payment.comment
        await payment.save()

        await deleteCache('order_list');
        return {
            status: 200,
            data: JSON.parse(JSON.stringify(payment))
        }
    } catch(err) {
        return {
            status: 500,
            error: err
        }
    }
}

module.exports.deleteOrderPayment = async(res, args) => {
    try {
        const {id} = args
        const payment = await OrderPaymentModel.findById(id)

        if(!payment) {
            return {
                status: 404,
                error: 'Payment not found'
            }
        }

        const order = await OrderModel.findById(payment.orderId).populate('payments')
        if(!order) {
            return {
                status: 404,
                error: 'Order not found'
            }
        }

        order.avans -= payment.avans
        order.qoldiq += payment.avans
        await order.save()

        const desc = `оплата заказа удалена от ${order.clientName}`
        events.emit('payment.deleted', payment.avans, Date.now(), desc)
        events.emit('order.payment.deleted.st', payment.id)

        await OrderPaymentModel.findByIdAndDelete(id)
        await deleteCache('order_list');
        return {
            status: 200
        }
    } catch(err) {
        return {
            status: 500,
            error: err
        }
    }
}

const { allDecrements } = require('../../config/statistic-childs/allDecrements.key');
const { allDecrementModel, decrementItemModel } = require('../../models/statistic-child-models/decrement.model');
const { DayDecrementsModel, DayItemModel, DayIncrementsModel } = require('../../models/statistic-child-models/day.model');
const { monthDecrements } = require('../../config/statistic-childs/monthDecrements.key');
const { dayDecrements } = require('../../config/statistic-childs/dayDecrements.key');
const { MonthDecrementsModel, MonthItemModel, MonthIncrementsModel } = require('../../models/statistic-child-models/month.model');
const StatisticModel = require('../../models/statistic.model');
const { statisticId } = require('../../config/statistic');
const WorkerModel = require('../../models/worker/worker.model');
const { allIncrementsModel } = require('../../models/statistic-child-models/increment.model');
const { allIncrements } = require('../../config/statistic-childs/allIncrements.key');
const { dayIncrements } = require('../../config/statistic-childs/dayIncrements.key');
const { monthIncrements } = require('../../config/statistic-childs/monthIncrements.key');
const { events } = require('../../events/index');

events.on('order.payment.created.st', async(title, cash, paymentId) => {
    try {
        const allInc = await allIncrementsModel.findById(allIncrements).populate('items');
        if (!allInc) throw new Error('All increment is not defined');
        
        const dayInc = await DayIncrementsModel.findById(dayIncrements).populate('items');
        if (!dayInc) throw new Error('Day increment is not defined');
        
        const monthInc = await MonthIncrementsModel.findById(monthIncrements).populate('items');
        if (!monthInc) throw new Error('Month increment is not defined');
        
        const statistic = await StatisticModel.findById(statisticId)
        if(!statistic) {
            return {
                status: 404,
                error: 'Statistic not found in event'
            }
        }
        const dayItem = new DayItemModel({
            section: 'Платеж ',
            title,
            cash,
            date: Date.now(),
            parentType: 'DayIncrements',
            parentId: dayInc._id,
            paymentId,
        });
        await dayItem.save();

        const monthItem = new MonthItemModel({
            section: 'Платеж',
            title,
            cash,
            date: Date.now(),
            parentType: 'MonthIncrements',
            parentId: monthInc._id,
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

        allInc.items.push(decItem.id);
        allInc.totalIncrement += cash;
        allInc.itemsCount += 1;
        await allInc.save();

        console.log('Payment event success')
    } catch(err) {
        console.log(err)
    }
})
    
events.on('order.payment.deleted.st', async (paymentId, cash) => {
    try {
        const allDec = await allDecrementModel.findById(allDecrements).populate('items');
        if (!allDec) throw new Error('All decrement is not defined');

        const dayDec = await DayDecrementsModel.findById(dayDecrements).populate('items');
        if (!dayDec) throw new Error('Day decrement is not defined');

        const monthDec = await MonthDecrementsModel.findById(monthDecrements).populate('items');
        if (!monthDec) throw new Error('Month decrement is not defined');

        const decItem = await decrementItemModel.findOne({ paymentId });
        if (!decItem) throw new Error('Decrement item not found for the given invalidId');

        const dayItem = await DayItemModel.findOne({ paymentId });
        if (!dayItem) throw new Error('Day item not found for the given invalidId');

        const monthItem = await MonthItemModel.findOne({ paymentId });
        if (!monthItem) throw new Error('Month item not found for the given invalidId');
        const statistic = await StatisticModel.findById(statisticId)
        if(!statistic) {
            return {
                status: 404,
                error: 'Statistic not found in event'
            }
        }

        allDec.items = allDec.items.filter(itemId => itemId.toString() !== decItem.id.toString());
        dayDec.items = dayDec.items.filter(itemId => itemId.toString() !== dayItem.id.toString());
        monthDec.items = monthDec.items.filter(itemId => itemId.toString() !== monthItem.id.toString());

        allDec.totalDecrement -= decItem.decrementCash;
        dayDec.totalDecrements -= dayItem.cash;
        monthDec.totalDecrements -= monthItem.cash;

        allDec.itemsCount -= 1;
        dayDec.itemsCount -= 1;
        monthDec.itemsCount -= 1;

        await decItem.deleteOne();
        await dayItem.deleteOne();
        await monthItem.deleteOne();

        await allDec.save();
        await dayDec.save();
        await monthDec.save();

        statistic.debtsFromFirms += cash
        await statistic.save()

        console.log('Payment decrement removal handled successfully');
    } catch (error) {
        console.error('Error in invalid.rm event:', error.message);
    }
})
    
events.on('worker.payment.create.st', async(id, title, cash, paymentId, date) => {
    try {
        const allDec = await allDecrementModel.findById(allDecrements).populate('items');
        if (!allDec) throw new Error('All decrement is not defined');
        
        const dayDec = await DayDecrementsModel.findById(dayDecrements).populate('items');
        if (!dayDec) throw new Error('Day decrement is not defined');
        
        const monthDec = await MonthDecrementsModel.findById(monthDecrements).populate('items');
        if (!monthDec) throw new Error('Month decrement is not defined');

        const worker = await WorkerModel.findById(id)
        if(!worker) {
            throw new Error('Worker not found')
        }

        const dayItem = new DayItemModel({
            section: 'Платеж',
            title,
            cash,
            date: date || Date.now(),
            parentType: 'DayDecrements',
            parentId: dayDec._id,
            paymentId,
        });
        await dayItem.save();

        const monthItem = new MonthItemModel({
            section: 'Платеж',
            title,
            cash,
            date: date || Date.now(),
            parentType: 'MonthDecrements',
            parentId: monthDec._id,
            paymentId,
        });
        await monthItem.save();

        const decItem = new decrementItemModel({
            section: 'Платеж',
            title,
            decrementCash: cash,
            date: date || Date.now(),
            paymentId,
            decrementId: allDec.id,
        });
        await decItem.save()

        dayDec.items.push(dayItem.id);
        dayDec.totalDecrements += cash;
        dayDec.itemsCount += 1;
        await dayDec.save();

        monthDec.items.push(monthItem.id);
        monthDec.totalDecrements += cash;
        monthDec.itemsCount += 1;
        await monthDec.save();

        allDec.items.push(decItem.id);
        allDec.totalDecrement += cash;
        allDec.itemsCount += 1;
        await allDec.save();

        console.log('Worker Payment event success')

    } catch(err) {
        console.log(err)
    }
})

events.on('worker.payment.deleted.st', async (id, paymentId, cash) => {
    try {
        const allDec = await allDecrementModel.findById(allDecrements).populate('items');
        if (!allDec) throw new Error('All decrement is not defined');

        const dayDec = await DayDecrementsModel.findById(dayDecrements).populate('items');
        if (!dayDec) throw new Error('Day decrement is not defined');

        const monthDec = await MonthDecrementsModel.findById(monthDecrements).populate('items');
        if (!monthDec) throw new Error('Month decrement is not defined');

        const decItem = await decrementItemModel.findOne({ paymentId });
        if (!decItem) throw new Error('Decrement item not found for the given invalidId');

        const dayItem = await DayItemModel.findOne({ paymentId });
        if (!dayItem) throw new Error('Day item not found for the given invalidId');

        const worker = await WorkerModel.findById(id)
        if(!worker) {
            throw new Error('Worker not found')
        }


        const monthItem = await MonthItemModel.findOne({ paymentId });
        if (!monthItem) throw new Error('Month item not found for the given invalidId');
        const statistic = await StatisticModel.findById(statisticId)
        if(!statistic) {
            return {
                status: 404,
                error: 'Statistic not found in event'
            }
        }

        allDec.items = allDec.items.filter(itemId => itemId.toString() !== decItem.id.toString());
        dayDec.items = dayDec.items.filter(itemId => itemId.toString() !== dayItem.id.toString());
        monthDec.items = monthDec.items.filter(itemId => itemId.toString() !== monthItem.id.toString());

        allDec.totalDecrement -= decItem.decrementCash;
        dayDec.totalDecrements -= dayItem.cash;
        monthDec.totalDecrements -= monthItem.cash;

        allDec.itemsCount -= 1;
        dayDec.itemsCount -= 1;
        monthDec.itemsCount -= 1;

        await decItem.deleteOne();
        await dayItem.deleteOne();
        await monthItem.deleteOne();

        await allDec.save();
        await dayDec.save();
        await monthDec.save();

        worker.totalCash += cash

        console.log('Payment decrement removal handled successfully');
    } catch (error) {
        console.error('Error in invalid.rm event:', error.message);
    }
})


events.on('invalid.created.st', async (invalidId, title, cash, date) => {
    try {
        const allDec = await allDecrementModel.findById(allDecrements).populate('items');
        if (!allDec) throw new Error('All decrement is not defined');
        
        const dayDec = await DayDecrementsModel.findById(dayDecrements).populate('items');
        if (!dayDec) throw new Error('Day decrement is not defined');

        const monthDec = await MonthDecrementsModel.findById(monthDecrements).populate('items');
        if (!monthDec) throw new Error('Month decrement is not defined');

        const dayItem = new DayItemModel({
            section: 'Отмененный заказ',
            title,
            cash,
            date: date || Date.now(),
            parentType: 'DayDecrements',
            parentId: dayDec._id,
            invalidId,
        });
        await dayItem.save();

        const monthItem = new MonthItemModel({
            section: 'Отмененный заказ',
            title,
            cash,
            date: date || Date.now(),
            parentType: 'MonthDecrements',
            parentId: monthDec._id,
            invalidId,
        });
        await monthItem.save();

        const decItem = new decrementItemModel({
            section: 'Отмененный заказ',
            title,
            decrementCash: cash,
            date: date || Date.now(),
            invalidId,
            decrementId: allDec.id,
        });
        await decItem.save();

        dayDec.items.push(dayItem.id);
        dayDec.totalDecrements += cash;
        dayDec.itemsCount += 1;
        await dayDec.save();

        monthDec.items.push(monthItem.id);
        monthDec.totalDecrements += cash;
        monthDec.itemsCount += 1;
        await monthDec.save();

        allDec.items.push(decItem.id);
        allDec.totalDecrement += cash;
        allDec.itemsCount += 1;
        await allDec.save();

        console.log('invalid debts event processed successfully.');
    } catch (error) {
        console.error('Error in firma.debts event:', error.message);
    }
})

events.on('invalid.deleted.st', async (invalidId) => {
    try {
        const allDec = await allDecrementModel.findById(allDecrements).populate('items');
        if (!allDec) throw new Error('All decrement is not defined');

        const dayDec = await DayDecrementsModel.findById(dayDecrements).populate('items');
        if (!dayDec) throw new Error('Day decrement is not defined');

        const monthDec = await MonthDecrementsModel.findById(monthDecrements).populate('items');
        if (!monthDec) throw new Error('Month decrement is not defined');

        const decItem = await decrementItemModel.findOne({ invalidId });
        if (!decItem) throw new Error('Decrement item not found for the given invalidId');

        const dayItem = await DayItemModel.findOne({ invalidId });
        if (!dayItem) throw new Error('Day item not found for the given invalidId');

        const monthItem = await MonthItemModel.findOne({ invalidId });
        if (!monthItem) throw new Error('Month item not found for the given invalidId');

        allDec.items = allDec.items.filter(itemId => itemId.toString() !== decItem.id.toString());
        dayDec.items = dayDec.items.filter(itemId => itemId.toString() !== dayItem.id.toString());
        monthDec.items = monthDec.items.filter(itemId => itemId.toString() !== monthItem.id.toString());

        allDec.totalDecrement -= decItem.decrementCash;
        dayDec.totalDecrements -= dayItem.cash;
        monthDec.totalDecrements -= monthItem.cash;

        allDec.itemsCount -= 1;
        dayDec.itemsCount -= 1;
        monthDec.itemsCount -= 1;

        await decItem.deleteOne();
        await dayItem.deleteOne();
        await monthItem.deleteOne();

        await allDec.save();
        await dayDec.save();
        await monthDec.save();

        console.log('Invalid decrement removal handled successfully');
    } catch (error) {
        console.error('Error in invalid.rm event:', error.message);
    }
})

module.exports.DayDebtsCreated = async (dayId, title, cash, date) => {
    try {
        const [allDec, dayDec, monthDec] = await Promise.all([
            allDecrementModel.findById(allDecrements).populate('items'),
            DayDecrementsModel.findById(dayDecrements).populate('items'),
            MonthDecrementsModel.findById(monthDecrements).populate('items'),
        ]);

        if (!allDec || !dayDec || !monthDec) {
            return {
                status: 404,
                error: 'Не удалось найти необходимые записи в базе данных',
            };
        }
        const [dayItem, monthItem, decItem] = await Promise.all([
            new DayItemModel({
                section: 'Дневные Долги',
                title,
                cash,
                date: date || Date.now(),
                parentType: 'DayDecrements',
                parentId: dayDec._id,
                dayId,
            }).save(),

            new MonthItemModel({
                section: 'Дневные Долги',
                title,
                cash,
                date: date || Date.now(),
                parentType: 'MonthDecrements',
                parentId: monthDec._id,
                dayId,
            }).save(),

            new decrementItemModel({
                section: 'Дневные Долги',
                title,
                decrementCash: cash,
                date: date,
                dayId,
                decrementId: allDec.id,
            }).save(),
        ]);

        dayDec.items.push(dayItem._id);
        dayDec.totalDecrements += cash;
        dayDec.itemsCount += 1;

        monthDec.items.push(monthItem._id);
        monthDec.totalDecrements += cash;
        monthDec.itemsCount += 1;

        allDec.items.push(decItem._id);
        allDec.totalDecrement += cash;
        allDec.itemsCount += 1;

        await Promise.all([dayDec.save(), monthDec.save(), allDec.save()]);

        console.log('Day debts event processed successfully');
    } catch (error) {
        console.error('Ошибка в обработке события day.debts:', error.message);
    }
};

events.on('firma.payment.created', async(firmaId, title, cash, date) => {
    try {
        const [allDec, dayDec, monthDec] = await Promise.all([
            allDecrementModel.findById(allDecrements).populate('items'),
            DayDecrementsModel.findById(dayDecrements).populate('items'),
            MonthDecrementsModel.findById(monthDecrements).populate('items'),
        ]);

        if (!allDec || !dayDec || !monthDec) {
            return {
                status: 404,
                error: 'In DayDebts Created async function not found dec',
            };
        }

        const dayItem = new DayItemModel({
            section: 'Оплата фирме',
            title,
            cash,
            date: date || Date.now(),
            parentType: 'DayDecrements',
            parentId: dayDec._id,
            firmaId,
        });

        const monthItem = new MonthItemModel({
            section: 'Оплата фирме',
            title,
            cash,
            date: date || Date.now(),
            parentType: 'MonthDecrements',
            parentId: monthDec._id,
            firmaId,
        });

        const decItem = new decrementItemModel({
            section: 'Оплата фирме',
            title,
            decrementCash: cash,
            date: date || Date.now(),
            firmaId,
            decrementId: allDec.id,
        });

        await Promise.all([dayItem.save(), monthItem.save(), decItem.save()]);

        dayDec.items.push(dayItem.id);
        dayDec.totalDecrements += cash;
        dayDec.itemsCount += 1;

        monthDec.items.push(monthItem.id);
        monthDec.totalDecrements += cash;
        monthDec.itemsCount += 1;

        allDec.items.push(decItem.id);
        allDec.totalDecrement += cash;
        allDec.itemsCount += 1;

        await Promise.all([dayDec.save(), monthDec.save(), allDec.save()]);

        console.log('Firm debts event processed successfully');
    } catch (error) {
        console.error('Error in FirmPaymentCreated function:', error.message);
    }
});


events.on('firma.payment.deleted', async (firmaId) => {
    try {
        const allDec = await allDecrementModel.findById(allDecrements);
        if (!allDec) throw new Error('All decrement is not defined');

        const dayDec = await DayDecrementsModel.findById(dayDecrements);
        if (!dayDec) throw new Error('Day decrement is not defined');

        const monthDec = await MonthDecrementsModel.findById(monthDecrements);
        if (!monthDec) throw new Error('Month decrement is not defined');

        const [decItem, dayItem, monthItem] = await Promise.all([
            decrementItemModel.findOne({ firmaId }),
            DayItemModel.findOne({ firmaId }),
            MonthItemModel.findOne({ firmaId }),
        ]);

        if (!decItem || !dayItem || !monthItem)
            throw new Error('Some items related to the FirmId not found');

        allDec.items = allDec.items.filter(itemId => itemId.toString() !== decItem.id.toString());
        allDec.totalDecrement -= decItem.decrementCash;
        allDec.itemsCount -= 1;

        dayDec.items = dayDec.items.filter(itemId => itemId.toString() !== dayItem.id.toString());
        dayDec.totalDecrements -= dayItem.cash;
        dayDec.itemsCount -= 1;

        monthDec.items = monthDec.items.filter(itemId => itemId.toString() !== monthItem.id.toString());
        monthDec.totalDecrements -= monthItem.cash;
        monthDec.itemsCount -= 1;

        await Promise.all([decItem.deleteOne(), dayItem.deleteOne(), monthItem.deleteOne()]);
        await Promise.all([allDec.save(), dayDec.save(), monthDec.save()]);

        console.log('Firma payment removal event handled successfully');
    } catch (error) {
        console.error('Error in day.debts.rm event:', error.message);
    }
})
    
module.exports.DayDebtsDeleted = async (dayId) => {
    try {
        const allDec = await allDecrementModel.findById(allDecrements);
        if (!allDec) throw new Error('All decrement is not defined');

        const dayDec = await DayDecrementsModel.findById(dayDecrements);
        if (!dayDec) throw new Error('Day decrement is not defined');

        const monthDec = await MonthDecrementsModel.findById(monthDecrements);
        if (!monthDec) throw new Error('Month decrement is not defined');

        const [decItem, dayItem, monthItem] = await Promise.all([
            decrementItemModel.findOne({ dayId }),
            DayItemModel.findOne({ dayId }),
            MonthItemModel.findOne({ dayId }),
        ]);

        if (!decItem || !dayItem || !monthItem)
            throw new Error('Some items related to the dayId not found');

        allDec.items = allDec.items.filter(itemId => itemId.toString() !== decItem.id.toString());
        allDec.totalDecrement -= decItem.decrementCash;
        allDec.itemsCount -= 1;

        dayDec.items = dayDec.items.filter(itemId => itemId.toString() !== dayItem.id.toString());
        dayDec.totalDecrements -= dayItem.cash;
        dayDec.itemsCount -= 1;

        monthDec.items = monthDec.items.filter(itemId => itemId.toString() !== monthItem.id.toString());
        monthDec.totalDecrements -= monthItem.cash;
        monthDec.itemsCount -= 1;

        await Promise.all([decItem.deleteOne(), dayItem.deleteOne(), monthItem.deleteOne()]);
        await Promise.all([allDec.save(), dayDec.save(), monthDec.save()]);

        console.log('Day debts removal event handled successfully');
    } catch (error) {
        console.error('Error in day.debts.rm event:', error.message);
    }
}

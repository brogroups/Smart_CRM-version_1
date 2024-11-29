
const { events } = require('./index');
const { allIncrements } = require('../config/statistic-childs/allIncrements.key');
const { dayIncrements } = require('../config/statistic-childs/dayIncrements.key');
const { monthIncrements } = require('../config/statistic-childs/monthIncrements.key');

const { 
    incrementItemModel, 
    allIncrementsModel 
} = require('../models/statistic-child-models/increment.model');

const { 
    DayItemModel, 
    DayIncrementsModel, 
} = require('../models/statistic-child-models/day.model');
const { 
    MonthItemModel, 
    MonthIncrementsModel, 
} = require('../models/statistic-child-models/month.model');

const logError = (context, error) => {
    console.error(`Error in ${context}:`, error);
};

events.on('order.created.st', async (orderId, title,clientName, cash, date) => {
    try {
        const allInc = await allIncrementsModel.findById(allIncrements).populate('items');
        if (!allInc) throw new Error('All increment is not defined');

        const dayInc = await DayIncrementsModel.findById(dayIncrements).populate('items');
        if (!dayInc) throw new Error('Day increment is not defined');

        const monthInc = await MonthIncrementsModel.findById(monthIncrements).populate('items');
        if (!monthInc) throw new Error('Month increment is not defined');

        const dayItem = new DayItemModel({
            section: clientName,
            title,
            cash,
            date: date || Date.now,
            parentType: 'DayIncrements',
            parentId: dayInc._id,
            orderId
        });
        await dayItem.save();

        const monthItem = new MonthItemModel({
            section: clientName,
            title,
            cash,
            date: date || Date.now,
            parentType: 'MonthIncrements',
            parentId: monthInc._id,
            orderId
        });
        await monthItem.save();

        const incItem = new incrementItemModel({
            section: clientName,
            title,
            incrementCash: cash,
            date: date || Date.now,
            orderId,
            incrementId: allInc.id
        });
        await incItem.save();

        dayInc.items.push(dayItem.id);
        dayInc.totalIncrements += cash;
        dayInc.itemsCount += 1;
        await dayInc.save();

        monthInc.items.push(monthItem.id);
        monthInc.totalIncrements += cash;
        monthInc.itemsCount += 1;
        await monthInc.save();

        allInc.items.push(incItem.id);
        allInc.itemsCount += 1;
        allInc.totalIncrement += cash;
        await allInc.save();

        console.log('Order created successfully.');
    } catch (error) {
        console.log('order.created.st', error);
    }
});


events.on('avans.created.st', async (orderId, title, cash, date) => {
    try {
        const allInc = await allIncrementsModel.findById(allIncrements).populate('items');
        if (!allInc) throw new Error('All increment is not defined');

        const dayInc = await DayIncrementsModel.findById(dayIncrements).populate('items');
        if (!dayInc) throw new Error('Day increment is not defined');

        const monthInc = await MonthIncrementsModel.findById(monthIncrements).populate('items');
        if (!monthInc) throw new Error('Month increment is not defined');

        const dayItem = new DayItemModel({
            section: 'Платеж ',
            title,
            cash,
            date: date || Date.now,
            parentType: 'DayIncrements',
            parentId: dayInc._id,
            orderId
        });
        await dayItem.save();

        const monthItem = new MonthItemModel({
            section: 'Платеж ',
            title,
            cash,
            date: date || Date.now,
            parentType: 'MonthIncrements',
            parentId: monthInc._id,
            orderId
        });
        await monthItem.save();

        const incItem = new incrementItemModel({
            section: 'Платеж ',
            title,
            incrementCash: cash,
            date: date || Date.now,
            orderId,
            incrementId: allInc.id
        });
        await incItem.save();

        dayInc.items.push(dayItem.id);
        dayInc.totalIncrements += cash;
        dayInc.itemsCount += 1;
        await dayInc.save();

        monthInc.items.push(monthItem.id);
        monthInc.totalIncrements += cash;
        monthInc.itemsCount += 1;
        await monthInc.save();

        allInc.items.push(incItem.id);
        allInc.itemsCount += 1;
        allInc.totalIncrement += cash;
        await allInc.save();
        console.log(allInc)

        console.log('Order created successfully.');
    } catch (error) {
        console.log('order.created.st', error);
    }
});



events.on('order.deleted.st', async (orderId) => {
    try {
        const allInc = await allIncrementsModel.findById(allIncrements).populate('items');
        if (!allInc) throw new Error('All increment is not defined');

        const incItem = await incrementItemModel.findOne({ orderId });
        if (!incItem) throw new Error('Increment item not found for the deleted order');

        const dayItem = await DayItemModel.findOne({ orderId });
        if (!dayItem) throw new Error('Day item not found for the deleted order');

        const monthItem = await MonthItemModel.findOne({ orderId });
        if (!monthItem) throw new Error('Month item not found for the deleted order');

        allInc.items = allInc.items.filter(itemId => itemId.toString() !== incItem.id.toString());
        allInc.itemsCount -= 1;
        allInc.totalIncrement -= incItem.incrementCash;

        const dayInc = await DayIncrementsModel.findById(dayIncrements);
        const monthInc = await MonthIncrementsModel.findById(monthIncrements);

        dayInc.items = dayInc.items.filter(itemId => itemId.toString() !== dayItem.id.toString());
        dayInc.itemsCount -= 1;
        dayInc.totalIncrements -= dayItem.cash;

        monthInc.items = monthInc.items.filter(itemId => itemId.toString() !== monthItem.id.toString());
        monthInc.itemsCount -= 1;
        monthInc.totalIncrements -= monthItem.cash;

        await incItem.deleteOne();
        await dayItem.deleteOne();
        await monthItem.deleteOne();
        await allInc.save();
        await dayInc.save();
        await monthInc.save();

        console.log('Order deleted successfully.');
    } catch (error) {
        logError('order.deleted.st', error);
    }
});

const {events} = require('./index')
const { allExprectedKey } = require('../config/statistic-childs/allExpected.key')
const {allExpectedModel, expectedItemModel} = require('../models/statistic-child-models/expected.model') 

events.on('order.expected.st', async (orderId, title, cash, name) => {
    try {
        console.log('=== Начало функции OrderStExp ===');
        console.log(orderId, title, cash);

        const allExp = await allExpectedModel.findById(allExprectedKey).populate('items');
        if (!allExp) {
            return {
                status: 404,
                error: 'All expected is not defined',
            };
        }

        const incItem = new expectedItemModel({
            section: `Заказ ${name}`,
            title: title,
            expectedCash: cash,
            date: Date.now(),
            orderId: orderId,
            expectedId: allExp._id,
        });

        await incItem.save();

        allExp.items.push(incItem._id);
        allExp.itemsCount += 1;
        allExp.totalExpected += cash;
        await allExp.save();

        console.log('=== Успешное завершение функции OrderStExp ===');
    } catch (error) {
        console.log('Ошибка в функции OrderStExp:', error);
    }
});

events.on('order.expected.deleted', async(orderId) => {
    try {
        const allExp = await allExpectedModel.findById(allExpected).populate('items');
        if (!allExp) {
            return {
                status: 404,
                error: 'All increment is not defined'
            };
        }

        const incItem = await expectedItemModel.findOne({ orderId: orderId });
        if (!incItem) {
            return {
                status: 404,
                error: 'Increment item not found for the deleted order'
            };
        }

        allExp.items = allExp.items.filter(itemId => itemId.toString() !== incItem.id.toString());
        allExp.itemsCount -= 1;
        allExp.totalExpected -= incItem.expectedCash

        await incItem.deleteOne();
        await allExp.save();

        console.log('Order deletion event handled successfully');
    } catch (error) {
        console.log('Error in order.deleted event:', error);
    }
});

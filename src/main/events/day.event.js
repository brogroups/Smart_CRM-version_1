const { statisticId } = require("../config/statistic");
const { allDecrements } = require("../config/statistic-childs/allDecrements.key");
const { dayDecrements } = require("../config/statistic-childs/dayDecrements.key");
const { monthDecrements } = require("../config/statistic-childs/monthDecrements.key");
const { DayDecrementsModel, DayItemModel } = require("../models/statistic-child-models/day.model");
const { allDecrementModel, decrementItemModel } = require("../models/statistic-child-models/decrement.model");
const { MonthDecrementsModel, MonthItemModel } = require("../models/statistic-child-models/month.model");
const StatisticModel = require("../models/statistic.model");
const {events}  = require("./index")

events.on('day.debts.cr', async(dayId, worker, price) => {
    try {
        console.log('SASASAS')
        const allDec = await allDecrementModel.findById(allDecrements).populate('items');
        if (!allDec) throw new Error('All decrement is not defined');
        
        const dayDec = await DayDecrementsModel.findById(dayDecrements).populate('items');
        if (!dayDec) throw new Error('Day decrement is not defined');
        
        const monthDec = await MonthDecrementsModel.findById(monthDecrements).populate('items');
        if (!monthDec) throw new Error('Month decrement is not defined');
        
        const statistic = await StatisticModel.findById(statisticId)
        if(!statistic) {
            return {
                status: 404,
                error: 'Statistic not found in event'
            }
        }

        const dayItem = new DayItemModel({
            section: 'Платеж ',
            title: `Day debt from by ${worker} to ${price}`,
            cash: price,
            date: Date.now(),
            parentType: 'DayDecrements',
            parentId: dayDec._id,
            dayId,
        });
        await dayItem.save();

        const monthItem = new MonthItemModel({
            section: 'Платеж ',
            title: `Day debt from by ${worker} to ${price}`,
            cash: price,
            date:  Date.now(),
            parentType: 'MonthDecrements',
            parentId: monthDec._id,
            dayId,
        });
        await monthItem.save();

        const decItem = new decrementItemModel({
            section: 'Платеж ',
            title: `Day debt from by ${worker} to ${price}`,
            cash: price,
            date:  Date.now(),
            dayId,
            decrementId: allDec.id,
        });
        await decItem.save()
        
        dayDec.items.push(dayItem.id);
        dayDec.totalDecrements + price;
        dayDec.itemsCount += 1;
        await dayDec.save();

        monthDec.items.push(monthItem.id);
        monthDec.totalDecrements + price;
        monthDec.itemsCount += 1;
        await monthDec.save();

        allDec.items.push(decItem.id);
        allDec.totalDecrement -= price;
        allDec.itemsCount += 1;
        await allDec.save();
    } catch(err) 
    {console.log(err)}
})
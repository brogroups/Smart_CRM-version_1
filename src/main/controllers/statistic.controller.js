const { statisticId } = require('../config/statistic')
const { allDecrementModel } = require('../models/statistic-child-models/decrement.model')
const { allExpectedModel } = require('../models/statistic-child-models/expected.model')
const { allIncrementsModel, incrementItemModel } = require('../models/statistic-child-models/increment.model')
const StatisticModel = require('../models/statistic.model')
const {allIncrements} = require('../config/statistic-childs/allIncrements.key')
const {allDecrements} = require('../config/statistic-childs/allDecrements.key')
const {allExprectedKey} = require('../config/statistic-childs/allExpected.key')
const { DayItemModel } = require('../models/statistic-child-models/day.model')
const { MonthItemModel } = require('../models/statistic-child-models/month.model')
const { deleteCache } = require('../global/helpers/redis.helper')

module.exports.listStatistic = async () => {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

        const [
            statistic,
            globalIncrements,
            globalDecrements,
            globalExpected,
            dayItems,
            monthItems,
        ] = await Promise.all([
            StatisticModel.findById(statisticId),
            allIncrementsModel.findOne({ statisticId }),
            allDecrementModel.findOne({ statisticId }),
            allExpectedModel.findOne({ statisticId }),
            DayItemModel.find({
                date: { $gte: startOfDay, $lte: endOfDay },
                parentType: { $in: ['DayIncrements', 'DayDecrements'] },
            }),
            MonthItemModel.find({
                date: { $gte: startOfMonth, $lte: endOfMonth },
                parentType: { $in: ['MonthIncrements', 'MonthDecrements'] },
            }),
        ]);

        if (!statistic || !globalIncrements || !globalDecrements || !globalExpected || !dayItems || !monthItems) {
            return {
                status: 500,
                error: 'Ошибка в статистике. Проверьте данные.',
            };
        }

        let cash = 0;
        if (globalDecrements.totalDecrement < 0 && globalIncrements.totalIncrement === 0) {
            cash = globalDecrements.totalDecrement;
        } else if (globalDecrements.totalDecrement > globalIncrements.totalIncrement) {
            cash = globalIncrements.totalIncrement - globalDecrements.totalDecrement;
        } else if (globalIncrements.totalIncrement > globalDecrements.totalDecrement) {
            cash = globalIncrements.totalIncrement - globalDecrements.totalDecrement;
        }

        const dayIncrements = dayItems.filter((item) => item.parentType === 'DayIncrements');
        const dayDecrements = dayItems.filter((item) => item.parentType === 'DayDecrements');
        const monthIncrements = monthItems.filter((item) => item.parentType === 'MonthIncrements');
        const monthDecrements = monthItems.filter((item) => item.parentType === 'MonthDecrements');

        const totalCashOfDayInc = dayIncrements.reduce((sum, item) => sum + item.cash, 0);
        const totalCashOfDayDec = dayDecrements.reduce((sum, item) => sum + item.cash, 0);
        const totalCashOfMonthInc = monthIncrements.reduce((sum, item) => sum + item.cash, 0);
        const totalCashOfMonthDec = monthDecrements.reduce((sum, item) => sum + item.cash, 0);

        const response = {
            globalIncrements: globalIncrements.totalIncrement,
            globalDecrements: globalDecrements.totalDecrement,
            globalExpected: globalExpected.totalExpected,
            wallet: cash,
            debtsFromFirm: statistic.debtsFromFirms,
            monthDecrements: totalCashOfMonthDec,
            monthIncrements: totalCashOfMonthInc,
            dayDecrements: totalCashOfDayDec,
            dayIncrements: totalCashOfDayInc,
        };
        return {
            status: 200,
            data: response,
        };
    } catch (err) {
        console.error(err);
        return {
            status: 500,
            error: 'Ошибка сервера.',
        };
    }
};


module.exports.listIncrement= async() => {
    try {
        const increments = await allIncrementsModel.findById(allIncrements).populate('items')
        if(!increments) {
            return {
                status: 404,
                error: 'increments model not found'
            }
        }
        const items = await incrementItemModel.find({incrementId: increments.id})
        // Object.assign(increments, items)

        return {
            status: 200,
            data: JSON.parse(JSON.stringify([increments, items]))
        }
    } catch(error) {
        console.log(error)
        return {
            status: 500,
            error: 'Server Error'
        }
    }
}

module.exports.listDecrement = async() => {
    try {
        const decrements = await allDecrementModel.findById(allDecrements).populate('items')
        if(!decrements) {
            return {
                status: 404,
                error: 'decrements model not found'
            }
        }

        return {
            status: 200,
            data: JSON.parse(JSON.stringify(decrements))
        }
    } catch(error) {
        console.log(error)
        return {
            status: 500,
            error: 'Server Error'
        }
    }
}

module.exports.listExpected = async() => {
    try {
        const expected = await allExpectedModel.findById(allExprectedKey).populate('items')
        if(!expected) {
            return {
                status: 404,
                error: 'expected model not found'
            }
        }
      

        return {
            status: 200,
            data: JSON.parse(JSON.stringify(expected))
        }
    } catch(error) {
        console.log(error)
        return {
            status: 500,
            error: 'Server Error'
        }
    }
}

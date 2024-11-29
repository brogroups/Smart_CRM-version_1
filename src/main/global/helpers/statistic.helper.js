const { statisticId } = require('../../config/statistic')
const StatisticModel = require('../../models/statistic.model')
const {allIncrements} = require('../../config/statistic-childs/allIncrements.key')
const {allDecrements} = require('../../config/statistic-childs/allDecrements.key')
const {allExprectedKey} = require('../../config/statistic-childs/allExpected.key')
const { allDecrementModel } = require('../../models/statistic-child-models/decrement.model')
const { allIncrementsModel } = require('../../models/statistic-child-models/increment.model')
const { allExpectedModel } = require('../../models/statistic-child-models/expected.model')
require('colors')
const {dayIncrements} = require('../../config/statistic-childs/dayIncrements.key')
const {monthIncrements} = require('../../config/statistic-childs/monthIncrements.key')
const { DayIncrementsModel, DayDecrementsModel } = require('@/main/models/statistic-child-models/day.model')
const { MonthIncrementsModel, MonthDecrementsModel } = require('@/main/models/statistic-child-models/month.model')
const { dayDecrements } = require('../../config/statistic-childs/dayDecrements.key')
const { monthDecrements } = require('../../config/statistic-childs/monthDecrements.key')

module.exports.updateStatisticsForFirma = async (debts, isAdding) => {
    const statistic = await StatisticModel.findById(statisticId)
    isAdding ? statistic.debtsFromFirms += debts : statistic.debtsFromFirms -= debts 

    // statistic.debtsFromFirms += adjustment
    await statistic.save()
}

module.exports.updateStatisticsForOrder = async (avans, isAdding) => {
    const statistic = await StatisticModel.findById(statisticId)
    const incr = await allIncrementsModel.findById(allIncrements)
    const dayInc = await DayIncrementsModel.findById(dayIncrements)
    const monthInc = await MonthIncrementsModel.findById(monthIncrements)
    const adjustment = isAdding ? avans : -avans

    incr.totalIncrement += adjustment
    dayInc.totalIncrements += adjustment
    monthInc.totalIncrements += adjustment

    await incr.save()
    await dayInc.save()
    await monthInc.save()

    await statistic.save()
}

module.exports.updateStatisticsForInvalid = async (avans, isAdding) => {
    const statistic = await  StatisticModel.findById(statisticId)
    const incr = await allDecrementModel.findById(allDecrements)
    const dayInc = await DayDecrementsModel.findById(dayDecrements)
    const monthInc = await MonthDecrementsModel.findById(monthDecrements)

    const adjustment = isAdding ? avans : -avans
    incr.totalDecrement += adjustment
    dayInc.totalDecrements += adjustment
    monthInc.totalDecrements += adjustment

    await dayInc.save()
    await monthInc.save()
    await statistic.save()
}

module.exports.updateQoldiqStatisticsForOrder = async (qoldiq, isAdding) => {
    const incr = await allExpectedModel.findById(allExprectedKey)
    if(!incr){
        console.log('suck my dick');
    }
    
    isAdding ? incr.totalExpected += qoldiq : incr.totalExpected -= qoldiq
    await incr.save()
}

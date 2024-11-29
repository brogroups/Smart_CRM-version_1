const mongoose = require('mongoose')


const Statistic = new mongoose.Schema({
    globalIncrements: { type: mongoose.Schema.Types.ObjectId, ref: 'allIncrements'},
    globalDecrements: { type: mongoose.Schema.Types.ObjectId, ref: 'allDecrements'},
    monthIncrements: { type: mongoose.Schema.Types.ObjectId, ref: 'MonthIncrements' },
    monthDecrements: { type: mongoose.Schema.Types.ObjectId, ref: 'MonthDecrements' },
    dayIncrements: { type: mongoose.Schema.Types.ObjectId, ref: 'DayIncrements' },
    dayDecrements: { type: mongoose.Schema.Types.ObjectId, ref: 'DayDecrements' },
    wallet: { type: Number, default: 0 },
    expectedAmount:  { type: mongoose.Schema.Types.ObjectId, ref: 'allExpected'},
    debtsFromFirms: { type: Number, default: 0 },
})

const StatisticModel = mongoose.model('Statistic', Statistic)
module.exports = StatisticModel

const mongoose = require('mongoose')

const expectedItem = new mongoose.Schema({
    section: {type: String, required: true},
    title: {type: String, required: true},
    expectedCash: {type: Number, default: 0},
    date: {type: Date, default: Date.now()},
    orderId: {type: String},
    expectedId: {type: mongoose.Schema.Types.ObjectId, ref: 'allExpected', required: true}
})
const expectedItemModel = mongoose.model('expectedItem', expectedItem)


const allExpected = new mongoose.Schema({
    totalExpected: {type: Number, default: 0},
    itemsCount: {type: Number, default: 0},
    items: [{type: mongoose.Schema.Types.ObjectId, ref: 'expectedItem'}],
    statisticId: {type: mongoose.Schema.Types.ObjectId, ref: 'Statistic', required: true}
})


const allExpectedModel = mongoose.model('allExpected', allExpected)
module.exports = {allExpectedModel, expectedItemModel}


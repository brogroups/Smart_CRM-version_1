const mongoose = require('mongoose')

const incrementItem = new mongoose.Schema({
    section: {type: String, required: true},
    title: {type: String, required: true},
    incrementCash: {type: Number, default: 0},
    date: {type: Date, default: Date.now()},
    orderId: {type: String},
    incrementId: {type: mongoose.Schema.Types.ObjectId, ref: 'allIncrements', required: true}
})

const allIncrements = new mongoose.Schema({
    totalIncrement: {type: Number, default: 0},
    itemsCount: {type: Number, default: 0},
    items: [{type: mongoose.Schema.Types.ObjectId, ref: 'incrementItem'}],
    statisticId: {type: mongoose.Schema.Types.ObjectId, ref: 'Statistic'}
})


const allIncrementsModel = mongoose.model('allIncrements', allIncrements)
const incrementItemModel = mongoose.model('incrementItem', incrementItem)
module.exports = {allIncrementsModel, incrementItemModel}


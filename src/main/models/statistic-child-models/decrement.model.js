const mongoose = require('mongoose')


const decrementItem = new mongoose.Schema({
    section: {type: String, required: true},
    title: {type: String, required: true},
    decrementCash: {type: Number, default: 0},
    date: {type: Date, default: Date.now()},
    firmaId: {type: String},
    dayId: {type: String},
    paymentId: {type: String},
    invalidId: {type: String},
    decrementId: {type: mongoose.Schema.Types.ObjectId, ref: 'allDecrement', required: true}
})
const decrementItemModel = mongoose.model('decrementItem', decrementItem)



const allDecrement = new mongoose.Schema({
    totalDecrement: {type: Number, default: 0},
    itemsCount: {type: Number, default: 0},
    items: [{type: mongoose.Schema.Types.ObjectId, ref: 'decrementItem'}],
    statisticId: {type: mongoose.Schema.Types.ObjectId, ref: 'Statistic', required: true}
})


const allDecrementModel = mongoose.model('allDecrement', allDecrement)
module.exports = {allDecrementModel, decrementItemModel}

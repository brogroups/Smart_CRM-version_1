const mongoose = require('mongoose')

const DayDebts = new mongoose.Schema({
    reason: { type: String, required: true },
    date: { type: Date, required: true },
    price: { type: Number, default: 0 },
    description: { type: String },
    worker: { type: String, required: true },
})

const dayDebtsModel = mongoose.model('DayDebts', DayDebts)
module.exports = dayDebtsModel

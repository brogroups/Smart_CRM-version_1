const mongoose = require('mongoose')

const ShtrafItem = new mongoose.Schema({
    text: { type: String, required: true },
    from: { type: String, required: true },
    date: { type: Date, default: Date.now() },
    amount: { type: Number },
    workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker' },
})

const ShtrafItemModel = mongoose.model('ShtrafItem', ShtrafItem)
module.exports = ShtrafItemModel

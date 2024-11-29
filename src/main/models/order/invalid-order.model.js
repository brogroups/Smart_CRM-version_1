const mongoose = require('mongoose')

const Invalid = new mongoose.Schema({
    clientName: { type: String, required: true },
    productName: { type: String, required: true },
    address: { type: String },
    price: { type: Number, required: true },
    comment: { type: String, required: true },
    date: { type: Date, default: Date.now() },
    workers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Worker' }],
})

const InvalidModel = mongoose.model('Invalid', Invalid)
module.exports = InvalidModel
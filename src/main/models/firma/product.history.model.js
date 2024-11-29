const mongoose = require('mongoose')


const ProductHistory = new mongoose.Schema({
    clientName: {type: String},
    productName: {type: String},
    firmaId: {type: String, required: true},
    firmaName: {type: String},
    productPrice: {type: Number, required: true},
    productCount: {type: Number, required: true},
    productTotalPrice: {type: Number, required: true},
    date: {type: Date, default: Date.now()}
})

const model = mongoose.model('ProductHistory', ProductHistory)
module.exports.ProductHistoryModel = model

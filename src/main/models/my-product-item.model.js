const mongoose  = require('mongoose')

const myProductItem = new mongoose.Schema({
    client: {type: String},
        date: {type: Date, default: Date.now()},
    quantity: {type: Number, default: 0},
    orderId: {type: String},
    colors: {type: Array, default: []},
    totalPrice: {type: Number, default: 0},
    parentId: {type: mongoose.Schema.Types.ObjectId, ref: 'MyProducts', required: true}
})

const myProductItemModel = mongoose.model('MyProductItem', myProductItem)
module.exports = myProductItemModel
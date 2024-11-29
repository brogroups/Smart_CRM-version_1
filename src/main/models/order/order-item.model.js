const mongoose = require('mongoose')


const OrderItem = new mongoose.Schema({
    title: {type: String},
    quantity: {type: Number, default: 0},
    price: {type: Number, default: 0},
    color: {type: Array, default: []},
    status: {type: String},
    invalids: [
        {
            title: {type: String, required: true},
            quantity: {type: Number, default: 0},
            price: {type: Number, default: 0},
            date: {type: Date, default: Date.now()},
            comment: {type: String}
        }
    ],
    orderId: {type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true}
})

const OrderItemModel = mongoose.model('orderItems', OrderItem)
module.exports = OrderItemModel
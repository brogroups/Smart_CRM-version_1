const mongoose = require('mongoose')

const OrderPayment = new mongoose.Schema({
    avans: { type: Number, required: true, default: true },
    date: { type: Date, required: true },
    comment: { type: String, required: true },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
    },
})

const OrderPaymentModel = mongoose.model('OrderPayment', OrderPayment)
module.exports = OrderPaymentModel

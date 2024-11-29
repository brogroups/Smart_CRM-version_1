const mongoose = require('mongoose')

const Order = new mongoose.Schema({
    clientName: { type: String, required: true },
    phone: {type: String},
    productsCount: {type: Number, default: 0},
    products: [
        {
            title: {type: String, required: true},
            quantity: {type: Number, default: 0},
            price: {type: Number, default: 0},
            productId: {type: String, required: true}
        }
    ],
    satisfactions: [
        {
            title: {type: String, required: true},
            quantity: {type: Number, default: 0},
            price: {type: Number, default: 0},
        }
    ],
    price: { type: Number, default: 0 },
    paymentMethod: {type: String},
    avans: { type: Number, default: 0 },
    qoldiq: { type: Number, default: 0 },
    address: { type: String },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, default: 'Заказ принить' },
    isArchive: { type: Boolean, default: false },
    isRestored : {type: Boolean, default: false},
    workers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Worker' }],
    archive: { type: mongoose.Schema.Types.ObjectId, ref: 'Archive' },
    payments: [{type: mongoose.Schema.Types.ObjectId, ref: 'OrderPayment'}],

})

const OrderModel = mongoose.model('Order', Order)
module.exports = OrderModel

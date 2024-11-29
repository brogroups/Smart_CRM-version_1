const mongoose = require('mongoose')

const Type = {
    usd: 'usd',
    uzs: 'uzs',
}

const Firma = new mongoose.Schema({
    firma: { type: String, required: true },
    manager: { type: String },
    phone: { type: String},
    email: { type: String },
    paymentMethod: {
        type: String,
        enum: Object.values(Type),
        default: Type.uzs,
    },
    address: { type: String },
    date: { type: Date, default: Date.now() },
    active: { type: Boolean, default: true },
    debts: { type: Number, default: 0 },
    productsCount: {type: Number, default: 0},
    isDeleted: {type: Boolean, default: false},
    saleProducts: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'salesProduct' },
    ],
    payments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Payed' }],
})

const FirmaModel = mongoose.model('Firma', Firma)
module.exports = FirmaModel

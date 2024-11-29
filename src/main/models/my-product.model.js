const mongoose = require('mongoose')

const Product = new mongoose.Schema({
    title: {type: String, required: true},
    colors: {type: Array, default: []},
    price: {type: Number, default: 0},
})

const myProductsModel = mongoose.model('MyProducts', Product)
module.exports = myProductsModel
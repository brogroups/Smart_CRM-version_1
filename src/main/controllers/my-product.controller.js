const myProductsModel = require("../models/my-product.model")
const {events} = require('../events/index')
require('../events/notification.event')

module.exports.createMyProduct = async(event, args) => {
    try {
         const {title, colors, quantity, price } = args

         const product = new myProductsModel({
            title,
            colors,
            quantity,
            price
         })

         await product.save()

         const desc = `был создан продукт ${title} количество ${quantity}`
         events.emit('my.product', Date.now(), price, desc)
         return {
            status: 200,
            data: JSON.parse(JSON.stringify(product))
         }
    } catch (error) {
        console.log(error);
        return {
            status: 500,
            error: 'Error fetching Day Decrements',
        };
    }
}

module.exports.listMyProducts = async(event, args) => {
    try {
        const products = await myProductsModel.find({}).lean()

        return {
            status: 200,
            data: JSON.parse(JSON.stringify(products))
        }
    } catch (error) {
        console.log(error);
        return {
            status: 500,
            error: 'Error fetching Day Decrements',
        };
    }
}

module.exports.updateMyProduct = async(event, args) => {
    try {
        const {id, title, colors, quantity, price} = args

        const product = await myProductsModel.findById(id)
        if(!product) {
            return {
                status: 404,
                error: 'Product not found'
            }
        }

        product.title = title || product.title
        product.colors = colors || product.colors
        product.quantity = quantity || product.quantity
        product.price = price || product.price
        await product.save()

        return {
            status: 200,
            data: JSON.parse(JSON.stringify(product))
        }
    } catch (error) {
        console.log(error);
        return {
            status: 500,
            error: 'Error fetching Day Decrements',
        };
    }
}

module.exports.deleteMyProduct = async(event, args) => {
    try {
        const {id} = args

        const product = await myProductsModel.findById(id)
        if(!product) {
            return {
                status: 404,
                error: 'Product not found'
            }
        }
        
        const desc = `продукт ${product.title} был удален`
        events.emit('my.product', Date.now(), product.price, desc)
        await myProductsModel.findByIdAndDelete(id)
        return {
            status: 200,
            data: JSON.parse(JSON.stringify(product))
        }
    } catch (error) {
        console.log(error);
        return {
            status: 500,
            error: 'Error fetching Day Decrements',
        };
    }
}
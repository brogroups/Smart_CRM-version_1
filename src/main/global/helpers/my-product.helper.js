const myProductItemModel = require('../../models/my-product-item.model');
const myProductsModel = require('../../models/my-product.model');

module.exports.newOrderAdd = async(orderId, id, clientName, colors, date, totalPrice) => {
    try {
        const product = await myProductsModel.findById(id).populate('items').catch((err) => console.log(err))

        const item = new myProductItemModel({
            client: clientName,
            orderId,
            colors,
            date,
            totalPrice
        })
        await item.save()

        product.itemsCount += 1
        product.items.push(item.id)
        await product.save()

        console.log('My product process succsed')
    } catch(err) {
        console.log(err)
        return {
            status: 500,
            error: 'Server error' 
        }
    }
}

module.exports.rmOrder = async(orderId) => {
    try {
        const product = await myProductsModel.findById(id).catch((err) => console.log(err))

        const item = await myProductItemModel.findOne({orderId})
        await myProductItemModel.findByIdAndDelete(item.id)

        product.itemsCount -= 1
        await product.save()

        console.log('My product process succsed')
    } catch(err) {
        console.log(err)
        return {
            status: 500,
            error: 'Server error' 
        }
    }
}


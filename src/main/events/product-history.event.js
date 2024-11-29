import { ProductHistoryModel } from "../models/firma/product.history.model"
import { events } from "./index"


events.on('ss', () => {console.log('kdjhasssssssssssssssssssssshduqu4172847812784781274871284')})


events.on('sales.history', async(client, name, price, count, firmaId, firmaName) => {
    try {
        console.log('Recived')
        const totalPrice = price * count
        if(client) {
            const history = new ProductHistoryModel({
                clientName: client,
                firmaId:firmaId || 'yoq',
                productName: name,
                productPrice: price,
                firmaName: firmaName,
                productCount: -count,
                productTotalPrice: totalPrice,
            })

            await history.save()
        } else {
            const history = new ProductHistoryModel({
                productName: name,
                productPrice: price,
                firmaName: firmaName || 'yoq',
                productCount: -count,
                productTotalPrice: totalPrice
            })
            
            await history.save()
        }
        console.log('Product history event succseed')
    } catch(err) {
        console.log(err)
        return {
            status: 500,
            error: 'Server error'
        }
    }
})


events.on('sales.history.first', async(client, name, price, count, firmaId, firmaName) => {
    try {
        console.log('Recived')
        const totalPrice = price * count
        if(client) {
            const history = new ProductHistoryModel({
                clientName: client,
                firmaId:firmaId || 'yoq',
                productName: name,
                productPrice: +price,
                firmaName: firmaName,
                productCount: +count,
                productTotalPrice: totalPrice,
            })

            await history.save()
        } else {
            const history = new ProductHistoryModel({
                productName: name,
                productPrice: +price,
                firmaId: firmaId || 'yoq',
                firmaName: firmaName,
                productCount: +count,
                productTotalPrice: totalPrice
            })
            
            await history.save()
        }
        console.log('Product history event succseed')
    } catch(err) {
        console.log(err)
        return {
            status: 500,
            error: 'Server error'
        }
    }
})
const { deleteCache } = require("../../global/helpers/redis.helper");
const OrderModel = require("../../models/order/order.model");

module.exports.listArchive = async () => {
    try {
        const orders = await OrderModel.find({isArchive: true})
        
        return {
            status: 200,
            data: JSON.parse(JSON.stringify(orders))
        }
    } catch(error) {
        console.log(error)
        return {
            status: 500,
            error: error
        }
    }
}

module.exports.updateArchive = async (event, args) => {
    try {
        const {id} = args;
        const data = args
      
        const order = await OrderModel.findById(id)
        if(!order || !order.isArchive) {
            return {
                status: 200,
                error: 'Order not found'
            }
        }

        const updated = await OrderModel.findByIdUpdate(id, data)
        await updated.save()

        return {
            status: 200,
            data: JSON.parse(JSON.stringify(updated))
        }
    } catch(error) {
        console.log(error)
        return {
            status: 500,
            error: error
        }
    }
}

module.exports.exitArchive = async(event, args) => {
    try {
        const {id} = args

        const order = await OrderModel.findById(id)
        if(!order) {
            return {
                status: 404,
                error: 'Архивный заказ не найден'
            }
        }
        if(order.isRestored) {
            order.isArchive = false
            order.status = 'Заказ возвращен'
            order.save()
             await deleteCache("order_list");
             return {
                status: 200,
                data: JSON.parse(JSON.stringify(order))
            }
        }

        order.status = 'Заказ возвращен'
        order.isArchive = false
        order.isRestored = true
        order.save()
        await deleteCache("order_list");


        return {
            status: 200,
            data: JSON.parse(JSON.stringify(order))
        }
    } catch(error) {
        console.log(error)
        return {
            status: 500,
            error: error
        }
    }
}

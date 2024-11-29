const { statisticId } = require('../../config/statistic')
const { events } = require('../../events/index')
const {
    updateStatisticsForInvalid,
} = require('../../global/helpers/statistic.helper')
const InvalidModel = require('../../models/order/invalid-order.model')
const ShtrafItemModel = require('../../models/shtraf/shtraf-item')
const StatisticModel = require('../../models/statistic.model')
const WorkerModel = require('../../models/worker/worker.model')
const {
    setCache,
    getCache,
    deleteCache,
} = require('../../global/helpers/redis.helper')
const { InvalidCreated, InvalidDeleted } = require('../../global/helpers/all-decrement.helper')
const OrderModel = require('../../models/order/order.model')
const OrderItemModel = require('../../models/order/order-item.model')

module.exports.createInvalid = async (event, args) => {
    try {
        const { clientName, 
            productId
            ,address, price, comment, workers } = args;

        if (workers && workers.length > 0) {
            const workersFound = await WorkerModel.find({
                _id: { $in: workers },
            });
            if (workersFound.length !== workers.length) {
                return {
                    status: 400,
                    message: 'Один или несколько работников не найдены',
                    data: null,
                };
            }
        }

        const shtrafItems = [];
        for (const workerId of workers) {
            const shItem = await ShtrafItemModel.create({
                text: comment,
                from: clientName,
                workerId,
            });

            shtrafItems.push(shItem);
            await WorkerModel.findByIdAndUpdate(workerId, {
                $push: { shtrafs: shItem._id },
            });
        }

        const currentOrder = await OrderItemModel.findById(productId)
        if(!currentOrder) {
            return {
                status: 404,
                error: 'Current Order not found'
            }
        }

        currentOrder.status = 'Отмененный заказ'
        const obj = {
            title: currentOrder.title,
            quantity: currentOrder.quantity,
            price: currentOrder.price,
            date: Date.now(),
            comment: comment || ''
        }
        currentOrder.invalids.push(obj)

        const newInvalid = new InvalidModel({
            clientName,
            productName: currentOrder.title,
            price,
            comment,
            workers,
            address,
        });
        
        await updateStatisticsForInvalid(price, true);
        await currentOrder.save()
        await newInvalid.save();

        const desc = `Invalid заказ от клиентаt ${(clientName, comment)}`;
        events.emit('invalid.created', price, Date.now(), desc); // Changed from 'event.emit' to 'events.emit'
        events.emit('invalid.created.st', newInvalid.id, `Invalid by ${newInvalid.clientName} to price ${newInvalid.price}`, newInvalid.price, Date.now())

        await deleteCache('invalid_list');
        await deleteCache('firma_list');

        return {
            status: 201,
            message: 'Invalid запись создана успешно',
            data: JSON.parse(JSON.stringify(newInvalid)),
        };
    } catch (error) {
        console.error(error);
        return {
            status: 500,
            message: 'Server Error',
            data: null,
        };
    }
};

module.exports.listInvalids = async (res, args) => {
    try {
        const cachedInvalids = await getCache('invalid_list');
        if (cachedInvalids) {
            return {
                status: 200,
                message: 'Invalid entries retrieved from cache',
                data: cachedInvalids,
            };
        }

        const invalids = await InvalidModel.find();
        await setCache('invalid_list', invalids, 3600);

        return {
            status: 200,
            message: 'Invalid entries retrieved from database',
            data: JSON.parse(JSON.stringify(invalids)),
        };
    } catch (error) {
        console.error(error);
        return {
            status: 500,
            message: 'Server Error',
            data: null,
        };
    }
};

module.exports.oneInvalid = async (event, args) => {
    try {
        const { id } = args;

        const cachedInvalids = await getCache('invalid_list');
        if (cachedInvalids) {
            return {
                status: 200,
                message: 'Invalid entry retrieved from cache',
                data: cachedInvalids,
            };
        }

        const invalid = await InvalidModel.findById(id).populate({
            path: 'workers',
            select: 'name summaType percent price active',
        });
        await setCache('invalid_list', invalid, 3600);

        return {
            status: 200,
            message: 'Invalid entry retrieved from database',
            data: JSON.parse(JSON.stringify(invalid)),
        };
    } catch (error) {
        console.error(error);
        return {
            status: 500,
            message: 'Server Error',
            data: null,
        };
    }
};

module.exports.updateInvalid = async (event, args) => {
    try {
        const { id, clientName, productName, price,address, comment, workers } = args;
        const statistic = await StatisticModel.findById(statisticId);

        const invalid = await InvalidModel.findById(id);
        if (!invalid) {
            return {
                status: 404,
                message: 'Invalid entry not found',
                data: null,
            };
        }

        invalid.clientName = clientName || invalid.clientName;
        invalid.productName = productName || invalid.productName;
        invalid.comment = comment || invalid.comment;
        invalid.workers = workers || invalid.workers;
        invalid.address = address || invalid.address;

        if (price > 0) {
            await updateStatisticsForInvalid(invalid.price, false);
            invalid.price = price;

            await updateStatisticsForInvalid(price, true);

            await statistic.save();
            await invalid.save();
        }

        await invalid.save();

        await deleteCache('invalid_list');
        await deleteCache('firma_list');

        await InvalidDeleted(invalid.id)
        await InvalidCreated(invalid.id, `недействительный заказ от ${invalid.clientName} to price ${invalid.price}`, invalid.price, Date.now())

        return {
            status: 200,
            message: 'Invalid entry updated successfully',
            data: JSON.parse(JSON.stringify(invalid)),
        };
    } catch (error) {
        console.error(error);
        return {
            status: 500,
            message: 'Server Error',
            data: null,
        };
    }
};

module.exports.deleteInvalid = async (event, args) => {
    try {
        const { id } = args;
        const statistic = await StatisticModel.findById(statisticId);
        const invalid = await InvalidModel.findById(id);
        if (!invalid) {
            return {
                status: 404,
                message: 'Invalid entry not found',
                data: null,
            };
        }
        events.emit('invalid.deleted.st', invalid.id)

        await updateStatisticsForInvalid(invalid.price, false);
        await statistic.save();
        const desc = `Invalid заказ от ${invalid.clientName}`;
        events.emit('invalid.created', invalid.price, Date.now(), desc);

        await InvalidModel.deleteOne({ _id: id });
        await deleteCache('invalid_list');
        await deleteCache('firma_list');
        return {
            status: 200,
            message: 'Invalid entry deleted successfully',
            data: null,
        };
    } catch (error) {
        console.error(error);
        return {
            status: 500,
            message: 'Server Error',
            data: null,
        };
    }
};

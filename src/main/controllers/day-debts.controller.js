const { events } = require('../events/index.js')
require('../events/notification.event.js')
require('../events/day.event.js')
const dayDebtsModel = require('../models/day-debts.model')
const {
    setCache,
    getCache,
    deleteCache,
} = require('../global/helpers/redis.helper')
const { DayDebtsDeleted, DayDebtsCreated } = require('../global/helpers/all-decrement.helper.js')
const { allDecrements } = require('../config/statistic-childs/allDecrements.key.js')
const { allDecrementModel } = require('../models/statistic-child-models/decrement.model.js')

module.exports.createDayDebts = async (event, args) => {
    try {
        const { reason, date, price, description, worker } = args
        const newDayDebt = new dayDebtsModel({
            reason,
            date,
            price: price || 0,
            description: description || '',
            worker,
        })
        await newDayDebt.save()
        
        const desc = `новый Дневной долг от ${worker}`
        events.emit('dayDebts.created', price, date, worker, desc)
        await deleteCache('day_debts_list')

        events.emit('day.debts.cr',newDayDebt._id, worker, price)
        return {
            status: 201,
            message: 'Day debt created successfully',
            data: JSON.parse(JSON.stringify(newDayDebt)),
        }
    } catch (error) {
        console.error(error)
    }
}

module.exports.listDayDebts = async (event, args) => {
    try {
        const { worker, startDate, endDate } = args

        const filters = {}
        if (worker) filters.worker = worker
        if (startDate && endDate) {
            filters.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
            }
        }

        const cachedDayDebts = await getCache('day_debts_list')
        if (cachedDayDebts) {
            return {
                status: 200,
                message: 'Day debts retrieved from cache',
                data: cachedDayDebts,
            }
        }

        const dayDebts = await dayDebtsModel.find(filters).sort({ date: -1 })
        
        await setCache('day_debts_list', dayDebts, 3600)
        return {
            status: 200,
            message: 'Day debts retrieved successfully',
            data: JSON.parse(JSON.stringify(dayDebts)),
        }
    } catch (error) {
        console.error(error)
    }
}

module.exports.updateDayDebts = async (event, args) => {
    try {
        const { id, reason, date, price, description, worker } = args;
        const dayDebt = await dayDebtsModel.findById(id)

        if (!dayDebt) {
            return handleError(404, 'Дневной долг не найден', null);
        }
        
        if (dayDebt.price !== price && price > 0 ) {
            await DayDebtsDeleted(id)
            let tt = 0
            if(dayDebt.price > price) {
                tt  = dayDebt.price - price
            }
            if(price > dayDebt.price) {
                tt = price - dayDebt.price
            }

            const allDec = await allDecrementModel.findById(allDecrements)
            if(!allDec) {
                return {
                    message: 'FDKFJKSJDSKDS'
                }
            }

            dayDebt.price = price;
            dayDebt.reason = reason || dayDebt.reason;
            dayDebt.description = description || dayDebt.description;
            dayDebt.worker = worker || dayDebt.worker;
            await dayDebt.save();

            await DayDebtsCreated(
                id,
                `Дневной долг от ${dayDebt.worker} на ${dayDebt.price}`,
                price,
                date || Date.now()
            );

            allDec.totalDecrement += tt
            await allDec.save()
            await deleteCache('day_debts_list');

            const desc = `новый Дневной долг от ${worker}`;
            events.emit('dayDebts.created', price, date, worker, desc);

            return {
                status: 200,
                message: 'Дневной долг успешно обновлен',
                data: JSON.parse(JSON.stringify(dayDebt)),
            };
        } else {
            dayDebt.reason = reason || dayDebt.reason;
            dayDebt.description = description || dayDebt.description;
            dayDebt.worker = worker || dayDebt.worker;

            await dayDebt.save();

            const desc = `новый Дневной долг от ${worker}`;
            events.emit('dayDebts.created', price, date, worker, desc);

            await deleteCache('day_debts_list');

            return {
                status: 200,
                message: 'Дневной долг успешно обновлен',
                data: JSON.parse(JSON.stringify(dayDebt)),
            };
        }
    } catch (error) {
        console.error(error);
    }
};

module.exports.deleteDayDebts = async (event, args) => {
    try {
        const { id } = args
        const dayDebt = await dayDebtsModel.findById(id)
        await dayDebtsModel.deleteOne({ _id: id })
        await DayDebtsDeleted(id)
        
        const allDec = await allDecrementModel.findById(allDecrements)
            if(!allDec) {
                return {
                    message: 'FDKFJKSJDSKDS'
                }
            }

            allDec.totalDecrement += dayDebt.price
            await allDec.save()

        const desc = `Дневной долг от ${dayDebt.worker}`

        events.emit('dayDebts.deleted', dayDebt.price, Date.now(), dayDebt.worker, desc)

        await deleteCache('day_debts_list')

        return {
            status: 200,
            message: 'Day debt deleted successfully',
            data: null,
        }
    } catch (error) {
        console.error(error)
    }
}
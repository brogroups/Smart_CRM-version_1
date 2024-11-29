const FirmaModel = require('../../models/firma/firma.model');
const {
    updateStatisticsForFirma,
} = require('../../global/helpers/statistic.helper');
require('../../events/notification.event')
const {events} = require('../../events/index')
const {
    getCache,
    setCache,
    deleteCache,
} = require('../../global/helpers/redis.helper');
const PayedModel = require('../../models/firma/payed.model');
const salesProductModel = require('../../models/firma/sales-product.model');

module.exports.createFirma = async (res, args) => {
    try {
        const {
            firma,
            manager,
            phone,
            email,
            moneyType,
            address,
            date,
            debts,
        } = args;
        const newFirma = new FirmaModel({
            firma,
            manager: manager || '',
            phone: phone || '',
            email: email || '',
            paymentMethod: moneyType,
            address,
            date,
            debts,
        });

        await newFirma.save();
        await updateStatisticsForFirma(debts, true);

        const desc = `Фирма ${newFirma.firma} создана с начальным долгом ${newFirma.debts}`
        events.emit('firma.created', Date.now(), newFirma.debts, desc)

        await deleteCache('firma_list');
        return {
            status: 201,
            message: 'Фирма создана успешно',
            data: JSON.parse(JSON.stringify(newFirma)),
        };
    } catch (error) {
        console.error(error);
        return {
            status: 500,
            error: error.message,
            args: null,
        };
    }
};

module.exports.listFirma = async (res, args) => {
    try {
        const cachedFirms = await getCache('firma_list');
        if (cachedFirms) {
            return {
                status: 200,
                message: 'Firms retrieved from cache',
                data: cachedFirms,
            };
        }

        const firms = await FirmaModel.find({isDeleted: false})
            .populate('saleProducts')
            .populate('payments')
            .lean();

        await setCache('firma_list', firms, 3600);

        return {
            status: 200,
            message: 'Firms retrieved from database',
            data: JSON.parse(JSON.stringify(firms)),
        };
    } catch (error) {
        console.error(error);
        return {
            status: 500,
            error: error.message,
            args: null,
        };
    }
};

module.exports.oneFirma = async(res,args) => {
    try {
        const {id} = args
        const firma = await FirmaModel.findById(id).populate('saleProducts').populate('payments')
        if(!firma) {
            return {
                status: 404,
                error: 'Фирма не найдена'
            }
        }


        return{
            status:200,
            data:JSON.parse(JSON.stringify(firma))
        }
    } catch (error) {
        console.error(error);
        return {
            status: 500,
            error: error.message,
            args: null,
        };
    }
}

module.exports.updateFirma = async (res, args) => {
    try {
        const { id, firma, manager, phone, email, moneyType, address, debts } = args;

        const existingFirma = await FirmaModel.findById(id);
        if (!existingFirma) {
            return {
                status: 404,
                error: 'Фирма не найдена',
                args: null,
            };
        }

        const originalDebts = existingFirma.debts;

        existingFirma.firma = firma || existingFirma.firma;
        existingFirma.manager = manager || existingFirma.manager;
        existingFirma.phone = phone || existingFirma.phone;
        existingFirma.email = email || existingFirma.email;
        existingFirma.paymentMethod = moneyType || existingFirma.paymentMethod;
        existingFirma.address = address || existingFirma.address;

        if (debts !== undefined && debts !== originalDebts) {
            await updateStatisticsForFirma(originalDebts, false);
            existingFirma.debts = debts;
            await updateStatisticsForFirma(debts, true);
        }
        await existingFirma.save();

        await deleteCache('firma_list');
        return {
            status: 200,
            message: 'Firma успешно обновлена',
            data: JSON.parse(JSON.stringify(existingFirma)),
        };
    } catch (error) {
        console.error(error);
        return {
            status: 500,
            error: error.message,
            args: null,
        };
    }
};

module.exports.deleteFirma = async (event, args) => {
    try {
        const { id } = args;

        const firma = await FirmaModel.findById(id);
        if (!firma) {
            return {
                status: 404,
                error: 'Фирма не найдена',
                args: null,
            };
        }

        await updateStatisticsForFirma(firma.debts, false);
        firma.isDeleted = true
        await firma.save()

        await PayedModel.deleteMany({firmaId: firma._id})
        await salesProductModel.deleteMany({firmaId: firma._id})

         const desc = `Фирма ${firma.firma} удален`
        events.emit('firma.deleted', Date.now(), desc)

        await deleteCache('firma_list');
        return {
            status: 200,
            message: 'Фирма успешно удалена',
        };
    } catch (error) {
        console.error(error);
        return {
            status: 500,
            error: error.message,
            args: null,
        };
    }
};
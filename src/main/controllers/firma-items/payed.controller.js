const PayedModel = require('../../models/firma/payed.model');
const FirmaModel = require('../../models/firma/firma.model');
const { events } = require('../../events');
require('../../events/notification.event');
require('../../global/helpers/all-decrement.helper')
const {
    updateStatisticsForFirma,
} = require('../../global/helpers/statistic.helper');
const {
    deleteCache,
    setCache,
    getCache,
} = require('../../global/helpers/redis.helper');
const { FirmPaymentCreated, FirmPaymentDeleted } = require('../../global/helpers/all-decrement.helper');

module.exports.createPayment = async(res, args) => {
    try {
        const { firmaId, amount, paymentDate, paymentMethod, comment } = args;

        const firma = await FirmaModel.findById(firmaId).populate('payments');
        if (!firma) {
            return {
                status: 404,
                error: 'Firma not found',
                args: null,
            };
        }

        const newPayment = new PayedModel({
            firmaId,
            amount,
            comment,
            paymentDate,
            paymentMethod,
        });
        await newPayment.save();

        firma.payments.push(newPayment._id);
        firma.debts -= amount;
        await firma.save();

        const total = firma.debts + amount
        await updateStatisticsForFirma(total, false);
        await updateStatisticsForFirma(firma.debts, true);

        const desc = `Новый платеж ${firma.firma}`;
        events.emit('payment.created', amount, Date.now(), desc);

        events.emit('firma.payment.created', firma._id, `Новый платеж фирме ${firma.firma}`,amount, Date.now())

        await deleteCache('payment_list');
        await deleteCache('firma_list');
        return {
            status: 201,
            message: 'Payment created successfully',
            data: JSON.parse(JSON.stringify(newPayment)),
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

module.exports.listPayment = async (res, args) => {
    try {
        const cachedPayments = await getCache('payment_list');
        if (cachedPayments) {
            return {
                status: 200,
                message: 'Payments retrieved from cache',
                data: cachedPayments,
            };
        }

        const payments = await PayedModel.find({}).lean();
        await setCache('payment_list', payments, 3600);

        const response = await Promise.all(
            payments.map(async (payment) => {
                const firma = await FirmaModel.findById(payment.firmaId);
                return {
                    firmaName: firma.firma,
                    method: payment.paymentMethod,
                    date: payment.paymentDate,
                    cash: payment.amount,
                    comment: payment.comment
                };
            })
        );

        return {
            status: 200,
            message: 'Payments retrieved from database',
            data: JSON.parse(JSON.stringify(payments)),
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

module.exports.updatePayment = async (event, args) => {
    try {
        const { id, firmaId, amount, paymentDate, paymentMethod, comment } = args;
        const payment = await getPaymentById(id);
        if (!payment) {
            return {
                status: 404,
                error: 'Payment not found',
                args: null,
            };
        }

        const oldAmount = payment.amount;
        const firma = await FirmaModel.findById(payment.firmaId);
        if (!firma) {
            return {
                status: 404,
                error: 'Firma not found',
                args: null,
            };
        }

        payment.paymentDate = paymentDate || payment.paymentDate;
        payment.paymentMethod = paymentMethod || payment.paymentMethod;
        payment.comment = comment || payment.comment;
        payment.amount = amount || payment.amount;

        if (firmaId && firmaId !== '') {
            payment.firmaId = firmaId;
            await payment.save();

            const newFirma = await FirmaModel.findById(firmaId);
            if (!newFirma) {
                return {
                    status: 404,
                    error: 'Firma not found by this ID',
                    args: null,
                };
            }

            firma.debts += payment.amount;
            firma.payments.pull(payment._id);
            await firma.save();

            await updateStatisticsForFirma(firma.debts + oldAmount, true);
            await updateStatisticsForFirma(firma.debts, false);

            newFirma.payments.push(payment._id);
            newFirma.debts -= payment.amount;
            await newFirma.save();
        }

        await payment.save();

        if (amount > 0) {
            firma.debts += oldAmount;
            await firma.save();

            await updateStatisticsForFirma(oldAmount, true);
            await updateStatisticsForFirma(amount, false);
            firma.debts -= amount;
            await firma.save();
        }

        await deleteCache('payment_list');
        await deleteCache('firma_list');

        return {
            status: 200,
            message: 'Payment updated successfully',
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

module.exports.deletePayment = async (event, args) => {
    try {
        const { id } = args;
        const payment = await getPaymentById(id);
        if (!payment) {
            return {
                status: 404,
                error: 'Payment not found',
                args: null,
            };
        }

        const firma = await FirmaModel.findById(payment.firmaId);
        if (!firma) {
            return {
                status: 404,
                error: 'Фирма не найдена',
                args: null,
            };
        }

        firma.debts += payment.amount;
        firma.payments.pull(payment._id);
        await firma.save();

        await updateStatisticsForFirma(payment.amount, true);
        events.emit('firma.payment.deleted', firma._id)

        await PayedModel.deleteOne({ _id: id });

        events.emit('payment.rm', payment.id, payment.amount)
        const desc = `Платеж удален за ${firma.firma}`;
        events.emit('payment.deleted', payment.amount, new Date(), desc);

        await deleteCache('payment_list');
        await deleteCache('firma_list');

        return {
            status: 200,
            message: 'Платеж успешно удален',
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

const getPaymentById = async (id) => {
    try {
        const payment = await PayedModel.findById(id);
        if (!payment) {
            return null;
        }
        return payment;
    } catch (error) {
        console.log(error);
        return null;
    }
};

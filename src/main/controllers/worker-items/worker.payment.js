const { deleteCache } = require('../../global/helpers/redis.helper')
const {events} = require('../../events/index')
require('../../global/helpers/all-decrement.helper')
require('../../events/notification.event')
// const workerHistoryModel = require('@/main/models/worker/worker-history.
const WorkerModel = require('../../models/worker/worker.model')
const WorkerPayedModel = require('../../models/worker/worker.payment.model')

module.exports.createWorkerPayment = async(res,args) => {
    try {
        const {amount, date, workerId, comment,status} = args
        console.log(amount, date, workerId, comment, status)
        const worker = await WorkerModel.findById(workerId).populate('payments')
        if(!worker) {return {status: 404, error: 'Worker not found'}}

        const payment = new WorkerPayedModel({
            amount,
            paymentDate: date || Date.now(),
            comment,
            workerId,
            status
        })
        await payment.save()

        worker.payments.push(payment.id)
        worker.totalCash -= amount
        await worker.save()

        const desc = `новая оплата для работника ${worker.name}`
        events.emit('worker.paymnet', Date.now(), payment.amount, desc)
        events.emit('worker.payment.create.st', worker.id, `оплата для работника была создана ${worker.name}`, amount, payment.id, date)

        await deleteCache('worker_list');
        return {
            status: 200,
            data: JSON.parse(JSON.stringify(payment))
        }
    } catch (error) {
        console.error(error);
    }
}


module.exports.listWorkerPayments = async() => {
    try {
        const payments = await WorkerPayedModel.find({}).lean()

        const response = await Promise.all(
            payments.map(async (payment) => {
                const firma = await WorkerModel.findById(payment.workerId);
                return {
                    workerName: firma.firma,
                    date: payment.paymentDate,
                    cash: payment.amount,
                    comment: payment.comment
                };
            })
        );

        return {
            status: 200,
            data: JSON.parse(JSON.stringify(response))
        }

    } catch (error) {
        console.error(error);
        return handleError(res, 500, 'Server error');
    }
}

module.exports.oneWorkerPayments = async(args) => {
    try {
        const {workerId} = args
        const payments = await WorkerPayedModel.find({workerId}).lean()

        const response = await Promise.all(
            payments.map(async (payment) => {
                const firma = await WorkerModel.findById(payment.workerId);
                return {
                    workerName: firma.firma,
                    date: payment.paymentDate,
                    cash: payment.amount,
                    comment: payment.comment
                };
            })
        );

        return {
            status: 200,
            data: JSON.parse(JSON.stringify(response))
        }
        } catch (error) {
        console.error(error);
        return handleError(res, 500, 'Server error');
    }
}


module.exports.updateWorkerPayment = async(args) =>{ 
    try {
        const {id, workerId, amount, date, comment} = args

        const isWorker = await WorkerModel.findById(workerId)
    if(!isWorker) {
        return {
            status: 404,
            error: 'Worker not found'
        }
    }

    const workerPayment = await WorkerPayedModel.findById(id)
    if(!workerPayment) {
        return {
            status: 404,
            error: 'Worker payment not foound'
        }
    }

    workerPayment.amount = amount || workerPayment.amount,
    workerPayment.paymentDate = date ||  workerPayment.paymentDate,
    workerPayment.comment = comment || workerPayment.comment,
    workerPayment.workerId = workerId || workerPayment.workerId

    await workerPayment.save()
    return {
        status: 200,
        data: JSON.parse(JSON.stringify(workerPayment))
    }
    } catch (error) {
        console.error(error);
        return handleError(res, 500, 'Server error');
    }
}

module.exports.delateWorkerPayment = async(args) =>{ 
    try {
        const {id} = args

        await WorkerPayedModel.findByIdAndDelete(id)
         
        events.on('worker.payment.deleted.st' ,worker.id, `оплата для работника была создана ${worker.name}`, amount, payment.id)

        const desc = `оплата для работника ${worker.name} удален`
        events.emit('worker.deleted', Date.now(), payment.amount, desc)


        await deleteCache('worker_list');
        return {
            status: 200,
            error: null,
            msg: 'Success'
        }
    } catch (error) {
        console.error(error);
        return handleError(res, 500, 'Server error');
    }
}
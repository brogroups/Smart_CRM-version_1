const workerHistoryModel = require('../../models/worker/worker-history.model');
const WorkerModel = require('../../models/worker/worker.model');
const { event } = require('../../events');
const OrderModel = require('../../models/order/order.model');
require('../../events/notification.event');
const {
    setCache,
    getCache,
    deleteCache,
} = require('../../global/helpers/redis.helper');

module.exports.createWorkerHistory = async (req, res) => {
    try {
        const { workerName, productName, summa, workerId, productId } = res;

        const worker = await WorkerModel.findById(workerId);
        const product = await OrderModel.findById(productId);

        if (!worker || !product) {
            return {
                status: 404,
                message: 'Worker or Product not found',
                data: null,
            };
        }

        const newWorkerHistory = new workerHistoryModel({
            workerName,
            productName,
            summa,
            workerId,
            productId,
        });

        worker.history.push(newWorkerHistory._id);
        await worker.save();

        await newWorkerHistory.save();

        const desc = `работник ${workerName} для продукта ${productName}`;
        event.emit('workerHistory.created', summa, Date.now(), desc);

        await deleteCache('worker_history_list');
        await setCache('worker_list', workers, 3600);
        return {
            status: 201,
            message: 'Worker History created successfully',
            data: newWorkerHistory,
        };
    } catch (error) {
        console.error(error);
    }
};

module.exports.listWorkerHistories = async (req, res) => {
    try {
        const { id } = res;

        const cachedHistory = await getCache(`worker_history_${id}`);
        if (cachedHistory) {
            return {
                status: 200,
                message: 'Worker history retrieved from cache',
                data: cachedHistory,
            };
        }

        const workerHistory = await workerHistoryModel
            .find({ workerId: id })
            .populate('productId');

        if (!workerHistory.length) {
            return {
                status: 404,
                message: 'No history found for this worker',
                data: null,
            };
        }

        await setCache(`worker_history_${id}`, workerHistory, 3600);

        return {
            status: 200,
            message: 'Worker history retrieved successfully',
            data: workerHistory,
        };
    } catch (error) {
        console.error(error);
    }
};

module.exports.updateWorkerHistory = async (req, res) => {
    try {
        const { id, workerName, productName, summa, workerId, productId } = res;

        const workerHistory = await workerHistoryModel.findById(id);

        if (!workerHistory) {
            return {
                status: 404,
                message: 'Worker History not found',
                data: null,
            };
        }

        workerHistory.workerName = workerName || workerHistory.workerName;
        workerHistory.productName = productName || workerHistory.productName;
        workerHistory.summa = summa || workerHistory.summa;
        workerHistory.workerId = workerId || workerHistory.workerId;
        workerHistory.productId = productId || workerHistory.productId;

        await workerHistory.save();

        await deleteCache(`worker_history_${workerHistory.workerId}`);
        await deleteCache('worker_history_list');

        return {
            status: 200,
            message: 'Worker History updated successfully',
            data: workerHistory,
        };
    } catch (error) {
        console.error(error);
    }
};

module.exports.deleteWorkerHistory = async (req, res) => {
    try {
        const { id } = res;
        const workerHistory = await getById(id);

        await WorkerModel.updateOne(
            { _id: workerHistory.workerId },
            { $pull: { history: workerHistory._id } }
        );

        const desc = `История работника`;
        event.emit('workerHistory.deleted', Date.now(), desc);

        await workerHistoryModel.deleteOne({ _id: id });

        await deleteCache(`worker_history_${workerHistory.workerId}`);
        await deleteCache('worker_history_list');

        return {
            status: 200,
            message: 'Worker History deleted successfully',
            data: null,
        };
    } catch (error) {
        console.error(error);
    }
};

const getById = async (id) => {
    try {
        const workerHistory = await workerHistoryModel.findById(id);
        if (!workerHistory) {
            return {
                status: 404,
                message: 'Worker History not found',
                data: null,
            };
        }
        return workerHistory;
    } catch (error) {
        console.error(error);
    }
};

const { events } = require('../../events');
const WorkerModel = require('../../models/worker/worker.model');
require('../../events/notification.event');
const {
    setCache,
    getCache,
    deleteCache,
} = require('../../global/helpers/redis.helper');
const checkWorkerPayments = require('../../config/worker.payment');

module.exports.createWorker = async (args,res) => {
    try {
        const { name, summaType,totalCash, price, percent } = res;

        const newWorker = new WorkerModel({
            name,
            summaType,
            price: price || 0,
            percent: percent || 0,
            totalCash:totalCash||0
        });

        await newWorker.save();

        const desc = `Работник ${name} создан`;
        events.emit('worker.created', new Date(), desc);

        await deleteCache('worker_list');
        return {
            status: 201,
            message: "Worker created successfully",
            data: JSON.parse(JSON.stringify(newWorker))
        };
    } catch (error) {
        console.error(error);
    }
}

module.exports.listWorkers = async (res, req) => {
    try {
        await checkWorkerPayments()
        const cachedWorkers = await getCache('worker_list');
        if (cachedWorkers) {
            return {
                status: 200,
                message: "Workers retrieved from cache",
                data: JSON.parse(JSON.stringify(cachedWorkers))
            };
        }

        const workers = await WorkerModel.find()
        .populate([
            'history',
            'comments',
            'shtrafs',
            'payments'
        ])
        console.log(workers)
        await setCache('worker_list', workers, 3600);
        return {
            status: 200,
            message: "Workers retrieved from database",
            data: JSON.parse(JSON.stringify( workers ))
        };
    } catch (error) {
        console.error(error);
    }
}

module.exports.oneWorker = async (req, res) => {
    try {
        const { id } = res;
        await checkWorkerPayments()

        const worker = await WorkerModel.findById(id).populate([
            'history',
            'comments',
            'shtrafs',
            'payments'
        ]);
        if (!worker) {
            return {
                status: 404,
                message: 'Worker not found',
                data: null
            };
        }

        return {
            status: 200,
            message: "Worker retrieved successfully",
            data: JSON.parse(JSON.stringify(worker))
        };
    } catch (error) {
        console.error(error);
    }
}

module.exports.updateWorker = async (req, res) => {
    try {
        const { id, name, summaType, price, percent, active, history } = res
        const worker = await findWorkerById(id);

        if (!worker) {
            return {
                status: 404,
                message: 'Worker not found',
                data: null
            };
        }

        worker.name = name || worker.name;
        worker.summaType = summaType || worker.summaType;
        worker.price = price !== undefined ? price : worker.price;
        worker.percent = percent !== undefined ? percent : worker.percent;
        worker.active = active !== undefined ? active : worker.active;
        worker.history = history || worker.history;

        await worker.save();

        await deleteCache(`worker_${id}`);
        await deleteCache('worker_list');

        return {
            status: 200,
            message: "Worker updated successfully",
            data: JSON.parse(JSON.stringify(worker))
        };
    } catch (error) {
        console.error(error);
    }
}

module.exports.deleteWorker = async (req, res) => {
    try {
        const { id } = res;

        const worker = await findWorkerById(id);
        
        if (!worker) {
            return {
                status: 404,
                message: 'Worker not found',
                data: null
            };
        }

        const desc = `Работник ${worker.name}`;
        events.emit('worker.deleted', new Date(), desc);

        await WorkerModel.deleteOne({ _id: id });

        await deleteCache(`worker_${id}`);
        await deleteCache('worker_list');

        return {
            status: 200,
            message: 'Worker deleted successfully',
            data: null
        };
    } catch (error) {
        console.error(error);
    }
}

const findWorkerById = async (id) => {
    try {
        const worker = await WorkerModel.findById(id);
        if (!worker) {
            return null; 
        }
        return worker;
    } catch (error) {
        console.error(error);
    }
}

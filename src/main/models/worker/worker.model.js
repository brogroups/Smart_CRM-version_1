const mongoose = require('mongoose')

const Worker = new mongoose.Schema({
    name: { type: String, required: true },
    summaType: { type: String, required: true },
    totalCash: { type: Number, default: 0 },
    price: { type: Number, default: 0 },
    percent: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
    createdAt: {type: Date, default: Date.now()},
    history: [{ type: mongoose.Schema.Types.ObjectId, ref: 'workerHistory' }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'workerComment' }],
    shtrafs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ShtrafItem' }],
    payments:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'WorkerPayed' }],
})

const WorkerModel = mongoose.model('Worker', Worker)
module.exports = WorkerModel

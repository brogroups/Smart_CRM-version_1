const mongoose = require('mongoose')

const Payed = new mongoose.Schema({
    amount: { type: Number, required: true, default: true },
    paymentDate: { type: Date, required: true },
    comment: { type: String, required: true },
    status:{
        type:String,
        default:"Avans"        
    },
    workerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Worker',
        required: true,
    },
})

const WorkerPayedModel = mongoose.model('WorkerPayed', Payed)
module.exports = WorkerPayedModel

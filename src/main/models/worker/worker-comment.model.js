const mongoose = require('mongoose')

const workerComment = new mongoose.Schema({
    comment: { type: String, required: true },
    date: { type: Date, require: true },
    workerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Worker',
        required: true,
    },
})

const workerCommentModel = mongoose.model('workerComment', workerComment)
module.exports = workerCommentModel

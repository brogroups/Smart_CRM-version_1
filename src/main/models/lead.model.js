const mongoose = require('mongoose')

const Lead = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, unique: true },
    email: { type: String, unique: true },
    address: { type: String, required: true },
    comment: { type: String, required: true },
})

const LeadModel = mongoose.model('Lead', Lead)
module.exports = LeadModel

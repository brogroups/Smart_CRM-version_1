const mongoose = require('mongoose');


const dayItem = new mongoose.Schema({
    section: { type: String, required: true },
    title: { type: String, required: true },
    cash: { type: Number, default: 0 },
    date: { type: Date, default: Date.now() },
    invalidId: { type: String },
    firmaId: {type: String},
    paymentId: {type: String},
    dayId: {type: String},
    orderId: {type: String},
    parentId: { type: mongoose.Schema.Types.ObjectId, refPath: 'parentType', required: true }, 
    parentType: { type: String, enum: ['DayIncrements', 'DayDecrements'], required: true },
});

const dayIncrementsContainer = new mongoose.Schema({
    totalIncrements: { type: Number, default: 0 },
    itemsCount: { type: Number, default: 0 },
    items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'DayItem' }],
    statisticId: { type: mongoose.Schema.Types.ObjectId, ref: 'Statistic' },
});

const dayDecrementsContainer = new mongoose.Schema({
    totalDecrements: { type: Number, default: 0 }, 
    itemsCount: { type: Number, default: 0 },
    items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'DayItem' }],
    statisticId: { type: mongoose.Schema.Types.ObjectId, ref: 'Statistic' },
});

const DayItemModel = mongoose.model('DayItem', dayItem);
const DayIncrementsModel = mongoose.model('DayIncrements', dayIncrementsContainer);
const DayDecrementsModel = mongoose.model('DayDecrements', dayDecrementsContainer);

module.exports = { DayItemModel, DayIncrementsModel, DayDecrementsModel };

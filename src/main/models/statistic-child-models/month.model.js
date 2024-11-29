const mongoose = require('mongoose');


const monthItem = new mongoose.Schema({
    section: { type: String, required: true },
    title: { type: String, required: true },
    cash: { type: Number, default: 0 },
    date: { type: Date, default: Date.now() },
    orderId: { type: String },
    paymentId: {type: String},
    invalidId: { type: String },
    firmaId: {type: String},
    dayId: {type: String},
    parentId: { type: mongoose.Schema.Types.ObjectId, refPath: 'parentType', required: true }, 
    parentType: { type: String, enum: ['MonthIncrements', 'MonthDecrements'], required: true },
});

const monthIncrementsContainer = new mongoose.Schema({
    totalIncrements: { type: Number, default: 0 },
    itemsCount: { type: Number, default: 0 },
    items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MonthItem' }],
    statisticId: { type: mongoose.Schema.Types.ObjectId, ref: 'Statistic' },
});

const monthDecrementsContainer = new mongoose.Schema({
    totalDecrements: { type: Number, default: 0 },
    itemsCount: { type: Number, default: 0 },
    items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MonthItem' }],
    statisticId: { type: mongoose.Schema.Types.ObjectId, ref: 'Statistic' },
});

const MonthItemModel = mongoose.model('MonthItem', monthItem);
const MonthIncrementsModel = mongoose.model('MonthIncrements', monthIncrementsContainer);
const MonthDecrementsModel = mongoose.model('MonthDecrements', monthDecrementsContainer);

module.exports = { MonthItemModel, MonthIncrementsModel, MonthDecrementsModel };

const { DayItemModel } = require("../models/statistic-child-models/day.model");

module.exports.listDayDecrements = async (event, args) => {
    try {
        const targetDate = args.date ? new Date(args.date) : new Date();
        const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

        const items = await DayItemModel.find({
            parentType: 'DayDecrements',
            date: { $gte: startOfDay, $lte: endOfDay },
        });

        const totalDecrements = items.reduce((sum, item) => sum + item.cash, 0);

        return {
            status: 200,
            totalDecrements: totalDecrements,
            itemsCount: items.length,
            items: items,
        };
    } catch (error) {
        console.log(error);
        return {
            status: 500,
            error: 'Error fetching Day Decrements',
        };
    }
};

module.exports.listDayIncrements = async(event, args) => {
    try {
        const targetDate = args.date ? new Date(args.date) : new Date();
        const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

        const items = await DayItemModel.find({
            parentType: 'DayIncrements',
            date: { $gte: startOfDay, $lte: endOfDay },
        });

        const totalIncrements = items.reduce((sum, item) => sum + item.cash, 0);

        return {
            status: 200,
            totalIncrements: totalIncrements,
            itemsCount: items.length,
            items: items,
        };
    } catch (error) {
        console.log(error);
        return {
            status: 500,
            error: 'Error fetching Day Decrements',
        };
    }
}
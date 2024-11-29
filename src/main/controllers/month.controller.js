const { MonthItemModel } = require("../models/statistic-child-models/month.model");

module.exports.listMonthDecrements = async(event, args) => {
    try {
        const targetDate = args.date ? new Date(args.date) : new Date();
        const startOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1); 
        const endOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0, 23, 59, 59, 999);
        
        const items = await MonthItemModel.find({
            parentType: 'MonthDecrements',
            date: { $gte: startOfMonth, $lte: endOfMonth },
        });

        const totalDecrements = items.reduce((sum, item) => sum + item.cash, 0);

        return {
            status: 200,
            itemsCount: items.length,
            totalDecrements: totalDecrements,
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

module.exports.listMonthIncrements = async(event, args) => {
    try {
        const targetDate = args.date ? new Date(args.date) : new Date();
        const startOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1); 
        const endOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0, 23, 59, 59, 999);
        
        const items = await MonthItemModel.find({
            parentType: 'MonthIncrements',
            date: { $gte: startOfMonth, $lte: endOfMonth },
        });

        const totalIncrements = items.reduce((sum, item) => sum + item.cash, 0);

        return {
            status: 200,
            itemsCount: items.length,
            totalIncrements: totalIncrements,
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

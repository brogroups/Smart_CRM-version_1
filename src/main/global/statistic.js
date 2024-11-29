const { statisticId } = require('../config')
const StatisticModel = require('../models/statistic.model')

module.exports.statisticItem = async () => {
    try {
        const statistic = await StatisticModel.findById(statisticId)
        return statistic
    } catch (error) {
        console.log(error)
    }
}

const { redis } = require('../../config/redis.config')

const setCache = async (key, value, ttl = 3600) => {
    try {
        await redis.setex(key, ttl, JSON.stringify(value))
    } catch (error) {
        console.error('Error setting cache:', error)
    }
}

const getCache = async (key) => {
    try {
        const cachedValue = await redis.get(key)
        return cachedValue ? JSON.parse(cachedValue) : null
    } catch (error) {
        console.error('Error getting cache:', error)
        return null
    }
}

const deleteCache = async (key) => {
    try {
        await redis.del(key)
    } catch (error) {
        console.error('Error deleting cache:', error)
    }
}

module.exports = {
    setCache,
    getCache,
    deleteCache,
}

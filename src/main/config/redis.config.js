const Redis = require('ioredis')

module.exports.redis = new Redis({
    // host: 'localhost',
    host: 'redis-11238.c228.us-central1-1.gce.redns.redis-cloud.com',
    port: 11238,
    // password: '1234',
    password: 'mmsEGVi8JYK554f3UJ40sdXBugDeWShx'
})

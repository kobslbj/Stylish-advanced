const { pool } = require('../server/models/mysqlcon')
const Redis = require('ioredis')

const redis = new Redis({
    host: '127.0.0.1',
    port: 6379,
    password: ''
});

redis.on("error", function (error) {
    console.error(error);
});


const resetSecKill = async () => {
    await redis.flushall();
    await pool.query("DELETE FROM seckillproduct");
    await pool.query("DELETE FROM orderlist");
}


(async () => {
    await resetSecKill();
    console.log("Reset successfully!");
    process.exit();
})();

const { pool } = require('./mysqlcon');
const got = require('got');

const getWinUsers = async (productId) => {
    try {
        const [orderData] = await pool.query(`SELECT COUNT(*) qty, user_id FROM orderlist WHERE product_id = ? GROUP BY user_id`, [productId]);
        const [productImage] = await pool.query(`SELECT main_image productImage FROM product WHERE id = ?`, [productId]);
        if (orderData && orderData.length > 0) {
            const userIds = orderData.map(order => order.user_id);
            let [users] = await pool.query(`SELECT id, picture userPicture, name userName FROM user WHERE id IN (?)`, [userIds]);
            console.log(users);
            users = users.sort((a, b) => {
                return userIds.indexOf(a.id) - userIds.indexOf(b.id);
            });

            for (let i = 0; i < orderData.length; i++) {
                orderData[i].productImage = productImage[0].productImage;
                orderData[i].userPicture = users[i].userPicture;
                orderData[i].userName = users[i].userName;
            }

            return orderData;
        } else {
            return [];
        }
    } catch (error) {
        console.log(error);
        return { error };
    }
}

const createOrder = async (order) => {
    const [result] = await pool.query('INSERT INTO order_table SET ?', order);
    return result.insertId;
};

const createPayment = async function (orderId, payment) {
    const conn = await pool.getConnection();
    try {
        await conn.query('START TRANSACTION');
        await conn.query('INSERT INTO payment SET ?', payment);
        await conn.query('UPDATE order_table SET status = ? WHERE id = ?', [0, orderId]);
        await conn.query('COMMIT');
        return true;
    } catch (error) {
        await conn.query('ROLLBACK');
        return { error };
    } finally {
        conn.release();
    }
};

const payOrderByPrime = async function (tappayKey, tappayId, prime, order) {
    let res = await got.post('https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime', {
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': tappayKey
        },
        json: {
            'prime': prime,
            'partner_key': tappayKey,
            'merchant_id': tappayId,
            'details': 'Stylish Payment',
            'amount': order.total,
            'cardholder': {
                'phone_number': order.recipient.phone,
                'name': order.recipient.name,
                'email': order.recipient.email
            },
            'remember': false
        },
        responseType: 'json'
    });
    return res.body;
};

const getUserHistory = async (userId) => {
    const [orders] = await pool.query(`
    SELECT number, status, time, total, details
    FROM order_table 
    JOIN user on order_table.user_id = user.id
    WHERE user.id = ?`, [userId]);

    if (!orders) {
        return null;
    }

    if (orders.length === 0) {
        return [];
    }

    const products = orders.map(order => {
        return order.details.list.map(item => item.id);
    });

    const [main_images] = await pool.query(`
    SELECT main_image
    FROM product
    WHERE id IN (?)`, [products.flat()]);

    orders.forEach((order, index) => {
        order.details.list.forEach((item, index) => {
            item.main_image = main_images[index].main_image;
        });

    })

    return orders;

}

const getUserPayments = async () => {
    const [orders] = await pool.query('SELECT user_id, total FROM order_table');
    return orders;
};

const getUserPaymentsGroupByDB = async () => {
    const [orders] = await pool.query('SELECT user_id, SUM(total) as total_payment FROM order_table GROUP BY user_id');
    return orders;
};

module.exports = {
    createOrder,
    createPayment,
    payOrderByPrime,
    getUserPayments,
    getUserPaymentsGroupByDB,
    getUserHistory,
    getWinUsers,
};
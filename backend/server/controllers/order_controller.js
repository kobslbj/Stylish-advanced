require('dotenv').config();
const validator = require('validator');
const {TAPPAY_PARTNER_KEY, TAPPAY_MERCHANT_ID} = process.env;
const Order = require('../models/order_model');
const util = require('../../util/util');

const getWinUsers = async (req, res) => {
    if (!req.query || !req.query.id) {
        res.status(400).send({error: 'Id is required'});
        return;
    }

    const productId = req.query.id;
    const data = await Order.getWinUsers(productId);

    data.forEach(d => {
        d.productImage = util.getImagePath(req.protocol, req.hostname, productId) + d.productImage;
        d.userPicture = util.getUserImagePath(req.protocol, req.hostname, d.user_id) + d.userPicture;
    });
    
    if (data.error) {
        res.status(500).send({error: "Database Query Error"});
    } else {
        res.status(200).send({data});
    }
};

// 訂單紀錄
const checkout = async (req, res) => {
    const data = req.body;
	if (!data.order || !data.order.total || !data.order.list || !data.prime) {
        res.status(400).send({error:'Create Order Error: Wrong Data Format'});
		return;
	}
    const user = req.user;
    const now = new Date();
    const number = '' + now.getMonth() + now.getDate() + (now.getTime()%(24*60*60*1000)) + Math.floor(Math.random()*10);
    const orderRecord = {
        number: number,
        time: now.getTime(),
        status: -1, // -1 for init (not pay yet)
        total: data.order.total,
        details: validator.blacklist(JSON.stringify(data.order), '<>')
    };
    orderRecord.user_id = (user && user.id) ? user.id : null;
    const orderId = await Order.createOrder(orderRecord);
    let paymentResult;
    try {
        paymentResult = await Order.payOrderByPrime(TAPPAY_PARTNER_KEY, TAPPAY_MERCHANT_ID, data.prime, data.order);
        if (paymentResult.status != 0) {
            res.status(400).send({error: 'Invalid prime'});
            return;
        }
    } catch (error) {
        res.status(400).send({error});
        return;
    }
    const payment = {
        order_id: orderId,
        details: validator.blacklist(JSON.stringify(paymentResult), '<>')
    };
    await Order.createPayment(orderId, payment);
    res.send({data: {number}});
};

const getUserHistory = async (req, res) => {
    const user = req.user;
    if (!req.query || !req.query.id) {
        res.status(400).send({error: 'Id is required'});
        return;
    }

    if (req.query && req.query.id && user.id !== parseInt(req.query.id)) {
        res.status(403).send({error: 'Forbidden'});
        return;
    }

    const orders = await Order.getUserHistory(user.id);

    if (!orders) {
        res.status(500).send({error: 'Database Query Error'});
        return;
    }

    if (orders.length === 0) {
        res.status(200).send({data: []});
        return;
    }

    const data = [...orders.map(order => {
        return {
            number: order.number,
            status: order.status,
            time: getTime(order.time),
            total: order.total,
            recipient_time: order.details.recipient.time,
            list: order.details.list.map(item => {
                return {
                    id: item.id,
                    name: item.name,
                    image: util.getImagePath(req.protocol, req.hostname, item.id) + item.main_image,
                    price: item.price,
                    color_name: item.color.name,
                    size: item.size,
                    qty: item.qty,
                }
            }),
        };
    
    })]
    res.status(200).send({data});

}

// For Load Testing
const getUserPayments = async (req, res) => {
    const orders = await Order.getUserPayments();
    const userPayments = orders.reduce((obj, order) => {
        let userId = order.user_id;
        if (!(userId in obj)) {
            obj[userId] = 0;
        }
        obj[userId] += order.total;
        return obj;
    }, {});
    const userPaymentsData = Object.keys(userPayments).map(userId => {
        return {
            userId: parseInt(userId),
            totalPayment: userPayments[userId]
        };
    });
    res.status(200).send({data: userPaymentsData});
};

const getUserPaymentsGroupByDB = async (req, res) => {
    const orders = await Order.getUserPaymentsGroupByDB();
    res.status(200).send({data: orders});
};

const getTime = (time) => {
    return new Date(time).toISOString().replace('T', ' ').replace('Z', '').split('.')[0];
}

module.exports = {
    checkout,
    getUserPayments,
    getUserPaymentsGroupByDB,
    getUserHistory,
    getWinUsers,
};
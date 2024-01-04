const router = require('express').Router();
const {
    wrapAsync,
    authentication
} = require('../../util/util');

const {
    checkout,
    getUserPayments,
    getUserPaymentsGroupByDB,
    getUserHistory,
    getWinUsers
} = require('../controllers/order_controller');

const {
    USER_ROLE
} = require('../models/user_model');

router.route('/order/checkout')
    .post(authentication(USER_ROLE.ALL), wrapAsync(checkout));

router.route('/order/history')
    .get(authentication(USER_ROLE.ALL), wrapAsync(getUserHistory));

router.route('/order/win')
    .get(wrapAsync(getWinUsers));

// For load testing (Not in API Docs)
router.route('/order/payments')
    .get(wrapAsync(getUserPayments));

router.route('/order/payments2')
    .get(wrapAsync(getUserPaymentsGroupByDB));

module.exports = router;
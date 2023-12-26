const router = require('express').Router();
const { wrapAsync } = require('../../util/util');
const { uploadAWS } = require('../../util/util');

const S3upload = uploadAWS.fields([
    { name: 'images', maxCount: 3 }
])

const {
    getProducts,
    getComment,
    createComment,
    likeComment,
    comparePrice,
} = require('../controllers/product_controller');


// 拿到評論內容
router.route('/products/getComment')
    .get(wrapAsync(getComment))

router.route('/products/:category')
    .get(wrapAsync(getProducts));

// 創建評論
router.route('/products/createComment')
    .post(S3upload, wrapAsync(createComment))

// 點讚評論的API
router.route('/products/likeComment')
    .post(wrapAsync(likeComment))

// 比價 API
router.route('/products/comparePrice')
    .post(wrapAsync(comparePrice))

module.exports = router;

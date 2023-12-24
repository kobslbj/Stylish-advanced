const router = require('express').Router();
const { wrapAsync } = require('../../util/util');
const { uploadAWS } = require('../../util/util');

const S3upload = uploadAWS.fields([
    { name: 'images', maxCount: 3 }
])

const {
    getProducts,
    createComment,
    likeComment,
} = require('../controllers/product_controller');


router.route('/products/:category')
    .get(wrapAsync(getProducts));

// 創建評論
router.route('/products/createComment',)
    .post(S3upload,wrapAsync(createComment))

// 點讚評論的API
router.route('/products/likeComment')
    .post(wrapAsync(likeComment))

module.exports = router;

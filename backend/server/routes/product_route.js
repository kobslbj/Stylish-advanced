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
    panicBuying,
    setKillProduct,
    InsertOrderListToDB,
    getKillProduct,
    getAllSeckillProduct,
    getSeckillNumber,
} = require('../controllers/product_controller');

// 拿秒殺商品
router.route('/products/getKillProduct/')
    .get(wrapAsync(getKillProduct))

// 拿所有秒殺商品
router.route('/products/getAllSeckillProduct')
    .get(wrapAsync(getAllSeckillProduct))

// 拿秒殺商品的數量
router.route('/products/getSeckillNumber')
    .get(wrapAsync(getSeckillNumber))

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

// 搶購 API
router.route('/products/panicBuying')
    .post(wrapAsync(panicBuying))
// 設定搶購商品 API
router.route('/products/setKillProduct')
    .post(wrapAsync(setKillProduct))

// 把搶購訂單存到DB
router.route('/products/InsertOrderListToDB')
    .post(wrapAsync(InsertOrderListToDB))



module.exports = router;

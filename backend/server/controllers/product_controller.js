const _ = require('lodash');
const util = require('../../util/util');
const Product = require('../models/product_model');
const pageSize = 6;
const puppeteer = require('puppeteer');


var options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: true,
    timeZone: 'Asia/Taipei'
};
// 取得當前時間
var time = new Date();
var formattedTime = time.toLocaleString('en-US', options);



// 評論 
// productId : product Table中存在的id
// userId    : user Table中存在的id
const createComment = async (req, res) => {

    // 自定義日期格式
    var formattedDate = formattedTime.replace(/(\d+)\/(\d+)\/(\d+),/, '$3/$1/$2');

    console.log(formattedDate);

    const uploadPromises = [];
    console.log('發過來的檔案是: ', req.files.images)

    const images_url = [];
    if (req.files.images) {
        const images = req.files.images;
        images.forEach((image, index) => {
            const imageParams = {
                Bucket: 'bucket81213',
                Key: `${Date.now()}-image-${index}-${image.originalname}`,
                Body: image.buffer,
                ContentType: image.mimetype
            };

            uploadPromises.push(new Promise((resolve, reject) => {
                util.S3.upload(imageParams, function (error, data) {
                    if (error) {
                        console.log(error);
                        reject(error);
                    } else {
                        console.log(`Image ${index} Upload Successfully`, data.Location);
                        images_url.push(data.Location)
                        resolve(data);
                    }
                });
            }))
        })
    }

    await Promise.all(uploadPromises);
    console.log('存進去的圖片是: ', images_url);


    try {
        console.log(req.body);
        const { productId, userId, username, userpicture, text, rating } = req.body;

        // 假設你有一個 Comment 模型，並有一個類似 createComment 的方法
        // 把要用到資料庫ㄉ操作用到product_model那邊
        const commentId = await Product.createComment(
            productId,  // 評論的商品  
            userId,     // 評論的人id
            username,   // 評論人名字
            userpicture,// 評論人頭貼
            text,       // 評論內容
            rating,     // 星星評等 
            JSON.stringify(images_url),
            formattedDate,
            // 如果需要，添加其他評論屬性
        );


        if (commentId === -1) {
            res.status(500).send({ error: '創建評論失敗' });
        } else {
            console.log(commentId)
            res.status(200).send({ commentId });
        }
    } catch (error) {
        console.error('創建評論時出錯：', error);
        res.status(500).send({ error: '內部服務器錯誤' });
    }
};

// 按Like
const likeComment = async (req, res) => {
    console.log(req.body);
    try {
        const { commentId } = req.body;
        console.log(commentId);

        const success = await Product.likeComment(commentId);

        if (success) {
            res.status(200).send({ success: true });
        } else {
            res.status(500).send({ error: '点赞失败' });
        }
    } catch (error) {
        console.error('点赞时出错：', error);
        res.status(500).send({ error: '内部服务器错误' });
    }
}

// 拿到評論
const getComment = async (req, res) => {
    console.log(req.query.id);
    const comment = await Product.getComment(req.query.id);

    if (comment === -1) {
        res.status(500).send({ error: '拿不到評論' })
    } else {
        console.log(comment)
        res.status(200).send({ comment });
    }
}


// 生成商品
const createProduct = async (req, res) => {
    const body = req.body;
    const product = {
        id: body.product_id,
        category: body.category,
        title: body.title,
        description: body.description,
        price: body.price,
        texture: body.texture,
        wash: body.wash,
        place: body.place,
        note: body.note,
        story: body.story
    };
    product.main_image = req.files.main_image[0].filename;
    const colorIds = body.color_ids.split(',');
    const sizes = body.sizes.split(',');

    const variants = sizes.flatMap((size) => {
        return colorIds.map(color_id => {
            return [
                product.id,
                color_id,
                size,
                Math.round(Math.random() * 10),
            ];
        });
    });
    const images = req.files.other_images.map(
        img => ([product.id, img.filename])
    )
    console.log(product)
    console.log(variants)
    console.log(images)
    const productId = await Product.createProduct(product, variants, images);
    if (productId == -1) {
        res.status(500);
    } else {
        res.status(200).send({ productId });
    }
};

// 拿到商品
const getProducts = async (req, res) => {
    const category = req.params.category;
    const paging = parseInt(req.query.paging) || 0;

    async function findProduct(category) {
        switch (category) {
            case 'all':
                return await Product.getProducts(pageSize, paging);
            case 'men': case 'women': case 'accessories':
                return await Product.getProducts(pageSize, paging, { category });
            case 'search': {
                const keyword = req.query.keyword;
                if (keyword) {
                    return await Product.getProducts(pageSize, paging, { keyword });
                }
                break;
            }
            case 'hot': {
                return await Product.getProducts(null, null, { category });
            }
            case 'details': {
                const id = parseInt(req.query.id);
                if (Number.isInteger(id)) {
                    return await Product.getProducts(pageSize, paging, { id });
                }
            }
        }
        return Promise.resolve({});
    }
    const { products, productCount } = await findProduct(category);
    if (!products) {
        res.status(400).send({ error: 'Wrong Request' });
        return;
    }

    if (products.length == 0) {
        if (category === 'details') {
            res.status(200).json({ data: null });
        } else {
            res.status(200).json({ data: [] });
        }
        return;
    }

    let productsWithDetail = await getProductsWithDetail(req.protocol, req.hostname, products);

    if (category == 'details') {
        productsWithDetail = productsWithDetail[0];
    }

    const result = (productCount > (paging + 1) * pageSize) ? {
        data: productsWithDetail,
        next_paging: paging + 1
    } : {
        data: productsWithDetail,
    };

    res.status(200).json(result);
};

// 商品的詳細資料
const getProductsWithDetail = async (protocol, hostname, products) => {
    const productIds = products.map(p => p.id);
    const variants = await Product.getProductsVariants(productIds);
    const variantsMap = _.groupBy(variants, v => v.product_id);
    const images = await Product.getProductsImages(productIds);
    const imagesMap = _.groupBy(images, v => v.product_id)

    return products.map((p) => {
        const imagePath = util.getImagePath(protocol, hostname, p.id);
        p.main_image = p.main_image ? imagePath + p.main_image : null;
        p.images = p.images ? p.images.split(',').map(img => imagePath + img) : null;

        const productVariants = variantsMap[p.id];
        if (!productVariants) { return p; }

        p.variants = productVariants.map(v => ({
            color_code: v.code,
            size: v.size,
            stock: v.stock,
        }));

        const allColors = productVariants.map(v => ({
            code: v.code,
            name: v.name,
        }));
        p.colors = _.uniqBy(allColors, c => c.code);

        const allSizes = productVariants.map(v => v.size);
        p.sizes = _.uniq(allSizes);
        p.images = imagesMap[p.id].map(img => imagePath + img.image)
        return p;
    });
};


// 比價  API
const comparePrice = async (req, res) => {
    console.log(req.body.searchword);
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.goto(`https://www.findprice.com.tw/g/${req.body.searchword}`);
    //console.log(page.content());
    const itemData = await page.evaluate(() => {
        let data = [];

        let divHotDetails = document.querySelector(".divHotDetail")

        if (divHotDetails) {
            let divHotDetailList = divHotDetails.querySelectorAll(".divHotDetailList")
            for (let i = 0; i < divHotDetailList.length - 1; i++) {
                let temp = {}
                // console.log(divHotDetailList[i].querySelector(".mIcon").src)
                // console.log(divHotDetailList[i].querySelector(".divHotDetailListTitle").textContent)
                // console.log(divHotDetailList[i].querySelector(".divHotDetailListPrice").textContent)
                temp.shopPic = divHotDetailList[i].querySelector(".mIcon").src;
                temp.shopName = divHotDetailList[i].querySelector(".divHotDetailListTitle").textContent;
                temp.price = divHotDetailList[i].querySelector(".divHotDetailListPrice").textContent;
                temp.price = temp.price.replace(/商品選項\(.*?\)/, '').trim();
                data.push(temp);
            }
        }
        else {
            let divGoods = document.querySelectorAll(".divGoods")
            for (let i = 0; i < divGoods.length; i++) {
                let temp = {}
                //console.log(divGoods[i].querySelector(".mIcon").src);  
                //console.log(divGoods[i].querySelector(".mname").textContent)
                //console.log(divGoods[i].querySelector(".rec-price-20").textContent)
                temp.shopPic = divGoods[i].querySelector(".mIcon").src;
                temp.shopName = divGoods[i].querySelector(".mname").textContent;
                temp.price = divGoods[i].querySelector(".rec-price-20").textContent;
                temp.price = temp.price.replace(/商品選項\(.*?\)/, '').trim();
                data.push(temp);
            }
        }
        return data;
    });

    // 对价格进行排序，选择前五个
    const sortedData = itemData.sort((a, b) => parseFloat(a.price) - parseFloat(b.price)).slice(0, 5);

    console.log(sortedData);
    res.json(sortedData);


}


module.exports = {
    likeComment,
    getComment,
    createProduct,
    createComment,
    getProductsWithDetail,
    getProducts,
    comparePrice
};



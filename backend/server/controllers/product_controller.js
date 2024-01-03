const _ = require('lodash');
const util = require('../../util/util');
const Product = require('../models/product_model');
const pageSize = 6;
const { JSDOM } = require('jsdom');
const fs = require('fs');
const Redis = require('ioredis');
const { changeSecKillNumber } = require('../../util/socket');
const { buildIBSimilarMatrix } = require('../../util/recommendation/itembased');
const { buildUBSimilarMatrix } = require('../../util/recommendation/userbased');

// Redis 設定 ///////////////////////////////////////////////
const redis = new Redis({
    host: '127.0.0.1',
    port: 6379,
    password: ''
});

redis.on("error", function (error) {
    console.error(error);
});

// 參數放要搶購的商品 -> 第一個參數是名字 第三個參數是數量 
async function prepare(item) {
    await redis.hmset(item.name, "Total", item.number, "Booked", 0)
}

const path = require('path');
const secKillScriptPath = path.join(__dirname, 'secKill.lua');
const secKillScript = fs.readFileSync(secKillScriptPath);

async function secKill(item_name, user_name) {
    // 1. 緩存腳本取得 sha1 值
    const sha1 = await redis.script("load", secKillScript);
    console.log(sha1);

    // 2. 透過 evalsha 執行腳本
    // redis Evalsha 命令基本語法如下
    // EVALSHA sha1 numkeys key [key ...] arg [arg ...] 
    const temp = await redis.evalsha(sha1, 1, item_name, 1, `${item_name}_OrderList`, user_name);
    return temp; // 1代表還有貨 0代表沒有貨
}
///////////////////////////////////////////////////////////

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
    const uploadPromises = [];
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
                        reject(error);
                    } else {
                        images_url.push(data.Location)
                        resolve(data);
                    }
                });
            }))
        })
    }

    await Promise.all(uploadPromises);

    try {
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
            res.status(500).send({ error: 'Internal Server Error' });
        } else {
            console.log(commentId)
            res.status(200).send({ commentId });
            await buildUBSimilarMatrix(); // Rebuild the userbased similarity matrix
        }

    } catch (error) {
        res.status(500).send({ error: 'Internal Server Error' });
    }
};

// 按Like
const likeComment = async (req, res) => {
    try {
        const { commentId } = req.body;

        const success = await Product.likeComment(commentId);

        if (success) {
            res.status(200).send({ success: true });
        } else {
            res.status(500).send({ error: 'Internal Server Error' });
        }
    } catch (error) {
        res.status(500).send({ error: 'Internal Server Error' });
    }
}

// 拿到評論
const getComment = async (req, res) => {
    console.log(req.query.id);
    const comment = await Product.getComment(req.query.id);

    if (comment === -1) {
        res.status(500).send({ error: '拿不到評論' })
    } else {
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
    const productId = await Product.createProduct(product, variants, images);
    if (productId == -1) {
        res.status(500);
    } else {
        res.status(200).send({ productId });
        await buildIBSimilarMatrix(); // Rebuild the similarity matrix
    }

};

// 拿到商品
const getProducts = async (req, res) => {
    const category = req.params.category;
    console.log(category);
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

// 拿到相似商品
const getSimilarProducts = async (req, res) => {
    const productId = parseInt(req.query.id);

    if (!productId) {
        res.status(400).send({ error: 'Id is Required' });
        return;
    }

    const similarProducts = await Product.getSimilarProducts(productId);

    if (similarProducts.length == 0) {
        res.status(200).json({ data: [] });
        return;
    }

    const products = await getProductsWithDetail(req.protocol, req.hostname, similarProducts);
    res.status(200).json({ data: products });
}

// 可能喜歡的商品
const getMayLikeProducts = async (req, res) => {
    const userId = parseInt(req.query.id);

    if (!userId) {
        res.status(400).send({ error: 'Id is Required' });
        return;
    }

    const mayLikeProducts = await Product.getMayLikeProducts(userId);

    if (mayLikeProducts.length == 0) {
        res.status(200).json({ data: [] });
        return;
    }

    const products = await getProductsWithDetail(req.protocol, req.hostname, mayLikeProducts);
    res.status(200).json({ data: products });

}

// 比價  API
const comparePrice = async (req, res) => {
    const keyword = req.body.searchword;
    const source = await fetch(`https://www.findprice.com.tw/g/${keyword}`)
    const text = await source.text();
    const dom = new JSDOM(text);
    const document = dom.window.document;
    const p_div = document.querySelector("#p_div");
    const h_div = document.querySelector("#h_div");
    const g_div = document.querySelector("#g_div");
    const itemData = [];

    if (p_div) {
        const divPromoGoods = p_div.querySelector(".divPromoGoods");
        for (let i = 0; i < divPromoGoods.length; i++) {
            const temp = {};
            temp.shopPic = divPromoGoods[i].querySelector(".mIcon").src;
            temp.shopName = divPromoGoods[i].querySelector(".mname").textContent;
            temp.price = divPromoGoods[i].querySelector(".rec-price-20").textContent;
            temp.price = temp.price.replace(/商品選項\(\d+\)|[,\$\～]/, '').trim();
            temp.imageUrl = divPromoGoods[i].querySelector(".searchImg").src;
            itemData.push(temp);
        }
    }

    if (h_div) {
        const divHotGoods = h_div.querySelectorAll(".divHotGoods");
        for (let i = 0; i < divHotGoods.length; i++) {
            const divHotDetailList = divHotGoods[i].querySelectorAll(".divHotDetailList");
            for (let j = 0; j < divHotDetailList.length; j++) {
                const temp = {};
                if (divHotDetailList[j].querySelector(".mIcon")) {
                    temp.shopPic = divHotDetailList[j].querySelector(".mIcon").src;
                    temp.shopName = divHotDetailList[j].querySelector(".divHotDetailListTitle").textContent;
                    temp.price = divHotDetailList[j].querySelector(".divHotDetailListPrice").textContent;
                    temp.price = temp.price.replace(/商品選項\(\d+\)|[,\$\～]/g, '').trim();
                }
                temp.imageUrl = divHotGoods[i].querySelector(".searchImg").src;
                itemData.push(temp);
            }

        }
    }

    if (g_div) {
        const divGoods = g_div.querySelectorAll(".divGoods");
        for (let i = 0; i < divGoods.length; i++) {
            const temp = {};
            temp.shopPic = divGoods[i].querySelector(".mIcon").src;
            temp.shopName = divGoods[i].querySelector(".mname").textContent;
            temp.price = divGoods[i].querySelector(".rec-price-20").textContent;
            temp.price = temp.price.replace(/商品選項\(\d+\)|[,\$\～]/g, '').trim();
            temp.imageUrl = divGoods[i].querySelector(".searchImg").src;
            itemData.push(temp);
        }
    }

    // 对价格进行排序，选择前五个
    const sortedData = itemData.sort((a, b) => parseFloat(a.price) - parseFloat(b.price)).slice(0, 5);

    res.json(sortedData);


}

// 搶購 API
const panicBuying = async (req, res) => {
    // console.time('secKill')
    const data = req.body;
    const kill = await secKill(data.productName, data.userName);

    const remain = await getRemain(data.productName);

    // socket io emit event
    changeSecKillNumber(data.productName, remain);

    // console.timeEnd('secKill')
    if (kill == 1) {
        res.status(200).send({ "message": "搶購成功" });
    } else {
        res.status(200).send({ 'message': "東西沒了 下次請早" })
    }
}

// 把搶購訂單存到DB中
const InsertOrderListToDB = async (req, res) => {
    const product = req.body.product;
    try {
        // 执行 LRANGE 命令
        const users = await redis.lrange(`${product}_OrderList`, 0, -1);
        await Product.InsertOrderListToDB(product, users);
        await redis.del(product);
        await redis.del(`${product}_OrderList`);

        res.status(200).send({ message: "搶購資料建立完成" })
    } catch (error) {
        console.error('LRANGE failed:', error);
        res.status(500).send({ error: "Internal Server Error" })
    }
}

// 設置要被秒殺的商品
const setKillProduct = async (req, res) => {
    const { name, number, price, picture } = req.body;
    const RedisItem = { name, number };
    await prepare(RedisItem); // 要放入RedisItem的名字 跟 數量 到redis中

    // 剩下的properties
    const remainAttribute = { name, number, price, picture };

    // 把資料放進DB裡面
    const killProductsId = await Product.setKillProduct(
        remainAttribute.name,
        remainAttribute.price,
        remainAttribute.number,
        remainAttribute.picture,
    )
    //res.send({ "message": "秒殺商品設定成功" })
    if (killProductsId === -1) {
        res.send({ error: "Internal Server Error" })
    } else {
        res.send({ message: "秒殺商品設定成功" })
    }
}

// 拿秒殺商品的資訊
const getKillProduct = async (req, res) => {
    console.log("123")
    console.log(req.query.name);
    const result = await Product.getKillProduct(req.query.name);

    if (result === -1) {
        res.status(500).send({ error: 'Internal Server Error' })
    } else if (!result) {
        res.status(404).send({ error: 'Product not found' })
    } else {
        const remain = await getRemain(req.query.name);
        result.remain = remain;
        res.status(200).send({ result });
    }
}

// 拿所有秒殺商品
const getAllSeckillProduct = async (req, res) => {
    const result = await Product.getAllSeckillProduct();

    for (let i = 0; i < result.length; i++) {
        const remain = await getRemain(result[i].name);
        result[i].remain = remain;
    }
    if (result === -1) {
        res.status(500).send({ error: 'Internal Server Error' })
    } else if (result.length === 0) {
        res.status(404).send({ error: 'Product not found' })
    } else {
        res.status(200).send({ result });
    }

}

const getRemain = async (name) => {
    let total = 0;
    let booked = 0;
    await redis.hget(name, "Total").then(total_value => {
        total = total_value;
    });

    await redis.hget(name, "Booked").then(booked_value => {
        booked = booked_value;
    });
    return total - booked;
}

const getSeckillFromRedis = async (req, res) => {

    let total = 0;
    let booked = 0;

    await redis.hget(`${req.query.name}`, "Total").then(total_value => {
        console.log("Total:", total_value);
        total = total_value;
    });

    await redis.hget(`${req.query.name}`, "Booked").then(booked_value => {
        console.log("Booked:", booked_value);
        booked = booked_value;
    });

    res.send({
        name: req.query.name,
        remain: total - booked
    })

}

module.exports = {
    panicBuying,
    likeComment,
    getComment,
    createProduct,
    createComment,
    getProductsWithDetail,
    getProducts,
    comparePrice,
    setKillProduct,
    InsertOrderListToDB,
    getKillProduct,
    getAllSeckillProduct,
    getSimilarProducts,
    getMayLikeProducts,
    comparePrice,
    getSeckillFromRedis
};



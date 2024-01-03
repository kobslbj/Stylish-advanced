const { pool } = require('../../server/models/mysqlcon');
const Redis = require('ioredis');
const fs = require('fs');
const { TEST_ENDPOINT } = process.env;

const redis = new Redis({
    host: '127.0.0.1',
    port: 6379,
    password: ''
});

redis.on("error", function (error) {
    console.error(error);
});

const seckillProducts = [
    {
        product_id: "202401202401",
        category: "accessories",
        title: `APPLE iPhone 15 Pro 256G`,
        description: `iPhone 15 是蘋果公司最新推出的旗艦智能手機，將再次重新定義行業標準。\n其驚人的設計融合了超薄、輕巧的機身，採用先進的材料打造，呈現出未來感的外觀。\n前後玻璃面板巧妙地融合，營造出無縫的視覺效果，機身邊緣更是精雕細琢，提供極致握持感。\n`,
        price: 34000,
        texture: `金屬質地`,
        wash: `不可水洗`,
        place: `台灣製造`,
        note: `商品不可退換貨`,
        story: `iPhone 15 是蘋果公司最新推出的旗艦智能手機，將再次重新定義行業標準。其驚人的設計融合了超薄、輕巧的機身，採用先進的材料打造，呈現出未來感的外觀。前後玻璃面板巧妙地融合，營造出無縫的視覺效果，機身邊緣更是精雕細琢，提供極致握持感。\n`,
        color_ids: "1",
        sizes: "256G, 512G",
        main_image: "iphone-153.jpg",
        other_images: ["iphone-151.jpg", "iphone-152.jpg", "iphone-15.jpg"]

    }
]

const resetSecKill = async () => {
    await redis.flushall();
    await pool.query("DELETE FROM seckillproduct");
    await pool.query("DELETE FROM orderlist");
}

const createSecKillProduct = async () => {
    const formdatas = [];
    for (let i = 0; i < seckillProducts.length; i++) {
        const product = seckillProducts[i];
        const formdata = new FormData();
        formdata.append('product_id', product.product_id);
        formdata.append('category', product.category);
        formdata.append('title', product.title);
        formdata.append('description', product.description);
        formdata.append('price', product.price);
        formdata.append('texture', product.texture);
        formdata.append('wash', product.wash);
        formdata.append('place', product.place);
        formdata.append('note', product.note);
        formdata.append('story', product.story);
        formdata.append('color_ids', product.color_ids);
        formdata.append('sizes', product.sizes);

        const main_image = await fs.openAsBlob(`${__dirname}/mock_images/${product.main_image}`, {type: 'image/jpeg'});
        formdata.append('main_image', main_image, `${__dirname}/mock_images/${product.main_image}`);

        for (let j = 0; j < product.other_images.length; j++) {
            const image = await fs.openAsBlob(`${__dirname}/mock_images/${product.other_images[j]}`, {type: 'image/jpeg'});
            formdata.append('other_images', image, `${__dirname}/mock_images/${product.other_images[j]}`);
        }
        formdatas.push(formdata);
    }

    for (let i = 0; i < formdatas.length; i++) {
        const formdata = formdatas[i];
        const result = await fetch(`${TEST_ENDPOINT}/api/1.0/admin/product`, {
            method: 'POST',
            body: formdata
        });
        const data = await result.json();
        console.log(data);
    }

    for (let i = 0; i < seckillProducts.length; i++) {
        const product = seckillProducts[i];
        const result = await fetch(`${TEST_ENDPOINT}/api/1.0/products/setKillProduct`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                product_id: product.product_id,
                name: product.title,
                number: 1000,
            })
        });
        const data = await result.json();
        console.log(data);
    }

}


(async () => {
    await resetSecKill();
    console.log("Reset successfully!");
    await createSecKillProduct();
    process.exit();
})();

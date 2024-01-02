const { pool } = require('./mysqlcon');

const createProduct = async (product, variants, images) => {
    const conn = await pool.getConnection();
    try {
        await conn.query('START TRANSACTION');
        const [result] = await conn.query('INSERT INTO product SET ?', product);
        await conn.query('INSERT INTO variant(product_id, color_id, size, stock) VALUES ?', [variants]);
        await conn.query('INSERT INTO product_images(product_id, image) VALUES ?', [images]);
        await conn.query('COMMIT');
        return result.insertId;
    } catch (error) {
        await conn.query('ROLLBACK');
        console.log(error)
        return -1;
    } finally {
        await conn.release();
    }
};

// Comment 對資料庫的操作
const createComment = async (productId, userId, username, userpicture, text, rating, image_url, formattedDate) => {
    const conn = await pool.getConnection();
    //console.log('DBDBDBDB',userId,productId,text,rating)
    console.log("Comment 對 DB 操作開始")
    console.log(productId)
    console.log(userId)
    console.log(text)
    console.log(rating)
    console.log(image_url)
    console.log(formattedDate)

    try {
        // Insert a new comment into the comment table
        const [result] = await conn.query(
            'INSERT INTO comment (productId, userId, username, userpicture, text, rating, images_url, commentTime) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [productId, userId, username, userpicture, text, rating, image_url, formattedDate]
        );
        // console.log(result.insertId);


        return result.insertId; // Return the ID of the newly inserted comment
    } catch (error) {
        console.error('Error creating comment:', error);
        return -1; // Return -1 or some other error indicator based on your logic
    } finally {
        await conn.release();
    }
};

// getComment 的 DB操作
const getComment = async (productId) => {
    const conn = await pool.getConnection();
    try {
        const [result] = await conn.query(
            `SELECT * FROM comment WHERE productId = ${productId}`
        )
        console.log(result);
        return result;
    } catch (error) {
        console.error('Error Getting comment:', error);
        return -1; // Return -1 or some other error indicator based on your logic
    }
}


// Like Comment的DB操作
const likeComment = async (commentId) => {
    const conn = await pool.getConnection();
    console.log('評論的ID是: ', commentId)
    try {
        // 更新评论的点赞数量
        const [result] = await conn.query(
            'UPDATE comment SET likes = likes + 1 WHERE commentId = ?',
            [commentId]
        );

        return result.affectedRows > 0;
    } catch (error) {
        console.error('点赞时出错：', error);
        return false;
    } finally {
        await conn.release();
    }
};


const getProducts = async (pageSize, paging = 0, requirement = {}) => {
    const condition = { sql: '', binding: [] };
    if (requirement.category) {
        condition.sql = 'WHERE category = ?';
        condition.binding = [requirement.category];
    } else if (requirement.keyword != null) {
        condition.sql = 'WHERE title LIKE ?';
        condition.binding = [`%${requirement.keyword}%`];
    } else if (requirement.id != null) {
        condition.sql = 'WHERE id = ?';
        condition.binding = [requirement.id];
    }

    const limit = {
        sql: 'LIMIT ?, ?',
        binding: [pageSize * paging, pageSize]
    };

    const productQuery = 'SELECT * FROM product ' + condition.sql + ' ORDER BY id ' + limit.sql;
    const productBindings = condition.binding.concat(limit.binding);
    const [products] = await pool.query(productQuery, productBindings);

    const productCountQuery = 'SELECT COUNT(*) as count FROM product ' + condition.sql;
    const productCountBindings = condition.binding;

    const [productCounts] = await pool.query(productCountQuery, productCountBindings);

    return {
        'products': products,
        'productCount': productCounts[0].count
    };
};

const getHotProducts = async (hotId) => {
    const productQuery = 'SELECT product.* FROM product INNER JOIN hot_product ON product.id = hot_product.product_id WHERE hot_product.hot_id = ? ORDER BY product.id';
    const productBindings = [hotId];
    const [hots] = await pool.query(productQuery, productBindings);
    return hots;
};

const getProductsVariants = async (productIds) => {
    const queryStr = 'SELECT * FROM variant INNER JOIN color ON variant.color_id = color.id WHERE product_id IN (?)';
    const bindings = [productIds];
    const [variants] = await pool.query(queryStr, bindings);
    return variants;
};

const getProductsImages = async (productIds) => {
    const queryStr = 'SELECT * FROM product_images WHERE product_id IN (?)';
    const bindings = [productIds];
    const [variants] = await pool.query(queryStr, bindings);
    return variants;
};

const InsertOrderListToDB = async (product, user) => {
    const conn = await pool.getConnection();
    try {
        for (let i = 0; i < user.length; i++) {
            const [result] = await conn.query('INSERT INTO orderlist (productName, userName) VALUES (?, ?)', [product, user[i]]);
            console.log(`${product} added successfully with ID: ${result.insertId}`);
            //return result.insertId
        }
    } catch (error) {
        console.error('Error adding product:', error);
        return -1;
    }
}

// 設定秒殺商品
const setKillProduct = async (name, price, number, picture) => {
    const conn = await pool.getConnection();
    try {
        const [result] = await conn.query(
            'INSERT INTO seckillproduct(name,price,number,picture) VALUES (?,?,?,?)',
            [name, price, number, picture]
        )
        return result.insertId;
    } catch (error) {
        console.error('Error insert Seckill Product:', error);
        return -1;
    }
}

// 放要查詢秒殺商品的名字 可以拿到相關的屬性
const getKillProduct = async (name) => {
    console.log(name);
    const conn = await pool.getConnection();
    try {
        const [result] = await conn.query(
            `SELECT * FROM seckillproduct WHERE name = '${name}'`
        )
        console.log(result);
        return result;
    } catch (error) {
        console.error('Error Getting product:', error);
        return -1;
    }
}

// 拿所有秒殺商品的資料
const getAllSeckillProduct = async () => {
    const conn = await pool.getConnection();
    try {
        const [result] = await conn.query(
            `SELECT * FROM seckillproduct`
        )
        console.log(result);
        return result;
    } catch (error) {
        console.error('Error getting all seckill: ', error);
        return -1;
    }
}

// 拿想要的秒殺商品數量
const getSeckillNumber = async (name) => {
    const conn = await pool.getConnection();
    try {
        const [result] = await conn.query(
            `SELECT number FROM seckillproduct WHERE name = '${name}'`
        )
        console.log(result);
        return result;
    } catch (error) {
        console.error('Error getting seckill number: ', error);
        return -1;
    }
}

module.exports = {
    createComment,
    getComment,
    likeComment,
    createProduct,
    getProducts,
    getHotProducts,
    getProductsVariants,
    getProductsImages,
    InsertOrderListToDB,
    setKillProduct,
    getKillProduct,
    getAllSeckillProduct,
    getSeckillNumber,
};

// 把Justin的照片放到S3  -> Done
// 並且insert到DB中 一個數量為1 一個數量為200 -> Done
// 做出getSeckillproduct的API讓前端顯示
// 做出getSeckillnumber讓前端顯示剩餘的庫存
// 存完訂單資料之後 就把redis裡面flush掉
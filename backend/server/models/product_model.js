const { pool } = require('./mysqlcon');
const fs = require('fs');

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
        if (error.code === 'ER_DUP_ENTRY') {
            return -2;
        }
        return -1;
    } finally {
        conn.release();
    }
};

// Comment 對資料庫的操作
const createComment = async (productId, userId, username, userpicture, text, rating, image_url, formattedDate) => {
    const conn = await pool.getConnection();

    try {
        // Insert a new comment into the comment table
        await conn.query("START TRANSACTION");
        const [result] = await conn.query(
            'INSERT INTO comment (productId, userId, username, userpicture, text, rating, images_url, commentTime) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [productId, userId, username, userpicture, text, rating, image_url, formattedDate]
        );
        conn.query("COMMIT");

        return result.insertId; // Return the ID of the newly inserted comment
    } catch (error) {
        conn.query("ROLLBACK");
        return -1; // Return -1 or some other error indicator based on your logic
    } finally {
        conn.release();
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
    } finally {
        conn.release();
    }
}


// Like Comment的DB操作
const likeComment = async (commentId) => {
    const conn = await pool.getConnection();
    try {
        // 更新评论的点赞数量
        await conn.query("START TRANSACTION");
        const [result] = await conn.query(
            'UPDATE comment SET likes = likes + 1 WHERE commentId = ?',
            [commentId]
        );
        conn.query("COMMIT");

        return result.affectedRows > 0;
    } catch (error) {
        conn.query("ROLLBACK");
        return false;
    } finally {
        conn.release();
    }
};

const DislikeComment = async (commentId) => {
    const conn = await pool.getConnection();
    try {
        // 更新评论的点赞数量
        await conn.query("START TRANSACTION");
        const [result] = await conn.query(
            'UPDATE comment SET likes = likes - 1 WHERE commentId = ?',
            [commentId]
        );
        conn.query("COMMIT");
        return result.affectedRows > 0;
    } catch (error) {
        conn.query("ROLLBACK");
        return false;
    } finally {
        conn.release();
    }
}


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

// 拿到相似商品
const getSimilarProducts = async (productId) => {
    const matrix = fs.readFileSync('./util/recommendation/matrixes/itembased.json');
    const similarityMatrix = JSON.parse(matrix);

    const productIds = similarityMatrix[productId]
        .filter((data, index) => {
            return data.id !== productId;
        })
        .sort((a, b) => {
            return b.similarity - a.similarity;
        })
        .map((data) => {
            return data.id;
        });

    const productQuery = `SELECT p.id, p.category, p.title, p.description,
    p.price, p.texture, p.wash, p.place, p.note, p.story, p.main_image 
    FROM product p`;
    const [products] = await pool.query(productQuery);

    const result = products.filter((product) => {
        return productIds.indexOf(product.id) !== -1;
    })
        .sort((a, b) => {
            return productIds.indexOf(a.id) - productIds.indexOf(b.id);
        });

    return result;
}

// 可能喜歡的商品
const getMayLikeProducts = async (userId) => {
    const matrix = fs.readFileSync('./util/recommendation/matrixes/userbased.json');
    const similarityMatrix = JSON.parse(matrix);

    const userIds = similarityMatrix[userId]
        .filter((data, index) => {
            return data.id !== userId;
        })
        .sort((a, b) => {
            return b.similarity - a.similarity;
        })
        .map((data) => {
            return data.id;
        });

    const userQuery = `SELECT u.id userId, p.id id, p.category, p.title, p.description,
    p.price, p.texture, p.wash, p.place, p.note, p.story, p.main_image, c.rating
    FROM user u
    JOIN comment c ON u.id = c.userId
    JOIN product p ON p.id = c.productId`;

    const [data] = await pool.query(userQuery);

    let temp = new Set();
    const result = data.filter((item) => {
        return item.userId !== userId;
    })
        // User with higher similarity will be placed in front of the array
        // If there are multiple records for an user make comment to some products, we need to sort the records by rating
        .sort((a, b) => {
            const exchange = userIds.indexOf(a.userId) - userIds.indexOf(b.userId);
            return exchange === 0 ? b.rating - a.rating : exchange;
        })
        // Because there are multiple records for an user make comment to a product, we need to filter out the duplicate records
        // and only keep the record with max rating
        .map((item) => {
            // Check if there is duplicate record in result
            const duplicate = temp.has(item.userId + '-' + item.id);

            // If there is no duplicate record, return the record with max rating, which has been sorted before
            if (duplicate === false) {

                temp.add(item.userId + '-' + item.id);

                return item;
            }
        })
        .filter((item) => item !== undefined);

    return result;
}

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

const InsertOrderListToDB = async (productId, userIds) => {
    console.log(userIds)
    const conn = await pool.getConnection();
    try {
        conn.query("START TRANSACTION");
        let sql = 'INSERT INTO orderlist (product_id, user_id) VALUES';
        let data = [];

        for (let i = 0; i < userIds.length; i++) {
            if (i === userIds.length - 1) {
                sql = sql + '(?, ?);'
            } else {
                sql = sql + '(?, ?),'
            }
            data.push(productId, userIds[i]);
        }

        await conn.query(sql, data);
        conn.query("COMMIT");
    } catch (error) {
        console.error('Error adding product:', error);
        conn.query("ROLLBACK");
        return -1;
    } finally {
        conn.release();
    }
}

// 設定秒殺商品
const setKillProduct = async (name, price, number, picture, product_id) => {
    const conn = await pool.getConnection();
    try {
        conn.query("START TRANSACTION");
        const [result] = await conn.query(
            'INSERT INTO seckillproduct(name, price, number, picture, product_id) VALUES (?, ?, ?, ?, ?)',
            [name, price, number, picture, product_id]
        )
        conn.query("COMMIT");
        return result.insertId;
    } catch (error) {
        console.error('Error insert Seckill Product:', error);
        conn.query("ROLLBACK");
        return -1;
    } finally {
        conn.release();
    }
}

// 放要查詢秒殺商品的名字 可以拿到相關的屬性
const getKillProduct = async (name) => {
    console.log(name);
    const conn = await pool.getConnection();
    try {
        const [result] = await conn.query(`SELECT * FROM seckillproduct WHERE name = ?`, [name]);
        console.log(result);
        return result[0];
    } catch (error) {
        console.error('Error Getting product:', error);
        return -1;
    } finally {
        conn.release();
    }
}

// 拿所有秒殺商品的資料
const getAllSeckillProduct = async () => {
    const conn = await pool.getConnection();
    try {
        const [result] = await conn.query(
            `SELECT name, price, number, picture, product_id productId FROM seckillproduct`
        )
        return result;
    } catch (error) {
        console.error('Error getting all seckill: ', error);
        return -1;
    } finally {
        conn.release();
    }
}

module.exports = {
    createComment,
    getComment,
    likeComment,
    DislikeComment,
    createProduct,
    getProducts,
    getHotProducts,
    getProductsVariants,
    getProductsImages,
    InsertOrderListToDB,
    setKillProduct,
    getKillProduct,
    getAllSeckillProduct,
    getSimilarProducts,
    getMayLikeProducts,
};

// 把Justin的照片放到S3  -> Done
// 並且insert到DB中 一個數量為1 一個數量為200 -> Done
// 做出getSeckillproduct的API讓前端顯示
// 做出getSeckillnumber讓前端顯示剩餘的庫存
// 存完訂單資料之後 就把redis裡面flush掉



const { pool } = require('../../server/models/mysqlcon');
const { promisify } = require('node:util');
const fs = require('fs');
const dotenv = require('dotenv');
const similarity = require('compute-cosine-similarity');

dotenv.config();

const SAVE_DIR = './util/recommendation/matrixes';

const computeSimilarity = (matrix) => {
    const similarityMatrix = [];
    for (let i = 0; i < matrix.length; i++) {
        const row = [];
        for (let j = 0; j < matrix.length; j++) {
            row.push(similarity(matrix[i], matrix[j]) ? similarity(matrix[i], matrix[j]) : 0);
        }
        similarityMatrix.push(row);
    }
    return similarityMatrix;
};

const buildUBSimilarMatrix = async () => {
    // Get the rating of user for each products
    const connection = await pool.getConnection();
    const [ratings] = await connection.query(`
    SELECT productId, userId, rating 
    FROM product 
    JOIN comment ON product.id = comment.productId 
    JOIN user ON user.id = comment.userId`);

    const [products] = await connection.query(`SELECT id FROM product`);
    const [users] = await connection.query(`SELECT id FROM user`);

    connection.release();

    // Build the rating matrix
    const matrix = [];
    for (let i = 0; i < users.length; i++) {
        const row = [];
        for (let j = 0; j < products.length; j++) {
            const rating = ratings.find(rating => rating.userId === users[i].id && rating.productId === products[j].id);
            row.push(rating ? rating.rating : 0);
        }
        matrix.push(row);
    }

    // Compute the similarity matrix
    const similarityMatrix = computeSimilarity(matrix);

    const data = {}
    users.forEach((user, index) => {
        data[user.id] = similarityMatrix[index].map((similarity, index) => {
            return {
                'id': users[index].id,
                'similarity': similarity
            };
        });
    });

    console.log(`Matrix shape: ${similarityMatrix.length} * ${similarityMatrix[0].length}`);

    // Save the similarity matrix
    if (!fs.existsSync(SAVE_DIR)) {
        fs.mkdirSync(SAVE_DIR);
    }
    const write = promisify(fs.writeFile);
    await write(`${SAVE_DIR}/userbased.json`, JSON.stringify(data));

};  

if (module === require.main) {
    (async () => {
        console.log('Building Similarity Matrix...');
        await buildUBSimilarMatrix();
        console.log('Done!');
        process.exit();
    })();

}

module.exports = {
    buildUBSimilarMatrix,
};
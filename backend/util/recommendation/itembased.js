const { promisify } = require('node:util');
const fs = require('fs');
const dotenv = require('dotenv');
const { pool } = require('../../server/models/mysqlcon');
const { WordTokenizer } = require('natural');
const similarity = require('compute-cosine-similarity')
const { removeStopwords, zho, eng } = require('stopword');
const { cut } = require('nodejs-jieba');
const tf = require('@tensorflow/tfjs-node');
const mobilenet = require('@tensorflow-models/mobilenet');

dotenv.config();

const specialChar = ['\r', '\n', '\t', ' ', ':', '：', '　', '。', '，', '<', '>', '＂', '’', ',', '.', '?', '/', '\\'];

const SAVE_DIR = './util/recommendation/matrixes';

let model;

const loadMobileNetModel = async () => {
    if (!model) {
        model = await mobilenet.load({version: 2, alpha: 0.5});
    }
    return model.model;
};

const readImage = (imagePath) => {
    let imageBuffer = fs.readFileSync(imagePath);
    return imageBuffer;
}

const extractFeatures = async (model, imageBuffer) => {
    const image = tf.node.decodeImage(imageBuffer, 3);
    let preprocessedImg = image.resizeBilinear([224, 224]).expandDims();
    const feature = await model.predict(preprocessedImg).data();

    return feature;
}

const getImageFeatures = async (imagePath) => {
    const model = await loadMobileNetModel();
    const image = readImage(imagePath);
    const features = await extractFeatures(model, image);

    return features;
}


const customTokenizer = (text) => {
    if (/[^\x00-\x7F]/.test(text)) {
        // Chinese text
        const words = cut(text, true);
        return words;
    } else {
        // English text
        let tokenizer = new WordTokenizer();
        const words = tokenizer.tokenize(text);
        return words;
    }
};

const computeSimilarity = (matrix) => {
    const similarityMatrix = [];
    for (let i = 0; i < matrix.length; i++) {
        const row = [];
        for (let j = 0; j < matrix.length; j++) {
            row.push(similarity(matrix[i], matrix[j]));
        }
        similarityMatrix.push(row);
    }
    return similarityMatrix;
};

const buildSimilarMatrix = async () => {
    // Get Product Data
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT id, category, title, description, texture, story, main_image from product');
    connection.release();

    let matrix = [];

    // Tokenize Text
    rows.forEach((row) => {
        const title = removeStopwords(customTokenizer(row['title']), [...zho, ...eng, ...specialChar]);
        const description = removeStopwords(customTokenizer(row['description']), [...zho, ...eng, ...specialChar]);
        const texture = removeStopwords(customTokenizer(row['texture']), [...zho, ...eng, ...specialChar]);
        const story = removeStopwords(customTokenizer(row['story']), [...zho, ...eng, ...specialChar]);
        matrix.push([...title, ...description, ...texture, ...story]);
    });

    const uniqueTokens = [...new Set(matrix.flat())];

    // Build vector for each product
    const textVectors = [];
    matrix.forEach((row) => {
        const vector = [];
        uniqueTokens.forEach((token) => {
            vector.push(row.filter((t) => t === token).length);
        });
        textVectors.push(vector);
    });

    let start = new Date();
    // Get Image Features
    const imageFeatures = [];
    for (let i = 0; i < rows.length; i++) {
        const imagePath = `./public/assets/${rows[i]['id']}/${rows[i]['main_image']}`;
        const features = await getImageFeatures(imagePath);
        imageFeatures.push(features);
    }
    let end = new Date();

    console.log(`Image Feature Extraction Time: ${end - start}ms`);

    // Combine Text and Image Features
    textVectors.forEach((vector, index) => {
        vector.push(...imageFeatures[index]);
    });

    // Compute Similarity
    start = new Date();
    const similarityMatrix = computeSimilarity(textVectors);
    end = new Date();

    console.log(`Similarity Matrix Computation Time: ${end - start}ms`);
    
    const data = {
        matrix: similarityMatrix,
        productIds: rows.map((row) => row['id']),
    };

    // Save to File
    if (!fs.existsSync(SAVE_DIR)) {
        fs.mkdirSync(SAVE_DIR);
    }
    const write = promisify(fs.writeFile);
    await write(`${SAVE_DIR}/itembased.json`, JSON.stringify(data));

};

if (require.main === module) {
    (async () => {
        console.log('Building Similarity Matrix...');
        await buildSimilarMatrix();
        console.log('Done!');
        process.exit();
        // await getImageFeatures('./public/images/add.png');
    })();

}

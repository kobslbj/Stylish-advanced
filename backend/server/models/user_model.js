require('dotenv').config();
const bcrypt = require('bcrypt');
const got = require('got');
const {pool} = require('./mysqlcon');
const salt = parseInt(process.env.BCRYPT_SALT);
const {TOKEN_EXPIRE, TOKEN_SECRET} = process.env; // 30 days by seconds
const jwt = require('jsonwebtoken');

const USER_ROLE = {
    ALL: -1,
    ADMIN: 1,
    USER: 2
};

const signUp = async (name, roleId, email, password) => {
    const conn = await pool.getConnection();
    try {
        await conn.query('START TRANSACTION');

        const emails = await conn.query('SELECT email FROM user WHERE email = ? FOR UPDATE', [email]);
        if (emails[0].length > 0){
            await conn.query('COMMIT');
            return {error: 'Email Already Exists'};
        }

        const loginAt = new Date();

        const user = {
            provider: 'native',
            role_id: roleId,
            email: email,
            password: bcrypt.hashSync(password, salt),
            name: name,
            picture: null,
            phone_number: null,
            birthday: null,
            address: null,
            access_expired: TOKEN_EXPIRE,
            login_at: loginAt
        };
        const accessToken = jwt.sign({
            provider: user.provider,
            name: user.name,
            email: user.email,
            picture: user.picture,
            phone_number: null,
            birthday: null,
            address: null,
        }, TOKEN_SECRET);
        user.access_token = accessToken;

        const queryStr = 'INSERT INTO user SET ?';
        const [result] = await conn.query(queryStr, user);

        user.id = result.insertId;
        await conn.query('COMMIT');
        return {user};
    } catch (error) {
        console.log(error);
        await conn.query('ROLLBACK');
        return {error};
    } finally {
        await conn.release();
    }
};

const nativeSignIn = async (email, password) => {
    const conn = await pool.getConnection();
    try {
        await conn.query('START TRANSACTION');

        const [users] = await conn.query('SELECT * FROM user WHERE email = ?', [email]);
        const user = users[0];
        if (!bcrypt.compareSync(password, user.password)){
            await conn.query('COMMIT');
            return {error: 'Password is wrong'};
        }

        const loginAt = new Date();
        const accessToken = jwt.sign({
            provider: user.provider,
            name: user.name,
            email: user.email,
            picture: user.picture,
            phone_number: user.phone_number,
            birthday: user.birthday,
            address: user.address,
        }, TOKEN_SECRET);

        const queryStr = 'UPDATE user SET access_token = ?, access_expired = ?, login_at = ? WHERE id = ?';
        await conn.query(queryStr, [accessToken, TOKEN_EXPIRE, loginAt, user.id]);

        await conn.query('COMMIT');

        user.access_token = accessToken;
        user.login_at = loginAt;
        user.access_expired = TOKEN_EXPIRE;

        return {user};
    } catch (error) {
        await conn.query('ROLLBACK');
        return {error};
    } finally {
        await conn.release();
    }
};

const getUserDetail = async (email, roleId) => {
    try {
        if (roleId) {
            const [users] = await pool.query('SELECT * FROM user WHERE email = ? AND role_id = ?', [email, roleId]);
            return users[0];
        } else {
            const [users] = await pool.query('SELECT * FROM user WHERE email = ?', [email]);
            return users[0];
        }
    } catch (e) {
        return null;
    }
};

const updateUserInfo = async (newUser) => {
    const conn = await pool.getConnection();
    try {
        await conn.query('START TRANSACTION');
        
        const {id, provider, name, email, phone_number, birthday, address, picture} = newUser;
        const accessToken = jwt.sign({
            provider,
            name,
            email,
            phone_number,
            birthday,
            address,
            picture,
        }, TOKEN_SECRET);

        await conn.query(`
        UPDATE user SET 
        name = ?, email = ?,
        phone_number = ?, birthday = ?,
        address = ?, access_token = ?, 
        access_expired = ? WHERE id = ?`, 
        [name, email, phone_number, birthday, address, accessToken, TOKEN_EXPIRE, id]);

        newUser.access_token = accessToken;
        newUser.access_expired = TOKEN_EXPIRE;

        await conn.query('COMMIT');
        return newUser;
    } catch (error) {
        await conn.query('ROLLBACK');
        console.log(error);
        return {error};
    } finally {
        await conn.release();
    }
}

const updateUserImage = async (picture, user) => {
    const conn = await pool.getConnection();
    try {
        await conn.query('START TRANSACTION');

        const {id, provider, name, email, phone_number, birthday, address} = user;
        const accessToken = jwt.sign({
            provider,
            name,
            email,
            phone_number,
            birthday,
            address,
            picture,
        }, TOKEN_SECRET);

        await conn.query(`
        UPDATE user 
        SET picture = ?, access_token = ?,
        access_expired = ? WHERE id = ?`,
        [picture, accessToken, TOKEN_EXPIRE, id]);

        user.access_token = accessToken;
        user.access_expired = TOKEN_EXPIRE;
        user.picture = picture;

        await conn.query('COMMIT');
        return user;
    } catch (error) {
        await conn.query('ROLLBACK');
        return {error};
    } finally {
        await conn.release();
    }

}


module.exports = {
    USER_ROLE,
    signUp,
    nativeSignIn,
    getUserDetail,
    updateUserInfo,
    updateUserImage,
};
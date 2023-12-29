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

        const queryStr = 'INSERT INTO user SET ?';
        const [result] = await conn.query(queryStr, user);

        const accessToken = jwt.sign({
            provider: user.provider,
            id: result.insertId,
        }, TOKEN_SECRET);
        
        await conn.query('UPDATE user SET access_token = ? WHERE id = ?', [accessToken, result.insertId]);

        user.access_token = accessToken;
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
            id: user.id,
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

const getUserDetail = async (id, roleId) => {
    try {
        let users;
        if (roleId) {
            [users] = await pool.query('SELECT * FROM user WHERE id = ? AND role_id = ?', [id, roleId]);
        } else {
            [users] = await pool.query('SELECT * FROM user WHERE id = ?', [id]);
        }

        return users[0];
    } catch (e) {
        return null;
    }
};

const updateUserInfo = async (newUser) => {
    const conn = await pool.getConnection();
    try {
        await conn.query('START TRANSACTION');
        
        const {id, name, email, phone_number, birthday, address} = newUser;

        await conn.query(`
        UPDATE user SET 
        name = ?, email = ?,
        phone_number = ?, birthday = ?,
        address = ? WHERE id = ?`, 
        [name, email, phone_number, birthday, address, id]);

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

const updateUserImage = async (picture, userId) => {
    const conn = await pool.getConnection();
    try {
        await conn.query('START TRANSACTION');
        
        await conn.query(`
        UPDATE user 
        SET picture = ? WHERE id = ?`,
        [picture, userId]);

        await conn.query('COMMIT');
        return {picture, id: userId};
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
require('dotenv').config();
const validator = require('validator');
const User = require('../models/user_model');
const {getUserImagePath} = require('../../util/util');

const signUp = async (req, res) => {
    let {name} = req.body;
    const {email, password} = req.body;

    if(!name || !email || !password) {
        res.status(400).send({error:'Request Error: name, email and password are required.'});
        return;
    }

    if (!validator.isEmail(email)) {
        res.status(400).send({error:'Request Error: Invalid email format'});
        return;
    }

    name = validator.escape(name);

    const result = await User.signUp(name, User.USER_ROLE.USER, email, password);
    if (result.error) {
        res.status(403).send({error: result.error});
        return;
    }

    const user = result.user;
    if (!user) {
        res.status(500).send({error: 'Database Query Error'});
        return;
    }

    res.status(200).send({
        data: {
            access_token: user.access_token,
            access_expired: user.access_expired,
            login_at: user.login_at,
            user: {
                id: user.id,
                provider: user.provider,
                name: user.name,
                email: user.email,
                picture: user.picture,
                phone_number: user.phone_number,
                birthday: user.birthday,
                address: user.address,
            }
        }
    });
};

const nativeSignIn = async (email, password) => {
    if(!email || !password){
        return {error: 'Request Error: email and password are required.', status: 400};
    }

    try {
        return await User.nativeSignIn(email, password);
    } catch (error) {
        return {error};
    }
};

const signIn = async (req, res) => {
    const data = req.body;

    let result;
    switch (data.provider) {
        case 'native':
            result = await nativeSignIn(data.email, data.password);
            break;
        default:
            result = {error: 'Wrong Request'};
    }

    if (result.error) {
        const status_code = result.status ? result.status : 403;
        res.status(status_code).send({error: result.error});
        return;
    }

    const user = result.user;
    if (!user) {
        res.status(500).send({error: 'Database Query Error'});
        return;
    }

    if (user.picture !== null) {
        user.picture = getUserImagePath(req.protocol, req.hostname, user.id) + user.picture;
    }

    res.status(200).send({
        data: {
            access_token: user.access_token,
            access_expired: user.access_expired,
            login_at: user.login_at,
            user: {
                id: user.id,
                provider: user.provider,
                name: user.name,
                email: user.email,
                picture: user.picture,
                phone_number: user.phone_number,
                birthday: user.birthday,
                address: user.address,
            }
        }
    });
};

const getUserProfile = async (req, res) => {
    const user = req.user;
    
    const result = await User.getUserDetail(user.id);
    if (!result) {
        res.status(500).send({error: 'Database Query Error'});
        return;
    }

    if (result.picture !== null) {
        result.picture = getUserImagePath(req.protocol, req.hostname, result.id) + result.picture;
    }

    res.status(200).send({
        data: {
            id: parseInt(result.id),
            name: result.name,
            email: result.email,
            phone_number: result.phone_number,
            birthday: result.birthday,
            address: result.address,
            picture: result.picture
        }
    });
    return;
};

const updateUserInfo = async (req, res) => {
    const data = req.body;
    
    if (!data.id) {
        res.status(400).send({error: 'Request Error: id is required.'});
        return;
    }

    if (data.name === undefined || data.email === undefined ||
        data.phone_number === undefined || data.birthday === undefined ||
        data.address === undefined
    ) {
        res.status(400).send({error: 'Request Error: All field is required.'});
        return;
    }

    const result = await User.updateUserInfo(data);
    if (result.error) {
        res.status(500).send({error: 'Database Query Error'});
        return;
    }

    res.status(200).send({
        data: {
            id: parseInt(result.id),
            name: result.name,
            email: result.email,
            phone_number: result.phone_number,
            birthday: result.birthday,
            address: result.address,
        }
    });
}

const updateUserImage = async (req, res) => {
    const data = req.body;
    const file = req.files.image;

    if (!data.id) {
        res.status(400).send({error: 'Request Error: id is required.'});
        return;
    }

    // check if multer upload file successfully
    if (!file && data.id != req.user.id) {
        res.status(400).send({error: 'Forbidden'});
        return;
    }

    if (!file) {
        res.status(400).send({error: 'Request Error: image is required.'});
        return;
    }

    const result = await User.updateUserImage(file[0].filename, data.id);
    if (result.error) {
        res.status(500).send({error: 'Database Query Error'});
        return;
    }

    if (result.picture !== null) {
        result.picture = getUserImagePath(req.protocol, req.hostname, result.id) + result.picture;
    }

    res.status(200).send({
        data: {
            id: result.id,
            picture: result.picture,
        }
    });
}

module.exports = {
    signUp,
    signIn,
    getUserProfile,
    updateUserInfo,
    updateUserImage,
};

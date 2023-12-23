const router = require('express').Router();

const {
    uploadUserImage,
    wrapAsync,
    authentication
} = require('../../util/util');

const {
    signUp,
    signIn,
    getUserProfile,
    updateUserInfo,
    updateUserImage
} = require('../controllers/user_controller');

const cpUpload = uploadUserImage.fields([
    { name: 'image', maxCount: 1 },
])

router.route('/user/signup')
    .post(wrapAsync(signUp));

router.route('/user/signin')
    .post(wrapAsync(signIn));

router.route('/user/profile')
    .get(authentication(), wrapAsync(getUserProfile));

router.route('/user/profile')
    .put(authentication(), wrapAsync(updateUserInfo));

router.route('/user/picture')
    .put(authentication(), cpUpload, wrapAsync(updateUserImage));

module.exports = router;
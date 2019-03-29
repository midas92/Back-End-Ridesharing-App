const express = require('express');
const router = express.Router();

const { authenticateUserLogin, encryptPassword } = require('../../../middlewares/auth');
const { fetchUserById, updateUser } = require('../../../middlewares/user');
const { createNewUserForDatabase } = require('../../../helpers/creator');
const Message = require('../../../models/message');

/* 
/api/user/edit-profile
/api/user/edit-profile-with-password
/api/user/push-token
*/

const prepareForPasswordEncrypt = (req, res, next) => {
    if('newPassword' in req.body){
        req.body.password = req.body.newPassword;
        delete req.body.newPassword;
    }
    
    next();
};

const prepareUpdatedUserInfo = (req, res, next) => {
    req.updatedUserInfo = createNewUserForDatabase(req.body);

    next();
};

const prepareUpdatedUserInfoAndPassword = (req, res, next) => {
    if(req.authenticated === true){
        req.updatedUserInfo = createNewUserForDatabase(req.body);
        next();
    }else{
        return res.status(401).json({
            message: 'Current password not correct!'
        });
    }
};

const returnResponse = (req, res) => {
    res.status(200).json({
        success: true
    });
};

const storePushToken = (req, res, next) => {
    const { pushToken } = req.body;

    if(!pushToken){
        return res.status(400).json({
            message: "pushToken not in request body"
        });
    }

    if(req.user.pushTokens.indexOf(pushToken) > -1 ){
        return res.status(400).json({
            message: "token already exists"
        });
    }

    req.user.pushTokens.push(pushToken);
    req.user.save();
    next();
};

const getUnreadMessagesCount = (req, res) => {
    const userId = req.userIdentity._id.toString();

    Message.count(
        { $and: [ {$or: [ { 'senderId': userId }, { 'receiverId': userId } ]}, {'isRead': false} ] },
        (error, count) =>{
            return res.status(400).json({
                count: count
            });
        }
    );
};

router.post('/edit-profile',
    fetchUserById,
    prepareUpdatedUserInfo,
    updateUser,
    returnResponse
);

router.post('/edit-profile-with-password',
    fetchUserById,
    authenticateUserLogin,
    prepareForPasswordEncrypt,
    encryptPassword,
    prepareUpdatedUserInfoAndPassword,
    updateUser,
    returnResponse
);

router.post('/push-token',
    fetchUserById,
    storePushToken,
    returnResponse
);

router.post('/unread-messages-count',
    getUnreadMessagesCount
);

module.exports = router;
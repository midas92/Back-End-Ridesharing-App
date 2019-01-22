
const { Message } = require('../models');

let users = {};  // this is a list of socket ids for all users

const onUserJoined = (message, socket) => {
    console.log(message);

    let user = message.text;
    users[user] = socket.id;
    sendExistingMessages(user, socket);
};

const sendExistingMessages = (user, socket) => {

    Message.find({ $or: [ { 'senderId': user }, { 'recieverId': user } ]  })
        .sort({ 'createdAt': -1 })
        .exec( (err, messages) => {
            if (err){
                console.log(err);
            }else{
                if (!messages.length) return;
                let _messages = [];
                for(let i = 0; i < messages.length; i++){
                    let m = Object.assign({}, messages[i]._doc);
                    m.user = { id: user };
                    m._id = m.messageId;
                    _messages.push(m);
                }
                //console.log(_messages);
                socket.emit('message', _messages);
            }
        });
};

const onMessageReceived = (message) => {
    
    //console.log(message);

    const newMessage = new Message({
        senderId: message.user.id,
        receiverId: 'server',
        text: message.text,
        createdAt: message.createdAt,
        messageId: message._id
    });

    newMessage.save()
        .catch(err => {
            console.log('insert message error: ', err);
        });
};


module.exports = {
    onUserJoined,
    onMessageReceived,
};
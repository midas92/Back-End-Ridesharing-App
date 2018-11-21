const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const user = new Schema({
   _id: ObjectId,
   email: {type: String, unique : true, required: true},
   password: {type: String, required: true},
   userName: {type: String, required: true}
});

module.exports = mongoose.model('User', user);
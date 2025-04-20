const mongoose = require('mongoose');

mongoose.connect("mongodb://127.0.0.1:27017/TejLikho");

const userSchema = mongoose.Schema({
    email : String,
    password : String,
    name : String,
    username : String
});

module.exports = mongoose.model('user', userSchema);
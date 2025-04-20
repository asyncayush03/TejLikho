const mongoose = require('mongoose');

mongoose.connect("mongodb://127.0.0.1:27017/TejLikho");

const dataSchema = mongoose.Schema({
    totaltests:{
        type: Number,
        default : 0
    },
    maxSpeed : {
        type: Number,
      default: 0
    },
    avgSpeed: {
      type: Number,
      default: 0
    },
    userinfo:{
      type : mongoose.Schema.Types.ObjectId,
      ref : "user"
    }
});

module.exports = mongoose.model('data', dataSchema);
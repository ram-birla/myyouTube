const mongoose = require("mongoose");


const video_Schema = new mongoose.Schema({
    filePath: {
        type: String,
        required: true
    },
    thumbnail: {
        type:String,
        required: true
    },
    title: {
        type:String,
        required: true
    },
    description:{
        type:String,
        required: false
    },
    tags: {
        type:String,
        required: false
    },
    category: {
        type:String,
        required: true
    },
    hours: {
        type: Number,
        required: true
    },
    minutes: {
        type: Number,
        required: true
    },
    seconds:{
        type: Number,
        required: true
    },
    watch:{
        type: Date,
        requird: true
    },
    views: {
        type: Number,
        default: 0

    },
    playlist: {
        type: String,

    },
    likers:[{
        type : mongoose.Schema.Types.ObjectId,
        ref: "Like",
        required: false
    }],
    dislikers:[{
        type : mongoose.Schema.Types.ObjectId,
        ref: "Dislike",
        required: false
    }],
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
        required: false
    }],
    user: {
        type : mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
},
{
    timestamps: true
});



module.exports = mongoose.model("Video", video_Schema)

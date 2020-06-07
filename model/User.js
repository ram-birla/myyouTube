const mongoose = require("mongoose");

const user_Schema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    coverPhoto: {
        type: String,
        required: false
    },
    image: {
        type: String,
        required: false,
        default: "/public/images/user.png"
    },
    subscriber:{
        type: Number,
        default: 0
    },
    subscription: [{
        type : mongoose.Schema.Types.ObjectId,
        ref: "Subscriber",
        required: false
    }],
    playlists: [{
        type : mongoose.Schema.Types.ObjectId,
        ref: "Playlist",
        required: false 
    }],
    videos: [{
        type : mongoose.Schema.Types.ObjectId,
        ref: "Video",
        required: false
    }],
    history: [{
        type : mongoose.Schema.Types.ObjectId,
        ref: "History",
        required: false
    }],
    notifications: [{
        type : mongoose.Schema.Types.ObjectId,
        ref: "Notification",
        required: false
    }],
    
});



module.exports = mongoose.model("User", user_Schema) || mongoose.models['User']



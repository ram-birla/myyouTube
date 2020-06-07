const mongoose = require("mongoose");

const notification_schema = new mongoose.Schema({
    typ:{
        type : String,
        required: false
    },
    video_watch:{
        type: Date,
        requird: true
    },
    comment: {
        type : mongoose.Schema.Types.ObjectId,
        ref: "Comment",
        required: false
    },
    reply : {
        type : mongoose.Schema.Types.ObjectId,
        ref: "Replies",
        required: false
    },
    post: {
        type : mongoose.Schema.Types.ObjectId,
        ref: "Video",
        required: true
    },
    user: {
        type : mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    is_read: {
        type: Boolean,
        default: false,
        required: false
    }
},
{
    timestamps: true
})

module.exports = mongoose.model("Notification", notification_schema)
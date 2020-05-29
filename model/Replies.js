const mongoose = require("mongoose");

const reply_schema = new mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    comment: {
        type : mongoose.Schema.Types.ObjectId,
        ref: "Comment",
        required: true
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
    }
},
{
    timestamps: true
})

module.exports = mongoose.model("Replies", reply_schema)
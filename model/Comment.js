const mongoose = require("mongoose");

const comment_schema = new mongoose.Schema({
    content: {
        type: String,
        required: true
    },   
    replies:[{
        reply:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Replies",
        required: false
        
    },
    usr : {
            type : mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
}],
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

module.exports = mongoose.model("Comment", comment_schema)
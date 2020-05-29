const mongoose = require("mongoose");

const history_schema = new mongoose.Schema({
    watched:{
        type: Date,
        requird: true
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

module.exports = mongoose.model("History", history_schema)
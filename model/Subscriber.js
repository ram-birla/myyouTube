const mongoose = require("mongoose");

const subscriber_schema = new mongoose.Schema({
    channel: {
        type : mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    subscriber: {
        type : mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
},
{
    timestamps: true
})

module.exports = mongoose.model("Subscriber", subscriber_schema)
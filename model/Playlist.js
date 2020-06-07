const mongoose = require("mongoose");

const playlist_schema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    videos: [{
        type : mongoose.Schema.Types.ObjectId,
        ref: "Video",
        required: false
    }],
    user: {
        type : mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
})

module.exports = mongoose.model("Playlist", playlist_schema)
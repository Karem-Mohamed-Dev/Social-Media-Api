const { Schema, model } = require("mongoose");

const postSchema = new Schema({
    description: { type: String, default: "", maxlength: [500, "description Can't be more than 500 chars"] },
    media: [{ type: String }],
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    comments: { type: Number, default: 0 },
    author: { type: Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

module.exports = model("Post", postSchema);
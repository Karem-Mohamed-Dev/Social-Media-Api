const { Schema, model } = require("mongoose");

const postSchema = new Schema({
    description: { type: String, default: "", maxlength: [500, "description Can't be more than 500 chars"] },
    media: [{ mediaType: String, link: String, publicId: String }],
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    likesCount: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    author: { type: Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

module.exports = model("Post", postSchema);
const { Schema, model } = require("mongoose");

const commentSchema = new Schema({
    content: { type: String, required: [true, "Comment content is required"] },
    parentId: { type: Schema.Types.ObjectId, required: [true, "Parent id is required"] },
    likes: { type: Number, default: 0 },
    author: { type: Schema.Types.ObjectId, ref: "User" },
    replays: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = model("Comment", commentSchema);
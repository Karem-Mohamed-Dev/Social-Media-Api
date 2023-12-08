const { Schema, model } = require("mongoose");

const userSchema = new Schema({
    name: {
        type: String,
        required: [true, "User name is required"],
        minlength: [3, "User name can't be less than 3"],
        maxlength: [20, "User name can't be more than 20"],
        unique: [true, "User name must be unique"]
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: [true, "Email must be unique"]
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [6, "Password can't be less than 6"],
    },
    bio: { type: String, default: "" },
    posts: [{ type: Schema.Types.ObjectId, ref: "Post" }],
    saved: [{ type: Schema.Types.ObjectId, ref: "Post" }],
    picture: { type: String, default: "" },
    followers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    followings: [{ type: Schema.Types.ObjectId, ref: "User" }],
    isAdmin: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = model("User", userSchema);
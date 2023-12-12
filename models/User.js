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
    resetPass: { code: { type: String, default: null }, expire: { type: Date, default: null } },
    bio: { type: String, default: "" },
    posts: [{ type: Schema.Types.ObjectId, ref: "Post" }],
    saved: [{ type: Schema.Types.ObjectId, ref: "Post" }],
    picture: { type: String, default: "" },
    pictureId: { type: String, default: "" },
    followers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    followings: [{ type: Schema.Types.ObjectId, ref: "User" }],
    followersCount: { type: Number, default: 0 },
    followingsCount: { type: Number, default: 0 },
    isAdmin: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = model("User", userSchema);
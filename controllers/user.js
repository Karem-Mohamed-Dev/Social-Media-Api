// Search For User

const User = require("../models/User");
const { errorModel } = require("../utils/errorModel");
const Post = require("../models/Post")

// Get Profile
exports.getUser = async (req, res, next) => {
    const { userId } = req.params;
    const userFilter = ["_id", "name", "email", "bio", "picture", "followersCount", "followingsCount"];

    try {
        const user = await User.findById(userId, userFilter);
        if (!user) return next(errorModel(404, "User not found"));

        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
}

// Get User Posts
exports.getUserPosts = async (req, res, next) => {
    const { userId } = req.params;

    try {
        const posts = await User.findById(userId, ["posts"]).populate("posts");
        if (!posts) return next(errorModel(404, "Not found"));

        res.status(200).json(posts.posts);
    } catch (error) {
        next(error);
    }
}

// Update Profile
exports.updateUser = async (req, res, next) => {
    const {path} = req.file;
    console.log(path)
    res.status(200).json(path)
    // const user = req.user;
    // const { name, email, bio, picture } = req.body;
    // const query = {}
    // if(name) query.name = name;
    // if(email) query.email = email;
    // if(bio) query.bio = bio;

    // try {
    //     const user = await User.findById(user._id);
    //     if (!user) return next(errorModel(404, "User not found"));


    // } catch (error) {
    //     next(error);
    // }

}
// Delete Profile
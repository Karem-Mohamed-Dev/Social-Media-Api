const User = require("../models/User");
const { errorModel } = require("../utils/errorModel");
const Post = require("../models/Post")
const cloudinary = require("cloudinary").v2;

cloudinary.config({
    cloud_name: "dq1hhuawl",
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
})


// Search For User



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
    const userFilter = ["_id", "name", "email", "bio", "picture"];

    const { name, email, bio } = req.body;
    const picture = req.file ? req.file.path : null;
    let imageUrl = null;
    if (picture) {
        try {
            const result = await cloudinary.uploader.upload(picture, { folder: "user_picture" });
            imageUrl = result.secure_url;
        } catch (error) {
            next(error)
        }
    }
    const tokenData = req.user;
    const query = {}
    if (name) query.name = name;
    if (email) query.email = email;
    if (bio) query.bio = bio;
    if (imageUrl) query.picture = imageUrl;

    try {
        const user = await User.findById(tokenData._id, userFilter);
        if (!user) return next(errorModel(404, "User not found"));

        user.name = name || user.name;
        user.email = email || user.email;
        user.imageUrl = picture || user.picture;
        user.bio = bio || user.bio;

        const updatedUser = await user.save();

        res.status(200).json(updatedUser);
    } catch (error) {
        next(error);
    }

}

// Follow 

// Delete Profile
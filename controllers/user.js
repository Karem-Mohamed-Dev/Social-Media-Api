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
exports.follow = async (req, res, next) => {
    const tokenData = req.user;
    const { userId } = req.body;
    if (!userId) next(errorModel(400, "User id is required"));

    if (tokenData._id === userId) return next(errorModel(400, "You Can't follow yourself"));

    try {
        const currentUser = await User.findById(tokenData._id);
        if (!currentUser) return next(errorModel(404, "No Current User found with this id"));

        const targetUser = await User.findById(userId);
        if (!targetUser) return next(errorModel(404, "Nor Target User found with this id"));

        if (currentUser.followings.includes(userId)) return next(errorModel(400, "You already following him"))

        currentUser.followings.push(userId);
        targetUser.followers.push(tokenData._id);

        currentUser.followingsCount += 1;
        targetUser.followersCount += 1;

        await currentUser.save();
        await targetUser.save();

        res.status(200).json({ msg: "Followed Successfuly" });

    } catch (error) {
        next(error);
    }
}

// UnFollow 
exports.unfollow = async (req, res, next) => {
    const tokenData = req.user;
    const { userId } = req.body;
    if (!userId) next(errorModel(400, "User id is required"));

    if (tokenData._id === userId) return next(errorModel(400, "You Can't Unfollow yourself"));

    try {
        const currentUser = await User.findById(tokenData._id);
        if (!currentUser) return next(errorModel(404, "No Current User found with this id"));

        const targetUser = await User.findById(userId);
        // if (!targetUser) return next(errorModel(404, "Nor Target User found with this id"));

        if (!currentUser.followings.includes(userId)) return next(errorModel(400, "You aren't following him already"))

        currentUser.followings.pull(userId);
        if (targetUser) targetUser.followers.pull(tokenData._id);

        currentUser.followingsCount -= 1;
        if (targetUser) targetUser.followersCount -= 1;

        await currentUser.save();
        if (targetUser) await targetUser.save();

        res.status(200).json({ msg: "UnFollowed Successfuly" });

    } catch (error) {
        next(error);
    }
}

// Delete Profile
exports.deleteAccount = async (req, res, next) => {
    const tokenData = req.user;

    try {
        const user = await User.findById(tokenData._id);
        if (!user) return next(errorModel(404, "User with id not found"));
        await User.updateMany({ followers: tokenData._id }, { $pull: { followers: tokenData._id }, $inc: { followersCount: -1 } });
        await user.deleteOne();
        res.status(200).json({ msg: "Deleted Successfuly" });
    } catch (error) {
        next(error);
    }
}
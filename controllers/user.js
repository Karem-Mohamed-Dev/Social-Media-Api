const User = require("../models/User");
const { errorModel } = require("../utils/errorModel");
const bcrypt = require("bcrypt");
const { cloudinary } = require("../utils/uploadUserProfile")

// Search For User
exports.search = async (req, res, next) => {
    const { name } = req.query;
    if (name.length < 3) return next(errorModel(400, "Atleast 3 charachters"));

    try {
        const users = await User.find({ name: { $regex: name, $options: "i" } }, ["_id", "name", "picture"]).limit(10);
        res.status(200).json(users);
    } catch (error) { next(error) }
}

// Get Profile
exports.getUser = async (req, res, next) => {
    const { userId } = req.params;

    const userFilter = ["_id", "name", "email", "bio", "picture", "followersCount", "followingsCount"];

    try {
        const user = await User.findById(userId, userFilter);
        if (!user) return next(errorModel(404, "User not found"));

        res.status(200).json(user);
    } catch (error) { next(error) }
}

// Update Profile
exports.updateUser = async (req, res, next) => {
    const { name, email, bio } = req.body;
    if (!name && !email && !bio) return next(errorModel(400, "Provide atleast one field"));

    const userFilter = ["_id", "name", "email", "bio", "picture", "pictureId"];
    const tokenData = req.user;
    const picture = req.file ? req.file.path : null;

    try {
        const user = await User.findById(tokenData._id, userFilter);
        if (!user) return next(errorModel(404, "User not found"));

        if (picture) {
            if (user.pictureId) await cloudinary.uploader.destroy(user.pictureId)
            const result = await cloudinary.uploader.upload(picture, { folder: "user_picture" });
            user.picture = result.secure_url;
            user.pictureId = result.public_id
        }

        user.name = name || user.name;
        user.email = email || user.email;
        user.bio = bio || user.bio;
        const updatedUser = await user.save();

        res.status(200).json(updatedUser);
    } catch (error) { next(error) }

}

// Follow 
exports.follow = async (req, res, next) => {
    const tokenData = req.user;
    const { userId } = req.params;
    if (tokenData._id === userId) return next(errorModel(400, "You Can't follow yourself"));

    try {
        const currentUser = await User.findById(tokenData._id);
        if (!currentUser) return next(errorModel(404, "No Current User found with this id"));

        const targetUser = await User.findById(userId);
        if (!targetUser) return next(errorModel(404, "Nor Target User found with this id"));

        if (currentUser.followings.includes(userId)) return next(errorModel(400, "You already following him"));

        currentUser.followings.push(userId);
        targetUser.followers.push(tokenData._id);

        currentUser.followingsCount += 1;
        targetUser.followersCount += 1;

        await currentUser.save();
        await targetUser.save();

        res.status(200).json({ msg: "Followed Successfuly" });
    } catch (error) { next(error) }
}

// UnFollow 
exports.unfollow = async (req, res, next) => {
    const tokenData = req.user;
    const { userId } = req.params;
    if (tokenData._id === userId) return next(errorModel(400, "You Can't Unfollow yourself"));

    try {
        const currentUser = await User.findById(tokenData._id);
        if (!currentUser) return next(errorModel(404, "No Current User found with this id"));

        const targetUser = await User.findById(userId);

        if (!currentUser.followings.includes(userId)) return next(errorModel(400, "You aren't following him already"));

        currentUser.followings.pull(userId);
        if (targetUser) targetUser.followers.pull(tokenData._id);

        currentUser.followingsCount -= 1;
        if (targetUser) targetUser.followersCount -= 1;

        await currentUser.save();
        if (targetUser) await targetUser.save();

        res.status(200).json({ msg: "UnFollowed Successfuly" });
    } catch (error) { next(error) }
}

// Get Followers
exports.getFollowers = async (req, res, next) => {
    const { userId } = req.params;
    const group = +req.query.group || 1;
    const limit = 10;
    const skip = (group - 1) * limit;

    try {
        const user = await User.findById(userId)
            .select("followers")
            .slice("followers", [skip, limit])
            .populate("followers", ["_id", "name", "picture"]);

        res.status(200).json(user.followers);
    } catch (error) { next(error) }
}

// Get Followings
exports.getFollowings = async (req, res, next) => {
    const { userId } = req.params;
    const group = +req.query.group || 1;
    const limit = 10;
    const skip = (group - 1) * limit;

    try {
        const user = await User.findById(userId, "followings")
            .slice("followings", [skip, limit])
            .populate("followings", ["_id", "name", "picture"]);

        res.status(200).json(user.followings);
    } catch (error) { next(error) }
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
    } catch (error) { next(error) }
}

// Change Pass
exports.ChangePass = async (req, res, next) => {
    const tokenData = req.user;
    const { oldPass, newPass } = req.body;

    if (!oldPass || !newPass) return next(errorModel(400, "All fields are required"))
    if (newPass < 6) return next(errorModel(400, "Password must be atleast 6"));

    try {
        const user = await User.findById(tokenData._id);
        if (!user) return next(errorModel(404, "No user found with this id"));

        const isValidPass = await bcrypt.compare(oldPass, user.password);
        if (!isValidPass) return next(errorModel(401, "Old password is wrong"));


        const isEqual = await bcrypt.compare(newPass, user.password);
        if (isEqual) return next(errorModel(400, "New password and old password must be different"))

        const hash = await bcrypt.hash(newPass, 10);
        user.password = hash;
        await user.save();

        res.status(200).json({ msg: "User Password Updated" });
    } catch (error) { next(error) }
}
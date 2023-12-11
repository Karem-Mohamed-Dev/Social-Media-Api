const User = require('../models/User')
const Post = require('../models/Post')
const Comment = require('../models/Comment')
const { errorModel } = require('../utils/errorModel')
const { cloudinary } = require('../utils/uploadUserProfile')

// Feed
exports.feed = async (req, res, next) => {

}

// Get User Posts
exports.getUserPosts = async (req, res, next) => {

}

// Get Post
exports.getSinglePost = async (req, res, next) => {

}


// --------------------------------------------

// Add Post
exports.addPost = async (req, res, next) => {
    const files = req.files;
    const tokenData = req.user;
    const { description } = req.body;
    let media = [];

    try {
        if (files) {
            for (let file of files) {
                const fileType = file.mimetype.split("/")[0]
                const { secure_url, public_id } = await cloudinary.uploader.upload(file.path, { folder: "post_media", resource_type: fileType });
                media.push({ mediaType: fileType, link: secure_url, publicId: public_id });
            }
        }

        if (!files && !description) return next(errorModel(404, "Post Can't be empty"));

        const user = await User.findById(tokenData._id);
        if (!user) return next(errorModel(404, "No user found with this id"));

        const post = await Post.create({ description, author: user._id, media });
        return res.status(201).json(post)
    } catch (error) {
        next(error)
    }
}

// Edit Post
exports.editPost = async (req, res, next) => {
    const tokenData = req.user;
    const { postId } = req.params;
    const files = req.files;
    const { description } = req.body;
    const media = [];

    try {
        const user = await User.findById(tokenData._id, ["_id"]);
        if (!user) return next(errorModel(404, "No user found with this id"));

        if (files) {
            for (let file of files) {
                const fileType = file.mimetype.split("/")[0];
                const { secure_url, public_id } = await cloudinary.uploader.upload(file.path, { folder: "post_media", resource_type: fileType });
                media.push({ mediaType: fileType, link: secure_url, publicId: public_id });
            }
        }

        const post = await Post.findById(postId, ["-likes", "-updatedAt", "-__v"]).populate("author", ["_id", "name", "picture"]);
        if (!post) return next(errorModel(404, "Post with this id not found"));

        if (post.author._id.toString() !== user._id.toString()) return next(errorModel(401, "Not Authorized Must be the post creator"));

        post.description = description.trim();
        post.media = [...post.media, ...media];

        const result = await post.save();
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
}

// Delete Post Media
exports.deletePostMedia = async (req, res, next) => {
    const tokenData = req.user;
    const { postId } = req.params;
    const { publidIds } = req.body;

    if (!publidIds) return next(errorModel(400, "Public Ids array is required"));
    if (publidIds.length === 0) return next(errorModel(400, "Public Ids array is Empty"));

    try {
        const user = await User.findById(tokenData._id, ["_id"]);
        if (!user) return next(errorModel(404, "No user found with this id"));

        const post = await Post.findById(postId, ["-likes", "-updatedAt", "-__v"]).populate("author", ["_id", "name", "picture"]);
        if (!post) return next(errorModel(404, "Post with this id not found"));
        let media = post.media;

        if (post.author._id.toString() !== user._id.toString()) return next(errorModel(401, "Not Authorized Must be the post creator"));

        for (let i = 0; i < publidIds.length; i++) {
            if (!publidIds[i].id || !publidIds[i].fileType) continue;
            if (!media.find(ele => ele.publicId === publidIds[i].id)) continue;
            await cloudinary.uploader.destroy(publidIds[i].id, { resource_type: publidIds[i].fileType });
            media = media.filter(ele => ele.publicId !== publidIds[i].id);
        }

        post.media = media;
        const result = await post.save();

        res.status(200).json(result);
    } catch (error) {
        next(error);
    }

}

// Delete Post
exports.deletePost = async (req, res, next) => {
    const tokenData = req.user;
    const { postId } = req.params;

    try {
        const user = await User.findById(tokenData._id, ["_id"]);
        if (!user) return next(errorModel(404, "No user found with this id"));

        const post = await Post.findById(postId, ["-likes", "-updatedAt", "-__v"]);
        if (!post) return next(errorModel(404, "Post with this id not found"));

        if (post.author._id.toString() !== user._id.toString()) return next(errorModel(401, "Not Authorized Must be the post creator"));

        for (let media of post.media)
            await cloudinary.uploader.destroy(media.publicId);

        await post.deleteOne();

        res.status(200).json({ msg: "Post Deleted" });
    } catch (error) {
        next(error);
    }
}


// --------------------------------------------

// Save Post
exports.savePost = async (req, res, next) => {

}

// Get Users Who Likes The Post
exports.getLikes = async (req, res, next) => {

}

// Like Post
exports.likePost = async (req, res, next) => {

}

// UnLike Post
exports.unLikePost = async (req, res, next) => {

}


// --------------------------------------------


// Get Comments
exports.getComments = async (req, res, next) => {

}

// Add Comment
exports.addComment = async (req, res, next) => {

}

// replay Comment
exports.replayComment = async (req, res, next) => {

}

// Delete Comment
exports.deleteComment = async (req, res, next) => {

}
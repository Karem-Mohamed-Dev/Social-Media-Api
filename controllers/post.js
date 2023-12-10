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

}

// Delete Post
exports.deletePost = async (req, res, next) => {

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
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
    const { userId } = req.params;

    try {
        const user = await User.findById(userId, "posts")
            .populate({
                path: "posts",
                select: ["-likes", "-updatedAt", "-__v"],
                populate: { path: "author", select: ["_id", "name", "picture"] }
            });
        if (!user) return next(errorModel(404, "No user found with this id"));

        res.status(200).json(user.posts);
    } catch (error) {
        next(error);
    }
}

// Get Post
exports.getSinglePost = async (req, res, next) => {
    const { postId } = req.params;

    try {
        const post = await Post.findById(postId, ["-likes", "-updatedAt", "-__v"]);
        if (!post) return next(errorModel(404, "Post with this id not found"));

        res.status(200).json(post);
    } catch (error) {
        next(error);
    }
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
        user.posts.push(post._id);
        await user.save();
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
        const user = await User.findById(tokenData._id, ["_id", "posts"]);
        if (!user) return next(errorModel(404, "No user found with this id"));

        const post = await Post.findById(postId, ["-likes", "-updatedAt", "-__v"]);
        if (!post) return next(errorModel(404, "Post with this id not found"));

        if (post.author._id.toString() !== user._id.toString()) return next(errorModel(401, "Not Authorized Must be the post creator"));

        for (let media of post.media)
            await cloudinary.uploader.destroy(media.publicId);

        await User.updateMany({ saved: postId }, { $pull: { saved: postId } });

        user.posts.pull(post._id);
        await post.deleteOne();
        await user.save();

        res.status(200).json({ msg: "Post Deleted" });
    } catch (error) {
        next(error);
    }
}


// --------------------------------------------

// Get Saved Posts
exports.getSavedPosts = async (req, res, next) => {
    const tokenData = req.user;
    const page = +req.query.page || 1
    const limit = 10;
    const skip = (page - 1) * limit;

    try {
        const user = await User.findById(tokenData._id)
            .select("saved").slice("saved", [skip, limit])
            .populate({
                path: "saved",
                select: ["-likes", "-updatedAt", "-__v"],
                populate: { path: "author", select: ["_id", "name", "picture"] }
            });

        if (!user) return next(errorModel(404, "No user found with this id"));

        res.status(200).json(user.saved)
    } catch (error) {
        next(error);
    }

}

// Save Post
exports.savePost = async (req, res, next) => {
    const tokenData = req.user;
    const { postId } = req.params;

    try {
        const user = await User.findById(tokenData._id, ["_id", "saved"]);
        if (!user) return next(errorModel(404, "No user found with this id"));

        if (user.saved.includes(postId)) return next(errorModel(400, "Post already saved"));

        const post = await Post.findById(postId, ["-likes", "-updatedAt", "-__v"]);
        if (!post) return next(errorModel(404, "Post with this id not found"));

        user.saved.push(postId);
        await user.save();

        res.status(200).json({ msg: "Post Saved" })
    } catch (error) {
        next(error);
    }
}

// UnSave Post
exports.unSavePost = async (req, res, next) => {
    const tokenData = req.user;
    const { postId } = req.params;

    try {
        const user = await User.findById(tokenData._id, ["_id", "saved"]);
        if (!user) return next(errorModel(404, "No user found with this id"));

        if (!user.saved.includes(postId)) return next(errorModel(400, "Post is not saved already"));

        const post = await Post.findById(postId, ["-likes", "-updatedAt", "-__v"]);
        if (!post) return next(errorModel(404, "Post with this id not found"));

        user.saved.pull(postId);
        await user.save();

        res.status(200).json({ msg: "Post UnSaved" })
    } catch (error) {
        next(error);
    }
}


// Get Users Who Likes The Post
exports.getLikes = async (req, res, next) => {
    const tokenData = req.user;
    const { postId } = req.params
    const page = +req.query.page || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    try {
        const user = await User.findById(tokenData._id, "_id");
        if (!user) return next(errorModel(404, "No user found with this id"));

        const post = await Post.findById(postId, "likes")
            .populate("likes", ["_id", "name", "picture"])
            .slice("likes", [skip, limit]);
        if (!post) return next(errorModel(404, "Post with this id not found"));

        res.status(200).json(post.likes)
    } catch (error) {
        next(error);
    }
}

// Like Post
exports.likePost = async (req, res, next) => {
    const tokenData = req.user;
    const { postId } = req.params;

    try {
        const user = await User.findById(tokenData._id, ["_id"]);
        if (!user) return next(errorModel(404, "No user found with this id"));

        const post = await Post.findById(postId, ["likes", "likesCount"]);
        if (!post) return next(errorModel(404, "Post with this id not found"));

        if (post.likes.includes(user._id)) return next(errorModel(400, "Post already liked"));

        post.likes.push(user._id);
        post.likesCount += 1;
        await post.save();

        res.status(200).json({ msg: "Post Liked" })
    } catch (error) {
        next(error);
    }
}

// UnLike Post
exports.unLikePost = async (req, res, next) => {
    const tokenData = req.user;
    const { postId } = req.params;

    try {
        const user = await User.findById(tokenData._id, ["_id"]);
        if (!user) return next(errorModel(404, "No user found with this id"));

        const post = await Post.findById(postId, ["likes", "likesCount"]);
        if (!post) return next(errorModel(404, "Post with this id not found"));

        if (!post.likes.includes(user._id)) return next(errorModel(400, "Post is not liked already"));

        post.likes.pull(user._id);
        post.likesCount -= 1;
        await post.save();

        res.status(200).json({ msg: "Post Liked" })
    } catch (error) {
        next(error);
    }
}


// --------------------------------------------


// Get Comments
exports.getComments = async (req, res, next) => {
    const tokenData = req.user;
    const { postId } = req.params;
    const page = +req.query.page || 1;
    const limit = 2;
    const skip = (page - 1) * limit;

    try {
        const user = await User.findById(tokenData._id, "_id");
        if (!user) return next(errorModel(404, "No user found with this id"));

        const post = await Post.findById(postId, "comments");
        if (!post) return next(errorModel(404, "Post with this id not found"));

        const comments = await Comment.find({ parentId: post._id }, ["-likesArr", "-updatedAt", "-__v"])
            .skip(skip).limit(limit);

        res.status(200).json(comments);
    } catch (error) {
        next(error);
    }

}

// Add Comment
exports.addComment = async (req, res, next) => {
    const tokenData = req.user;
    const { postId } = req.params;
    const { content } = req.body;

    if (!content) return next(errorModel(400, "Comment can't be empty"));

    try {
        const user = await User.findById(tokenData._id, "_id");
        if (!user) return next(errorModel(404, "No user found with this id"));

        const post = await Post.findById(postId, "comments");
        if (!post) return next(errorModel(404, "Post with this id not found"));

        post.comments += 1;

        const comment = await Comment.create({ content, parentId: post._id, author: user._id });
        await post.save();

        res.status(200).json(comment)
    } catch (error) {
        next(error);
    }
}

// replay Comment
exports.replayComment = async (req, res, next) => {
    const tokenData = req.user;
    const { commentId } = req.params;
    const { content } = req.body;

    if (!content) return next(errorModel(400, "Comment can't be empty"));

    try {
        const user = await User.findById(tokenData._id, "_id");
        if (!user) return next(errorModel(404, "No user found with this id"));

        const comment = await Comment.findById(commentId, "replays");
        if (!comment) return next(errorModel(404, "Comment with this id not found"));

        comment.replays += 1;

        const replay = await Comment.create({ content, parentId: comment._id, author: user._id });
        await comment.save();

        res.status(200).json(replay);
    } catch (error) {
        next(error);
    }
}

// Delete replay
exports.deleteReplay = async (req, res, next) => {
    const tokenData = req.user;
    const { commentId } = req.params;

    try {
        const user = await User.findById(tokenData._id, "_id");
        if (!user) return next(errorModel(404, "No user found with this id"));

        const comment = await Comment.findById(commentId, ["parentId", "replays", "author"]);
        if (!comment) return next(errorModel(404, "Comment with this id not found"));

        if (user._id.toString() !== comment.author.toString()) return next(errorModel(401, "Not Authorized Must be the Comment creator"));

        const parentComment = await Comment.findById(comment.parentId, "replays");
        if (!parentComment) return next(errorModel(404, "Comment with this id not found"));
        parentComment.replays -= 1;

        await parentComment.save();
        if (comment.replays > 0) await Comment.deleteMany({ parentId: comment._id });
        await comment.deleteOne();

        res.status(200).json({ msg: "Replay Deleted" });
    } catch (error) {
        next(error);
    }
}

// Like Comment
exports.likeComment = async (req, res, next) => {
    const tokenData = req.user;
    const { commentId } = req.params;

    try {
        const user = await User.findById(tokenData._id, "_id");
        if (!user) return next(errorModel(404, "No user found with this id"));

        const comment = await Comment.findById(commentId, ["likes", "likesArr"]);
        if (!comment) return next(errorModel(404, "Comment with this id not found"));

        if (comment.likesArr.includes(user._id)) return next(errorModel(400, "You already liked it"));

        comment.likesArr.push(user._id);
        comment.likes += 1;
        await comment.save();

        res.status(200).json({ msg: "Comment Liked" });
    } catch (error) {
        next(error);
    }
}

// UnLike Comment
exports.unLikeComment = async (req, res, next) => {
    const tokenData = req.user;
    const { commentId } = req.params;

    try {
        const user = await User.findById(tokenData._id, "_id");
        if (!user) return next(errorModel(404, "No user found with this id"));

        const comment = await Comment.findById(commentId, ["likes", "likesArr"]);
        if (!comment) return next(errorModel(404, "Comment with this id not found"));

        if (!comment.likesArr.includes(user._id)) return next(errorModel(400, "You didn't like it already"));

        comment.likesArr.pull(user._id);
        comment.likes -= 1;
        await comment.save();

        res.status(200).json({ msg: "Comment UnLiked" });
    } catch (error) {
        next(error);
    }
}


// Delete Comment
exports.deleteComment = async (req, res, next) => {
    const tokenData = req.user;
    const { commentId } = req.params;

    try {
        const user = await User.findById(tokenData._id, "_id");
        if (!user) return next(errorModel(404, "No user found with this id"));

        const comment = await Comment.findById(commentId);
        if (!comment) return next(errorModel(404, "No comment with this is found"));

        if (comment.author.toString() !== user._id.toString()) return next(errorModel(401, "Not Authorized you must be the comment creator"))

        const post = await Post.findById(comment.parentId, "comments");
        if (!post) return next(errorModel(404, "Post with this id not found"));

        post.comments -= 1;

        if (comment.replays > 0) await Comment.deleteMany({ parentId: comment._id });
        await post.save();
        await comment.deleteOne();

        res.status(200).json({ msg: "Comment Deleted" })
    } catch (error) {
        next(error);
    }
}
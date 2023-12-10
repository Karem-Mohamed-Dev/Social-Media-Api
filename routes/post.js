const router = require("express").Router();

const { feed, getUserPosts, getSinglePost, addPost, editPost, deletePost, savePost, likePost, unLikePost, addComment, replayComment, deleteComment } = require("../controllers/post");

// Feed
router.get('/feed', feed)

// Get User Posts
router.get('/user/:userId', getUserPosts)

// Get Post
router.get('/single/:postId', getSinglePost)


// --------------------------------------------

// Add Post
router.post('/create', addPost)

// Edit Post
router.patch('/edit/:postId', editPost)

// Delete Post
router.delete('/delete/:postId', deletePost)


// --------------------------------------------

// Save Post
router.post('/save/:postId', savePost)

// Like Post
router.post('/like/:postId', likePost)

// UnLike Post
router.post('/unlike/:postId', unLikePost)


// --------------------------------------------

// Add Comment
router.post('/comment/:postId', addComment)

// replay Comment
router.post('/replay/:commentId', replayComment)

// Delete Comment
router.delete('/comment/:commentId', deleteComment)


module.exports = router;


module.exports = router;
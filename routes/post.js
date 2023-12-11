const router = require("express").Router();
const { isAuth } = require("../utils/isAuth");
const { upload } = require("../utils/uploadPostMedia")

const { feed, getUserPosts, getSinglePost, addPost, editPost, deletePostMedia, deletePost, getSavedPosts, savePost, unSavePost, getLikes, likePost, unLikePost, getComments, addComment, replayComment, deleteComment } = require("../controllers/post");

router.use(isAuth);

// Feed
router.get('/feed', feed)

// Get User Posts
router.get('/user/:userId', getUserPosts)

// Get Post
router.get('/single/:postId', getSinglePost)


// --------------------------------------------

// Add Post
router.post('/create', upload.array('file', 20), addPost)

// Edit Post
router.patch('/edit/:postId', upload.array('file', 20), editPost)

// Delete Post Media
router.delete('/delete-media/:postId', deletePostMedia)

// Delete Post
router.delete('/delete/:postId', deletePost)


// --------------------------------------------

// Get Users Who Likes This Post
router.get('/likes-data/:postId', getLikes)

// Get Saved Posts
router.get('/saved', getSavedPosts)

// Save Post
router.post('/save/:postId', savePost)

// UnSave Post
router.post('/unsave/:postId', unSavePost)

// Like Post
router.post('/like/:postId', likePost)

// UnLike Post
router.post('/unlike/:postId', unLikePost)


// --------------------------------------------


// Get Comments
router.get('/comments', getComments);

// Add Comment
router.post('/comment/:postId', addComment)

// replay Comment
router.post('/replay/:commentId', replayComment)

// Delete Comment
router.delete('/comment/:commentId', deleteComment)


module.exports = router;


module.exports = router;
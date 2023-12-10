const router = require("express").Router();
const upload = require("../utils/imageUploade");
const { isAuth } = require("../utils/isAuth")

const { getUser, search, getUserPosts, updateUser, follow, unfollow, deleteAccount, getFollowers, getFollowings, ChangePass } = require('../controllers/user');

// Get Profile
router.get('/profile/:userId', getUser);

// User Search
router.get('/search', search);

// Get User Posts
router.get('/posts/:userId', getUserPosts);

// Get User Followers
router.get("/:userId/followers", getFollowers)

// Get User Followers
router.get("/:userId/followings", getFollowings)

// ---------------------------------------------------------------------

// Auth Middleware
router.use(isAuth)

// Update Profile
router.put("/update", upload.single('image'), updateUser);

// follow 
router.post("/follow", follow);

// follow 
router.post("/unfollow", unfollow);


// Delete Profile
router.delete("/delete", deleteAccount);


// Change Password
router.put("/change-pass", ChangePass)

// Search For User

module.exports = router;
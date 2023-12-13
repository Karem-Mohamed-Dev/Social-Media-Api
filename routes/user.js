const router = require("express").Router();
const { isAuth } = require("../utils/isAuth")
const { upload } = require("../utils/uploadUserProfile")
const { getUser, search, updateUser, follow, unfollow, deleteAccount, getFollowers, getFollowings, ChangePass } = require('../controllers/user');

// Get Profile
router.get('/profile/:userId', getUser);

// User Search
router.get('/search', search);

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
router.post("/follow/:userId", follow);

// follow 
router.post("/unfollow/:userId", unfollow);

// Delete Profile
router.delete("/delete", deleteAccount);

// Change Password
router.put("/change-pass", ChangePass)

module.exports = router;
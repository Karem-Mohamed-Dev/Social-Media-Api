const router = require("express").Router();
const upload = require("../utils/imageUploade");
const { isAuth } = require("../utils/isAuth")

const { getUser, getUserPosts, updateUser, follow, unfollow, deleteAccount } = require('../controllers/user');

// Get Profile

router.get('/profile/:userId', getUser);

router.get('/posts/:userId', getUserPosts);
// Update Profile

router.use(isAuth)

// Update
router.post("/update", upload.single('image'), updateUser);

// follow 
router.post("/follow", follow);

// follow 
router.post("/unfollow", unfollow);


// Delete Profile
router.delete("/delete", deleteAccount);

// Search For User

module.exports = router;
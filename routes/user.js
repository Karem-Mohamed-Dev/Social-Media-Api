const router = require("express").Router();
const upload = require("../utils/imageUploade");
const { isAuth } = require("../utils/isAuth")

const { getUser, getUserPosts, updateUser } = require('../controllers/user');

// Get Profile

router.get('/profile/:userId', getUser);

router.get('/posts/:userId', getUserPosts);
// Update Profile

router.use(isAuth)

router.post("/update", upload.single('image'), updateUser);


// Delete Profile
// Search For User

module.exports = router;
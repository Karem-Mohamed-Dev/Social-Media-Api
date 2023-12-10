const router = require("express").Router();

const { login, register, getCode, verifyCode, setNewPass } = require("../controllers/auth");

// Login
router.post("/login", login);

// Register
router.post("/register", register);

// Forget Password

// send code to email
router.post("/forget-pass/get-code", getCode);

// Verify Code
router.post("/forget-pass/verify-code", verifyCode);

// Set New Password
router.post("/forget-pass/set-new-pass", setNewPass);

module.exports = router;
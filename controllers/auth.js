const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { errorModel } = require("../utils/errorModel")
const { isEmail } = require("validator");
const sendEmail = require('../utils/sendEmail');

const CreateToken = (_id, name) => {
    const token = jwt.sign({ _id, name }, process.env.SECRET, { expiresIn: "3d" });
    return token;
}

// Login
exports.login = async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) return next(errorModel(400, "All fields are required"));
    if (!isEmail(email)) return next(errorModel(400, "Please enter a valid email"));
    if (password.length < 6) return next(errorModel(400, "Password must be more than 6"));

    try {
        const user = await User.findOne({ email }, ["-resetPass", "-posts", "-saved", "-followers", "-followings", "-updatedAt", "-__v"]);
        if (!user) return next(errorModel(404, "User not found"));

        const isValidPass = await bcrypt.compare(password, user.password)
        if (!isValidPass) return next(errorModel(401, "Email or Password may be wrong"));

        const token = CreateToken(user._id, user.name);
        const { password: pass, ...info } = user._doc

        res.status(200).json({ ...info, token })
    } catch (error) { next(error) }
}

// Register
exports.register = async (req, res, next) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) return next(errorModel(400, "All fields are required"));
    if (name.length < 3) return next(errorModel(400, "Name nust be atleast 3 charachters"));
    if (!isEmail(email)) return next(errorModel(400, "Please enter a valid email"));
    if (password.length < 6) return next(errorModel(400, "Password must be more than 6"));

    try {
        const exist = await User.findOne({ email }, "_id");
        if (exist) return next(errorModel(400, "User already exists"));

        const hash = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, password: hash },);

        const token = CreateToken(user._id, user.name);
        const { password: pass, __v, updatedAt, posts, saved, followers, followings, resetPass, ...info } = user._doc

        res.status(200).json({ token, ...info })
    } catch (error) { next(error) }
}

// Get Code
exports.getCode = async (req, res, next) => {
    const { email } = req.body;
    if(!email) return next(errorModel(400, "Email is required"));

    const generateCode = () => {
        let code = "";
        for (let i = 0; i < 6; i++)
            code += Math.floor(Math.random() * 10);
        return code;
    }

    try {
        const user = await User.findOne({ email });
        if (!user) return next(errorModel(404, "User not found"));

        user.resetPass.code = generateCode();
        user.resetPass.expire = Date.now() + (60 * 60 * 1000);
        await user.save();

        await sendEmail(email, "Reset Password", `
            <div>
                <h1 style="text-align: center; font-size: 2rem'">Code to reset password</h1>
                <p style="letter-spacing: 0.5rem; font-size: 1rem; font-weight: 500">${user.resetPass.code}</p>
            </div>
        `);
        res.status(200).json({ msg: `Email Sent To: ${email}` });
    } catch (error) { next(error) }
}

// Verify Code
exports.verifyCode = async (req, res, next) => {
    const { email, code } = req.body;
    if(!email || !code) return next(errorModel(400, "All fields are required"));

    try {
        const user = await User.findOne({ email });
        if (!user) return next(errorModel(404, "User not found"));

        if (user.resetPass.code !== code) return next(errorModel(404, "Wrong Code"));
        if (user.resetPass.expire < Date.now()) return next(errorModel(404, "Code Expired"));

        const token = jwt.sign({ code: user.resetPass.code, _id: user._id }, process.env.SECRET, { expiresIn: '10m' });
        await user.save();

        res.status(200).json({ token });
    } catch (error) { next(error) }
}

// Set New Code
exports.setNewPass = async (req, res, next) => {
    const { token, newPassword } = req.body;
    if(!token || !newPassword) return next(errorModel(400, "All fields are required"));

    try {
        const encoded = jwt.verify(token, process.env.SECRET);
        
        const user = await User.findById(encoded._id);
        if (!user) return next(errorModel(404, "User not found"));

        if (user.resetPass.code !== encoded.code) return next(errorModel(404, "Wrong Code"));
        if (user.resetPass.expire < Date.now()) return next(errorModel(404, "Code Expired"));

        const hash = await bcrypt.hash(newPassword, 10);
        user.password = hash;
        await user.save();

        res.status(200).json({ msg: "Password Changed" });
    } catch (error) { next(error) }
}
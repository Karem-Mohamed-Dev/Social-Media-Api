const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { errorModel } = require("../utils/errorModel")
const { isEmail } = require("validator");

const CreateToken = (_id, name) => {
    const token = jwt.sign({ _id, name }, process.env.SECRET, { expiresIn: "3d" });
    return token;
}

exports.login = async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) return next(errorModel(400, "All fields are required"));
    if (!isEmail(email)) return next(errorModel(400, "Please enter a valid email"));
    if (password.length < 6) return next(errorModel(400, "Password must be more than 6"));


    try {
        const user = await User.findOne({ email });
        if (!user) return next(errorModel(404, "User not found"));

        const isValidPass = await bcrypt.compare(password, user.password)

        if (!isValidPass) return next(errorModel(401, "Email or Password may be wrong"));

        const token = CreateToken(user._id, user.name);
        const { password: pass, updatedAt, __v, ...info } = user._doc
        res.status(200).json({ ...info, token })

    } catch (error) {
        next(error);
    }
}

exports.register = async (req, res, next) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) return next(errorModel(400, "All fields are required"));
    if (name.length < 3) return next(errorModel(400, "Name nust be atleast 3 charachters"));
    if (!isEmail(email)) return next(errorModel(400, "Please enter a valid email"));
    if (password.length < 6) return next(errorModel(400, "Password must be more than 6"));

    try {
        const exist = await User.findOne({ email });
        if (exist) return next(errorModel(400, "User already exists"));

        const hash = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, password: hash });

        const token = CreateToken(user._id, user.name);
        const { password: pass, updatedAt, __v, ...info } = user._doc
        res.status(200).json({ ...info, token })
    } catch (error) {
        next(error);
    }
}

// Login
// Register
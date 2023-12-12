const jwt = require("jsonwebtoken");
const { errorModel } = require("./errorModel");

exports.isAuth = async (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization || !authorization.startsWith("Bearer")) return next(errorModel(401, "Authorization Faild"));
    const token = authorization.split(" ")[1];
    try {
        const decoded = jwt.verify(token, process.env.SECRET);
        req.user = decoded;
        next();
    } catch (error) { next(error) }
}
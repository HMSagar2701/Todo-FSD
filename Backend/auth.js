const jwt = require("jsonwebtoken");
const JWT_TOKEN = "secret";

function auth(req, res, next) {
    const token = req.headers.authorization?.split(" ")[1]; // Handle Bearer format
    if (!token) {
        return res.status(401).json({
            msg: "Authorization token required"
        });
    }
    try {
        const response = jwt.verify(token, JWT_TOKEN);
        req.userId = response.id;
        next();
    } catch (error) {
        res.status(403).json({
            msg: "Invalid credentials"
        });
    }
}

module.exports = {
    auth,
    JWT_TOKEN
};

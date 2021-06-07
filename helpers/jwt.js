const jwt = require('jsonwebtoken')
require('dotenv').config()

function createJwt (payload) {
    const token = jwt.sign(payload , process.env.JWT_SECRET )
    return token
}

function decodeToken (token) {
    const data = jwt.verify(token , process.env.JWT_SECRET)
    return data
}

function auth (req, res, next) {
    // console.log(req.method)
    // console.log(req.token)
    if (req.method !== "OPTIONS") {
        // let success = true;
        jwt.verify(req.token, process.env.JWT_SECRET, (error, decoded) => {
            if (error || decoded.role !== 'admin') {
                // success = false;
                return res.status(401).json({ message: "User not authorized.", error: "User not authorized." });
            }
            // console.log(decoded)
            req.user = decoded;
            next();
        });
    } else {
        next();
    }
}

module.exports = {
    createJwt,
    decodeToken,
    auth
}
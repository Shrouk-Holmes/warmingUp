const jwt = require("jsonwebtoken");

function vertifyToken(req, res, next) {
    const authToken = req.headers.authorization;

    if (authToken) { // Check if authToken is present
        const token = authToken.split(" ")[1];
        try {
            const decodedPayload = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decodedPayload;
            next();
      } catch (err) {
            return res.status(401).json({ message: "Invalid token" });
        }
    } else {
        return res.status(401).json({ message: "No token provided" });
    }
}

function verifyTokenAndAdmin(req, res, next) {
    vertifyToken(req, res, () => {
        if (req.user.isAdmin) {
            next();
        } else {
            return res.status(403).json({ message: "not allowed, only admin" });
        }
    });
}


function verifyTokenOnlyUser(req, res, next) {
    vertifyToken(req, res, () => {
        console.log("params" +req.params.id )
        console.log(req.user._id)
        if (req.user.id===req.params._id) {
            next();
        } else {
            return res.status(403).json({ message: "not allowed, only user himself" });
        }
    });
}



function verifyTokenAndAuth(req, res, next) {
    vertifyToken(req, res, () => {
        if (req.user._id===req.params.id || req.user.isAdmin) {
            next();
        } else {
            return res.status(403).json({ message: "not allowed, only user himself or admin" });
        }
    });
}


module.exports = { vertifyToken,verifyTokenAndAdmin,verifyTokenOnlyUser,verifyTokenAndAuth };

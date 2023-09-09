const jwt = require('jsonwebtoken')

module.exports = function(req, res, next) {
    const token = req.header("Authorization")

    if(!token) {
        return res.status(401).send({
            errorType: "token non presente",
            statusCode: 401,
            message: "Token necessario"
        });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET)
        req.user = verified;

        next()
    } catch (error) {
        res.status(403).send({
            message:"Non Autorizzato",
            statusCode: 403,
            errorType: "Token Error"
        })
    }
};
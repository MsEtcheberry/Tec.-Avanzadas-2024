const jwt = require("jsonwebtoken")
const dotenv = require("dotenv").config()

const verify = (req, res, next) => { //Usar token pasado mediante el endpoint /auth/login . Si coincide, pasa el next. Sino devuelvo res con error

    const token = req.headers.authorization.split(" ")[1]

    jwt.verify(token, process.env.TOKEN_KEY, (err, user) => {
        if (err) return res.sendStatus(403) // Token no válido
        req.user = user
        next()
    })
}

function isAdmin(req, res, next) {

    if (req.user && req.user.role.includes("admin")) {
        next()
    } else {
        return res.status(403).send("Acceso denegado. Solo los administradores pueden acceder a este recurso.")
    }
}
module.exports = { verify, isAdmin }
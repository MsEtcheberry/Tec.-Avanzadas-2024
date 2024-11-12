require("dotenv").config()
const jwt = require("jsonwebtoken")

const User = require("../models/user")

const login = async (email, password) => {
    const cryptoPass = require("crypto")
        .createHash("sha256")
        .update(password)
        .digest("hex")
    const result = await User.findOne({ email: email, password: cryptoPass })

    if (result) {
        jwt.sign("payload", "secret_key")
        const token = jwt.sign({ email: email, role: result.role }, process.env.TOKEN_KEY, { expiresIn: "1h" })

        return { token: token, userId: result.id }
    }
    return null
}
module.exports = { login }
require("mongoose")

const User = require("../models/user")

const addUser = async (displayName, email, identificationNumber, role, password) => {
    if (!displayName || !email || !identificationNumber || !role || !password) {
        return false
    }
    let user = await User.findOne({ email: email })

    if (!user) {
        const cryptoPass = require("crypto").createHash("sha256").update(password).digest("hex")

        const usr = new User(
            {
                displayName: displayName,
                email: email,
                identificationNumber: identificationNumber,
                currentBalance: 0,
                role: role,
                password: cryptoPass
            }
        )

        let user = await usr.save()
        console.log("Se ha creado el usuario")
        return { user }
    } else {
        return false
    }

}

const getAllUsers = async (limit, offset) => {
    const users = await User.find().limit(limit).skip(offset)
    return users
}

const getUser = async (id) => {
    const user = await User.findById(id)
    return user
}

const editUser = async (user) => {
    const updatedUser = await User.findByIdAndUpdate(user._id, user, { new: true })
    return updatedUser
}

const deleteUser = async (id) => {
    const user = await User.findByIdAndRemove(id)
    return user
}

const updateBalance = async (id, amount) => {
    console.log(amount)
    const amountNumber = parseFloat(amount)
    if (isNaN(amountNumber)) {
        throw new Error("El monto ingresado debe ser un número")
    }

    const user = await User.findById(id)
    if (!user) {
        throw new Error("No se encontró al usuario registrado en la apuesta")
    }
    user.currentBalance = parseFloat(user.currentBalance)
    user.currentBalance += amountNumber

    await user.save()
    return user
}

module.exports = { addUser, getAllUsers, getUser, editUser, deleteUser, updateBalance }
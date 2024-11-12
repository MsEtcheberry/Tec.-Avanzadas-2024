const mongoose = require("mongoose")
const Schema = mongoose.Schema
const userSchema = new Schema({

    displayName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        index: { unique: true, dropDups: true }
    },

    identificationNumber: {
        type: Number,
        required: true
    },
    currentBalance: {
        type: Number,
        required: true
    },
    role: {
        type: Array,
        required: true,
        default: ["user"]
    },
    password: {
        type: String,
        required: true
    }
}, { timestamps: true }).set("toJSON", {
    transform: (document, object) => {
        object.id = document.id
        delete object._id
        delete object.password
    }
})

const User = mongoose.model("users", userSchema)
module.exports = User
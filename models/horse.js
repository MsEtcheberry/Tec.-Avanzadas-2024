const mongoose = require("mongoose")
const Schema = mongoose.Schema
const horseSchema = new Schema({
    displayName: {
        type: String,
        required: true
    },
    winningRate: {
        type: Number,
        required: true
    },
}, { timestamps: true }).set("toJSON", {
    transform: (document, object) => {
        object.id = document.id
        delete object._id
        delete object.password
    }
})

const Horse = mongoose.model("horses", horseSchema)
module.exports = Horse
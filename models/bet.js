const mongoose = require("mongoose")
const Schema = mongoose.Schema
const betSchema = new Schema({
    amount: {
        type: Number,
        required: true
    },
    idUser: {
        type: String,
        required: true
    },
    idHorse: {
        type: String,
        required: true
    },
    idRace: {
        type: String,
        required: true
    }
}, { timestamps: true }).set("toJSON", { //Esta parte es opcional
    transform: (document, object) => {
        object.id = document.id
        delete object._id
        delete object.password
    }
})

const Bet = mongoose.model("bets", betSchema)
module.exports = Bet
const mongoose = require("mongoose")
const Schema = mongoose.Schema
const raceSchema = new Schema({
    raceDateTime: {
        type: Date,
        required: true
    },
    raceName: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "finished", "cancelled"],
        default: "pending",
        required: true
    },
    horses: [
        {
            horseId: {
                type: String,
                required: true
            },
            position: {
                type: String,
                required: true
            }
        }
    ]
}, { timestamps: true }).set("toJSON", {
    transform: (document, object) => {
        object.id = document.id
        delete object._id
        delete object.password
    }
})
const Race = mongoose.model("races", raceSchema)
module.exports = Race
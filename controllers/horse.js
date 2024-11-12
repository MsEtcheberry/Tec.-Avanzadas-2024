const mongoose = require("mongoose")
const Horse = require("../models/horse");



const addHorse = async (displayName, winningRate) => {
    console.log(displayName, winningRate)
    if (!displayName || !winningRate) {
        return { success: false, message: "No pudo crearse el caballo debido a que tiene campos incompletos" }
    }

    if (isNaN(winningRate) || winningRate <= 0) {

        return { success: false, message: "No pudo crearse el caballo debido a que el winning rate no es válido" }
    }

    let nameTaken = await Horse.findOne({ displayName: displayName })
    console.log("holaaa " + nameTaken)
    if (!nameTaken) {
        const horse = new Horse(
            {
                displayName: displayName,
                winningRate: winningRate
            }
        )
        let createdHorse = await horse.save();

        return {
            success: true, createdHorse
        }
    } else {
        return { success: false, message: "Ya existe un caballo con ese nombre" }
    }
}

const getHorse = async (id) => {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return false
    }
    const horse = await Horse.findById(id);
    return horse
}

const deleteHorse = async (id) => { //Elimina el caballo de la BD
    const horse = await Horse.findByIdAndRemove(id);
    return horse
}

const getAllHorses = async (limit, offset) => {

    const horses = await Horse.find().sort({ created: "descending" }).limit(limit).skip(offset)
    return horses
}


module.exports = { addHorse, getHorse, deleteHorse, getAllHorses }
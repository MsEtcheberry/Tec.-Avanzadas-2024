require("mongoose")
const Horse = require("../models/horse");



const addHorse = async (displayName, winningRate) => {
    console.log(displayName, winningRate)
    if (!displayName || !winningRate) {
        return false;
    }

    let nameTaken = await Horse.findOne({ displayName: displayName });
    if (!nameTaken) {
        const horse = new Horse(
            {
                displayName: displayName,
                winningRate: winningRate
            }
        )
        let createdHorse = await horse.save();
        console.log("horse: " + createdHorse)
        return createdHorse
    } else {
        return false
    }
}

const getHorse = async (id) => {
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
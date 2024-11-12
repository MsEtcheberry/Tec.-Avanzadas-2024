const mongoose = require("mongoose")

const Race = require("../models/race")
const Horse = require("../models/horse")
const { payWinningBets } = require('../controllers/bet')
const HorseController = require("../controllers/horse")

const addRace = async (raceDateTime, raceName) => {
    if (!raceDateTime || !raceName) {
        return { success: false, message: "No pudo crearse la carrera debido a que tiene datos incompletos." }
    }
    const newRace = new Race(
        {
            raceDateTime: raceDateTime,
            raceName: raceName,
            horses: []
        }
    )

    let race = await newRace.save()
    console.log("Se ha dado de alta la carrera")
    return { success: true, data: race }
}

const addHorseToRace = async (raceId, horseId) => {
    if (!horseId || !raceId) {
        return { success: false, message: "No pudo agregarse el caballo ya que el id de la carrera es incorrecto." }
    }
    const race = await Race.findById(raceId)
    if (!race) {
        return { success: false, message: "No se encontró la carrera" }
    }
    console.log(race)
    const horseAlreadyExists = race.horses.some(horse => horse.horseId.toString() === horseId)

    if (horseAlreadyExists) {
        console.log("El caballo ya está registrado en la carrera")
        return { success: true, data: race }
    }

    race.horses.push({ horseId: horseId, position: "TBD" })
    const updatedRace = await race.save()
    return { success: true, data: updatedRace }

}

const getAllRaces = async (limit, offset) => {
    const races = await Race.find().limit(limit).skip(offset)
    return races
}

const getNextRaces = async (limit, offset) => {
    const currentDateTime = Date()
    const races = await Race.find({
        raceDateTime: { $gt: currentDateTime }
    }).limit(limit).skip(offset).lean()



    try {
        for (const race of races) {
            const horseIds = race.horses.map(horse => horse.horseId)
            const horses = await Horse.find({ _id: { $in: horseIds } }).select("displayName winningRate")

            // agrega los campos winningRate y displayName a cada caballo
            race.horses = race.horses.map(horse => {
                const horseData = horses.find(h => h._id.toString() === horse.horseId.toString())
                return {
                    horseId: horse.horseId,
                    position: horse.position,
                    displayName: horseData ? horseData.displayName : null,
                    winningRate: horseData ? horseData.winningRate : null
                }
            })
        }
        return races
    } catch (err) {
        console.log(err)
    }
}

const getRace = async (id) => {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return false
    }
    const race = await Race.findById(id)
    return race
}

const editRace = async (race) => {
    const updatedRace = await Race.findByIdAndUpdate(race._id, race, { new: true })
    return updatedRace
}

const deleteRace = async (id) => {
    const race = await Race.findByIdAndRemove(id)
    return race
}

const finishRace = async (raceId) => {
    if (!mongoose.Types.ObjectId.isValid(raceId)) {
        return { success: false, message: "El identificador de la carrera es incorrecto." }
    }


    try {
        const race = await Race.findById(raceId).populate("horses.horseId")

        if (!race) {
            return { success: false, message: "No se encontró la carrera " }
        }
        if (race.status == "finished") {
            return { success: false, message: "La carrera ya fue finalizada previamente 🏇🏾" }
        }
        // Asignar posiciones aleatorias
        const positions = Array.from({ length: race.horses.length }, (_, i) => i + 1)
        for (let horse of race.horses) {
            const random = Math.floor(Math.random() * positions.length)
            horse.position = positions.splice(random, 1)[0].toString()
        }
        race.status = "finished"

        await race.save()
        const winningHorse = await HorseController.getHorse(race.horses.find(horse => horse.position === "1").horseId)
        const paymentResult = await payWinningBets(raceId, winningHorse)

        return { success: true, race }
    } catch (error) {
        return { success: false, message: "Hubo un error al intentar finalizar la carrera. Intente luego." }
    }
}



module.exports = { addRace, getAllRaces, getNextRaces, getRace, editRace, deleteRace, addHorseToRace, finishRace }
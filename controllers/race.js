const mongoose = require("mongoose")

const Race = require("../models/race")
const Horse = require("../models/horse")
const Bet = require("../controllers/bet")
const HorseController = require("../controllers/horse")

const addRace = async (raceDateTime, raceName) => {
    if (!raceDateTime || !raceName) {
        return false
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
    return { race }
}

const addHorseToRace = async (raceId, horseId) => {
    console.log(raceId + " " + horseId)
    if (!horseId || !raceId) {
        return false
    }
    const race = await Race.findById(raceId)
    if (!race) {
        console.log("No se encontró a la carrera")
        return false
    }
    console.log(race)
    const horseAlreadyExists = race.horses.some(horse => horse.horseId.toString() === horseId)

    if (horseAlreadyExists) {
        console.log("El caballo ya está registrado en la carrera")
        return race
    }

    race.horses.push({ horseId: horseId, position: "TBD" })
    const updatedRace = await race.save()
    return updatedRace

}

const getAllRaces = async (limit, offset) => {
    const races = await Race.find().limit(limit).skip(offset)
    return races
}

const getNextRaces = async (limit, offset) => {
    console.log("Hola")
    const currentDateTime = Date()
    console.log(currentDateTime)

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
                    status: "pending",
                    position: horse.position,
                    displayName: horseData ? horseData.displayName : null,
                    winningRate: horseData ? horseData.winningRate : null,
                    _id: horse._id
                }
            })
        }
        console.log(races)
        return races
    } catch (err) {
        console.log(err)
    }
}

const getRace = async (id) => {
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
    console.log(raceId)
    if (!mongoose.Types.ObjectId.isValid(raceId)) {
        return { success: false, message: "El identificador de la carrera es incorrecto." }
    }


    try {
        const race = await Race.findById(raceId).populate("horses.horseId")
        if (!race) {
            return { success: false, message: "No se encontró la carrera" }
        }
        if (race.status == "finished") {
            return { success: false, message: "La carrera ya fue finalizada previamente" }
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
        console.log(winningHorse)
        const paymentResult = await Bet.payWinningBets(raceId, winningHorse)
        console.log("payment result: " + paymentResult.success)

        return { success: true, race }
    } catch (error) {
        console.error("Hubo un error al intentar finalizar la carrra:", error)
        return { success: false, message: "Hubo un error al intentar finalizar la carrera. Intente luego." }
    }
}



module.exports = { addRace, getAllRaces, getNextRaces, getRace, editRace, deleteRace, addHorseToRace, finishRace }
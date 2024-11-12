const mongoose = require("mongoose")
const Bet = require("../models/bet")
const Race = require("../controllers/race")
const User = require("../controllers/user")

const createBet = async (amount, userId, horseId, raceId) => {
    if (!amount || amount <= 0 || !userId || !horseId || !raceId) {
        return { success: false, message: "No pudo crearse la apuesta debido a que tiene datos incorrectos o incompletos." }
    }

    if (!mongoose.Types.ObjectId.isValid(raceId) || !mongoose.Types.ObjectId.isValid(userId)) {
        return { success: false, message: "No pudo crearse la apuesta ya que los IDs ingresados son incorrectos." }
    }

    const race = await Race.getRace(raceId)
    if (!race) {
        return { success: false, message: "No se encontró la carrera." }
    }


    const currentDateTime = new Date()


    if (new Date(race.raceDateTime).getTime() < currentDateTime.getTime()) {
        return { success: false, message: "No pudo crearse la apuesta debido a que la carrera ya inició." }
    }

    const horse = race.horses.some(horse => horse.horseId === horseId)
    if (!horse) {
        return { success: false, message: "No se encontró el caballo indicado." }
    }


    const newBet = new Bet(
        {
            amount: amount,
            idUser: userId,
            idHorse: horseId,
            idRace: raceId,
        }
    )
    let bet = await newBet.save()
    console.log("¡Se registró la apuesta con éxito!")
    return { success: true, bet }
}



const getBetsForUser = async (userId, limit, offset) => {
    const bets = await Bet.find({ userId: userId }).limit(limit).skip(offset)
    return bets
}

const getBetsForRace = async (raceId, limit, offset) => {
    const bets = await Bet.find({ raceId: raceId }).limit(limit).skip(offset)
    return bets
}

const getBet = async (id) => {
    const bet = await Bet.findById(id)
    return bet
}

const editBet = async (bet) => {
    const updatedBet = await Bet.findByIdAndUpdate(bet._id, bet, { new: true })
    return updatedBet
}

const deleteBet = async (id) => {
    const bet = await Bet.findByIdAndRemove(id)
    return bet
}
const payWinningBets = async (raceId, winningHorse) => {
    console.log("inicia paywinningbets: " + winningHorse)
    try {
        console.log("idRace: " + raceId + "  ----   idHorse: " + winningHorse._id)
        const winningBets = await Bet.find({ idRace: raceId, idHorse: winningHorse._id })
        for (let bet of winningBets) {
            console.log("monto: " + bet.amount + "  -   winningRate: " + winningHorse)
            await User.updateBalance(bet.idUser, bet.amount * winningHorse.winningRate)

        }
        console.log("finaliza")
        return { success: true }
    } catch (error) {
        console.error("Hubo un error al pagar las apuestas", error)
        return { success: false, message: "Error interno" }
    }
}

module.exports = { createBet, getBetsForUser, getBetsForRace, getBet, getBet, editBet, deleteBet, payWinningBets }
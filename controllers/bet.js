const mongoose = require("mongoose")
const Bet = require("../models/bet")
const User = require('../controllers/user')

const createBet = async (amount, userId, horseId, race) => {


    if (!amount || amount <= 0) {
        return { success: false, message: "No pudo crearse la apuesta debido a que tiene datos incorrectos o incompletos." }
    }
    const currentDateTime = new Date()
    if (new Date(race.raceDateTime).getTime() < currentDateTime.getTime() || race.status === "finished") {
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
            idRace: race._id,
        }
    )
    let bet = await newBet.save()
    return { success: true, bet }
}



const getBetsForUser = async (userId, limit, offset) => {
    const bets = await Bet.find({ idUser: userId }).limit(limit).skip(offset)
    return bets
}

const getBetsForRace = async (raceId, limit, offset) => {
    const bets = await Bet.find({ idRace: raceId }).limit(limit).skip(offset)
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
    try {
        const winningBets = await Bet.find({ idRace: raceId, idHorse: winningHorse._id })
        for (let bet of winningBets) {
            console.log(bet)
            await User.updateBalance(bet.idUser, bet.amount * winningHorse.winningRate)
        }
        return { success: true }
    } catch (error) {
        console.error("Hubo un error al pagar las apuestas", error)
        return { success: false, message: "Error interno" }
    }
}

module.exports = { createBet, getBetsForUser, getBetsForRace, getBet, getBet, editBet, deleteBet, payWinningBets }
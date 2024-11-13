const { default: axios } = require('axios');
const chai = require('chai')
const dotenv = require("dotenv").config();
const cors = require("cors");
const { assert } = chai;

const url = "http://localhost:" + process.env.PORT


describe('Obtener próximas carreras', () => {
    let currentDateTime = new Date()
    it('Devuelve 200 al intentar recuperar las carreras', (done) => {
        const offset = 0; // Desde el primer resultado
        const limit = 10; // Obtener 10 resultados

        axios.get(`${url}/races?offset=${offset}&limit=${limit}`, {
        }).then(response => {
            assert.equal(response.status, 200)
            assert.isArray(response.data)
            response.data.forEach(race => {
                assert.isTrue(new Date(race.raceDateTime) > new Date(currentDateTime), `La carrera ${race.raceName} no es futura`)
            })
            done()
        }).catch(err => {
            done(err)
        });
    })
})
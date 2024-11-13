process.env.NODE_ENV = 'test'

const { default: axios } = require('axios');
const chai = require('chai')
const dotenv = require("dotenv").config();
const cors = require("cors");
const mongoose = require("mongoose")
const { MongoClient, ServerApiVersion } = require("mongodb");
const { connected, off } = require("process");
const { assert } = chai;
const connectionStringTest = process.env.DB_URI_TEST
const url = "http://localhost:" + process.env.PORT

/*before((done) => {

    mongoose.connect(connectionStringTest, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
        console.log("connected");
    }).catch((err) => console.log(err));
    const client = new MongoClient(connectionStringTest, {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        }
    })
    done()
        .catch((err) => {
            console.log(err);
            done(err);
        });
});
after((done) => {
    const client = new MongoClient(connectionStringTest, {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        }
    });

    client.connect()
        .then(() => {
            return client.close();
        })
        .then(() => {
            console.log("Disconnected from MongoDB");
            done();
        })
        .catch((err) => {
            console.log(err);
            done(err);
        });
});*/


describe('Crear nueva apuesta', () => {
    let token
    let race
    let futureRace
    let userId
    let testHorse
    it('Realiza Login', (done => {
        axios.post(
            url + "/auth/login", {
            email: "apostador@gmail.com", //
            password: "123456"
        }
        ).then(response => {
            assert.equal(response.status, 200)
            token = response.data.data.token

            userId = response.data.data.userId
            done()
        })
    }))
    it('Crea caballo', (done => {
        axios.post(
            url + "/horses", {
            displayName: "Caballoooooo de test",
            winningRate: 1.75
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        }).then(response => {
            assert.equal(response.status, 201)
            console.log(response.data)
            testHorse = response.data.result.createdHorse
            done()
        })
    }))

    it('Devuelve error si la fecha está incompleta', (done) => {
        axios.post(url + "/races", {
            raceName: "Carrera sin fecha"
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        }).then(response => {
            done(new Error("La API debería haber devuelto un error"));
        }).catch(err => {
            assert.equal(err.response.status, 409);
            done()
        })
    })

    it('Devuelve 201 si creó la carrera correctamente', (done => {
        axios.post(
            url + "/races", {
            raceName: "Carrera con fecha finalizada",
            raceDateTime: "2022-11-20T21:00:00.000+00:00"

        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => {
                assert.equal(response.status, 201)

                race = response.data.data
                done()
            }).catch(err => {
                assert.equal(err.response.status, 201)
                done()
            })

    }))

    it('Devuelve 201 si creó la carrera correctamente', (done => {
        axios.post(
            url + "/races", {
            raceName: "Carrera con fecha futura",
            raceDateTime: "2025-11-20T21:00:00.000+00:00"

        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => {
                assert.equal(response.status, 201)

                futureRace = response.data.data
                done()
            }).catch(err => {
                assert.equal(err.response.status, 201)
                done()
            })

    }))

    it('Añade el caballo a la carrera', (done => {
        axios.put(
            url + "/races/" + futureRace.id + "/horses", {
            horseId: testHorse.id
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        }).then(response => {
            assert.equal(response.status, 200)

            done()
        })
    }))



    it('Devuelve error si la apuesta es para una carrera finalizada', (done => {
        axios.post(
            url + "/bets", {
            amount: 5000,
            userId: "673176d3d2b5d1883ad49e6e",
            raceId: race.id,
            horseId: "6722c49d2e020bd8624c8d5f"

        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        }).then(response => {
            done(new Error("La API debería haber devuelto un error"));
        }).catch(err => {
            assert.equal(err.response.status, 409);
            done()
        })
    }))

    it('Devuelve error si el monto de la apuesta es negativo', (done => {
        axios.post(
            url + "/bets", {
            amount: -5000,
            userId: "673176d3d2b5d1883ad49e6e",
            raceId: futureRace.id,
            horseId: "6722c49d2e020bd8624c8d5f"

        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        }).then(response => {
            done(new Error("La API debería haber devuelto un error"));
        }).catch(err => {
            assert.equal(err.response.status, 409);
            done()
        })
    }))

    it('Devuelve error si no encuentra la carrera por la que se intenta apostar', (done => {
        axios.post(
            url + "/bets", {
            amount: 5000,
            userId: "673176d3d2b5d1883ad49e6e",
            raceId: "1234",
            horseId: "6722c49d2e020bd8624c8d5f"

        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        }).then(response => {
            done(new Error("La API debería haber devuelto un error"));
        }).catch(err => {
            assert.equal(err.response.status, 404);
            done()
        })
    }))
    it("Devuelve error si no encuentra al caballo dentro de la carrera por la que se intenta apostar", (done => {
        axios.post(
            url + "/bets", {
            amount: 5000,
            userId: "673176d3d2b5d1883ad49e6e",
            raceId: futureRace.id,
            horseId: "123456789"

        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        }).then(response => {
            done(new Error("La API debería haber devuelto un error"));
        }).catch(err => {
            assert.equal(err.response.status, 409);
            done()
        })
    }))
    it('Crea la apuesta de forma correcta', (done => {
        axios.post(
            url + "/bets", {
            amount: 5000,
            userId: userId,
            raceId: futureRace.id,
            horseId: testHorse.id

        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        }).then(response => {
            assert.equal(response.status, 201)
            done()
        }).catch(err => {
            console.log(err.response)
            assert.equal(err.response.status, 201)
            done()
        })
    }))


})
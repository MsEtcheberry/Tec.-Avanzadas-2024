const express = require("express");
const app = express();    // Instancio el server
const http = require("http").createServer(app); //instancio la variable http donde voy a cargar el módulo http que tiene node (todos los atributos y métodos del módulo)
const dotenv = require("dotenv").config();
const cors = require("cors");
const mongoose = require("mongoose");  //ORM de mongo, permite definir modelos
const middleware = require("./middleware/auth-middleware");

//Variables 
const PORT = process.env.PORT
const uri = process.env.DB_URI

app.use(cors());
app.use(express.json());    //Para utilizar json y responder las consultas

const HorseController = require("./controllers/horse")
const UserController = require("./controllers/user")
const AuthController = require("./controllers/auth")
const RaceController = require("./controllers/race")
const BetController = require("./controllers/bet")


// Acceso a db
const { MongoClient, ServerApiVersion } = require("mongodb");
const { connected, off } = require("process");


//Conexión con MongoDB/Mongoose
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
    console.log("connected");
}).catch((err) => console.log(err));

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
})
client.connect(err => {

    client.close();
});




http.listen(PORT, () => {
    console.log(`listening to ${PORT}`);   // Console log para saber que puerto estoy escuchando
})

//Endpoint General
app.get("/", async (req, res) => {
    res.json({ message: "Bienvenidos ¡A apostar!" });
})


//Endpoint AUTENTICACIÓN
app.post("/auth/login", async (req, res) => {

    const email = req.body.email;
    const password = req.body.password;
    try {
        const result = await AuthController.login(email, password);
        if (result) {
            res.status(200).json({ data: result });
        } else {
            res.status(401).send({ message: "Credenciales incorrectas" })
        }
    } catch (err) {
        res.status(500).send({ message: "Error interno del servidor" });
    }
})

//Endpoints USERS
app.post("/users", async (req, res) => {
    let displayName = req.body.displayName;
    let identificationNumber = req.body.identificationNumber;
    let email = req.body.email;
    let role = req.body.role;
    let password = req.body.password;

    try {
        const result = await UserController.addUser(displayName, email, identificationNumber, role, password);
        if (result) {
            res.status(201).send({ message: "¡El usuario fue creado correctamente!" });
        } else {
            res.status(409).send({ message: "No puedo crearse el usuario (Datos faltantes o ya hay un usuario con el email indicado)" });
        }
    } catch (err) {
        res.status(500).send({ message: "Error al crear el usuario. Intente luego" });
    }

})
//Endpoints HORSES

app.get("/horses", async (req, res) => {

    let limit = req.query.limit;
    let offset = req.query.offset;
    try {
        const results = await HorseController.getAllHorses(limit, offset);
        res.status(200).json(results);
    } catch (err) {
        res.status(500).send(err);
    }
})

app.post("/horses", middleware.verify, middleware.isAdmin, async (req, res) => {
    let displayName = req.body.displayName;
    let winningRate = req.body.winningRate;


    try {
        const result = await HorseController.addHorse(displayName, winningRate);
        if (result.success) {
            res.status(201).send({ message: "¡El caballo fue creado correctamente!" });
        } else {
            res.status(409).send({ message: result.message });
        }
    } catch (err) {
        res.status(500).send({ message: "Error al crear el caballo. Intente luego nuevamente" })
        console.log(err)
    }

})

//DELETE (Borra el registro de la base)
app.delete("/horses/:id", middleware.verify, async (req, res) => {

    let id = req.params.id;

    try {
        const horse = await HorseController.deleteHorse(id)
        if (horse) {
            res.status(204).send("El caballo fue eliminado con exito.");
        } else {
            res.status(404).send("El caballo no fue encontrado, por lo que no pudo eliminarse.")
        }
    } catch (err) {
        res.status(500).send("Hubo un error al intentar eliminar el caballo, intente luego.")
    }
})


app.get("/nextRaces", async (req, res) => {
    let limit = req.query.limit;
    let offset = req.query.offset;
    try {
        const results = await RaceController.getNextRaces(limit, offset);
        res.status(200).json(results);
    } catch (err) {
        res.status(500).send({ message: "Hubo un error al intentar recuperar las próximas carreras. Intente luego." });
    }
})

app.get("/races", async (req, res) => {
    let limit = req.query.limit;
    let offset = req.query.offset;
    try {
        const results = await RaceController.getAllRaces(limit, offset);
        res.status(200).json(results);
    } catch (err) {
        res.status(500).send({ message: "Hubo un error al intentar recuperar las carreras. Intente luego." });
    }
})

app.get("/races/:id/bets", async (req, res) => {
    let raceId = req.params.id
    let limit = req.query.limit;
    let offset = req.query.offset;
    try {
        const results = await BetController.getBetsForRace(raceId, limit, offset);
        res.status(200).json(results);
    } catch (err) {
        res.status(500).send({ message: "Hubo un error al intentar recuperar las apuestas. Intente luego." });
    }
})

app.put("/races/:id/horses", middleware.verify, async (req, res) => {
    let raceId = req.params.id
    let horseId = req.body.horseId

    try {
        const result = await RaceController.addHorseToRace(
            raceId,
            horseId
        )

        if (result.success) {
            return res.status(200).send({ data: result.data })
        } else {
            return res.status(400).send({ message: result.message })
        }
    } catch (error) {
        console.error("Hubo un error al intentar agregar el caballo:", error)
        res.status(500).send({ message: "Hubo un error al intentar agregar el caballo. Intente luego." })
    }
})

// Enpoint para finalizar carreras
app.post("/races/:id/finish", middleware.verify, middleware.isAdmin, async (req, res) => {
    const raceId = req.params.id
    const result = await RaceController.finishRace(raceId);

    if (result.success) {
        res.status(200).send(result.race);
    } else {
        res.status(400).send({ message: result.message });
    }
});

app.post("/races", middleware.verify, middleware.isAdmin, async (req, res) => {
    let raceName = req.body.raceName;
    let raceDateTime = req.body.raceDateTime;


    try {
        const result = await RaceController.addRace(raceDateTime, raceName);
        if (result.success) {
            res.status(201).send({ data: result.data });
        } else {
            res.status(409).send({ message: result.message });
        }
    } catch (err) {
        res.status(500).send({ message: "Error al crear carrera. Intente luego" });
    }

})

// Endpoints BETS

app.post("/bets", middleware.verify, async (req, res) => {
    let amount = req.body.amount
    let userId = req.body.userId
    let raceId = req.body.raceId
    let horseId = req.body.horseId
    try {
        const race = await RaceController.getRace(raceId)
        if (!race) {
            return res.status(404).send({ message: "No se encontró la carrera." })
        }

        const result = await BetController.createBet(amount, userId, horseId, race);

        if (result.success) {
            const amountUpdateResult = await UserController.updateBalance(user, -amount)
            if (amountUpdateResult.success) {
                res.status(201).send({ message: "¡La apuesta fue registrada con éxito! ¡Suerte! 🍀" })
            } else {
                res.status(400).send({ message: amountUpdateResult.message })
            }
        } else {
            res.status(409).send({ message: result.message });
        }
    } catch (err) {
        console.log(err)
        res.status(500).send({ message: "Error interno del servidor. Intente luego nuevamente" });
    }

})

app.get("/users", async (req, res) => {

    let limit = req.query.limit;
    let offset = req.query.offset;
    try {
        const results = await UserController.getAllUsers(limit, offset);
        res.status(200).json(results);
    } catch (err) {
        res.status(500).send(err);
    }
})


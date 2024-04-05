import express from "express";
import bodyParser from "body-parser";
import * as db from "./queries.js"

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.listen(port, () => {
    console.log(`Server running on port ${port}.`);
})

app.get("/", (req, res) => {

    res.json({ info: "Node js, Express and Postgres API" })
})

app.get("/state", db.getState)
app.get("/state/:id", db.getStateById)
app.put("/state/:id", db.updateState)
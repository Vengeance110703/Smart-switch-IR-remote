import express from "express";
import { dirname } from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import ngrok from "ngrok";
import axios from "axios";

const app = express();
const port = process.env.PORT || 3200;
const __dirname = dirname(fileURLToPath(import.meta.url));


app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static("public"))
app.set("view engine", "ejs")

app.get("/", async (req, res) => {
    const jsonData = await axios.get("http://127.0.0.1:3000/state");
    const data = jsonData.data
    const state1 = data[0].state ? "checked" : "";
    const state2 = data[1].state ? "checked" : "";
    const switch1 = `<input
    class="form-check-input"
    type = "checkbox"
    role = "switch"
    name = "switch1"
    id = "switch1"
    ${state1}
        />`
    const switch2 = `<input
    class="form-check-input"
    type = "checkbox"
    role = "switch"
    name = "switch2"
    id = "switch2"
    ${state2}
        />`

    res.render(__dirname + "/public/index.ejs", {
        switch1: switch1,
        switch2: switch2
    })
})

app.post("/toggle", (req, res) => {
    const data = req.body;
    axios.put(`http://127.0.0.1:3000/state/${data.id}`, {
        "state": data.state
    })
        .then((res) => {
            console.log(res.data)
        })
        .catch((err) => {
            console.log(err)
        })
})
import express from "express"
import bodyParser from "body-parser"
import { createServer } from "node:http"
import { getState, getStateById, updateState } from "./queries.js"
import { Server } from "socket.io"
import cors from "cors"
import mqtt from "mqtt"

const port = process.env.PORT || 3000
const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())

//Socket.io
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: /^http:\/\/localhost:\d+$/,
  },
})

io.on("connection", socket => {
  console.log(`${socket.id} a user connected`)

  socket.on("stateWeb", async data => {
    console.log(data)
    data.map(({ id, state }) => {
      updateState(id, state)
    })
  })

  socket.on("init", async () => {
    const { rows } = await getState()
    socket.emit("initResponse", rows)
  })

  socket.on("disconnect", () => {
    console.log("user disconnected")
  })
})

//MQTT
const mqttClient = mqtt.connect("mqtt://test.mosquitto.org")

mqttClient.on("connect", () => {
  mqttClient.subscribe
})

//HTTP
app.get("/", (req, res) => {
  res.json({ info: "Node js, Express and Postgres API" })
})

app.get("/state", async (req, res) => {
  const { rows } = await getState()
  res.send(rows)
})
app.get("/state/:id", async (req, res) => {
  const { rows } = await getStateById(parseInt(req.params.id))
  res.send(rows)
})
app.put("/state/:id", async (req, res) => {
  const { state } = req.body
  const { id } = req.params
  updateState(id, state).then(
    () => res.send(`Switch ${id} modified`),
    () => res.send(`Switch ${id} not modified`)
  )
  const sockets = await io.fetchSockets()
  sockets[0].emit("stateMCU", [id, state])
})

server.listen(port, () => {
  console.log(`Server running on port ${port}.`)
})

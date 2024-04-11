import * as React from "react"
import Switch from "@mui/material/Switch"
import { socket } from "./socket"

const App = () => {
  const [checked, setChecked] = React.useState([])

  React.useEffect(() => {
    socket.emit("init")
    socket.on("initResponse", results => {
      setChecked(results)
    })
  }, [])

  React.useEffect(() => {
    socket.on("stateMCU", ([id, state]) => {
      // console.log(`${id} ${state}`)
      setChecked(prev => {
        prev.forEach(element => {
          if (element.id == id) {
            element.state = state
          }
        })
        return [...prev]
      })
    })
  }, [socket])

  const handleChange = event => {
    const { id, checked: newValue } = event.target

    setChecked(prev => {
      prev.forEach(element => {
        if (element.id == id) {
          element.state = newValue
        }
      })
      // console.log(prev)
      return [...prev]
    })

    socket.emit("stateWeb", checked)
  }

  return (
    <div>
      {checked.map(({ id, state }) => {
        return (
          <Switch
            key={id}
            id={String(id)}
            onChange={handleChange}
            checked={state}
          />
        )
      })}
    </div>
  )
}

export default App

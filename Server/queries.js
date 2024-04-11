import Pg from "pg"

const pool = new Pg.Pool({
  user: "me",
  host: "localhost",
  database: "api",
  password: "password",
  port: 5432,
})

const getState = async () =>
  await pool.query("SELECT * FROM switch ORDER BY id ASC")

const getStateById = async id =>
  await pool.query("SELECT * FROM switch WHERE id = $1", [id])

const updateState = async (id, state) => {
  return await pool.query("UPDATE switch SET state = $1 WHERE id = $2", [
    state,
    id,
  ])
}

export { getState, getStateById, updateState }

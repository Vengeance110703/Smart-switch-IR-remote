import Pg from "pg";

const pool = new Pg.Pool({
    user: 'me',
    host: 'localhost',
    database: 'api',
    password: 'password',
    port: 5432
})

const getState = (req, res) => {
    pool.query("SELECT * FROM switch ORDER BY id ASC", (err, results) => {
        if (err) {
            throw err
        }
        res.status(200).json(results.rows)
    })
}

const getStateById = (req, res) => {
    const id = parseInt(req.params.id)

    pool.query("SELECT * FROM switch WHERE id = $1", [id], (err, results) => {
        if (err) {
            throw err
        }
        res.status(200).json(results.rows)
    })
}

const updateState = (req, res) => {
    const id = parseInt(req.params.id)
    const { state } = req.body
    console.log(state)

    pool.query(
        "UPDATE switch SET state = $1 WHERE id = $2",
        [state, id],
        (err, results) => {
            if (err) {
                throw err
            }
            res.status(200).send(`Switch${id} modified`);
        }
    )

}

export {
    getState,
    getStateById,
    updateState
}
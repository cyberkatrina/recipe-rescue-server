const express = require('express')
const signUpRoutes = require('./signup')
const loginRoutes = require('./login')
const jwt = require("jsonwebtoken")
const pool = require('./sql/connection')
const cors = require("cors")

const app = express()
const PORT = process.env.PORT || 5000

const authToken = (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader) return res.sendStatus(403)
  const token = authHeader.split(' ')[1]
  if (!token) return res.sendStatus(403)
  jwt.verify(token, "secret", (err, user) => {
    if (err) return res.sendStatus(403)
    req.user = user
    next()
  })
}

app.use(express.json())
app.use(cors())
app.use("/signup", signUpRoutes)
app.use("/login", loginRoutes)

app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Methods", "GET")
  res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type")
  res.setHeader("Access-Control-Allow-Credentials", true)
  next()
})

app.get('/', (req, res) => {
  res.send('Hello World');
});


// GET- List of users
app.get('/users', authToken, (req, res) => {
  pool.query("SELECT * FROM ??", 
  ["users"],
  function(err, rows, fields) {
    res.json(rows)
  })
})

// GET- User by id
app.get('/users/:id', authToken, (req, res) => {
  const {id} = req.params
  pool.query(`SELECT * FROM ?? WHERE ?? = ?`, 
  ["users", "id", id],
  function(err, rows, fields) {
    res.json(rows)
  })
})

app.post('/users/', authToken, (req, res) => {
  pool.query(`INSERT INTO ?? (??, ??, ??, ??) VALUES (?, ?, ?, ?)`, 
  ["users", "id", "name", "email", "password", null, req.body.name, req.body.email, req.body.password], 
  function(err, row, fields) {
    res.json(row)
  })
})

app.put('/users/:id', authToken, (req, res) => {
  const {id} = req.params
  pool.query(`UPDATE ?? SET ? WHERE ?? = ?`, 
  ["users", req.body, "id", id], 
  function(err, row, fields) {
    res.json(row)
  })
})

app.delete('/users/:id', authToken, (req, res) => {
  const {id} = req.params
  pool.query(`DELETE FROM ?? WHERE ?? = ?`, 
  ["users", "id", id], 
  function(err, row, fields) {
    res.json(row)
  })
})


app.listen(PORT, () => console.log(`Listening at http://localhost:${PORT}`))

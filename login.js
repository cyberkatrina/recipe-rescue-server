const express = require("express")
const router = express.Router()
const bcrypt = require("bcrypt")
const pool = require("./sql/connection")
const jwt = require("jsonwebtoken")
const mysql = require('mysql')



router.post("/", (req, res) => {

  const { email, password } = req.body
  let sql = "SELECT * FROM ?? WHERE ?? = ?"
  sql = mysql.format(sql, [ "users", "email", email])

  pool.query(sql, (err, rows) => {
    if (err) return handleSQLError(res, err)
    if (!rows.length) return res.status(404).send('No matching users')

    const hash = rows[0].password
    bcrypt.compare(password, hash)
      .then(result => {
        if (!result) return res.status(400).send('Invalid password')

        const data = { ...rows[0] }
        data.password = 'REDACTED'
        const token = jwt.sign(data, 'secret')
        res.json({
          msg: 'Login successful',
          token,
          id: rows[0].id,
          name: rows[0].name
        })
      })
  })
})

module.exports = router
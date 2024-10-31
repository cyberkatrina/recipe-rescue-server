const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const pool = require("./sql/connection");
const jwt = require("jsonwebtoken");

router.post("/", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if the email already exists
    pool.query(
      `SELECT * FROM users WHERE email = ?`,
      [email],
      async (err, results) => {
        if (err) {
          console.error("Database query error:", err);
          return res.status(500).json({ message: "Server error." });
        }

        if (results.length > 0) {
          // Email already exists
          console.log("Email already in use:", email);
          return res.status(400).json({ message: "Email already in use." });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert the new user into the database
        pool.query(
          `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`,
          [name, email, hashedPassword],
          (err, result) => {
            if (err) {
              console.error("Insert user error:", err);
              return res.status(500).json({ message: "Server error." });
            }

            // Generate a token
            const token = jwt.sign(
              { id: result.insertId, email },
              "your_jwt_secret",
              { expiresIn: "1h" }
            );

            // Respond with the token and user info
            res.status(201).json({ token, userId: result.insertId });
          }
        );
      }
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;

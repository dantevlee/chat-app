require("dotenv").config();

const express = require("express");
const router = express.Router();
const db = require("../database/database");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    const user = await db.query(`SELECT * FROM users WHERE email = $1`, [
      email,
    ]);

    if (user.rows.length !== 0)
      return res.status(401).send("User already exists");

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await db.query(
      `INSERT INTO users(firstName, lastName, email, password) VALUES($1, $2, $3, $4) RETURNING *`,
      [firstName, lastName, email, hashedPassword]
    );

    res.json({ newUser });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

router.post(`/login`, async (req, res) => {
  const { email, password } = req.body;
  const io = req.app.get("socketio");

  try {
    const signedInUser = await db.query(
      `SELECT * FROM users WHERE email = $1`,
      [email]
    );

    if (signedInUser.rowCount < 1) {
      res.status(400).json("User does not exist");
    }

    const isMatch = await bcrypt.compare(
      password,
      signedInUser.rows[0].password
    );
    if (isMatch) {
      await db.query(`UPDATE users SET last_active_at = $1 WHERE email = $2`, [
        new Date(),
        email,
      ]);
    }

    if (!isMatch) {
      return res.status(400).json("Incorrect password");
    }

    const jsonPayload = {
      userId: signedInUser.rows[0].id,
      firstName: signedInUser.rows[0].firstName,
    };

    const token = jwt.sign(jsonPayload, process.env.TOKEN_SECRET);

    const onlineUsers = await db.query(
      "SELECT * FROM users WHERE last_active_at > now() - interval '12 hours'"
    );

    io.emit("login", { activeUsers: onlineUsers.rows });

    res.json({ token, email });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

router.post(`/logout`, async (req, res) => {
  const { userEmail } = req.body;
  const io = req.app.get("socketio");

  try {
    await db.query("UPDATE users SET last_active_at = $1 WHERE email = $2", [
      null,
      userEmail,
    ]);

    const stillActive = db.query(
      "SELECT * FROM users WHERE last_active_at > now() - interval '12 hours'"
    );

    io.emit("logout", { activeUsers: (await stillActive).rows });
    res.json({ message: "logged out" });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

module.exports = router;

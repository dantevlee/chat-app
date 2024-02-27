require("dotenv").config();

const express = require("express");
const router = express.Router();
const db = require("../database/database");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, username, password } = req.body;
    const user = await db.query(`SELECT * FROM users WHERE username = $1`, [
      username,
    ]);

    if (user)
      return res.status(401).send("User already exists");

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await db.query(
      `INSERT INTO users(firstName, lastName, username, password) VALUES($1, $2, $3, $4) RETURNING *`,
      [firstName, lastName, username, hashedPassword]
    );

    res.json({ newUser });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

router.post(`/login`, async (req, res) => {
  const { username, password } = req.body;
  const io = req.app.get("socketio");

  try {
    const signedInUser = await db.query(
      `SELECT * FROM users WHERE username = $1`,
      [username]
    );

    if (signedInUser.rowCount < 1) {
      res.status(400).json("User does not exist");
    }

    const isMatch = await bcrypt.compare(
      password,
      signedInUser.rows[0].password
    );
    if (isMatch) {
      await db.query(`UPDATE users SET last_active_at = $1 WHERE username = $2`, [
        new Date(),
        username,
      ]);
    }

    if (!isMatch) {
      return res.status(400).json("Incorrect password");
    }

    const jsonPayload = {
      userId: signedInUser.rows[0].id,
      username: signedInUser.rows[0].username,
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
  const { username } = req.body;
  const io = req.app.get("socketio");

  try {
    await db.query("UPDATE users SET last_active_at = $1 WHERE username = $2", [
      null,
      username,
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

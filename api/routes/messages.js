require("dotenv").config();

const express = require("express");
const router = express.Router();
const db = require("../database/database");
const jwt = require("jsonwebtoken");

router.get("/messages", async (req, res) => {
  try {
    const token = req.headers.token;
    const messages = await db.query(`SELECT 
      messages.message_id,
      messages.created_at,
      users.username AS user,
      channels.channel,
      messages.message_text
  FROM messages
  INNER JOIN channels ON messages.channel_id = channels.id
  INNER JOIN users ON messages.username = users.username
  ORDER BY messages.created_at;`);

    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);

    if (!decoded) {
      return res.status(401).json("Unauthorized");
    }

    res.json(messages.rows);
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message);
  }
});

router.post("/send/messages", async (req, res) => {
  const {text, username, channelId  } = req.body;
  const date = new Date();
  const io = req.app.get("socketio");

  try {
    const newMessage = await db.query(
      `INSERT INTO messages(message_text, created_at, username, channel_id) VALUES($1, $2, $3, $4) RETURNING *`,
      [text, date, username, channelId]
    );

    io.emit("receive-message", { username: username, message_text: text });

    res.json(newMessage.rows[0]);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;

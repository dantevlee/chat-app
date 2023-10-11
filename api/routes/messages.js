require('dotenv').config();

const express = require('express');
const router = express.Router();
const db = require('../database/database');
const jwt = require('jsonwebtoken');

router.get('/messages', async(req, res) => {
  try {
    const token = req.headers.token;
    const messages = await db.query(`SELECT message_text, firstname FROM messages INNER JOIN users ON messages.user_id = users.id`);

    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
  
    if(!decoded) {
      return res.status(401).json('Unauthorized');
    }

    res.json(messages.rows);
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message);
  }
});

router.post('/send/messages', async (req, res) => {
  const {id, text, username} = req.body;
  const date = new Date();
  const io = req.app.get('socketio');

  try {
    const newMessage = await db.query(`INSERT INTO messages(message_text, created_at, user_id) VALUES($1, $2, $3) RETURNING *`, [text, date, id]);

    io.emit('receive-message', {firstname: username, message_text: text});

    res.json(newMessage.rows[0])
  } catch (err) {
    res.status(500).send(err.message);
  }
})


module.exports = router;
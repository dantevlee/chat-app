const express = require('express');
const router = express.Router();
const db = require('../database/database');
const jwt = require('jsonwebtoken');
const jwt_decode = require("jwt-decode");

router.get('/users', async(req, res) => {

  try {
    const token = req.headers.token;
    const decoded = jwt_decode(token);
 
    const user = await db.query('SELECT firstName FROM users WHERE id = $1', [decoded.userId]);

    const payload = jwt.verify(token, process.env.TOKEN_SECRET);

    if(!payload) {
      return res.status(401).json('Unauthorized');
    }
    res.json(user.rows);
  } catch(err) {
    res.status(500).send(err.message);
  }
})

router.get('/users/active', async (req, res) => {
  try {
    const active = await db.query("SELECT * FROM users WHERE last_active_at > now() - interval ' 12 hours'");

    if (active.rows) {
      res.send(active.rows);
    }
  } catch(err) {
    res.status(500).send(err.message);
  }
})

module.exports = router;
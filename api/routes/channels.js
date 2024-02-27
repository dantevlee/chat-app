require('dotenv').config();

const express = require('express');
const router = express.Router();
const db = require('../database/database');
const jwt = require('jsonwebtoken');

router.get('/channels', async(req, res) => {
  try {
    const token = req.headers.token;
    const chanels = await db.query(`SELECT channel FROM channels ORDER BY ID`);

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

module.exports = router;
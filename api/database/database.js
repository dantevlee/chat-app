require('dotenv').config();
const Pool  = require('pg').Pool;

const client = new Pool ({
  host: process.env.HOST, 
  user: process.env.USER,
  port: 5432,
  password: process.env.PASSWORD,
  database: process.env.DATABASE
})

module.exports = client;
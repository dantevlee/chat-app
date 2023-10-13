require('dotenv').config();
const Pool  = require('pg').Pool;
const { readFileSync } = require('fs');

const sqlCreate = readFileSync('chat.sql');

const pool = new Pool ({
  host: process.env.HOST, 
  user: process.env.USER,
  port: 5432,
  password: process.env.PASSWORD,
  database: process.env.DATABASE
})

pool.connect();

pool.on('connect', client => {
  client.query(sqlCreate, (err, res) => {
    if (err) throw err;
    console.log(res);
  });
});


module.exports = pool;
require('dotenv').config();
const {Client} = require('pg');

const client = new Client ({
  host: process.env.HOST, 
  user: process.env.USER,
  port: 5432,
  password: process.env.PASSWORD,
  database: process.env.DATABASE
})

client.connect();

client.query(`Select * from test`, (err, res) => {
  if (!err) {
    console.log(res);
  } else {
    console.log(err.message);
  }
  client.end;
})

module.exports = client;
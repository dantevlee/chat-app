const express = require('express');
require('dotenv').config();
const app = express();
const path = require('path');
const port = process.env.PORT || 3000;
const cors = require('cors');
const socket = require('socket.io');
const server = require('http').createServer(app);

app.use(cors());

const io = socket(server);
app.set("socketio", io);

app.use("/", express.static(path.join(__dirname, "../client/build")));

app.use(express.json());

app.use('/api', require('./routes/users'));
app.use('/api', require('./routes/messages'));
app.use('/api', require('./routes/auth'));

server.listen(port, () => console.log(`server is listening on port ${port}`));
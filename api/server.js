const express = require('express');
require('dotenv').config();
const app = express();
const path = require('path');
const port = process.env.PORT || 3000;
const cors = require('cors');

app.use(cors());

app.use("/", express.static(path.join(__dirname, "../client/build")));
app.use(express.json());

app.listen(port, () => console.log(`server is listening on port ${port}`));
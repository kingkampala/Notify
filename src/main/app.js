const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }))

//const productRoute = require('../route/product');

//app.use(`/product`, productRoute);

module.exports = { app };
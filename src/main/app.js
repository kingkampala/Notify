const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }))

const userRoute = require('../routes/user');
const notificationRoute = require('../routes/notification');

app.use(`/user`, userRoute);
app.use(`/notification`, notificationRoute);

module.exports = { app };
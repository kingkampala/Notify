const { app } = require('./app');
const { connectDb } = require('./db');
const http = require('http');
const { initSocket } = require('../services/socket');
require('dotenv').config();

const port = process.env.PORT || 2810;

const startServer = async () => {
    try {
      await connectDb();

      const server = http.createServer(app);

      initSocket(server);
  
      server.listen(port, '0.0.0.0', () => {
        console.log(`server running on port ${port}`);
      });
    } catch (error) {
      console.error('error starting the server', error);
    }
};

startServer();
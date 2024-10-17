const { app } = require('./app');
const { connectDb } = require('./db');
require('dotenv').config();

const port = process.env.PORT || 2810;

const startServer = async () => {
    try {
      await connectDb();
  
      app.listen(port, '0.0.0.0', () => {
        console.log(`server running on port ${port}`);
      });
    } catch (error) {
      console.error('error starting the server', error);
    }
};

startServer();
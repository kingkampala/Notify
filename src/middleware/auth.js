const jwt = require('jsonwebtoken');
require('dotenv').config();

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).send('access denied. no token provided.');
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).send('invalid or expired token.');
    }

    if (!decoded.user || !decoded.user.id) {
      return res.status(403).json({ error: 'token is missing user information.' });
    }

    req.user = decoded.user;
    next();
  });
};

module.exports = authenticateToken;
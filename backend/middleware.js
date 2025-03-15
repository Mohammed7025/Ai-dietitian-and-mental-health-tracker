// authMiddleware.js
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'your_jwt_secret_key'; // Use environment variable in production

function authMiddleware(req, res, next) {
  // Check for token in headers
  const token = req.header('Authorization') && req.header('Authorization').split(' ')[1]; // Expect "Bearer <token>"
  
  if (!token) return res.status(401).json({ error: 'No token, authorization denied' });
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { userId: ... }
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token is not valid' });
  }
}

module.exports = authMiddleware;

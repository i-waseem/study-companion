const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    // Get token from cookie
    const token = req.cookies.token;
    
    if (!token) {
      console.log('No token found in cookies');
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token verified, user ID:', decoded.userId);
    
    // Add user info to request
    req.user = decoded;
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    // Clear invalid token
    res.clearCookie('token');
    res.status(401).json({ message: 'Session expired, please login again' });
  }
};

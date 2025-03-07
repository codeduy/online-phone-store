const jwt = require('jsonwebtoken');

const verifyToken = async (req, res) => {
  try {
      const token = req.headers.authorization?.split(' ')[1];
      
      if (!token) {
          return res.json({ valid: false });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return res.json({ 
          valid: true,
          user: {
              userId: decoded.userId,
              role: decoded.role
          }
      });
  } catch (error) {
      return res.json({ valid: false });
  }
};

const handleLogout = (req, res) => {
    res.status(200).json({ message: 'Logged out successfully' });
};

// const auth = (req, res, next) => {
//   try {
//       const authHeader = req.headers.authorization;
//       if (!authHeader || !authHeader.startsWith('Bearer ')) {
//           return res.status(401).json({
//               success: false,
//               message: 'No token provided'
//           });
//       }

//       const token = authHeader.split(' ')[1];
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
//       // Add user info to request
//       req.user = decoded;
//       next();
//   } catch (error) {
//       console.error('Auth middleware error:', error);
//       if (error.name === 'TokenExpiredError') {
//           return res.status(401).json({
//               success: false,
//               message: 'Token expired'
//           });
//       }
//       return res.status(401).json({
//           success: false,
//           message: 'Invalid token'
//       });
//   }
// };

const auth = (req, res, next) => {
    try {
        // Log để debug
        console.log('Auth headers:', req.headers);
        console.log('Authorization header:', req.headers.authorization);

        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('No valid auth header found');
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        const token = authHeader.split(' ')[1];
        console.log('Token extracted:', token);

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('Decoded token:', decoded);

            // Add user info to request
            req.user = {
                id: decoded.userId,
                userId: decoded.userId,
                role: decoded.role
            };

            console.log('User added to request:', req.user);
            next();
        } catch (jwtError) {
            console.error('JWT verification error:', jwtError);
            
            if (jwtError.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    message: 'Token has expired'
                });
            }

            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(401).json({
            success: false,
            message: 'Authentication failed'
        });
    }
};


module.exports = { verifyToken, handleLogout, auth };
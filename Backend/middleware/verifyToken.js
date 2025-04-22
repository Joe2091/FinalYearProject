const { adminAuth } = require('../firebase/admin');
const User = require('../models/User');

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing or invalid token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    //console.log('Decoded token:', decoded); These logs were for debugging

    let user = await User.findOne({ uid: decoded.uid });
    if (!user) {
      user = new User({
        uid: decoded.uid,
        email: decoded.email,
      });
      await user.save();
      // console.log('New user created:', user);
    } else {
      // console.log('Existing user found:', user);
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Token verification failed:', err);
    res.status(401).json({ message: 'Unauthorized' });
  }
};

module.exports = verifyToken;

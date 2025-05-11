const { adminAuth } = require('../firebase/admin');
const User = require('../models/User');

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  //check for if header exists and is formatted correcty
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing or invalid token' });
  }

  const token = authHeader.split(' ')[1]; //token extraction

  try {
    const decoded = await adminAuth.verifyIdToken(token); //token is verified using Firebase Admin

    let user = await User.findOne({ uid: decoded.uid }); // Find user in MongoDB using the uid from decoded token

    //no user in db means a new one is created and saved
    if (!user) {
      user = new User({
        uid: decoded.uid,
        email: decoded.email,
      });
      await user.save();
    }

    //user object attached to request
    req.user = user;
    next();
  } catch (err) {
    console.error('Token verification failed:', err);
    res.status(401).json({ message: 'Unauthorized' });
  }
};

module.exports = verifyToken; //middleware exported

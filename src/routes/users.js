// Import necessary modules
import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { UserModel } from '../models/Users.js';

// Create an Express router
const router = express.Router();



router.get("/postedRecipes/:userID", async (req, res) => {
  try {
    const userID = req.params.userID;
    const userRecipes = await RecipesModel.find({ userOwner: userID });

    res.status(200).json({
      userRecipes,
    });
  } catch (error) {
    console.error('Error fetching posted recipes:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});




// Middleware to verify the authenticity of the token
export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.sendStatus(401); // Unauthorized
  }

  jwt.verify(token.split(' ')[1], 'secret', (err, decoded) => {
    if (err) {
      return res.sendStatus(403); // Forbidden
    }
    req.decoded = decoded;
    next();
  });
};

router.put('/', verifyToken, async (req, res) => {
  try {
    // Your logic to add to favorites

    // Send a success response
    res.status(200).json({ message: 'Added to favorites successfully' });
  } catch (error) {
    console.error('Add to favorites error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/user/profile/:userID', verifyToken, async (req, res) => {
  try {
    const userID = req.params.userID;

    // Fetch user details from MongoDB based on the provided userID
    const user = await UserModel.findById(userID);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Send user details to the client
    res.json({
      name: user.name,
      username: user.username,
      email: user.email,
      favoriteRecipes: user.favoriteRecipes,
    });
  } catch (error) {
    console.error('Profile fetching error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});




// Endpoint to handle user registration
router.post('/register', async (req, res) => {
  const { name, username, email, password } = req.body;

  try {
    const existingUser = await UserModel.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new UserModel({ name, username, email, password: hashedPassword });

    await newUser.save();
    res.json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


router.put('/updateSettings/:userID', verifyToken, async (req, res) => {
  const { newSettingValue } = req.body;
  const userId = req.decoded.id; // Use req.decoded.id to get the user ID

  try {
    // Find the user and update the settings
    const user = await UserModel.findByIdAndUpdate(userId, {
      $set: { setting: newSettingValue },
    }, { new: true });

    // Check if the user exists
    if (!user) {
      console.error('User not found:', userId);
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ settings: user.setting, message: 'Settings updated successfully' });
  } catch (err) {
    console.error('Error updating settings:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/settings', verifyToken, async (req, res) => {
  try {
    // Get user ID from the decoded token
    const userId = req.decoded.id;
    console.log('Fetching user settings for user ID:', userId);
    // Fetch user details from MongoDB
    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Send user settings to the client
    res.json({
      settings: user.settings,
      message: 'User settings retrieved successfully',
    });
  } catch (error) {
    console.error('Error fetching user settings:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const user = await UserModel.findOne({ username });

  if (!user) {
    return res.status(400).json({ message: 'Username or password is incorrect' });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(400).json({ message: 'Username or password is incorrect' });
  }

  const token = jwt.sign({ id: user._id }, 'secret');
  res.json({ token, userID: user._id });
});

// Export the router
export { router as userRouter };

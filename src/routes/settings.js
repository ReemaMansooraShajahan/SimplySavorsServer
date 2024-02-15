// routes/settings.js
import express from 'express';
import { UserModel } from '../models/Users.js';
import { verifyToken } from './users.js';
const settingsRouter = express.Router();

settingsRouter.put('/updateSettings/:userID', verifyToken, async (req, res) => {
  const { newSettingValue } = req.body;
  const userId = req.decoded.id;

  try {
    // Find the user and update the settings
    const user = await UserModel.findByIdAndUpdate(userId, {
      $set: { settings: newSettingValue },  // Update 'settings' field
    }, { new: true });

    // Check if the user exists
    if (!user) {
      console.error('User not found:', userId);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('Settings updated successfully');
    res.status(200).json({ settings: user.settings, message: 'Settings updated successfully' });
  } catch (err) {
    console.error('Error updating settings:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

settingsRouter.get('/getSettings/:userID', verifyToken, async (req, res) => {
  const userId = req.params.userID;

  try {
    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      settings: user.settings,
      message: 'User settings retrieved successfully',
    });
  } catch (error) {
    console.error('Error fetching user settings:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default settingsRouter;

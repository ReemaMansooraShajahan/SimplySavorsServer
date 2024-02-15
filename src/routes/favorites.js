
// routes/favorites.js
import express from 'express';
import { RecipesModel } from "../models/Recipes.js";
import { UserModel } from "../models/Users.js";
const favoritesRouter = express.Router();

favoritesRouter.delete('/removeFromFavorites/:userID/:recipeID', async (req, res) => {
  const { userID, recipeID } = req.params;
  console.log('Removing from favorites:', userID, recipeID);

  try {
    // Find the user and update the favoriteRecipes array
    const user = await UserModel.findByIdAndUpdate(userID, {
      $pull: { favoriteRecipes: recipeID },
    });

    // Check if the user exists
    if (!user) {
      console.error('User not found:', userID);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('Removed from favorites successfully');
    res.status(204).send();
  } catch (err) {
    console.error('Error removing from favorites:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


export default favoritesRouter;
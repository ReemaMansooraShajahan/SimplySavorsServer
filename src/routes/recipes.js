import express from "express";
import mongoose from "mongoose";
import { RecipesModel } from "../models/Recipes.js";
import { UserModel } from "../models/Users.js";
import { verifyToken } from "./users.js";


const router = express.Router();


router.get('/:recipeId', async (req, res) => {
  try {
    const recipeId = req.params.recipeId;

    if (!mongoose.Types.ObjectId.isValid(recipeId)) {
      return res.status(400).json({ error: 'Invalid Recipe ID' });
    }

    const recipe = await RecipesModel.findOne({ _id: recipeId });

    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    res.json(recipe);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});




router.get("/", async (req, res) => {
  try {
    const result = await RecipesModel.find({});
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json(err);
  }
});


router.delete('/:recipeID', verifyToken, async (req, res) => {
  const { recipeID } = req.params;

  try {
    // Find the recipe by ID
    const recipe = await RecipesModel.findById(recipeID);

    if (!recipe) {
      // Recipe not found
      return res.status(404).json({ error: 'Recipe not found' });
    }

    // Check if the user making the request is the owner of the recipe
    const userID = req.decoded.id; // Assuming you have the user ID in the decoded token
    if (recipe.userOwner.toString() !== userID) {
      // Unauthorized user
      return res.status(403).json({ error: 'Unauthorized to delete this recipe' });
    }

    // Delete the recipe from the database
    await RecipesModel.findByIdAndDelete(recipeID);

    // Remove the reference to the recipe from the user's favoriteRecipes array
    await UserModel.findByIdAndUpdate(userID, {
      $pull: { favoriteRecipes: recipeID },
    });

    console.log('Recipe deleted successfully');
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting recipe:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.put('/addToFavorites/:recipeID', verifyToken, async (req, res) => {
  const { recipeID } = req.params;
  const { userID } = req.decoded; // Extract userID from the decoded token

  try {
    // Find the recipe by ID
    const recipe = await RecipesModel.findById(recipeID);

    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    // Check if the recipe is already in the user's favorites
    const user = await UserModel.findById(userID);
    if (user.favoriteRecipes.includes(recipeID)) {
      return res.status(400).json({ error: 'Recipe already in favorites' });
    }

    // Add the recipe to the user's favorites
    user.favoriteRecipes.push(recipeID);
    await user.save();

    res.status(200).json({ favoriteRecipes: user.favoriteRecipes });
  } catch (error) {
    console.error('Error adding to favorites:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get("/", async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    if (search) {
      query = { name: { $regex: search, $options: 'i' } };
    }

    const result = await RecipesModel.find(query);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json(err);
  }
});



router.post("/",verifyToken,  async (req, res) => {
    const recipe = new RecipesModel(req.body);
    // ({
    //   _id: new mongoose.Types.ObjectId(),
    //   name: req.body.name,
    //   image: req.body.image,
    //   ingredients: req.body.ingredients,
    //   instructions: req.body.instructions,
    //   imageUrl: req.body.imageUrl,
    //   cookingTime: req.body.cookingTime,
    //   userOwner: req.body.userOwner,
    // });
    // console.log(recipe);
  
    try {
      const result = await recipe.save();
      res.status(201).json(result)
 
    } catch (err) {
      // console.log(err);
      res.status(500).json(err);
    }
  });

  router.put("/",verifyToken, async (req, res) => {

    try {
      const recipe = await RecipesModel.findById(req.body.recipeID);
      const user = await UserModel.findById(req.body.userID);
      user.favoriteRecipes.push(recipe);
      await user.save();
      res.status(201).json({ favoriteRecipes: user.favoriteRecipes });
    } catch (err) {
      res.status(500).json(err);
    }
  });

  router.get('/profile', verifyToken, async (req, res) => {
    try {
      // Get user ID from the decoded token
      const userId = req.decoded.id;
  
      // Fetch user details from MongoDB
      const user = await UserModel.findById(userId);
  
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


  router.get("/postedRecipes/:userID", async (req, res) => {
  try {
    const userID = req.params.userID;
    
    // Find the user by ID
    const user = await UserModel.findById(userID);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Retrieve recipes posted by the user
    const userRecipes = await RecipesModel.find({ userOwner: userID });

    res.status(200).json({
      userRecipes,
    });
  } catch (err) {
    console.error('Error fetching posted recipes:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

  router.get("/favoriteRecipes/ids/:userID", async (req, res) => {
    try {
      const user = await UserModel.findById(req.params.userID);
      res.status(201).json({ favoriteRecipes: user?.favoriteRecipes });
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  });


  router.get("/favoriteRecipes/:userID", async (req, res) => {
    try {
      const user = await UserModel.findById(req.params.userID);
      const favoriteRecipes = await RecipesModel.find({
        _id: { $in: user.favoriteRecipes },
      });
  
      console.log(favoriteRecipes);
      res.status(201).json({ favoriteRecipes });
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  });
export { router as recipesRouter };
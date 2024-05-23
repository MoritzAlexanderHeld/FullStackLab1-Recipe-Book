import dotenv from 'dotenv'; // Switched to dotenv instead of a "config.js" file, for good practice.
import express from 'express';
import mongoose from 'mongoose';
import Recipe from './models/Recipe.js';

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.static('public'));

// Initiate the connection to MongoDB, using the connection URL (saved in .env file now)
mongoose.connect(process.env.CONNECTION_URL)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err, 'Hey Silly! Did you forget your VPN again??????????'));

// Fetch all recipes from the database
app.get('/api/recipes', async (req, res) => {
  const recipes = await Recipe.find(); // Fetch all recipes
  res.json(recipes); // Send recipes as JSON
});

// Post a new recipe
app.post('/api/recipes', async (req, res) => {
  const newRecipe = new Recipe(req.body); // Create new recipe
  try {
    const savedRecipe = await newRecipe.save(); // Send new recipe
    res.status(201).json(savedRecipe); // Return status codes as per requirements (201 and 409)
  } catch (error) {
    if (error.code === 11000) { // Error for duplicates in MongoDB
      res.status(409).json();
    }
  }
});

// Edit a recipe
app.put('/api/recipes/:id', async (req, res) => {
  const { id } = req.params; // Get only the ID from the URL parameters, need to findByIdAndUpdate
  const updatedRecipe = req.body; // Get the new data for the recipe from the request body
  const result = await Recipe.findByIdAndUpdate(id, updatedRecipe, { new: true }); // Update the recipe
  if (result) {
    res.json(result);
  } else {
    res.status(404).json({ message: "Recipe doesn't exist." }); // Return status 404 as per the requirements
  }
});

app.delete('/api/recipes/:id', async (req, res) => {
  const { id } = req.params; // Same as above
  const result = await Recipe.findByIdAndDelete(id); // Same as above
  if (result) {
    res.json({ message: 'Recipe deleted' });
  } else {
    res.status(404).json({ message: 'Recipe not found' }); // Again status 404 as required
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Click me: http://localhost:${PORT} (Wait until connected to MongoDB! Don't forget your VPN!)`));

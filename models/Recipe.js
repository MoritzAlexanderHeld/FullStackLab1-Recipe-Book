import mongoose from 'mongoose';

// This schema is used to define the structure of a recipe.
// It has to align with the schema setup in mongoDB
const recipeSchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true },
  ingredients: [String],
  instructions: String,
  cookingTime: Number,
});

export default mongoose.model('Recipe', recipeSchema);

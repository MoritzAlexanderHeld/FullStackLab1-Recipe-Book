// Function to fetch and display recipes
async function fetchRecipes() {
    try {
    const response = await fetch('/api/recipes'); // Fetches the recipes from the RESTful API (localhost:5000/api/recipes)
    const recipes = await response.json(); // Converts the response to json. I tried to combine it into one step, but ran into issues.
    displayRecipes(recipes); // Display the recipes, using the function defined below
    } catch (error) { // Just basic error logging, can't hurt.
    console.error('Error:', error);
    }
}

// Function to display recipes in a table
function displayRecipes(recipes) {
    // Gets the recipesTable (defined in index.html) and assigns the tbody to "recipesTable" variable
    const recipesTable = document.getElementById('recipesTable').getElementsByTagName('tbody')[0];
    recipesTable.innerHTML = ''; // Empties the table content, to always only show the latest content, instead of appending it.

    // Iterate over each recipe and create a new row with cells and the corresponding data
    recipes.forEach(recipe => {
    let row = recipesTable.insertRow(); // Each recipe gets a new row in the table
    row.insertCell(0).textContent = recipe.title;
    row.insertCell(1).textContent = recipe.ingredients.join(', ');
    row.insertCell(2).textContent = recipe.instructions;
    row.insertCell(3).textContent = recipe.cookingTime + ' minutes';

    // Edit button
    const actionsCell = row.insertCell(4);
    const editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.addEventListener('click', () => editRecipe(recipe));
    actionsCell.appendChild(editButton);

    // Delete button
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', () => deleteRecipe(recipe._id));
    actionsCell.appendChild(deleteButton);
    });
}

// Function to edit a recipe
function editRecipe(recipe) {
    document.getElementById('title').value = recipe.title;
    document.getElementById('ingredients').value = recipe.ingredients.join(', '); // Explained in detail below
    document.getElementById('instructions').value = recipe.instructions;
    document.getElementById('cookingTime').value = recipe.cookingTime;
    document.getElementById('recipeForm').setAttribute('data-id', recipe._id);
    document.getElementById('recipeForm').querySelector('button').textContent = 'Update Recipe';
}

// Function to delete a recipe
async function deleteRecipe(id) {
    try {
    await fetch(`/api/recipes/${id}`, {
        method: 'DELETE',
    });
    await fetchRecipes();
    } catch (error) {
    console.error('Error:', error);
    }
}

// This method is used to add OR edit a recipe. How it is handled depends on wether there is data already or not.
// So the values for the cells are assigned in the same way, but then depending if there is an ID (when we edit a recipe)
// Or there is no ID (when we create a recipe) it transmits the data either with a POST or with a PUT route.
document.getElementById('recipeForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const title = document.getElementById('title').value;
    // This line does not take the ingredients as one single string, but (as long as they are separated by comma)
    // takes them as individual elements and creates an array of them. When displayed, they are returned to a string.
    // That means at this point it makes absolutely 0 difference for the user, but it keeps the door open for improvements
    // like sorting the ingredients alphabetically, or counting how many recipes contain flour etc
    const ingredients = document.getElementById('ingredients').value.split(',').map(ingredient => ingredient.trim());
    const instructions = document.getElementById('instructions').value;
    const cookingTime = parseInt(document.getElementById('cookingTime').value, 10);
    const recipe = { title, ingredients, instructions, cookingTime };

    const formId = this.getAttribute('data-id');
    if (formId) {
    // If a formId exists (meaning the recipe exists), edit the recipe
    try {
        await fetch(`/api/recipes/${formId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(recipe),
        });
        this.removeAttribute('data-id'); // This deletes the id of the recipe (only from the form) because otherwise future edits would still be linked to this recipe and overwrite it (gave me quite some headache)
        this.querySelector('button').textContent = 'Add Recipe'; // Just resets the button, after clicking "Update recipe"
    } catch (error) {
        console.error('Error:', error);
    }
    } else {
    // If no formId exists, create a new recipe. 
    try {
        await fetch('/api/recipes', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(recipe),
        });
    } catch (error) {
        console.error('Error:', error);
    }
    }

    await fetchRecipes();
    clearForm();
});

// Function to clear the form after adding or editing a recipe
// Could also get an extra button to clear the form manually when adding or editing a recipe.
function clearForm() {
    document.getElementById('title').value = '';
    document.getElementById('ingredients').value = '';
    document.getElementById('instructions').value = '';
    document.getElementById('cookingTime').value = '';
    document.getElementById('recipeForm').removeAttribute('data-id');
    document.getElementById('recipeForm').querySelector('button').textContent = 'Add Recipe';
}

// Calling the function defined at the top, to initially fetch all recipes.
fetchRecipes();

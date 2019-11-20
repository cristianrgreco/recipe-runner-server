const recipeId = require('./recipe-id');

describe('recipeId', () => {

    it('should lowercase the recipe', () => {
        expect(recipeId('RecipeName')).toBe('recipename');
    });

    it('should replace spaces', () => {
        expect(recipeId('Recipe Name')).toBe('recipe-name');
    });

    it('should remove non-alphanumeric characters', () => {
        expect(recipeId('Recipe. &=#Name')).toBe('recipe-name');
    });
});

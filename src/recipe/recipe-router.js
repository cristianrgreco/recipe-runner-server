const Router = require('koa-router');
const fileUpload = require('./../file-upload');

module.exports = recipeRepository => {
    async function fetchRecipes(ctx) {
        ctx.body = await recipeRepository.findAll();
    }

    async function fetchRecipe(ctx) {
        const id = ctx.params.id;
        ctx.body = await recipeRepository.findById(id);
    }

    async function createRecipe(ctx) {
        const {path, type} = ctx.request.files.image;
        const image = await fileUpload(path, type);

        const recipe = {...JSON.parse(ctx.request.body.recipe), image};
        await recipeRepository.save(recipe);

        const location = `/recipes/${recipe._id}`;
        ctx.set('Location', location);
        ctx.status = 201;
    }

    return new Router()
        .get('/recipes', fetchRecipes)
        .get('/recipes/:id', fetchRecipe)
        .post('/recipes', createRecipe);
};

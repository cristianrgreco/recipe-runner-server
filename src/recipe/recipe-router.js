const Router = require('koa-router');
const recipeId = require('./recipe-id');
const fileUploadModule = require('./../file-upload');
const {isAuthorised} = require("../auth/auth-middleware");

module.exports = recipeRepository => {
    const fileUpload = fileUploadModule.remote();

    const fetchRecipes = async ctx => {
        ctx.body = await recipeRepository.findAll();
    };

    const fetchRecipe = async ctx => {
        const id = ctx.params.id;
        ctx.body = await recipeRepository.findById(id);
    };

    const createRecipe = async ctx => {
        const {path, type} = ctx.request.files.image;
        const image = await fileUpload(path, type);

        const recipePayload = JSON.parse(ctx.request.body.recipe);
        const createdAt = new Date();
        const id = `${recipeId(recipePayload.name)}-${createdAt.getTime()}`;

        const recipe = {
            ...recipePayload,
            id,
            createdAt,
            createdBy: ctx.state.user.email,
            image
        };
        await recipeRepository.save(recipe);

        const location = `/recipes/${recipe.id}`;
        ctx.set('Location', location);
        ctx.status = 201;
    };

    return new Router()
        .get('/recipes', fetchRecipes)
        .get('/recipes/:id', fetchRecipe)
        .post('/recipes', isAuthorised, createRecipe);
};

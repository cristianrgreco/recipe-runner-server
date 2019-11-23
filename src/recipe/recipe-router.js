const Router = require('koa-router');
const recipeId = require('./recipe-id');
const fileUploadModule = require('./../file-upload');
const {isAuthorised, optionalIsAuthorised} = require("../auth/auth-middleware");

module.exports = recipeRepository => {
    const fileUpload = fileUploadModule.remote();

    const isRecipeEditable = (ctx, recipe) => {
        return (ctx.state.user && ctx.state.user.email === recipe.createdBy) || undefined;
    };

    const fetchRecipes = async ctx => {
        const recipes = await recipeRepository.findAll();
        ctx.body = recipes.map(recipe => ({
            ...recipe,
            createdBy: undefined,
            isEditable: isRecipeEditable(ctx, recipe)
        }));
    };

    const fetchRecipe = async ctx => {
        const id = ctx.params.id;
        const recipe = await recipeRepository.find(id);
        ctx.body = {
            ...recipe,
            createdBy: undefined,
            isEditable: isRecipeEditable(ctx, recipe)
        };
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

    const updateRecipe = async ctx => {
        const id = ctx.params.id;
        const recipePayload = JSON.parse(ctx.request.body.recipe);
        const updatedAt = new Date();

        let image;
        if (ctx.request.files.image) {
            const {path, type} = ctx.request.files.image;
            image = await fileUpload(path, type);
        } else {
            image = recipePayload.image;
        }

        const recipe = {
            id,
            image,
            name: recipePayload.name,
            description: recipePayload.description,
            duration: recipePayload.duration,
            serves: recipePayload.serves,
            equipment: recipePayload.equipment,
            ingredients: recipePayload.ingredients,
            method: recipePayload.method,
            updatedAt,
            createdBy: ctx.state.user.email,
        };

        await recipeRepository.update(id, recipe);

        const location = `/recipes/${recipe.id}`;
        ctx.set('Location', location);
        ctx.status = 204;
    };

    const deleteRecipe = async ctx => {
        const id = ctx.params.id;
        await recipeRepository.delete(id);
        ctx.status = 204;
    };

    return new Router()
        .get('/recipes', optionalIsAuthorised, fetchRecipes)
        .get('/recipes/:id', optionalIsAuthorised, fetchRecipe)
        .post('/recipes', isAuthorised, createRecipe)
        .delete('/recipes/:id', isAuthorised, deleteRecipe)
        .put('/recipes/:id', isAuthorised, updateRecipe);
};

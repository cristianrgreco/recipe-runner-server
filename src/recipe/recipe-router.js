const Router = require('koa-router');
const recipeId = require('./recipe-id');
const fileUploadModule = require('./../file-upload');
const {authenticate, authorisationRequired} = require("../auth/auth-middleware");

module.exports = recipeRepository => {
    const fileUpload = fileUploadModule.remote();

    const isRecipeEditable = (ctx, recipe) => {
        return (ctx.state.user && ctx.state.user.email === recipe.createdBy) || undefined;
    };

    const recipeToDto = ctx => recipe => ({
        ...recipe,
        createdBy: undefined,
        isEditable: isRecipeEditable(ctx, recipe)
    });

    const fetchRecipes = async ctx => {
        const recipes = await recipeRepository.findAll();
        ctx.body = recipes.map(recipeToDto(ctx));
    };

    const fetchRecipe = async ctx => {
        const id = ctx.params.id;
        const recipe = await recipeRepository.find(id);
        ctx.body = recipeToDto(ctx)(recipe);
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
        const processImage = async () => {
            if (ctx.request.files.image) {
                const {path, type} = ctx.request.files.image;
                return await fileUpload(path, type);
            } else {
                return recipePayload.image;
            }
        };

        const id = ctx.params.id;
        const recipePayload = JSON.parse(ctx.request.body.recipe);
        const image = await processImage();

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
        .get('/recipes', authenticate, fetchRecipes)
        .get('/recipes/:id', authenticate, fetchRecipe)
        .post('/recipes', authenticate, authorisationRequired, createRecipe)
        .delete('/recipes/:id', authenticate, authorisationRequired, deleteRecipe)
        .put('/recipes/:id', authenticate, authorisationRequired, updateRecipe);
};

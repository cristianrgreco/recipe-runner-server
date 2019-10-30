const Koa = require('koa');
const koaBody = require('koa-body');
const cors = require('koa2-cors');
const RecipeRepository = require('./recipe/RecipeRepository');
const recipeRouterModule = require('./recipe/recipe-router');
const healthRouterModule = require('./health-router');

module.exports = db => {
    const healthRouter = healthRouterModule();

    const recipeRepository = new RecipeRepository(db.collection('recipes'));
    const recipeRouter = recipeRouterModule(recipeRepository);

    return new Koa()
        .use((ctx, next) => koaBody({multipart: true})(ctx, next))
        .use(cors({exposeHeaders: ['Location']}))
        .use(healthRouter.routes())
        .use(healthRouter.allowedMethods())
        .use(recipeRouter.routes())
        .use(recipeRouter.allowedMethods());
};

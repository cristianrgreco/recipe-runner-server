const Koa = require('koa');
const koaBody = require('koa-body');
const koaMount = require('koa-mount');
const koaStatic = require('koa-static');
const cors = require('koa2-cors');
const {PUBLIC_PATH, PUBLIC_DIRNAME} = require('./public-dir');
const RecipeRepository = require('./recipe/RecipeRepository');
const recipeRouterModule = require('./recipe/recipe-router');

module.exports = db => {
    const recipeRepository = new RecipeRepository(db.collection('recipes'));
    const recipeRouter = recipeRouterModule(recipeRepository);

    return new Koa()
        .use((ctx, next) => koaMount(`/${PUBLIC_DIRNAME}`, koaStatic(PUBLIC_PATH))(ctx, next))
        .use((ctx, next) => koaBody({multipart: true})(ctx, next))
        .use(cors({exposeHeaders: ['Location']}))
        .use(recipeRouter.routes())
        .use(recipeRouter.allowedMethods());
};

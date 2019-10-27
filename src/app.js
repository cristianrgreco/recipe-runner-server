const path = require('path');
const Koa = require('koa');
const koaBody = require('koa-body');
const koaMount = require('koa-mount');
const koaStatic = require('koa-static');
const cors = require('koa2-cors');
const RecipeRepository = require('./recipe/RecipeRepository');
const recipeRouterModule = require('./recipe/recipe-router');

module.exports = db => {
    const publicDir = path.join(__dirname, "..", "public");

    const recipeRepository = new RecipeRepository(db.collection('recipes'));
    const recipeRouter = recipeRouterModule(recipeRepository);

    return new Koa()
        .use((ctx, next) => koaMount("/public", koaStatic(publicDir))(ctx, next))
        .use((ctx, next) => koaBody({multipart: true})(ctx, next))
        .use(cors({exposeHeaders: ['Location']}))
        .use(recipeRouter.routes())
        .use(recipeRouter.allowedMethods());
};

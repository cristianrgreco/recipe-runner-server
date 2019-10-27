const Koa = require('koa');
const Router = require('koa-router');
const cors = require('koa2-cors');
const RecipeRepository = require('./RecipeRepository');

const router = new Router();

module.exports = db => {
    const recipeRepository = new RecipeRepository(db.collection('recipes'));

    router.get('/recipes', async ctx => {
        ctx.body = await recipeRepository.findAll();
    });

    return new Koa()
        .use(cors())
        .use(router.routes())
        .use(router.allowedMethods());
};

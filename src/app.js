const fs = require('fs');
const path = require('path');
const uuid = require('uuid/v1');
const Koa = require('koa');
const Router = require('koa-router');
const koaBody = require('koa-body');
const koaMount = require('koa-mount');
const koaStatic = require('koa-static');
const cors = require('koa2-cors');
const mime = require('mime-types');
const RecipeRepository = require('./RecipeRepository');

const publicDir = path.join(__dirname, "..", "public");

module.exports = db => {
    const recipeRepository = new RecipeRepository(db.collection('recipes'));

    const router = new Router();

    router.get('/recipes', async ctx => {
        ctx.body = await recipeRepository.findAll();
    });

    router.get('/recipes/:id', async ctx => {
        const id = ctx.params.id;
        ctx.body = await recipeRepository.findById(id);
    });

    router.post('/recipes', async ctx => {
        const {path, type} = ctx.request.files.image;
        const image = await uploadFile(path, type);

        const recipe = {
            ...JSON.parse(ctx.request.body.recipe),
            image
        };

        await recipeRepository.save(recipe);

        const location = `/recipes/${recipe._id}`;
        ctx.set('Location', location);

        ctx.status = 201;
    });

    return new Koa()
        .use((ctx, next) => koaMount("/public", koaStatic(publicDir))(ctx, next))
        .use((ctx, next) => koaBody({multipart: true})(ctx, next))
        .use(cors({exposeHeaders: ['Location']}))
        .use(router.routes())
        .use(router.allowedMethods());
};

function uploadFile(remotePath, type) {
    return new Promise(resolve => {
        const imageId = `${uuid()}.${mime.extension(type)}`;

        const reader = fs.createReadStream(remotePath);

        const serverPath = path.join(publicDir, `${imageId}`);
        const stream = fs.createWriteStream(serverPath);
        reader.on('end', () => {
            resolve(imageId);
        });

        reader.pipe(stream);
    });
}

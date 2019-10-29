const Router = require('koa-router');

module.exports = () => {
    return new Router()
        .get('/health', ctx => {
            ctx.status = 200;
        });
};

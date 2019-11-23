const {isTokenValid} = require('./auth');

const unauthorised = ctx => {
    console.log('Unauthorised request received');
    ctx.status = 401;
};

const optionalIsAuthorised = async (ctx, next) => {
    const authorisation = ctx.headers.authorization;

    if (!authorisation) {
        await next();
    } else {
        const parts = authorisation.split(' ');

        if (parts.length !== 2) {
            await next();
        } else {
            const token = parts[1];

            const decodedToken = await isTokenValid(token);
            if (!decodedToken) {
                await next();
            } else {
                ctx.state.user = {email: decodedToken.email};
                await next();
            }
        }
    }
};

const isAuthorised = async (ctx, next) => {
    const authorisation = ctx.headers.authorization;

    if (!authorisation) {
        unauthorised(ctx);
    } else {
        const parts = authorisation.split(' ');

        if (parts.length !== 2) {
            unauthorised(ctx);
        } else {
            const token = parts[1];

            const decodedToken = await isTokenValid(token);
            if (!decodedToken) {
                unauthorised(ctx);
            } else {
                ctx.state.user = {email: decodedToken.email};
                await next();
            }
        }
    }
};

module.exports = {
    optionalIsAuthorised,
    isAuthorised,
};

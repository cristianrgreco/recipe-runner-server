const {isTokenValid} = require('./auth');

const authenticate = async (ctx, next) => {
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

const authorisationRequired = async (ctx, next) => {
    if (ctx.state.user === undefined) {
        ctx.status = 401;
    } else {
        await next();
    }
};

module.exports = {
    authenticate,
    authorisationRequired,
};

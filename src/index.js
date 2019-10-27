const app = require('./app');
const {connectDb} = require('./db');

const port = process.env.PORT;

(async () => {
    if (port === undefined) {
        throw new Error('PORT is a required environment variable');
    }

    console.log('Connecting to MongoDB');
    const db = await connectDb();
    console.log('Connected to MongoDB');

    console.log(`Starting server on port ${port}`);
    app(db).listen(port, () => console.log(`Server listening on port ${port}`));
})();

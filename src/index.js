const app = require('./app');
const {connectDb} = require('./db');

process.on('unhandledRejection', err => console.error(err));

(async () => {
    console.log('Connecting to MongoDB');
    const db = await connectDb();
    console.log('Connected to MongoDB');

    const port = 8000;
    console.log(`Starting server on port ${port}`);
    app(db).listen(port, () => console.log(`Server listening on port ${port}`));
})();

const app = require('./app');
const {connectDb} = require('./db');

process.on('unhandledRejection', err => console.error(err));

(async () => {
    const db = await connectDb();
    console.log('Connected to DB');

    const port = 8000;
    app(db).listen(port, () => console.log(`Listening on port ${port}`));
})();

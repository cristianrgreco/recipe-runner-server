const app = require('./app');
const {connectDb} = require('./db');

(async () => {
    const db = await connectDb();
    console.log('Connected to DB');

    app(db).listen(3000, () => console.log('Listening on port 3000'));
})();

const {MongoClient} = require('mongodb');

const username = process.env['DB_USERNAME'];
const password = process.env['DB_PASSWORD'];
const database = process.env['DB_DATABASE'];
const url = `mongodb+srv://${username}:${password}@recipe-runner-imquh.mongodb.net/test?retryWrites=true&w=majority`;

async function connectDb() {
    if ([username, password, database].some(arg => arg === undefined)) {
        throw new Error('DB_USRNAME, DB_PASSWORD and DB_DATABASE are required environment variables');
    }

    const client = new MongoClient(url, {useUnifiedTopology: true});
    await client.connect();

    return client.db(database);
}

module.exports = {connectDb};
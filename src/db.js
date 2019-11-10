const {MongoClient} = require('mongodb');

async function connectDb() {
    const client = new MongoClient(getUrl(), {useUnifiedTopology: true});
    await client.connect();
    return client.db(getDatabase());
}

function getUrl() {
    const hostname = process.env['DB_HOSTNAME'];
    const username = process.env['DB_USERNAME'];
    const password = process.env['DB_PASSWORD'];

    if ([hostname, username, password].some(arg => arg === undefined)) {
        throw new Error('DB_HOSTNAME, DB_PASSWORD and DB_DATABASE are required environment variables');
    }

    return `mongodb+srv://${username}:${password}@${hostname}/test?retryWrites=true&w=majority`;
}

function getDatabase() {
    const database = process.env['DB_DATABASE'];

    if (database === undefined) {
        throw new Error('DB_DATABASE is a required environment variable');
    }

    return database;
}

module.exports = {connectDb};

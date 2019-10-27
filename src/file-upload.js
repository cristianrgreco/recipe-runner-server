const fs = require('fs');
const path = require('path');
const uuid = require('uuid/v1');
const mime = require('mime-types');
const {PUBLIC_PATH} = require('./public-dir');

module.exports = (remotePath, type) => new Promise(resolve => {
    const reader = fs.createReadStream(remotePath);

    const imageId = `${uuid()}.${mime.extension(type)}`;
    const serverPath = path.join(PUBLIC_PATH, `${imageId}`);
    const stream = fs.createWriteStream(serverPath);

    reader.on('end', () => {
        resolve(imageId);
    });

    reader.pipe(stream);
});

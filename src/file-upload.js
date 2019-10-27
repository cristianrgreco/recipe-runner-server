const fs = require('fs');
const path = require('path');
const uuid = require('uuid/v1');
const mime = require('mime-types');

module.exports = (remotePath, type) => {
    const publicDir = path.join(__dirname, "..", "public");

    return new Promise(resolve => {
        const imageId = `${uuid()}.${mime.extension(type)}`;

        const reader = fs.createReadStream(remotePath);

        const serverPath = path.join(publicDir, `${imageId}`);
        const stream = fs.createWriteStream(serverPath);
        reader.on('end', () => {
            resolve(imageId);
        });

        reader.pipe(stream);
    });
};

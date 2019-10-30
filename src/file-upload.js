const fs = require('fs');
const uuid = require('uuid/v1');
const mime = require('mime-types');
const {S3} = require('aws-sdk');

const local = () => (remotePath, type) => new Promise(resolve => {
    const imageId = `${uuid()}.${mime.extension(type)}`;
    const fileStream = fs.createReadStream(remotePath);

    const stream = fs.createWriteStream(imageId);

    fileStream.on('end', () => {
        resolve(imageId);
    });

    fileStream.pipe(stream);
});

const remote = () => {
    const s3 = new S3();

    return (remotePath, type) => {
        const imageId = `${uuid()}.${mime.extension(type)}`;
        const fileStream = fs.createReadStream(remotePath);

        const uploadParams = {
            Bucket: 'recipe-runner',
            Key: `uploads/images/${imageId}`,
            Body: fileStream
        };

        return new Promise((resolve, reject) => {
            s3.upload(uploadParams, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data.Location);
                }
            });
        });
    };
};

module.exports = {local, remote};

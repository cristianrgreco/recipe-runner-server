const path = require('path');

const dirname = 'public';
const relativePath = path.join(__dirname, "..", dirname);

module.exports = {
    PUBLIC_PATH: relativePath,
    PUBLIC_DIRNAME: dirname
};

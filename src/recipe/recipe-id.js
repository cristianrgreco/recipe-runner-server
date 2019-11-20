module.exports = recipeName => {
    return recipeName
        .toLowerCase()
        .replace(/[^A-Za-z0-9\s]/g, '')
        .replace(/\s/g, '-');
};

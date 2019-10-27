class RecipeRepository {

    constructor(collection) {
        this.collection = collection;
    }

    findAll() {
        return new Promise((resolve, reject) => {
            this.collection.find({}).toArray((err, docs) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(docs);
                }
            });
        })
    }
}

module.exports = RecipeRepository;

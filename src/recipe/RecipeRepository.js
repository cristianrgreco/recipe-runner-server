const {ObjectID} = require('mongodb');

class RecipeRepository {
    constructor(collection) {
        this.collection = collection;
    }

    findAll() {
        return this.collection.find({}).toArray();
    }

    findById(id) {
        return this.collection.findOne({_id: new ObjectID(id)});
    }

    save(recipe) {
        return this.collection.insertOne(recipe);
    }
}

module.exports = RecipeRepository;

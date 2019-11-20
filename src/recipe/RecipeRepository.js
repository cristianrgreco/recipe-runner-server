class RecipeRepository {
    constructor(collection) {
        this.collection = collection;
    }

    findAll() {
        return this.collection.find({}, {projection: {_id: 0}}).toArray();
    }

    findById(id) {
        return this.collection.findOne({id}, {projection: {_id: 0}});
    }

    save(recipe) {
        return this.collection.insertOne({...recipe});
    }
}

module.exports = RecipeRepository;

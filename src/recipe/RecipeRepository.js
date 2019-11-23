class RecipeRepository {
    constructor(collection) {
        this.collection = collection;
    }

    findAll() {
        return this.collection.find({}, {projection: {_id: 0}}).toArray();
    }

    find(id) {
        return this.collection.findOne({id}, {projection: {_id: 0}});
    }

    save(recipe) {
        return this.collection.insertOne({...recipe});
    }

    update(id, recipe) {
        return this.collection.replaceOne({id}, {...recipe});
    }

    delete(id) {
        return this.collection.deleteOne({id});
    }
}

module.exports = RecipeRepository;

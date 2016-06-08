import { Mongo } from 'meteor/mongo';

Pays = new Mongo.Collection("pays");

Pays.allow({
    update(userId) {
        return (userId != null);
    }
});
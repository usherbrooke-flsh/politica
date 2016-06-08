import { Mongo } from 'meteor/mongo';

OptionsJeu = new Mongo.Collection("options_jeu");
Tour = new Mongo.Collection("tour");

OptionsJeu.allow({
    update(userId) {
        return (userId != null);
    }
});
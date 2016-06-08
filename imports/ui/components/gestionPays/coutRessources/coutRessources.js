import angular from 'angular';
import angularMeteor from 'angular-meteor';
import uiRouter from 'angular-ui-router';
import { Meteor } from 'meteor/meteor';

import template from './coutRessources.html';

class CoutRessources {
    constructor($scope, $reactive, $state, GestionPaysService, ConnexionService ) {
        'ngInject';

        this.$state = $state;
        this.GestionPaysService = GestionPaysService;
        this.ConnexionService  = ConnexionService ;
        
        $reactive(this).attach($scope);

        this.opt = {
            crn: GestionPaysService.obtenir_option('coût_ressource_N'),
            cre: GestionPaysService.obtenir_option('coût_ressource_É'),
            crm: GestionPaysService.obtenir_option('coût_ressource_M')
        };

        this.helpers({
            optionsjeu() {
                return OptionsJeu.find({});
            },
            pays() {
                return Pays.find({}, {sort: {id: 1}});
            },
            tour() {
                return Tour.find({});
            },
            utilisateurs() {
                return Meteor.users.find({});
            },
            utilisateurs_connectables() {
                return Utilisateurs.find({});
            }
        });
    }

    logout() {
        this.ConnexionService.logout();
    }
}

const name = 'coutRessources';

// create a module
export default angular.module(name, [
    angularMeteor,
    uiRouter
])
    .component(name, {
        template,
        controllerAs: name,
        controller: CoutRessources
    });
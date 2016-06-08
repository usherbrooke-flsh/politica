import angular from 'angular';
import angularMeteor from 'angular-meteor';
import uiRouter from 'angular-ui-router';
import { Meteor } from 'meteor/meteor';

import template from './donneesEconomiques.html';

class DonneesEconomiques {
    constructor($scope, $reactive, $state, $rootScope, GestionPaysService, ConnexionService) {
        'ngInject';

        this.$state = $state;
        this.GestionPaysService = GestionPaysService;
        this.ConnexionService = ConnexionService;

        $reactive(this).attach($scope);

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

const name = 'donneesEconomiques';

// create a module
export default angular.module(name, [
    angularMeteor,
    uiRouter
])
    .component(name, {
        bindings: {
            paysUtilisateur: '='
        },
        template,
        controllerAs: name,
        controller: DonneesEconomiques
    });
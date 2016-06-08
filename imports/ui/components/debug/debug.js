import angular from 'angular';
import angularMeteor from 'angular-meteor';
import uiRouter from 'angular-ui-router';
import { Meteor } from 'meteor/meteor';

import template from './debug.html';

class DebugCtrl {
    constructor($scope, $reactive, $state, ConnexionService, $rootScope) {
        'ngInject';

        this.$scope = $scope;
        this.$state = $state;
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

const name = 'debug';

// create a module
export default angular.module(name, [
    angularMeteor,
    uiRouter
])
    .component(name, {
        template,
        controllerAs: name,
        controller: DebugCtrl
    });
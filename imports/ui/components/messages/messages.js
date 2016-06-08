import angular from 'angular';
import angularMeteor from 'angular-meteor';

import template from './messages.html';

class Messages {
    constructor($scope, $reactive, $state, ConnexionService, $rootScope) {
        'ngInject';

        this.$scope = $scope;
        this.$state = $state;
        this.$rootScope = $rootScope;
        this.ConnexionService = ConnexionService;

        $reactive(this).attach($scope);
        this.$rootScope.messages = [];
    }
}

const name = 'messages';

// create a module
export default angular.module(name, [
    angularMeteor
]).component(name, {
    template,
    controllerAs: name,
    controller: Messages
});
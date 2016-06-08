import angular from 'angular';
import angularMeteor from 'angular-meteor';
import uiRouter from 'angular-ui-router';
import { Meteor } from 'meteor/meteor';

import template from './politica.html';
import { name as GestionPays } from '../gestionPays/gestionPays';
import { name as Connexion } from '../connexion/connexion';

class Politica {
    constructor($scope, $reactive, $rootScope, ConnexionService) {
        'ngInject';

        this.$scope = $scope;
        this.ConnexionService = ConnexionService;

        $reactive(this).attach($scope);
    }
}

const name = 'politica';

// create a module
export default angular.module(name, [
    angularMeteor,
    uiRouter,
    GestionPays,
    Connexion
]).component(name, {
    template,
    controllerAs: name,
    controller: Politica
})
    /**
     * Inline if filter
     */
    .filter('iif', function () {
        return function(input, trueValue, falseValue) {
            return input ? trueValue : falseValue;
        };
    })

    .filter('sanitize', function ($sce) {
        'ngInject';

        return function(htmlCode){
            return $sce.trustAsHtml(htmlCode);
        };
    })

    /**
     * Fix height directive
    */
    // .directive('fixHeight',function($rootScope,$timeout){
    //     'ngInject';
    //
    //     return {
    //         link: function(scope,element,attrs){
    //             $rootScope.fixHeight(element);
    //         }
    //     }
    // })

    /**
     * Content editable directive
     */
    .directive("contenteditable", function() {
        return {
            restrict: "A",
            require: "ngModel",
            link: function(scope, element, attrs, ngModel) {
                if(!element.attr('contenteditable') && ((attrs['contenteditable'] === true) || (attrs['contenteditable'] === 'true'))) {
                    element.attr('contenteditable', true);
                }

                function read() {
                    var val = element.html().replace(/^[\s\n\r]+|[\s\n\r]+$/g, '');
                    if(!isNaN(val)) {
                        val = Number(val);
                    }
                    ngModel.$setViewValue(val);
                }

                ngModel.$render = function() {
                    element.html(ngModel.$viewValue || "");
                };

                //element.bind("blur keyup change", function() {
                element.bind("blur change", function() {
                    //scope.$digest(read);
                    scope.$apply(read);
                }).bind("keypress", function(e){
                    if (e.which != 8 && e.which != 9 && e.which != 0 && e.which != 46 && (e.which < 48 || e.which > 57)) {
                        if(e.which == 13) {
                            element.change().blur();
                        }
                        e.preventDefault();
                        return false;
                    }
                });
            }
        };
    })

    .config(config)
    .run(run);

function config($locationProvider, $urlRouterProvider) {
    'ngInject';

    $locationProvider.html5Mode(true);
    $urlRouterProvider.otherwise('/pays');
}

function run($rootScope, $state) {
    'ngInject';

    $rootScope.isDev = Meteor.settings.public.application.isDev || false;
    $rootScope.isDebug = Meteor.settings.public.application.isDebug || false;

    $rootScope.$on('$stateChangeError',
        (event, toState, toParams, fromState, fromParams, error) => {
            if (error === 'AUTH_REQUIRED') {
                $state.go('connexion');
            }
        }
    );
}
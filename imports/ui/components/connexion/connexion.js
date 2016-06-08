import angular from 'angular';
import angularMeteor from 'angular-meteor';
import uiRouter from 'angular-ui-router';

import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';

import template from './connexion.html';
import { name as Messages } from '../messages/messages';

class Connexion {
    constructor($scope, $reactive, $state, ConnexionService, GestionPaysService, $rootScope) {
        'ngInject';

        this.$state = $state;
        this.$rootScope = $rootScope;
        this.ConnexionService = ConnexionService;
        this.GestionPaysService = GestionPaysService;

        $reactive(this).attach($scope);

        this.connectButtonText = 'Entrer dans l\'application';
        this.isLogin = false;
    }

    login() {
        var scope = this;

        scope.isLogin = true;
        scope.connectButtonText = "Veuillez patienter";
        Meteor.loginWithCas(function () {
            //vérifier que l'utilisateur a accès au site.
            console.log('login');
            var username = !!Meteor.user() ? ((typeof Meteor.user().username != 'undefined') ? Meteor.user().username : Meteor.user().profile.name) : '',
                acceptedUser = !!Meteor.user() ? Utilisateurs.findOne({username: username}) : false;
            if (acceptedUser) {
                scope.GestionPaysService.majPays(acceptedUser, acceptedUser.pays);

                // angular.forEach(angular.element('.data.fixe td.pays'), function (value) {
                //     $rootScope.fixHeight(angular.element(value));
                // });
                scope.$state.go('pays');
            } else {
                var msg = "Une erreur s'est produite lors de la connexion, veuillez réessayer. <br/>Si le problème persiste, veuillez communiquer avec Khalid Adnane. (<a href='mailto:Khalid.Adnane@usherbrooke.ca'>Khalid.Adnane@usherbrooke.ca</a>).";
                if(!!Meteor.user()) {
                    msg = "L'utilisateur " + username + " n'est pas autorisé à accéder à ce site. Veuillez communiquer avec Khalid Adnane pour toute information. (<a href='mailto:Khalid.Adnane@usherbrooke.ca'>Khalid.Adnane@usherbrooke.ca</a>)"
                }
                scope.$rootScope.messages.push({
                    type: 'erreur',
                    message: msg
                });
                scope.ConnexionService.logout();
            }
            scope.isLogin = false;
            scope.connectButtonText = "Entrer dans l'application";
        });
    }
}

const name = 'connexion';

// create a module
export default angular.module(name, [
    angularMeteor,
    uiRouter,
    Messages
])
    /**
     * Service contenant toutes les fonctions relatives aux droits d'utilisateurs
     */
    .factory('ConnexionService', function($state) {
        'ngInject';

        console.log('ConnexionService');
        var peutEditer = [];
        return {
            isLoggedIn: function() {
                return !!Meteor.userId();
            },

            logout: function() {
                Meteor.logout();
                Accounts.logout();
                $state.go('connexion');
            },

            currentUser: function() {
                if(!Meteor.user()) {
                    this.logout();
                    return {username: null, profile: {name:null,isAdmin:null,pays:null,paysCourant:{pays:null}}};
                }
                return Meteor.user();
            },

            /**
             * Permet de savoir si un utilisateur peut éditer une donnée
             *
             * @param {string} quoi
             * @param {string} element
             * @returns {*}
             */
            utilisateurPeutEditer: function(quoi, element) {
                if(!Meteor.user()) {
                    return false;
                }

                var valeurQuoi = null;
                var permissions = (Meteor.user().profile.isAdmin ? Meteor.settings.public.application.permissions.administrateur : Meteor.settings.public.application.permissions.utilisateur) || false;
                if(permissions === false) {
                    return false;
                }

                //Définir les permissions pour ce qu'on veut vérifier
                if(typeof quoi=="string") {
                    permissions = permissions[quoi];
                } else if(typeof quoi=="object") {
                    for(var i in quoi) {
                        permissions = permissions[i];
                        valeurQuoi = quoi[i];
                        quoi = i;

                        break; //Toujours seulement 1 élément à vérifier
                    }
                }

                if(typeof permissions == 'undefined') {
                    return false;
                }

                if(typeof element=='string') {
                    element = element.split('.');
                }
                //Seulement 2 valeurs possibles pour quoi : Pays ou OptionJeu
                if(typeof valeurQuoi != 'undefined' && valeurQuoi !== null) {
                    if(quoi == 'Pays') {
                        //Vérifier que l'utilisateur ait accès à un pays
                        if((valeurQuoi !== '*') && !this.paysPermis(valeurQuoi)) {
                            return false;
                        }
                    } else {
                        return false;
                    }
                }

                //Si on est rendu ici, c'est parce qu'on a accès à quelque chose
                //On veur vérifier dans les permissions si on a accès à l'élément spécifié
                for(var i=0;i<element.length;i++) {
                    if(element[i] != '') {
                        permissions = permissions[element[i]];
                    }
                }

                if(typeof permissions=='boolean') {
                    return permissions;
                } else if(typeof permissions=='object') {
                    //Si il y en a un dans l'objet qui est vrai, on retourne qu'on peut éditer l'objet
                    for(i in permissions) {
                        if(permissions[i] !== false) {
                            return true;
                        }
                    }
                }

                //On a accès à rien!
                return false;
            },

            /**
             * Est-ce que l'utilisateur actuel peut voir/modifier ce pays
             *
             * @param {string} nomPays
             * @returns {boolean}
             */
            paysPermis: function(nomPays) {
                return this.isLoggedIn() ? (Meteor.user().profile.isAdmin || (Meteor.user().profile.pays.indexOf(nomPays) != -1)) : false;
            }
        }
    })
    .component(name, {
        template,
        controllerAs: name,
        controller: Connexion
    })
    .config(config);

function config($stateProvider) {
    'ngInject';
    $stateProvider
        .state('connexion', {
            url: '/connexion',
            template: '<connexion></connexion>'
        });
}
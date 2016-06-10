import angular from 'angular';
import angularMeteor from 'angular-meteor';
import uiRouter from 'angular-ui-router';
import { Meteor } from 'meteor/meteor';

import { name as DonnesEconomiques } from './donnesEconomiques/donneesEconomiques';
import { name as CoutRessources } from './coutRessources/coutRessources';
import { name as RessourcesCommerce } from './ressourcesCommerce/ressourcesCommerce';
import { name as ProductionsMilitaires } from './productionsMilitaires/productionsMilitaires';
import { name as CoutsEntretien } from './coutsEntretien/coutsEntretien';
import { name as IndicateursSociaux } from './indicateursSociaux/indicateursSociaux';

import { name as DebugComponent } from '../debug/debug';

import template from './gestionPays.html';
import paysTmpl from './pays.html';

class GestionPays {
    constructor($scope, $reactive, $state, $rootScope, $timeout, ConnexionService, GestionPaysService) {
        'ngInject';

        this.$state = $state;
        this.ConnexionService = ConnexionService;
        this.GestionPaysService = GestionPaysService;

        $reactive(this).attach($scope);

        Meteor.subscribe('pays');
        Meteor.subscribe('optionsjeu');

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

        //Pour éviter que $digest détecte un changement et un autre $direst dans la boucle.
        this.paysUtilisateur = ConnexionService.currentUser().profile.paysCourant.pays;
        this.nomPays = ConnexionService.currentUser().profile.paysCourant.nom;

        this.rafraichir = (clickEvent) => {
            var scope = this;
            angular.element(clickEvent.currentTarget).removeClass('updated').addClass('updating');
            $timeout(function() {
                $scope.$apply(function() {
                    scope.GestionPaysService.majPays(ConnexionService.currentUser().profile, ConnexionService.currentUser().profile.paysCourant.nom);

                    scope.paysUtilisateur = ConnexionService.currentUser().profile.paysCourant.pays;

                    angular.element(clickEvent.currentTarget).removeClass('updating').addClass('updated');
                });

                $timeout(function(){
                    angular.element(clickEvent.currentTarget).removeClass('updated');
                }, 2000);
            }, 10);
        }

        /**
         * Corriger la hauteur des entêtes des rangées
         *
         * @param element
         */
        // $rootScope.fixHeight = function(element) {
        //     if(typeof element != 'undefined') {
        //         if (ConnexionService.isLoggedIn()) {
        //             $timeout(function () {
        //                 $scope.$apply(function () {
        //                     element.ready(function () {
        //                         var height = element.parent().height();
        //                         if (height == 0) {
        //                             $rootScope.fixHeight(element);
        //                         } else {
        //                             element.css({'height': height + 'px'});
        //                         }
        //                     });
        //                 });
        //             }, 0);
        //         }
        //     }
        // };
    }

    logout() {
        this.ConnexionService.logout();
    }
}

const name = 'gestionPays';

// create a module
export default angular.module(name, [
    angularMeteor,
    uiRouter,
    DonnesEconomiques,
    CoutRessources,
    RessourcesCommerce,
    ProductionsMilitaires,
    CoutsEntretien,
    IndicateursSociaux,
    DebugComponent
])
    /**
     * Service contenant tous les calculs pour la page de gestion
     */
    .factory('GestionPaysService', function($timeout) {
        'ngInject';
        console.log('GestionPaysService');
        return {
            /**
             * Formatter le nom du pays pour l'affichage dans le tableau
             *
             * @param {string} nom
             * @returns {string}
             */
            afficher_nom: function(nom) {
                var tmp = nom;
                if(nom.length > 15) {
                    tmp = '';
                    var mots = nom.split(" ");
                    for(var i in mots) {
                        if(mots[i].length > 2) {
                            tmp += mots[i].charAt(0).toUpperCase();
                        }
                    }
                }
                return tmp;
            },

            sauvegarder: function(data, quoi, clickEvent) {
                angular.element(clickEvent.currentTarget).removeClass('updated').addClass('updating');
                $timeout(function() {
                    var upd;
                    data = Utils.unaccent_revert(data);
                    for(var i in data) {
                        upd = {};
                        upd[quoi] = data[i][quoi];
                        Pays.update(data[i]._id, {$set: upd}, (error) => {
                            if (error) {
                                console.log('Impossible de mettre à jour le pays...');
                            }
                        });
                    }
                    angular.element(clickEvent.currentTarget).removeClass('updating').addClass('updated')
                    $timeout(function(){
                        angular.element(clickEvent.currentTarget).removeClass('updated');
                    }, 2000);
                }, 10);
            },

            sauvegarderOptions: function(options, clickEvent) {
                angular.element(clickEvent.currentTarget).removeClass('updated').addClass('updating');

                $timeout(function(){
                    for(var i in options) {
                        OptionsJeu.update(options[i]._id, {$set: {valeur: options[i].valeur}}, (error) => {
                            if (error) {
                                console.log('Impossible de mettre à jour les options...');
                            }
                        });
                    }
                    angular.element(clickEvent.currentTarget).removeClass('updating').addClass('updated')
                    $timeout(function(){
                        angular.element(clickEvent.currentTarget).removeClass('updated');
                    }, 2000);
                }, 10);
            },

            majPays: function(user, pays) {
                var paysCourant = {nom: '', pays: []},
                    p;
                if (user.isAdmin) {
                    console.log('isAdmin');
                    var listePays = [];
                    this.obtenirPays().forEach(function (a) {
                        listePays.push(a.nom);
                    });
                    Meteor.users.update({_id: Meteor.userId()}, {
                        $set: {
                            "profile.isAdmin": user.isAdmin,
                            "profile.pays": listePays
                        }
                    });
                    paysCourant.nom = 'Administrateur';
                    p = this.obtenirPays();
                } else {
                    console.log('utilisateur');
                    Meteor.users.update({_id: Meteor.userId()}, {
                        $set: {
                            "profile.isAdmin": false,
                            "profile.pays": [pays]
                        }
                    });
                    paysCourant.nom = pays;
                    console.log(paysCourant.nom);
                    p = this.obtenirPays(pays);
                }

                //PBPB : Pourquoi ?
                p.forEach(function (a) {
                    paysCourant.pays.push({
                        value: Utils.unaccent(a),
                        key: a.nom
                    });
                });
                console.log(paysCourant);
                Meteor.users.update({_id: Meteor.userId()}, {$set: {"profile.paysCourant": paysCourant}});
            },

            obtenirPays: function(nom) {
                console.debug('Recherche pays : '+nom);
                var what = {};
                if(typeof nom != 'undefined') {
                    what.nom = nom;
                }
                console.log(what);
                return Pays.find(what, {sort: {id: 1}});
            },

            /**
             * Calcul du PIB courant du pays
             *
             * @param {object} item
             * @returns {number}
             */
            calcul_pib_courant: function(item) {
                return item.value.donnees_economiques.value.pib_base.value
                    + (0.3 * item.value.donnees_economiques.value.inv_education.value)
                    + (0.3 * item.value.donnees_economiques.value.inv_sante.value)
                    + (0.3 * item.value.donnees_economiques.value.inv_infrastructure.value)
                    + (0.3 * item.value.donnees_economiques.value.subvention_industrie.value);
            },

            /**
             * Obtenir une option du jeu
             *
             * @param {string} nom_option
             * @returns {*}
             */
            obtenir_option: function(nom_option) {
                var opt_tmp = OptionsJeu.findOne({'nom': nom_option});
                if(typeof opt_tmp == 'undefined' || opt_tmp === null) {
                    return {valeur: 0};
                } else {
                    return opt_tmp;
                }
            },

            /**
             * Calcul du coût d'entretien
             *
             * @param {object} item
             * @param {string} quoi
             * @returns {number}
             */
            calcul_cout_entretien: function(item, quoi) {
                var total = 0,
                    nom_tmp = 'coût_ressource_{1}_{2}',
                    nom_option = '',
                    opt_tmp = null;

                for(var i in item.value.productions_militaires.value) {
                    nom_option = nom_tmp.replace('{1}', quoi.toUpperCase()).replace('{2}', item.value.productions_militaires.value[i].key.toLowerCase()).replace(' ', '_');
                    opt_tmp = this.obtenir_option(nom_option);
                    total += item.value.productions_militaires.value[i].value * opt_tmp.valeur;
                }

                return total;
            },

            /**
             * Obtenir une valeur dans un objet
             *
             * @param {object} item
             * @param {string} quoi
             * @returns {*}
             */
            obtenir: function(item, quoi) {
                return '';
                var path = quoi.split('.'),
                    valeur = item.value;
                for(var i=0; i<path.length; i++){
                    valeur = valeur[path[i]].value
                }
                return valeur;
            },

            /**
             * Calculer le coût d'entretien G$
             *
             * @param {object} item
             * @returns {*|number}
             */
            calcul_cout_entretien_G: function(item) {
                return this.calcul_cout_entretien(item, 'G$');
            },

            /**
             * Calculer le coût d'entretien Nourriture
             *
             * @param {object} item
             * @returns {*|number}
             */
            calcul_cout_entretien_N: function(item) {
                return this.calcul_cout_entretien(item, 'N');
            },

            /**
             * Calculer le coût d'entretien Énergie
             *
             * @param {object} item
             * @returns {*|number}
             */
            calcul_cout_entretien_E: function(item) {
                return this.calcul_cout_entretien(item, 'É');
            },

            /**
             * Calculer le coût d'entretien Matériau
             *
             * @param {object} item
             * @returns {*|number}
             */
            calcul_cout_entretien_M: function(item) {
                return this.calcul_cout_entretien(item, 'M');
            },

            /**
             * Calculer le coût d'entretien Total
             *
             * @param {object} item
             * @returns {*|number}
             */
            calcul_cout_entretien_total: function(item) {
                return this.calcul_cout_entretien_G(item)
                    + this.calcul_cout_entretien_N(item)
                    + this.calcul_cout_entretien_E(item)
                    + this.calcul_cout_entretien_M(item);
            },

            /**
             * Calculer le service de la dette
             *
             * @param {object} item
             * @returns {number}
             */
            calcul_service_dette: function(item) {
                return item.value.donnees_economiques.value.dette_publique.value * item.value.donnees_economiques.value.taux_interets.value;
            },

            /**
             * Calculer les dépenses publiques
             *
             * @param {object} item
             * @returns {*|number}
             */
            calcul_depenses_publiques: function(item) {
                return (item.value.donnees_economiques.value.inv_education.value
                + item.value.donnees_economiques.value.inv_sante.value
                + item.value.donnees_economiques.value.inv_infrastructure.value
                + item.value.donnees_economiques.value.subvention_industrie.value
                + this.calcul_service_dette(item)
                + this.calcul_cout_entretien_G(item));
            },

            /**
             * Calculer le total des exportations
             *
             * @param {object} item
             * @returns {number}
             */
            calcul_exportations: function(item) {
                var cout_N = this.obtenir_option('coût_ressource_N').valeur || 0,
                    cout_É = this.obtenir_option('coût_ressource_É').valeur || 0,
                    cout_M = this.obtenir_option('coût_ressource_M').valeur || 0;
                return (item.value.ressources.value.nourriture.value.exportation.value * cout_N)
                    + (item.value.ressources.value.energie.value.exportation.value * cout_É)
                    + (item.value.ressources.value.materiau.value.exportation.value * cout_M);
            },

            /**
             * Calculer le total des importations
             *
             * @param {object} item
             * @returns {number}
             */
            calcul_importations: function(item) {
                var cout_N = this.obtenir_option('coût_ressource_N').valeur || 0,
                    cout_É = this.obtenir_option('coût_ressource_É').valeur || 0,
                    cout_M = this.obtenir_option('coût_ressource_M').valeur || 0;
                return (item.value.ressources.value.nourriture.value.importation.value * cout_N)
                    + (item.value.ressources.value.energie.value.importation.value * cout_É)
                    + (item.value.ressources.value.materiau.value.importation.value * cout_M);
            },

            /**
             * Calculer le solde commercial
             *
             * @param {object} item
             * @returns {number}
             */
            calcul_solde_commercial: function(item) {
                return this.calcul_exportations(item) - this.calcul_importations(item);
            },

            /**
             * Calculer le PIB global
             *
             * @param {object} item
             * @returns {number}
             */
            calcul_pib_global: function(item) {
                return this.calcul_pib_courant(item) + this.calcul_depenses_publiques(item) + this.calcul_solde_commercial(item);
            },

            /**
             * Calculer le revenu de l'état
             *
             * @param {object} item
             * @returns {number}
             */
            calcul_revenu_etat: function(item) {
                return this.calcul_pib_global(item) * item.value.donnees_economiques.value.taux_imposition.value;
            },

            /**
             * Calculer la dette publique
             *
             * @param {object} item
             * @returns {number}
             */
            calcul_dette_publique: function(item) {
                return ((item.value.donnees_economiques.value.dette_publique.value / this.calcul_pib_global(item)) || 0) * 100;
            }
        }
    })
    .component(name, {
        template,
        controllerAs: name,
        controller: GestionPays
    })
    .controller('paysTmplController', function ($scope, $reactive, ConnexionService) {
        'ngInject';

        this.ConnexionService = ConnexionService;

        $reactive(this).attach($scope);
    })

    .config(config);

function config($stateProvider) {
    'ngInject';

    $stateProvider.state('pays', {
        url: '/pays',
        template: paysTmpl,
        controllerAs: 'paysTmpl',
        controller: 'paysTmplController',
        resolve: {
            currentUser($q) {
                if (Meteor.userId() === null) {
                    return $q.reject('AUTH_REQUIRED');
                } else {
                    return $q.resolve();
                }
            }
        }
    });
}
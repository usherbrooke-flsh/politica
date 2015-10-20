//Structure de données
OptionsJeu = new Mongo.Collection("options_jeu");
Pays = new Mongo.Collection("pays");
Tour = new Mongo.Collection("tour");
Utilisateurs = new Mongo.Collection("utilisateurs");

if (Meteor.isClient) {
  angular.module('politica',['angular-meteor']);

  function onReady() {
    angular.bootstrap(document, ['politica']);
  }

  if (Meteor.isCordova) {
    angular.element(document).on("deviceready", onReady);
  }
  else {
    angular.element(document).ready(onReady);
  }

  /*******************************************************************/
  /* Point entrée angular                                            */
  /*******************************************************************/
  angular.module('politica').run(['$rootScope', function($rootScope){
    $rootScope.isDev = Meteor.settings.public.application.isDev || false;
    $rootScope.isDebug = Meteor.settings.public.application.isDebug || false;
  }]);

  //angular.module('politica').directive("contenteditable", function() {
  //  return {
  //    restrict: "A",
  //    require: "ngModel",
  //    link: function(scope, element, attrs, ngModel) {
  //
  //      function read() {
  //        ngModel.$setViewValue(element.html());
  //      }
  //
  //      ngModel.$render = function() {
  //        element.html(ngModel.$viewValue || "");
  //      };
  //
  //      element.bind("blur keyup change", function() {
  //        scope.$apply(read);
  //      });
  //    }
  //  };
  //});

  /*******************************************************************/
  /* Contrôleur de la gestion                                        */
  /*******************************************************************/
  angular.module('politica').controller('GestionPaysCtrl', ['$scope', '$meteor', '$rootScope',
    function ($scope, $meteor, $rootScope) {
      $scope.$meteorSubscribe("options_jeu");
      $scope.$meteorSubscribe("pays");
      $scope.$meteorSubscribe("tour");

      $scope.messages = [];
      $scope.paysCourant = {};

      $scope.optionsjeu = $meteor.collection(function(){
        return OptionsJeu.find({});
      });
      $scope.pays = $meteor.collection(function(){
        return Pays.find({}, {sort: {id: 1}});
      });
      $scope.tour = $meteor.collection(function(){
        return Tour.find({});
      });
      $scope.utilisateurs = $meteor.collection(function(){
        return Meteor.users.find({});
      });
      $scope.utilisateurs_connectables = $meteor.collection(function(){
        return Utilisateurs.find({});
      });

      $scope.modifPays = {};

      $scope.utilisateurPeutEditer = function(quoi, element) {
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
            if((valeurQuoi !== '*') && !$scope.paysPermis(valeurQuoi)) {
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

      };

      $scope.paysPermis = function(nomPays) {
        return Meteor.user() ? (Meteor.user().profile.isAdmin || (Meteor.user().profile.pays.indexOf(nomPays) != -1)) : false;
      };

      $scope.login = function() {
        if($rootScope.currentUser) {
          Meteor.logout();
        } else {
          Meteor.loginWithCas(function() {
            //vérifier que l'utilisateur a accès au site.
            var acceptedUser = Utilisateurs.findOne({username: Meteor.user().username});
            if(acceptedUser) {
              //ajouter tous les pays pour l'admin
              var o = [], p;
              if(acceptedUser.isAdmin) {
                var pays = [];
                $scope.pays.forEach(function(a){
                  pays.push(a.nom);
                });
                Meteor.users.update({_id: Meteor.userId()}, {$set: {"profile.isAdmin": acceptedUser.isAdmin, "profile.pays": pays}})
                $scope.paysCourant = {nom: 'Administrateur', pays: []};
                p = $scope.pays;
              } else {
                Meteor.users.update({_id: Meteor.userId()}, {$set: {"profile.isAdmin": false, "profile.pays": [acceptedUser.pays]}})
                $scope.paysCourant = {nom: acceptedUser.pays, pays: []};
                p = $meteor.collection(function(){
                  return Pays.find({nom: acceptedUser.pays});
                });
              }

              //TODO: revoir comment mettre les pays en variable
              p.forEach(function(a){
                //Faire la copie pour le mettre en variable
                //o[a.nom] = a;

                //o[Utils.unaccent(a.nom)] = {
                //    value: Utils.unaccent(a),
                //    key: a.nom
                //};
                $scope.paysCourant.pays.push({
                  value: Utils.unaccent(a),
                  key: a.nom
                });
              });
              console.log($scope.paysCourant.pays);
            } else {
              $scope.messages.push({type: 'erreur', message: "L'utilisateur "+Meteor.user().username+" n'est pas autorisé à accéder à ce site. Veuillez communiquer avec Khalid Adnane pour toute information. (Khalid.Adnane@usherbrooke.ca)"});
              Meteor.logout();
            }
          });
        }
      };
   //};

      $scope.afficher_nom = function(nom) {
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
      };

      $scope.calcul_pib_courant = function(item) {
        return item.donnees_economiques.pib_base
            + (0.3 * item.donnees_economiques.inv_education)
            + (0.3 * item.donnees_economiques.inv_sante)
            + (0.3 * item.donnees_economiques.inv_infrastructure)
            + (0.3 * item.donnees_economiques.subvention_industrie);
      };

      $scope.obtenir_option = function(nom_option){
        var opt_tmp = OptionsJeu.findOne({'nom': nom_option});
        if(typeof opt_tmp == 'undefined' || opt_tmp === null) {
          //console.log(opt_tmp);
          //console.error(nom_option+' n\'existe pas');
          return {};
        } else {
          return opt_tmp;
        }
      };

      var calcul_cout_entretien = function(item, quoi) {
        var total = 0,
            nom_tmp = 'coût_ressource_{1}_{2}',
            nom_option = '',
            opt_tmp = null;

        for(var i in item.productions_militaires) {
          nom_option = nom_tmp.replace('{1}', quoi.toUpperCase()).replace('{2}', i.toLowerCase()).replace(' ', '_');
          opt_tmp = $scope.obtenir_option(nom_option);
          total += item.productions_militaires[i] * opt_tmp.valeur;
        }

        return total;
      };

      $scope.obtenir = function(item, quoi) {
        var path = quoi.split('.'),
            valeur = item;
        for(var i=0; i<path.length; i++){
          valeur = valeur[path[i]]
        }
        return valeur;
      }

      $scope.calcul_cout_entretien_G = function(item){
        return calcul_cout_entretien(item, 'G$');
      };

      $scope.calcul_cout_entretien_N = function(item){
        return calcul_cout_entretien(item, 'N');
      };

      $scope.calcul_cout_entretien_E = function(item){
        return calcul_cout_entretien(item, 'É');
      };

      $scope.calcul_cout_entretien_M = function(item){
        return calcul_cout_entretien(item, 'M');
      };

      $scope.calcul_cout_entretien_total = function(item){
        return $scope.calcul_cout_entretien_G(item)
            + $scope.calcul_cout_entretien_N(item)
            + $scope.calcul_cout_entretien_E(item)
            + $scope.calcul_cout_entretien_M(item);
      };

      $scope.calcul_service_dette = function(item){
        return item.donnees_economiques.dette_publique * item.donnees_economiques.taux_interets;
      };

      $scope.calcul_depenses_publiques = function(item){
        return (item.donnees_economiques.inv_education
          + item.donnees_economiques.inv_sante
          + item.donnees_economiques.inv_infrastructure
          + item.donnees_economiques.subvention_industrie
          + $scope.calcul_service_dette(item)
          + $scope.calcul_cout_entretien_G(item));
      };

      $scope.calcul_exportations = function(item){
        var cout_N = $scope.obtenir_option('coût_ressource_N').valeur || 0,
            cout_É = $scope.obtenir_option('coût_ressource_É').valeur || 0,
            cout_M = $scope.obtenir_option('coût_ressource_M').valeur || 0;
        return (item.ressources.nourriture.exportation * cout_N)
              + (item.ressources.énergie.exportation * cout_É)
              + (item.ressources.matériau.exportation * cout_M);
      };

      $scope.calcul_importations = function(item){
        var cout_N = $scope.obtenir_option('coût_ressource_N').valeur || 0,
            cout_É = $scope.obtenir_option('coût_ressource_É').valeur || 0,
            cout_M = $scope.obtenir_option('coût_ressource_M').valeur || 0;
        return (item.ressources.nourriture.importation * cout_N)
            + (item.ressources.énergie.importation * cout_É)
            + (item.ressources.matériau.importation * cout_M);
      };

      $scope.calcul_solde_commercial = function(item){
        return $scope.calcul_exportations(item) - $scope.calcul_importations(item);
      };

      $scope.calcul_pib_global = function(item){
        return $scope.calcul_pib_courant(item) + $scope.calcul_depenses_publiques(item) + $scope.calcul_solde_commercial(item);
      };

      $scope.calcul_revenu_etat = function(item){
        return $scope.calcul_pib_global(item) * item.donnees_economiques.taux_imposition;
      };

      $scope.calcul_dette_publique = function(item){
        return ((item.donnees_economiques.dette_publique / $scope.calcul_pib_global(item)) || 0) * 100;
      };
    }]);
}

Meteor.methods({});


if (Meteor.isServer) {
  Meteor.publish("options_jeu", function () {
    return OptionsJeu.find({});
  });
  Meteor.publish("pays", function () {
    return Pays.find({});
  });
  Meteor.publish("tour", function () {
    return Tour.find({});
  });
}
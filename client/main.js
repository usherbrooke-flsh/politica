// http://www.angular-meteor.com/tutorials/socially/angular1/

import '../imports/scripts/debug';
import '../imports/scripts/utils';

import angular from 'angular';

import { Meteor } from 'meteor/meteor';

import { name as Politica } from '../imports/ui/components/politica/politica';

function onReady() {
    angular.bootstrap(document, [
        Politica
    ], {
        strictDi: true
    });
}

if (Meteor.isCordova) {
    angular.element(document).on('deviceready', onReady);
} else {
    angular.element(document).ready(onReady);
}
//     Copyright (c) Microsoft Corporation.  All rights reserved.

/// <reference path="../references/index.d.ts" />
/// <reference path="./ControllerBase.ts" />

module DXLiquidIntel.App.Controller {

    export class AnalyticsController extends ControllerBase {
        static $inject = ['$scope', '$rootScope', 'adalAuthenticationService', '$location', '$route', 'userService'];

        constructor($scope: Model.IDXLiquidIntelScope,
            $rootScope: Model.IDXLiquidIntelScope,
            adalAuthenticationService,
            $location: ng.ILocationService,
            $route: ng.route.IRouteService,
            userService: Service.UserService) {

            super($scope, $rootScope, adalAuthenticationService, $location, userService, () => {
                this.setTitleForRoute($route.current);
                $scope.buttonBarButtons = [];
                this.populate();
            });
        }

        private async populate(): Promise<void> {
            try {
                this.setUpdateState(true);
                this.$scope.loadingMessage = "Retrieving beer analytics...";
                this.$scope.error = "";
                this.$scope.loadingMessage = "";
            }
            catch (ex) {
                this.setError(true, ex.data || ex.statusText, ex.headers);
            }
        }
    }
} 
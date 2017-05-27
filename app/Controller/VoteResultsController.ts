//     Copyright (c) Microsoft Corporation.  All rights reserved.

/// <reference path="../references/index.d.ts" />
/// <reference path="./ControllerBase.ts" />
/// <reference path="../Service/UntappdApiService.ts" />
/// <reference path="../Service/VoteService.ts" />

module DXLiquidIntel.App.Controller {

    export class VoteResultsController extends ControllerBase {
        static $inject = ['$scope', '$rootScope', 'adalAuthenticationService', '$location', '$route', 'userService', 'untappdService', 'voteService'];

        constructor($scope: Model.IDXLiquidIntelScope,
            $rootScope: Model.IDXLiquidIntelScope,
            adalAuthenticationService,
            $location: ng.ILocationService,
            $route: ng.route.IRouteService,
            userService: Service.UserService,
            protected untappdService: Service.UntappdApiService,
            protected voteService: Service.VoteService) {

            super($scope, $rootScope, adalAuthenticationService, $location, userService, () => {
                this.setTitleForRoute($route.current);
                $scope.buttonBarButtons = [];
                this.populate();
            });
        }

        private async populate(): Promise<void> {
            try {
                this.setUpdateState(true);
                this.$scope.loadingMessage = "Retrieving current vote tallies...";
                this.$scope.error = "";
                let votesTally = await this.voteService.getVoteTally();
                this.$scope.votesTally = votesTally;
                this.$scope.loadingMessage = "";
            }
            catch (ex) {
                this.setError(true, ex.data || ex.statusText, ex.headers);
            }
        }
    }
} 
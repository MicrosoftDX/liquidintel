//     Copyright (c) Microsoft Corporation.  All rights reserved.

/// <reference path="../references/index.d.ts" />
/// <reference path="./ControllerBase.ts" />
/// <reference path="../Service/UserService.ts" />
/// <reference path="../Service/DashboardService.ts" />
/// <reference path="../Service/KegsService.ts" />

module DXLiquidIntel.App.Controller {

    export class HomeController extends ControllerBase {
        static $inject = ['$scope', '$rootScope', 'adalAuthenticationService', '$location', '$route', 'userService', 'dashboardService', 'kegsService', '$interval'];

        constructor($scope: Model.IDXLiquidIntelScope,
            $rootScope: Model.IDXLiquidIntelScope,
            adalAuthenticationService,
            $location: ng.ILocationService,
            $route: ng.route.IRouteService,
            userService: Service.UserService,
            protected dashboardService: Service.DashboardService,
            protected kegsService: Service.KegsService,
            $interval: ng.IIntervalService) {

            super($scope, $rootScope, adalAuthenticationService, $location, userService, () => {

                this.setTitleForRoute($route.current);
                this.populate();
                var intervalPromise = $interval(() => this.populate(), 5000);      
                $scope.$on('$destroy', () => $interval.cancel(intervalPromise));                
            });
        }

        protected async populate(): Promise<void> {
            this.$scope.currentTaps = await this.kegsService.getTapsStatus();
            this.$scope.currentActivities = await this.dashboardService.getLatestActivities(25);
        }
    }
} 
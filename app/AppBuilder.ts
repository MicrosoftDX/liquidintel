//     Copyright (c) Microsoft Corporation.  All rights reserved.

/// <reference path="./references/index.d.ts" />
/// <reference path="./Service/UserService.ts" />
/// <reference path="./Service/VoteService.ts" />
/// <reference path="./Service/DashboardService.ts" />
/// <reference path="./Service/KegsService.ts" />
/// <reference path="./Service/AdminService.ts" />
/// <reference path="./Service/UntappdApiService.ts" />
/// <reference path="./Service/ConfigService.ts" />
/// <reference path="./Controller/UserController.ts" />
/// <reference path="./Controller/VoteBeerController.ts" />
/// <reference path="./Controller/VoteResultsController.ts" />
/// <reference path="./Controller/AnalyticsController.ts" />
/// <reference path="./Controller/HomeController.ts" />
/// <reference path="./Controller/AuthorizedGroupsController.ts" />
/// <reference path="./Controller/InstallKegsController.ts" />

module DXLiquidIntel.App {

    export class AppBuilder {

        private app: ng.IModule;

        constructor(name: string) {
            this.app = angular.module(name, [
                // Angular modules 
                "ngRoute",
                "ngResource",
                "ui.bootstrap",
                "environment",
                // ADAL
                'AdalAngular'
            ]);
            this.app.config(['$routeProvider', '$httpProvider', 'adalAuthenticationServiceProvider', 'envServiceProvider',
                ($routeProvider: ng.route.IRouteProvider, $httpProvider: ng.IHttpProvider, adalProvider, envServiceProvider: angular.environment.ServiceProvider) => {
                    envServiceProvider.config({
                        domains: {
                            development: ['localhost'],
                            ppe: ['dx-liquidapp-staging.azurewebsites.net'],
                            userapp: ['dx-liquidapp-userapp.azurewebsites.net'],
                            production: ['dx-liquidapp.azurewebsites.net']
                        },
                        vars: {
                            development: {
                                apiUri: '//localhost:8080/api',
                                tenant: 'microsoft.com',
                                appClientId: '35a33cfc-fc52-48cf-90f4-23ad69ef85bc',
                                apiClientId: 'b1e80748-43c2-4450-9121-cbc0dcc98051',
                                apiUsername: '0001-0001',
                                apiPassword: 'ZHhsaXF1aWQtcmFzcGJlcnJ5cGk='
                            },
                            ppe: {
                                apiUri: '//dxliquidintel-staging.azurewebsites.net/api',
                                tenant: 'microsoft.com',
                                appClientId: '35a33cfc-fc52-48cf-90f4-23ad69ef85bc',
                                apiClientId: 'b1e80748-43c2-4450-9121-cbc0dcc98051',
                                apiUsername: '0001-0001',
                                apiPassword: 'ZHhsaXF1aWQtcmFzcGJlcnJ5cGk='
                            },
                            userapp: {
                                apiUri: '//dxliquidintel-userapp.azurewebsites.net/api',
                                tenant: 'microsoft.com',
                                appClientId: '35a33cfc-fc52-48cf-90f4-23ad69ef85bc',
                                apiClientId: 'b1e80748-43c2-4450-9121-cbc0dcc98051',
                                apiUsername: '0001-0001',
                                apiPassword: 'ZHhsaXF1aWQtcmFzcGJlcnJ5cGk='
                            },
                            production: {
                                apiUri: '//dxliquidintel.azurewebsites.net/api',
                                tenant: 'microsoft.com',
                                appClientId: '35a33cfc-fc52-48cf-90f4-23ad69ef85bc',
                                apiClientId: 'b1e80748-43c2-4450-9121-cbc0dcc98051',
                                apiUsername: '0001-0001',
                                apiPassword: 'ZHhsaXF1aWQtcmFzcGJlcnJ5cGk='
                            }
                        }
                    });
                    envServiceProvider.check();
                    $routeProvider
                        .when("/Home",
                        {
                            name: "Home",
                            controller: Controller.HomeController,
                            templateUrl: "/views/home.html",
                            caseInsensitiveMatch: true,
                        })
                        .when("/User",
                            <adal.shared.INavRoute>{
                                name: "User",
                                controller: Controller.UserController,
                                templateUrl: "/Views/User.html",
                                requireADLogin: true,
                                caseInsensitiveMatch: true,
                        })
                        .when("/VoteBeer",
                            <adal.shared.INavRoute>{
                                name: "VoteBeer",
                                controller: Controller.VoteBeerController,
                                templateUrl: "/Views/VoteBeer.html",
                                requireADLogin: true,
                                caseInsensitiveMatch: true,
                        })
                        .when("/VoteResults",
                            <adal.shared.INavRoute>{
                                name: "VoteResults",
                                controller: Controller.VoteResultsController,
                                templateUrl: "/Views/VoteResults.html",
                                requireADLogin: true,
                                caseInsensitiveMatch: true,
                        })
                        .when("/Analytics",
                            <adal.shared.INavRoute>{
                                name: "Analytics",
                                controller: Controller.AnalyticsController,
                                templateUrl: "/Views/Analytics.html",
                                requireADLogin: true,
                                caseInsensitiveMatch: true,
                        })
                        .when("/AuthorizedGroups",
                            <adal.shared.INavRoute>{
                                name: "AuthorizedGroups",
                                controller: Controller.AuthorizedGroupsController,
                                templateUrl: "/Views/AuthorizedGroups.html",
                                requireADLogin: true,
                                caseInsensitiveMatch: true,
                        })
                        .when("/InstallKegs",
                            <adal.shared.INavRoute>{
                                name: "InstallKegs",
                                controller: Controller.InstallKegsController,
                                templateUrl: "/Views/InstallKegs.html",
                                requireADLogin: true,
                                caseInsensitiveMatch: true,
                        })
                        .otherwise(
                        {
                            redirectTo: "/Home"
                        });
                    // Configure ADAL.
                    var adalConfig = {
                        tenant: envServiceProvider.read('tenant'),
                        clientId: envServiceProvider.read('appClientId'),
                        cacheLocation: window.location.hostname === "localhost" ? "localStorage" : "", // enable this for IE, as sessionStorage does not work for localhost.
                        endpoints: {},
                        anonymousEndpoints: [
                            envServiceProvider.read('apiUri') + '/CurrentKeg',
                            envServiceProvider.read('apiUri') + '/activity'
                        ]
                    };
                    adalConfig.endpoints[envServiceProvider.read('apiUri')] = envServiceProvider.read('apiClientId');
                    adalProvider.init(adalConfig, $httpProvider);
                }]);
            this.app.service('configService', Service.ConfigService);
            this.app.service('userService', Service.UserService);
            this.app.service('untappdService', Service.UntappdApiService);
            this.app.service('voteService', Service.VoteService);
            this.app.service('dashboardService', Service.DashboardService);
            this.app.service('kegsService', Service.KegsService);
            this.app.service('adminService', Service.AdminService);
            this.app.run(['$window', '$q', '$location', '$route', '$rootScope', ($window, $q, $location, $route, $rootScope) => {
                // Make angular's promises the default as that will still integrate with angular's digest cycle after awaits
                $window.Promise = $q;
                $rootScope.$on('$locationChangeStart', (event, newUrl, oldUrl) => this.locationChangeHandler($rootScope, $location));
            }]);            
        }

        private locationChangeHandler($rootScope, $location): void {
            var hash = '';
            if ($location.$$html5) {
                hash = $location.hash();
            }
            else {
                hash = '#' + $location.path();
            }
            // Use ADAL for url response parsing
            var _adal: any = new AuthenticationContext({clientId:''});
            hash = _adal._getHash(hash);
            var parameters = _adal._deserialize(hash);
            if (parameters.hasOwnProperty('access_token')) {
                $rootScope.untappedPostBackToken = parameters['access_token'];
                $location.path('User');
            }
        }

        public start(): void {
            $(document).ready(() => {
                try {
                    console.log("booting " + this.app.name);
                    var injector = angular.bootstrap(document, [this.app.name]);
                    console.log("booted app: " + injector);
                }
                catch (ex) {
                    $('#BootExceptionDetails').text(ex);
                    $('#AngularBootError').show();
                }
            });
        }
    }
}


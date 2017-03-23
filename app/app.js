//     Copyright (c) Microsoft Corporation.  All rights reserved.
/// <reference path="../references/index.d.ts" />
var DXLiquidIntel;
(function (DXLiquidIntel) {
    var App;
    (function (App) {
        var Model;
        (function (Model) {
            // Need to keep structure in sync with DashServer.ManagementAPI.Models.OperationState in the WebAPI
            class UserInfo {
            }
            Model.UserInfo = UserInfo;
        })(Model = App.Model || (App.Model = {}));
    })(App = DXLiquidIntel.App || (DXLiquidIntel.App = {}));
})(DXLiquidIntel || (DXLiquidIntel = {}));
//     Copyright (c) Microsoft Corporation.  All rights reserved.
/// <reference path="../references/index.d.ts" />
/// <reference path="../Model/UserInfo.ts" />
var DXLiquidIntel;
(function (DXLiquidIntel) {
    var App;
    (function (App) {
        var Service;
        (function (Service) {
            class UserService {
                constructor($resource, envService) {
                    this.resourceClass = $resource(envService.read('apiUri') + '/users/:userId', null, {
                        update: { method: 'PUT' }
                    });
                }
                getUserInfo(userId) {
                    if (userId == this.cachedUserId && this.cachedUserInfo != null) {
                        return this.cachedUserInfo;
                    }
                    this.cachedUserId = userId;
                    if (!userId) {
                        this.cachedUserInfo = Promise.resolve(null);
                    }
                    else {
                        this.cachedUserInfo = this.resourceClass.get({
                            userId: userId
                        }, null, (errResp) => {
                            // Clear out cached promise to allow retry on error
                            this.cachedUserId = '';
                            this.cachedUserInfo = null;
                        }).$promise;
                    }
                    return this.cachedUserInfo;
                }
                updateUserInfo(userId, userInfo) {
                    if (!userId) {
                        throw 'Invalid user id';
                    }
                    this.cachedUserId = '';
                    this.cachedUserInfo = null;
                    return this.resourceClass.update({
                        userId: userId
                    }, userInfo).$promise;
                }
            }
            UserService.$inject = ['$resource', 'envService'];
            Service.UserService = UserService;
        })(Service = App.Service || (App.Service = {}));
    })(App = DXLiquidIntel.App || (DXLiquidIntel.App = {}));
})(DXLiquidIntel || (DXLiquidIntel = {}));
//     Copyright (c) Microsoft Corporation.  All rights reserved.
/// <reference path="../references/index.d.ts" />
var DXLiquidIntel;
(function (DXLiquidIntel) {
    var App;
    (function (App) {
        var Model;
        (function (Model) {
            class Vote {
            }
            Model.Vote = Vote;
            class BeerInfo {
            }
            Model.BeerInfo = BeerInfo;
            class VoteTally {
            }
            Model.VoteTally = VoteTally;
        })(Model = App.Model || (App.Model = {}));
    })(App = DXLiquidIntel.App || (DXLiquidIntel.App = {}));
})(DXLiquidIntel || (DXLiquidIntel = {}));
//     Copyright (c) Microsoft Corporation.  All rights reserved.
/// <reference path="../references/index.d.ts" />
/// <reference path="../Model/Vote.ts" />
var DXLiquidIntel;
(function (DXLiquidIntel) {
    var App;
    (function (App) {
        var Service;
        (function (Service) {
            class VoteService {
                constructor($resource, envService) {
                    this.userVotesResource = $resource(envService.read('apiUri') + '/votes/:personnelNumber', null, {
                        get: { method: 'GET', isArray: true },
                        save: { method: 'PUT', isArray: true }
                    });
                    this.tallyResource = $resource(envService.read('apiUri') + '/votes_tally');
                }
                getUserVotes(personnelNumber) {
                    return this.userVotesResource.get({
                        personnelNumber: personnelNumber
                    }).$promise;
                }
                updateUserVotes(personnelNumber, votes) {
                    return this.userVotesResource.save({
                        personnelNumber: personnelNumber
                    }, votes).$promise;
                }
                getVoteTally() {
                    return this.tallyResource.query().$promise;
                }
            }
            VoteService.$inject = ['$resource', 'envService'];
            Service.VoteService = VoteService;
        })(Service = App.Service || (App.Service = {}));
    })(App = DXLiquidIntel.App || (DXLiquidIntel.App = {}));
})(DXLiquidIntel || (DXLiquidIntel = {}));
//     Copyright (c) Microsoft Corporation.  All rights reserved.
/// <reference path="../references/index.d.ts" />
var DXLiquidIntel;
(function (DXLiquidIntel) {
    var App;
    (function (App) {
        var Model;
        (function (Model) {
            // Need to keep structure in sync with DashServer.ManagementAPI.Models.OperationState in the WebAPI
            class TapInfo {
            }
            Model.TapInfo = TapInfo;
        })(Model = App.Model || (App.Model = {}));
    })(App = DXLiquidIntel.App || (DXLiquidIntel.App = {}));
})(DXLiquidIntel || (DXLiquidIntel = {}));
//     Copyright (c) Microsoft Corporation.  All rights reserved.
/// <reference path="../references/index.d.ts" />
var DXLiquidIntel;
(function (DXLiquidIntel) {
    var App;
    (function (App) {
        var Model;
        (function (Model) {
            // Need to keep structure in sync with DashServer.ManagementAPI.Models.OperationState in the WebAPI
            class Activity {
            }
            Model.Activity = Activity;
        })(Model = App.Model || (App.Model = {}));
    })(App = DXLiquidIntel.App || (DXLiquidIntel.App = {}));
})(DXLiquidIntel || (DXLiquidIntel = {}));
//     Copyright (c) Microsoft Corporation.  All rights reserved.
/// <reference path="../references/index.d.ts" />
/// <reference path="../Model/TapInfo.ts" />
/// <reference path="../Model/Activity.ts" />
var DXLiquidIntel;
(function (DXLiquidIntel) {
    var App;
    (function (App) {
        var Service;
        (function (Service) {
            class DashboardService {
                constructor($resource, envService) {
                    var authHeader = "Basic " + btoa(envService.read('apiUsername') + ":" + envService.read('apiPassword'));
                    var headers = {
                        Authorization: authHeader
                    };
                    var queryAction = {
                        query: {
                            method: 'GET',
                            isArray: true,
                            headers: headers
                        }
                    };
                    this.kegStatusResource = $resource(envService.read('apiUri') + '/CurrentKeg', null, queryAction);
                    this.activityResource = $resource(envService.read('apiUri') + '/activity', null, queryAction);
                }
                getKegStatus() {
                    return this.kegStatusResource.query().$promise;
                }
                getLatestActivities(count) {
                    return this.activityResource.query({
                        count: count
                    }).$promise;
                }
            }
            DashboardService.$inject = ['$resource', 'envService'];
            Service.DashboardService = DashboardService;
        })(Service = App.Service || (App.Service = {}));
    })(App = DXLiquidIntel.App || (DXLiquidIntel.App = {}));
})(DXLiquidIntel || (DXLiquidIntel = {}));
//     Copyright (c) Microsoft Corporation.  All rights reserved.
/// <reference path="../references/index.d.ts" />
/// <reference path="../Service/UserService.ts" />
var DXLiquidIntel;
(function (DXLiquidIntel) {
    var App;
    (function (App) {
        var Controller;
        (function (Controller) {
            class ControllerBase {
                constructor($scope, $rootScope, adalAuthenticationService, $location, userService, continueAfterUserLoad) {
                    this.$scope = $scope;
                    this.$rootScope = $rootScope;
                    this.adalAuthenticationService = adalAuthenticationService;
                    this.$location = $location;
                    this.userService = userService;
                    $rootScope.login = () => this.login();
                    $rootScope.logout = () => this.logout();
                    $rootScope.isControllerActive = (location) => this.isActive(location);
                    $rootScope.isAdmin = () => {
                        return $scope.systemUserInfo ? $scope.systemUserInfo.IsAdmin : false;
                    };
                    $rootScope.buttonBarButtons = [];
                    $scope.$on('$routeChangeSuccess', (event, current, previous) => this.setTitleForRoute(current.$$route));
                    $scope.loadingMessage = "";
                    $scope.error = "";
                    // When the user logs in, we need to check with the api if they're an admin or not
                    this.setUpdateState(true);
                    this.$scope.loadingMessage = "Retrieving user information...";
                    this.$scope.error = "";
                    userService.getUserInfo($scope.userInfo.userName)
                        .then((userInfo) => {
                        $scope.systemUserInfo = userInfo;
                        continueAfterUserLoad();
                    });
                }
                login() {
                    this.adalAuthenticationService.login();
                }
                loginWithMfa() {
                    this.adalAuthenticationService.login({ amr_values: 'mfa' });
                }
                logout() {
                    this.adalAuthenticationService.logOut();
                }
                isActive(viewLocation) {
                    return viewLocation === this.$location.path();
                }
                setTitleForRoute(route) {
                    this.$rootScope.title = "DX Liquid Intelligence - " + route.name;
                }
                setError(error, message, responseHeaders) {
                    var acquireMfaResource = "";
                    if (responseHeaders != null) {
                        // If we received a 401 error with WWW-Authenticate response headers, we may need to 
                        // re-authenticate to satisfy 2FA requirements for underlying services used by the WebAPI
                        // (eg. RDFE). In that case, we need to explicitly specify the name of the resource we
                        // want 2FA authentication to.
                        var wwwAuth = responseHeaders("www-authenticate");
                        if (wwwAuth) {
                            // Handle the multiple www-authenticate headers case
                            angular.forEach(wwwAuth.split(","), (authScheme, index) => {
                                var paramsDelim = authScheme.indexOf(" ");
                                if (paramsDelim != -1) {
                                    var params = authScheme.substr(paramsDelim + 1);
                                    var paramsValues = params.split("=");
                                    if (paramsValues[0] === "interaction_required") {
                                        acquireMfaResource = paramsValues[1];
                                    }
                                }
                            });
                        }
                    }
                    if (acquireMfaResource) {
                        // The WebAPI needs 2FA authentication to be able to access its resources
                        this.loginWithMfa();
                    }
                    if ($.isPlainObject(message)) {
                        message = $.map(["Message", "ExceptionMessage", "ExceptionType"], (attributeName) => message[attributeName])
                            .join(" - ");
                    }
                    this.$scope.error_class = error ? "alert-danger" : "alert-info";
                    this.$scope.error = message;
                    this.$scope.loadingMessage = "";
                }
                setUpdateState(updateInProgress) {
                    this.$scope.updateInProgress = updateInProgress;
                }
            }
            Controller.ControllerBase = ControllerBase;
        })(Controller = App.Controller || (App.Controller = {}));
    })(App = DXLiquidIntel.App || (DXLiquidIntel.App = {}));
})(DXLiquidIntel || (DXLiquidIntel = {}));
//     Copyright (c) Microsoft Corporation.  All rights reserved.
/// <reference path="../references/index.d.ts" />
var DXLiquidIntel;
(function (DXLiquidIntel) {
    var App;
    (function (App) {
        var Model;
        (function (Model) {
            class Configuration {
            }
            Model.Configuration = Configuration;
        })(Model = App.Model || (App.Model = {}));
    })(App = DXLiquidIntel.App || (DXLiquidIntel.App = {}));
})(DXLiquidIntel || (DXLiquidIntel = {}));
//     Copyright (c) Microsoft Corporation.  All rights reserved.
/// <reference path="../references/index.d.ts" />
/// <reference path="../Model/Configuration.ts" />
var DXLiquidIntel;
(function (DXLiquidIntel) {
    var App;
    (function (App) {
        var Service;
        (function (Service) {
            class ConfigService {
                constructor($resource, envService) {
                    this.resourceClass = $resource(envService.read('apiUri') + '/appConfiguration');
                }
                getConfiguration() {
                    if (!this.configuration) {
                        this.configuration = this.resourceClass.get().$promise;
                    }
                    return this.configuration;
                }
            }
            ConfigService.$inject = ['$resource', 'envService'];
            Service.ConfigService = ConfigService;
        })(Service = App.Service || (App.Service = {}));
    })(App = DXLiquidIntel.App || (DXLiquidIntel.App = {}));
})(DXLiquidIntel || (DXLiquidIntel = {}));
//     Copyright (c) Microsoft Corporation.  All rights reserved.
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/// <reference path="../references/index.d.ts" />
/// <reference path="./ConfigService.ts" />
var DXLiquidIntel;
(function (DXLiquidIntel) {
    var App;
    (function (App) {
        var Service;
        (function (Service) {
            class UntappdApiService {
                constructor($resource, envService, configService) {
                    this.envService = envService;
                    this.configService = configService;
                    this.resourceClass = $resource('https://api.untappd.com/v4/:entity/:methodName');
                }
                getUntappdAuthUri(redirectUri) {
                    return __awaiter(this, void 0, void 0, function* () {
                        let appConfig = yield this.configService.getConfiguration();
                        return `https://untappd.com/oauth/authenticate/?client_id=${appConfig.UntappdClientId}&response_type=token&redirect_url=${redirectUri}`;
                    });
                }
                getUserInfo(accessToken) {
                    if (!accessToken) {
                        throw 'Invalid Untappd user access token';
                    }
                    else {
                        return this.resourceClass.get({
                            entity: 'user',
                            methodName: 'info',
                            access_token: accessToken
                        }).$promise;
                    }
                }
                searchBeers(searchTerm) {
                    return __awaiter(this, void 0, void 0, function* () {
                        let appConfig = yield this.configService.getConfiguration();
                        return yield this.resourceClass.get({
                            entity: 'search',
                            methodName: 'beer',
                            client_id: appConfig.UntappdClientId,
                            client_secret: appConfig.UntappdClientSecret,
                            q: searchTerm + '*',
                            limit: 15
                        }).$promise;
                    });
                }
            }
            UntappdApiService.$inject = ['$resource', 'envService', 'configService'];
            Service.UntappdApiService = UntappdApiService;
        })(Service = App.Service || (App.Service = {}));
    })(App = DXLiquidIntel.App || (DXLiquidIntel.App = {}));
})(DXLiquidIntel || (DXLiquidIntel = {}));
//     Copyright (c) Microsoft Corporation.  All rights reserved.
/// <reference path="../references/index.d.ts" />
/// <reference path="./ControllerBase.ts" />
/// <reference path="../Service/UserService.ts" />
/// <reference path="../Service/UntappdApiService.ts" />
var DXLiquidIntel;
(function (DXLiquidIntel) {
    var App;
    (function (App) {
        var Controller;
        (function (Controller) {
            class UserController extends Controller.ControllerBase {
                constructor($scope, $rootScope, adalAuthenticationService, $location, $route, userService, untappdService) {
                    super($scope, $rootScope, adalAuthenticationService, $location, userService, () => __awaiter(this, void 0, void 0, function* () {
                        this.setTitleForRoute($route.current);
                        $scope.buttonBarButtons = [
                            new App.Model.ButtonBarButton("Commit", $scope, "userForm.$valid && !updateInProgress", () => this.update(), true),
                            new App.Model.ButtonBarButton("Revert", $scope, "!updateInProgress", () => this.populate(), false)
                        ];
                        $scope.untappdAuthenticationUri = yield untappdService.getUntappdAuthUri($location.absUrl());
                        $scope.disconnectUntappdUser = () => this.disconnectUser();
                        $scope.updateUserInfo = () => this.update();
                        this.populate();
                    }));
                    this.untappdService = untappdService;
                }
                populate() {
                    return __awaiter(this, void 0, void 0, function* () {
                        try {
                            this.setUpdateState(true);
                            this.$scope.loadingMessage = "Retrieving user information...";
                            this.$scope.error = "";
                            let userInfo = yield this.userService.getUserInfo(this.$scope.userInfo.userName);
                            this.$scope.systemUserInfo = userInfo;
                            if (this.$rootScope.untappedPostBackToken) {
                                this.$scope.systemUserInfo.UntappdAccessToken = this.$rootScope.untappedPostBackToken;
                                this.$rootScope.untappedPostBackToken = '';
                                let untappdUserResponse = yield this.untappdService.getUserInfo(this.$scope.systemUserInfo.UntappdAccessToken);
                                let untappdUserInfo = untappdUserResponse.response.user;
                                this.$scope.systemUserInfo.UntappdUserName = untappdUserInfo.user_name;
                                // If Untappd has a user image, force this to be our image
                                if (untappdUserInfo.user_avatar) {
                                    this.$scope.systemUserInfo.ThumbnailImageUri = untappdUserInfo.user_avatar;
                                }
                            }
                            this.setUpdateState(false);
                            this.$scope.loadingMessage = "";
                        }
                        catch (ex) {
                            this.setError(true, ex.data || ex.statusText, ex.headers);
                        }
                    });
                }
                update() {
                    return __awaiter(this, void 0, void 0, function* () {
                        try {
                            this.$scope.loadingMessage = "Saving user information...";
                            this.setUpdateState(true);
                            let userInfo = yield this.userService.updateUserInfo(this.$scope.userInfo.userName, this.$scope.systemUserInfo);
                            this.$scope.systemUserInfo = userInfo;
                            this.setUpdateState(false);
                            this.$scope.loadingMessage = "";
                        }
                        catch (ex) {
                            this.setError(true, ex.data || ex.statusText, ex.headers);
                            this.setUpdateState(false);
                        }
                    });
                }
                disconnectUser() {
                    this.$scope.systemUserInfo.UntappdUserName = '';
                    this.$scope.systemUserInfo.UntappdAccessToken = '';
                }
            }
            UserController.$inject = ['$scope', '$rootScope', 'adalAuthenticationService', '$location', '$route', 'userService', 'untappdService'];
            Controller.UserController = UserController;
        })(Controller = App.Controller || (App.Controller = {}));
    })(App = DXLiquidIntel.App || (DXLiquidIntel.App = {}));
})(DXLiquidIntel || (DXLiquidIntel = {}));
//     Copyright (c) Microsoft Corporation.  All rights reserved.
/// <reference path="../references/index.d.ts" />
/// <reference path="./ControllerBase.ts" />
/// <reference path="../Service/UntappdApiService.ts" />
/// <reference path="../Service/VoteService.ts" />
var DXLiquidIntel;
(function (DXLiquidIntel) {
    var App;
    (function (App) {
        var Controller;
        (function (Controller) {
            class VoteBeerController extends Controller.ControllerBase {
                constructor($scope, $rootScope, adalAuthenticationService, $location, $route, userService, untappdService, voteService) {
                    super($scope, $rootScope, adalAuthenticationService, $location, userService, () => {
                        this.setTitleForRoute($route.current);
                        $scope.buttonBarButtons = [
                            new App.Model.ButtonBarButton("Commit", $scope, "voteForm.$valid && voteForm.$dirty && !updateInProgress", () => this.update(), true),
                            new App.Model.ButtonBarButton("Revert", $scope, "!updateInProgress", () => this.populate(), false)
                        ];
                        $scope.searchBeers = (searchTerm) => this.searchBeers(searchTerm);
                        $scope.updateVotes = () => this.update();
                        $scope.clearVote = (vote) => this.resetVote(vote);
                        this.populate();
                    });
                    this.untappdService = untappdService;
                    this.voteService = voteService;
                }
                searchBeers(searchTerm) {
                    return this.untappdService.searchBeers(searchTerm)
                        .then((resp) => {
                        return resp.response.beers.items.map((beer) => {
                            return {
                                untappdId: beer.beer.bid,
                                name: beer.beer.beer_name,
                                ibu: beer.beer.beer_ibu,
                                abv: beer.beer.beer_abv,
                                description: beer.beer.beer_description,
                                brewery: beer.brewery.brewery_name,
                                image: beer.beer.beer_label
                            };
                        });
                    }, (reject) => {
                        return "An error occured";
                    });
                }
                normalizeVotesArray(sourceVotes) {
                    while (sourceVotes.length < 2) {
                        sourceVotes.push({
                            VoteId: 0,
                            PersonnelNumber: this.$scope.systemUserInfo.PersonnelNumber,
                            VoteDate: new Date(),
                            UntappdId: 0
                        });
                    }
                    sourceVotes.forEach((vote) => {
                        vote.BeerInfo = {
                            untappdId: vote.UntappdId,
                            name: vote.BeerName,
                            brewery: vote.Brewery
                        };
                    });
                    return sourceVotes;
                }
                populate() {
                    return __awaiter(this, void 0, void 0, function* () {
                        try {
                            this.setUpdateState(true);
                            this.$scope.loadingMessage = "Retrieving previous votes...";
                            this.$scope.error = "";
                            this.$scope.votes = this.normalizeVotesArray(yield this.voteService.getUserVotes(this.$scope.systemUserInfo.PersonnelNumber));
                            this.setUpdateState(false);
                            this.$scope.loadingMessage = "";
                        }
                        catch (ex) {
                            this.setError(true, ex.data || ex.statusText, ex.headers);
                        }
                    });
                }
                resetVote(vote) {
                    // Don't reset the vote id as we need to detect if this is a delete
                    vote.PersonnelNumber = this.$scope.systemUserInfo.PersonnelNumber;
                    vote.VoteDate = new Date();
                    vote.UntappdId = 0;
                    vote.BeerName = '';
                    vote.Brewery = '';
                    vote.BeerInfo = null;
                    this.$scope.voteForm.$setDirty();
                }
                update() {
                    return __awaiter(this, void 0, void 0, function* () {
                        try {
                            this.$scope.loadingMessage = "Saving votes...";
                            this.setUpdateState(true);
                            this.$scope.votes.forEach((vote) => {
                                if (vote.BeerInfo) {
                                    vote.UntappdId = vote.BeerInfo.untappdId;
                                    vote.BeerName = vote.BeerInfo.name;
                                    vote.Brewery = vote.BeerInfo.brewery;
                                }
                            });
                            this.$scope.votes = this.normalizeVotesArray(yield this.voteService.updateUserVotes(this.$scope.systemUserInfo.PersonnelNumber, this.$scope.votes));
                            this.$scope.voteForm.$setPristine();
                            this.setUpdateState(false);
                            this.$scope.error = "";
                            this.$scope.loadingMessage = "";
                        }
                        catch (ex) {
                            this.setError(true, ex.data || ex.statusText, ex.headers);
                            this.setUpdateState(false);
                        }
                    });
                }
            }
            VoteBeerController.$inject = ['$scope', '$rootScope', 'adalAuthenticationService', '$location', '$route', 'userService', 'untappdService', 'voteService'];
            Controller.VoteBeerController = VoteBeerController;
        })(Controller = App.Controller || (App.Controller = {}));
    })(App = DXLiquidIntel.App || (DXLiquidIntel.App = {}));
})(DXLiquidIntel || (DXLiquidIntel = {}));
//     Copyright (c) Microsoft Corporation.  All rights reserved.
/// <reference path="../references/index.d.ts" />
/// <reference path="./ControllerBase.ts" />
/// <reference path="../Service/UntappdApiService.ts" />
/// <reference path="../Service/VoteService.ts" />
var DXLiquidIntel;
(function (DXLiquidIntel) {
    var App;
    (function (App) {
        var Controller;
        (function (Controller) {
            class VoteResultsController extends Controller.ControllerBase {
                constructor($scope, $rootScope, adalAuthenticationService, $location, $route, userService, untappdService, voteService) {
                    super($scope, $rootScope, adalAuthenticationService, $location, userService, () => {
                        this.setTitleForRoute($route.current);
                        $scope.buttonBarButtons = [];
                        this.populate();
                    });
                    this.untappdService = untappdService;
                    this.voteService = voteService;
                }
                populate() {
                    return __awaiter(this, void 0, void 0, function* () {
                        try {
                            this.setUpdateState(true);
                            this.$scope.loadingMessage = "Retrieving current vote tallies...";
                            this.$scope.error = "";
                            let votesTally = yield this.voteService.getVoteTally();
                            this.$scope.votesTally = votesTally;
                            this.$scope.loadingMessage = "";
                        }
                        catch (ex) {
                            this.setError(true, ex.data || ex.statusText, ex.headers);
                        }
                    });
                }
            }
            VoteResultsController.$inject = ['$scope', '$rootScope', 'adalAuthenticationService', '$location', '$route', 'userService', 'untappdService', 'voteService'];
            Controller.VoteResultsController = VoteResultsController;
        })(Controller = App.Controller || (App.Controller = {}));
    })(App = DXLiquidIntel.App || (DXLiquidIntel.App = {}));
})(DXLiquidIntel || (DXLiquidIntel = {}));
//     Copyright (c) Microsoft Corporation.  All rights reserved.
/// <reference path="../references/index.d.ts" />
/// <reference path="./ControllerBase.ts" />
var DXLiquidIntel;
(function (DXLiquidIntel) {
    var App;
    (function (App) {
        var Controller;
        (function (Controller) {
            class AnalyticsController extends Controller.ControllerBase {
                constructor($scope, $rootScope, adalAuthenticationService, $location, $route, userService) {
                    super($scope, $rootScope, adalAuthenticationService, $location, userService, () => {
                        this.setTitleForRoute($route.current);
                        $scope.buttonBarButtons = [];
                        this.populate();
                    });
                }
                populate() {
                    return __awaiter(this, void 0, void 0, function* () {
                        try {
                            this.setUpdateState(true);
                            this.$scope.loadingMessage = "Retrieving beer analytics...";
                            this.$scope.error = "";
                            this.$scope.loadingMessage = "";
                        }
                        catch (ex) {
                            this.setError(true, ex.data || ex.statusText, ex.headers);
                        }
                    });
                }
            }
            AnalyticsController.$inject = ['$scope', '$rootScope', 'adalAuthenticationService', '$location', '$route', 'userService'];
            Controller.AnalyticsController = AnalyticsController;
        })(Controller = App.Controller || (App.Controller = {}));
    })(App = DXLiquidIntel.App || (DXLiquidIntel.App = {}));
})(DXLiquidIntel || (DXLiquidIntel = {}));
//     Copyright (c) Microsoft Corporation.  All rights reserved.
/// <reference path="../references/index.d.ts" />
/// <reference path="./ControllerBase.ts" />
/// <reference path="../Service/UserService.ts" />
/// <reference path="../Service/DashboardService.ts" />
var DXLiquidIntel;
(function (DXLiquidIntel) {
    var App;
    (function (App) {
        var Controller;
        (function (Controller) {
            class HomeController extends Controller.ControllerBase {
                constructor($scope, $rootScope, adalAuthenticationService, $location, $route, userService, dashboardService, $interval) {
                    super($scope, $rootScope, adalAuthenticationService, $location, userService, () => {
                        this.setTitleForRoute($route.current);
                        this.populate();
                        var intervalPromise = $interval(() => this.populate(), 5000);
                        $scope.$on('$destroy', () => $interval.cancel(intervalPromise));
                    });
                    this.dashboardService = dashboardService;
                }
                populate() {
                    return __awaiter(this, void 0, void 0, function* () {
                        this.$scope.currentTaps = yield this.dashboardService.getKegStatus();
                        this.$scope.currentActivities = yield this.dashboardService.getLatestActivities(25);
                    });
                }
            }
            HomeController.$inject = ['$scope', '$rootScope', 'adalAuthenticationService', '$location', '$route', 'userService', 'dashboardService', '$interval'];
            Controller.HomeController = HomeController;
        })(Controller = App.Controller || (App.Controller = {}));
    })(App = DXLiquidIntel.App || (DXLiquidIntel.App = {}));
})(DXLiquidIntel || (DXLiquidIntel = {}));
//     Copyright (c) Microsoft Corporation.  All rights reserved.
/// <reference path="./references/index.d.ts" />
/// <reference path="./Service/UserService.ts" />
/// <reference path="./Service/VoteService.ts" />
/// <reference path="./Service/DashboardService.ts" />
/// <reference path="./Controller/UserController.ts" />
/// <reference path="./Controller/VoteBeerController.ts" />
/// <reference path="./Controller/VoteResultsController.ts" />
/// <reference path="./Controller/AnalyticsController.ts" />
/// <reference path="./Controller/HomeController.ts" />
var DXLiquidIntel;
(function (DXLiquidIntel) {
    var App;
    (function (App) {
        class AppBuilder {
            constructor(name) {
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
                    ($routeProvider, $httpProvider, adalProvider, envServiceProvider) => {
                        envServiceProvider.config({
                            domains: {
                                development: ['localhost'],
                                ppe: ['dx-liquidapp-staging.azurewebsites.net'],
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
                            .when("/Home", {
                            name: "Home",
                            controller: App.Controller.HomeController,
                            templateUrl: "/views/home.html",
                            caseInsensitiveMatch: true,
                        })
                            .when("/User", {
                            name: "User",
                            controller: App.Controller.UserController,
                            templateUrl: "/Views/User.html",
                            requireADLogin: true,
                            caseInsensitiveMatch: true,
                        })
                            .when("/VoteBeer", {
                            name: "VoteBeer",
                            controller: App.Controller.VoteBeerController,
                            templateUrl: "/Views/VoteBeer.html",
                            requireADLogin: true,
                            caseInsensitiveMatch: true,
                        })
                            .when("/VoteResults", {
                            name: "VoteResults",
                            controller: App.Controller.VoteResultsController,
                            templateUrl: "/Views/VoteResults.html",
                            requireADLogin: true,
                            caseInsensitiveMatch: true,
                        })
                            .when("/Analytics", {
                            name: "Analytics",
                            controller: App.Controller.AnalyticsController,
                            templateUrl: "/Views/Analytics.html",
                            requireADLogin: true,
                            caseInsensitiveMatch: true,
                        })
                            .otherwise({
                            redirectTo: "/Home"
                        });
                        // Configure ADAL.
                        var adalConfig = {
                            tenant: envServiceProvider.read('tenant'),
                            clientId: envServiceProvider.read('appClientId'),
                            cacheLocation: window.location.hostname === "localhost" ? "localStorage" : "",
                            endpoints: {},
                            anonymousEndpoints: [
                                envServiceProvider.read('apiUri') + '/CurrentKeg',
                                envServiceProvider.read('apiUri') + '/activity'
                            ]
                        };
                        adalConfig.endpoints[envServiceProvider.read('apiUri')] = envServiceProvider.read('apiClientId');
                        adalProvider.init(adalConfig, $httpProvider);
                    }]);
                this.app.service('configService', App.Service.ConfigService);
                this.app.service('userService', App.Service.UserService);
                this.app.service('untappdService', App.Service.UntappdApiService);
                this.app.service('voteService', App.Service.VoteService);
                this.app.service('dashboardService', App.Service.DashboardService);
                this.app.run(['$window', '$q', '$location', '$route', '$rootScope', ($window, $q, $location, $route, $rootScope) => {
                        // Make angular's promises the default as that will still integrate with angular's digest cycle after awaits
                        $window.Promise = $q;
                        $rootScope.$on('$locationChangeStart', (event, newUrl, oldUrl) => this.locationChangeHandler($rootScope, $location));
                    }]);
            }
            locationChangeHandler($rootScope, $location) {
                var hash = '';
                if ($location.$$html5) {
                    hash = $location.hash();
                }
                else {
                    hash = '#' + $location.path();
                }
                // Use ADAL for url response parsing
                var _adal = new AuthenticationContext({ clientId: '' });
                hash = _adal._getHash(hash);
                var parameters = _adal._deserialize(hash);
                if (parameters.hasOwnProperty('access_token')) {
                    $rootScope.untappedPostBackToken = parameters['access_token'];
                    $location.path('User');
                }
            }
            start() {
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
        App.AppBuilder = AppBuilder;
    })(App = DXLiquidIntel.App || (DXLiquidIntel.App = {}));
})(DXLiquidIntel || (DXLiquidIntel = {}));
/// <reference path="appbuilder.ts" />
new DXLiquidIntel.App.AppBuilder('dxLiquidIntelApp').start();
//     Copyright (c) Microsoft Corporation.  All rights reserved.
/// <reference path="../references/index.d.ts" />
var DXLiquidIntel;
(function (DXLiquidIntel) {
    var App;
    (function (App) {
        var Model;
        (function (Model) {
            class ButtonBarButton {
                constructor(displayText, $scope, enabledExpression, doClick, isSubmit, imageUrl) {
                    this.displayText = displayText;
                    this.doClick = doClick;
                    this.isSubmit = isSubmit;
                    this.imageUrl = imageUrl;
                    this.enabled = false;
                    $scope.$watch(enabledExpression, (newValue) => this.enabled = newValue);
                }
            }
            Model.ButtonBarButton = ButtonBarButton;
        })(Model = App.Model || (App.Model = {}));
    })(App = DXLiquidIntel.App || (DXLiquidIntel.App = {}));
})(DXLiquidIntel || (DXLiquidIntel = {}));
//     Copyright (c) Microsoft Corporation.  All rights reserved.
/// <reference path="../references/index.d.ts" />
/// <reference path="UserInfo.ts" />
/// <reference path="Vote.ts" />
/// <reference path="TapInfo.ts" />

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIk1vZGVsL1VzZXJJbmZvLnRzIiwiU2VydmljZS9Vc2VyU2VydmljZS50cyIsIk1vZGVsL1ZvdGUudHMiLCJTZXJ2aWNlL1ZvdGVTZXJ2aWNlLnRzIiwiTW9kZWwvVGFwSW5mby50cyIsIk1vZGVsL0FjdGl2aXR5LnRzIiwiU2VydmljZS9EYXNoYm9hcmRTZXJ2aWNlLnRzIiwiQ29udHJvbGxlci9Db250cm9sbGVyQmFzZS50cyIsIk1vZGVsL0NvbmZpZ3VyYXRpb24udHMiLCJTZXJ2aWNlL0NvbmZpZ1NlcnZpY2UudHMiLCJTZXJ2aWNlL1VudGFwcGRBcGlTZXJ2aWNlLnRzIiwiQ29udHJvbGxlci9Vc2VyQ29udHJvbGxlci50cyIsIkNvbnRyb2xsZXIvVm90ZUJlZXJDb250cm9sbGVyLnRzIiwiQ29udHJvbGxlci9Wb3RlUmVzdWx0c0NvbnRyb2xsZXIudHMiLCJDb250cm9sbGVyL0FuYWx5dGljc0NvbnRyb2xsZXIudHMiLCJDb250cm9sbGVyL0hvbWVDb250cm9sbGVyLnRzIiwiQXBwQnVpbGRlci50cyIsInN0YXJ0LnRzIiwiTW9kZWwvQXBwU3RhdGUudHMiLCJNb2RlbC9TY29wZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxpRUFBaUU7QUFFakUsaURBQWlEO0FBRWpELElBQU8sYUFBYSxDQWlCbkI7QUFqQkQsV0FBTyxhQUFhO0lBQUMsSUFBQSxHQUFHLENBaUJ2QjtJQWpCb0IsV0FBQSxHQUFHO1FBQUMsSUFBQSxLQUFLLENBaUI3QjtRQWpCd0IsV0FBQSxLQUFLO1lBRTFCLG1HQUFtRztZQUNuRzthQWFDO1lBYlksY0FBUSxXQWFwQixDQUFBO1FBQ0wsQ0FBQyxFQWpCd0IsS0FBSyxHQUFMLFNBQUssS0FBTCxTQUFLLFFBaUI3QjtJQUFELENBQUMsRUFqQm9CLEdBQUcsR0FBSCxpQkFBRyxLQUFILGlCQUFHLFFBaUJ2QjtBQUFELENBQUMsRUFqQk0sYUFBYSxLQUFiLGFBQWEsUUFpQm5CO0FDckJELGlFQUFpRTtBQUVqRSxpREFB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Q3BDLGdDQUFnQztBQUNoQyxtQ0FBbUMiLCJmaWxlIjoiYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gICAgIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiAgQWxsIHJpZ2h0cyByZXNlcnZlZC5cclxuXHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9yZWZlcmVuY2VzL2luZGV4LmQudHNcIiAvPlxyXG5cclxubW9kdWxlIERYTGlxdWlkSW50ZWwuQXBwLk1vZGVsIHtcclxuXHJcbiAgICAvLyBOZWVkIHRvIGtlZXAgc3RydWN0dXJlIGluIHN5bmMgd2l0aCBEYXNoU2VydmVyLk1hbmFnZW1lbnRBUEkuTW9kZWxzLk9wZXJhdGlvblN0YXRlIGluIHRoZSBXZWJBUElcclxuICAgIGV4cG9ydCBjbGFzcyBVc2VySW5mbyB7XHJcbiAgICAgICAgcHVibGljIFBlcnNvbm5lbE51bWJlcjogbnVtYmVyXHJcbiAgICAgICAgcHVibGljIFVzZXJQcmluY2lwYWxOYW1lOiBzdHJpbmdcclxuICAgICAgICBwdWJsaWMgVW50YXBwZFVzZXJOYW1lOiBzdHJpbmdcclxuICAgICAgICBwdWJsaWMgVW50YXBwZEFjY2Vzc1Rva2VuOiBzdHJpbmdcclxuICAgICAgICBwdWJsaWMgQ2hlY2tpbkZhY2Vib29rOiBib29sZWFuXHJcbiAgICAgICAgcHVibGljIENoZWNraW5Ud2l0dGVyOiBib29sZWFuXHJcbiAgICAgICAgcHVibGljIENoZWNraW5Gb3Vyc3F1YXJlOiBib29sZWFuXHJcbiAgICAgICAgcHVibGljIEZ1bGxOYW1lOiBzdHJpbmdcclxuICAgICAgICBwdWJsaWMgRmlyc3ROYW1lOiBzdHJpbmdcclxuICAgICAgICBwdWJsaWMgTGFzdE5hbWU6IHN0cmluZ1xyXG4gICAgICAgIHB1YmxpYyBJc0FkbWluOiBib29sZWFuXHJcbiAgICAgICAgcHVibGljIFRodW1ibmFpbEltYWdlVXJpOiBzdHJpbmdcclxuICAgIH1cclxufVxyXG4gICAgICAgICAiLCIvLyAgICAgQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uICBBbGwgcmlnaHRzIHJlc2VydmVkLlxyXG5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL3JlZmVyZW5jZXMvaW5kZXguZC50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9Nb2RlbC9Vc2VySW5mby50c1wiIC8+XHJcblxyXG5tb2R1bGUgRFhMaXF1aWRJbnRlbC5BcHAuU2VydmljZSB7XHJcblxyXG4gICAgZXhwb3J0IGNsYXNzIFVzZXJTZXJ2aWNlIHtcclxuICAgICAgICBzdGF0aWMgJGluamVjdCA9IFsnJHJlc291cmNlJywgJ2VudlNlcnZpY2UnXTtcclxuXHJcbiAgICAgICAgcHJpdmF0ZSByZXNvdXJjZUNsYXNzOiBuZy5yZXNvdXJjZS5JUmVzb3VyY2VDbGFzczxuZy5yZXNvdXJjZS5JUmVzb3VyY2U8TW9kZWwuVXNlckluZm8+PjtcclxuICAgICAgICBwcml2YXRlIGNhY2hlZFVzZXJJZDogc3RyaW5nO1xyXG4gICAgICAgIHByaXZhdGUgY2FjaGVkVXNlckluZm86IFByb21pc2VMaWtlPE1vZGVsLlVzZXJJbmZvPjtcclxuXHJcbiAgICAgICAgY29uc3RydWN0b3IoJHJlc291cmNlOiBuZy5yZXNvdXJjZS5JUmVzb3VyY2VTZXJ2aWNlLCBlbnZTZXJ2aWNlOiBhbmd1bGFyLmVudmlyb25tZW50LlNlcnZpY2UpIHtcclxuXHJcbiAgICAgICAgICAgIHRoaXMucmVzb3VyY2VDbGFzcyA9IDxuZy5yZXNvdXJjZS5JUmVzb3VyY2VDbGFzczxuZy5yZXNvdXJjZS5JUmVzb3VyY2U8TW9kZWwuVXNlckluZm8+Pj4kcmVzb3VyY2UoZW52U2VydmljZS5yZWFkKCdhcGlVcmknKSArICcvdXNlcnMvOnVzZXJJZCcsXHJcbiAgICAgICAgICAgICAgICBudWxsLFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZTogeyBtZXRob2Q6ICdQVVQnIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGdldFVzZXJJbmZvKHVzZXJJZDogc3RyaW5nKTogUHJvbWlzZUxpa2U8TW9kZWwuVXNlckluZm8+IHtcclxuICAgICAgICAgICAgaWYgKHVzZXJJZCA9PSB0aGlzLmNhY2hlZFVzZXJJZCAmJiB0aGlzLmNhY2hlZFVzZXJJbmZvICE9IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmNhY2hlZFVzZXJJbmZvO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuY2FjaGVkVXNlcklkID0gdXNlcklkO1xyXG4gICAgICAgICAgICBpZiAoIXVzZXJJZCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jYWNoZWRVc2VySW5mbyA9IFByb21pc2UucmVzb2x2ZTxNb2RlbC5Vc2VySW5mbz4obnVsbCk7ICAgIFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jYWNoZWRVc2VySW5mbyA9IHRoaXMucmVzb3VyY2VDbGFzcy5nZXQoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB1c2VySWQ6IHVzZXJJZFxyXG4gICAgICAgICAgICAgICAgICAgIH0sIFxyXG4gICAgICAgICAgICAgICAgICAgIG51bGwsIFxyXG4gICAgICAgICAgICAgICAgICAgIChlcnJSZXNwOiBuZy5JSHR0cFByb21pc2U8TW9kZWwuVXNlckluZm8+KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIENsZWFyIG91dCBjYWNoZWQgcHJvbWlzZSB0byBhbGxvdyByZXRyeSBvbiBlcnJvclxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNhY2hlZFVzZXJJZCA9ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNhY2hlZFVzZXJJbmZvID0gbnVsbDtcclxuICAgICAgICAgICAgICAgICAgICB9KS4kcHJvbWlzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jYWNoZWRVc2VySW5mbztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyB1cGRhdGVVc2VySW5mbyh1c2VySWQ6IHN0cmluZywgdXNlckluZm86IE1vZGVsLlVzZXJJbmZvKTogUHJvbWlzZUxpa2U8TW9kZWwuVXNlckluZm8+IHtcclxuICAgICAgICAgICAgaWYgKCF1c2VySWQpIHtcclxuICAgICAgICAgICAgICAgIHRocm93ICdJbnZhbGlkIHVzZXIgaWQnO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuY2FjaGVkVXNlcklkID0gJyc7XHJcbiAgICAgICAgICAgIHRoaXMuY2FjaGVkVXNlckluZm8gPSBudWxsO1xyXG4gICAgICAgICAgICByZXR1cm4gKDxhbnk+dGhpcy5yZXNvdXJjZUNsYXNzKS51cGRhdGUoe1xyXG4gICAgICAgICAgICAgICAgICAgIHVzZXJJZDogdXNlcklkXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgdXNlckluZm8pLiRwcm9taXNlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4gIiwiLy8gICAgIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiAgQWxsIHJpZ2h0cyByZXNlcnZlZC5cclxuXHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9yZWZlcmVuY2VzL2luZGV4LmQudHNcIiAvPlxyXG5cclxubW9kdWxlIERYTGlxdWlkSW50ZWwuQXBwLk1vZGVsIHtcclxuXHJcbiAgICBleHBvcnQgY2xhc3MgVm90ZSB7XHJcbiAgICAgICAgcHVibGljIFZvdGVJZDogbnVtYmVyXHJcbiAgICAgICAgcHVibGljIFBlcnNvbm5lbE51bWJlcjogbnVtYmVyXHJcbiAgICAgICAgcHVibGljIFZvdGVEYXRlOiBEYXRlXHJcbiAgICAgICAgcHVibGljIFVudGFwcGRJZDogbnVtYmVyXHJcbiAgICAgICAgcHVibGljIEJlZXJOYW1lPzogc3RyaW5nXHJcbiAgICAgICAgcHVibGljIEJyZXdlcnk/OiBzdHJpbmdcclxuICAgICAgICBwdWJsaWMgQmVlckluZm8/OiBCZWVySW5mb1xyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBCZWVySW5mbyB7XHJcbiAgICAgICAgcHVibGljIHVudGFwcGRJZDogbnVtYmVyXHJcbiAgICAgICAgcHVibGljIG5hbWU6IHN0cmluZ1xyXG4gICAgICAgIHB1YmxpYyBpYnU/OiBudW1iZXJcclxuICAgICAgICBwdWJsaWMgYWJ2PzogbnVtYmVyXHJcbiAgICAgICAgcHVibGljIGRlc2NyaXB0aW9uPzogc3RyaW5nXHJcbiAgICAgICAgcHVibGljIGJyZXdlcnk/OiBzdHJpbmdcclxuICAgICAgICBwdWJsaWMgaW1hZ2U/OiBzdHJpbmdcclxuICAgIH1cclxuXHJcbiAgICBleHBvcnQgY2xhc3MgVm90ZVRhbGx5IHtcclxuICAgICAgICBwdWJsaWMgVW50YXBwZElkOiBudW1iZXJcclxuICAgICAgICBwdWJsaWMgQmVlck5hbWU/OiBzdHJpbmdcclxuICAgICAgICBwdWJsaWMgQnJld2VyeT86IHN0cmluZ1xyXG4gICAgICAgIHB1YmxpYyBWb3RlQ291bnQ6IG51bWJlclxyXG4gICAgfVxyXG59XHJcbiAgICAgICAgICIsIi8vICAgICBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gIEFsbCByaWdodHMgcmVzZXJ2ZWQuXHJcblxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vcmVmZXJlbmNlcy9pbmRleC5kLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL01vZGVsL1ZvdGUudHNcIiAvPlxyXG5cclxubW9kdWxlIERYTGlxdWlkSW50ZWwuQXBwLlNlcnZpY2Uge1xyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBWb3RlU2VydmljZSB7XHJcbiAgICAgICAgc3RhdGljICRpbmplY3QgPSBbJyRyZXNvdXJjZScsICdlbnZTZXJ2aWNlJ107XHJcblxyXG4gICAgICAgIHByaXZhdGUgdXNlclZvdGVzUmVzb3VyY2U6IG5nLnJlc291cmNlLklSZXNvdXJjZUNsYXNzPE1vZGVsLlZvdGVbXT47XHJcbiAgICAgICAgcHJpdmF0ZSB0YWxseVJlc291cmNlOiBuZy5yZXNvdXJjZS5JUmVzb3VyY2VDbGFzczxNb2RlbC5Wb3RlVGFsbHk+O1xyXG5cclxuICAgICAgICBjb25zdHJ1Y3RvcigkcmVzb3VyY2U6IG5nLnJlc291cmNlLklSZXNvdXJjZVNlcnZpY2UsIGVudlNlcnZpY2U6IGFuZ3VsYXIuZW52aXJvbm1lbnQuU2VydmljZSkge1xyXG5cclxuICAgICAgICAgICAgdGhpcy51c2VyVm90ZXNSZXNvdXJjZSA9ICRyZXNvdXJjZTxNb2RlbC5Wb3RlW10+KGVudlNlcnZpY2UucmVhZCgnYXBpVXJpJykgKyAnL3ZvdGVzLzpwZXJzb25uZWxOdW1iZXInLCBudWxsLCB7XHJcbiAgICAgICAgICAgICAgICBnZXQ6IHttZXRob2Q6ICdHRVQnLCBpc0FycmF5OiB0cnVlfSxcclxuICAgICAgICAgICAgICAgIHNhdmU6IHttZXRob2Q6ICdQVVQnLCBpc0FycmF5OiB0cnVlfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgdGhpcy50YWxseVJlc291cmNlID0gJHJlc291cmNlPE1vZGVsLlZvdGVUYWxseT4oZW52U2VydmljZS5yZWFkKCdhcGlVcmknKSArICcvdm90ZXNfdGFsbHknKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBnZXRVc2VyVm90ZXMocGVyc29ubmVsTnVtYmVyOiBudW1iZXIpOiBQcm9taXNlTGlrZTxNb2RlbC5Wb3RlW10+IHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMudXNlclZvdGVzUmVzb3VyY2UuZ2V0KHtcclxuICAgICAgICAgICAgICAgICAgICBwZXJzb25uZWxOdW1iZXI6IHBlcnNvbm5lbE51bWJlclxyXG4gICAgICAgICAgICAgICAgfSkuJHByb21pc2U7IFxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHVwZGF0ZVVzZXJWb3RlcyhwZXJzb25uZWxOdW1iZXI6IG51bWJlciwgdm90ZXM6IE1vZGVsLlZvdGVbXSk6IFByb21pc2VMaWtlPE1vZGVsLlZvdGVbXT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy51c2VyVm90ZXNSZXNvdXJjZS5zYXZlKHtcclxuICAgICAgICAgICAgICAgICAgICBwZXJzb25uZWxOdW1iZXI6IHBlcnNvbm5lbE51bWJlclxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHZvdGVzKS4kcHJvbWlzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBnZXRWb3RlVGFsbHkoKTogUHJvbWlzZUxpa2U8TW9kZWwuVm90ZVRhbGx5W10+IHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMudGFsbHlSZXNvdXJjZS5xdWVyeSgpLiRwcm9taXNlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4gIiwiLy8gICAgIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiAgQWxsIHJpZ2h0cyByZXNlcnZlZC5cclxuXHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9yZWZlcmVuY2VzL2luZGV4LmQudHNcIiAvPlxyXG5cclxubW9kdWxlIERYTGlxdWlkSW50ZWwuQXBwLk1vZGVsIHtcclxuXHJcbiAgICAvLyBOZWVkIHRvIGtlZXAgc3RydWN0dXJlIGluIHN5bmMgd2l0aCBEYXNoU2VydmVyLk1hbmFnZW1lbnRBUEkuTW9kZWxzLk9wZXJhdGlvblN0YXRlIGluIHRoZSBXZWJBUElcclxuICAgIGV4cG9ydCBjbGFzcyBUYXBJbmZvIHtcclxuICAgICAgICBwdWJsaWMgVGFwSWQ6IG51bWJlclxyXG4gICAgICAgIHB1YmxpYyBLZWdJZDogbnVtYmVyXHJcbiAgICAgICAgcHVibGljIEluc3RhbGxEYXRlOiBEYXRlXHJcbiAgICAgICAgcHVibGljIEtlZ1NpemU6IG51bWJlclxyXG4gICAgICAgIHB1YmxpYyBDdXJyZW50Vm9sdW1lOiBudW1iZXJcclxuICAgICAgICBwdWJsaWMgTmFtZTogc3RyaW5nXHJcbiAgICAgICAgcHVibGljIEJyZXdlcnk6IHN0cmluZ1xyXG4gICAgICAgIHB1YmxpYyBCZWVyVHlwZTogc3RyaW5nXHJcbiAgICAgICAgcHVibGljIEFCVj86IG51bWJlclxyXG4gICAgICAgIHB1YmxpYyBJQlU/OiBudW1iZXJcclxuICAgICAgICBwdWJsaWMgQmVlckRlc2NyaXB0aW9uOiBzdHJpbmdcclxuICAgICAgICBwdWJsaWMgVW50YXBwZElkPzogbnVtYmVyXHJcbiAgICAgICAgcHVibGljIGltYWdlUGF0aDogc3RyaW5nXHJcbiAgICB9XHJcbn1cclxuICAgICAgICAgIiwiLy8gICAgIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiAgQWxsIHJpZ2h0cyByZXNlcnZlZC5cclxuXHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9yZWZlcmVuY2VzL2luZGV4LmQudHNcIiAvPlxyXG5cclxubW9kdWxlIERYTGlxdWlkSW50ZWwuQXBwLk1vZGVsIHtcclxuXHJcbiAgICAvLyBOZWVkIHRvIGtlZXAgc3RydWN0dXJlIGluIHN5bmMgd2l0aCBEYXNoU2VydmVyLk1hbmFnZW1lbnRBUEkuTW9kZWxzLk9wZXJhdGlvblN0YXRlIGluIHRoZSBXZWJBUElcclxuICAgIGV4cG9ydCBjbGFzcyBBY3Rpdml0eSB7XHJcbiAgICAgICAgcHVibGljIFNlc3Npb25JZDogbnVtYmVyXHJcbiAgICAgICAgcHVibGljIFBvdXJUaW1lOiBEYXRlXHJcbiAgICAgICAgcHVibGljIFBvdXJBbW91bnQ6IG51bWJlclxyXG4gICAgICAgIHB1YmxpYyBCZWVyTmFtZTogc3RyaW5nXHJcbiAgICAgICAgcHVibGljIEJyZXdlcnk6IHN0cmluZ1xyXG4gICAgICAgIHB1YmxpYyBCZWVyVHlwZTogc3RyaW5nXHJcbiAgICAgICAgcHVibGljIEFCVj86IG51bWJlclxyXG4gICAgICAgIHB1YmxpYyBJQlU/OiBudW1iZXJcclxuICAgICAgICBwdWJsaWMgQmVlckRlc2NyaXB0aW9uOiBzdHJpbmdcclxuICAgICAgICBwdWJsaWMgVW50YXBwZElkPzogbnVtYmVyXHJcbiAgICAgICAgcHVibGljIEJlZXJJbWFnZVBhdGg6IHN0cmluZ1xyXG4gICAgICAgIHB1YmxpYyBQZXJzb25uZWxOdW1iZXI6IG51bWJlclxyXG4gICAgICAgIHB1YmxpYyBBbGlhczogc3RyaW5nXHJcbiAgICAgICAgcHVibGljIEZ1bGxOYW1lOiBzdHJpbmdcclxuICAgIH1cclxufVxyXG4gICAgICAgICAiLCIvLyAgICAgQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uICBBbGwgcmlnaHRzIHJlc2VydmVkLlxyXG5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL3JlZmVyZW5jZXMvaW5kZXguZC50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9Nb2RlbC9UYXBJbmZvLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL01vZGVsL0FjdGl2aXR5LnRzXCIgLz5cclxuXHJcbm1vZHVsZSBEWExpcXVpZEludGVsLkFwcC5TZXJ2aWNlIHtcclxuXHJcbiAgICBleHBvcnQgY2xhc3MgRGFzaGJvYXJkU2VydmljZSB7XHJcbiAgICAgICAgc3RhdGljICRpbmplY3QgPSBbJyRyZXNvdXJjZScsICdlbnZTZXJ2aWNlJ107XHJcblxyXG4gICAgICAgIHByaXZhdGUga2VnU3RhdHVzUmVzb3VyY2U6IG5nLnJlc291cmNlLklSZXNvdXJjZUNsYXNzPE1vZGVsLlRhcEluZm8+O1xyXG4gICAgICAgIHByaXZhdGUgYWN0aXZpdHlSZXNvdXJjZTogbmcucmVzb3VyY2UuSVJlc291cmNlQ2xhc3M8TW9kZWwuQWN0aXZpdHk+O1xyXG5cclxuICAgICAgICBjb25zdHJ1Y3RvcigkcmVzb3VyY2U6IG5nLnJlc291cmNlLklSZXNvdXJjZVNlcnZpY2UsIGVudlNlcnZpY2U6IGFuZ3VsYXIuZW52aXJvbm1lbnQuU2VydmljZSkge1xyXG4gICAgICAgICAgICB2YXIgYXV0aEhlYWRlciA9IFwiQmFzaWMgXCIgKyBidG9hKGVudlNlcnZpY2UucmVhZCgnYXBpVXNlcm5hbWUnKSArIFwiOlwiICsgZW52U2VydmljZS5yZWFkKCdhcGlQYXNzd29yZCcpKTtcclxuICAgICAgICAgICAgdmFyIGhlYWRlcnMgPSB7XHJcbiAgICAgICAgICAgICAgICBBdXRob3JpemF0aW9uOiBhdXRoSGVhZGVyXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHZhciBxdWVyeUFjdGlvbjogbmcucmVzb3VyY2UuSUFjdGlvbkhhc2ggPSB7XHJcbiAgICAgICAgICAgICAgICBxdWVyeToge1xyXG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZDogJ0dFVCcsXHJcbiAgICAgICAgICAgICAgICAgICAgaXNBcnJheTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICBoZWFkZXJzOiBoZWFkZXJzXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHRoaXMua2VnU3RhdHVzUmVzb3VyY2UgPSAkcmVzb3VyY2U8TW9kZWwuVGFwSW5mbz4oZW52U2VydmljZS5yZWFkKCdhcGlVcmknKSArICcvQ3VycmVudEtlZycsIG51bGwsIHF1ZXJ5QWN0aW9uKTtcclxuICAgICAgICAgICAgdGhpcy5hY3Rpdml0eVJlc291cmNlID0gJHJlc291cmNlPE1vZGVsLkFjdGl2aXR5PihlbnZTZXJ2aWNlLnJlYWQoJ2FwaVVyaScpICsgJy9hY3Rpdml0eScsIG51bGwsIHF1ZXJ5QWN0aW9uKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBnZXRLZWdTdGF0dXMoKTogUHJvbWlzZUxpa2U8TW9kZWwuVGFwSW5mb1tdPiB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmtlZ1N0YXR1c1Jlc291cmNlLnF1ZXJ5KCkuJHByb21pc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgZ2V0TGF0ZXN0QWN0aXZpdGllcyhjb3VudDogbnVtYmVyKTogUHJvbWlzZUxpa2U8TW9kZWwuQWN0aXZpdHlbXT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5hY3Rpdml0eVJlc291cmNlLnF1ZXJ5KHtcclxuICAgICAgICAgICAgICAgIGNvdW50OiBjb3VudFxyXG4gICAgICAgICAgICB9KS4kcHJvbWlzZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwiLy8gICAgIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiAgQWxsIHJpZ2h0cyByZXNlcnZlZC5cclxuXHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9yZWZlcmVuY2VzL2luZGV4LmQudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vU2VydmljZS9Vc2VyU2VydmljZS50c1wiIC8+XHJcblxyXG5tb2R1bGUgRFhMaXF1aWRJbnRlbC5BcHAuQ29udHJvbGxlciB7XHJcblxyXG4gICAgZXhwb3J0IGNsYXNzIENvbnRyb2xsZXJCYXNlIHtcclxuXHJcbiAgICAgICAgY29uc3RydWN0b3IocHJvdGVjdGVkICRzY29wZTogTW9kZWwuSURYTGlxdWlkSW50ZWxTY29wZSxcclxuICAgICAgICAgICAgcHJvdGVjdGVkICRyb290U2NvcGU6IE1vZGVsLklEWExpcXVpZEludGVsU2NvcGUsXHJcbiAgICAgICAgICAgIHByb3RlY3RlZCBhZGFsQXV0aGVudGljYXRpb25TZXJ2aWNlLFxyXG4gICAgICAgICAgICBwcm90ZWN0ZWQgJGxvY2F0aW9uOiBuZy5JTG9jYXRpb25TZXJ2aWNlLFxyXG4gICAgICAgICAgICBwcm90ZWN0ZWQgdXNlclNlcnZpY2U6IFNlcnZpY2UuVXNlclNlcnZpY2UsXHJcbiAgICAgICAgICAgIGNvbnRpbnVlQWZ0ZXJVc2VyTG9hZDogKCkgPT4gdm9pZCkge1xyXG5cclxuICAgICAgICAgICAgJHJvb3RTY29wZS5sb2dpbiA9ICgpID0+IHRoaXMubG9naW4oKTtcclxuICAgICAgICAgICAgJHJvb3RTY29wZS5sb2dvdXQgPSAoKSA9PiB0aGlzLmxvZ291dCgpO1xyXG4gICAgICAgICAgICAkcm9vdFNjb3BlLmlzQ29udHJvbGxlckFjdGl2ZSA9IChsb2NhdGlvbikgPT4gdGhpcy5pc0FjdGl2ZShsb2NhdGlvbik7XHJcbiAgICAgICAgICAgICRyb290U2NvcGUuaXNBZG1pbiA9ICgpID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAkc2NvcGUuc3lzdGVtVXNlckluZm8gPyAkc2NvcGUuc3lzdGVtVXNlckluZm8uSXNBZG1pbiA6IGZhbHNlO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAkcm9vdFNjb3BlLmJ1dHRvbkJhckJ1dHRvbnMgPSBbXTtcclxuXHJcbiAgICAgICAgICAgICRzY29wZS4kb24oJyRyb3V0ZUNoYW5nZVN1Y2Nlc3MnLCAoZXZlbnQsIGN1cnJlbnQsIHByZXZpb3VzKSA9PiB0aGlzLnNldFRpdGxlRm9yUm91dGUoY3VycmVudC4kJHJvdXRlKSk7XHJcbiAgICAgICAgICAgICRzY29wZS5sb2FkaW5nTWVzc2FnZSA9IFwiXCI7XHJcbiAgICAgICAgICAgICRzY29wZS5lcnJvciA9IFwiXCI7XHJcblxyXG4gICAgICAgICAgICAvLyBXaGVuIHRoZSB1c2VyIGxvZ3MgaW4sIHdlIG5lZWQgdG8gY2hlY2sgd2l0aCB0aGUgYXBpIGlmIHRoZXkncmUgYW4gYWRtaW4gb3Igbm90XHJcbiAgICAgICAgICAgIHRoaXMuc2V0VXBkYXRlU3RhdGUodHJ1ZSk7XHJcbiAgICAgICAgICAgIHRoaXMuJHNjb3BlLmxvYWRpbmdNZXNzYWdlID0gXCJSZXRyaWV2aW5nIHVzZXIgaW5mb3JtYXRpb24uLi5cIjtcclxuICAgICAgICAgICAgdGhpcy4kc2NvcGUuZXJyb3IgPSBcIlwiO1xyXG4gICAgICAgICAgICB1c2VyU2VydmljZS5nZXRVc2VySW5mbygkc2NvcGUudXNlckluZm8udXNlck5hbWUpXHJcbiAgICAgICAgICAgICAgICAudGhlbigodXNlckluZm86IE1vZGVsLlVzZXJJbmZvKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnN5c3RlbVVzZXJJbmZvID0gdXNlckluZm87XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGludWVBZnRlclVzZXJMb2FkKCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBsb2dpbigpOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy5hZGFsQXV0aGVudGljYXRpb25TZXJ2aWNlLmxvZ2luKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgbG9naW5XaXRoTWZhKCkge1xyXG4gICAgICAgICAgICB0aGlzLmFkYWxBdXRoZW50aWNhdGlvblNlcnZpY2UubG9naW4oeyBhbXJfdmFsdWVzOiAnbWZhJyB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBsb2dvdXQoKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMuYWRhbEF1dGhlbnRpY2F0aW9uU2VydmljZS5sb2dPdXQoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBpc0FjdGl2ZSh2aWV3TG9jYXRpb24pOiBib29sZWFuIHtcclxuICAgICAgICAgICAgcmV0dXJuIHZpZXdMb2NhdGlvbiA9PT0gdGhpcy4kbG9jYXRpb24ucGF0aCgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHNldFRpdGxlRm9yUm91dGUocm91dGU6IG5nLnJvdXRlLklSb3V0ZSk6IHZvaWQge1xyXG4gICAgICAgICAgICB0aGlzLiRyb290U2NvcGUudGl0bGUgPSBcIkRYIExpcXVpZCBJbnRlbGxpZ2VuY2UgLSBcIiArIHJvdXRlLm5hbWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcm90ZWN0ZWQgc2V0RXJyb3IoZXJyb3I6IGJvb2xlYW4sIG1lc3NhZ2U6IGFueSwgcmVzcG9uc2VIZWFkZXJzOiBuZy5JSHR0cEhlYWRlcnNHZXR0ZXIpOiB2b2lkIHtcclxuICAgICAgICAgICAgdmFyIGFjcXVpcmVNZmFSZXNvdXJjZSA9IFwiXCI7XHJcbiAgICAgICAgICAgIGlmIChyZXNwb25zZUhlYWRlcnMgIT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgLy8gSWYgd2UgcmVjZWl2ZWQgYSA0MDEgZXJyb3Igd2l0aCBXV1ctQXV0aGVudGljYXRlIHJlc3BvbnNlIGhlYWRlcnMsIHdlIG1heSBuZWVkIHRvIFxyXG4gICAgICAgICAgICAgICAgLy8gcmUtYXV0aGVudGljYXRlIHRvIHNhdGlzZnkgMkZBIHJlcXVpcmVtZW50cyBmb3IgdW5kZXJseWluZyBzZXJ2aWNlcyB1c2VkIGJ5IHRoZSBXZWJBUElcclxuICAgICAgICAgICAgICAgIC8vIChlZy4gUkRGRSkuIEluIHRoYXQgY2FzZSwgd2UgbmVlZCB0byBleHBsaWNpdGx5IHNwZWNpZnkgdGhlIG5hbWUgb2YgdGhlIHJlc291cmNlIHdlXHJcbiAgICAgICAgICAgICAgICAvLyB3YW50IDJGQSBhdXRoZW50aWNhdGlvbiB0by5cclxuICAgICAgICAgICAgICAgIHZhciB3d3dBdXRoID0gcmVzcG9uc2VIZWFkZXJzKFwid3d3LWF1dGhlbnRpY2F0ZVwiKTtcclxuICAgICAgICAgICAgICAgIGlmICh3d3dBdXRoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gSGFuZGxlIHRoZSBtdWx0aXBsZSB3d3ctYXV0aGVudGljYXRlIGhlYWRlcnMgY2FzZVxyXG4gICAgICAgICAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaCh3d3dBdXRoLnNwbGl0KFwiLFwiKSwgKGF1dGhTY2hlbWU6IHN0cmluZywgaW5kZXg6IG51bWJlcikgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcGFyYW1zRGVsaW0gPSBhdXRoU2NoZW1lLmluZGV4T2YoXCIgXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocGFyYW1zRGVsaW0gIT0gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwYXJhbXMgPSBhdXRoU2NoZW1lLnN1YnN0cihwYXJhbXNEZWxpbSArIDEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHBhcmFtc1ZhbHVlcyA9IHBhcmFtcy5zcGxpdChcIj1cIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocGFyYW1zVmFsdWVzWzBdID09PSBcImludGVyYWN0aW9uX3JlcXVpcmVkXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3F1aXJlTWZhUmVzb3VyY2UgPSBwYXJhbXNWYWx1ZXNbMV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoYWNxdWlyZU1mYVJlc291cmNlKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBUaGUgV2ViQVBJIG5lZWRzIDJGQSBhdXRoZW50aWNhdGlvbiB0byBiZSBhYmxlIHRvIGFjY2VzcyBpdHMgcmVzb3VyY2VzXHJcbiAgICAgICAgICAgICAgICB0aGlzLmxvZ2luV2l0aE1mYSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICgkLmlzUGxhaW5PYmplY3QobWVzc2FnZSkpIHtcclxuICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSAkLm1hcChbXCJNZXNzYWdlXCIsIFwiRXhjZXB0aW9uTWVzc2FnZVwiLCBcIkV4Y2VwdGlvblR5cGVcIl0sIChhdHRyaWJ1dGVOYW1lKSA9PiBtZXNzYWdlW2F0dHJpYnV0ZU5hbWVdKVxyXG4gICAgICAgICAgICAgICAgICAgIC5qb2luKFwiIC0gXCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuJHNjb3BlLmVycm9yX2NsYXNzID0gZXJyb3IgPyBcImFsZXJ0LWRhbmdlclwiIDogXCJhbGVydC1pbmZvXCI7XHJcbiAgICAgICAgICAgIHRoaXMuJHNjb3BlLmVycm9yID0gbWVzc2FnZTtcclxuICAgICAgICAgICAgdGhpcy4kc2NvcGUubG9hZGluZ01lc3NhZ2UgPSBcIlwiO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJvdGVjdGVkIHNldFVwZGF0ZVN0YXRlKHVwZGF0ZUluUHJvZ3Jlc3M6IGJvb2xlYW4pOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy4kc2NvcGUudXBkYXRlSW5Qcm9ncmVzcyA9IHVwZGF0ZUluUHJvZ3Jlc3M7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59ICIsIi8vICAgICBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gIEFsbCByaWdodHMgcmVzZXJ2ZWQuXHJcblxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vcmVmZXJlbmNlcy9pbmRleC5kLnRzXCIgLz5cclxuXHJcbm1vZHVsZSBEWExpcXVpZEludGVsLkFwcC5Nb2RlbCB7XHJcblxyXG4gICAgZXhwb3J0IGNsYXNzIENvbmZpZ3VyYXRpb24ge1xyXG5cclxuICAgICAgICBwdWJsaWMgVW50YXBwZENsaWVudElkOiBzdHJpbmdcclxuICAgICAgICBwdWJsaWMgVW50YXBwZENsaWVudFNlY3JldDogc3RyaW5nXHJcbiAgICB9XHJcbn0gIiwiLy8gICAgIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiAgQWxsIHJpZ2h0cyByZXNlcnZlZC5cclxuXHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9yZWZlcmVuY2VzL2luZGV4LmQudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vTW9kZWwvQ29uZmlndXJhdGlvbi50c1wiIC8+XHJcblxyXG5tb2R1bGUgRFhMaXF1aWRJbnRlbC5BcHAuU2VydmljZSB7XHJcblxyXG4gICAgZXhwb3J0IGNsYXNzIENvbmZpZ1NlcnZpY2Uge1xyXG4gICAgICAgIHN0YXRpYyAkaW5qZWN0ID0gWyckcmVzb3VyY2UnLCAnZW52U2VydmljZSddO1xyXG5cclxuICAgICAgICBwcml2YXRlIHJlc291cmNlQ2xhc3M6IG5nLnJlc291cmNlLklSZXNvdXJjZUNsYXNzPG5nLnJlc291cmNlLklSZXNvdXJjZTxNb2RlbC5Db25maWd1cmF0aW9uPj47XHJcbiAgICAgICAgcHJpdmF0ZSBjb25maWd1cmF0aW9uOiBuZy5JUHJvbWlzZTxNb2RlbC5Db25maWd1cmF0aW9uPjtcclxuXHJcbiAgICAgICAgY29uc3RydWN0b3IoJHJlc291cmNlOiBuZy5yZXNvdXJjZS5JUmVzb3VyY2VTZXJ2aWNlLCBlbnZTZXJ2aWNlOiBhbmd1bGFyLmVudmlyb25tZW50LlNlcnZpY2UpIHtcclxuXHJcbiAgICAgICAgICAgIHRoaXMucmVzb3VyY2VDbGFzcyA9ICRyZXNvdXJjZShlbnZTZXJ2aWNlLnJlYWQoJ2FwaVVyaScpICsgJy9hcHBDb25maWd1cmF0aW9uJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgZ2V0Q29uZmlndXJhdGlvbigpOiBQcm9taXNlTGlrZTxNb2RlbC5Db25maWd1cmF0aW9uPiB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5jb25maWd1cmF0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24gPSB0aGlzLnJlc291cmNlQ2xhc3MuZ2V0KCkuJHByb21pc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29uZmlndXJhdGlvbjtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuICIsIi8vICAgICBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gIEFsbCByaWdodHMgcmVzZXJ2ZWQuXHJcblxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vcmVmZXJlbmNlcy9pbmRleC5kLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vQ29uZmlnU2VydmljZS50c1wiIC8+XHJcblxyXG5tb2R1bGUgRFhMaXF1aWRJbnRlbC5BcHAuU2VydmljZSB7XHJcblxyXG4gICAgZXhwb3J0IGNsYXNzIFVudGFwcGRBcGlTZXJ2aWNlIHtcclxuICAgICAgICBzdGF0aWMgJGluamVjdCA9IFsnJHJlc291cmNlJywgJ2VudlNlcnZpY2UnLCAnY29uZmlnU2VydmljZSddO1xyXG5cclxuICAgICAgICBwcml2YXRlIHJlc291cmNlQ2xhc3M6IG5nLnJlc291cmNlLklSZXNvdXJjZUNsYXNzPG5nLnJlc291cmNlLklSZXNvdXJjZTxhbnk+PjtcclxuXHJcbiAgICAgICAgY29uc3RydWN0b3IoJHJlc291cmNlOiBuZy5yZXNvdXJjZS5JUmVzb3VyY2VTZXJ2aWNlLCBwcml2YXRlIGVudlNlcnZpY2U6IGFuZ3VsYXIuZW52aXJvbm1lbnQuU2VydmljZSwgcHJpdmF0ZSBjb25maWdTZXJ2aWNlOiBDb25maWdTZXJ2aWNlKSB7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnJlc291cmNlQ2xhc3MgPSAkcmVzb3VyY2UoJ2h0dHBzOi8vYXBpLnVudGFwcGQuY29tL3Y0LzplbnRpdHkvOm1ldGhvZE5hbWUnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBhc3luYyBnZXRVbnRhcHBkQXV0aFVyaShyZWRpcmVjdFVyaTogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+IHtcclxuICAgICAgICAgICAgbGV0IGFwcENvbmZpZyA9IGF3YWl0IHRoaXMuY29uZmlnU2VydmljZS5nZXRDb25maWd1cmF0aW9uKCk7XHJcbiAgICAgICAgICAgIHJldHVybiBgaHR0cHM6Ly91bnRhcHBkLmNvbS9vYXV0aC9hdXRoZW50aWNhdGUvP2NsaWVudF9pZD0ke2FwcENvbmZpZy5VbnRhcHBkQ2xpZW50SWR9JnJlc3BvbnNlX3R5cGU9dG9rZW4mcmVkaXJlY3RfdXJsPSR7cmVkaXJlY3RVcml9YDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBnZXRVc2VySW5mbyhhY2Nlc3NUb2tlbjogc3RyaW5nKTogUHJvbWlzZUxpa2U8YW55PiB7XHJcbiAgICAgICAgICAgIGlmICghYWNjZXNzVG9rZW4pIHtcclxuICAgICAgICAgICAgICAgIHRocm93ICdJbnZhbGlkIFVudGFwcGQgdXNlciBhY2Nlc3MgdG9rZW4nOyAgICBcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnJlc291cmNlQ2xhc3MuZ2V0KHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZW50aXR5OiAndXNlcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1ldGhvZE5hbWU6ICdpbmZvJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYWNjZXNzX3Rva2VuOiBhY2Nlc3NUb2tlblxyXG4gICAgICAgICAgICAgICAgICAgIH0pLiRwcm9taXNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgYXN5bmMgc2VhcmNoQmVlcnMoc2VhcmNoVGVybTogc3RyaW5nKTogUHJvbWlzZTxhbnk+IHtcclxuICAgICAgICAgICAgbGV0IGFwcENvbmZpZyA9IGF3YWl0IHRoaXMuY29uZmlnU2VydmljZS5nZXRDb25maWd1cmF0aW9uKCk7XHJcbiAgICAgICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnJlc291cmNlQ2xhc3MuZ2V0KHtcclxuICAgICAgICAgICAgICAgIGVudGl0eTogJ3NlYXJjaCcsXHJcbiAgICAgICAgICAgICAgICBtZXRob2ROYW1lOiAnYmVlcicsXHJcbiAgICAgICAgICAgICAgICBjbGllbnRfaWQ6IGFwcENvbmZpZy5VbnRhcHBkQ2xpZW50SWQsXHJcbiAgICAgICAgICAgICAgICBjbGllbnRfc2VjcmV0OiBhcHBDb25maWcuVW50YXBwZENsaWVudFNlY3JldCxcclxuICAgICAgICAgICAgICAgIHE6IHNlYXJjaFRlcm0gKyAnKicsXHJcbiAgICAgICAgICAgICAgICBsaW1pdDogMTVcclxuICAgICAgICAgICAgfSkuJHByb21pc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiAiLCIvLyAgICAgQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uICBBbGwgcmlnaHRzIHJlc2VydmVkLlxyXG5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL3JlZmVyZW5jZXMvaW5kZXguZC50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL0NvbnRyb2xsZXJCYXNlLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL1NlcnZpY2UvVXNlclNlcnZpY2UudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vU2VydmljZS9VbnRhcHBkQXBpU2VydmljZS50c1wiIC8+XHJcblxyXG5tb2R1bGUgRFhMaXF1aWRJbnRlbC5BcHAuQ29udHJvbGxlciB7XHJcblxyXG4gICAgZXhwb3J0IGNsYXNzIFVzZXJDb250cm9sbGVyIGV4dGVuZHMgQ29udHJvbGxlckJhc2Uge1xyXG4gICAgICAgIHN0YXRpYyAkaW5qZWN0ID0gWyckc2NvcGUnLCAnJHJvb3RTY29wZScsICdhZGFsQXV0aGVudGljYXRpb25TZXJ2aWNlJywgJyRsb2NhdGlvbicsICckcm91dGUnLCAndXNlclNlcnZpY2UnLCAndW50YXBwZFNlcnZpY2UnXTtcclxuXHJcbiAgICAgICAgY29uc3RydWN0b3IoJHNjb3BlOiBNb2RlbC5JRFhMaXF1aWRJbnRlbFNjb3BlLFxyXG4gICAgICAgICAgICAkcm9vdFNjb3BlOiBNb2RlbC5JRFhMaXF1aWRJbnRlbFNjb3BlLFxyXG4gICAgICAgICAgICBhZGFsQXV0aGVudGljYXRpb25TZXJ2aWNlLFxyXG4gICAgICAgICAgICAkbG9jYXRpb246IG5nLklMb2NhdGlvblNlcnZpY2UsXHJcbiAgICAgICAgICAgICRyb3V0ZTogbmcucm91dGUuSVJvdXRlU2VydmljZSxcclxuICAgICAgICAgICAgdXNlclNlcnZpY2U6IFNlcnZpY2UuVXNlclNlcnZpY2UsXHJcbiAgICAgICAgICAgIHByb3RlY3RlZCB1bnRhcHBkU2VydmljZTogU2VydmljZS5VbnRhcHBkQXBpU2VydmljZSkge1xyXG5cclxuICAgICAgICAgICAgc3VwZXIoJHNjb3BlLCAkcm9vdFNjb3BlLCBhZGFsQXV0aGVudGljYXRpb25TZXJ2aWNlLCAkbG9jYXRpb24sIHVzZXJTZXJ2aWNlLCBhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFRpdGxlRm9yUm91dGUoJHJvdXRlLmN1cnJlbnQpO1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLmJ1dHRvbkJhckJ1dHRvbnMgPSBbXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IE1vZGVsLkJ1dHRvbkJhckJ1dHRvbihcIkNvbW1pdFwiLCAkc2NvcGUsIFwidXNlckZvcm0uJHZhbGlkICYmICF1cGRhdGVJblByb2dyZXNzXCIsICgpID0+IHRoaXMudXBkYXRlKCksIHRydWUpLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBNb2RlbC5CdXR0b25CYXJCdXR0b24oXCJSZXZlcnRcIiwgJHNjb3BlLCBcIiF1cGRhdGVJblByb2dyZXNzXCIsICgpID0+IHRoaXMucG9wdWxhdGUoKSwgZmFsc2UpXHJcbiAgICAgICAgICAgICAgICBdO1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLnVudGFwcGRBdXRoZW50aWNhdGlvblVyaSA9IGF3YWl0IHVudGFwcGRTZXJ2aWNlLmdldFVudGFwcGRBdXRoVXJpKCRsb2NhdGlvbi5hYnNVcmwoKSk7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuZGlzY29ubmVjdFVudGFwcGRVc2VyID0gKCkgPT4gdGhpcy5kaXNjb25uZWN0VXNlcigpO1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLnVwZGF0ZVVzZXJJbmZvID0gKCkgPT4gdGhpcy51cGRhdGUoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMucG9wdWxhdGUoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIGFzeW5jIHBvcHVsYXRlKCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRVcGRhdGVTdGF0ZSh0cnVlKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuJHNjb3BlLmxvYWRpbmdNZXNzYWdlID0gXCJSZXRyaWV2aW5nIHVzZXIgaW5mb3JtYXRpb24uLi5cIjtcclxuICAgICAgICAgICAgICAgIHRoaXMuJHNjb3BlLmVycm9yID0gXCJcIjtcclxuICAgICAgICAgICAgICAgIGxldCB1c2VySW5mbyA9IGF3YWl0IHRoaXMudXNlclNlcnZpY2UuZ2V0VXNlckluZm8odGhpcy4kc2NvcGUudXNlckluZm8udXNlck5hbWUpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kc2NvcGUuc3lzdGVtVXNlckluZm8gPSB1c2VySW5mbztcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLiRyb290U2NvcGUudW50YXBwZWRQb3N0QmFja1Rva2VuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy4kc2NvcGUuc3lzdGVtVXNlckluZm8uVW50YXBwZEFjY2Vzc1Rva2VuID0gdGhpcy4kcm9vdFNjb3BlLnVudGFwcGVkUG9zdEJhY2tUb2tlbjtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLiRyb290U2NvcGUudW50YXBwZWRQb3N0QmFja1Rva2VuID0gJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHVudGFwcGRVc2VyUmVzcG9uc2UgPSBhd2FpdCB0aGlzLnVudGFwcGRTZXJ2aWNlLmdldFVzZXJJbmZvKHRoaXMuJHNjb3BlLnN5c3RlbVVzZXJJbmZvLlVudGFwcGRBY2Nlc3NUb2tlbik7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHVudGFwcGRVc2VySW5mbyA9IHVudGFwcGRVc2VyUmVzcG9uc2UucmVzcG9uc2UudXNlcjtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLiRzY29wZS5zeXN0ZW1Vc2VySW5mby5VbnRhcHBkVXNlck5hbWUgPSB1bnRhcHBkVXNlckluZm8udXNlcl9uYW1lO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIElmIFVudGFwcGQgaGFzIGEgdXNlciBpbWFnZSwgZm9yY2UgdGhpcyB0byBiZSBvdXIgaW1hZ2VcclxuICAgICAgICAgICAgICAgICAgICBpZiAodW50YXBwZFVzZXJJbmZvLnVzZXJfYXZhdGFyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuJHNjb3BlLnN5c3RlbVVzZXJJbmZvLlRodW1ibmFpbEltYWdlVXJpID0gdW50YXBwZFVzZXJJbmZvLnVzZXJfYXZhdGFyOyBcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFVwZGF0ZVN0YXRlKGZhbHNlKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuJHNjb3BlLmxvYWRpbmdNZXNzYWdlID0gXCJcIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXRjaCAoZXgpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0RXJyb3IodHJ1ZSwgZXguZGF0YSB8fCBleC5zdGF0dXNUZXh0LCBleC5oZWFkZXJzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBhc3luYyB1cGRhdGUoKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRzY29wZS5sb2FkaW5nTWVzc2FnZSA9IFwiU2F2aW5nIHVzZXIgaW5mb3JtYXRpb24uLi5cIjtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0VXBkYXRlU3RhdGUodHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICBsZXQgdXNlckluZm8gPSBhd2FpdCB0aGlzLnVzZXJTZXJ2aWNlLnVwZGF0ZVVzZXJJbmZvKHRoaXMuJHNjb3BlLnVzZXJJbmZvLnVzZXJOYW1lLCB0aGlzLiRzY29wZS5zeXN0ZW1Vc2VySW5mbyk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRzY29wZS5zeXN0ZW1Vc2VySW5mbyA9IHVzZXJJbmZvO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRVcGRhdGVTdGF0ZShmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRzY29wZS5sb2FkaW5nTWVzc2FnZSA9IFwiXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2F0Y2ggKGV4KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldEVycm9yKHRydWUsIGV4LmRhdGEgfHwgZXguc3RhdHVzVGV4dCwgZXguaGVhZGVycyk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFVwZGF0ZVN0YXRlKGZhbHNlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBkaXNjb25uZWN0VXNlcigpOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy4kc2NvcGUuc3lzdGVtVXNlckluZm8uVW50YXBwZFVzZXJOYW1lID0gJyc7XHJcbiAgICAgICAgICAgIHRoaXMuJHNjb3BlLnN5c3RlbVVzZXJJbmZvLlVudGFwcGRBY2Nlc3NUb2tlbiA9ICcnO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSAiLCIvLyAgICAgQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uICBBbGwgcmlnaHRzIHJlc2VydmVkLlxyXG5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL3JlZmVyZW5jZXMvaW5kZXguZC50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL0NvbnRyb2xsZXJCYXNlLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL1NlcnZpY2UvVW50YXBwZEFwaVNlcnZpY2UudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vU2VydmljZS9Wb3RlU2VydmljZS50c1wiIC8+XHJcblxyXG5tb2R1bGUgRFhMaXF1aWRJbnRlbC5BcHAuQ29udHJvbGxlciB7XHJcblxyXG4gICAgZXhwb3J0IGNsYXNzIFZvdGVCZWVyQ29udHJvbGxlciBleHRlbmRzIENvbnRyb2xsZXJCYXNlIHtcclxuICAgICAgICBzdGF0aWMgJGluamVjdCA9IFsnJHNjb3BlJywgJyRyb290U2NvcGUnLCAnYWRhbEF1dGhlbnRpY2F0aW9uU2VydmljZScsICckbG9jYXRpb24nLCAnJHJvdXRlJywgJ3VzZXJTZXJ2aWNlJywgJ3VudGFwcGRTZXJ2aWNlJywgJ3ZvdGVTZXJ2aWNlJ107XHJcblxyXG4gICAgICAgIGNvbnN0cnVjdG9yKCRzY29wZTogTW9kZWwuSURYTGlxdWlkSW50ZWxTY29wZSxcclxuICAgICAgICAgICAgJHJvb3RTY29wZTogTW9kZWwuSURYTGlxdWlkSW50ZWxTY29wZSxcclxuICAgICAgICAgICAgYWRhbEF1dGhlbnRpY2F0aW9uU2VydmljZSxcclxuICAgICAgICAgICAgJGxvY2F0aW9uOiBuZy5JTG9jYXRpb25TZXJ2aWNlLFxyXG4gICAgICAgICAgICAkcm91dGU6IG5nLnJvdXRlLklSb3V0ZVNlcnZpY2UsXHJcbiAgICAgICAgICAgIHVzZXJTZXJ2aWNlOiBTZXJ2aWNlLlVzZXJTZXJ2aWNlLFxyXG4gICAgICAgICAgICBwcm90ZWN0ZWQgdW50YXBwZFNlcnZpY2U6IFNlcnZpY2UuVW50YXBwZEFwaVNlcnZpY2UsXHJcbiAgICAgICAgICAgIHByb3RlY3RlZCB2b3RlU2VydmljZTogU2VydmljZS5Wb3RlU2VydmljZSkge1xyXG5cclxuICAgICAgICAgICAgc3VwZXIoJHNjb3BlLCAkcm9vdFNjb3BlLCBhZGFsQXV0aGVudGljYXRpb25TZXJ2aWNlLCAkbG9jYXRpb24sIHVzZXJTZXJ2aWNlLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFRpdGxlRm9yUm91dGUoJHJvdXRlLmN1cnJlbnQpO1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLmJ1dHRvbkJhckJ1dHRvbnMgPSBbXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IE1vZGVsLkJ1dHRvbkJhckJ1dHRvbihcIkNvbW1pdFwiLCAkc2NvcGUsIFwidm90ZUZvcm0uJHZhbGlkICYmIHZvdGVGb3JtLiRkaXJ0eSAmJiAhdXBkYXRlSW5Qcm9ncmVzc1wiLCAoKSA9PiB0aGlzLnVwZGF0ZSgpLCB0cnVlKSxcclxuICAgICAgICAgICAgICAgICAgICBuZXcgTW9kZWwuQnV0dG9uQmFyQnV0dG9uKFwiUmV2ZXJ0XCIsICRzY29wZSwgXCIhdXBkYXRlSW5Qcm9ncmVzc1wiLCAoKSA9PiB0aGlzLnBvcHVsYXRlKCksIGZhbHNlKVxyXG4gICAgICAgICAgICAgICAgXTtcclxuICAgICAgICAgICAgICAgICRzY29wZS5zZWFyY2hCZWVycyA9IChzZWFyY2hUZXJtOiBzdHJpbmcpID0+IHRoaXMuc2VhcmNoQmVlcnMoc2VhcmNoVGVybSk7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUudXBkYXRlVm90ZXMgPSAoKSA9PiB0aGlzLnVwZGF0ZSgpO1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLmNsZWFyVm90ZSA9ICh2b3RlKSA9PiB0aGlzLnJlc2V0Vm90ZSh2b3RlKTtcclxuICAgICAgICAgICAgICAgIHRoaXMucG9wdWxhdGUoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHNlYXJjaEJlZXJzKHNlYXJjaFRlcm06IHN0cmluZyk6IFByb21pc2VMaWtlPGFueT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy51bnRhcHBkU2VydmljZS5zZWFyY2hCZWVycyhzZWFyY2hUZXJtKVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oKHJlc3ApID0+IHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzcC5yZXNwb25zZS5iZWVycy5pdGVtcy5tYXAoKGJlZXIpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVudGFwcGRJZDogYmVlci5iZWVyLmJpZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGJlZXIuYmVlci5iZWVyX25hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpYnU6IGJlZXIuYmVlci5iZWVyX2lidSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFidjogYmVlci5iZWVyLmJlZXJfYWJ2LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IGJlZXIuYmVlci5iZWVyX2Rlc2NyaXB0aW9uLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJld2VyeTogYmVlci5icmV3ZXJ5LmJyZXdlcnlfbmFtZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlOiBiZWVyLmJlZXIuYmVlcl9sYWJlbFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIChyZWplY3QpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gXCJBbiBlcnJvciBvY2N1cmVkXCI7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgbm9ybWFsaXplVm90ZXNBcnJheShzb3VyY2VWb3RlczogTW9kZWwuVm90ZVtdKTogTW9kZWwuVm90ZVtdIHtcclxuICAgICAgICAgICAgd2hpbGUgKHNvdXJjZVZvdGVzLmxlbmd0aCA8IDIpIHtcclxuICAgICAgICAgICAgICAgIHNvdXJjZVZvdGVzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgIFZvdGVJZDogMCxcclxuICAgICAgICAgICAgICAgICAgICBQZXJzb25uZWxOdW1iZXI6IHRoaXMuJHNjb3BlLnN5c3RlbVVzZXJJbmZvLlBlcnNvbm5lbE51bWJlcixcclxuICAgICAgICAgICAgICAgICAgICBWb3RlRGF0ZTogbmV3IERhdGUoKSxcclxuICAgICAgICAgICAgICAgICAgICBVbnRhcHBkSWQ6IDBcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHNvdXJjZVZvdGVzLmZvckVhY2goKHZvdGUpID0+IHtcclxuICAgICAgICAgICAgICAgIHZvdGUuQmVlckluZm8gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdW50YXBwZElkOiB2b3RlLlVudGFwcGRJZCxcclxuICAgICAgICAgICAgICAgICAgICBuYW1lOiB2b3RlLkJlZXJOYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgIGJyZXdlcnk6IHZvdGUuQnJld2VyeVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgcmV0dXJuIHNvdXJjZVZvdGVzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBhc3luYyBwb3B1bGF0ZSgpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0VXBkYXRlU3RhdGUodHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRzY29wZS5sb2FkaW5nTWVzc2FnZSA9IFwiUmV0cmlldmluZyBwcmV2aW91cyB2b3Rlcy4uLlwiO1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kc2NvcGUuZXJyb3IgPSBcIlwiO1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kc2NvcGUudm90ZXMgPSB0aGlzLm5vcm1hbGl6ZVZvdGVzQXJyYXkoYXdhaXQgdGhpcy52b3RlU2VydmljZS5nZXRVc2VyVm90ZXModGhpcy4kc2NvcGUuc3lzdGVtVXNlckluZm8uUGVyc29ubmVsTnVtYmVyKSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFVwZGF0ZVN0YXRlKGZhbHNlKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuJHNjb3BlLmxvYWRpbmdNZXNzYWdlID0gXCJcIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXRjaCAoZXgpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0RXJyb3IodHJ1ZSwgZXguZGF0YSB8fCBleC5zdGF0dXNUZXh0LCBleC5oZWFkZXJzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSByZXNldFZvdGUodm90ZTogTW9kZWwuVm90ZSkge1xyXG4gICAgICAgICAgICAvLyBEb24ndCByZXNldCB0aGUgdm90ZSBpZCBhcyB3ZSBuZWVkIHRvIGRldGVjdCBpZiB0aGlzIGlzIGEgZGVsZXRlXHJcbiAgICAgICAgICAgIHZvdGUuUGVyc29ubmVsTnVtYmVyID0gdGhpcy4kc2NvcGUuc3lzdGVtVXNlckluZm8uUGVyc29ubmVsTnVtYmVyO1xyXG4gICAgICAgICAgICB2b3RlLlZvdGVEYXRlID0gbmV3IERhdGUoKTtcclxuICAgICAgICAgICAgdm90ZS5VbnRhcHBkSWQgPSAwO1xyXG4gICAgICAgICAgICB2b3RlLkJlZXJOYW1lID0gJyc7XHJcbiAgICAgICAgICAgIHZvdGUuQnJld2VyeSA9ICcnO1xyXG4gICAgICAgICAgICB2b3RlLkJlZXJJbmZvID0gbnVsbDtcclxuICAgICAgICAgICAgdGhpcy4kc2NvcGUudm90ZUZvcm0uJHNldERpcnR5KCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIGFzeW5jIHVwZGF0ZSgpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuJHNjb3BlLmxvYWRpbmdNZXNzYWdlID0gXCJTYXZpbmcgdm90ZXMuLi5cIjtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0VXBkYXRlU3RhdGUodHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRzY29wZS52b3Rlcy5mb3JFYWNoKCh2b3RlOiBNb2RlbC5Wb3RlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHZvdGUuQmVlckluZm8pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdm90ZS5VbnRhcHBkSWQgPSB2b3RlLkJlZXJJbmZvLnVudGFwcGRJZDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdm90ZS5CZWVyTmFtZSA9IHZvdGUuQmVlckluZm8ubmFtZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdm90ZS5CcmV3ZXJ5ID0gdm90ZS5CZWVySW5mby5icmV3ZXJ5O1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kc2NvcGUudm90ZXMgPSB0aGlzLm5vcm1hbGl6ZVZvdGVzQXJyYXkoYXdhaXQgdGhpcy52b3RlU2VydmljZS51cGRhdGVVc2VyVm90ZXModGhpcy4kc2NvcGUuc3lzdGVtVXNlckluZm8uUGVyc29ubmVsTnVtYmVyLCB0aGlzLiRzY29wZS52b3RlcykpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kc2NvcGUudm90ZUZvcm0uJHNldFByaXN0aW5lKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFVwZGF0ZVN0YXRlKGZhbHNlKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuJHNjb3BlLmVycm9yID0gXCJcIjtcclxuICAgICAgICAgICAgICAgIHRoaXMuJHNjb3BlLmxvYWRpbmdNZXNzYWdlID0gXCJcIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXRjaCAoZXgpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0RXJyb3IodHJ1ZSwgZXguZGF0YSB8fCBleC5zdGF0dXNUZXh0LCBleC5oZWFkZXJzKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0VXBkYXRlU3RhdGUoZmFsc2UpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59ICIsIi8vICAgICBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gIEFsbCByaWdodHMgcmVzZXJ2ZWQuXHJcblxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vcmVmZXJlbmNlcy9pbmRleC5kLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vQ29udHJvbGxlckJhc2UudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vU2VydmljZS9VbnRhcHBkQXBpU2VydmljZS50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9TZXJ2aWNlL1ZvdGVTZXJ2aWNlLnRzXCIgLz5cclxuXHJcbm1vZHVsZSBEWExpcXVpZEludGVsLkFwcC5Db250cm9sbGVyIHtcclxuXHJcbiAgICBleHBvcnQgY2xhc3MgVm90ZVJlc3VsdHNDb250cm9sbGVyIGV4dGVuZHMgQ29udHJvbGxlckJhc2Uge1xyXG4gICAgICAgIHN0YXRpYyAkaW5qZWN0ID0gWyckc2NvcGUnLCAnJHJvb3RTY29wZScsICdhZGFsQXV0aGVudGljYXRpb25TZXJ2aWNlJywgJyRsb2NhdGlvbicsICckcm91dGUnLCAndXNlclNlcnZpY2UnLCAndW50YXBwZFNlcnZpY2UnLCAndm90ZVNlcnZpY2UnXTtcclxuXHJcbiAgICAgICAgY29uc3RydWN0b3IoJHNjb3BlOiBNb2RlbC5JRFhMaXF1aWRJbnRlbFNjb3BlLFxyXG4gICAgICAgICAgICAkcm9vdFNjb3BlOiBNb2RlbC5JRFhMaXF1aWRJbnRlbFNjb3BlLFxyXG4gICAgICAgICAgICBhZGFsQXV0aGVudGljYXRpb25TZXJ2aWNlLFxyXG4gICAgICAgICAgICAkbG9jYXRpb246IG5nLklMb2NhdGlvblNlcnZpY2UsXHJcbiAgICAgICAgICAgICRyb3V0ZTogbmcucm91dGUuSVJvdXRlU2VydmljZSxcclxuICAgICAgICAgICAgdXNlclNlcnZpY2U6IFNlcnZpY2UuVXNlclNlcnZpY2UsXHJcbiAgICAgICAgICAgIHByb3RlY3RlZCB1bnRhcHBkU2VydmljZTogU2VydmljZS5VbnRhcHBkQXBpU2VydmljZSxcclxuICAgICAgICAgICAgcHJvdGVjdGVkIHZvdGVTZXJ2aWNlOiBTZXJ2aWNlLlZvdGVTZXJ2aWNlKSB7XHJcblxyXG4gICAgICAgICAgICBzdXBlcigkc2NvcGUsICRyb290U2NvcGUsIGFkYWxBdXRoZW50aWNhdGlvblNlcnZpY2UsICRsb2NhdGlvbiwgdXNlclNlcnZpY2UsICgpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0VGl0bGVGb3JSb3V0ZSgkcm91dGUuY3VycmVudCk7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuYnV0dG9uQmFyQnV0dG9ucyA9IFtdO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wb3B1bGF0ZSgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgYXN5bmMgcG9wdWxhdGUoKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFVwZGF0ZVN0YXRlKHRydWUpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kc2NvcGUubG9hZGluZ01lc3NhZ2UgPSBcIlJldHJpZXZpbmcgY3VycmVudCB2b3RlIHRhbGxpZXMuLi5cIjtcclxuICAgICAgICAgICAgICAgIHRoaXMuJHNjb3BlLmVycm9yID0gXCJcIjtcclxuICAgICAgICAgICAgICAgIGxldCB2b3Rlc1RhbGx5ID0gYXdhaXQgdGhpcy52b3RlU2VydmljZS5nZXRWb3RlVGFsbHkoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuJHNjb3BlLnZvdGVzVGFsbHkgPSB2b3Rlc1RhbGx5O1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kc2NvcGUubG9hZGluZ01lc3NhZ2UgPSBcIlwiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhdGNoIChleCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRFcnJvcih0cnVlLCBleC5kYXRhIHx8IGV4LnN0YXR1c1RleHQsIGV4LmhlYWRlcnMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59ICIsIi8vICAgICBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gIEFsbCByaWdodHMgcmVzZXJ2ZWQuXHJcblxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vcmVmZXJlbmNlcy9pbmRleC5kLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vQ29udHJvbGxlckJhc2UudHNcIiAvPlxyXG5cclxubW9kdWxlIERYTGlxdWlkSW50ZWwuQXBwLkNvbnRyb2xsZXIge1xyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBBbmFseXRpY3NDb250cm9sbGVyIGV4dGVuZHMgQ29udHJvbGxlckJhc2Uge1xyXG4gICAgICAgIHN0YXRpYyAkaW5qZWN0ID0gWyckc2NvcGUnLCAnJHJvb3RTY29wZScsICdhZGFsQXV0aGVudGljYXRpb25TZXJ2aWNlJywgJyRsb2NhdGlvbicsICckcm91dGUnLCAndXNlclNlcnZpY2UnXTtcclxuXHJcbiAgICAgICAgY29uc3RydWN0b3IoJHNjb3BlOiBNb2RlbC5JRFhMaXF1aWRJbnRlbFNjb3BlLFxyXG4gICAgICAgICAgICAkcm9vdFNjb3BlOiBNb2RlbC5JRFhMaXF1aWRJbnRlbFNjb3BlLFxyXG4gICAgICAgICAgICBhZGFsQXV0aGVudGljYXRpb25TZXJ2aWNlLFxyXG4gICAgICAgICAgICAkbG9jYXRpb246IG5nLklMb2NhdGlvblNlcnZpY2UsXHJcbiAgICAgICAgICAgICRyb3V0ZTogbmcucm91dGUuSVJvdXRlU2VydmljZSxcclxuICAgICAgICAgICAgdXNlclNlcnZpY2U6IFNlcnZpY2UuVXNlclNlcnZpY2UpIHtcclxuXHJcbiAgICAgICAgICAgIHN1cGVyKCRzY29wZSwgJHJvb3RTY29wZSwgYWRhbEF1dGhlbnRpY2F0aW9uU2VydmljZSwgJGxvY2F0aW9uLCB1c2VyU2VydmljZSwgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRUaXRsZUZvclJvdXRlKCRyb3V0ZS5jdXJyZW50KTtcclxuICAgICAgICAgICAgICAgICRzY29wZS5idXR0b25CYXJCdXR0b25zID0gW107XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBvcHVsYXRlKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBhc3luYyBwb3B1bGF0ZSgpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0VXBkYXRlU3RhdGUodHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRzY29wZS5sb2FkaW5nTWVzc2FnZSA9IFwiUmV0cmlldmluZyBiZWVyIGFuYWx5dGljcy4uLlwiO1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kc2NvcGUuZXJyb3IgPSBcIlwiO1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kc2NvcGUubG9hZGluZ01lc3NhZ2UgPSBcIlwiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhdGNoIChleCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRFcnJvcih0cnVlLCBleC5kYXRhIHx8IGV4LnN0YXR1c1RleHQsIGV4LmhlYWRlcnMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59ICIsIi8vICAgICBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gIEFsbCByaWdodHMgcmVzZXJ2ZWQuXHJcblxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vcmVmZXJlbmNlcy9pbmRleC5kLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vQ29udHJvbGxlckJhc2UudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vU2VydmljZS9Vc2VyU2VydmljZS50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9TZXJ2aWNlL0Rhc2hib2FyZFNlcnZpY2UudHNcIiAvPlxyXG5cclxubW9kdWxlIERYTGlxdWlkSW50ZWwuQXBwLkNvbnRyb2xsZXIge1xyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBIb21lQ29udHJvbGxlciBleHRlbmRzIENvbnRyb2xsZXJCYXNlIHtcclxuICAgICAgICBzdGF0aWMgJGluamVjdCA9IFsnJHNjb3BlJywgJyRyb290U2NvcGUnLCAnYWRhbEF1dGhlbnRpY2F0aW9uU2VydmljZScsICckbG9jYXRpb24nLCAnJHJvdXRlJywgJ3VzZXJTZXJ2aWNlJywgJ2Rhc2hib2FyZFNlcnZpY2UnLCAnJGludGVydmFsJ107XHJcblxyXG4gICAgICAgIGNvbnN0cnVjdG9yKCRzY29wZTogTW9kZWwuSURYTGlxdWlkSW50ZWxTY29wZSxcclxuICAgICAgICAgICAgJHJvb3RTY29wZTogTW9kZWwuSURYTGlxdWlkSW50ZWxTY29wZSxcclxuICAgICAgICAgICAgYWRhbEF1dGhlbnRpY2F0aW9uU2VydmljZSxcclxuICAgICAgICAgICAgJGxvY2F0aW9uOiBuZy5JTG9jYXRpb25TZXJ2aWNlLFxyXG4gICAgICAgICAgICAkcm91dGU6IG5nLnJvdXRlLklSb3V0ZVNlcnZpY2UsXHJcbiAgICAgICAgICAgIHVzZXJTZXJ2aWNlOiBTZXJ2aWNlLlVzZXJTZXJ2aWNlLFxyXG4gICAgICAgICAgICBwcm90ZWN0ZWQgZGFzaGJvYXJkU2VydmljZTogU2VydmljZS5EYXNoYm9hcmRTZXJ2aWNlLFxyXG4gICAgICAgICAgICAkaW50ZXJ2YWw6IG5nLklJbnRlcnZhbFNlcnZpY2UpIHtcclxuXHJcbiAgICAgICAgICAgIHN1cGVyKCRzY29wZSwgJHJvb3RTY29wZSwgYWRhbEF1dGhlbnRpY2F0aW9uU2VydmljZSwgJGxvY2F0aW9uLCB1c2VyU2VydmljZSwgKCkgPT4ge1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0VGl0bGVGb3JSb3V0ZSgkcm91dGUuY3VycmVudCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBvcHVsYXRlKCk7XHJcbiAgICAgICAgICAgICAgICB2YXIgaW50ZXJ2YWxQcm9taXNlID0gJGludGVydmFsKCgpID0+IHRoaXMucG9wdWxhdGUoKSwgNTAwMCk7ICAgICAgXHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuJG9uKCckZGVzdHJveScsICgpID0+ICRpbnRlcnZhbC5jYW5jZWwoaW50ZXJ2YWxQcm9taXNlKSk7ICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByb3RlY3RlZCBhc3luYyBwb3B1bGF0ZSgpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICAgICAgdGhpcy4kc2NvcGUuY3VycmVudFRhcHMgPSBhd2FpdCB0aGlzLmRhc2hib2FyZFNlcnZpY2UuZ2V0S2VnU3RhdHVzKCk7XHJcbiAgICAgICAgICAgIHRoaXMuJHNjb3BlLmN1cnJlbnRBY3Rpdml0aWVzID0gYXdhaXQgdGhpcy5kYXNoYm9hcmRTZXJ2aWNlLmdldExhdGVzdEFjdGl2aXRpZXMoMjUpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSAiLCIvLyAgICAgQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uICBBbGwgcmlnaHRzIHJlc2VydmVkLlxyXG5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vcmVmZXJlbmNlcy9pbmRleC5kLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vU2VydmljZS9Vc2VyU2VydmljZS50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL1NlcnZpY2UvVm90ZVNlcnZpY2UudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9TZXJ2aWNlL0Rhc2hib2FyZFNlcnZpY2UudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9Db250cm9sbGVyL1VzZXJDb250cm9sbGVyLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vQ29udHJvbGxlci9Wb3RlQmVlckNvbnRyb2xsZXIudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9Db250cm9sbGVyL1ZvdGVSZXN1bHRzQ29udHJvbGxlci50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL0NvbnRyb2xsZXIvQW5hbHl0aWNzQ29udHJvbGxlci50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL0NvbnRyb2xsZXIvSG9tZUNvbnRyb2xsZXIudHNcIiAvPlxyXG5cclxubW9kdWxlIERYTGlxdWlkSW50ZWwuQXBwIHtcclxuXHJcbiAgICBleHBvcnQgY2xhc3MgQXBwQnVpbGRlciB7XHJcblxyXG4gICAgICAgIHByaXZhdGUgYXBwOiBuZy5JTW9kdWxlO1xyXG5cclxuICAgICAgICBjb25zdHJ1Y3RvcihuYW1lOiBzdHJpbmcpIHtcclxuICAgICAgICAgICAgdGhpcy5hcHAgPSBhbmd1bGFyLm1vZHVsZShuYW1lLCBbXHJcbiAgICAgICAgICAgICAgICAvLyBBbmd1bGFyIG1vZHVsZXMgXHJcbiAgICAgICAgICAgICAgICBcIm5nUm91dGVcIixcclxuICAgICAgICAgICAgICAgIFwibmdSZXNvdXJjZVwiLFxyXG4gICAgICAgICAgICAgICAgXCJ1aS5ib290c3RyYXBcIixcclxuICAgICAgICAgICAgICAgIFwiZW52aXJvbm1lbnRcIixcclxuICAgICAgICAgICAgICAgIC8vIEFEQUxcclxuICAgICAgICAgICAgICAgICdBZGFsQW5ndWxhcidcclxuICAgICAgICAgICAgXSk7XHJcbiAgICAgICAgICAgIHRoaXMuYXBwLmNvbmZpZyhbJyRyb3V0ZVByb3ZpZGVyJywgJyRodHRwUHJvdmlkZXInLCAnYWRhbEF1dGhlbnRpY2F0aW9uU2VydmljZVByb3ZpZGVyJywgJ2VudlNlcnZpY2VQcm92aWRlcicsXHJcbiAgICAgICAgICAgICAgICAoJHJvdXRlUHJvdmlkZXI6IG5nLnJvdXRlLklSb3V0ZVByb3ZpZGVyLCAkaHR0cFByb3ZpZGVyOiBuZy5JSHR0cFByb3ZpZGVyLCBhZGFsUHJvdmlkZXIsIGVudlNlcnZpY2VQcm92aWRlcjogYW5ndWxhci5lbnZpcm9ubWVudC5TZXJ2aWNlUHJvdmlkZXIpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBlbnZTZXJ2aWNlUHJvdmlkZXIuY29uZmlnKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZG9tYWluczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGV2ZWxvcG1lbnQ6IFsnbG9jYWxob3N0J10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcGU6IFsnZHgtbGlxdWlkYXBwLXN0YWdpbmcuYXp1cmV3ZWJzaXRlcy5uZXQnXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb2R1Y3Rpb246IFsnZHgtbGlxdWlkYXBwLmF6dXJld2Vic2l0ZXMubmV0J11cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGV2ZWxvcG1lbnQ6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcGlVcmk6ICcvL2xvY2FsaG9zdDo4MDgwL2FwaScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVuYW50OiAnbWljcm9zb2Z0LmNvbScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwQ2xpZW50SWQ6ICczNWEzM2NmYy1mYzUyLTQ4Y2YtOTBmNC0yM2FkNjllZjg1YmMnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwaUNsaWVudElkOiAnYjFlODA3NDgtNDNjMi00NDUwLTkxMjEtY2JjMGRjYzk4MDUxJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcGlVc2VybmFtZTogJzAwMDEtMDAwMScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBpUGFzc3dvcmQ6ICdaSGhzYVhGMWFXUXRjbUZ6Y0dKbGNuSjVjR2s9J1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBwZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwaVVyaTogJy8vZHhsaXF1aWRpbnRlbC1zdGFnaW5nLmF6dXJld2Vic2l0ZXMubmV0L2FwaScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVuYW50OiAnbWljcm9zb2Z0LmNvbScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwQ2xpZW50SWQ6ICczNWEzM2NmYy1mYzUyLTQ4Y2YtOTBmNC0yM2FkNjllZjg1YmMnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwaUNsaWVudElkOiAnYjFlODA3NDgtNDNjMi00NDUwLTkxMjEtY2JjMGRjYzk4MDUxJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcGlVc2VybmFtZTogJzAwMDEtMDAwMScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBpUGFzc3dvcmQ6ICdaSGhzYVhGMWFXUXRjbUZ6Y0dKbGNuSjVjR2s9J1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb2R1Y3Rpb246IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcGlVcmk6ICcvL2R4bGlxdWlkaW50ZWwuYXp1cmV3ZWJzaXRlcy5uZXQvYXBpJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW5hbnQ6ICdtaWNyb3NvZnQuY29tJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHBDbGllbnRJZDogJzM1YTMzY2ZjLWZjNTItNDhjZi05MGY0LTIzYWQ2OWVmODViYycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBpQ2xpZW50SWQ6ICdiMWU4MDc0OC00M2MyLTQ0NTAtOTEyMS1jYmMwZGNjOTgwNTEnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwaVVzZXJuYW1lOiAnMDAwMS0wMDAxJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcGlQYXNzd29yZDogJ1pIaHNhWEYxYVdRdGNtRnpjR0psY25KNWNHaz0nXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICBlbnZTZXJ2aWNlUHJvdmlkZXIuY2hlY2soKTtcclxuICAgICAgICAgICAgICAgICAgICAkcm91dGVQcm92aWRlclxyXG4gICAgICAgICAgICAgICAgICAgICAgICAud2hlbihcIi9Ib21lXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IFwiSG9tZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogQ29udHJvbGxlci5Ib21lQ29udHJvbGxlcixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBcIi92aWV3cy9ob21lLmh0bWxcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2VJbnNlbnNpdGl2ZU1hdGNoOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAud2hlbihcIi9Vc2VyXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YWRhbC5zaGFyZWQuSU5hdlJvdXRlPntcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBcIlVzZXJcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBDb250cm9sbGVyLlVzZXJDb250cm9sbGVyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBcIi9WaWV3cy9Vc2VyLmh0bWxcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXF1aXJlQURMb2dpbjogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlSW5zZW5zaXRpdmVNYXRjaDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgLndoZW4oXCIvVm90ZUJlZXJcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxhZGFsLnNoYXJlZC5JTmF2Um91dGU+e1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IFwiVm90ZUJlZXJcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBDb250cm9sbGVyLlZvdGVCZWVyQ29udHJvbGxlcixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogXCIvVmlld3MvVm90ZUJlZXIuaHRtbFwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcXVpcmVBRExvZ2luOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2VJbnNlbnNpdGl2ZU1hdGNoOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAud2hlbihcIi9Wb3RlUmVzdWx0c1wiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGFkYWwuc2hhcmVkLklOYXZSb3V0ZT57XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogXCJWb3RlUmVzdWx0c1wiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6IENvbnRyb2xsZXIuVm90ZVJlc3VsdHNDb250cm9sbGVyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBcIi9WaWV3cy9Wb3RlUmVzdWx0cy5odG1sXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVxdWlyZUFETG9naW46IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZUluc2Vuc2l0aXZlTWF0Y2g6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC53aGVuKFwiL0FuYWx5dGljc1wiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGFkYWwuc2hhcmVkLklOYXZSb3V0ZT57XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogXCJBbmFseXRpY3NcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBDb250cm9sbGVyLkFuYWx5dGljc0NvbnRyb2xsZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6IFwiL1ZpZXdzL0FuYWx5dGljcy5odG1sXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVxdWlyZUFETG9naW46IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZUluc2Vuc2l0aXZlTWF0Y2g6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5vdGhlcndpc2UoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlZGlyZWN0VG86IFwiL0hvbWVcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAvLyBDb25maWd1cmUgQURBTC5cclxuICAgICAgICAgICAgICAgICAgICB2YXIgYWRhbENvbmZpZyA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGVuYW50OiBlbnZTZXJ2aWNlUHJvdmlkZXIucmVhZCgndGVuYW50JyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsaWVudElkOiBlbnZTZXJ2aWNlUHJvdmlkZXIucmVhZCgnYXBwQ2xpZW50SWQnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FjaGVMb2NhdGlvbjogd2luZG93LmxvY2F0aW9uLmhvc3RuYW1lID09PSBcImxvY2FsaG9zdFwiID8gXCJsb2NhbFN0b3JhZ2VcIiA6IFwiXCIsIC8vIGVuYWJsZSB0aGlzIGZvciBJRSwgYXMgc2Vzc2lvblN0b3JhZ2UgZG9lcyBub3Qgd29yayBmb3IgbG9jYWxob3N0LlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbmRwb2ludHM6IHt9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhbm9ueW1vdXNFbmRwb2ludHM6IFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVudlNlcnZpY2VQcm92aWRlci5yZWFkKCdhcGlVcmknKSArICcvQ3VycmVudEtlZycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbnZTZXJ2aWNlUHJvdmlkZXIucmVhZCgnYXBpVXJpJykgKyAnL2FjdGl2aXR5J1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICBhZGFsQ29uZmlnLmVuZHBvaW50c1tlbnZTZXJ2aWNlUHJvdmlkZXIucmVhZCgnYXBpVXJpJyldID0gZW52U2VydmljZVByb3ZpZGVyLnJlYWQoJ2FwaUNsaWVudElkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgYWRhbFByb3ZpZGVyLmluaXQoYWRhbENvbmZpZywgJGh0dHBQcm92aWRlcik7XHJcbiAgICAgICAgICAgICAgICB9XSk7XHJcbiAgICAgICAgICAgIHRoaXMuYXBwLnNlcnZpY2UoJ2NvbmZpZ1NlcnZpY2UnLCBTZXJ2aWNlLkNvbmZpZ1NlcnZpY2UpO1xyXG4gICAgICAgICAgICB0aGlzLmFwcC5zZXJ2aWNlKCd1c2VyU2VydmljZScsIFNlcnZpY2UuVXNlclNlcnZpY2UpO1xyXG4gICAgICAgICAgICB0aGlzLmFwcC5zZXJ2aWNlKCd1bnRhcHBkU2VydmljZScsIFNlcnZpY2UuVW50YXBwZEFwaVNlcnZpY2UpO1xyXG4gICAgICAgICAgICB0aGlzLmFwcC5zZXJ2aWNlKCd2b3RlU2VydmljZScsIFNlcnZpY2UuVm90ZVNlcnZpY2UpO1xyXG4gICAgICAgICAgICB0aGlzLmFwcC5zZXJ2aWNlKCdkYXNoYm9hcmRTZXJ2aWNlJywgU2VydmljZS5EYXNoYm9hcmRTZXJ2aWNlKTtcclxuICAgICAgICAgICAgdGhpcy5hcHAucnVuKFsnJHdpbmRvdycsICckcScsICckbG9jYXRpb24nLCAnJHJvdXRlJywgJyRyb290U2NvcGUnLCAoJHdpbmRvdywgJHEsICRsb2NhdGlvbiwgJHJvdXRlLCAkcm9vdFNjb3BlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvLyBNYWtlIGFuZ3VsYXIncyBwcm9taXNlcyB0aGUgZGVmYXVsdCBhcyB0aGF0IHdpbGwgc3RpbGwgaW50ZWdyYXRlIHdpdGggYW5ndWxhcidzIGRpZ2VzdCBjeWNsZSBhZnRlciBhd2FpdHNcclxuICAgICAgICAgICAgICAgICR3aW5kb3cuUHJvbWlzZSA9ICRxO1xyXG4gICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kb24oJyRsb2NhdGlvbkNoYW5nZVN0YXJ0JywgKGV2ZW50LCBuZXdVcmwsIG9sZFVybCkgPT4gdGhpcy5sb2NhdGlvbkNoYW5nZUhhbmRsZXIoJHJvb3RTY29wZSwgJGxvY2F0aW9uKSk7XHJcbiAgICAgICAgICAgIH1dKTsgICAgICAgICAgICBcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgbG9jYXRpb25DaGFuZ2VIYW5kbGVyKCRyb290U2NvcGUsICRsb2NhdGlvbik6IHZvaWQge1xyXG4gICAgICAgICAgICB2YXIgaGFzaCA9ICcnO1xyXG4gICAgICAgICAgICBpZiAoJGxvY2F0aW9uLiQkaHRtbDUpIHtcclxuICAgICAgICAgICAgICAgIGhhc2ggPSAkbG9jYXRpb24uaGFzaCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaGFzaCA9ICcjJyArICRsb2NhdGlvbi5wYXRoKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gVXNlIEFEQUwgZm9yIHVybCByZXNwb25zZSBwYXJzaW5nXHJcbiAgICAgICAgICAgIHZhciBfYWRhbDogYW55ID0gbmV3IEF1dGhlbnRpY2F0aW9uQ29udGV4dCh7Y2xpZW50SWQ6Jyd9KTtcclxuICAgICAgICAgICAgaGFzaCA9IF9hZGFsLl9nZXRIYXNoKGhhc2gpO1xyXG4gICAgICAgICAgICB2YXIgcGFyYW1ldGVycyA9IF9hZGFsLl9kZXNlcmlhbGl6ZShoYXNoKTtcclxuICAgICAgICAgICAgaWYgKHBhcmFtZXRlcnMuaGFzT3duUHJvcGVydHkoJ2FjY2Vzc190b2tlbicpKSB7XHJcbiAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLnVudGFwcGVkUG9zdEJhY2tUb2tlbiA9IHBhcmFtZXRlcnNbJ2FjY2Vzc190b2tlbiddO1xyXG4gICAgICAgICAgICAgICAgJGxvY2F0aW9uLnBhdGgoJ1VzZXInKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHN0YXJ0KCk6IHZvaWQge1xyXG4gICAgICAgICAgICAkKGRvY3VtZW50KS5yZWFkeSgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiYm9vdGluZyBcIiArIHRoaXMuYXBwLm5hbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBpbmplY3RvciA9IGFuZ3VsYXIuYm9vdHN0cmFwKGRvY3VtZW50LCBbdGhpcy5hcHAubmFtZV0pO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiYm9vdGVkIGFwcDogXCIgKyBpbmplY3Rvcik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjYXRjaCAoZXgpIHtcclxuICAgICAgICAgICAgICAgICAgICAkKCcjQm9vdEV4Y2VwdGlvbkRldGFpbHMnKS50ZXh0KGV4KTtcclxuICAgICAgICAgICAgICAgICAgICAkKCcjQW5ndWxhckJvb3RFcnJvcicpLnNob3coKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiYXBwYnVpbGRlci50c1wiIC8+XHJcblxyXG5uZXcgRFhMaXF1aWRJbnRlbC5BcHAuQXBwQnVpbGRlcignZHhMaXF1aWRJbnRlbEFwcCcpLnN0YXJ0KCk7IiwiLy8gICAgIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiAgQWxsIHJpZ2h0cyByZXNlcnZlZC5cclxuXHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9yZWZlcmVuY2VzL2luZGV4LmQudHNcIiAvPlxyXG5cclxubW9kdWxlIERYTGlxdWlkSW50ZWwuQXBwLk1vZGVsIHtcclxuXHJcbiAgICBleHBvcnQgY2xhc3MgQnV0dG9uQmFyQnV0dG9uIHtcclxuICAgICAgICBjb25zdHJ1Y3RvcihwdWJsaWMgZGlzcGxheVRleHQ6IHN0cmluZyxcclxuICAgICAgICAgICAgJHNjb3BlOiBNb2RlbC5JRFhMaXF1aWRJbnRlbFNjb3BlLFxyXG4gICAgICAgICAgICBlbmFibGVkRXhwcmVzc2lvbjogc3RyaW5nLFxyXG4gICAgICAgICAgICBwdWJsaWMgZG9DbGljazogRnVuY3Rpb24sXHJcbiAgICAgICAgICAgIHB1YmxpYyBpc1N1Ym1pdDogYm9vbGVhbixcclxuICAgICAgICAgICAgcHJpdmF0ZSBpbWFnZVVybD86IHN0cmluZykge1xyXG5cclxuICAgICAgICAgICAgdGhpcy5lbmFibGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICRzY29wZS4kd2F0Y2goZW5hYmxlZEV4cHJlc3Npb24sIChuZXdWYWx1ZTogYm9vbGVhbikgPT4gdGhpcy5lbmFibGVkID0gbmV3VmFsdWUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGVuYWJsZWQ6IGJvb2xlYW47XHJcbiAgICB9XHJcbn0gIiwiLy8gICAgIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiAgQWxsIHJpZ2h0cyByZXNlcnZlZC5cclxuXHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9yZWZlcmVuY2VzL2luZGV4LmQudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiVXNlckluZm8udHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiVm90ZS50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJUYXBJbmZvLnRzXCIgLz5cclxuXHJcbm1vZHVsZSBEWExpcXVpZEludGVsLkFwcC5Nb2RlbCB7XHJcblxyXG4gICAgZXhwb3J0IGludGVyZmFjZSBJRFhMaXF1aWRJbnRlbFNjb3BlIGV4dGVuZHMgbmcuSVNjb3BlIHtcclxuICAgICAgICBzeXN0ZW1Vc2VySW5mbzogVXNlckluZm9cclxuICAgICAgICBpc0FkbWluOiBGdW5jdGlvblxyXG4gICAgICAgIHZvdGVzOiBWb3RlW11cclxuICAgICAgICB2b3Rlc1RhbGx5OiBWb3RlVGFsbHlbXVxyXG4gICAgICAgIGN1cnJlbnRUYXBzOiBUYXBJbmZvW11cclxuICAgICAgICB0aXRsZTogc3RyaW5nXHJcbiAgICAgICAgZXJyb3I6IHN0cmluZ1xyXG4gICAgICAgIGVycm9yX2NsYXNzOiBzdHJpbmdcclxuICAgICAgICBsb2FkaW5nTWVzc2FnZTogc3RyaW5nXHJcbiAgICAgICAgbG9naW46IEZ1bmN0aW9uXHJcbiAgICAgICAgbG9nb3V0OiBGdW5jdGlvblxyXG4gICAgICAgIGlzQ29udHJvbGxlckFjdGl2ZTogRnVuY3Rpb25cclxuICAgICAgICB1bnRhcHBlZFBvc3RCYWNrVG9rZW46IHN0cmluZ1xyXG4gICAgICAgIHVudGFwcGRBdXRoZW50aWNhdGlvblVyaTogc3RyaW5nXHJcbiAgICAgICAgZGlzY29ubmVjdFVudGFwcGRVc2VyOiBGdW5jdGlvblxyXG4gICAgICAgIGRlbGV0ZUFjY291bnQ6IEZ1bmN0aW9uXHJcbiAgICAgICAgZ2VuZXJhdGVTdG9yYWdlS2V5OiBGdW5jdGlvblxyXG4gICAgICAgIGFyZVVwZGF0ZXNBdmFpbGFibGU6IGJvb2xlYW5cclxuICAgICAgICB1cGRhdGVCYW5uZXJDbGFzczogc3RyaW5nXHJcbiAgICAgICAgdXBkYXRlSW5Qcm9ncmVzczogYm9vbGVhblxyXG4gICAgICAgIHVwZGF0ZU1lc3NhZ2U6IHN0cmluZ1xyXG4gICAgICAgIGdldEh0bWxEZXNjcmlwdGlvbjogRnVuY3Rpb25cclxuICAgICAgICBhcHBseVVwZGF0ZTogRnVuY3Rpb25cclxuICAgICAgICB1cGRhdGVDb25maWd1cmF0aW9uOiBGdW5jdGlvblxyXG4gICAgICAgIHVwZGF0ZVVzZXJJbmZvOiBGdW5jdGlvblxyXG4gICAgICAgIGJ1dHRvbkJhckJ1dHRvbnM6IEJ1dHRvbkJhckJ1dHRvbltdXHJcbiAgICB9XHJcbn0gXHJcblxyXG4iXX0=

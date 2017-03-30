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
//# sourceMappingURL=userapp.js.map
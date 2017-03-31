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
                searchBeers(searchTerm, accessToken) {
                    return __awaiter(this, void 0, void 0, function* () {
                        let appConfig = yield this.configService.getConfiguration();
                        var data = {
                            entity: 'search',
                            methodName: 'beer',
                            q: searchTerm + '*',
                            limit: 15
                        };
                        if (accessToken) {
                            data['access_token'] = accessToken;
                        }
                        else {
                            data['client_id'] = appConfig.UntappdClientId;
                            data['client_secret'] = appConfig.UntappdClientSecret;
                        }
                        return yield this.resourceClass.get(data).$promise;
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
                constructor($scope, $rootScope, adalAuthenticationService, $location, $window, $route, userService, untappdService) {
                    super($scope, $rootScope, adalAuthenticationService, $location, userService, () => __awaiter(this, void 0, void 0, function* () {
                        this.setTitleForRoute($route.current);
                        $scope.buttonBarButtons = [];
                        $scope.untappdAuthenticationUri = yield untappdService.getUntappdAuthUri($window.location.origin);
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
                                yield this.update();
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
                    this.$scope.systemUserInfo.ThumbnailImageUri = '';
                    this.update();
                }
            }
            UserController.$inject = ['$scope', '$rootScope', 'adalAuthenticationService', '$location', '$window', '$route', 'userService', 'untappdService'];
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
                    return this.untappdService.searchBeers(searchTerm, this.$scope.systemUserInfo.UntappdAccessToken)
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIk1vZGVsL1VzZXJJbmZvLnRzIiwiU2VydmljZS9Vc2VyU2VydmljZS50cyIsIk1vZGVsL1ZvdGUudHMiLCJTZXJ2aWNlL1ZvdGVTZXJ2aWNlLnRzIiwiTW9kZWwvVGFwSW5mby50cyIsIk1vZGVsL0FjdGl2aXR5LnRzIiwiU2VydmljZS9EYXNoYm9hcmRTZXJ2aWNlLnRzIiwiQ29udHJvbGxlci9Db250cm9sbGVyQmFzZS50cyIsIk1vZGVsL0NvbmZpZ3VyYXRpb24udHMiLCJTZXJ2aWNlL0NvbmZpZ1NlcnZpY2UudHMiLCJTZXJ2aWNlL1VudGFwcGRBcGlTZXJ2aWNlLnRzIiwiQ29udHJvbGxlci9Vc2VyQ29udHJvbGxlci50cyIsIkNvbnRyb2xsZXIvVm90ZUJlZXJDb250cm9sbGVyLnRzIiwiQ29udHJvbGxlci9Wb3RlUmVzdWx0c0NvbnRyb2xsZXIudHMiLCJDb250cm9sbGVyL0FuYWx5dGljc0NvbnRyb2xsZXIudHMiLCJDb250cm9sbGVyL0hvbWVDb250cm9sbGVyLnRzIiwiQXBwQnVpbGRlci50cyIsInN0YXJ0LnRzIiwiTW9kZWwvQXBwU3RhdGUudHMiLCJNb2RlbC9TY29wZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxpRUFBaUU7QUFFakUsaURBQWlEO0FBRWpELElBQU8sYUFBYSxDQWlCbkI7QUFqQkQsV0FBTyxhQUFhO0lBQUMsSUFBQSxHQUFHLENBaUJ2QjtJQWpCb0IsV0FBQSxHQUFHO1FBQUMsSUFBQSxLQUFLLENBaUI3QjtRQWpCd0IsV0FBQSxLQUFLO1lBRTFCLG1HQUFtRztZQUNuRzthQWFDO1lBYlksY0FBUSxXQWFwQixDQUFBO1FBQ0wsQ0FBQyxFQWpCd0IsS0FBSyxHQUFMLFNBQUssS0FBTCxTQUFLLFFBaUI3QjtJQUFELENBQUMsRUFqQm9CLEdBQUcsR0FBSCxpQkFBRyxLQUFILGlCQUFHLFFBaUJ2QjtBQUFELENBQUMsRUFqQk0sYUFBYSxLQUFiLGFBQWEsUUFpQm5CO0FDckJELGlFQUFpRTtBQUVqRSxpREFB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LENBQUE7UUFDTCxDQUFDLEVBaEJ3QixLQUFLLEdBQUwsU0FBSyxLQUFMLFNBQUssUUFnQjdCO0lBQUQsQ0FBQyxFQWhCb0IsR0FBRyxHQUFILGlCQUFHLEtBQUgsaUJBQUcsUUFnQnZCO0FBQUQsQ0FBQyxFQWhCTSxhQUFhLEtBQWIsYUFBYSxRQWdCbkI7QUNwQkQsaUVBQWlFO0FBRWpFLGlEQUFpRDtBQUNqRCxvQ0FBb0M7QUFDcEMsZ0NBQWdDO0FBQ2hDLG1DQUFtQyIsImZpbGUiOiJ1c2VyYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gICAgIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiAgQWxsIHJpZ2h0cyByZXNlcnZlZC5cclxuXHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9yZWZlcmVuY2VzL2luZGV4LmQudHNcIiAvPlxyXG5cclxubW9kdWxlIERYTGlxdWlkSW50ZWwuQXBwLk1vZGVsIHtcclxuXHJcbiAgICAvLyBOZWVkIHRvIGtlZXAgc3RydWN0dXJlIGluIHN5bmMgd2l0aCBEYXNoU2VydmVyLk1hbmFnZW1lbnRBUEkuTW9kZWxzLk9wZXJhdGlvblN0YXRlIGluIHRoZSBXZWJBUElcclxuICAgIGV4cG9ydCBjbGFzcyBVc2VySW5mbyB7XHJcbiAgICAgICAgcHVibGljIFBlcnNvbm5lbE51bWJlcjogbnVtYmVyXHJcbiAgICAgICAgcHVibGljIFVzZXJQcmluY2lwYWxOYW1lOiBzdHJpbmdcclxuICAgICAgICBwdWJsaWMgVW50YXBwZFVzZXJOYW1lOiBzdHJpbmdcclxuICAgICAgICBwdWJsaWMgVW50YXBwZEFjY2Vzc1Rva2VuOiBzdHJpbmdcclxuICAgICAgICBwdWJsaWMgQ2hlY2tpbkZhY2Vib29rOiBib29sZWFuXHJcbiAgICAgICAgcHVibGljIENoZWNraW5Ud2l0dGVyOiBib29sZWFuXHJcbiAgICAgICAgcHVibGljIENoZWNraW5Gb3Vyc3F1YXJlOiBib29sZWFuXHJcbiAgICAgICAgcHVibGljIEZ1bGxOYW1lOiBzdHJpbmdcclxuICAgICAgICBwdWJsaWMgRmlyc3ROYW1lOiBzdHJpbmdcclxuICAgICAgICBwdWJsaWMgTGFzdE5hbWU6IHN0cmluZ1xyXG4gICAgICAgIHB1YmxpYyBJc0FkbWluOiBib29sZWFuXHJcbiAgICAgICAgcHVibGljIFRodW1ibmFpbEltYWdlVXJpOiBzdHJpbmdcclxuICAgIH1cclxufVxyXG4gICAgICAgICAiLCIvLyAgICAgQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uICBBbGwgcmlnaHRzIHJlc2VydmVkLlxyXG5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL3JlZmVyZW5jZXMvaW5kZXguZC50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9Nb2RlbC9Vc2VySW5mby50c1wiIC8+XHJcblxyXG5tb2R1bGUgRFhMaXF1aWRJbnRlbC5BcHAuU2VydmljZSB7XHJcblxyXG4gICAgZXhwb3J0IGNsYXNzIFVzZXJTZXJ2aWNlIHtcclxuICAgICAgICBzdGF0aWMgJGluamVjdCA9IFsnJHJlc291cmNlJywgJ2VudlNlcnZpY2UnXTtcclxuXHJcbiAgICAgICAgcHJpdmF0ZSByZXNvdXJjZUNsYXNzOiBuZy5yZXNvdXJjZS5JUmVzb3VyY2VDbGFzczxuZy5yZXNvdXJjZS5JUmVzb3VyY2U8TW9kZWwuVXNlckluZm8+PjtcclxuICAgICAgICBwcml2YXRlIGNhY2hlZFVzZXJJZDogc3RyaW5nO1xyXG4gICAgICAgIHByaXZhdGUgY2FjaGVkVXNlckluZm86IFByb21pc2VMaWtlPE1vZGVsLlVzZXJJbmZvPjtcclxuXHJcbiAgICAgICAgY29uc3RydWN0b3IoJHJlc291cmNlOiBuZy5yZXNvdXJjZS5JUmVzb3VyY2VTZXJ2aWNlLCBlbnZTZXJ2aWNlOiBhbmd1bGFyLmVudmlyb25tZW50LlNlcnZpY2UpIHtcclxuXHJcbiAgICAgICAgICAgIHRoaXMucmVzb3VyY2VDbGFzcyA9IDxuZy5yZXNvdXJjZS5JUmVzb3VyY2VDbGFzczxuZy5yZXNvdXJjZS5JUmVzb3VyY2U8TW9kZWwuVXNlckluZm8+Pj4kcmVzb3VyY2UoZW52U2VydmljZS5yZWFkKCdhcGlVcmknKSArICcvdXNlcnMvOnVzZXJJZCcsXHJcbiAgICAgICAgICAgICAgICBudWxsLFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZTogeyBtZXRob2Q6ICdQVVQnIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGdldFVzZXJJbmZvKHVzZXJJZDogc3RyaW5nKTogUHJvbWlzZUxpa2U8TW9kZWwuVXNlckluZm8+IHtcclxuICAgICAgICAgICAgaWYgKHVzZXJJZCA9PSB0aGlzLmNhY2hlZFVzZXJJZCAmJiB0aGlzLmNhY2hlZFVzZXJJbmZvICE9IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmNhY2hlZFVzZXJJbmZvO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuY2FjaGVkVXNlcklkID0gdXNlcklkO1xyXG4gICAgICAgICAgICBpZiAoIXVzZXJJZCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jYWNoZWRVc2VySW5mbyA9IFByb21pc2UucmVzb2x2ZTxNb2RlbC5Vc2VySW5mbz4obnVsbCk7ICAgIFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jYWNoZWRVc2VySW5mbyA9IHRoaXMucmVzb3VyY2VDbGFzcy5nZXQoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB1c2VySWQ6IHVzZXJJZFxyXG4gICAgICAgICAgICAgICAgICAgIH0sIFxyXG4gICAgICAgICAgICAgICAgICAgIG51bGwsIFxyXG4gICAgICAgICAgICAgICAgICAgIChlcnJSZXNwOiBuZy5JSHR0cFByb21pc2U8TW9kZWwuVXNlckluZm8+KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIENsZWFyIG91dCBjYWNoZWQgcHJvbWlzZSB0byBhbGxvdyByZXRyeSBvbiBlcnJvclxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNhY2hlZFVzZXJJZCA9ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNhY2hlZFVzZXJJbmZvID0gbnVsbDtcclxuICAgICAgICAgICAgICAgICAgICB9KS4kcHJvbWlzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jYWNoZWRVc2VySW5mbztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyB1cGRhdGVVc2VySW5mbyh1c2VySWQ6IHN0cmluZywgdXNlckluZm86IE1vZGVsLlVzZXJJbmZvKTogUHJvbWlzZUxpa2U8TW9kZWwuVXNlckluZm8+IHtcclxuICAgICAgICAgICAgaWYgKCF1c2VySWQpIHtcclxuICAgICAgICAgICAgICAgIHRocm93ICdJbnZhbGlkIHVzZXIgaWQnO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuY2FjaGVkVXNlcklkID0gJyc7XHJcbiAgICAgICAgICAgIHRoaXMuY2FjaGVkVXNlckluZm8gPSBudWxsO1xyXG4gICAgICAgICAgICByZXR1cm4gKDxhbnk+dGhpcy5yZXNvdXJjZUNsYXNzKS51cGRhdGUoe1xyXG4gICAgICAgICAgICAgICAgICAgIHVzZXJJZDogdXNlcklkXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgdXNlckluZm8pLiRwcm9taXNlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4gIiwiLy8gICAgIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiAgQWxsIHJpZ2h0cyByZXNlcnZlZC5cclxuXHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9yZWZlcmVuY2VzL2luZGV4LmQudHNcIiAvPlxyXG5cclxubW9kdWxlIERYTGlxdWlkSW50ZWwuQXBwLk1vZGVsIHtcclxuXHJcbiAgICBleHBvcnQgY2xhc3MgVm90ZSB7XHJcbiAgICAgICAgcHVibGljIFZvdGVJZDogbnVtYmVyXHJcbiAgICAgICAgcHVibGljIFBlcnNvbm5lbE51bWJlcjogbnVtYmVyXHJcbiAgICAgICAgcHVibGljIFZvdGVEYXRlOiBEYXRlXHJcbiAgICAgICAgcHVibGljIFVudGFwcGRJZDogbnVtYmVyXHJcbiAgICAgICAgcHVibGljIEJlZXJOYW1lPzogc3RyaW5nXHJcbiAgICAgICAgcHVibGljIEJyZXdlcnk/OiBzdHJpbmdcclxuICAgICAgICBwdWJsaWMgQmVlckluZm8/OiBCZWVySW5mb1xyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBCZWVySW5mbyB7XHJcbiAgICAgICAgcHVibGljIHVudGFwcGRJZDogbnVtYmVyXHJcbiAgICAgICAgcHVibGljIG5hbWU6IHN0cmluZ1xyXG4gICAgICAgIHB1YmxpYyBpYnU/OiBudW1iZXJcclxuICAgICAgICBwdWJsaWMgYWJ2PzogbnVtYmVyXHJcbiAgICAgICAgcHVibGljIGRlc2NyaXB0aW9uPzogc3RyaW5nXHJcbiAgICAgICAgcHVibGljIGJyZXdlcnk/OiBzdHJpbmdcclxuICAgICAgICBwdWJsaWMgaW1hZ2U/OiBzdHJpbmdcclxuICAgIH1cclxuXHJcbiAgICBleHBvcnQgY2xhc3MgVm90ZVRhbGx5IHtcclxuICAgICAgICBwdWJsaWMgVW50YXBwZElkOiBudW1iZXJcclxuICAgICAgICBwdWJsaWMgQmVlck5hbWU/OiBzdHJpbmdcclxuICAgICAgICBwdWJsaWMgQnJld2VyeT86IHN0cmluZ1xyXG4gICAgICAgIHB1YmxpYyBWb3RlQ291bnQ6IG51bWJlclxyXG4gICAgfVxyXG59XHJcbiAgICAgICAgICIsIi8vICAgICBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gIEFsbCByaWdodHMgcmVzZXJ2ZWQuXHJcblxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vcmVmZXJlbmNlcy9pbmRleC5kLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL01vZGVsL1ZvdGUudHNcIiAvPlxyXG5cclxubW9kdWxlIERYTGlxdWlkSW50ZWwuQXBwLlNlcnZpY2Uge1xyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBWb3RlU2VydmljZSB7XHJcbiAgICAgICAgc3RhdGljICRpbmplY3QgPSBbJyRyZXNvdXJjZScsICdlbnZTZXJ2aWNlJ107XHJcblxyXG4gICAgICAgIHByaXZhdGUgdXNlclZvdGVzUmVzb3VyY2U6IG5nLnJlc291cmNlLklSZXNvdXJjZUNsYXNzPE1vZGVsLlZvdGVbXT47XHJcbiAgICAgICAgcHJpdmF0ZSB0YWxseVJlc291cmNlOiBuZy5yZXNvdXJjZS5JUmVzb3VyY2VDbGFzczxNb2RlbC5Wb3RlVGFsbHk+O1xyXG5cclxuICAgICAgICBjb25zdHJ1Y3RvcigkcmVzb3VyY2U6IG5nLnJlc291cmNlLklSZXNvdXJjZVNlcnZpY2UsIGVudlNlcnZpY2U6IGFuZ3VsYXIuZW52aXJvbm1lbnQuU2VydmljZSkge1xyXG5cclxuICAgICAgICAgICAgdGhpcy51c2VyVm90ZXNSZXNvdXJjZSA9ICRyZXNvdXJjZTxNb2RlbC5Wb3RlW10+KGVudlNlcnZpY2UucmVhZCgnYXBpVXJpJykgKyAnL3ZvdGVzLzpwZXJzb25uZWxOdW1iZXInLCBudWxsLCB7XHJcbiAgICAgICAgICAgICAgICBnZXQ6IHttZXRob2Q6ICdHRVQnLCBpc0FycmF5OiB0cnVlfSxcclxuICAgICAgICAgICAgICAgIHNhdmU6IHttZXRob2Q6ICdQVVQnLCBpc0FycmF5OiB0cnVlfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgdGhpcy50YWxseVJlc291cmNlID0gJHJlc291cmNlPE1vZGVsLlZvdGVUYWxseT4oZW52U2VydmljZS5yZWFkKCdhcGlVcmknKSArICcvdm90ZXNfdGFsbHknKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBnZXRVc2VyVm90ZXMocGVyc29ubmVsTnVtYmVyOiBudW1iZXIpOiBQcm9taXNlTGlrZTxNb2RlbC5Wb3RlW10+IHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMudXNlclZvdGVzUmVzb3VyY2UuZ2V0KHtcclxuICAgICAgICAgICAgICAgICAgICBwZXJzb25uZWxOdW1iZXI6IHBlcnNvbm5lbE51bWJlclxyXG4gICAgICAgICAgICAgICAgfSkuJHByb21pc2U7IFxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHVwZGF0ZVVzZXJWb3RlcyhwZXJzb25uZWxOdW1iZXI6IG51bWJlciwgdm90ZXM6IE1vZGVsLlZvdGVbXSk6IFByb21pc2VMaWtlPE1vZGVsLlZvdGVbXT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy51c2VyVm90ZXNSZXNvdXJjZS5zYXZlKHtcclxuICAgICAgICAgICAgICAgICAgICBwZXJzb25uZWxOdW1iZXI6IHBlcnNvbm5lbE51bWJlclxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHZvdGVzKS4kcHJvbWlzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBnZXRWb3RlVGFsbHkoKTogUHJvbWlzZUxpa2U8TW9kZWwuVm90ZVRhbGx5W10+IHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMudGFsbHlSZXNvdXJjZS5xdWVyeSgpLiRwcm9taXNlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4gIiwiLy8gICAgIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiAgQWxsIHJpZ2h0cyByZXNlcnZlZC5cclxuXHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9yZWZlcmVuY2VzL2luZGV4LmQudHNcIiAvPlxyXG5cclxubW9kdWxlIERYTGlxdWlkSW50ZWwuQXBwLk1vZGVsIHtcclxuXHJcbiAgICAvLyBOZWVkIHRvIGtlZXAgc3RydWN0dXJlIGluIHN5bmMgd2l0aCBEYXNoU2VydmVyLk1hbmFnZW1lbnRBUEkuTW9kZWxzLk9wZXJhdGlvblN0YXRlIGluIHRoZSBXZWJBUElcclxuICAgIGV4cG9ydCBjbGFzcyBUYXBJbmZvIHtcclxuICAgICAgICBwdWJsaWMgVGFwSWQ6IG51bWJlclxyXG4gICAgICAgIHB1YmxpYyBLZWdJZDogbnVtYmVyXHJcbiAgICAgICAgcHVibGljIEluc3RhbGxEYXRlOiBEYXRlXHJcbiAgICAgICAgcHVibGljIEtlZ1NpemU6IG51bWJlclxyXG4gICAgICAgIHB1YmxpYyBDdXJyZW50Vm9sdW1lOiBudW1iZXJcclxuICAgICAgICBwdWJsaWMgTmFtZTogc3RyaW5nXHJcbiAgICAgICAgcHVibGljIEJyZXdlcnk6IHN0cmluZ1xyXG4gICAgICAgIHB1YmxpYyBCZWVyVHlwZTogc3RyaW5nXHJcbiAgICAgICAgcHVibGljIEFCVj86IG51bWJlclxyXG4gICAgICAgIHB1YmxpYyBJQlU/OiBudW1iZXJcclxuICAgICAgICBwdWJsaWMgQmVlckRlc2NyaXB0aW9uOiBzdHJpbmdcclxuICAgICAgICBwdWJsaWMgVW50YXBwZElkPzogbnVtYmVyXHJcbiAgICAgICAgcHVibGljIGltYWdlUGF0aDogc3RyaW5nXHJcbiAgICB9XHJcbn1cclxuICAgICAgICAgIiwiLy8gICAgIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiAgQWxsIHJpZ2h0cyByZXNlcnZlZC5cclxuXHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9yZWZlcmVuY2VzL2luZGV4LmQudHNcIiAvPlxyXG5cclxubW9kdWxlIERYTGlxdWlkSW50ZWwuQXBwLk1vZGVsIHtcclxuXHJcbiAgICAvLyBOZWVkIHRvIGtlZXAgc3RydWN0dXJlIGluIHN5bmMgd2l0aCBEYXNoU2VydmVyLk1hbmFnZW1lbnRBUEkuTW9kZWxzLk9wZXJhdGlvblN0YXRlIGluIHRoZSBXZWJBUElcclxuICAgIGV4cG9ydCBjbGFzcyBBY3Rpdml0eSB7XHJcbiAgICAgICAgcHVibGljIFNlc3Npb25JZDogbnVtYmVyXHJcbiAgICAgICAgcHVibGljIFBvdXJUaW1lOiBEYXRlXHJcbiAgICAgICAgcHVibGljIFBvdXJBbW91bnQ6IG51bWJlclxyXG4gICAgICAgIHB1YmxpYyBCZWVyTmFtZTogc3RyaW5nXHJcbiAgICAgICAgcHVibGljIEJyZXdlcnk6IHN0cmluZ1xyXG4gICAgICAgIHB1YmxpYyBCZWVyVHlwZTogc3RyaW5nXHJcbiAgICAgICAgcHVibGljIEFCVj86IG51bWJlclxyXG4gICAgICAgIHB1YmxpYyBJQlU/OiBudW1iZXJcclxuICAgICAgICBwdWJsaWMgQmVlckRlc2NyaXB0aW9uOiBzdHJpbmdcclxuICAgICAgICBwdWJsaWMgVW50YXBwZElkPzogbnVtYmVyXHJcbiAgICAgICAgcHVibGljIEJlZXJJbWFnZVBhdGg6IHN0cmluZ1xyXG4gICAgICAgIHB1YmxpYyBQZXJzb25uZWxOdW1iZXI6IG51bWJlclxyXG4gICAgICAgIHB1YmxpYyBBbGlhczogc3RyaW5nXHJcbiAgICAgICAgcHVibGljIEZ1bGxOYW1lOiBzdHJpbmdcclxuICAgIH1cclxufVxyXG4gICAgICAgICAiLCIvLyAgICAgQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uICBBbGwgcmlnaHRzIHJlc2VydmVkLlxyXG5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL3JlZmVyZW5jZXMvaW5kZXguZC50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9Nb2RlbC9UYXBJbmZvLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL01vZGVsL0FjdGl2aXR5LnRzXCIgLz5cclxuXHJcbm1vZHVsZSBEWExpcXVpZEludGVsLkFwcC5TZXJ2aWNlIHtcclxuXHJcbiAgICBleHBvcnQgY2xhc3MgRGFzaGJvYXJkU2VydmljZSB7XHJcbiAgICAgICAgc3RhdGljICRpbmplY3QgPSBbJyRyZXNvdXJjZScsICdlbnZTZXJ2aWNlJ107XHJcblxyXG4gICAgICAgIHByaXZhdGUga2VnU3RhdHVzUmVzb3VyY2U6IG5nLnJlc291cmNlLklSZXNvdXJjZUNsYXNzPE1vZGVsLlRhcEluZm8+O1xyXG4gICAgICAgIHByaXZhdGUgYWN0aXZpdHlSZXNvdXJjZTogbmcucmVzb3VyY2UuSVJlc291cmNlQ2xhc3M8TW9kZWwuQWN0aXZpdHk+O1xyXG5cclxuICAgICAgICBjb25zdHJ1Y3RvcigkcmVzb3VyY2U6IG5nLnJlc291cmNlLklSZXNvdXJjZVNlcnZpY2UsIGVudlNlcnZpY2U6IGFuZ3VsYXIuZW52aXJvbm1lbnQuU2VydmljZSkge1xyXG4gICAgICAgICAgICB2YXIgYXV0aEhlYWRlciA9IFwiQmFzaWMgXCIgKyBidG9hKGVudlNlcnZpY2UucmVhZCgnYXBpVXNlcm5hbWUnKSArIFwiOlwiICsgZW52U2VydmljZS5yZWFkKCdhcGlQYXNzd29yZCcpKTtcclxuICAgICAgICAgICAgdmFyIGhlYWRlcnMgPSB7XHJcbiAgICAgICAgICAgICAgICBBdXRob3JpemF0aW9uOiBhdXRoSGVhZGVyXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHZhciBxdWVyeUFjdGlvbjogbmcucmVzb3VyY2UuSUFjdGlvbkhhc2ggPSB7XHJcbiAgICAgICAgICAgICAgICBxdWVyeToge1xyXG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZDogJ0dFVCcsXHJcbiAgICAgICAgICAgICAgICAgICAgaXNBcnJheTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICBoZWFkZXJzOiBoZWFkZXJzXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHRoaXMua2VnU3RhdHVzUmVzb3VyY2UgPSAkcmVzb3VyY2U8TW9kZWwuVGFwSW5mbz4oZW52U2VydmljZS5yZWFkKCdhcGlVcmknKSArICcvQ3VycmVudEtlZycsIG51bGwsIHF1ZXJ5QWN0aW9uKTtcclxuICAgICAgICAgICAgdGhpcy5hY3Rpdml0eVJlc291cmNlID0gJHJlc291cmNlPE1vZGVsLkFjdGl2aXR5PihlbnZTZXJ2aWNlLnJlYWQoJ2FwaVVyaScpICsgJy9hY3Rpdml0eScsIG51bGwsIHF1ZXJ5QWN0aW9uKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBnZXRLZWdTdGF0dXMoKTogUHJvbWlzZUxpa2U8TW9kZWwuVGFwSW5mb1tdPiB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmtlZ1N0YXR1c1Jlc291cmNlLnF1ZXJ5KCkuJHByb21pc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgZ2V0TGF0ZXN0QWN0aXZpdGllcyhjb3VudDogbnVtYmVyKTogUHJvbWlzZUxpa2U8TW9kZWwuQWN0aXZpdHlbXT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5hY3Rpdml0eVJlc291cmNlLnF1ZXJ5KHtcclxuICAgICAgICAgICAgICAgIGNvdW50OiBjb3VudFxyXG4gICAgICAgICAgICB9KS4kcHJvbWlzZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwiLy8gICAgIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiAgQWxsIHJpZ2h0cyByZXNlcnZlZC5cclxuXHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9yZWZlcmVuY2VzL2luZGV4LmQudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vU2VydmljZS9Vc2VyU2VydmljZS50c1wiIC8+XHJcblxyXG5tb2R1bGUgRFhMaXF1aWRJbnRlbC5BcHAuQ29udHJvbGxlciB7XHJcblxyXG4gICAgZXhwb3J0IGNsYXNzIENvbnRyb2xsZXJCYXNlIHtcclxuXHJcbiAgICAgICAgY29uc3RydWN0b3IocHJvdGVjdGVkICRzY29wZTogTW9kZWwuSURYTGlxdWlkSW50ZWxTY29wZSxcclxuICAgICAgICAgICAgcHJvdGVjdGVkICRyb290U2NvcGU6IE1vZGVsLklEWExpcXVpZEludGVsU2NvcGUsXHJcbiAgICAgICAgICAgIHByb3RlY3RlZCBhZGFsQXV0aGVudGljYXRpb25TZXJ2aWNlLFxyXG4gICAgICAgICAgICBwcm90ZWN0ZWQgJGxvY2F0aW9uOiBuZy5JTG9jYXRpb25TZXJ2aWNlLFxyXG4gICAgICAgICAgICBwcm90ZWN0ZWQgdXNlclNlcnZpY2U6IFNlcnZpY2UuVXNlclNlcnZpY2UsXHJcbiAgICAgICAgICAgIGNvbnRpbnVlQWZ0ZXJVc2VyTG9hZDogKCkgPT4gdm9pZCkge1xyXG5cclxuICAgICAgICAgICAgJHJvb3RTY29wZS5sb2dpbiA9ICgpID0+IHRoaXMubG9naW4oKTtcclxuICAgICAgICAgICAgJHJvb3RTY29wZS5sb2dvdXQgPSAoKSA9PiB0aGlzLmxvZ291dCgpO1xyXG4gICAgICAgICAgICAkcm9vdFNjb3BlLmlzQ29udHJvbGxlckFjdGl2ZSA9IChsb2NhdGlvbikgPT4gdGhpcy5pc0FjdGl2ZShsb2NhdGlvbik7XHJcbiAgICAgICAgICAgICRyb290U2NvcGUuaXNBZG1pbiA9ICgpID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAkc2NvcGUuc3lzdGVtVXNlckluZm8gPyAkc2NvcGUuc3lzdGVtVXNlckluZm8uSXNBZG1pbiA6IGZhbHNlO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAkcm9vdFNjb3BlLmJ1dHRvbkJhckJ1dHRvbnMgPSBbXTtcclxuXHJcbiAgICAgICAgICAgICRzY29wZS4kb24oJyRyb3V0ZUNoYW5nZVN1Y2Nlc3MnLCAoZXZlbnQsIGN1cnJlbnQsIHByZXZpb3VzKSA9PiB0aGlzLnNldFRpdGxlRm9yUm91dGUoY3VycmVudC4kJHJvdXRlKSk7XHJcbiAgICAgICAgICAgICRzY29wZS5sb2FkaW5nTWVzc2FnZSA9IFwiXCI7XHJcbiAgICAgICAgICAgICRzY29wZS5lcnJvciA9IFwiXCI7XHJcblxyXG4gICAgICAgICAgICAvLyBXaGVuIHRoZSB1c2VyIGxvZ3MgaW4sIHdlIG5lZWQgdG8gY2hlY2sgd2l0aCB0aGUgYXBpIGlmIHRoZXkncmUgYW4gYWRtaW4gb3Igbm90XHJcbiAgICAgICAgICAgIHRoaXMuc2V0VXBkYXRlU3RhdGUodHJ1ZSk7XHJcbiAgICAgICAgICAgIHRoaXMuJHNjb3BlLmxvYWRpbmdNZXNzYWdlID0gXCJSZXRyaWV2aW5nIHVzZXIgaW5mb3JtYXRpb24uLi5cIjtcclxuICAgICAgICAgICAgdGhpcy4kc2NvcGUuZXJyb3IgPSBcIlwiO1xyXG4gICAgICAgICAgICB1c2VyU2VydmljZS5nZXRVc2VySW5mbygkc2NvcGUudXNlckluZm8udXNlck5hbWUpXHJcbiAgICAgICAgICAgICAgICAudGhlbigodXNlckluZm86IE1vZGVsLlVzZXJJbmZvKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnN5c3RlbVVzZXJJbmZvID0gdXNlckluZm87XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGludWVBZnRlclVzZXJMb2FkKCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBsb2dpbigpOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy5hZGFsQXV0aGVudGljYXRpb25TZXJ2aWNlLmxvZ2luKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgbG9naW5XaXRoTWZhKCkge1xyXG4gICAgICAgICAgICB0aGlzLmFkYWxBdXRoZW50aWNhdGlvblNlcnZpY2UubG9naW4oeyBhbXJfdmFsdWVzOiAnbWZhJyB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBsb2dvdXQoKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMuYWRhbEF1dGhlbnRpY2F0aW9uU2VydmljZS5sb2dPdXQoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBpc0FjdGl2ZSh2aWV3TG9jYXRpb24pOiBib29sZWFuIHtcclxuICAgICAgICAgICAgcmV0dXJuIHZpZXdMb2NhdGlvbiA9PT0gdGhpcy4kbG9jYXRpb24ucGF0aCgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHNldFRpdGxlRm9yUm91dGUocm91dGU6IG5nLnJvdXRlLklSb3V0ZSk6IHZvaWQge1xyXG4gICAgICAgICAgICB0aGlzLiRyb290U2NvcGUudGl0bGUgPSBcIkRYIExpcXVpZCBJbnRlbGxpZ2VuY2UgLSBcIiArIHJvdXRlLm5hbWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcm90ZWN0ZWQgc2V0RXJyb3IoZXJyb3I6IGJvb2xlYW4sIG1lc3NhZ2U6IGFueSwgcmVzcG9uc2VIZWFkZXJzOiBuZy5JSHR0cEhlYWRlcnNHZXR0ZXIpOiB2b2lkIHtcclxuICAgICAgICAgICAgdmFyIGFjcXVpcmVNZmFSZXNvdXJjZSA9IFwiXCI7XHJcbiAgICAgICAgICAgIGlmIChyZXNwb25zZUhlYWRlcnMgIT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgLy8gSWYgd2UgcmVjZWl2ZWQgYSA0MDEgZXJyb3Igd2l0aCBXV1ctQXV0aGVudGljYXRlIHJlc3BvbnNlIGhlYWRlcnMsIHdlIG1heSBuZWVkIHRvIFxyXG4gICAgICAgICAgICAgICAgLy8gcmUtYXV0aGVudGljYXRlIHRvIHNhdGlzZnkgMkZBIHJlcXVpcmVtZW50cyBmb3IgdW5kZXJseWluZyBzZXJ2aWNlcyB1c2VkIGJ5IHRoZSBXZWJBUElcclxuICAgICAgICAgICAgICAgIC8vIChlZy4gUkRGRSkuIEluIHRoYXQgY2FzZSwgd2UgbmVlZCB0byBleHBsaWNpdGx5IHNwZWNpZnkgdGhlIG5hbWUgb2YgdGhlIHJlc291cmNlIHdlXHJcbiAgICAgICAgICAgICAgICAvLyB3YW50IDJGQSBhdXRoZW50aWNhdGlvbiB0by5cclxuICAgICAgICAgICAgICAgIHZhciB3d3dBdXRoID0gcmVzcG9uc2VIZWFkZXJzKFwid3d3LWF1dGhlbnRpY2F0ZVwiKTtcclxuICAgICAgICAgICAgICAgIGlmICh3d3dBdXRoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gSGFuZGxlIHRoZSBtdWx0aXBsZSB3d3ctYXV0aGVudGljYXRlIGhlYWRlcnMgY2FzZVxyXG4gICAgICAgICAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaCh3d3dBdXRoLnNwbGl0KFwiLFwiKSwgKGF1dGhTY2hlbWU6IHN0cmluZywgaW5kZXg6IG51bWJlcikgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcGFyYW1zRGVsaW0gPSBhdXRoU2NoZW1lLmluZGV4T2YoXCIgXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocGFyYW1zRGVsaW0gIT0gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwYXJhbXMgPSBhdXRoU2NoZW1lLnN1YnN0cihwYXJhbXNEZWxpbSArIDEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHBhcmFtc1ZhbHVlcyA9IHBhcmFtcy5zcGxpdChcIj1cIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocGFyYW1zVmFsdWVzWzBdID09PSBcImludGVyYWN0aW9uX3JlcXVpcmVkXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3F1aXJlTWZhUmVzb3VyY2UgPSBwYXJhbXNWYWx1ZXNbMV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoYWNxdWlyZU1mYVJlc291cmNlKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBUaGUgV2ViQVBJIG5lZWRzIDJGQSBhdXRoZW50aWNhdGlvbiB0byBiZSBhYmxlIHRvIGFjY2VzcyBpdHMgcmVzb3VyY2VzXHJcbiAgICAgICAgICAgICAgICB0aGlzLmxvZ2luV2l0aE1mYSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICgkLmlzUGxhaW5PYmplY3QobWVzc2FnZSkpIHtcclxuICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSAkLm1hcChbXCJNZXNzYWdlXCIsIFwiRXhjZXB0aW9uTWVzc2FnZVwiLCBcIkV4Y2VwdGlvblR5cGVcIl0sIChhdHRyaWJ1dGVOYW1lKSA9PiBtZXNzYWdlW2F0dHJpYnV0ZU5hbWVdKVxyXG4gICAgICAgICAgICAgICAgICAgIC5qb2luKFwiIC0gXCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuJHNjb3BlLmVycm9yX2NsYXNzID0gZXJyb3IgPyBcImFsZXJ0LWRhbmdlclwiIDogXCJhbGVydC1pbmZvXCI7XHJcbiAgICAgICAgICAgIHRoaXMuJHNjb3BlLmVycm9yID0gbWVzc2FnZTtcclxuICAgICAgICAgICAgdGhpcy4kc2NvcGUubG9hZGluZ01lc3NhZ2UgPSBcIlwiO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJvdGVjdGVkIHNldFVwZGF0ZVN0YXRlKHVwZGF0ZUluUHJvZ3Jlc3M6IGJvb2xlYW4pOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy4kc2NvcGUudXBkYXRlSW5Qcm9ncmVzcyA9IHVwZGF0ZUluUHJvZ3Jlc3M7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59ICIsIi8vICAgICBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gIEFsbCByaWdodHMgcmVzZXJ2ZWQuXHJcblxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vcmVmZXJlbmNlcy9pbmRleC5kLnRzXCIgLz5cclxuXHJcbm1vZHVsZSBEWExpcXVpZEludGVsLkFwcC5Nb2RlbCB7XHJcblxyXG4gICAgZXhwb3J0IGNsYXNzIENvbmZpZ3VyYXRpb24ge1xyXG5cclxuICAgICAgICBwdWJsaWMgVW50YXBwZENsaWVudElkOiBzdHJpbmdcclxuICAgICAgICBwdWJsaWMgVW50YXBwZENsaWVudFNlY3JldDogc3RyaW5nXHJcbiAgICB9XHJcbn0gIiwiLy8gICAgIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiAgQWxsIHJpZ2h0cyByZXNlcnZlZC5cclxuXHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9yZWZlcmVuY2VzL2luZGV4LmQudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vTW9kZWwvQ29uZmlndXJhdGlvbi50c1wiIC8+XHJcblxyXG5tb2R1bGUgRFhMaXF1aWRJbnRlbC5BcHAuU2VydmljZSB7XHJcblxyXG4gICAgZXhwb3J0IGNsYXNzIENvbmZpZ1NlcnZpY2Uge1xyXG4gICAgICAgIHN0YXRpYyAkaW5qZWN0ID0gWyckcmVzb3VyY2UnLCAnZW52U2VydmljZSddO1xyXG5cclxuICAgICAgICBwcml2YXRlIHJlc291cmNlQ2xhc3M6IG5nLnJlc291cmNlLklSZXNvdXJjZUNsYXNzPG5nLnJlc291cmNlLklSZXNvdXJjZTxNb2RlbC5Db25maWd1cmF0aW9uPj47XHJcbiAgICAgICAgcHJpdmF0ZSBjb25maWd1cmF0aW9uOiBuZy5JUHJvbWlzZTxNb2RlbC5Db25maWd1cmF0aW9uPjtcclxuXHJcbiAgICAgICAgY29uc3RydWN0b3IoJHJlc291cmNlOiBuZy5yZXNvdXJjZS5JUmVzb3VyY2VTZXJ2aWNlLCBlbnZTZXJ2aWNlOiBhbmd1bGFyLmVudmlyb25tZW50LlNlcnZpY2UpIHtcclxuXHJcbiAgICAgICAgICAgIHRoaXMucmVzb3VyY2VDbGFzcyA9ICRyZXNvdXJjZShlbnZTZXJ2aWNlLnJlYWQoJ2FwaVVyaScpICsgJy9hcHBDb25maWd1cmF0aW9uJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgZ2V0Q29uZmlndXJhdGlvbigpOiBQcm9taXNlTGlrZTxNb2RlbC5Db25maWd1cmF0aW9uPiB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5jb25maWd1cmF0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb24gPSB0aGlzLnJlc291cmNlQ2xhc3MuZ2V0KCkuJHByb21pc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29uZmlndXJhdGlvbjtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuICIsIi8vICAgICBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gIEFsbCByaWdodHMgcmVzZXJ2ZWQuXHJcblxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vcmVmZXJlbmNlcy9pbmRleC5kLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vQ29uZmlnU2VydmljZS50c1wiIC8+XHJcblxyXG5tb2R1bGUgRFhMaXF1aWRJbnRlbC5BcHAuU2VydmljZSB7XHJcblxyXG4gICAgZXhwb3J0IGNsYXNzIFVudGFwcGRBcGlTZXJ2aWNlIHtcclxuICAgICAgICBzdGF0aWMgJGluamVjdCA9IFsnJHJlc291cmNlJywgJ2VudlNlcnZpY2UnLCAnY29uZmlnU2VydmljZSddO1xyXG5cclxuICAgICAgICBwcml2YXRlIHJlc291cmNlQ2xhc3M6IG5nLnJlc291cmNlLklSZXNvdXJjZUNsYXNzPG5nLnJlc291cmNlLklSZXNvdXJjZTxhbnk+PjtcclxuXHJcbiAgICAgICAgY29uc3RydWN0b3IoJHJlc291cmNlOiBuZy5yZXNvdXJjZS5JUmVzb3VyY2VTZXJ2aWNlLCBwcml2YXRlIGVudlNlcnZpY2U6IGFuZ3VsYXIuZW52aXJvbm1lbnQuU2VydmljZSwgcHJpdmF0ZSBjb25maWdTZXJ2aWNlOiBDb25maWdTZXJ2aWNlKSB7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnJlc291cmNlQ2xhc3MgPSAkcmVzb3VyY2UoJ2h0dHBzOi8vYXBpLnVudGFwcGQuY29tL3Y0LzplbnRpdHkvOm1ldGhvZE5hbWUnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBhc3luYyBnZXRVbnRhcHBkQXV0aFVyaShyZWRpcmVjdFVyaTogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+IHtcclxuICAgICAgICAgICAgbGV0IGFwcENvbmZpZyA9IGF3YWl0IHRoaXMuY29uZmlnU2VydmljZS5nZXRDb25maWd1cmF0aW9uKCk7XHJcbiAgICAgICAgICAgIHJldHVybiBgaHR0cHM6Ly91bnRhcHBkLmNvbS9vYXV0aC9hdXRoZW50aWNhdGUvP2NsaWVudF9pZD0ke2FwcENvbmZpZy5VbnRhcHBkQ2xpZW50SWR9JnJlc3BvbnNlX3R5cGU9dG9rZW4mcmVkaXJlY3RfdXJsPSR7cmVkaXJlY3RVcml9YDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBnZXRVc2VySW5mbyhhY2Nlc3NUb2tlbjogc3RyaW5nKTogUHJvbWlzZUxpa2U8YW55PiB7XHJcbiAgICAgICAgICAgIGlmICghYWNjZXNzVG9rZW4pIHtcclxuICAgICAgICAgICAgICAgIHRocm93ICdJbnZhbGlkIFVudGFwcGQgdXNlciBhY2Nlc3MgdG9rZW4nOyAgICBcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnJlc291cmNlQ2xhc3MuZ2V0KHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZW50aXR5OiAndXNlcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1ldGhvZE5hbWU6ICdpbmZvJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYWNjZXNzX3Rva2VuOiBhY2Nlc3NUb2tlblxyXG4gICAgICAgICAgICAgICAgICAgIH0pLiRwcm9taXNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgYXN5bmMgc2VhcmNoQmVlcnMoc2VhcmNoVGVybTogc3RyaW5nLCBhY2Nlc3NUb2tlbj86IHN0cmluZyk6IFByb21pc2U8YW55PiB7XHJcbiAgICAgICAgICAgIGxldCBhcHBDb25maWcgPSBhd2FpdCB0aGlzLmNvbmZpZ1NlcnZpY2UuZ2V0Q29uZmlndXJhdGlvbigpO1xyXG4gICAgICAgICAgICB2YXIgZGF0YSA9IHtcclxuICAgICAgICAgICAgICAgIGVudGl0eTogJ3NlYXJjaCcsXHJcbiAgICAgICAgICAgICAgICBtZXRob2ROYW1lOiAnYmVlcicsXHJcbiAgICAgICAgICAgICAgICBxOiBzZWFyY2hUZXJtICsgJyonLFxyXG4gICAgICAgICAgICAgICAgbGltaXQ6IDE1XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGlmIChhY2Nlc3NUb2tlbikge1xyXG4gICAgICAgICAgICAgICAgZGF0YVsnYWNjZXNzX3Rva2VuJ10gPSBhY2Nlc3NUb2tlbjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGRhdGFbJ2NsaWVudF9pZCddID0gYXBwQ29uZmlnLlVudGFwcGRDbGllbnRJZDtcclxuICAgICAgICAgICAgICAgIGRhdGFbJ2NsaWVudF9zZWNyZXQnXSA9IGFwcENvbmZpZy5VbnRhcHBkQ2xpZW50U2VjcmV0O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnJlc291cmNlQ2xhc3MuZ2V0KGRhdGEpLiRwcm9taXNlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4gIiwiLy8gICAgIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiAgQWxsIHJpZ2h0cyByZXNlcnZlZC5cclxuXHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9yZWZlcmVuY2VzL2luZGV4LmQudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9Db250cm9sbGVyQmFzZS50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9TZXJ2aWNlL1VzZXJTZXJ2aWNlLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL1NlcnZpY2UvVW50YXBwZEFwaVNlcnZpY2UudHNcIiAvPlxyXG5cclxubW9kdWxlIERYTGlxdWlkSW50ZWwuQXBwLkNvbnRyb2xsZXIge1xyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBVc2VyQ29udHJvbGxlciBleHRlbmRzIENvbnRyb2xsZXJCYXNlIHtcclxuICAgICAgICBzdGF0aWMgJGluamVjdCA9IFsnJHNjb3BlJywgJyRyb290U2NvcGUnLCAnYWRhbEF1dGhlbnRpY2F0aW9uU2VydmljZScsICckbG9jYXRpb24nLCAnJHdpbmRvdycsICckcm91dGUnLCAndXNlclNlcnZpY2UnLCAndW50YXBwZFNlcnZpY2UnXTtcclxuXHJcbiAgICAgICAgY29uc3RydWN0b3IoJHNjb3BlOiBNb2RlbC5JRFhMaXF1aWRJbnRlbFNjb3BlLFxyXG4gICAgICAgICAgICAkcm9vdFNjb3BlOiBNb2RlbC5JRFhMaXF1aWRJbnRlbFNjb3BlLFxyXG4gICAgICAgICAgICBhZGFsQXV0aGVudGljYXRpb25TZXJ2aWNlLFxyXG4gICAgICAgICAgICAkbG9jYXRpb246IG5nLklMb2NhdGlvblNlcnZpY2UsXHJcbiAgICAgICAgICAgICR3aW5kb3c6IG5nLklXaW5kb3dTZXJ2aWNlLFxyXG4gICAgICAgICAgICAkcm91dGU6IG5nLnJvdXRlLklSb3V0ZVNlcnZpY2UsXHJcbiAgICAgICAgICAgIHVzZXJTZXJ2aWNlOiBTZXJ2aWNlLlVzZXJTZXJ2aWNlLFxyXG4gICAgICAgICAgICBwcm90ZWN0ZWQgdW50YXBwZFNlcnZpY2U6IFNlcnZpY2UuVW50YXBwZEFwaVNlcnZpY2UpIHtcclxuXHJcbiAgICAgICAgICAgIHN1cGVyKCRzY29wZSwgJHJvb3RTY29wZSwgYWRhbEF1dGhlbnRpY2F0aW9uU2VydmljZSwgJGxvY2F0aW9uLCB1c2VyU2VydmljZSwgYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRUaXRsZUZvclJvdXRlKCRyb3V0ZS5jdXJyZW50KTtcclxuICAgICAgICAgICAgICAgICRzY29wZS5idXR0b25CYXJCdXR0b25zID0gW107XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUudW50YXBwZEF1dGhlbnRpY2F0aW9uVXJpID0gYXdhaXQgdW50YXBwZFNlcnZpY2UuZ2V0VW50YXBwZEF1dGhVcmkoJHdpbmRvdy5sb2NhdGlvbi5vcmlnaW4pO1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLmRpc2Nvbm5lY3RVbnRhcHBkVXNlciA9ICgpID0+IHRoaXMuZGlzY29ubmVjdFVzZXIoKTtcclxuICAgICAgICAgICAgICAgICRzY29wZS51cGRhdGVVc2VySW5mbyA9ICgpID0+IHRoaXMudXBkYXRlKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBvcHVsYXRlKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBhc3luYyBwb3B1bGF0ZSgpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0VXBkYXRlU3RhdGUodHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRzY29wZS5sb2FkaW5nTWVzc2FnZSA9IFwiUmV0cmlldmluZyB1c2VyIGluZm9ybWF0aW9uLi4uXCI7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRzY29wZS5lcnJvciA9IFwiXCI7XHJcbiAgICAgICAgICAgICAgICBsZXQgdXNlckluZm8gPSBhd2FpdCB0aGlzLnVzZXJTZXJ2aWNlLmdldFVzZXJJbmZvKHRoaXMuJHNjb3BlLnVzZXJJbmZvLnVzZXJOYW1lKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuJHNjb3BlLnN5c3RlbVVzZXJJbmZvID0gdXNlckluZm87XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy4kcm9vdFNjb3BlLnVudGFwcGVkUG9zdEJhY2tUb2tlbikge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuJHNjb3BlLnN5c3RlbVVzZXJJbmZvLlVudGFwcGRBY2Nlc3NUb2tlbiA9IHRoaXMuJHJvb3RTY29wZS51bnRhcHBlZFBvc3RCYWNrVG9rZW47XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy4kcm9vdFNjb3BlLnVudGFwcGVkUG9zdEJhY2tUb2tlbiA9ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCB1bnRhcHBkVXNlclJlc3BvbnNlID0gYXdhaXQgdGhpcy51bnRhcHBkU2VydmljZS5nZXRVc2VySW5mbyh0aGlzLiRzY29wZS5zeXN0ZW1Vc2VySW5mby5VbnRhcHBkQWNjZXNzVG9rZW4pO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCB1bnRhcHBkVXNlckluZm8gPSB1bnRhcHBkVXNlclJlc3BvbnNlLnJlc3BvbnNlLnVzZXI7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy4kc2NvcGUuc3lzdGVtVXNlckluZm8uVW50YXBwZFVzZXJOYW1lID0gdW50YXBwZFVzZXJJbmZvLnVzZXJfbmFtZTtcclxuICAgICAgICAgICAgICAgICAgICAvLyBJZiBVbnRhcHBkIGhhcyBhIHVzZXIgaW1hZ2UsIGZvcmNlIHRoaXMgdG8gYmUgb3VyIGltYWdlXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHVudGFwcGRVc2VySW5mby51c2VyX2F2YXRhcikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLiRzY29wZS5zeXN0ZW1Vc2VySW5mby5UaHVtYm5haWxJbWFnZVVyaSA9IHVudGFwcGRVc2VySW5mby51c2VyX2F2YXRhcjsgXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMudXBkYXRlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFVwZGF0ZVN0YXRlKGZhbHNlKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuJHNjb3BlLmxvYWRpbmdNZXNzYWdlID0gXCJcIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXRjaCAoZXgpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0RXJyb3IodHJ1ZSwgZXguZGF0YSB8fCBleC5zdGF0dXNUZXh0LCBleC5oZWFkZXJzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBhc3luYyB1cGRhdGUoKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRzY29wZS5sb2FkaW5nTWVzc2FnZSA9IFwiU2F2aW5nIHVzZXIgaW5mb3JtYXRpb24uLi5cIjtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0VXBkYXRlU3RhdGUodHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICBsZXQgdXNlckluZm8gPSBhd2FpdCB0aGlzLnVzZXJTZXJ2aWNlLnVwZGF0ZVVzZXJJbmZvKHRoaXMuJHNjb3BlLnVzZXJJbmZvLnVzZXJOYW1lLCB0aGlzLiRzY29wZS5zeXN0ZW1Vc2VySW5mbyk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRzY29wZS5zeXN0ZW1Vc2VySW5mbyA9IHVzZXJJbmZvO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRVcGRhdGVTdGF0ZShmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRzY29wZS5sb2FkaW5nTWVzc2FnZSA9IFwiXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2F0Y2ggKGV4KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldEVycm9yKHRydWUsIGV4LmRhdGEgfHwgZXguc3RhdHVzVGV4dCwgZXguaGVhZGVycyk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFVwZGF0ZVN0YXRlKGZhbHNlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBkaXNjb25uZWN0VXNlcigpOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy4kc2NvcGUuc3lzdGVtVXNlckluZm8uVW50YXBwZFVzZXJOYW1lID0gJyc7XHJcbiAgICAgICAgICAgIHRoaXMuJHNjb3BlLnN5c3RlbVVzZXJJbmZvLlVudGFwcGRBY2Nlc3NUb2tlbiA9ICcnO1xyXG4gICAgICAgICAgICB0aGlzLiRzY29wZS5zeXN0ZW1Vc2VySW5mby5UaHVtYm5haWxJbWFnZVVyaSA9ICcnO1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSAiLCIvLyAgICAgQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uICBBbGwgcmlnaHRzIHJlc2VydmVkLlxyXG5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL3JlZmVyZW5jZXMvaW5kZXguZC50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL0NvbnRyb2xsZXJCYXNlLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL1NlcnZpY2UvVW50YXBwZEFwaVNlcnZpY2UudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vU2VydmljZS9Wb3RlU2VydmljZS50c1wiIC8+XHJcblxyXG5tb2R1bGUgRFhMaXF1aWRJbnRlbC5BcHAuQ29udHJvbGxlciB7XHJcblxyXG4gICAgZXhwb3J0IGNsYXNzIFZvdGVCZWVyQ29udHJvbGxlciBleHRlbmRzIENvbnRyb2xsZXJCYXNlIHtcclxuICAgICAgICBzdGF0aWMgJGluamVjdCA9IFsnJHNjb3BlJywgJyRyb290U2NvcGUnLCAnYWRhbEF1dGhlbnRpY2F0aW9uU2VydmljZScsICckbG9jYXRpb24nLCAnJHJvdXRlJywgJ3VzZXJTZXJ2aWNlJywgJ3VudGFwcGRTZXJ2aWNlJywgJ3ZvdGVTZXJ2aWNlJ107XHJcblxyXG4gICAgICAgIGNvbnN0cnVjdG9yKCRzY29wZTogTW9kZWwuSURYTGlxdWlkSW50ZWxTY29wZSxcclxuICAgICAgICAgICAgJHJvb3RTY29wZTogTW9kZWwuSURYTGlxdWlkSW50ZWxTY29wZSxcclxuICAgICAgICAgICAgYWRhbEF1dGhlbnRpY2F0aW9uU2VydmljZSxcclxuICAgICAgICAgICAgJGxvY2F0aW9uOiBuZy5JTG9jYXRpb25TZXJ2aWNlLFxyXG4gICAgICAgICAgICAkcm91dGU6IG5nLnJvdXRlLklSb3V0ZVNlcnZpY2UsXHJcbiAgICAgICAgICAgIHVzZXJTZXJ2aWNlOiBTZXJ2aWNlLlVzZXJTZXJ2aWNlLFxyXG4gICAgICAgICAgICBwcm90ZWN0ZWQgdW50YXBwZFNlcnZpY2U6IFNlcnZpY2UuVW50YXBwZEFwaVNlcnZpY2UsXHJcbiAgICAgICAgICAgIHByb3RlY3RlZCB2b3RlU2VydmljZTogU2VydmljZS5Wb3RlU2VydmljZSkge1xyXG5cclxuICAgICAgICAgICAgc3VwZXIoJHNjb3BlLCAkcm9vdFNjb3BlLCBhZGFsQXV0aGVudGljYXRpb25TZXJ2aWNlLCAkbG9jYXRpb24sIHVzZXJTZXJ2aWNlLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFRpdGxlRm9yUm91dGUoJHJvdXRlLmN1cnJlbnQpO1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLmJ1dHRvbkJhckJ1dHRvbnMgPSBbXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IE1vZGVsLkJ1dHRvbkJhckJ1dHRvbihcIkNvbW1pdFwiLCAkc2NvcGUsIFwidm90ZUZvcm0uJHZhbGlkICYmIHZvdGVGb3JtLiRkaXJ0eSAmJiAhdXBkYXRlSW5Qcm9ncmVzc1wiLCAoKSA9PiB0aGlzLnVwZGF0ZSgpLCB0cnVlKSxcclxuICAgICAgICAgICAgICAgICAgICBuZXcgTW9kZWwuQnV0dG9uQmFyQnV0dG9uKFwiUmV2ZXJ0XCIsICRzY29wZSwgXCIhdXBkYXRlSW5Qcm9ncmVzc1wiLCAoKSA9PiB0aGlzLnBvcHVsYXRlKCksIGZhbHNlKVxyXG4gICAgICAgICAgICAgICAgXTtcclxuICAgICAgICAgICAgICAgICRzY29wZS5zZWFyY2hCZWVycyA9IChzZWFyY2hUZXJtOiBzdHJpbmcpID0+IHRoaXMuc2VhcmNoQmVlcnMoc2VhcmNoVGVybSk7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUudXBkYXRlVm90ZXMgPSAoKSA9PiB0aGlzLnVwZGF0ZSgpO1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLmNsZWFyVm90ZSA9ICh2b3RlKSA9PiB0aGlzLnJlc2V0Vm90ZSh2b3RlKTtcclxuICAgICAgICAgICAgICAgIHRoaXMucG9wdWxhdGUoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHNlYXJjaEJlZXJzKHNlYXJjaFRlcm06IHN0cmluZyk6IFByb21pc2VMaWtlPGFueT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy51bnRhcHBkU2VydmljZS5zZWFyY2hCZWVycyhzZWFyY2hUZXJtLCB0aGlzLiRzY29wZS5zeXN0ZW1Vc2VySW5mby5VbnRhcHBkQWNjZXNzVG9rZW4pXHJcbiAgICAgICAgICAgICAgICAudGhlbigocmVzcCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXNwLnJlc3BvbnNlLmJlZXJzLml0ZW1zLm1hcCgoYmVlcikgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdW50YXBwZElkOiBiZWVyLmJlZXIuYmlkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogYmVlci5iZWVyLmJlZXJfbmFtZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlidTogYmVlci5iZWVyLmJlZXJfaWJ1LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWJ2OiBiZWVyLmJlZXIuYmVlcl9hYnYsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogYmVlci5iZWVyLmJlZXJfZGVzY3JpcHRpb24sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmV3ZXJ5OiBiZWVyLmJyZXdlcnkuYnJld2VyeV9uYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2U6IGJlZXIuYmVlci5iZWVyX2xhYmVsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgKHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBcIkFuIGVycm9yIG9jY3VyZWRcIjtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBub3JtYWxpemVWb3Rlc0FycmF5KHNvdXJjZVZvdGVzOiBNb2RlbC5Wb3RlW10pOiBNb2RlbC5Wb3RlW10ge1xyXG4gICAgICAgICAgICB3aGlsZSAoc291cmNlVm90ZXMubGVuZ3RoIDwgMikge1xyXG4gICAgICAgICAgICAgICAgc291cmNlVm90ZXMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgVm90ZUlkOiAwLFxyXG4gICAgICAgICAgICAgICAgICAgIFBlcnNvbm5lbE51bWJlcjogdGhpcy4kc2NvcGUuc3lzdGVtVXNlckluZm8uUGVyc29ubmVsTnVtYmVyLFxyXG4gICAgICAgICAgICAgICAgICAgIFZvdGVEYXRlOiBuZXcgRGF0ZSgpLFxyXG4gICAgICAgICAgICAgICAgICAgIFVudGFwcGRJZDogMFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgc291cmNlVm90ZXMuZm9yRWFjaCgodm90ZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdm90ZS5CZWVySW5mbyA9IHtcclxuICAgICAgICAgICAgICAgICAgICB1bnRhcHBkSWQ6IHZvdGUuVW50YXBwZElkLFxyXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IHZvdGUuQmVlck5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgYnJld2VyeTogdm90ZS5CcmV3ZXJ5XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICByZXR1cm4gc291cmNlVm90ZXM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIGFzeW5jIHBvcHVsYXRlKCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRVcGRhdGVTdGF0ZSh0cnVlKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuJHNjb3BlLmxvYWRpbmdNZXNzYWdlID0gXCJSZXRyaWV2aW5nIHByZXZpb3VzIHZvdGVzLi4uXCI7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRzY29wZS5lcnJvciA9IFwiXCI7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRzY29wZS52b3RlcyA9IHRoaXMubm9ybWFsaXplVm90ZXNBcnJheShhd2FpdCB0aGlzLnZvdGVTZXJ2aWNlLmdldFVzZXJWb3Rlcyh0aGlzLiRzY29wZS5zeXN0ZW1Vc2VySW5mby5QZXJzb25uZWxOdW1iZXIpKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0VXBkYXRlU3RhdGUoZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kc2NvcGUubG9hZGluZ01lc3NhZ2UgPSBcIlwiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhdGNoIChleCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRFcnJvcih0cnVlLCBleC5kYXRhIHx8IGV4LnN0YXR1c1RleHQsIGV4LmhlYWRlcnMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHJlc2V0Vm90ZSh2b3RlOiBNb2RlbC5Wb3RlKSB7XHJcbiAgICAgICAgICAgIC8vIERvbid0IHJlc2V0IHRoZSB2b3RlIGlkIGFzIHdlIG5lZWQgdG8gZGV0ZWN0IGlmIHRoaXMgaXMgYSBkZWxldGVcclxuICAgICAgICAgICAgdm90ZS5QZXJzb25uZWxOdW1iZXIgPSB0aGlzLiRzY29wZS5zeXN0ZW1Vc2VySW5mby5QZXJzb25uZWxOdW1iZXI7XHJcbiAgICAgICAgICAgIHZvdGUuVm90ZURhdGUgPSBuZXcgRGF0ZSgpO1xyXG4gICAgICAgICAgICB2b3RlLlVudGFwcGRJZCA9IDA7XHJcbiAgICAgICAgICAgIHZvdGUuQmVlck5hbWUgPSAnJztcclxuICAgICAgICAgICAgdm90ZS5CcmV3ZXJ5ID0gJyc7XHJcbiAgICAgICAgICAgIHZvdGUuQmVlckluZm8gPSBudWxsO1xyXG4gICAgICAgICAgICB0aGlzLiRzY29wZS52b3RlRm9ybS4kc2V0RGlydHkoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgYXN5bmMgdXBkYXRlKCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kc2NvcGUubG9hZGluZ01lc3NhZ2UgPSBcIlNhdmluZyB2b3Rlcy4uLlwiO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRVcGRhdGVTdGF0ZSh0cnVlKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuJHNjb3BlLnZvdGVzLmZvckVhY2goKHZvdGU6IE1vZGVsLlZvdGUpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodm90ZS5CZWVySW5mbykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2b3RlLlVudGFwcGRJZCA9IHZvdGUuQmVlckluZm8udW50YXBwZElkO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2b3RlLkJlZXJOYW1lID0gdm90ZS5CZWVySW5mby5uYW1lO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2b3RlLkJyZXdlcnkgPSB2b3RlLkJlZXJJbmZvLmJyZXdlcnk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRzY29wZS52b3RlcyA9IHRoaXMubm9ybWFsaXplVm90ZXNBcnJheShhd2FpdCB0aGlzLnZvdGVTZXJ2aWNlLnVwZGF0ZVVzZXJWb3Rlcyh0aGlzLiRzY29wZS5zeXN0ZW1Vc2VySW5mby5QZXJzb25uZWxOdW1iZXIsIHRoaXMuJHNjb3BlLnZvdGVzKSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRzY29wZS52b3RlRm9ybS4kc2V0UHJpc3RpbmUoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0VXBkYXRlU3RhdGUoZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kc2NvcGUuZXJyb3IgPSBcIlwiO1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kc2NvcGUubG9hZGluZ01lc3NhZ2UgPSBcIlwiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhdGNoIChleCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRFcnJvcih0cnVlLCBleC5kYXRhIHx8IGV4LnN0YXR1c1RleHQsIGV4LmhlYWRlcnMpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRVcGRhdGVTdGF0ZShmYWxzZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0gIiwiLy8gICAgIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiAgQWxsIHJpZ2h0cyByZXNlcnZlZC5cclxuXHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9yZWZlcmVuY2VzL2luZGV4LmQudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9Db250cm9sbGVyQmFzZS50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9TZXJ2aWNlL1VudGFwcGRBcGlTZXJ2aWNlLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL1NlcnZpY2UvVm90ZVNlcnZpY2UudHNcIiAvPlxyXG5cclxubW9kdWxlIERYTGlxdWlkSW50ZWwuQXBwLkNvbnRyb2xsZXIge1xyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBWb3RlUmVzdWx0c0NvbnRyb2xsZXIgZXh0ZW5kcyBDb250cm9sbGVyQmFzZSB7XHJcbiAgICAgICAgc3RhdGljICRpbmplY3QgPSBbJyRzY29wZScsICckcm9vdFNjb3BlJywgJ2FkYWxBdXRoZW50aWNhdGlvblNlcnZpY2UnLCAnJGxvY2F0aW9uJywgJyRyb3V0ZScsICd1c2VyU2VydmljZScsICd1bnRhcHBkU2VydmljZScsICd2b3RlU2VydmljZSddO1xyXG5cclxuICAgICAgICBjb25zdHJ1Y3Rvcigkc2NvcGU6IE1vZGVsLklEWExpcXVpZEludGVsU2NvcGUsXHJcbiAgICAgICAgICAgICRyb290U2NvcGU6IE1vZGVsLklEWExpcXVpZEludGVsU2NvcGUsXHJcbiAgICAgICAgICAgIGFkYWxBdXRoZW50aWNhdGlvblNlcnZpY2UsXHJcbiAgICAgICAgICAgICRsb2NhdGlvbjogbmcuSUxvY2F0aW9uU2VydmljZSxcclxuICAgICAgICAgICAgJHJvdXRlOiBuZy5yb3V0ZS5JUm91dGVTZXJ2aWNlLFxyXG4gICAgICAgICAgICB1c2VyU2VydmljZTogU2VydmljZS5Vc2VyU2VydmljZSxcclxuICAgICAgICAgICAgcHJvdGVjdGVkIHVudGFwcGRTZXJ2aWNlOiBTZXJ2aWNlLlVudGFwcGRBcGlTZXJ2aWNlLFxyXG4gICAgICAgICAgICBwcm90ZWN0ZWQgdm90ZVNlcnZpY2U6IFNlcnZpY2UuVm90ZVNlcnZpY2UpIHtcclxuXHJcbiAgICAgICAgICAgIHN1cGVyKCRzY29wZSwgJHJvb3RTY29wZSwgYWRhbEF1dGhlbnRpY2F0aW9uU2VydmljZSwgJGxvY2F0aW9uLCB1c2VyU2VydmljZSwgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRUaXRsZUZvclJvdXRlKCRyb3V0ZS5jdXJyZW50KTtcclxuICAgICAgICAgICAgICAgICRzY29wZS5idXR0b25CYXJCdXR0b25zID0gW107XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBvcHVsYXRlKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBhc3luYyBwb3B1bGF0ZSgpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0VXBkYXRlU3RhdGUodHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRzY29wZS5sb2FkaW5nTWVzc2FnZSA9IFwiUmV0cmlldmluZyBjdXJyZW50IHZvdGUgdGFsbGllcy4uLlwiO1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kc2NvcGUuZXJyb3IgPSBcIlwiO1xyXG4gICAgICAgICAgICAgICAgbGV0IHZvdGVzVGFsbHkgPSBhd2FpdCB0aGlzLnZvdGVTZXJ2aWNlLmdldFZvdGVUYWxseSgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kc2NvcGUudm90ZXNUYWxseSA9IHZvdGVzVGFsbHk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRzY29wZS5sb2FkaW5nTWVzc2FnZSA9IFwiXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2F0Y2ggKGV4KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldEVycm9yKHRydWUsIGV4LmRhdGEgfHwgZXguc3RhdHVzVGV4dCwgZXguaGVhZGVycyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0gIiwiLy8gICAgIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiAgQWxsIHJpZ2h0cyByZXNlcnZlZC5cclxuXHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9yZWZlcmVuY2VzL2luZGV4LmQudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9Db250cm9sbGVyQmFzZS50c1wiIC8+XHJcblxyXG5tb2R1bGUgRFhMaXF1aWRJbnRlbC5BcHAuQ29udHJvbGxlciB7XHJcblxyXG4gICAgZXhwb3J0IGNsYXNzIEFuYWx5dGljc0NvbnRyb2xsZXIgZXh0ZW5kcyBDb250cm9sbGVyQmFzZSB7XHJcbiAgICAgICAgc3RhdGljICRpbmplY3QgPSBbJyRzY29wZScsICckcm9vdFNjb3BlJywgJ2FkYWxBdXRoZW50aWNhdGlvblNlcnZpY2UnLCAnJGxvY2F0aW9uJywgJyRyb3V0ZScsICd1c2VyU2VydmljZSddO1xyXG5cclxuICAgICAgICBjb25zdHJ1Y3Rvcigkc2NvcGU6IE1vZGVsLklEWExpcXVpZEludGVsU2NvcGUsXHJcbiAgICAgICAgICAgICRyb290U2NvcGU6IE1vZGVsLklEWExpcXVpZEludGVsU2NvcGUsXHJcbiAgICAgICAgICAgIGFkYWxBdXRoZW50aWNhdGlvblNlcnZpY2UsXHJcbiAgICAgICAgICAgICRsb2NhdGlvbjogbmcuSUxvY2F0aW9uU2VydmljZSxcclxuICAgICAgICAgICAgJHJvdXRlOiBuZy5yb3V0ZS5JUm91dGVTZXJ2aWNlLFxyXG4gICAgICAgICAgICB1c2VyU2VydmljZTogU2VydmljZS5Vc2VyU2VydmljZSkge1xyXG5cclxuICAgICAgICAgICAgc3VwZXIoJHNjb3BlLCAkcm9vdFNjb3BlLCBhZGFsQXV0aGVudGljYXRpb25TZXJ2aWNlLCAkbG9jYXRpb24sIHVzZXJTZXJ2aWNlLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFRpdGxlRm9yUm91dGUoJHJvdXRlLmN1cnJlbnQpO1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLmJ1dHRvbkJhckJ1dHRvbnMgPSBbXTtcclxuICAgICAgICAgICAgICAgIHRoaXMucG9wdWxhdGUoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIGFzeW5jIHBvcHVsYXRlKCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRVcGRhdGVTdGF0ZSh0cnVlKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuJHNjb3BlLmxvYWRpbmdNZXNzYWdlID0gXCJSZXRyaWV2aW5nIGJlZXIgYW5hbHl0aWNzLi4uXCI7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRzY29wZS5lcnJvciA9IFwiXCI7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRzY29wZS5sb2FkaW5nTWVzc2FnZSA9IFwiXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2F0Y2ggKGV4KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldEVycm9yKHRydWUsIGV4LmRhdGEgfHwgZXguc3RhdHVzVGV4dCwgZXguaGVhZGVycyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0gIiwiLy8gICAgIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiAgQWxsIHJpZ2h0cyByZXNlcnZlZC5cclxuXHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9yZWZlcmVuY2VzL2luZGV4LmQudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9Db250cm9sbGVyQmFzZS50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9TZXJ2aWNlL1VzZXJTZXJ2aWNlLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL1NlcnZpY2UvRGFzaGJvYXJkU2VydmljZS50c1wiIC8+XHJcblxyXG5tb2R1bGUgRFhMaXF1aWRJbnRlbC5BcHAuQ29udHJvbGxlciB7XHJcblxyXG4gICAgZXhwb3J0IGNsYXNzIEhvbWVDb250cm9sbGVyIGV4dGVuZHMgQ29udHJvbGxlckJhc2Uge1xyXG4gICAgICAgIHN0YXRpYyAkaW5qZWN0ID0gWyckc2NvcGUnLCAnJHJvb3RTY29wZScsICdhZGFsQXV0aGVudGljYXRpb25TZXJ2aWNlJywgJyRsb2NhdGlvbicsICckcm91dGUnLCAndXNlclNlcnZpY2UnLCAnZGFzaGJvYXJkU2VydmljZScsICckaW50ZXJ2YWwnXTtcclxuXHJcbiAgICAgICAgY29uc3RydWN0b3IoJHNjb3BlOiBNb2RlbC5JRFhMaXF1aWRJbnRlbFNjb3BlLFxyXG4gICAgICAgICAgICAkcm9vdFNjb3BlOiBNb2RlbC5JRFhMaXF1aWRJbnRlbFNjb3BlLFxyXG4gICAgICAgICAgICBhZGFsQXV0aGVudGljYXRpb25TZXJ2aWNlLFxyXG4gICAgICAgICAgICAkbG9jYXRpb246IG5nLklMb2NhdGlvblNlcnZpY2UsXHJcbiAgICAgICAgICAgICRyb3V0ZTogbmcucm91dGUuSVJvdXRlU2VydmljZSxcclxuICAgICAgICAgICAgdXNlclNlcnZpY2U6IFNlcnZpY2UuVXNlclNlcnZpY2UsXHJcbiAgICAgICAgICAgIHByb3RlY3RlZCBkYXNoYm9hcmRTZXJ2aWNlOiBTZXJ2aWNlLkRhc2hib2FyZFNlcnZpY2UsXHJcbiAgICAgICAgICAgICRpbnRlcnZhbDogbmcuSUludGVydmFsU2VydmljZSkge1xyXG5cclxuICAgICAgICAgICAgc3VwZXIoJHNjb3BlLCAkcm9vdFNjb3BlLCBhZGFsQXV0aGVudGljYXRpb25TZXJ2aWNlLCAkbG9jYXRpb24sIHVzZXJTZXJ2aWNlLCAoKSA9PiB7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRUaXRsZUZvclJvdXRlKCRyb3V0ZS5jdXJyZW50KTtcclxuICAgICAgICAgICAgICAgIHRoaXMucG9wdWxhdGUoKTtcclxuICAgICAgICAgICAgICAgIHZhciBpbnRlcnZhbFByb21pc2UgPSAkaW50ZXJ2YWwoKCkgPT4gdGhpcy5wb3B1bGF0ZSgpLCA1MDAwKTsgICAgICBcclxuICAgICAgICAgICAgICAgICRzY29wZS4kb24oJyRkZXN0cm95JywgKCkgPT4gJGludGVydmFsLmNhbmNlbChpbnRlcnZhbFByb21pc2UpKTsgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJvdGVjdGVkIGFzeW5jIHBvcHVsYXRlKCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgICAgICAgICB0aGlzLiRzY29wZS5jdXJyZW50VGFwcyA9IGF3YWl0IHRoaXMuZGFzaGJvYXJkU2VydmljZS5nZXRLZWdTdGF0dXMoKTtcclxuICAgICAgICAgICAgdGhpcy4kc2NvcGUuY3VycmVudEFjdGl2aXRpZXMgPSBhd2FpdCB0aGlzLmRhc2hib2FyZFNlcnZpY2UuZ2V0TGF0ZXN0QWN0aXZpdGllcygyNSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59ICIsIi8vICAgICBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gIEFsbCByaWdodHMgcmVzZXJ2ZWQuXHJcblxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9yZWZlcmVuY2VzL2luZGV4LmQudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9TZXJ2aWNlL1VzZXJTZXJ2aWNlLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vU2VydmljZS9Wb3RlU2VydmljZS50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL1NlcnZpY2UvRGFzaGJvYXJkU2VydmljZS50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL0NvbnRyb2xsZXIvVXNlckNvbnRyb2xsZXIudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9Db250cm9sbGVyL1ZvdGVCZWVyQ29udHJvbGxlci50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL0NvbnRyb2xsZXIvVm90ZVJlc3VsdHNDb250cm9sbGVyLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vQ29udHJvbGxlci9BbmFseXRpY3NDb250cm9sbGVyLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vQ29udHJvbGxlci9Ib21lQ29udHJvbGxlci50c1wiIC8+XHJcblxyXG5tb2R1bGUgRFhMaXF1aWRJbnRlbC5BcHAge1xyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBBcHBCdWlsZGVyIHtcclxuXHJcbiAgICAgICAgcHJpdmF0ZSBhcHA6IG5nLklNb2R1bGU7XHJcblxyXG4gICAgICAgIGNvbnN0cnVjdG9yKG5hbWU6IHN0cmluZykge1xyXG4gICAgICAgICAgICB0aGlzLmFwcCA9IGFuZ3VsYXIubW9kdWxlKG5hbWUsIFtcclxuICAgICAgICAgICAgICAgIC8vIEFuZ3VsYXIgbW9kdWxlcyBcclxuICAgICAgICAgICAgICAgIFwibmdSb3V0ZVwiLFxyXG4gICAgICAgICAgICAgICAgXCJuZ1Jlc291cmNlXCIsXHJcbiAgICAgICAgICAgICAgICBcInVpLmJvb3RzdHJhcFwiLFxyXG4gICAgICAgICAgICAgICAgXCJlbnZpcm9ubWVudFwiLFxyXG4gICAgICAgICAgICAgICAgLy8gQURBTFxyXG4gICAgICAgICAgICAgICAgJ0FkYWxBbmd1bGFyJ1xyXG4gICAgICAgICAgICBdKTtcclxuICAgICAgICAgICAgdGhpcy5hcHAuY29uZmlnKFsnJHJvdXRlUHJvdmlkZXInLCAnJGh0dHBQcm92aWRlcicsICdhZGFsQXV0aGVudGljYXRpb25TZXJ2aWNlUHJvdmlkZXInLCAnZW52U2VydmljZVByb3ZpZGVyJyxcclxuICAgICAgICAgICAgICAgICgkcm91dGVQcm92aWRlcjogbmcucm91dGUuSVJvdXRlUHJvdmlkZXIsICRodHRwUHJvdmlkZXI6IG5nLklIdHRwUHJvdmlkZXIsIGFkYWxQcm92aWRlciwgZW52U2VydmljZVByb3ZpZGVyOiBhbmd1bGFyLmVudmlyb25tZW50LlNlcnZpY2VQcm92aWRlcikgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGVudlNlcnZpY2VQcm92aWRlci5jb25maWcoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkb21haW5zOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXZlbG9wbWVudDogWydsb2NhbGhvc3QnXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBwZTogWydkeC1saXF1aWRhcHAtc3RhZ2luZy5henVyZXdlYnNpdGVzLm5ldCddLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvZHVjdGlvbjogWydkeC1saXF1aWRhcHAuYXp1cmV3ZWJzaXRlcy5uZXQnXVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXJzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXZlbG9wbWVudDoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwaVVyaTogJy8vbG9jYWxob3N0OjgwODAvYXBpJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW5hbnQ6ICdtaWNyb3NvZnQuY29tJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHBDbGllbnRJZDogJzM1YTMzY2ZjLWZjNTItNDhjZi05MGY0LTIzYWQ2OWVmODViYycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBpQ2xpZW50SWQ6ICdiMWU4MDc0OC00M2MyLTQ0NTAtOTEyMS1jYmMwZGNjOTgwNTEnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwaVVzZXJuYW1lOiAnMDAwMS0wMDAxJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcGlQYXNzd29yZDogJ1pIaHNhWEYxYVdRdGNtRnpjR0psY25KNWNHaz0nXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHBlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBpVXJpOiAnLy9keGxpcXVpZGludGVsLXN0YWdpbmcuYXp1cmV3ZWJzaXRlcy5uZXQvYXBpJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW5hbnQ6ICdtaWNyb3NvZnQuY29tJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHBDbGllbnRJZDogJzM1YTMzY2ZjLWZjNTItNDhjZi05MGY0LTIzYWQ2OWVmODViYycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBpQ2xpZW50SWQ6ICdiMWU4MDc0OC00M2MyLTQ0NTAtOTEyMS1jYmMwZGNjOTgwNTEnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwaVVzZXJuYW1lOiAnMDAwMS0wMDAxJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcGlQYXNzd29yZDogJ1pIaHNhWEYxYVdRdGNtRnpjR0psY25KNWNHaz0nXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvZHVjdGlvbjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwaVVyaTogJy8vZHhsaXF1aWRpbnRlbC5henVyZXdlYnNpdGVzLm5ldC9hcGknLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbmFudDogJ21pY3Jvc29mdC5jb20nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcENsaWVudElkOiAnMzVhMzNjZmMtZmM1Mi00OGNmLTkwZjQtMjNhZDY5ZWY4NWJjJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcGlDbGllbnRJZDogJ2IxZTgwNzQ4LTQzYzItNDQ1MC05MTIxLWNiYzBkY2M5ODA1MScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBpVXNlcm5hbWU6ICcwMDAxLTAwMDEnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwaVBhc3N3b3JkOiAnWkhoc2FYRjFhV1F0Y21GemNHSmxjbko1Y0drPSdcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIGVudlNlcnZpY2VQcm92aWRlci5jaGVjaygpO1xyXG4gICAgICAgICAgICAgICAgICAgICRyb3V0ZVByb3ZpZGVyXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC53aGVuKFwiL0hvbWVcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogXCJIb21lXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBDb250cm9sbGVyLkhvbWVDb250cm9sbGVyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6IFwiL3ZpZXdzL2hvbWUuaHRtbFwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZUluc2Vuc2l0aXZlTWF0Y2g6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC53aGVuKFwiL1VzZXJcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxhZGFsLnNoYXJlZC5JTmF2Um91dGU+e1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IFwiVXNlclwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6IENvbnRyb2xsZXIuVXNlckNvbnRyb2xsZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6IFwiL1ZpZXdzL1VzZXIuaHRtbFwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcXVpcmVBRExvZ2luOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2VJbnNlbnNpdGl2ZU1hdGNoOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAud2hlbihcIi9Wb3RlQmVlclwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGFkYWwuc2hhcmVkLklOYXZSb3V0ZT57XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogXCJWb3RlQmVlclwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6IENvbnRyb2xsZXIuVm90ZUJlZXJDb250cm9sbGVyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBcIi9WaWV3cy9Wb3RlQmVlci5odG1sXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVxdWlyZUFETG9naW46IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZUluc2Vuc2l0aXZlTWF0Y2g6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC53aGVuKFwiL1ZvdGVSZXN1bHRzXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YWRhbC5zaGFyZWQuSU5hdlJvdXRlPntcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBcIlZvdGVSZXN1bHRzXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogQ29udHJvbGxlci5Wb3RlUmVzdWx0c0NvbnRyb2xsZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6IFwiL1ZpZXdzL1ZvdGVSZXN1bHRzLmh0bWxcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXF1aXJlQURMb2dpbjogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlSW5zZW5zaXRpdmVNYXRjaDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgLndoZW4oXCIvQW5hbHl0aWNzXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YWRhbC5zaGFyZWQuSU5hdlJvdXRlPntcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBcIkFuYWx5dGljc1wiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6IENvbnRyb2xsZXIuQW5hbHl0aWNzQ29udHJvbGxlcixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogXCIvVmlld3MvQW5hbHl0aWNzLmh0bWxcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXF1aXJlQURMb2dpbjogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlSW5zZW5zaXRpdmVNYXRjaDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgLm90aGVyd2lzZShcclxuICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVkaXJlY3RUbzogXCIvSG9tZVwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIENvbmZpZ3VyZSBBREFMLlxyXG4gICAgICAgICAgICAgICAgICAgIHZhciBhZGFsQ29uZmlnID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZW5hbnQ6IGVudlNlcnZpY2VQcm92aWRlci5yZWFkKCd0ZW5hbnQnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2xpZW50SWQ6IGVudlNlcnZpY2VQcm92aWRlci5yZWFkKCdhcHBDbGllbnRJZCcpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYWNoZUxvY2F0aW9uOiB3aW5kb3cubG9jYXRpb24uaG9zdG5hbWUgPT09IFwibG9jYWxob3N0XCIgPyBcImxvY2FsU3RvcmFnZVwiIDogXCJcIiwgLy8gZW5hYmxlIHRoaXMgZm9yIElFLCBhcyBzZXNzaW9uU3RvcmFnZSBkb2VzIG5vdCB3b3JrIGZvciBsb2NhbGhvc3QuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuZHBvaW50czoge30sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFub255bW91c0VuZHBvaW50czogW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZW52U2VydmljZVByb3ZpZGVyLnJlYWQoJ2FwaVVyaScpICsgJy9DdXJyZW50S2VnJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVudlNlcnZpY2VQcm92aWRlci5yZWFkKCdhcGlVcmknKSArICcvYWN0aXZpdHknXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgIGFkYWxDb25maWcuZW5kcG9pbnRzW2VudlNlcnZpY2VQcm92aWRlci5yZWFkKCdhcGlVcmknKV0gPSBlbnZTZXJ2aWNlUHJvdmlkZXIucmVhZCgnYXBpQ2xpZW50SWQnKTtcclxuICAgICAgICAgICAgICAgICAgICBhZGFsUHJvdmlkZXIuaW5pdChhZGFsQ29uZmlnLCAkaHR0cFByb3ZpZGVyKTtcclxuICAgICAgICAgICAgICAgIH1dKTtcclxuICAgICAgICAgICAgdGhpcy5hcHAuc2VydmljZSgnY29uZmlnU2VydmljZScsIFNlcnZpY2UuQ29uZmlnU2VydmljZSk7XHJcbiAgICAgICAgICAgIHRoaXMuYXBwLnNlcnZpY2UoJ3VzZXJTZXJ2aWNlJywgU2VydmljZS5Vc2VyU2VydmljZSk7XHJcbiAgICAgICAgICAgIHRoaXMuYXBwLnNlcnZpY2UoJ3VudGFwcGRTZXJ2aWNlJywgU2VydmljZS5VbnRhcHBkQXBpU2VydmljZSk7XHJcbiAgICAgICAgICAgIHRoaXMuYXBwLnNlcnZpY2UoJ3ZvdGVTZXJ2aWNlJywgU2VydmljZS5Wb3RlU2VydmljZSk7XHJcbiAgICAgICAgICAgIHRoaXMuYXBwLnNlcnZpY2UoJ2Rhc2hib2FyZFNlcnZpY2UnLCBTZXJ2aWNlLkRhc2hib2FyZFNlcnZpY2UpO1xyXG4gICAgICAgICAgICB0aGlzLmFwcC5ydW4oWyckd2luZG93JywgJyRxJywgJyRsb2NhdGlvbicsICckcm91dGUnLCAnJHJvb3RTY29wZScsICgkd2luZG93LCAkcSwgJGxvY2F0aW9uLCAkcm91dGUsICRyb290U2NvcGUpID0+IHtcclxuICAgICAgICAgICAgICAgIC8vIE1ha2UgYW5ndWxhcidzIHByb21pc2VzIHRoZSBkZWZhdWx0IGFzIHRoYXQgd2lsbCBzdGlsbCBpbnRlZ3JhdGUgd2l0aCBhbmd1bGFyJ3MgZGlnZXN0IGN5Y2xlIGFmdGVyIGF3YWl0c1xyXG4gICAgICAgICAgICAgICAgJHdpbmRvdy5Qcm9taXNlID0gJHE7XHJcbiAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRvbignJGxvY2F0aW9uQ2hhbmdlU3RhcnQnLCAoZXZlbnQsIG5ld1VybCwgb2xkVXJsKSA9PiB0aGlzLmxvY2F0aW9uQ2hhbmdlSGFuZGxlcigkcm9vdFNjb3BlLCAkbG9jYXRpb24pKTtcclxuICAgICAgICAgICAgfV0pOyAgICAgICAgICAgIFxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBsb2NhdGlvbkNoYW5nZUhhbmRsZXIoJHJvb3RTY29wZSwgJGxvY2F0aW9uKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHZhciBoYXNoID0gJyc7XHJcbiAgICAgICAgICAgIGlmICgkbG9jYXRpb24uJCRodG1sNSkge1xyXG4gICAgICAgICAgICAgICAgaGFzaCA9ICRsb2NhdGlvbi5oYXNoKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBoYXNoID0gJyMnICsgJGxvY2F0aW9uLnBhdGgoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBVc2UgQURBTCBmb3IgdXJsIHJlc3BvbnNlIHBhcnNpbmdcclxuICAgICAgICAgICAgdmFyIF9hZGFsOiBhbnkgPSBuZXcgQXV0aGVudGljYXRpb25Db250ZXh0KHtjbGllbnRJZDonJ30pO1xyXG4gICAgICAgICAgICBoYXNoID0gX2FkYWwuX2dldEhhc2goaGFzaCk7XHJcbiAgICAgICAgICAgIHZhciBwYXJhbWV0ZXJzID0gX2FkYWwuX2Rlc2VyaWFsaXplKGhhc2gpO1xyXG4gICAgICAgICAgICBpZiAocGFyYW1ldGVycy5oYXNPd25Qcm9wZXJ0eSgnYWNjZXNzX3Rva2VuJykpIHtcclxuICAgICAgICAgICAgICAgICRyb290U2NvcGUudW50YXBwZWRQb3N0QmFja1Rva2VuID0gcGFyYW1ldGVyc1snYWNjZXNzX3Rva2VuJ107XHJcbiAgICAgICAgICAgICAgICAkbG9jYXRpb24ucGF0aCgnVXNlcicpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgc3RhcnQoKTogdm9pZCB7XHJcbiAgICAgICAgICAgICQoZG9jdW1lbnQpLnJlYWR5KCgpID0+IHtcclxuICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJib290aW5nIFwiICsgdGhpcy5hcHAubmFtZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGluamVjdG9yID0gYW5ndWxhci5ib290c3RyYXAoZG9jdW1lbnQsIFt0aGlzLmFwcC5uYW1lXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJib290ZWQgYXBwOiBcIiArIGluamVjdG9yKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNhdGNoIChleCkge1xyXG4gICAgICAgICAgICAgICAgICAgICQoJyNCb290RXhjZXB0aW9uRGV0YWlscycpLnRleHQoZXgpO1xyXG4gICAgICAgICAgICAgICAgICAgICQoJyNBbmd1bGFyQm9vdEVycm9yJykuc2hvdygpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJhcHBidWlsZGVyLnRzXCIgLz5cclxuXHJcbm5ldyBEWExpcXVpZEludGVsLkFwcC5BcHBCdWlsZGVyKCdkeExpcXVpZEludGVsQXBwJykuc3RhcnQoKTsiLCIvLyAgICAgQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uICBBbGwgcmlnaHRzIHJlc2VydmVkLlxyXG5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL3JlZmVyZW5jZXMvaW5kZXguZC50c1wiIC8+XHJcblxyXG5tb2R1bGUgRFhMaXF1aWRJbnRlbC5BcHAuTW9kZWwge1xyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBCdXR0b25CYXJCdXR0b24ge1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKHB1YmxpYyBkaXNwbGF5VGV4dDogc3RyaW5nLFxyXG4gICAgICAgICAgICAkc2NvcGU6IE1vZGVsLklEWExpcXVpZEludGVsU2NvcGUsXHJcbiAgICAgICAgICAgIGVuYWJsZWRFeHByZXNzaW9uOiBzdHJpbmcsXHJcbiAgICAgICAgICAgIHB1YmxpYyBkb0NsaWNrOiBGdW5jdGlvbixcclxuICAgICAgICAgICAgcHVibGljIGlzU3VibWl0OiBib29sZWFuLFxyXG4gICAgICAgICAgICBwcml2YXRlIGltYWdlVXJsPzogc3RyaW5nKSB7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmVuYWJsZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgJHNjb3BlLiR3YXRjaChlbmFibGVkRXhwcmVzc2lvbiwgKG5ld1ZhbHVlOiBib29sZWFuKSA9PiB0aGlzLmVuYWJsZWQgPSBuZXdWYWx1ZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgZW5hYmxlZDogYm9vbGVhbjtcclxuICAgIH1cclxufSAiLCIvLyAgICAgQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uICBBbGwgcmlnaHRzIHJlc2VydmVkLlxyXG5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL3JlZmVyZW5jZXMvaW5kZXguZC50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJVc2VySW5mby50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJWb3RlLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIlRhcEluZm8udHNcIiAvPlxyXG5cclxubW9kdWxlIERYTGlxdWlkSW50ZWwuQXBwLk1vZGVsIHtcclxuXHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIElEWExpcXVpZEludGVsU2NvcGUgZXh0ZW5kcyBuZy5JU2NvcGUge1xyXG4gICAgICAgIHN5c3RlbVVzZXJJbmZvOiBVc2VySW5mb1xyXG4gICAgICAgIGlzQWRtaW46IEZ1bmN0aW9uXHJcbiAgICAgICAgdm90ZXM6IFZvdGVbXVxyXG4gICAgICAgIHZvdGVzVGFsbHk6IFZvdGVUYWxseVtdXHJcbiAgICAgICAgY3VycmVudFRhcHM6IFRhcEluZm9bXVxyXG4gICAgICAgIGN1cnJlbnRBY3Rpdml0aWVzOiBNb2RlbC5BY3Rpdml0eVtdXHJcbiAgICAgICAgdGl0bGU6IHN0cmluZ1xyXG4gICAgICAgIGVycm9yOiBzdHJpbmdcclxuICAgICAgICBlcnJvcl9jbGFzczogc3RyaW5nXHJcbiAgICAgICAgbG9hZGluZ01lc3NhZ2U6IHN0cmluZ1xyXG4gICAgICAgIGxvZ2luOiBGdW5jdGlvblxyXG4gICAgICAgIGxvZ291dDogRnVuY3Rpb25cclxuICAgICAgICBpc0NvbnRyb2xsZXJBY3RpdmU6IEZ1bmN0aW9uXHJcbiAgICAgICAgdW50YXBwZWRQb3N0QmFja1Rva2VuOiBzdHJpbmdcclxuICAgICAgICB1bnRhcHBkQXV0aGVudGljYXRpb25Vcmk6IHN0cmluZ1xyXG4gICAgICAgIGRpc2Nvbm5lY3RVbnRhcHBkVXNlcjogRnVuY3Rpb25cclxuICAgICAgICBkZWxldGVBY2NvdW50OiBGdW5jdGlvblxyXG4gICAgICAgIGdlbmVyYXRlU3RvcmFnZUtleTogRnVuY3Rpb25cclxuICAgICAgICBhcmVVcGRhdGVzQXZhaWxhYmxlOiBib29sZWFuXHJcbiAgICAgICAgdXBkYXRlQmFubmVyQ2xhc3M6IHN0cmluZ1xyXG4gICAgICAgIHVwZGF0ZUluUHJvZ3Jlc3M6IGJvb2xlYW5cclxuICAgICAgICB1cGRhdGVNZXNzYWdlOiBzdHJpbmdcclxuICAgICAgICBnZXRIdG1sRGVzY3JpcHRpb246IEZ1bmN0aW9uXHJcbiAgICAgICAgYXBwbHlVcGRhdGU6IEZ1bmN0aW9uXHJcbiAgICAgICAgdXBkYXRlQ29uZmlndXJhdGlvbjogRnVuY3Rpb25cclxuICAgICAgICB1cGRhdGVVc2VySW5mbzogRnVuY3Rpb25cclxuICAgICAgICBidXR0b25CYXJCdXR0b25zOiBCdXR0b25CYXJCdXR0b25bXVxyXG4gICAgfVxyXG59IFxyXG5cclxuIl19

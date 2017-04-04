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
            class BeerInfo {
            }
            Model.BeerInfo = BeerInfo;
        })(Model = App.Model || (App.Model = {}));
    })(App = DXLiquidIntel.App || (DXLiquidIntel.App = {}));
})(DXLiquidIntel || (DXLiquidIntel = {}));
//     Copyright (c) Microsoft Corporation.  All rights reserved.
/// <reference path="../references/index.d.ts" />
/// <reference path="BeerInfo.ts" />
var DXLiquidIntel;
(function (DXLiquidIntel) {
    var App;
    (function (App) {
        var Model;
        (function (Model) {
            class Vote {
            }
            Model.Vote = Vote;
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
            class Activity {
            }
            Model.Activity = Activity;
        })(Model = App.Model || (App.Model = {}));
    })(App = DXLiquidIntel.App || (DXLiquidIntel.App = {}));
})(DXLiquidIntel || (DXLiquidIntel = {}));
//     Copyright (c) Microsoft Corporation.  All rights reserved.
/// <reference path="../references/index.d.ts" />
var DXLiquidIntel;
(function (DXLiquidIntel) {
    var App;
    (function (App) {
        var Service;
        (function (Service) {
            class BasicAuthResource {
                constructor($resource, envService, url) {
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
                    this.resource = $resource(url, null, queryAction);
                }
                query(data) {
                    return this.resource.query(data).$promise;
                }
            }
            Service.BasicAuthResource = BasicAuthResource;
        })(Service = App.Service || (App.Service = {}));
    })(App = DXLiquidIntel.App || (DXLiquidIntel.App = {}));
})(DXLiquidIntel || (DXLiquidIntel = {}));
//     Copyright (c) Microsoft Corporation.  All rights reserved.
/// <reference path="../references/index.d.ts" />
/// <reference path="../Model/Activity.ts" />
/// <reference path="./BasicAuthResource.ts" />
var DXLiquidIntel;
(function (DXLiquidIntel) {
    var App;
    (function (App) {
        var Service;
        (function (Service) {
            class DashboardService {
                constructor($resource, envService) {
                    this.activityResource = new Service.BasicAuthResource($resource, envService, envService.read('apiUri') + '/activity');
                }
                getLatestActivities(count) {
                    return this.activityResource.query({
                        count: count
                    });
                }
            }
            DashboardService.$inject = ['$resource', 'envService'];
            Service.DashboardService = DashboardService;
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
            class Keg {
            }
            Model.Keg = Keg;
            class TapInfo extends Keg {
            }
            Model.TapInfo = TapInfo;
        })(Model = App.Model || (App.Model = {}));
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
/// <reference path="../Model/TapInfo.ts" />
/// <reference path="./BasicAuthResource.ts" />
var DXLiquidIntel;
(function (DXLiquidIntel) {
    var App;
    (function (App) {
        var Service;
        (function (Service) {
            class KegsService {
                constructor($resource, envService, adalService) {
                    this.$resource = $resource;
                    this.envService = envService;
                    this.adalService = adalService;
                    this.kegStatusResource = new Service.BasicAuthResource($resource, envService, envService.read('apiUri') + '/CurrentKeg');
                    this.kegUpdateResource = $resource(envService.read('apiUri') + '/kegs');
                }
                getTapsStatus() {
                    return this.kegStatusResource.query(null);
                }
                createNewKeg(keg) {
                    return this.kegUpdateResource.save(keg).$promise;
                }
                installKegOnTap(tapId, kegId, kegSize) {
                    return __awaiter(this, void 0, void 0, function* () {
                        // Because the /CurrentKeg uri has been configured for basic auth (the GET is displayed on the dashboard
                        // prior to login), we have to manually apply the bearer token for the PUT, which is protected.
                        var requestUri = this.envService.read('apiUri') + `/CurrentKeg/${tapId}`;
                        var token = yield this.adalService.acquireToken(this.adalService.getResourceForEndpoint(this.envService.read('apiUri')));
                        var installCurrentKegResource = this.$resource(requestUri, null, {
                            save: {
                                method: 'PUT',
                                headers: {
                                    Authorization: 'Bearer ' + token
                                }
                            }
                        });
                        return installCurrentKegResource.save(null, {
                            KegId: kegId,
                            KegSize: kegSize
                        }).$promise;
                    });
                }
            }
            KegsService.$inject = ['$resource', 'envService', 'adalAuthenticationService'];
            Service.KegsService = KegsService;
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
            class AuthorizedGroups {
            }
            Model.AuthorizedGroups = AuthorizedGroups;
            class GroupResult {
            }
            Model.GroupResult = GroupResult;
            class GroupSearchResults {
            }
            Model.GroupSearchResults = GroupSearchResults;
        })(Model = App.Model || (App.Model = {}));
    })(App = DXLiquidIntel.App || (DXLiquidIntel.App = {}));
})(DXLiquidIntel || (DXLiquidIntel = {}));
//     Copyright (c) Microsoft Corporation.  All rights reserved.
/// <reference path="../references/index.d.ts" />
/// <reference path="../Model/Admin.ts" />
/// <reference path="../Model/Kegs.ts" />
var DXLiquidIntel;
(function (DXLiquidIntel) {
    var App;
    (function (App) {
        var Service;
        (function (Service) {
            class AdminService {
                constructor($resource, envService) {
                    this.adminResource = $resource(envService.read('apiUri') + '/admin/:action', null, {
                        update: { method: 'PUT' }
                    });
                }
                getAuthorizedGroups() {
                    return this.adminResource.get({
                        action: 'AuthorizedGroups'
                    }).$promise;
                }
                updateAuthorizedGroups(groups) {
                    return this.adminResource.update({
                        action: 'AuthorizedGroups'
                    }, groups).$promise;
                }
                searchGroups(searchTerm) {
                    return this.adminResource.get({
                        action: 'AuthorizedGroups',
                        search: searchTerm
                    }).$promise;
                }
            }
            AdminService.$inject = ['$resource', 'envService'];
            Service.AdminService = AdminService;
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
/// <reference path="../references/index.d.ts" />
/// <reference path="./ConfigService.ts" />
/// <reference path="../Model/BeerInfo.ts" />
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
                        var results = yield this.resourceClass.get(data).$promise;
                        return results.response.beers.items.map((beer) => {
                            return {
                                untappdId: beer.beer.bid,
                                name: beer.beer.beer_name,
                                beer_type: beer.beer.beer_style,
                                ibu: beer.beer.beer_ibu,
                                abv: beer.beer.beer_abv,
                                description: beer.beer.beer_description,
                                brewery: beer.brewery.brewery_name,
                                image: beer.beer.beer_label
                            };
                        });
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
                    return __awaiter(this, void 0, void 0, function* () {
                        try {
                            return yield this.untappdService.searchBeers(searchTerm, this.$scope.systemUserInfo.UntappdAccessToken);
                        }
                        catch (ex) {
                            return null;
                        }
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
/// <reference path="../Service/KegsService.ts" />
var DXLiquidIntel;
(function (DXLiquidIntel) {
    var App;
    (function (App) {
        var Controller;
        (function (Controller) {
            class HomeController extends Controller.ControllerBase {
                constructor($scope, $rootScope, adalAuthenticationService, $location, $route, userService, dashboardService, kegsService, $interval) {
                    super($scope, $rootScope, adalAuthenticationService, $location, userService, () => {
                        this.setTitleForRoute($route.current);
                        this.populate();
                        var intervalPromise = $interval(() => this.populate(), 5000);
                        $scope.$on('$destroy', () => $interval.cancel(intervalPromise));
                    });
                    this.dashboardService = dashboardService;
                    this.kegsService = kegsService;
                }
                populate() {
                    return __awaiter(this, void 0, void 0, function* () {
                        this.$scope.currentTaps = yield this.kegsService.getTapsStatus();
                        this.$scope.currentActivities = yield this.dashboardService.getLatestActivities(25);
                    });
                }
            }
            HomeController.$inject = ['$scope', '$rootScope', 'adalAuthenticationService', '$location', '$route', 'userService', 'dashboardService', 'kegsService', '$interval'];
            Controller.HomeController = HomeController;
        })(Controller = App.Controller || (App.Controller = {}));
    })(App = DXLiquidIntel.App || (DXLiquidIntel.App = {}));
})(DXLiquidIntel || (DXLiquidIntel = {}));
//     Copyright (c) Microsoft Corporation.  All rights reserved.
/// <reference path="../references/index.d.ts" />
/// <reference path="./ControllerBase.ts" />
/// <reference path="../Service/AdminService.ts" />
var DXLiquidIntel;
(function (DXLiquidIntel) {
    var App;
    (function (App) {
        var Controller;
        (function (Controller) {
            class AuthorizedGroupsController extends Controller.ControllerBase {
                constructor($scope, $rootScope, adalAuthenticationService, $location, $route, userService, adminService) {
                    super($scope, $rootScope, adalAuthenticationService, $location, userService, () => {
                        this.setTitleForRoute($route.current);
                        $scope.buttonBarButtons = [
                            new App.Model.ButtonBarButton("Commit", $scope, "authorizedGroupsForm.$valid && authorizedGroupsForm.$dirty && !updateInProgress", () => this.update(), true),
                            new App.Model.ButtonBarButton("Revert", $scope, "!updateInProgress", () => this.populate(), false)
                        ];
                        $scope.addGroup = () => {
                            if (this.$scope.newGroup) {
                                this.$scope.authorizedGroups.AuthorizedGroups.push(this.$scope.newGroup.displayName);
                            }
                            this.$scope.newGroup = null;
                        };
                        $scope.deleteGroup = (group) => {
                            this.$scope.authorizedGroups.AuthorizedGroups.splice(this.$scope.authorizedGroups.AuthorizedGroups.indexOf(group), 1);
                            this.$scope.authorizedGroupsForm.$setDirty();
                        };
                        $scope.searchGroups = (searchTerm) => this.searchGroups(searchTerm);
                        $scope.updateAuthorizedGroups = () => this.update();
                        this.populate();
                    });
                    this.adminService = adminService;
                }
                searchGroups(searchTerm) {
                    return __awaiter(this, void 0, void 0, function* () {
                        var results = yield this.adminService.searchGroups(searchTerm);
                        return results.results;
                    });
                }
                populate() {
                    return __awaiter(this, void 0, void 0, function* () {
                        try {
                            this.setUpdateState(true);
                            this.$scope.loadingMessage = "Retrieving authorized groups...";
                            this.$scope.error = "";
                            this.$scope.authorizedGroups = yield this.adminService.getAuthorizedGroups();
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
                            this.$scope.loadingMessage = "Saving authorized groups...";
                            this.setUpdateState(true);
                            yield this.adminService.updateAuthorizedGroups(this.$scope.authorizedGroups);
                            this.$scope.authorizedGroupsForm.$setPristine();
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
            AuthorizedGroupsController.$inject = ['$scope', '$rootScope', 'adalAuthenticationService', '$location', '$route', 'userService', 'adminService'];
            Controller.AuthorizedGroupsController = AuthorizedGroupsController;
        })(Controller = App.Controller || (App.Controller = {}));
    })(App = DXLiquidIntel.App || (DXLiquidIntel.App = {}));
})(DXLiquidIntel || (DXLiquidIntel = {}));
//     Copyright (c) Microsoft Corporation.  All rights reserved.
/// <reference path="../references/index.d.ts" />
/// <reference path="./ControllerBase.ts" />
/// <reference path="../Service/KegsService.ts" />
/// <reference path="../Service/UntappdApiService.ts" />
var DXLiquidIntel;
(function (DXLiquidIntel) {
    var App;
    (function (App) {
        var Controller;
        (function (Controller) {
            class InstallKegsController extends Controller.ControllerBase {
                constructor($scope, $rootScope, adalAuthenticationService, $location, $route, userService, kegsService, untappdService) {
                    super($scope, $rootScope, adalAuthenticationService, $location, userService, () => {
                        this.setTitleForRoute($route.current);
                        $scope.buttonBarButtons = [
                            new App.Model.ButtonBarButton("Commit", $scope, "installKegsForm.$valid && installKegsForm.$dirty && !updateInProgress", () => this.update(), true),
                            new App.Model.ButtonBarButton("Revert", $scope, "!updateInProgress", () => this.populate(), false)
                        ];
                        $scope.searchBeers = (searchTerm) => this.searchBeers(searchTerm);
                        $scope.updateInstallKegs = () => this.update();
                        this.populate();
                    });
                    this.kegsService = kegsService;
                    this.untappdService = untappdService;
                }
                searchBeers(searchTerm) {
                    return __awaiter(this, void 0, void 0, function* () {
                        try {
                            return yield this.untappdService.searchBeers(searchTerm, this.$scope.systemUserInfo.UntappdAccessToken);
                        }
                        catch (ex) {
                            return null;
                        }
                    });
                }
                populate() {
                    return __awaiter(this, void 0, void 0, function* () {
                        try {
                            this.setUpdateState(true);
                            this.$scope.loadingMessage = "Retrieving current tap information...";
                            this.$scope.error = "";
                            this.$scope.currentTaps = this.normalizeTapInfo(yield this.kegsService.getTapsStatus(), true);
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
                            this.$scope.loadingMessage = "Installing new kegs...";
                            this.setUpdateState(true);
                            this.$scope.currentTaps = this.normalizeTapInfo(yield Promise.all(this.$scope.currentTaps.map((tapInfo) => __awaiter(this, void 0, void 0, function* () {
                                if (tapInfo.OriginalUntappdId !== tapInfo.BeerInfo.untappdId) {
                                    tapInfo.UntappdId = tapInfo.BeerInfo.untappdId;
                                    tapInfo.Name = tapInfo.BeerInfo.name;
                                    tapInfo.BeerType = tapInfo.BeerInfo.beer_type;
                                    tapInfo.IBU = tapInfo.BeerInfo.ibu;
                                    tapInfo.ABV = tapInfo.BeerInfo.abv;
                                    tapInfo.BeerDescription = tapInfo.BeerInfo.description;
                                    tapInfo.Brewery = tapInfo.BeerInfo.brewery;
                                    tapInfo.imagePath = tapInfo.BeerInfo.image;
                                    tapInfo.CurrentVolume = tapInfo.KegSize;
                                    var newKeg = yield this.kegsService.createNewKeg(tapInfo);
                                    yield this.kegsService.installKegOnTap(tapInfo.TapId, newKeg.KegId, tapInfo.KegSize);
                                    tapInfo.KegId = newKeg.KegId;
                                }
                                return tapInfo;
                            }))), true);
                            this.$scope.installKegsForm.$setPristine();
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
                normalizeTapInfo(currentTaps, includeEmptyTaps) {
                    if (includeEmptyTaps && currentTaps.length < 2) {
                        // If we don't currently have a keg installed on either tap, then create an empty object
                        if (!currentTaps[0] || currentTaps[0].TapId != 1) {
                            currentTaps.unshift(this.createEmptyTap(1));
                        }
                        if (!currentTaps[1] || currentTaps[1].TapId != 2) {
                            currentTaps.push(this.createEmptyTap(2));
                        }
                    }
                    return currentTaps.map(tapInfo => {
                        tapInfo.BeerInfo = {
                            untappdId: tapInfo.UntappdId,
                            name: tapInfo.Name,
                            beer_type: tapInfo.BeerType,
                            ibu: tapInfo.IBU,
                            abv: tapInfo.ABV,
                            description: tapInfo.BeerDescription,
                            brewery: tapInfo.Brewery,
                            image: tapInfo.imagePath
                        };
                        tapInfo.OriginalUntappdId = tapInfo.UntappdId;
                        tapInfo.getSetBeerInfo = (beerInfo) => this.getSetBeerInfo(tapInfo, beerInfo);
                        return tapInfo;
                    });
                }
                getSetBeerInfo(tapInfo, beerInfo) {
                    if (angular.isDefined(beerInfo)) {
                        // If the typeahead isn't bound to a popup selection, we just get the string
                        if (angular.isString(beerInfo)) {
                            tapInfo.BeerInfo = {
                                untappdId: null,
                                name: beerInfo
                            };
                        }
                        else if (angular.isObject(beerInfo)) {
                            tapInfo.BeerInfo = beerInfo;
                        }
                        else {
                            console.warn('Typeadhead binding to unexpected data: ' + beerInfo);
                            tapInfo.BeerInfo = {
                                untappdId: null,
                                name: ''
                            };
                        }
                    }
                    return tapInfo.BeerInfo;
                }
                createEmptyTap(tapId) {
                    return {
                        TapId: tapId,
                        InstallDate: new Date(),
                        KegSize: 0,
                        CurrentVolume: 0,
                        KegId: null,
                        Name: '',
                        UntappdId: 0,
                        Brewery: '',
                        BeerType: '',
                        BeerDescription: '',
                        imagePath: ''
                    };
                }
            }
            InstallKegsController.$inject = ['$scope', '$rootScope', 'adalAuthenticationService', '$location', '$route', 'userService', 'kegsService', 'untappdService'];
            Controller.InstallKegsController = InstallKegsController;
        })(Controller = App.Controller || (App.Controller = {}));
    })(App = DXLiquidIntel.App || (DXLiquidIntel.App = {}));
})(DXLiquidIntel || (DXLiquidIntel = {}));
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
                            .when("/AuthorizedGroups", {
                            name: "AuthorizedGroups",
                            controller: App.Controller.AuthorizedGroupsController,
                            templateUrl: "/Views/AuthorizedGroups.html",
                            requireADLogin: true,
                            caseInsensitiveMatch: true,
                        })
                            .when("/InstallKegs", {
                            name: "InstallKegs",
                            controller: App.Controller.InstallKegsController,
                            templateUrl: "/Views/InstallKegs.html",
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
                            ],
                            extraQueryParameter: 'resource=https%3A%2F%2Fmanagement.core.windows.net%2F'
                        };
                        adalConfig.endpoints[envServiceProvider.read('apiUri')] = envServiceProvider.read('apiClientId');
                        adalProvider.init(adalConfig, $httpProvider);
                    }]);
                this.app.service('configService', App.Service.ConfigService);
                this.app.service('userService', App.Service.UserService);
                this.app.service('untappdService', App.Service.UntappdApiService);
                this.app.service('voteService', App.Service.VoteService);
                this.app.service('dashboardService', App.Service.DashboardService);
                this.app.service('kegsService', App.Service.KegsService);
                this.app.service('adminService', App.Service.AdminService);
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
/// <reference path="Admin.ts" />

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIk1vZGVsL1VzZXJJbmZvLnRzIiwiU2VydmljZS9Vc2VyU2VydmljZS50cyIsIk1vZGVsL0JlZXJJbmZvLnRzIiwiTW9kZWwvVm90ZS50cyIsIlNlcnZpY2UvVm90ZVNlcnZpY2UudHMiLCJNb2RlbC9BY3Rpdml0eS50cyIsIlNlcnZpY2UvQmFzaWNBdXRoUmVzb3VyY2UudHMiLCJTZXJ2aWNlL0Rhc2hib2FyZFNlcnZpY2UudHMiLCJNb2RlbC9UYXBJbmZvLnRzIiwiU2VydmljZS9LZWdzU2VydmljZS50cyIsIk1vZGVsL0FkbWluLnRzIiwiU2VydmljZS9BZG1pblNlcnZpY2UudHMiLCJNb2RlbC9Db25maWd1cmF0aW9uLnRzIiwiU2VydmljZS9Db25maWdTZXJ2aWNlLnRzIiwiU2VydmljZS9VbnRhcHBkQXBpU2VydmljZS50cyIsIkNvbnRyb2xsZXIvQ29udHJvbGxlckJhc2UudHMiLCJDb250cm9sbGVyL1VzZXJDb250cm9sbGVyLnRzIiwiQ29udHJvbGxlci9Wb3RlQmVlckNvbnRyb2xsZXIudHMiLCJDb250cm9sbGVyL1ZvdGVSZXN1bHRzQ29udHJvbGxlci50cyIsIkNvbnRyb2xsZXIvQW5hbHl0aWNzQ29udHJvbGxlci50cyIsIkNvbnRyb2xsZXIvSG9tZUNvbnRyb2xsZXIudHMiLCJDb250cm9sbGVyL0F1dGhvcml6ZWRHcm91cHNDb250cm9sbGVyLnRzIiwiQ29udHJvbGxlci9JbnN0YWxsS2Vnc0NvbnRyb2xsZXIudHMiLCJBcHBCdWlsZGVyLnRzIiwic3RhcnQudHMiLCJNb2RlbC9BcHBTdGF0ZS50cyIsIk1vZGVsL1Njb3BlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLGlFQUFpRTtBQUVqRSxpREFBaUQ7QUFFakQsSUFBTyxhQUFhLENBaUJuQjtBQWpCRCxXQUFPLGFBQWE7SUFBQyxJQUFBLEdBQUcsQ0FpQnZCO0lBakJvQixXQUFBLEdBQUc7UUFBQyxJQUFBLEtBQUssQ0FpQjdCO1FBakJ3QixXQUFBLEtBQUs7WUFFMUIs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YXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gICAgIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiAgQWxsIHJpZ2h0cyByZXNlcnZlZC5cclxuXHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9yZWZlcmVuY2VzL2luZGV4LmQudHNcIiAvPlxyXG5cclxubW9kdWxlIERYTGlxdWlkSW50ZWwuQXBwLk1vZGVsIHtcclxuXHJcbiAgICAvLyBOZWVkIHRvIGtlZXAgc3RydWN0dXJlIGluIHN5bmMgd2l0aCBEYXNoU2VydmVyLk1hbmFnZW1lbnRBUEkuTW9kZWxzLk9wZXJhdGlvblN0YXRlIGluIHRoZSBXZWJBUElcclxuICAgIGV4cG9ydCBjbGFzcyBVc2VySW5mbyB7XHJcbiAgICAgICAgcHVibGljIFBlcnNvbm5lbE51bWJlcjogbnVtYmVyXHJcbiAgICAgICAgcHVibGljIFVzZXJQcmluY2lwYWxOYW1lOiBzdHJpbmdcclxuICAgICAgICBwdWJsaWMgVW50YXBwZFVzZXJOYW1lOiBzdHJpbmdcclxuICAgICAgICBwdWJsaWMgVW50YXBwZEFjY2Vzc1Rva2VuOiBzdHJpbmdcclxuICAgICAgICBwdWJsaWMgQ2hlY2tpbkZhY2Vib29rOiBib29sZWFuXHJcbiAgICAgICAgcHVibGljIENoZWNraW5Ud2l0dGVyOiBib29sZWFuXHJcbiAgICAgICAgcHVibGljIENoZWNraW5Gb3Vyc3F1YXJlOiBib29sZWFuXHJcbiAgICAgICAgcHVibGljIEZ1bGxOYW1lOiBzdHJpbmdcclxuICAgICAgICBwdWJsaWMgRmlyc3ROYW1lOiBzdHJpbmdcclxuICAgICAgICBwdWJsaWMgTGFzdE5hbWU6IHN0cmluZ1xyXG4gICAgICAgIHB1YmxpYyBJc0FkbWluOiBib29sZWFuXHJcbiAgICAgICAgcHVibGljIFRodW1ibmFpbEltYWdlVXJpOiBzdHJpbmdcclxuICAgIH1cclxufVxyXG4gICAgICAgICAiLCIvLyAgICAgQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uICBBbGwgcmlnaHRzIHJlc2VydmVkLlxyXG5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL3JlZmVyZW5jZXMvaW5kZXguZC50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9Nb2RlbC9Vc2VySW5mby50c1wiIC8+XHJcblxyXG5tb2R1bGUgRFhMaXF1aWRJbnRlbC5BcHAuU2VydmljZSB7XHJcblxyXG4gICAgZXhwb3J0IGNsYXNzIFVzZXJTZXJ2aWNlIHtcclxuICAgICAgICBzdGF0aWMgJGluamVjdCA9IFsnJHJlc291cmNlJywgJ2VudlNlcnZpY2UnXTtcclxuXHJcbiAgICAgICAgcHJpdmF0ZSByZXNvdXJjZUNsYXNzOiBuZy5yZXNvdXJjZS5JUmVzb3VyY2VDbGFzczxuZy5yZXNvdXJjZS5JUmVzb3VyY2U8TW9kZWwuVXNlckluZm8+PjtcclxuICAgICAgICBwcml2YXRlIGNhY2hlZFVzZXJJZDogc3RyaW5nO1xyXG4gICAgICAgIHByaXZhdGUgY2FjaGVkVXNlckluZm86IFByb21pc2VMaWtlPE1vZGVsLlVzZXJJbmZvPjtcclxuXHJcbiAgICAgICAgY29uc3RydWN0b3IoJHJlc291cmNlOiBuZy5yZXNvdXJjZS5JUmVzb3VyY2VTZXJ2aWNlLCBlbnZTZXJ2aWNlOiBhbmd1bGFyLmVudmlyb25tZW50LlNlcnZpY2UpIHtcclxuXHJcbiAgICAgICAgICAgIHRoaXMucmVzb3VyY2VDbGFzcyA9IDxuZy5yZXNvdXJjZS5JUmVzb3VyY2VDbGFzczxuZy5yZXNvdXJjZS5JUmVzb3VyY2U8TW9kZWwuVXNlckluZm8+Pj4kcmVzb3VyY2UoZW52U2VydmljZS5yZWFkKCdhcGlVcmknKSArICcvdXNlcnMvOnVzZXJJZCcsXHJcbiAgICAgICAgICAgICAgICBudWxsLFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZTogeyBtZXRob2Q6ICdQVVQnIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGdldFVzZXJJbmZvKHVzZXJJZDogc3RyaW5nKTogUHJvbWlzZUxpa2U8TW9kZWwuVXNlckluZm8+IHtcclxuICAgICAgICAgICAgaWYgKHVzZXJJZCA9PSB0aGlzLmNhY2hlZFVzZXJJZCAmJiB0aGlzLmNhY2hlZFVzZXJJbmZvICE9IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmNhY2hlZFVzZXJJbmZvO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuY2FjaGVkVXNlcklkID0gdXNlcklkO1xyXG4gICAgICAgICAgICBpZiAoIXVzZXJJZCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jYWNoZWRVc2VySW5mbyA9IFByb21pc2UucmVzb2x2ZTxNb2RlbC5Vc2VySW5mbz4obnVsbCk7ICAgIFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jYWNoZWRVc2VySW5mbyA9IHRoaXMucmVzb3VyY2VDbGFzcy5nZXQoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB1c2VySWQ6IHVzZXJJZFxyXG4gICAgICAgICAgICAgICAgICAgIH0sIFxyXG4gICAgICAgICAgICAgICAgICAgIG51bGwsIFxyXG4gICAgICAgICAgICAgICAgICAgIChlcnJSZXNwOiBuZy5JSHR0cFByb21pc2U8TW9kZWwuVXNlckluZm8+KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIENsZWFyIG91dCBjYWNoZWQgcHJvbWlzZSB0byBhbGxvdyByZXRyeSBvbiBlcnJvclxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNhY2hlZFVzZXJJZCA9ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNhY2hlZFVzZXJJbmZvID0gbnVsbDtcclxuICAgICAgICAgICAgICAgICAgICB9KS4kcHJvbWlzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jYWNoZWRVc2VySW5mbztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyB1cGRhdGVVc2VySW5mbyh1c2VySWQ6IHN0cmluZywgdXNlckluZm86IE1vZGVsLlVzZXJJbmZvKTogUHJvbWlzZUxpa2U8TW9kZWwuVXNlckluZm8+IHtcclxuICAgICAgICAgICAgaWYgKCF1c2VySWQpIHtcclxuICAgICAgICAgICAgICAgIHRocm93ICdJbnZhbGlkIHVzZXIgaWQnO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuY2FjaGVkVXNlcklkID0gJyc7XHJcbiAgICAgICAgICAgIHRoaXMuY2FjaGVkVXNlckluZm8gPSBudWxsO1xyXG4gICAgICAgICAgICByZXR1cm4gKDxhbnk+dGhpcy5yZXNvdXJjZUNsYXNzKS51cGRhdGUoe1xyXG4gICAgICAgICAgICAgICAgICAgIHVzZXJJZDogdXNlcklkXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgdXNlckluZm8pLiRwcm9taXNlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4gIiwiLy8gICAgIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiAgQWxsIHJpZ2h0cyByZXNlcnZlZC5cclxuXHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9yZWZlcmVuY2VzL2luZGV4LmQudHNcIiAvPlxyXG5cclxubW9kdWxlIERYTGlxdWlkSW50ZWwuQXBwLk1vZGVsIHtcclxuXHJcbiAgICBleHBvcnQgY2xhc3MgQmVlckluZm8ge1xyXG4gICAgICAgIHB1YmxpYyB1bnRhcHBkSWQ6IG51bWJlclxyXG4gICAgICAgIHB1YmxpYyBuYW1lOiBzdHJpbmdcclxuICAgICAgICBwdWJsaWMgYmVlcl90eXBlPzogc3RyaW5nXHJcbiAgICAgICAgcHVibGljIGlidT86IG51bWJlclxyXG4gICAgICAgIHB1YmxpYyBhYnY/OiBudW1iZXJcclxuICAgICAgICBwdWJsaWMgZGVzY3JpcHRpb24/OiBzdHJpbmdcclxuICAgICAgICBwdWJsaWMgYnJld2VyeT86IHN0cmluZ1xyXG4gICAgICAgIHB1YmxpYyBpbWFnZT86IHN0cmluZ1xyXG4gICAgfVxyXG59IiwiLy8gICAgIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiAgQWxsIHJpZ2h0cyByZXNlcnZlZC5cclxuXHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9yZWZlcmVuY2VzL2luZGV4LmQudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiQmVlckluZm8udHNcIiAvPlxyXG5cclxubW9kdWxlIERYTGlxdWlkSW50ZWwuQXBwLk1vZGVsIHtcclxuXHJcbiAgICBleHBvcnQgY2xhc3MgVm90ZSB7XHJcbiAgICAgICAgcHVibGljIFZvdGVJZDogbnVtYmVyXHJcbiAgICAgICAgcHVibGljIFBlcnNvbm5lbE51bWJlcjogbnVtYmVyXHJcbiAgICAgICAgcHVibGljIFZvdGVEYXRlOiBEYXRlXHJcbiAgICAgICAgcHVibGljIFVudGFwcGRJZDogbnVtYmVyXHJcbiAgICAgICAgcHVibGljIEJlZXJOYW1lPzogc3RyaW5nXHJcbiAgICAgICAgcHVibGljIEJyZXdlcnk/OiBzdHJpbmdcclxuICAgICAgICBwdWJsaWMgQmVlckluZm8/OiBCZWVySW5mb1xyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBWb3RlVGFsbHkge1xyXG4gICAgICAgIHB1YmxpYyBVbnRhcHBkSWQ6IG51bWJlclxyXG4gICAgICAgIHB1YmxpYyBCZWVyTmFtZT86IHN0cmluZ1xyXG4gICAgICAgIHB1YmxpYyBCcmV3ZXJ5Pzogc3RyaW5nXHJcbiAgICAgICAgcHVibGljIFZvdGVDb3VudDogbnVtYmVyXHJcbiAgICB9XHJcbn1cclxuICAgICAgICAgIiwiLy8gICAgIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiAgQWxsIHJpZ2h0cyByZXNlcnZlZC5cclxuXHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9yZWZlcmVuY2VzL2luZGV4LmQudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vTW9kZWwvVm90ZS50c1wiIC8+XHJcblxyXG5tb2R1bGUgRFhMaXF1aWRJbnRlbC5BcHAuU2VydmljZSB7XHJcblxyXG4gICAgZXhwb3J0IGNsYXNzIFZvdGVTZXJ2aWNlIHtcclxuICAgICAgICBzdGF0aWMgJGluamVjdCA9IFsnJHJlc291cmNlJywgJ2VudlNlcnZpY2UnXTtcclxuXHJcbiAgICAgICAgcHJpdmF0ZSB1c2VyVm90ZXNSZXNvdXJjZTogbmcucmVzb3VyY2UuSVJlc291cmNlQ2xhc3M8TW9kZWwuVm90ZVtdPjtcclxuICAgICAgICBwcml2YXRlIHRhbGx5UmVzb3VyY2U6IG5nLnJlc291cmNlLklSZXNvdXJjZUNsYXNzPE1vZGVsLlZvdGVUYWxseT47XHJcblxyXG4gICAgICAgIGNvbnN0cnVjdG9yKCRyZXNvdXJjZTogbmcucmVzb3VyY2UuSVJlc291cmNlU2VydmljZSwgZW52U2VydmljZTogYW5ndWxhci5lbnZpcm9ubWVudC5TZXJ2aWNlKSB7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnVzZXJWb3Rlc1Jlc291cmNlID0gJHJlc291cmNlPE1vZGVsLlZvdGVbXT4oZW52U2VydmljZS5yZWFkKCdhcGlVcmknKSArICcvdm90ZXMvOnBlcnNvbm5lbE51bWJlcicsIG51bGwsIHtcclxuICAgICAgICAgICAgICAgIGdldDoge21ldGhvZDogJ0dFVCcsIGlzQXJyYXk6IHRydWV9LFxyXG4gICAgICAgICAgICAgICAgc2F2ZToge21ldGhvZDogJ1BVVCcsIGlzQXJyYXk6IHRydWV9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB0aGlzLnRhbGx5UmVzb3VyY2UgPSAkcmVzb3VyY2U8TW9kZWwuVm90ZVRhbGx5PihlbnZTZXJ2aWNlLnJlYWQoJ2FwaVVyaScpICsgJy92b3Rlc190YWxseScpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGdldFVzZXJWb3RlcyhwZXJzb25uZWxOdW1iZXI6IG51bWJlcik6IFByb21pc2VMaWtlPE1vZGVsLlZvdGVbXT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy51c2VyVm90ZXNSZXNvdXJjZS5nZXQoe1xyXG4gICAgICAgICAgICAgICAgICAgIHBlcnNvbm5lbE51bWJlcjogcGVyc29ubmVsTnVtYmVyXHJcbiAgICAgICAgICAgICAgICB9KS4kcHJvbWlzZTsgXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgdXBkYXRlVXNlclZvdGVzKHBlcnNvbm5lbE51bWJlcjogbnVtYmVyLCB2b3RlczogTW9kZWwuVm90ZVtdKTogUHJvbWlzZUxpa2U8TW9kZWwuVm90ZVtdPiB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnVzZXJWb3Rlc1Jlc291cmNlLnNhdmUoe1xyXG4gICAgICAgICAgICAgICAgICAgIHBlcnNvbm5lbE51bWJlcjogcGVyc29ubmVsTnVtYmVyXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgdm90ZXMpLiRwcm9taXNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGdldFZvdGVUYWxseSgpOiBQcm9taXNlTGlrZTxNb2RlbC5Wb3RlVGFsbHlbXT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy50YWxseVJlc291cmNlLnF1ZXJ5KCkuJHByb21pc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiAiLCIvLyAgICAgQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uICBBbGwgcmlnaHRzIHJlc2VydmVkLlxyXG5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL3JlZmVyZW5jZXMvaW5kZXguZC50c1wiIC8+XHJcblxyXG5tb2R1bGUgRFhMaXF1aWRJbnRlbC5BcHAuTW9kZWwge1xyXG5cclxuICAgIC8vIE5lZWQgdG8ga2VlcCBzdHJ1Y3R1cmUgaW4gc3luYyB3aXRoIERhc2hTZXJ2ZXIuTWFuYWdlbWVudEFQSS5Nb2RlbHMuT3BlcmF0aW9uU3RhdGUgaW4gdGhlIFdlYkFQSVxyXG4gICAgZXhwb3J0IGNsYXNzIEFjdGl2aXR5IHtcclxuICAgICAgICBwdWJsaWMgU2Vzc2lvbklkOiBudW1iZXJcclxuICAgICAgICBwdWJsaWMgUG91clRpbWU6IERhdGVcclxuICAgICAgICBwdWJsaWMgUG91ckFtb3VudDogbnVtYmVyXHJcbiAgICAgICAgcHVibGljIEJlZXJOYW1lOiBzdHJpbmdcclxuICAgICAgICBwdWJsaWMgQnJld2VyeTogc3RyaW5nXHJcbiAgICAgICAgcHVibGljIEJlZXJUeXBlOiBzdHJpbmdcclxuICAgICAgICBwdWJsaWMgQUJWPzogbnVtYmVyXHJcbiAgICAgICAgcHVibGljIElCVT86IG51bWJlclxyXG4gICAgICAgIHB1YmxpYyBCZWVyRGVzY3JpcHRpb246IHN0cmluZ1xyXG4gICAgICAgIHB1YmxpYyBVbnRhcHBkSWQ/OiBudW1iZXJcclxuICAgICAgICBwdWJsaWMgQmVlckltYWdlUGF0aDogc3RyaW5nXHJcbiAgICAgICAgcHVibGljIFBlcnNvbm5lbE51bWJlcjogbnVtYmVyXHJcbiAgICAgICAgcHVibGljIEFsaWFzOiBzdHJpbmdcclxuICAgICAgICBwdWJsaWMgRnVsbE5hbWU6IHN0cmluZ1xyXG4gICAgfVxyXG59XHJcbiAgICAgICAgICIsIi8vICAgICBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gIEFsbCByaWdodHMgcmVzZXJ2ZWQuXHJcblxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vcmVmZXJlbmNlcy9pbmRleC5kLnRzXCIgLz5cclxuXHJcbm1vZHVsZSBEWExpcXVpZEludGVsLkFwcC5TZXJ2aWNlIHtcclxuXHJcbiAgICBleHBvcnQgY2xhc3MgQmFzaWNBdXRoUmVzb3VyY2U8VD4ge1xyXG4gICAgICAgIHByaXZhdGUgcmVzb3VyY2U6IG5nLnJlc291cmNlLklSZXNvdXJjZUNsYXNzPFQ+O1xyXG5cclxuICAgICAgICBjb25zdHJ1Y3RvcigkcmVzb3VyY2U6IG5nLnJlc291cmNlLklSZXNvdXJjZVNlcnZpY2UsIGVudlNlcnZpY2U6IGFuZ3VsYXIuZW52aXJvbm1lbnQuU2VydmljZSwgdXJsOiBzdHJpbmcpIHtcclxuICAgICAgICAgICAgdmFyIGF1dGhIZWFkZXIgPSBcIkJhc2ljIFwiICsgYnRvYShlbnZTZXJ2aWNlLnJlYWQoJ2FwaVVzZXJuYW1lJykgKyBcIjpcIiArIGVudlNlcnZpY2UucmVhZCgnYXBpUGFzc3dvcmQnKSk7XHJcbiAgICAgICAgICAgIHZhciBoZWFkZXJzID0ge1xyXG4gICAgICAgICAgICAgICAgQXV0aG9yaXphdGlvbjogYXV0aEhlYWRlclxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB2YXIgcXVlcnlBY3Rpb246IG5nLnJlc291cmNlLklBY3Rpb25IYXNoID0ge1xyXG4gICAgICAgICAgICAgICAgcXVlcnk6IHtcclxuICAgICAgICAgICAgICAgICAgICBtZXRob2Q6ICdHRVQnLFxyXG4gICAgICAgICAgICAgICAgICAgIGlzQXJyYXk6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgaGVhZGVyczogaGVhZGVyc1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB0aGlzLnJlc291cmNlID0gJHJlc291cmNlPFQ+KHVybCwgbnVsbCwgcXVlcnlBY3Rpb24pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHF1ZXJ5KGRhdGE6IGFueSk6IG5nLklQcm9taXNlPFRbXT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5yZXNvdXJjZS5xdWVyeShkYXRhKS4kcHJvbWlzZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwiLy8gICAgIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiAgQWxsIHJpZ2h0cyByZXNlcnZlZC5cclxuXHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9yZWZlcmVuY2VzL2luZGV4LmQudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vTW9kZWwvQWN0aXZpdHkudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9CYXNpY0F1dGhSZXNvdXJjZS50c1wiIC8+XHJcblxyXG5tb2R1bGUgRFhMaXF1aWRJbnRlbC5BcHAuU2VydmljZSB7XHJcblxyXG4gICAgZXhwb3J0IGNsYXNzIERhc2hib2FyZFNlcnZpY2Uge1xyXG4gICAgICAgIHN0YXRpYyAkaW5qZWN0ID0gWyckcmVzb3VyY2UnLCAnZW52U2VydmljZSddO1xyXG5cclxuICAgICAgICBwcml2YXRlIGFjdGl2aXR5UmVzb3VyY2U6IEJhc2ljQXV0aFJlc291cmNlPE1vZGVsLkFjdGl2aXR5PjtcclxuXHJcbiAgICAgICAgY29uc3RydWN0b3IoJHJlc291cmNlOiBuZy5yZXNvdXJjZS5JUmVzb3VyY2VTZXJ2aWNlLCBlbnZTZXJ2aWNlOiBhbmd1bGFyLmVudmlyb25tZW50LlNlcnZpY2UpIHtcclxuICAgICAgICAgICAgdGhpcy5hY3Rpdml0eVJlc291cmNlID0gbmV3IEJhc2ljQXV0aFJlc291cmNlPE1vZGVsLkFjdGl2aXR5PigkcmVzb3VyY2UsIGVudlNlcnZpY2UsIGVudlNlcnZpY2UucmVhZCgnYXBpVXJpJykgKyAnL2FjdGl2aXR5Jyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgZ2V0TGF0ZXN0QWN0aXZpdGllcyhjb3VudDogbnVtYmVyKTogUHJvbWlzZUxpa2U8TW9kZWwuQWN0aXZpdHlbXT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5hY3Rpdml0eVJlc291cmNlLnF1ZXJ5KHtcclxuICAgICAgICAgICAgICAgIGNvdW50OiBjb3VudFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwiLy8gICAgIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiAgQWxsIHJpZ2h0cyByZXNlcnZlZC5cclxuXHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9yZWZlcmVuY2VzL2luZGV4LmQudHNcIiAvPlxyXG5cclxubW9kdWxlIERYTGlxdWlkSW50ZWwuQXBwLk1vZGVsIHtcclxuXHJcbiAgICBleHBvcnQgY2xhc3MgS2VnIHtcclxuICAgICAgICBwdWJsaWMgS2VnSWQ/OiBudW1iZXJcclxuICAgICAgICBwdWJsaWMgTmFtZTogc3RyaW5nXHJcbiAgICAgICAgcHVibGljIEJyZXdlcnk6IHN0cmluZ1xyXG4gICAgICAgIHB1YmxpYyBCZWVyVHlwZTogc3RyaW5nXHJcbiAgICAgICAgcHVibGljIEFCVj86IG51bWJlclxyXG4gICAgICAgIHB1YmxpYyBJQlU/OiBudW1iZXJcclxuICAgICAgICBwdWJsaWMgQmVlckRlc2NyaXB0aW9uOiBzdHJpbmdcclxuICAgICAgICBwdWJsaWMgVW50YXBwZElkPzogbnVtYmVyXHJcbiAgICAgICAgcHVibGljIGltYWdlUGF0aDogc3RyaW5nXHJcbiAgICAgICAgcHVibGljIEJlZXJJbmZvPzogQmVlckluZm9cclxuICAgIH1cclxuXHJcbiAgICBleHBvcnQgY2xhc3MgVGFwSW5mbyBleHRlbmRzIEtlZyB7XHJcbiAgICAgICAgcHVibGljIFRhcElkOiBudW1iZXJcclxuICAgICAgICBwdWJsaWMgSW5zdGFsbERhdGU6IERhdGVcclxuICAgICAgICBwdWJsaWMgS2VnU2l6ZTogbnVtYmVyXHJcbiAgICAgICAgcHVibGljIEN1cnJlbnRWb2x1bWU6IG51bWJlclxyXG4gICAgICAgIHB1YmxpYyBPcmlnaW5hbFVudGFwcGRJZD86IG51bWJlclxyXG5cclxuICAgICAgICBwdWJsaWMgZ2V0U2V0QmVlckluZm8/OiAoYmVlckluZm86IEJlZXJJbmZvKSA9PiBCZWVySW5mbztcclxuICAgIH1cclxufVxyXG4gICAgICAgICAiLCIvLyAgICAgQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uICBBbGwgcmlnaHRzIHJlc2VydmVkLlxyXG5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL3JlZmVyZW5jZXMvaW5kZXguZC50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9Nb2RlbC9UYXBJbmZvLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vQmFzaWNBdXRoUmVzb3VyY2UudHNcIiAvPlxyXG5cclxubW9kdWxlIERYTGlxdWlkSW50ZWwuQXBwLlNlcnZpY2Uge1xyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBLZWdzU2VydmljZSB7XHJcbiAgICAgICAgc3RhdGljICRpbmplY3QgPSBbJyRyZXNvdXJjZScsICdlbnZTZXJ2aWNlJywgJ2FkYWxBdXRoZW50aWNhdGlvblNlcnZpY2UnXTtcclxuXHJcbiAgICAgICAgcHJpdmF0ZSBrZWdTdGF0dXNSZXNvdXJjZTogQmFzaWNBdXRoUmVzb3VyY2U8TW9kZWwuVGFwSW5mbz47XHJcbiAgICAgICAgcHJpdmF0ZSBrZWdVcGRhdGVSZXNvdXJjZTogbmcucmVzb3VyY2UuSVJlc291cmNlQ2xhc3M8bmcucmVzb3VyY2UuSVJlc291cmNlPE1vZGVsLktlZz4+O1xyXG5cclxuICAgICAgICBjb25zdHJ1Y3Rvcihwcm90ZWN0ZWQgJHJlc291cmNlOiBuZy5yZXNvdXJjZS5JUmVzb3VyY2VTZXJ2aWNlLCBcclxuICAgICAgICAgICAgcHJvdGVjdGVkIGVudlNlcnZpY2U6IGFuZ3VsYXIuZW52aXJvbm1lbnQuU2VydmljZSwgXHJcbiAgICAgICAgICAgIHByb3RlY3RlZCBhZGFsU2VydmljZTogYWRhbC5BZGFsQXV0aGVudGljYXRpb25TZXJ2aWNlKSB7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmtlZ1N0YXR1c1Jlc291cmNlID0gbmV3IEJhc2ljQXV0aFJlc291cmNlPE1vZGVsLlRhcEluZm8+KCRyZXNvdXJjZSwgZW52U2VydmljZSwgZW52U2VydmljZS5yZWFkKCdhcGlVcmknKSArICcvQ3VycmVudEtlZycpO1xyXG4gICAgICAgICAgICB0aGlzLmtlZ1VwZGF0ZVJlc291cmNlID0gPG5nLnJlc291cmNlLklSZXNvdXJjZUNsYXNzPG5nLnJlc291cmNlLklSZXNvdXJjZTxNb2RlbC5LZWc+Pj4kcmVzb3VyY2UoZW52U2VydmljZS5yZWFkKCdhcGlVcmknKSArICcva2VncycpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGdldFRhcHNTdGF0dXMoKTogUHJvbWlzZUxpa2U8TW9kZWwuVGFwSW5mb1tdPiB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmtlZ1N0YXR1c1Jlc291cmNlLnF1ZXJ5KG51bGwpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGNyZWF0ZU5ld0tlZyhrZWc6IE1vZGVsLktlZyk6IFByb21pc2VMaWtlPE1vZGVsLktlZz4ge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5rZWdVcGRhdGVSZXNvdXJjZS5zYXZlKGtlZykuJHByb21pc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgYXN5bmMgaW5zdGFsbEtlZ09uVGFwKHRhcElkOiBudW1iZXIsIGtlZ0lkOiBudW1iZXIsIGtlZ1NpemU6IG51bWJlcik6IFByb21pc2U8YW55PiB7XHJcbiAgICAgICAgICAgIC8vIEJlY2F1c2UgdGhlIC9DdXJyZW50S2VnIHVyaSBoYXMgYmVlbiBjb25maWd1cmVkIGZvciBiYXNpYyBhdXRoICh0aGUgR0VUIGlzIGRpc3BsYXllZCBvbiB0aGUgZGFzaGJvYXJkXHJcbiAgICAgICAgICAgIC8vIHByaW9yIHRvIGxvZ2luKSwgd2UgaGF2ZSB0byBtYW51YWxseSBhcHBseSB0aGUgYmVhcmVyIHRva2VuIGZvciB0aGUgUFVULCB3aGljaCBpcyBwcm90ZWN0ZWQuXHJcbiAgICAgICAgICAgIHZhciByZXF1ZXN0VXJpID0gdGhpcy5lbnZTZXJ2aWNlLnJlYWQoJ2FwaVVyaScpICsgYC9DdXJyZW50S2VnLyR7dGFwSWR9YDtcclxuICAgICAgICAgICAgdmFyIHRva2VuID0gYXdhaXQgdGhpcy5hZGFsU2VydmljZS5hY3F1aXJlVG9rZW4odGhpcy5hZGFsU2VydmljZS5nZXRSZXNvdXJjZUZvckVuZHBvaW50KHRoaXMuZW52U2VydmljZS5yZWFkKCdhcGlVcmknKSkpO1xyXG4gICAgICAgICAgICB2YXIgaW5zdGFsbEN1cnJlbnRLZWdSZXNvdXJjZSA9IHRoaXMuJHJlc291cmNlKHJlcXVlc3RVcmksXHJcbiAgICAgICAgICAgICAgICBudWxsLFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHNhdmU6IHsgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1ldGhvZDogJ1BVVCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEF1dGhvcml6YXRpb246ICdCZWFyZXIgJyArIHRva2VuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgcmV0dXJuIGluc3RhbGxDdXJyZW50S2VnUmVzb3VyY2Uuc2F2ZShudWxsLCBcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBLZWdJZDoga2VnSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgS2VnU2l6ZToga2VnU2l6ZVxyXG4gICAgICAgICAgICAgICAgfSkuJHByb21pc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiIsIi8vICAgICBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gIEFsbCByaWdodHMgcmVzZXJ2ZWQuXHJcblxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vcmVmZXJlbmNlcy9pbmRleC5kLnRzXCIgLz5cclxuXHJcbm1vZHVsZSBEWExpcXVpZEludGVsLkFwcC5Nb2RlbCB7XHJcblxyXG4gICAgZXhwb3J0IGNsYXNzIEF1dGhvcml6ZWRHcm91cHMge1xyXG4gICAgICAgIEF1dGhvcml6ZWRHcm91cHM6IHN0cmluZ1tdXHJcbiAgICB9XHJcblxyXG4gICAgZXhwb3J0IGNsYXNzIEdyb3VwUmVzdWx0IHtcclxuICAgICAgICBkaXNwbGF5TmFtZTogc3RyaW5nXHJcbiAgICAgICAgb3duZXJzOiBzdHJpbmdbXVxyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBHcm91cFNlYXJjaFJlc3VsdHMge1xyXG4gICAgICAgIGNvdW50OiBudW1iZXJcclxuICAgICAgICByZXN1bHRzOiBHcm91cFJlc3VsdFtdXHJcbiAgICB9XHJcbn0iLCIvLyAgICAgQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uICBBbGwgcmlnaHRzIHJlc2VydmVkLlxyXG5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL3JlZmVyZW5jZXMvaW5kZXguZC50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9Nb2RlbC9BZG1pbi50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9Nb2RlbC9LZWdzLnRzXCIgLz5cclxuXHJcbm1vZHVsZSBEWExpcXVpZEludGVsLkFwcC5TZXJ2aWNlIHtcclxuXHJcbiAgICBleHBvcnQgY2xhc3MgQWRtaW5TZXJ2aWNlIHtcclxuICAgICAgICBzdGF0aWMgJGluamVjdCA9IFsnJHJlc291cmNlJywgJ2VudlNlcnZpY2UnXTtcclxuXHJcbiAgICAgICAgcHJpdmF0ZSBhZG1pblJlc291cmNlOiBuZy5yZXNvdXJjZS5JUmVzb3VyY2VDbGFzczxuZy5yZXNvdXJjZS5JUmVzb3VyY2U8YW55Pj47XHJcbiAgICAgICAgcHJpdmF0ZSBrZWdzUmVzb3VyY2U6IG5nLnJlc291cmNlLklSZXNvdXJjZUNsYXNzPG5nLnJlc291cmNlLklSZXNvdXJjZTxhbnk+PjtcclxuXHJcbiAgICAgICAgY29uc3RydWN0b3IoJHJlc291cmNlOiBuZy5yZXNvdXJjZS5JUmVzb3VyY2VTZXJ2aWNlLCBlbnZTZXJ2aWNlOiBhbmd1bGFyLmVudmlyb25tZW50LlNlcnZpY2UpIHtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuYWRtaW5SZXNvdXJjZSA9IDxuZy5yZXNvdXJjZS5JUmVzb3VyY2VDbGFzczxuZy5yZXNvdXJjZS5JUmVzb3VyY2U8YW55Pj4+JHJlc291cmNlKGVudlNlcnZpY2UucmVhZCgnYXBpVXJpJykgKyAnL2FkbWluLzphY3Rpb24nLFxyXG4gICAgICAgICAgICAgICAgbnVsbCxcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB1cGRhdGU6IHsgbWV0aG9kOiAnUFVUJyB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBnZXRBdXRob3JpemVkR3JvdXBzKCk6IFByb21pc2VMaWtlPE1vZGVsLkF1dGhvcml6ZWRHcm91cHM+IHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYWRtaW5SZXNvdXJjZS5nZXQoe1xyXG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbjogJ0F1dGhvcml6ZWRHcm91cHMnXHJcbiAgICAgICAgICAgICAgICB9KS4kcHJvbWlzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyB1cGRhdGVBdXRob3JpemVkR3JvdXBzKGdyb3VwczogTW9kZWwuQXV0aG9yaXplZEdyb3Vwcyk6IFByb21pc2VMaWtlPGFueT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gKDxhbnk+dGhpcy5hZG1pblJlc291cmNlKS51cGRhdGUoe1xyXG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbjogJ0F1dGhvcml6ZWRHcm91cHMnXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZ3JvdXBzKS4kcHJvbWlzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBzZWFyY2hHcm91cHMoc2VhcmNoVGVybTogc3RyaW5nKTogUHJvbWlzZUxpa2U8TW9kZWwuR3JvdXBTZWFyY2hSZXN1bHRzPiB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmFkbWluUmVzb3VyY2UuZ2V0KHtcclxuICAgICAgICAgICAgICAgIGFjdGlvbjogJ0F1dGhvcml6ZWRHcm91cHMnLFxyXG4gICAgICAgICAgICAgICAgc2VhcmNoOiBzZWFyY2hUZXJtXHJcbiAgICAgICAgICAgIH0pLiRwcm9taXNlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4gIiwiLy8gICAgIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiAgQWxsIHJpZ2h0cyByZXNlcnZlZC5cclxuXHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9yZWZlcmVuY2VzL2luZGV4LmQudHNcIiAvPlxyXG5cclxubW9kdWxlIERYTGlxdWlkSW50ZWwuQXBwLk1vZGVsIHtcclxuXHJcbiAgICBleHBvcnQgY2xhc3MgQ29uZmlndXJhdGlvbiB7XHJcblxyXG4gICAgICAgIHB1YmxpYyBVbnRhcHBkQ2xpZW50SWQ6IHN0cmluZ1xyXG4gICAgICAgIHB1YmxpYyBVbnRhcHBkQ2xpZW50U2VjcmV0OiBzdHJpbmdcclxuICAgIH1cclxufSAiLCIvLyAgICAgQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uICBBbGwgcmlnaHRzIHJlc2VydmVkLlxyXG5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL3JlZmVyZW5jZXMvaW5kZXguZC50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9Nb2RlbC9Db25maWd1cmF0aW9uLnRzXCIgLz5cclxuXHJcbm1vZHVsZSBEWExpcXVpZEludGVsLkFwcC5TZXJ2aWNlIHtcclxuXHJcbiAgICBleHBvcnQgY2xhc3MgQ29uZmlnU2VydmljZSB7XHJcbiAgICAgICAgc3RhdGljICRpbmplY3QgPSBbJyRyZXNvdXJjZScsICdlbnZTZXJ2aWNlJ107XHJcblxyXG4gICAgICAgIHByaXZhdGUgcmVzb3VyY2VDbGFzczogbmcucmVzb3VyY2UuSVJlc291cmNlQ2xhc3M8bmcucmVzb3VyY2UuSVJlc291cmNlPE1vZGVsLkNvbmZpZ3VyYXRpb24+PjtcclxuICAgICAgICBwcml2YXRlIGNvbmZpZ3VyYXRpb246IG5nLklQcm9taXNlPE1vZGVsLkNvbmZpZ3VyYXRpb24+O1xyXG5cclxuICAgICAgICBjb25zdHJ1Y3RvcigkcmVzb3VyY2U6IG5nLnJlc291cmNlLklSZXNvdXJjZVNlcnZpY2UsIGVudlNlcnZpY2U6IGFuZ3VsYXIuZW52aXJvbm1lbnQuU2VydmljZSkge1xyXG5cclxuICAgICAgICAgICAgdGhpcy5yZXNvdXJjZUNsYXNzID0gJHJlc291cmNlKGVudlNlcnZpY2UucmVhZCgnYXBpVXJpJykgKyAnL2FwcENvbmZpZ3VyYXRpb24nKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBnZXRDb25maWd1cmF0aW9uKCk6IFByb21pc2VMaWtlPE1vZGVsLkNvbmZpZ3VyYXRpb24+IHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLmNvbmZpZ3VyYXRpb24pIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbiA9IHRoaXMucmVzb3VyY2VDbGFzcy5nZXQoKS4kcHJvbWlzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jb25maWd1cmF0aW9uO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4gIiwiLy8gICAgIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiAgQWxsIHJpZ2h0cyByZXNlcnZlZC5cclxuXHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9yZWZlcmVuY2VzL2luZGV4LmQudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9Db25maWdTZXJ2aWNlLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL01vZGVsL0JlZXJJbmZvLnRzXCIgLz5cclxuXHJcbm1vZHVsZSBEWExpcXVpZEludGVsLkFwcC5TZXJ2aWNlIHtcclxuXHJcbiAgICBleHBvcnQgY2xhc3MgVW50YXBwZEFwaVNlcnZpY2Uge1xyXG4gICAgICAgIHN0YXRpYyAkaW5qZWN0ID0gWyckcmVzb3VyY2UnLCAnZW52U2VydmljZScsICdjb25maWdTZXJ2aWNlJ107XHJcblxyXG4gICAgICAgIHByaXZhdGUgcmVzb3VyY2VDbGFzczogbmcucmVzb3VyY2UuSVJlc291cmNlQ2xhc3M8bmcucmVzb3VyY2UuSVJlc291cmNlPGFueT4+O1xyXG5cclxuICAgICAgICBjb25zdHJ1Y3RvcigkcmVzb3VyY2U6IG5nLnJlc291cmNlLklSZXNvdXJjZVNlcnZpY2UsIHByaXZhdGUgZW52U2VydmljZTogYW5ndWxhci5lbnZpcm9ubWVudC5TZXJ2aWNlLCBwcml2YXRlIGNvbmZpZ1NlcnZpY2U6IENvbmZpZ1NlcnZpY2UpIHtcclxuXHJcbiAgICAgICAgICAgIHRoaXMucmVzb3VyY2VDbGFzcyA9ICRyZXNvdXJjZSgnaHR0cHM6Ly9hcGkudW50YXBwZC5jb20vdjQvOmVudGl0eS86bWV0aG9kTmFtZScpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGFzeW5jIGdldFVudGFwcGRBdXRoVXJpKHJlZGlyZWN0VXJpOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xyXG4gICAgICAgICAgICBsZXQgYXBwQ29uZmlnID0gYXdhaXQgdGhpcy5jb25maWdTZXJ2aWNlLmdldENvbmZpZ3VyYXRpb24oKTtcclxuICAgICAgICAgICAgcmV0dXJuIGBodHRwczovL3VudGFwcGQuY29tL29hdXRoL2F1dGhlbnRpY2F0ZS8/Y2xpZW50X2lkPSR7YXBwQ29uZmlnLlVudGFwcGRDbGllbnRJZH0mcmVzcG9uc2VfdHlwZT10b2tlbiZyZWRpcmVjdF91cmw9JHtyZWRpcmVjdFVyaX1gO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGdldFVzZXJJbmZvKGFjY2Vzc1Rva2VuOiBzdHJpbmcpOiBQcm9taXNlTGlrZTxhbnk+IHtcclxuICAgICAgICAgICAgaWYgKCFhY2Nlc3NUb2tlbikge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgJ0ludmFsaWQgVW50YXBwZCB1c2VyIGFjY2VzcyB0b2tlbic7ICAgIFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMucmVzb3VyY2VDbGFzcy5nZXQoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbnRpdHk6ICd1c2VyJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWV0aG9kTmFtZTogJ2luZm8nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhY2Nlc3NfdG9rZW46IGFjY2Vzc1Rva2VuXHJcbiAgICAgICAgICAgICAgICAgICAgfSkuJHByb21pc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBhc3luYyBzZWFyY2hCZWVycyhzZWFyY2hUZXJtOiBzdHJpbmcsIGFjY2Vzc1Rva2VuPzogc3RyaW5nKTogUHJvbWlzZTxNb2RlbC5CZWVySW5mb1tdPiB7XHJcbiAgICAgICAgICAgIGxldCBhcHBDb25maWcgPSBhd2FpdCB0aGlzLmNvbmZpZ1NlcnZpY2UuZ2V0Q29uZmlndXJhdGlvbigpO1xyXG4gICAgICAgICAgICB2YXIgZGF0YSA9IHtcclxuICAgICAgICAgICAgICAgIGVudGl0eTogJ3NlYXJjaCcsXHJcbiAgICAgICAgICAgICAgICBtZXRob2ROYW1lOiAnYmVlcicsXHJcbiAgICAgICAgICAgICAgICBxOiBzZWFyY2hUZXJtICsgJyonLFxyXG4gICAgICAgICAgICAgICAgbGltaXQ6IDE1XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGlmIChhY2Nlc3NUb2tlbikge1xyXG4gICAgICAgICAgICAgICAgZGF0YVsnYWNjZXNzX3Rva2VuJ10gPSBhY2Nlc3NUb2tlbjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGRhdGFbJ2NsaWVudF9pZCddID0gYXBwQ29uZmlnLlVudGFwcGRDbGllbnRJZDtcclxuICAgICAgICAgICAgICAgIGRhdGFbJ2NsaWVudF9zZWNyZXQnXSA9IGFwcENvbmZpZy5VbnRhcHBkQ2xpZW50U2VjcmV0O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHZhciByZXN1bHRzID0gYXdhaXQgdGhpcy5yZXNvdXJjZUNsYXNzLmdldChkYXRhKS4kcHJvbWlzZTtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdHMucmVzcG9uc2UuYmVlcnMuaXRlbXMubWFwKChiZWVyKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHVudGFwcGRJZDogYmVlci5iZWVyLmJpZCxcclxuICAgICAgICAgICAgICAgICAgICBuYW1lOiBiZWVyLmJlZXIuYmVlcl9uYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgIGJlZXJfdHlwZTogYmVlci5iZWVyLmJlZXJfc3R5bGUsXHJcbiAgICAgICAgICAgICAgICAgICAgaWJ1OiBiZWVyLmJlZXIuYmVlcl9pYnUsXHJcbiAgICAgICAgICAgICAgICAgICAgYWJ2OiBiZWVyLmJlZXIuYmVlcl9hYnYsXHJcbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IGJlZXIuYmVlci5iZWVyX2Rlc2NyaXB0aW9uLFxyXG4gICAgICAgICAgICAgICAgICAgIGJyZXdlcnk6IGJlZXIuYnJld2VyeS5icmV3ZXJ5X25hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgaW1hZ2U6IGJlZXIuYmVlci5iZWVyX2xhYmVsXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuICIsIi8vICAgICBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gIEFsbCByaWdodHMgcmVzZXJ2ZWQuXHJcblxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vcmVmZXJlbmNlcy9pbmRleC5kLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL1NlcnZpY2UvVXNlclNlcnZpY2UudHNcIiAvPlxyXG5cclxubW9kdWxlIERYTGlxdWlkSW50ZWwuQXBwLkNvbnRyb2xsZXIge1xyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBDb250cm9sbGVyQmFzZSB7XHJcblxyXG4gICAgICAgIGNvbnN0cnVjdG9yKHByb3RlY3RlZCAkc2NvcGU6IE1vZGVsLklEWExpcXVpZEludGVsU2NvcGUsXHJcbiAgICAgICAgICAgIHByb3RlY3RlZCAkcm9vdFNjb3BlOiBNb2RlbC5JRFhMaXF1aWRJbnRlbFNjb3BlLFxyXG4gICAgICAgICAgICBwcm90ZWN0ZWQgYWRhbEF1dGhlbnRpY2F0aW9uU2VydmljZSxcclxuICAgICAgICAgICAgcHJvdGVjdGVkICRsb2NhdGlvbjogbmcuSUxvY2F0aW9uU2VydmljZSxcclxuICAgICAgICAgICAgcHJvdGVjdGVkIHVzZXJTZXJ2aWNlOiBTZXJ2aWNlLlVzZXJTZXJ2aWNlLFxyXG4gICAgICAgICAgICBjb250aW51ZUFmdGVyVXNlckxvYWQ6ICgpID0+IHZvaWQpIHtcclxuXHJcbiAgICAgICAgICAgICRyb290U2NvcGUubG9naW4gPSAoKSA9PiB0aGlzLmxvZ2luKCk7XHJcbiAgICAgICAgICAgICRyb290U2NvcGUubG9nb3V0ID0gKCkgPT4gdGhpcy5sb2dvdXQoKTtcclxuICAgICAgICAgICAgJHJvb3RTY29wZS5pc0NvbnRyb2xsZXJBY3RpdmUgPSAobG9jYXRpb24pID0+IHRoaXMuaXNBY3RpdmUobG9jYXRpb24pO1xyXG4gICAgICAgICAgICAkcm9vdFNjb3BlLmlzQWRtaW4gPSAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJHNjb3BlLnN5c3RlbVVzZXJJbmZvID8gJHNjb3BlLnN5c3RlbVVzZXJJbmZvLklzQWRtaW4gOiBmYWxzZTtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgJHJvb3RTY29wZS5idXR0b25CYXJCdXR0b25zID0gW107XHJcblxyXG4gICAgICAgICAgICAkc2NvcGUuJG9uKCckcm91dGVDaGFuZ2VTdWNjZXNzJywgKGV2ZW50LCBjdXJyZW50LCBwcmV2aW91cykgPT4gdGhpcy5zZXRUaXRsZUZvclJvdXRlKGN1cnJlbnQuJCRyb3V0ZSkpO1xyXG4gICAgICAgICAgICAkc2NvcGUubG9hZGluZ01lc3NhZ2UgPSBcIlwiO1xyXG4gICAgICAgICAgICAkc2NvcGUuZXJyb3IgPSBcIlwiO1xyXG5cclxuICAgICAgICAgICAgLy8gV2hlbiB0aGUgdXNlciBsb2dzIGluLCB3ZSBuZWVkIHRvIGNoZWNrIHdpdGggdGhlIGFwaSBpZiB0aGV5J3JlIGFuIGFkbWluIG9yIG5vdFxyXG4gICAgICAgICAgICB0aGlzLnNldFVwZGF0ZVN0YXRlKHRydWUpO1xyXG4gICAgICAgICAgICB0aGlzLiRzY29wZS5sb2FkaW5nTWVzc2FnZSA9IFwiUmV0cmlldmluZyB1c2VyIGluZm9ybWF0aW9uLi4uXCI7XHJcbiAgICAgICAgICAgIHRoaXMuJHNjb3BlLmVycm9yID0gXCJcIjtcclxuICAgICAgICAgICAgdXNlclNlcnZpY2UuZ2V0VXNlckluZm8oJHNjb3BlLnVzZXJJbmZvLnVzZXJOYW1lKVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oKHVzZXJJbmZvOiBNb2RlbC5Vc2VySW5mbykgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5zeXN0ZW1Vc2VySW5mbyA9IHVzZXJJbmZvO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlQWZ0ZXJVc2VyTG9hZCgpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgbG9naW4oKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMuYWRhbEF1dGhlbnRpY2F0aW9uU2VydmljZS5sb2dpbigpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGxvZ2luV2l0aE1mYSgpIHtcclxuICAgICAgICAgICAgdGhpcy5hZGFsQXV0aGVudGljYXRpb25TZXJ2aWNlLmxvZ2luKHsgYW1yX3ZhbHVlczogJ21mYScgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgbG9nb3V0KCk6IHZvaWQge1xyXG4gICAgICAgICAgICB0aGlzLmFkYWxBdXRoZW50aWNhdGlvblNlcnZpY2UubG9nT3V0KCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgaXNBY3RpdmUodmlld0xvY2F0aW9uKTogYm9vbGVhbiB7XHJcbiAgICAgICAgICAgIHJldHVybiB2aWV3TG9jYXRpb24gPT09IHRoaXMuJGxvY2F0aW9uLnBhdGgoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBzZXRUaXRsZUZvclJvdXRlKHJvdXRlOiBuZy5yb3V0ZS5JUm91dGUpOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy4kcm9vdFNjb3BlLnRpdGxlID0gXCJEWCBMaXF1aWQgSW50ZWxsaWdlbmNlIC0gXCIgKyByb3V0ZS5uYW1lO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJvdGVjdGVkIHNldEVycm9yKGVycm9yOiBib29sZWFuLCBtZXNzYWdlOiBhbnksIHJlc3BvbnNlSGVhZGVyczogbmcuSUh0dHBIZWFkZXJzR2V0dGVyKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHZhciBhY3F1aXJlTWZhUmVzb3VyY2UgPSBcIlwiO1xyXG4gICAgICAgICAgICBpZiAocmVzcG9uc2VIZWFkZXJzICE9IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIC8vIElmIHdlIHJlY2VpdmVkIGEgNDAxIGVycm9yIHdpdGggV1dXLUF1dGhlbnRpY2F0ZSByZXNwb25zZSBoZWFkZXJzLCB3ZSBtYXkgbmVlZCB0byBcclxuICAgICAgICAgICAgICAgIC8vIHJlLWF1dGhlbnRpY2F0ZSB0byBzYXRpc2Z5IDJGQSByZXF1aXJlbWVudHMgZm9yIHVuZGVybHlpbmcgc2VydmljZXMgdXNlZCBieSB0aGUgV2ViQVBJXHJcbiAgICAgICAgICAgICAgICAvLyAoZWcuIFJERkUpLiBJbiB0aGF0IGNhc2UsIHdlIG5lZWQgdG8gZXhwbGljaXRseSBzcGVjaWZ5IHRoZSBuYW1lIG9mIHRoZSByZXNvdXJjZSB3ZVxyXG4gICAgICAgICAgICAgICAgLy8gd2FudCAyRkEgYXV0aGVudGljYXRpb24gdG8uXHJcbiAgICAgICAgICAgICAgICB2YXIgd3d3QXV0aCA9IHJlc3BvbnNlSGVhZGVycyhcInd3dy1hdXRoZW50aWNhdGVcIik7XHJcbiAgICAgICAgICAgICAgICBpZiAod3d3QXV0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIEhhbmRsZSB0aGUgbXVsdGlwbGUgd3d3LWF1dGhlbnRpY2F0ZSBoZWFkZXJzIGNhc2VcclxuICAgICAgICAgICAgICAgICAgICBhbmd1bGFyLmZvckVhY2god3d3QXV0aC5zcGxpdChcIixcIiksIChhdXRoU2NoZW1lOiBzdHJpbmcsIGluZGV4OiBudW1iZXIpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHBhcmFtc0RlbGltID0gYXV0aFNjaGVtZS5pbmRleE9mKFwiIFwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBhcmFtc0RlbGltICE9IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcGFyYW1zID0gYXV0aFNjaGVtZS5zdWJzdHIocGFyYW1zRGVsaW0gKyAxKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwYXJhbXNWYWx1ZXMgPSBwYXJhbXMuc3BsaXQoXCI9XCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBhcmFtc1ZhbHVlc1swXSA9PT0gXCJpbnRlcmFjdGlvbl9yZXF1aXJlZFwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWNxdWlyZU1mYVJlc291cmNlID0gcGFyYW1zVmFsdWVzWzFdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGFjcXVpcmVNZmFSZXNvdXJjZSkge1xyXG4gICAgICAgICAgICAgICAgLy8gVGhlIFdlYkFQSSBuZWVkcyAyRkEgYXV0aGVudGljYXRpb24gdG8gYmUgYWJsZSB0byBhY2Nlc3MgaXRzIHJlc291cmNlc1xyXG4gICAgICAgICAgICAgICAgdGhpcy5sb2dpbldpdGhNZmEoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoJC5pc1BsYWluT2JqZWN0KG1lc3NhZ2UpKSB7XHJcbiAgICAgICAgICAgICAgICBtZXNzYWdlID0gJC5tYXAoW1wiTWVzc2FnZVwiLCBcIkV4Y2VwdGlvbk1lc3NhZ2VcIiwgXCJFeGNlcHRpb25UeXBlXCJdLCAoYXR0cmlidXRlTmFtZSkgPT4gbWVzc2FnZVthdHRyaWJ1dGVOYW1lXSlcclxuICAgICAgICAgICAgICAgICAgICAuam9pbihcIiAtIFwiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLiRzY29wZS5lcnJvcl9jbGFzcyA9IGVycm9yID8gXCJhbGVydC1kYW5nZXJcIiA6IFwiYWxlcnQtaW5mb1wiO1xyXG4gICAgICAgICAgICB0aGlzLiRzY29wZS5lcnJvciA9IG1lc3NhZ2U7XHJcbiAgICAgICAgICAgIHRoaXMuJHNjb3BlLmxvYWRpbmdNZXNzYWdlID0gXCJcIjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByb3RlY3RlZCBzZXRVcGRhdGVTdGF0ZSh1cGRhdGVJblByb2dyZXNzOiBib29sZWFuKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMuJHNjb3BlLnVwZGF0ZUluUHJvZ3Jlc3MgPSB1cGRhdGVJblByb2dyZXNzO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSAiLCIvLyAgICAgQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uICBBbGwgcmlnaHRzIHJlc2VydmVkLlxyXG5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL3JlZmVyZW5jZXMvaW5kZXguZC50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL0NvbnRyb2xsZXJCYXNlLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL1NlcnZpY2UvVXNlclNlcnZpY2UudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vU2VydmljZS9VbnRhcHBkQXBpU2VydmljZS50c1wiIC8+XHJcblxyXG5tb2R1bGUgRFhMaXF1aWRJbnRlbC5BcHAuQ29udHJvbGxlciB7XHJcblxyXG4gICAgZXhwb3J0IGNsYXNzIFVzZXJDb250cm9sbGVyIGV4dGVuZHMgQ29udHJvbGxlckJhc2Uge1xyXG4gICAgICAgIHN0YXRpYyAkaW5qZWN0ID0gWyckc2NvcGUnLCAnJHJvb3RTY29wZScsICdhZGFsQXV0aGVudGljYXRpb25TZXJ2aWNlJywgJyRsb2NhdGlvbicsICckd2luZG93JywgJyRyb3V0ZScsICd1c2VyU2VydmljZScsICd1bnRhcHBkU2VydmljZSddO1xyXG5cclxuICAgICAgICBjb25zdHJ1Y3Rvcigkc2NvcGU6IE1vZGVsLklEWExpcXVpZEludGVsU2NvcGUsXHJcbiAgICAgICAgICAgICRyb290U2NvcGU6IE1vZGVsLklEWExpcXVpZEludGVsU2NvcGUsXHJcbiAgICAgICAgICAgIGFkYWxBdXRoZW50aWNhdGlvblNlcnZpY2UsXHJcbiAgICAgICAgICAgICRsb2NhdGlvbjogbmcuSUxvY2F0aW9uU2VydmljZSxcclxuICAgICAgICAgICAgJHdpbmRvdzogbmcuSVdpbmRvd1NlcnZpY2UsXHJcbiAgICAgICAgICAgICRyb3V0ZTogbmcucm91dGUuSVJvdXRlU2VydmljZSxcclxuICAgICAgICAgICAgdXNlclNlcnZpY2U6IFNlcnZpY2UuVXNlclNlcnZpY2UsXHJcbiAgICAgICAgICAgIHByb3RlY3RlZCB1bnRhcHBkU2VydmljZTogU2VydmljZS5VbnRhcHBkQXBpU2VydmljZSkge1xyXG5cclxuICAgICAgICAgICAgc3VwZXIoJHNjb3BlLCAkcm9vdFNjb3BlLCBhZGFsQXV0aGVudGljYXRpb25TZXJ2aWNlLCAkbG9jYXRpb24sIHVzZXJTZXJ2aWNlLCBhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFRpdGxlRm9yUm91dGUoJHJvdXRlLmN1cnJlbnQpO1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLmJ1dHRvbkJhckJ1dHRvbnMgPSBbXTtcclxuICAgICAgICAgICAgICAgICRzY29wZS51bnRhcHBkQXV0aGVudGljYXRpb25VcmkgPSBhd2FpdCB1bnRhcHBkU2VydmljZS5nZXRVbnRhcHBkQXV0aFVyaSgkd2luZG93LmxvY2F0aW9uLm9yaWdpbik7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuZGlzY29ubmVjdFVudGFwcGRVc2VyID0gKCkgPT4gdGhpcy5kaXNjb25uZWN0VXNlcigpO1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLnVwZGF0ZVVzZXJJbmZvID0gKCkgPT4gdGhpcy51cGRhdGUoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMucG9wdWxhdGUoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIGFzeW5jIHBvcHVsYXRlKCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRVcGRhdGVTdGF0ZSh0cnVlKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuJHNjb3BlLmxvYWRpbmdNZXNzYWdlID0gXCJSZXRyaWV2aW5nIHVzZXIgaW5mb3JtYXRpb24uLi5cIjtcclxuICAgICAgICAgICAgICAgIHRoaXMuJHNjb3BlLmVycm9yID0gXCJcIjtcclxuICAgICAgICAgICAgICAgIGxldCB1c2VySW5mbyA9IGF3YWl0IHRoaXMudXNlclNlcnZpY2UuZ2V0VXNlckluZm8odGhpcy4kc2NvcGUudXNlckluZm8udXNlck5hbWUpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kc2NvcGUuc3lzdGVtVXNlckluZm8gPSB1c2VySW5mbztcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLiRyb290U2NvcGUudW50YXBwZWRQb3N0QmFja1Rva2VuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy4kc2NvcGUuc3lzdGVtVXNlckluZm8uVW50YXBwZEFjY2Vzc1Rva2VuID0gdGhpcy4kcm9vdFNjb3BlLnVudGFwcGVkUG9zdEJhY2tUb2tlbjtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLiRyb290U2NvcGUudW50YXBwZWRQb3N0QmFja1Rva2VuID0gJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHVudGFwcGRVc2VyUmVzcG9uc2UgPSBhd2FpdCB0aGlzLnVudGFwcGRTZXJ2aWNlLmdldFVzZXJJbmZvKHRoaXMuJHNjb3BlLnN5c3RlbVVzZXJJbmZvLlVudGFwcGRBY2Nlc3NUb2tlbik7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHVudGFwcGRVc2VySW5mbyA9IHVudGFwcGRVc2VyUmVzcG9uc2UucmVzcG9uc2UudXNlcjtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLiRzY29wZS5zeXN0ZW1Vc2VySW5mby5VbnRhcHBkVXNlck5hbWUgPSB1bnRhcHBkVXNlckluZm8udXNlcl9uYW1lO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIElmIFVudGFwcGQgaGFzIGEgdXNlciBpbWFnZSwgZm9yY2UgdGhpcyB0byBiZSBvdXIgaW1hZ2VcclxuICAgICAgICAgICAgICAgICAgICBpZiAodW50YXBwZFVzZXJJbmZvLnVzZXJfYXZhdGFyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuJHNjb3BlLnN5c3RlbVVzZXJJbmZvLlRodW1ibmFpbEltYWdlVXJpID0gdW50YXBwZFVzZXJJbmZvLnVzZXJfYXZhdGFyOyBcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgdGhpcy51cGRhdGUoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0VXBkYXRlU3RhdGUoZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kc2NvcGUubG9hZGluZ01lc3NhZ2UgPSBcIlwiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhdGNoIChleCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRFcnJvcih0cnVlLCBleC5kYXRhIHx8IGV4LnN0YXR1c1RleHQsIGV4LmhlYWRlcnMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIGFzeW5jIHVwZGF0ZSgpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuJHNjb3BlLmxvYWRpbmdNZXNzYWdlID0gXCJTYXZpbmcgdXNlciBpbmZvcm1hdGlvbi4uLlwiO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRVcGRhdGVTdGF0ZSh0cnVlKTtcclxuICAgICAgICAgICAgICAgIGxldCB1c2VySW5mbyA9IGF3YWl0IHRoaXMudXNlclNlcnZpY2UudXBkYXRlVXNlckluZm8odGhpcy4kc2NvcGUudXNlckluZm8udXNlck5hbWUsIHRoaXMuJHNjb3BlLnN5c3RlbVVzZXJJbmZvKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuJHNjb3BlLnN5c3RlbVVzZXJJbmZvID0gdXNlckluZm87XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFVwZGF0ZVN0YXRlKGZhbHNlKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuJHNjb3BlLmxvYWRpbmdNZXNzYWdlID0gXCJcIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXRjaCAoZXgpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0RXJyb3IodHJ1ZSwgZXguZGF0YSB8fCBleC5zdGF0dXNUZXh0LCBleC5oZWFkZXJzKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0VXBkYXRlU3RhdGUoZmFsc2UpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIGRpc2Nvbm5lY3RVc2VyKCk6IHZvaWQge1xyXG4gICAgICAgICAgICB0aGlzLiRzY29wZS5zeXN0ZW1Vc2VySW5mby5VbnRhcHBkVXNlck5hbWUgPSAnJztcclxuICAgICAgICAgICAgdGhpcy4kc2NvcGUuc3lzdGVtVXNlckluZm8uVW50YXBwZEFjY2Vzc1Rva2VuID0gJyc7XHJcbiAgICAgICAgICAgIHRoaXMuJHNjb3BlLnN5c3RlbVVzZXJJbmZvLlRodW1ibmFpbEltYWdlVXJpID0gJyc7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59ICIsIi8vICAgICBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gIEFsbCByaWdodHMgcmVzZXJ2ZWQuXHJcblxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vcmVmZXJlbmNlcy9pbmRleC5kLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vQ29udHJvbGxlckJhc2UudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vU2VydmljZS9VbnRhcHBkQXBpU2VydmljZS50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9TZXJ2aWNlL1ZvdGVTZXJ2aWNlLnRzXCIgLz5cclxuXHJcbm1vZHVsZSBEWExpcXVpZEludGVsLkFwcC5Db250cm9sbGVyIHtcclxuXHJcbiAgICBleHBvcnQgY2xhc3MgVm90ZUJlZXJDb250cm9sbGVyIGV4dGVuZHMgQ29udHJvbGxlckJhc2Uge1xyXG4gICAgICAgIHN0YXRpYyAkaW5qZWN0ID0gWyckc2NvcGUnLCAnJHJvb3RTY29wZScsICdhZGFsQXV0aGVudGljYXRpb25TZXJ2aWNlJywgJyRsb2NhdGlvbicsICckcm91dGUnLCAndXNlclNlcnZpY2UnLCAndW50YXBwZFNlcnZpY2UnLCAndm90ZVNlcnZpY2UnXTtcclxuXHJcbiAgICAgICAgY29uc3RydWN0b3IoJHNjb3BlOiBNb2RlbC5JRFhMaXF1aWRJbnRlbFNjb3BlLFxyXG4gICAgICAgICAgICAkcm9vdFNjb3BlOiBNb2RlbC5JRFhMaXF1aWRJbnRlbFNjb3BlLFxyXG4gICAgICAgICAgICBhZGFsQXV0aGVudGljYXRpb25TZXJ2aWNlLFxyXG4gICAgICAgICAgICAkbG9jYXRpb246IG5nLklMb2NhdGlvblNlcnZpY2UsXHJcbiAgICAgICAgICAgICRyb3V0ZTogbmcucm91dGUuSVJvdXRlU2VydmljZSxcclxuICAgICAgICAgICAgdXNlclNlcnZpY2U6IFNlcnZpY2UuVXNlclNlcnZpY2UsXHJcbiAgICAgICAgICAgIHByb3RlY3RlZCB1bnRhcHBkU2VydmljZTogU2VydmljZS5VbnRhcHBkQXBpU2VydmljZSxcclxuICAgICAgICAgICAgcHJvdGVjdGVkIHZvdGVTZXJ2aWNlOiBTZXJ2aWNlLlZvdGVTZXJ2aWNlKSB7XHJcblxyXG4gICAgICAgICAgICBzdXBlcigkc2NvcGUsICRyb290U2NvcGUsIGFkYWxBdXRoZW50aWNhdGlvblNlcnZpY2UsICRsb2NhdGlvbiwgdXNlclNlcnZpY2UsICgpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0VGl0bGVGb3JSb3V0ZSgkcm91dGUuY3VycmVudCk7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuYnV0dG9uQmFyQnV0dG9ucyA9IFtcclxuICAgICAgICAgICAgICAgICAgICBuZXcgTW9kZWwuQnV0dG9uQmFyQnV0dG9uKFwiQ29tbWl0XCIsICRzY29wZSwgXCJ2b3RlRm9ybS4kdmFsaWQgJiYgdm90ZUZvcm0uJGRpcnR5ICYmICF1cGRhdGVJblByb2dyZXNzXCIsICgpID0+IHRoaXMudXBkYXRlKCksIHRydWUpLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBNb2RlbC5CdXR0b25CYXJCdXR0b24oXCJSZXZlcnRcIiwgJHNjb3BlLCBcIiF1cGRhdGVJblByb2dyZXNzXCIsICgpID0+IHRoaXMucG9wdWxhdGUoKSwgZmFsc2UpXHJcbiAgICAgICAgICAgICAgICBdO1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLnNlYXJjaEJlZXJzID0gKHNlYXJjaFRlcm06IHN0cmluZykgPT4gdGhpcy5zZWFyY2hCZWVycyhzZWFyY2hUZXJtKTtcclxuICAgICAgICAgICAgICAgICRzY29wZS51cGRhdGVWb3RlcyA9ICgpID0+IHRoaXMudXBkYXRlKCk7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuY2xlYXJWb3RlID0gKHZvdGUpID0+IHRoaXMucmVzZXRWb3RlKHZvdGUpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wb3B1bGF0ZSgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgYXN5bmMgc2VhcmNoQmVlcnMoc2VhcmNoVGVybTogc3RyaW5nKTogUHJvbWlzZTxNb2RlbC5CZWVySW5mb1tdPiB7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy51bnRhcHBkU2VydmljZS5zZWFyY2hCZWVycyhzZWFyY2hUZXJtLCB0aGlzLiRzY29wZS5zeXN0ZW1Vc2VySW5mby5VbnRhcHBkQWNjZXNzVG9rZW4pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhdGNoIChleCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgbm9ybWFsaXplVm90ZXNBcnJheShzb3VyY2VWb3RlczogTW9kZWwuVm90ZVtdKTogTW9kZWwuVm90ZVtdIHtcclxuICAgICAgICAgICAgd2hpbGUgKHNvdXJjZVZvdGVzLmxlbmd0aCA8IDIpIHtcclxuICAgICAgICAgICAgICAgIHNvdXJjZVZvdGVzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgIFZvdGVJZDogMCxcclxuICAgICAgICAgICAgICAgICAgICBQZXJzb25uZWxOdW1iZXI6IHRoaXMuJHNjb3BlLnN5c3RlbVVzZXJJbmZvLlBlcnNvbm5lbE51bWJlcixcclxuICAgICAgICAgICAgICAgICAgICBWb3RlRGF0ZTogbmV3IERhdGUoKSxcclxuICAgICAgICAgICAgICAgICAgICBVbnRhcHBkSWQ6IDBcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHNvdXJjZVZvdGVzLmZvckVhY2goKHZvdGUpID0+IHtcclxuICAgICAgICAgICAgICAgIHZvdGUuQmVlckluZm8gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdW50YXBwZElkOiB2b3RlLlVudGFwcGRJZCxcclxuICAgICAgICAgICAgICAgICAgICBuYW1lOiB2b3RlLkJlZXJOYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgIGJyZXdlcnk6IHZvdGUuQnJld2VyeVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgcmV0dXJuIHNvdXJjZVZvdGVzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBhc3luYyBwb3B1bGF0ZSgpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0VXBkYXRlU3RhdGUodHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRzY29wZS5sb2FkaW5nTWVzc2FnZSA9IFwiUmV0cmlldmluZyBwcmV2aW91cyB2b3Rlcy4uLlwiO1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kc2NvcGUuZXJyb3IgPSBcIlwiO1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kc2NvcGUudm90ZXMgPSB0aGlzLm5vcm1hbGl6ZVZvdGVzQXJyYXkoYXdhaXQgdGhpcy52b3RlU2VydmljZS5nZXRVc2VyVm90ZXModGhpcy4kc2NvcGUuc3lzdGVtVXNlckluZm8uUGVyc29ubmVsTnVtYmVyKSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFVwZGF0ZVN0YXRlKGZhbHNlKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuJHNjb3BlLmxvYWRpbmdNZXNzYWdlID0gXCJcIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXRjaCAoZXgpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0RXJyb3IodHJ1ZSwgZXguZGF0YSB8fCBleC5zdGF0dXNUZXh0LCBleC5oZWFkZXJzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSByZXNldFZvdGUodm90ZTogTW9kZWwuVm90ZSkge1xyXG4gICAgICAgICAgICAvLyBEb24ndCByZXNldCB0aGUgdm90ZSBpZCBhcyB3ZSBuZWVkIHRvIGRldGVjdCBpZiB0aGlzIGlzIGEgZGVsZXRlXHJcbiAgICAgICAgICAgIHZvdGUuUGVyc29ubmVsTnVtYmVyID0gdGhpcy4kc2NvcGUuc3lzdGVtVXNlckluZm8uUGVyc29ubmVsTnVtYmVyO1xyXG4gICAgICAgICAgICB2b3RlLlZvdGVEYXRlID0gbmV3IERhdGUoKTtcclxuICAgICAgICAgICAgdm90ZS5VbnRhcHBkSWQgPSAwO1xyXG4gICAgICAgICAgICB2b3RlLkJlZXJOYW1lID0gJyc7XHJcbiAgICAgICAgICAgIHZvdGUuQnJld2VyeSA9ICcnO1xyXG4gICAgICAgICAgICB2b3RlLkJlZXJJbmZvID0gbnVsbDtcclxuICAgICAgICAgICAgdGhpcy4kc2NvcGUudm90ZUZvcm0uJHNldERpcnR5KCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIGFzeW5jIHVwZGF0ZSgpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuJHNjb3BlLmxvYWRpbmdNZXNzYWdlID0gXCJTYXZpbmcgdm90ZXMuLi5cIjtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0VXBkYXRlU3RhdGUodHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRzY29wZS52b3Rlcy5mb3JFYWNoKCh2b3RlOiBNb2RlbC5Wb3RlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHZvdGUuQmVlckluZm8pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdm90ZS5VbnRhcHBkSWQgPSB2b3RlLkJlZXJJbmZvLnVudGFwcGRJZDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdm90ZS5CZWVyTmFtZSA9IHZvdGUuQmVlckluZm8ubmFtZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdm90ZS5CcmV3ZXJ5ID0gdm90ZS5CZWVySW5mby5icmV3ZXJ5O1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kc2NvcGUudm90ZXMgPSB0aGlzLm5vcm1hbGl6ZVZvdGVzQXJyYXkoYXdhaXQgdGhpcy52b3RlU2VydmljZS51cGRhdGVVc2VyVm90ZXModGhpcy4kc2NvcGUuc3lzdGVtVXNlckluZm8uUGVyc29ubmVsTnVtYmVyLCB0aGlzLiRzY29wZS52b3RlcykpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kc2NvcGUudm90ZUZvcm0uJHNldFByaXN0aW5lKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFVwZGF0ZVN0YXRlKGZhbHNlKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuJHNjb3BlLmVycm9yID0gXCJcIjtcclxuICAgICAgICAgICAgICAgIHRoaXMuJHNjb3BlLmxvYWRpbmdNZXNzYWdlID0gXCJcIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXRjaCAoZXgpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0RXJyb3IodHJ1ZSwgZXguZGF0YSB8fCBleC5zdGF0dXNUZXh0LCBleC5oZWFkZXJzKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0VXBkYXRlU3RhdGUoZmFsc2UpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59ICIsIi8vICAgICBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gIEFsbCByaWdodHMgcmVzZXJ2ZWQuXHJcblxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vcmVmZXJlbmNlcy9pbmRleC5kLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vQ29udHJvbGxlckJhc2UudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vU2VydmljZS9VbnRhcHBkQXBpU2VydmljZS50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9TZXJ2aWNlL1ZvdGVTZXJ2aWNlLnRzXCIgLz5cclxuXHJcbm1vZHVsZSBEWExpcXVpZEludGVsLkFwcC5Db250cm9sbGVyIHtcclxuXHJcbiAgICBleHBvcnQgY2xhc3MgVm90ZVJlc3VsdHNDb250cm9sbGVyIGV4dGVuZHMgQ29udHJvbGxlckJhc2Uge1xyXG4gICAgICAgIHN0YXRpYyAkaW5qZWN0ID0gWyckc2NvcGUnLCAnJHJvb3RTY29wZScsICdhZGFsQXV0aGVudGljYXRpb25TZXJ2aWNlJywgJyRsb2NhdGlvbicsICckcm91dGUnLCAndXNlclNlcnZpY2UnLCAndW50YXBwZFNlcnZpY2UnLCAndm90ZVNlcnZpY2UnXTtcclxuXHJcbiAgICAgICAgY29uc3RydWN0b3IoJHNjb3BlOiBNb2RlbC5JRFhMaXF1aWRJbnRlbFNjb3BlLFxyXG4gICAgICAgICAgICAkcm9vdFNjb3BlOiBNb2RlbC5JRFhMaXF1aWRJbnRlbFNjb3BlLFxyXG4gICAgICAgICAgICBhZGFsQXV0aGVudGljYXRpb25TZXJ2aWNlLFxyXG4gICAgICAgICAgICAkbG9jYXRpb246IG5nLklMb2NhdGlvblNlcnZpY2UsXHJcbiAgICAgICAgICAgICRyb3V0ZTogbmcucm91dGUuSVJvdXRlU2VydmljZSxcclxuICAgICAgICAgICAgdXNlclNlcnZpY2U6IFNlcnZpY2UuVXNlclNlcnZpY2UsXHJcbiAgICAgICAgICAgIHByb3RlY3RlZCB1bnRhcHBkU2VydmljZTogU2VydmljZS5VbnRhcHBkQXBpU2VydmljZSxcclxuICAgICAgICAgICAgcHJvdGVjdGVkIHZvdGVTZXJ2aWNlOiBTZXJ2aWNlLlZvdGVTZXJ2aWNlKSB7XHJcblxyXG4gICAgICAgICAgICBzdXBlcigkc2NvcGUsICRyb290U2NvcGUsIGFkYWxBdXRoZW50aWNhdGlvblNlcnZpY2UsICRsb2NhdGlvbiwgdXNlclNlcnZpY2UsICgpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0VGl0bGVGb3JSb3V0ZSgkcm91dGUuY3VycmVudCk7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuYnV0dG9uQmFyQnV0dG9ucyA9IFtdO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wb3B1bGF0ZSgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgYXN5bmMgcG9wdWxhdGUoKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFVwZGF0ZVN0YXRlKHRydWUpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kc2NvcGUubG9hZGluZ01lc3NhZ2UgPSBcIlJldHJpZXZpbmcgY3VycmVudCB2b3RlIHRhbGxpZXMuLi5cIjtcclxuICAgICAgICAgICAgICAgIHRoaXMuJHNjb3BlLmVycm9yID0gXCJcIjtcclxuICAgICAgICAgICAgICAgIGxldCB2b3Rlc1RhbGx5ID0gYXdhaXQgdGhpcy52b3RlU2VydmljZS5nZXRWb3RlVGFsbHkoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuJHNjb3BlLnZvdGVzVGFsbHkgPSB2b3Rlc1RhbGx5O1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kc2NvcGUubG9hZGluZ01lc3NhZ2UgPSBcIlwiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhdGNoIChleCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRFcnJvcih0cnVlLCBleC5kYXRhIHx8IGV4LnN0YXR1c1RleHQsIGV4LmhlYWRlcnMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59ICIsIi8vICAgICBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gIEFsbCByaWdodHMgcmVzZXJ2ZWQuXHJcblxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vcmVmZXJlbmNlcy9pbmRleC5kLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vQ29udHJvbGxlckJhc2UudHNcIiAvPlxyXG5cclxubW9kdWxlIERYTGlxdWlkSW50ZWwuQXBwLkNvbnRyb2xsZXIge1xyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBBbmFseXRpY3NDb250cm9sbGVyIGV4dGVuZHMgQ29udHJvbGxlckJhc2Uge1xyXG4gICAgICAgIHN0YXRpYyAkaW5qZWN0ID0gWyckc2NvcGUnLCAnJHJvb3RTY29wZScsICdhZGFsQXV0aGVudGljYXRpb25TZXJ2aWNlJywgJyRsb2NhdGlvbicsICckcm91dGUnLCAndXNlclNlcnZpY2UnXTtcclxuXHJcbiAgICAgICAgY29uc3RydWN0b3IoJHNjb3BlOiBNb2RlbC5JRFhMaXF1aWRJbnRlbFNjb3BlLFxyXG4gICAgICAgICAgICAkcm9vdFNjb3BlOiBNb2RlbC5JRFhMaXF1aWRJbnRlbFNjb3BlLFxyXG4gICAgICAgICAgICBhZGFsQXV0aGVudGljYXRpb25TZXJ2aWNlLFxyXG4gICAgICAgICAgICAkbG9jYXRpb246IG5nLklMb2NhdGlvblNlcnZpY2UsXHJcbiAgICAgICAgICAgICRyb3V0ZTogbmcucm91dGUuSVJvdXRlU2VydmljZSxcclxuICAgICAgICAgICAgdXNlclNlcnZpY2U6IFNlcnZpY2UuVXNlclNlcnZpY2UpIHtcclxuXHJcbiAgICAgICAgICAgIHN1cGVyKCRzY29wZSwgJHJvb3RTY29wZSwgYWRhbEF1dGhlbnRpY2F0aW9uU2VydmljZSwgJGxvY2F0aW9uLCB1c2VyU2VydmljZSwgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRUaXRsZUZvclJvdXRlKCRyb3V0ZS5jdXJyZW50KTtcclxuICAgICAgICAgICAgICAgICRzY29wZS5idXR0b25CYXJCdXR0b25zID0gW107XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBvcHVsYXRlKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBhc3luYyBwb3B1bGF0ZSgpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0VXBkYXRlU3RhdGUodHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRzY29wZS5sb2FkaW5nTWVzc2FnZSA9IFwiUmV0cmlldmluZyBiZWVyIGFuYWx5dGljcy4uLlwiO1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kc2NvcGUuZXJyb3IgPSBcIlwiO1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kc2NvcGUubG9hZGluZ01lc3NhZ2UgPSBcIlwiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhdGNoIChleCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRFcnJvcih0cnVlLCBleC5kYXRhIHx8IGV4LnN0YXR1c1RleHQsIGV4LmhlYWRlcnMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59ICIsIi8vICAgICBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gIEFsbCByaWdodHMgcmVzZXJ2ZWQuXHJcblxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vcmVmZXJlbmNlcy9pbmRleC5kLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vQ29udHJvbGxlckJhc2UudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vU2VydmljZS9Vc2VyU2VydmljZS50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9TZXJ2aWNlL0Rhc2hib2FyZFNlcnZpY2UudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vU2VydmljZS9LZWdzU2VydmljZS50c1wiIC8+XHJcblxyXG5tb2R1bGUgRFhMaXF1aWRJbnRlbC5BcHAuQ29udHJvbGxlciB7XHJcblxyXG4gICAgZXhwb3J0IGNsYXNzIEhvbWVDb250cm9sbGVyIGV4dGVuZHMgQ29udHJvbGxlckJhc2Uge1xyXG4gICAgICAgIHN0YXRpYyAkaW5qZWN0ID0gWyckc2NvcGUnLCAnJHJvb3RTY29wZScsICdhZGFsQXV0aGVudGljYXRpb25TZXJ2aWNlJywgJyRsb2NhdGlvbicsICckcm91dGUnLCAndXNlclNlcnZpY2UnLCAnZGFzaGJvYXJkU2VydmljZScsICdrZWdzU2VydmljZScsICckaW50ZXJ2YWwnXTtcclxuXHJcbiAgICAgICAgY29uc3RydWN0b3IoJHNjb3BlOiBNb2RlbC5JRFhMaXF1aWRJbnRlbFNjb3BlLFxyXG4gICAgICAgICAgICAkcm9vdFNjb3BlOiBNb2RlbC5JRFhMaXF1aWRJbnRlbFNjb3BlLFxyXG4gICAgICAgICAgICBhZGFsQXV0aGVudGljYXRpb25TZXJ2aWNlLFxyXG4gICAgICAgICAgICAkbG9jYXRpb246IG5nLklMb2NhdGlvblNlcnZpY2UsXHJcbiAgICAgICAgICAgICRyb3V0ZTogbmcucm91dGUuSVJvdXRlU2VydmljZSxcclxuICAgICAgICAgICAgdXNlclNlcnZpY2U6IFNlcnZpY2UuVXNlclNlcnZpY2UsXHJcbiAgICAgICAgICAgIHByb3RlY3RlZCBkYXNoYm9hcmRTZXJ2aWNlOiBTZXJ2aWNlLkRhc2hib2FyZFNlcnZpY2UsXHJcbiAgICAgICAgICAgIHByb3RlY3RlZCBrZWdzU2VydmljZTogU2VydmljZS5LZWdzU2VydmljZSxcclxuICAgICAgICAgICAgJGludGVydmFsOiBuZy5JSW50ZXJ2YWxTZXJ2aWNlKSB7XHJcblxyXG4gICAgICAgICAgICBzdXBlcigkc2NvcGUsICRyb290U2NvcGUsIGFkYWxBdXRoZW50aWNhdGlvblNlcnZpY2UsICRsb2NhdGlvbiwgdXNlclNlcnZpY2UsICgpID0+IHtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFRpdGxlRm9yUm91dGUoJHJvdXRlLmN1cnJlbnQpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wb3B1bGF0ZSgpO1xyXG4gICAgICAgICAgICAgICAgdmFyIGludGVydmFsUHJvbWlzZSA9ICRpbnRlcnZhbCgoKSA9PiB0aGlzLnBvcHVsYXRlKCksIDUwMDApOyAgICAgIFxyXG4gICAgICAgICAgICAgICAgJHNjb3BlLiRvbignJGRlc3Ryb3knLCAoKSA9PiAkaW50ZXJ2YWwuY2FuY2VsKGludGVydmFsUHJvbWlzZSkpOyAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcm90ZWN0ZWQgYXN5bmMgcG9wdWxhdGUoKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICAgICAgICAgIHRoaXMuJHNjb3BlLmN1cnJlbnRUYXBzID0gYXdhaXQgdGhpcy5rZWdzU2VydmljZS5nZXRUYXBzU3RhdHVzKCk7XHJcbiAgICAgICAgICAgIHRoaXMuJHNjb3BlLmN1cnJlbnRBY3Rpdml0aWVzID0gYXdhaXQgdGhpcy5kYXNoYm9hcmRTZXJ2aWNlLmdldExhdGVzdEFjdGl2aXRpZXMoMjUpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSAiLCIvLyAgICAgQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uICBBbGwgcmlnaHRzIHJlc2VydmVkLlxyXG5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL3JlZmVyZW5jZXMvaW5kZXguZC50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL0NvbnRyb2xsZXJCYXNlLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL1NlcnZpY2UvQWRtaW5TZXJ2aWNlLnRzXCIgLz5cclxuXHJcbm1vZHVsZSBEWExpcXVpZEludGVsLkFwcC5Db250cm9sbGVyIHtcclxuXHJcbiAgICBleHBvcnQgY2xhc3MgQXV0aG9yaXplZEdyb3Vwc0NvbnRyb2xsZXIgZXh0ZW5kcyBDb250cm9sbGVyQmFzZSB7XHJcbiAgICAgICAgc3RhdGljICRpbmplY3QgPSBbJyRzY29wZScsICckcm9vdFNjb3BlJywgJ2FkYWxBdXRoZW50aWNhdGlvblNlcnZpY2UnLCAnJGxvY2F0aW9uJywgJyRyb3V0ZScsICd1c2VyU2VydmljZScsICdhZG1pblNlcnZpY2UnXTtcclxuXHJcbiAgICAgICAgY29uc3RydWN0b3IoJHNjb3BlOiBNb2RlbC5JRFhMaXF1aWRJbnRlbFNjb3BlLFxyXG4gICAgICAgICAgICAkcm9vdFNjb3BlOiBNb2RlbC5JRFhMaXF1aWRJbnRlbFNjb3BlLFxyXG4gICAgICAgICAgICBhZGFsQXV0aGVudGljYXRpb25TZXJ2aWNlLFxyXG4gICAgICAgICAgICAkbG9jYXRpb246IG5nLklMb2NhdGlvblNlcnZpY2UsXHJcbiAgICAgICAgICAgICRyb3V0ZTogbmcucm91dGUuSVJvdXRlU2VydmljZSxcclxuICAgICAgICAgICAgdXNlclNlcnZpY2U6IFNlcnZpY2UuVXNlclNlcnZpY2UsXHJcbiAgICAgICAgICAgIHByb3RlY3RlZCBhZG1pblNlcnZpY2U6IFNlcnZpY2UuQWRtaW5TZXJ2aWNlKSB7XHJcblxyXG4gICAgICAgICAgICBzdXBlcigkc2NvcGUsICRyb290U2NvcGUsIGFkYWxBdXRoZW50aWNhdGlvblNlcnZpY2UsICRsb2NhdGlvbiwgdXNlclNlcnZpY2UsICgpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0VGl0bGVGb3JSb3V0ZSgkcm91dGUuY3VycmVudCk7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuYnV0dG9uQmFyQnV0dG9ucyA9IFtcclxuICAgICAgICAgICAgICAgICAgICBuZXcgTW9kZWwuQnV0dG9uQmFyQnV0dG9uKFwiQ29tbWl0XCIsICRzY29wZSwgXCJhdXRob3JpemVkR3JvdXBzRm9ybS4kdmFsaWQgJiYgYXV0aG9yaXplZEdyb3Vwc0Zvcm0uJGRpcnR5ICYmICF1cGRhdGVJblByb2dyZXNzXCIsICgpID0+IHRoaXMudXBkYXRlKCksIHRydWUpLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBNb2RlbC5CdXR0b25CYXJCdXR0b24oXCJSZXZlcnRcIiwgJHNjb3BlLCBcIiF1cGRhdGVJblByb2dyZXNzXCIsICgpID0+IHRoaXMucG9wdWxhdGUoKSwgZmFsc2UpXHJcbiAgICAgICAgICAgICAgICBdO1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLmFkZEdyb3VwID0gKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLiRzY29wZS5uZXdHcm91cCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLiRzY29wZS5hdXRob3JpemVkR3JvdXBzLkF1dGhvcml6ZWRHcm91cHMucHVzaCh0aGlzLiRzY29wZS5uZXdHcm91cC5kaXNwbGF5TmFtZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuJHNjb3BlLm5ld0dyb3VwID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICRzY29wZS5kZWxldGVHcm91cCA9IChncm91cDogc3RyaW5nKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy4kc2NvcGUuYXV0aG9yaXplZEdyb3Vwcy5BdXRob3JpemVkR3JvdXBzLnNwbGljZSh0aGlzLiRzY29wZS5hdXRob3JpemVkR3JvdXBzLkF1dGhvcml6ZWRHcm91cHMuaW5kZXhPZihncm91cCksIDEpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuJHNjb3BlLmF1dGhvcml6ZWRHcm91cHNGb3JtLiRzZXREaXJ0eSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgJHNjb3BlLnNlYXJjaEdyb3VwcyA9IChzZWFyY2hUZXJtOiBzdHJpbmcpID0+IHRoaXMuc2VhcmNoR3JvdXBzKHNlYXJjaFRlcm0pO1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLnVwZGF0ZUF1dGhvcml6ZWRHcm91cHMgPSAoKSA9PiB0aGlzLnVwZGF0ZSgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wb3B1bGF0ZSgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgYXN5bmMgc2VhcmNoR3JvdXBzKHNlYXJjaFRlcm06IHN0cmluZyk6IFByb21pc2U8YW55PiB7XHJcbiAgICAgICAgICAgIHZhciByZXN1bHRzID0gYXdhaXQgdGhpcy5hZG1pblNlcnZpY2Uuc2VhcmNoR3JvdXBzKHNlYXJjaFRlcm0pO1xyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0cy5yZXN1bHRzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBhc3luYyBwb3B1bGF0ZSgpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0VXBkYXRlU3RhdGUodHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRzY29wZS5sb2FkaW5nTWVzc2FnZSA9IFwiUmV0cmlldmluZyBhdXRob3JpemVkIGdyb3Vwcy4uLlwiO1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kc2NvcGUuZXJyb3IgPSBcIlwiO1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kc2NvcGUuYXV0aG9yaXplZEdyb3VwcyA9IGF3YWl0IHRoaXMuYWRtaW5TZXJ2aWNlLmdldEF1dGhvcml6ZWRHcm91cHMoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0VXBkYXRlU3RhdGUoZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kc2NvcGUubG9hZGluZ01lc3NhZ2UgPSBcIlwiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhdGNoIChleCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRFcnJvcih0cnVlLCBleC5kYXRhIHx8IGV4LnN0YXR1c1RleHQsIGV4LmhlYWRlcnMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIGFzeW5jIHVwZGF0ZSgpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuJHNjb3BlLmxvYWRpbmdNZXNzYWdlID0gXCJTYXZpbmcgYXV0aG9yaXplZCBncm91cHMuLi5cIjtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0VXBkYXRlU3RhdGUodHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLmFkbWluU2VydmljZS51cGRhdGVBdXRob3JpemVkR3JvdXBzKHRoaXMuJHNjb3BlLmF1dGhvcml6ZWRHcm91cHMpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kc2NvcGUuYXV0aG9yaXplZEdyb3Vwc0Zvcm0uJHNldFByaXN0aW5lKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFVwZGF0ZVN0YXRlKGZhbHNlKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuJHNjb3BlLmVycm9yID0gXCJcIjtcclxuICAgICAgICAgICAgICAgIHRoaXMuJHNjb3BlLmxvYWRpbmdNZXNzYWdlID0gXCJcIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXRjaCAoZXgpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0RXJyb3IodHJ1ZSwgZXguZGF0YSB8fCBleC5zdGF0dXNUZXh0LCBleC5oZWFkZXJzKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0VXBkYXRlU3RhdGUoZmFsc2UpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59ICIsIi8vICAgICBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gIEFsbCByaWdodHMgcmVzZXJ2ZWQuXHJcblxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vcmVmZXJlbmNlcy9pbmRleC5kLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vQ29udHJvbGxlckJhc2UudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vU2VydmljZS9LZWdzU2VydmljZS50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9TZXJ2aWNlL1VudGFwcGRBcGlTZXJ2aWNlLnRzXCIgLz5cclxuXHJcbm1vZHVsZSBEWExpcXVpZEludGVsLkFwcC5Db250cm9sbGVyIHtcclxuXHJcbiAgICBleHBvcnQgY2xhc3MgSW5zdGFsbEtlZ3NDb250cm9sbGVyIGV4dGVuZHMgQ29udHJvbGxlckJhc2Uge1xyXG4gICAgICAgIHN0YXRpYyAkaW5qZWN0ID0gWyckc2NvcGUnLCAnJHJvb3RTY29wZScsICdhZGFsQXV0aGVudGljYXRpb25TZXJ2aWNlJywgJyRsb2NhdGlvbicsICckcm91dGUnLCAndXNlclNlcnZpY2UnLCAna2Vnc1NlcnZpY2UnLCAndW50YXBwZFNlcnZpY2UnXTtcclxuXHJcbiAgICAgICAgY29uc3RydWN0b3IoJHNjb3BlOiBNb2RlbC5JRFhMaXF1aWRJbnRlbFNjb3BlLFxyXG4gICAgICAgICAgICAkcm9vdFNjb3BlOiBNb2RlbC5JRFhMaXF1aWRJbnRlbFNjb3BlLFxyXG4gICAgICAgICAgICBhZGFsQXV0aGVudGljYXRpb25TZXJ2aWNlLFxyXG4gICAgICAgICAgICAkbG9jYXRpb246IG5nLklMb2NhdGlvblNlcnZpY2UsXHJcbiAgICAgICAgICAgICRyb3V0ZTogbmcucm91dGUuSVJvdXRlU2VydmljZSxcclxuICAgICAgICAgICAgdXNlclNlcnZpY2U6IFNlcnZpY2UuVXNlclNlcnZpY2UsXHJcbiAgICAgICAgICAgIHByb3RlY3RlZCBrZWdzU2VydmljZTogU2VydmljZS5LZWdzU2VydmljZSxcclxuICAgICAgICAgICAgcHJvdGVjdGVkIHVudGFwcGRTZXJ2aWNlOiBTZXJ2aWNlLlVudGFwcGRBcGlTZXJ2aWNlKSB7XHJcblxyXG4gICAgICAgICAgICBzdXBlcigkc2NvcGUsICRyb290U2NvcGUsIGFkYWxBdXRoZW50aWNhdGlvblNlcnZpY2UsICRsb2NhdGlvbiwgdXNlclNlcnZpY2UsICgpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0VGl0bGVGb3JSb3V0ZSgkcm91dGUuY3VycmVudCk7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuYnV0dG9uQmFyQnV0dG9ucyA9IFtcclxuICAgICAgICAgICAgICAgICAgICBuZXcgTW9kZWwuQnV0dG9uQmFyQnV0dG9uKFwiQ29tbWl0XCIsICRzY29wZSwgXCJpbnN0YWxsS2Vnc0Zvcm0uJHZhbGlkICYmIGluc3RhbGxLZWdzRm9ybS4kZGlydHkgJiYgIXVwZGF0ZUluUHJvZ3Jlc3NcIiwgKCkgPT4gdGhpcy51cGRhdGUoKSwgdHJ1ZSksXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IE1vZGVsLkJ1dHRvbkJhckJ1dHRvbihcIlJldmVydFwiLCAkc2NvcGUsIFwiIXVwZGF0ZUluUHJvZ3Jlc3NcIiwgKCkgPT4gdGhpcy5wb3B1bGF0ZSgpLCBmYWxzZSlcclxuICAgICAgICAgICAgICAgIF07XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuc2VhcmNoQmVlcnMgPSAoc2VhcmNoVGVybTogc3RyaW5nKSA9PiB0aGlzLnNlYXJjaEJlZXJzKHNlYXJjaFRlcm0pO1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLnVwZGF0ZUluc3RhbGxLZWdzID0gKCkgPT4gdGhpcy51cGRhdGUoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMucG9wdWxhdGUoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIGFzeW5jIHNlYXJjaEJlZXJzKHNlYXJjaFRlcm06IHN0cmluZyk6IFByb21pc2U8TW9kZWwuQmVlckluZm9bXT4ge1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMudW50YXBwZFNlcnZpY2Uuc2VhcmNoQmVlcnMoc2VhcmNoVGVybSwgdGhpcy4kc2NvcGUuc3lzdGVtVXNlckluZm8uVW50YXBwZEFjY2Vzc1Rva2VuKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXRjaCAoZXgpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIGFzeW5jIHBvcHVsYXRlKCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRVcGRhdGVTdGF0ZSh0cnVlKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuJHNjb3BlLmxvYWRpbmdNZXNzYWdlID0gXCJSZXRyaWV2aW5nIGN1cnJlbnQgdGFwIGluZm9ybWF0aW9uLi4uXCI7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRzY29wZS5lcnJvciA9IFwiXCI7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRzY29wZS5jdXJyZW50VGFwcyA9IHRoaXMubm9ybWFsaXplVGFwSW5mbyhhd2FpdCB0aGlzLmtlZ3NTZXJ2aWNlLmdldFRhcHNTdGF0dXMoKSwgdHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFVwZGF0ZVN0YXRlKGZhbHNlKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuJHNjb3BlLmxvYWRpbmdNZXNzYWdlID0gXCJcIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXRjaCAoZXgpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0RXJyb3IodHJ1ZSwgZXguZGF0YSB8fCBleC5zdGF0dXNUZXh0LCBleC5oZWFkZXJzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBhc3luYyB1cGRhdGUoKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRzY29wZS5sb2FkaW5nTWVzc2FnZSA9IFwiSW5zdGFsbGluZyBuZXcga2Vncy4uLlwiO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRVcGRhdGVTdGF0ZSh0cnVlKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuJHNjb3BlLmN1cnJlbnRUYXBzID0gdGhpcy5ub3JtYWxpemVUYXBJbmZvKGF3YWl0IFByb21pc2UuYWxsKHRoaXMuJHNjb3BlLmN1cnJlbnRUYXBzLm1hcChhc3luYyB0YXBJbmZvID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGFwSW5mby5PcmlnaW5hbFVudGFwcGRJZCAhPT0gdGFwSW5mby5CZWVySW5mby51bnRhcHBkSWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGFwSW5mby5VbnRhcHBkSWQgPSB0YXBJbmZvLkJlZXJJbmZvLnVudGFwcGRJZDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGFwSW5mby5OYW1lID0gdGFwSW5mby5CZWVySW5mby5uYW1lO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0YXBJbmZvLkJlZXJUeXBlID0gdGFwSW5mby5CZWVySW5mby5iZWVyX3R5cGU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhcEluZm8uSUJVID0gdGFwSW5mby5CZWVySW5mby5pYnU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhcEluZm8uQUJWID0gdGFwSW5mby5CZWVySW5mby5hYnY7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhcEluZm8uQmVlckRlc2NyaXB0aW9uID0gdGFwSW5mby5CZWVySW5mby5kZXNjcmlwdGlvbjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGFwSW5mby5CcmV3ZXJ5ID0gdGFwSW5mby5CZWVySW5mby5icmV3ZXJ5O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0YXBJbmZvLmltYWdlUGF0aCA9IHRhcEluZm8uQmVlckluZm8uaW1hZ2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhcEluZm8uQ3VycmVudFZvbHVtZSA9IHRhcEluZm8uS2VnU2l6ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG5ld0tlZyA9IGF3YWl0IHRoaXMua2Vnc1NlcnZpY2UuY3JlYXRlTmV3S2VnKHRhcEluZm8pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLmtlZ3NTZXJ2aWNlLmluc3RhbGxLZWdPblRhcCh0YXBJbmZvLlRhcElkLCBuZXdLZWcuS2VnSWQsIHRhcEluZm8uS2VnU2l6ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhcEluZm8uS2VnSWQgPSBuZXdLZWcuS2VnSWQ7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0YXBJbmZvO1xyXG4gICAgICAgICAgICAgICAgfSkpLCB0cnVlKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuJHNjb3BlLmluc3RhbGxLZWdzRm9ybS4kc2V0UHJpc3RpbmUoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0VXBkYXRlU3RhdGUoZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kc2NvcGUuZXJyb3IgPSBcIlwiO1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kc2NvcGUubG9hZGluZ01lc3NhZ2UgPSBcIlwiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhdGNoIChleCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRFcnJvcih0cnVlLCBleC5kYXRhIHx8IGV4LnN0YXR1c1RleHQsIGV4LmhlYWRlcnMpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRVcGRhdGVTdGF0ZShmYWxzZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgbm9ybWFsaXplVGFwSW5mbyhjdXJyZW50VGFwczogTW9kZWwuVGFwSW5mb1tdLCBpbmNsdWRlRW1wdHlUYXBzOiBib29sZWFuKTogTW9kZWwuVGFwSW5mb1tdIHtcclxuICAgICAgICAgICAgaWYgKGluY2x1ZGVFbXB0eVRhcHMgJiYgY3VycmVudFRhcHMubGVuZ3RoIDwgMikge1xyXG4gICAgICAgICAgICAgICAgLy8gSWYgd2UgZG9uJ3QgY3VycmVudGx5IGhhdmUgYSBrZWcgaW5zdGFsbGVkIG9uIGVpdGhlciB0YXAsIHRoZW4gY3JlYXRlIGFuIGVtcHR5IG9iamVjdFxyXG4gICAgICAgICAgICAgICAgaWYgKCFjdXJyZW50VGFwc1swXSB8fCBjdXJyZW50VGFwc1swXS5UYXBJZCAhPSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudFRhcHMudW5zaGlmdCh0aGlzLmNyZWF0ZUVtcHR5VGFwKDEpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICghY3VycmVudFRhcHNbMV0gfHwgY3VycmVudFRhcHNbMV0uVGFwSWQgIT0gMikge1xyXG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnRUYXBzLnB1c2godGhpcy5jcmVhdGVFbXB0eVRhcCgyKSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnRUYXBzLm1hcCh0YXBJbmZvID0+IHtcclxuICAgICAgICAgICAgICAgIHRhcEluZm8uQmVlckluZm8gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdW50YXBwZElkOiB0YXBJbmZvLlVudGFwcGRJZCxcclxuICAgICAgICAgICAgICAgICAgICBuYW1lOiB0YXBJbmZvLk5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgYmVlcl90eXBlOiB0YXBJbmZvLkJlZXJUeXBlLFxyXG4gICAgICAgICAgICAgICAgICAgIGlidTogdGFwSW5mby5JQlUsXHJcbiAgICAgICAgICAgICAgICAgICAgYWJ2OiB0YXBJbmZvLkFCVixcclxuICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogdGFwSW5mby5CZWVyRGVzY3JpcHRpb24sXHJcbiAgICAgICAgICAgICAgICAgICAgYnJld2VyeTogdGFwSW5mby5CcmV3ZXJ5LFxyXG4gICAgICAgICAgICAgICAgICAgIGltYWdlOiB0YXBJbmZvLmltYWdlUGF0aFxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIHRhcEluZm8uT3JpZ2luYWxVbnRhcHBkSWQgPSB0YXBJbmZvLlVudGFwcGRJZDtcclxuICAgICAgICAgICAgICAgIHRhcEluZm8uZ2V0U2V0QmVlckluZm8gPSAoYmVlckluZm8pID0+IHRoaXMuZ2V0U2V0QmVlckluZm8odGFwSW5mbywgYmVlckluZm8pO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGFwSW5mbztcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIGdldFNldEJlZXJJbmZvKHRhcEluZm86IE1vZGVsLlRhcEluZm8sIGJlZXJJbmZvOiBhbnkpOiBNb2RlbC5CZWVySW5mbyB7XHJcbiAgICAgICAgICAgIGlmIChhbmd1bGFyLmlzRGVmaW5lZChiZWVySW5mbykpIHtcclxuICAgICAgICAgICAgICAgIC8vIElmIHRoZSB0eXBlYWhlYWQgaXNuJ3QgYm91bmQgdG8gYSBwb3B1cCBzZWxlY3Rpb24sIHdlIGp1c3QgZ2V0IHRoZSBzdHJpbmdcclxuICAgICAgICAgICAgICAgIGlmIChhbmd1bGFyLmlzU3RyaW5nKGJlZXJJbmZvKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRhcEluZm8uQmVlckluZm8gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVudGFwcGRJZDogbnVsbCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogYmVlckluZm9cclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoYW5ndWxhci5pc09iamVjdDxNb2RlbC5CZWVySW5mbz4oYmVlckluZm8pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGFwSW5mby5CZWVySW5mbyA9IDxNb2RlbC5CZWVySW5mbz5iZWVySW5mbztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignVHlwZWFkaGVhZCBiaW5kaW5nIHRvIHVuZXhwZWN0ZWQgZGF0YTogJyArIGJlZXJJbmZvKTtcclxuICAgICAgICAgICAgICAgICAgICB0YXBJbmZvLkJlZXJJbmZvID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB1bnRhcHBkSWQ6IG51bGwsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6ICcnXHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gdGFwSW5mby5CZWVySW5mbztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgY3JlYXRlRW1wdHlUYXAodGFwSWQ6IG51bWJlcik6IE1vZGVsLlRhcEluZm8ge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgVGFwSWQ6IHRhcElkLFxyXG4gICAgICAgICAgICAgICAgSW5zdGFsbERhdGU6IG5ldyBEYXRlKCksXHJcbiAgICAgICAgICAgICAgICBLZWdTaXplOiAwLFxyXG4gICAgICAgICAgICAgICAgQ3VycmVudFZvbHVtZTogMCxcclxuICAgICAgICAgICAgICAgIEtlZ0lkOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgTmFtZTogJycsXHJcbiAgICAgICAgICAgICAgICBVbnRhcHBkSWQ6IDAsXHJcbiAgICAgICAgICAgICAgICBCcmV3ZXJ5OiAnJyxcclxuICAgICAgICAgICAgICAgIEJlZXJUeXBlOiAnJyxcclxuICAgICAgICAgICAgICAgIEJlZXJEZXNjcmlwdGlvbjogJycsXHJcbiAgICAgICAgICAgICAgICBpbWFnZVBhdGg6ICcnXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59ICIsIi8vICAgICBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gIEFsbCByaWdodHMgcmVzZXJ2ZWQuXHJcblxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9yZWZlcmVuY2VzL2luZGV4LmQudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9TZXJ2aWNlL1VzZXJTZXJ2aWNlLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vU2VydmljZS9Wb3RlU2VydmljZS50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL1NlcnZpY2UvRGFzaGJvYXJkU2VydmljZS50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL1NlcnZpY2UvS2Vnc1NlcnZpY2UudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9TZXJ2aWNlL0FkbWluU2VydmljZS50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL1NlcnZpY2UvVW50YXBwZEFwaVNlcnZpY2UudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9TZXJ2aWNlL0NvbmZpZ1NlcnZpY2UudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9Db250cm9sbGVyL1VzZXJDb250cm9sbGVyLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vQ29udHJvbGxlci9Wb3RlQmVlckNvbnRyb2xsZXIudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9Db250cm9sbGVyL1ZvdGVSZXN1bHRzQ29udHJvbGxlci50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL0NvbnRyb2xsZXIvQW5hbHl0aWNzQ29udHJvbGxlci50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL0NvbnRyb2xsZXIvSG9tZUNvbnRyb2xsZXIudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9Db250cm9sbGVyL0F1dGhvcml6ZWRHcm91cHNDb250cm9sbGVyLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vQ29udHJvbGxlci9JbnN0YWxsS2Vnc0NvbnRyb2xsZXIudHNcIiAvPlxyXG5cclxubW9kdWxlIERYTGlxdWlkSW50ZWwuQXBwIHtcclxuXHJcbiAgICBleHBvcnQgY2xhc3MgQXBwQnVpbGRlciB7XHJcblxyXG4gICAgICAgIHByaXZhdGUgYXBwOiBuZy5JTW9kdWxlO1xyXG5cclxuICAgICAgICBjb25zdHJ1Y3RvcihuYW1lOiBzdHJpbmcpIHtcclxuICAgICAgICAgICAgdGhpcy5hcHAgPSBhbmd1bGFyLm1vZHVsZShuYW1lLCBbXHJcbiAgICAgICAgICAgICAgICAvLyBBbmd1bGFyIG1vZHVsZXMgXHJcbiAgICAgICAgICAgICAgICBcIm5nUm91dGVcIixcclxuICAgICAgICAgICAgICAgIFwibmdSZXNvdXJjZVwiLFxyXG4gICAgICAgICAgICAgICAgXCJ1aS5ib290c3RyYXBcIixcclxuICAgICAgICAgICAgICAgIFwiZW52aXJvbm1lbnRcIixcclxuICAgICAgICAgICAgICAgIC8vIEFEQUxcclxuICAgICAgICAgICAgICAgICdBZGFsQW5ndWxhcidcclxuICAgICAgICAgICAgXSk7XHJcbiAgICAgICAgICAgIHRoaXMuYXBwLmNvbmZpZyhbJyRyb3V0ZVByb3ZpZGVyJywgJyRodHRwUHJvdmlkZXInLCAnYWRhbEF1dGhlbnRpY2F0aW9uU2VydmljZVByb3ZpZGVyJywgJ2VudlNlcnZpY2VQcm92aWRlcicsXHJcbiAgICAgICAgICAgICAgICAoJHJvdXRlUHJvdmlkZXI6IG5nLnJvdXRlLklSb3V0ZVByb3ZpZGVyLCAkaHR0cFByb3ZpZGVyOiBuZy5JSHR0cFByb3ZpZGVyLCBhZGFsUHJvdmlkZXIsIGVudlNlcnZpY2VQcm92aWRlcjogYW5ndWxhci5lbnZpcm9ubWVudC5TZXJ2aWNlUHJvdmlkZXIpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBlbnZTZXJ2aWNlUHJvdmlkZXIuY29uZmlnKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZG9tYWluczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGV2ZWxvcG1lbnQ6IFsnbG9jYWxob3N0J10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcGU6IFsnZHgtbGlxdWlkYXBwLXN0YWdpbmcuYXp1cmV3ZWJzaXRlcy5uZXQnXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVzZXJhcHA6IFsnZHgtbGlxdWlkYXBwLXVzZXJhcHAuYXp1cmV3ZWJzaXRlcy5uZXQnXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb2R1Y3Rpb246IFsnZHgtbGlxdWlkYXBwLmF6dXJld2Vic2l0ZXMubmV0J11cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGV2ZWxvcG1lbnQ6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcGlVcmk6ICcvL2xvY2FsaG9zdDo4MDgwL2FwaScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVuYW50OiAnbWljcm9zb2Z0LmNvbScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwQ2xpZW50SWQ6ICczNWEzM2NmYy1mYzUyLTQ4Y2YtOTBmNC0yM2FkNjllZjg1YmMnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwaUNsaWVudElkOiAnYjFlODA3NDgtNDNjMi00NDUwLTkxMjEtY2JjMGRjYzk4MDUxJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcGlVc2VybmFtZTogJzAwMDEtMDAwMScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBpUGFzc3dvcmQ6ICdaSGhzYVhGMWFXUXRjbUZ6Y0dKbGNuSjVjR2s9J1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBwZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwaVVyaTogJy8vZHhsaXF1aWRpbnRlbC1zdGFnaW5nLmF6dXJld2Vic2l0ZXMubmV0L2FwaScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVuYW50OiAnbWljcm9zb2Z0LmNvbScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwQ2xpZW50SWQ6ICczNWEzM2NmYy1mYzUyLTQ4Y2YtOTBmNC0yM2FkNjllZjg1YmMnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwaUNsaWVudElkOiAnYjFlODA3NDgtNDNjMi00NDUwLTkxMjEtY2JjMGRjYzk4MDUxJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcGlVc2VybmFtZTogJzAwMDEtMDAwMScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBpUGFzc3dvcmQ6ICdaSGhzYVhGMWFXUXRjbUZ6Y0dKbGNuSjVjR2s9J1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVzZXJhcHA6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcGlVcmk6ICcvL2R4bGlxdWlkaW50ZWwtdXNlcmFwcC5henVyZXdlYnNpdGVzLm5ldC9hcGknLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbmFudDogJ21pY3Jvc29mdC5jb20nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcENsaWVudElkOiAnMzVhMzNjZmMtZmM1Mi00OGNmLTkwZjQtMjNhZDY5ZWY4NWJjJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcGlDbGllbnRJZDogJ2IxZTgwNzQ4LTQzYzItNDQ1MC05MTIxLWNiYzBkY2M5ODA1MScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBpVXNlcm5hbWU6ICcwMDAxLTAwMDEnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwaVBhc3N3b3JkOiAnWkhoc2FYRjFhV1F0Y21GemNHSmxjbko1Y0drPSdcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9kdWN0aW9uOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBpVXJpOiAnLy9keGxpcXVpZGludGVsLmF6dXJld2Vic2l0ZXMubmV0L2FwaScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVuYW50OiAnbWljcm9zb2Z0LmNvbScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwQ2xpZW50SWQ6ICczNWEzM2NmYy1mYzUyLTQ4Y2YtOTBmNC0yM2FkNjllZjg1YmMnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwaUNsaWVudElkOiAnYjFlODA3NDgtNDNjMi00NDUwLTkxMjEtY2JjMGRjYzk4MDUxJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcGlVc2VybmFtZTogJzAwMDEtMDAwMScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBpUGFzc3dvcmQ6ICdaSGhzYVhGMWFXUXRjbUZ6Y0dKbGNuSjVjR2s9J1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgZW52U2VydmljZVByb3ZpZGVyLmNoZWNrKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgJHJvdXRlUHJvdmlkZXJcclxuICAgICAgICAgICAgICAgICAgICAgICAgLndoZW4oXCIvSG9tZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBcIkhvbWVcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6IENvbnRyb2xsZXIuSG9tZUNvbnRyb2xsZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogXCIvdmlld3MvaG9tZS5odG1sXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlSW5zZW5zaXRpdmVNYXRjaDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgLndoZW4oXCIvVXNlclwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGFkYWwuc2hhcmVkLklOYXZSb3V0ZT57XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogXCJVc2VyXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogQ29udHJvbGxlci5Vc2VyQ29udHJvbGxlcixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogXCIvVmlld3MvVXNlci5odG1sXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVxdWlyZUFETG9naW46IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZUluc2Vuc2l0aXZlTWF0Y2g6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC53aGVuKFwiL1ZvdGVCZWVyXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YWRhbC5zaGFyZWQuSU5hdlJvdXRlPntcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBcIlZvdGVCZWVyXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogQ29udHJvbGxlci5Wb3RlQmVlckNvbnRyb2xsZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6IFwiL1ZpZXdzL1ZvdGVCZWVyLmh0bWxcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXF1aXJlQURMb2dpbjogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlSW5zZW5zaXRpdmVNYXRjaDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgLndoZW4oXCIvVm90ZVJlc3VsdHNcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxhZGFsLnNoYXJlZC5JTmF2Um91dGU+e1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IFwiVm90ZVJlc3VsdHNcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBDb250cm9sbGVyLlZvdGVSZXN1bHRzQ29udHJvbGxlcixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogXCIvVmlld3MvVm90ZVJlc3VsdHMuaHRtbFwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcXVpcmVBRExvZ2luOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2VJbnNlbnNpdGl2ZU1hdGNoOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAud2hlbihcIi9BbmFseXRpY3NcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxhZGFsLnNoYXJlZC5JTmF2Um91dGU+e1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IFwiQW5hbHl0aWNzXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogQ29udHJvbGxlci5BbmFseXRpY3NDb250cm9sbGVyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBcIi9WaWV3cy9BbmFseXRpY3MuaHRtbFwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcXVpcmVBRExvZ2luOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2VJbnNlbnNpdGl2ZU1hdGNoOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAud2hlbihcIi9BdXRob3JpemVkR3JvdXBzXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YWRhbC5zaGFyZWQuSU5hdlJvdXRlPntcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBcIkF1dGhvcml6ZWRHcm91cHNcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBDb250cm9sbGVyLkF1dGhvcml6ZWRHcm91cHNDb250cm9sbGVyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBcIi9WaWV3cy9BdXRob3JpemVkR3JvdXBzLmh0bWxcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXF1aXJlQURMb2dpbjogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlSW5zZW5zaXRpdmVNYXRjaDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgLndoZW4oXCIvSW5zdGFsbEtlZ3NcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxhZGFsLnNoYXJlZC5JTmF2Um91dGU+e1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IFwiSW5zdGFsbEtlZ3NcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBDb250cm9sbGVyLkluc3RhbGxLZWdzQ29udHJvbGxlcixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogXCIvVmlld3MvSW5zdGFsbEtlZ3MuaHRtbFwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcXVpcmVBRExvZ2luOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2VJbnNlbnNpdGl2ZU1hdGNoOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAub3RoZXJ3aXNlKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWRpcmVjdFRvOiBcIi9Ib21lXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gQ29uZmlndXJlIEFEQUwuXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGFkYWxDb25maWcgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRlbmFudDogZW52U2VydmljZVByb3ZpZGVyLnJlYWQoJ3RlbmFudCcpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGllbnRJZDogZW52U2VydmljZVByb3ZpZGVyLnJlYWQoJ2FwcENsaWVudElkJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhY2hlTG9jYXRpb246IHdpbmRvdy5sb2NhdGlvbi5ob3N0bmFtZSA9PT0gXCJsb2NhbGhvc3RcIiA/IFwibG9jYWxTdG9yYWdlXCIgOiBcIlwiLCAvLyBlbmFibGUgdGhpcyBmb3IgSUUsIGFzIHNlc3Npb25TdG9yYWdlIGRvZXMgbm90IHdvcmsgZm9yIGxvY2FsaG9zdC5cclxuICAgICAgICAgICAgICAgICAgICAgICAgZW5kcG9pbnRzOiB7fSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYW5vbnltb3VzRW5kcG9pbnRzOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbnZTZXJ2aWNlUHJvdmlkZXIucmVhZCgnYXBpVXJpJykgKyAnL0N1cnJlbnRLZWcnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZW52U2VydmljZVByb3ZpZGVyLnJlYWQoJ2FwaVVyaScpICsgJy9hY3Rpdml0eSdcclxuICAgICAgICAgICAgICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZXh0cmFRdWVyeVBhcmFtZXRlcjogJ3Jlc291cmNlPWh0dHBzJTNBJTJGJTJGbWFuYWdlbWVudC5jb3JlLndpbmRvd3MubmV0JTJGJ1xyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgYWRhbENvbmZpZy5lbmRwb2ludHNbZW52U2VydmljZVByb3ZpZGVyLnJlYWQoJ2FwaVVyaScpXSA9IGVudlNlcnZpY2VQcm92aWRlci5yZWFkKCdhcGlDbGllbnRJZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIGFkYWxQcm92aWRlci5pbml0KGFkYWxDb25maWcsICRodHRwUHJvdmlkZXIpO1xyXG4gICAgICAgICAgICAgICAgfV0pO1xyXG4gICAgICAgICAgICB0aGlzLmFwcC5zZXJ2aWNlKCdjb25maWdTZXJ2aWNlJywgU2VydmljZS5Db25maWdTZXJ2aWNlKTtcclxuICAgICAgICAgICAgdGhpcy5hcHAuc2VydmljZSgndXNlclNlcnZpY2UnLCBTZXJ2aWNlLlVzZXJTZXJ2aWNlKTtcclxuICAgICAgICAgICAgdGhpcy5hcHAuc2VydmljZSgndW50YXBwZFNlcnZpY2UnLCBTZXJ2aWNlLlVudGFwcGRBcGlTZXJ2aWNlKTtcclxuICAgICAgICAgICAgdGhpcy5hcHAuc2VydmljZSgndm90ZVNlcnZpY2UnLCBTZXJ2aWNlLlZvdGVTZXJ2aWNlKTtcclxuICAgICAgICAgICAgdGhpcy5hcHAuc2VydmljZSgnZGFzaGJvYXJkU2VydmljZScsIFNlcnZpY2UuRGFzaGJvYXJkU2VydmljZSk7XHJcbiAgICAgICAgICAgIHRoaXMuYXBwLnNlcnZpY2UoJ2tlZ3NTZXJ2aWNlJywgU2VydmljZS5LZWdzU2VydmljZSk7XHJcbiAgICAgICAgICAgIHRoaXMuYXBwLnNlcnZpY2UoJ2FkbWluU2VydmljZScsIFNlcnZpY2UuQWRtaW5TZXJ2aWNlKTtcclxuICAgICAgICAgICAgdGhpcy5hcHAucnVuKFsnJHdpbmRvdycsICckcScsICckbG9jYXRpb24nLCAnJHJvdXRlJywgJyRyb290U2NvcGUnLCAoJHdpbmRvdywgJHEsICRsb2NhdGlvbiwgJHJvdXRlLCAkcm9vdFNjb3BlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvLyBNYWtlIGFuZ3VsYXIncyBwcm9taXNlcyB0aGUgZGVmYXVsdCBhcyB0aGF0IHdpbGwgc3RpbGwgaW50ZWdyYXRlIHdpdGggYW5ndWxhcidzIGRpZ2VzdCBjeWNsZSBhZnRlciBhd2FpdHNcclxuICAgICAgICAgICAgICAgICR3aW5kb3cuUHJvbWlzZSA9ICRxO1xyXG4gICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kb24oJyRsb2NhdGlvbkNoYW5nZVN0YXJ0JywgKGV2ZW50LCBuZXdVcmwsIG9sZFVybCkgPT4gdGhpcy5sb2NhdGlvbkNoYW5nZUhhbmRsZXIoJHJvb3RTY29wZSwgJGxvY2F0aW9uKSk7XHJcbiAgICAgICAgICAgIH1dKTsgICAgICAgICAgICBcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgbG9jYXRpb25DaGFuZ2VIYW5kbGVyKCRyb290U2NvcGUsICRsb2NhdGlvbik6IHZvaWQge1xyXG4gICAgICAgICAgICB2YXIgaGFzaCA9ICcnO1xyXG4gICAgICAgICAgICBpZiAoJGxvY2F0aW9uLiQkaHRtbDUpIHtcclxuICAgICAgICAgICAgICAgIGhhc2ggPSAkbG9jYXRpb24uaGFzaCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaGFzaCA9ICcjJyArICRsb2NhdGlvbi5wYXRoKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gVXNlIEFEQUwgZm9yIHVybCByZXNwb25zZSBwYXJzaW5nXHJcbiAgICAgICAgICAgIHZhciBfYWRhbDogYW55ID0gbmV3IEF1dGhlbnRpY2F0aW9uQ29udGV4dCh7Y2xpZW50SWQ6Jyd9KTtcclxuICAgICAgICAgICAgaGFzaCA9IF9hZGFsLl9nZXRIYXNoKGhhc2gpO1xyXG4gICAgICAgICAgICB2YXIgcGFyYW1ldGVycyA9IF9hZGFsLl9kZXNlcmlhbGl6ZShoYXNoKTtcclxuICAgICAgICAgICAgaWYgKHBhcmFtZXRlcnMuaGFzT3duUHJvcGVydHkoJ2FjY2Vzc190b2tlbicpKSB7XHJcbiAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLnVudGFwcGVkUG9zdEJhY2tUb2tlbiA9IHBhcmFtZXRlcnNbJ2FjY2Vzc190b2tlbiddO1xyXG4gICAgICAgICAgICAgICAgJGxvY2F0aW9uLnBhdGgoJ1VzZXInKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHN0YXJ0KCk6IHZvaWQge1xyXG4gICAgICAgICAgICAkKGRvY3VtZW50KS5yZWFkeSgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiYm9vdGluZyBcIiArIHRoaXMuYXBwLm5hbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBpbmplY3RvciA9IGFuZ3VsYXIuYm9vdHN0cmFwKGRvY3VtZW50LCBbdGhpcy5hcHAubmFtZV0pO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiYm9vdGVkIGFwcDogXCIgKyBpbmplY3Rvcik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjYXRjaCAoZXgpIHtcclxuICAgICAgICAgICAgICAgICAgICAkKCcjQm9vdEV4Y2VwdGlvbkRldGFpbHMnKS50ZXh0KGV4KTtcclxuICAgICAgICAgICAgICAgICAgICAkKCcjQW5ndWxhckJvb3RFcnJvcicpLnNob3coKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiYXBwYnVpbGRlci50c1wiIC8+XHJcblxyXG5uZXcgRFhMaXF1aWRJbnRlbC5BcHAuQXBwQnVpbGRlcignZHhMaXF1aWRJbnRlbEFwcCcpLnN0YXJ0KCk7IiwiLy8gICAgIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiAgQWxsIHJpZ2h0cyByZXNlcnZlZC5cclxuXHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9yZWZlcmVuY2VzL2luZGV4LmQudHNcIiAvPlxyXG5cclxubW9kdWxlIERYTGlxdWlkSW50ZWwuQXBwLk1vZGVsIHtcclxuXHJcbiAgICBleHBvcnQgY2xhc3MgQnV0dG9uQmFyQnV0dG9uIHtcclxuICAgICAgICBjb25zdHJ1Y3RvcihwdWJsaWMgZGlzcGxheVRleHQ6IHN0cmluZyxcclxuICAgICAgICAgICAgJHNjb3BlOiBNb2RlbC5JRFhMaXF1aWRJbnRlbFNjb3BlLFxyXG4gICAgICAgICAgICBlbmFibGVkRXhwcmVzc2lvbjogc3RyaW5nLFxyXG4gICAgICAgICAgICBwdWJsaWMgZG9DbGljazogRnVuY3Rpb24sXHJcbiAgICAgICAgICAgIHB1YmxpYyBpc1N1Ym1pdDogYm9vbGVhbixcclxuICAgICAgICAgICAgcHJpdmF0ZSBpbWFnZVVybD86IHN0cmluZykge1xyXG5cclxuICAgICAgICAgICAgdGhpcy5lbmFibGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICRzY29wZS4kd2F0Y2goZW5hYmxlZEV4cHJlc3Npb24sIChuZXdWYWx1ZTogYm9vbGVhbikgPT4gdGhpcy5lbmFibGVkID0gbmV3VmFsdWUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGVuYWJsZWQ6IGJvb2xlYW47XHJcbiAgICB9XHJcbn0gIiwiLy8gICAgIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiAgQWxsIHJpZ2h0cyByZXNlcnZlZC5cclxuXHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9yZWZlcmVuY2VzL2luZGV4LmQudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiVXNlckluZm8udHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiVm90ZS50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJUYXBJbmZvLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIkFkbWluLnRzXCIgLz5cclxuXHJcbm1vZHVsZSBEWExpcXVpZEludGVsLkFwcC5Nb2RlbCB7XHJcblxyXG4gICAgZXhwb3J0IGludGVyZmFjZSBJRFhMaXF1aWRJbnRlbFNjb3BlIGV4dGVuZHMgbmcuSVNjb3BlIHtcclxuICAgICAgICBzeXN0ZW1Vc2VySW5mbzogVXNlckluZm9cclxuICAgICAgICBpc0FkbWluOiBGdW5jdGlvblxyXG4gICAgICAgIHZvdGVzOiBWb3RlW11cclxuICAgICAgICB2b3Rlc1RhbGx5OiBWb3RlVGFsbHlbXVxyXG4gICAgICAgIGN1cnJlbnRUYXBzOiBUYXBJbmZvW11cclxuICAgICAgICBjdXJyZW50QWN0aXZpdGllczogQWN0aXZpdHlbXVxyXG4gICAgICAgIGF1dGhvcml6ZWRHcm91cHM6IEF1dGhvcml6ZWRHcm91cHNcclxuICAgICAgICB0aXRsZTogc3RyaW5nXHJcbiAgICAgICAgZXJyb3I6IHN0cmluZ1xyXG4gICAgICAgIGVycm9yX2NsYXNzOiBzdHJpbmdcclxuICAgICAgICBsb2FkaW5nTWVzc2FnZTogc3RyaW5nXHJcbiAgICAgICAgbG9naW46IEZ1bmN0aW9uXHJcbiAgICAgICAgbG9nb3V0OiBGdW5jdGlvblxyXG4gICAgICAgIGlzQ29udHJvbGxlckFjdGl2ZTogRnVuY3Rpb25cclxuICAgICAgICB1bnRhcHBlZFBvc3RCYWNrVG9rZW46IHN0cmluZ1xyXG4gICAgICAgIHVudGFwcGRBdXRoZW50aWNhdGlvblVyaTogc3RyaW5nXHJcbiAgICAgICAgZGlzY29ubmVjdFVudGFwcGRVc2VyOiBGdW5jdGlvblxyXG4gICAgICAgIGRlbGV0ZUFjY291bnQ6IEZ1bmN0aW9uXHJcbiAgICAgICAgZ2VuZXJhdGVTdG9yYWdlS2V5OiBGdW5jdGlvblxyXG4gICAgICAgIGFyZVVwZGF0ZXNBdmFpbGFibGU6IGJvb2xlYW5cclxuICAgICAgICB1cGRhdGVCYW5uZXJDbGFzczogc3RyaW5nXHJcbiAgICAgICAgdXBkYXRlSW5Qcm9ncmVzczogYm9vbGVhblxyXG4gICAgICAgIHVwZGF0ZU1lc3NhZ2U6IHN0cmluZ1xyXG4gICAgICAgIGdldEh0bWxEZXNjcmlwdGlvbjogRnVuY3Rpb25cclxuICAgICAgICBhcHBseVVwZGF0ZTogRnVuY3Rpb25cclxuICAgICAgICB1cGRhdGVDb25maWd1cmF0aW9uOiBGdW5jdGlvblxyXG4gICAgICAgIHVwZGF0ZVVzZXJJbmZvOiBGdW5jdGlvblxyXG4gICAgICAgIGJ1dHRvbkJhckJ1dHRvbnM6IEJ1dHRvbkJhckJ1dHRvbltdXHJcbiAgICB9XHJcbn0gXHJcblxyXG4iXX0=

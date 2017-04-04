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
                                production: ['dx-liquidapp.azurewebsites.net']
                            },
                            vars: {
                                development: {
                                    apiUri: '//localhost:8080/api',
                                    tenant: 'microsoft.com',
                                    appClientId: '35a33cfc-fc52-48cf-90f4-23ad69ef85bc',
                                    apiClientId: '35a33cfc-fc52-48cf-90f4-23ad69ef85bc',
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIk1vZGVsL1VzZXJJbmZvLnRzIiwiU2VydmljZS9Vc2VyU2VydmljZS50cyIsIk1vZGVsL0JlZXJJbmZvLnRzIiwiTW9kZWwvVm90ZS50cyIsIlNlcnZpY2UvVm90ZVNlcnZpY2UudHMiLCJNb2RlbC9BY3Rpdml0eS50cyIsIlNlcnZpY2UvQmFzaWNBdXRoUmVzb3VyY2UudHMiLCJTZXJ2aWNlL0Rhc2hib2FyZFNlcnZpY2UudHMiLCJNb2RlbC9UYXBJbmZvLnRzIiwiU2VydmljZS9LZWdzU2VydmljZS50cyIsIk1vZGVsL0FkbWluLnRzIiwiU2VydmljZS9BZG1pblNlcnZpY2UudHMiLCJNb2RlbC9Db25maWd1cmF0aW9uLnRzIiwiU2VydmljZS9Db25maWdTZXJ2aWNlLnRzIiwiU2VydmljZS9VbnRhcHBkQXBpU2VydmljZS50cyIsIkNvbnRyb2xsZXIvQ29udHJvbGxlckJhc2UudHMiLCJDb250cm9sbGVyL1VzZXJDb250cm9sbGVyLnRzIiwiQ29udHJvbGxlci9Wb3RlQmVlckNvbnRyb2xsZXIudHMiLCJDb250cm9sbGVyL1ZvdGVSZXN1bHRzQ29udHJvbGxlci50cyIsIkNvbnRyb2xsZXIvQW5hbHl0aWNzQ29udHJvbGxlci50cyIsIkNvbnRyb2xsZXIvSG9tZUNvbnRyb2xsZXIudHMiLCJDb250cm9sbGVyL0F1dGhvcml6ZWRHcm91cHNDb250cm9sbGVyLnRzIiwiQ29udHJvbGxlci9JbnN0YWxsS2Vnc0NvbnRyb2xsZXIudHMiLCJBcHBCdWlsZGVyLnRzIiwic3RhcnQudHMiLCJNb2RlbC9BcHBTdGF0ZS50cyIsIk1vZGVsL1Njb3BlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLGlFQUFpRTtBQUVqRSxpREFBaUQ7QUFFakQsSUFBTyxhQUFhLENBaUJuQjtBQWpCRCxXQUFPLGFBQWE7SUFBQyxJQUFBLEdBQUcsQ0FpQnZCO0lBakJvQixXQUFBLEdBQUc7UUFBQyxJQUFBLEtBQUssQ0FpQjdCO1FBakJ3QixXQUFBLEtBQUs7WUFFMUIs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RWpELElBQU8sYUFBYSxDQWdCbkI7QUFoQkQsV0FBTyxhQUFhO0lBQUMsSUFBQSxHQUFHLENBZ0J2QjtJQWhCb0IsV0FBQSxHQUFHO1FBQUMsSUFBQSxLQUFLLENBZ0I3QjtRQWhCd0IsV0FBQSxLQUFLO1lBRTFCO2dCQUNJLFlBQW1CLFdBQW1CLEVBQ2xDLE1BQWlDLEVBQ2pDLGlCQUF5QixFQUNsQixPQUFpQixFQUNqQixRQUFpQixFQUNoQixRQUFpQjtvQkFMVixnQkFBVyxHQUFYLFdBQVcsQ0FBUTtvQkFHM0IsWUFBTyxHQUFQLE9BQU8sQ0FBVTtvQkFDakIsYUFBUSxHQUFSLFFBQVEsQ0FBUztvQkFDaEIsYUFBUSxHQUFSLFFBQVEsQ0FBUztvQkFFekIsSUFBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7b0JBQ3JCLE1BQU0sQ0FBQyxNQUFNLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxRQUFpQixLQUFLLElBQUksQ0FBQyxPQUFPLEdBQUcsUUFBUSxDQUFDLENBQUM7Z0JBQ3JGLENBQUM7YUFHSjtZQWJZLHFCQUFlLGtCQWEzQixDQUFBO1FBQ0wsQ0FBQyxFQWhCd0IsS0FBSyxHQUFMLFNBQUssS0FBTCxTQUFLLFFBZ0I3QjtJQUFELENBQUMsRUFoQm9CLEdBQUcsR0FBSCxpQkFBRyxLQUFILGlCQUFHLFFBZ0J2QjtBQUFELENBQUMsRUFoQk0sYUFBYSxLQUFiLGFBQWEsUUFnQm5CO0FDcEJELGlFQUFpRTtBQUVqRSxpREFBaUQ7QUFDakQsb0NBQW9DO0FBQ3BDLGdDQUFnQztBQUNoQyxtQ0FBbUM7QUFDbkMsaUNBQWlDIiwiZmlsZSI6InVzZXJhcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyAgICAgQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uICBBbGwgcmlnaHRzIHJlc2VydmVkLlxyXG5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL3JlZmVyZW5jZXMvaW5kZXguZC50c1wiIC8+XHJcblxyXG5tb2R1bGUgRFhMaXF1aWRJbnRlbC5BcHAuTW9kZWwge1xyXG5cclxuICAgIC8vIE5lZWQgdG8ga2VlcCBzdHJ1Y3R1cmUgaW4gc3luYyB3aXRoIERhc2hTZXJ2ZXIuTWFuYWdlbWVudEFQSS5Nb2RlbHMuT3BlcmF0aW9uU3RhdGUgaW4gdGhlIFdlYkFQSVxyXG4gICAgZXhwb3J0IGNsYXNzIFVzZXJJbmZvIHtcclxuICAgICAgICBwdWJsaWMgUGVyc29ubmVsTnVtYmVyOiBudW1iZXJcclxuICAgICAgICBwdWJsaWMgVXNlclByaW5jaXBhbE5hbWU6IHN0cmluZ1xyXG4gICAgICAgIHB1YmxpYyBVbnRhcHBkVXNlck5hbWU6IHN0cmluZ1xyXG4gICAgICAgIHB1YmxpYyBVbnRhcHBkQWNjZXNzVG9rZW46IHN0cmluZ1xyXG4gICAgICAgIHB1YmxpYyBDaGVja2luRmFjZWJvb2s6IGJvb2xlYW5cclxuICAgICAgICBwdWJsaWMgQ2hlY2tpblR3aXR0ZXI6IGJvb2xlYW5cclxuICAgICAgICBwdWJsaWMgQ2hlY2tpbkZvdXJzcXVhcmU6IGJvb2xlYW5cclxuICAgICAgICBwdWJsaWMgRnVsbE5hbWU6IHN0cmluZ1xyXG4gICAgICAgIHB1YmxpYyBGaXJzdE5hbWU6IHN0cmluZ1xyXG4gICAgICAgIHB1YmxpYyBMYXN0TmFtZTogc3RyaW5nXHJcbiAgICAgICAgcHVibGljIElzQWRtaW46IGJvb2xlYW5cclxuICAgICAgICBwdWJsaWMgVGh1bWJuYWlsSW1hZ2VVcmk6IHN0cmluZ1xyXG4gICAgfVxyXG59XHJcbiAgICAgICAgICIsIi8vICAgICBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gIEFsbCByaWdodHMgcmVzZXJ2ZWQuXHJcblxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vcmVmZXJlbmNlcy9pbmRleC5kLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL01vZGVsL1VzZXJJbmZvLnRzXCIgLz5cclxuXHJcbm1vZHVsZSBEWExpcXVpZEludGVsLkFwcC5TZXJ2aWNlIHtcclxuXHJcbiAgICBleHBvcnQgY2xhc3MgVXNlclNlcnZpY2Uge1xyXG4gICAgICAgIHN0YXRpYyAkaW5qZWN0ID0gWyckcmVzb3VyY2UnLCAnZW52U2VydmljZSddO1xyXG5cclxuICAgICAgICBwcml2YXRlIHJlc291cmNlQ2xhc3M6IG5nLnJlc291cmNlLklSZXNvdXJjZUNsYXNzPG5nLnJlc291cmNlLklSZXNvdXJjZTxNb2RlbC5Vc2VySW5mbz4+O1xyXG4gICAgICAgIHByaXZhdGUgY2FjaGVkVXNlcklkOiBzdHJpbmc7XHJcbiAgICAgICAgcHJpdmF0ZSBjYWNoZWRVc2VySW5mbzogUHJvbWlzZUxpa2U8TW9kZWwuVXNlckluZm8+O1xyXG5cclxuICAgICAgICBjb25zdHJ1Y3RvcigkcmVzb3VyY2U6IG5nLnJlc291cmNlLklSZXNvdXJjZVNlcnZpY2UsIGVudlNlcnZpY2U6IGFuZ3VsYXIuZW52aXJvbm1lbnQuU2VydmljZSkge1xyXG5cclxuICAgICAgICAgICAgdGhpcy5yZXNvdXJjZUNsYXNzID0gPG5nLnJlc291cmNlLklSZXNvdXJjZUNsYXNzPG5nLnJlc291cmNlLklSZXNvdXJjZTxNb2RlbC5Vc2VySW5mbz4+PiRyZXNvdXJjZShlbnZTZXJ2aWNlLnJlYWQoJ2FwaVVyaScpICsgJy91c2Vycy86dXNlcklkJyxcclxuICAgICAgICAgICAgICAgIG51bGwsXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdXBkYXRlOiB7IG1ldGhvZDogJ1BVVCcgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgZ2V0VXNlckluZm8odXNlcklkOiBzdHJpbmcpOiBQcm9taXNlTGlrZTxNb2RlbC5Vc2VySW5mbz4ge1xyXG4gICAgICAgICAgICBpZiAodXNlcklkID09IHRoaXMuY2FjaGVkVXNlcklkICYmIHRoaXMuY2FjaGVkVXNlckluZm8gIT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2FjaGVkVXNlckluZm87XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5jYWNoZWRVc2VySWQgPSB1c2VySWQ7XHJcbiAgICAgICAgICAgIGlmICghdXNlcklkKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNhY2hlZFVzZXJJbmZvID0gUHJvbWlzZS5yZXNvbHZlPE1vZGVsLlVzZXJJbmZvPihudWxsKTsgICAgXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNhY2hlZFVzZXJJbmZvID0gdGhpcy5yZXNvdXJjZUNsYXNzLmdldCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVzZXJJZDogdXNlcklkXHJcbiAgICAgICAgICAgICAgICAgICAgfSwgXHJcbiAgICAgICAgICAgICAgICAgICAgbnVsbCwgXHJcbiAgICAgICAgICAgICAgICAgICAgKGVyclJlc3A6IG5nLklIdHRwUHJvbWlzZTxNb2RlbC5Vc2VySW5mbz4pID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gQ2xlYXIgb3V0IGNhY2hlZCBwcm9taXNlIHRvIGFsbG93IHJldHJ5IG9uIGVycm9yXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY2FjaGVkVXNlcklkID0gJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY2FjaGVkVXNlckluZm8gPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pLiRwcm9taXNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNhY2hlZFVzZXJJbmZvO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHVwZGF0ZVVzZXJJbmZvKHVzZXJJZDogc3RyaW5nLCB1c2VySW5mbzogTW9kZWwuVXNlckluZm8pOiBQcm9taXNlTGlrZTxNb2RlbC5Vc2VySW5mbz4ge1xyXG4gICAgICAgICAgICBpZiAoIXVzZXJJZCkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgJ0ludmFsaWQgdXNlciBpZCc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5jYWNoZWRVc2VySWQgPSAnJztcclxuICAgICAgICAgICAgdGhpcy5jYWNoZWRVc2VySW5mbyA9IG51bGw7XHJcbiAgICAgICAgICAgIHJldHVybiAoPGFueT50aGlzLnJlc291cmNlQ2xhc3MpLnVwZGF0ZSh7XHJcbiAgICAgICAgICAgICAgICAgICAgdXNlcklkOiB1c2VySWRcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB1c2VySW5mbykuJHByb21pc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiAiLCIvLyAgICAgQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uICBBbGwgcmlnaHRzIHJlc2VydmVkLlxyXG5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL3JlZmVyZW5jZXMvaW5kZXguZC50c1wiIC8+XHJcblxyXG5tb2R1bGUgRFhMaXF1aWRJbnRlbC5BcHAuTW9kZWwge1xyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBCZWVySW5mbyB7XHJcbiAgICAgICAgcHVibGljIHVudGFwcGRJZDogbnVtYmVyXHJcbiAgICAgICAgcHVibGljIG5hbWU6IHN0cmluZ1xyXG4gICAgICAgIHB1YmxpYyBiZWVyX3R5cGU/OiBzdHJpbmdcclxuICAgICAgICBwdWJsaWMgaWJ1PzogbnVtYmVyXHJcbiAgICAgICAgcHVibGljIGFidj86IG51bWJlclxyXG4gICAgICAgIHB1YmxpYyBkZXNjcmlwdGlvbj86IHN0cmluZ1xyXG4gICAgICAgIHB1YmxpYyBicmV3ZXJ5Pzogc3RyaW5nXHJcbiAgICAgICAgcHVibGljIGltYWdlPzogc3RyaW5nXHJcbiAgICB9XHJcbn0iLCIvLyAgICAgQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uICBBbGwgcmlnaHRzIHJlc2VydmVkLlxyXG5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL3JlZmVyZW5jZXMvaW5kZXguZC50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJCZWVySW5mby50c1wiIC8+XHJcblxyXG5tb2R1bGUgRFhMaXF1aWRJbnRlbC5BcHAuTW9kZWwge1xyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBWb3RlIHtcclxuICAgICAgICBwdWJsaWMgVm90ZUlkOiBudW1iZXJcclxuICAgICAgICBwdWJsaWMgUGVyc29ubmVsTnVtYmVyOiBudW1iZXJcclxuICAgICAgICBwdWJsaWMgVm90ZURhdGU6IERhdGVcclxuICAgICAgICBwdWJsaWMgVW50YXBwZElkOiBudW1iZXJcclxuICAgICAgICBwdWJsaWMgQmVlck5hbWU/OiBzdHJpbmdcclxuICAgICAgICBwdWJsaWMgQnJld2VyeT86IHN0cmluZ1xyXG4gICAgICAgIHB1YmxpYyBCZWVySW5mbz86IEJlZXJJbmZvXHJcbiAgICB9XHJcblxyXG4gICAgZXhwb3J0IGNsYXNzIFZvdGVUYWxseSB7XHJcbiAgICAgICAgcHVibGljIFVudGFwcGRJZDogbnVtYmVyXHJcbiAgICAgICAgcHVibGljIEJlZXJOYW1lPzogc3RyaW5nXHJcbiAgICAgICAgcHVibGljIEJyZXdlcnk/OiBzdHJpbmdcclxuICAgICAgICBwdWJsaWMgVm90ZUNvdW50OiBudW1iZXJcclxuICAgIH1cclxufVxyXG4gICAgICAgICAiLCIvLyAgICAgQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uICBBbGwgcmlnaHRzIHJlc2VydmVkLlxyXG5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL3JlZmVyZW5jZXMvaW5kZXguZC50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9Nb2RlbC9Wb3RlLnRzXCIgLz5cclxuXHJcbm1vZHVsZSBEWExpcXVpZEludGVsLkFwcC5TZXJ2aWNlIHtcclxuXHJcbiAgICBleHBvcnQgY2xhc3MgVm90ZVNlcnZpY2Uge1xyXG4gICAgICAgIHN0YXRpYyAkaW5qZWN0ID0gWyckcmVzb3VyY2UnLCAnZW52U2VydmljZSddO1xyXG5cclxuICAgICAgICBwcml2YXRlIHVzZXJWb3Rlc1Jlc291cmNlOiBuZy5yZXNvdXJjZS5JUmVzb3VyY2VDbGFzczxNb2RlbC5Wb3RlW10+O1xyXG4gICAgICAgIHByaXZhdGUgdGFsbHlSZXNvdXJjZTogbmcucmVzb3VyY2UuSVJlc291cmNlQ2xhc3M8TW9kZWwuVm90ZVRhbGx5PjtcclxuXHJcbiAgICAgICAgY29uc3RydWN0b3IoJHJlc291cmNlOiBuZy5yZXNvdXJjZS5JUmVzb3VyY2VTZXJ2aWNlLCBlbnZTZXJ2aWNlOiBhbmd1bGFyLmVudmlyb25tZW50LlNlcnZpY2UpIHtcclxuXHJcbiAgICAgICAgICAgIHRoaXMudXNlclZvdGVzUmVzb3VyY2UgPSAkcmVzb3VyY2U8TW9kZWwuVm90ZVtdPihlbnZTZXJ2aWNlLnJlYWQoJ2FwaVVyaScpICsgJy92b3Rlcy86cGVyc29ubmVsTnVtYmVyJywgbnVsbCwge1xyXG4gICAgICAgICAgICAgICAgZ2V0OiB7bWV0aG9kOiAnR0VUJywgaXNBcnJheTogdHJ1ZX0sXHJcbiAgICAgICAgICAgICAgICBzYXZlOiB7bWV0aG9kOiAnUFVUJywgaXNBcnJheTogdHJ1ZX1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHRoaXMudGFsbHlSZXNvdXJjZSA9ICRyZXNvdXJjZTxNb2RlbC5Wb3RlVGFsbHk+KGVudlNlcnZpY2UucmVhZCgnYXBpVXJpJykgKyAnL3ZvdGVzX3RhbGx5Jyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgZ2V0VXNlclZvdGVzKHBlcnNvbm5lbE51bWJlcjogbnVtYmVyKTogUHJvbWlzZUxpa2U8TW9kZWwuVm90ZVtdPiB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnVzZXJWb3Rlc1Jlc291cmNlLmdldCh7XHJcbiAgICAgICAgICAgICAgICAgICAgcGVyc29ubmVsTnVtYmVyOiBwZXJzb25uZWxOdW1iZXJcclxuICAgICAgICAgICAgICAgIH0pLiRwcm9taXNlOyBcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyB1cGRhdGVVc2VyVm90ZXMocGVyc29ubmVsTnVtYmVyOiBudW1iZXIsIHZvdGVzOiBNb2RlbC5Wb3RlW10pOiBQcm9taXNlTGlrZTxNb2RlbC5Wb3RlW10+IHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMudXNlclZvdGVzUmVzb3VyY2Uuc2F2ZSh7XHJcbiAgICAgICAgICAgICAgICAgICAgcGVyc29ubmVsTnVtYmVyOiBwZXJzb25uZWxOdW1iZXJcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB2b3RlcykuJHByb21pc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgZ2V0Vm90ZVRhbGx5KCk6IFByb21pc2VMaWtlPE1vZGVsLlZvdGVUYWxseVtdPiB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnRhbGx5UmVzb3VyY2UucXVlcnkoKS4kcHJvbWlzZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuICIsIi8vICAgICBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gIEFsbCByaWdodHMgcmVzZXJ2ZWQuXHJcblxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vcmVmZXJlbmNlcy9pbmRleC5kLnRzXCIgLz5cclxuXHJcbm1vZHVsZSBEWExpcXVpZEludGVsLkFwcC5Nb2RlbCB7XHJcblxyXG4gICAgLy8gTmVlZCB0byBrZWVwIHN0cnVjdHVyZSBpbiBzeW5jIHdpdGggRGFzaFNlcnZlci5NYW5hZ2VtZW50QVBJLk1vZGVscy5PcGVyYXRpb25TdGF0ZSBpbiB0aGUgV2ViQVBJXHJcbiAgICBleHBvcnQgY2xhc3MgQWN0aXZpdHkge1xyXG4gICAgICAgIHB1YmxpYyBTZXNzaW9uSWQ6IG51bWJlclxyXG4gICAgICAgIHB1YmxpYyBQb3VyVGltZTogRGF0ZVxyXG4gICAgICAgIHB1YmxpYyBQb3VyQW1vdW50OiBudW1iZXJcclxuICAgICAgICBwdWJsaWMgQmVlck5hbWU6IHN0cmluZ1xyXG4gICAgICAgIHB1YmxpYyBCcmV3ZXJ5OiBzdHJpbmdcclxuICAgICAgICBwdWJsaWMgQmVlclR5cGU6IHN0cmluZ1xyXG4gICAgICAgIHB1YmxpYyBBQlY/OiBudW1iZXJcclxuICAgICAgICBwdWJsaWMgSUJVPzogbnVtYmVyXHJcbiAgICAgICAgcHVibGljIEJlZXJEZXNjcmlwdGlvbjogc3RyaW5nXHJcbiAgICAgICAgcHVibGljIFVudGFwcGRJZD86IG51bWJlclxyXG4gICAgICAgIHB1YmxpYyBCZWVySW1hZ2VQYXRoOiBzdHJpbmdcclxuICAgICAgICBwdWJsaWMgUGVyc29ubmVsTnVtYmVyOiBudW1iZXJcclxuICAgICAgICBwdWJsaWMgQWxpYXM6IHN0cmluZ1xyXG4gICAgICAgIHB1YmxpYyBGdWxsTmFtZTogc3RyaW5nXHJcbiAgICB9XHJcbn1cclxuICAgICAgICAgIiwiLy8gICAgIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiAgQWxsIHJpZ2h0cyByZXNlcnZlZC5cclxuXHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9yZWZlcmVuY2VzL2luZGV4LmQudHNcIiAvPlxyXG5cclxubW9kdWxlIERYTGlxdWlkSW50ZWwuQXBwLlNlcnZpY2Uge1xyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBCYXNpY0F1dGhSZXNvdXJjZTxUPiB7XHJcbiAgICAgICAgcHJpdmF0ZSByZXNvdXJjZTogbmcucmVzb3VyY2UuSVJlc291cmNlQ2xhc3M8VD47XHJcblxyXG4gICAgICAgIGNvbnN0cnVjdG9yKCRyZXNvdXJjZTogbmcucmVzb3VyY2UuSVJlc291cmNlU2VydmljZSwgZW52U2VydmljZTogYW5ndWxhci5lbnZpcm9ubWVudC5TZXJ2aWNlLCB1cmw6IHN0cmluZykge1xyXG4gICAgICAgICAgICB2YXIgYXV0aEhlYWRlciA9IFwiQmFzaWMgXCIgKyBidG9hKGVudlNlcnZpY2UucmVhZCgnYXBpVXNlcm5hbWUnKSArIFwiOlwiICsgZW52U2VydmljZS5yZWFkKCdhcGlQYXNzd29yZCcpKTtcclxuICAgICAgICAgICAgdmFyIGhlYWRlcnMgPSB7XHJcbiAgICAgICAgICAgICAgICBBdXRob3JpemF0aW9uOiBhdXRoSGVhZGVyXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHZhciBxdWVyeUFjdGlvbjogbmcucmVzb3VyY2UuSUFjdGlvbkhhc2ggPSB7XHJcbiAgICAgICAgICAgICAgICBxdWVyeToge1xyXG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZDogJ0dFVCcsXHJcbiAgICAgICAgICAgICAgICAgICAgaXNBcnJheTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICBoZWFkZXJzOiBoZWFkZXJzXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHRoaXMucmVzb3VyY2UgPSAkcmVzb3VyY2U8VD4odXJsLCBudWxsLCBxdWVyeUFjdGlvbik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgcXVlcnkoZGF0YTogYW55KTogbmcuSVByb21pc2U8VFtdPiB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnJlc291cmNlLnF1ZXJ5KGRhdGEpLiRwcm9taXNlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iLCIvLyAgICAgQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uICBBbGwgcmlnaHRzIHJlc2VydmVkLlxyXG5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL3JlZmVyZW5jZXMvaW5kZXguZC50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9Nb2RlbC9BY3Rpdml0eS50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL0Jhc2ljQXV0aFJlc291cmNlLnRzXCIgLz5cclxuXHJcbm1vZHVsZSBEWExpcXVpZEludGVsLkFwcC5TZXJ2aWNlIHtcclxuXHJcbiAgICBleHBvcnQgY2xhc3MgRGFzaGJvYXJkU2VydmljZSB7XHJcbiAgICAgICAgc3RhdGljICRpbmplY3QgPSBbJyRyZXNvdXJjZScsICdlbnZTZXJ2aWNlJ107XHJcblxyXG4gICAgICAgIHByaXZhdGUgYWN0aXZpdHlSZXNvdXJjZTogQmFzaWNBdXRoUmVzb3VyY2U8TW9kZWwuQWN0aXZpdHk+O1xyXG5cclxuICAgICAgICBjb25zdHJ1Y3RvcigkcmVzb3VyY2U6IG5nLnJlc291cmNlLklSZXNvdXJjZVNlcnZpY2UsIGVudlNlcnZpY2U6IGFuZ3VsYXIuZW52aXJvbm1lbnQuU2VydmljZSkge1xyXG4gICAgICAgICAgICB0aGlzLmFjdGl2aXR5UmVzb3VyY2UgPSBuZXcgQmFzaWNBdXRoUmVzb3VyY2U8TW9kZWwuQWN0aXZpdHk+KCRyZXNvdXJjZSwgZW52U2VydmljZSwgZW52U2VydmljZS5yZWFkKCdhcGlVcmknKSArICcvYWN0aXZpdHknKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBnZXRMYXRlc3RBY3Rpdml0aWVzKGNvdW50OiBudW1iZXIpOiBQcm9taXNlTGlrZTxNb2RlbC5BY3Rpdml0eVtdPiB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmFjdGl2aXR5UmVzb3VyY2UucXVlcnkoe1xyXG4gICAgICAgICAgICAgICAgY291bnQ6IGNvdW50XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iLCIvLyAgICAgQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uICBBbGwgcmlnaHRzIHJlc2VydmVkLlxyXG5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL3JlZmVyZW5jZXMvaW5kZXguZC50c1wiIC8+XHJcblxyXG5tb2R1bGUgRFhMaXF1aWRJbnRlbC5BcHAuTW9kZWwge1xyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBLZWcge1xyXG4gICAgICAgIHB1YmxpYyBLZWdJZD86IG51bWJlclxyXG4gICAgICAgIHB1YmxpYyBOYW1lOiBzdHJpbmdcclxuICAgICAgICBwdWJsaWMgQnJld2VyeTogc3RyaW5nXHJcbiAgICAgICAgcHVibGljIEJlZXJUeXBlOiBzdHJpbmdcclxuICAgICAgICBwdWJsaWMgQUJWPzogbnVtYmVyXHJcbiAgICAgICAgcHVibGljIElCVT86IG51bWJlclxyXG4gICAgICAgIHB1YmxpYyBCZWVyRGVzY3JpcHRpb246IHN0cmluZ1xyXG4gICAgICAgIHB1YmxpYyBVbnRhcHBkSWQ/OiBudW1iZXJcclxuICAgICAgICBwdWJsaWMgaW1hZ2VQYXRoOiBzdHJpbmdcclxuICAgICAgICBwdWJsaWMgQmVlckluZm8/OiBCZWVySW5mb1xyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBUYXBJbmZvIGV4dGVuZHMgS2VnIHtcclxuICAgICAgICBwdWJsaWMgVGFwSWQ6IG51bWJlclxyXG4gICAgICAgIHB1YmxpYyBJbnN0YWxsRGF0ZTogRGF0ZVxyXG4gICAgICAgIHB1YmxpYyBLZWdTaXplOiBudW1iZXJcclxuICAgICAgICBwdWJsaWMgQ3VycmVudFZvbHVtZTogbnVtYmVyXHJcbiAgICAgICAgcHVibGljIE9yaWdpbmFsVW50YXBwZElkPzogbnVtYmVyXHJcblxyXG4gICAgICAgIHB1YmxpYyBnZXRTZXRCZWVySW5mbz86IChiZWVySW5mbzogQmVlckluZm8pID0+IEJlZXJJbmZvO1xyXG4gICAgfVxyXG59XHJcbiAgICAgICAgICIsIi8vICAgICBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gIEFsbCByaWdodHMgcmVzZXJ2ZWQuXHJcblxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vcmVmZXJlbmNlcy9pbmRleC5kLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL01vZGVsL1RhcEluZm8udHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9CYXNpY0F1dGhSZXNvdXJjZS50c1wiIC8+XHJcblxyXG5tb2R1bGUgRFhMaXF1aWRJbnRlbC5BcHAuU2VydmljZSB7XHJcblxyXG4gICAgZXhwb3J0IGNsYXNzIEtlZ3NTZXJ2aWNlIHtcclxuICAgICAgICBzdGF0aWMgJGluamVjdCA9IFsnJHJlc291cmNlJywgJ2VudlNlcnZpY2UnLCAnYWRhbEF1dGhlbnRpY2F0aW9uU2VydmljZSddO1xyXG5cclxuICAgICAgICBwcml2YXRlIGtlZ1N0YXR1c1Jlc291cmNlOiBCYXNpY0F1dGhSZXNvdXJjZTxNb2RlbC5UYXBJbmZvPjtcclxuICAgICAgICBwcml2YXRlIGtlZ1VwZGF0ZVJlc291cmNlOiBuZy5yZXNvdXJjZS5JUmVzb3VyY2VDbGFzczxuZy5yZXNvdXJjZS5JUmVzb3VyY2U8TW9kZWwuS2VnPj47XHJcblxyXG4gICAgICAgIGNvbnN0cnVjdG9yKHByb3RlY3RlZCAkcmVzb3VyY2U6IG5nLnJlc291cmNlLklSZXNvdXJjZVNlcnZpY2UsIFxyXG4gICAgICAgICAgICBwcm90ZWN0ZWQgZW52U2VydmljZTogYW5ndWxhci5lbnZpcm9ubWVudC5TZXJ2aWNlLCBcclxuICAgICAgICAgICAgcHJvdGVjdGVkIGFkYWxTZXJ2aWNlOiBhZGFsLkFkYWxBdXRoZW50aWNhdGlvblNlcnZpY2UpIHtcclxuXHJcbiAgICAgICAgICAgIHRoaXMua2VnU3RhdHVzUmVzb3VyY2UgPSBuZXcgQmFzaWNBdXRoUmVzb3VyY2U8TW9kZWwuVGFwSW5mbz4oJHJlc291cmNlLCBlbnZTZXJ2aWNlLCBlbnZTZXJ2aWNlLnJlYWQoJ2FwaVVyaScpICsgJy9DdXJyZW50S2VnJyk7XHJcbiAgICAgICAgICAgIHRoaXMua2VnVXBkYXRlUmVzb3VyY2UgPSA8bmcucmVzb3VyY2UuSVJlc291cmNlQ2xhc3M8bmcucmVzb3VyY2UuSVJlc291cmNlPE1vZGVsLktlZz4+PiRyZXNvdXJjZShlbnZTZXJ2aWNlLnJlYWQoJ2FwaVVyaScpICsgJy9rZWdzJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgZ2V0VGFwc1N0YXR1cygpOiBQcm9taXNlTGlrZTxNb2RlbC5UYXBJbmZvW10+IHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMua2VnU3RhdHVzUmVzb3VyY2UucXVlcnkobnVsbCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgY3JlYXRlTmV3S2VnKGtlZzogTW9kZWwuS2VnKTogUHJvbWlzZUxpa2U8TW9kZWwuS2VnPiB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmtlZ1VwZGF0ZVJlc291cmNlLnNhdmUoa2VnKS4kcHJvbWlzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBhc3luYyBpbnN0YWxsS2VnT25UYXAodGFwSWQ6IG51bWJlciwga2VnSWQ6IG51bWJlciwga2VnU2l6ZTogbnVtYmVyKTogUHJvbWlzZTxhbnk+IHtcclxuICAgICAgICAgICAgLy8gQmVjYXVzZSB0aGUgL0N1cnJlbnRLZWcgdXJpIGhhcyBiZWVuIGNvbmZpZ3VyZWQgZm9yIGJhc2ljIGF1dGggKHRoZSBHRVQgaXMgZGlzcGxheWVkIG9uIHRoZSBkYXNoYm9hcmRcclxuICAgICAgICAgICAgLy8gcHJpb3IgdG8gbG9naW4pLCB3ZSBoYXZlIHRvIG1hbnVhbGx5IGFwcGx5IHRoZSBiZWFyZXIgdG9rZW4gZm9yIHRoZSBQVVQsIHdoaWNoIGlzIHByb3RlY3RlZC5cclxuICAgICAgICAgICAgdmFyIHJlcXVlc3RVcmkgPSB0aGlzLmVudlNlcnZpY2UucmVhZCgnYXBpVXJpJykgKyBgL0N1cnJlbnRLZWcvJHt0YXBJZH1gO1xyXG4gICAgICAgICAgICB2YXIgdG9rZW4gPSBhd2FpdCB0aGlzLmFkYWxTZXJ2aWNlLmFjcXVpcmVUb2tlbih0aGlzLmFkYWxTZXJ2aWNlLmdldFJlc291cmNlRm9yRW5kcG9pbnQodGhpcy5lbnZTZXJ2aWNlLnJlYWQoJ2FwaVVyaScpKSk7XHJcbiAgICAgICAgICAgIHZhciBpbnN0YWxsQ3VycmVudEtlZ1Jlc291cmNlID0gdGhpcy4kcmVzb3VyY2UocmVxdWVzdFVyaSxcclxuICAgICAgICAgICAgICAgIG51bGwsXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2F2ZTogeyBcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWV0aG9kOiAnUFVUJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgQXV0aG9yaXphdGlvbjogJ0JlYXJlciAnICsgdG9rZW5cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICByZXR1cm4gaW5zdGFsbEN1cnJlbnRLZWdSZXNvdXJjZS5zYXZlKG51bGwsIFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIEtlZ0lkOiBrZWdJZCxcclxuICAgICAgICAgICAgICAgICAgICBLZWdTaXplOiBrZWdTaXplXHJcbiAgICAgICAgICAgICAgICB9KS4kcHJvbWlzZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwiLy8gICAgIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiAgQWxsIHJpZ2h0cyByZXNlcnZlZC5cclxuXHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9yZWZlcmVuY2VzL2luZGV4LmQudHNcIiAvPlxyXG5cclxubW9kdWxlIERYTGlxdWlkSW50ZWwuQXBwLk1vZGVsIHtcclxuXHJcbiAgICBleHBvcnQgY2xhc3MgQXV0aG9yaXplZEdyb3VwcyB7XHJcbiAgICAgICAgQXV0aG9yaXplZEdyb3Vwczogc3RyaW5nW11cclxuICAgIH1cclxuXHJcbiAgICBleHBvcnQgY2xhc3MgR3JvdXBSZXN1bHQge1xyXG4gICAgICAgIGRpc3BsYXlOYW1lOiBzdHJpbmdcclxuICAgICAgICBvd25lcnM6IHN0cmluZ1tdXHJcbiAgICB9XHJcblxyXG4gICAgZXhwb3J0IGNsYXNzIEdyb3VwU2VhcmNoUmVzdWx0cyB7XHJcbiAgICAgICAgY291bnQ6IG51bWJlclxyXG4gICAgICAgIHJlc3VsdHM6IEdyb3VwUmVzdWx0W11cclxuICAgIH1cclxufSIsIi8vICAgICBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gIEFsbCByaWdodHMgcmVzZXJ2ZWQuXHJcblxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vcmVmZXJlbmNlcy9pbmRleC5kLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL01vZGVsL0FkbWluLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL01vZGVsL0tlZ3MudHNcIiAvPlxyXG5cclxubW9kdWxlIERYTGlxdWlkSW50ZWwuQXBwLlNlcnZpY2Uge1xyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBBZG1pblNlcnZpY2Uge1xyXG4gICAgICAgIHN0YXRpYyAkaW5qZWN0ID0gWyckcmVzb3VyY2UnLCAnZW52U2VydmljZSddO1xyXG5cclxuICAgICAgICBwcml2YXRlIGFkbWluUmVzb3VyY2U6IG5nLnJlc291cmNlLklSZXNvdXJjZUNsYXNzPG5nLnJlc291cmNlLklSZXNvdXJjZTxhbnk+PjtcclxuICAgICAgICBwcml2YXRlIGtlZ3NSZXNvdXJjZTogbmcucmVzb3VyY2UuSVJlc291cmNlQ2xhc3M8bmcucmVzb3VyY2UuSVJlc291cmNlPGFueT4+O1xyXG5cclxuICAgICAgICBjb25zdHJ1Y3RvcigkcmVzb3VyY2U6IG5nLnJlc291cmNlLklSZXNvdXJjZVNlcnZpY2UsIGVudlNlcnZpY2U6IGFuZ3VsYXIuZW52aXJvbm1lbnQuU2VydmljZSkge1xyXG5cclxuICAgICAgICAgICAgdGhpcy5hZG1pblJlc291cmNlID0gPG5nLnJlc291cmNlLklSZXNvdXJjZUNsYXNzPG5nLnJlc291cmNlLklSZXNvdXJjZTxhbnk+Pj4kcmVzb3VyY2UoZW52U2VydmljZS5yZWFkKCdhcGlVcmknKSArICcvYWRtaW4vOmFjdGlvbicsXHJcbiAgICAgICAgICAgICAgICBudWxsLFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZTogeyBtZXRob2Q6ICdQVVQnIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGdldEF1dGhvcml6ZWRHcm91cHMoKTogUHJvbWlzZUxpa2U8TW9kZWwuQXV0aG9yaXplZEdyb3Vwcz4ge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5hZG1pblJlc291cmNlLmdldCh7XHJcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiAnQXV0aG9yaXplZEdyb3VwcydcclxuICAgICAgICAgICAgICAgIH0pLiRwcm9taXNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHVwZGF0ZUF1dGhvcml6ZWRHcm91cHMoZ3JvdXBzOiBNb2RlbC5BdXRob3JpemVkR3JvdXBzKTogUHJvbWlzZUxpa2U8YW55PiB7XHJcbiAgICAgICAgICAgIHJldHVybiAoPGFueT50aGlzLmFkbWluUmVzb3VyY2UpLnVwZGF0ZSh7XHJcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiAnQXV0aG9yaXplZEdyb3VwcydcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBncm91cHMpLiRwcm9taXNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHNlYXJjaEdyb3VwcyhzZWFyY2hUZXJtOiBzdHJpbmcpOiBQcm9taXNlTGlrZTxNb2RlbC5Hcm91cFNlYXJjaFJlc3VsdHM+IHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYWRtaW5SZXNvdXJjZS5nZXQoe1xyXG4gICAgICAgICAgICAgICAgYWN0aW9uOiAnQXV0aG9yaXplZEdyb3VwcycsXHJcbiAgICAgICAgICAgICAgICBzZWFyY2g6IHNlYXJjaFRlcm1cclxuICAgICAgICAgICAgfSkuJHByb21pc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiAiLCIvLyAgICAgQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uICBBbGwgcmlnaHRzIHJlc2VydmVkLlxyXG5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL3JlZmVyZW5jZXMvaW5kZXguZC50c1wiIC8+XHJcblxyXG5tb2R1bGUgRFhMaXF1aWRJbnRlbC5BcHAuTW9kZWwge1xyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBDb25maWd1cmF0aW9uIHtcclxuXHJcbiAgICAgICAgcHVibGljIFVudGFwcGRDbGllbnRJZDogc3RyaW5nXHJcbiAgICAgICAgcHVibGljIFVudGFwcGRDbGllbnRTZWNyZXQ6IHN0cmluZ1xyXG4gICAgfVxyXG59ICIsIi8vICAgICBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gIEFsbCByaWdodHMgcmVzZXJ2ZWQuXHJcblxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vcmVmZXJlbmNlcy9pbmRleC5kLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL01vZGVsL0NvbmZpZ3VyYXRpb24udHNcIiAvPlxyXG5cclxubW9kdWxlIERYTGlxdWlkSW50ZWwuQXBwLlNlcnZpY2Uge1xyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBDb25maWdTZXJ2aWNlIHtcclxuICAgICAgICBzdGF0aWMgJGluamVjdCA9IFsnJHJlc291cmNlJywgJ2VudlNlcnZpY2UnXTtcclxuXHJcbiAgICAgICAgcHJpdmF0ZSByZXNvdXJjZUNsYXNzOiBuZy5yZXNvdXJjZS5JUmVzb3VyY2VDbGFzczxuZy5yZXNvdXJjZS5JUmVzb3VyY2U8TW9kZWwuQ29uZmlndXJhdGlvbj4+O1xyXG4gICAgICAgIHByaXZhdGUgY29uZmlndXJhdGlvbjogbmcuSVByb21pc2U8TW9kZWwuQ29uZmlndXJhdGlvbj47XHJcblxyXG4gICAgICAgIGNvbnN0cnVjdG9yKCRyZXNvdXJjZTogbmcucmVzb3VyY2UuSVJlc291cmNlU2VydmljZSwgZW52U2VydmljZTogYW5ndWxhci5lbnZpcm9ubWVudC5TZXJ2aWNlKSB7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnJlc291cmNlQ2xhc3MgPSAkcmVzb3VyY2UoZW52U2VydmljZS5yZWFkKCdhcGlVcmknKSArICcvYXBwQ29uZmlndXJhdGlvbicpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGdldENvbmZpZ3VyYXRpb24oKTogUHJvbWlzZUxpa2U8TW9kZWwuQ29uZmlndXJhdGlvbj4ge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuY29uZmlndXJhdGlvbikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uID0gdGhpcy5yZXNvdXJjZUNsYXNzLmdldCgpLiRwcm9taXNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNvbmZpZ3VyYXRpb247XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiAiLCIvLyAgICAgQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uICBBbGwgcmlnaHRzIHJlc2VydmVkLlxyXG5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL3JlZmVyZW5jZXMvaW5kZXguZC50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL0NvbmZpZ1NlcnZpY2UudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vTW9kZWwvQmVlckluZm8udHNcIiAvPlxyXG5cclxubW9kdWxlIERYTGlxdWlkSW50ZWwuQXBwLlNlcnZpY2Uge1xyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBVbnRhcHBkQXBpU2VydmljZSB7XHJcbiAgICAgICAgc3RhdGljICRpbmplY3QgPSBbJyRyZXNvdXJjZScsICdlbnZTZXJ2aWNlJywgJ2NvbmZpZ1NlcnZpY2UnXTtcclxuXHJcbiAgICAgICAgcHJpdmF0ZSByZXNvdXJjZUNsYXNzOiBuZy5yZXNvdXJjZS5JUmVzb3VyY2VDbGFzczxuZy5yZXNvdXJjZS5JUmVzb3VyY2U8YW55Pj47XHJcblxyXG4gICAgICAgIGNvbnN0cnVjdG9yKCRyZXNvdXJjZTogbmcucmVzb3VyY2UuSVJlc291cmNlU2VydmljZSwgcHJpdmF0ZSBlbnZTZXJ2aWNlOiBhbmd1bGFyLmVudmlyb25tZW50LlNlcnZpY2UsIHByaXZhdGUgY29uZmlnU2VydmljZTogQ29uZmlnU2VydmljZSkge1xyXG5cclxuICAgICAgICAgICAgdGhpcy5yZXNvdXJjZUNsYXNzID0gJHJlc291cmNlKCdodHRwczovL2FwaS51bnRhcHBkLmNvbS92NC86ZW50aXR5LzptZXRob2ROYW1lJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgYXN5bmMgZ2V0VW50YXBwZEF1dGhVcmkocmVkaXJlY3RVcmk6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XHJcbiAgICAgICAgICAgIGxldCBhcHBDb25maWcgPSBhd2FpdCB0aGlzLmNvbmZpZ1NlcnZpY2UuZ2V0Q29uZmlndXJhdGlvbigpO1xyXG4gICAgICAgICAgICByZXR1cm4gYGh0dHBzOi8vdW50YXBwZC5jb20vb2F1dGgvYXV0aGVudGljYXRlLz9jbGllbnRfaWQ9JHthcHBDb25maWcuVW50YXBwZENsaWVudElkfSZyZXNwb25zZV90eXBlPXRva2VuJnJlZGlyZWN0X3VybD0ke3JlZGlyZWN0VXJpfWA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgZ2V0VXNlckluZm8oYWNjZXNzVG9rZW46IHN0cmluZyk6IFByb21pc2VMaWtlPGFueT4ge1xyXG4gICAgICAgICAgICBpZiAoIWFjY2Vzc1Rva2VuKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyAnSW52YWxpZCBVbnRhcHBkIHVzZXIgYWNjZXNzIHRva2VuJzsgICAgXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5yZXNvdXJjZUNsYXNzLmdldCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVudGl0eTogJ3VzZXInLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXRob2ROYW1lOiAnaW5mbycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjY2Vzc190b2tlbjogYWNjZXNzVG9rZW5cclxuICAgICAgICAgICAgICAgICAgICB9KS4kcHJvbWlzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGFzeW5jIHNlYXJjaEJlZXJzKHNlYXJjaFRlcm06IHN0cmluZywgYWNjZXNzVG9rZW4/OiBzdHJpbmcpOiBQcm9taXNlPE1vZGVsLkJlZXJJbmZvW10+IHtcclxuICAgICAgICAgICAgbGV0IGFwcENvbmZpZyA9IGF3YWl0IHRoaXMuY29uZmlnU2VydmljZS5nZXRDb25maWd1cmF0aW9uKCk7XHJcbiAgICAgICAgICAgIHZhciBkYXRhID0ge1xyXG4gICAgICAgICAgICAgICAgZW50aXR5OiAnc2VhcmNoJyxcclxuICAgICAgICAgICAgICAgIG1ldGhvZE5hbWU6ICdiZWVyJyxcclxuICAgICAgICAgICAgICAgIHE6IHNlYXJjaFRlcm0gKyAnKicsXHJcbiAgICAgICAgICAgICAgICBsaW1pdDogMTVcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgaWYgKGFjY2Vzc1Rva2VuKSB7XHJcbiAgICAgICAgICAgICAgICBkYXRhWydhY2Nlc3NfdG9rZW4nXSA9IGFjY2Vzc1Rva2VuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZGF0YVsnY2xpZW50X2lkJ10gPSBhcHBDb25maWcuVW50YXBwZENsaWVudElkO1xyXG4gICAgICAgICAgICAgICAgZGF0YVsnY2xpZW50X3NlY3JldCddID0gYXBwQ29uZmlnLlVudGFwcGRDbGllbnRTZWNyZXQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdmFyIHJlc3VsdHMgPSBhd2FpdCB0aGlzLnJlc291cmNlQ2xhc3MuZ2V0KGRhdGEpLiRwcm9taXNlO1xyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0cy5yZXNwb25zZS5iZWVycy5pdGVtcy5tYXAoKGJlZXIpID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdW50YXBwZElkOiBiZWVyLmJlZXIuYmlkLFxyXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IGJlZXIuYmVlci5iZWVyX25hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgYmVlcl90eXBlOiBiZWVyLmJlZXIuYmVlcl9zdHlsZSxcclxuICAgICAgICAgICAgICAgICAgICBpYnU6IGJlZXIuYmVlci5iZWVyX2lidSxcclxuICAgICAgICAgICAgICAgICAgICBhYnY6IGJlZXIuYmVlci5iZWVyX2FidixcclxuICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogYmVlci5iZWVyLmJlZXJfZGVzY3JpcHRpb24sXHJcbiAgICAgICAgICAgICAgICAgICAgYnJld2VyeTogYmVlci5icmV3ZXJ5LmJyZXdlcnlfbmFtZSxcclxuICAgICAgICAgICAgICAgICAgICBpbWFnZTogYmVlci5iZWVyLmJlZXJfbGFiZWxcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4gIiwiLy8gICAgIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiAgQWxsIHJpZ2h0cyByZXNlcnZlZC5cclxuXHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9yZWZlcmVuY2VzL2luZGV4LmQudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vU2VydmljZS9Vc2VyU2VydmljZS50c1wiIC8+XHJcblxyXG5tb2R1bGUgRFhMaXF1aWRJbnRlbC5BcHAuQ29udHJvbGxlciB7XHJcblxyXG4gICAgZXhwb3J0IGNsYXNzIENvbnRyb2xsZXJCYXNlIHtcclxuXHJcbiAgICAgICAgY29uc3RydWN0b3IocHJvdGVjdGVkICRzY29wZTogTW9kZWwuSURYTGlxdWlkSW50ZWxTY29wZSxcclxuICAgICAgICAgICAgcHJvdGVjdGVkICRyb290U2NvcGU6IE1vZGVsLklEWExpcXVpZEludGVsU2NvcGUsXHJcbiAgICAgICAgICAgIHByb3RlY3RlZCBhZGFsQXV0aGVudGljYXRpb25TZXJ2aWNlLFxyXG4gICAgICAgICAgICBwcm90ZWN0ZWQgJGxvY2F0aW9uOiBuZy5JTG9jYXRpb25TZXJ2aWNlLFxyXG4gICAgICAgICAgICBwcm90ZWN0ZWQgdXNlclNlcnZpY2U6IFNlcnZpY2UuVXNlclNlcnZpY2UsXHJcbiAgICAgICAgICAgIGNvbnRpbnVlQWZ0ZXJVc2VyTG9hZDogKCkgPT4gdm9pZCkge1xyXG5cclxuICAgICAgICAgICAgJHJvb3RTY29wZS5sb2dpbiA9ICgpID0+IHRoaXMubG9naW4oKTtcclxuICAgICAgICAgICAgJHJvb3RTY29wZS5sb2dvdXQgPSAoKSA9PiB0aGlzLmxvZ291dCgpO1xyXG4gICAgICAgICAgICAkcm9vdFNjb3BlLmlzQ29udHJvbGxlckFjdGl2ZSA9IChsb2NhdGlvbikgPT4gdGhpcy5pc0FjdGl2ZShsb2NhdGlvbik7XHJcbiAgICAgICAgICAgICRyb290U2NvcGUuaXNBZG1pbiA9ICgpID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAkc2NvcGUuc3lzdGVtVXNlckluZm8gPyAkc2NvcGUuc3lzdGVtVXNlckluZm8uSXNBZG1pbiA6IGZhbHNlO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAkcm9vdFNjb3BlLmJ1dHRvbkJhckJ1dHRvbnMgPSBbXTtcclxuXHJcbiAgICAgICAgICAgICRzY29wZS4kb24oJyRyb3V0ZUNoYW5nZVN1Y2Nlc3MnLCAoZXZlbnQsIGN1cnJlbnQsIHByZXZpb3VzKSA9PiB0aGlzLnNldFRpdGxlRm9yUm91dGUoY3VycmVudC4kJHJvdXRlKSk7XHJcbiAgICAgICAgICAgICRzY29wZS5sb2FkaW5nTWVzc2FnZSA9IFwiXCI7XHJcbiAgICAgICAgICAgICRzY29wZS5lcnJvciA9IFwiXCI7XHJcblxyXG4gICAgICAgICAgICAvLyBXaGVuIHRoZSB1c2VyIGxvZ3MgaW4sIHdlIG5lZWQgdG8gY2hlY2sgd2l0aCB0aGUgYXBpIGlmIHRoZXkncmUgYW4gYWRtaW4gb3Igbm90XHJcbiAgICAgICAgICAgIHRoaXMuc2V0VXBkYXRlU3RhdGUodHJ1ZSk7XHJcbiAgICAgICAgICAgIHRoaXMuJHNjb3BlLmxvYWRpbmdNZXNzYWdlID0gXCJSZXRyaWV2aW5nIHVzZXIgaW5mb3JtYXRpb24uLi5cIjtcclxuICAgICAgICAgICAgdGhpcy4kc2NvcGUuZXJyb3IgPSBcIlwiO1xyXG4gICAgICAgICAgICB1c2VyU2VydmljZS5nZXRVc2VySW5mbygkc2NvcGUudXNlckluZm8udXNlck5hbWUpXHJcbiAgICAgICAgICAgICAgICAudGhlbigodXNlckluZm86IE1vZGVsLlVzZXJJbmZvKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnN5c3RlbVVzZXJJbmZvID0gdXNlckluZm87XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGludWVBZnRlclVzZXJMb2FkKCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBsb2dpbigpOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy5hZGFsQXV0aGVudGljYXRpb25TZXJ2aWNlLmxvZ2luKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgbG9naW5XaXRoTWZhKCkge1xyXG4gICAgICAgICAgICB0aGlzLmFkYWxBdXRoZW50aWNhdGlvblNlcnZpY2UubG9naW4oeyBhbXJfdmFsdWVzOiAnbWZhJyB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBsb2dvdXQoKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMuYWRhbEF1dGhlbnRpY2F0aW9uU2VydmljZS5sb2dPdXQoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBpc0FjdGl2ZSh2aWV3TG9jYXRpb24pOiBib29sZWFuIHtcclxuICAgICAgICAgICAgcmV0dXJuIHZpZXdMb2NhdGlvbiA9PT0gdGhpcy4kbG9jYXRpb24ucGF0aCgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHNldFRpdGxlRm9yUm91dGUocm91dGU6IG5nLnJvdXRlLklSb3V0ZSk6IHZvaWQge1xyXG4gICAgICAgICAgICB0aGlzLiRyb290U2NvcGUudGl0bGUgPSBcIkRYIExpcXVpZCBJbnRlbGxpZ2VuY2UgLSBcIiArIHJvdXRlLm5hbWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcm90ZWN0ZWQgc2V0RXJyb3IoZXJyb3I6IGJvb2xlYW4sIG1lc3NhZ2U6IGFueSwgcmVzcG9uc2VIZWFkZXJzOiBuZy5JSHR0cEhlYWRlcnNHZXR0ZXIpOiB2b2lkIHtcclxuICAgICAgICAgICAgdmFyIGFjcXVpcmVNZmFSZXNvdXJjZSA9IFwiXCI7XHJcbiAgICAgICAgICAgIGlmIChyZXNwb25zZUhlYWRlcnMgIT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgLy8gSWYgd2UgcmVjZWl2ZWQgYSA0MDEgZXJyb3Igd2l0aCBXV1ctQXV0aGVudGljYXRlIHJlc3BvbnNlIGhlYWRlcnMsIHdlIG1heSBuZWVkIHRvIFxyXG4gICAgICAgICAgICAgICAgLy8gcmUtYXV0aGVudGljYXRlIHRvIHNhdGlzZnkgMkZBIHJlcXVpcmVtZW50cyBmb3IgdW5kZXJseWluZyBzZXJ2aWNlcyB1c2VkIGJ5IHRoZSBXZWJBUElcclxuICAgICAgICAgICAgICAgIC8vIChlZy4gUkRGRSkuIEluIHRoYXQgY2FzZSwgd2UgbmVlZCB0byBleHBsaWNpdGx5IHNwZWNpZnkgdGhlIG5hbWUgb2YgdGhlIHJlc291cmNlIHdlXHJcbiAgICAgICAgICAgICAgICAvLyB3YW50IDJGQSBhdXRoZW50aWNhdGlvbiB0by5cclxuICAgICAgICAgICAgICAgIHZhciB3d3dBdXRoID0gcmVzcG9uc2VIZWFkZXJzKFwid3d3LWF1dGhlbnRpY2F0ZVwiKTtcclxuICAgICAgICAgICAgICAgIGlmICh3d3dBdXRoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gSGFuZGxlIHRoZSBtdWx0aXBsZSB3d3ctYXV0aGVudGljYXRlIGhlYWRlcnMgY2FzZVxyXG4gICAgICAgICAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaCh3d3dBdXRoLnNwbGl0KFwiLFwiKSwgKGF1dGhTY2hlbWU6IHN0cmluZywgaW5kZXg6IG51bWJlcikgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcGFyYW1zRGVsaW0gPSBhdXRoU2NoZW1lLmluZGV4T2YoXCIgXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocGFyYW1zRGVsaW0gIT0gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwYXJhbXMgPSBhdXRoU2NoZW1lLnN1YnN0cihwYXJhbXNEZWxpbSArIDEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHBhcmFtc1ZhbHVlcyA9IHBhcmFtcy5zcGxpdChcIj1cIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocGFyYW1zVmFsdWVzWzBdID09PSBcImludGVyYWN0aW9uX3JlcXVpcmVkXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3F1aXJlTWZhUmVzb3VyY2UgPSBwYXJhbXNWYWx1ZXNbMV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoYWNxdWlyZU1mYVJlc291cmNlKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBUaGUgV2ViQVBJIG5lZWRzIDJGQSBhdXRoZW50aWNhdGlvbiB0byBiZSBhYmxlIHRvIGFjY2VzcyBpdHMgcmVzb3VyY2VzXHJcbiAgICAgICAgICAgICAgICB0aGlzLmxvZ2luV2l0aE1mYSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICgkLmlzUGxhaW5PYmplY3QobWVzc2FnZSkpIHtcclxuICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSAkLm1hcChbXCJNZXNzYWdlXCIsIFwiRXhjZXB0aW9uTWVzc2FnZVwiLCBcIkV4Y2VwdGlvblR5cGVcIl0sIChhdHRyaWJ1dGVOYW1lKSA9PiBtZXNzYWdlW2F0dHJpYnV0ZU5hbWVdKVxyXG4gICAgICAgICAgICAgICAgICAgIC5qb2luKFwiIC0gXCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuJHNjb3BlLmVycm9yX2NsYXNzID0gZXJyb3IgPyBcImFsZXJ0LWRhbmdlclwiIDogXCJhbGVydC1pbmZvXCI7XHJcbiAgICAgICAgICAgIHRoaXMuJHNjb3BlLmVycm9yID0gbWVzc2FnZTtcclxuICAgICAgICAgICAgdGhpcy4kc2NvcGUubG9hZGluZ01lc3NhZ2UgPSBcIlwiO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJvdGVjdGVkIHNldFVwZGF0ZVN0YXRlKHVwZGF0ZUluUHJvZ3Jlc3M6IGJvb2xlYW4pOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy4kc2NvcGUudXBkYXRlSW5Qcm9ncmVzcyA9IHVwZGF0ZUluUHJvZ3Jlc3M7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59ICIsIi8vICAgICBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gIEFsbCByaWdodHMgcmVzZXJ2ZWQuXHJcblxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vcmVmZXJlbmNlcy9pbmRleC5kLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vQ29udHJvbGxlckJhc2UudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vU2VydmljZS9Vc2VyU2VydmljZS50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9TZXJ2aWNlL1VudGFwcGRBcGlTZXJ2aWNlLnRzXCIgLz5cclxuXHJcbm1vZHVsZSBEWExpcXVpZEludGVsLkFwcC5Db250cm9sbGVyIHtcclxuXHJcbiAgICBleHBvcnQgY2xhc3MgVXNlckNvbnRyb2xsZXIgZXh0ZW5kcyBDb250cm9sbGVyQmFzZSB7XHJcbiAgICAgICAgc3RhdGljICRpbmplY3QgPSBbJyRzY29wZScsICckcm9vdFNjb3BlJywgJ2FkYWxBdXRoZW50aWNhdGlvblNlcnZpY2UnLCAnJGxvY2F0aW9uJywgJyR3aW5kb3cnLCAnJHJvdXRlJywgJ3VzZXJTZXJ2aWNlJywgJ3VudGFwcGRTZXJ2aWNlJ107XHJcblxyXG4gICAgICAgIGNvbnN0cnVjdG9yKCRzY29wZTogTW9kZWwuSURYTGlxdWlkSW50ZWxTY29wZSxcclxuICAgICAgICAgICAgJHJvb3RTY29wZTogTW9kZWwuSURYTGlxdWlkSW50ZWxTY29wZSxcclxuICAgICAgICAgICAgYWRhbEF1dGhlbnRpY2F0aW9uU2VydmljZSxcclxuICAgICAgICAgICAgJGxvY2F0aW9uOiBuZy5JTG9jYXRpb25TZXJ2aWNlLFxyXG4gICAgICAgICAgICAkd2luZG93OiBuZy5JV2luZG93U2VydmljZSxcclxuICAgICAgICAgICAgJHJvdXRlOiBuZy5yb3V0ZS5JUm91dGVTZXJ2aWNlLFxyXG4gICAgICAgICAgICB1c2VyU2VydmljZTogU2VydmljZS5Vc2VyU2VydmljZSxcclxuICAgICAgICAgICAgcHJvdGVjdGVkIHVudGFwcGRTZXJ2aWNlOiBTZXJ2aWNlLlVudGFwcGRBcGlTZXJ2aWNlKSB7XHJcblxyXG4gICAgICAgICAgICBzdXBlcigkc2NvcGUsICRyb290U2NvcGUsIGFkYWxBdXRoZW50aWNhdGlvblNlcnZpY2UsICRsb2NhdGlvbiwgdXNlclNlcnZpY2UsIGFzeW5jICgpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0VGl0bGVGb3JSb3V0ZSgkcm91dGUuY3VycmVudCk7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuYnV0dG9uQmFyQnV0dG9ucyA9IFtdO1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLnVudGFwcGRBdXRoZW50aWNhdGlvblVyaSA9IGF3YWl0IHVudGFwcGRTZXJ2aWNlLmdldFVudGFwcGRBdXRoVXJpKCR3aW5kb3cubG9jYXRpb24ub3JpZ2luKTtcclxuICAgICAgICAgICAgICAgICRzY29wZS5kaXNjb25uZWN0VW50YXBwZFVzZXIgPSAoKSA9PiB0aGlzLmRpc2Nvbm5lY3RVc2VyKCk7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUudXBkYXRlVXNlckluZm8gPSAoKSA9PiB0aGlzLnVwZGF0ZSgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wb3B1bGF0ZSgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgYXN5bmMgcG9wdWxhdGUoKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFVwZGF0ZVN0YXRlKHRydWUpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kc2NvcGUubG9hZGluZ01lc3NhZ2UgPSBcIlJldHJpZXZpbmcgdXNlciBpbmZvcm1hdGlvbi4uLlwiO1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kc2NvcGUuZXJyb3IgPSBcIlwiO1xyXG4gICAgICAgICAgICAgICAgbGV0IHVzZXJJbmZvID0gYXdhaXQgdGhpcy51c2VyU2VydmljZS5nZXRVc2VySW5mbyh0aGlzLiRzY29wZS51c2VySW5mby51c2VyTmFtZSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRzY29wZS5zeXN0ZW1Vc2VySW5mbyA9IHVzZXJJbmZvO1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuJHJvb3RTY29wZS51bnRhcHBlZFBvc3RCYWNrVG9rZW4pIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLiRzY29wZS5zeXN0ZW1Vc2VySW5mby5VbnRhcHBkQWNjZXNzVG9rZW4gPSB0aGlzLiRyb290U2NvcGUudW50YXBwZWRQb3N0QmFja1Rva2VuO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuJHJvb3RTY29wZS51bnRhcHBlZFBvc3RCYWNrVG9rZW4gPSAnJztcclxuICAgICAgICAgICAgICAgICAgICBsZXQgdW50YXBwZFVzZXJSZXNwb25zZSA9IGF3YWl0IHRoaXMudW50YXBwZFNlcnZpY2UuZ2V0VXNlckluZm8odGhpcy4kc2NvcGUuc3lzdGVtVXNlckluZm8uVW50YXBwZEFjY2Vzc1Rva2VuKTtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgdW50YXBwZFVzZXJJbmZvID0gdW50YXBwZFVzZXJSZXNwb25zZS5yZXNwb25zZS51c2VyO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuJHNjb3BlLnN5c3RlbVVzZXJJbmZvLlVudGFwcGRVc2VyTmFtZSA9IHVudGFwcGRVc2VySW5mby51c2VyX25hbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gSWYgVW50YXBwZCBoYXMgYSB1c2VyIGltYWdlLCBmb3JjZSB0aGlzIHRvIGJlIG91ciBpbWFnZVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh1bnRhcHBkVXNlckluZm8udXNlcl9hdmF0YXIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy4kc2NvcGUuc3lzdGVtVXNlckluZm8uVGh1bWJuYWlsSW1hZ2VVcmkgPSB1bnRhcHBkVXNlckluZm8udXNlcl9hdmF0YXI7IFxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnVwZGF0ZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRVcGRhdGVTdGF0ZShmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRzY29wZS5sb2FkaW5nTWVzc2FnZSA9IFwiXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2F0Y2ggKGV4KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldEVycm9yKHRydWUsIGV4LmRhdGEgfHwgZXguc3RhdHVzVGV4dCwgZXguaGVhZGVycyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgYXN5bmMgdXBkYXRlKCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kc2NvcGUubG9hZGluZ01lc3NhZ2UgPSBcIlNhdmluZyB1c2VyIGluZm9ybWF0aW9uLi4uXCI7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFVwZGF0ZVN0YXRlKHRydWUpO1xyXG4gICAgICAgICAgICAgICAgbGV0IHVzZXJJbmZvID0gYXdhaXQgdGhpcy51c2VyU2VydmljZS51cGRhdGVVc2VySW5mbyh0aGlzLiRzY29wZS51c2VySW5mby51c2VyTmFtZSwgdGhpcy4kc2NvcGUuc3lzdGVtVXNlckluZm8pO1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kc2NvcGUuc3lzdGVtVXNlckluZm8gPSB1c2VySW5mbztcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0VXBkYXRlU3RhdGUoZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kc2NvcGUubG9hZGluZ01lc3NhZ2UgPSBcIlwiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhdGNoIChleCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRFcnJvcih0cnVlLCBleC5kYXRhIHx8IGV4LnN0YXR1c1RleHQsIGV4LmhlYWRlcnMpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRVcGRhdGVTdGF0ZShmYWxzZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgZGlzY29ubmVjdFVzZXIoKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMuJHNjb3BlLnN5c3RlbVVzZXJJbmZvLlVudGFwcGRVc2VyTmFtZSA9ICcnO1xyXG4gICAgICAgICAgICB0aGlzLiRzY29wZS5zeXN0ZW1Vc2VySW5mby5VbnRhcHBkQWNjZXNzVG9rZW4gPSAnJztcclxuICAgICAgICAgICAgdGhpcy4kc2NvcGUuc3lzdGVtVXNlckluZm8uVGh1bWJuYWlsSW1hZ2VVcmkgPSAnJztcclxuICAgICAgICAgICAgdGhpcy51cGRhdGUoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0gIiwiLy8gICAgIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiAgQWxsIHJpZ2h0cyByZXNlcnZlZC5cclxuXHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9yZWZlcmVuY2VzL2luZGV4LmQudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9Db250cm9sbGVyQmFzZS50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9TZXJ2aWNlL1VudGFwcGRBcGlTZXJ2aWNlLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL1NlcnZpY2UvVm90ZVNlcnZpY2UudHNcIiAvPlxyXG5cclxubW9kdWxlIERYTGlxdWlkSW50ZWwuQXBwLkNvbnRyb2xsZXIge1xyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBWb3RlQmVlckNvbnRyb2xsZXIgZXh0ZW5kcyBDb250cm9sbGVyQmFzZSB7XHJcbiAgICAgICAgc3RhdGljICRpbmplY3QgPSBbJyRzY29wZScsICckcm9vdFNjb3BlJywgJ2FkYWxBdXRoZW50aWNhdGlvblNlcnZpY2UnLCAnJGxvY2F0aW9uJywgJyRyb3V0ZScsICd1c2VyU2VydmljZScsICd1bnRhcHBkU2VydmljZScsICd2b3RlU2VydmljZSddO1xyXG5cclxuICAgICAgICBjb25zdHJ1Y3Rvcigkc2NvcGU6IE1vZGVsLklEWExpcXVpZEludGVsU2NvcGUsXHJcbiAgICAgICAgICAgICRyb290U2NvcGU6IE1vZGVsLklEWExpcXVpZEludGVsU2NvcGUsXHJcbiAgICAgICAgICAgIGFkYWxBdXRoZW50aWNhdGlvblNlcnZpY2UsXHJcbiAgICAgICAgICAgICRsb2NhdGlvbjogbmcuSUxvY2F0aW9uU2VydmljZSxcclxuICAgICAgICAgICAgJHJvdXRlOiBuZy5yb3V0ZS5JUm91dGVTZXJ2aWNlLFxyXG4gICAgICAgICAgICB1c2VyU2VydmljZTogU2VydmljZS5Vc2VyU2VydmljZSxcclxuICAgICAgICAgICAgcHJvdGVjdGVkIHVudGFwcGRTZXJ2aWNlOiBTZXJ2aWNlLlVudGFwcGRBcGlTZXJ2aWNlLFxyXG4gICAgICAgICAgICBwcm90ZWN0ZWQgdm90ZVNlcnZpY2U6IFNlcnZpY2UuVm90ZVNlcnZpY2UpIHtcclxuXHJcbiAgICAgICAgICAgIHN1cGVyKCRzY29wZSwgJHJvb3RTY29wZSwgYWRhbEF1dGhlbnRpY2F0aW9uU2VydmljZSwgJGxvY2F0aW9uLCB1c2VyU2VydmljZSwgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRUaXRsZUZvclJvdXRlKCRyb3V0ZS5jdXJyZW50KTtcclxuICAgICAgICAgICAgICAgICRzY29wZS5idXR0b25CYXJCdXR0b25zID0gW1xyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBNb2RlbC5CdXR0b25CYXJCdXR0b24oXCJDb21taXRcIiwgJHNjb3BlLCBcInZvdGVGb3JtLiR2YWxpZCAmJiB2b3RlRm9ybS4kZGlydHkgJiYgIXVwZGF0ZUluUHJvZ3Jlc3NcIiwgKCkgPT4gdGhpcy51cGRhdGUoKSwgdHJ1ZSksXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IE1vZGVsLkJ1dHRvbkJhckJ1dHRvbihcIlJldmVydFwiLCAkc2NvcGUsIFwiIXVwZGF0ZUluUHJvZ3Jlc3NcIiwgKCkgPT4gdGhpcy5wb3B1bGF0ZSgpLCBmYWxzZSlcclxuICAgICAgICAgICAgICAgIF07XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuc2VhcmNoQmVlcnMgPSAoc2VhcmNoVGVybTogc3RyaW5nKSA9PiB0aGlzLnNlYXJjaEJlZXJzKHNlYXJjaFRlcm0pO1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLnVwZGF0ZVZvdGVzID0gKCkgPT4gdGhpcy51cGRhdGUoKTtcclxuICAgICAgICAgICAgICAgICRzY29wZS5jbGVhclZvdGUgPSAodm90ZSkgPT4gdGhpcy5yZXNldFZvdGUodm90ZSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBvcHVsYXRlKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBhc3luYyBzZWFyY2hCZWVycyhzZWFyY2hUZXJtOiBzdHJpbmcpOiBQcm9taXNlPE1vZGVsLkJlZXJJbmZvW10+IHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnVudGFwcGRTZXJ2aWNlLnNlYXJjaEJlZXJzKHNlYXJjaFRlcm0sIHRoaXMuJHNjb3BlLnN5c3RlbVVzZXJJbmZvLlVudGFwcGRBY2Nlc3NUb2tlbik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2F0Y2ggKGV4KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBub3JtYWxpemVWb3Rlc0FycmF5KHNvdXJjZVZvdGVzOiBNb2RlbC5Wb3RlW10pOiBNb2RlbC5Wb3RlW10ge1xyXG4gICAgICAgICAgICB3aGlsZSAoc291cmNlVm90ZXMubGVuZ3RoIDwgMikge1xyXG4gICAgICAgICAgICAgICAgc291cmNlVm90ZXMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgVm90ZUlkOiAwLFxyXG4gICAgICAgICAgICAgICAgICAgIFBlcnNvbm5lbE51bWJlcjogdGhpcy4kc2NvcGUuc3lzdGVtVXNlckluZm8uUGVyc29ubmVsTnVtYmVyLFxyXG4gICAgICAgICAgICAgICAgICAgIFZvdGVEYXRlOiBuZXcgRGF0ZSgpLFxyXG4gICAgICAgICAgICAgICAgICAgIFVudGFwcGRJZDogMFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgc291cmNlVm90ZXMuZm9yRWFjaCgodm90ZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdm90ZS5CZWVySW5mbyA9IHtcclxuICAgICAgICAgICAgICAgICAgICB1bnRhcHBkSWQ6IHZvdGUuVW50YXBwZElkLFxyXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IHZvdGUuQmVlck5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgYnJld2VyeTogdm90ZS5CcmV3ZXJ5XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICByZXR1cm4gc291cmNlVm90ZXM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIGFzeW5jIHBvcHVsYXRlKCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRVcGRhdGVTdGF0ZSh0cnVlKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuJHNjb3BlLmxvYWRpbmdNZXNzYWdlID0gXCJSZXRyaWV2aW5nIHByZXZpb3VzIHZvdGVzLi4uXCI7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRzY29wZS5lcnJvciA9IFwiXCI7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRzY29wZS52b3RlcyA9IHRoaXMubm9ybWFsaXplVm90ZXNBcnJheShhd2FpdCB0aGlzLnZvdGVTZXJ2aWNlLmdldFVzZXJWb3Rlcyh0aGlzLiRzY29wZS5zeXN0ZW1Vc2VySW5mby5QZXJzb25uZWxOdW1iZXIpKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0VXBkYXRlU3RhdGUoZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kc2NvcGUubG9hZGluZ01lc3NhZ2UgPSBcIlwiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhdGNoIChleCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRFcnJvcih0cnVlLCBleC5kYXRhIHx8IGV4LnN0YXR1c1RleHQsIGV4LmhlYWRlcnMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHJlc2V0Vm90ZSh2b3RlOiBNb2RlbC5Wb3RlKSB7XHJcbiAgICAgICAgICAgIC8vIERvbid0IHJlc2V0IHRoZSB2b3RlIGlkIGFzIHdlIG5lZWQgdG8gZGV0ZWN0IGlmIHRoaXMgaXMgYSBkZWxldGVcclxuICAgICAgICAgICAgdm90ZS5QZXJzb25uZWxOdW1iZXIgPSB0aGlzLiRzY29wZS5zeXN0ZW1Vc2VySW5mby5QZXJzb25uZWxOdW1iZXI7XHJcbiAgICAgICAgICAgIHZvdGUuVm90ZURhdGUgPSBuZXcgRGF0ZSgpO1xyXG4gICAgICAgICAgICB2b3RlLlVudGFwcGRJZCA9IDA7XHJcbiAgICAgICAgICAgIHZvdGUuQmVlck5hbWUgPSAnJztcclxuICAgICAgICAgICAgdm90ZS5CcmV3ZXJ5ID0gJyc7XHJcbiAgICAgICAgICAgIHZvdGUuQmVlckluZm8gPSBudWxsO1xyXG4gICAgICAgICAgICB0aGlzLiRzY29wZS52b3RlRm9ybS4kc2V0RGlydHkoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgYXN5bmMgdXBkYXRlKCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kc2NvcGUubG9hZGluZ01lc3NhZ2UgPSBcIlNhdmluZyB2b3Rlcy4uLlwiO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRVcGRhdGVTdGF0ZSh0cnVlKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuJHNjb3BlLnZvdGVzLmZvckVhY2goKHZvdGU6IE1vZGVsLlZvdGUpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodm90ZS5CZWVySW5mbykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2b3RlLlVudGFwcGRJZCA9IHZvdGUuQmVlckluZm8udW50YXBwZElkO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2b3RlLkJlZXJOYW1lID0gdm90ZS5CZWVySW5mby5uYW1lO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2b3RlLkJyZXdlcnkgPSB2b3RlLkJlZXJJbmZvLmJyZXdlcnk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRzY29wZS52b3RlcyA9IHRoaXMubm9ybWFsaXplVm90ZXNBcnJheShhd2FpdCB0aGlzLnZvdGVTZXJ2aWNlLnVwZGF0ZVVzZXJWb3Rlcyh0aGlzLiRzY29wZS5zeXN0ZW1Vc2VySW5mby5QZXJzb25uZWxOdW1iZXIsIHRoaXMuJHNjb3BlLnZvdGVzKSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRzY29wZS52b3RlRm9ybS4kc2V0UHJpc3RpbmUoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0VXBkYXRlU3RhdGUoZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kc2NvcGUuZXJyb3IgPSBcIlwiO1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kc2NvcGUubG9hZGluZ01lc3NhZ2UgPSBcIlwiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhdGNoIChleCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRFcnJvcih0cnVlLCBleC5kYXRhIHx8IGV4LnN0YXR1c1RleHQsIGV4LmhlYWRlcnMpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRVcGRhdGVTdGF0ZShmYWxzZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0gIiwiLy8gICAgIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiAgQWxsIHJpZ2h0cyByZXNlcnZlZC5cclxuXHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9yZWZlcmVuY2VzL2luZGV4LmQudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9Db250cm9sbGVyQmFzZS50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9TZXJ2aWNlL1VudGFwcGRBcGlTZXJ2aWNlLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL1NlcnZpY2UvVm90ZVNlcnZpY2UudHNcIiAvPlxyXG5cclxubW9kdWxlIERYTGlxdWlkSW50ZWwuQXBwLkNvbnRyb2xsZXIge1xyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBWb3RlUmVzdWx0c0NvbnRyb2xsZXIgZXh0ZW5kcyBDb250cm9sbGVyQmFzZSB7XHJcbiAgICAgICAgc3RhdGljICRpbmplY3QgPSBbJyRzY29wZScsICckcm9vdFNjb3BlJywgJ2FkYWxBdXRoZW50aWNhdGlvblNlcnZpY2UnLCAnJGxvY2F0aW9uJywgJyRyb3V0ZScsICd1c2VyU2VydmljZScsICd1bnRhcHBkU2VydmljZScsICd2b3RlU2VydmljZSddO1xyXG5cclxuICAgICAgICBjb25zdHJ1Y3Rvcigkc2NvcGU6IE1vZGVsLklEWExpcXVpZEludGVsU2NvcGUsXHJcbiAgICAgICAgICAgICRyb290U2NvcGU6IE1vZGVsLklEWExpcXVpZEludGVsU2NvcGUsXHJcbiAgICAgICAgICAgIGFkYWxBdXRoZW50aWNhdGlvblNlcnZpY2UsXHJcbiAgICAgICAgICAgICRsb2NhdGlvbjogbmcuSUxvY2F0aW9uU2VydmljZSxcclxuICAgICAgICAgICAgJHJvdXRlOiBuZy5yb3V0ZS5JUm91dGVTZXJ2aWNlLFxyXG4gICAgICAgICAgICB1c2VyU2VydmljZTogU2VydmljZS5Vc2VyU2VydmljZSxcclxuICAgICAgICAgICAgcHJvdGVjdGVkIHVudGFwcGRTZXJ2aWNlOiBTZXJ2aWNlLlVudGFwcGRBcGlTZXJ2aWNlLFxyXG4gICAgICAgICAgICBwcm90ZWN0ZWQgdm90ZVNlcnZpY2U6IFNlcnZpY2UuVm90ZVNlcnZpY2UpIHtcclxuXHJcbiAgICAgICAgICAgIHN1cGVyKCRzY29wZSwgJHJvb3RTY29wZSwgYWRhbEF1dGhlbnRpY2F0aW9uU2VydmljZSwgJGxvY2F0aW9uLCB1c2VyU2VydmljZSwgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRUaXRsZUZvclJvdXRlKCRyb3V0ZS5jdXJyZW50KTtcclxuICAgICAgICAgICAgICAgICRzY29wZS5idXR0b25CYXJCdXR0b25zID0gW107XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBvcHVsYXRlKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBhc3luYyBwb3B1bGF0ZSgpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0VXBkYXRlU3RhdGUodHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRzY29wZS5sb2FkaW5nTWVzc2FnZSA9IFwiUmV0cmlldmluZyBjdXJyZW50IHZvdGUgdGFsbGllcy4uLlwiO1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kc2NvcGUuZXJyb3IgPSBcIlwiO1xyXG4gICAgICAgICAgICAgICAgbGV0IHZvdGVzVGFsbHkgPSBhd2FpdCB0aGlzLnZvdGVTZXJ2aWNlLmdldFZvdGVUYWxseSgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kc2NvcGUudm90ZXNUYWxseSA9IHZvdGVzVGFsbHk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRzY29wZS5sb2FkaW5nTWVzc2FnZSA9IFwiXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2F0Y2ggKGV4KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldEVycm9yKHRydWUsIGV4LmRhdGEgfHwgZXguc3RhdHVzVGV4dCwgZXguaGVhZGVycyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0gIiwiLy8gICAgIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiAgQWxsIHJpZ2h0cyByZXNlcnZlZC5cclxuXHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9yZWZlcmVuY2VzL2luZGV4LmQudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9Db250cm9sbGVyQmFzZS50c1wiIC8+XHJcblxyXG5tb2R1bGUgRFhMaXF1aWRJbnRlbC5BcHAuQ29udHJvbGxlciB7XHJcblxyXG4gICAgZXhwb3J0IGNsYXNzIEFuYWx5dGljc0NvbnRyb2xsZXIgZXh0ZW5kcyBDb250cm9sbGVyQmFzZSB7XHJcbiAgICAgICAgc3RhdGljICRpbmplY3QgPSBbJyRzY29wZScsICckcm9vdFNjb3BlJywgJ2FkYWxBdXRoZW50aWNhdGlvblNlcnZpY2UnLCAnJGxvY2F0aW9uJywgJyRyb3V0ZScsICd1c2VyU2VydmljZSddO1xyXG5cclxuICAgICAgICBjb25zdHJ1Y3Rvcigkc2NvcGU6IE1vZGVsLklEWExpcXVpZEludGVsU2NvcGUsXHJcbiAgICAgICAgICAgICRyb290U2NvcGU6IE1vZGVsLklEWExpcXVpZEludGVsU2NvcGUsXHJcbiAgICAgICAgICAgIGFkYWxBdXRoZW50aWNhdGlvblNlcnZpY2UsXHJcbiAgICAgICAgICAgICRsb2NhdGlvbjogbmcuSUxvY2F0aW9uU2VydmljZSxcclxuICAgICAgICAgICAgJHJvdXRlOiBuZy5yb3V0ZS5JUm91dGVTZXJ2aWNlLFxyXG4gICAgICAgICAgICB1c2VyU2VydmljZTogU2VydmljZS5Vc2VyU2VydmljZSkge1xyXG5cclxuICAgICAgICAgICAgc3VwZXIoJHNjb3BlLCAkcm9vdFNjb3BlLCBhZGFsQXV0aGVudGljYXRpb25TZXJ2aWNlLCAkbG9jYXRpb24sIHVzZXJTZXJ2aWNlLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFRpdGxlRm9yUm91dGUoJHJvdXRlLmN1cnJlbnQpO1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLmJ1dHRvbkJhckJ1dHRvbnMgPSBbXTtcclxuICAgICAgICAgICAgICAgIHRoaXMucG9wdWxhdGUoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIGFzeW5jIHBvcHVsYXRlKCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRVcGRhdGVTdGF0ZSh0cnVlKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuJHNjb3BlLmxvYWRpbmdNZXNzYWdlID0gXCJSZXRyaWV2aW5nIGJlZXIgYW5hbHl0aWNzLi4uXCI7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRzY29wZS5lcnJvciA9IFwiXCI7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRzY29wZS5sb2FkaW5nTWVzc2FnZSA9IFwiXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2F0Y2ggKGV4KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldEVycm9yKHRydWUsIGV4LmRhdGEgfHwgZXguc3RhdHVzVGV4dCwgZXguaGVhZGVycyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0gIiwiLy8gICAgIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiAgQWxsIHJpZ2h0cyByZXNlcnZlZC5cclxuXHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9yZWZlcmVuY2VzL2luZGV4LmQudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9Db250cm9sbGVyQmFzZS50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9TZXJ2aWNlL1VzZXJTZXJ2aWNlLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL1NlcnZpY2UvRGFzaGJvYXJkU2VydmljZS50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9TZXJ2aWNlL0tlZ3NTZXJ2aWNlLnRzXCIgLz5cclxuXHJcbm1vZHVsZSBEWExpcXVpZEludGVsLkFwcC5Db250cm9sbGVyIHtcclxuXHJcbiAgICBleHBvcnQgY2xhc3MgSG9tZUNvbnRyb2xsZXIgZXh0ZW5kcyBDb250cm9sbGVyQmFzZSB7XHJcbiAgICAgICAgc3RhdGljICRpbmplY3QgPSBbJyRzY29wZScsICckcm9vdFNjb3BlJywgJ2FkYWxBdXRoZW50aWNhdGlvblNlcnZpY2UnLCAnJGxvY2F0aW9uJywgJyRyb3V0ZScsICd1c2VyU2VydmljZScsICdkYXNoYm9hcmRTZXJ2aWNlJywgJ2tlZ3NTZXJ2aWNlJywgJyRpbnRlcnZhbCddO1xyXG5cclxuICAgICAgICBjb25zdHJ1Y3Rvcigkc2NvcGU6IE1vZGVsLklEWExpcXVpZEludGVsU2NvcGUsXHJcbiAgICAgICAgICAgICRyb290U2NvcGU6IE1vZGVsLklEWExpcXVpZEludGVsU2NvcGUsXHJcbiAgICAgICAgICAgIGFkYWxBdXRoZW50aWNhdGlvblNlcnZpY2UsXHJcbiAgICAgICAgICAgICRsb2NhdGlvbjogbmcuSUxvY2F0aW9uU2VydmljZSxcclxuICAgICAgICAgICAgJHJvdXRlOiBuZy5yb3V0ZS5JUm91dGVTZXJ2aWNlLFxyXG4gICAgICAgICAgICB1c2VyU2VydmljZTogU2VydmljZS5Vc2VyU2VydmljZSxcclxuICAgICAgICAgICAgcHJvdGVjdGVkIGRhc2hib2FyZFNlcnZpY2U6IFNlcnZpY2UuRGFzaGJvYXJkU2VydmljZSxcclxuICAgICAgICAgICAgcHJvdGVjdGVkIGtlZ3NTZXJ2aWNlOiBTZXJ2aWNlLktlZ3NTZXJ2aWNlLFxyXG4gICAgICAgICAgICAkaW50ZXJ2YWw6IG5nLklJbnRlcnZhbFNlcnZpY2UpIHtcclxuXHJcbiAgICAgICAgICAgIHN1cGVyKCRzY29wZSwgJHJvb3RTY29wZSwgYWRhbEF1dGhlbnRpY2F0aW9uU2VydmljZSwgJGxvY2F0aW9uLCB1c2VyU2VydmljZSwgKCkgPT4ge1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0VGl0bGVGb3JSb3V0ZSgkcm91dGUuY3VycmVudCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBvcHVsYXRlKCk7XHJcbiAgICAgICAgICAgICAgICB2YXIgaW50ZXJ2YWxQcm9taXNlID0gJGludGVydmFsKCgpID0+IHRoaXMucG9wdWxhdGUoKSwgNTAwMCk7ICAgICAgXHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuJG9uKCckZGVzdHJveScsICgpID0+ICRpbnRlcnZhbC5jYW5jZWwoaW50ZXJ2YWxQcm9taXNlKSk7ICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByb3RlY3RlZCBhc3luYyBwb3B1bGF0ZSgpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICAgICAgdGhpcy4kc2NvcGUuY3VycmVudFRhcHMgPSBhd2FpdCB0aGlzLmtlZ3NTZXJ2aWNlLmdldFRhcHNTdGF0dXMoKTtcclxuICAgICAgICAgICAgdGhpcy4kc2NvcGUuY3VycmVudEFjdGl2aXRpZXMgPSBhd2FpdCB0aGlzLmRhc2hib2FyZFNlcnZpY2UuZ2V0TGF0ZXN0QWN0aXZpdGllcygyNSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59ICIsIi8vICAgICBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gIEFsbCByaWdodHMgcmVzZXJ2ZWQuXHJcblxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vcmVmZXJlbmNlcy9pbmRleC5kLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vQ29udHJvbGxlckJhc2UudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vU2VydmljZS9BZG1pblNlcnZpY2UudHNcIiAvPlxyXG5cclxubW9kdWxlIERYTGlxdWlkSW50ZWwuQXBwLkNvbnRyb2xsZXIge1xyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBBdXRob3JpemVkR3JvdXBzQ29udHJvbGxlciBleHRlbmRzIENvbnRyb2xsZXJCYXNlIHtcclxuICAgICAgICBzdGF0aWMgJGluamVjdCA9IFsnJHNjb3BlJywgJyRyb290U2NvcGUnLCAnYWRhbEF1dGhlbnRpY2F0aW9uU2VydmljZScsICckbG9jYXRpb24nLCAnJHJvdXRlJywgJ3VzZXJTZXJ2aWNlJywgJ2FkbWluU2VydmljZSddO1xyXG5cclxuICAgICAgICBjb25zdHJ1Y3Rvcigkc2NvcGU6IE1vZGVsLklEWExpcXVpZEludGVsU2NvcGUsXHJcbiAgICAgICAgICAgICRyb290U2NvcGU6IE1vZGVsLklEWExpcXVpZEludGVsU2NvcGUsXHJcbiAgICAgICAgICAgIGFkYWxBdXRoZW50aWNhdGlvblNlcnZpY2UsXHJcbiAgICAgICAgICAgICRsb2NhdGlvbjogbmcuSUxvY2F0aW9uU2VydmljZSxcclxuICAgICAgICAgICAgJHJvdXRlOiBuZy5yb3V0ZS5JUm91dGVTZXJ2aWNlLFxyXG4gICAgICAgICAgICB1c2VyU2VydmljZTogU2VydmljZS5Vc2VyU2VydmljZSxcclxuICAgICAgICAgICAgcHJvdGVjdGVkIGFkbWluU2VydmljZTogU2VydmljZS5BZG1pblNlcnZpY2UpIHtcclxuXHJcbiAgICAgICAgICAgIHN1cGVyKCRzY29wZSwgJHJvb3RTY29wZSwgYWRhbEF1dGhlbnRpY2F0aW9uU2VydmljZSwgJGxvY2F0aW9uLCB1c2VyU2VydmljZSwgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRUaXRsZUZvclJvdXRlKCRyb3V0ZS5jdXJyZW50KTtcclxuICAgICAgICAgICAgICAgICRzY29wZS5idXR0b25CYXJCdXR0b25zID0gW1xyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBNb2RlbC5CdXR0b25CYXJCdXR0b24oXCJDb21taXRcIiwgJHNjb3BlLCBcImF1dGhvcml6ZWRHcm91cHNGb3JtLiR2YWxpZCAmJiBhdXRob3JpemVkR3JvdXBzRm9ybS4kZGlydHkgJiYgIXVwZGF0ZUluUHJvZ3Jlc3NcIiwgKCkgPT4gdGhpcy51cGRhdGUoKSwgdHJ1ZSksXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IE1vZGVsLkJ1dHRvbkJhckJ1dHRvbihcIlJldmVydFwiLCAkc2NvcGUsIFwiIXVwZGF0ZUluUHJvZ3Jlc3NcIiwgKCkgPT4gdGhpcy5wb3B1bGF0ZSgpLCBmYWxzZSlcclxuICAgICAgICAgICAgICAgIF07XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuYWRkR3JvdXAgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuJHNjb3BlLm5ld0dyb3VwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuJHNjb3BlLmF1dGhvcml6ZWRHcm91cHMuQXV0aG9yaXplZEdyb3Vwcy5wdXNoKHRoaXMuJHNjb3BlLm5ld0dyb3VwLmRpc3BsYXlOYW1lKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy4kc2NvcGUubmV3R3JvdXAgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgJHNjb3BlLmRlbGV0ZUdyb3VwID0gKGdyb3VwOiBzdHJpbmcpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLiRzY29wZS5hdXRob3JpemVkR3JvdXBzLkF1dGhvcml6ZWRHcm91cHMuc3BsaWNlKHRoaXMuJHNjb3BlLmF1dGhvcml6ZWRHcm91cHMuQXV0aG9yaXplZEdyb3Vwcy5pbmRleE9mKGdyb3VwKSwgMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy4kc2NvcGUuYXV0aG9yaXplZEdyb3Vwc0Zvcm0uJHNldERpcnR5KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuc2VhcmNoR3JvdXBzID0gKHNlYXJjaFRlcm06IHN0cmluZykgPT4gdGhpcy5zZWFyY2hHcm91cHMoc2VhcmNoVGVybSk7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUudXBkYXRlQXV0aG9yaXplZEdyb3VwcyA9ICgpID0+IHRoaXMudXBkYXRlKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBvcHVsYXRlKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBhc3luYyBzZWFyY2hHcm91cHMoc2VhcmNoVGVybTogc3RyaW5nKTogUHJvbWlzZTxhbnk+IHtcclxuICAgICAgICAgICAgdmFyIHJlc3VsdHMgPSBhd2FpdCB0aGlzLmFkbWluU2VydmljZS5zZWFyY2hHcm91cHMoc2VhcmNoVGVybSk7XHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHRzLnJlc3VsdHM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIGFzeW5jIHBvcHVsYXRlKCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRVcGRhdGVTdGF0ZSh0cnVlKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuJHNjb3BlLmxvYWRpbmdNZXNzYWdlID0gXCJSZXRyaWV2aW5nIGF1dGhvcml6ZWQgZ3JvdXBzLi4uXCI7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRzY29wZS5lcnJvciA9IFwiXCI7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRzY29wZS5hdXRob3JpemVkR3JvdXBzID0gYXdhaXQgdGhpcy5hZG1pblNlcnZpY2UuZ2V0QXV0aG9yaXplZEdyb3VwcygpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRVcGRhdGVTdGF0ZShmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRzY29wZS5sb2FkaW5nTWVzc2FnZSA9IFwiXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2F0Y2ggKGV4KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldEVycm9yKHRydWUsIGV4LmRhdGEgfHwgZXguc3RhdHVzVGV4dCwgZXguaGVhZGVycyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgYXN5bmMgdXBkYXRlKCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kc2NvcGUubG9hZGluZ01lc3NhZ2UgPSBcIlNhdmluZyBhdXRob3JpemVkIGdyb3Vwcy4uLlwiO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRVcGRhdGVTdGF0ZSh0cnVlKTtcclxuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuYWRtaW5TZXJ2aWNlLnVwZGF0ZUF1dGhvcml6ZWRHcm91cHModGhpcy4kc2NvcGUuYXV0aG9yaXplZEdyb3Vwcyk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRzY29wZS5hdXRob3JpemVkR3JvdXBzRm9ybS4kc2V0UHJpc3RpbmUoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0VXBkYXRlU3RhdGUoZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kc2NvcGUuZXJyb3IgPSBcIlwiO1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kc2NvcGUubG9hZGluZ01lc3NhZ2UgPSBcIlwiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhdGNoIChleCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRFcnJvcih0cnVlLCBleC5kYXRhIHx8IGV4LnN0YXR1c1RleHQsIGV4LmhlYWRlcnMpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRVcGRhdGVTdGF0ZShmYWxzZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0gIiwiLy8gICAgIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiAgQWxsIHJpZ2h0cyByZXNlcnZlZC5cclxuXHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9yZWZlcmVuY2VzL2luZGV4LmQudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9Db250cm9sbGVyQmFzZS50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9TZXJ2aWNlL0tlZ3NTZXJ2aWNlLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL1NlcnZpY2UvVW50YXBwZEFwaVNlcnZpY2UudHNcIiAvPlxyXG5cclxubW9kdWxlIERYTGlxdWlkSW50ZWwuQXBwLkNvbnRyb2xsZXIge1xyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBJbnN0YWxsS2Vnc0NvbnRyb2xsZXIgZXh0ZW5kcyBDb250cm9sbGVyQmFzZSB7XHJcbiAgICAgICAgc3RhdGljICRpbmplY3QgPSBbJyRzY29wZScsICckcm9vdFNjb3BlJywgJ2FkYWxBdXRoZW50aWNhdGlvblNlcnZpY2UnLCAnJGxvY2F0aW9uJywgJyRyb3V0ZScsICd1c2VyU2VydmljZScsICdrZWdzU2VydmljZScsICd1bnRhcHBkU2VydmljZSddO1xyXG5cclxuICAgICAgICBjb25zdHJ1Y3Rvcigkc2NvcGU6IE1vZGVsLklEWExpcXVpZEludGVsU2NvcGUsXHJcbiAgICAgICAgICAgICRyb290U2NvcGU6IE1vZGVsLklEWExpcXVpZEludGVsU2NvcGUsXHJcbiAgICAgICAgICAgIGFkYWxBdXRoZW50aWNhdGlvblNlcnZpY2UsXHJcbiAgICAgICAgICAgICRsb2NhdGlvbjogbmcuSUxvY2F0aW9uU2VydmljZSxcclxuICAgICAgICAgICAgJHJvdXRlOiBuZy5yb3V0ZS5JUm91dGVTZXJ2aWNlLFxyXG4gICAgICAgICAgICB1c2VyU2VydmljZTogU2VydmljZS5Vc2VyU2VydmljZSxcclxuICAgICAgICAgICAgcHJvdGVjdGVkIGtlZ3NTZXJ2aWNlOiBTZXJ2aWNlLktlZ3NTZXJ2aWNlLFxyXG4gICAgICAgICAgICBwcm90ZWN0ZWQgdW50YXBwZFNlcnZpY2U6IFNlcnZpY2UuVW50YXBwZEFwaVNlcnZpY2UpIHtcclxuXHJcbiAgICAgICAgICAgIHN1cGVyKCRzY29wZSwgJHJvb3RTY29wZSwgYWRhbEF1dGhlbnRpY2F0aW9uU2VydmljZSwgJGxvY2F0aW9uLCB1c2VyU2VydmljZSwgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRUaXRsZUZvclJvdXRlKCRyb3V0ZS5jdXJyZW50KTtcclxuICAgICAgICAgICAgICAgICRzY29wZS5idXR0b25CYXJCdXR0b25zID0gW1xyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBNb2RlbC5CdXR0b25CYXJCdXR0b24oXCJDb21taXRcIiwgJHNjb3BlLCBcImluc3RhbGxLZWdzRm9ybS4kdmFsaWQgJiYgaW5zdGFsbEtlZ3NGb3JtLiRkaXJ0eSAmJiAhdXBkYXRlSW5Qcm9ncmVzc1wiLCAoKSA9PiB0aGlzLnVwZGF0ZSgpLCB0cnVlKSxcclxuICAgICAgICAgICAgICAgICAgICBuZXcgTW9kZWwuQnV0dG9uQmFyQnV0dG9uKFwiUmV2ZXJ0XCIsICRzY29wZSwgXCIhdXBkYXRlSW5Qcm9ncmVzc1wiLCAoKSA9PiB0aGlzLnBvcHVsYXRlKCksIGZhbHNlKVxyXG4gICAgICAgICAgICAgICAgXTtcclxuICAgICAgICAgICAgICAgICRzY29wZS5zZWFyY2hCZWVycyA9IChzZWFyY2hUZXJtOiBzdHJpbmcpID0+IHRoaXMuc2VhcmNoQmVlcnMoc2VhcmNoVGVybSk7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUudXBkYXRlSW5zdGFsbEtlZ3MgPSAoKSA9PiB0aGlzLnVwZGF0ZSgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wb3B1bGF0ZSgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgYXN5bmMgc2VhcmNoQmVlcnMoc2VhcmNoVGVybTogc3RyaW5nKTogUHJvbWlzZTxNb2RlbC5CZWVySW5mb1tdPiB7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy51bnRhcHBkU2VydmljZS5zZWFyY2hCZWVycyhzZWFyY2hUZXJtLCB0aGlzLiRzY29wZS5zeXN0ZW1Vc2VySW5mby5VbnRhcHBkQWNjZXNzVG9rZW4pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhdGNoIChleCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgYXN5bmMgcG9wdWxhdGUoKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFVwZGF0ZVN0YXRlKHRydWUpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kc2NvcGUubG9hZGluZ01lc3NhZ2UgPSBcIlJldHJpZXZpbmcgY3VycmVudCB0YXAgaW5mb3JtYXRpb24uLi5cIjtcclxuICAgICAgICAgICAgICAgIHRoaXMuJHNjb3BlLmVycm9yID0gXCJcIjtcclxuICAgICAgICAgICAgICAgIHRoaXMuJHNjb3BlLmN1cnJlbnRUYXBzID0gdGhpcy5ub3JtYWxpemVUYXBJbmZvKGF3YWl0IHRoaXMua2Vnc1NlcnZpY2UuZ2V0VGFwc1N0YXR1cygpLCB0cnVlKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0VXBkYXRlU3RhdGUoZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kc2NvcGUubG9hZGluZ01lc3NhZ2UgPSBcIlwiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhdGNoIChleCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRFcnJvcih0cnVlLCBleC5kYXRhIHx8IGV4LnN0YXR1c1RleHQsIGV4LmhlYWRlcnMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIGFzeW5jIHVwZGF0ZSgpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuJHNjb3BlLmxvYWRpbmdNZXNzYWdlID0gXCJJbnN0YWxsaW5nIG5ldyBrZWdzLi4uXCI7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFVwZGF0ZVN0YXRlKHRydWUpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kc2NvcGUuY3VycmVudFRhcHMgPSB0aGlzLm5vcm1hbGl6ZVRhcEluZm8oYXdhaXQgUHJvbWlzZS5hbGwodGhpcy4kc2NvcGUuY3VycmVudFRhcHMubWFwKGFzeW5jIHRhcEluZm8gPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0YXBJbmZvLk9yaWdpbmFsVW50YXBwZElkICE9PSB0YXBJbmZvLkJlZXJJbmZvLnVudGFwcGRJZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0YXBJbmZvLlVudGFwcGRJZCA9IHRhcEluZm8uQmVlckluZm8udW50YXBwZElkO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0YXBJbmZvLk5hbWUgPSB0YXBJbmZvLkJlZXJJbmZvLm5hbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhcEluZm8uQmVlclR5cGUgPSB0YXBJbmZvLkJlZXJJbmZvLmJlZXJfdHlwZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGFwSW5mby5JQlUgPSB0YXBJbmZvLkJlZXJJbmZvLmlidTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGFwSW5mby5BQlYgPSB0YXBJbmZvLkJlZXJJbmZvLmFidjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGFwSW5mby5CZWVyRGVzY3JpcHRpb24gPSB0YXBJbmZvLkJlZXJJbmZvLmRlc2NyaXB0aW9uO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0YXBJbmZvLkJyZXdlcnkgPSB0YXBJbmZvLkJlZXJJbmZvLmJyZXdlcnk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhcEluZm8uaW1hZ2VQYXRoID0gdGFwSW5mby5CZWVySW5mby5pbWFnZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGFwSW5mby5DdXJyZW50Vm9sdW1lID0gdGFwSW5mby5LZWdTaXplO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbmV3S2VnID0gYXdhaXQgdGhpcy5rZWdzU2VydmljZS5jcmVhdGVOZXdLZWcodGFwSW5mbyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMua2Vnc1NlcnZpY2UuaW5zdGFsbEtlZ09uVGFwKHRhcEluZm8uVGFwSWQsIG5ld0tlZy5LZWdJZCwgdGFwSW5mby5LZWdTaXplKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGFwSW5mby5LZWdJZCA9IG5ld0tlZy5LZWdJZDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRhcEluZm87XHJcbiAgICAgICAgICAgICAgICB9KSksIHRydWUpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kc2NvcGUuaW5zdGFsbEtlZ3NGb3JtLiRzZXRQcmlzdGluZSgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRVcGRhdGVTdGF0ZShmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRzY29wZS5lcnJvciA9IFwiXCI7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRzY29wZS5sb2FkaW5nTWVzc2FnZSA9IFwiXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2F0Y2ggKGV4KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldEVycm9yKHRydWUsIGV4LmRhdGEgfHwgZXguc3RhdHVzVGV4dCwgZXguaGVhZGVycyk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFVwZGF0ZVN0YXRlKGZhbHNlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBub3JtYWxpemVUYXBJbmZvKGN1cnJlbnRUYXBzOiBNb2RlbC5UYXBJbmZvW10sIGluY2x1ZGVFbXB0eVRhcHM6IGJvb2xlYW4pOiBNb2RlbC5UYXBJbmZvW10ge1xyXG4gICAgICAgICAgICBpZiAoaW5jbHVkZUVtcHR5VGFwcyAmJiBjdXJyZW50VGFwcy5sZW5ndGggPCAyKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBJZiB3ZSBkb24ndCBjdXJyZW50bHkgaGF2ZSBhIGtlZyBpbnN0YWxsZWQgb24gZWl0aGVyIHRhcCwgdGhlbiBjcmVhdGUgYW4gZW1wdHkgb2JqZWN0XHJcbiAgICAgICAgICAgICAgICBpZiAoIWN1cnJlbnRUYXBzWzBdIHx8IGN1cnJlbnRUYXBzWzBdLlRhcElkICE9IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICBjdXJyZW50VGFwcy51bnNoaWZ0KHRoaXMuY3JlYXRlRW1wdHlUYXAoMSkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKCFjdXJyZW50VGFwc1sxXSB8fCBjdXJyZW50VGFwc1sxXS5UYXBJZCAhPSAyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudFRhcHMucHVzaCh0aGlzLmNyZWF0ZUVtcHR5VGFwKDIpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gY3VycmVudFRhcHMubWFwKHRhcEluZm8gPT4ge1xyXG4gICAgICAgICAgICAgICAgdGFwSW5mby5CZWVySW5mbyA9IHtcclxuICAgICAgICAgICAgICAgICAgICB1bnRhcHBkSWQ6IHRhcEluZm8uVW50YXBwZElkLFxyXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IHRhcEluZm8uTmFtZSxcclxuICAgICAgICAgICAgICAgICAgICBiZWVyX3R5cGU6IHRhcEluZm8uQmVlclR5cGUsXHJcbiAgICAgICAgICAgICAgICAgICAgaWJ1OiB0YXBJbmZvLklCVSxcclxuICAgICAgICAgICAgICAgICAgICBhYnY6IHRhcEluZm8uQUJWLFxyXG4gICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiB0YXBJbmZvLkJlZXJEZXNjcmlwdGlvbixcclxuICAgICAgICAgICAgICAgICAgICBicmV3ZXJ5OiB0YXBJbmZvLkJyZXdlcnksXHJcbiAgICAgICAgICAgICAgICAgICAgaW1hZ2U6IHRhcEluZm8uaW1hZ2VQYXRoXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgdGFwSW5mby5PcmlnaW5hbFVudGFwcGRJZCA9IHRhcEluZm8uVW50YXBwZElkO1xyXG4gICAgICAgICAgICAgICAgdGFwSW5mby5nZXRTZXRCZWVySW5mbyA9IChiZWVySW5mbykgPT4gdGhpcy5nZXRTZXRCZWVySW5mbyh0YXBJbmZvLCBiZWVySW5mbyk7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIHJldHVybiB0YXBJbmZvO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgZ2V0U2V0QmVlckluZm8odGFwSW5mbzogTW9kZWwuVGFwSW5mbywgYmVlckluZm86IGFueSk6IE1vZGVsLkJlZXJJbmZvIHtcclxuICAgICAgICAgICAgaWYgKGFuZ3VsYXIuaXNEZWZpbmVkKGJlZXJJbmZvKSkge1xyXG4gICAgICAgICAgICAgICAgLy8gSWYgdGhlIHR5cGVhaGVhZCBpc24ndCBib3VuZCB0byBhIHBvcHVwIHNlbGVjdGlvbiwgd2UganVzdCBnZXQgdGhlIHN0cmluZ1xyXG4gICAgICAgICAgICAgICAgaWYgKGFuZ3VsYXIuaXNTdHJpbmcoYmVlckluZm8pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGFwSW5mby5CZWVySW5mbyA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdW50YXBwZElkOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBiZWVySW5mb1xyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChhbmd1bGFyLmlzT2JqZWN0PE1vZGVsLkJlZXJJbmZvPihiZWVySW5mbykpIHtcclxuICAgICAgICAgICAgICAgICAgICB0YXBJbmZvLkJlZXJJbmZvID0gPE1vZGVsLkJlZXJJbmZvPmJlZXJJbmZvO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdUeXBlYWRoZWFkIGJpbmRpbmcgdG8gdW5leHBlY3RlZCBkYXRhOiAnICsgYmVlckluZm8pO1xyXG4gICAgICAgICAgICAgICAgICAgIHRhcEluZm8uQmVlckluZm8gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVudGFwcGRJZDogbnVsbCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogJydcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB0YXBJbmZvLkJlZXJJbmZvO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBjcmVhdGVFbXB0eVRhcCh0YXBJZDogbnVtYmVyKTogTW9kZWwuVGFwSW5mbyB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBUYXBJZDogdGFwSWQsXHJcbiAgICAgICAgICAgICAgICBJbnN0YWxsRGF0ZTogbmV3IERhdGUoKSxcclxuICAgICAgICAgICAgICAgIEtlZ1NpemU6IDAsXHJcbiAgICAgICAgICAgICAgICBDdXJyZW50Vm9sdW1lOiAwLFxyXG4gICAgICAgICAgICAgICAgS2VnSWQ6IG51bGwsXHJcbiAgICAgICAgICAgICAgICBOYW1lOiAnJyxcclxuICAgICAgICAgICAgICAgIFVudGFwcGRJZDogMCxcclxuICAgICAgICAgICAgICAgIEJyZXdlcnk6ICcnLFxyXG4gICAgICAgICAgICAgICAgQmVlclR5cGU6ICcnLFxyXG4gICAgICAgICAgICAgICAgQmVlckRlc2NyaXB0aW9uOiAnJyxcclxuICAgICAgICAgICAgICAgIGltYWdlUGF0aDogJydcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0gIiwiLy8gICAgIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiAgQWxsIHJpZ2h0cyByZXNlcnZlZC5cclxuXHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL3JlZmVyZW5jZXMvaW5kZXguZC50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL1NlcnZpY2UvVXNlclNlcnZpY2UudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9TZXJ2aWNlL1ZvdGVTZXJ2aWNlLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vU2VydmljZS9EYXNoYm9hcmRTZXJ2aWNlLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vU2VydmljZS9LZWdzU2VydmljZS50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL1NlcnZpY2UvQWRtaW5TZXJ2aWNlLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vU2VydmljZS9VbnRhcHBkQXBpU2VydmljZS50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL1NlcnZpY2UvQ29uZmlnU2VydmljZS50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL0NvbnRyb2xsZXIvVXNlckNvbnRyb2xsZXIudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9Db250cm9sbGVyL1ZvdGVCZWVyQ29udHJvbGxlci50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL0NvbnRyb2xsZXIvVm90ZVJlc3VsdHNDb250cm9sbGVyLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vQ29udHJvbGxlci9BbmFseXRpY3NDb250cm9sbGVyLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vQ29udHJvbGxlci9Ib21lQ29udHJvbGxlci50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL0NvbnRyb2xsZXIvQXV0aG9yaXplZEdyb3Vwc0NvbnRyb2xsZXIudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9Db250cm9sbGVyL0luc3RhbGxLZWdzQ29udHJvbGxlci50c1wiIC8+XHJcblxyXG5tb2R1bGUgRFhMaXF1aWRJbnRlbC5BcHAge1xyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBBcHBCdWlsZGVyIHtcclxuXHJcbiAgICAgICAgcHJpdmF0ZSBhcHA6IG5nLklNb2R1bGU7XHJcblxyXG4gICAgICAgIGNvbnN0cnVjdG9yKG5hbWU6IHN0cmluZykge1xyXG4gICAgICAgICAgICB0aGlzLmFwcCA9IGFuZ3VsYXIubW9kdWxlKG5hbWUsIFtcclxuICAgICAgICAgICAgICAgIC8vIEFuZ3VsYXIgbW9kdWxlcyBcclxuICAgICAgICAgICAgICAgIFwibmdSb3V0ZVwiLFxyXG4gICAgICAgICAgICAgICAgXCJuZ1Jlc291cmNlXCIsXHJcbiAgICAgICAgICAgICAgICBcInVpLmJvb3RzdHJhcFwiLFxyXG4gICAgICAgICAgICAgICAgXCJlbnZpcm9ubWVudFwiLFxyXG4gICAgICAgICAgICAgICAgLy8gQURBTFxyXG4gICAgICAgICAgICAgICAgJ0FkYWxBbmd1bGFyJ1xyXG4gICAgICAgICAgICBdKTtcclxuICAgICAgICAgICAgdGhpcy5hcHAuY29uZmlnKFsnJHJvdXRlUHJvdmlkZXInLCAnJGh0dHBQcm92aWRlcicsICdhZGFsQXV0aGVudGljYXRpb25TZXJ2aWNlUHJvdmlkZXInLCAnZW52U2VydmljZVByb3ZpZGVyJyxcclxuICAgICAgICAgICAgICAgICgkcm91dGVQcm92aWRlcjogbmcucm91dGUuSVJvdXRlUHJvdmlkZXIsICRodHRwUHJvdmlkZXI6IG5nLklIdHRwUHJvdmlkZXIsIGFkYWxQcm92aWRlciwgZW52U2VydmljZVByb3ZpZGVyOiBhbmd1bGFyLmVudmlyb25tZW50LlNlcnZpY2VQcm92aWRlcikgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGVudlNlcnZpY2VQcm92aWRlci5jb25maWcoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkb21haW5zOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXZlbG9wbWVudDogWydsb2NhbGhvc3QnXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBwZTogWydkeC1saXF1aWRhcHAtc3RhZ2luZy5henVyZXdlYnNpdGVzLm5ldCddLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvZHVjdGlvbjogWydkeC1saXF1aWRhcHAuYXp1cmV3ZWJzaXRlcy5uZXQnXVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXJzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXZlbG9wbWVudDoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwaVVyaTogJy8vbG9jYWxob3N0OjgwODAvYXBpJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW5hbnQ6ICdtaWNyb3NvZnQuY29tJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHBDbGllbnRJZDogJzM1YTMzY2ZjLWZjNTItNDhjZi05MGY0LTIzYWQ2OWVmODViYycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBpQ2xpZW50SWQ6ICczNWEzM2NmYy1mYzUyLTQ4Y2YtOTBmNC0yM2FkNjllZjg1YmMnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwaVVzZXJuYW1lOiAnMDAwMS0wMDAxJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcGlQYXNzd29yZDogJ1pIaHNhWEYxYVdRdGNtRnpjR0psY25KNWNHaz0nXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHBlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBpVXJpOiAnLy9keGxpcXVpZGludGVsLXN0YWdpbmcuYXp1cmV3ZWJzaXRlcy5uZXQvYXBpJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW5hbnQ6ICdtaWNyb3NvZnQuY29tJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHBDbGllbnRJZDogJzM1YTMzY2ZjLWZjNTItNDhjZi05MGY0LTIzYWQ2OWVmODViYycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBpQ2xpZW50SWQ6ICdiMWU4MDc0OC00M2MyLTQ0NTAtOTEyMS1jYmMwZGNjOTgwNTEnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwaVVzZXJuYW1lOiAnMDAwMS0wMDAxJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcGlQYXNzd29yZDogJ1pIaHNhWEYxYVdRdGNtRnpjR0psY25KNWNHaz0nXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvZHVjdGlvbjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwaVVyaTogJy8vZHhsaXF1aWRpbnRlbC5henVyZXdlYnNpdGVzLm5ldC9hcGknLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbmFudDogJ21pY3Jvc29mdC5jb20nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcENsaWVudElkOiAnMzVhMzNjZmMtZmM1Mi00OGNmLTkwZjQtMjNhZDY5ZWY4NWJjJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcGlDbGllbnRJZDogJ2IxZTgwNzQ4LTQzYzItNDQ1MC05MTIxLWNiYzBkY2M5ODA1MScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBpVXNlcm5hbWU6ICcwMDAxLTAwMDEnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwaVBhc3N3b3JkOiAnWkhoc2FYRjFhV1F0Y21GemNHSmxjbko1Y0drPSdcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIGVudlNlcnZpY2VQcm92aWRlci5jaGVjaygpO1xyXG4gICAgICAgICAgICAgICAgICAgICRyb3V0ZVByb3ZpZGVyXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC53aGVuKFwiL0hvbWVcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogXCJIb21lXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBDb250cm9sbGVyLkhvbWVDb250cm9sbGVyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6IFwiL3ZpZXdzL2hvbWUuaHRtbFwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZUluc2Vuc2l0aXZlTWF0Y2g6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC53aGVuKFwiL1VzZXJcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxhZGFsLnNoYXJlZC5JTmF2Um91dGU+e1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IFwiVXNlclwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6IENvbnRyb2xsZXIuVXNlckNvbnRyb2xsZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6IFwiL1ZpZXdzL1VzZXIuaHRtbFwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcXVpcmVBRExvZ2luOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2VJbnNlbnNpdGl2ZU1hdGNoOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAud2hlbihcIi9Wb3RlQmVlclwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGFkYWwuc2hhcmVkLklOYXZSb3V0ZT57XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogXCJWb3RlQmVlclwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6IENvbnRyb2xsZXIuVm90ZUJlZXJDb250cm9sbGVyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBcIi9WaWV3cy9Wb3RlQmVlci5odG1sXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVxdWlyZUFETG9naW46IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZUluc2Vuc2l0aXZlTWF0Y2g6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC53aGVuKFwiL1ZvdGVSZXN1bHRzXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YWRhbC5zaGFyZWQuSU5hdlJvdXRlPntcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBcIlZvdGVSZXN1bHRzXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogQ29udHJvbGxlci5Wb3RlUmVzdWx0c0NvbnRyb2xsZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6IFwiL1ZpZXdzL1ZvdGVSZXN1bHRzLmh0bWxcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXF1aXJlQURMb2dpbjogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlSW5zZW5zaXRpdmVNYXRjaDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgLndoZW4oXCIvQW5hbHl0aWNzXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YWRhbC5zaGFyZWQuSU5hdlJvdXRlPntcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBcIkFuYWx5dGljc1wiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6IENvbnRyb2xsZXIuQW5hbHl0aWNzQ29udHJvbGxlcixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogXCIvVmlld3MvQW5hbHl0aWNzLmh0bWxcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXF1aXJlQURMb2dpbjogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlSW5zZW5zaXRpdmVNYXRjaDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgLndoZW4oXCIvQXV0aG9yaXplZEdyb3Vwc1wiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGFkYWwuc2hhcmVkLklOYXZSb3V0ZT57XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogXCJBdXRob3JpemVkR3JvdXBzXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogQ29udHJvbGxlci5BdXRob3JpemVkR3JvdXBzQ29udHJvbGxlcixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogXCIvVmlld3MvQXV0aG9yaXplZEdyb3Vwcy5odG1sXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVxdWlyZUFETG9naW46IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZUluc2Vuc2l0aXZlTWF0Y2g6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC53aGVuKFwiL0luc3RhbGxLZWdzXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YWRhbC5zaGFyZWQuSU5hdlJvdXRlPntcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBcIkluc3RhbGxLZWdzXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogQ29udHJvbGxlci5JbnN0YWxsS2Vnc0NvbnRyb2xsZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6IFwiL1ZpZXdzL0luc3RhbGxLZWdzLmh0bWxcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXF1aXJlQURMb2dpbjogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlSW5zZW5zaXRpdmVNYXRjaDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgLm90aGVyd2lzZShcclxuICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVkaXJlY3RUbzogXCIvSG9tZVwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIENvbmZpZ3VyZSBBREFMLlxyXG4gICAgICAgICAgICAgICAgICAgIHZhciBhZGFsQ29uZmlnID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZW5hbnQ6IGVudlNlcnZpY2VQcm92aWRlci5yZWFkKCd0ZW5hbnQnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2xpZW50SWQ6IGVudlNlcnZpY2VQcm92aWRlci5yZWFkKCdhcHBDbGllbnRJZCcpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYWNoZUxvY2F0aW9uOiB3aW5kb3cubG9jYXRpb24uaG9zdG5hbWUgPT09IFwibG9jYWxob3N0XCIgPyBcImxvY2FsU3RvcmFnZVwiIDogXCJcIiwgLy8gZW5hYmxlIHRoaXMgZm9yIElFLCBhcyBzZXNzaW9uU3RvcmFnZSBkb2VzIG5vdCB3b3JrIGZvciBsb2NhbGhvc3QuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuZHBvaW50czoge30sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFub255bW91c0VuZHBvaW50czogW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZW52U2VydmljZVByb3ZpZGVyLnJlYWQoJ2FwaVVyaScpICsgJy9DdXJyZW50S2VnJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVudlNlcnZpY2VQcm92aWRlci5yZWFkKCdhcGlVcmknKSArICcvYWN0aXZpdHknXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4dHJhUXVlcnlQYXJhbWV0ZXI6ICdyZXNvdXJjZT1odHRwcyUzQSUyRiUyRm1hbmFnZW1lbnQuY29yZS53aW5kb3dzLm5ldCUyRidcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgIGFkYWxDb25maWcuZW5kcG9pbnRzW2VudlNlcnZpY2VQcm92aWRlci5yZWFkKCdhcGlVcmknKV0gPSBlbnZTZXJ2aWNlUHJvdmlkZXIucmVhZCgnYXBpQ2xpZW50SWQnKTtcclxuICAgICAgICAgICAgICAgICAgICBhZGFsUHJvdmlkZXIuaW5pdChhZGFsQ29uZmlnLCAkaHR0cFByb3ZpZGVyKTtcclxuICAgICAgICAgICAgICAgIH1dKTtcclxuICAgICAgICAgICAgdGhpcy5hcHAuc2VydmljZSgnY29uZmlnU2VydmljZScsIFNlcnZpY2UuQ29uZmlnU2VydmljZSk7XHJcbiAgICAgICAgICAgIHRoaXMuYXBwLnNlcnZpY2UoJ3VzZXJTZXJ2aWNlJywgU2VydmljZS5Vc2VyU2VydmljZSk7XHJcbiAgICAgICAgICAgIHRoaXMuYXBwLnNlcnZpY2UoJ3VudGFwcGRTZXJ2aWNlJywgU2VydmljZS5VbnRhcHBkQXBpU2VydmljZSk7XHJcbiAgICAgICAgICAgIHRoaXMuYXBwLnNlcnZpY2UoJ3ZvdGVTZXJ2aWNlJywgU2VydmljZS5Wb3RlU2VydmljZSk7XHJcbiAgICAgICAgICAgIHRoaXMuYXBwLnNlcnZpY2UoJ2Rhc2hib2FyZFNlcnZpY2UnLCBTZXJ2aWNlLkRhc2hib2FyZFNlcnZpY2UpO1xyXG4gICAgICAgICAgICB0aGlzLmFwcC5zZXJ2aWNlKCdrZWdzU2VydmljZScsIFNlcnZpY2UuS2Vnc1NlcnZpY2UpO1xyXG4gICAgICAgICAgICB0aGlzLmFwcC5zZXJ2aWNlKCdhZG1pblNlcnZpY2UnLCBTZXJ2aWNlLkFkbWluU2VydmljZSk7XHJcbiAgICAgICAgICAgIHRoaXMuYXBwLnJ1bihbJyR3aW5kb3cnLCAnJHEnLCAnJGxvY2F0aW9uJywgJyRyb3V0ZScsICckcm9vdFNjb3BlJywgKCR3aW5kb3csICRxLCAkbG9jYXRpb24sICRyb3V0ZSwgJHJvb3RTY29wZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy8gTWFrZSBhbmd1bGFyJ3MgcHJvbWlzZXMgdGhlIGRlZmF1bHQgYXMgdGhhdCB3aWxsIHN0aWxsIGludGVncmF0ZSB3aXRoIGFuZ3VsYXIncyBkaWdlc3QgY3ljbGUgYWZ0ZXIgYXdhaXRzXHJcbiAgICAgICAgICAgICAgICAkd2luZG93LlByb21pc2UgPSAkcTtcclxuICAgICAgICAgICAgICAgICRyb290U2NvcGUuJG9uKCckbG9jYXRpb25DaGFuZ2VTdGFydCcsIChldmVudCwgbmV3VXJsLCBvbGRVcmwpID0+IHRoaXMubG9jYXRpb25DaGFuZ2VIYW5kbGVyKCRyb290U2NvcGUsICRsb2NhdGlvbikpO1xyXG4gICAgICAgICAgICB9XSk7ICAgICAgICAgICAgXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIGxvY2F0aW9uQ2hhbmdlSGFuZGxlcigkcm9vdFNjb3BlLCAkbG9jYXRpb24pOiB2b2lkIHtcclxuICAgICAgICAgICAgdmFyIGhhc2ggPSAnJztcclxuICAgICAgICAgICAgaWYgKCRsb2NhdGlvbi4kJGh0bWw1KSB7XHJcbiAgICAgICAgICAgICAgICBoYXNoID0gJGxvY2F0aW9uLmhhc2goKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGhhc2ggPSAnIycgKyAkbG9jYXRpb24ucGF0aCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIFVzZSBBREFMIGZvciB1cmwgcmVzcG9uc2UgcGFyc2luZ1xyXG4gICAgICAgICAgICB2YXIgX2FkYWw6IGFueSA9IG5ldyBBdXRoZW50aWNhdGlvbkNvbnRleHQoe2NsaWVudElkOicnfSk7XHJcbiAgICAgICAgICAgIGhhc2ggPSBfYWRhbC5fZ2V0SGFzaChoYXNoKTtcclxuICAgICAgICAgICAgdmFyIHBhcmFtZXRlcnMgPSBfYWRhbC5fZGVzZXJpYWxpemUoaGFzaCk7XHJcbiAgICAgICAgICAgIGlmIChwYXJhbWV0ZXJzLmhhc093blByb3BlcnR5KCdhY2Nlc3NfdG9rZW4nKSkge1xyXG4gICAgICAgICAgICAgICAgJHJvb3RTY29wZS51bnRhcHBlZFBvc3RCYWNrVG9rZW4gPSBwYXJhbWV0ZXJzWydhY2Nlc3NfdG9rZW4nXTtcclxuICAgICAgICAgICAgICAgICRsb2NhdGlvbi5wYXRoKCdVc2VyJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBzdGFydCgpOiB2b2lkIHtcclxuICAgICAgICAgICAgJChkb2N1bWVudCkucmVhZHkoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcImJvb3RpbmcgXCIgKyB0aGlzLmFwcC5uYW1lKTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgaW5qZWN0b3IgPSBhbmd1bGFyLmJvb3RzdHJhcChkb2N1bWVudCwgW3RoaXMuYXBwLm5hbWVdKTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcImJvb3RlZCBhcHA6IFwiICsgaW5qZWN0b3IpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY2F0Y2ggKGV4KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJCgnI0Jvb3RFeGNlcHRpb25EZXRhaWxzJykudGV4dChleCk7XHJcbiAgICAgICAgICAgICAgICAgICAgJCgnI0FuZ3VsYXJCb290RXJyb3InKS5zaG93KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cImFwcGJ1aWxkZXIudHNcIiAvPlxyXG5cclxubmV3IERYTGlxdWlkSW50ZWwuQXBwLkFwcEJ1aWxkZXIoJ2R4TGlxdWlkSW50ZWxBcHAnKS5zdGFydCgpOyIsIi8vICAgICBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gIEFsbCByaWdodHMgcmVzZXJ2ZWQuXHJcblxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vcmVmZXJlbmNlcy9pbmRleC5kLnRzXCIgLz5cclxuXHJcbm1vZHVsZSBEWExpcXVpZEludGVsLkFwcC5Nb2RlbCB7XHJcblxyXG4gICAgZXhwb3J0IGNsYXNzIEJ1dHRvbkJhckJ1dHRvbiB7XHJcbiAgICAgICAgY29uc3RydWN0b3IocHVibGljIGRpc3BsYXlUZXh0OiBzdHJpbmcsXHJcbiAgICAgICAgICAgICRzY29wZTogTW9kZWwuSURYTGlxdWlkSW50ZWxTY29wZSxcclxuICAgICAgICAgICAgZW5hYmxlZEV4cHJlc3Npb246IHN0cmluZyxcclxuICAgICAgICAgICAgcHVibGljIGRvQ2xpY2s6IEZ1bmN0aW9uLFxyXG4gICAgICAgICAgICBwdWJsaWMgaXNTdWJtaXQ6IGJvb2xlYW4sXHJcbiAgICAgICAgICAgIHByaXZhdGUgaW1hZ2VVcmw/OiBzdHJpbmcpIHtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuZW5hYmxlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAkc2NvcGUuJHdhdGNoKGVuYWJsZWRFeHByZXNzaW9uLCAobmV3VmFsdWU6IGJvb2xlYW4pID0+IHRoaXMuZW5hYmxlZCA9IG5ld1ZhbHVlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBlbmFibGVkOiBib29sZWFuO1xyXG4gICAgfVxyXG59ICIsIi8vICAgICBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gIEFsbCByaWdodHMgcmVzZXJ2ZWQuXHJcblxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vcmVmZXJlbmNlcy9pbmRleC5kLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIlVzZXJJbmZvLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIlZvdGUudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiVGFwSW5mby50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJBZG1pbi50c1wiIC8+XHJcblxyXG5tb2R1bGUgRFhMaXF1aWRJbnRlbC5BcHAuTW9kZWwge1xyXG5cclxuICAgIGV4cG9ydCBpbnRlcmZhY2UgSURYTGlxdWlkSW50ZWxTY29wZSBleHRlbmRzIG5nLklTY29wZSB7XHJcbiAgICAgICAgc3lzdGVtVXNlckluZm86IFVzZXJJbmZvXHJcbiAgICAgICAgaXNBZG1pbjogRnVuY3Rpb25cclxuICAgICAgICB2b3RlczogVm90ZVtdXHJcbiAgICAgICAgdm90ZXNUYWxseTogVm90ZVRhbGx5W11cclxuICAgICAgICBjdXJyZW50VGFwczogVGFwSW5mb1tdXHJcbiAgICAgICAgY3VycmVudEFjdGl2aXRpZXM6IEFjdGl2aXR5W11cclxuICAgICAgICBhdXRob3JpemVkR3JvdXBzOiBBdXRob3JpemVkR3JvdXBzXHJcbiAgICAgICAgdGl0bGU6IHN0cmluZ1xyXG4gICAgICAgIGVycm9yOiBzdHJpbmdcclxuICAgICAgICBlcnJvcl9jbGFzczogc3RyaW5nXHJcbiAgICAgICAgbG9hZGluZ01lc3NhZ2U6IHN0cmluZ1xyXG4gICAgICAgIGxvZ2luOiBGdW5jdGlvblxyXG4gICAgICAgIGxvZ291dDogRnVuY3Rpb25cclxuICAgICAgICBpc0NvbnRyb2xsZXJBY3RpdmU6IEZ1bmN0aW9uXHJcbiAgICAgICAgdW50YXBwZWRQb3N0QmFja1Rva2VuOiBzdHJpbmdcclxuICAgICAgICB1bnRhcHBkQXV0aGVudGljYXRpb25Vcmk6IHN0cmluZ1xyXG4gICAgICAgIGRpc2Nvbm5lY3RVbnRhcHBkVXNlcjogRnVuY3Rpb25cclxuICAgICAgICBkZWxldGVBY2NvdW50OiBGdW5jdGlvblxyXG4gICAgICAgIGdlbmVyYXRlU3RvcmFnZUtleTogRnVuY3Rpb25cclxuICAgICAgICBhcmVVcGRhdGVzQXZhaWxhYmxlOiBib29sZWFuXHJcbiAgICAgICAgdXBkYXRlQmFubmVyQ2xhc3M6IHN0cmluZ1xyXG4gICAgICAgIHVwZGF0ZUluUHJvZ3Jlc3M6IGJvb2xlYW5cclxuICAgICAgICB1cGRhdGVNZXNzYWdlOiBzdHJpbmdcclxuICAgICAgICBnZXRIdG1sRGVzY3JpcHRpb246IEZ1bmN0aW9uXHJcbiAgICAgICAgYXBwbHlVcGRhdGU6IEZ1bmN0aW9uXHJcbiAgICAgICAgdXBkYXRlQ29uZmlndXJhdGlvbjogRnVuY3Rpb25cclxuICAgICAgICB1cGRhdGVVc2VySW5mbzogRnVuY3Rpb25cclxuICAgICAgICBidXR0b25CYXJCdXR0b25zOiBCdXR0b25CYXJCdXR0b25bXVxyXG4gICAgfVxyXG59IFxyXG5cclxuIl19

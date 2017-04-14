//     Copyright (c) Microsoft Corporation.  All rights reserved.
/// <reference path="../references/index.d.ts" />
var DXLiquidIntel;
(function (DXLiquidIntel) {
    var App;
    (function (App) {
        var Model;
        (function (Model) {
            // Need to keep structure in sync with DashServer.ManagementAPI.Models.OperationState in the WebAPI
            var UserInfo = (function () {
                function UserInfo() {
                }
                return UserInfo;
            }());
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
            var UserService = (function () {
                function UserService($resource, envService) {
                    this.resourceClass = $resource(envService.read('apiUri') + '/users/:userId', null, {
                        update: { method: 'PUT' }
                    });
                }
                UserService.prototype.getUserInfo = function (userId) {
                    var _this = this;
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
                        }, null, function (errResp) {
                            // Clear out cached promise to allow retry on error
                            _this.cachedUserId = '';
                            _this.cachedUserInfo = null;
                        }).$promise;
                    }
                    return this.cachedUserInfo;
                };
                UserService.prototype.updateUserInfo = function (userId, userInfo) {
                    if (!userId) {
                        throw 'Invalid user id';
                    }
                    this.cachedUserId = '';
                    this.cachedUserInfo = null;
                    return this.resourceClass.update({
                        userId: userId
                    }, userInfo).$promise;
                };
                return UserService;
            }());
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
            var BeerInfo = (function () {
                function BeerInfo() {
                }
                return BeerInfo;
            }());
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
            var Vote = (function () {
                function Vote() {
                }
                return Vote;
            }());
            Model.Vote = Vote;
            var VoteTally = (function () {
                function VoteTally() {
                }
                return VoteTally;
            }());
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
            var VoteService = (function () {
                function VoteService($resource, envService) {
                    this.userVotesResource = $resource(envService.read('apiUri') + '/votes/:personnelNumber', null, {
                        get: { method: 'GET', isArray: true },
                        save: { method: 'PUT', isArray: true }
                    });
                    this.tallyResource = $resource(envService.read('apiUri') + '/votes_tally');
                }
                VoteService.prototype.getUserVotes = function (personnelNumber) {
                    return this.userVotesResource.get({
                        personnelNumber: personnelNumber
                    }).$promise;
                };
                VoteService.prototype.updateUserVotes = function (personnelNumber, votes) {
                    return this.userVotesResource.save({
                        personnelNumber: personnelNumber
                    }, votes).$promise;
                };
                VoteService.prototype.getVoteTally = function () {
                    return this.tallyResource.query().$promise;
                };
                return VoteService;
            }());
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
            var Activity = (function () {
                function Activity() {
                }
                return Activity;
            }());
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
            var BasicAuthResource = (function () {
                function BasicAuthResource($resource, envService, url) {
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
                BasicAuthResource.prototype.query = function (data) {
                    return this.resource.query(data).$promise;
                };
                return BasicAuthResource;
            }());
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
            var DashboardService = (function () {
                function DashboardService($resource, envService) {
                    this.activityResource = new Service.BasicAuthResource($resource, envService, envService.read('apiUri') + '/activity');
                }
                DashboardService.prototype.getLatestActivities = function (count) {
                    return this.activityResource.query({
                        count: count
                    });
                };
                return DashboardService;
            }());
            DashboardService.$inject = ['$resource', 'envService'];
            Service.DashboardService = DashboardService;
        })(Service = App.Service || (App.Service = {}));
    })(App = DXLiquidIntel.App || (DXLiquidIntel.App = {}));
})(DXLiquidIntel || (DXLiquidIntel = {}));
//     Copyright (c) Microsoft Corporation.  All rights reserved.
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
/// <reference path="../references/index.d.ts" />
var DXLiquidIntel;
(function (DXLiquidIntel) {
    var App;
    (function (App) {
        var Model;
        (function (Model) {
            var Keg = (function () {
                function Keg() {
                }
                return Keg;
            }());
            Model.Keg = Keg;
            var TapInfo = (function (_super) {
                __extends(TapInfo, _super);
                function TapInfo() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                return TapInfo;
            }(Keg));
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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
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
            var KegsService = (function () {
                function KegsService($resource, envService, adalService) {
                    this.$resource = $resource;
                    this.envService = envService;
                    this.adalService = adalService;
                    this.kegStatusResource = new Service.BasicAuthResource($resource, envService, envService.read('apiUri') + '/CurrentKeg');
                    this.kegUpdateResource = $resource(envService.read('apiUri') + '/kegs');
                }
                KegsService.prototype.getTapsStatus = function () {
                    return this.kegStatusResource.query(null);
                };
                KegsService.prototype.createNewKeg = function (keg) {
                    return this.kegUpdateResource.save(keg).$promise;
                };
                KegsService.prototype.installKegOnTap = function (tapId, kegId, kegSize) {
                    return __awaiter(this, void 0, void 0, function () {
                        var requestUri, token, installCurrentKegResource;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    requestUri = this.envService.read('apiUri') + ("/CurrentKeg/" + tapId);
                                    return [4 /*yield*/, this.adalService.acquireToken(this.adalService.getResourceForEndpoint(this.envService.read('apiUri')))];
                                case 1:
                                    token = _a.sent();
                                    installCurrentKegResource = this.$resource(requestUri, null, {
                                        save: {
                                            method: 'PUT',
                                            headers: {
                                                Authorization: 'Bearer ' + token
                                            }
                                        }
                                    });
                                    return [2 /*return*/, installCurrentKegResource.save(null, {
                                            KegId: kegId,
                                            KegSize: kegSize
                                        }).$promise];
                            }
                        });
                    });
                };
                return KegsService;
            }());
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
            var AuthorizedGroups = (function () {
                function AuthorizedGroups() {
                }
                return AuthorizedGroups;
            }());
            Model.AuthorizedGroups = AuthorizedGroups;
            var GroupResult = (function () {
                function GroupResult() {
                }
                return GroupResult;
            }());
            Model.GroupResult = GroupResult;
            var GroupSearchResults = (function () {
                function GroupSearchResults() {
                }
                return GroupSearchResults;
            }());
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
            var AdminService = (function () {
                function AdminService($resource, envService) {
                    this.adminResource = $resource(envService.read('apiUri') + '/admin/:action', null, {
                        update: { method: 'PUT' }
                    });
                }
                AdminService.prototype.getAuthorizedGroups = function () {
                    return this.adminResource.get({
                        action: 'AuthorizedGroups'
                    }).$promise;
                };
                AdminService.prototype.updateAuthorizedGroups = function (groups) {
                    return this.adminResource.update({
                        action: 'AuthorizedGroups'
                    }, groups).$promise;
                };
                AdminService.prototype.searchGroups = function (searchTerm) {
                    return this.adminResource.get({
                        action: 'AuthorizedGroups',
                        search: searchTerm
                    }).$promise;
                };
                return AdminService;
            }());
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
            var Configuration = (function () {
                function Configuration() {
                }
                return Configuration;
            }());
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
            var ConfigService = (function () {
                function ConfigService($resource, envService) {
                    this.resourceClass = $resource(envService.read('apiUri') + '/appConfiguration');
                }
                ConfigService.prototype.getConfiguration = function () {
                    if (!this.configuration) {
                        this.configuration = this.resourceClass.get().$promise;
                    }
                    return this.configuration;
                };
                return ConfigService;
            }());
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
            var UntappdApiService = (function () {
                function UntappdApiService($resource, envService, configService) {
                    this.envService = envService;
                    this.configService = configService;
                    this.resourceClass = $resource('https://api.untappd.com/v4/:entity/:methodName');
                }
                UntappdApiService.prototype.getUntappdAuthUri = function (redirectUri) {
                    return __awaiter(this, void 0, void 0, function () {
                        var appConfig;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, this.configService.getConfiguration()];
                                case 1:
                                    appConfig = _a.sent();
                                    return [2 /*return*/, "https://untappd.com/oauth/authenticate/?client_id=" + appConfig.UntappdClientId + "&response_type=token&redirect_url=" + redirectUri];
                            }
                        });
                    });
                };
                UntappdApiService.prototype.getUserInfo = function (accessToken) {
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
                };
                UntappdApiService.prototype.searchBeers = function (searchTerm, accessToken) {
                    return __awaiter(this, void 0, void 0, function () {
                        var appConfig, data, results;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, this.configService.getConfiguration()];
                                case 1:
                                    appConfig = _a.sent();
                                    data = {
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
                                    return [4 /*yield*/, this.resourceClass.get(data).$promise];
                                case 2:
                                    results = _a.sent();
                                    return [2 /*return*/, results.response.beers.items.map(function (beer) {
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
                                        })];
                            }
                        });
                    });
                };
                return UntappdApiService;
            }());
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
            var ControllerBase = (function () {
                function ControllerBase($scope, $rootScope, adalAuthenticationService, $location, userService, continueAfterUserLoad) {
                    var _this = this;
                    this.$scope = $scope;
                    this.$rootScope = $rootScope;
                    this.adalAuthenticationService = adalAuthenticationService;
                    this.$location = $location;
                    this.userService = userService;
                    $rootScope.login = function () { return _this.login(); };
                    $rootScope.logout = function () { return _this.logout(); };
                    $rootScope.isControllerActive = function (location) { return _this.isActive(location); };
                    $rootScope.isAdmin = function () {
                        return $scope.systemUserInfo ? $scope.systemUserInfo.IsAdmin : false;
                    };
                    $rootScope.buttonBarButtons = [];
                    $scope.$on('$routeChangeSuccess', function (event, current, previous) { return _this.setTitleForRoute(current.$$route); });
                    $scope.loadingMessage = "";
                    $scope.error = "";
                    // When the user logs in, we need to check with the api if they're an admin or not
                    this.setUpdateState(true);
                    this.$scope.loadingMessage = "Retrieving user information...";
                    this.$scope.error = "";
                    userService.getUserInfo($scope.userInfo.userName)
                        .then(function (userInfo) {
                        $scope.systemUserInfo = userInfo;
                        continueAfterUserLoad();
                    }, function (reason) {
                        $scope.systemUserInfo = null;
                        continueAfterUserLoad();
                    });
                }
                ControllerBase.prototype.login = function () {
                    this.adalAuthenticationService.login();
                };
                ControllerBase.prototype.loginWithMfa = function () {
                    this.adalAuthenticationService.login({ amr_values: 'mfa' });
                };
                ControllerBase.prototype.logout = function () {
                    this.adalAuthenticationService.logOut();
                };
                ControllerBase.prototype.isActive = function (viewLocation) {
                    return viewLocation === this.$location.path();
                };
                ControllerBase.prototype.setTitleForRoute = function (route) {
                    this.$rootScope.title = "DX Liquid Intelligence - " + route.name;
                };
                ControllerBase.prototype.setError = function (error, message, responseHeaders) {
                    var acquireMfaResource = "";
                    if (responseHeaders != null) {
                        // If we received a 401 error with WWW-Authenticate response headers, we may need to 
                        // re-authenticate to satisfy 2FA requirements for underlying services used by the WebAPI
                        // (eg. RDFE). In that case, we need to explicitly specify the name of the resource we
                        // want 2FA authentication to.
                        var wwwAuth = responseHeaders("www-authenticate");
                        if (wwwAuth) {
                            // Handle the multiple www-authenticate headers case
                            angular.forEach(wwwAuth.split(","), function (authScheme, index) {
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
                        message = $.map(["Message", "ExceptionMessage", "ExceptionType"], function (attributeName) { return message[attributeName]; })
                            .join(" - ");
                    }
                    this.$scope.error_class = error ? "alert-danger" : "alert-info";
                    this.$scope.error = message;
                    this.$scope.loadingMessage = "";
                };
                ControllerBase.prototype.setUpdateState = function (updateInProgress) {
                    this.$scope.updateInProgress = updateInProgress;
                };
                return ControllerBase;
            }());
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
            var UserController = (function (_super) {
                __extends(UserController, _super);
                function UserController($scope, $rootScope, adalAuthenticationService, $location, $window, $route, userService, untappdService) {
                    var _this = _super.call(this, $scope, $rootScope, adalAuthenticationService, $location, userService, function () { return __awaiter(_this, void 0, void 0, function () {
                        var _this = this;
                        var _a;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    this.setTitleForRoute($route.current);
                                    $scope.buttonBarButtons = [
                                        new App.Model.ButtonBarButton("Commit", $scope, "userForm.$valid && userForm.$dirty && !updateInProgress", function () { return _this.update(); }, true),
                                        new App.Model.ButtonBarButton("Revert", $scope, "!updateInProgress", function () { return _this.populate(); }, false)
                                    ];
                                    _a = $scope;
                                    return [4 /*yield*/, untappdService.getUntappdAuthUri($window.location.origin)];
                                case 1:
                                    _a.untappdAuthenticationUri = _b.sent();
                                    $scope.disconnectUntappdUser = function () { return _this.disconnectUser(); };
                                    $scope.updateUserInfo = function () { return _this.update(); };
                                    this.populate();
                                    return [2 /*return*/];
                            }
                        });
                    }); }) || this;
                    _this.untappdService = untappdService;
                    return _this;
                }
                UserController.prototype.populate = function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var userInfo, untappdUserResponse, untappdUserInfo, ex_1;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 5, , 6]);
                                    this.setUpdateState(true);
                                    this.$scope.loadingMessage = "Retrieving user information...";
                                    this.$scope.error = "";
                                    return [4 /*yield*/, this.userService.getUserInfo(this.$scope.userInfo.userName)];
                                case 1:
                                    userInfo = _a.sent();
                                    this.$scope.systemUserInfo = userInfo;
                                    if (!this.$rootScope.untappedPostBackToken) return [3 /*break*/, 4];
                                    this.$scope.systemUserInfo.UntappdAccessToken = this.$rootScope.untappedPostBackToken;
                                    this.$rootScope.untappedPostBackToken = '';
                                    return [4 /*yield*/, this.untappdService.getUserInfo(this.$scope.systemUserInfo.UntappdAccessToken)];
                                case 2:
                                    untappdUserResponse = _a.sent();
                                    untappdUserInfo = untappdUserResponse.response.user;
                                    this.$scope.systemUserInfo.UntappdUserName = untappdUserInfo.user_name;
                                    // If Untappd has a user image, force this to be our image
                                    if (untappdUserInfo.user_avatar) {
                                        this.$scope.systemUserInfo.ThumbnailImageUri = untappdUserInfo.user_avatar;
                                    }
                                    return [4 /*yield*/, this.update()];
                                case 3:
                                    _a.sent();
                                    _a.label = 4;
                                case 4:
                                    this.setUpdateState(false);
                                    this.$scope.loadingMessage = "";
                                    this.$scope.userForm.$setPristine();
                                    return [3 /*break*/, 6];
                                case 5:
                                    ex_1 = _a.sent();
                                    this.setError(true, ex_1.data || ex_1.statusText, ex_1.headers);
                                    return [3 /*break*/, 6];
                                case 6: return [2 /*return*/];
                            }
                        });
                    });
                };
                UserController.prototype.update = function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var userInfo, ex_2;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    this.$scope.loadingMessage = "Saving user information...";
                                    this.setUpdateState(true);
                                    return [4 /*yield*/, this.userService.updateUserInfo(this.$scope.userInfo.userName, this.$scope.systemUserInfo)];
                                case 1:
                                    userInfo = _a.sent();
                                    this.$scope.systemUserInfo = userInfo;
                                    this.setUpdateState(false);
                                    this.$scope.loadingMessage = "";
                                    this.$scope.userForm.$setPristine();
                                    return [3 /*break*/, 3];
                                case 2:
                                    ex_2 = _a.sent();
                                    this.setError(true, ex_2.data || ex_2.statusText, ex_2.headers);
                                    this.setUpdateState(false);
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    });
                };
                UserController.prototype.disconnectUser = function () {
                    this.$scope.systemUserInfo.UntappdUserName = '';
                    this.$scope.systemUserInfo.UntappdAccessToken = '';
                    this.$scope.systemUserInfo.ThumbnailImageUri = '';
                    this.update();
                };
                return UserController;
            }(Controller.ControllerBase));
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
            var VoteBeerController = (function (_super) {
                __extends(VoteBeerController, _super);
                function VoteBeerController($scope, $rootScope, adalAuthenticationService, $location, $route, userService, untappdService, voteService) {
                    var _this = _super.call(this, $scope, $rootScope, adalAuthenticationService, $location, userService, function () {
                        _this.setTitleForRoute($route.current);
                        $scope.buttonBarButtons = [
                            new App.Model.ButtonBarButton("Commit", $scope, "voteForm.$valid && voteForm.$dirty && !updateInProgress", function () { return _this.update(); }, true),
                            new App.Model.ButtonBarButton("Revert", $scope, "!updateInProgress", function () { return _this.populate(); }, false)
                        ];
                        $scope.searchBeers = function (searchTerm) { return _this.searchBeers(searchTerm); };
                        $scope.updateVotes = function () { return _this.update(); };
                        $scope.clearVote = function (vote) { return _this.resetVote(vote); };
                        _this.populate();
                    }) || this;
                    _this.untappdService = untappdService;
                    _this.voteService = voteService;
                    return _this;
                }
                VoteBeerController.prototype.searchBeers = function (searchTerm) {
                    return __awaiter(this, void 0, void 0, function () {
                        var ex_3;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, this.untappdService.searchBeers(searchTerm, this.$scope.systemUserInfo.UntappdAccessToken)];
                                case 1: return [2 /*return*/, _a.sent()];
                                case 2:
                                    ex_3 = _a.sent();
                                    return [2 /*return*/, null];
                                case 3: return [2 /*return*/];
                            }
                        });
                    });
                };
                VoteBeerController.prototype.normalizeVotesArray = function (sourceVotes) {
                    while (sourceVotes.length < 2) {
                        sourceVotes.push({
                            VoteId: 0,
                            PersonnelNumber: this.$scope.systemUserInfo.PersonnelNumber,
                            VoteDate: new Date(),
                            UntappdId: 0
                        });
                    }
                    sourceVotes.forEach(function (vote) {
                        vote.BeerInfo = {
                            untappdId: vote.UntappdId,
                            name: vote.BeerName,
                            brewery: vote.Brewery
                        };
                    });
                    return sourceVotes;
                };
                VoteBeerController.prototype.populate = function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var _a, _b, _c, ex_4;
                        return __generator(this, function (_d) {
                            switch (_d.label) {
                                case 0:
                                    _d.trys.push([0, 2, , 3]);
                                    this.setUpdateState(true);
                                    this.$scope.loadingMessage = "Retrieving previous votes...";
                                    this.$scope.error = "";
                                    _a = this.$scope;
                                    _b = this.normalizeVotesArray;
                                    return [4 /*yield*/, this.voteService.getUserVotes(this.$scope.systemUserInfo.PersonnelNumber)];
                                case 1:
                                    _a.votes = _b.apply(this, [_d.sent()]);
                                    this.setUpdateState(false);
                                    this.$scope.loadingMessage = "";
                                    return [3 /*break*/, 3];
                                case 2:
                                    ex_4 = _d.sent();
                                    this.setError(true, ex_4.data || ex_4.statusText, ex_4.headers);
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    });
                };
                VoteBeerController.prototype.resetVote = function (vote) {
                    // Don't reset the vote id as we need to detect if this is a delete
                    vote.PersonnelNumber = this.$scope.systemUserInfo.PersonnelNumber;
                    vote.VoteDate = new Date();
                    vote.UntappdId = 0;
                    vote.BeerName = '';
                    vote.Brewery = '';
                    vote.BeerInfo = null;
                    this.$scope.voteForm.$setDirty();
                };
                VoteBeerController.prototype.update = function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var _a, _b, _c, ex_5;
                        return __generator(this, function (_d) {
                            switch (_d.label) {
                                case 0:
                                    _d.trys.push([0, 2, , 3]);
                                    this.$scope.loadingMessage = "Saving votes...";
                                    this.setUpdateState(true);
                                    this.$scope.votes.forEach(function (vote) {
                                        if (vote.BeerInfo) {
                                            vote.UntappdId = vote.BeerInfo.untappdId;
                                            vote.BeerName = vote.BeerInfo.name;
                                            vote.Brewery = vote.BeerInfo.brewery;
                                        }
                                    });
                                    _a = this.$scope;
                                    _b = this.normalizeVotesArray;
                                    return [4 /*yield*/, this.voteService.updateUserVotes(this.$scope.systemUserInfo.PersonnelNumber, this.$scope.votes)];
                                case 1:
                                    _a.votes = _b.apply(this, [_d.sent()]);
                                    this.$scope.voteForm.$setPristine();
                                    this.setUpdateState(false);
                                    this.$scope.error = "";
                                    this.$scope.loadingMessage = "";
                                    return [3 /*break*/, 3];
                                case 2:
                                    ex_5 = _d.sent();
                                    this.setError(true, ex_5.data || ex_5.statusText, ex_5.headers);
                                    this.setUpdateState(false);
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    });
                };
                return VoteBeerController;
            }(Controller.ControllerBase));
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
            var VoteResultsController = (function (_super) {
                __extends(VoteResultsController, _super);
                function VoteResultsController($scope, $rootScope, adalAuthenticationService, $location, $route, userService, untappdService, voteService) {
                    var _this = _super.call(this, $scope, $rootScope, adalAuthenticationService, $location, userService, function () {
                        _this.setTitleForRoute($route.current);
                        $scope.buttonBarButtons = [];
                        _this.populate();
                    }) || this;
                    _this.untappdService = untappdService;
                    _this.voteService = voteService;
                    return _this;
                }
                VoteResultsController.prototype.populate = function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var votesTally, ex_6;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    this.setUpdateState(true);
                                    this.$scope.loadingMessage = "Retrieving current vote tallies...";
                                    this.$scope.error = "";
                                    return [4 /*yield*/, this.voteService.getVoteTally()];
                                case 1:
                                    votesTally = _a.sent();
                                    this.$scope.votesTally = votesTally;
                                    this.$scope.loadingMessage = "";
                                    return [3 /*break*/, 3];
                                case 2:
                                    ex_6 = _a.sent();
                                    this.setError(true, ex_6.data || ex_6.statusText, ex_6.headers);
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    });
                };
                return VoteResultsController;
            }(Controller.ControllerBase));
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
            var AnalyticsController = (function (_super) {
                __extends(AnalyticsController, _super);
                function AnalyticsController($scope, $rootScope, adalAuthenticationService, $location, $route, userService) {
                    var _this = _super.call(this, $scope, $rootScope, adalAuthenticationService, $location, userService, function () {
                        _this.setTitleForRoute($route.current);
                        $scope.buttonBarButtons = [];
                        _this.populate();
                    }) || this;
                    return _this;
                }
                AnalyticsController.prototype.populate = function () {
                    return __awaiter(this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            try {
                                this.setUpdateState(true);
                                this.$scope.loadingMessage = "Retrieving beer analytics...";
                                this.$scope.error = "";
                                this.$scope.loadingMessage = "";
                            }
                            catch (ex) {
                                this.setError(true, ex.data || ex.statusText, ex.headers);
                            }
                            return [2 /*return*/];
                        });
                    });
                };
                return AnalyticsController;
            }(Controller.ControllerBase));
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
            var HomeController = (function (_super) {
                __extends(HomeController, _super);
                function HomeController($scope, $rootScope, adalAuthenticationService, $location, $route, userService, dashboardService, kegsService, $interval) {
                    var _this = _super.call(this, $scope, $rootScope, adalAuthenticationService, $location, userService, function () {
                        _this.setTitleForRoute($route.current);
                        _this.populate();
                        var intervalPromise = $interval(function () { return _this.populate(); }, 5000);
                        $scope.$on('$destroy', function () { return $interval.cancel(intervalPromise); });
                    }) || this;
                    _this.dashboardService = dashboardService;
                    _this.kegsService = kegsService;
                    return _this;
                }
                HomeController.prototype.populate = function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var _a, _b;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    _a = this.$scope;
                                    return [4 /*yield*/, this.kegsService.getTapsStatus()];
                                case 1:
                                    _a.currentTaps = _c.sent();
                                    _b = this.$scope;
                                    return [4 /*yield*/, this.dashboardService.getLatestActivities(25)];
                                case 2:
                                    _b.currentActivities = _c.sent();
                                    return [2 /*return*/];
                            }
                        });
                    });
                };
                return HomeController;
            }(Controller.ControllerBase));
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
            var AuthorizedGroupsController = (function (_super) {
                __extends(AuthorizedGroupsController, _super);
                function AuthorizedGroupsController($scope, $rootScope, adalAuthenticationService, $location, $route, userService, adminService) {
                    var _this = _super.call(this, $scope, $rootScope, adalAuthenticationService, $location, userService, function () {
                        _this.setTitleForRoute($route.current);
                        $scope.buttonBarButtons = [
                            new App.Model.ButtonBarButton("Commit", $scope, "authorizedGroupsForm.$valid && authorizedGroupsForm.$dirty && !updateInProgress", function () { return _this.update(); }, true),
                            new App.Model.ButtonBarButton("Revert", $scope, "!updateInProgress", function () { return _this.populate(); }, false)
                        ];
                        $scope.addGroup = function () {
                            if (_this.$scope.newGroup) {
                                _this.$scope.authorizedGroups.AuthorizedGroups.push(_this.$scope.newGroup.displayName);
                            }
                            _this.$scope.newGroup = null;
                        };
                        $scope.deleteGroup = function (group) {
                            _this.$scope.authorizedGroups.AuthorizedGroups.splice(_this.$scope.authorizedGroups.AuthorizedGroups.indexOf(group), 1);
                            _this.$scope.authorizedGroupsForm.$setDirty();
                        };
                        $scope.searchGroups = function (searchTerm) { return _this.searchGroups(searchTerm); };
                        $scope.updateAuthorizedGroups = function () { return _this.update(); };
                        _this.populate();
                    }) || this;
                    _this.adminService = adminService;
                    return _this;
                }
                AuthorizedGroupsController.prototype.searchGroups = function (searchTerm) {
                    return __awaiter(this, void 0, void 0, function () {
                        var results;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, this.adminService.searchGroups(searchTerm)];
                                case 1:
                                    results = _a.sent();
                                    return [2 /*return*/, results.results];
                            }
                        });
                    });
                };
                AuthorizedGroupsController.prototype.populate = function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var _a, ex_7;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    _b.trys.push([0, 2, , 3]);
                                    this.setUpdateState(true);
                                    this.$scope.loadingMessage = "Retrieving authorized groups...";
                                    this.$scope.error = "";
                                    _a = this.$scope;
                                    return [4 /*yield*/, this.adminService.getAuthorizedGroups()];
                                case 1:
                                    _a.authorizedGroups = _b.sent();
                                    this.setUpdateState(false);
                                    this.$scope.loadingMessage = "";
                                    return [3 /*break*/, 3];
                                case 2:
                                    ex_7 = _b.sent();
                                    this.setError(true, ex_7.data || ex_7.statusText, ex_7.headers);
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    });
                };
                AuthorizedGroupsController.prototype.update = function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var ex_8;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    this.$scope.loadingMessage = "Saving authorized groups...";
                                    this.setUpdateState(true);
                                    return [4 /*yield*/, this.adminService.updateAuthorizedGroups(this.$scope.authorizedGroups)];
                                case 1:
                                    _a.sent();
                                    this.$scope.authorizedGroupsForm.$setPristine();
                                    this.setUpdateState(false);
                                    this.$scope.error = "";
                                    this.$scope.loadingMessage = "";
                                    return [3 /*break*/, 3];
                                case 2:
                                    ex_8 = _a.sent();
                                    this.setError(true, ex_8.data || ex_8.statusText, ex_8.headers);
                                    this.setUpdateState(false);
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    });
                };
                return AuthorizedGroupsController;
            }(Controller.ControllerBase));
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
            var InstallKegsController = (function (_super) {
                __extends(InstallKegsController, _super);
                function InstallKegsController($scope, $rootScope, adalAuthenticationService, $location, $route, userService, kegsService, untappdService) {
                    var _this = _super.call(this, $scope, $rootScope, adalAuthenticationService, $location, userService, function () {
                        _this.setTitleForRoute($route.current);
                        $scope.buttonBarButtons = [
                            new App.Model.ButtonBarButton("Commit", $scope, "installKegsForm.$valid && installKegsForm.$dirty && !updateInProgress", function () { return _this.update(); }, true),
                            new App.Model.ButtonBarButton("Revert", $scope, "!updateInProgress", function () { return _this.populate(); }, false)
                        ];
                        $scope.searchBeers = function (searchTerm) { return _this.searchBeers(searchTerm); };
                        $scope.updateInstallKegs = function () { return _this.update(); };
                        _this.populate();
                    }) || this;
                    _this.kegsService = kegsService;
                    _this.untappdService = untappdService;
                    return _this;
                }
                InstallKegsController.prototype.searchBeers = function (searchTerm) {
                    return __awaiter(this, void 0, void 0, function () {
                        var ex_9;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, this.untappdService.searchBeers(searchTerm, this.$scope.systemUserInfo.UntappdAccessToken)];
                                case 1: return [2 /*return*/, _a.sent()];
                                case 2:
                                    ex_9 = _a.sent();
                                    return [2 /*return*/, null];
                                case 3: return [2 /*return*/];
                            }
                        });
                    });
                };
                InstallKegsController.prototype.populate = function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var _a, _b, _c, ex_10;
                        return __generator(this, function (_d) {
                            switch (_d.label) {
                                case 0:
                                    _d.trys.push([0, 2, , 3]);
                                    this.setUpdateState(true);
                                    this.$scope.loadingMessage = "Retrieving current tap information...";
                                    this.$scope.error = "";
                                    _a = this.$scope;
                                    _b = this.normalizeTapInfo;
                                    return [4 /*yield*/, this.kegsService.getTapsStatus()];
                                case 1:
                                    _a.currentTaps = _b.apply(this, [_d.sent(), true]);
                                    this.setUpdateState(false);
                                    this.$scope.loadingMessage = "";
                                    return [3 /*break*/, 3];
                                case 2:
                                    ex_10 = _d.sent();
                                    this.setError(true, ex_10.data || ex_10.statusText, ex_10.headers);
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    });
                };
                InstallKegsController.prototype.update = function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var _this = this;
                        var _a, _b, _c, ex_11;
                        return __generator(this, function (_d) {
                            switch (_d.label) {
                                case 0:
                                    _d.trys.push([0, 2, , 3]);
                                    this.$scope.loadingMessage = "Installing new kegs...";
                                    this.setUpdateState(true);
                                    _a = this.$scope;
                                    _b = this.normalizeTapInfo;
                                    return [4 /*yield*/, Promise.all(this.$scope.currentTaps.map(function (tapInfo) { return __awaiter(_this, void 0, void 0, function () {
                                            var newKeg;
                                            return __generator(this, function (_a) {
                                                switch (_a.label) {
                                                    case 0:
                                                        if (!(tapInfo.OriginalUntappdId !== tapInfo.BeerInfo.untappdId)) return [3 /*break*/, 3];
                                                        tapInfo.UntappdId = tapInfo.BeerInfo.untappdId;
                                                        tapInfo.Name = tapInfo.BeerInfo.name;
                                                        tapInfo.BeerType = tapInfo.BeerInfo.beer_type;
                                                        tapInfo.IBU = tapInfo.BeerInfo.ibu;
                                                        tapInfo.ABV = tapInfo.BeerInfo.abv;
                                                        tapInfo.BeerDescription = tapInfo.BeerInfo.description;
                                                        tapInfo.Brewery = tapInfo.BeerInfo.brewery;
                                                        tapInfo.imagePath = tapInfo.BeerInfo.image;
                                                        tapInfo.CurrentVolume = tapInfo.KegSize;
                                                        return [4 /*yield*/, this.kegsService.createNewKeg(tapInfo)];
                                                    case 1:
                                                        newKeg = _a.sent();
                                                        return [4 /*yield*/, this.kegsService.installKegOnTap(tapInfo.TapId, newKeg.KegId, tapInfo.KegSize)];
                                                    case 2:
                                                        _a.sent();
                                                        tapInfo.KegId = newKeg.KegId;
                                                        _a.label = 3;
                                                    case 3: return [2 /*return*/, tapInfo];
                                                }
                                            });
                                        }); }))];
                                case 1:
                                    _a.currentTaps = _b.apply(this, [_d.sent(), true]);
                                    this.$scope.installKegsForm.$setPristine();
                                    this.setUpdateState(false);
                                    this.$scope.error = "";
                                    this.$scope.loadingMessage = "";
                                    return [3 /*break*/, 3];
                                case 2:
                                    ex_11 = _d.sent();
                                    this.setError(true, ex_11.data || ex_11.statusText, ex_11.headers);
                                    this.setUpdateState(false);
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    });
                };
                InstallKegsController.prototype.normalizeTapInfo = function (currentTaps, includeEmptyTaps) {
                    var _this = this;
                    if (includeEmptyTaps && currentTaps.length < 2) {
                        // If we don't currently have a keg installed on either tap, then create an empty object
                        if (!currentTaps[0] || currentTaps[0].TapId != 1) {
                            currentTaps.unshift(this.createEmptyTap(1));
                        }
                        if (!currentTaps[1] || currentTaps[1].TapId != 2) {
                            currentTaps.push(this.createEmptyTap(2));
                        }
                    }
                    return currentTaps.map(function (tapInfo) {
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
                        tapInfo.getSetBeerInfo = function (beerInfo) { return _this.getSetBeerInfo(tapInfo, beerInfo); };
                        return tapInfo;
                    });
                };
                InstallKegsController.prototype.getSetBeerInfo = function (tapInfo, beerInfo) {
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
                };
                InstallKegsController.prototype.createEmptyTap = function (tapId) {
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
                };
                return InstallKegsController;
            }(Controller.ControllerBase));
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
        var AppBuilder = (function () {
            function AppBuilder(name) {
                var _this = this;
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
                    function ($routeProvider, $httpProvider, adalProvider, envServiceProvider) {
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
                this.app.service('kegsService', App.Service.KegsService);
                this.app.service('adminService', App.Service.AdminService);
                this.app.run(['$window', '$q', '$location', '$route', '$rootScope', function ($window, $q, $location, $route, $rootScope) {
                        // Make angular's promises the default as that will still integrate with angular's digest cycle after awaits
                        $window.Promise = $q;
                        $rootScope.$on('$locationChangeStart', function (event, newUrl, oldUrl) { return _this.locationChangeHandler($rootScope, $location); });
                    }]);
            }
            AppBuilder.prototype.locationChangeHandler = function ($rootScope, $location) {
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
            };
            AppBuilder.prototype.start = function () {
                var _this = this;
                $(document).ready(function () {
                    try {
                        console.log("booting " + _this.app.name);
                        var injector = angular.bootstrap(document, [_this.app.name]);
                        console.log("booted app: " + injector);
                    }
                    catch (ex) {
                        $('#BootExceptionDetails').text(ex);
                        $('#AngularBootError').show();
                    }
                });
            };
            return AppBuilder;
        }());
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
            var ButtonBarButton = (function () {
                function ButtonBarButton(displayText, $scope, enabledExpression, doClick, isSubmit, imageUrl) {
                    var _this = this;
                    this.displayText = displayText;
                    this.doClick = doClick;
                    this.isSubmit = isSubmit;
                    this.imageUrl = imageUrl;
                    this.enabled = false;
                    $scope.$watch(enabledExpression, function (newValue) { return _this.enabled = newValue; });
                }
                return ButtonBarButton;
            }());
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIk1vZGVsL1VzZXJJbmZvLnRzIiwiU2VydmljZS9Vc2VyU2VydmljZS50cyIsIk1vZGVsL0JlZXJJbmZvLnRzIiwiTW9kZWwvVm90ZS50cyIsIlNlcnZpY2UvVm90ZVNlcnZpY2UudHMiLCJNb2RlbC9BY3Rpdml0eS50cyIsIlNlcnZpY2UvQmFzaWNBdXRoUmVzb3VyY2UudHMiLCJTZXJ2aWNlL0Rhc2hib2FyZFNlcnZpY2UudHMiLCJNb2RlbC9UYXBJbmZvLnRzIiwiU2VydmljZS9LZWdzU2VydmljZS50cyIsIk1vZGVsL0FkbWluLnRzIiwiU2VydmljZS9BZG1pblNlcnZpY2UudHMiLCJNb2RlbC9Db25maWd1cmF0aW9uLnRzIiwiU2VydmljZS9Db25maWdTZXJ2aWNlLnRzIiwiU2VydmljZS9VbnRhcHBkQXBpU2VydmljZS50cyIsIkNvbnRyb2xsZXIvQ29udHJvbGxlckJhc2UudHMiLCJDb250cm9sbGVyL1VzZXJDb250cm9sbGVyLnRzIiwiQ29udHJvbGxlci9Wb3RlQmVlckNvbnRyb2xsZXIudHMiLCJDb250cm9sbGVyL1ZvdGVSZXN1bHRzQ29udHJvbGxlci50cyIsIkNvbnRyb2xsZXIvQW5hbHl0aWNzQ29udHJvbGxlci50cyIsIkNvbnRyb2xsZXIvSG9tZUNvbnRyb2xsZXIudHMiLCJDb250cm9sbGVyL0F1dGhvcml6ZWRHcm91cHNDb250cm9sbGVyLnRzIiwiQ29udHJvbGxlci9JbnN0YWxsS2Vnc0NvbnRyb2xsZXIudHMiLCJBcHBCdWlsZGVyLnRzIiwic3RhcnQudHMiLCJNb2RlbC9BcHBTdGF0ZS50cyIsIk1vZGVsL1Njb3BlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLGlFQUFpRTtBQUVqRSxpREFBaUQ7QUFFakQsSUFBTyxhQUFhLENBaUJuQjtBQWpCRCxXQUFPLGFBQWE7SUFBQyxJQUFBLEdBQUcsQ0FpQnZCO0lBakJvQixXQUFBLEdBQUc7UUFBQyxJQUFBLEtBQUssQ0FpQjdCO1FBakJ3QixXQUFBLEtBQUs7WUFFMUIs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anMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyAgICAgQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uICBBbGwgcmlnaHRzIHJlc2VydmVkLlxyXG5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL3JlZmVyZW5jZXMvaW5kZXguZC50c1wiIC8+XHJcblxyXG5tb2R1bGUgRFhMaXF1aWRJbnRlbC5BcHAuTW9kZWwge1xyXG5cclxuICAgIC8vIE5lZWQgdG8ga2VlcCBzdHJ1Y3R1cmUgaW4gc3luYyB3aXRoIERhc2hTZXJ2ZXIuTWFuYWdlbWVudEFQSS5Nb2RlbHMuT3BlcmF0aW9uU3RhdGUgaW4gdGhlIFdlYkFQSVxyXG4gICAgZXhwb3J0IGNsYXNzIFVzZXJJbmZvIHtcclxuICAgICAgICBwdWJsaWMgUGVyc29ubmVsTnVtYmVyOiBudW1iZXJcclxuICAgICAgICBwdWJsaWMgVXNlclByaW5jaXBhbE5hbWU6IHN0cmluZ1xyXG4gICAgICAgIHB1YmxpYyBVbnRhcHBkVXNlck5hbWU6IHN0cmluZ1xyXG4gICAgICAgIHB1YmxpYyBVbnRhcHBkQWNjZXNzVG9rZW46IHN0cmluZ1xyXG4gICAgICAgIHB1YmxpYyBDaGVja2luRmFjZWJvb2s6IGJvb2xlYW5cclxuICAgICAgICBwdWJsaWMgQ2hlY2tpblR3aXR0ZXI6IGJvb2xlYW5cclxuICAgICAgICBwdWJsaWMgQ2hlY2tpbkZvdXJzcXVhcmU6IGJvb2xlYW5cclxuICAgICAgICBwdWJsaWMgRnVsbE5hbWU6IHN0cmluZ1xyXG4gICAgICAgIHB1YmxpYyBGaXJzdE5hbWU6IHN0cmluZ1xyXG4gICAgICAgIHB1YmxpYyBMYXN0TmFtZTogc3RyaW5nXHJcbiAgICAgICAgcHVibGljIElzQWRtaW46IGJvb2xlYW5cclxuICAgICAgICBwdWJsaWMgVGh1bWJuYWlsSW1hZ2VVcmk6IHN0cmluZ1xyXG4gICAgfVxyXG59XHJcbiAgICAgICAgICIsIi8vICAgICBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gIEFsbCByaWdodHMgcmVzZXJ2ZWQuXHJcblxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vcmVmZXJlbmNlcy9pbmRleC5kLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL01vZGVsL1VzZXJJbmZvLnRzXCIgLz5cclxuXHJcbm1vZHVsZSBEWExpcXVpZEludGVsLkFwcC5TZXJ2aWNlIHtcclxuXHJcbiAgICBleHBvcnQgY2xhc3MgVXNlclNlcnZpY2Uge1xyXG4gICAgICAgIHN0YXRpYyAkaW5qZWN0ID0gWyckcmVzb3VyY2UnLCAnZW52U2VydmljZSddO1xyXG5cclxuICAgICAgICBwcml2YXRlIHJlc291cmNlQ2xhc3M6IG5nLnJlc291cmNlLklSZXNvdXJjZUNsYXNzPG5nLnJlc291cmNlLklSZXNvdXJjZTxNb2RlbC5Vc2VySW5mbz4+O1xyXG4gICAgICAgIHByaXZhdGUgY2FjaGVkVXNlcklkOiBzdHJpbmc7XHJcbiAgICAgICAgcHJpdmF0ZSBjYWNoZWRVc2VySW5mbzogUHJvbWlzZUxpa2U8TW9kZWwuVXNlckluZm8+O1xyXG5cclxuICAgICAgICBjb25zdHJ1Y3RvcigkcmVzb3VyY2U6IG5nLnJlc291cmNlLklSZXNvdXJjZVNlcnZpY2UsIGVudlNlcnZpY2U6IGFuZ3VsYXIuZW52aXJvbm1lbnQuU2VydmljZSkge1xyXG5cclxuICAgICAgICAgICAgdGhpcy5yZXNvdXJjZUNsYXNzID0gPG5nLnJlc291cmNlLklSZXNvdXJjZUNsYXNzPG5nLnJlc291cmNlLklSZXNvdXJjZTxNb2RlbC5Vc2VySW5mbz4+PiRyZXNvdXJjZShlbnZTZXJ2aWNlLnJlYWQoJ2FwaVVyaScpICsgJy91c2Vycy86dXNlcklkJyxcclxuICAgICAgICAgICAgICAgIG51bGwsXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdXBkYXRlOiB7IG1ldGhvZDogJ1BVVCcgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgZ2V0VXNlckluZm8odXNlcklkOiBzdHJpbmcpOiBQcm9taXNlTGlrZTxNb2RlbC5Vc2VySW5mbz4ge1xyXG4gICAgICAgICAgICBpZiAodXNlcklkID09IHRoaXMuY2FjaGVkVXNlcklkICYmIHRoaXMuY2FjaGVkVXNlckluZm8gIT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2FjaGVkVXNlckluZm87XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5jYWNoZWRVc2VySWQgPSB1c2VySWQ7XHJcbiAgICAgICAgICAgIGlmICghdXNlcklkKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNhY2hlZFVzZXJJbmZvID0gUHJvbWlzZS5yZXNvbHZlPE1vZGVsLlVzZXJJbmZvPihudWxsKTsgICAgXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNhY2hlZFVzZXJJbmZvID0gdGhpcy5yZXNvdXJjZUNsYXNzLmdldCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVzZXJJZDogdXNlcklkXHJcbiAgICAgICAgICAgICAgICAgICAgfSwgXHJcbiAgICAgICAgICAgICAgICAgICAgbnVsbCwgXHJcbiAgICAgICAgICAgICAgICAgICAgKGVyclJlc3A6IG5nLklIdHRwUHJvbWlzZTxNb2RlbC5Vc2VySW5mbz4pID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gQ2xlYXIgb3V0IGNhY2hlZCBwcm9taXNlIHRvIGFsbG93IHJldHJ5IG9uIGVycm9yXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY2FjaGVkVXNlcklkID0gJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY2FjaGVkVXNlckluZm8gPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pLiRwcm9taXNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNhY2hlZFVzZXJJbmZvO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHVwZGF0ZVVzZXJJbmZvKHVzZXJJZDogc3RyaW5nLCB1c2VySW5mbzogTW9kZWwuVXNlckluZm8pOiBQcm9taXNlTGlrZTxNb2RlbC5Vc2VySW5mbz4ge1xyXG4gICAgICAgICAgICBpZiAoIXVzZXJJZCkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgJ0ludmFsaWQgdXNlciBpZCc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5jYWNoZWRVc2VySWQgPSAnJztcclxuICAgICAgICAgICAgdGhpcy5jYWNoZWRVc2VySW5mbyA9IG51bGw7XHJcbiAgICAgICAgICAgIHJldHVybiAoPGFueT50aGlzLnJlc291cmNlQ2xhc3MpLnVwZGF0ZSh7XHJcbiAgICAgICAgICAgICAgICAgICAgdXNlcklkOiB1c2VySWRcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB1c2VySW5mbykuJHByb21pc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiAiLCIvLyAgICAgQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uICBBbGwgcmlnaHRzIHJlc2VydmVkLlxyXG5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL3JlZmVyZW5jZXMvaW5kZXguZC50c1wiIC8+XHJcblxyXG5tb2R1bGUgRFhMaXF1aWRJbnRlbC5BcHAuTW9kZWwge1xyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBCZWVySW5mbyB7XHJcbiAgICAgICAgcHVibGljIHVudGFwcGRJZDogbnVtYmVyXHJcbiAgICAgICAgcHVibGljIG5hbWU6IHN0cmluZ1xyXG4gICAgICAgIHB1YmxpYyBiZWVyX3R5cGU/OiBzdHJpbmdcclxuICAgICAgICBwdWJsaWMgaWJ1PzogbnVtYmVyXHJcbiAgICAgICAgcHVibGljIGFidj86IG51bWJlclxyXG4gICAgICAgIHB1YmxpYyBkZXNjcmlwdGlvbj86IHN0cmluZ1xyXG4gICAgICAgIHB1YmxpYyBicmV3ZXJ5Pzogc3RyaW5nXHJcbiAgICAgICAgcHVibGljIGltYWdlPzogc3RyaW5nXHJcbiAgICB9XHJcbn0iLCIvLyAgICAgQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uICBBbGwgcmlnaHRzIHJlc2VydmVkLlxyXG5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL3JlZmVyZW5jZXMvaW5kZXguZC50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJCZWVySW5mby50c1wiIC8+XHJcblxyXG5tb2R1bGUgRFhMaXF1aWRJbnRlbC5BcHAuTW9kZWwge1xyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBWb3RlIHtcclxuICAgICAgICBwdWJsaWMgVm90ZUlkOiBudW1iZXJcclxuICAgICAgICBwdWJsaWMgUGVyc29ubmVsTnVtYmVyOiBudW1iZXJcclxuICAgICAgICBwdWJsaWMgVm90ZURhdGU6IERhdGVcclxuICAgICAgICBwdWJsaWMgVW50YXBwZElkOiBudW1iZXJcclxuICAgICAgICBwdWJsaWMgQmVlck5hbWU/OiBzdHJpbmdcclxuICAgICAgICBwdWJsaWMgQnJld2VyeT86IHN0cmluZ1xyXG4gICAgICAgIHB1YmxpYyBCZWVySW5mbz86IEJlZXJJbmZvXHJcbiAgICB9XHJcblxyXG4gICAgZXhwb3J0IGNsYXNzIFZvdGVUYWxseSB7XHJcbiAgICAgICAgcHVibGljIFVudGFwcGRJZDogbnVtYmVyXHJcbiAgICAgICAgcHVibGljIEJlZXJOYW1lPzogc3RyaW5nXHJcbiAgICAgICAgcHVibGljIEJyZXdlcnk/OiBzdHJpbmdcclxuICAgICAgICBwdWJsaWMgVm90ZUNvdW50OiBudW1iZXJcclxuICAgIH1cclxufVxyXG4gICAgICAgICAiLCIvLyAgICAgQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uICBBbGwgcmlnaHRzIHJlc2VydmVkLlxyXG5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL3JlZmVyZW5jZXMvaW5kZXguZC50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9Nb2RlbC9Wb3RlLnRzXCIgLz5cclxuXHJcbm1vZHVsZSBEWExpcXVpZEludGVsLkFwcC5TZXJ2aWNlIHtcclxuXHJcbiAgICBleHBvcnQgY2xhc3MgVm90ZVNlcnZpY2Uge1xyXG4gICAgICAgIHN0YXRpYyAkaW5qZWN0ID0gWyckcmVzb3VyY2UnLCAnZW52U2VydmljZSddO1xyXG5cclxuICAgICAgICBwcml2YXRlIHVzZXJWb3Rlc1Jlc291cmNlOiBuZy5yZXNvdXJjZS5JUmVzb3VyY2VDbGFzczxNb2RlbC5Wb3RlW10+O1xyXG4gICAgICAgIHByaXZhdGUgdGFsbHlSZXNvdXJjZTogbmcucmVzb3VyY2UuSVJlc291cmNlQ2xhc3M8TW9kZWwuVm90ZVRhbGx5PjtcclxuXHJcbiAgICAgICAgY29uc3RydWN0b3IoJHJlc291cmNlOiBuZy5yZXNvdXJjZS5JUmVzb3VyY2VTZXJ2aWNlLCBlbnZTZXJ2aWNlOiBhbmd1bGFyLmVudmlyb25tZW50LlNlcnZpY2UpIHtcclxuXHJcbiAgICAgICAgICAgIHRoaXMudXNlclZvdGVzUmVzb3VyY2UgPSAkcmVzb3VyY2U8TW9kZWwuVm90ZVtdPihlbnZTZXJ2aWNlLnJlYWQoJ2FwaVVyaScpICsgJy92b3Rlcy86cGVyc29ubmVsTnVtYmVyJywgbnVsbCwge1xyXG4gICAgICAgICAgICAgICAgZ2V0OiB7bWV0aG9kOiAnR0VUJywgaXNBcnJheTogdHJ1ZX0sXHJcbiAgICAgICAgICAgICAgICBzYXZlOiB7bWV0aG9kOiAnUFVUJywgaXNBcnJheTogdHJ1ZX1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHRoaXMudGFsbHlSZXNvdXJjZSA9ICRyZXNvdXJjZTxNb2RlbC5Wb3RlVGFsbHk+KGVudlNlcnZpY2UucmVhZCgnYXBpVXJpJykgKyAnL3ZvdGVzX3RhbGx5Jyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgZ2V0VXNlclZvdGVzKHBlcnNvbm5lbE51bWJlcjogbnVtYmVyKTogUHJvbWlzZUxpa2U8TW9kZWwuVm90ZVtdPiB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnVzZXJWb3Rlc1Jlc291cmNlLmdldCh7XHJcbiAgICAgICAgICAgICAgICAgICAgcGVyc29ubmVsTnVtYmVyOiBwZXJzb25uZWxOdW1iZXJcclxuICAgICAgICAgICAgICAgIH0pLiRwcm9taXNlOyBcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyB1cGRhdGVVc2VyVm90ZXMocGVyc29ubmVsTnVtYmVyOiBudW1iZXIsIHZvdGVzOiBNb2RlbC5Wb3RlW10pOiBQcm9taXNlTGlrZTxNb2RlbC5Wb3RlW10+IHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMudXNlclZvdGVzUmVzb3VyY2Uuc2F2ZSh7XHJcbiAgICAgICAgICAgICAgICAgICAgcGVyc29ubmVsTnVtYmVyOiBwZXJzb25uZWxOdW1iZXJcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB2b3RlcykuJHByb21pc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgZ2V0Vm90ZVRhbGx5KCk6IFByb21pc2VMaWtlPE1vZGVsLlZvdGVUYWxseVtdPiB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnRhbGx5UmVzb3VyY2UucXVlcnkoKS4kcHJvbWlzZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuICIsIi8vICAgICBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gIEFsbCByaWdodHMgcmVzZXJ2ZWQuXHJcblxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vcmVmZXJlbmNlcy9pbmRleC5kLnRzXCIgLz5cclxuXHJcbm1vZHVsZSBEWExpcXVpZEludGVsLkFwcC5Nb2RlbCB7XHJcblxyXG4gICAgLy8gTmVlZCB0byBrZWVwIHN0cnVjdHVyZSBpbiBzeW5jIHdpdGggRGFzaFNlcnZlci5NYW5hZ2VtZW50QVBJLk1vZGVscy5PcGVyYXRpb25TdGF0ZSBpbiB0aGUgV2ViQVBJXHJcbiAgICBleHBvcnQgY2xhc3MgQWN0aXZpdHkge1xyXG4gICAgICAgIHB1YmxpYyBTZXNzaW9uSWQ6IG51bWJlclxyXG4gICAgICAgIHB1YmxpYyBQb3VyVGltZTogRGF0ZVxyXG4gICAgICAgIHB1YmxpYyBQb3VyQW1vdW50OiBudW1iZXJcclxuICAgICAgICBwdWJsaWMgQmVlck5hbWU6IHN0cmluZ1xyXG4gICAgICAgIHB1YmxpYyBCcmV3ZXJ5OiBzdHJpbmdcclxuICAgICAgICBwdWJsaWMgQmVlclR5cGU6IHN0cmluZ1xyXG4gICAgICAgIHB1YmxpYyBBQlY/OiBudW1iZXJcclxuICAgICAgICBwdWJsaWMgSUJVPzogbnVtYmVyXHJcbiAgICAgICAgcHVibGljIEJlZXJEZXNjcmlwdGlvbjogc3RyaW5nXHJcbiAgICAgICAgcHVibGljIFVudGFwcGRJZD86IG51bWJlclxyXG4gICAgICAgIHB1YmxpYyBCZWVySW1hZ2VQYXRoOiBzdHJpbmdcclxuICAgICAgICBwdWJsaWMgUGVyc29ubmVsTnVtYmVyOiBudW1iZXJcclxuICAgICAgICBwdWJsaWMgQWxpYXM6IHN0cmluZ1xyXG4gICAgICAgIHB1YmxpYyBGdWxsTmFtZTogc3RyaW5nXHJcbiAgICB9XHJcbn1cclxuICAgICAgICAgIiwiLy8gICAgIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiAgQWxsIHJpZ2h0cyByZXNlcnZlZC5cclxuXHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9yZWZlcmVuY2VzL2luZGV4LmQudHNcIiAvPlxyXG5cclxubW9kdWxlIERYTGlxdWlkSW50ZWwuQXBwLlNlcnZpY2Uge1xyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBCYXNpY0F1dGhSZXNvdXJjZTxUPiB7XHJcbiAgICAgICAgcHJpdmF0ZSByZXNvdXJjZTogbmcucmVzb3VyY2UuSVJlc291cmNlQ2xhc3M8VD47XHJcblxyXG4gICAgICAgIGNvbnN0cnVjdG9yKCRyZXNvdXJjZTogbmcucmVzb3VyY2UuSVJlc291cmNlU2VydmljZSwgZW52U2VydmljZTogYW5ndWxhci5lbnZpcm9ubWVudC5TZXJ2aWNlLCB1cmw6IHN0cmluZykge1xyXG4gICAgICAgICAgICB2YXIgYXV0aEhlYWRlciA9IFwiQmFzaWMgXCIgKyBidG9hKGVudlNlcnZpY2UucmVhZCgnYXBpVXNlcm5hbWUnKSArIFwiOlwiICsgZW52U2VydmljZS5yZWFkKCdhcGlQYXNzd29yZCcpKTtcclxuICAgICAgICAgICAgdmFyIGhlYWRlcnMgPSB7XHJcbiAgICAgICAgICAgICAgICBBdXRob3JpemF0aW9uOiBhdXRoSGVhZGVyXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHZhciBxdWVyeUFjdGlvbjogbmcucmVzb3VyY2UuSUFjdGlvbkhhc2ggPSB7XHJcbiAgICAgICAgICAgICAgICBxdWVyeToge1xyXG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZDogJ0dFVCcsXHJcbiAgICAgICAgICAgICAgICAgICAgaXNBcnJheTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICBoZWFkZXJzOiBoZWFkZXJzXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHRoaXMucmVzb3VyY2UgPSAkcmVzb3VyY2U8VD4odXJsLCBudWxsLCBxdWVyeUFjdGlvbik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgcXVlcnkoZGF0YTogYW55KTogbmcuSVByb21pc2U8VFtdPiB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnJlc291cmNlLnF1ZXJ5KGRhdGEpLiRwcm9taXNlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iLCIvLyAgICAgQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uICBBbGwgcmlnaHRzIHJlc2VydmVkLlxyXG5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL3JlZmVyZW5jZXMvaW5kZXguZC50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9Nb2RlbC9BY3Rpdml0eS50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL0Jhc2ljQXV0aFJlc291cmNlLnRzXCIgLz5cclxuXHJcbm1vZHVsZSBEWExpcXVpZEludGVsLkFwcC5TZXJ2aWNlIHtcclxuXHJcbiAgICBleHBvcnQgY2xhc3MgRGFzaGJvYXJkU2VydmljZSB7XHJcbiAgICAgICAgc3RhdGljICRpbmplY3QgPSBbJyRyZXNvdXJjZScsICdlbnZTZXJ2aWNlJ107XHJcblxyXG4gICAgICAgIHByaXZhdGUgYWN0aXZpdHlSZXNvdXJjZTogQmFzaWNBdXRoUmVzb3VyY2U8TW9kZWwuQWN0aXZpdHk+O1xyXG5cclxuICAgICAgICBjb25zdHJ1Y3RvcigkcmVzb3VyY2U6IG5nLnJlc291cmNlLklSZXNvdXJjZVNlcnZpY2UsIGVudlNlcnZpY2U6IGFuZ3VsYXIuZW52aXJvbm1lbnQuU2VydmljZSkge1xyXG4gICAgICAgICAgICB0aGlzLmFjdGl2aXR5UmVzb3VyY2UgPSBuZXcgQmFzaWNBdXRoUmVzb3VyY2U8TW9kZWwuQWN0aXZpdHk+KCRyZXNvdXJjZSwgZW52U2VydmljZSwgZW52U2VydmljZS5yZWFkKCdhcGlVcmknKSArICcvYWN0aXZpdHknKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBnZXRMYXRlc3RBY3Rpdml0aWVzKGNvdW50OiBudW1iZXIpOiBQcm9taXNlTGlrZTxNb2RlbC5BY3Rpdml0eVtdPiB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmFjdGl2aXR5UmVzb3VyY2UucXVlcnkoe1xyXG4gICAgICAgICAgICAgICAgY291bnQ6IGNvdW50XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iLCIvLyAgICAgQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uICBBbGwgcmlnaHRzIHJlc2VydmVkLlxyXG5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL3JlZmVyZW5jZXMvaW5kZXguZC50c1wiIC8+XHJcblxyXG5tb2R1bGUgRFhMaXF1aWRJbnRlbC5BcHAuTW9kZWwge1xyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBLZWcge1xyXG4gICAgICAgIHB1YmxpYyBLZWdJZD86IG51bWJlclxyXG4gICAgICAgIHB1YmxpYyBOYW1lOiBzdHJpbmdcclxuICAgICAgICBwdWJsaWMgQnJld2VyeTogc3RyaW5nXHJcbiAgICAgICAgcHVibGljIEJlZXJUeXBlOiBzdHJpbmdcclxuICAgICAgICBwdWJsaWMgQUJWPzogbnVtYmVyXHJcbiAgICAgICAgcHVibGljIElCVT86IG51bWJlclxyXG4gICAgICAgIHB1YmxpYyBCZWVyRGVzY3JpcHRpb246IHN0cmluZ1xyXG4gICAgICAgIHB1YmxpYyBVbnRhcHBkSWQ/OiBudW1iZXJcclxuICAgICAgICBwdWJsaWMgaW1hZ2VQYXRoOiBzdHJpbmdcclxuICAgICAgICBwdWJsaWMgQmVlckluZm8/OiBCZWVySW5mb1xyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBUYXBJbmZvIGV4dGVuZHMgS2VnIHtcclxuICAgICAgICBwdWJsaWMgVGFwSWQ6IG51bWJlclxyXG4gICAgICAgIHB1YmxpYyBJbnN0YWxsRGF0ZTogRGF0ZVxyXG4gICAgICAgIHB1YmxpYyBLZWdTaXplOiBudW1iZXJcclxuICAgICAgICBwdWJsaWMgQ3VycmVudFZvbHVtZTogbnVtYmVyXHJcbiAgICAgICAgcHVibGljIE9yaWdpbmFsVW50YXBwZElkPzogbnVtYmVyXHJcblxyXG4gICAgICAgIHB1YmxpYyBnZXRTZXRCZWVySW5mbz86IChiZWVySW5mbzogQmVlckluZm8pID0+IEJlZXJJbmZvO1xyXG4gICAgfVxyXG59XHJcbiAgICAgICAgICIsIi8vICAgICBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gIEFsbCByaWdodHMgcmVzZXJ2ZWQuXHJcblxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vcmVmZXJlbmNlcy9pbmRleC5kLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL01vZGVsL1RhcEluZm8udHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9CYXNpY0F1dGhSZXNvdXJjZS50c1wiIC8+XHJcblxyXG5tb2R1bGUgRFhMaXF1aWRJbnRlbC5BcHAuU2VydmljZSB7XHJcblxyXG4gICAgZXhwb3J0IGNsYXNzIEtlZ3NTZXJ2aWNlIHtcclxuICAgICAgICBzdGF0aWMgJGluamVjdCA9IFsnJHJlc291cmNlJywgJ2VudlNlcnZpY2UnLCAnYWRhbEF1dGhlbnRpY2F0aW9uU2VydmljZSddO1xyXG5cclxuICAgICAgICBwcml2YXRlIGtlZ1N0YXR1c1Jlc291cmNlOiBCYXNpY0F1dGhSZXNvdXJjZTxNb2RlbC5UYXBJbmZvPjtcclxuICAgICAgICBwcml2YXRlIGtlZ1VwZGF0ZVJlc291cmNlOiBuZy5yZXNvdXJjZS5JUmVzb3VyY2VDbGFzczxuZy5yZXNvdXJjZS5JUmVzb3VyY2U8TW9kZWwuS2VnPj47XHJcblxyXG4gICAgICAgIGNvbnN0cnVjdG9yKHByb3RlY3RlZCAkcmVzb3VyY2U6IG5nLnJlc291cmNlLklSZXNvdXJjZVNlcnZpY2UsIFxyXG4gICAgICAgICAgICBwcm90ZWN0ZWQgZW52U2VydmljZTogYW5ndWxhci5lbnZpcm9ubWVudC5TZXJ2aWNlLCBcclxuICAgICAgICAgICAgcHJvdGVjdGVkIGFkYWxTZXJ2aWNlOiBhZGFsLkFkYWxBdXRoZW50aWNhdGlvblNlcnZpY2UpIHtcclxuXHJcbiAgICAgICAgICAgIHRoaXMua2VnU3RhdHVzUmVzb3VyY2UgPSBuZXcgQmFzaWNBdXRoUmVzb3VyY2U8TW9kZWwuVGFwSW5mbz4oJHJlc291cmNlLCBlbnZTZXJ2aWNlLCBlbnZTZXJ2aWNlLnJlYWQoJ2FwaVVyaScpICsgJy9DdXJyZW50S2VnJyk7XHJcbiAgICAgICAgICAgIHRoaXMua2VnVXBkYXRlUmVzb3VyY2UgPSA8bmcucmVzb3VyY2UuSVJlc291cmNlQ2xhc3M8bmcucmVzb3VyY2UuSVJlc291cmNlPE1vZGVsLktlZz4+PiRyZXNvdXJjZShlbnZTZXJ2aWNlLnJlYWQoJ2FwaVVyaScpICsgJy9rZWdzJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgZ2V0VGFwc1N0YXR1cygpOiBQcm9taXNlTGlrZTxNb2RlbC5UYXBJbmZvW10+IHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMua2VnU3RhdHVzUmVzb3VyY2UucXVlcnkobnVsbCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgY3JlYXRlTmV3S2VnKGtlZzogTW9kZWwuS2VnKTogUHJvbWlzZUxpa2U8TW9kZWwuS2VnPiB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmtlZ1VwZGF0ZVJlc291cmNlLnNhdmUoa2VnKS4kcHJvbWlzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBhc3luYyBpbnN0YWxsS2VnT25UYXAodGFwSWQ6IG51bWJlciwga2VnSWQ6IG51bWJlciwga2VnU2l6ZTogbnVtYmVyKTogUHJvbWlzZTxhbnk+IHtcclxuICAgICAgICAgICAgLy8gQmVjYXVzZSB0aGUgL0N1cnJlbnRLZWcgdXJpIGhhcyBiZWVuIGNvbmZpZ3VyZWQgZm9yIGJhc2ljIGF1dGggKHRoZSBHRVQgaXMgZGlzcGxheWVkIG9uIHRoZSBkYXNoYm9hcmRcclxuICAgICAgICAgICAgLy8gcHJpb3IgdG8gbG9naW4pLCB3ZSBoYXZlIHRvIG1hbnVhbGx5IGFwcGx5IHRoZSBiZWFyZXIgdG9rZW4gZm9yIHRoZSBQVVQsIHdoaWNoIGlzIHByb3RlY3RlZC5cclxuICAgICAgICAgICAgdmFyIHJlcXVlc3RVcmkgPSB0aGlzLmVudlNlcnZpY2UucmVhZCgnYXBpVXJpJykgKyBgL0N1cnJlbnRLZWcvJHt0YXBJZH1gO1xyXG4gICAgICAgICAgICB2YXIgdG9rZW4gPSBhd2FpdCB0aGlzLmFkYWxTZXJ2aWNlLmFjcXVpcmVUb2tlbih0aGlzLmFkYWxTZXJ2aWNlLmdldFJlc291cmNlRm9yRW5kcG9pbnQodGhpcy5lbnZTZXJ2aWNlLnJlYWQoJ2FwaVVyaScpKSk7XHJcbiAgICAgICAgICAgIHZhciBpbnN0YWxsQ3VycmVudEtlZ1Jlc291cmNlID0gdGhpcy4kcmVzb3VyY2UocmVxdWVzdFVyaSxcclxuICAgICAgICAgICAgICAgIG51bGwsXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2F2ZTogeyBcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWV0aG9kOiAnUFVUJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgQXV0aG9yaXphdGlvbjogJ0JlYXJlciAnICsgdG9rZW5cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICByZXR1cm4gaW5zdGFsbEN1cnJlbnRLZWdSZXNvdXJjZS5zYXZlKG51bGwsIFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIEtlZ0lkOiBrZWdJZCxcclxuICAgICAgICAgICAgICAgICAgICBLZWdTaXplOiBrZWdTaXplXHJcbiAgICAgICAgICAgICAgICB9KS4kcHJvbWlzZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwiLy8gICAgIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiAgQWxsIHJpZ2h0cyByZXNlcnZlZC5cclxuXHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9yZWZlcmVuY2VzL2luZGV4LmQudHNcIiAvPlxyXG5cclxubW9kdWxlIERYTGlxdWlkSW50ZWwuQXBwLk1vZGVsIHtcclxuXHJcbiAgICBleHBvcnQgY2xhc3MgQXV0aG9yaXplZEdyb3VwcyB7XHJcbiAgICAgICAgQXV0aG9yaXplZEdyb3Vwczogc3RyaW5nW11cclxuICAgIH1cclxuXHJcbiAgICBleHBvcnQgY2xhc3MgR3JvdXBSZXN1bHQge1xyXG4gICAgICAgIGRpc3BsYXlOYW1lOiBzdHJpbmdcclxuICAgICAgICBvd25lcnM6IHN0cmluZ1tdXHJcbiAgICB9XHJcblxyXG4gICAgZXhwb3J0IGNsYXNzIEdyb3VwU2VhcmNoUmVzdWx0cyB7XHJcbiAgICAgICAgY291bnQ6IG51bWJlclxyXG4gICAgICAgIHJlc3VsdHM6IEdyb3VwUmVzdWx0W11cclxuICAgIH1cclxufSIsIi8vICAgICBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gIEFsbCByaWdodHMgcmVzZXJ2ZWQuXHJcblxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vcmVmZXJlbmNlcy9pbmRleC5kLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL01vZGVsL0FkbWluLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL01vZGVsL0tlZ3MudHNcIiAvPlxyXG5cclxubW9kdWxlIERYTGlxdWlkSW50ZWwuQXBwLlNlcnZpY2Uge1xyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBBZG1pblNlcnZpY2Uge1xyXG4gICAgICAgIHN0YXRpYyAkaW5qZWN0ID0gWyckcmVzb3VyY2UnLCAnZW52U2VydmljZSddO1xyXG5cclxuICAgICAgICBwcml2YXRlIGFkbWluUmVzb3VyY2U6IG5nLnJlc291cmNlLklSZXNvdXJjZUNsYXNzPG5nLnJlc291cmNlLklSZXNvdXJjZTxhbnk+PjtcclxuICAgICAgICBwcml2YXRlIGtlZ3NSZXNvdXJjZTogbmcucmVzb3VyY2UuSVJlc291cmNlQ2xhc3M8bmcucmVzb3VyY2UuSVJlc291cmNlPGFueT4+O1xyXG5cclxuICAgICAgICBjb25zdHJ1Y3RvcigkcmVzb3VyY2U6IG5nLnJlc291cmNlLklSZXNvdXJjZVNlcnZpY2UsIGVudlNlcnZpY2U6IGFuZ3VsYXIuZW52aXJvbm1lbnQuU2VydmljZSkge1xyXG5cclxuICAgICAgICAgICAgdGhpcy5hZG1pblJlc291cmNlID0gPG5nLnJlc291cmNlLklSZXNvdXJjZUNsYXNzPG5nLnJlc291cmNlLklSZXNvdXJjZTxhbnk+Pj4kcmVzb3VyY2UoZW52U2VydmljZS5yZWFkKCdhcGlVcmknKSArICcvYWRtaW4vOmFjdGlvbicsXHJcbiAgICAgICAgICAgICAgICBudWxsLFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZTogeyBtZXRob2Q6ICdQVVQnIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGdldEF1dGhvcml6ZWRHcm91cHMoKTogUHJvbWlzZUxpa2U8TW9kZWwuQXV0aG9yaXplZEdyb3Vwcz4ge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5hZG1pblJlc291cmNlLmdldCh7XHJcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiAnQXV0aG9yaXplZEdyb3VwcydcclxuICAgICAgICAgICAgICAgIH0pLiRwcm9taXNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHVwZGF0ZUF1dGhvcml6ZWRHcm91cHMoZ3JvdXBzOiBNb2RlbC5BdXRob3JpemVkR3JvdXBzKTogUHJvbWlzZUxpa2U8YW55PiB7XHJcbiAgICAgICAgICAgIHJldHVybiAoPGFueT50aGlzLmFkbWluUmVzb3VyY2UpLnVwZGF0ZSh7XHJcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiAnQXV0aG9yaXplZEdyb3VwcydcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBncm91cHMpLiRwcm9taXNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHNlYXJjaEdyb3VwcyhzZWFyY2hUZXJtOiBzdHJpbmcpOiBQcm9taXNlTGlrZTxNb2RlbC5Hcm91cFNlYXJjaFJlc3VsdHM+IHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYWRtaW5SZXNvdXJjZS5nZXQoe1xyXG4gICAgICAgICAgICAgICAgYWN0aW9uOiAnQXV0aG9yaXplZEdyb3VwcycsXHJcbiAgICAgICAgICAgICAgICBzZWFyY2g6IHNlYXJjaFRlcm1cclxuICAgICAgICAgICAgfSkuJHByb21pc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiAiLCIvLyAgICAgQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uICBBbGwgcmlnaHRzIHJlc2VydmVkLlxyXG5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL3JlZmVyZW5jZXMvaW5kZXguZC50c1wiIC8+XHJcblxyXG5tb2R1bGUgRFhMaXF1aWRJbnRlbC5BcHAuTW9kZWwge1xyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBDb25maWd1cmF0aW9uIHtcclxuXHJcbiAgICAgICAgcHVibGljIFVudGFwcGRDbGllbnRJZDogc3RyaW5nXHJcbiAgICAgICAgcHVibGljIFVudGFwcGRDbGllbnRTZWNyZXQ6IHN0cmluZ1xyXG4gICAgfVxyXG59ICIsIi8vICAgICBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gIEFsbCByaWdodHMgcmVzZXJ2ZWQuXHJcblxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vcmVmZXJlbmNlcy9pbmRleC5kLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL01vZGVsL0NvbmZpZ3VyYXRpb24udHNcIiAvPlxyXG5cclxubW9kdWxlIERYTGlxdWlkSW50ZWwuQXBwLlNlcnZpY2Uge1xyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBDb25maWdTZXJ2aWNlIHtcclxuICAgICAgICBzdGF0aWMgJGluamVjdCA9IFsnJHJlc291cmNlJywgJ2VudlNlcnZpY2UnXTtcclxuXHJcbiAgICAgICAgcHJpdmF0ZSByZXNvdXJjZUNsYXNzOiBuZy5yZXNvdXJjZS5JUmVzb3VyY2VDbGFzczxuZy5yZXNvdXJjZS5JUmVzb3VyY2U8TW9kZWwuQ29uZmlndXJhdGlvbj4+O1xyXG4gICAgICAgIHByaXZhdGUgY29uZmlndXJhdGlvbjogbmcuSVByb21pc2U8TW9kZWwuQ29uZmlndXJhdGlvbj47XHJcblxyXG4gICAgICAgIGNvbnN0cnVjdG9yKCRyZXNvdXJjZTogbmcucmVzb3VyY2UuSVJlc291cmNlU2VydmljZSwgZW52U2VydmljZTogYW5ndWxhci5lbnZpcm9ubWVudC5TZXJ2aWNlKSB7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnJlc291cmNlQ2xhc3MgPSAkcmVzb3VyY2UoZW52U2VydmljZS5yZWFkKCdhcGlVcmknKSArICcvYXBwQ29uZmlndXJhdGlvbicpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGdldENvbmZpZ3VyYXRpb24oKTogUHJvbWlzZUxpa2U8TW9kZWwuQ29uZmlndXJhdGlvbj4ge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuY29uZmlndXJhdGlvbikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uID0gdGhpcy5yZXNvdXJjZUNsYXNzLmdldCgpLiRwcm9taXNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNvbmZpZ3VyYXRpb247XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiAiLCIvLyAgICAgQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uICBBbGwgcmlnaHRzIHJlc2VydmVkLlxyXG5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL3JlZmVyZW5jZXMvaW5kZXguZC50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL0NvbmZpZ1NlcnZpY2UudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vTW9kZWwvQmVlckluZm8udHNcIiAvPlxyXG5cclxubW9kdWxlIERYTGlxdWlkSW50ZWwuQXBwLlNlcnZpY2Uge1xyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBVbnRhcHBkQXBpU2VydmljZSB7XHJcbiAgICAgICAgc3RhdGljICRpbmplY3QgPSBbJyRyZXNvdXJjZScsICdlbnZTZXJ2aWNlJywgJ2NvbmZpZ1NlcnZpY2UnXTtcclxuXHJcbiAgICAgICAgcHJpdmF0ZSByZXNvdXJjZUNsYXNzOiBuZy5yZXNvdXJjZS5JUmVzb3VyY2VDbGFzczxuZy5yZXNvdXJjZS5JUmVzb3VyY2U8YW55Pj47XHJcblxyXG4gICAgICAgIGNvbnN0cnVjdG9yKCRyZXNvdXJjZTogbmcucmVzb3VyY2UuSVJlc291cmNlU2VydmljZSwgcHJpdmF0ZSBlbnZTZXJ2aWNlOiBhbmd1bGFyLmVudmlyb25tZW50LlNlcnZpY2UsIHByaXZhdGUgY29uZmlnU2VydmljZTogQ29uZmlnU2VydmljZSkge1xyXG5cclxuICAgICAgICAgICAgdGhpcy5yZXNvdXJjZUNsYXNzID0gJHJlc291cmNlKCdodHRwczovL2FwaS51bnRhcHBkLmNvbS92NC86ZW50aXR5LzptZXRob2ROYW1lJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgYXN5bmMgZ2V0VW50YXBwZEF1dGhVcmkocmVkaXJlY3RVcmk6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XHJcbiAgICAgICAgICAgIGxldCBhcHBDb25maWcgPSBhd2FpdCB0aGlzLmNvbmZpZ1NlcnZpY2UuZ2V0Q29uZmlndXJhdGlvbigpO1xyXG4gICAgICAgICAgICByZXR1cm4gYGh0dHBzOi8vdW50YXBwZC5jb20vb2F1dGgvYXV0aGVudGljYXRlLz9jbGllbnRfaWQ9JHthcHBDb25maWcuVW50YXBwZENsaWVudElkfSZyZXNwb25zZV90eXBlPXRva2VuJnJlZGlyZWN0X3VybD0ke3JlZGlyZWN0VXJpfWA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgZ2V0VXNlckluZm8oYWNjZXNzVG9rZW46IHN0cmluZyk6IFByb21pc2VMaWtlPGFueT4ge1xyXG4gICAgICAgICAgICBpZiAoIWFjY2Vzc1Rva2VuKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyAnSW52YWxpZCBVbnRhcHBkIHVzZXIgYWNjZXNzIHRva2VuJzsgICAgXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5yZXNvdXJjZUNsYXNzLmdldCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVudGl0eTogJ3VzZXInLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXRob2ROYW1lOiAnaW5mbycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjY2Vzc190b2tlbjogYWNjZXNzVG9rZW5cclxuICAgICAgICAgICAgICAgICAgICB9KS4kcHJvbWlzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGFzeW5jIHNlYXJjaEJlZXJzKHNlYXJjaFRlcm06IHN0cmluZywgYWNjZXNzVG9rZW4/OiBzdHJpbmcpOiBQcm9taXNlPE1vZGVsLkJlZXJJbmZvW10+IHtcclxuICAgICAgICAgICAgbGV0IGFwcENvbmZpZyA9IGF3YWl0IHRoaXMuY29uZmlnU2VydmljZS5nZXRDb25maWd1cmF0aW9uKCk7XHJcbiAgICAgICAgICAgIHZhciBkYXRhID0ge1xyXG4gICAgICAgICAgICAgICAgZW50aXR5OiAnc2VhcmNoJyxcclxuICAgICAgICAgICAgICAgIG1ldGhvZE5hbWU6ICdiZWVyJyxcclxuICAgICAgICAgICAgICAgIHE6IHNlYXJjaFRlcm0gKyAnKicsXHJcbiAgICAgICAgICAgICAgICBsaW1pdDogMTVcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgaWYgKGFjY2Vzc1Rva2VuKSB7XHJcbiAgICAgICAgICAgICAgICBkYXRhWydhY2Nlc3NfdG9rZW4nXSA9IGFjY2Vzc1Rva2VuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZGF0YVsnY2xpZW50X2lkJ10gPSBhcHBDb25maWcuVW50YXBwZENsaWVudElkO1xyXG4gICAgICAgICAgICAgICAgZGF0YVsnY2xpZW50X3NlY3JldCddID0gYXBwQ29uZmlnLlVudGFwcGRDbGllbnRTZWNyZXQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdmFyIHJlc3VsdHMgPSBhd2FpdCB0aGlzLnJlc291cmNlQ2xhc3MuZ2V0KGRhdGEpLiRwcm9taXNlO1xyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0cy5yZXNwb25zZS5iZWVycy5pdGVtcy5tYXAoKGJlZXIpID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdW50YXBwZElkOiBiZWVyLmJlZXIuYmlkLFxyXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IGJlZXIuYmVlci5iZWVyX25hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgYmVlcl90eXBlOiBiZWVyLmJlZXIuYmVlcl9zdHlsZSxcclxuICAgICAgICAgICAgICAgICAgICBpYnU6IGJlZXIuYmVlci5iZWVyX2lidSxcclxuICAgICAgICAgICAgICAgICAgICBhYnY6IGJlZXIuYmVlci5iZWVyX2FidixcclxuICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogYmVlci5iZWVyLmJlZXJfZGVzY3JpcHRpb24sXHJcbiAgICAgICAgICAgICAgICAgICAgYnJld2VyeTogYmVlci5icmV3ZXJ5LmJyZXdlcnlfbmFtZSxcclxuICAgICAgICAgICAgICAgICAgICBpbWFnZTogYmVlci5iZWVyLmJlZXJfbGFiZWxcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4gIiwiLy8gICAgIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiAgQWxsIHJpZ2h0cyByZXNlcnZlZC5cclxuXHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9yZWZlcmVuY2VzL2luZGV4LmQudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vU2VydmljZS9Vc2VyU2VydmljZS50c1wiIC8+XHJcblxyXG5tb2R1bGUgRFhMaXF1aWRJbnRlbC5BcHAuQ29udHJvbGxlciB7XHJcblxyXG4gICAgZXhwb3J0IGNsYXNzIENvbnRyb2xsZXJCYXNlIHtcclxuXHJcbiAgICAgICAgY29uc3RydWN0b3IocHJvdGVjdGVkICRzY29wZTogTW9kZWwuSURYTGlxdWlkSW50ZWxTY29wZSxcclxuICAgICAgICAgICAgcHJvdGVjdGVkICRyb290U2NvcGU6IE1vZGVsLklEWExpcXVpZEludGVsU2NvcGUsXHJcbiAgICAgICAgICAgIHByb3RlY3RlZCBhZGFsQXV0aGVudGljYXRpb25TZXJ2aWNlLFxyXG4gICAgICAgICAgICBwcm90ZWN0ZWQgJGxvY2F0aW9uOiBuZy5JTG9jYXRpb25TZXJ2aWNlLFxyXG4gICAgICAgICAgICBwcm90ZWN0ZWQgdXNlclNlcnZpY2U6IFNlcnZpY2UuVXNlclNlcnZpY2UsXHJcbiAgICAgICAgICAgIGNvbnRpbnVlQWZ0ZXJVc2VyTG9hZDogKCkgPT4gdm9pZCkge1xyXG5cclxuICAgICAgICAgICAgJHJvb3RTY29wZS5sb2dpbiA9ICgpID0+IHRoaXMubG9naW4oKTtcclxuICAgICAgICAgICAgJHJvb3RTY29wZS5sb2dvdXQgPSAoKSA9PiB0aGlzLmxvZ291dCgpO1xyXG4gICAgICAgICAgICAkcm9vdFNjb3BlLmlzQ29udHJvbGxlckFjdGl2ZSA9IChsb2NhdGlvbikgPT4gdGhpcy5pc0FjdGl2ZShsb2NhdGlvbik7XHJcbiAgICAgICAgICAgICRyb290U2NvcGUuaXNBZG1pbiA9ICgpID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAkc2NvcGUuc3lzdGVtVXNlckluZm8gPyAkc2NvcGUuc3lzdGVtVXNlckluZm8uSXNBZG1pbiA6IGZhbHNlO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAkcm9vdFNjb3BlLmJ1dHRvbkJhckJ1dHRvbnMgPSBbXTtcclxuXHJcbiAgICAgICAgICAgICRzY29wZS4kb24oJyRyb3V0ZUNoYW5nZVN1Y2Nlc3MnLCAoZXZlbnQsIGN1cnJlbnQsIHByZXZpb3VzKSA9PiB0aGlzLnNldFRpdGxlRm9yUm91dGUoY3VycmVudC4kJHJvdXRlKSk7XHJcbiAgICAgICAgICAgICRzY29wZS5sb2FkaW5nTWVzc2FnZSA9IFwiXCI7XHJcbiAgICAgICAgICAgICRzY29wZS5lcnJvciA9IFwiXCI7XHJcblxyXG4gICAgICAgICAgICAvLyBXaGVuIHRoZSB1c2VyIGxvZ3MgaW4sIHdlIG5lZWQgdG8gY2hlY2sgd2l0aCB0aGUgYXBpIGlmIHRoZXkncmUgYW4gYWRtaW4gb3Igbm90XHJcbiAgICAgICAgICAgIHRoaXMuc2V0VXBkYXRlU3RhdGUodHJ1ZSk7XHJcbiAgICAgICAgICAgIHRoaXMuJHNjb3BlLmxvYWRpbmdNZXNzYWdlID0gXCJSZXRyaWV2aW5nIHVzZXIgaW5mb3JtYXRpb24uLi5cIjtcclxuICAgICAgICAgICAgdGhpcy4kc2NvcGUuZXJyb3IgPSBcIlwiO1xyXG4gICAgICAgICAgICB1c2VyU2VydmljZS5nZXRVc2VySW5mbygkc2NvcGUudXNlckluZm8udXNlck5hbWUpXHJcbiAgICAgICAgICAgICAgICAudGhlbigodXNlckluZm86IE1vZGVsLlVzZXJJbmZvKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnN5c3RlbVVzZXJJbmZvID0gdXNlckluZm87XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGludWVBZnRlclVzZXJMb2FkKCk7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgKHJlYXNvbjogYW55KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnN5c3RlbVVzZXJJbmZvID0gbnVsbDtcclxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZUFmdGVyVXNlckxvYWQoKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGxvZ2luKCk6IHZvaWQge1xyXG4gICAgICAgICAgICB0aGlzLmFkYWxBdXRoZW50aWNhdGlvblNlcnZpY2UubG9naW4oKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBsb2dpbldpdGhNZmEoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYWRhbEF1dGhlbnRpY2F0aW9uU2VydmljZS5sb2dpbih7IGFtcl92YWx1ZXM6ICdtZmEnIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGxvZ291dCgpOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy5hZGFsQXV0aGVudGljYXRpb25TZXJ2aWNlLmxvZ091dCgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGlzQWN0aXZlKHZpZXdMb2NhdGlvbik6IGJvb2xlYW4ge1xyXG4gICAgICAgICAgICByZXR1cm4gdmlld0xvY2F0aW9uID09PSB0aGlzLiRsb2NhdGlvbi5wYXRoKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgc2V0VGl0bGVGb3JSb3V0ZShyb3V0ZTogbmcucm91dGUuSVJvdXRlKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMuJHJvb3RTY29wZS50aXRsZSA9IFwiRFggTGlxdWlkIEludGVsbGlnZW5jZSAtIFwiICsgcm91dGUubmFtZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByb3RlY3RlZCBzZXRFcnJvcihlcnJvcjogYm9vbGVhbiwgbWVzc2FnZTogYW55LCByZXNwb25zZUhlYWRlcnM6IG5nLklIdHRwSGVhZGVyc0dldHRlcik6IHZvaWQge1xyXG4gICAgICAgICAgICB2YXIgYWNxdWlyZU1mYVJlc291cmNlID0gXCJcIjtcclxuICAgICAgICAgICAgaWYgKHJlc3BvbnNlSGVhZGVycyAhPSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBJZiB3ZSByZWNlaXZlZCBhIDQwMSBlcnJvciB3aXRoIFdXVy1BdXRoZW50aWNhdGUgcmVzcG9uc2UgaGVhZGVycywgd2UgbWF5IG5lZWQgdG8gXHJcbiAgICAgICAgICAgICAgICAvLyByZS1hdXRoZW50aWNhdGUgdG8gc2F0aXNmeSAyRkEgcmVxdWlyZW1lbnRzIGZvciB1bmRlcmx5aW5nIHNlcnZpY2VzIHVzZWQgYnkgdGhlIFdlYkFQSVxyXG4gICAgICAgICAgICAgICAgLy8gKGVnLiBSREZFKS4gSW4gdGhhdCBjYXNlLCB3ZSBuZWVkIHRvIGV4cGxpY2l0bHkgc3BlY2lmeSB0aGUgbmFtZSBvZiB0aGUgcmVzb3VyY2Ugd2VcclxuICAgICAgICAgICAgICAgIC8vIHdhbnQgMkZBIGF1dGhlbnRpY2F0aW9uIHRvLlxyXG4gICAgICAgICAgICAgICAgdmFyIHd3d0F1dGggPSByZXNwb25zZUhlYWRlcnMoXCJ3d3ctYXV0aGVudGljYXRlXCIpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHd3d0F1dGgpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBIYW5kbGUgdGhlIG11bHRpcGxlIHd3dy1hdXRoZW50aWNhdGUgaGVhZGVycyBjYXNlXHJcbiAgICAgICAgICAgICAgICAgICAgYW5ndWxhci5mb3JFYWNoKHd3d0F1dGguc3BsaXQoXCIsXCIpLCAoYXV0aFNjaGVtZTogc3RyaW5nLCBpbmRleDogbnVtYmVyKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwYXJhbXNEZWxpbSA9IGF1dGhTY2hlbWUuaW5kZXhPZihcIiBcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwYXJhbXNEZWxpbSAhPSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHBhcmFtcyA9IGF1dGhTY2hlbWUuc3Vic3RyKHBhcmFtc0RlbGltICsgMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcGFyYW1zVmFsdWVzID0gcGFyYW1zLnNwbGl0KFwiPVwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwYXJhbXNWYWx1ZXNbMF0gPT09IFwiaW50ZXJhY3Rpb25fcmVxdWlyZWRcIikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjcXVpcmVNZmFSZXNvdXJjZSA9IHBhcmFtc1ZhbHVlc1sxXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChhY3F1aXJlTWZhUmVzb3VyY2UpIHtcclxuICAgICAgICAgICAgICAgIC8vIFRoZSBXZWJBUEkgbmVlZHMgMkZBIGF1dGhlbnRpY2F0aW9uIHRvIGJlIGFibGUgdG8gYWNjZXNzIGl0cyByZXNvdXJjZXNcclxuICAgICAgICAgICAgICAgIHRoaXMubG9naW5XaXRoTWZhKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCQuaXNQbGFpbk9iamVjdChtZXNzYWdlKSkge1xyXG4gICAgICAgICAgICAgICAgbWVzc2FnZSA9ICQubWFwKFtcIk1lc3NhZ2VcIiwgXCJFeGNlcHRpb25NZXNzYWdlXCIsIFwiRXhjZXB0aW9uVHlwZVwiXSwgKGF0dHJpYnV0ZU5hbWUpID0+IG1lc3NhZ2VbYXR0cmlidXRlTmFtZV0pXHJcbiAgICAgICAgICAgICAgICAgICAgLmpvaW4oXCIgLSBcIik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy4kc2NvcGUuZXJyb3JfY2xhc3MgPSBlcnJvciA/IFwiYWxlcnQtZGFuZ2VyXCIgOiBcImFsZXJ0LWluZm9cIjtcclxuICAgICAgICAgICAgdGhpcy4kc2NvcGUuZXJyb3IgPSBtZXNzYWdlO1xyXG4gICAgICAgICAgICB0aGlzLiRzY29wZS5sb2FkaW5nTWVzc2FnZSA9IFwiXCI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcm90ZWN0ZWQgc2V0VXBkYXRlU3RhdGUodXBkYXRlSW5Qcm9ncmVzczogYm9vbGVhbik6IHZvaWQge1xyXG4gICAgICAgICAgICB0aGlzLiRzY29wZS51cGRhdGVJblByb2dyZXNzID0gdXBkYXRlSW5Qcm9ncmVzcztcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0gIiwiLy8gICAgIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiAgQWxsIHJpZ2h0cyByZXNlcnZlZC5cclxuXHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9yZWZlcmVuY2VzL2luZGV4LmQudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9Db250cm9sbGVyQmFzZS50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9TZXJ2aWNlL1VzZXJTZXJ2aWNlLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL1NlcnZpY2UvVW50YXBwZEFwaVNlcnZpY2UudHNcIiAvPlxyXG5cclxubW9kdWxlIERYTGlxdWlkSW50ZWwuQXBwLkNvbnRyb2xsZXIge1xyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBVc2VyQ29udHJvbGxlciBleHRlbmRzIENvbnRyb2xsZXJCYXNlIHtcclxuICAgICAgICBzdGF0aWMgJGluamVjdCA9IFsnJHNjb3BlJywgJyRyb290U2NvcGUnLCAnYWRhbEF1dGhlbnRpY2F0aW9uU2VydmljZScsICckbG9jYXRpb24nLCAnJHdpbmRvdycsICckcm91dGUnLCAndXNlclNlcnZpY2UnLCAndW50YXBwZFNlcnZpY2UnXTtcclxuXHJcbiAgICAgICAgY29uc3RydWN0b3IoJHNjb3BlOiBNb2RlbC5JRFhMaXF1aWRJbnRlbFNjb3BlLFxyXG4gICAgICAgICAgICAkcm9vdFNjb3BlOiBNb2RlbC5JRFhMaXF1aWRJbnRlbFNjb3BlLFxyXG4gICAgICAgICAgICBhZGFsQXV0aGVudGljYXRpb25TZXJ2aWNlLFxyXG4gICAgICAgICAgICAkbG9jYXRpb246IG5nLklMb2NhdGlvblNlcnZpY2UsXHJcbiAgICAgICAgICAgICR3aW5kb3c6IG5nLklXaW5kb3dTZXJ2aWNlLFxyXG4gICAgICAgICAgICAkcm91dGU6IG5nLnJvdXRlLklSb3V0ZVNlcnZpY2UsXHJcbiAgICAgICAgICAgIHVzZXJTZXJ2aWNlOiBTZXJ2aWNlLlVzZXJTZXJ2aWNlLFxyXG4gICAgICAgICAgICBwcm90ZWN0ZWQgdW50YXBwZFNlcnZpY2U6IFNlcnZpY2UuVW50YXBwZEFwaVNlcnZpY2UpIHtcclxuXHJcbiAgICAgICAgICAgIHN1cGVyKCRzY29wZSwgJHJvb3RTY29wZSwgYWRhbEF1dGhlbnRpY2F0aW9uU2VydmljZSwgJGxvY2F0aW9uLCB1c2VyU2VydmljZSwgYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRUaXRsZUZvclJvdXRlKCRyb3V0ZS5jdXJyZW50KTtcclxuICAgICAgICAgICAgICAgICRzY29wZS5idXR0b25CYXJCdXR0b25zID0gW1xyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBNb2RlbC5CdXR0b25CYXJCdXR0b24oXCJDb21taXRcIiwgJHNjb3BlLCBcInVzZXJGb3JtLiR2YWxpZCAmJiB1c2VyRm9ybS4kZGlydHkgJiYgIXVwZGF0ZUluUHJvZ3Jlc3NcIiwgKCkgPT4gdGhpcy51cGRhdGUoKSwgdHJ1ZSksXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IE1vZGVsLkJ1dHRvbkJhckJ1dHRvbihcIlJldmVydFwiLCAkc2NvcGUsIFwiIXVwZGF0ZUluUHJvZ3Jlc3NcIiwgKCkgPT4gdGhpcy5wb3B1bGF0ZSgpLCBmYWxzZSlcclxuICAgICAgICAgICAgICAgIF07XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUudW50YXBwZEF1dGhlbnRpY2F0aW9uVXJpID0gYXdhaXQgdW50YXBwZFNlcnZpY2UuZ2V0VW50YXBwZEF1dGhVcmkoJHdpbmRvdy5sb2NhdGlvbi5vcmlnaW4pO1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLmRpc2Nvbm5lY3RVbnRhcHBkVXNlciA9ICgpID0+IHRoaXMuZGlzY29ubmVjdFVzZXIoKTtcclxuICAgICAgICAgICAgICAgICRzY29wZS51cGRhdGVVc2VySW5mbyA9ICgpID0+IHRoaXMudXBkYXRlKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBvcHVsYXRlKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBhc3luYyBwb3B1bGF0ZSgpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0VXBkYXRlU3RhdGUodHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRzY29wZS5sb2FkaW5nTWVzc2FnZSA9IFwiUmV0cmlldmluZyB1c2VyIGluZm9ybWF0aW9uLi4uXCI7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRzY29wZS5lcnJvciA9IFwiXCI7XHJcbiAgICAgICAgICAgICAgICBsZXQgdXNlckluZm8gPSBhd2FpdCB0aGlzLnVzZXJTZXJ2aWNlLmdldFVzZXJJbmZvKHRoaXMuJHNjb3BlLnVzZXJJbmZvLnVzZXJOYW1lKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuJHNjb3BlLnN5c3RlbVVzZXJJbmZvID0gdXNlckluZm87XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy4kcm9vdFNjb3BlLnVudGFwcGVkUG9zdEJhY2tUb2tlbikge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuJHNjb3BlLnN5c3RlbVVzZXJJbmZvLlVudGFwcGRBY2Nlc3NUb2tlbiA9IHRoaXMuJHJvb3RTY29wZS51bnRhcHBlZFBvc3RCYWNrVG9rZW47XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy4kcm9vdFNjb3BlLnVudGFwcGVkUG9zdEJhY2tUb2tlbiA9ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCB1bnRhcHBkVXNlclJlc3BvbnNlID0gYXdhaXQgdGhpcy51bnRhcHBkU2VydmljZS5nZXRVc2VySW5mbyh0aGlzLiRzY29wZS5zeXN0ZW1Vc2VySW5mby5VbnRhcHBkQWNjZXNzVG9rZW4pO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCB1bnRhcHBkVXNlckluZm8gPSB1bnRhcHBkVXNlclJlc3BvbnNlLnJlc3BvbnNlLnVzZXI7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy4kc2NvcGUuc3lzdGVtVXNlckluZm8uVW50YXBwZFVzZXJOYW1lID0gdW50YXBwZFVzZXJJbmZvLnVzZXJfbmFtZTtcclxuICAgICAgICAgICAgICAgICAgICAvLyBJZiBVbnRhcHBkIGhhcyBhIHVzZXIgaW1hZ2UsIGZvcmNlIHRoaXMgdG8gYmUgb3VyIGltYWdlXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHVudGFwcGRVc2VySW5mby51c2VyX2F2YXRhcikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLiRzY29wZS5zeXN0ZW1Vc2VySW5mby5UaHVtYm5haWxJbWFnZVVyaSA9IHVudGFwcGRVc2VySW5mby51c2VyX2F2YXRhcjsgXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMudXBkYXRlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFVwZGF0ZVN0YXRlKGZhbHNlKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuJHNjb3BlLmxvYWRpbmdNZXNzYWdlID0gXCJcIjtcclxuICAgICAgICAgICAgICAgIHRoaXMuJHNjb3BlLnVzZXJGb3JtLiRzZXRQcmlzdGluZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhdGNoIChleCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRFcnJvcih0cnVlLCBleC5kYXRhIHx8IGV4LnN0YXR1c1RleHQsIGV4LmhlYWRlcnMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIGFzeW5jIHVwZGF0ZSgpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuJHNjb3BlLmxvYWRpbmdNZXNzYWdlID0gXCJTYXZpbmcgdXNlciBpbmZvcm1hdGlvbi4uLlwiO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRVcGRhdGVTdGF0ZSh0cnVlKTtcclxuICAgICAgICAgICAgICAgIGxldCB1c2VySW5mbyA9IGF3YWl0IHRoaXMudXNlclNlcnZpY2UudXBkYXRlVXNlckluZm8odGhpcy4kc2NvcGUudXNlckluZm8udXNlck5hbWUsIHRoaXMuJHNjb3BlLnN5c3RlbVVzZXJJbmZvKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuJHNjb3BlLnN5c3RlbVVzZXJJbmZvID0gdXNlckluZm87XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFVwZGF0ZVN0YXRlKGZhbHNlKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuJHNjb3BlLmxvYWRpbmdNZXNzYWdlID0gXCJcIjtcclxuICAgICAgICAgICAgICAgIHRoaXMuJHNjb3BlLnVzZXJGb3JtLiRzZXRQcmlzdGluZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhdGNoIChleCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRFcnJvcih0cnVlLCBleC5kYXRhIHx8IGV4LnN0YXR1c1RleHQsIGV4LmhlYWRlcnMpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRVcGRhdGVTdGF0ZShmYWxzZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgZGlzY29ubmVjdFVzZXIoKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMuJHNjb3BlLnN5c3RlbVVzZXJJbmZvLlVudGFwcGRVc2VyTmFtZSA9ICcnO1xyXG4gICAgICAgICAgICB0aGlzLiRzY29wZS5zeXN0ZW1Vc2VySW5mby5VbnRhcHBkQWNjZXNzVG9rZW4gPSAnJztcclxuICAgICAgICAgICAgdGhpcy4kc2NvcGUuc3lzdGVtVXNlckluZm8uVGh1bWJuYWlsSW1hZ2VVcmkgPSAnJztcclxuICAgICAgICAgICAgdGhpcy51cGRhdGUoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0gIiwiLy8gICAgIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiAgQWxsIHJpZ2h0cyByZXNlcnZlZC5cclxuXHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9yZWZlcmVuY2VzL2luZGV4LmQudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9Db250cm9sbGVyQmFzZS50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9TZXJ2aWNlL1VudGFwcGRBcGlTZXJ2aWNlLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL1NlcnZpY2UvVm90ZVNlcnZpY2UudHNcIiAvPlxyXG5cclxubW9kdWxlIERYTGlxdWlkSW50ZWwuQXBwLkNvbnRyb2xsZXIge1xyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBWb3RlQmVlckNvbnRyb2xsZXIgZXh0ZW5kcyBDb250cm9sbGVyQmFzZSB7XHJcbiAgICAgICAgc3RhdGljICRpbmplY3QgPSBbJyRzY29wZScsICckcm9vdFNjb3BlJywgJ2FkYWxBdXRoZW50aWNhdGlvblNlcnZpY2UnLCAnJGxvY2F0aW9uJywgJyRyb3V0ZScsICd1c2VyU2VydmljZScsICd1bnRhcHBkU2VydmljZScsICd2b3RlU2VydmljZSddO1xyXG5cclxuICAgICAgICBjb25zdHJ1Y3Rvcigkc2NvcGU6IE1vZGVsLklEWExpcXVpZEludGVsU2NvcGUsXHJcbiAgICAgICAgICAgICRyb290U2NvcGU6IE1vZGVsLklEWExpcXVpZEludGVsU2NvcGUsXHJcbiAgICAgICAgICAgIGFkYWxBdXRoZW50aWNhdGlvblNlcnZpY2UsXHJcbiAgICAgICAgICAgICRsb2NhdGlvbjogbmcuSUxvY2F0aW9uU2VydmljZSxcclxuICAgICAgICAgICAgJHJvdXRlOiBuZy5yb3V0ZS5JUm91dGVTZXJ2aWNlLFxyXG4gICAgICAgICAgICB1c2VyU2VydmljZTogU2VydmljZS5Vc2VyU2VydmljZSxcclxuICAgICAgICAgICAgcHJvdGVjdGVkIHVudGFwcGRTZXJ2aWNlOiBTZXJ2aWNlLlVudGFwcGRBcGlTZXJ2aWNlLFxyXG4gICAgICAgICAgICBwcm90ZWN0ZWQgdm90ZVNlcnZpY2U6IFNlcnZpY2UuVm90ZVNlcnZpY2UpIHtcclxuXHJcbiAgICAgICAgICAgIHN1cGVyKCRzY29wZSwgJHJvb3RTY29wZSwgYWRhbEF1dGhlbnRpY2F0aW9uU2VydmljZSwgJGxvY2F0aW9uLCB1c2VyU2VydmljZSwgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRUaXRsZUZvclJvdXRlKCRyb3V0ZS5jdXJyZW50KTtcclxuICAgICAgICAgICAgICAgICRzY29wZS5idXR0b25CYXJCdXR0b25zID0gW1xyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBNb2RlbC5CdXR0b25CYXJCdXR0b24oXCJDb21taXRcIiwgJHNjb3BlLCBcInZvdGVGb3JtLiR2YWxpZCAmJiB2b3RlRm9ybS4kZGlydHkgJiYgIXVwZGF0ZUluUHJvZ3Jlc3NcIiwgKCkgPT4gdGhpcy51cGRhdGUoKSwgdHJ1ZSksXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IE1vZGVsLkJ1dHRvbkJhckJ1dHRvbihcIlJldmVydFwiLCAkc2NvcGUsIFwiIXVwZGF0ZUluUHJvZ3Jlc3NcIiwgKCkgPT4gdGhpcy5wb3B1bGF0ZSgpLCBmYWxzZSlcclxuICAgICAgICAgICAgICAgIF07XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuc2VhcmNoQmVlcnMgPSAoc2VhcmNoVGVybTogc3RyaW5nKSA9PiB0aGlzLnNlYXJjaEJlZXJzKHNlYXJjaFRlcm0pO1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLnVwZGF0ZVZvdGVzID0gKCkgPT4gdGhpcy51cGRhdGUoKTtcclxuICAgICAgICAgICAgICAgICRzY29wZS5jbGVhclZvdGUgPSAodm90ZSkgPT4gdGhpcy5yZXNldFZvdGUodm90ZSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBvcHVsYXRlKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBhc3luYyBzZWFyY2hCZWVycyhzZWFyY2hUZXJtOiBzdHJpbmcpOiBQcm9taXNlPE1vZGVsLkJlZXJJbmZvW10+IHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnVudGFwcGRTZXJ2aWNlLnNlYXJjaEJlZXJzKHNlYXJjaFRlcm0sIHRoaXMuJHNjb3BlLnN5c3RlbVVzZXJJbmZvLlVudGFwcGRBY2Nlc3NUb2tlbik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2F0Y2ggKGV4KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBub3JtYWxpemVWb3Rlc0FycmF5KHNvdXJjZVZvdGVzOiBNb2RlbC5Wb3RlW10pOiBNb2RlbC5Wb3RlW10ge1xyXG4gICAgICAgICAgICB3aGlsZSAoc291cmNlVm90ZXMubGVuZ3RoIDwgMikge1xyXG4gICAgICAgICAgICAgICAgc291cmNlVm90ZXMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgVm90ZUlkOiAwLFxyXG4gICAgICAgICAgICAgICAgICAgIFBlcnNvbm5lbE51bWJlcjogdGhpcy4kc2NvcGUuc3lzdGVtVXNlckluZm8uUGVyc29ubmVsTnVtYmVyLFxyXG4gICAgICAgICAgICAgICAgICAgIFZvdGVEYXRlOiBuZXcgRGF0ZSgpLFxyXG4gICAgICAgICAgICAgICAgICAgIFVudGFwcGRJZDogMFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgc291cmNlVm90ZXMuZm9yRWFjaCgodm90ZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdm90ZS5CZWVySW5mbyA9IHtcclxuICAgICAgICAgICAgICAgICAgICB1bnRhcHBkSWQ6IHZvdGUuVW50YXBwZElkLFxyXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IHZvdGUuQmVlck5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgYnJld2VyeTogdm90ZS5CcmV3ZXJ5XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICByZXR1cm4gc291cmNlVm90ZXM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIGFzeW5jIHBvcHVsYXRlKCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRVcGRhdGVTdGF0ZSh0cnVlKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuJHNjb3BlLmxvYWRpbmdNZXNzYWdlID0gXCJSZXRyaWV2aW5nIHByZXZpb3VzIHZvdGVzLi4uXCI7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRzY29wZS5lcnJvciA9IFwiXCI7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRzY29wZS52b3RlcyA9IHRoaXMubm9ybWFsaXplVm90ZXNBcnJheShhd2FpdCB0aGlzLnZvdGVTZXJ2aWNlLmdldFVzZXJWb3Rlcyh0aGlzLiRzY29wZS5zeXN0ZW1Vc2VySW5mby5QZXJzb25uZWxOdW1iZXIpKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0VXBkYXRlU3RhdGUoZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kc2NvcGUubG9hZGluZ01lc3NhZ2UgPSBcIlwiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhdGNoIChleCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRFcnJvcih0cnVlLCBleC5kYXRhIHx8IGV4LnN0YXR1c1RleHQsIGV4LmhlYWRlcnMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHJlc2V0Vm90ZSh2b3RlOiBNb2RlbC5Wb3RlKSB7XHJcbiAgICAgICAgICAgIC8vIERvbid0IHJlc2V0IHRoZSB2b3RlIGlkIGFzIHdlIG5lZWQgdG8gZGV0ZWN0IGlmIHRoaXMgaXMgYSBkZWxldGVcclxuICAgICAgICAgICAgdm90ZS5QZXJzb25uZWxOdW1iZXIgPSB0aGlzLiRzY29wZS5zeXN0ZW1Vc2VySW5mby5QZXJzb25uZWxOdW1iZXI7XHJcbiAgICAgICAgICAgIHZvdGUuVm90ZURhdGUgPSBuZXcgRGF0ZSgpO1xyXG4gICAgICAgICAgICB2b3RlLlVudGFwcGRJZCA9IDA7XHJcbiAgICAgICAgICAgIHZvdGUuQmVlck5hbWUgPSAnJztcclxuICAgICAgICAgICAgdm90ZS5CcmV3ZXJ5ID0gJyc7XHJcbiAgICAgICAgICAgIHZvdGUuQmVlckluZm8gPSBudWxsO1xyXG4gICAgICAgICAgICB0aGlzLiRzY29wZS52b3RlRm9ybS4kc2V0RGlydHkoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgYXN5bmMgdXBkYXRlKCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kc2NvcGUubG9hZGluZ01lc3NhZ2UgPSBcIlNhdmluZyB2b3Rlcy4uLlwiO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRVcGRhdGVTdGF0ZSh0cnVlKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuJHNjb3BlLnZvdGVzLmZvckVhY2goKHZvdGU6IE1vZGVsLlZvdGUpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodm90ZS5CZWVySW5mbykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2b3RlLlVudGFwcGRJZCA9IHZvdGUuQmVlckluZm8udW50YXBwZElkO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2b3RlLkJlZXJOYW1lID0gdm90ZS5CZWVySW5mby5uYW1lO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2b3RlLkJyZXdlcnkgPSB2b3RlLkJlZXJJbmZvLmJyZXdlcnk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRzY29wZS52b3RlcyA9IHRoaXMubm9ybWFsaXplVm90ZXNBcnJheShhd2FpdCB0aGlzLnZvdGVTZXJ2aWNlLnVwZGF0ZVVzZXJWb3Rlcyh0aGlzLiRzY29wZS5zeXN0ZW1Vc2VySW5mby5QZXJzb25uZWxOdW1iZXIsIHRoaXMuJHNjb3BlLnZvdGVzKSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRzY29wZS52b3RlRm9ybS4kc2V0UHJpc3RpbmUoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0VXBkYXRlU3RhdGUoZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kc2NvcGUuZXJyb3IgPSBcIlwiO1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kc2NvcGUubG9hZGluZ01lc3NhZ2UgPSBcIlwiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhdGNoIChleCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRFcnJvcih0cnVlLCBleC5kYXRhIHx8IGV4LnN0YXR1c1RleHQsIGV4LmhlYWRlcnMpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRVcGRhdGVTdGF0ZShmYWxzZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0gIiwiLy8gICAgIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiAgQWxsIHJpZ2h0cyByZXNlcnZlZC5cclxuXHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9yZWZlcmVuY2VzL2luZGV4LmQudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9Db250cm9sbGVyQmFzZS50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9TZXJ2aWNlL1VudGFwcGRBcGlTZXJ2aWNlLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL1NlcnZpY2UvVm90ZVNlcnZpY2UudHNcIiAvPlxyXG5cclxubW9kdWxlIERYTGlxdWlkSW50ZWwuQXBwLkNvbnRyb2xsZXIge1xyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBWb3RlUmVzdWx0c0NvbnRyb2xsZXIgZXh0ZW5kcyBDb250cm9sbGVyQmFzZSB7XHJcbiAgICAgICAgc3RhdGljICRpbmplY3QgPSBbJyRzY29wZScsICckcm9vdFNjb3BlJywgJ2FkYWxBdXRoZW50aWNhdGlvblNlcnZpY2UnLCAnJGxvY2F0aW9uJywgJyRyb3V0ZScsICd1c2VyU2VydmljZScsICd1bnRhcHBkU2VydmljZScsICd2b3RlU2VydmljZSddO1xyXG5cclxuICAgICAgICBjb25zdHJ1Y3Rvcigkc2NvcGU6IE1vZGVsLklEWExpcXVpZEludGVsU2NvcGUsXHJcbiAgICAgICAgICAgICRyb290U2NvcGU6IE1vZGVsLklEWExpcXVpZEludGVsU2NvcGUsXHJcbiAgICAgICAgICAgIGFkYWxBdXRoZW50aWNhdGlvblNlcnZpY2UsXHJcbiAgICAgICAgICAgICRsb2NhdGlvbjogbmcuSUxvY2F0aW9uU2VydmljZSxcclxuICAgICAgICAgICAgJHJvdXRlOiBuZy5yb3V0ZS5JUm91dGVTZXJ2aWNlLFxyXG4gICAgICAgICAgICB1c2VyU2VydmljZTogU2VydmljZS5Vc2VyU2VydmljZSxcclxuICAgICAgICAgICAgcHJvdGVjdGVkIHVudGFwcGRTZXJ2aWNlOiBTZXJ2aWNlLlVudGFwcGRBcGlTZXJ2aWNlLFxyXG4gICAgICAgICAgICBwcm90ZWN0ZWQgdm90ZVNlcnZpY2U6IFNlcnZpY2UuVm90ZVNlcnZpY2UpIHtcclxuXHJcbiAgICAgICAgICAgIHN1cGVyKCRzY29wZSwgJHJvb3RTY29wZSwgYWRhbEF1dGhlbnRpY2F0aW9uU2VydmljZSwgJGxvY2F0aW9uLCB1c2VyU2VydmljZSwgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRUaXRsZUZvclJvdXRlKCRyb3V0ZS5jdXJyZW50KTtcclxuICAgICAgICAgICAgICAgICRzY29wZS5idXR0b25CYXJCdXR0b25zID0gW107XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBvcHVsYXRlKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBhc3luYyBwb3B1bGF0ZSgpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0VXBkYXRlU3RhdGUodHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRzY29wZS5sb2FkaW5nTWVzc2FnZSA9IFwiUmV0cmlldmluZyBjdXJyZW50IHZvdGUgdGFsbGllcy4uLlwiO1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kc2NvcGUuZXJyb3IgPSBcIlwiO1xyXG4gICAgICAgICAgICAgICAgbGV0IHZvdGVzVGFsbHkgPSBhd2FpdCB0aGlzLnZvdGVTZXJ2aWNlLmdldFZvdGVUYWxseSgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kc2NvcGUudm90ZXNUYWxseSA9IHZvdGVzVGFsbHk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRzY29wZS5sb2FkaW5nTWVzc2FnZSA9IFwiXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2F0Y2ggKGV4KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldEVycm9yKHRydWUsIGV4LmRhdGEgfHwgZXguc3RhdHVzVGV4dCwgZXguaGVhZGVycyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0gIiwiLy8gICAgIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiAgQWxsIHJpZ2h0cyByZXNlcnZlZC5cclxuXHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9yZWZlcmVuY2VzL2luZGV4LmQudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9Db250cm9sbGVyQmFzZS50c1wiIC8+XHJcblxyXG5tb2R1bGUgRFhMaXF1aWRJbnRlbC5BcHAuQ29udHJvbGxlciB7XHJcblxyXG4gICAgZXhwb3J0IGNsYXNzIEFuYWx5dGljc0NvbnRyb2xsZXIgZXh0ZW5kcyBDb250cm9sbGVyQmFzZSB7XHJcbiAgICAgICAgc3RhdGljICRpbmplY3QgPSBbJyRzY29wZScsICckcm9vdFNjb3BlJywgJ2FkYWxBdXRoZW50aWNhdGlvblNlcnZpY2UnLCAnJGxvY2F0aW9uJywgJyRyb3V0ZScsICd1c2VyU2VydmljZSddO1xyXG5cclxuICAgICAgICBjb25zdHJ1Y3Rvcigkc2NvcGU6IE1vZGVsLklEWExpcXVpZEludGVsU2NvcGUsXHJcbiAgICAgICAgICAgICRyb290U2NvcGU6IE1vZGVsLklEWExpcXVpZEludGVsU2NvcGUsXHJcbiAgICAgICAgICAgIGFkYWxBdXRoZW50aWNhdGlvblNlcnZpY2UsXHJcbiAgICAgICAgICAgICRsb2NhdGlvbjogbmcuSUxvY2F0aW9uU2VydmljZSxcclxuICAgICAgICAgICAgJHJvdXRlOiBuZy5yb3V0ZS5JUm91dGVTZXJ2aWNlLFxyXG4gICAgICAgICAgICB1c2VyU2VydmljZTogU2VydmljZS5Vc2VyU2VydmljZSkge1xyXG5cclxuICAgICAgICAgICAgc3VwZXIoJHNjb3BlLCAkcm9vdFNjb3BlLCBhZGFsQXV0aGVudGljYXRpb25TZXJ2aWNlLCAkbG9jYXRpb24sIHVzZXJTZXJ2aWNlLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFRpdGxlRm9yUm91dGUoJHJvdXRlLmN1cnJlbnQpO1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLmJ1dHRvbkJhckJ1dHRvbnMgPSBbXTtcclxuICAgICAgICAgICAgICAgIHRoaXMucG9wdWxhdGUoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIGFzeW5jIHBvcHVsYXRlKCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRVcGRhdGVTdGF0ZSh0cnVlKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuJHNjb3BlLmxvYWRpbmdNZXNzYWdlID0gXCJSZXRyaWV2aW5nIGJlZXIgYW5hbHl0aWNzLi4uXCI7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRzY29wZS5lcnJvciA9IFwiXCI7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRzY29wZS5sb2FkaW5nTWVzc2FnZSA9IFwiXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2F0Y2ggKGV4KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldEVycm9yKHRydWUsIGV4LmRhdGEgfHwgZXguc3RhdHVzVGV4dCwgZXguaGVhZGVycyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0gIiwiLy8gICAgIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiAgQWxsIHJpZ2h0cyByZXNlcnZlZC5cclxuXHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9yZWZlcmVuY2VzL2luZGV4LmQudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9Db250cm9sbGVyQmFzZS50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9TZXJ2aWNlL1VzZXJTZXJ2aWNlLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL1NlcnZpY2UvRGFzaGJvYXJkU2VydmljZS50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9TZXJ2aWNlL0tlZ3NTZXJ2aWNlLnRzXCIgLz5cclxuXHJcbm1vZHVsZSBEWExpcXVpZEludGVsLkFwcC5Db250cm9sbGVyIHtcclxuXHJcbiAgICBleHBvcnQgY2xhc3MgSG9tZUNvbnRyb2xsZXIgZXh0ZW5kcyBDb250cm9sbGVyQmFzZSB7XHJcbiAgICAgICAgc3RhdGljICRpbmplY3QgPSBbJyRzY29wZScsICckcm9vdFNjb3BlJywgJ2FkYWxBdXRoZW50aWNhdGlvblNlcnZpY2UnLCAnJGxvY2F0aW9uJywgJyRyb3V0ZScsICd1c2VyU2VydmljZScsICdkYXNoYm9hcmRTZXJ2aWNlJywgJ2tlZ3NTZXJ2aWNlJywgJyRpbnRlcnZhbCddO1xyXG5cclxuICAgICAgICBjb25zdHJ1Y3Rvcigkc2NvcGU6IE1vZGVsLklEWExpcXVpZEludGVsU2NvcGUsXHJcbiAgICAgICAgICAgICRyb290U2NvcGU6IE1vZGVsLklEWExpcXVpZEludGVsU2NvcGUsXHJcbiAgICAgICAgICAgIGFkYWxBdXRoZW50aWNhdGlvblNlcnZpY2UsXHJcbiAgICAgICAgICAgICRsb2NhdGlvbjogbmcuSUxvY2F0aW9uU2VydmljZSxcclxuICAgICAgICAgICAgJHJvdXRlOiBuZy5yb3V0ZS5JUm91dGVTZXJ2aWNlLFxyXG4gICAgICAgICAgICB1c2VyU2VydmljZTogU2VydmljZS5Vc2VyU2VydmljZSxcclxuICAgICAgICAgICAgcHJvdGVjdGVkIGRhc2hib2FyZFNlcnZpY2U6IFNlcnZpY2UuRGFzaGJvYXJkU2VydmljZSxcclxuICAgICAgICAgICAgcHJvdGVjdGVkIGtlZ3NTZXJ2aWNlOiBTZXJ2aWNlLktlZ3NTZXJ2aWNlLFxyXG4gICAgICAgICAgICAkaW50ZXJ2YWw6IG5nLklJbnRlcnZhbFNlcnZpY2UpIHtcclxuXHJcbiAgICAgICAgICAgIHN1cGVyKCRzY29wZSwgJHJvb3RTY29wZSwgYWRhbEF1dGhlbnRpY2F0aW9uU2VydmljZSwgJGxvY2F0aW9uLCB1c2VyU2VydmljZSwgKCkgPT4ge1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0VGl0bGVGb3JSb3V0ZSgkcm91dGUuY3VycmVudCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBvcHVsYXRlKCk7XHJcbiAgICAgICAgICAgICAgICB2YXIgaW50ZXJ2YWxQcm9taXNlID0gJGludGVydmFsKCgpID0+IHRoaXMucG9wdWxhdGUoKSwgNTAwMCk7ICAgICAgXHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuJG9uKCckZGVzdHJveScsICgpID0+ICRpbnRlcnZhbC5jYW5jZWwoaW50ZXJ2YWxQcm9taXNlKSk7ICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByb3RlY3RlZCBhc3luYyBwb3B1bGF0ZSgpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICAgICAgdGhpcy4kc2NvcGUuY3VycmVudFRhcHMgPSBhd2FpdCB0aGlzLmtlZ3NTZXJ2aWNlLmdldFRhcHNTdGF0dXMoKTtcclxuICAgICAgICAgICAgdGhpcy4kc2NvcGUuY3VycmVudEFjdGl2aXRpZXMgPSBhd2FpdCB0aGlzLmRhc2hib2FyZFNlcnZpY2UuZ2V0TGF0ZXN0QWN0aXZpdGllcygyNSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59ICIsIi8vICAgICBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gIEFsbCByaWdodHMgcmVzZXJ2ZWQuXHJcblxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vcmVmZXJlbmNlcy9pbmRleC5kLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vQ29udHJvbGxlckJhc2UudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vU2VydmljZS9BZG1pblNlcnZpY2UudHNcIiAvPlxyXG5cclxubW9kdWxlIERYTGlxdWlkSW50ZWwuQXBwLkNvbnRyb2xsZXIge1xyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBBdXRob3JpemVkR3JvdXBzQ29udHJvbGxlciBleHRlbmRzIENvbnRyb2xsZXJCYXNlIHtcclxuICAgICAgICBzdGF0aWMgJGluamVjdCA9IFsnJHNjb3BlJywgJyRyb290U2NvcGUnLCAnYWRhbEF1dGhlbnRpY2F0aW9uU2VydmljZScsICckbG9jYXRpb24nLCAnJHJvdXRlJywgJ3VzZXJTZXJ2aWNlJywgJ2FkbWluU2VydmljZSddO1xyXG5cclxuICAgICAgICBjb25zdHJ1Y3Rvcigkc2NvcGU6IE1vZGVsLklEWExpcXVpZEludGVsU2NvcGUsXHJcbiAgICAgICAgICAgICRyb290U2NvcGU6IE1vZGVsLklEWExpcXVpZEludGVsU2NvcGUsXHJcbiAgICAgICAgICAgIGFkYWxBdXRoZW50aWNhdGlvblNlcnZpY2UsXHJcbiAgICAgICAgICAgICRsb2NhdGlvbjogbmcuSUxvY2F0aW9uU2VydmljZSxcclxuICAgICAgICAgICAgJHJvdXRlOiBuZy5yb3V0ZS5JUm91dGVTZXJ2aWNlLFxyXG4gICAgICAgICAgICB1c2VyU2VydmljZTogU2VydmljZS5Vc2VyU2VydmljZSxcclxuICAgICAgICAgICAgcHJvdGVjdGVkIGFkbWluU2VydmljZTogU2VydmljZS5BZG1pblNlcnZpY2UpIHtcclxuXHJcbiAgICAgICAgICAgIHN1cGVyKCRzY29wZSwgJHJvb3RTY29wZSwgYWRhbEF1dGhlbnRpY2F0aW9uU2VydmljZSwgJGxvY2F0aW9uLCB1c2VyU2VydmljZSwgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRUaXRsZUZvclJvdXRlKCRyb3V0ZS5jdXJyZW50KTtcclxuICAgICAgICAgICAgICAgICRzY29wZS5idXR0b25CYXJCdXR0b25zID0gW1xyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBNb2RlbC5CdXR0b25CYXJCdXR0b24oXCJDb21taXRcIiwgJHNjb3BlLCBcImF1dGhvcml6ZWRHcm91cHNGb3JtLiR2YWxpZCAmJiBhdXRob3JpemVkR3JvdXBzRm9ybS4kZGlydHkgJiYgIXVwZGF0ZUluUHJvZ3Jlc3NcIiwgKCkgPT4gdGhpcy51cGRhdGUoKSwgdHJ1ZSksXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IE1vZGVsLkJ1dHRvbkJhckJ1dHRvbihcIlJldmVydFwiLCAkc2NvcGUsIFwiIXVwZGF0ZUluUHJvZ3Jlc3NcIiwgKCkgPT4gdGhpcy5wb3B1bGF0ZSgpLCBmYWxzZSlcclxuICAgICAgICAgICAgICAgIF07XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuYWRkR3JvdXAgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuJHNjb3BlLm5ld0dyb3VwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuJHNjb3BlLmF1dGhvcml6ZWRHcm91cHMuQXV0aG9yaXplZEdyb3Vwcy5wdXNoKHRoaXMuJHNjb3BlLm5ld0dyb3VwLmRpc3BsYXlOYW1lKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy4kc2NvcGUubmV3R3JvdXAgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgJHNjb3BlLmRlbGV0ZUdyb3VwID0gKGdyb3VwOiBzdHJpbmcpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLiRzY29wZS5hdXRob3JpemVkR3JvdXBzLkF1dGhvcml6ZWRHcm91cHMuc3BsaWNlKHRoaXMuJHNjb3BlLmF1dGhvcml6ZWRHcm91cHMuQXV0aG9yaXplZEdyb3Vwcy5pbmRleE9mKGdyb3VwKSwgMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy4kc2NvcGUuYXV0aG9yaXplZEdyb3Vwc0Zvcm0uJHNldERpcnR5KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuc2VhcmNoR3JvdXBzID0gKHNlYXJjaFRlcm06IHN0cmluZykgPT4gdGhpcy5zZWFyY2hHcm91cHMoc2VhcmNoVGVybSk7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUudXBkYXRlQXV0aG9yaXplZEdyb3VwcyA9ICgpID0+IHRoaXMudXBkYXRlKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBvcHVsYXRlKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBhc3luYyBzZWFyY2hHcm91cHMoc2VhcmNoVGVybTogc3RyaW5nKTogUHJvbWlzZTxhbnk+IHtcclxuICAgICAgICAgICAgdmFyIHJlc3VsdHMgPSBhd2FpdCB0aGlzLmFkbWluU2VydmljZS5zZWFyY2hHcm91cHMoc2VhcmNoVGVybSk7XHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHRzLnJlc3VsdHM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIGFzeW5jIHBvcHVsYXRlKCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRVcGRhdGVTdGF0ZSh0cnVlKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuJHNjb3BlLmxvYWRpbmdNZXNzYWdlID0gXCJSZXRyaWV2aW5nIGF1dGhvcml6ZWQgZ3JvdXBzLi4uXCI7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRzY29wZS5lcnJvciA9IFwiXCI7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRzY29wZS5hdXRob3JpemVkR3JvdXBzID0gYXdhaXQgdGhpcy5hZG1pblNlcnZpY2UuZ2V0QXV0aG9yaXplZEdyb3VwcygpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRVcGRhdGVTdGF0ZShmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRzY29wZS5sb2FkaW5nTWVzc2FnZSA9IFwiXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2F0Y2ggKGV4KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldEVycm9yKHRydWUsIGV4LmRhdGEgfHwgZXguc3RhdHVzVGV4dCwgZXguaGVhZGVycyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgYXN5bmMgdXBkYXRlKCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kc2NvcGUubG9hZGluZ01lc3NhZ2UgPSBcIlNhdmluZyBhdXRob3JpemVkIGdyb3Vwcy4uLlwiO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRVcGRhdGVTdGF0ZSh0cnVlKTtcclxuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuYWRtaW5TZXJ2aWNlLnVwZGF0ZUF1dGhvcml6ZWRHcm91cHModGhpcy4kc2NvcGUuYXV0aG9yaXplZEdyb3Vwcyk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRzY29wZS5hdXRob3JpemVkR3JvdXBzRm9ybS4kc2V0UHJpc3RpbmUoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0VXBkYXRlU3RhdGUoZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kc2NvcGUuZXJyb3IgPSBcIlwiO1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kc2NvcGUubG9hZGluZ01lc3NhZ2UgPSBcIlwiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhdGNoIChleCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRFcnJvcih0cnVlLCBleC5kYXRhIHx8IGV4LnN0YXR1c1RleHQsIGV4LmhlYWRlcnMpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRVcGRhdGVTdGF0ZShmYWxzZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0gIiwiLy8gICAgIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiAgQWxsIHJpZ2h0cyByZXNlcnZlZC5cclxuXHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9yZWZlcmVuY2VzL2luZGV4LmQudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9Db250cm9sbGVyQmFzZS50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9TZXJ2aWNlL0tlZ3NTZXJ2aWNlLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL1NlcnZpY2UvVW50YXBwZEFwaVNlcnZpY2UudHNcIiAvPlxyXG5cclxubW9kdWxlIERYTGlxdWlkSW50ZWwuQXBwLkNvbnRyb2xsZXIge1xyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBJbnN0YWxsS2Vnc0NvbnRyb2xsZXIgZXh0ZW5kcyBDb250cm9sbGVyQmFzZSB7XHJcbiAgICAgICAgc3RhdGljICRpbmplY3QgPSBbJyRzY29wZScsICckcm9vdFNjb3BlJywgJ2FkYWxBdXRoZW50aWNhdGlvblNlcnZpY2UnLCAnJGxvY2F0aW9uJywgJyRyb3V0ZScsICd1c2VyU2VydmljZScsICdrZWdzU2VydmljZScsICd1bnRhcHBkU2VydmljZSddO1xyXG5cclxuICAgICAgICBjb25zdHJ1Y3Rvcigkc2NvcGU6IE1vZGVsLklEWExpcXVpZEludGVsU2NvcGUsXHJcbiAgICAgICAgICAgICRyb290U2NvcGU6IE1vZGVsLklEWExpcXVpZEludGVsU2NvcGUsXHJcbiAgICAgICAgICAgIGFkYWxBdXRoZW50aWNhdGlvblNlcnZpY2UsXHJcbiAgICAgICAgICAgICRsb2NhdGlvbjogbmcuSUxvY2F0aW9uU2VydmljZSxcclxuICAgICAgICAgICAgJHJvdXRlOiBuZy5yb3V0ZS5JUm91dGVTZXJ2aWNlLFxyXG4gICAgICAgICAgICB1c2VyU2VydmljZTogU2VydmljZS5Vc2VyU2VydmljZSxcclxuICAgICAgICAgICAgcHJvdGVjdGVkIGtlZ3NTZXJ2aWNlOiBTZXJ2aWNlLktlZ3NTZXJ2aWNlLFxyXG4gICAgICAgICAgICBwcm90ZWN0ZWQgdW50YXBwZFNlcnZpY2U6IFNlcnZpY2UuVW50YXBwZEFwaVNlcnZpY2UpIHtcclxuXHJcbiAgICAgICAgICAgIHN1cGVyKCRzY29wZSwgJHJvb3RTY29wZSwgYWRhbEF1dGhlbnRpY2F0aW9uU2VydmljZSwgJGxvY2F0aW9uLCB1c2VyU2VydmljZSwgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRUaXRsZUZvclJvdXRlKCRyb3V0ZS5jdXJyZW50KTtcclxuICAgICAgICAgICAgICAgICRzY29wZS5idXR0b25CYXJCdXR0b25zID0gW1xyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBNb2RlbC5CdXR0b25CYXJCdXR0b24oXCJDb21taXRcIiwgJHNjb3BlLCBcImluc3RhbGxLZWdzRm9ybS4kdmFsaWQgJiYgaW5zdGFsbEtlZ3NGb3JtLiRkaXJ0eSAmJiAhdXBkYXRlSW5Qcm9ncmVzc1wiLCAoKSA9PiB0aGlzLnVwZGF0ZSgpLCB0cnVlKSxcclxuICAgICAgICAgICAgICAgICAgICBuZXcgTW9kZWwuQnV0dG9uQmFyQnV0dG9uKFwiUmV2ZXJ0XCIsICRzY29wZSwgXCIhdXBkYXRlSW5Qcm9ncmVzc1wiLCAoKSA9PiB0aGlzLnBvcHVsYXRlKCksIGZhbHNlKVxyXG4gICAgICAgICAgICAgICAgXTtcclxuICAgICAgICAgICAgICAgICRzY29wZS5zZWFyY2hCZWVycyA9IChzZWFyY2hUZXJtOiBzdHJpbmcpID0+IHRoaXMuc2VhcmNoQmVlcnMoc2VhcmNoVGVybSk7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUudXBkYXRlSW5zdGFsbEtlZ3MgPSAoKSA9PiB0aGlzLnVwZGF0ZSgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wb3B1bGF0ZSgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgYXN5bmMgc2VhcmNoQmVlcnMoc2VhcmNoVGVybTogc3RyaW5nKTogUHJvbWlzZTxNb2RlbC5CZWVySW5mb1tdPiB7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy51bnRhcHBkU2VydmljZS5zZWFyY2hCZWVycyhzZWFyY2hUZXJtLCB0aGlzLiRzY29wZS5zeXN0ZW1Vc2VySW5mby5VbnRhcHBkQWNjZXNzVG9rZW4pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhdGNoIChleCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgYXN5bmMgcG9wdWxhdGUoKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFVwZGF0ZVN0YXRlKHRydWUpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kc2NvcGUubG9hZGluZ01lc3NhZ2UgPSBcIlJldHJpZXZpbmcgY3VycmVudCB0YXAgaW5mb3JtYXRpb24uLi5cIjtcclxuICAgICAgICAgICAgICAgIHRoaXMuJHNjb3BlLmVycm9yID0gXCJcIjtcclxuICAgICAgICAgICAgICAgIHRoaXMuJHNjb3BlLmN1cnJlbnRUYXBzID0gdGhpcy5ub3JtYWxpemVUYXBJbmZvKGF3YWl0IHRoaXMua2Vnc1NlcnZpY2UuZ2V0VGFwc1N0YXR1cygpLCB0cnVlKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0VXBkYXRlU3RhdGUoZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kc2NvcGUubG9hZGluZ01lc3NhZ2UgPSBcIlwiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhdGNoIChleCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRFcnJvcih0cnVlLCBleC5kYXRhIHx8IGV4LnN0YXR1c1RleHQsIGV4LmhlYWRlcnMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIGFzeW5jIHVwZGF0ZSgpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuJHNjb3BlLmxvYWRpbmdNZXNzYWdlID0gXCJJbnN0YWxsaW5nIG5ldyBrZWdzLi4uXCI7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFVwZGF0ZVN0YXRlKHRydWUpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kc2NvcGUuY3VycmVudFRhcHMgPSB0aGlzLm5vcm1hbGl6ZVRhcEluZm8oYXdhaXQgUHJvbWlzZS5hbGwodGhpcy4kc2NvcGUuY3VycmVudFRhcHMubWFwKGFzeW5jIHRhcEluZm8gPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0YXBJbmZvLk9yaWdpbmFsVW50YXBwZElkICE9PSB0YXBJbmZvLkJlZXJJbmZvLnVudGFwcGRJZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0YXBJbmZvLlVudGFwcGRJZCA9IHRhcEluZm8uQmVlckluZm8udW50YXBwZElkO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0YXBJbmZvLk5hbWUgPSB0YXBJbmZvLkJlZXJJbmZvLm5hbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhcEluZm8uQmVlclR5cGUgPSB0YXBJbmZvLkJlZXJJbmZvLmJlZXJfdHlwZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGFwSW5mby5JQlUgPSB0YXBJbmZvLkJlZXJJbmZvLmlidTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGFwSW5mby5BQlYgPSB0YXBJbmZvLkJlZXJJbmZvLmFidjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGFwSW5mby5CZWVyRGVzY3JpcHRpb24gPSB0YXBJbmZvLkJlZXJJbmZvLmRlc2NyaXB0aW9uO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0YXBJbmZvLkJyZXdlcnkgPSB0YXBJbmZvLkJlZXJJbmZvLmJyZXdlcnk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhcEluZm8uaW1hZ2VQYXRoID0gdGFwSW5mby5CZWVySW5mby5pbWFnZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGFwSW5mby5DdXJyZW50Vm9sdW1lID0gdGFwSW5mby5LZWdTaXplO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbmV3S2VnID0gYXdhaXQgdGhpcy5rZWdzU2VydmljZS5jcmVhdGVOZXdLZWcodGFwSW5mbyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMua2Vnc1NlcnZpY2UuaW5zdGFsbEtlZ09uVGFwKHRhcEluZm8uVGFwSWQsIG5ld0tlZy5LZWdJZCwgdGFwSW5mby5LZWdTaXplKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGFwSW5mby5LZWdJZCA9IG5ld0tlZy5LZWdJZDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRhcEluZm87XHJcbiAgICAgICAgICAgICAgICB9KSksIHRydWUpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy4kc2NvcGUuaW5zdGFsbEtlZ3NGb3JtLiRzZXRQcmlzdGluZSgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRVcGRhdGVTdGF0ZShmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRzY29wZS5lcnJvciA9IFwiXCI7XHJcbiAgICAgICAgICAgICAgICB0aGlzLiRzY29wZS5sb2FkaW5nTWVzc2FnZSA9IFwiXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2F0Y2ggKGV4KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldEVycm9yKHRydWUsIGV4LmRhdGEgfHwgZXguc3RhdHVzVGV4dCwgZXguaGVhZGVycyk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFVwZGF0ZVN0YXRlKGZhbHNlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBub3JtYWxpemVUYXBJbmZvKGN1cnJlbnRUYXBzOiBNb2RlbC5UYXBJbmZvW10sIGluY2x1ZGVFbXB0eVRhcHM6IGJvb2xlYW4pOiBNb2RlbC5UYXBJbmZvW10ge1xyXG4gICAgICAgICAgICBpZiAoaW5jbHVkZUVtcHR5VGFwcyAmJiBjdXJyZW50VGFwcy5sZW5ndGggPCAyKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBJZiB3ZSBkb24ndCBjdXJyZW50bHkgaGF2ZSBhIGtlZyBpbnN0YWxsZWQgb24gZWl0aGVyIHRhcCwgdGhlbiBjcmVhdGUgYW4gZW1wdHkgb2JqZWN0XHJcbiAgICAgICAgICAgICAgICBpZiAoIWN1cnJlbnRUYXBzWzBdIHx8IGN1cnJlbnRUYXBzWzBdLlRhcElkICE9IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICBjdXJyZW50VGFwcy51bnNoaWZ0KHRoaXMuY3JlYXRlRW1wdHlUYXAoMSkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKCFjdXJyZW50VGFwc1sxXSB8fCBjdXJyZW50VGFwc1sxXS5UYXBJZCAhPSAyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudFRhcHMucHVzaCh0aGlzLmNyZWF0ZUVtcHR5VGFwKDIpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gY3VycmVudFRhcHMubWFwKHRhcEluZm8gPT4ge1xyXG4gICAgICAgICAgICAgICAgdGFwSW5mby5CZWVySW5mbyA9IHtcclxuICAgICAgICAgICAgICAgICAgICB1bnRhcHBkSWQ6IHRhcEluZm8uVW50YXBwZElkLFxyXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IHRhcEluZm8uTmFtZSxcclxuICAgICAgICAgICAgICAgICAgICBiZWVyX3R5cGU6IHRhcEluZm8uQmVlclR5cGUsXHJcbiAgICAgICAgICAgICAgICAgICAgaWJ1OiB0YXBJbmZvLklCVSxcclxuICAgICAgICAgICAgICAgICAgICBhYnY6IHRhcEluZm8uQUJWLFxyXG4gICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiB0YXBJbmZvLkJlZXJEZXNjcmlwdGlvbixcclxuICAgICAgICAgICAgICAgICAgICBicmV3ZXJ5OiB0YXBJbmZvLkJyZXdlcnksXHJcbiAgICAgICAgICAgICAgICAgICAgaW1hZ2U6IHRhcEluZm8uaW1hZ2VQYXRoXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgdGFwSW5mby5PcmlnaW5hbFVudGFwcGRJZCA9IHRhcEluZm8uVW50YXBwZElkO1xyXG4gICAgICAgICAgICAgICAgdGFwSW5mby5nZXRTZXRCZWVySW5mbyA9IChiZWVySW5mbykgPT4gdGhpcy5nZXRTZXRCZWVySW5mbyh0YXBJbmZvLCBiZWVySW5mbyk7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIHJldHVybiB0YXBJbmZvO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgZ2V0U2V0QmVlckluZm8odGFwSW5mbzogTW9kZWwuVGFwSW5mbywgYmVlckluZm86IGFueSk6IE1vZGVsLkJlZXJJbmZvIHtcclxuICAgICAgICAgICAgaWYgKGFuZ3VsYXIuaXNEZWZpbmVkKGJlZXJJbmZvKSkge1xyXG4gICAgICAgICAgICAgICAgLy8gSWYgdGhlIHR5cGVhaGVhZCBpc24ndCBib3VuZCB0byBhIHBvcHVwIHNlbGVjdGlvbiwgd2UganVzdCBnZXQgdGhlIHN0cmluZ1xyXG4gICAgICAgICAgICAgICAgaWYgKGFuZ3VsYXIuaXNTdHJpbmcoYmVlckluZm8pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGFwSW5mby5CZWVySW5mbyA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdW50YXBwZElkOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBiZWVySW5mb1xyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChhbmd1bGFyLmlzT2JqZWN0PE1vZGVsLkJlZXJJbmZvPihiZWVySW5mbykpIHtcclxuICAgICAgICAgICAgICAgICAgICB0YXBJbmZvLkJlZXJJbmZvID0gPE1vZGVsLkJlZXJJbmZvPmJlZXJJbmZvO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdUeXBlYWRoZWFkIGJpbmRpbmcgdG8gdW5leHBlY3RlZCBkYXRhOiAnICsgYmVlckluZm8pO1xyXG4gICAgICAgICAgICAgICAgICAgIHRhcEluZm8uQmVlckluZm8gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVudGFwcGRJZDogbnVsbCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogJydcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB0YXBJbmZvLkJlZXJJbmZvO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBjcmVhdGVFbXB0eVRhcCh0YXBJZDogbnVtYmVyKTogTW9kZWwuVGFwSW5mbyB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBUYXBJZDogdGFwSWQsXHJcbiAgICAgICAgICAgICAgICBJbnN0YWxsRGF0ZTogbmV3IERhdGUoKSxcclxuICAgICAgICAgICAgICAgIEtlZ1NpemU6IDAsXHJcbiAgICAgICAgICAgICAgICBDdXJyZW50Vm9sdW1lOiAwLFxyXG4gICAgICAgICAgICAgICAgS2VnSWQ6IG51bGwsXHJcbiAgICAgICAgICAgICAgICBOYW1lOiAnJyxcclxuICAgICAgICAgICAgICAgIFVudGFwcGRJZDogMCxcclxuICAgICAgICAgICAgICAgIEJyZXdlcnk6ICcnLFxyXG4gICAgICAgICAgICAgICAgQmVlclR5cGU6ICcnLFxyXG4gICAgICAgICAgICAgICAgQmVlckRlc2NyaXB0aW9uOiAnJyxcclxuICAgICAgICAgICAgICAgIGltYWdlUGF0aDogJydcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0gIiwiLy8gICAgIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiAgQWxsIHJpZ2h0cyByZXNlcnZlZC5cclxuXHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL3JlZmVyZW5jZXMvaW5kZXguZC50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL1NlcnZpY2UvVXNlclNlcnZpY2UudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9TZXJ2aWNlL1ZvdGVTZXJ2aWNlLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vU2VydmljZS9EYXNoYm9hcmRTZXJ2aWNlLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vU2VydmljZS9LZWdzU2VydmljZS50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL1NlcnZpY2UvQWRtaW5TZXJ2aWNlLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vU2VydmljZS9VbnRhcHBkQXBpU2VydmljZS50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL1NlcnZpY2UvQ29uZmlnU2VydmljZS50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL0NvbnRyb2xsZXIvVXNlckNvbnRyb2xsZXIudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9Db250cm9sbGVyL1ZvdGVCZWVyQ29udHJvbGxlci50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL0NvbnRyb2xsZXIvVm90ZVJlc3VsdHNDb250cm9sbGVyLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vQ29udHJvbGxlci9BbmFseXRpY3NDb250cm9sbGVyLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vQ29udHJvbGxlci9Ib21lQ29udHJvbGxlci50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL0NvbnRyb2xsZXIvQXV0aG9yaXplZEdyb3Vwc0NvbnRyb2xsZXIudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9Db250cm9sbGVyL0luc3RhbGxLZWdzQ29udHJvbGxlci50c1wiIC8+XHJcblxyXG5tb2R1bGUgRFhMaXF1aWRJbnRlbC5BcHAge1xyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBBcHBCdWlsZGVyIHtcclxuXHJcbiAgICAgICAgcHJpdmF0ZSBhcHA6IG5nLklNb2R1bGU7XHJcblxyXG4gICAgICAgIGNvbnN0cnVjdG9yKG5hbWU6IHN0cmluZykge1xyXG4gICAgICAgICAgICB0aGlzLmFwcCA9IGFuZ3VsYXIubW9kdWxlKG5hbWUsIFtcclxuICAgICAgICAgICAgICAgIC8vIEFuZ3VsYXIgbW9kdWxlcyBcclxuICAgICAgICAgICAgICAgIFwibmdSb3V0ZVwiLFxyXG4gICAgICAgICAgICAgICAgXCJuZ1Jlc291cmNlXCIsXHJcbiAgICAgICAgICAgICAgICBcInVpLmJvb3RzdHJhcFwiLFxyXG4gICAgICAgICAgICAgICAgXCJlbnZpcm9ubWVudFwiLFxyXG4gICAgICAgICAgICAgICAgLy8gQURBTFxyXG4gICAgICAgICAgICAgICAgJ0FkYWxBbmd1bGFyJ1xyXG4gICAgICAgICAgICBdKTtcclxuICAgICAgICAgICAgdGhpcy5hcHAuY29uZmlnKFsnJHJvdXRlUHJvdmlkZXInLCAnJGh0dHBQcm92aWRlcicsICdhZGFsQXV0aGVudGljYXRpb25TZXJ2aWNlUHJvdmlkZXInLCAnZW52U2VydmljZVByb3ZpZGVyJyxcclxuICAgICAgICAgICAgICAgICgkcm91dGVQcm92aWRlcjogbmcucm91dGUuSVJvdXRlUHJvdmlkZXIsICRodHRwUHJvdmlkZXI6IG5nLklIdHRwUHJvdmlkZXIsIGFkYWxQcm92aWRlciwgZW52U2VydmljZVByb3ZpZGVyOiBhbmd1bGFyLmVudmlyb25tZW50LlNlcnZpY2VQcm92aWRlcikgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGVudlNlcnZpY2VQcm92aWRlci5jb25maWcoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkb21haW5zOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXZlbG9wbWVudDogWydsb2NhbGhvc3QnXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBwZTogWydkeC1saXF1aWRhcHAtc3RhZ2luZy5henVyZXdlYnNpdGVzLm5ldCddLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXNlcmFwcDogWydkeC1saXF1aWRhcHAtdXNlcmFwcC5henVyZXdlYnNpdGVzLm5ldCddLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvZHVjdGlvbjogWydkeC1saXF1aWRhcHAuYXp1cmV3ZWJzaXRlcy5uZXQnXVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXJzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXZlbG9wbWVudDoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwaVVyaTogJy8vbG9jYWxob3N0OjgwODAvYXBpJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW5hbnQ6ICdtaWNyb3NvZnQuY29tJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHBDbGllbnRJZDogJzM1YTMzY2ZjLWZjNTItNDhjZi05MGY0LTIzYWQ2OWVmODViYycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBpQ2xpZW50SWQ6ICdiMWU4MDc0OC00M2MyLTQ0NTAtOTEyMS1jYmMwZGNjOTgwNTEnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwaVVzZXJuYW1lOiAnMDAwMS0wMDAxJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcGlQYXNzd29yZDogJ1pIaHNhWEYxYVdRdGNtRnpjR0psY25KNWNHaz0nXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHBlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBpVXJpOiAnLy9keGxpcXVpZGludGVsLXN0YWdpbmcuYXp1cmV3ZWJzaXRlcy5uZXQvYXBpJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW5hbnQ6ICdtaWNyb3NvZnQuY29tJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHBDbGllbnRJZDogJzM1YTMzY2ZjLWZjNTItNDhjZi05MGY0LTIzYWQ2OWVmODViYycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBpQ2xpZW50SWQ6ICdiMWU4MDc0OC00M2MyLTQ0NTAtOTEyMS1jYmMwZGNjOTgwNTEnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwaVVzZXJuYW1lOiAnMDAwMS0wMDAxJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcGlQYXNzd29yZDogJ1pIaHNhWEYxYVdRdGNtRnpjR0psY25KNWNHaz0nXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXNlcmFwcDoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwaVVyaTogJy8vZHhsaXF1aWRpbnRlbC11c2VyYXBwLmF6dXJld2Vic2l0ZXMubmV0L2FwaScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVuYW50OiAnbWljcm9zb2Z0LmNvbScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwQ2xpZW50SWQ6ICczNWEzM2NmYy1mYzUyLTQ4Y2YtOTBmNC0yM2FkNjllZjg1YmMnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwaUNsaWVudElkOiAnYjFlODA3NDgtNDNjMi00NDUwLTkxMjEtY2JjMGRjYzk4MDUxJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcGlVc2VybmFtZTogJzAwMDEtMDAwMScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBpUGFzc3dvcmQ6ICdaSGhzYVhGMWFXUXRjbUZ6Y0dKbGNuSjVjR2s9J1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb2R1Y3Rpb246IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcGlVcmk6ICcvL2R4bGlxdWlkaW50ZWwuYXp1cmV3ZWJzaXRlcy5uZXQvYXBpJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW5hbnQ6ICdtaWNyb3NvZnQuY29tJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHBDbGllbnRJZDogJzM1YTMzY2ZjLWZjNTItNDhjZi05MGY0LTIzYWQ2OWVmODViYycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBpQ2xpZW50SWQ6ICdiMWU4MDc0OC00M2MyLTQ0NTAtOTEyMS1jYmMwZGNjOTgwNTEnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwaVVzZXJuYW1lOiAnMDAwMS0wMDAxJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcGlQYXNzd29yZDogJ1pIaHNhWEYxYVdRdGNtRnpjR0psY25KNWNHaz0nXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICBlbnZTZXJ2aWNlUHJvdmlkZXIuY2hlY2soKTtcclxuICAgICAgICAgICAgICAgICAgICAkcm91dGVQcm92aWRlclxyXG4gICAgICAgICAgICAgICAgICAgICAgICAud2hlbihcIi9Ib21lXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IFwiSG9tZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogQ29udHJvbGxlci5Ib21lQ29udHJvbGxlcixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBcIi92aWV3cy9ob21lLmh0bWxcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2VJbnNlbnNpdGl2ZU1hdGNoOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAud2hlbihcIi9Vc2VyXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YWRhbC5zaGFyZWQuSU5hdlJvdXRlPntcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBcIlVzZXJcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBDb250cm9sbGVyLlVzZXJDb250cm9sbGVyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBcIi9WaWV3cy9Vc2VyLmh0bWxcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXF1aXJlQURMb2dpbjogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlSW5zZW5zaXRpdmVNYXRjaDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgLndoZW4oXCIvVm90ZUJlZXJcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxhZGFsLnNoYXJlZC5JTmF2Um91dGU+e1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IFwiVm90ZUJlZXJcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBDb250cm9sbGVyLlZvdGVCZWVyQ29udHJvbGxlcixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogXCIvVmlld3MvVm90ZUJlZXIuaHRtbFwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcXVpcmVBRExvZ2luOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2VJbnNlbnNpdGl2ZU1hdGNoOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAud2hlbihcIi9Wb3RlUmVzdWx0c1wiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGFkYWwuc2hhcmVkLklOYXZSb3V0ZT57XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogXCJWb3RlUmVzdWx0c1wiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6IENvbnRyb2xsZXIuVm90ZVJlc3VsdHNDb250cm9sbGVyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBcIi9WaWV3cy9Wb3RlUmVzdWx0cy5odG1sXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVxdWlyZUFETG9naW46IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZUluc2Vuc2l0aXZlTWF0Y2g6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC53aGVuKFwiL0FuYWx5dGljc1wiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGFkYWwuc2hhcmVkLklOYXZSb3V0ZT57XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogXCJBbmFseXRpY3NcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBDb250cm9sbGVyLkFuYWx5dGljc0NvbnRyb2xsZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6IFwiL1ZpZXdzL0FuYWx5dGljcy5odG1sXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVxdWlyZUFETG9naW46IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZUluc2Vuc2l0aXZlTWF0Y2g6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC53aGVuKFwiL0F1dGhvcml6ZWRHcm91cHNcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxhZGFsLnNoYXJlZC5JTmF2Um91dGU+e1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IFwiQXV0aG9yaXplZEdyb3Vwc1wiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6IENvbnRyb2xsZXIuQXV0aG9yaXplZEdyb3Vwc0NvbnRyb2xsZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6IFwiL1ZpZXdzL0F1dGhvcml6ZWRHcm91cHMuaHRtbFwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcXVpcmVBRExvZ2luOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2VJbnNlbnNpdGl2ZU1hdGNoOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAud2hlbihcIi9JbnN0YWxsS2Vnc1wiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGFkYWwuc2hhcmVkLklOYXZSb3V0ZT57XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogXCJJbnN0YWxsS2Vnc1wiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6IENvbnRyb2xsZXIuSW5zdGFsbEtlZ3NDb250cm9sbGVyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBcIi9WaWV3cy9JbnN0YWxsS2Vncy5odG1sXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVxdWlyZUFETG9naW46IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZUluc2Vuc2l0aXZlTWF0Y2g6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5vdGhlcndpc2UoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlZGlyZWN0VG86IFwiL0hvbWVcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAvLyBDb25maWd1cmUgQURBTC5cclxuICAgICAgICAgICAgICAgICAgICB2YXIgYWRhbENvbmZpZyA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGVuYW50OiBlbnZTZXJ2aWNlUHJvdmlkZXIucmVhZCgndGVuYW50JyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsaWVudElkOiBlbnZTZXJ2aWNlUHJvdmlkZXIucmVhZCgnYXBwQ2xpZW50SWQnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FjaGVMb2NhdGlvbjogd2luZG93LmxvY2F0aW9uLmhvc3RuYW1lID09PSBcImxvY2FsaG9zdFwiID8gXCJsb2NhbFN0b3JhZ2VcIiA6IFwiXCIsIC8vIGVuYWJsZSB0aGlzIGZvciBJRSwgYXMgc2Vzc2lvblN0b3JhZ2UgZG9lcyBub3Qgd29yayBmb3IgbG9jYWxob3N0LlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbmRwb2ludHM6IHt9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhbm9ueW1vdXNFbmRwb2ludHM6IFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVudlNlcnZpY2VQcm92aWRlci5yZWFkKCdhcGlVcmknKSArICcvQ3VycmVudEtlZycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbnZTZXJ2aWNlUHJvdmlkZXIucmVhZCgnYXBpVXJpJykgKyAnL2FjdGl2aXR5J1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICBhZGFsQ29uZmlnLmVuZHBvaW50c1tlbnZTZXJ2aWNlUHJvdmlkZXIucmVhZCgnYXBpVXJpJyldID0gZW52U2VydmljZVByb3ZpZGVyLnJlYWQoJ2FwaUNsaWVudElkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgYWRhbFByb3ZpZGVyLmluaXQoYWRhbENvbmZpZywgJGh0dHBQcm92aWRlcik7XHJcbiAgICAgICAgICAgICAgICB9XSk7XHJcbiAgICAgICAgICAgIHRoaXMuYXBwLnNlcnZpY2UoJ2NvbmZpZ1NlcnZpY2UnLCBTZXJ2aWNlLkNvbmZpZ1NlcnZpY2UpO1xyXG4gICAgICAgICAgICB0aGlzLmFwcC5zZXJ2aWNlKCd1c2VyU2VydmljZScsIFNlcnZpY2UuVXNlclNlcnZpY2UpO1xyXG4gICAgICAgICAgICB0aGlzLmFwcC5zZXJ2aWNlKCd1bnRhcHBkU2VydmljZScsIFNlcnZpY2UuVW50YXBwZEFwaVNlcnZpY2UpO1xyXG4gICAgICAgICAgICB0aGlzLmFwcC5zZXJ2aWNlKCd2b3RlU2VydmljZScsIFNlcnZpY2UuVm90ZVNlcnZpY2UpO1xyXG4gICAgICAgICAgICB0aGlzLmFwcC5zZXJ2aWNlKCdkYXNoYm9hcmRTZXJ2aWNlJywgU2VydmljZS5EYXNoYm9hcmRTZXJ2aWNlKTtcclxuICAgICAgICAgICAgdGhpcy5hcHAuc2VydmljZSgna2Vnc1NlcnZpY2UnLCBTZXJ2aWNlLktlZ3NTZXJ2aWNlKTtcclxuICAgICAgICAgICAgdGhpcy5hcHAuc2VydmljZSgnYWRtaW5TZXJ2aWNlJywgU2VydmljZS5BZG1pblNlcnZpY2UpO1xyXG4gICAgICAgICAgICB0aGlzLmFwcC5ydW4oWyckd2luZG93JywgJyRxJywgJyRsb2NhdGlvbicsICckcm91dGUnLCAnJHJvb3RTY29wZScsICgkd2luZG93LCAkcSwgJGxvY2F0aW9uLCAkcm91dGUsICRyb290U2NvcGUpID0+IHtcclxuICAgICAgICAgICAgICAgIC8vIE1ha2UgYW5ndWxhcidzIHByb21pc2VzIHRoZSBkZWZhdWx0IGFzIHRoYXQgd2lsbCBzdGlsbCBpbnRlZ3JhdGUgd2l0aCBhbmd1bGFyJ3MgZGlnZXN0IGN5Y2xlIGFmdGVyIGF3YWl0c1xyXG4gICAgICAgICAgICAgICAgJHdpbmRvdy5Qcm9taXNlID0gJHE7XHJcbiAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRvbignJGxvY2F0aW9uQ2hhbmdlU3RhcnQnLCAoZXZlbnQsIG5ld1VybCwgb2xkVXJsKSA9PiB0aGlzLmxvY2F0aW9uQ2hhbmdlSGFuZGxlcigkcm9vdFNjb3BlLCAkbG9jYXRpb24pKTtcclxuICAgICAgICAgICAgfV0pOyAgICAgICAgICAgIFxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBsb2NhdGlvbkNoYW5nZUhhbmRsZXIoJHJvb3RTY29wZSwgJGxvY2F0aW9uKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHZhciBoYXNoID0gJyc7XHJcbiAgICAgICAgICAgIGlmICgkbG9jYXRpb24uJCRodG1sNSkge1xyXG4gICAgICAgICAgICAgICAgaGFzaCA9ICRsb2NhdGlvbi5oYXNoKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBoYXNoID0gJyMnICsgJGxvY2F0aW9uLnBhdGgoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBVc2UgQURBTCBmb3IgdXJsIHJlc3BvbnNlIHBhcnNpbmdcclxuICAgICAgICAgICAgdmFyIF9hZGFsOiBhbnkgPSBuZXcgQXV0aGVudGljYXRpb25Db250ZXh0KHtjbGllbnRJZDonJ30pO1xyXG4gICAgICAgICAgICBoYXNoID0gX2FkYWwuX2dldEhhc2goaGFzaCk7XHJcbiAgICAgICAgICAgIHZhciBwYXJhbWV0ZXJzID0gX2FkYWwuX2Rlc2VyaWFsaXplKGhhc2gpO1xyXG4gICAgICAgICAgICBpZiAocGFyYW1ldGVycy5oYXNPd25Qcm9wZXJ0eSgnYWNjZXNzX3Rva2VuJykpIHtcclxuICAgICAgICAgICAgICAgICRyb290U2NvcGUudW50YXBwZWRQb3N0QmFja1Rva2VuID0gcGFyYW1ldGVyc1snYWNjZXNzX3Rva2VuJ107XHJcbiAgICAgICAgICAgICAgICAkbG9jYXRpb24ucGF0aCgnVXNlcicpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgc3RhcnQoKTogdm9pZCB7XHJcbiAgICAgICAgICAgICQoZG9jdW1lbnQpLnJlYWR5KCgpID0+IHtcclxuICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJib290aW5nIFwiICsgdGhpcy5hcHAubmFtZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGluamVjdG9yID0gYW5ndWxhci5ib290c3RyYXAoZG9jdW1lbnQsIFt0aGlzLmFwcC5uYW1lXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJib290ZWQgYXBwOiBcIiArIGluamVjdG9yKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNhdGNoIChleCkge1xyXG4gICAgICAgICAgICAgICAgICAgICQoJyNCb290RXhjZXB0aW9uRGV0YWlscycpLnRleHQoZXgpO1xyXG4gICAgICAgICAgICAgICAgICAgICQoJyNBbmd1bGFyQm9vdEVycm9yJykuc2hvdygpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJhcHBidWlsZGVyLnRzXCIgLz5cclxuXHJcbm5ldyBEWExpcXVpZEludGVsLkFwcC5BcHBCdWlsZGVyKCdkeExpcXVpZEludGVsQXBwJykuc3RhcnQoKTsiLCIvLyAgICAgQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uICBBbGwgcmlnaHRzIHJlc2VydmVkLlxyXG5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL3JlZmVyZW5jZXMvaW5kZXguZC50c1wiIC8+XHJcblxyXG5tb2R1bGUgRFhMaXF1aWRJbnRlbC5BcHAuTW9kZWwge1xyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBCdXR0b25CYXJCdXR0b24ge1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKHB1YmxpYyBkaXNwbGF5VGV4dDogc3RyaW5nLFxyXG4gICAgICAgICAgICAkc2NvcGU6IE1vZGVsLklEWExpcXVpZEludGVsU2NvcGUsXHJcbiAgICAgICAgICAgIGVuYWJsZWRFeHByZXNzaW9uOiBzdHJpbmcsXHJcbiAgICAgICAgICAgIHB1YmxpYyBkb0NsaWNrOiBGdW5jdGlvbixcclxuICAgICAgICAgICAgcHVibGljIGlzU3VibWl0OiBib29sZWFuLFxyXG4gICAgICAgICAgICBwcml2YXRlIGltYWdlVXJsPzogc3RyaW5nKSB7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmVuYWJsZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgJHNjb3BlLiR3YXRjaChlbmFibGVkRXhwcmVzc2lvbiwgKG5ld1ZhbHVlOiBib29sZWFuKSA9PiB0aGlzLmVuYWJsZWQgPSBuZXdWYWx1ZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgZW5hYmxlZDogYm9vbGVhbjtcclxuICAgIH1cclxufSAiLCIvLyAgICAgQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uICBBbGwgcmlnaHRzIHJlc2VydmVkLlxyXG5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL3JlZmVyZW5jZXMvaW5kZXguZC50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJVc2VySW5mby50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJWb3RlLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIlRhcEluZm8udHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiQWRtaW4udHNcIiAvPlxyXG5cclxubW9kdWxlIERYTGlxdWlkSW50ZWwuQXBwLk1vZGVsIHtcclxuXHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIElEWExpcXVpZEludGVsU2NvcGUgZXh0ZW5kcyBuZy5JU2NvcGUge1xyXG4gICAgICAgIHN5c3RlbVVzZXJJbmZvOiBVc2VySW5mb1xyXG4gICAgICAgIGlzQWRtaW46IEZ1bmN0aW9uXHJcbiAgICAgICAgdm90ZXM6IFZvdGVbXVxyXG4gICAgICAgIHZvdGVzVGFsbHk6IFZvdGVUYWxseVtdXHJcbiAgICAgICAgY3VycmVudFRhcHM6IFRhcEluZm9bXVxyXG4gICAgICAgIGN1cnJlbnRBY3Rpdml0aWVzOiBBY3Rpdml0eVtdXHJcbiAgICAgICAgYXV0aG9yaXplZEdyb3VwczogQXV0aG9yaXplZEdyb3Vwc1xyXG4gICAgICAgIHRpdGxlOiBzdHJpbmdcclxuICAgICAgICBlcnJvcjogc3RyaW5nXHJcbiAgICAgICAgZXJyb3JfY2xhc3M6IHN0cmluZ1xyXG4gICAgICAgIGxvYWRpbmdNZXNzYWdlOiBzdHJpbmdcclxuICAgICAgICBsb2dpbjogRnVuY3Rpb25cclxuICAgICAgICBsb2dvdXQ6IEZ1bmN0aW9uXHJcbiAgICAgICAgaXNDb250cm9sbGVyQWN0aXZlOiBGdW5jdGlvblxyXG4gICAgICAgIHVudGFwcGVkUG9zdEJhY2tUb2tlbjogc3RyaW5nXHJcbiAgICAgICAgdW50YXBwZEF1dGhlbnRpY2F0aW9uVXJpOiBzdHJpbmdcclxuICAgICAgICBkaXNjb25uZWN0VW50YXBwZFVzZXI6IEZ1bmN0aW9uXHJcbiAgICAgICAgZGVsZXRlQWNjb3VudDogRnVuY3Rpb25cclxuICAgICAgICBnZW5lcmF0ZVN0b3JhZ2VLZXk6IEZ1bmN0aW9uXHJcbiAgICAgICAgYXJlVXBkYXRlc0F2YWlsYWJsZTogYm9vbGVhblxyXG4gICAgICAgIHVwZGF0ZUJhbm5lckNsYXNzOiBzdHJpbmdcclxuICAgICAgICB1cGRhdGVJblByb2dyZXNzOiBib29sZWFuXHJcbiAgICAgICAgdXBkYXRlTWVzc2FnZTogc3RyaW5nXHJcbiAgICAgICAgZ2V0SHRtbERlc2NyaXB0aW9uOiBGdW5jdGlvblxyXG4gICAgICAgIGFwcGx5VXBkYXRlOiBGdW5jdGlvblxyXG4gICAgICAgIHVwZGF0ZUNvbmZpZ3VyYXRpb246IEZ1bmN0aW9uXHJcbiAgICAgICAgdXBkYXRlVXNlckluZm86IEZ1bmN0aW9uXHJcbiAgICAgICAgYnV0dG9uQmFyQnV0dG9uczogQnV0dG9uQmFyQnV0dG9uW11cclxuICAgIH1cclxufSBcclxuXHJcbiJdfQ==

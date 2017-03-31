//     Copyright (c) Microsoft Corporation.  All rights reserved.

/// <reference path="../references/index.d.ts" />
/// <reference path="./ControllerBase.ts" />
/// <reference path="../Service/UserService.ts" />
/// <reference path="../Service/UntappdApiService.ts" />

module DXLiquidIntel.App.Controller {

    export class UserController extends ControllerBase {
        static $inject = ['$scope', '$rootScope', 'adalAuthenticationService', '$location', '$window', '$route', 'userService', 'untappdService'];

        constructor($scope: Model.IDXLiquidIntelScope,
            $rootScope: Model.IDXLiquidIntelScope,
            adalAuthenticationService,
            $location: ng.ILocationService,
            $window: ng.IWindowService,
            $route: ng.route.IRouteService,
            userService: Service.UserService,
            protected untappdService: Service.UntappdApiService) {

            super($scope, $rootScope, adalAuthenticationService, $location, userService, async () => {
                this.setTitleForRoute($route.current);
                $scope.buttonBarButtons = [];
                $scope.untappdAuthenticationUri = await untappdService.getUntappdAuthUri($window.location.origin);
                $scope.disconnectUntappdUser = () => this.disconnectUser();
                $scope.updateUserInfo = () => this.update();
                this.populate();
            });
        }

        private async populate(): Promise<void> {
            try {
                this.setUpdateState(true);
                this.$scope.loadingMessage = "Retrieving user information...";
                this.$scope.error = "";
                let userInfo = await this.userService.getUserInfo(this.$scope.userInfo.userName);
                this.$scope.systemUserInfo = userInfo;
                if (this.$rootScope.untappedPostBackToken) {
                    this.$scope.systemUserInfo.UntappdAccessToken = this.$rootScope.untappedPostBackToken;
                    this.$rootScope.untappedPostBackToken = '';
                    let untappdUserResponse = await this.untappdService.getUserInfo(this.$scope.systemUserInfo.UntappdAccessToken);
                    let untappdUserInfo = untappdUserResponse.response.user;
                    this.$scope.systemUserInfo.UntappdUserName = untappdUserInfo.user_name;
                    // If Untappd has a user image, force this to be our image
                    if (untappdUserInfo.user_avatar) {
                        this.$scope.systemUserInfo.ThumbnailImageUri = untappdUserInfo.user_avatar; 
                    }
                    await this.update();
                }
                this.setUpdateState(false);
                this.$scope.loadingMessage = "";
            }
            catch (ex) {
                this.setError(true, ex.data || ex.statusText, ex.headers);
            }
        }

        private async update(): Promise<void> {
            try {
                this.$scope.loadingMessage = "Saving user information...";
                this.setUpdateState(true);
                let userInfo = await this.userService.updateUserInfo(this.$scope.userInfo.userName, this.$scope.systemUserInfo);
                this.$scope.systemUserInfo = userInfo;
                this.setUpdateState(false);
                this.$scope.loadingMessage = "";
            }
            catch (ex) {
                this.setError(true, ex.data || ex.statusText, ex.headers);
                this.setUpdateState(false);
            }
        }

        private disconnectUser(): void {
            this.$scope.systemUserInfo.UntappdUserName = '';
            this.$scope.systemUserInfo.UntappdAccessToken = '';
            this.$scope.systemUserInfo.ThumbnailImageUri = '';
            this.update();
        }
    }
} 
//     Copyright (c) Microsoft Corporation.  All rights reserved.

/// <reference path="../references/index.d.ts" />
/// <reference path="./ControllerBase.ts" />
/// <reference path="../Service/AdminService.ts" />

module DXLiquidIntel.App.Controller {

    export class AuthorizedGroupsController extends ControllerBase {
        static $inject = ['$scope', '$rootScope', 'adalAuthenticationService', '$location', '$route', 'userService', 'adminService'];

        constructor($scope: Model.IDXLiquidIntelScope,
            $rootScope: Model.IDXLiquidIntelScope,
            adalAuthenticationService,
            $location: ng.ILocationService,
            $route: ng.route.IRouteService,
            userService: Service.UserService,
            protected adminService: Service.AdminService) {

            super($scope, $rootScope, adalAuthenticationService, $location, userService, () => {
                this.setTitleForRoute($route.current);
                $scope.buttonBarButtons = [
                    new Model.ButtonBarButton("Commit", $scope, "authorizedGroupsForm.$valid && authorizedGroupsForm.$dirty && !updateInProgress", () => this.update(), true),
                    new Model.ButtonBarButton("Revert", $scope, "!updateInProgress", () => this.populate(), false)
                ];
                $scope.addGroup = () => {
                    if (this.$scope.newGroup) {
                        this.$scope.authorizedGroups.AuthorizedGroups.push(this.$scope.newGroup.displayName);
                    }
                    this.$scope.newGroup = null;
                }
                $scope.deleteGroup = (group: string) => {
                    this.$scope.authorizedGroups.AuthorizedGroups.splice(this.$scope.authorizedGroups.AuthorizedGroups.indexOf(group), 1);
                    this.$scope.authorizedGroupsForm.$setDirty();
                }
                $scope.searchGroups = (searchTerm: string) => this.searchGroups(searchTerm);
                $scope.updateAuthorizedGroups = () => this.update();
                this.populate();
            });
        }

        private async searchGroups(searchTerm: string): Promise<any> {
            var results = await this.adminService.searchGroups(searchTerm);
            return results.results;
        }

        private async populate(): Promise<void> {
            try {
                this.setUpdateState(true);
                this.$scope.loadingMessage = "Retrieving authorized groups...";
                this.$scope.error = "";
                this.$scope.authorizedGroups = await this.adminService.getAuthorizedGroups();
                this.setUpdateState(false);
                this.$scope.loadingMessage = "";
            }
            catch (ex) {
                this.setError(true, ex.data || ex.statusText, ex.headers);
            }
        }

        private async update(): Promise<void> {
            try {
                this.$scope.loadingMessage = "Saving authorized groups...";
                this.setUpdateState(true);
                await this.adminService.updateAuthorizedGroups(this.$scope.authorizedGroups);
                this.$scope.authorizedGroupsForm.$setPristine();
                this.setUpdateState(false);
                this.$scope.error = "";
                this.$scope.loadingMessage = "";
            }
            catch (ex) {
                this.setError(true, ex.data || ex.statusText, ex.headers);
                this.setUpdateState(false);
            }
        }
    }
} 
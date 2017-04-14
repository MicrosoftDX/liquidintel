//     Copyright (c) Microsoft Corporation.  All rights reserved.

/// <reference path="../references/index.d.ts" />
/// <reference path="./ControllerBase.ts" />
/// <reference path="../Service/KegsService.ts" />
/// <reference path="../Service/UntappdApiService.ts" />

module DXLiquidIntel.App.Controller {

    export class InstallKegsController extends ControllerBase {
        static $inject = ['$scope', '$rootScope', 'adalAuthenticationService', '$location', '$route', 'userService', 'kegsService', 'untappdService'];

        constructor($scope: Model.IDXLiquidIntelScope,
            $rootScope: Model.IDXLiquidIntelScope,
            adalAuthenticationService,
            $location: ng.ILocationService,
            $route: ng.route.IRouteService,
            userService: Service.UserService,
            protected kegsService: Service.KegsService,
            protected untappdService: Service.UntappdApiService) {

            super($scope, $rootScope, adalAuthenticationService, $location, userService, () => {
                this.setTitleForRoute($route.current);
                $scope.buttonBarButtons = [
                    new Model.ButtonBarButton("Commit", $scope, "installKegsForm.$valid && installKegsForm.$dirty && !updateInProgress", () => this.update(), true),
                    new Model.ButtonBarButton("Revert", $scope, "!updateInProgress", () => this.populate(), false)
                ];
                $scope.searchBeers = (searchTerm: string) => this.searchBeers(searchTerm);
                $scope.updateInstallKegs = () => this.update();
                this.populate();
            });
        }

        private async searchBeers(searchTerm: string): Promise<Model.BeerInfo[]> {
            try {
                return await this.untappdService.searchBeers(searchTerm, this.$scope.systemUserInfo.UntappdAccessToken);
            }
            catch (ex) {
                return null;
            }
        }

        private async populate(): Promise<void> {
            try {
                this.setUpdateState(true);
                this.$scope.loadingMessage = "Retrieving current tap information...";
                this.$scope.error = "";
                this.$scope.currentTaps = this.normalizeTapInfo(await this.kegsService.getTapsStatus(), true);
                this.setUpdateState(false);
                this.$scope.loadingMessage = "";
            }
            catch (ex) {
                this.setError(true, ex.data || ex.statusText, ex.headers);
            }
        }

        private async update(): Promise<void> {
            try {
                this.$scope.loadingMessage = "Installing new kegs...";
                this.setUpdateState(true);
                this.$scope.currentTaps = this.normalizeTapInfo(await Promise.all(this.$scope.currentTaps.map(async tapInfo => {
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
                        var newKeg = await this.kegsService.createNewKeg(tapInfo);
                        await this.kegsService.installKegOnTap(tapInfo.TapId, newKeg.KegId, tapInfo.KegSize);
                        tapInfo.KegId = newKeg.KegId;
                    }
                    return tapInfo;
                })), true);
                this.$scope.installKegsForm.$setPristine();
                this.setUpdateState(false);
                this.$scope.error = "";
                this.$scope.loadingMessage = "";
            }
            catch (ex) {
                this.setError(true, ex.data || ex.statusText, ex.headers);
                this.setUpdateState(false);
            }
        }

        private normalizeTapInfo(currentTaps: Model.TapInfo[], includeEmptyTaps: boolean): Model.TapInfo[] {
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

        private getSetBeerInfo(tapInfo: Model.TapInfo, beerInfo: any): Model.BeerInfo {
            if (angular.isDefined(beerInfo)) {
                // If the typeahead isn't bound to a popup selection, we just get the string
                if (angular.isString(beerInfo)) {
                    tapInfo.BeerInfo = {
                        untappdId: null,
                        name: beerInfo
                    };
                }
                else if (angular.isObject<Model.BeerInfo>(beerInfo)) {
                    tapInfo.BeerInfo = <Model.BeerInfo>beerInfo;
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

        private createEmptyTap(tapId: number): Model.TapInfo {
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
} 
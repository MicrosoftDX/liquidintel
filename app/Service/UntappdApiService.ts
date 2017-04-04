//     Copyright (c) Microsoft Corporation.  All rights reserved.

/// <reference path="../references/index.d.ts" />
/// <reference path="./ConfigService.ts" />
/// <reference path="../Model/BeerInfo.ts" />

module DXLiquidIntel.App.Service {

    export class UntappdApiService {
        static $inject = ['$resource', 'envService', 'configService'];

        private resourceClass: ng.resource.IResourceClass<ng.resource.IResource<any>>;

        constructor($resource: ng.resource.IResourceService, private envService: angular.environment.Service, private configService: ConfigService) {

            this.resourceClass = $resource('https://api.untappd.com/v4/:entity/:methodName');
        }

        public async getUntappdAuthUri(redirectUri: string): Promise<string> {
            let appConfig = await this.configService.getConfiguration();
            return `https://untappd.com/oauth/authenticate/?client_id=${appConfig.UntappdClientId}&response_type=token&redirect_url=${redirectUri}`;
        }

        public getUserInfo(accessToken: string): PromiseLike<any> {
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

        public async searchBeers(searchTerm: string, accessToken?: string): Promise<Model.BeerInfo[]> {
            let appConfig = await this.configService.getConfiguration();
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
            var results = await this.resourceClass.get(data).$promise;
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
        }
    }
}
 
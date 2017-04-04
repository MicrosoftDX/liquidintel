//     Copyright (c) Microsoft Corporation.  All rights reserved.

/// <reference path="../references/index.d.ts" />
/// <reference path="../Model/TapInfo.ts" />
/// <reference path="./BasicAuthResource.ts" />

module DXLiquidIntel.App.Service {

    export class KegsService {
        static $inject = ['$resource', 'envService', 'adalAuthenticationService'];

        private kegStatusResource: BasicAuthResource<Model.TapInfo>;
        private kegUpdateResource: ng.resource.IResourceClass<ng.resource.IResource<Model.Keg>>;

        constructor(protected $resource: ng.resource.IResourceService, 
            protected envService: angular.environment.Service, 
            protected adalService: adal.AdalAuthenticationService) {

            this.kegStatusResource = new BasicAuthResource<Model.TapInfo>($resource, envService, envService.read('apiUri') + '/CurrentKeg');
            this.kegUpdateResource = <ng.resource.IResourceClass<ng.resource.IResource<Model.Keg>>>$resource(envService.read('apiUri') + '/kegs');
        }

        public getTapsStatus(): PromiseLike<Model.TapInfo[]> {
            return this.kegStatusResource.query(null);
        }

        public createNewKeg(keg: Model.Keg): PromiseLike<Model.Keg> {
            return this.kegUpdateResource.save(keg).$promise;
        }

        public async installKegOnTap(tapId: number, kegId: number, kegSize: number): Promise<any> {
            // Because the /CurrentKeg uri has been configured for basic auth (the GET is displayed on the dashboard
            // prior to login), we have to manually apply the bearer token for the PUT, which is protected.
            var requestUri = this.envService.read('apiUri') + `/CurrentKeg/${tapId}`;
            var token = await this.adalService.acquireToken(this.adalService.getResourceForEndpoint(this.envService.read('apiUri')));
            var installCurrentKegResource = this.$resource(requestUri,
                null,
                {
                    save: { 
                        method: 'PUT',
                        headers: {
                            Authorization: 'Bearer ' + token
                        }
                    }
                });
            return installCurrentKegResource.save(null, 
                {
                    KegId: kegId,
                    KegSize: kegSize
                }).$promise;
        }
    }
}

//     Copyright (c) Microsoft Corporation.  All rights reserved.

/// <reference path="../references/index.d.ts" />
/// <reference path="../Model/TapInfo.ts" />
/// <reference path="../Model/Activity.ts" />

module DXLiquidIntel.App.Service {

    export class DashboardService {
        static $inject = ['$resource', 'envService'];

        private kegStatusResource: ng.resource.IResourceClass<Model.TapInfo>;
        private activityResource: ng.resource.IResourceClass<Model.Activity>;

        constructor($resource: ng.resource.IResourceService, envService: angular.environment.Service) {
            var authHeader = "Basic " + btoa(envService.read('apiUsername') + ":" + envService.read('apiPassword'));
            var headers = {
                Authorization: authHeader
            };
            var queryAction: ng.resource.IActionHash = {
                query: {
                    method: 'GET',
                    isArray: true,
                    headers: headers
                }
            };
            this.kegStatusResource = $resource<Model.TapInfo>(envService.read('apiUri') + '/CurrentKeg', null, queryAction);
            this.activityResource = $resource<Model.Activity>(envService.read('apiUri') + '/activity', null, queryAction);
        }

        public getKegStatus(): PromiseLike<Model.TapInfo[]> {
            return this.kegStatusResource.query().$promise;
        }

        public getLatestActivities(count: number): PromiseLike<Model.Activity[]> {
            return this.activityResource.query({
                count: count
            }).$promise;
        }
    }
}

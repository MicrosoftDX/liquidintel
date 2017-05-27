//     Copyright (c) Microsoft Corporation.  All rights reserved.

/// <reference path="../references/index.d.ts" />
/// <reference path="../Model/Activity.ts" />
/// <reference path="./BasicAuthResource.ts" />

module DXLiquidIntel.App.Service {

    export class DashboardService {
        static $inject = ['$resource', 'envService'];

        private activityResource: BasicAuthResource<Model.Activity>;

        constructor($resource: ng.resource.IResourceService, envService: angular.environment.Service) {
            this.activityResource = new BasicAuthResource<Model.Activity>($resource, envService, envService.read('apiUri') + '/activity');
        }

        public getLatestActivities(count: number): PromiseLike<Model.Activity[]> {
            return this.activityResource.query({
                count: count
            });
        }
    }
}

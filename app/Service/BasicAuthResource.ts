//     Copyright (c) Microsoft Corporation.  All rights reserved.

/// <reference path="../references/index.d.ts" />

module DXLiquidIntel.App.Service {

    export class BasicAuthResource<T> {
        private resource: ng.resource.IResourceClass<T>;

        constructor($resource: ng.resource.IResourceService, envService: angular.environment.Service, url: string) {
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
            this.resource = $resource<T>(url, null, queryAction);
        }

        public query(data: any): ng.IPromise<T[]> {
            return this.resource.query(data).$promise;
        }
    }
}

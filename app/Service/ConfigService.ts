//     Copyright (c) Microsoft Corporation.  All rights reserved.

/// <reference path="../references/index.d.ts" />
/// <reference path="../Model/Configuration.ts" />

module DXLiquidIntel.App.Service {

    export class ConfigService {
        static $inject = ['$resource', 'envService'];

        private resourceClass: ng.resource.IResourceClass<ng.resource.IResource<Model.Configuration>>;
        private configuration: ng.IPromise<Model.Configuration>;

        constructor($resource: ng.resource.IResourceService, envService: angular.environment.Service) {

            this.resourceClass = $resource(envService.read('apiUri') + '/appConfiguration');
        }

        public getConfiguration(): PromiseLike<Model.Configuration> {
            if (!this.configuration) {
                this.configuration = this.resourceClass.get().$promise;
            }
            return this.configuration;
        }
    }
}
 
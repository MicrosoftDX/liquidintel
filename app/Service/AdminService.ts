//     Copyright (c) Microsoft Corporation.  All rights reserved.

/// <reference path="../references/index.d.ts" />
/// <reference path="../Model/Admin.ts" />
/// <reference path="../Model/Kegs.ts" />

module DXLiquidIntel.App.Service {

    export class AdminService {
        static $inject = ['$resource', 'envService'];

        private adminResource: ng.resource.IResourceClass<ng.resource.IResource<any>>;
        private kegsResource: ng.resource.IResourceClass<ng.resource.IResource<any>>;

        constructor($resource: ng.resource.IResourceService, envService: angular.environment.Service) {

            this.adminResource = <ng.resource.IResourceClass<ng.resource.IResource<any>>>$resource(envService.read('apiUri') + '/admin/:action',
                null,
                {
                    update: { method: 'PUT' }
                });
        }

        public getAuthorizedGroups(): PromiseLike<Model.AuthorizedGroups> {
            return this.adminResource.get({
                    action: 'AuthorizedGroups'
                }).$promise;
        }

        public updateAuthorizedGroups(groups: Model.AuthorizedGroups): PromiseLike<any> {
            return (<any>this.adminResource).update({
                    action: 'AuthorizedGroups'
                },
                groups).$promise;
        }

        public searchGroups(searchTerm: string): PromiseLike<Model.GroupSearchResults> {
            return this.adminResource.get({
                action: 'AuthorizedGroups',
                search: searchTerm
            }).$promise;
        }
    }
}
 
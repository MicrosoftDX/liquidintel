//     Copyright (c) Microsoft Corporation.  All rights reserved.

/// <reference path="../references/index.d.ts" />
/// <reference path="../Model/UserInfo.ts" />

module DXLiquidIntel.App.Service {

    export class UserService {
        static $inject = ['$resource', 'envService'];

        private resourceClass: ng.resource.IResourceClass<ng.resource.IResource<Model.UserInfo>>;
        private cachedUserId: string;
        private cachedUserInfo: PromiseLike<Model.UserInfo>;

        constructor($resource: ng.resource.IResourceService, envService: angular.environment.Service) {

            this.resourceClass = <ng.resource.IResourceClass<ng.resource.IResource<Model.UserInfo>>>$resource(envService.read('apiUri') + '/users/:userId',
                null,
                {
                    update: { method: 'PUT' }
                });
        }

        public getUserInfo(userId: string): PromiseLike<Model.UserInfo> {
            if (userId == this.cachedUserId && this.cachedUserInfo != null) {
                return this.cachedUserInfo;
            }
            this.cachedUserId = userId;
            if (!userId) {
                this.cachedUserInfo = Promise.resolve<Model.UserInfo>(null);    
            }
            else {
                this.cachedUserInfo = this.resourceClass.get({
                        userId: userId
                    }, 
                    null, 
                    (errResp: ng.IHttpPromise<Model.UserInfo>) => {
                        // Clear out cached promise to allow retry on error
                        this.cachedUserId = '';
                        this.cachedUserInfo = null;
                    }).$promise;
            }
            return this.cachedUserInfo;
        }

        public updateUserInfo(userId: string, userInfo: Model.UserInfo): PromiseLike<Model.UserInfo> {
            if (!userId) {
                throw 'Invalid user id';
            }
            this.cachedUserId = '';
            this.cachedUserInfo = null;
            return (<any>this.resourceClass).update({
                    userId: userId
                },
                userInfo).$promise;
        }
    }
}
 
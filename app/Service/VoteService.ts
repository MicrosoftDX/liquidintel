//     Copyright (c) Microsoft Corporation.  All rights reserved.

/// <reference path="../references/index.d.ts" />
/// <reference path="../Model/Vote.ts" />

module DXLiquidIntel.App.Service {

    export class VoteService {
        static $inject = ['$resource', 'envService'];

        private userVotesResource: ng.resource.IResourceClass<Model.Vote[]>;
        private tallyResource: ng.resource.IResourceClass<Model.VoteTally>;

        constructor($resource: ng.resource.IResourceService, envService: angular.environment.Service) {

            this.userVotesResource = $resource<Model.Vote[]>(envService.read('apiUri') + '/votes/:personnelNumber', null, {
                get: {method: 'GET', isArray: true},
                save: {method: 'PUT', isArray: true}
            });
            this.tallyResource = $resource<Model.VoteTally>(envService.read('apiUri') + '/votes_tally');
        }

        public getUserVotes(personnelNumber: number): PromiseLike<Model.Vote[]> {
            return this.userVotesResource.get({
                    personnelNumber: personnelNumber
                }).$promise; 
        }

        public updateUserVotes(personnelNumber: number, votes: Model.Vote[]): PromiseLike<Model.Vote[]> {
            return this.userVotesResource.save({
                    personnelNumber: personnelNumber
                },
                votes).$promise;
        }

        public getVoteTally(): PromiseLike<Model.VoteTally[]> {
            return this.tallyResource.query().$promise;
        }
    }
}
 
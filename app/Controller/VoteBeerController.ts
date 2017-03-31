//     Copyright (c) Microsoft Corporation.  All rights reserved.

/// <reference path="../references/index.d.ts" />
/// <reference path="./ControllerBase.ts" />
/// <reference path="../Service/UntappdApiService.ts" />
/// <reference path="../Service/VoteService.ts" />

module DXLiquidIntel.App.Controller {

    export class VoteBeerController extends ControllerBase {
        static $inject = ['$scope', '$rootScope', 'adalAuthenticationService', '$location', '$route', 'userService', 'untappdService', 'voteService'];

        constructor($scope: Model.IDXLiquidIntelScope,
            $rootScope: Model.IDXLiquidIntelScope,
            adalAuthenticationService,
            $location: ng.ILocationService,
            $route: ng.route.IRouteService,
            userService: Service.UserService,
            protected untappdService: Service.UntappdApiService,
            protected voteService: Service.VoteService) {

            super($scope, $rootScope, adalAuthenticationService, $location, userService, () => {
                this.setTitleForRoute($route.current);
                $scope.buttonBarButtons = [
                    new Model.ButtonBarButton("Commit", $scope, "voteForm.$valid && voteForm.$dirty && !updateInProgress", () => this.update(), true),
                    new Model.ButtonBarButton("Revert", $scope, "!updateInProgress", () => this.populate(), false)
                ];
                $scope.searchBeers = (searchTerm: string) => this.searchBeers(searchTerm);
                $scope.updateVotes = () => this.update();
                $scope.clearVote = (vote) => this.resetVote(vote);
                this.populate();
            });
        }

        private searchBeers(searchTerm: string): PromiseLike<any> {
            return this.untappdService.searchBeers(searchTerm, this.$scope.systemUserInfo.UntappdAccessToken)
                .then((resp) => {
                    return resp.response.beers.items.map((beer) => {
                        return {
                            untappdId: beer.beer.bid,
                            name: beer.beer.beer_name,
                            ibu: beer.beer.beer_ibu,
                            abv: beer.beer.beer_abv,
                            description: beer.beer.beer_description,
                            brewery: beer.brewery.brewery_name,
                            image: beer.beer.beer_label
                        };
                    });
                },
                (reject) => {
                    return "An error occured";
                });
        }

        private normalizeVotesArray(sourceVotes: Model.Vote[]): Model.Vote[] {
            while (sourceVotes.length < 2) {
                sourceVotes.push({
                    VoteId: 0,
                    PersonnelNumber: this.$scope.systemUserInfo.PersonnelNumber,
                    VoteDate: new Date(),
                    UntappdId: 0
                });
            }
            sourceVotes.forEach((vote) => {
                vote.BeerInfo = {
                    untappdId: vote.UntappdId,
                    name: vote.BeerName,
                    brewery: vote.Brewery
                }
            });
            return sourceVotes;
        }

        private async populate(): Promise<void> {
            try {
                this.setUpdateState(true);
                this.$scope.loadingMessage = "Retrieving previous votes...";
                this.$scope.error = "";
                this.$scope.votes = this.normalizeVotesArray(await this.voteService.getUserVotes(this.$scope.systemUserInfo.PersonnelNumber));
                this.setUpdateState(false);
                this.$scope.loadingMessage = "";
            }
            catch (ex) {
                this.setError(true, ex.data || ex.statusText, ex.headers);
            }
        }

        private resetVote(vote: Model.Vote) {
            // Don't reset the vote id as we need to detect if this is a delete
            vote.PersonnelNumber = this.$scope.systemUserInfo.PersonnelNumber;
            vote.VoteDate = new Date();
            vote.UntappdId = 0;
            vote.BeerName = '';
            vote.Brewery = '';
            vote.BeerInfo = null;
            this.$scope.voteForm.$setDirty();
        }

        private async update(): Promise<void> {
            try {
                this.$scope.loadingMessage = "Saving votes...";
                this.setUpdateState(true);
                this.$scope.votes.forEach((vote: Model.Vote) => {
                    if (vote.BeerInfo) {
                        vote.UntappdId = vote.BeerInfo.untappdId;
                        vote.BeerName = vote.BeerInfo.name;
                        vote.Brewery = vote.BeerInfo.brewery;
                    }
                });
                this.$scope.votes = this.normalizeVotesArray(await this.voteService.updateUserVotes(this.$scope.systemUserInfo.PersonnelNumber, this.$scope.votes));
                this.$scope.voteForm.$setPristine();
                this.setUpdateState(false);
                this.$scope.error = "";
                this.$scope.loadingMessage = "";
            }
            catch (ex) {
                this.setError(true, ex.data || ex.statusText, ex.headers);
                this.setUpdateState(false);
            }
        }
    }
} 
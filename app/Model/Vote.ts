//     Copyright (c) Microsoft Corporation.  All rights reserved.

/// <reference path="../references/index.d.ts" />
/// <reference path="BeerInfo.ts" />

module DXLiquidIntel.App.Model {

    export class Vote {
        public VoteId: number
        public PersonnelNumber: number
        public VoteDate: Date
        public UntappdId: number
        public BeerName?: string
        public Brewery?: string
        public BeerInfo?: BeerInfo
    }

    export class VoteTally {
        public UntappdId: number
        public BeerName?: string
        public Brewery?: string
        public VoteCount: number
    }
}
         
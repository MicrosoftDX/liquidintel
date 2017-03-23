//     Copyright (c) Microsoft Corporation.  All rights reserved.

/// <reference path="../references/index.d.ts" />

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

    export class BeerInfo {
        public untappdId: number
        public name: string
        public ibu?: number
        public abv?: number
        public description?: string
        public brewery?: string
        public image?: string
    }

    export class VoteTally {
        public UntappdId: number
        public BeerName?: string
        public Brewery?: string
        public VoteCount: number
    }
}
         
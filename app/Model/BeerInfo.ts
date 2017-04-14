//     Copyright (c) Microsoft Corporation.  All rights reserved.

/// <reference path="../references/index.d.ts" />

module DXLiquidIntel.App.Model {

    export class BeerInfo {
        public untappdId: number
        public name: string
        public beer_type?: string
        public ibu?: number
        public abv?: number
        public description?: string
        public brewery?: string
        public image?: string
    }
}
//     Copyright (c) Microsoft Corporation.  All rights reserved.

/// <reference path="../references/index.d.ts" />

module DXLiquidIntel.App.Model {

    export class Keg {
        public KegId?: number
        public Name: string
        public Brewery: string
        public BeerType: string
        public ABV?: number
        public IBU?: number
        public BeerDescription: string
        public UntappdId?: number
        public imagePath: string
        public BeerInfo?: BeerInfo
    }

    export class TapInfo extends Keg {
        public TapId: number
        public InstallDate: Date
        public KegSize: number
        public CurrentVolume: number
        public OriginalUntappdId?: number

        public getSetBeerInfo?: (beerInfo: BeerInfo) => BeerInfo;
    }
}
         
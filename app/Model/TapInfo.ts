//     Copyright (c) Microsoft Corporation.  All rights reserved.

/// <reference path="../references/index.d.ts" />

module DXLiquidIntel.App.Model {

    // Need to keep structure in sync with DashServer.ManagementAPI.Models.OperationState in the WebAPI
    export class TapInfo {
        public TapId: number
        public KegId: number
        public InstallDate: Date
        public KegSize: number
        public CurrentVolume: number
        public Name: string
        public Brewery: string
        public BeerType: string
        public ABV?: number
        public IBU?: number
        public BeerDescription: string
        public UntappdId?: number
        public imagePath: string
    }
}
         
//     Copyright (c) Microsoft Corporation.  All rights reserved.

/// <reference path="../references/index.d.ts" />

module DXLiquidIntel.App.Model {

    // Need to keep structure in sync with DashServer.ManagementAPI.Models.OperationState in the WebAPI
    export class Activity {
        public SessionId: number
        public PourTime: Date
        public PourAmount: number
        public BeerName: string
        public Brewery: string
        public BeerType: string
        public ABV?: number
        public IBU?: number
        public BeerDescription: string
        public UntappdId?: number
        public BeerImagePath: string
        public PersonnelNumber: number
        public Alias: string
        public FullName: string
    }
}
         
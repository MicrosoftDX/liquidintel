//     Copyright (c) Microsoft Corporation.  All rights reserved.

/// <reference path="../references/index.d.ts" />

module DXLiquidIntel.App.Model {

    export class AuthorizedGroups {
        AuthorizedGroups: string[]
    }

    export class GroupResult {
        displayName: string
        owners: string[]
    }

    export class GroupSearchResults {
        count: number
        results: GroupResult[]
    }
}
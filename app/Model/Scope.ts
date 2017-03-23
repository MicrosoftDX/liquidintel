//     Copyright (c) Microsoft Corporation.  All rights reserved.

/// <reference path="../references/index.d.ts" />
/// <reference path="UserInfo.ts" />
/// <reference path="Vote.ts" />
/// <reference path="TapInfo.ts" />

module DXLiquidIntel.App.Model {

    export interface IDXLiquidIntelScope extends ng.IScope {
        systemUserInfo: UserInfo
        isAdmin: Function
        votes: Vote[]
        votesTally: VoteTally[]
        currentTaps: TapInfo[]
        title: string
        error: string
        error_class: string
        loadingMessage: string
        login: Function
        logout: Function
        isControllerActive: Function
        untappedPostBackToken: string
        untappdAuthenticationUri: string
        disconnectUntappdUser: Function
        deleteAccount: Function
        generateStorageKey: Function
        areUpdatesAvailable: boolean
        updateBannerClass: string
        updateInProgress: boolean
        updateMessage: string
        getHtmlDescription: Function
        applyUpdate: Function
        updateConfiguration: Function
        updateUserInfo: Function
        buttonBarButtons: ButtonBarButton[]
    }
} 


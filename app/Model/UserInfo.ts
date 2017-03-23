//     Copyright (c) Microsoft Corporation.  All rights reserved.

/// <reference path="../references/index.d.ts" />

module DXLiquidIntel.App.Model {

    // Need to keep structure in sync with DashServer.ManagementAPI.Models.OperationState in the WebAPI
    export class UserInfo {
        public PersonnelNumber: number
        public UserPrincipalName: string
        public UntappdUserName: string
        public UntappdAccessToken: string
        public CheckinFacebook: boolean
        public CheckinTwitter: boolean
        public CheckinFoursquare: boolean
        public FullName: string
        public FirstName: string
        public LastName: string
        public IsAdmin: boolean
        public ThumbnailImageUri: string
    }
}
         
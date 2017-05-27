//     Copyright (c) Microsoft Corporation.  All rights reserved.

/// <reference path="../references/index.d.ts" />

module DXLiquidIntel.App.Model {

    export class ButtonBarButton {
        constructor(public displayText: string,
            $scope: Model.IDXLiquidIntelScope,
            enabledExpression: string,
            public doClick: Function,
            public isSubmit: boolean,
            private imageUrl?: string) {

            this.enabled = false;
            $scope.$watch(enabledExpression, (newValue: boolean) => this.enabled = newValue);
        }

        public enabled: boolean;
    }
} 
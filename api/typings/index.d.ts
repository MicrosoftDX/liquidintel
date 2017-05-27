/// <reference path="globals/chai-http/index.d.ts" />
/// <reference path="globals/chai/index.d.ts" />
/// <reference path="globals/mocha/index.d.ts" />
/// <reference path="globals/passport/index.d.ts" />
/// <reference path="globals/request-promise/index.d.ts" />
/// <reference path="modules/express-serve-static-core/index.d.ts" />
/// <reference path="modules/express/index.d.ts" />
/// <reference path="modules/form-data/index.d.ts" />
/// <reference path="modules/mime/index.d.ts" />
/// <reference path="modules/request/index.d.ts" />
/// <reference path="modules/serve-static/index.d.ts" />
/// <reference path="modules/tedious-connection-pool/index.d.ts" />
/// <reference path="modules/tedious/index.d.ts" />
/// <reference path="modules/xml2js/index.d.ts" />

interface Array<T> {
   mapAsync<U>(callbackfn: (value: T, index: number, array: T[]) => Promise<U>, thisArg?: any): Promise<U[]>;
   forEachAsync(callbackfn: (value: T, index: number, array: T[]) => Promise<void>, thisArg?: any): Promise<void>;
}

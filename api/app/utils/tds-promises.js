"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const tedious = require("tedious");
const _ = require("lodash");
_.mixin(require('lodash-deep'));
class TdsPromises {
    setConnectionPool(connectionPool) {
        if (!connectionPool || !_.isFunction(connectionPool.acquire)) {
            throw new Error('Connection pool parameter required.');
        }
        TdsPromises._connectionPool = connectionPool;
        TdsPromises._connectionPool.on('error', (err) => {
            console.error('TdsPromises connection pool error: ' + err);
            return 0;
        });
        return this;
    }
    sql(sqlStatement) {
        return new TdsConnection().sql(sqlStatement);
    }
}
;
exports.default = new TdsPromises();
class TdsConnection {
    constructor() {
    }
    open() {
        if (!this._openPromise) {
            this._openPromise = new Promise((resolve, reject) => {
                TdsPromises._connectionPool.acquire((err, connection) => {
                    try {
                        if (err) {
                            if (connection) {
                                connection.release();
                            }
                            reject(err);
                        }
                        else {
                            this._connection = connection;
                            resolve();
                        }
                    }
                    catch (ex) {
                        reject(ex);
                    }
                });
            });
        }
        return this._openPromise;
    }
    close() {
        if (this._connection) {
            this._connection.release();
            this._connection = null;
            this._openPromise = null;
        }
    }
    get connection() {
        return this._connection;
    }
    connectionAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.open();
            return this._connection;
        });
    }
    sql(sqlStatement) {
        return new TdsStatement(this, sqlStatement);
    }
    beginTransaction() {
        if (!this._connection) {
            throw new Error('Connection has not been established. Call open() first');
        }
        else if (this._inTransaction) {
            throw new Error('Transaction already started. Nested transactions are not supported');
        }
        return new Promise((resolve, reject) => {
            this._connection.beginTransaction((err) => {
                if (err) {
                    reject(err);
                }
                else {
                    this._inTransaction = true;
                    resolve();
                }
            });
        });
    }
    commitTransaction() {
        if (!this._inTransaction) {
            throw new Error('Transaction is not active. Call beginTransaction() frist');
        }
        return new Promise((resolve, reject) => {
            this._connection.commitTransaction((err) => {
                if (err) {
                    reject(err);
                }
                else {
                    this._inTransaction = false;
                    resolve();
                }
            });
        });
    }
    rollbackTransaction() {
        if (!this._inTransaction) {
            throw new Error('Transaction is not active. Call beginTransaction() frist');
        }
        return new Promise((resolve, reject) => {
            this._connection.rollbackTransaction((err) => {
                if (err) {
                    reject(err);
                }
                else {
                    this._inTransaction = false;
                    resolve();
                }
            });
        });
    }
    transaction(transactionBody, postCommit, error) {
        return __awaiter(this, void 0, void 0, function* () {
            var inXact = false;
            try {
                yield this.open();
                yield this.beginTransaction();
                inXact = true;
                var results = yield transactionBody(this);
                yield this.commitTransaction();
                inXact = false;
                if (postCommit) {
                    postCommit(results);
                }
            }
            catch (ex) {
                try {
                    if (inXact) {
                        yield this.rollbackTransaction();
                    }
                }
                catch (ex2) { }
                if (error) {
                    error(ex);
                }
            }
            finally {
                this.close();
            }
        });
    }
}
exports.TdsConnection = TdsConnection;
class BindablePromise {
    constructor() {
        this.reset();
    }
    get promise() {
        return this._promise;
    }
    resolve(value) {
        this._resolve(value);
    }
    reject(reason) {
        this._reject(reason);
    }
    reset() {
        this._promise = new Promise((resolve, reject) => {
            this._resolve = resolve;
            this._reject = reject;
        });
    }
}
class TdsStatement {
    constructor(connection, sqlStatement) {
        this._columns = {};
        this._connection = connection;
        this._promise = new BindablePromise();
        this._request = new tedious.Request(sqlStatement, (err, rowCount, rows) => {
            if (err) {
                this._promise.reject(err);
            }
            else {
                this._promise.resolve(rows.map(row => {
                    return this._transformRow(row);
                }));
            }
        });
    }
    parameter(name, type, value, options) {
        this._request.addParameter(name, type, value, options);
        return this;
    }
    prepare() {
        return __awaiter(this, void 0, void 0, function* () {
            var openConnection = yield this._connection.connectionAsync();
            return new Promise((resolve, reject) => {
                openConnection.prepare(this._request);
                this._request.on('prepared', () => {
                    resolve(this);
                });
            });
        });
    }
    executeImmediate() {
        return this.execute(true, false, null);
    }
    execute(releaseConnection, callSproc = false, parameters) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                this._promise.reset();
                var openConnection = yield this._connection.connectionAsync();
                if (callSproc) {
                    openConnection.callProcedure(this._request);
                }
                else if (parameters) {
                    openConnection.execute(this._request, parameters);
                }
                else {
                    openConnection.execSql(this._request);
                }
                let results = yield this._promise.promise;
                resolve(results);
            }
            catch (ex) {
                reject(ex);
            }
        }))
            .then((value) => {
            if (releaseConnection) {
                this._connection.close();
            }
            return value;
        })
            .catch((reason) => {
            if (releaseConnection) {
                this._connection.close();
            }
            return Promise.reject(reason);
        });
    }
    _transformRow(row) {
        var result = {};
        for (var i = 0; i < row.length; i++) {
            var col = row[i];
            var map = this._getColumnMap(col.metadata.colName);
            map.applyMapping(col, result);
        }
        return result;
    }
    _getColumnMap(colName) {
        var map = this._columns[colName];
        if (!map) {
            map = new TdsColumn(colName);
            this._columns[colName] = map;
        }
        return map;
    }
}
exports.TdsStatement = TdsStatement;
class TdsColumn {
    constructor(name) {
        this.name = name;
        this._getColumnValue = (column) => { return column.value; };
        this._applyMapping = (column, result) => {
            var value = this._getColumnValue(column);
            result[this.name] = value;
        };
    }
    applyMapping(column, result) {
        this._applyMapping(column, result);
    }
    overrideGetValue(getFunction) {
        this._getColumnValue = getFunction;
        return this;
    }
    ;
    overrideApplyMapping(applyFunction) {
        this._applyMapping = applyFunction;
        return this;
    }
    ;
    asBoolean() {
        return this.overrideGetValue((column) => {
            if (column.value === undefined || column.value === null) {
                return null;
            }
            if (_.isFinite(column.value)) {
                return column.value !== 0;
            }
            if (_.isString(column.value)) {
                var str = column.value.toUpperCase();
                if (str === 'TRUE' || str === 'T' || str === 'Y' || str === 'YES' || str === '1') {
                    return true;
                }
                if (str === 'FALSE' || str === 'F' || str === 'N' || str === 'NO' || str === '0') {
                    return false;
                }
            }
            throw new Error('Unable to convert "' + column.value + '" to a boolean.');
        });
    }
    ;
    asDate() {
        return this.overrideGetValue((column) => {
            if (column.value === undefined || column.value === null) {
                return null;
            }
            if (_.isFinite(column.value)) {
                return new Date(column.value);
            }
            return Date.parse(column.value);
        });
    }
    ;
}
//# sourceMappingURL=tds-promises.js.map
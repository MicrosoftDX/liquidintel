
import tedious = require('tedious');
import ConnectionPool = require('tedious-connection-pool');
import _ = require('lodash');
_.mixin(require('lodash-deep'));

class TdsPromises {
    static _connectionPool: ConnectionPool;

    setConnectionPool(connectionPool: ConnectionPool): TdsPromises {

        if (!connectionPool || !_.isFunction(connectionPool.acquire)) {
            throw new Error('Connection pool parameter required.');
        }

        TdsPromises._connectionPool = connectionPool;
        TdsPromises._connectionPool.on('error', (err) => {
            // We primarily need to handle this event to prevent the error bubbling up to be 
            // an unhandled exception & the process to crash. We don't need to do anything here
            // as the connection should recover itself.
            console.error('TdsPromises connection pool error: ' + err);
            return 0;
        })
        return this;
    }

    sql(sqlStatement: string): TdsStatement {
        return new TdsConnection().sql(sqlStatement);
    }
};
export default new TdsPromises();

export class TdsConnection {
    private _connection: ConnectionPool.PooledConnection;
    private _openPromise: Promise<void>;
    private _inTransaction: boolean;

    constructor() {
    }

    open(): Promise<void> {
        if (!this._openPromise) {
            this._openPromise = new Promise<void>((resolve, reject) => {
                TdsPromises._connectionPool.acquire((err: Error, connection: ConnectionPool.PooledConnection) => {
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

    close(): void {
        if (this._connection) {
            this._connection.release();
            this._connection = null;
            this._openPromise = null;
        }
    }

    get connection(): ConnectionPool.PooledConnection {
        return this._connection;
    }

    async connectionAsync(): Promise<ConnectionPool.PooledConnection> {
        await this.open();
        return this._connection;
    }

    sql(sqlStatement: string): TdsStatement {
        return new TdsStatement(this, sqlStatement);
    }

    beginTransaction(): Promise<void> {
        if (!this._connection) {
            throw new Error('Connection has not been established. Call open() first');
        }
        else if (this._inTransaction) {
            throw new Error('Transaction already started. Nested transactions are not supported');
        }
        return new Promise<void>((resolve, reject) => {
            this._connection.beginTransaction((err: Error) => {
                if (err) {
                    reject(err);
                }
                else {
                    this._inTransaction = true;
                    resolve();
                }
            })
        });
    }

    commitTransaction(): Promise<void> {
        if (!this._inTransaction) {
            throw new Error('Transaction is not active. Call beginTransaction() frist');
        }
        return new Promise<void>((resolve, reject) => {
            this._connection.commitTransaction((err: Error) => {
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

    rollbackTransaction(): Promise<void> {
        if (!this._inTransaction) {
            throw new Error('Transaction is not active. Call beginTransaction() frist');
        }
        return new Promise<void>((resolve, reject) => {
            this._connection.rollbackTransaction((err: Error) => {
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

    async transaction<T>(transactionBody: (connection: TdsConnection) => Promise<T>, postCommit: (T) => void, error: (Error) => void): Promise<void> {
        var inXact = false;
        try {
            await this.open();
            await this.beginTransaction();
            inXact = true;
            var results = await transactionBody(this);
            await this.commitTransaction();
            inXact = false;
            if (postCommit) {
                postCommit(results);
            }
        }
        catch (ex) {
            try {
                if (inXact) {
                    await this.rollbackTransaction();
                }
            }
            catch (ex2) {}
            if (error) {
                error(ex);
            }
        }
        finally {
            this.close();
        }
    }
}

class BindablePromise<T> {
    private _promise: Promise<T>;
    private _resolve: (value?: T | PromiseLike<T>) => void;
    private _reject: (reason?: any) => void;

    constructor() {
        this.reset();
    }

    get promise(): Promise<T> {
        return this._promise;
    }

    resolve(value?: T | PromiseLike<T>) {
        this._resolve(value);
    }

    reject(reason?: any) {
        this._reject(reason);
    }

    reset() {
        this._promise = new Promise<T>((resolve, reject) => {
            this._resolve = resolve;
            this._reject = reject;
        });
    }
}

export class TdsStatement {
    private _connection: TdsConnection;
    private _request: tedious.Request;
    private _promise: BindablePromise<any[]>;
    private _columns: { [name: string]: TdsColumn; } = {};

    constructor(connection: TdsConnection, sqlStatement: string) {
        this._connection = connection;
        this._promise = new BindablePromise<any[]>();
        this._request = new tedious.Request(sqlStatement, (err: Error, rowCount: number, rows: any[]) => {
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

    parameter(name: string, type: tedious.TediousType, value: any, options?: tedious.ParameterOptions): TdsStatement {
        this._request.addParameter(name, type, value, options);
        return this;
    }

    async prepare(): Promise<TdsStatement> {
        var openConnection = await this._connection.connectionAsync();
        return new Promise<TdsStatement>((resolve, reject) => {
            openConnection.prepare(this._request);
            this._request.on('prepared', () => {
                resolve(this);
            });
        });
    }

    executeImmediate(): Promise<any[]> {
        return this.execute(true, null);
    }

    execute(releaseConnection: boolean, parameters?: {}): Promise<any[]> {
        return new Promise<any[]>(async (resolve, reject) => {
            try {
                this._promise.reset();
                var openConnection = await this._connection.connectionAsync();
                if (parameters) {
                    openConnection.execute(this._request, parameters);
                }
                else {
                    openConnection.execSql(this._request);
                }
                let results = await this._promise.promise;
                resolve(results);
            }
            catch (ex) {
                reject(ex);
            }
        })
        .then((value) => {
            if (releaseConnection) {
                this._connection.close();
            }
            return value
        })
        .catch((reason) => {
            if (releaseConnection) {
                this._connection.close();
            }
            return Promise.reject(reason);
        });
    }

    protected _transformRow(row: any) {
        var result = {};
        for (var i = 0; i < row.length; i++) {
            var col = row[i];
            var map = this._getColumnMap(col.metadata.colName);
            map.applyMapping(col, result);
        }
        return result;
    }

    protected _getColumnMap(colName: string): TdsColumn {
        var map = this._columns[colName];
        if (!map) {
            map = new TdsColumn(colName);
            this._columns[colName] = map;
        }
        return map;
    }
}

class TdsColumn {
    protected _getColumnValue: (column: tedious.ColumnValue) => any;
    protected _applyMapping: (column: tedious.ColumnValue, result: any) => void;

    constructor(public name: string) {
        this._getColumnValue = (column: tedious.ColumnValue) => { return column.value; }
        this._applyMapping = (column: tedious.ColumnValue, result: any) => {
            var value = this._getColumnValue(column);
            result[this.name] = value;
        }
    }

    applyMapping(column: tedious.ColumnValue, result: any): void {
        this._applyMapping(column, result);
    }

    overrideGetValue(getFunction: (column: tedious.ColumnValue) => any): TdsColumn {
        this._getColumnValue = getFunction;
        return this;
    };

    overrideApplyMapping(applyFunction): TdsColumn {
        this._applyMapping = applyFunction;
        return this;
    };

    asBoolean(): TdsColumn {
        return this.overrideGetValue((column: tedious.ColumnValue) => {
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
    };

    asDate(): TdsColumn {
        return this.overrideGetValue((column: tedious.ColumnValue) => {
            if (column.value === undefined || column.value === null) {
                return null;
            }
            if (_.isFinite(column.value)) {
                return new Date(column.value);
            }
            return Date.parse(column.value);
        });
    };
}
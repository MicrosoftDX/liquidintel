
import tds = require('./tds-promises');
import {TediousType, TYPES} from 'tedious';

export enum Operators {
    Unknown,
    EqualTo,
    LessThan,
    GreaterThan,
    Range,
    Contains,
    OrderAsc,
    OrderDesc,
}

export interface Clause {
    operator: Operators,
    value: any,
    valueUpper?: any             // For Range clauses only
}

export interface PropMapping {
    sqlName: string,
    dataType: TediousType
}

enum OperatorClass {
    Filter,
    Order,
}

export class QueryExpression {
    private static _suffix_gt: string   = "_gt";
    private static _suffix_lt: string   = "_lt";
    private static _suffix_in: string   = "_in";
    private static _suffix_asc: string  = "_asc";
    private static _suffix_desc: string = "_desc";

    private static readonly suffixOperators: [string, Operators, OperatorClass][] = [
        [QueryExpression._suffix_gt, Operators.GreaterThan, OperatorClass.Filter],
        [QueryExpression._suffix_lt, Operators.LessThan, OperatorClass.Filter],
        [QueryExpression._suffix_in, Operators.Contains, OperatorClass.Filter],
        ["", Operators.EqualTo, OperatorClass.Filter],
        ["", Operators.Range, OperatorClass.Filter],
        [QueryExpression._suffix_asc, Operators.OrderAsc, OperatorClass.Order],
        [QueryExpression._suffix_desc, Operators.OrderDesc, OperatorClass.Order]
    ];

    private static readonly operatorClasses = new Map(QueryExpression.suffixOperators.map((value: [string, Operators, OperatorClass]) => {
        return <[Operators, OperatorClass]>[value[1], value[2]];
    }));

    params: {[key:string]: Clause;} = {};
    mapping: {[key:string]: PropMapping} = null;
    ordering: string[] = null;
    limit: string;

    constructor(queryParams: any) {

        for (var prop in queryParams) {
            var paramInfo = QueryExpression.getParamInfo(prop);
            var clause = this.getClause(paramInfo[0]);
            if (clause != null) {
                // Verify that this is now a range clause
                if (clause.operator != paramInfo[1]) {
                    if (clause.operator == Operators.LessThan) {
                        clause.valueUpper = clause.value;
                        clause.value = queryParams[prop];
                    }
                    else {
                        clause.valueUpper = queryParams[prop];
                    }
                    clause.operator = Operators.Range;
                }
            }
            else {
                this.params[paramInfo[0].toLowerCase()] = {
                    operator: paramInfo[1],
                    value: queryParams[prop]
                };
            }
        }
    }

    getClause(paramName:string): Clause {
        return this.params[paramName.toLowerCase()];
    }

    isAnyFilter(): boolean {
        if (this.mapping) {
            for (var prop in this.mapping) {
                var clause = this.getClause(prop);
                if (clause != null && QueryExpression.operatorClasses.get(clause.operator) == OperatorClass.Filter) {
                    return true;
                }
            }
            return false
        }
        return Object.keys(this.params).length > 0;
    }

    isAnyOrdering(): boolean {
        if (this.ordering) {
            for (var prop of this.ordering) {
                var clause = this.getClause(prop);
                if (clause != null && QueryExpression.operatorClasses.get(clause.operator) == OperatorClass.Order) {
                    return true;
                }
            }
            return false
        }
        return false;
    }

    isAnyLimit(): boolean {
        if (this.limit) {
            return this.getClause(this.limit) != null;
        }
        return false;
    }

    getSqlFilterPredicates(): string {
        var predicates = Object.keys(this.mapping).map(prop => {
            var clause = this.getClause(prop);
            if (clause != null && QueryExpression.operatorClasses.get(clause.operator) == OperatorClass.Filter) {
                var comparitor = "";
                switch (clause.operator) {
                    case Operators.EqualTo:
                        comparitor = "=";
                        break;

                    case Operators.GreaterThan:
                        comparitor = ">";
                        break;

                    case Operators.LessThan:
                        comparitor = "<";
                        break;

                    case Operators.Contains:
                        return `${this.mapping[prop].sqlName} IN (SELECT value FROM string_split(@${prop}, ','))`;

                    case Operators.Range:
                        return `${this.mapping[prop].sqlName} > @${prop}Low AND ` + 
                               `${this.mapping[prop].sqlName} < @${prop}Hi`;
                }
                if (comparitor != "") {
                    return `${this.mapping[prop].sqlName} ${comparitor} @${prop}`;
                }
            }
            return "";
        });
        return predicates
            .filter(clause => clause != "") 
            .join(" AND ");
    }

    getSqlOrderByClauses(): string {
        if (this.isAnyOrdering()) {
            var orderByClauses = this.ordering
                .map(prop => {
                    var clause = this.getClause(prop);
                    if (clause != null && QueryExpression.operatorClasses.get(clause.operator) == OperatorClass.Order) {
                        var mappedProp = this.mapping[prop];
                        if (mappedProp) {
                            prop = mappedProp.sqlName;
                        }
                        return prop + " " + (clause.operator == Operators.OrderDesc ? "DESC" : "ASC");
                    }
                    return "";
                })
            return "ORDER BY " + orderByClauses
                .filter(clause => clause != "")
                .join(", ");
        }
        return "";
    }

    getSqlLimitClause(): string {
        if (this.isAnyLimit()) {
            return " TOP " + this.getClause(this.limit).value + " ";
        }
        return "";
    }

    addRequestParameters(stmt: tds.TdsStatement) {
        for (var prop in this.mapping) {
            var clause = this.getClause(prop);
            if (clause != null) {
                if (clause.operator == Operators.Range) {
                    stmt.parameter(prop + "Low", this.mapping[prop].dataType, clause.value);
                    stmt.parameter(prop + "Hi", this.mapping[prop].dataType, clause.valueUpper);
                }
                else {
                    stmt.parameter(prop, clause.operator == Operators.Contains ? TYPES.NVarChar : this.mapping[prop].dataType, clause.value);
                }
            }
        }
    }

    private static getParamInfo(paramName: string): [string, Operators] {
        for (var suffix of QueryExpression.suffixOperators) {
            if (suffix[0]) {
                var retval = QueryExpression.checkParamInfo(paramName, suffix[0], suffix[1]);
                if (retval[1] != Operators.Unknown) {
                    return retval;
                }
            }
        }
        return [paramName, Operators.EqualTo];
    }

    private static checkParamInfo(paramName: string, suffixCheck: string, operator: Operators): [string, Operators] {
        var checkName = paramName.toLowerCase();
        var suffixIndex = checkName.lastIndexOf(suffixCheck);
        if (suffixIndex == checkName.length - suffixCheck.length) {
            return [paramName.substr(0, suffixIndex), operator];
        }
        return [paramName, Operators.Unknown];
    }

}


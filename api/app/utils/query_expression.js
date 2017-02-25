"use strict";
const tedious_1 = require("tedious");
var Operators;
(function (Operators) {
    Operators[Operators["Unknown"] = 0] = "Unknown";
    Operators[Operators["EqualTo"] = 1] = "EqualTo";
    Operators[Operators["LessThan"] = 2] = "LessThan";
    Operators[Operators["GreaterThan"] = 3] = "GreaterThan";
    Operators[Operators["Range"] = 4] = "Range";
    Operators[Operators["Contains"] = 5] = "Contains";
    Operators[Operators["OrderAsc"] = 6] = "OrderAsc";
    Operators[Operators["OrderDesc"] = 7] = "OrderDesc";
})(Operators = exports.Operators || (exports.Operators = {}));
var OperatorClass;
(function (OperatorClass) {
    OperatorClass[OperatorClass["Filter"] = 0] = "Filter";
    OperatorClass[OperatorClass["Order"] = 1] = "Order";
})(OperatorClass || (OperatorClass = {}));
class QueryExpression {
    constructor(queryParams) {
        this.params = {};
        this.mapping = null;
        this.ordering = null;
        for (var prop in queryParams) {
            var paramInfo = QueryExpression.getParamInfo(prop);
            var clause = this.getClause(paramInfo[0]);
            if (clause != null) {
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
    getClause(paramName) {
        return this.params[paramName.toLowerCase()];
    }
    isAnyFilter() {
        if (this.mapping) {
            for (var prop in this.mapping) {
                var clause = this.getClause(prop);
                if (clause != null && QueryExpression.operatorClasses.get(clause.operator) == OperatorClass.Filter) {
                    return true;
                }
            }
            return false;
        }
        return Object.keys(this.params).length > 0;
    }
    isAnyOrdering() {
        if (this.ordering) {
            for (var prop of this.ordering) {
                var clause = this.getClause(prop);
                if (clause != null && QueryExpression.operatorClasses.get(clause.operator) == OperatorClass.Order) {
                    return true;
                }
            }
            return false;
        }
        return false;
    }
    isAnyLimit() {
        if (this.limit) {
            return this.getClause(this.limit) != null;
        }
        return false;
    }
    getSqlFilterPredicates() {
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
    getSqlOrderByClauses() {
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
            });
            return "ORDER BY " + orderByClauses
                .filter(clause => clause != "")
                .join(", ");
        }
        return "";
    }
    getSqlLimitClause() {
        if (this.isAnyLimit()) {
            return " TOP " + this.getClause(this.limit).value + " ";
        }
        return "";
    }
    addRequestParameters(stmt) {
        for (var prop in this.mapping) {
            var clause = this.getClause(prop);
            if (clause != null) {
                if (clause.operator == Operators.Range) {
                    stmt.parameter(prop + "Low", this.mapping[prop].dataType, clause.value);
                    stmt.parameter(prop + "Hi", this.mapping[prop].dataType, clause.valueUpper);
                }
                else {
                    stmt.parameter(prop, clause.operator == Operators.Contains ? tedious_1.TYPES.NVarChar : this.mapping[prop].dataType, clause.value);
                }
            }
        }
    }
    static getParamInfo(paramName) {
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
    static checkParamInfo(paramName, suffixCheck, operator) {
        var checkName = paramName.toLowerCase();
        var suffixIndex = checkName.lastIndexOf(suffixCheck);
        if (suffixIndex == checkName.length - suffixCheck.length) {
            return [paramName.substr(0, suffixIndex), operator];
        }
        return [paramName, Operators.Unknown];
    }
}
QueryExpression._suffix_gt = "_gt";
QueryExpression._suffix_lt = "_lt";
QueryExpression._suffix_in = "_in";
QueryExpression._suffix_asc = "_asc";
QueryExpression._suffix_desc = "_desc";
QueryExpression.suffixOperators = [
    [QueryExpression._suffix_gt, Operators.GreaterThan, OperatorClass.Filter],
    [QueryExpression._suffix_lt, Operators.LessThan, OperatorClass.Filter],
    [QueryExpression._suffix_in, Operators.Contains, OperatorClass.Filter],
    ["", Operators.EqualTo, OperatorClass.Filter],
    ["", Operators.Range, OperatorClass.Filter],
    [QueryExpression._suffix_asc, Operators.OrderAsc, OperatorClass.Order],
    [QueryExpression._suffix_desc, Operators.OrderDesc, OperatorClass.Order]
];
QueryExpression.operatorClasses = new Map(QueryExpression.suffixOperators.map((value) => {
    return [value[1], value[2]];
}));
exports.QueryExpression = QueryExpression;
//# sourceMappingURL=query_expression.js.map
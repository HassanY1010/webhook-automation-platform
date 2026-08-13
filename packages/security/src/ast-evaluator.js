"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNestedFieldValue = getNestedFieldValue;
exports.evaluateCondition = evaluateCondition;
exports.evaluateRuleGroup = evaluateRuleGroup;
const types_1 = require("@webhook-auto/types");
/**
 * Safely extracts nested property from payload using dot-notation (e.g. "order.price" or "items[0].id")
 */
function getNestedFieldValue(obj, path) {
    if (!obj || typeof obj !== 'object')
        return undefined;
    if (!path)
        return obj;
    const parts = path.replace(/\[(\d+)\]/g, '.$1').split('.');
    let current = obj;
    for (const part of parts) {
        if (current === null || current === undefined)
            return undefined;
        current = current[part];
    }
    return current;
}
/**
 * Evaluates a single condition against payload data without eval()
 */
function evaluateCondition(condition, payload) {
    const actualValue = getNestedFieldValue(payload, condition.field);
    const targetValue = condition.value;
    switch (condition.operator) {
        case types_1.RuleOperator.EQUALS:
            return actualValue === targetValue;
        case types_1.RuleOperator.NOT_EQUALS:
            return actualValue !== targetValue;
        case types_1.RuleOperator.CONTAINS:
            if (typeof actualValue === 'string') {
                return actualValue.includes(String(targetValue));
            }
            if (Array.isArray(actualValue)) {
                return actualValue.includes(targetValue);
            }
            return false;
        case types_1.RuleOperator.NOT_CONTAINS:
            return !evaluateCondition({ ...condition, operator: types_1.RuleOperator.CONTAINS }, payload);
        case types_1.RuleOperator.STARTS_WITH:
            return typeof actualValue === 'string' && actualValue.startsWith(String(targetValue));
        case types_1.RuleOperator.ENDS_WITH:
            return typeof actualValue === 'string' && actualValue.endsWith(String(targetValue));
        case types_1.RuleOperator.GREATER_THAN:
            return Number(actualValue) > Number(targetValue);
        case types_1.RuleOperator.LESS_THAN:
            return Number(actualValue) < Number(targetValue);
        case types_1.RuleOperator.GREATER_OR_EQUAL:
            return Number(actualValue) >= Number(targetValue);
        case types_1.RuleOperator.LESS_OR_EQUAL:
            return Number(actualValue) <= Number(targetValue);
        case types_1.RuleOperator.BETWEEN:
            if (Array.isArray(targetValue) && targetValue.length === 2) {
                const val = Number(actualValue);
                return val >= Number(targetValue[0]) && val <= Number(targetValue[1]);
            }
            return false;
        case types_1.RuleOperator.IN:
            if (Array.isArray(targetValue)) {
                return targetValue.includes(actualValue);
            }
            return false;
        case types_1.RuleOperator.NOT_IN:
            return !evaluateCondition({ ...condition, operator: types_1.RuleOperator.IN }, payload);
        case types_1.RuleOperator.EXISTS:
            return actualValue !== undefined && actualValue !== null;
        case types_1.RuleOperator.NOT_EXISTS:
            return actualValue === undefined || actualValue === null;
        case types_1.RuleOperator.REGEX:
            try {
                const regex = new RegExp(String(targetValue));
                return regex.test(String(actualValue ?? ''));
            }
            catch (err) {
                return false;
            }
        case types_1.RuleOperator.DATE_BEFORE:
            return new Date(actualValue).getTime() < new Date(targetValue).getTime();
        case types_1.RuleOperator.DATE_AFTER:
            return new Date(actualValue).getTime() > new Date(targetValue).getTime();
        case types_1.RuleOperator.DATE_BETWEEN:
            if (Array.isArray(targetValue) && targetValue.length === 2) {
                const t = new Date(actualValue).getTime();
                return t >= new Date(targetValue[0]).getTime() && t <= new Date(targetValue[1]).getTime();
            }
            return false;
        default:
            return false;
    }
}
/**
 * Recursively evaluates AST Rule Group
 */
function evaluateRuleGroup(group, payload) {
    if (!group)
        return true;
    const conditionResults = (group.conditions || []).map((cond) => evaluateCondition(cond, payload));
    const subGroupResults = (group.subGroups || []).map((sub) => evaluateRuleGroup(sub, payload));
    const allResults = [...conditionResults, ...subGroupResults];
    if (allResults.length === 0)
        return true;
    switch (group.logicalOperator) {
        case types_1.LogicalOperator.AND:
            return allResults.every(Boolean);
        case types_1.LogicalOperator.OR:
            return allResults.some(Boolean);
        case types_1.LogicalOperator.NOT:
            return !allResults.some(Boolean);
        default:
            return allResults.every(Boolean);
    }
}
//# sourceMappingURL=ast-evaluator.js.map
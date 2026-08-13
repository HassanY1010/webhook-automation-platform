import { RuleOperator, LogicalOperator, RuleCondition, RuleGroup } from '@webhook-auto/types';

/**
 * Safely extracts nested property from payload using dot-notation (e.g. "order.price" or "items[0].id")
 */
export function getNestedFieldValue(obj: any, path: string): any {
  if (!obj || typeof obj !== 'object') return undefined;
  if (!path) return obj;

  const parts = path.replace(/\[(\d+)\]/g, '.$1').split('.');
  let current = obj;

  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    current = current[part];
  }

  return current;
}

/**
 * Evaluates a single condition against payload data without eval()
 */
export function evaluateCondition(condition: RuleCondition, payload: any): boolean {
  const actualValue = getNestedFieldValue(payload, condition.field);
  const targetValue = condition.value;

  switch (condition.operator) {
    case RuleOperator.EQUALS:
      return actualValue === targetValue;

    case RuleOperator.NOT_EQUALS:
      return actualValue !== targetValue;

    case RuleOperator.CONTAINS:
      if (typeof actualValue === 'string') {
        return actualValue.includes(String(targetValue));
      }
      if (Array.isArray(actualValue)) {
        return actualValue.includes(targetValue);
      }
      return false;

    case RuleOperator.NOT_CONTAINS:
      return !evaluateCondition({ ...condition, operator: RuleOperator.CONTAINS }, payload);

    case RuleOperator.STARTS_WITH:
      return typeof actualValue === 'string' && actualValue.startsWith(String(targetValue));

    case RuleOperator.ENDS_WITH:
      return typeof actualValue === 'string' && actualValue.endsWith(String(targetValue));

    case RuleOperator.GREATER_THAN:
      return Number(actualValue) > Number(targetValue);

    case RuleOperator.LESS_THAN:
      return Number(actualValue) < Number(targetValue);

    case RuleOperator.GREATER_OR_EQUAL:
      return Number(actualValue) >= Number(targetValue);

    case RuleOperator.LESS_OR_EQUAL:
      return Number(actualValue) <= Number(targetValue);

    case RuleOperator.BETWEEN:
      if (Array.isArray(targetValue) && targetValue.length === 2) {
        const val = Number(actualValue);
        return val >= Number(targetValue[0]) && val <= Number(targetValue[1]);
      }
      return false;

    case RuleOperator.IN:
      if (Array.isArray(targetValue)) {
        return targetValue.includes(actualValue);
      }
      return false;

    case RuleOperator.NOT_IN:
      return !evaluateCondition({ ...condition, operator: RuleOperator.IN }, payload);

    case RuleOperator.EXISTS:
      return actualValue !== undefined && actualValue !== null;

    case RuleOperator.NOT_EXISTS:
      return actualValue === undefined || actualValue === null;

    case RuleOperator.REGEX:
      try {
        const regex = new RegExp(String(targetValue));
        return regex.test(String(actualValue ?? ''));
      } catch (err) {
        return false;
      }

    case RuleOperator.DATE_BEFORE:
      return new Date(actualValue).getTime() < new Date(targetValue).getTime();

    case RuleOperator.DATE_AFTER:
      return new Date(actualValue).getTime() > new Date(targetValue).getTime();

    case RuleOperator.DATE_BETWEEN:
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
export function evaluateRuleGroup(group: RuleGroup, payload: any): boolean {
  if (!group) return true;

  const conditionResults = (group.conditions || []).map((cond) =>
    evaluateCondition(cond, payload)
  );

  const subGroupResults = (group.subGroups || []).map((sub) =>
    evaluateRuleGroup(sub, payload)
  );

  const allResults = [...conditionResults, ...subGroupResults];

  if (allResults.length === 0) return true;

  switch (group.logicalOperator) {
    case LogicalOperator.AND:
      return allResults.every(Boolean);

    case LogicalOperator.OR:
      return allResults.some(Boolean);

    case LogicalOperator.NOT:
      return !allResults.some(Boolean);

    default:
      return allResults.every(Boolean);
  }
}

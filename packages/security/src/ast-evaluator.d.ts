import { RuleCondition, RuleGroup } from '@webhook-auto/types';
/**
 * Safely extracts nested property from payload using dot-notation (e.g. "order.price" or "items[0].id")
 */
export declare function getNestedFieldValue(obj: any, path: string): any;
/**
 * Evaluates a single condition against payload data without eval()
 */
export declare function evaluateCondition(condition: RuleCondition, payload: any): boolean;
/**
 * Recursively evaluates AST Rule Group
 */
export declare function evaluateRuleGroup(group: RuleGroup, payload: any): boolean;
//# sourceMappingURL=ast-evaluator.d.ts.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ast_evaluator_1 = require("../../packages/security/src/ast-evaluator");
const types_1 = require("../../packages/types");
describe('AST Sandboxed Dynamic Rule Evaluator Unit Tests', () => {
    const payload = {
        price: 350,
        status: 'available',
        item: {
            category: 'hotel',
            tags: ['luxury', 'beach', 'resort'],
        },
        createdDate: '2026-08-12T12:00:00Z',
    };
    it('should evaluate EQUALS operator correctly', () => {
        const res = (0, ast_evaluator_1.evaluateCondition)({ field: 'status', operator: types_1.RuleOperator.EQUALS, value: 'available' }, payload);
        expect(res).toBe(true);
    });
    it('should evaluate LESS_OR_EQUAL operator correctly', () => {
        const res = (0, ast_evaluator_1.evaluateCondition)({ field: 'price', operator: types_1.RuleOperator.LESS_OR_EQUAL, value: 500 }, payload);
        expect(res).toBe(true);
    });
    it('should evaluate CONTAINS for arrays correctly', () => {
        const res = (0, ast_evaluator_1.evaluateCondition)({ field: 'item.tags', operator: types_1.RuleOperator.CONTAINS, value: 'luxury' }, payload);
        expect(res).toBe(true);
    });
    it('should evaluate AND Rule Groups correctly', () => {
        const ruleGroup = {
            logicalOperator: types_1.LogicalOperator.AND,
            conditions: [
                { field: 'price', operator: types_1.RuleOperator.LESS_OR_EQUAL, value: 500 },
                { field: 'status', operator: types_1.RuleOperator.EQUALS, value: 'available' },
            ],
        };
        const res = (0, ast_evaluator_1.evaluateRuleGroup)(ruleGroup, payload);
        expect(res).toBe(true);
    });
    it('should reject when AND condition fails', () => {
        const ruleGroup = {
            logicalOperator: types_1.LogicalOperator.AND,
            conditions: [
                { field: 'price', operator: types_1.RuleOperator.LESS_THAN, value: 100 },
                { field: 'status', operator: types_1.RuleOperator.EQUALS, value: 'available' },
            ],
        };
        const res = (0, ast_evaluator_1.evaluateRuleGroup)(ruleGroup, payload);
        expect(res).toBe(false);
    });
});
//# sourceMappingURL=ast-evaluator.spec.js.map
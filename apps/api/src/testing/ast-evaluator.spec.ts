import { evaluateRuleGroup, evaluateCondition } from '@webhook-auto/security';
import { RuleOperator, LogicalOperator } from '@webhook-auto/types';

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
    const res = evaluateCondition(
      { field: 'status', operator: RuleOperator.EQUALS, value: 'available' },
      payload
    );
    expect(res).toBe(true);
  });

  it('should evaluate LESS_OR_EQUAL operator correctly', () => {
    const res = evaluateCondition(
      { field: 'price', operator: RuleOperator.LESS_OR_EQUAL, value: 500 },
      payload
    );
    expect(res).toBe(true);
  });

  it('should evaluate CONTAINS for arrays correctly', () => {
    const res = evaluateCondition(
      { field: 'item.tags', operator: RuleOperator.CONTAINS, value: 'luxury' },
      payload
    );
    expect(res).toBe(true);
  });

  it('should evaluate AND Rule Groups correctly', () => {
    const ruleGroup = {
      logicalOperator: LogicalOperator.AND,
      conditions: [
        { field: 'price', operator: RuleOperator.LESS_OR_EQUAL, value: 500 },
        { field: 'status', operator: RuleOperator.EQUALS, value: 'available' },
      ],
    };
    const res = evaluateRuleGroup(ruleGroup, payload);
    expect(res).toBe(true);
  });

  it('should reject when AND condition fails', () => {
    const ruleGroup = {
      logicalOperator: LogicalOperator.AND,
      conditions: [
        { field: 'price', operator: RuleOperator.LESS_THAN, value: 100 },
        { field: 'status', operator: RuleOperator.EQUALS, value: 'available' },
      ],
    };
    const res = evaluateRuleGroup(ruleGroup, payload);
    expect(res).toBe(false);
  });
});

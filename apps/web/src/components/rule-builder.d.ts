import React from 'react';
import { RuleOperator, LogicalOperator } from '@webhook-auto/types';
interface RuleCondition {
    field: string;
    operator: RuleOperator;
    value: any;
}
interface RuleGroup {
    logicalOperator: LogicalOperator;
    conditions: RuleCondition[];
}
interface RuleBuilderProps {
    rules: RuleGroup;
    onChange: (updatedRules: RuleGroup) => void;
}
export declare function RuleBuilder({ rules, onChange }: RuleBuilderProps): React.JSX.Element;
export {};
//# sourceMappingURL=rule-builder.d.ts.map
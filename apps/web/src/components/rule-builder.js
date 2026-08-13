'use client';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RuleBuilder = RuleBuilder;
const react_1 = __importDefault(require("react"));
const types_1 = require("@webhook-auto/types");
const lucide_react_1 = require("lucide-react");
const operatorsList = [
    { label: 'Equals (==)', value: types_1.RuleOperator.EQUALS },
    { label: 'Not Equals (!=)', value: types_1.RuleOperator.NOT_EQUALS },
    { label: 'Contains', value: types_1.RuleOperator.CONTAINS },
    { label: 'Greater Than (>)', value: types_1.RuleOperator.GREATER_THAN },
    { label: 'Less Than (<)', value: types_1.RuleOperator.LESS_THAN },
    { label: 'Less Than or Equals (<=)', value: types_1.RuleOperator.LESS_OR_EQUAL },
    { label: 'Greater Than or Equals (>=)', value: types_1.RuleOperator.GREATER_OR_EQUAL },
    { label: 'In List', value: types_1.RuleOperator.IN },
    { label: 'Regex Match', value: types_1.RuleOperator.REGEX },
    { label: 'Field Exists', value: types_1.RuleOperator.EXISTS },
];
function RuleBuilder({ rules, onChange }) {
    const addCondition = () => {
        const updated = {
            ...rules,
            conditions: [
                ...(rules.conditions || []),
                { field: 'price', operator: types_1.RuleOperator.LESS_OR_EQUAL, value: 500 },
            ],
        };
        onChange(updated);
    };
    const removeCondition = (index) => {
        const updated = {
            ...rules,
            conditions: rules.conditions.filter((_, i) => i !== index),
        };
        onChange(updated);
    };
    const updateCondition = (index, key, val) => {
        const updatedConditions = [...rules.conditions];
        updatedConditions[index] = { ...updatedConditions[index], [key]: val };
        onChange({ ...rules, conditions: updatedConditions });
    };
    const setLogicalOp = (op) => {
        onChange({ ...rules, logicalOperator: op });
    };
    return (<div className="bg-dark-card border border-dark-border rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-dark-border pb-3">
        <div className="flex items-center gap-2">
          <lucide_react_1.ShieldAlert className="w-4 h-4 text-blue-400"/>
          <h3 className="font-semibold text-sm text-slate-100">Visual Rule Builder</h3>
        </div>

        <div className="flex items-center gap-1 bg-dark-bg p-1 rounded-lg border border-dark-border">
          {['AND', 'OR', 'NOT'].map((op) => (<button key={op} type="button" onClick={() => setLogicalOp(op)} className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${rules.logicalOperator === op
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'}`}>
              {op}
            </button>))}
        </div>
      </div>

      <div className="space-y-3">
        {rules.conditions?.map((cond, idx) => (<div key={idx} className="flex items-center gap-3 bg-dark-bg/60 p-3 rounded-lg border border-dark-border">
            <span className="text-xs font-bold text-slate-500 w-12">{idx === 0 ? 'WHEN' : rules.logicalOperator}</span>

            {/* Field */}
            <input type="text" placeholder="e.g. price" value={cond.field} onChange={(e) => updateCondition(idx, 'field', e.target.value)} className="bg-dark-bg border border-dark-border rounded-md px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 w-1/3"/>

            {/* Operator */}
            <select value={cond.operator} onChange={(e) => updateCondition(idx, 'operator', e.target.value)} className="bg-dark-bg border border-dark-border rounded-md px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 w-1/3">
              {operatorsList.map((op) => (<option key={op.value} value={op.value}>
                  {op.label}
                </option>))}
            </select>

            {/* Value */}
            <input type="text" placeholder="e.g. 500" value={String(cond.value ?? '')} onChange={(e) => updateCondition(idx, 'value', e.target.value)} className="bg-dark-bg border border-dark-border rounded-md px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 w-1/3"/>

            {/* Remove */}
            <button type="button" onClick={() => removeCondition(idx)} className="p-1.5 rounded-md text-slate-500 hover:text-rose-400 hover:bg-rose-500/10">
              <lucide_react_1.Trash2 className="w-4 h-4"/>
            </button>
          </div>))}
      </div>

      <button type="button" onClick={addCondition} className="flex items-center gap-2 text-xs font-semibold text-blue-400 hover:text-blue-300 py-1">
        <lucide_react_1.Plus className="w-4 h-4"/>
        Add Condition Rule
      </button>
    </div>);
}
//# sourceMappingURL=rule-builder.js.map
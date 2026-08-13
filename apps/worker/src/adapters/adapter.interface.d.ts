import { ActionResult, ActionType } from '@webhook-auto/types';
export interface ActionAdapter {
    type: ActionType;
    execute(config: any, payload: any, metadata: {
        executionId: string;
        botId: string;
    }): Promise<ActionResult>;
}
export declare function interpolateTemplate(template: string, data: Record<string, any>): string;
//# sourceMappingURL=adapter.interface.d.ts.map
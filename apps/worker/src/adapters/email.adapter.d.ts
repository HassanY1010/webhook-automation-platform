import { ActionAdapter } from './adapter.interface';
import { ActionResult, ActionType } from '@webhook-auto/types';
export declare class EmailAdapter implements ActionAdapter {
    type: ActionType;
    execute(config: any, payload: any): Promise<ActionResult>;
}
//# sourceMappingURL=email.adapter.d.ts.map
import { ActionAdapter } from './adapter.interface';
import { ActionResult, ActionType } from '@webhook-auto/types';
export declare class TelegramAdapter implements ActionAdapter {
    type: ActionType;
    execute(config: any, payload: any): Promise<ActionResult>;
}
//# sourceMappingURL=telegram.adapter.d.ts.map
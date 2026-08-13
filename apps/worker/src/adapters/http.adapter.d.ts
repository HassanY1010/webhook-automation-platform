import { ActionAdapter } from './adapter.interface';
import { ActionResult, ActionType } from '@webhook-auto/types';
export declare class HttpAdapter implements ActionAdapter {
    type: ActionType;
    execute(config: any, payload: any): Promise<ActionResult>;
}
//# sourceMappingURL=http.adapter.d.ts.map
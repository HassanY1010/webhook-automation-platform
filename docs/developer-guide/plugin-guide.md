# Developer Guide: Adding Action Plugins & Integration Adapters

## Extensible Plugin Architecture

All outgoing actions implement the `ActionAdapter` interface defined in `apps/worker/src/adapters/adapter.interface.ts`:

```typescript
export interface ActionAdapter {
  type: ActionType;
  execute(
    config: any,
    payload: any,
    metadata: { executionId: string; botId: string }
  ): Promise<ActionResult>;
}
```

## Step-by-Step Guide to Add a New Action Plugin (e.g. Slack / Discord / WhatsApp)

1. **Define Action Type in `@webhook-auto/types`**:
   Add new enum value in `ActionType`:
   ```typescript
   export enum ActionType {
     SLACK_NOTIFICATION = 'SLACK_NOTIFICATION',
   }
   ```

2. **Create Adapter Class**:
   Create `apps/worker/src/adapters/slack.adapter.ts`:
   ```typescript
   import { ActionAdapter } from './adapter.interface';
   import { ActionResult, ActionType } from '@webhook-auto/types';

   export class SlackAdapter implements ActionAdapter {
     type = ActionType.SLACK_NOTIFICATION;

     async execute(config: any, payload: any): Promise<ActionResult> {
       // Implementation logic...
     }
   }
   ```

3. **Register Adapter in Worker**:
   Register the adapter instance in `apps/worker/src/index.ts`:
   ```typescript
   const adapters = {
     [ActionType.SLACK_NOTIFICATION]: new SlackAdapter(),
   };
   ```

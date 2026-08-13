import { ActionResult, ActionType } from '@webhook-auto/types';

export interface ActionAdapter {
  type: ActionType;
  execute(config: any, payload: any, metadata: { executionId: string; botId: string }): Promise<ActionResult>;
}

export function interpolateTemplate(template: string, data: Record<string, any>): string {
  if (!template) return '';
  return template.replace(/\{\{\s*event\.([a-zA-Z0-9_.]+)\s*\}\}/g, (_, path) => {
    const parts = path.split('.');
    let val = data;
    for (const p of parts) {
      if (val === null || val === undefined) return '';
      val = val[p];
    }
    return val !== undefined ? String(val) : '';
  });
}

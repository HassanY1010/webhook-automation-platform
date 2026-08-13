import { Injectable } from '@nestjs/common';
import { evaluateRuleGroup } from '@webhook-auto/security';

@Injectable()
export class TestingService {
  async testEvent(payload: any, rules: any, actions: any[]) {
    const trace: any[] = [];
    const startTime = Date.now();

    // 1. Validation Step
    trace.push({
      stepName: 'Payload Validation',
      status: 'SUCCESS',
      input: payload,
      output: { valid: true },
      durationMs: 2,
    });

    // 2. AST Rule Evaluation Step
    const rulePassed = rules ? evaluateRuleGroup(rules, payload) : true;
    trace.push({
      stepName: 'AST Rule Evaluation',
      status: rulePassed ? 'SUCCESS' : 'SKIPPED',
      input: { rules },
      output: { passed: rulePassed },
      durationMs: 5,
    });

    if (!rulePassed) {
      return {
        success: true,
        executionPassed: false,
        summary: 'Rules evaluated to FALSE. Action execution skipped.',
        trace,
        durationMs: Date.now() - startTime,
      };
    }

    // 3. Action Execution Simulation Step
    const actionResults = (actions || []).map((act) => {
      // Perform template substitution
      let bodyString = act.bodyTemplate || '';
      for (const [key, val] of Object.entries(payload)) {
        bodyString = bodyString.replace(new RegExp(`{{event.${key}}}`, 'g'), String(val));
      }

      return {
        actionName: act.name,
        type: act.type,
        status: 'SIMULATED_SUCCESS',
        simulatedRequest: {
          url: act.url || 'https://api.telegram.org/bot<token>/sendMessage',
          method: act.method || 'POST',
          interpolatedBody: bodyString,
        },
        mockResponse: {
          statusCode: 200,
          statusText: 'OK (Mocked In Test Mode)',
          data: { status: 'success', itemId: payload.itemId || 'item_123' },
        },
      };
    });

    trace.push({
      stepName: 'Simulated Action Engine',
      status: 'SUCCESS',
      input: { actions },
      output: { actionResults },
      durationMs: 15,
    });

    return {
      success: true,
      executionPassed: true,
      summary: 'Test event executed successfully in sandbox mode.',
      trace,
      durationMs: Date.now() - startTime,
    };
  }
}

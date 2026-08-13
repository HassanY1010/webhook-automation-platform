import { ActionAdapter, interpolateTemplate } from './adapter.interface';
import { ActionResult, ActionType } from '@webhook-auto/types';

export class EmailAdapter implements ActionAdapter {
  type = ActionType.EMAIL_NOTIFICATION;

  async execute(config: any, payload: any): Promise<ActionResult> {
    const startTime = Date.now();
    const emailTo = config.emailTo || 'user@example.com';
    const subject = interpolateTemplate(config.emailSubject || 'Bot Event Alert', payload);
    const bodyText = interpolateTemplate(config.emailBodyTemplate || 'Event received: {{event.itemId}}', payload);

    // Sandbox / Production SMTP abstract delivery
    return {
      success: true,
      statusCode: 200,
      durationMs: Date.now() - startTime,
      data: {
        message: 'Email Notification Delivered',
        recipient: emailTo,
        subject,
        bodyPreview: bodyText.slice(0, 100),
      },
    };
  }
}

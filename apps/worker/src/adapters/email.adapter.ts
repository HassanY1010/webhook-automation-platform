import nodemailer from 'nodemailer';
import { ActionAdapter, interpolateTemplate } from './adapter.interface';
import { ActionResult, ActionType } from '@webhook-auto/types';

/**
 * EmailAdapter — Real SMTP delivery via nodemailer.
 *
 * Required environment variables:
 *   SMTP_HOST     e.g. smtp.mailtrap.io
 *   SMTP_PORT     e.g. 587 (STARTTLS) or 465 (SSL)
 *   SMTP_USER     SMTP username
 *   SMTP_PASS     SMTP password
 *   SMTP_FROM     Sender address, e.g. "Platform <noreply@example.com>"
 *
 * If SMTP_HOST is not set, the adapter throws an error so the execution
 * is marked FAILED rather than silently returning a fake success.
 *
 * Transient SMTP errors (connection reset, 4xx temp failures) surface
 * as retryable=true so the worker retry mechanism can recover them.
 */
export class EmailAdapter implements ActionAdapter {
  type = ActionType.EMAIL_NOTIFICATION;

  async execute(config: any, payload: any): Promise<ActionResult> {
    const startTime = Date.now();

    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpFrom =
      process.env.SMTP_FROM || '"Webhook Platform" <noreply@webhookplatform.io>';

    // Guard: fail loudly if SMTP is not configured so operators know immediately
    if (!smtpHost) {
      return {
        success: false,
        durationMs: Date.now() - startTime,
        error: {
          code: 'SMTP_NOT_CONFIGURED',
          message:
            'Email delivery is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS environment variables.',
          retryable: false,
        },
      };
    }

    const emailTo = config.emailTo;
    if (!emailTo) {
      return {
        success: false,
        durationMs: Date.now() - startTime,
        error: {
          code: 'EMAIL_MISSING_RECIPIENT',
          message: 'Action config is missing required field: emailTo',
          retryable: false,
        },
      };
    }

    const subject = interpolateTemplate(
      config.emailSubject || 'Webhook Automation Notification',
      payload,
    );
    const bodyText = interpolateTemplate(
      config.emailBodyTemplate || 'Event received:\n\n{{event.itemId}}',
      payload,
    );

    // Create a per-invocation transporter so credentials come fresh from env
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // true for SSL, false for STARTTLS
      auth: smtpUser && smtpPass ? { user: smtpUser, pass: smtpPass } : undefined,
    });

    try {
      const info = await transporter.sendMail({
        from: smtpFrom,
        to: emailTo,
        subject,
        text: bodyText,
      });

      return {
        success: true,
        statusCode: 250,
        durationMs: Date.now() - startTime,
        data: {
          messageId: info.messageId,
          recipient: emailTo,
          subject,
        },
      };
    } catch (err: any) {
      // Classify error as transient (retryable) or permanent
      const isTransient =
        err.responseCode >= 400 && err.responseCode < 500
          ? false // 4xx = permanent rejection
          : true; // connection errors, 5xx = transient

      return {
        success: false,
        durationMs: Date.now() - startTime,
        error: {
          code: err.code || 'SMTP_SEND_ERROR',
          message: err.message,
          retryable: isTransient,
        },
      };
    } finally {
      // Close connection pool after each send (worker is long-lived)
      transporter.close();
    }
  }
}

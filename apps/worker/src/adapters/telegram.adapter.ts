import axios from 'axios';
import { ActionAdapter, interpolateTemplate } from './adapter.interface';
import { ActionResult, ActionType } from '@webhook-auto/types';

export class TelegramAdapter implements ActionAdapter {
  type = ActionType.TELEGRAM_NOTIFICATION;

  async execute(config: any, payload: any): Promise<ActionResult> {
    const startTime = Date.now();
    const token = config.botToken || process.env.TELEGRAM_BOT_TOKEN || 'SANDBOX_TOKEN';
    const chatId = config.telegramChatId || '-10012345678';
    const rawTemplate = config.telegramMessageTemplate || '🤖 Bot Notification\nEvent Payload: {{event.itemId}}';

    const messageText = interpolateTemplate(rawTemplate, payload);

    // If sandbox / mock mode
    if (token === 'SANDBOX_TOKEN' || !process.env.TELEGRAM_BOT_TOKEN) {
      return {
        success: true,
        statusCode: 200,
        durationMs: Date.now() - startTime,
        data: { message: 'Telegram Notification Simulated (Sandbox Mode)', sentText: messageText },
      };
    }

    try {
      const response = await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
        chat_id: chatId,
        text: messageText,
        parse_mode: 'HTML',
      });

      return {
        success: response.data.ok,
        statusCode: 200,
        durationMs: Date.now() - startTime,
        data: response.data.result,
      };
    } catch (err: any) {
      return {
        success: false,
        durationMs: Date.now() - startTime,
        error: { code: 'TELEGRAM_ERROR', message: err.message, retryable: true },
      };
    }
  }
}

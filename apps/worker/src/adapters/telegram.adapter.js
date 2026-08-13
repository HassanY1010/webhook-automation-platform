"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramAdapter = void 0;
const axios_1 = __importDefault(require("axios"));
const adapter_interface_1 = require("./adapter.interface");
const types_1 = require("@webhook-auto/types");
class TelegramAdapter {
    type = types_1.ActionType.TELEGRAM_NOTIFICATION;
    async execute(config, payload) {
        const startTime = Date.now();
        const token = config.botToken || process.env.TELEGRAM_BOT_TOKEN || 'SANDBOX_TOKEN';
        const chatId = config.telegramChatId || '-10012345678';
        const rawTemplate = config.telegramMessageTemplate || '🤖 Bot Notification\nEvent Payload: {{event.itemId}}';
        const messageText = (0, adapter_interface_1.interpolateTemplate)(rawTemplate, payload);
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
            const response = await axios_1.default.post(`https://api.telegram.org/bot${token}/sendMessage`, {
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
        }
        catch (err) {
            return {
                success: false,
                durationMs: Date.now() - startTime,
                error: { code: 'TELEGRAM_ERROR', message: err.message, retryable: true },
            };
        }
    }
}
exports.TelegramAdapter = TelegramAdapter;
//# sourceMappingURL=telegram.adapter.js.map
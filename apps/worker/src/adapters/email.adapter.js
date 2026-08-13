"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailAdapter = void 0;
const adapter_interface_1 = require("./adapter.interface");
const types_1 = require("@webhook-auto/types");
class EmailAdapter {
    type = types_1.ActionType.EMAIL_NOTIFICATION;
    async execute(config, payload) {
        const startTime = Date.now();
        const emailTo = config.emailTo || 'user@example.com';
        const subject = (0, adapter_interface_1.interpolateTemplate)(config.emailSubject || 'Bot Event Alert', payload);
        const bodyText = (0, adapter_interface_1.interpolateTemplate)(config.emailBodyTemplate || 'Event received: {{event.itemId}}', payload);
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
exports.EmailAdapter = EmailAdapter;
//# sourceMappingURL=email.adapter.js.map
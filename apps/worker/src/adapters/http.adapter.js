"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpAdapter = void 0;
const axios_1 = __importDefault(require("axios"));
const adapter_interface_1 = require("./adapter.interface");
const types_1 = require("@webhook-auto/types");
const security_1 = require("@webhook-auto/security");
class HttpAdapter {
    type = types_1.ActionType.HTTP_REQUEST;
    async execute(config, payload) {
        const startTime = Date.now();
        const url = (0, adapter_interface_1.interpolateTemplate)(config.url, payload);
        const method = config.method || 'POST';
        const bodyStr = config.bodyTemplate ? (0, adapter_interface_1.interpolateTemplate)(config.bodyTemplate, payload) : JSON.stringify(payload);
        // SSRF Check
        const ssrfCheck = await (0, security_1.isSafeDestinationUrl)(url);
        if (!ssrfCheck.safe) {
            return {
                success: false,
                durationMs: Date.now() - startTime,
                error: {
                    code: 'SSRF_BLOCKED',
                    message: `SSRF Prevention: Target URL ${url} is forbidden. (${ssrfCheck.reason})`,
                    retryable: false,
                },
            };
        }
        try {
            let parsedBody;
            try {
                parsedBody = JSON.parse(bodyStr);
            }
            catch {
                parsedBody = bodyStr;
            }
            const response = await (0, axios_1.default)({
                method,
                url,
                data: parsedBody,
                headers: config.headers || { 'Content-Type': 'application/json' },
                timeout: config.timeoutMs || 10000,
                maxRedirects: 3,
                validateStatus: () => true, // Don't throw on HTTP status codes
            });
            const isSuccess = response.status >= 200 && response.status < 300;
            return {
                success: isSuccess,
                statusCode: response.status,
                durationMs: Date.now() - startTime,
                data: response.data,
                error: !isSuccess
                    ? {
                        code: `HTTP_${response.status}`,
                        message: `Upstream service returned status ${response.status}`,
                        retryable: response.status >= 500,
                    }
                    : undefined,
            };
        }
        catch (err) {
            return {
                success: false,
                durationMs: Date.now() - startTime,
                error: {
                    code: err.code || 'HTTP_ERROR',
                    message: err.message,
                    retryable: true,
                },
            };
        }
    }
}
exports.HttpAdapter = HttpAdapter;
//# sourceMappingURL=http.adapter.js.map
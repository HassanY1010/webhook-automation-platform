"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
exports.createChildLogger = createChildLogger;
const pino_1 = __importDefault(require("pino"));
exports.logger = (0, pino_1.default)({
    level: process.env.LOG_LEVEL || 'info',
    redact: {
        paths: [
            'password',
            'secret',
            'token',
            'authorization',
            'headers.authorization',
            'headers.cookie',
            'body.password',
            'body.token',
            'body.apiKey',
            'apiKey',
        ],
        censor: '********',
    },
    base: {
        env: process.env.NODE_ENV || 'development',
    },
    timestamp: pino_1.default.stdTimeFunctions.isoTime,
});
function createChildLogger(bindings) {
    return exports.logger.child(bindings);
}
//# sourceMappingURL=index.js.map
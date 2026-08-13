"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyHmacSignature = verifyHmacSignature;
const crypto = __importStar(require("crypto"));
function verifyHmacSignature(options) {
    const { payload, signature, secret, timestamp, toleranceSeconds = 300 } = options;
    if (!signature || !secret) {
        return false;
    }
    // Replay Attack Protection: Validate timestamp freshness
    if (timestamp) {
        const tsNumber = typeof timestamp === 'string' ? parseInt(timestamp, 10) : timestamp;
        const now = Math.floor(Date.now() / 1000);
        if (isNaN(tsNumber) || Math.abs(now - tsNumber) > toleranceSeconds) {
            return false; // Stale or future timestamp
        }
    }
    // Handle header formats like "t=123456,v1=sha256_hash" or raw sha256 hex
    let rawSignature = signature;
    if (signature.includes('v1=')) {
        const parts = signature.split(',');
        const v1Part = parts.find((p) => p.startsWith('v1='));
        if (v1Part)
            rawSignature = v1Part.replace('v1=', '');
    }
    const computedHmac = crypto
        .createHmac('sha256', secret)
        .update(timestamp ? `${timestamp}.${payload}` : payload)
        .digest('hex');
    try {
        const sigBuffer = Buffer.from(rawSignature.replace(/^sha256=/, ''), 'hex');
        const computedBuffer = Buffer.from(computedHmac, 'hex');
        if (sigBuffer.length !== computedBuffer.length) {
            return false;
        }
        return crypto.timingSafeEqual(sigBuffer, computedBuffer);
    }
    catch (err) {
        return false;
    }
}
//# sourceMappingURL=hmac.js.map
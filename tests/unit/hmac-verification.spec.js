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
const hmac_1 = require("../../packages/security/src/hmac");
const crypto = __importStar(require("crypto"));
describe('HMAC Signature & Timestamp Verification Unit Tests', () => {
    const secret = 'super-secret-webhook-key';
    const payload = JSON.stringify({ itemId: '123', price: 300 });
    it('should verify valid HMAC signature', () => {
        const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
        const isValid = (0, hmac_1.verifyHmacSignature)({ payload, signature, secret });
        expect(isValid).toBe(true);
    });
    it('should reject invalid HMAC signature', () => {
        const isValid = (0, hmac_1.verifyHmacSignature)({ payload, signature: 'bad_signature_hex', secret });
        expect(isValid).toBe(false);
    });
});
//# sourceMappingURL=hmac-verification.spec.js.map
export interface WebhookVerificationOptions {
    payload: string | Buffer;
    signature: string;
    secret: string;
    timestamp?: string | number;
    toleranceSeconds?: number;
}
export declare function verifyHmacSignature(options: WebhookVerificationOptions): boolean;
//# sourceMappingURL=hmac.d.ts.map
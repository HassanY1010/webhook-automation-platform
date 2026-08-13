export declare function isSafeDestinationUrl(inputUrl: string, allowedDomains?: string[]): Promise<{
    safe: boolean;
    reason?: string;
    resolvedIp?: string;
}>;
export declare function isPrivateIp(ip: string): boolean;
//# sourceMappingURL=ssrf-validator.d.ts.map
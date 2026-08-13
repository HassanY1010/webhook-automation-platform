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
exports.isSafeDestinationUrl = isSafeDestinationUrl;
exports.isPrivateIp = isPrivateIp;
const net = __importStar(require("net"));
const dns = __importStar(require("dns/promises"));
const url_1 = require("url");
const PRIVATE_IP_RANGES = [
    /^127\.\d+\.\d+\.\d+$/, // Loopback IPv4
    /^10\.\d+\.\d+\.\d+$/, // Class A Private
    /^172\.(1[6-9]|2[0-9]|3[01])\.\d+\.\d+$/, // Class B Private
    /^192\.168\.\d+\.\d+$/, // Class C Private
    /^169\.254\.\d+\.\d+$/, // Link-local / Cloud Metadata (AWS, GCP, Azure)
    /^0\.\d+\.\d+\.\d+$/,
    /^::1$/, // Loopback IPv6
    /^fc00:/i, // Unique Local IPv6
    /^fe80:/i, // Link-local IPv6
];
async function isSafeDestinationUrl(inputUrl, allowedDomains = []) {
    try {
        const parsed = new url_1.URL(inputUrl);
        // Require HTTP or HTTPS
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
            return { safe: false, reason: `Protocol ${parsed.protocol} is not allowed` };
        }
        const hostname = parsed.hostname;
        // Check allowed domains whitelist if specified
        if (allowedDomains.length > 0) {
            const isAllowed = allowedDomains.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`));
            if (!isAllowed) {
                return { safe: false, reason: `Domain ${hostname} is not in allowlist` };
            }
        }
        // Direct IP check
        if (net.isIP(hostname)) {
            if (isPrivateIp(hostname)) {
                return { safe: false, reason: `Direct private IP ${hostname} is blocked`, resolvedIp: hostname };
            }
            return { safe: true, resolvedIp: hostname };
        }
        // DNS Resolution check to prevent DNS rebinding attacks
        const addresses = await dns.lookup(hostname, { all: true });
        for (const addr of addresses) {
            if (isPrivateIp(addr.address)) {
                return {
                    safe: false,
                    reason: `Hostname ${hostname} resolved to private IP ${addr.address}`,
                    resolvedIp: addr.address,
                };
            }
        }
        return { safe: true, resolvedIp: addresses[0]?.address };
    }
    catch (error) {
        return { safe: false, reason: `Invalid URL or DNS resolution failed: ${error.message}` };
    }
}
function isPrivateIp(ip) {
    return PRIVATE_IP_RANGES.some((regex) => regex.test(ip));
}
//# sourceMappingURL=ssrf-validator.js.map
import * as net from 'net';
import * as dns from 'dns/promises';
import { URL } from 'url';

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

export async function isSafeDestinationUrl(
  inputUrl: string,
  allowedDomains: string[] = []
): Promise<{ safe: boolean; reason?: string; resolvedIp?: string }> {
  try {
    const parsed = new URL(inputUrl);

    // Require HTTP or HTTPS
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { safe: false, reason: `Protocol ${parsed.protocol} is not allowed` };
    }

    const hostname = parsed.hostname;

    // Check allowed domains whitelist if specified
    if (allowedDomains.length > 0) {
      const isAllowed = allowedDomains.some(
        (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
      );
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
  } catch (error: any) {
    return { safe: false, reason: `Invalid URL or DNS resolution failed: ${error.message}` };
  }
}

export function isPrivateIp(ip: string): boolean {
  return PRIVATE_IP_RANGES.some((regex) => regex.test(ip));
}

import axios from 'axios';
import { ActionAdapter, interpolateTemplate } from './adapter.interface';
import { ActionResult, ActionType } from '@webhook-auto/types';
import { isSafeDestinationUrl } from '@webhook-auto/security';

export class HttpAdapter implements ActionAdapter {
  type = ActionType.HTTP_REQUEST;

  async execute(config: any, payload: any): Promise<ActionResult> {
    const startTime = Date.now();
    let url = interpolateTemplate(config.url, payload);
    const method = config.method || 'POST';
    const bodyStr = config.bodyTemplate ? interpolateTemplate(config.bodyTemplate, payload) : JSON.stringify(payload);

    let redirectsFollowed = 0;
    const maxRedirects = 3;

    while (redirectsFollowed <= maxRedirects) {
      // SSRF Check for current target URL
      const ssrfCheck = await isSafeDestinationUrl(url);
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
        let parsedBody: any;
        try {
          parsedBody = JSON.parse(bodyStr);
        } catch {
          parsedBody = bodyStr;
        }

        const response = await axios({
          method: redirectsFollowed > 0 ? 'GET' : method,
          url,
          data: redirectsFollowed > 0 ? undefined : parsedBody,
          headers: config.headers || { 'Content-Type': 'application/json' },
          timeout: config.timeoutMs || 10000,
          maxRedirects: 0, // Disable automatic un-validated redirects
          validateStatus: () => true,
        });

        // Handle redirects manually with SSRF validation per hop
        if ([301, 302, 303, 307, 308].includes(response.status) && response.headers.location) {
          redirectsFollowed++;
          if (redirectsFollowed > maxRedirects) {
            return {
              success: false,
              statusCode: response.status,
              durationMs: Date.now() - startTime,
              error: {
                code: 'TOO_MANY_REDIRECTS',
                message: 'Exceeded maximum redirect limit of 3',
                retryable: false,
              },
            };
          }
          // Resolve relative or absolute redirect URLs
          url = new URL(response.headers.location, url).toString();
          continue; // Re-validate target URL with isSafeDestinationUrl on next iteration
        }

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
      } catch (err: any) {
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

    return {
      success: false,
      durationMs: Date.now() - startTime,
      error: { code: 'REDIRECT_ERROR', message: 'Failed to process HTTP request', retryable: false },
    };
  }
}

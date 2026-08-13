import pino from 'pino';

export const logger = pino({
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
  timestamp: pino.stdTimeFunctions.isoTime,
});

export function createChildLogger(bindings: Record<string, any>) {
  return logger.child(bindings);
}

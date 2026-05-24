/**
 * Structured logger for Weytin Platform.
 * Prevents raw console.* usage as per CLAUDE.md.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';
type LogContext = Record<string, unknown> | undefined;

const logger = {
  debug: (message: string, context?: LogContext) => log('debug', message, context),
  info: (message: string, context?: LogContext) => log('info', message, context),
  warn: (message: string, context?: LogContext) => log('warn', message, context),
  error: (message: string, context?: LogContext) => log('error', message, context),
};

function log(level: LogLevel, message: string, context?: LogContext) {
  // Only log debug in development
  if (level === 'debug' && process.env.NODE_ENV === 'production') return;

  const timestamp = new Date().toISOString();
  const contextString = context ? ` ${JSON.stringify(context)}` : '';
  
  const formattedMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}${contextString}`;

  switch (level) {
    case 'debug':
      console.debug(formattedMessage);
      break;
    case 'info':
      console.info(formattedMessage);
      break;
    case 'warn':
      console.warn(formattedMessage);
      break;
    case 'error':
      console.error(formattedMessage);
      break;
  }
}

export { logger };

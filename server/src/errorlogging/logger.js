function formatLog(level, message, ...meta) {
  const timestamp = new Date().toISOString();
  let reqIdPrefix = '';

  const metaString = meta.length
    ? ' ' +
      meta
        .map((item) => {
          if (item instanceof Error) return item.stack || item.message;
          if (typeof item === 'object') {
            if (item && item.requestId) {
              reqIdPrefix = `[ReqID: ${item.requestId}] `;
            }
            try {
              return JSON.stringify(item);
            } catch {
              return String(item);
            }
          }
          return String(item);
        })
        .join(' ')
    : '';

  return `[${timestamp}] [${level.toUpperCase()}]: ${reqIdPrefix}${message}${metaString}`;
}

const logger = {
  info: (message, ...meta) => {
    console.log(formatLog('info', message, ...meta));
  },
  error: (message, ...meta) => {
    console.error(formatLog('error', message, ...meta));
  },
  warn: (message, ...meta) => {
    console.warn(formatLog('warn', message, ...meta));
  },
  debug: (message, ...meta) => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(formatLog('debug', message, ...meta));
    }
  }
};

module.exports = logger;

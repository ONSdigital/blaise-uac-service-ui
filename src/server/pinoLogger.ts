import { type HttpLogger, type Options, pinoHttp } from "pino-http";

import type { IncomingMessage } from "node:http";

const PinoLevelToSeverityLookup: Record<string, string> = {
  trace: "DEBUG",
  debug: "DEBUG",
  info: "INFO",
  warn: "WARNING",
  error: "ERROR",
  fatal: "CRITICAL",
};

const defaultPinoConf: Options = {
  messageKey: "message",
  formatters: {
    level(label: string, number: unknown) {
      return {
        severity: PinoLevelToSeverityLookup[label] ?? PinoLevelToSeverityLookup["info"],
        level: number,
      };
    },
    log(info: Record<string, unknown>) {
      return { info };
    },
  },
  serializers: {
    req: (req: IncomingMessage & { raw?: IncomingMessage & { user?: unknown } }) => ({
      method: req.method,
      url: req.url,
      user: req.raw?.user,
    }),
  },
};

export default function createLogger(options: Options = { autoLogging: false }): HttpLogger {
  if (process.env.NODE_ENV === "production") {
    return pinoHttp({ ...options, ...defaultPinoConf });
  }

  return pinoHttp(options);
}

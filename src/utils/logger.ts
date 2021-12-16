import winston, { createLogger } from "winston";

winston.addColors({
  info: "bold blue",
  warn: "bold yellow",
  error: "bold red",
  debug: "green",
});

export const levels = ["info", "warn", "error", "debug"] as const;

export type LogLevel = typeof levels[number];

export const makeLogger = (name: string, level?: LogLevel) => {
  return createLogger({
    level,
    silent: !level,
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.errors({ stack: true }),
          winston.format.label({ label: name }),
          winston.format.timestamp({
            format: "MMM-DD-YYYY HH:mm:ss",
          }),

          winston.format.printf(
            (info) =>
              `[${info.timestamp as string}]: ${info.level}: ${info.label as string}: ${
                info.message
              }${info.stack ? "\n" + (info.stack as string) : " "}`
          ),
          winston.format.colorize({ all: true })
        ),
      }),
    ],
  });
};

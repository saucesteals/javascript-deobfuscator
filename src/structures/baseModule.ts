import { Logger } from "winston";
import { makeLogger, LogLevel } from "../utils/logger";

export interface ModuleOptions {
  loggerLevel?: LogLevel;
}

export abstract class BaseModule {
  public readonly name: string;
  protected logger: Logger;
  private options: ModuleOptions;
  constructor(name: string, options: ModuleOptions = {}) {
    this.options = options;
    this.name = name;
    this.logger = makeLogger(this.name, this.options.loggerLevel);
  }

  public abstract process(source: string): string;
}

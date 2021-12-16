import { Logger } from "winston";
import { makeLogger, LogLevel } from "../utils/logger";

export interface ModuleOptions {
  loggerLevel?: LogLevel;
}

/**
 * Abstract baseclass for modules
 */
export abstract class BaseModule {
  public readonly name: string;
  protected logger: Logger;
  private options: ModuleOptions;

  /**
   * @param {string} name The module's name
   * @param {ModuleOptions} [options={}] Module options
   */
  constructor(name: string, options: ModuleOptions = {}) {
    this.options = options;
    this.name = name;
    this.logger = makeLogger(this.name, this.options.loggerLevel);
  }

  /**
   * Processes source code by the module's specifications
   *
   * @param source Source code to process
   */
  public abstract process(source: string): string;
}

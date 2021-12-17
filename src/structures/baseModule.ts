import { Logger } from "winston";
import { makeLogger, LogLevel } from "../utils/logger";

export interface ModuleOptions {
  loggerLevel?: LogLevel;
}

/**
 * Abstract baseclass for modules
 */
export abstract class BaseModule<O extends ModuleOptions = ModuleOptions> {
  public readonly name: string;
  protected logger: Logger;
  protected options: O;

  /**
   * @param {string} name The module's name
   * @param {ModuleOptions} [options] Module options
   */
  constructor(name: string, options: O) {
    this.options = options;
    this.name = name;
    this.logger = makeLogger(this.name, this.options.loggerLevel);
  }

  /**
   * Processes source code by the module's specifications
   *
   * @abstract
   * @param source Source code to process
   */
  public abstract process(source: string): string | Promise<string>;
}

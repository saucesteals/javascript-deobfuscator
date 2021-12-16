import { BaseModule } from "./baseModule";
import { writeFileSync, readFileSync, PathLike } from "fs";
import { writeFile, readFile } from "fs/promises";
import { Logger } from "winston";
import { LogLevel, makeLogger } from "../utils/logger";

export interface FactoryConfig {
  modules: BaseModule[];
  loggerLevel?: LogLevel;
}

/**
 * DeobfuscatorFactory handles using multiple modules together
 */
export class DeobfuscatorFactory {
  private source: string;
  private config: FactoryConfig;
  private logger: Logger;

  /**
   * @param {string} source Source code
   * @param {FactoryConfig} config Factory config
   */
  constructor(source: string, config: FactoryConfig) {
    this.source = source;
    this.config = config;
    this.logger = makeLogger("DeobfuscatorFactory", this.config.loggerLevel);
  }

  /**
   * Runs all modules in order
   *
   * @returns {string} Final result of all modules
   */
  public run(): string {
    for (const module of this.config.modules) {
      const start = Date.now();
      this.logger.info(`Processing module ${module.name}`);
      this.source = module.process(this.source);
      this.logger.info(`Processed module ${module.name} in ${Date.now() - start} ms`);
    }

    return this.source;
  }

  /**
   * Similar to {@link DeobfuscatorFactory.run}, {@link DeobfuscatorFactory.write} also runs all modules in order,
   * then writes the result to outPath file
   *
   * @param {PathLike} outPath Path to write to
   * @returns {Promise<void>}
   */
  public async write(outPath: PathLike): Promise<void> {
    const result = this.run();
    return writeFile(outPath, result, "utf-8");
  }

  /**
   * Sync version of {@link DeobfuscatorFactory.write}
   *
   * @param {PathLike} outPath Path to write to
   * @returns {void}
   */
  public writeSync(outPath: PathLike): void {
    const result = this.run();
    return writeFileSync(outPath, result, "utf-8");
  }

  /**
   * Creates a {@link DeobfuscatorFactory} from a file
   *
   * @param {PathLike} inPath Path to read from
   * @param {FactoryConfig} config Factory Config
   * @returns {Promise<DeobfuscatorFactory>} The created DeobfuscatorFactory
   */
  static async fromFile(inPath: PathLike, config: FactoryConfig): Promise<DeobfuscatorFactory> {
    const contents = await readFile(inPath, "utf-8");

    return new DeobfuscatorFactory(contents, config);
  }

  /**
   * Sync version of {@link DeobfuscatorFactory.fromFile}
   *
   * @param {PathLike} inPath Path to read from
   * @param {FactoryConfig} config Factory Config
   * @returns {DeobfuscatorFactory} The created DeobfuscatorFactory
   */
  static fromFileSync(inPath: PathLike, config: FactoryConfig): DeobfuscatorFactory {
    const contents = readFileSync(inPath, "utf-8");
    return new DeobfuscatorFactory(contents, config);
  }
}

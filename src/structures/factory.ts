import { BaseModule } from "./baseModule";
import { readFileSync, PathLike } from "fs";
import { writeFile, readFile } from "fs/promises";
import { Logger } from "winston";
import { LogLevel, makeLogger } from "../utils/logger";
import { PluginItem, transformAsync, TransformOptions } from "@babel/core";
import { isBabelModule } from "./babelBaseModule";

export interface FactoryConfig {
  modules: BaseModule[];
  loggerLevel?: LogLevel;
  babelOptions?: TransformOptions;
  combineBabelModules?: boolean;
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
  public async run(): Promise<string> {
    if (this.config.combineBabelModules) {
      await this.runBabelModules();
    }

    for (const module of this.config.modules) {
      if (this.config.combineBabelModules && isBabelModule(module)) continue;

      const start = Date.now();
      this.logger.info(`Processing module ${module.name}`);
      this.source = await Promise.resolve(module.process(this.source));
      this.logger.info(`Processed module ${module.name} in ${Date.now() - start} ms`);
    }

    return this.source;
  }

  private getAllBabelPlugins(): PluginItem[] {
    const babelPlugins = [];

    for (const module of this.config.modules) {
      if (isBabelModule(module)) babelPlugins.push(module.getBabelPlugin());
    }

    return babelPlugins;
  }

  /**
   * Runs all babel plugin modules in order
   *
   * @returns {string} Final result of all modules
   */
  public async runBabelModules(): Promise<string> {
    const plugins = this.getAllBabelPlugins();

    const start = Date.now();
    this.logger.info(`Processing ${plugins.length} babel plugins`);
    const output = await transformAsync(this.source, {
      ...this.config.babelOptions,
      plugins,
    });

    if (!output) {
      throw new Error(`Babel returned ${typeof output} output`);
    }

    if (!output.code) {
      throw new Error(`Babel returned ${typeof output.code} code`);
    }

    this.logger.info(`Processed ${plugins.length} babel plugins in ${Date.now() - start}ms`);

    this.source = output.code;

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
    const result = await this.run();
    return writeFile(outPath, result, "utf-8");
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

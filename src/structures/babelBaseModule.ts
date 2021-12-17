import { TransformOptions, transformAsync, PluginItem } from "@babel/core";
import { BaseModule, ModuleOptions } from "./baseModule";

export interface BabelModuleOptions extends ModuleOptions {
  babelOptions?: TransformOptions;
}

export const isBabelModule = (module: BaseModule): module is BabelBaseModule => {
  return module instanceof BabelBaseModule;
};

/**
 * Abstract baseclass for modules using babel
 */
export abstract class BabelBaseModule<
  O extends BabelModuleOptions = BabelModuleOptions
> extends BaseModule<O> {
  /**
   * @param {string} name The module's name
   * @param {BabelModuleOptions} options Module options
   */
  constructor(name: string, options: O) {
    super(name, options);
  }

  public abstract getBabelPlugin(): PluginItem;

  /**
   * Processes source code by the module's specifications
   *
   * @param {string} source Source code to process
   * @returns {string} Processed source code
   */
  public async process(source: string): Promise<string> {
    const output = await transformAsync(source, {
      ...this.options.babelOptions,
      plugins: [this.getBabelPlugin()],
    });
    if (!output) {
      throw new Error(`Babel returned ${typeof output} output`);
    }

    if (!output.code) {
      throw new Error(`Babel returned ${typeof output.code} code`);
    }
    return output.code;
  }
}

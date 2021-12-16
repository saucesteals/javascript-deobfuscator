import { BaseModule, ModuleOptions } from "../structures/baseModule";
import { transformAsync, PluginItem, TransformOptions } from "@babel/core";
import { isValidIdentifier, identifier } from "@babel/types";

export interface TransformPropertyAccessOptions extends ModuleOptions {
  /**
   * {@link TransformOptions} passed into babel
   */
  babelOptions?: TransformOptions;
}

/**
 * Transforms property access to dot notation if possible
 *
 * @augments BaseModule
 * @example
 * module.process(`
 *   var arr = {one: "test"};
 *   var one = arr["one"]
 * `)
 *   var arr = {one: "test"};
 *   var one = arr.one
 */
export class TransformPropertyAccess extends BaseModule<TransformPropertyAccessOptions> {
  /**
   * @param {ModuleOptions} options Module options
   */
  constructor(options: TransformPropertyAccessOptions = { babelOptions: { retainLines: true } }) {
    super("StaticUnpackArrayVars", options);
  }

  private babelPlugin(): PluginItem {
    return {
      visitor: {
        MemberExpression: (path) => {
          const property = path.get("property");

          if (!property.isStringLiteral()) {
            return;
          }

          const name = property.node.value;

          if (!isValidIdentifier(name, false)) {
            return;
          }

          path.node.computed = false;
          property.replaceWith(identifier(name));
        },
      },
    };
  }

  public async process(source: string): Promise<string> {
    const output = await transformAsync(source, {
      ...this.options.babelOptions,
      plugins: [this.babelPlugin()],
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

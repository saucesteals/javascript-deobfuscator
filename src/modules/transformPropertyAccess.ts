import { PluginItem } from "@babel/core";
import { isValidIdentifier, identifier } from "@babel/types";
import { BabelBaseModule, BabelModuleOptions } from "../structures/babelBaseModule";

/**
 * Transforms property access to dot notation if possible
 *
 * @augments BabelBaseModule
 * @example
 * module.process(`
 *   var arr = {one: "test"};
 *   var one = arr["one"]
 * `)
 *   var arr = {one: "test"};
 *   var one = arr.one
 */
export class TransformPropertyAccess extends BabelBaseModule {
  /**
   * @param {BabelModuleOptions} options Module options
   */
  constructor(options: BabelModuleOptions = { babelOptions: { retainLines: true } }) {
    super("StaticUnpackArrayVars", options);
  }

  public getBabelPlugin(): PluginItem {
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
}

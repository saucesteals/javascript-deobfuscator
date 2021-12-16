import { BaseModule, ModuleOptions } from "../structures/baseModule";
import { transformAsync, PluginItem, TransformOptions } from "@babel/core";
import { isVariableDeclaration, isIdentifier, isArrayExpression } from "@babel/types";

export const DEFAULT_PACKER_VARIABLE_REGEX = /_[$A-Za-z0-9]+/;

export interface UnpackArrayVarsOptions extends ModuleOptions {
  /**
   * A {@link RegExp} object to match variable names
   * that are used to pack variable values
   */
  varMatch: RegExp;
  /**
   * {@link TransformOptions} passed into babel
   */
  babelOptions?: TransformOptions;
}

/**
 * Performs static unpacking of variable value packed arrays
 *
 * @augments BaseModule
 * @example
 * module.process(`
 *   var arr = ["packed", "values"];
 *   var one = arr[0];
 *   var two = arr[1];
 * `)
 * //  var arr = ["packed", "values"];
 * //  var one = "packed";
 * //  var two = "values";
 */
export class StaticUnpackArrayVars extends BaseModule<UnpackArrayVarsOptions> {
  /**
   * @param {UnpackArrayVarsOptions} options Module options
   */
  constructor(
    options: UnpackArrayVarsOptions = {
      varMatch: DEFAULT_PACKER_VARIABLE_REGEX,
      babelOptions: { retainLines: true },
    }
  ) {
    super("StaticUnpackArrayVars", options);
  }

  private babelPlugin(): PluginItem {
    return {
      visitor: {
        MemberExpression: (path) => {
          const object = path.get("object");

          if (!object.isIdentifier()) {
            return;
          }

          const property = path.get("property");

          if (!property.isNumericLiteral()) {
            return;
          }

          const packedArrName = object.node.name;

          if (!this.options.varMatch.test(packedArrName)) {
            return;
          }

          const idx = property.node.value;

          const packedArrBinding = path.scope.getBinding(packedArrName);

          if (!packedArrBinding) {
            return;
          }

          const parent = packedArrBinding?.path.parent;

          if (!parent || !isVariableDeclaration(parent)) {
            return;
          }

          const packedArrDeclaration = parent.declarations.find((decl) => {
            const id = decl.id;

            if (!isIdentifier(id)) {
              return false;
            }

            return id.name === packedArrName;
          });

          if (!packedArrDeclaration) {
            return;
          }

          const packedArrInit = packedArrDeclaration.init;

          if (!isArrayExpression(packedArrInit)) {
            return;
          }

          const packedArrValue = packedArrInit.elements[idx];

          if (!packedArrValue) {
            return;
          }

          path.replaceWith(packedArrValue);
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

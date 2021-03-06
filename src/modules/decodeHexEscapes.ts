import { BaseModule, ModuleOptions } from "../structures/baseModule";

/**
 * Decodes escaped hex characters
 *
 * @augments BaseModule
 * @example
 * module.process('const str = "\\x68\\x65\\x6c\\x6c\\x6f"')
 * 'const str = 'const str = "hello world"'
 */
export class DecodeHexEscapes extends BaseModule {
  /**
   * @param {ModuleOptions} options Module options
   */
  constructor(options: ModuleOptions = {}) {
    super("DecodeHexEscapes", options);
  }

  public process(source: string): string {
    let decoded = "";
    for (let i = 0; i < source.length; i++) {
      const substr = source.substring(i, i + 4);
      if (substr.startsWith("\\x")) {
        decoded += String.fromCharCode(parseInt(substr.substring(2), 16));
        i += 3;
      } else {
        decoded += source[i];
      }
    }

    return decoded;
  }
}

import yargs from "yargs";
import { StaticUnpackArrayVars } from ".";
import { DecodeHexEscapes } from "./modules/decodeHexEscapes";
import { TransformPropertyAccess } from "./modules/transformPropertyAccess";
import { BaseModule } from "./structures/baseModule";
import { DeobfuscatorFactory } from "./structures/factory";

export const run = async (argv: string[]) => {
  const args = yargs(argv)
    .option("input", {
      alias: "i",
      type: "string",
      description: "Input file path",
    })
    .demandOption("input")
    .option("output", {
      alias: "o",
      type: "string",
      description: "Output file path",
    })
    .demandOption("output")
    .option("hex-excape", {
      alias: "he",
      type: "boolean",
      description: "Decode hex escapes",
    })
    .option("static-unpack", {
      alias: "su",
      type: "boolean",
      description: "Perform static unpacking of variable value packed arrays",
    })
    .option("transform-property", {
      alias: "tp",
      type: "boolean",
      description: "Transforms property access to dot notation if possible",
    })
    .option("verbose", {
      alias: "v",
      type: "boolean",
      description: "Enable verbose logging",
    })
    .option("silent", {
      alias: "s",
      type: "boolean",
      conflicts: "verbose",
      description: "Disable all logging",
    })
    .parse();

  const modules: BaseModule[] = [];

  if (args["static-unpack"]) {
    modules.push(new StaticUnpackArrayVars());
  }

  if (args["transform-property"]) {
    modules.push(new TransformPropertyAccess());
  }

  if (args["hex-excape"]) {
    modules.push(new DecodeHexEscapes());
  }

  const factory = await DeobfuscatorFactory.fromFile(args.input, {
    modules,
    loggerLevel: args.verbose ? "debug" : args.silent ? undefined : "info",
  });

  await factory.write(args.output);
};

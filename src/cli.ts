import yargs from "yargs";
import { DecodeHexEscapes } from "./modules/decodeHexEscapes";
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

  if (args["hex-excape"]) {
    modules.push(new DecodeHexEscapes());
  }

  const factory = await DeobfuscatorFactory.fromFile(args.input, {
    modules,
    loggerLevel: args.verbose ? "debug" : args.silent ? undefined : "info",
  });

  await factory.write(args.output);
};

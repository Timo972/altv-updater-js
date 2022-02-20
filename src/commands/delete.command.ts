import { Arguments, Argv, CommandModule } from "yargs";
import { isAbsolute, relative, join } from "path";
import { exists, removeAsync } from "fs-jetpack";
import { yellowBright, blueBright, red, yellow } from "chalk";
import ora from "ora";
import { getFiles } from "../helpers/cdn.helpers";

const hardRegistry = [
  "server.cfg",
  "server.log",
  "crashdumps",
  "cache",
  "resources",
];

export const DeleteCommand: CommandModule = {
  command: "delete",
  aliases: "d",
  describe: "Delete the alt:V Multiplayer server and its files",
  builder(yargs: Argv): Argv {
    return yargs
      .positional("directory", {
        alias: ["dir", "d"],
        describe: "Set relative server path",
        type: "string",
        default: "./",
      })
      .option("hard", {
        describe: "Remove server.cfg, logs, resources",
        type: "boolean",
        default: false,
      });
  },
  async handler(args: Arguments<{ directory: string; hard: boolean }>) {
    let { directory, hard } = args;
    const os = `${process.arch}_${process.platform}`;
    const branches = ["release", "rc", "dev"];

    if (isAbsolute(directory)) directory = relative(directory, process.cwd());

    console.log(
      yellowBright(
        `Deleting alt:V Server${
          hard ? ` and all its contents` : ""
        } from directory: ${directory}`
      )
    );

    for (const branch of branches) {
      const files = getFiles(branch, os);

      for (const file of files) {
        const fileDest = join(directory, file.folder, file.name);
        const fileDestFolder = join(directory, file.folder);

        if (!exists(fileDestFolder)) continue;

        if (file.folder !== "./" && exists(fileDestFolder)) {
          const spinner = ora(`Deleting folder ${yellowBright(file.folder)}`);
          await removeAsync(fileDestFolder);
          spinner.text = `Deleted folder ${yellowBright(file.folder)}`
          spinner.succeed();
        } else if (exists(fileDest)) {
          const spinner = ora(`Deleting file ${yellowBright(file.name)}`);
          await removeAsync(fileDest);
          spinner.text = `Deleted file ${yellowBright(file.name)}`
          spinner.succeed();
        }
      }
    }

    if (hard) {
      for (const fileOrFolder of hardRegistry) {
        const path = join(directory, fileOrFolder);

        if (exists(path)) {
          const spinner = ora(`Deleting ${path}`);
          await removeAsync(path);
          spinner.succeed();
        }
      }
    }
  },
};

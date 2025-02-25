/**
 * Copyright (c) Crew Dev.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { showHelp } from "./src/shared/utils.ts";
import { CommandNotFound, HelpCommand } from "./src/shared/log.ts";
import { VERSION as svelteVersion } from "compiler";
import { VERSION as cliVersion } from "./src/shared/version.ts";
import { flags, keyWords } from "./src/shared/utils.ts";
import { CreateProject } from "./src/cli/create.ts";
import * as colors from "fmt/colors.ts";

const { args: Args } = Deno;
type Command = "create";
const command = Args[0] as Command;

const instructs = {
  // create a template project
  async create() {
    if (flags.help.includes(Args[1])) {
      return HelpCommand({
        command: {
          alias: [keyWords.create],
          description: "create a template project",
        },
        flags: [{ alias: flags.help, description: "show command help" }],
      });
    } else {
      // Project name should either be Args[1] or the name of Deno's current working directory
      const projectName = Args.length > 1
        ? Args[1]
        : Deno.cwd().split("/").pop();

      if (projectName == undefined) {
        throw Error(
          "Odd working directory. Try again with a project name (snel create [projectName])",
        );
      }

      await CreateProject({
        projectName,
        port: 3000,
        workingFolder: Args.length == 1,
      });
    }
  },
};

async function Main() {
  try {
    // execute instructions
    if (instructs[command]) {
      return await instructs[command]();
    } // show version
    else if (flags.version.includes(Args[0])) {
      console.log(
        colors.green(
          `snel: ${colors.yellow(cliVersion)}\nsvelte: ${
            colors.yellow(
              svelteVersion,
            )
          }\ndeno: ${colors.yellow(Deno.version.deno)}`,
        ),
      );
    } // show help
    else if (flags.help.includes(Args[0]) || !Args[0]) {
      showHelp();
    } else {
      CommandNotFound({
        commands: [
          keyWords.build,
          keyWords.create,
          keyWords.dev,
        ],
        flags: [...flags.help, ...flags.version],
      });
    }
  } catch (error) {
    if (!(error instanceof Deno.errors.NotFound)) {
      console.log(error);
    }
  }
}

if (import.meta.main) {
  await Main();
}

/**
 * Copyright (c) Crew Dev.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as colors from "fmt/colors.ts";

export function notFoundConfig() {
  throw new Error(
    colors.red(`${colors.yellow("snel config")} file could not be found`),
  ).message;
}

export function serverLog(
  { dirName, port, localNet }: {
    dirName: string;
    port: string | number;
    localNet: string;
  },
) {
  console.clear();
  console.log(`
  ${colors.green("Compiled successfully!")}

  You can now view ${colors.bold(colors.yellow(dirName))} in the browser.

      ${colors.bold("Local:")}            http://localhost:${
    colors.bold(port.toString())
  }
      ${localNet}

  Note that the development build is not optimized.
  To create a production build, use ${
    colors.bold(colors.blue("deno task build"))
  }.
  `);
}

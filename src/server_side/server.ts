/**
 * Copyright (c) Crew Dev.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { DevServerProps } from "./types.ts";
import { RollupBuild } from "../../compiler/build.ts";
import { serverLog } from "../cli/prompt.ts";
import { open } from "open"

export async function DevServer({
  port = 3000,
  outDir,
  plugins,
  dirName,
  localNet
}: DevServerProps) {
  serverLog({ port, dirName, localNet });

  setTimeout(async () => await open(`http://localhost:${port}`), 500);

  await RollupBuild({
    production: false,
    dir: outDir,
    plugins,
  });
}

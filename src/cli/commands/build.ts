/**
 * Copyright (c) Crew Dev.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { common } from "../../shared/utils.ts";
import { RollupBuild } from "../../../compiler/build.ts";
import type { snelConfig } from "../../shared/types.ts";
import * as colors from "fmt/colors.ts";
import { Dist } from "../prepare.ts";

export async function Build(config: Partial<snelConfig>) {

  const { plugins } = config;

  console.log(colors.green("preparing files for production.\n"));

  await RollupBuild({
    dir: common.dom.dir,
    production: true,
    plugins,
    config
  });

  await Dist();

  Deno.exit(0);
}

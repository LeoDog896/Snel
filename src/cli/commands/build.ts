/**
 * Copyright (c) Crew Dev.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { common, loadConfig, resolverConfigFile } from "../../shared/utils.ts";
import { RollupBuild } from "../../../compiler/build.ts";
import type { snelConfig } from "../../shared/types.ts";
import * as colors from "fmt/colors.ts";
import { Dist } from "../prepare.ts";

export default async function Build() {
  console.log(colors.green("preparing files for production.\n"));
  const { plugins } = await loadConfig<snelConfig>(
    await resolverConfigFile(),
  )!;

  await RollupBuild({
    dir: common.dom.dir,
    production: true,
    plugins,
  });

  await Dist();

  Deno.exit(0);
}

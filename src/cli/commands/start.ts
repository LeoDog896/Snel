/**
 * Copyright (c) Crew Dev.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  common,
  ipv4
} from "../../shared/utils.ts";
import { RollupBuild } from "../../../compiler/build.ts";
import { DevServer } from "../../server_side/server.ts";
import * as colors from "fmt/colors.ts";
import { snelConfig } from "../../shared/types.ts";

export async function StartDev(config: Partial<snelConfig>) {

  const { port, plugins } = config;

  console.log(colors.bold(colors.cyan("starting development server.")));

  const outDir = common.dom.dir;

  const dirName = Deno.cwd()
    .split(Deno.build.os === "windows" ? "\\" : "/")
    .pop()!;

  const { str: ip, ipv4: ipV4 } = await ipv4(port ?? 3000);
  const localNet = ip
    ? `${colors.bold("On Your Network:")}  ${ip}:${
      colors.bold((port ?? 3000).toString())
    }`
    : "";

  await RollupBuild({
    production: false,
    dir: outDir,
    plugins,
    ipv4: ipV4!,
    config
  });

  // SSG/SSR development server
  await DevServer({
    port,
    outDir,
    plugins: plugins ?? [],
    dirName,
    localNet
  });
}

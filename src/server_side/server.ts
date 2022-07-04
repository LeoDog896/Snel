/**
 * Copyright (c) Crew Dev.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { DevServerProps } from "./types.ts";
import { HotReload } from "../dev_server/hotReloading.ts";
import { RollupBuild } from "../../compiler/build.ts";
import { serverLog } from "../cli/prompt.ts";
import { open } from "../shared/utils.ts";

export async function DevServer({
  path,
  clientPath,
  mode,
  port = 3000,
  outDir,
  plugins,
  dirName,
  localNet,
  ipv4,
}: DevServerProps) {
  const compiler = new Worker(
    new URL("./BuilderWorker.js", import.meta.url).href,
    {
      type: "module",
      deno: {
        namespace: true,
        permissions: {
          write: true,
          read: true,
          env: true,
          net: true,
        },
      },
    },
  );

  compiler.postMessage({
    clientPath,
    port: Number(port),
    path,
    mode,
    start: true,
    ipv4,
  });

  serverLog({ port, dirName, localNet });

  setTimeout(async () => await open(`http://localhost:${port}`), 500);

  globalThis.addEventListener("unload", () => {
    compiler.postMessage({
      end: true,
    });
  });

  await HotReload("./src", Number(port) + 1, async () => {
    compiler.postMessage({
      end: true,
    });

    await RollupBuild({
      production: false,
      dir: outDir,
      plugins,
    });

    compiler.postMessage({
      clientPath,
      port: Number(port),
      path,
      mode,
      start: true,
    });
  });
}

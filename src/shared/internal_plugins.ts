/**
 * Copyright (c) Crew Dev.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { snelConfig } from "../shared/types.ts";
import server from "../dev_server/server.ts";
import { Plugin } from "drollup";

export { terser } from "terser";
export { default as Svelte } from "./bundler.js";

export function DevServer(
  { port }: Partial<snelConfig>,
  ipv4?: string,
): Plugin | undefined {
  try {
    return server({
      contentBase: ["public"],
      port: port ?? 3000,
      host: "0.0.0.0",
      verbose: false,
      historyApiFallback: true,
      ipv4,
    });
  } catch (error) {
    if (!(error instanceof Deno.errors.AddrInUse)) {
      console.log(error);
    }
  }
}

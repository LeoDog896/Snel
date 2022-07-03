/**
 * Copyright (c) Crew Dev.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { Plugin } from "drollup";

export interface CreateProjectOptions {
  /** port number for develoment server */
  port: number;
  projectName: string;
  /** True to create the project on the working dir (./) */
  workingFolder: boolean;
  /** mode to build */
  mode: "ssr" | "dom" | "ssg";
}

export interface snelConfig extends Omit<CreateProjectOptions, "projectName"> {
  /** plugins to extends snel functionalities.
   *
   * example:
   * ```typescript
   * import { image } from "https://deno.land/x/drollup@2.42.3+0.17.1/plugins/image/mod.ts";
   * import { json } from "https://deno.land/x/drollup@2.42.3+0.17.1/plugins/json/mod.ts";
   *
   * export default <snelConfig>{
   *    root: "./src/App.svelte",
   *    port: 3000,
   *    mode: "dom",
   *    plugins: [json(), image({ dom: false })],
   * };
   * ```
   */
  plugins: Plugin[];
  /**
   * load externals import maps
   */
  extendsImportMap?: string[];
}

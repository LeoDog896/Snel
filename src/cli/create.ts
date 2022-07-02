/**
 * Copyright (c) Crew Dev.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
  globalCss,
  indexHtml,
  rootSvelte,
  gitIgnore,
  Home,
  mainjs,
  config,
} from "./templates.ts";
import type { CreateProjectOptions } from "../shared/types.ts";
import { ssgHome, ssgMain } from "../server_side/templates.ts";
import { createDir, createFile } from "./io.ts";
import { ToString } from "../shared/utils.ts";
import { colors } from "../../imports/fmt.ts";
import { join } from "../../imports/path.ts";

export async function CreateProject(options: CreateProjectOptions) {
  const { root, port, projectName, mode, workingFolder } = options;

  const startTime = Date.now();
  const projectRoot = workingFolder ? Deno.cwd() : `${Deno.cwd()}/${projectName}`;

  if (!workingFolder) await Deno.mkdir(projectRoot, { recursive: true });

  const scripts = {
    domScript: {
      dev: "snel dev",
      watch: "snel dev --watch",
    },
    commonScript: {
      start: "snel serve",
      build: "snel build",
    },
    build() {
      return mode === "dom"
        ? { ...this.domScript, ...this.commonScript }
        : { ...this.commonScript };
    },
  };

  const builder = {
    domFiles: [
      {
        name: "index.html",
        path: `${projectRoot}/public`,
        source: await indexHtml("/dist/main.js"),
      },
      {
        name: "global.css",
        path: `${projectRoot}/public`,
        source: globalCss,
      },
    ],
    commonFiles: [
      {
        name: "snel.config.js",
        path: projectRoot,
        source: config(ToString({ port, mode, plugins: [], extendsImportMap: [] })),
      },
      {
        name: `${root}.svelte`,
        path: `${projectRoot}/src/`,
        source: mode === "dom" ? rootSvelte : ssgMain,
      },
      {
        name: "Home.svelte",
        path: `${projectRoot}/src/components`,
        source: mode === "dom" ? Home : ssgHome,
      },
      {
        name: ".gitignore",
        path: projectRoot,
        source: gitIgnore("dist"),
      },
      {
        name: "deno.json",
        path: projectRoot,
        source: JSON.stringify(
          {
            tasks: scripts.build(),
            files:
              mode === "dom"
                ? ["./src", "./public/index.html", "./public/global.css"]
                : ["./src"],
          },
          null,
          2
        ),
      },
      {
        name: "main.js",
        path: `${projectRoot}/src/`,
        source: mainjs(root, mode),
      },
    ],
    domDir: [
      {
        name: "public",
        path: projectRoot,
      },
    ],
    commonDirs: [
      {
        name: "src",
        path: projectRoot,
      },
      {
        name: "components",
        path: `${projectRoot}/src`,
      },
    ],
    files() {
      if (mode === "dom") {
        return [...this.commonFiles, ...this.domFiles];
      }

      return [...this.commonFiles];
    },
    dirs() {
      if (mode === "dom") {
        return [...this.commonDirs, ...this.domDir];
      }

      return [...this.commonDirs];
    },
  };

  for (const dir of builder.dirs()) {
    const { name, path } = dir;
    await createDir(name, path);
  }

  for (const file of builder.files()) {
    const { name, path, source } = file;
    await createFile(name, path, source);
  }

  const endTime = Date.now();

  console.clear();
  console.log(`
  Done in ${(endTime - startTime) / 1000}s.

  Success! Created ${projectName} at ${join(Deno.cwd(), projectName)}
  Inside that directory, you can run several commands:

    ${colors.blue("deno task start")} (experimental hot reloading)
      Starts the development server.

    ${colors.blue("deno task build")}
      Bundles the app into static files for production.

    ${colors.blue("deno task dev")}
      Compile the project in dev mode.

    ${colors.blue("deno task watch")}
      Compile the project in dev mode but using watch mode.

  We suggest that you begin by typing:
    ${workingFolder ? `` : `\n    ${colors.blue("cd")} ${projectName}`}
    ${colors.blue("deno task start")}
  `);
}

/**
 * Copyright (c) Crew Dev.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  config,
  gitIgnore,
  globalCss,
  Home,
  indexHtml,
  rootSvelte,
} from "./templates.ts";
import type { CreateProjectOptions } from "../shared/types.ts";
import { createDir, createFile } from "./io.ts";
import { ToString } from "../shared/utils.ts";
import * as colors from "fmt/colors.ts";
import { join } from "path"

export async function CreateProject(options: CreateProjectOptions) {
  const { projectName, workingFolder } = options;

  const startTime = Date.now();
  const projectRoot = workingFolder
    ? Deno.cwd()
    : `${Deno.cwd()}/${projectName}`;

  if (!workingFolder) await Deno.mkdir(projectRoot, { recursive: true });

  const tasks = {
    dev: "snel dev",
    build: "snel build",
    check: "deno lint && deno fmt"
  };

  const builder = {
    commonFiles: [
      {
        name: "index.html",
        path: `${projectRoot}/public`,
        source: indexHtml("/dist/main.js"),
      },
      {
        name: "global.css",
        path: `${projectRoot}/public`,
        source: globalCss,
      },
      {
        name: "snel.config.ts",
        path: projectRoot,
        source: `import type { snelConfig } from "https://deno.land/x/snel/mod.ts";\n\n` + config(
          ToString({ port: 3000, plugins: [], extendsImportMap: [] }),
          "<Partial<snelConfig>>"
        ),
      },
      {
        name: `App.svelte`,
        path: `${projectRoot}/src/`,
        source: rootSvelte,
      },
      {
        name: "Home.svelte",
        path: `${projectRoot}/src/components`,
        source: Home
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
            tasks,
            files: ["./src", "./public/index.html", "./public/global.css"]
          },
          null,
          2,
        ),
      }
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
    ]
  };

  for (const dir of builder.commonDirs) {
    const { name, path } = dir;
    await createDir(name, path);
  }

  for (const file of builder.commonFiles) {
    const { name, path, source } = file;
    await createFile(name, path, source);
  }

  const endTime = Date.now();

  console.clear();
  console.log(`
  Done in ${(endTime - startTime) / 1000}s.

  Success! Created ${projectName} at ${join(Deno.cwd(), projectName)}
  Inside that directory, you can run several commands:

    ${colors.blue("deno task dev")} (experimental hot reloading)
      Starts the development server.

    ${colors.blue("deno task build")}
      Bundles the app into static files for production.
    
    ${colors.blue("deno task check")}
      Lint and format the project.

  We suggest that you begin by typing:
    ${workingFolder ? `` : `\n    ${colors.blue("cd")} ${projectName}`}
    ${colors.blue("deno task dev")}
  `);
}

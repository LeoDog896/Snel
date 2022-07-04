import { serve, serveTls, ServeTlsInit } from "http";
import { mime } from "https://deno.land/x/mimetypes@v1.0.0/src/mime.ts";

import type { MimeTypeMap } from "https://deno.land/x/mimetypes@v1.0.0/src/mime.ts";
import { normalize, resolve } from "path";
import type { Plugin } from "drollup";

export interface ServeOptions {
  contentBase: string[];
  port: number;
  host: string;
  headers: HeadersInit;
  https?: ServeTlsInit;
  openPage: string;
  onListening: (adress: Record<string, string | number>) => void;
  mimeTypes?: MimeTypeMap;
  defaultType: string;
  verbose: boolean;
  open: boolean;
  historyApiFallback?: string | boolean;
  ipv4?: string;
}

export type ReadReturn = {
  err: ErrorConstructor | null;
  filePath: string;
  size: string | null;
  content: Uint8Array | null;
};

/**
 * Serve your rolled up bundle like webpack-dev-server
 * @param {ServeOptions|string|string[]} options
 */
type InitOptions =
  | string
  | string[]
  | Partial<ServeOptions>;

class BuildServer {
  options: ServeOptions = {
    contentBase: [""],
    port: 3000,
    host: "localhost",
    headers: {},
    openPage: "",
    open: true,
    defaultType: "text/plain",
    verbose: true,
    onListening() {},
    ipv4: undefined,
  };

  first = true;
  constructor(initOptions: InitOptions = [""]) {
    if (Array.isArray(initOptions) || typeof initOptions === "string") {
      this.options.contentBase = typeof initOptions === "string"
        ? [initOptions]
        : initOptions;
    } else {
      this.options = { ...this.options, ...initOptions };
    }

    this.options.contentBase = typeof this.options.contentBase === "string"
      ? [this.options.contentBase]
      : this.options.contentBase;

    if (this.options?.mimeTypes) {
      mime.define(this.options?.mimeTypes, true);
    }

    !this.options.https
      ? serve((req) => this.requestHandler(req), {
        port: this.options.port,
        hostname: this.options.host,
      })
      : serveTls(this.requestHandler, this.options.https);
  }

  async requestHandler(req: Request): Promise<Response> {
    const headers = new Headers(this.options.headers);

    // return snel hot reloading script
    if (req.method === "GET" && req.url === "/__SNEL__HOT__RELOADING.js") {
      const headers = new Headers();
      headers.set("Content-Type", "application/javascript");

      return new Response(
        `console.log(1)`,
        {
          headers,
        },
      );
    }

    // Remove querystring
    const unsafePath = decodeURI(req.url.split("?").shift()!);
    // Don't allow path traversal
    const urlPath = normalize(unsafePath);
    const { content, err, filePath, size } = await readFileFromContentBase(
      this.options.contentBase,
      urlPath,
    );

    if (!err && content) {
      return this.found(headers, filePath, content, size ? size : "");
    }

    if (err && err.name !== "NotFound") {
      return new Response(`500 Not Found\n\n${filePath}`, {
        headers,
        status: 500,
      });
    }

    if (this.options.historyApiFallback) {
      const fallbackPath = typeof this.options.historyApiFallback === "string"
        ? this.options.historyApiFallback
        : "/index.html";

      const {
        content: bContent,
        err: bError,
        filePath: bFilepath,
        size: bSize,
      } = await readFileFromContentBase(this.options.contentBase, fallbackPath);

      if (bError) {
        return this.notFound(headers, filePath);
      } else {
        return this.found(
          headers,
          bFilepath,
          bContent || new Uint8Array(0),
          bSize ? bSize : "",
        );
      }
    } else {
      return this.notFound(headers, filePath);
    }
  }
  serve() {
    if (this.options.onListening) {
      this.options.onListening({
        port: this.options.port,
        host: this.options.host,
        protocol: this.options.https ? "https" : "http",
      });
    }
  }

  notFound(headers: Headers, filePath: string): Response {
    return new Response(`404 Not Found\n\n${filePath}`, {
      headers,
      status: 404,
    });
  }

  found(
    headers: Headers,
    filePath: string,
    content: Uint8Array,
    size: string,
  ): Response {
    headers.append("content-length", size);
    headers.append(
      "Content-Type",
      mime.getType(filePath) || this.options.defaultType,
    );
    return new Response(content, { status: 200, headers });
  }

  green(text: string) {
    return text;
  }

  rollup() {
    const url = `${this.options.https ? "https" : "http"}://${
      this.options.host || "localhost"
    }:${this.options.port}`;

    let first = true;
    const options = this.options,
      green = this.green;
    this.serve();
    return {
      name: "serve",
      generateBundle() {
        if (first) {
          first = false;
          // Log which url to visit
          if (options.verbose! ?? false) {
            options.contentBase.forEach((base: string) => {
              console.log(green(url) + " -> " + resolve(base));
            });
          }
        }
      },
    };
  }
}

const readFileFromContentBase = async (
  contentBase: string[],
  urlPath: string,
): Promise<ReadReturn> => {
  let filePath = resolve(contentBase[0] || ".", "." + urlPath);
  // Load index.html in directories

  if (urlPath.endsWith("/")) {
    filePath = resolve(filePath, "index.html");
  }

  if (!urlPath.endsWith("/") && !urlPath.includes(".")) {
    try {
      const fileInfo = await Deno.stat(filePath);
      filePath = fileInfo.isFile ? filePath : resolve(filePath, "index.html");
    } catch (_) {
      filePath;
    }
  }

  // Try Read
  try {
    const [content, fileInfo] = await Promise.all([
      Deno.readFile(filePath),
      Deno.stat(filePath),
    ]);

    return {
      err: null,
      filePath,
      size: fileInfo.size.toString(),
      content,
    };
  } catch (err) {
    if (err && contentBase.length > 1) {
      return readFileFromContentBase(contentBase.slice(1), urlPath);
    } // We know enough
    else {
      return {
        err,
        filePath,
        size: null,
        content: null,
      };
    }
  }
};

export default (initOptions: InitOptions = [""]): Plugin => {
  const server = new BuildServer(initOptions);
  const plugin = server.rollup();
  return plugin;
};

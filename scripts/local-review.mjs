import http from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { resolve, basename } from "node:path";
const root = resolve("supabase");
http
  .createServer((req, res) => {
    const name = decodeURIComponent((req.url || "/").slice(1));
    if (!/^[a-zA-Z0-9_-]+\.sql$/.test(name)) {
      res.writeHead(404);
      res.end();
      return;
    }
    const path = resolve(
      root,
      name.startsWith("test_") ? "tests" : "migrations",
      basename(name),
    );
    if (!existsSync(path)) {
      res.writeHead(404);
      res.end();
      return;
    }
    res.writeHead(200, {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    });
    res.end(
      "<!doctype html><title>Porter · revisión SQL local</title><pre>" +
        readFileSync(path, "utf8")
          .replaceAll("&", "&amp;")
          .replaceAll("<", "&lt;") +
        "</pre>",
    );
  })
  .listen(4174, "127.0.0.1", () =>
    console.log("SQL review: http://127.0.0.1:4174/202609260001_porter.sql"),
  );

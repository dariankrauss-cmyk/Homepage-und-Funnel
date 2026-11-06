#!/usr/bin/env node
/*
  Veröffentlicht die Website als Worker mit eingebetteten Dateien, also ohne den
  Static-Assets-Upload von Wrangler. Gedacht für Umgebungen, in denen dieser Upload
  nicht durchkommt, zum Beispiel eine Claude-Code-Sitzung hinter einem Proxy.
  Der normale Weg bleibt "npm run deploy" oder Cloudflare Workers Builds.

    node tools/eingebettet.mjs              baut und veröffentlicht
    node tools/eingebettet.mjs --dry-run    baut und zeigt, was hochgeladen würde
    node tools/eingebettet.mjs --nur-bauen  erzeugt nur .eingebettet/ (für Tests)
*/
import { execFileSync, spawnSync } from "node:child_process";
import { readFile, writeFile, mkdir, readdir, rm } from "node:fs/promises";
import { join, dirname, relative, sep, extname, basename } from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(ROOT, "dist");
const OUT = join(ROOT, ".eingebettet");
const MAX_GESAMT = 2.5 * 1024 * 1024; // Worker-Grenze im Free-Plan: 3 MB komprimiert

const TYPEN = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml",
  ".json": "application/json",
  ".vtt": "text/vtt; charset=utf-8",
  ".webmanifest": "application/manifest+json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".pdf": "application/pdf",
  ".mp4": "video/mp4",
  ".woff2": "font/woff2",
};
const TEXT = new Set([".html", ".css", ".js", ".svg", ".txt", ".xml", ".json", ".vtt", ".webmanifest"]);

async function dateien(dir) {
  const eintraege = await readdir(dir, { withFileTypes: true });
  const listen = await Promise.all(eintraege.map((e) => (e.isDirectory() ? dateien(join(dir, e.name)) : [join(dir, e.name)])));
  return listen.flat().sort();
}

/* _headers: Zeile ohne Einrückung = Adressmuster, eingerückte Zeilen = "Name: Wert" */
function headerLesen(text) {
  const regeln = [];
  for (const zeile of text.split(/\r?\n/)) {
    if (!zeile.trim() || zeile.trim().startsWith("#")) continue;
    if (!/^\s/.test(zeile)) {
      regeln.push({ muster: zeile.trim(), werte: [] });
    } else if (regeln.length) {
      const i = zeile.indexOf(":");
      if (i > 0) regeln.at(-1).werte.push([zeile.slice(0, i).trim(), zeile.slice(i + 1).trim()]);
    }
  }
  return regeln;
}

/* _redirects: "von nach [status]" */
function weiterleitungenLesen(text) {
  return text
    .split(/\r?\n/)
    .map((z) => z.trim())
    .filter((z) => z && !z.startsWith("#"))
    .map((z) => {
      const [von, nach, status] = z.split(/\s+/);
      return { von, nach, status: Number(status) || 302 };
    });
}

function wranglerKonfig(text) {
  // wrangler.jsonc enthält nur ganze Kommentarzeilen
  return JSON.parse(text.replace(/^\s*\/\/.*$/gm, ""));
}

async function erzeugen() {
  execFileSync(process.execPath, ["build.mjs"], { cwd: ROOT, stdio: "inherit" });

  const paket = { dateien: {}, header: [], weiterleitungen: [] };
  let gesamt = 0;
  for (const datei of await dateien(DIST)) {
    const pfad = "/" + relative(DIST, datei).split(sep).join("/");
    const inhalt = await readFile(datei);
    if (pfad === "/_headers") { paket.header = headerLesen(inhalt.toString("utf8")); continue; }
    if (pfad === "/_redirects") { paket.weiterleitungen = weiterleitungenLesen(inhalt.toString("utf8")); continue; }
    const endung = extname(datei).toLowerCase();
    gesamt += inhalt.length;
    if (inhalt.length > 1024 * 1024) {
      throw new Error(`${pfad} ist ${(inhalt.length / 1048576).toFixed(1)} MB groß. Große Dateien wie Videos passen nicht in den Worker, bitte "npm run deploy" oder Workers Builds nutzen.`);
    }
    paket.dateien[pfad] = {
      typ: TYPEN[endung] || "application/octet-stream",
      etag: createHash("sha256").update(inhalt).digest("hex").slice(0, 16),
      ...(TEXT.has(endung) ? { text: inhalt.toString("utf8") } : { b64: inhalt.toString("base64") }),
    };
  }
  if (gesamt > MAX_GESAMT) throw new Error(`Zusammen ${(gesamt / 1048576).toFixed(1)} MB, zu groß für den eingebetteten Worker.`);
  if (!paket.dateien["/404.html"]) throw new Error("dist/404.html fehlt");

  const basis = wranglerKonfig(await readFile(join(ROOT, "wrangler.jsonc"), "utf8"));
  const konfig = {
    name: basis.name,
    main: "../worker/eingebettet.js",
    compatibility_date: basis.compatibility_date,
    workers_dev: basis.workers_dev ?? true,
    preview_urls: basis.preview_urls ?? false,
    ...(basis.observability ? { observability: basis.observability } : {}),
    ...(basis.ratelimits ? { ratelimits: basis.ratelimits } : {}),
  };

  await rm(OUT, { recursive: true, force: true });
  await mkdir(OUT, { recursive: true });
  await writeFile(join(OUT, "dateien.js"), `// Automatisch erzeugt von tools/eingebettet.mjs, nicht von Hand ändern.\nexport default ${JSON.stringify(paket)};\n`);
  await writeFile(join(OUT, "wrangler.json"), JSON.stringify(konfig, null, 2) + "\n");
  console.log(`✓ ${Object.keys(paket.dateien).length} Dateien eingebettet (${(gesamt / 1024).toFixed(0)} KB) nach ${basename(OUT)}/`);
}

const args = process.argv.slice(2);
try {
  await erzeugen();
} catch (e) {
  console.error(`✗ ${e.message}`);
  process.exit(1);
}
if (!args.includes("--nur-bauen")) {
  const r = spawnSync("npx", ["wrangler", "deploy", "--config", join(OUT, "wrangler.json"), ...args], { cwd: ROOT, stdio: "inherit" });
  process.exit(r.status ?? 1);
}

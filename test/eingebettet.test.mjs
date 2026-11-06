import { test, before } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const B = "https://homepage.example";
let worker;

before(async () => {
  execFileSync(process.execPath, ["tools/eingebettet.mjs", "--nur-bauen"], { cwd: ROOT, stdio: "pipe" });
  worker = (await import("../worker/eingebettet.js")).default;
});

const hol = (pfad, init) => worker.fetch(new Request(B + pfad, init), {}, {});

test("Startseite und Funnel-Seiten mit Sicherheits-Headern", async () => {
  for (const pfad of ["/", "/leitfaden/", "/finanz-check/", "/termin/", "/termin/danke/", "/leitfaden/danke/", "/impressum/", "/datenschutz/"]) {
    const r = await hol(pfad);
    assert.equal(r.status, 200, pfad);
    assert.equal(r.headers.get("Content-Type"), "text/html; charset=utf-8", pfad);
    assert.match(r.headers.get("Content-Security-Policy"), /default-src 'self'/, pfad);
    assert.equal(r.headers.get("X-Frame-Options"), "DENY", pfad);
    assert.match(await r.text(), /<main id="inhalt">/, pfad);
  }
});

test("Adressen ohne Schrägstrich und index.html werden umgeleitet", async () => {
  for (const [von, nach] of [["/leitfaden", "/leitfaden/"], ["/termin/danke", "/termin/danke/"], ["/index.html", "/"], ["/leitfaden/index.html", "/leitfaden/"]]) {
    const r = await hol(von);
    assert.equal(r.status, 307, von);
    assert.equal(r.headers.get("Location"), nach, von);
  }
});

test("alte Demo-Adressen leiten weiter und behalten Kampagnen-Kennungen", async () => {
  const r = await hol("/leitfaden/finanz-check?utm_source=instagram");
  assert.equal(r.status, 301);
  assert.equal(r.headers.get("Location"), "/finanz-check/?utm_source=instagram");
});

test("unbekannte Adressen und Konfigurationsdateien bekommen die 404-Seite", async () => {
  for (const pfad of ["/gibtsnicht", "/_headers", "/_redirects", "/leitfaden/gibtsnicht/"]) {
    const r = await hol(pfad);
    assert.equal(r.status, 404, pfad);
    assert.match(await r.text(), /Diese Seite gibt es leider nicht/, pfad);
  }
});

test("CSS, Bilder und Caching", async () => {
  const css = await hol("/assets/style.css?v=123");
  assert.equal(css.status, 200);
  assert.equal(css.headers.get("Content-Type"), "text/css; charset=utf-8");
  assert.equal(css.headers.get("Cache-Control"), "public, max-age=31536000, immutable");

  const png = await hol("/og-image.png");
  assert.equal(png.headers.get("Content-Type"), "image/png");
  const bytes = new Uint8Array(await png.arrayBuffer());
  assert.deepEqual(bytes, new Uint8Array(readFileSync(join(ROOT, "dist", "og-image.png"))));

  const nochmal = await hol("/", { headers: { "If-None-Match": (await hol("/")).headers.get("ETag") } });
  assert.equal(nochmal.status, 304);

  const kopf = await hol("/", { method: "HEAD" });
  assert.equal(kopf.status, 200);
  assert.equal(await kopf.text(), "");
});

test("Lead-API läuft weiter über den normalen Worker", async () => {
  const r = await hol("/api/lead", { method: "POST", headers: { "Content-Type": "application/json", Origin: B }, body: "{}" });
  assert.equal(r.status, 422);
  const ohne = await hol("/api/lead");
  assert.equal(ohne.status, 405);
});

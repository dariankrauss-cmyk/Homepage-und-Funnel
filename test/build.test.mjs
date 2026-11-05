import { test, before } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import site from "../site.config.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(ROOT, "dist");
const seiten = {};

function htmlDateien(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? htmlDateien(join(dir, e.name)) : e.name.endsWith(".html") ? [join(dir, e.name)] : [],
  );
}

before(() => {
  execFileSync(process.execPath, ["build.mjs"], { cwd: ROOT, stdio: "pipe" });
  for (const datei of htmlDateien(DIST)) seiten[datei.slice(DIST.length + 1)] = readFileSync(datei, "utf8");
});

const esc = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

test("alle erwarteten Seiten werden gebaut", () => {
  for (const s of [
    "index.html",
    "leitfaden/index.html",
    "leitfaden/danke/index.html",
    "finanz-check/index.html",
    "termin/index.html",
    "termin/danke/index.html",
    "impressum/index.html",
    "datenschutz/index.html",
    "404.html",
  ]) {
    assert.ok(seiten[s], `${s} fehlt`);
  }
  for (const d of ["robots.txt", "sitemap.xml", "_headers", "_redirects", "favicon.svg", "og-image.png"]) {
    assert.ok(existsSync(join(DIST, d)), `${d} fehlt`);
  }
  assert.equal(existsSync(join(DIST, "videos", "LIESMICH.txt")), false, "Hinweisdateien nicht veröffentlichen");
});

test("Grundgerüst jeder Seite: Sprache, Titel, Beschreibung, genau eine h1", () => {
  for (const [name, html] of Object.entries(seiten)) {
    assert.match(html, /^<!doctype html>\n<html lang="de">/, name);
    assert.match(html, /<title>[^<]{10,}<\/title>/, name);
    assert.match(html, /<meta name="description" content="[^"]{30,}">/, name);
    assert.equal((html.match(/<h1[\s>]/g) || []).length, 1, `${name}: genau eine h1`);
    assert.match(html, /<main id="inhalt">/, name);
    assert.equal(html.includes("{{"), false, `${name}: Platzhalter übrig`);
  }
});

test("Impressum und Datenschutz sind von jeder Seite erreichbar", () => {
  for (const [name, html] of Object.entries(seiten)) {
    assert.ok(html.includes('href="/impressum/"'), `${name}: Link zum Impressum fehlt`);
    assert.ok(html.includes('href="/datenschutz/"'), `${name}: Link zum Datenschutz fehlt`);
  }
});

test("passt zur Content-Security-Policy: keine Inline-Skripte, -Styles oder -Handler", () => {
  for (const [name, html] of Object.entries(seiten)) {
    assert.equal(/\sstyle="/.test(html), false, `${name}: style-Attribut`);
    assert.equal(/\son[a-z]+="/i.test(html), false, `${name}: Inline-Event-Handler`);
    for (const m of html.matchAll(/<script\b([^>]*)>/g)) {
      assert.ok(/\ssrc="/.test(m[1]) || /type="application\/ld\+json"/.test(m[1]), `${name}: Inline-Skript ${m[0]}`);
    }
  }
});

test("Formulare: Quelle, Danke-Seite, Beschriftungen und Einwilligungstext", () => {
  const erwartet = {
    "leitfaden/index.html": ["leitfaden", "/leitfaden/danke/", site.einwilligung.leitfaden],
    "finanz-check/index.html": ["finanz-check", "/leitfaden/danke/", site.einwilligung.finanzCheck],
    "termin/index.html": ["termin", "/termin/danke/", site.einwilligung.termin],
  };
  for (const [name, [quelle, danke, text]] of Object.entries(erwartet)) {
    const html = seiten[name];
    assert.ok(html.includes(`data-quelle="${quelle}" data-danke="${danke}"`), `${name}: Formular-Ziel`);
    assert.ok(seiten[`${danke.slice(1)}index.html`], `${name}: Danke-Seite existiert`);
    // Der Text, den die Person sieht, ist genau der, den der Worker als Nachweis mitschickt.
    assert.ok(html.includes(esc(text)), `${name}: Einwilligungstext weicht von site.config.mjs ab`);
    for (const m of html.matchAll(/<input\b[^>]*\sid="([^"]+)"/g)) {
      assert.ok(html.includes(`for="${m[1]}"`), `${name}: Feld #${m[1]} ohne Beschriftung`);
    }
    for (const feld of ["vorname", "email", "phone", "einwilligung", "hinweisfeld"]) {
      assert.ok(html.includes(`name="${feld}"`), `${name}: Feld ${feld} fehlt`);
    }
  }
});

test("Bilder haben Alternativtexte, externe Links nur über https", () => {
  for (const [name, html] of Object.entries(seiten)) {
    for (const m of html.matchAll(/<img\b[^>]*>/g)) assert.match(m[0], /\salt="/, `${name}: Bild ohne alt`);
    assert.equal(/href="http:\/\//.test(html), false, `${name}: unverschlüsselter Link`);
  }
});

test("Vorschau-Modus sperrt Suchmaschinen aus", () => {
  if (site.live) return;
  assert.equal(readFileSync(join(DIST, "robots.txt"), "utf8"), "User-agent: *\nDisallow: /\n");
  for (const [name, html] of Object.entries(seiten)) {
    assert.ok(html.includes('<meta name="robots" content="noindex, nofollow">'), name);
    assert.ok(html.includes('class="preview-bar"'), name);
  }
});

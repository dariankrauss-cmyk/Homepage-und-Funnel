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
    const haekchen = {
      "leitfaden/index.html": ["consent_leitfaden", "consent_marketing"],
      "finanz-check/index.html": ["consent_finanzcheck", "consent_marketing"],
      "termin/index.html": ["einwilligung"],
    }[name];
    for (const feld of ["vorname", "email", "phone", "hinweisfeld", ...haekchen]) {
      assert.ok(html.includes(`name="${feld}"`), `${name}: Feld ${feld} fehlt`);
    }
  }
});

test("Leitfaden und Finanz-Check: Nummer freiwillig, zwei getrennte Häkchen, Tipps erst mit Nummer", () => {
  for (const [name, pflicht] of [["leitfaden/index.html", "consent_leitfaden"], ["finanz-check/index.html", "consent_finanzcheck"]]) {
    const html = seiten[name];
    const telefon = html.match(/<input\b[^>]*id="phone"[^>]*>/)[0];
    assert.equal(/\srequired\b/.test(telefon), false, `${name}: Handynummer darf hier nicht required sein`);
    assert.match(html, new RegExp(`<input id="${pflicht}" name="${pflicht}" type="checkbox" required>`), name);
    assert.match(html, /<div class="consent" data-braucht="phone" hidden>\s*<input id="consent_marketing" name="consent_marketing" type="checkbox">/, name);
    assert.ok(html.includes(esc(site.einwilligung.marketing)), `${name}: Text der Tipps-Einwilligung`);
  }
  const t = seiten["termin/index.html"].match(/<input\b[^>]*id="phone"[^>]*>/)[0];
  assert.match(t, /\srequired\b/, "Termin: Handynummer bleibt Pflicht");
});

test("Kein Häkchen und keine Auswahl ist vorausgewählt", () => {
  for (const [name, html] of Object.entries(seiten)) {
    for (const m of html.matchAll(/<input\b[^>]*>/g)) assert.equal(/\schecked\b/.test(m[0]), false, `${name}: ${m[0]}`);
  }
});

test("Finanz-Check Variante A: ehrlicher Hinweis, GdB ausdrücklich in der Einwilligung, Antworten nur mit diesem Formular", () => {
  const html = seiten["finanz-check/index.html"];
  assert.ok(html.includes("Deine Antworten bleiben auf deinem Gerät. Nur wenn du am Ende das Formular abschickst, bekomme ich sie für deine Auswertung."));
  assert.match(site.einwilligung.finanzCheck, /Grad der Behinderung \(GdB\)/);
  assert.equal(/WhatsApp|Tipps|Einladungen/.test(site.einwilligung.finanzCheck), false, "Pflicht-Häkchen ohne Werbung (Kopplungsverbot)");
  const js = readFileSync(join(DIST, "assets", "main.js"), "utf8");
  assert.match(js, /if \(daten\.quelle === "finanz-check"\) \{\s*var check = lesen\("finanzcheck"\)/, "Antworten nur beim Finanz-Check-Formular");
  assert.match(seiten["datenschutz/index.html"], /Art\. 9 Abs\. 2 lit\. a DSGVO/);
});

test("„ohne Fachchinesisch“ steht nur noch im Hero der Startseite", () => {
  const treffer = Object.entries(seiten).flatMap(([name, html]) => (html.match(/ohne Fachchinesisch/gi) || []).map(() => name));
  assert.deepEqual(treffer, ["index.html"]);
  assert.match(seiten["index.html"], /<p class="hero-lead">Ich bin Darian Krauß[^<]*ohne Fachchinesisch/);
  assert.equal(/Fachchinesisch/.test(readFileSync(join(DIST, "assets", "finanz-check.js"), "utf8")), false);
});

test("Finanz-Check: Alter zuerst, GdB an dritter Stelle, überall „Sechs Fragen“", () => {
  const js = readFileSync(join(DIST, "assets", "finanz-check.js"), "utf8");
  const felder = [...js.matchAll(/\{ feld: "(\w+)"/g)].map((m) => m[1]);
  assert.deepEqual(felder, ["alter", "vorsorge", "gdb", "pauschbetrag", "kredit", "ziel"]);
  for (const [name, html] of Object.entries(seiten)) assert.equal(/Fünf (kurze )?Fragen/.test(html), false, name);
});

test("Foto nur, wenn die Datei da ist, sonst der DK-Kreis ohne Bild-Platzhalter", () => {
  const fotoDa = existsSync(join(ROOT, "src", "static", "img", "darian.jpg"));
  const start = seiten["index.html"];
  const fotos = start.match(/<img\b[^>]*src="\/img\/darian\.jpg"[^>]*>/g) || [];
  assert.equal(fotos.length, fotoDa && !site.videos.startseite.src ? 1 : 0);
  for (const img of fotos) {
    assert.match(img, /\sdata-fallback\b/);
    assert.match(img, /\salt="[^"]{8,}"/);
    assert.equal(/\sonerror=/.test(img), false, "kein Inline-Handler (CSP)");
  }
  if (!fotoDa) {
    for (const [name, html] of Object.entries(seiten)) assert.equal(html.includes("/img/darian.jpg"), false, `${name}: Foto-Link ohne Datei`);
  }
  if (!site.videos.startseite.src) assert.match(start, /<span class="monogramm" aria-hidden="true">DK<\/span>/);
});

test("Selbstbeschreibung: gehörlos, zwei Cochlea-Implantate (CI), DGS und Lautsprache", () => {
  for (const [name, html] of Object.entries(seiten)) {
    assert.equal(/hörgeschädigt/i.test(html), false, `${name}: „hörgeschädigt“`);
    assert.equal(/\(CIs\)/.test(html), false, `${name}: Schreibweise wie von Darian vorgegeben: (CI)`);
  }
  const start = seiten["index.html"];
  // Darians eigener Satz, wörtlich
  assert.ok(
    start.includes("Ich bin gehörlos, trage zwei Cochlea-Implantate (CI) und kommuniziere in Deutscher Gebärdensprache (DGS) und deutscher Lautsprache."),
    "Darians Satz im Abschnitt Über mich",
  );
  assert.match(start, /<p class="hero-lead">Ich bin Darian Krauß, Finanzberater und Makler\. Ich bin gehörlos und trage zwei Cochlea-Implantate \(CI\)\./);
  for (const name of ["termin/index.html", "leitfaden/index.html"]) {
    assert.match(seiten[name], /Gehörlos, mit zwei Cochlea-Implantaten \(CI\)\. Er kommuniziert in Deutscher Gebärdensprache \(DGS\) und deutscher Lautsprache\./, name);
  }
});

test("Keine falschen Video-Vorschauen: Video-Kasten nur mit eingetragenem Video", () => {
  const plaetze = {
    "index.html": site.videos.startseite.src,
    "termin/index.html": site.videos.termin.src,
    "termin/danke/index.html": site.videos.terminDanke.src,
    "leitfaden/index.html": site.videos.leitfaden.src,
    "leitfaden/danke/index.html": site.videos.leitfadenDanke.src,
  };
  for (const [name, src] of Object.entries(plaetze)) {
    assert.equal(/class="video\b/.test(seiten[name]), Boolean(src), `${name}: Video-Kasten`);
  }
  for (const [name, html] of Object.entries(seiten)) {
    assert.equal(/folgt in Kürze|class="ph"|class="play"/.test(html), false, `${name}: Platzhalter`);
  }
});

test("Podcast: keine erfundenen Folgen, Gäste, Formate oder Links", () => {
  for (const [name, html] of Object.entries(seiten)) {
    const ohneKommentare = html.replace(/<!--[\s\S]*?-->/g, "");
    assert.equal(/Gäste|Gästen|Community|Jede Woche|Kundengeschichte|Frag Darian|Episode|Folge \d/i.test(ohneKommentare), false, name);
  }
  const start = seiten["index.html"];
  const podcast = start.slice(start.indexOf('id="podcast"'), start.indexOf('id="fragen"'));
  for (const [dienst, url] of [["youtube", site.social.youtube], ["spotify", site.social.spotify]]) {
    if (!url) assert.equal(new RegExp(dienst, "i").test(podcast), false, `${dienst}: Link ohne Eintrag`);
  }
  const dt = [...podcast.matchAll(/<dt>([^<]+)<\/dt>/g)].map((m) => m[1]);
  assert.deepEqual(dt, ["Sprachen", "Themen", "Neue Folgen", "Für wen"]);
  assert.equal(/Frag Darian/.test(readFileSync(join(ROOT, "build.mjs"), "utf8")), false, "kein erfundener Formatname in den Nachrichten-Vorlagen");
});

test("Icons als feine Linien wie auf der Startseite, keine bunten Emojis", () => {
  const emoji = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;
  for (const [name, html] of Object.entries(seiten)) assert.equal(emoji.test(html), false, name);
  assert.equal(emoji.test(readFileSync(join(DIST, "assets", "main.js"), "utf8")), false, "main.js");
});

test("Funnel-Kopf: Knopf nur, wo die Seite einen hat, und dann mit Platz für den Namen", () => {
  for (const name of ["leitfaden/index.html", "finanz-check/index.html", "leitfaden/danke/index.html"]) {
    assert.match(seiten[name], /<header class="top mit-knopf">/, name);
  }
  for (const name of ["termin/index.html", "termin/danke/index.html"]) {
    assert.match(seiten[name], /<header class="top">/, name);
  }
});

test("Startseite: Themen-Karten führen zum Termin, das Thema gibt es im Formular", () => {
  const start = seiten["index.html"];
  const termin = seiten["termin/index.html"];
  const themen = [...start.matchAll(/href="\/termin\/\?thema=([^"]+)"/g)].map((m) => decodeURIComponent(m[1]));
  assert.equal(themen.length, 6);
  for (const t of themen) assert.ok(termin.includes(`name="thema" value="${t}"`), `Thema ${t} fehlt im Terminformular`);
});

test("Knöpfe heißen überall gleich", () => {
  for (const [name, html] of Object.entries(seiten)) {
    for (const m of html.matchAll(/<a class="btn\b[^"]*" href="\/(termin|leitfaden)\/">([^<]+)<\/a>/g)) {
      const soll = m[1] === "termin" ? "Kostenlosen Termin wählen" : "Leitfaden kostenlos holen";
      assert.equal(m[2], soll, `${name}: Knopf zu /${m[1]}/`);
    }
  }
});

test("Schriften liegen auf dem eigenen Server und werden vorab geladen", () => {
  const css = readFileSync(join(DIST, "assets", "style.css"), "utf8");
  const dateien = [...css.matchAll(/url\((\/assets\/fonts\/[^)]+\.woff2)\)/g)].map((m) => m[1]);
  assert.equal(dateien.length, 3);
  for (const d of dateien) assert.ok(existsSync(join(DIST, d)), `${d} fehlt`);
  assert.equal(/url\((["']?)https?:/.test(css), false, "keine externen Dateien im CSS");
  for (const lizenz of ["OFL-Fraunces.txt", "OFL-Atkinson-Hyperlegible-Next.txt", "OFL-Inter.txt"]) {
    assert.ok(existsSync(join(DIST, "assets", "fonts", lizenz)), `${lizenz} fehlt`);
  }
  for (const [name, html] of Object.entries(seiten)) {
    assert.equal((html.match(/<link rel="preload" href="\/assets\/fonts\/[^"]+" as="font" type="font\/woff2" crossorigin>/g) || []).length, 2, name);
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

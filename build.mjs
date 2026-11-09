#!/usr/bin/env node
/*
  Baut die Website aus src/ nach dist/. Braucht nur Node, keine weiteren Pakete.
  Wrangler ruft das Skript vor jedem "wrangler dev" und "wrangler deploy" auf.

  src/pages/     Seiten. Oben steht ein Kopfbereich zwischen --- und ---
                 (title, description, robots …).
  src/partials/  Wiederkehrende Bausteine, eingebunden mit {{> name}}.
  src/static/    Wird unverändert kopiert (CSS, JS, Bilder, Videos, _headers).

  Platzhalter in Seiten und Bausteinen:
    {{site.kontakt.email}}                 Wert aus site.config.mjs (HTML-sicher)
    {{#site.kontakt.email}} … {{/site.kontakt.email}}   nur, wenn gefüllt
    {{^site.kontakt.email}} … {{/site.kontakt.email}}   nur, wenn leer
    {{? site.impressum.strasse | Straße und Hausnummer}}  Wert oder gelber Platzhalter
    {{{schema.startseite}}}                ungefiltert (nur für vom Build erzeugtes HTML)
*/
import { readFile, writeFile, mkdir, readdir, rm, cp } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, dirname, relative, sep, basename, extname } from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = dirname(fileURLToPath(import.meta.url));
const SRC = join(ROOT, "src");
const OUT = join(ROOT, "dist");

const site = (await import(pathToFileURL(join(ROOT, "site.config.mjs")).href)).default;
site.url = String(site.url || "").replace(/\/+$/, "");

const offen = new Map(); // leere Pflichtangaben: Schlüssel -> Hinweistext

/* ---------- Hilfsfunktionen ---------- */

async function dateien(dir) {
  if (!existsSync(dir)) return [];
  const eintraege = await readdir(dir, { withFileTypes: true });
  const liste = await Promise.all(
    eintraege.map((e) => (e.isDirectory() ? dateien(join(dir, e.name)) : [join(dir, e.name)])),
  );
  return liste.flat().sort();
}

const posix = (p) => p.split(sep).join("/");

function esc(v) {
  return String(v)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function gefuellt(v) {
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === "string") return v.trim() !== "";
  return Boolean(v);
}

function wert(ctx, schluessel, datei) {
  const v = schluessel.split(".").reduce((o, k) => (o == null ? undefined : o[k]), ctx);
  if (v === undefined) {
    // Seitenwerte dürfen fehlen, alles andere ist sehr wahrscheinlich ein Tippfehler.
    if (schluessel.startsWith("page.")) return "";
    throw new Error(`${datei}: unbekannter Platzhalter {{${schluessel}}}`);
  }
  return v;
}

function kopfbereich(text, datei) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!m) throw new Error(`${datei}: Kopfbereich (--- … ---) fehlt`);
  const page = {};
  for (const zeile of m[1].split(/\r?\n/)) {
    if (!zeile.trim() || zeile.trim().startsWith("#")) continue;
    const i = zeile.indexOf(":");
    if (i < 0) throw new Error(`${datei}: Zeile im Kopfbereich ohne Doppelpunkt: ${zeile}`);
    let v = zeile.slice(i + 1).trim();
    if (v === "true") v = true;
    else if (v === "false") v = false;
    page[zeile.slice(0, i).trim()] = v;
  }
  return { page, inhalt: text.slice(m[0].length) };
}

function einbinden(text, bausteine, datei, tiefe = 0) {
  return text.replace(/\{\{>\s*([\w-]+)\s*\}\}/g, (_, name) => {
    if (!(name in bausteine)) throw new Error(`${datei}: Baustein „${name}“ fehlt (src/partials/${name}.html)`);
    if (tiefe > 8) throw new Error(`${datei}: Bausteine zu tief verschachtelt`);
    return einbinden(bausteine[name], bausteine, datei, tiefe + 1);
  });
}

function rendern(text, ctx, datei) {
  let out = text;
  let vorher;
  const block = /\{\{([#^])\s*([\w.]+)\s*\}\}([\s\S]*?)\{\{\/\s*\2\s*\}\}/g;
  do {
    vorher = out;
    out = out.replace(block, (_, art, k, inhalt) =>
      (art === "#") === gefuellt(wert(ctx, k, datei)) ? inhalt : "",
    );
  } while (out !== vorher);

  out = out.replace(/\{\{\?\s*([\w.]+)\s*\|\s*([^}]+?)\s*\}\}/g, (_, k, hinweis) => {
    const v = wert(ctx, k, datei);
    if (gefuellt(v)) return esc(v).replace(/\n/g, "<br>");
    offen.set(k, hinweis);
    return `<mark class="todo">${esc(hinweis)}</mark>`;
  });
  out = out.replace(/\{\{\{\s*([\w.]+)\s*\}\}\}/g, (_, k) => String(wert(ctx, k, datei)));
  out = out.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, k) => esc(wert(ctx, k, datei)));

  const rest = out.indexOf("{{");
  if (rest >= 0) {
    throw new Error(`${datei}: nicht aufgelöster Platzhalter: „${out.slice(Math.max(0, rest - 30), rest + 50)}“`);
  }
  return out;
}

function seitenPfad(rel) {
  if (rel === "index.html") return "/";
  if (rel.endsWith("/index.html")) return "/" + rel.slice(0, -"index.html".length);
  return "/" + rel.replace(/\.html$/, "");
}

/* ---------- Abgeleitete Werte ---------- */

function abgeleitet() {
  const ziffern = String(site.kontakt.whatsapp || "").replace(/\D/g, "");
  const wa = (text) => (ziffern ? `https://wa.me/${ziffern}?text=${encodeURIComponent(text)}` : "");
  const mail = site.kontakt.email ? `mailto:${site.kontakt.email}` : "";
  const link = {
    whatsapp: wa(site.kontakt.whatsappText),
    whatsappTermin: wa("Hallo Darian, ich möchte gern einen Termin für meine ehrliche Einschätzung."),
    whatsappFrage: wa("Hallo Darian, ich habe eine Frage für deinen Podcast: "),
    whatsappNummer: ziffern ? `+${ziffern}` : "",
    email: mail,
    emailFrage: mail ? `${mail}?subject=${encodeURIComponent("Frage für deinen Podcast")}` : "",
  };
  link.frage = link.whatsappFrage || link.emailFrage || "/termin/";
  link.schreiben = link.whatsapp || link.email;

  const s = site.social;
  const flags = {
    social: [s.instagram, s.tiktok, s.youtube, s.spotify].some(gefuellt),
    podcastLinks: gefuellt(s.youtube) || gefuellt(s.spotify),
    // Das Foto erscheint erst, wenn die Datei da ist. Bis dahin steht dort der DK-Kreis, ohne Bild-Platzhalter.
    foto: existsSync(join(SRC, "static", "img", "darian.jpg")),
  };

  const sameAs = [s.instagram, s.tiktok, s.youtube, s.spotify].filter(gefuellt);
  const startseite = {
    "@context": "https://schema.org",
    "@type": "FinancialService",
    name: site.name,
    description: `${site.untertitel}: Altersvorsorge, Geldanlage, Absicherung und Steuervorteile bei Behinderung, per Video-Call, Chat oder WhatsApp.`,
    url: `${site.url}/`,
    image: `${site.url}/og-image.png`,
    areaServed: { "@type": "Country", name: "Deutschland" },
    knowsLanguage: [
      { "@type": "Language", name: "Deutsch", alternateName: "de" },
      { "@type": "Language", name: "Deutsche Gebärdensprache", alternateName: "gsg" },
    ],
    ...(site.kontakt.email ? { email: site.kontakt.email } : {}),
    ...(sameAs.length ? { sameAs } : {}),
    ...(gefuellt(site.impressum.anschrift) ? { address: site.impressum.anschrift.replace(/\n/g, ", ") } : {}),
  };
  const jsonLd = (obj) =>
    `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, "\\u003c")}</script>`;

  return { link, flags, schema: { startseite: jsonLd(startseite) }, jahr: new Date().getFullYear() };
}

/* ---------- Bauen ---------- */

async function bauen() {
  const start = Date.now();
  await rm(OUT, { recursive: true, force: true });
  await mkdir(OUT, { recursive: true });
  if (existsSync(join(SRC, "static"))) {
    // Hinweisdateien in den Ordnern werden nicht mit veröffentlicht.
    const filter = (pfad) => !/(^|[\\/])(LIESMICH\.txt|\.gitkeep|\.DS_Store)$/.test(pfad);
    await cp(join(SRC, "static"), OUT, { recursive: true, filter });
  }

  // CSS und JS bekommen eine Versionsnummer, damit Browser nach Änderungen neu laden.
  const asset = {};
  for (const datei of await dateien(join(SRC, "static", "assets"))) {
    if (![".css", ".js"].includes(extname(datei))) continue;
    const hash = createHash("sha256").update(await readFile(datei)).digest("hex").slice(0, 10);
    const name = basename(datei, extname(datei)).replace(/\W/g, "");
    asset[name] = `/${posix(relative(join(SRC, "static"), datei))}?v=${hash}`;
  }

  const bausteine = {};
  for (const datei of await dateien(join(SRC, "partials"))) {
    if (extname(datei) === ".html") bausteine[basename(datei, ".html")] = await readFile(datei, "utf8");
  }

  const extra = abgeleitet();
  const seiten = new Map();

  for (const datei of await dateien(join(SRC, "pages"))) {
    if (extname(datei) !== ".html") continue;
    const rel = posix(relative(join(SRC, "pages"), datei));
    const { page, inhalt } = kopfbereich(await readFile(datei, "utf8"), rel);
    for (const pflicht of ["title", "description"]) {
      if (!page[pflicht]) throw new Error(`${rel}: „${pflicht}“ fehlt im Kopfbereich`);
    }
    page.path = seitenPfad(rel);
    page.url = site.url + page.path;
    page.ogTitle ||= page.title;
    page.robots = !site.live ? "noindex, nofollow" : page.robots || "index, follow";
    page.disclaimer ||=
      "Allgemeine Informationen, keine individuelle Steuer- oder Finanzberatung. Investieren bietet Chancen, aber keine Garantie.";

    const html = rendern(einbinden(inhalt, bausteine, rel), { site, page, asset, ...extra }, rel);
    const ziel = join(OUT, rel);
    await mkdir(dirname(ziel), { recursive: true });
    await writeFile(ziel, html);
    seiten.set(page.path, { rel, page, html });
  }

  pruefeLinks(seiten);

  // robots.txt und sitemap.xml
  const indexierbar = [...seiten.values()].filter(
    (s) => s.page.sitemap !== false && !String(s.page.robots).includes("noindex"),
  );
  await writeFile(
    join(OUT, "robots.txt"),
    site.live ? `User-agent: *\nAllow: /\n\nSitemap: ${site.url}/sitemap.xml\n` : "User-agent: *\nDisallow: /\n",
  );
  const heute = new Date().toISOString().slice(0, 10);
  await writeFile(
    join(OUT, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      indexierbar.map((s) => `  <url><loc>${esc(s.page.url)}</loc><lastmod>${heute}</lastmod></url>\n`).join("") +
      `</urlset>\n`,
  );

  // Zusammenfassung
  console.log(`✓ ${seiten.size} Seiten gebaut nach dist/ (${Date.now() - start} ms)`);
  if (!site.live) console.log("ℹ Vorschau-Modus (live: false): Hinweisleiste an, Suchmaschinen ausgesperrt.");
  if (!extra.flags.foto) console.log("ℹ Foto fehlt noch: src/static/img/darian.jpg (bis dahin erscheint der DK-Kreis)");
  const ohneVideo = Object.entries(site.videos || {}).filter(([, v]) => !gefuellt(v?.src)).map(([k]) => k);
  if (ohneVideo.length) console.log(`ℹ Noch kein Video eingetragen (dort erscheint kein Video-Kasten): ${ohneVideo.join(", ")}`);
  if (offen.size) {
    console.log(`${site.live ? "⚠ ACHTUNG, live geschaltet und" : "ℹ"} noch offen in site.config.mjs (gelb markiert):`);
    for (const [k, hinweis] of offen) console.log(`   - ${k}: ${hinweis}`);
  }
}

/* Prüft interne Links, Bilder und Sprungmarken, damit nichts ins Leere führt. */
function pruefeLinks(seiten) {
  const fehler = [];
  const hinweise = new Set();
  // Bilder mit data-fallback dürfen fehlen (z. B. das Foto, solange es noch nicht da ist).
  const optional = new Set();
  for (const s of seiten.values()) {
    for (const m of s.html.matchAll(/<img\b[^>]*\bdata-fallback\b[^>]*>/g)) {
      const src = m[0].match(/\ssrc="([^"]+)"/);
      if (src) optional.add(src[1]);
    }
  }
  const ids = new Map();
  for (const [pfad, s] of seiten) ids.set(pfad, new Set([...s.html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));

  for (const [pfad, s] of seiten) {
    for (const m of s.html.matchAll(/\s(?:href|src|poster|data-src|data-poster|data-untertitel)="([^"]*)"/g)) {
      const ziel = m[1].replace(/&amp;/g, "&");
      if (!ziel || /^(https?:|mailto:|tel:|data:)/.test(ziel)) continue;
      const [ohneHash, hash] = ziel.split("#");
      const nurPfad = ohneHash.split("?")[0];
      if (ziel.startsWith("#")) {
        if (hash && !ids.get(pfad).has(hash)) fehler.push(`${s.rel}: Sprungmarke ${ziel} fehlt auf der Seite`);
        continue;
      }
      if (!nurPfad.startsWith("/") || nurPfad.startsWith("//")) {
        fehler.push(`${s.rel}: Link „${ziel}“ bitte mit / beginnen (z. B. /leitfaden/)`);
        continue;
      }
      if (nurPfad.startsWith("/api/")) continue;
      if (seiten.has(nurPfad)) {
        if (hash && !ids.get(nurPfad).has(hash)) fehler.push(`${s.rel}: Sprungmarke ${ziel} fehlt auf ${nurPfad}`);
      } else if (!existsSync(join(OUT, nurPfad.slice(1))) || nurPfad.endsWith("/")) {
        if (optional.has(ziel)) hinweise.add(ziel);
        else fehler.push(`${s.rel}: Link „${ziel}“ führt ins Leere`);
      }
    }
  }
  if (fehler.length) throw new Error(`Defekte Links:\n  ${fehler.join("\n  ")}`);
  for (const h of hinweise) console.log(`ℹ Foto fehlt noch: src/static${h} (bis dahin erscheint der DK-Kreis)`);
}

try {
  await bauen();
} catch (e) {
  console.error(`✗ Build fehlgeschlagen: ${e.message}`);
  process.exit(1);
}

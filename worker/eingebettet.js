/*
  Worker-Variante mit eingebetteten Dateien (erzeugt mit tools/eingebettet.mjs).
  Ersetzt die Static-Assets-Bindung env.ASSETS durch einen Nachbau, der die Dateien
  genauso ausliefert wie Cloudflare: Adressen mit Schrägstrich am Ende, 404-Seite,
  Sicherheits-Header aus _headers und Weiterleitungen aus _redirects.
  Die Lead-API und alles andere kommen unverändert aus worker/index.js.
*/
import worker from "./index.js";
import paket from "../.eingebettet/dateien.js";

const { dateien, header, weiterleitungen } = paket;
const binaer = new Map();

function inhalt(pfad) {
  const d = dateien[pfad];
  if (d.text != null) return d.text;
  if (!binaer.has(pfad)) binaer.set(pfad, Uint8Array.from(atob(d.b64), (z) => z.charCodeAt(0)));
  return binaer.get(pfad);
}

const muster = header.map((regel) => ({
  re: new RegExp(`^${regel.muster.split("*").map((t) => t.replace(/[.+?^${}()|[\]\\]/g, "\\$&")).join(".*")}$`),
  werte: regel.werte,
}));

function datei(pfad, anfrage, url, status = 200) {
  const d = dateien[pfad];
  const etag = `"${d.etag}"`;
  const h = new Headers({ "Content-Type": d.typ, "Cache-Control": "public, max-age=0, must-revalidate", ETag: etag });
  for (const regel of muster) if (regel.re.test(url.pathname)) for (const [k, v] of regel.werte) h.set(k, v);
  if (status === 200 && anfrage.headers.get("If-None-Match") === etag) return new Response(null, { status: 304, headers: h });
  return new Response(anfrage.method === "HEAD" ? null : inhalt(pfad), { status, headers: h });
}

function umleiten(ziel, url, status = 307) {
  return new Response(null, { status, headers: { Location: ziel + url.search } });
}

function ausliefern(anfrage) {
  const url = new URL(anfrage.url);
  const pfad = url.pathname;
  if (anfrage.method !== "GET" && anfrage.method !== "HEAD") {
    return new Response("Method Not Allowed", { status: 405, headers: { Allow: "GET, HEAD" } });
  }
  const weiter = weiterleitungen.find((w) => w.von === pfad);
  if (weiter) return umleiten(weiter.nach, url, weiter.status);

  if (pfad.endsWith("/index.html")) return umleiten(pfad.slice(0, -"index.html".length), url);
  if (pfad.endsWith(".html") && dateien[pfad]) return umleiten(pfad.slice(0, -".html".length), url);
  if (pfad.endsWith("/")) {
    if (dateien[`${pfad}index.html`]) return datei(`${pfad}index.html`, anfrage, url);
  } else {
    if (dateien[pfad]) return datei(pfad, anfrage, url);
    if (dateien[`${pfad}.html`]) return datei(`${pfad}.html`, anfrage, url);
    if (dateien[`${pfad}/index.html`]) return umleiten(`${pfad}/`, url);
  }
  return datei("/404.html", anfrage, url, 404);
}

const ASSETS = { fetch: async (anfrage) => ausliefern(anfrage instanceof Request ? anfrage : new Request(anfrage)) };

export default {
  fetch(request, env, ctx) {
    return worker.fetch(request, { ...env, ASSETS }, ctx);
  },
};

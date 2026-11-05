/*
  Cloudflare Worker der Website von Darian Krauß.

  - Alle Seiten, Bilder und Skripte kommen direkt aus dist/ (Static Assets).
  - POST /api/lead nimmt die Formulare entgegen (Leitfaden, Finanz-Check,
    Termin), prüft sie und leitet sie an deinen CRM-Webhook weiter.
    Die Adresse steht im Secret LEAD_WEBHOOK_URL (z. B. FinSuites),
    mehrere Adressen mit Komma trennen.
*/
import site from "../site.config.mjs";

const QUELLEN = {
  leitfaden: { tag: "leitfaden-2027", einwilligung: site.einwilligung.leitfaden },
  "finanz-check": { tag: "finanz-check", einwilligung: site.einwilligung.finanzCheck },
  termin: { tag: "termin-anfrage", einwilligung: site.einwilligung.termin },
};
const FINANZCHECK_FELDER = ["gdb", "pauschbetrag", "vorsorge", "kredit", "ziel"];
const KAMPAGNE = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid", "gclid"];
const MAX_BYTES = 16 * 1024;
const MAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/lead") return lead(request, env, url);
    if (url.pathname.startsWith("/api/")) return antwort({ ok: false, fehler: "nicht-gefunden" }, 404);
    // Alles andere ist eine Seite oder Datei (unbekannte Adressen bekommen die 404-Seite).
    return env.ASSETS.fetch(request);
  },
};

async function lead(request, env, url) {
  if (request.method !== "POST") return antwort({ ok: false, fehler: "methode" }, 405, { Allow: "POST" });
  if (!gleicheHerkunft(request, url)) return antwort({ ok: false, fehler: "herkunft" }, 403);
  const typ = (request.headers.get("Content-Type") || "").toLowerCase();
  if (!typ.startsWith("application/json")) return antwort({ ok: false, fehler: "format" }, 415);

  // Optionaler Schutz gegen Massenanfragen, siehe "ratelimits" in wrangler.jsonc
  if (env.LEAD_LIMIT) {
    const ip = request.headers.get("CF-Connecting-IP") || "unbekannt";
    const { success } = await env.LEAD_LIMIT.limit({ key: ip });
    if (!success) return antwort({ ok: false, fehler: "zu-viele" }, 429);
  }

  const text = await request.text();
  if (new TextEncoder().encode(text).length > MAX_BYTES) return antwort({ ok: false, fehler: "zu-gross" }, 413);
  let roh;
  try {
    roh = JSON.parse(text);
  } catch {
    return antwort({ ok: false, fehler: "format" }, 400);
  }
  if (!roh || typeof roh !== "object" || Array.isArray(roh)) return antwort({ ok: false, fehler: "format" }, 400);

  // Honigtopf: Bots füllen das versteckte Feld aus. Still annehmen und verwerfen.
  if (txt(roh.hinweisfeld, 500)) return antwort({ ok: true });

  const { daten, felder } = pruefen(roh);
  if (felder.length) return antwort({ ok: false, fehler: "eingabe", felder }, 422);

  const eintrag = aufbereiten(daten, roh, url);
  const ziele = String(env.LEAD_WEBHOOK_URL || "")
    .split(/[\s,]+/)
    .filter(Boolean);

  if (!ziele.length) {
    console.warn(`LEAD_WEBHOOK_URL ist nicht gesetzt, Anfrage nur im Log: ${JSON.stringify(eintrag)}`);
    return antwort({ ok: true });
  }

  const ergebnisse = await Promise.allSettled(ziele.map((ziel) => senden(ziel, eintrag)));
  const fehlgeschlagen = ergebnisse.filter((e) => e.status === "rejected").map((e) => String(e.reason?.message || e.reason));
  if (fehlgeschlagen.length === ziele.length) {
    // Damit nichts verloren geht, steht die Anfrage im Log (Workers Logs, höchstens 7 Tage).
    console.error(`Anfrage konnte nicht zugestellt werden (${fehlgeschlagen.join(" | ")}): ${JSON.stringify(eintrag)}`);
    return antwort({ ok: false, fehler: "zustellung" }, 502);
  }
  if (fehlgeschlagen.length) console.error(`Ein Webhook hat nicht geantwortet: ${fehlgeschlagen.join(" | ")}`);
  return antwort({ ok: true });
}

/* Nur Anfragen von der eigenen Seite annehmen (Schutz vor fremden Formularen) */
function gleicheHerkunft(request, url) {
  const origin = request.headers.get("Origin");
  if (origin) {
    try {
      return new URL(origin).host === url.host;
    } catch {
      return false;
    }
  }
  const fetchSite = request.headers.get("Sec-Fetch-Site");
  return !fetchSite || fetchSite === "same-origin";
}

function txt(v, max) {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

function pruefen(roh) {
  const felder = [];
  const quelle = txt(roh.quelle, 40);
  if (!Object.hasOwn(QUELLEN, quelle)) felder.push("quelle");

  const vorname = txt(roh.vorname, 80);
  if (!vorname) felder.push("vorname");

  const email = txt(roh.email, 254);
  if (!MAIL.test(email)) felder.push("email");

  const phone = txt(roh.phone, 40);
  const ziffern = phone.replace(/\D/g, "");
  if (ziffern.length < 7 || ziffern.length > 15 || /[^\d\s+()\-/.]/.test(phone)) felder.push("phone");

  if (roh.einwilligung !== true) felder.push("einwilligung");

  let thema = [];
  let sprache = "";
  if (quelle === "termin") {
    thema = (Array.isArray(roh.thema) ? roh.thema : [])
      .map((t) => txt(t, 60))
      .filter(Boolean)
      .slice(0, 10);
    if (!thema.length) felder.push("thema");
    sprache = txt(roh.sprache, 40);
    if (!sprache) felder.push("sprache");
  }

  let finanzcheck;
  if (roh.finanzcheck && typeof roh.finanzcheck === "object" && !Array.isArray(roh.finanzcheck)) {
    for (const k of FINANZCHECK_FELDER) {
      const v = txt(roh.finanzcheck[k], 120);
      if (v) (finanzcheck ||= {})[k] = v;
    }
  }

  return { felder, daten: { quelle, vorname, email, phone, thema, sprache, finanzcheck } };
}

/* Flache Felder, damit sie sich im CRM leicht zuordnen lassen */
function aufbereiten(d, roh, url) {
  const jetzt = new Date().toISOString();
  const seite = txt(roh.seite, 200);
  const eintrag = {
    vorname: d.vorname,
    first_name: d.vorname,
    email: d.email,
    phone: d.phone,
    telefon_international: international(d.phone),
    quelle: d.quelle,
    tag: QUELLEN[d.quelle].tag,
    einwilligung: true,
    einwilligung_text: QUELLEN[d.quelle].einwilligung,
    einwilligung_zeitpunkt: jetzt,
    seite: seite.startsWith("/") ? new URL(seite, url.origin).href : url.origin + "/",
    zeitpunkt: jetzt,
  };
  if (d.thema.length) eintrag.thema = d.thema.join(", ");
  if (d.sprache) eintrag.sprache = d.sprache;
  if (d.finanzcheck) {
    eintrag.finanzcheck = d.finanzcheck;
    for (const [k, v] of Object.entries(d.finanzcheck)) eintrag[`finanzcheck_${k}`] = v;
  }
  if (roh.utm && typeof roh.utm === "object" && !Array.isArray(roh.utm)) {
    for (const k of KAMPAGNE) {
      const v = txt(roh.utm[k], 200);
      if (v) eintrag[k] = v;
    }
  }
  return eintrag;
}

/* Handynummer für WhatsApp ins internationale Format bringen (Standard: Deutschland) */
function international(phone) {
  let p = phone.replace(/\(0\)/g, "").replace(/[^\d+]/g, "");
  p = p.replace(/(?!^)\+/g, "");
  if (p.startsWith("00")) return "+" + p.slice(2);
  if (p.startsWith("+")) return p;
  if (p.startsWith("0")) return "+49" + p.slice(1);
  return "+" + p;
}

async function senden(ziel, eintrag) {
  let letzterFehler;
  for (let versuch = 0; versuch < 2; versuch++) {
    if (versuch) await new Promise((r) => setTimeout(r, 500));
    let r;
    try {
      r = await fetch(ziel, {
        method: "POST",
        headers: { "Content-Type": "application/json", "User-Agent": "darian-krauss-website" },
        body: JSON.stringify(eintrag),
        signal: AbortSignal.timeout(8000),
      });
    } catch (e) {
      letzterFehler = e; // Netzwerkfehler oder Zeitüberschreitung: noch ein Versuch
      continue;
    }
    await r.arrayBuffer().catch(() => {});
    if (r.ok) return;
    letzterFehler = new Error(`Webhook antwortet mit ${r.status}`);
    if (r.status < 500 && r.status !== 429) break; // Bei 4xx bringt ein zweiter Versuch nichts
  }
  throw letzterFehler;
}

function antwort(daten, status = 200, extra = {}) {
  return new Response(JSON.stringify(daten), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      ...extra,
    },
  });
}

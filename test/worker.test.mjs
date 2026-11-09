import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import worker from "../worker/index.js";
import site from "../site.config.mjs";

const ORIGIN = "https://darian-krauss.example";
const ASSETS = { fetch: async (req) => new Response(`asset:${new URL(req.url).pathname}`) };

let gesendet;
let antworten;
let original;

beforeEach(() => {
  gesendet = [];
  antworten = [200];
  original = { fetch: globalThis.fetch, warn: console.warn, error: console.error };
  console.warn = () => {};
  console.error = () => {};
  globalThis.fetch = async (url, init) => {
    gesendet.push({ url: String(url), body: JSON.parse(init.body) });
    const status = antworten.length > 1 ? antworten.shift() : antworten[0];
    return new Response("ok", { status });
  };
});

afterEach(() => {
  globalThis.fetch = original.fetch;
  console.warn = original.warn;
  console.error = original.error;
});

const env = (extra = {}) => ({ ASSETS, LEAD_WEBHOOK_URL: "https://crm.example/hook", ...extra });

function post(body, headers = {}) {
  return new Request(`${ORIGIN}/api/lead`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: ORIGIN, ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

const leitfaden = {
  quelle: "leitfaden",
  vorname: "Lea",
  email: "lea@example.de",
  phone: "0176 1234567",
  consent_leitfaden: true,
  consent_marketing: false,
  hinweisfeld: "",
  seite: "/leitfaden/",
  t: 9000,
};
const termin = { ...leitfaden, quelle: "termin", consent_leitfaden: undefined, consent_marketing: undefined, einwilligung: true };
const finanzCheck = { ...leitfaden, quelle: "finanz-check", consent_leitfaden: undefined, consent_finanzcheck: true, seite: "/finanz-check/" };
const ANTWORTEN = { alter: "25–39", vorsorge: "Nur gesetzliche Rente", gdb: "Ja, GdB 100", pauschbetrag: "Nein", kredit: "Nein", ziel: "Steuern sparen" };
const DS = " Es gilt die Datenschutzerklärung.";

async function senden(body, e = env(), headers) {
  const r = await worker.fetch(post(body, headers), e);
  return { status: r.status, json: await r.json() };
}

test("gültiger Leitfaden-Lead geht mit Tag und beiden Einwilligungen getrennt an den Webhook", async () => {
  const { status, json } = await senden(leitfaden);
  assert.equal(status, 200);
  assert.deepEqual(json, { ok: true });
  assert.equal(gesendet.length, 1);
  const b = gesendet[0].body;
  assert.equal(gesendet[0].url, "https://crm.example/hook");
  assert.equal(b.first_name, "Lea");
  assert.equal(b.email, "lea@example.de");
  assert.equal(b.tag, "leitfaden-2027");
  assert.equal(b.quelle, "leitfaden");
  assert.equal(b.telefon_international, "+491761234567");
  assert.equal(b.consent_leitfaden, true);
  assert.equal(b.consent_leitfaden_text, site.einwilligung.leitfaden + DS);
  assert.equal(b.consent_marketing, false);
  assert.equal("consent_marketing_text" in b, false);
  assert.equal("einwilligung" in b, false, "beim Leitfaden kein altes Sammel-Feld mehr");
  assert.equal(b.seite, `${ORIGIN}/leitfaden/`);
  assert.ok(!Number.isNaN(Date.parse(b.consent_zeitpunkt)));
  assert.equal("hinweisfeld" in b, false);
});

test("Leitfaden: Tipps-Einwilligung wird mit Wortlaut übertragen", async () => {
  await senden({ ...leitfaden, consent_marketing: true });
  const b = gesendet[0].body;
  assert.equal(b.consent_marketing, true);
  assert.equal(b.consent_marketing_text, site.einwilligung.marketing);
});

test("Leitfaden: Handynummer ist freiwillig, aber wenn sie dasteht, muss sie stimmen", async () => {
  const ohne = await senden({ ...leitfaden, phone: "" });
  assert.equal(ohne.status, 200);
  const b = gesendet[0].body;
  assert.equal("phone" in b, false);
  assert.equal("telefon_international" in b, false);
  const falsch = await senden({ ...leitfaden, phone: "12" });
  assert.equal(falsch.status, 422);
  assert.deepEqual(falsch.json.felder, ["phone"]);
});

test("Leitfaden ohne Pflicht-Häkchen wird abgelehnt", async () => {
  const { status, json } = await senden({ ...leitfaden, consent_leitfaden: false, consent_marketing: true });
  assert.equal(status, 422);
  assert.deepEqual(json.felder, ["consent_leitfaden"]);
  assert.equal(gesendet.length, 0);
});

test("Termin: Handynummer bleibt Pflicht, kein Tipps-Feld", async () => {
  const basis = { ...termin, thema: ["Vorsorge"], sprache: "Chat" };
  const { status, json } = await senden({ ...basis, phone: "" });
  assert.equal(status, 422);
  assert.deepEqual(json.felder, ["phone"]);
  await senden({ ...basis, consent_marketing: true });
  assert.equal("consent_marketing" in gesendet[0].body, false);
  assert.equal(gesendet[0].body.einwilligung, true);
});

test("Finanz-Check: zwei getrennte Einwilligungen mit Wortlaut, Nummer freiwillig", async () => {
  const { status } = await senden({ ...finanzCheck, phone: "", finanzcheck: ANTWORTEN });
  assert.equal(status, 200);
  const b = gesendet[0].body;
  assert.equal(b.tag, "finanz-check");
  assert.equal(b.consent_finanzcheck, true);
  assert.equal(b.consent_finanzcheck_text, site.einwilligung.finanzCheck + DS);
  assert.match(b.consent_finanzcheck_text, /Grad der Behinderung/);
  assert.equal(b.consent_marketing, false);
  assert.equal("consent_marketing_text" in b, false);
  assert.equal("einwilligung" in b, false, "kein altes Sammel-Feld mehr");
  assert.equal("phone" in b, false);
  assert.ok(!Number.isNaN(Date.parse(b.consent_zeitpunkt)));
  await senden({ ...finanzCheck, consent_marketing: true });
  assert.equal(gesendet[1].body.consent_marketing, true);
  assert.equal(gesendet[1].body.consent_marketing_text, site.einwilligung.marketing);
});

test("Finanz-Check ohne Pflicht-Häkchen wird abgelehnt, auch mit Tipps-Häkchen", async () => {
  const { status, json } = await senden({ ...finanzCheck, consent_finanzcheck: false, consent_marketing: true, finanzcheck: ANTWORTEN });
  assert.equal(status, 422);
  assert.deepEqual(json.felder, ["consent_finanzcheck"]);
  assert.equal(gesendet.length, 0);
  const alt = await senden({ ...finanzCheck, consent_finanzcheck: undefined, einwilligung: true });
  assert.deepEqual(alt.json.felder, ["consent_finanzcheck"], "das alte Sammel-Häkchen reicht nicht mehr");
});

test("Variante A: Antworten aus dem Finanz-Check kommen nur mit dem Finanz-Check-Formular an", async () => {
  await senden({ ...leitfaden, finanzcheck: ANTWORTEN });
  await senden({ ...termin, thema: ["Vorsorge"], sprache: "Chat", finanzcheck: ANTWORTEN });
  for (const g of gesendet) {
    assert.equal("finanzcheck" in g.body, false, g.body.quelle);
    assert.equal(Object.keys(g.body).some((k) => k.startsWith("finanzcheck_")), false, g.body.quelle);
  }
  await senden({ ...finanzCheck, finanzcheck: ANTWORTEN });
  assert.equal(gesendet[2].body.finanzcheck_gdb, "Ja, GdB 100");
});

test("Terminanfrage braucht Thema und Sprache", async () => {
  const { status, json } = await senden(termin);
  assert.equal(status, 422);
  assert.deepEqual(json.felder, ["thema", "sprache"]);
  assert.equal(gesendet.length, 0);
});

test("Terminanfrage mit Thema und Sprache", async () => {
  const { status } = await senden({ ...termin, thema: ["Vorsorge", "Geldanlage"], sprache: "Gebärdensprache" });
  assert.equal(status, 200);
  const b = gesendet[0].body;
  assert.equal(b.tag, "termin-anfrage");
  assert.equal(b.thema, "Vorsorge, Geldanlage");
  assert.equal(b.sprache, "Gebärdensprache");
  assert.equal(b.einwilligung, true);
  assert.equal(b.einwilligung_text, site.einwilligung.termin + DS);
});

test("fehlende oder falsche Angaben werden benannt", async () => {
  const { status, json } = await senden({ quelle: "leitfaden", vorname: " ", email: "lea@", phone: "123", consent_leitfaden: "ja" });
  assert.equal(status, 422);
  assert.deepEqual(json.felder, ["vorname", "email", "phone", "consent_leitfaden"]);
  const t = await senden({ quelle: "termin", vorname: "Lea", email: "lea@example.de", phone: "0176 1234567", einwilligung: "ja", thema: ["Vorsorge"], sprache: "Chat" });
  assert.deepEqual(t.json.felder, ["einwilligung"]);
});

test("unbekannte Quelle wird abgelehnt", async () => {
  const { status, json } = await senden({ ...leitfaden, quelle: "__proto__" });
  assert.equal(status, 422);
  assert.deepEqual(json.felder, ["quelle"]);
});

test("Honigtopf: Bot bekommt ok, aber nichts wird weitergeleitet", async () => {
  const { status, json } = await senden({ ...leitfaden, hinweisfeld: "spam" });
  assert.equal(status, 200);
  assert.equal(json.ok, true);
  assert.equal(gesendet.length, 0);
});

test("Formulare von fremden Seiten werden abgelehnt", async () => {
  const { status } = await senden(leitfaden, env(), { Origin: "https://boese.example" });
  assert.equal(status, 403);
  const zwei = await senden(leitfaden, env(), { Origin: "null" });
  assert.equal(zwei.status, 403);
});

test("nur POST mit JSON, höchstens 16 KB", async () => {
  const get = await worker.fetch(new Request(`${ORIGIN}/api/lead`), env());
  assert.equal(get.status, 405);
  assert.equal(get.headers.get("Allow"), "POST");
  const text = await worker.fetch(post("vorname=Lea", { "Content-Type": "text/plain" }), env());
  assert.equal(text.status, 415);
  const kaputt = await worker.fetch(post("{kein json"), env());
  assert.equal(kaputt.status, 400);
  const liste = await worker.fetch(post("[1,2]"), env());
  assert.equal(liste.status, 400);
  const gross = await worker.fetch(post({ ...leitfaden, vorname: "x".repeat(17000) }), env());
  assert.equal(gross.status, 413);
});

test("Webhook fällt aus: zweiter Versuch, dann Fehler an die Seite", async () => {
  antworten = [500, 500];
  const { status, json } = await senden(leitfaden);
  assert.equal(status, 502);
  assert.equal(json.fehler, "zustellung");
  assert.equal(gesendet.length, 2);
});

test("Webhook antwortet 4xx: kein zweiter Versuch", async () => {
  antworten = [400];
  const { status } = await senden(leitfaden);
  assert.equal(status, 502);
  assert.equal(gesendet.length, 1);
});

test("Webhook erholt sich beim zweiten Versuch", async () => {
  antworten = [503, 200];
  const { status } = await senden(leitfaden);
  assert.equal(status, 200);
  assert.equal(gesendet.length, 2);
});

test("ohne Webhook: Anfrage wird angenommen (nur Log)", async () => {
  const { status, json } = await senden(leitfaden, { ASSETS });
  assert.equal(status, 200);
  assert.equal(json.ok, true);
  assert.equal(gesendet.length, 0);
});

test("mehrere Webhooks, einer davon kaputt: trotzdem ok", async () => {
  globalThis.fetch = async (url, init) => {
    gesendet.push({ url: String(url), body: JSON.parse(init.body) });
    return new Response("", { status: String(url).includes("kaputt") ? 404 : 200 });
  };
  const { status } = await senden(leitfaden, env({ LEAD_WEBHOOK_URL: "https://crm.example/a, https://kaputt.example/b" }));
  assert.equal(status, 200);
  assert.deepEqual(gesendet.map((g) => g.url).sort(), ["https://crm.example/a", "https://kaputt.example/b"]);
});

test("Finanz-Check- und Kampagnen-Felder werden gefiltert", async () => {
  await senden({
    ...finanzCheck,
    finanzcheck: { alter: "25–39", gdb: "Ja, GdB 100", ziel: "Steuern sparen", boese: "x" },
    utm: { utm_source: "instagram", utm_campaign: "leitfaden-2027", boese: "x" },
  });
  const b = gesendet[0].body;
  assert.equal(b.tag, "finanz-check");
  assert.deepEqual(b.finanzcheck, { alter: "25–39", gdb: "Ja, GdB 100", ziel: "Steuern sparen" });
  assert.equal(b.finanzcheck_alter, "25–39");
  assert.equal(b.finanzcheck_gdb, "Ja, GdB 100");
  assert.equal(b.utm_source, "instagram");
  assert.equal(b.utm_campaign, "leitfaden-2027");
  assert.equal("boese" in b, false);
  assert.equal("finanzcheck_boese" in b, false);
});

test("Handynummern werden international aufbereitet", async () => {
  const faelle = {
    "+49 (0) 176 1234567": "+491761234567",
    "0049 176 1234567": "+491761234567",
    "0176/123 45 67": "+491761234567",
    "4917612345678": "+4917612345678",
  };
  for (const [ein, aus] of Object.entries(faelle)) {
    gesendet = [];
    await senden({ ...leitfaden, phone: ein });
    assert.equal(gesendet[0].body.telefon_international, aus, ein);
  }
});

test("Rate-Limit greift, wenn eingerichtet", async () => {
  const LEAD_LIMIT = { limit: async () => ({ success: false }) };
  const { status } = await senden(leitfaden, env({ LEAD_LIMIT }));
  assert.equal(status, 429);
  assert.equal(gesendet.length, 0);
});

test("Seiten kommen aus den Assets, unbekannte API-Pfade sind 404", async () => {
  const seite = await worker.fetch(new Request(`${ORIGIN}/leitfaden/`), env());
  assert.equal(await seite.text(), "asset:/leitfaden/");
  const api = await worker.fetch(new Request(`${ORIGIN}/api/gibtsnicht`), env());
  assert.equal(api.status, 404);
});

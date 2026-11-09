# Darian Krauß · Homepage und Funnel

Website für **Darian Krauß, Finanzwissen in Laut- und Gebärdensprache**, gebaut für **Cloudflare Workers**.
Inhalte und Design stammen aus der Strategie-Demo und dem Leitfaden-Funnel der Best Life Agency:
Schwarz und Gold, helle Funnel-Seiten, Kontakt ohne Anruf.

**Live (Vorschau):** https://homepage.darian-krauss.workers.dev

| Seite | Adresse | Zweck |
|---|---|---|
| Startseite | `/` | Persönliche Marke, Über mich (DGS und Lautsprache), Themen, Ablauf, Finanzwissen, Podcast, FAQ, Kontakt |
| Termin-Funnel | `/termin/` | Video, drei kurze Fragen, dann in den Kalender (Stufe 3 der Anzeigen) |
| Termin, Schritt 2 | `/termin/danke/` | Uhrzeit im Online-Kalender wählen |
| Leitfaden-Funnel | `/leitfaden/` | Finanz-Leitfaden 2027 als Freebie (PDF und DGS-Video) |
| Finanz-Check | `/finanz-check/` | Sechs Fragen, 90 Sekunden, Ergebnis, dann Leitfaden |
| Danke-Seite | `/leitfaden/danke/` | Bestätigung und nächster Schritt: Termin |
| Rechtliches | `/impressum/`, `/datenschutz/` | Vorlagen mit allen Pflichtfeldern |

Wie die Seiten zusammenspielen und welche Texte dein CRM verschicken sollte, steht in [FUNNEL.md](FUNNEL.md).

## So funktioniert es

```
Clip / Anzeige ──▶ /termin/ oder /leitfaden/ oder /finanz-check/
                         │  Formular
                         ▼
              Cloudflare Worker  POST /api/lead
              prüft Angaben, Spam-Schutz (Honigtopf, Herkunft)
                         │
                         ▼
              dein CRM-Webhook (Secret LEAD_WEBHOOK_URL)
              ──▶ Mail mit Leitfaden, WhatsApp-Bestätigung, Erinnerung
```

- Keine Cookies, kein Tracking, keine externen Schriften. Deshalb braucht die Seite kein Cookie-Banner.
- Videos starten stumm mit Untertiteln, „Ton an“ schaltet den Ton zu. Gebärden werden nie abgeschnitten.
- Kampagnen-Kennungen aus dem Link (`utm_source`, `utm_campaign` …) gehen mit jeder Anfrage ins CRM.

## Inhalte anpassen

Fast alles, was du ändern musst, steht in **`site.config.mjs`**: E-Mail, WhatsApp-Nummer, Kalender-Link,
Social-Links, Videos, Impressum und Datenschutz-Angaben. Leere Felder werden ausgeblendet
oder im Impressum gelb markiert. Beim Bauen listet die Konsole auf, was noch fehlt.

- **Texte der Seiten:** `src/pages/…/index.html`
- **Kopf, Navigation, Fußzeile:** `src/partials/`
- **Design:** `src/static/assets/style.css`. Farben, Schriften und Abstände stehen oben als Variablen (`:root`):
  Tiefschwarz, Weiß, warmes Off-White und Champagnergold. Gold nur für Akzente, Linien und einzelne Überschriften.
- **Schriften:** Fraunces (Überschriften) und Atkinson Hyperlegible Next (Text) liegen in `src/static/assets/fonts/`,
  frei nutzbar (SIL Open Font License, Lizenztexte daneben). Die Ziffer 0 kommt aus Inter, weil die Textschrift
  sie mit Schrägstrich zeichnet und „2.840 €“ sonst wie „Ø“ (Durchschnitt) aussieht.
- **Marmor:** Die dezenten Texturen `src/static/img/marmor-dunkel.webp` und `marmor-hell.webp` sind selbst gerechnet,
  ohne fremde Bildrechte: `python3 tools/marmor.py` (braucht numpy und Pillow).
- **Videos:** MP4 nach `src/static/videos/` legen (höchstens 25 MB pro Datei), Untertitel als `.vtt` daneben,
  dann den Pfad in `site.config.mjs` unter `videos` eintragen, z. B. `"/videos/vorstellung.mp4"`.
  Ohne Eintrag erscheint an der Stelle nichts, auch keine Video-Vorschau.
- **Foto:** als `src/static/img/darian.jpg` ablegen, am besten im Hochformat 4:5 (mindestens 800 × 1000 Pixel).
  Es erscheint im Bogen-Rahmen im Hero und im Kasten „Über Darian“ der Funnel-Seiten. Solange die Datei fehlt,
  zeigen beide das Monogramm „DK“, ohne Bild-Platzhalter.
- **Video auf der Startseite:** Sobald `videos.startseite.src` in `site.config.mjs` gefüllt ist, ersetzt das
  DGS-Video den Foto-Rahmen im Hero (mit Untertiteln aus `untertitel`). Ohne Eintrag gibt es keine Video-Vorschau.
- **Podcast:** Knöpfe zu YouTube und Spotify erscheinen erst, wenn `social.youtube` bzw. `social.spotify` gefüllt sind.
  Der Steckbrief nennt nur Angaben, die stimmen. Folgen, Gäste oder Links werden nicht erfunden.
- **Vorschaubild und Icons:** `src/static/og-image.png` (1200 × 630, erscheint beim Teilen, z. B. in WhatsApp),
  `apple-touch-icon.png` und `favicon.svg` in Schwarz und Champagnergold.
- **Logo:** Sobald ein Logo da ist, ersetzt es das „DK“ in `src/partials/marke.html`.
- **Vermittlerangaben im Impressum:** `vermittler` in `site.config.mjs` bleibt `false`, bis diese Angaben rechtlich
  geprüft sind. Solange erscheint dazu nichts auf der Website.

## Lokal ansehen

Voraussetzung: [Node.js](https://nodejs.org) ab Version 22.

```bash
npm install
cp .dev.vars.example .dev.vars   # optional: Webhook für lokale Tests eintragen
npm run dev                       # http://localhost:8787
npm test                          # Build und Lead-API prüfen
```

Ohne Webhook nimmt die Seite Anfragen trotzdem an und schreibt sie nur ins Log (praktisch zum Testen).

## Auf Cloudflare veröffentlichen

Der Worker **`homepage`** läuft bereits in deinem Cloudflare-Konto unter
`https://homepage.darian-krauss.workers.dev`. Für Updates gibt es drei Wege.

### Weg A: Cloudflare mit GitHub verbinden (empfohlen)

Danach geht jede Änderung auf GitHub automatisch online.

1. Im [Cloudflare-Dashboard](https://dash.cloudflare.com) **Workers & Pages → homepage** öffnen.
2. In den Einstellungen unter **Build** das Git-Repository verbinden: GitHub autorisieren und
   `homepage-und-funnel` auswählen.
3. Build-Befehl leer lassen, Deploy-Befehl `npx wrangler deploy` (Standard). Cloudflare baut die Seite dabei selbst.

Cloudflare veröffentlicht den Haupt-Branch (`main`). Die Arbeit liegt zunächst im Branch
`claude/homepage-funnel-leitfaden-zringm`: Entweder per Pull Request nach `main` übernehmen oder in
Cloudflare unter **Settings → Build → Branch control** den Branch auswählen. Andere Branches bekommen
eigene Vorschau-Adressen.

### Weg B: Vom eigenen Rechner

```bash
npx wrangler login
npm run deploy
```

### Weg C: Aus einer Claude-Code-Sitzung

In Claude-Code-Sitzungen kommt Wranglers Datei-Upload nicht durch den Proxy. Dafür bettet
`npm run deploy:eingebettet` alle Seiten direkt in den Worker ein und lädt nur ihn hoch
(Token als Secret für `api.cloudflare.com` in der Umgebung, `CLOUDFLARE_API_TOKEN=proxy-injected`).
So wurde die aktuelle Live-Version veröffentlicht. Videos über 1 MB passen so nicht hinein,
dafür Weg A oder B nehmen. Beide Wege ersetzen die eingebettete Version ohne Weiteres.

### Webhook für die Formulare eintragen

Damit Anfragen in deinem CRM landen, den Webhook als **Secret** hinterlegen:

- im Dashboard: **Workers & Pages → homepage → Settings → Variables and Secrets → Add**,
  Typ **Secret**, Name `LEAD_WEBHOOK_URL`, Wert: die Webhook-Adresse deines CRM (oder Zapier, Make, n8n …),
- oder per Konsole: `npx wrangler secret put LEAD_WEBHOOK_URL`.

Mehrere Ziele mit Komma trennen. Fällt der Webhook aus, bekommt die Person eine Fehlermeldung mit
WhatsApp- und E-Mail-Alternative, und die Anfrage steht in den Logs (**Workers → homepage → Logs**).

### Eigene Domain

**Workers & Pages → homepage → Settings → Domains & Routes → Add → Custom domain**, z. B.
`www.darian-krauss.de` (die Domain muss bei Cloudflare liegen). Danach in `site.config.mjs` die `url` anpassen.

Gewünscht ist später `www.darian-krauß-finanzen.de`. Sie ist noch nicht registriert, und an der Website ist dafür
noch nichts umgestellt.

### Optional: Schutz gegen Massenanfragen

In `wrangler.jsonc` ist ein Rate-Limit vorbereitet (5 Anfragen pro Minute je IP). Zum Aktivieren den
auskommentierten Block `ratelimits` einkommentieren.

## Vor dem Livegang

Die ausführliche Liste mit allem, was Darian prüfen, entscheiden oder liefern muss, steht in
**[`docs/FREIGABE.md`](docs/FREIGABE.md)**. Kurzfassung:

- [ ] Impressum vollständig (`site.config.mjs` → `impressum`) und rechtlich geprüft, auch ob weitere Pflichtangaben nötig sind
- [ ] Texte zu Themen und Kennenlerngespräch rechtlich geprüft: keine Berufs-, Erlaubnis- oder Beratungsbehauptungen
- [ ] Wortlaut der Einwilligungen (Finanz-Check mit GdB, Leitfaden, Termin) rechtlich geprüft
- [ ] Datenschutzerklärung ergänzt (`datenschutz`: CRM, Kalender, Video-Call, Aufsichtsbehörde), rechtlich geprüft
- [ ] E-Mail-Adresse und WhatsApp-Nummer eingetragen
- [ ] Kalender-Link eingetragen (`kalender.url`) und im Kalender die WhatsApp-Bestätigung aktiv
- [ ] `LEAD_WEBHOOK_URL` gesetzt und eine Test-Anfrage im CRM angekommen
- [ ] Im CRM: Tipps und Einladungen nur bei `consent_marketing = true` und erst nach Double-Opt-In (siehe FUNNEL.md)
- [ ] Leitfaden-PDF und DGS-Video fertig und in der Mail verlinkt
- [ ] Videos mit Untertiteln eingebunden, Foto `src/static/img/darian.jpg` hochgeladen
- [ ] Instagram-Link geprüft (aus dem Anzeigen-Entwurf übernommen: `da.no.ka`)
- [ ] In `site.config.mjs` **`live: true`** setzen: Vorschau-Leiste verschwindet, Google darf die Seite aufnehmen

## Projektstruktur

```
site.config.mjs     Alle persönlichen Angaben an einer Stelle
build.mjs           Baut src/ nach dist/ (ohne Zusatzpakete), prüft alle internen Links
wrangler.jsonc      Cloudflare-Konfiguration (Worker, Static Assets, Build)
worker/index.js     Lead-API: POST /api/lead → CRM-Webhook
src/pages/          Seiten
src/partials/       Bausteine (Kopf, Navigation, Formularfelder, Fußzeile)
src/static/         CSS, JS, Bilder, Videos, Sicherheits-Header (_headers), Weiterleitungen (_redirects)
tools/eingebettet.mjs  Deploy ohne Datei-Upload (Weg C), mit worker/eingebettet.js
tools/marmor.py     Erzeugt die Marmor-Texturen (optional, braucht numpy und Pillow)
test/               Tests für Build und Lead-API (npm test)
docs/FREIGABE.md    Was vor dem Livegang geprüft, entschieden oder geliefert werden muss
```

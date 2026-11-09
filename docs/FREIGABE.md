# Freigabe-Liste vor der Veröffentlichung

Stand: 9. November 2026, Pull Request #2. **Nichts davon ist veröffentlicht.**

Hier steht, was vor der Veröffentlichung **geklärt**, **bestätigt** oder **geliefert** werden muss.

- **Pflicht** heißt: muss vor der Veröffentlichung geklärt sein.
- **Bestätigen** heißt: Die Aussage steht auf der Seite. Bitte sagen, ob sie stimmt.
- **Entscheiden** heißt: Es gibt mehrere gute Wege.

> Diese Liste ist eine technische Prüfliste und keine Rechtsberatung. Impressum, Datenschutzerklärung,
> Einwilligungen und die Texte zu den Angeboten bitte von einer Fachperson prüfen lassen, zum Beispiel von einer
> Anwältin oder einem Anwalt.

---

## 1. Pflichtangaben

### 1.1 Impressum · Pflicht

Diese Angaben fehlen noch. Sie stehen in `site.config.mjs` unter `impressum` und erscheinen bis dahin gelb markiert:

- Name
- Anschrift
- Kontakt

Freiwillig: Umsatzsteuer-ID.

**Bitte rechtlich klären:** Gehören für die eigene Tätigkeit weitere Pflichtangaben ins Impressum? Die Website hat dafür
den Schalter `vermittler` in `site.config.mjs`. Er ist **aus**. Damit erscheinen keine Angaben zu einer
Vermittlertätigkeit, also keine Berufsbezeichnung, keine Registernummer, keine IHK und keine Erstinformation.
Eingeschaltet wird er erst, wenn diese Angaben rechtlich geprüft sind.

### 1.2 Datenschutzerklärung · Pflicht

Diese Angaben fehlen noch (`site.config.mjs` unter `datenschutz`, bis dahin gelb markiert):

- Anbieter des CRM mit Name und Anschrift
- Anbieter für die Video-Calls mit Name und Anschrift
- Zuständige Datenschutz-Aufsichtsbehörde
- Online-Kalender: Der Abschnitt erscheint erst, wenn ein Kalender-Link eingetragen ist. Dann den Anbieter nennen.

**Bitte klären:** Wer bekommt die Daten aus den Formularen? Die Erklärung nennt Darian Krauß als Verantwortlichen und
das CRM als Dienstleister. Haben weitere Personen oder Unternehmen Zugriff auf die Anfragen, muss das in der
Datenschutzerklärung und in den Einwilligungen stehen.

**Double-Opt-In:** Die Erklärung verspricht eine Bestätigungsmail, bevor Tipps und Einladungen kommen. Das muss im CRM
eingerichtet sein, bevor die Seite veröffentlicht wird.

### 1.3 Einwilligungen · Wortlaut prüfen lassen

Kein Häkchen ist vorausgewählt.

| Formular | Häkchen | Wortlaut |
|---|---|---|
| Leitfaden | Pflicht | „Ich möchte den Leitfaden per E-Mail bekommen. Es gilt die Datenschutzerklärung.“ |
| Finanz-Check | Pflicht | „Ich möchte meine Auswertung und den Leitfaden per E-Mail bekommen. Dafür darf Darian Krauß meine Antworten aus dem Finanz-Check nutzen. Das gilt auch für meine Angabe zum Grad der Behinderung (GdB). Ich kann das jederzeit widerrufen. Es gilt die Datenschutzerklärung.“ |
| Leitfaden und Finanz-Check | freiwillig, erscheint mit Handynummer | „Darian Krauß darf mir per E-Mail und WhatsApp Tipps zu Finanzthemen und Einladungen zu Gesprächen schicken. Ich kann das jederzeit widerrufen.“ |
| Kennenlerngespräch | Pflicht | „Ich bin einverstanden, dass Darian Krauß meine Angaben nutzt, um mit mir einen Termin abzustimmen, und mich dazu per E-Mail und WhatsApp kontaktiert. Ich kann diese Einwilligung jederzeit widerrufen. Es gilt die Datenschutzerklärung.“ |

- Der GdB gilt als Gesundheitsdatum (Art. 9 DSGVO). Deshalb nennt ihn das Pflicht-Häkchen im Finanz-Check ausdrücklich.
  Die Antworten gehen nur mit dem Finanz-Check-Formular an das CRM (Variante A).
- Das freiwillige Häkchen nennt jetzt Darian Krauß als Absender und verspricht keine Beratung. Die Datenschutzerklärung
  ist an dieser Stelle angepasst.
- An das CRM gehen `consent_leitfaden` bzw. `consent_finanzcheck` und `consent_marketing`, jeweils mit Wortlaut und
  Zeitpunkt (siehe `FUNNEL.md`).

---

## 2. Keine Berufs-, Erlaubnis- oder Beratungsangaben · umgesetzt, bitte prüfen lassen

- Die Website nennt **keine Berufsbezeichnung, keine Zulassung und keine Qualifikation**. Im Mittelpunkt steht die
  persönliche Marke „Darian Krauß“.
- Die Angebote sind zurückhaltend formuliert:
  - allgemeine Informationen zu sechs Geldthemen
  - Finanz-Check und Leitfaden
  - Podcast
  - ein kostenloses Kennenlerngespräch: 20 Minuten per Video-Call, Fragen stellen, Grundlagen verstehen
- Auf der Startseite steht: „Hier bekommst du allgemeine Informationen. Sie ersetzen keine individuelle Beratung.
  Ich bin kein Steuerberater.“ Der Hinweis in der Fußzeile passt dazu.
- **Bitte prüfen lassen:** die Texte zu den sechs Themen, zum Kennenlerngespräch und zum Finanz-Check-Ergebnis.
- Das gilt auch außerhalb der Website: Anzeigen, Mails, WhatsApp-Vorlagen und Social Media. Die Vorlagen in
  `FUNNEL.md` sind entsprechend angepasst.

---

## 3. Aussagen auf der Seite · Bestätigen

| Aussage | Wo sie steht |
|---|---|
| Der Leitfaden kommt als PDF **und als Video in DGS** mit großen Untertiteln. | Startseite, Leitfaden, Finanz-Check, beide Danke-Seiten, Kennenlerngespräch |
| Der Leitfaden kommt **sofort** per Mail. In `FUNNEL.md` steht: erst eine Bestätigungsmail, dann der Leitfaden. Was stimmt? | Leitfaden, Leitfaden-Danke |
| Die Terminbestätigung kommt **per WhatsApp als Text und kurzes Video in Gebärdensprache**, kurz vorher die Erinnerung mit Link. | Startseite (Ablauf), Kennenlerngespräch, Danke-Seite |
| Kostenlos und unverbindlich, 20 Minuten, kein Anruf nötig, ohne Dolmetscher | an vielen Stellen |
| „Keine Weitergabe an Dritte“ | Leitfaden-Formular |
| „Kein Spam“ | Leitfaden, Finanz-Check |
| „Die Website setzt keine Cookies und kein Tracking.“ Das stimmt für die Website selbst. In Cloudflare dürfen keine Analyse- oder Bot-Funktionen an sein, die Cookies setzen. | Häufige Fragen, Datenschutz |
| „Mit Cloudflare besteht ein Vertrag zur Auftragsverarbeitung.“ Protokolle höchstens sieben Tage. | Datenschutz |
| Podcast: regelmäßig neue Folgen, Themen „Geld, Vorsorge und Absicherung“ | Startseite, Leitfaden-Danke, Kasten „Über Darian“ |
| Instagram-Link `da.no.ka`: Ist das das eigene, persönliche Profil? | Fußzeile |

Die Pauschbeträge (384 € bis 2.460 €, 2.840 €, 7.400 €) stimmen mit § 33b EStG überein, Stand November 2026.

---

## 4. Entscheidungen

1. **Video im Hero, sobald es da ist:** Es startet automatisch ohne Ton, außer bei „reduzierte Bewegung“. Alternative:
   Start per Klick.
2. **Link-Text** in den Themen-Karten: „Termin zu diesem Thema“. Passt das?
3. **Domain:** Gewünscht ist `www.darian-krauß-finanzen.de`. Es ist noch nichts registriert und nichts umgestellt.
   Tipp: auch die Schreibweise mit „ss“ sichern (`darian-krauss-finanzen.de`).

Erledigt: Finanz-Check Variante A mit zwei Häkchen. Die Prüf-Screenshots sind aus dem Branch entfernt.
Tipp zum Mergen: „Squash and merge“.

---

## 5. Was noch fehlt

| Was | Wohin | Bis dahin |
|---|---|---|
| Foto, Hochformat 4:5, mindestens 800 × 1000 Pixel | `src/static/img/darian.jpg` | DK-Kreis im Bogen-Rahmen, kein Platzhalter-Foto |
| DGS-Videos mit Untertiteln (`.vtt`) für Startseite, Kennenlerngespräch, beide Danke-Seiten, Leitfaden | `src/static/videos/`, Pfad in `site.config.mjs` | Dort erscheint nichts, keine Video-Vorschau |
| Leitfaden: PDF und DGS-Video fertig, in der Mail verlinkt | CRM | |
| Podcast: Name, falls es einen gibt, und Links | `site.config.mjs` → `social` | Keine Podcast-Knöpfe |
| E-Mail-Adresse und WhatsApp-Nummer | `site.config.mjs` → `kontakt` | Keine WhatsApp- und E-Mail-Knöpfe |
| Link zum Online-Kalender | `site.config.mjs` → `kalender` | Nach der Anfrage steht „Ich melde mich bei dir“ |
| CRM-Webhook `LEAD_WEBHOOK_URL` | Secret in Cloudflare | Anfragen stehen nur bis zu sieben Tage im Protokoll, keine Mail |
| Automationen im CRM: Double-Opt-In, Leitfaden-Mail, WhatsApp-Bestätigung, Erinnerung | CRM, Vorlagen in `FUNNEL.md` | |
| Logo, falls gewünscht | `src/partials/marke.html` | „DK“ im Kreis |
| Zum Schluss: `live: true` | `site.config.mjs` | Vorschau-Leiste oben, Suchmaschinen ausgesperrt |

---

## 6. Was sich an rechtlichen Texten geändert hat

- **Impressum:** Die Angaben zu einer Vermittlertätigkeit sind ausgeblendet (Schalter `vermittler` aus).
  Name, Anschrift, Kontakt, „Verantwortlich nach § 18 Abs. 2 MStV“ und der Hinweis zu den Inhalten bleiben.
- **Datenschutzerklärung:** der Abschnitt Finanz-Check (Variante A, GdB). Der Satz zu Tipps und Einladungen passt jetzt
  zum neuen Häkchen. Der Platzhalter für das CRM nennt keinen Anbieter mehr.
- **Einwilligungen:** Finanz-Check (zwei Häkchen) und der Text des freiwilligen Häkchens (siehe 1.3).
- **Unverändert:** die Einwilligungen bei Leitfaden und Kennenlerngespräch, der Hinweis in der Fußzeile und die Zahlen
  2.840 € und 7.400 €.

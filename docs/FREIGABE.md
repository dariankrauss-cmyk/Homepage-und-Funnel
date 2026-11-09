# Freigabe-Liste vor dem Livegang

Stand: 9. November 2026, Pull Request #2. **Nichts davon ist veröffentlicht.** Die Live-Seite zeigt noch die alte Version.

Hier steht alles, was Darian vor dem Livegang **prüfen**, **entscheiden** oder **liefern** muss.

- **Pflicht** heißt: muss vor dem Livegang geklärt sein.
- **Bestätigen** heißt: Die Aussage steht auf der Seite. Bitte sag, ob sie stimmt.
- **Entscheiden** heißt: Es gibt mehrere gute Wege. Du wählst.

> **Wichtig:** Ich bin kein Anwalt. Die rechtlichen Punkte sind Hinweise zum Prüfen, keine Rechtsberatung.
> Bitte lass Impressum, Datenschutzerklärung und Einwilligungen von einer Fachperson prüfen, zum Beispiel
> von einer Anwältin oder einem Anwalt oder deiner IHK. Ich ändere diese Texte erst nach deiner Freigabe.

---

## 1. Rechtliches

### 1.1 Impressum und Erstinformation · Pflicht

Diese Angaben fehlen noch. Sie stehen in `site.config.mjs` unter `impressum` und erscheinen bis dahin gelb markiert:

- Name, Anschrift, Kontakt
- Berufsbezeichnung
- Registernummer im Vermittlerregister
- Zuständige IHK
- Status nach § 34d GewO
- Beteiligungen über 10 % an oder von Versicherungsunternehmen

Freiwillig: Umsatzsteuer-ID, Berufshaftpflicht, weitere Schlichtungsstelle.

**Bitte prüfen lassen:** Die Erstinformation musst du beim ersten Kontakt **in Textform** geben (§ 15 VersVermV),
zum Beispiel als PDF per Mail. Der Abschnitt im Impressum allein reicht dafür wahrscheinlich nicht.

### 1.2 Das Wort „Makler“ · Pflicht

Es steht im Hero der Startseite, bei „Über mich“, in der Fußzeile und im Kasten „Über Darian“ auf den Funnel-Seiten.

„Makler“ darf nur stehen, wenn du im Vermittlerregister als **Versicherungsmakler** eingetragen bist.
Als Versicherungsvertreter wäre das Wort irreführend. Bitte bestätige es oder nenn mir die richtige Bezeichnung.

### 1.3 Erlaubnisse für die Beratungsthemen · Pflicht

Die Startseite nennt sechs Themen. Für manche braucht man eine eigene Erlaubnis, wenn man dazu berät oder vermittelt.

| Thema auf der Seite | Erlaubnis | Frage an dich |
|---|---|---|
| Altersvorsorge, Absicherung | § 34d GewO (Versicherungen) | Vorhanden? |
| Geld anlegen mit ETF | § 34f GewO (Finanzanlagen) oder § 34h GewO | Vorhanden? Sonst nur als allgemeine Information oder streichen. |
| Die erste eigene Immobilie (Finanzierung) | § 34i GewO (Immobiliardarlehen) | Vorhanden? Sonst nur allgemein erklären. |
| Raus aus Dispo und Ratenkredit, im Finanz-Check auch „Umschulden“ | § 34c GewO, wenn du Kredite vermittelst | Vermittelst du Kredite? |
| Steuervorteile bei Behinderung | Steuerberatung dürfen nur Steuerberater (StBerG) | Die Seite sagt schon: „Ich bin Finanzberater, kein Steuerberater.“ Bitte so lassen. |

Das Impressum nennt im Moment § 34d und § 34f („je nach Erlaubnis“). Es muss genau zu deinen Erlaubnissen passen.

### 1.4 Datenschutzerklärung: fehlende Angaben · Pflicht

In `site.config.mjs` unter `datenschutz`, bis dahin gelb markiert:

- CRM-Anbieter mit Name und Anschrift, zum Beispiel FinSuites
- Anbieter für die Video-Calls mit Name und Anschrift
- Zuständige Datenschutz-Aufsichtsbehörde
- Online-Kalender: Der Abschnitt erscheint erst, wenn ein Kalender-Link eingetragen ist. Dann den Anbieter nennen.

### 1.5 Finanz-Check fragt nach dem Grad der Behinderung (GdB) · Pflicht

- Der GdB gilt als **Gesundheitsdatum** (Art. 9 DSGVO). Dafür gelten strengere Regeln.
- Heute gehen die Antworten an dein CRM, wenn die Person danach ein Formular abschickt. Das gilt auch für das
  Leitfaden- und das Terminformular im selben Browser-Tab.
- Wenn die Antworten an dein CRM gehen, braucht es wahrscheinlich eine **ausdrückliche Einwilligung**, die den GdB
  nennt, und einen Hinweis in der Datenschutzerklärung.
- Das hängt mit deiner Entscheidung **A oder B** zusammen (Punkt 3.1).

### 1.6 Einwilligung im Finanz-Check ist gekoppelt · Pflicht

Der Text heute: „Ich bin einverstanden, dass Darian Krauß mir Auswertung und Leitfaden schickt und mich per E-Mail
und WhatsApp zu Finanzthemen informiert (Tipps und Einladungen zur Beratung). …“

- Wer die Auswertung haben will, muss auch Tipps und Einladungen annehmen. Das kann gegen das Kopplungsverbot
  verstoßen (Art. 7 Abs. 4 DSGVO).
- **Vorschlag:** zwei Häkchen wie beim Leitfaden.
  - Pflicht: „Ich möchte die Auswertung und den Leitfaden per E-Mail bekommen.“
  - Freiwillig: Tipps und Einladungen per E-Mail und WhatsApp.
- Ich ändere das erst nach deiner Freigabe, weil der Text als Nachweis an dein CRM geht.

### 1.7 Einwilligung beim Termin · Bestätigen

Der Text heute: „Ich bin einverstanden, dass Darian Krauß meine Angaben nutzt, um mit mir einen Termin abzustimmen,
und mich dazu per E-Mail und WhatsApp kontaktiert. …“ Das Häkchen ist Pflicht.

Bitte prüfen lassen, ob das so passt. Die Datenschutzerklärung nennt für den Termin die Anfrage selbst als Grundlage
(Art. 6 Abs. 1 lit. b DSGVO) und für WhatsApp die Einwilligung.

### 1.8 Double-Opt-In · Pflicht

Die Datenschutzerklärung verspricht eine Bestätigungsmail (Double-Opt-In) für Tipps und Einladungen und beim
Finanz-Check. Das muss **in deinem CRM eingerichtet** sein, bevor die Seite live geht. Sonst stimmt der Text nicht.

### 1.9 Hinweis in der Fußzeile · Entscheiden

Der Text auf allen Seiten: „Allgemeine Informationen, keine individuelle Steuer- oder Finanzberatung. Investieren
bietet Chancen, aber keine Garantie.“

- Der Satz widerspricht deinem Angebot „Finanzberatung“.
- **Vorschlag:** „Die Inhalte dieser Website sind allgemeine Informationen und ersetzen keine persönliche Beratung.
  Ich bin kein Steuerberater. Investieren bietet Chancen, aber keine Garantie.“
- Leitfaden und Finanz-Check haben eigene Hinweise. Die passen.

---

## 2. Aussagen auf der Seite · Bestätigen

Bitte bestätige, dass diese Aussagen stimmen. Sonst ändere ich sie.

| Aussage | Wo sie steht |
|---|---|
| Der Leitfaden kommt als PDF **und als Video in DGS** mit großen Untertiteln. | Startseite, Leitfaden, Finanz-Check, beide Danke-Seiten, Termin |
| Der Leitfaden kommt **sofort** per Mail. In `FUNNEL.md` steht aber: erst eine Bestätigungsmail, dann der Leitfaden. Was stimmt? | Leitfaden, Leitfaden-Danke |
| Die Terminbestätigung kommt **per WhatsApp als Text und kurzes Video in Gebärdensprache**, kurz vorher die Erinnerung mit Link. | Startseite (Ablauf), Termin, Termin-Danke |
| Kostenlos und unverbindlich, 20 Minuten, kein Anruf nötig, ohne Dolmetscher. | an vielen Stellen |
| „Keine Weitergabe an Dritte“. Dein CRM, WhatsApp (Meta) und Cloudflare verarbeiten die Daten. Bitte prüfen lassen, ob der Satz so stehen darf. | Leitfaden-Formular |
| „Kein Spam“ | Leitfaden, Finanz-Check |
| „Die Website setzt keine Cookies und kein Tracking.“ Das stimmt für die Website selbst. In Cloudflare dürfen keine Analyse- oder Bot-Funktionen an sein, die Cookies setzen. | Häufige Fragen, Datenschutz |
| „Mit Cloudflare besteht ein Vertrag zur Auftragsverarbeitung.“ Protokolle höchstens sieben Tage. | Datenschutz |
| Podcast: regelmäßig neue Folgen, Themen „Geld, Vorsorge und Absicherung“, für gehörlose, schwerhörige und hörende Menschen | Startseite, Leitfaden-Danke, Kasten „Über Darian“ |
| Instagram-Link `da.no.ka` (aus dem Anzeigen-Entwurf übernommen) | Fußzeile |

Die Pauschbeträge (384 € bis 2.460 €, 2.840 €, 7.400 €) stimmen mit § 33b EStG überein, Stand November 2026.
Bitte vor dem Livegang noch einmal auf Änderungen prüfen.

---

## 3. Deine Entscheidungen · Entscheiden

### 3.1 Finanz-Check: A oder B

- **A:** Die Antworten gehen nur mit dem Finanz-Check-Formular an dein CRM. Dazu kommt ein ehrlicher Hinweis und
  die ausdrückliche Einwilligung für den GdB (Punkt 1.5).
- **B:** Die Antworten gehen nie an dein CRM. Dann kann der Satz stehen: „Deine Antworten bleiben auf deinem Gerät.“
  Du siehst die Antworten dann aber nicht.

Heute gehen die Antworten auch mit dem Leitfaden- und dem Terminformular mit. Beide Varianten ändern das.

### 3.2 Leitfaden-Mail: sofort oder erst nach Bestätigung?

Siehe Punkt 2. Wenn zuerst eine Bestätigungsmail kommt, passe ich die Leitfaden-Seite und die Danke-Seite an.

### 3.3 Video im Hero, sobald es da ist

Es startet automatisch ohne Ton, außer bei „reduzierte Bewegung“. Die Alternative ist ein Start per Klick.

### 3.4 Link-Text in den Themen-Karten

Dort steht „Termin zu diesem Thema“. Passt das?

### 3.5 Domain

Gewünscht ist `www.darian-krauß-finanzen.de`. Es ist noch nichts registriert und nichts umgestellt.
**Tipp:** Sichere auch die Schreibweise mit „ss“ (`darian-krauss-finanzen.de`). Viele Tastaturen und Programme
tippen kein ß oder wandeln es um.

### 3.6 Screenshots im Pull Request

Der Ordner `docs/screenshots/` ist nur für die Prüfung da. Vor dem Mergen löschen oder behalten?

---

## 4. Was noch fehlt

| Was | Wohin | Bis dahin |
|---|---|---|
| Foto, Hochformat 4:5, mindestens 800 × 1000 Pixel | `src/static/img/darian.jpg` | DK-Kreis im Bogen-Rahmen, kein Platzhalter-Foto |
| DGS-Videos mit Untertiteln (`.vtt`) für Startseite, Termin, Termin-Danke, Leitfaden, Leitfaden-Danke | `src/static/videos/`, Pfad in `site.config.mjs` | An diesen Stellen erscheint nichts. Keine Video-Vorschau. |
| Leitfaden: PDF und DGS-Video fertig, in der Mail verlinkt | dein CRM | |
| Podcast: Name, falls es einen gibt, und Links zu YouTube und Spotify | `site.config.mjs` → `social` | Keine Knöpfe zu YouTube und Spotify |
| E-Mail-Adresse und WhatsApp-Nummer | `site.config.mjs` → `kontakt` | Keine WhatsApp- und E-Mail-Knöpfe |
| Link zum Online-Kalender | `site.config.mjs` → `kalender` | Nach der Terminanfrage steht „Ich melde mich bei dir“. |
| CRM-Webhook `LEAD_WEBHOOK_URL` | Secret in Cloudflare | Anfragen stehen nur bis zu sieben Tage im Protokoll, und es geht keine Mail raus. Bitte prüfen, ob er gesetzt ist. |
| Automationen im CRM: Double-Opt-In, Leitfaden-Mail, WhatsApp-Bestätigung mit DGS-Video, Erinnerung | dein CRM, Vorlagen in `FUNNEL.md` | |
| Logo (DANOKA), falls gewünscht | `src/partials/marke.html` | „DK“ im Kreis |
| Zum Schluss: `live: true` | `site.config.mjs` | Vorschau-Leiste oben, Suchmaschinen ausgesperrt |

---

## 5. Bewusst nicht geändert

- Impressum, Datenschutzerklärung, Einwilligungstexte und der Fußzeilen-Hinweis: Der Wortlaut ist unverändert.
- Das Wort „Makler“.
- Die Zahlen 2.840 € und 7.400 €.
- Formulare, `/api/lead`, Worker, Cloudflare-Einstellungen und die Domain.

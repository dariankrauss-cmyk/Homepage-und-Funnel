# Der Funnel: vom Clip bis zum Termin

Umsetzung der Strategie „Finanzwissen, das man sehen kann“: Podcast → Clips → Anzeigen → Anfrage → Termin.
Nirgends muss jemand anrufen, Kontakt läuft über Video, Chat und WhatsApp.

## Wohin welcher Link führt

| Stufe | Inhalt | Ziel auf der Website |
|---|---|---|
| 1 · Sehen | Bester Clip als Anzeige, an neue Menschen | `/leitfaden/` (Freebie) oder Profil |
| 2 · Vertrauen | Kundengeschichte oder Partner-Folge, an Video-Zuschauer | `/finanz-check/` oder `/leitfaden/` |
| 3 · Termin | „Ehrliche Einschätzung zu deinen Finanzen: 20 Minuten per Video-Call“, an Interessierte | `/termin/` |
| Bio-Link | „Termin für deine ehrliche Einschätzung, Link in meiner Bio“ | `/termin/` |
| Podcast-Beschreibung | YouTube und Spotify | `/leitfaden/` |

Alle Wege enden beim Termin: Die Leitfaden-Danke-Seite und jede Mail laden zur ehrlichen Einschätzung ein.

### Kampagnen-Kennungen anhängen

Damit du im CRM siehst, welche Anzeige Anfragen bringt („Kosten pro Termin“), hänge Kennungen an die Links.
Die Website schickt sie automatisch mit jeder Anfrage mit.

- **Meta-Anzeigen**, Feld „URL-Parameter“:
  `utm_source={{site_source_name}}&utm_medium=paid&utm_campaign={{campaign.name}}&utm_content={{ad.name}}`
- **Instagram-Bio:** `https://…/termin/?utm_source=instagram&utm_medium=bio`
- **Podcast-Beschreibung:** `https://…/leitfaden/?utm_source=youtube&utm_medium=podcast&utm_campaign=folge-01`

## Was dein CRM bekommt

Jedes Formular schickt per `POST` ein JSON an `LEAD_WEBHOOK_URL`. Die Felder sind flach, damit sie sich leicht zuordnen lassen:

```json
{
  "vorname": "Lea",
  "first_name": "Lea",
  "email": "lea@example.de",
  "phone": "0176 1234567",
  "telefon_international": "+491761234567",
  "quelle": "termin",
  "tag": "termin-anfrage",
  "thema": "Vorsorge, Immobilie",
  "sprache": "Gebärdensprache",
  "einwilligung": true,
  "einwilligung_text": "Ich bin einverstanden, dass Darian Krauß meine Angaben nutzt, …",
  "einwilligung_zeitpunkt": "2026-11-05T18:02:11.000Z",
  "seite": "https://homepage.darian-krauss.workers.dev/termin/",
  "zeitpunkt": "2026-11-05T18:02:11.000Z",
  "utm_source": "instagram",
  "utm_campaign": "stufe-3-termin"
}
```

| `quelle` | `tag` | Zusätzliche Felder |
|---|---|---|
| `leitfaden` | `leitfaden-2027` | `consent_leitfaden` (immer `true`), `consent_marketing` (`true`/`false`), Texte dazu in `consent_leitfaden_text` / `consent_marketing_text`, `consent_zeitpunkt`. Kein Feld `einwilligung`. Handynummer freiwillig: `phone` fehlt, wenn leer. |
| `finanz-check` | `finanz-check` | `finanzcheck_alter`, `finanzcheck_vorsorge`, `finanzcheck_gdb`, `finanzcheck_pauschbetrag`, `finanzcheck_kredit`, `finanzcheck_ziel` |
| `termin` | `termin-anfrage` | `thema`, `sprache` |

Hat jemand vorher den Finanz-Check gemacht, kommen dessen Antworten auch bei Leitfaden und Termin mit.

## Automationen im CRM

WhatsApp-Nachrichten, die du automatisch verschickst, laufen über die WhatsApp Business Platform deines
CRM. Vorlagen dafür muss Meta einmal freigeben.

### Leitfaden und Finanz-Check (`leitfaden-2027`, `finanz-check`)

**Wichtig beim Leitfaden:** Die Seite hat zwei getrennte Häkchen. Mit `consent_marketing = false` bekommt die Person nur den Leitfaden, sonst nichts. Tipps, Einladungen und WhatsApp-Werbung nur bei `consent_marketing = true` und erst nach der Bestätigung (Double-Opt-In).

**1. Sofort: Bestätigung (Double-Opt-In, Pflicht für E-Mail-Werbung)**

> Betreff: Bitte kurz bestätigen: dein Finanz-Leitfaden 2027
>
> Hi {vorname}, nur noch ein Klick: Bitte bestätige deine E-Mail-Adresse, dann schicke ich dir sofort den Leitfaden.
> [Ja, Leitfaden schicken]
> Du hast dich nicht eingetragen? Dann ignorier diese Mail einfach.

**2. Nach der Bestätigung: der Leitfaden**

> Betreff: Dein Finanz-Leitfaden 2027
>
> Hi {vorname}, schön, dass du da bist! Hier ist dein Finanz-Leitfaden 2027:
> 📄 PDF zum Nachlesen: {link-pdf}
> 🤟 Video in Gebärdensprache mit Untertiteln: {link-video}
>
> Mein Tipp: Fang mit Kapitel 1 an. Der Behinderten-Pauschbetrag ist für viele der schnellste Hebel, oft in zehn Minuten erledigt.
>
> Fragen? Antworte einfach auf diese Mail oder schreib mir per WhatsApp. Telefonieren musst du nicht.
>
> Wenn du magst, schauen wir gemeinsam auf deine Finanzen: 20 Minuten per Video-Call, in Gebärdensprache,
> Lautsprache oder per Chat. Kostenlos und unverbindlich: {url}/termin/
>
> Viele Grüße, Darian
>
> Allgemeine Informationen, keine individuelle Steuer- oder Finanzberatung. Abmelden: {abmeldelink}

Beim Finanz-Check kannst du mit `finanzcheck_ziel` verzweigen und das passende Kapitel nach vorn stellen.

**3. Zwei bis drei Tage später: Einladung zum Termin**

> Hi {vorname}, hast du schon in Kapitel 1 geschaut? Viele merken dabei, dass sie Jahr für Jahr Geld liegen lassen.
> Wenn du wissen willst, was bei dir drin ist: 20 Minuten per Video-Call, in deiner Sprache. {url}/termin/

### Terminanfrage (`termin-anfrage`)

**Termin gebucht: Bestätigung per WhatsApp** (Text und kurzes Video in DGS, 20 Sekunden)

> Hi {vorname}, dein Termin steht ✅
> {datum}, {uhrzeit} Uhr per Video-Call.
> Du entscheidest: Gebärdensprache, Lautsprache oder Chat.
> [Video: Darian begrüßt dich in DGS]

**Erinnerung, eine Stunde vorher**

> Erinnerung: Heute {uhrzeit} Uhr. Hier ist dein Link zum Video-Call: {link}

**Kein Termin nach 24 Stunden gebucht**

> Hi {vorname}, du wolltest dir eine ehrliche Einschätzung zu deinen Finanzen holen. Hat mit dem Kalender alles geklappt?
> Wenn du magst, schick ich dir zwei Terminvorschläge.

## Was wir messen

Nicht Likes, sondern was im Kalender ankommt:

| Kennzahl | Woher |
|---|---|
| Aufrufe | Werbeanzeigenmanager, Insights der Clips |
| Anfragen | CRM, Kontakte mit `tag` aus dieser Website |
| Termine (gebucht und erschienen) | Kalender bzw. CRM |
| Kunden | CRM |
| Kosten pro Termin | Werbekosten geteilt durch Termine, aufgeteilt nach `utm_campaign` |

Inhalte immer ohne Renditeversprechen: Investieren bietet Chancen, aber keine Garantie.

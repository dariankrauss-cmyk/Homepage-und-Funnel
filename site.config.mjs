/*
  Zentrale Einstellungen der Website von Darian Krauß.

  So funktioniert es:
  - Was hier leer ist (""), wird auf der Seite ausgeblendet, zum Beispiel der
    WhatsApp-Knopf, solange keine Nummer eingetragen ist.
  - Leere Pflichtangaben im Impressum und in der Datenschutzerklärung erscheinen
    als gelb markierter Platzhalter, und der Build listet sie dir auf.
  - Nach jeder Änderung baut Cloudflare die Seite beim nächsten Push neu.
*/
export default {
  // Adresse der Website, ohne Schrägstrich am Ende. Wenn du eine eigene Domain
  // verbindest (z. B. https://www.darian-krauss.de), trag sie hier ein.
  url: "https://homepage.darian-krauss.workers.dev",

  // Live-Modus. Solange false: Vorschau-Hinweis oben auf jeder Seite und
  // Suchmaschinen dürfen die Seite nicht aufnehmen (noindex).
  // Erst auf true stellen, wenn Impressum und Datenschutz vollständig sind.
  live: false,

  name: "Darian Krauß",
  untertitel: "Finanzberatung in Laut- und Gebärdensprache",

  kontakt: {
    email: "", // z. B. "hallo@darian-krauss.de"
    // Handynummer für WhatsApp, international ohne + und ohne Leerzeichen,
    // z. B. "4917612345678". Leer = keine WhatsApp-Knöpfe.
    whatsapp: "",
    whatsappText: "Hallo Darian, ich habe eine Frage zu meinen Finanzen.",
    telefon: "", // optional, erscheint nur im Impressum
  },

  // Dein Online-Kalender für die „ehrliche Einschätzung in 20 Minuten“
  // (z. B. Calendly, Cal.com oder der Kalender aus FinSuites).
  // Leer = nach der Anfrage meldest du dich selbst mit Terminvorschlägen.
  kalender: {
    url: "",
    anbieter: "", // z. B. "Calendly", erscheint im Hinweis vor dem Wechsel
    vorbefuellen: true, // Name und E-Mail an den Kalender-Link anhängen
  },

  social: {
    // Aus dem Anzeigen-Entwurf übernommen, bitte prüfen:
    instagram: "https://www.instagram.com/da.no.ka/",
    tiktok: "",
    youtube: "", // Kanal oder Podcast-Playlist
    spotify: "", // Podcast-Link
  },

  // Videos in Gebärdensprache. MP4-Dateien in src/static/videos/ ablegen
  // (höchstens 25 MB pro Datei) und hier den Pfad eintragen, z. B.
  // "/videos/vorstellung.mp4". Untertitel als WebVTT-Datei (.vtt).
  // Leer = an der Stelle steht „Video folgt in Kürze“.
  videos: {
    startseite: { src: "", poster: "", untertitel: "" },
    leitfaden: { src: "", poster: "", untertitel: "" },
    leitfadenDanke: { src: "", poster: "", untertitel: "" },
    termin: { src: "", poster: "", untertitel: "" },
    terminDanke: { src: "", poster: "", untertitel: "" },
  },

  // Foto von Darian: als src/static/img/darian.jpg ablegen. Solange die Datei
  // fehlt, zeigen Startseite und „Über mich“ den DK-Kreis.

  // Pflichtangaben für das Impressum. Werte bewusst leer: Sie werden nach der
  // rechtlichen Klärung eingetragen und erscheinen bis dahin als gelber Platzhalter.
  impressum: {
    name: "",
    anschrift: "", // Zeilenumbruch mit \n, z. B. "Musterstraße 1\n12345 Musterstadt"
    kontakt: "",
    berufsbezeichnung: "",
    registernummer: "", // Vermittlerregister
    ihk: "", // zuständige IHK
    status34d: "", // Status nach § 34d GewO
    ustId: "", // optional
    // Angaben zu Beteiligungen über 10 % an oder von Versicherungsunternehmen
    beteiligungen: "",
    berufshaftpflicht: "", // optional: Versicherer und Geltungsbereich
    weitereSchlichtung: "", // optional, z. B. Schlichtungsstelle für Finanzanlagen
  },

  // Dienstleister für die Datenschutzerklärung (Name und Anschrift).
  datenschutz: {
    crm: "", // z. B. FinSuites: Anbieter, Anschrift
    kalender: "", // Anbieter des Online-Kalenders, Anschrift
    videoCall: "", // z. B. Zoom, Microsoft Teams oder Google Meet: Anbieter, Anschrift
    aufsicht: "", // Datenschutz-Aufsichtsbehörde deines Bundeslandes
  },

  // Texte der Einwilligungen in den Formularen. Sie werden mit jeder Anfrage
  // an dein CRM übertragen, damit du die Einwilligung nachweisen kannst.
  einwilligung: {
    // Leitfaden-Seite: zwei getrennte Häkchen. "leitfaden" ist Pflicht,
    // "marketing" freiwillig (erscheint erst, wenn eine Handynummer eingetragen ist).
    // Hinter "leitfaden" setzt die Seite: „Es gilt die Datenschutzerklärung.“
    leitfaden: "Ich möchte den Leitfaden per E-Mail bekommen.",
    marketing:
      "Ihr dürft mir per E-Mail und WhatsApp Tipps und Einladungen zur Beratung schicken. Ich kann das jederzeit widerrufen.",
    finanzCheck:
      "Ich bin einverstanden, dass Darian Krauß mir Auswertung und Leitfaden schickt und mich per E-Mail und WhatsApp zu Finanzthemen informiert (Tipps und Einladungen zur Beratung). Ich kann diese Einwilligung jederzeit widerrufen, zum Beispiel über den Abmeldelink in jeder Mail.",
    termin:
      "Ich bin einverstanden, dass Darian Krauß meine Angaben nutzt, um mit mir einen Termin abzustimmen, und mich dazu per E-Mail und WhatsApp kontaktiert. Ich kann diese Einwilligung jederzeit widerrufen.",
  },
};

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
  url: "https://darian-krauss.misty-hat-6afe.workers.dev",

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

  // Porträtfoto, z. B. "/bilder/darian.jpg" (Datei in src/static/bilder/).
  // Leer = Platzhalter mit deinen Initialen.
  portrait: "",

  // Pflichtangaben für das Impressum (§ 5 DDG) und die Erstinformation
  // als Vermittler. Bitte vollständig ausfüllen und rechtlich prüfen lassen.
  impressum: {
    firma: "", // optional, z. B. Firmenname oder Marke
    strasse: "",
    ort: "", // PLZ und Ort
    ustId: "", // optional
    // Status und Erlaubnis, z. B. "Versicherungsmakler mit Erlaubnis nach
    // § 34d Abs. 1 GewO; Finanzanlagenvermittler mit Erlaubnis nach § 34f Abs. 1 GewO"
    erlaubnisse: "",
    registernummer: "", // Vermittlerregister, z. B. "D-XXXX-XXXXX-XX"
    ihk: "", // zuständige IHK mit Anschrift (Erlaubnis- und Aufsichtsbehörde)
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
    leitfaden:
      "Ich bin einverstanden, dass Darian Krauß mir den Leitfaden schickt und mich per E-Mail und WhatsApp zu Finanzthemen informiert (Tipps und Einladungen zur Beratung). Ich kann diese Einwilligung jederzeit widerrufen, zum Beispiel über den Abmeldelink in jeder Mail.",
    finanzCheck:
      "Ich bin einverstanden, dass Darian Krauß mir Auswertung und Leitfaden schickt und mich per E-Mail und WhatsApp zu Finanzthemen informiert (Tipps und Einladungen zur Beratung). Ich kann diese Einwilligung jederzeit widerrufen, zum Beispiel über den Abmeldelink in jeder Mail.",
    termin:
      "Ich bin einverstanden, dass Darian Krauß meine Angaben nutzt, um mit mir einen Termin abzustimmen, und mich dazu per E-Mail und WhatsApp kontaktiert. Ich kann diese Einwilligung jederzeit widerrufen.",
  },
};

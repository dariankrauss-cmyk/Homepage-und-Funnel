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
  // Unter dem Namen im Kopf und in der Fußzeile. Bewusst ohne Berufs- oder Erlaubnisangabe.
  untertitel: "Finanzwissen in Laut- und Gebärdensprache",

  kontakt: {
    email: "", // z. B. "hallo@darian-krauss.de"
    // Handynummer für WhatsApp, international ohne + und ohne Leerzeichen,
    // z. B. "4917612345678". Leer = keine WhatsApp-Knöpfe.
    whatsapp: "",
    whatsappText: "Hallo Darian, ich habe eine Frage zu meinen Finanzen.",
    telefon: "", // optional, erscheint nur im Impressum
  },

  // Dein Online-Kalender für das kostenlose Kennenlerngespräch (20 Minuten),
  // z. B. Calendly oder Cal.com.
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
  // Leer = an der Stelle erscheint nichts, auch keine Video-Vorschau.
  videos: {
    startseite: { src: "", poster: "", untertitel: "" },
    leitfaden: { src: "", poster: "", untertitel: "" },
    leitfadenDanke: { src: "", poster: "", untertitel: "" },
    termin: { src: "", poster: "", untertitel: "" },
    terminDanke: { src: "", poster: "", untertitel: "" },
  },

  // Foto von Darian: als src/static/img/darian.jpg ablegen. Solange die Datei
  // fehlt, zeigen Startseite und „Über mich“ den DK-Kreis.

  // Angaben zu einer Vermittlertätigkeit im Impressum: Berufsbezeichnung, Registernummer,
  // IHK, Status und Erstinformation. Nur einschalten, wenn diese Angaben rechtlich geprüft sind.
  // Solange false, erscheint dazu nichts auf der Website, auch kein Platzhalter.
  vermittler: false,

  // Pflichtangaben für das Impressum. Werte bewusst leer: Sie werden nach der
  // rechtlichen Klärung eingetragen und erscheinen bis dahin als gelber Platzhalter.
  // Die Felder ab „berufsbezeichnung“ erscheinen nur mit vermittler: true.
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
    crm: "", // Anbieter deines CRM: Name, Anschrift
    kalender: "", // Anbieter des Online-Kalenders, Anschrift
    videoCall: "", // z. B. Zoom, Microsoft Teams oder Google Meet: Anbieter, Anschrift
    aufsicht: "", // Datenschutz-Aufsichtsbehörde deines Bundeslandes
  },

  // Texte der Einwilligungen in den Formularen. Sie werden mit jeder Anfrage
  // an dein CRM übertragen, damit du die Einwilligung nachweisen kannst.
  einwilligung: {
    // Leitfaden und Finanz-Check: je zwei getrennte Häkchen, keins ist vorausgewählt.
    // "leitfaden" bzw. "finanzCheck" ist Pflicht, "marketing" freiwillig (erscheint erst,
    // wenn eine Handynummer eingetragen ist). Hinter das Pflicht-Häkchen setzt die Seite:
    // „Es gilt die Datenschutzerklärung.“
    leitfaden: "Ich möchte den Leitfaden per E-Mail bekommen.",
    // Nennt ausdrücklich den GdB: Er ist ein Gesundheitsdatum (Art. 9 DSGVO).
    finanzCheck:
      "Ich möchte meine Auswertung und den Leitfaden per E-Mail bekommen. Dafür darf Darian Krauß meine Antworten aus dem Finanz-Check nutzen. Das gilt auch für meine Angabe zum Grad der Behinderung (GdB). Ich kann das jederzeit widerrufen.",
    marketing:
      "Darian Krauß darf mir per E-Mail und WhatsApp Tipps zu Finanzthemen und Einladungen zu Gesprächen schicken. Ich kann das jederzeit widerrufen.",
    termin:
      "Ich bin einverstanden, dass Darian Krauß meine Angaben nutzt, um mit mir einen Termin abzustimmen, und mich dazu per E-Mail und WhatsApp kontaktiert. Ich kann diese Einwilligung jederzeit widerrufen.",
  },
};

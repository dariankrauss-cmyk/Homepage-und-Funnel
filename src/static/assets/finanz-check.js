/* Darian Krauß · Finanz-Check: fünf Fragen, ein Klick pro Frage.
   Die Antworten bleiben im Browser-Tab und werden nur mitgeschickt,
   wenn jemand danach das Formular absendet. */
(function () {
  "use strict";

  var FRAGEN = [
    { feld: "gdb", titel: "Hast du einen anerkannten Grad der Behinderung (GdB)?",
      hinweis: "Steht in deinem Schwerbehindertenausweis oder im Bescheid vom Versorgungsamt.",
      optionen: ["Nein", "Ja, GdB 20 bis 40", "Ja, GdB 50 bis 90", "Ja, GdB 100", "Weiß ich nicht genau"] },
    { feld: "pauschbetrag", titel: "Nutzt du den Behinderten-Pauschbetrag in deiner Steuererklärung?",
      hinweis: "Eine Auswahl genügt, du legst dich damit nicht fest.",
      optionen: ["Ja, schon eingetragen", "Nein", "Ich mache keine Steuererklärung", "Weiß ich nicht"] },
    { feld: "vorsorge", titel: "Wie sorgst du heute fürs Alter vor?",
      hinweis: "Wähl das, was am ehesten passt.",
      optionen: ["Nur gesetzliche Rente", "Betriebsrente über den Arbeitgeber", "Private Vorsorge oder Depot", "Noch gar nicht"] },
    { feld: "kredit", titel: "Nutzt du gerade Dispo oder Ratenkredit?",
      hinweis: "Hier geht es oft um mehr Geld, als man denkt.",
      optionen: ["Nein", "Ja, den Dispo", "Ja, einen Ratenkredit", "Beides"] },
    { feld: "ziel", titel: "Was willst du als Nächstes klären?",
      hinweis: "Darauf schneide ich deine Auswertung zu.",
      optionen: ["Steuern sparen", "Altersvorsorge aufbauen", "Geld anlegen", "Richtig abgesichert sein", "Schulden loswerden"] }
  ];

  /* Behinderten-Pauschbetrag nach § 33b Abs. 3 EStG */
  var PAUSCH = {
    "Ja, GdB 20 bis 40": "384 bis 860\u00a0€",
    "Ja, GdB 50 bis 90": "1.140 bis 2.460\u00a0€",
    "Ja, GdB 100": "2.840\u00a0€ (mit Merkzeichen H, Bl oder TBl sogar 7.400\u00a0€)"
  };

  var ZIELE = {
    "Steuern sparen": "Kapitel 1 und 2 im Leitfaden zeigen dir Schritt für Schritt, was du eintragen kannst.",
    "Altersvorsorge aufbauen": "Kapitel 3 erklärt die drei Säulen der Vorsorge ohne Fachchinesisch.",
    "Geld anlegen": "Kapitel 4 erklärt ETF mit Chancen, Risiken und Kosten. Investieren bietet Chancen, aber keine Garantie.",
    "Richtig abgesichert sein": "Kapitel 5 zeigt, welche Versicherungen du wirklich brauchst.",
    "Schulden loswerden": "Kapitel 6 zeigt die fünf teuersten Geldfehler und den Weg raus."
  };

  var box = document.getElementById("fragen");
  var balken = document.getElementById("balken");
  var ergebnis = document.getElementById("ergebnis");
  if (!box || !balken || !ergebnis) return;

  var antworten = {};
  var schritt = 0;
  var gesperrt = false;

  function el(tag, klasse, text) {
    var n = document.createElement(tag);
    if (klasse) n.className = klasse;
    if (text != null) n.textContent = text;
    return n;
  }

  function zeigeFrage(fokus) {
    var q = FRAGEN[schritt];
    /* Kurze Sperre, damit ein Doppeltipp nicht gleich die nächste Frage beantwortet */
    gesperrt = true;
    setTimeout(function () { gesperrt = false; }, 350);
    balken.style.width = (schritt / FRAGEN.length * 100) + "%";

    var wrap = el("div", "q");
    wrap.appendChild(el("p", "step-no", "Frage " + (schritt + 1) + " von " + FRAGEN.length));
    var h = el("h2", null, q.titel);
    h.tabIndex = -1;
    wrap.appendChild(h);
    wrap.appendChild(el("p", "hint", q.hinweis));
    var liste = el("div", "choices");
    q.optionen.forEach(function (o) {
      var b = el("button", "choice", o);
      b.type = "button";
      b.setAttribute("aria-pressed", String(antworten[q.feld] === o));
      b.addEventListener("click", function () {
        if (gesperrt) return;
        antworten[q.feld] = o;
        schritt++;
        if (schritt < FRAGEN.length) zeigeFrage(true); else zeigeErgebnis();
      });
      liste.appendChild(b);
    });
    wrap.appendChild(liste);
    if (schritt) {
      var zurueck = el("button", "back", "← Zurück");
      zurueck.type = "button";
      zurueck.addEventListener("click", function () { schritt--; zeigeFrage(true); });
      wrap.appendChild(zurueck);
    }
    box.textContent = "";
    box.appendChild(wrap);
    if (fokus) h.focus();
  }

  function zeigeErgebnis() {
    balken.style.width = "100%";
    box.textContent = "";
    var a = antworten;
    var punkte = [];

    if (PAUSCH[a.gdb] && a.pauschbetrag !== "Ja, schon eingetragen") {
      punkte.push({ hot: true, t: "Behinderten-Pauschbetrag",
        s: "Bei deinem GdB stehen dir " + PAUSCH[a.gdb] + " im Jahr als Pauschbetrag zu, das senkt dein zu versteuerndes Einkommen. " +
          ({ "Nein": "Trag ihn in deiner nächsten Steuererklärung ein, oft geht das auch für frühere Jahre.",
             "Ich mache keine Steuererklärung": "Ohne Steuererklärung geht er verloren, freiwillig abgeben lohnt sich oft auch rückwirkend.",
             "Weiß ich nicht": "Prüf in deinem letzten Steuerbescheid, ob er bei dir wirklich ankommt." })[a.pauschbetrag] });
    } else if (PAUSCH[a.gdb]) {
      punkte.push({ hot: false, t: "Behinderten-Pauschbetrag", s: "Den nutzt du schon. Im Leitfaden steht, welche Kosten du zusätzlich ansetzen kannst." });
    } else if (a.gdb === "Weiß ich nicht genau") {
      punkte.push({ hot: true, t: "GdB klären", s: "Ab einem GdB von 20 gibt es einen Pauschbetrag in der Steuer. Der Leitfaden zeigt, wo du deinen Bescheid findest und was er dir bringt." });
    }

    if (a.vorsorge === "Noch gar nicht" || a.vorsorge === "Nur gesetzliche Rente") {
      punkte.push({ hot: true, t: "Altersvorsorge", s: "Die gesetzliche Rente allein reicht bei den meisten nicht. Viele lassen dabei Zulagen vom Staat oder Zuschüsse vom Arbeitgeber liegen." });
    } else {
      punkte.push({ hot: false, t: "Altersvorsorge", s: "Du sorgst schon vor. Ein Blick auf Kosten und Förderung deiner Verträge lohnt sich trotzdem." });
    }

    if (a.kredit !== "Nein") {
      punkte.push({ hot: true, t: "Dispo und Kredit", s: a.kredit === "Ja, einen Ratenkredit"
        ? "Ein Blick auf Zins und Restlaufzeit lohnt sich: Manchmal ist Umschulden oder Sondertilgen günstiger, als nebenher anzulegen."
        : "Dispozinsen gehören zu den teuersten Zinsen überhaupt. Bevor du anlegst, kommt fast immer zuerst das Ablösen." });
    }

    punkte.push({ hot: false, t: "Dein Ziel: " + a.ziel, s: ZIELE[a.ziel] });

    var liste = document.getElementById("erg-liste");
    liste.textContent = "";
    punkte.forEach(function (p) {
      var li = el("li", p.hot ? "hot" : "");
      li.appendChild(el("span", "tag", p.hot ? "Potenzial" : "Im Blick"));
      li.appendChild(el("b", null, p.t));
      li.appendChild(el("span", null, p.s));
      liste.appendChild(li);
    });
    try { sessionStorage.setItem("finanzcheck", JSON.stringify(antworten)); } catch (e) { /* privates Fenster */ }
    ergebnis.classList.remove("hidden");
    document.getElementById("erg-titel").focus();
  }

  document.getElementById("neu").addEventListener("click", function () {
    antworten = {};
    schritt = 0;
    try { sessionStorage.removeItem("finanzcheck"); } catch (e) { /* egal */ }
    ergebnis.classList.add("hidden");
    zeigeFrage(true);
  });

  zeigeFrage(false);
})();

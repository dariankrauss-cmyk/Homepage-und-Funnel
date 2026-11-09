/* Darian Krauß · Website-Skript
   Menü auf dem Handy, Videos mit Untertiteln, Formulare an /api/lead,
   persönliche Ansprache auf den Danke-Seiten, feine Einblend-Animation und
   Termin-Leiste auf dem Handy (Startseite). Keine Cookies, kein Tracking. */
(function () {
  "use strict";

  var START = Date.now();
  var MAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var UTM = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid", "gclid"];

  /* Sitzungsspeicher: gilt nur für diesen Tab und wird beim Schließen gelöscht */
  function lesen(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
  function merken(k, v) { try { sessionStorage.setItem(k, v); } catch (e) { /* privates Fenster */ } }
  function vergessen(k) { try { sessionStorage.removeItem(k); } catch (e) { /* egal */ } }

  /* 1. Menü auf kleinen Bildschirmen */
  var menuBtn = document.querySelector(".menu-btn");
  var nav = document.getElementById("hauptnavigation");
  if (menuBtn && nav) {
    var menu = function (offen) {
      menuBtn.setAttribute("aria-expanded", String(offen));
      nav.classList.toggle("open", offen);
    };
    menuBtn.addEventListener("click", function () { menu(menuBtn.getAttribute("aria-expanded") !== "true"); });
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) menu(false); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("open")) { menu(false); menuBtn.focus(); }
    });
  }

  /* 2. Videos: starten stumm mit Untertiteln, „Ton an“ schaltet den Ton zu.
     Den Video-Kasten gibt es nur, wenn in site.config.mjs ein Video eingetragen ist. */
  document.querySelectorAll(".video").forEach(function (box) {
    var src = box.getAttribute("data-src");
    if (!src) return;
    var ruhig = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var v = document.createElement("video");
    v.src = src;
    v.muted = true; v.setAttribute("muted", "");
    v.loop = true; v.playsInline = true; v.setAttribute("playsinline", "");
    v.controls = true; v.preload = "metadata";
    v.autoplay = !ruhig;
    if (box.getAttribute("data-poster")) v.poster = box.getAttribute("data-poster");
    v.setAttribute("aria-label", box.getAttribute("data-label") || "Video");
    var vtt = box.getAttribute("data-untertitel");
    if (vtt) {
      var spur = document.createElement("track");
      spur.kind = "captions"; spur.srclang = "de"; spur.label = "Deutsch"; spur.src = vtt; spur.default = true;
      v.appendChild(spur);
    }
    box.insertBefore(v, box.firstChild);
    var ton = box.querySelector(".ton");
    if (ton) {
      ton.hidden = false;
      ton.addEventListener("click", function () {
        v.muted = !v.muted;
        if (!v.muted) v.currentTime = 0;
        var p = v.play();
        if (p && p.catch) p.catch(function () {});
        ton.textContent = v.muted ? "Ton an" : "Ton aus";
      });
    }
  });

  /* 3. Danke-Seiten: Vorname einsetzen und Kalender-Link vorbefüllen */
  var vorname = lesen("vorname");
  var quelle = lesen("quelle");
  if (vorname) {
    document.querySelectorAll("[data-vorname]").forEach(function (el) {
      var vorlage = (quelle && el.getAttribute("data-vorname-" + quelle)) || el.getAttribute("data-vorname");
      el.textContent = vorlage.replace("{vorname}", vorname);
    });
  }
  document.querySelectorAll("a[data-kalender][data-vorbefuellen]").forEach(function (a) {
    try {
      var u = new URL(a.href);
      if (vorname) u.searchParams.set("name", vorname);
      if (lesen("email")) u.searchParams.set("email", lesen("email"));
      a.href = u.toString();
    } catch (e) { /* Link bleibt, wie er ist */ }
  });

  /* 4. Formulare (Leitfaden, Finanz-Check, Termin) */
  function beschreiben(el, box, an) {
    var msg = box && box.querySelector(".msg");
    /* Fehlertext nur im Fehlerfall verknüpfen, sonst liest der Screenreader ihn immer mit */
    if (msg && msg.id && an) el.setAttribute("aria-describedby", msg.id);
    else el.removeAttribute("aria-describedby");
  }

  function setFehler(feld, an) {
    var gruppe = feld.closest(".choice-group");
    if (gruppe) {
      gruppe.classList.toggle("bad", an);
      gruppe.querySelectorAll("input").forEach(function (i) {
        if (an) i.setAttribute("aria-invalid", "true"); else i.removeAttribute("aria-invalid");
        beschreiben(i, gruppe, an);
      });
      return;
    }
    var box = feld.closest(".field, .consent");
    if (box) box.classList.toggle("bad", an);
    if (feld.classList.contains("inp")) feld.classList.toggle("err", an);
    if (an) feld.setAttribute("aria-invalid", "true"); else feld.removeAttribute("aria-invalid");
    beschreiben(feld, box, an);
  }

  function kampagne() {
    var p = new URLSearchParams(location.search), o = {}, da = false;
    UTM.forEach(function (k) { var v = p.get(k); if (v) { o[k] = v.slice(0, 200); da = true; } });
    return da ? o : undefined;
  }

  document.querySelectorAll("form.lead-form").forEach(function (form) {
    var status = form.querySelector(".form-status");
    var knopf = form.querySelector("button[type=submit]");
    var f = form.elements;

    function freigeben() {
      knopf.disabled = false;
      if (knopf.getAttribute("data-text")) knopf.textContent = knopf.getAttribute("data-text");
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (knopf.disabled) return;
      var fehler = [];
      var pruefe = function (feld, ok) { setFehler(feld, !ok); if (!ok) fehler.push(feld); };

      form.querySelectorAll(".choice-group[data-pflicht]").forEach(function (gruppe) {
        pruefe(gruppe.querySelector("input"), !!gruppe.querySelector("input:checked"));
      });
      pruefe(f.vorname, !!f.vorname.value.trim());
      pruefe(f.email, MAIL.test(f.email.value.trim()));
      /* Handynummer: Pflicht nur mit required (Leitfaden: freiwillig). Wenn sie dasteht, muss sie stimmen. */
      var ziffern = f.phone.value.replace(/\D/g, "");
      var telLeer = !f.phone.value.trim();
      pruefe(f.phone, (telLeer && !f.phone.required) || (ziffern.length >= 7 && ziffern.length <= 15));
      /* Pflicht-Häkchen haben required, freiwillige nicht */
      form.querySelectorAll(".consent input[type=checkbox][required]").forEach(function (c) { pruefe(c, c.checked); });
      if (fehler.length) { fehler[0].focus(); return; }

      var daten = {
        quelle: form.getAttribute("data-quelle"),
        vorname: f.vorname.value.trim(),
        email: f.email.value.trim(),
        phone: f.phone.value.trim(),
        hinweisfeld: f.hinweisfeld ? f.hinweisfeld.value : "",
        seite: location.pathname,
        t: Date.now() - START
      };
      /* Jedes Häkchen getrennt senden: einwilligung bzw. consent_leitfaden und consent_marketing */
      form.querySelectorAll(".consent input[type=checkbox]").forEach(function (c) { daten[c.name] = c.checked; });
      var themen = [].map.call(form.querySelectorAll('input[name="thema"]:checked'), function (i) { return i.value; });
      if (themen.length) daten.thema = themen;
      var sprache = form.querySelector('input[name="sprache"]:checked');
      if (sprache) daten.sprache = sprache.value;
      /* Antworten aus dem Finanz-Check nur mit dem Finanz-Check-Formular (Variante A),
         nie mit dem Leitfaden- oder Terminformular */
      if (daten.quelle === "finanz-check") {
        var check = lesen("finanzcheck");
        if (check) { try { daten.finanzcheck = JSON.parse(check); } catch (err) { /* ignorieren */ } }
      }
      var utm = kampagne();
      if (utm) daten.utm = utm;

      var weiter = function () {
        merken("vorname", daten.vorname);
        merken("email", daten.email);
        merken("quelle", daten.quelle);
        /* Abgeschickt: Die Antworten werden im Browser nicht mehr gebraucht */
        if (daten.quelle === "finanz-check") vergessen("finanzcheck");
        location.href = form.getAttribute("data-danke");
      };

      /* Honigtopf gefüllt oder in unter 2 Sekunden abgeschickt: still verwerfen */
      if (daten.hinweisfeld || daten.t < 2000) { weiter(); return; }

      if (status) status.hidden = true;
      knopf.setAttribute("data-text", knopf.textContent);
      knopf.disabled = true;
      knopf.textContent = "Wird gesendet …";

      fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(daten)
      })
        .then(function (r) {
          return r.json().catch(function () { return {}; }).then(function (j) {
            if (r.ok && j.ok) { weiter(); return; }
            var felder = (j.felder || []).map(function (n) { return f[n] && (f[n].length && !f[n].tagName ? f[n][0] : f[n]); }).filter(Boolean);
            if (!felder.length) throw new Error("Senden fehlgeschlagen");
            freigeben();
            felder.forEach(function (feld) { setFehler(feld, true); });
            felder[0].focus();
          });
        })
        .catch(function () {
          freigeben();
          if (status) status.hidden = false;
        });
    });

    /* Fehler beim Tippen oder Auswählen wieder wegnehmen */
    var zuruecksetzen = function (e) { if (e.target.name) setFehler(e.target, false); };
    form.addEventListener("input", zuruecksetzen);
    form.addEventListener("change", zuruecksetzen);

    /* Bereiche, die erst erscheinen, wenn ein Feld ausgefüllt ist (data-braucht="phone").
       Verschwindet die Nummer wieder, wird das Häkchen darin zurückgesetzt. */
    form.querySelectorAll("[data-braucht]").forEach(function (box) {
      var feld = f[box.getAttribute("data-braucht")];
      if (!feld) return;
      var zeigen = function () {
        var an = feld.value.trim() !== "";
        box.hidden = !an;
        if (!an) box.querySelectorAll("input[type=checkbox]").forEach(function (c) { c.checked = false; });
      };
      feld.addEventListener("input", zeigen);
      feld.addEventListener("change", zeigen);
      window.addEventListener("pageshow", zeigen);
      zeigen();
    });
  });

  /* 5. Fotos: Fehlt die Datei, wird das Bild ausgeblendet und der DK-Kreis darunter bleibt sichtbar.
     (onerror direkt im HTML würde die Content-Security-Policy blockieren.) */
  document.querySelectorAll("img[data-fallback]").forEach(function (img) {
    var fehlt = function () { img.classList.add("fehlt"); };
    if (img.complete && img.naturalWidth === 0) fehlt();
    else img.addEventListener("error", fehlt);
  });

  /* 6. Feine Einblend-Animation: nur für Elemente unterhalb des ersten Bildschirms und nur,
     wenn das Gerät keine reduzierte Bewegung wünscht. Ohne JavaScript ist alles sofort sichtbar. */
  var ruhigeBewegung = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!ruhigeBewegung && "IntersectionObserver" in window) {
    var einblenden = new IntersectionObserver(function (eintraege) {
      eintraege.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("sichtbar");
        einblenden.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.08 });
    document.querySelectorAll("[data-reveal]").forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight) return; /* schon zu sehen: nichts verstecken */
      el.classList.add("reveal");
      einblenden.observe(el);
    });
  }

  /* 7. Handy: Termin-Leiste am unteren Rand. Sie erscheint, sobald die Knöpfe im Hero nach oben
     aus dem Bild gescrollt sind, und verschwindet beim Kontakt-Abschnitt und in der Fußzeile. */
  var leiste = document.querySelector("[data-mobil-cta]");
  var heroKnoepfe = document.querySelector(".start-hero .cta-row");
  if (leiste && heroKnoepfe && "IntersectionObserver" in window) {
    var heroVorbei = false;
    var endeSichtbar = {};
    var leisteZeigen = function () {
      var amEnde = Object.keys(endeSichtbar).some(function (k) { return endeSichtbar[k]; });
      var an = heroVorbei && !amEnde;
      leiste.classList.toggle("an", an);
      document.documentElement.classList.toggle("mit-leiste", an);
    };
    new IntersectionObserver(function (eintraege) {
      var e = eintraege[eintraege.length - 1];
      heroVorbei = !e.isIntersecting && e.boundingClientRect.top < 0;
      leisteZeigen();
    }).observe(heroKnoepfe);
    var endeBeobachter = new IntersectionObserver(function (eintraege) {
      eintraege.forEach(function (e) { endeSichtbar[e.target.id || e.target.className] = e.isIntersecting; });
      leisteZeigen();
    });
    document.querySelectorAll("#kontakt, footer").forEach(function (el) { endeBeobachter.observe(el); });
  }

  /* 8. Terminformular: Thema aus dem Link vorauswählen, z. B. /termin/?thema=Vorsorge
     (die Themen-Karten der Startseite verlinken so) */
  var themaAusLink = new URLSearchParams(location.search).get("thema");
  if (themaAusLink) {
    document.querySelectorAll('form.lead-form input[name="thema"]').forEach(function (i) {
      if (i.value === themaAusLink) i.checked = true;
    });
  }

  /* Zurück-Knopf des Browsers holt die Seite aus dem Cache: Absende-Knopf wieder freigeben */
  window.addEventListener("pageshow", function (e) {
    if (!e.persisted) return;
    document.querySelectorAll("form.lead-form button[type=submit][data-text]").forEach(function (k) {
      k.disabled = false;
      k.textContent = k.getAttribute("data-text");
    });
  });
})();

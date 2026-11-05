/* Darian Krauß · Website-Skript
   Menü auf dem Handy, Videos mit Untertiteln, Formulare an /api/lead und
   persönliche Ansprache auf den Danke-Seiten. Keine Cookies, kein Tracking. */
(function () {
  "use strict";

  var START = Date.now();
  var MAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var UTM = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid", "gclid"];

  /* Sitzungsspeicher: gilt nur für diesen Tab und wird beim Schließen gelöscht */
  function lesen(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
  function merken(k, v) { try { sessionStorage.setItem(k, v); } catch (e) { /* privates Fenster */ } }

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
     Ohne data-src bleibt der Platzhalter stehen. */
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
    var ph = box.querySelector(".ph");
    if (ph) ph.remove();
    var ton = box.querySelector(".ton");
    if (ton) {
      ton.hidden = false;
      ton.addEventListener("click", function () {
        v.muted = !v.muted;
        if (!v.muted) v.currentTime = 0;
        var p = v.play();
        if (p && p.catch) p.catch(function () {});
        ton.textContent = v.muted ? "🔈 Ton an" : "🔇 Ton aus";
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
      var ziffern = f.phone.value.replace(/\D/g, "");
      pruefe(f.phone, ziffern.length >= 7 && ziffern.length <= 15);
      pruefe(f.einwilligung, f.einwilligung.checked);
      if (fehler.length) { fehler[0].focus(); return; }

      var daten = {
        quelle: form.getAttribute("data-quelle"),
        vorname: f.vorname.value.trim(),
        email: f.email.value.trim(),
        phone: f.phone.value.trim(),
        einwilligung: true,
        hinweisfeld: f.hinweisfeld ? f.hinweisfeld.value : "",
        seite: location.pathname,
        t: Date.now() - START
      };
      var themen = [].map.call(form.querySelectorAll('input[name="thema"]:checked'), function (i) { return i.value; });
      if (themen.length) daten.thema = themen;
      var sprache = form.querySelector('input[name="sprache"]:checked');
      if (sprache) daten.sprache = sprache.value;
      /* Antworten aus dem Finanz-Check mitschicken */
      var check = lesen("finanzcheck");
      if (check) { try { daten.finanzcheck = JSON.parse(check); } catch (err) { /* ignorieren */ } }
      var utm = kampagne();
      if (utm) daten.utm = utm;

      var weiter = function () {
        merken("vorname", daten.vorname);
        merken("email", daten.email);
        merken("quelle", daten.quelle);
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
  });

  /* Zurück-Knopf des Browsers holt die Seite aus dem Cache: Absende-Knopf wieder freigeben */
  window.addEventListener("pageshow", function (e) {
    if (!e.persisted) return;
    document.querySelectorAll("form.lead-form button[type=submit][data-text]").forEach(function (k) {
      k.disabled = false;
      k.textContent = k.getAttribute("data-text");
    });
  });
})();

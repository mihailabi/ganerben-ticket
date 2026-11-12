(function () {
  "use strict";

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  // Jahr im Footer
  var y = $("#year");
  if (y) y.textContent = new Date().getFullYear();

  // ---------- Einblenden beim Scrollen ----------
  var reveals = $$(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  // ---------- aktiver Menüpunkt ----------
  var navLinks = $$('.nav a[href^="#"]');
  if (navLinks.length && "IntersectionObserver" in window) {
    var map = {};
    navLinks.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var a = map[e.target.id];
        if (!a) return;
        if (e.isIntersecting) {
          navLinks.forEach(function (l) { l.classList.remove("is-active"); });
          a.classList.add("is-active");
        } else if (a.classList.contains("is-active") && e.boundingClientRect.top > 0) {
          a.classList.remove("is-active");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(map).forEach(function (id) { var s = document.getElementById(id); if (s) spy.observe(s); });
  }

  // ---------- Events: vergangene ausblenden, nächstes markieren ----------
  var list = $("#event-list");
  if (list) {
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var upcoming = $$(".event", list).filter(function (ev) {
      var d = new Date(ev.getAttribute("data-date") + "T00:00:00");
      if (d < today) { ev.classList.add("is-past"); return false; }
      return true;
    });
    upcoming.sort(function (a, b) { return a.getAttribute("data-date") < b.getAttribute("data-date") ? -1 : 1; });
    upcoming.forEach(function (ev) { list.appendChild(ev); });
    if (upcoming.length) {
      var first = upcoming[0];
      first.classList.add("is-next");
      var meta = $(".meta", first);
      if (meta) {
        var t = document.createElement("span");
        t.className = "tag hot";
        var days = Math.round((new Date(first.getAttribute("data-date") + "T00:00:00") - today) / 864e5);
        t.textContent = days === 0 ? "Heute!" : days === 1 ? "Morgen" : "Nächstes Event";
        meta.insertBefore(t, meta.firstChild);
      }
    } else {
      var empty = $("#events-empty");
      if (empty) empty.hidden = false;
    }
  }

  // ---------- Team-Slider ----------
  var track = $("#team-track");
  if (track) {
    var dotsWrap = $("#team-dots");
    var cards = $$(".member", track);
    var perView = function () {
      var w = cards[0].getBoundingClientRect().width;
      return Math.max(1, Math.round(track.clientWidth / (w + 20)));
    };
    var pages = function () { return Math.max(1, Math.ceil(cards.length / perView())); };
    var buildDots = function () {
      dotsWrap.innerHTML = "";
      for (var i = 0; i < pages(); i++) {
        var b = document.createElement("button");
        b.type = "button";
        b.setAttribute("aria-label", "Seite " + (i + 1));
        (function (i) { b.addEventListener("click", function () { goTo(i); }); })(i);
        dotsWrap.appendChild(b);
      }
      updateDots();
    };
    var current = function () {
      var max = track.scrollWidth - track.clientWidth;
      if (max <= 0) return 0;
      return Math.round((track.scrollLeft / max) * (pages() - 1));
    };
    var updateDots = function () {
      var c = current();
      $$("button", dotsWrap).forEach(function (d, i) { d.classList.toggle("on", i === c); });
    };
    var goTo = function (i) {
      var n = pages();
      i = (i + n) % n;
      var max = track.scrollWidth - track.clientWidth;
      track.scrollTo({ left: n > 1 ? (max * i) / (n - 1) : 0, behavior: "smooth" });
    };
    $(".team-btn.prev").addEventListener("click", function () { goTo(current() - 1); });
    $(".team-btn.next").addEventListener("click", function () { goTo(current() + 1); });
    var raf;
    track.addEventListener("scroll", function () { cancelAnimationFrame(raf); raf = requestAnimationFrame(updateDots); }, { passive: true });
    var rt;
    window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(buildDots, 150); });
    buildDots();
  }

  // ---------- Lightbox ----------
  var lb = $("#lightbox");
  if (lb) {
    var lbImg = $("img", lb), lbCount = $(".lb-count", lb);
    var set = [], idx = 0, title = "", lastFocus = null;
    var show = function () {
      var img = set[idx];
      lbImg.src = img.currentSrc || img.src;
      lbImg.alt = img.alt;
      lbCount.textContent = title + " · " + (idx + 1) + " / " + set.length;
    };
    var open = function (gallery, i) {
      set = $$("img", gallery); idx = i; title = gallery.getAttribute("data-gallery") || "";
      lastFocus = document.activeElement;
      show();
      lb.classList.add("open");
      document.body.style.overflow = "hidden";
      $(".lb-close", lb).focus();
    };
    var close = function () {
      lb.classList.remove("open");
      document.body.style.overflow = "";
      if (lastFocus) lastFocus.focus();
    };
    var step = function (d) { idx = (idx + d + set.length) % set.length; show(); };

    $$(".gallery").forEach(function (g) {
      $$("button", g).forEach(function (b, i) { b.addEventListener("click", function () { open(g, i); }); });
    });
    $(".lb-close", lb).addEventListener("click", close);
    $(".lb-prev", lb).addEventListener("click", function () { step(-1); });
    $(".lb-next", lb).addEventListener("click", function () { step(1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") step(-1);
      else if (e.key === "ArrowRight") step(1);
    });
    var sx = null;
    lb.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener("touchend", function (e) {
      if (sx === null) return;
      var dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
      sx = null;
    });
  }

  // ---------- Kontaktformular (öffnet das E-Mail-Programm) ----------
  var form = $("#contact-form");
  if (form) {
    var emailOk = function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); };
    var check = function (input) {
      var field = input.closest(".field");
      var err = $(".err", field);
      var ok;
      if (input.type === "checkbox") ok = input.checked;
      else if (input.type === "email") {
        var v = input.value.trim();
        ok = v !== "" && emailOk(v);
        if (err && err.dataset.empty) err.textContent = v === "" ? err.dataset.empty : err.dataset.bad;
      } else ok = input.value.trim() !== "";
      field.classList.toggle("invalid", !ok);
      return ok;
    };
    var required = $$("[required]", form);
    required.forEach(function (i) {
      i.addEventListener(i.type === "checkbox" ? "change" : "blur", function () { check(i); });
      i.addEventListener("input", function () { if (i.closest(".field").classList.contains("invalid")) check(i); });
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var allOk = required.map(check).every(Boolean);
      if (!allOk) {
        var bad = $(".field.invalid input, .field.invalid textarea", form);
        if (bad) bad.focus();
        return;
      }
      var to = form.topic.value;
      var subject = (to.indexOf("booking") === 0 ? "Booking-Anfrage" : "Anfrage über die Website") + " – " + form.name.value.trim();
      var body = form.message.value.trim() + "\n\n—\n" + form.name.value.trim() + "\n" + form.email.value.trim();
      window.location.href = "mailto:" + to + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
      $("#form-ok").classList.add("show");
    });
  }

  // ---------- Google Maps erst nach Klick laden ----------
  var mapBtn = $("#map-load");
  if (mapBtn) {
    mapBtn.addEventListener("click", function () {
      var box = $("#map-box");
      var f = document.createElement("iframe");
      f.title = "Karte: Bahnhofstraße 1, 74653 Künzelsau";
      f.loading = "lazy";
      f.referrerPolicy = "no-referrer-when-downgrade";
      f.src = "https://maps.google.com/maps?q=Bahnhofstra%C3%9Fe%201%2C%2074653%20K%C3%BCnzelsau&z=16&output=embed";
      box.innerHTML = "";
      box.appendChild(f);
    });
  }
})();

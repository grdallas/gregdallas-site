/* Greg Dallas — site behavior. No dependencies. */
(function () {
  "use strict";

  /* ---------- mobile nav ---------- */

  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("nav");

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.getAttribute("data-open") === "true";
      nav.setAttribute("data-open", String(!open));
      toggle.setAttribute("aria-expanded", String(!open));
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.getAttribute("data-open") === "true") {
        nav.setAttribute("data-open", "false");
        toggle.setAttribute("aria-expanded", "false");
        toggle.focus();
      }
    });
  }

  /* ---------- video facades ----------
     Thumbnails stand in for the players so the page doesn't load five
     YouTube iframes up front. Clicking one swaps in the real embed. */

  /* YouTube serves a 120px grey placeholder (with a 200, not a 404) when a
     video has no maxresdefault, so size is the only reliable tell. */
  document.querySelectorAll(".video-frame img").forEach(function (img) {
    var downgrade = function () {
      if (img.naturalWidth && img.naturalWidth > 200) return;
      var id = img.closest(".video-frame").getAttribute("data-video");
      if (!id || img.dataset.fallback) return;
      img.dataset.fallback = "1";
      img.src = "https://i.ytimg.com/vi/" + id + "/hqdefault.jpg";
    };
    if (img.complete) downgrade();
    else img.addEventListener("load", downgrade, { once: true });
  });

  document.querySelectorAll(".video-frame").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var id = btn.getAttribute("data-video");
      if (!id) return;
      var frame = document.createElement("iframe");
      frame.src =
        "https://www.youtube-nocookie.com/embed/" + id +
        "?autoplay=1&rel=0" + (btn.dataset.start ? "&start=" + btn.dataset.start : "");
      frame.title = btn.getAttribute("aria-label") || "Video player";
      frame.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      frame.allowFullscreen = true;
      btn.replaceChildren(frame);
      btn.style.cursor = "default";
    }, { once: true });
  });

  /* ---------- performances ---------- */

  var list = document.getElementById("events");

  if (list) {
    var events = (window.EVENTS || []).filter(function (e) { return e && e.date; });

    // Compare against local midnight so a show still reads as "upcoming"
    // for the whole of its own day.
    var today = new Date();
    today.setHours(0, 0, 0, 0);

    var parse = function (iso) {
      var p = String(iso).split("-");
      return new Date(+p[0], +p[1] - 1, +p[2]);
    };

    var upcoming = [], past = [];
    events.forEach(function (e) {
      (parse(e.date) >= today ? upcoming : past).push(e);
    });

    upcoming.sort(function (a, b) { return parse(a.date) - parse(b.date); });
    past.sort(function (a, b) { return parse(b.date) - parse(a.date); });

    var fmt = function (iso) {
      return parse(iso).toLocaleDateString("en-US", {
        weekday: "short", month: "short", day: "numeric", year: "numeric"
      });
    };

    var el = function (tag, cls, text) {
      var n = document.createElement(tag);
      if (cls) n.className = cls;
      if (text != null) n.textContent = text;
      return n;
    };

    var row = function (e, isPast) {
      var wrap = el("article", "event" + (isPast ? " is-past" : ""));

      var date = el("div", "event-date");
      date.append(el("span", "event-day", fmt(e.date)));
      if (e.time) date.append(el("span", "event-time", e.time));

      var body = el("div");
      body.append(el("h3", "event-title", e.title || "Performance"));
      var meta = [e.venue, e.city].filter(Boolean).join(" — ");
      if (meta) body.append(el("div", "event-meta", meta));
      if (e.note) body.append(el("div", "event-meta", e.note));

      wrap.append(date, body);

      if (e.link && !isPast) {
        var a = el("a", "event-link", "Tickets →");
        a.href = e.link;
        a.rel = "noopener";
        a.target = "_blank";
        wrap.append(a);
      }
      return wrap;
    };

    var group = function (heading, items, isPast) {
      if (!items.length) return null;
      var sec = el("section", "event-group");
      sec.append(el("h2", null, heading));
      items.forEach(function (e) { sec.append(row(e, isPast)); });
      return sec;
    };

    if (!upcoming.length && !past.length) {
      var empty = el("div", "empty-state");
      empty.append(el("p", null, "No dates on the calendar right now. New shows are announced here first."));
      var a = el("a", "btn", "Get in touch about booking");
      a.href = "/contact.html";
      empty.append(a);
      list.replaceChildren(empty);
    } else {
      var out = [
        group("Upcoming", upcoming, false),
        group("Past", past, true)
      ].filter(Boolean);

      if (!upcoming.length) {
        var none = el("section", "event-group");
        none.append(el("h2", null, "Upcoming"));
        var box = el("div", "empty-state");
        box.append(el("p", null, "No dates on the calendar right now. New shows are announced here first."));
        none.append(box);
        out.unshift(none);
      }
      list.replaceChildren.apply(list, out);
    }
  }

  /* ---------- contact form ---------- */

  var form = document.getElementById("contact-form");

  if (form) {
    var status = document.getElementById("form-status");
    var submit = form.querySelector("button[type=submit]");

    var say = function (state, msg) {
      status.setAttribute("data-state", state);
      status.textContent = msg;
    };

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      // Honeypot: real people leave this hidden field alone.
      if (form.querySelector("[name=company]").value) return;

      submit.disabled = true;
      say("busy", "Sending…");

      fetch(form.action, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form)))
      })
        .then(function (r) {
          if (!r.ok) throw new Error("HTTP " + r.status);
          form.reset();
          say("ok", "Thanks — your message is on its way. I'll get back to you soon.");
        })
        .catch(function () {
          say("err", "Something went wrong sending that. Please email greg directly at hello@gregdallas.com.");
        })
        .finally(function () { submit.disabled = false; });
    });
  }
})();

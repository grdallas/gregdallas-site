/* Art gallery lightbox. No dependencies. */
(function () {
  "use strict";

  var WORKS = [
  {
    "slug": "01-img-1736",
    "title": ""
  },
  {
    "slug": "02-img-1282",
    "title": ""
  },
  {
    "slug": "03-img-1737",
    "title": ""
  },
  {
    "slug": "04-for-julian-commission",
    "title": "\"For Julian\" (commission)"
  },
  {
    "slug": "05-a-shifting-design-commission",
    "title": "\"A Shifting Design\" (commission)"
  },
  {
    "slug": "06-img-1632",
    "title": ""
  },
  {
    "slug": "07-pathways",
    "title": "\"Pathways\""
  },
  {
    "slug": "08-tides-of-change-commission",
    "title": "\"Tides of Change\" (commission)"
  },
  {
    "slug": "09-img-1745-2",
    "title": ""
  },
  {
    "slug": "10-cascade-commission",
    "title": "\"Cascade\" (commission)"
  },
  {
    "slug": "11-img-1398",
    "title": ""
  },
  {
    "slug": "12-shine-through-commission",
    "title": "\"Shine Through\" (commission)"
  },
  {
    "slug": "13-melting",
    "title": "\"Melting\""
  },
  {
    "slug": "14-img-1898",
    "title": ""
  },
  {
    "slug": "15-precious-time-commission",
    "title": "\"Precious Time\" (commission)"
  },
  {
    "slug": "16-blue-vision",
    "title": "\"Blue Vision\""
  },
  {
    "slug": "17-wine-dark-sea-commission",
    "title": "\"Wine Dark Sea\" (commission)"
  },
  {
    "slug": "18-the-world-is-burning",
    "title": "\"The World Is Burning\""
  },
  {
    "slug": "19-for-nich-album-art-commission",
    "title": "\"For Nich\" (album art commission)"
  },
  {
    "slug": "20-untitled-work",
    "title": "Untitled Work"
  },
  {
    "slug": "21-untitled-work",
    "title": "Untitled Work"
  },
  {
    "slug": "22-untitled-work",
    "title": "Untitled Work"
  },
  {
    "slug": "23-zarathustra",
    "title": "\"Zarathustra\""
  },
  {
    "slug": "24-img-1184-1",
    "title": ""
  },
  {
    "slug": "25-img-1669",
    "title": ""
  }
];

  var box = document.getElementById("lightbox");
  if (!box) return;

  var img = document.getElementById("lb-img");
  var cap = document.getElementById("lb-cap");
  var prev = box.querySelector(".lb-prev");
  var next = box.querySelector(".lb-next");
  var close = box.querySelector(".lb-close");
  var current = 0;
  var lastFocused = null;

  function show(i) {
    current = (i + WORKS.length) % WORKS.length;
    var w = WORKS[current];
    // full/ holds the untouched originals — no second encode.
    img.src = "assets/art/full/" + w.slug + ".webp";
    img.alt = w.title || "Untitled painting by Greg Dallas";
    cap.textContent = w.title || "";
    cap.hidden = !w.title;
  }

  function open(i) {
    lastFocused = document.activeElement;
    show(i);
    box.hidden = false;
    document.body.style.overflow = "hidden";
    close.focus();
  }

  function shut() {
    box.hidden = true;
    document.body.style.overflow = "";
    img.src = "";
    if (lastFocused) lastFocused.focus();
  }

  document.querySelectorAll(".work-open").forEach(function (btn) {
    btn.addEventListener("click", function () { open(+btn.dataset.i); });
  });

  close.addEventListener("click", shut);
  prev.addEventListener("click", function () { show(current - 1); });
  next.addEventListener("click", function () { show(current + 1); });

  box.addEventListener("click", function (e) {
    if (e.target === box || e.target.classList.contains("lb-stage")) shut();
  });

  document.addEventListener("keydown", function (e) {
    if (box.hidden) return;
    if (e.key === "Escape") shut();
    else if (e.key === "ArrowLeft") show(current - 1);
    else if (e.key === "ArrowRight") show(current + 1);
  });
})();

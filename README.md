# gregdallas.com

Static site for Greg Dallas — guitarist and composer, St. Louis.

Plain HTML, CSS and JavaScript. No build step, no framework, no dependencies.
Same setup as the Practice Lab tools: **public repo → GitHub Pages → custom
domain.** Edit a file, push, and it's live.

## Layout

```
index.html              home
about.html              bio
watch.html              video (YouTube facades — thumbnails swap to players on click)
performances.html       live dates, rendered from assets/js/events.js
contact.html            contact form
assets/css/site.css     all styles
assets/js/site.js       nav, video facades, events, form
assets/js/events.js     >>> the file to edit when adding a show <<<
assets/img/             photography
worker/contact-worker.js   Cloudflare Worker that emails the contact form
CNAME                   custom domain for GitHub Pages
```

## Adding a performance

Edit `assets/js/events.js` and add a block:

```js
{
  date:  "2026-09-12",       // required, YYYY-MM-DD
  time:  "8:00 PM",
  title: "Greg Dallas Trio",
  venue: "The Dark Room",
  city:  "St. Louis, MO",
  link:  "https://…",        // omit to hide the tickets link
  note:  "with special guests"
}
```

Order doesn't matter — the page sorts by date and splits upcoming vs. past on
its own. A show stays "upcoming" for the whole of its own day.

## Adding a video

In `watch.html`, copy a `<figure class="video">` block and swap the YouTube ID
in `data-video` and in both thumbnail URLs.

## Running locally

```bash
python3 -m http.server 4321 --directory .
```

## Deploying

GitHub Pages, from `main` / root — same as chord-drone, metronome-embedded and
the rest. Repo must be public for Pages on a free plan.

The `CNAME` file points it at gregdallas.com. To finish the domain move, add
these records wherever gregdallas.com's DNS lives (currently Squarespace):

| Type | Name | Value |
|---|---|---|
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | grdallas.github.io |

Then tick **Enforce HTTPS** in the repo's Pages settings once the certificate
issues. Exactly how thepracticelab.app is set up.

**Don't cancel Squarespace until gregdallas.com resolves here.**

## Contact form

GitHub Pages is static, so the form needs somewhere to send mail without
exposing an API key — that's `worker/contact-worker.js`, a Cloudflare Worker.
Same division of labour as Practice Lab: static site on Pages, Worker for the
one thing that needs a server.

1. dash.cloudflare.com → Workers & Pages → Create → paste in the Worker file.
2. Under the Worker's Settings → Variables, add:

   | Variable | Value |
   |---|---|
   | `RESEND_API_KEY` | API key from resend.com — mark it **encrypted** |
   | `CONTACT_TO` | `gregdallasmusic@gmail.com` |
   | `CONTACT_FROM` | optional, defaults to `site@gregdallas.com` |

3. Copy the Worker's URL into `data-endpoint` on the form in `contact.html`.

Until step 3, the form disables itself and tells visitors to email directly, so
nothing looks broken. Resend won't send *from* gregdallas.com until the domain
is verified there, so this realistically comes after the domain move.

The Worker only accepts requests from gregdallas.com, www.gregdallas.com and
grdallas.github.io — add to `ALLOWED_ORIGINS` if that changes.

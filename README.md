# gregdallas.com

Static site for Greg Dallas — guitarist and composer, St. Louis.

Plain HTML, CSS and JavaScript. No build step, no framework, no dependencies.
Edit a file, push, and Cloudflare Pages redeploys.

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
functions/api/contact.js   Cloudflare Pages Function that emails the form
_headers                cache + security headers
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
in both `data-video` and the two thumbnail URLs.

## Running locally

```bash
python3 -m http.server 4321 --directory .
```

The contact form needs Cloudflare's runtime, so it won't send from a plain
static server — the rest of the site works fine.

## Deploying

Cloudflare Pages, connected to this GitHub repo:

- **Build command:** *(none)*
- **Output directory:** `/`

Every push to `main` deploys. Pages picks up `functions/` automatically.

### Contact form setup

The form posts to `/api/contact`, which sends mail through [Resend](https://resend.com).
In the Pages project under **Settings → Environment variables**, add:

| Variable | Value |
|---|---|
| `RESEND_API_KEY` | API key from resend.com — mark it **encrypted** |
| `CONTACT_TO` | the address that should receive form submissions |
| `CONTACT_FROM` | optional, defaults to `site@gregdallas.com` |

The `CONTACT_FROM` domain has to be verified in Resend, which means adding the
DNS records it gives you. Free tier covers 3,000 emails/month.

Until those variables are set the form returns a 500 and the page tells the
visitor to email directly instead.

## Custom domain

gregdallas.com is currently registered at Squarespace. Two ways to point it here,
**neither of which requires cancelling Squarespace first**:

1. **Keep it registered at Squarespace, change the DNS.** In Pages → Custom
   domains, add `gregdallas.com`; Cloudflare gives you the records to enter in
   Squarespace's DNS panel. Lowest risk.
2. **Transfer the registration to Cloudflare Registrar** (~$10/yr, at cost).
   Unlock the domain at Squarespace, get the auth code, transfer. Note the
   60-day lock that applies after any recent registration or transfer.

Do not cancel the Squarespace subscription until the domain resolves here.

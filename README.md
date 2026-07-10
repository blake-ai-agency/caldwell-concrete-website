# Caldwell Concrete & Construction — Website

Static single-page site (plain HTML/CSS/JS, no build step). Built from `design_handoff_caldwell_website`.

## Run locally

Open `index.html` in a browser, or: `python3 -m http.server` in this folder → http://localhost:8000

## Before go-live (3 items)

1. **Form** — create a free form at [formspree.io](https://formspree.io), copy the endpoint, and set it at the top of `js/main.js`:
   `var FORM_ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID';`
   Until set, the form runs in demo mode (validates, shows the REQUEST SENT confirmation, sends nothing). Includes a honeypot (`_gotcha`) for spam.
2. **Domain** — replace `https://example.com/` with the production domain in `index.html` (og:url, og:image, JSON-LD url + image).
3. **Security headers** — set at the host (Netlify `_headers` / Cloudflare):
   `Content-Security-Policy: default-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; script-src 'self'; connect-src 'self' https://formspree.io; frame-ancestors 'none'`
   plus `X-Content-Type-Options: nosniff` and `Referrer-Policy: strict-origin-when-cross-origin`.

## Hosting

Any static host — drag the folder into Netlify Drop or Cloudflare Pages. No server required.

## Known notes

- Logo is dark-background-only (per brand rules) — never place on white.
- Hero microcopy uses brand gray `#7F7D85` at 13px (≈4.0:1 contrast) — inherited from the design system; bump to `#54525C` if strict WCAG AA is required.

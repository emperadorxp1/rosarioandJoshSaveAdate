# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Astro (static output). Chosen by the couple. Deploy target not decided (any static host: Netlify, Vercel, GitHub Pages).

## Users

- **Guests** of Rosario & Joshua's wedding, opening a link sent by WhatsApp, almost always on a phone. Job: learn the date, places and times, know what is expected of them (dress code, adults only, seats reserved), and confirm attendance.
- **The couple** (Rosario & Joshua): generate one personal link per guest/family with their number of seats, and read confirmations in a Google Sheet.

## Product Purpose

A single web page that is the save the date, the full wedding invitation, the itinerary and the RSVP. Success: guests feel personally invited, find every detail in seconds on mobile, and confirm without friction; the couple receive a clean list of confirmations.

## Positioning

It is the digital continuation of their printed invitation: the same tropical world (hibiscus, monstera, bird of paradise, coral envelope with gold wax seal and jute cord) brought to life, personalised per guest, with their own story inside it (her cumbia and love of planning, his trap/reggaeton/electronic "de todo", a shared love of Pokémon kept subtle).

## Operating Context

- Link shared through WhatsApp → opened in the in-app browser on Android/iOS, often on mobile data.
- Personal link format: `?para=<nombre>&pases=<n>`; a generator page creates them.
- RSVP goes to Google Sheets through a Google Apps Script web app, and after sending the guest can also notify the couple on WhatsApp with a prefilled message.

## Capabilities and Constraints

Confirmed facts (from the printed invitation):
- Couple: Rosario & Joshua. Monogram R&J.
- Parents of Rosario: Gregorio García Espinoza, María Martínez Gonzales. Parents of Joshua: Jesús Antonio Sosa Cruz, Ysabel Adolberta Cruz Cerrato.
- Opening line: "Con la bendición de Dios y el amor de nuestras familias… tenemos el honor de invitarte a celebrar nuestra boda".
- Date: 27 de febrero de 2027. Ceremony: Catedral de Tacna, 11:00 a.m. Reception: Local de Eventos Piedra Blanca, 12:30 p.m.
- Afternoon (from the couple): civil ceremony at Piedra Blanca 1:30 p.m. (exact); couple's entrance and toast 2:15, lunch 2:50, party starts 3:30, hora loca 5:00 (approx.).
- Dress code: Elegante; avoid white and beige (reserved for the couple).
- Adults only ("Una noche para compartir").
- Gift: Interbank, cuenta 3403111071786, CCI 00334001311107178678.

Undecided / assumptions:
- Itinerary: only 10:30 (arrival at the Cathedral) and 12:00 (photos and exit) remain a **proposal written by the designer**.
- WhatsApp number to receive confirmations: pending.
- RSVP deadline: pending.
- Background music: none until the couple supply audio they have rights to; never autoplay.
- Apps Script endpoint URL: pending deployment by the couple.

## Brand Commitments

- Respect the palette and theme of the printed invitation and envelope (ivory cream, hibiscus coral, deep monstera green, gold linework, bird-of-paradise orange/purple accents). Pinned by the couple.
- Pokémon present but subtle, as in the print (Poké Ball motif at the arch, a Pikachu hint peeking in a corner). The one full character drawing is the Pikachu bride & groom illustration the couple chose (`public/img/pikachus.png`, third-party fan art they supplied), shown as the second polaroid that slides out of the envelope.
- The gold wax seal carries a heart and two turtles facing each other: they represent the couple's daughters (reference `.impeccable/reference/lacre-tortugas.png`).
- The couple love a grainy crayon illustration style (flat shapes, chalky grain, drawn sparkle stars) — used as the illustration hand.
- Spanish (Peru), warm and familiar voice; "tú" to the guest.

## Evidence on Hand

- `public/img/pareja.jpg`: the couple's watercolour-style kiss photo, cropped from the image they supplied (original kept at `.impeccable/reference/pareja-original.png`).
- `.impeccable/reference/`: printed envelope, printed invitation (two cards), crayon art reference (third-party fan art, reference only, never shipped).
- No testimonials, no other photos. Do not invent guests' names, extra venues or times presented as confirmed.

## Product Principles

1. Mobile first, always: the WhatsApp in-app browser is the main stage.
2. Personal before generic: the page knows who it is for and how many seats they have.
3. Every fact findable in seconds: date, places, maps, dress code, RSVP.
4. Joy with order: playful and moving, yet as planned as Rosario would want.

## Accessibility & Inclusion

Guests span all ages (parents and grandparents): readable sizes, high contrast for body text, large tap targets, respect reduced-motion.

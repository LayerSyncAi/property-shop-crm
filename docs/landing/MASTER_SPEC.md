# Master prompt for the SyncEstate landing page

Rebuild the public landing page at `/` (`src/app/page.tsx`) for **SyncEstate**, the
all-in-one operating system for estate agencies built by **LayerSync**. It must feel like a
category-defining SaaS launch: dark, cinematic, confident and alive, with a light theme one click away.

The concept is **"Your whole agency, in the palm of your hand."** Photoreal hands holding phones run
through the page. Every phone screen shows the **real SyncEstate interface**, rebuilt in code so it
is crisp, scrollable and switchable. One WebGL moment, **"The Sync"**, tells the core story: the
chaos of five disconnected tools collapsing into one app.

The message, in one line: *How is your agency not running on SyncEstate yet? You are making your
own life harder.*

Status: **DRAFT v1, awaiting sign-off.** Items marked **[confirm]** need a yes or an edit from Tadiwa.

---

## 0. Ground rules

- **Name:** always "SyncEstate", one word. Modules use the names the app shows: SynCRM, SyncStay,
  SyncWorth, SyncFinance, SyncDev, SyncMedia. Sync Notify is a Hub service. SyncHR appears only as
  "coming soon".
- **Truth rule:** every claim maps to built code (see §14). Never claim:
  - "AI-powered matching". Matching is rule-based.
  - Conversion funnels or pipeline velocity.
  - The WhatsApp Business API. The extension is for WhatsApp Web.
  - Live App Store or Play Store apps. They are coming soon.
- **Voice:** direct, confident, a little provocative, never smug. Write short sentences and lead with
  the benefit. Use second person ("your agency"). Use Zimbabwean specifics where they add proof:
  USD and ZiG, PropertyBook, +263, stands. Use British spelling (organisation, colour).
- **Primary action everywhere:** **"Chat to us on WhatsApp"**. It opens a WhatsApp chat with
  LayerSync and a prefilled message (§12).
- **Secondary action:** **"Log in"**, which goes to `/login`. It is always in the nav.

---

## 1. Page-level behaviour

- **Signed-in visitors:** redirect to `/app/dashboard`, as today. Keep this in a small client
  component; the rest of the page renders on the server.
- **White-label deploys:** if a custom brand is configured (`NEXT_PUBLIC_BRAND_NAME` is set and is
  not "SyncEstate"), `/` redirects on the server to `/login`. The marketing page is SyncEstate-only.
- **Rendering:** a server component page. Client islands only for:
  - the theme toggle,
  - the nav scroll state,
  - the motion reveals,
  - the phone screens,
  - the module showcase,
  - the WebGL canvas,
  - the FAQ accordion.
  Remove the three.js "Hyperspeed" background from this page.
- **Metadata:** title "SyncEstate: run your agency from your pocket". Use the description from
  §3. A new 1200×630 OG image is cut from the hero photo with a live screen composited in.

---

## 2. Theme system

- **Default theme: dark**, whatever the OS setting. A toggle in the nav switches dark and light.
  The choice persists in `localStorage` under `se-theme`.
- **No flash:** an inline script runs before paint and sets `data-theme` on the landing root, not
  on `<html>`. The app (`/app`) is light-only and must be untouched.
- **Stages stay dark in both themes.** Every photo panel and the WebGL section keep their dark,
  cinematic look. In light mode they sit as dark rounded panels (radius 28px) on the light page,
  like premium hardware sites.
- **Phone screens always show the real light UI**, because the app is light-only. A bright screen
  glowing in a dark photo is the look.

### Tokens (CSS custom properties on `.landing`)

| Token | Dark (default) | Light | Use |
|---|---|---|---|
| `--bg` | `#070b0d` | `#f2f4f3` | Page |
| `--bg-raised` | `#0d1417` | `#ffffff` | Cards, nav glass base |
| `--surface` | `#111a1e` | `#ffffff` | Bento tiles |
| `--line` | `rgba(255,255,255,.08)` | `rgba(15,20,25,.09)` | Borders, grid lines |
| `--ink` | `#eef2f3` | `#0f1419` | Headings, body |
| `--ink-2` | `rgba(238,242,243,.64)` | `#58626a` | Secondary copy |
| `--ink-3` | `rgba(238,242,243,.40)` | `#77818a` | Labels, hints |
| `--accent` | `#9bd83d` | `#9bd83d` | Fills: primary buttons, dots, glows |
| `--accent-ink` | `#b5e46a` | `#3b6812` | Green **text** (AA on its background) |
| `--on-accent` | `#0f1419` | `#0f1419` | Text on green fills |
| `--glow` | `rgba(155,216,61,.32)` | `rgba(155,216,61,.22)` | Halos, button glow |
| `--haze` | `#0f2a28` | `#e3eee0` | Radial background haze behind heroes |
| `--stage` | `#070b0d` | `#070b0d` | Photo and WebGL panels (always dark) |

- **Easing:** `cubic-bezier(.16,1,.3,1)` ("expo-out") everywhere.
- **Durations:** 0.7s for reveals, 0.25s for hovers.
- **Grain:** a fixed film-grain overlay (SVG `feTurbulence`, 6% opacity, overlay blend) in dark
  mode only.

---

## 3. Typography

- **Geist** (already loaded) for all UI, body and headlines.
- **Geist Mono** (add via `next/font`) for:
  - **accent phrases**, the green highlighted words, as in the reference;
  - eyebrows;
  - labels;
  - figures.

| Role | Font | Size | Weight | Line-height | Tracking |
|---|---|---|---|---|---|
| H1 | Geist | `clamp(44px, 6.6vw, 96px)` | 500 | 0.98 | -0.045em |
| H1 accent | Geist Mono | 0.9em of H1 | 600 | — | -0.06em |
| H2 | Geist | `clamp(32px, 4.2vw, 60px)` | 500 | 1.04 | -0.035em |
| H3 | Geist | 22px | 500 | 1.2 | -0.015em |
| Body large | Geist | 19px | 400 | 1.55 | 0 |
| Body | Geist | 16px | 400 | 1.6 | 0 |
| Eyebrow | Geist Mono | 12px uppercase | 500 | — | 0.14em |

**Accent phrases** use a gradient text fill:
- Dark mode: `#9bd83d` to `#d4f59a`, left to right.
- Light mode: solid `--accent-ink`.

---

## 4. Navigation

- Fixed, centred floating pill, max 1200px wide, 12px from the top.
- **Glass:** `--bg-raised` at 60% opacity, 20px backdrop blur, 1px `--line` border.
- After 24px of scroll it gains a soft shadow and slightly more opacity.
- **Left:** the SyncEstate lockup. Use `lockup-reversed.svg` in dark mode and `lockup.svg` in
  light mode.
- **Centre:** anchor links Modules · How it works · Who it's for · FAQ.
  - On hover the text rolls up and is replaced by a copy of itself (two stacked spans,
    translateY -100%).
- **Right:**
  - Theme toggle: a 36px round button with a sun/moon icon cross-fade, `aria-pressed`, and the
    label "Switch to light theme" or "Switch to dark theme".
  - **Log in**: a ghost pill linking to `/login`.
  - **Chat on WhatsApp**: a green pill with the WhatsApp glyph and a `--glow` shadow.
- **Under 960px:** the anchor links hide.
- **Under 640px:**
  - Log in and the WhatsApp button collapse into a burger.
  - The burger morphs into an X and opens a full-width dark sheet with large links, Log in, and
    the WhatsApp CTA at full width.
  - The theme toggle stays visible.

---

## 5. Sections, in order

### 5.1 Hero (`#top`)

Centred column, `min-height: 100svh`, with a radial `--haze` behind the photo.

1. **Eyebrow pill:** a green dot, then "BUILT IN ZIMBABWE · BY LAYERSYNC".
2. **H1, two masked lines:** "Run your agency" / "**from your pocket.**" The second line is the
   accent phrase.
   - Each line slides up out of an overflow-hidden mask: 1.1s, expo-out, 0.08s stagger.
3. **Subtext** (max 58ch, `--ink-2`): "Leads, lettings, valuations, trust accounts and developments
   on one login. SyncEstate puts your whole operation on the phone in your hand, and the desk in
   your office."
4. **CTAs:**
   - **Chat to us on WhatsApp** (primary).
   - **See every module ↓** (ghost; smooth-scrolls to `#modules`).
5. **Hero stage (the hero photo):**
   - Two hands hold a phone upright on near-black, with a green rim light.
   - Full width, max 1280px, aspect 16:9 (4:5 crop on mobile, centred on the phone).
   - The live screen is composited in (§7) and shows the **Hub**:
     - "Good morning, Tendai";
     - a **Needs attention** list: "3 leads not contacted in 48 hours · SynCRM", "2 leases end in
       30 days · SyncStay", "USD 4,280 rent overdue · SyncStay", "Valuation due Friday · SyncWorth";
     - module tiles below.
   - The screen auto-scrolls slowly: 18s down, a pause, then back up.
   - The photo fades and scales from 1.04 to 1 over 1.4s after the headline.
6. **Microcopy under the stage** (`--ink-3`, mono 12px): "Works on any phone today · Native iOS &
   Android apps coming soon".

### 5.2 The Sync: the WebGL moment (`#why`)

The cost of standing still. Full spec in §8.

- **Copy column:** left on desktop, overlaid at the bottom on mobile. The lines change with scroll
  progress:
  - **0–35%:** eyebrow "THE OLD WAY". H2: "Five tabs open. **Zero control.**" Body: "WhatsApp for
    leads. Excel for rent. Gmail for mandates. A notebook for viewings. A calculator for
    commission. Every tab is a place where a deal slips, a payment hides or a dispute starts."
  - **35–75%:** H2: "How is your agency **still working like this?**" Body: "It's not your team.
    It's the tools. Information scattered across five apps can't be found, checked or trusted."
  - **75–100%:** eyebrow "THE SYNCESTATE WAY". H2: "One app. **Every module. Synced.**" Body:
    "Every lead, lease, valuation, payment and stand in one place, on every phone in your agency."
- **Floating captions** pinned to each chaos cluster during 0–35%, as mono 12px chips with a red
  dot:
  - "Lead lost in a WhatsApp thread"
  - "Rent roll in Excel_v7_FINAL.xlsx"
  - "Signed mandate buried in Gmail"
  - "Viewing notes in a notebook"
  - "Commission split on a calculator"

### 5.3 One login, every module (`#hub`)

- **Eyebrow:** "THE HUB". **H2:** "One login. **Every module you need.** Nothing you don't."
- **Bento grid** (12-column; 3 rows on desktop, stacked on mobile):
  1. **Large tile, 7 columns, 2 rows:** a phone screen of the Hub dashboard. Title "Everything that
     needs you, in one list". Copy: "The Hub pulls what needs attention from every module you use:
     overdue rent, unworked leads, valuations due, payouts waiting for approval."
  2. **Tile, 5 columns:** "Switch on only what you use". Copy: "Every module is sold and switched on
     separately, and each one works on its own. Start with SynCRM. Add SyncStay when you're ready."
     Visual: six module chips with on/off toggles that animate on reveal.
  3. **Tile, 5 columns:** "The right screen for every role". Copy: "Directors, sales managers,
     property managers, accounts, marketing and valuers each see what their job needs, and nothing
     they shouldn't." Visual: role pills.
  4. **Tile, 12 columns, slim:** "Alerts that find you". Copy: "Push notifications, a daily 8am
     agenda and email alerts for every module, so nothing waits for someone to remember." Visual:
     three stacked notification toasts that slide in.

### 5.4 Module showcase: "The Stage" (`#modules`)

This is the centrepiece.

- **Desktop (≥ 1024px):** two columns.
  - **Right column:** a sticky "stage" (the second photo: one hand, thumb hovering, phone at a slight
    3/4 angle, §7) with a composited screen that changes per chapter.
  - **Left column:** seven chapters scroll past, each about 90vh tall.
  - **Chapter rail:** a vertical row of seven module icons at the far left, sticky. It shows the
    active chapter and jumps to any chapter on click (proper tabs semantics).
- **Screen transitions between chapters:** the old screen slides up 8% and fades out; the new screen
  rises in. 0.6s, expo-out.
- **Tablet and mobile (< 1024px):**
  - Each chapter stacks as copy, then a straight-on phone (the hero hands crop, scaled down), then
    the next chapter.
  - The module rail becomes a horizontally scrollable chip bar that sticks under the nav.
- **Each chapter has:**
  - the module icon (from `product-icons`) and name in mono;
  - the module's in-app tagline as the eyebrow;
  - an H2 benefit headline with an accent phrase;
  - 2 sentences of copy;
  - 3 proof bullets with green check marks;
  - a text link "Ask about {Module} on WhatsApp →", which uses a module-specific prefilled message
    (§12).

| # | Module · eyebrow | Headline | Copy | Proof bullets | Screen |
|---|---|---|---|---|---|
| 1 | SynCRM · Leads, listings and deals | No lead goes **cold again.** | Every enquiry from PropertyBook, Facebook, WhatsApp or a walk-in lands in one pipeline, scored from Cold to On Fire. Your agents always know who to call next. | Lead scoring and a "top unworked leads" list · Duplicates caught by phone or email, merged with an audit trail · Reminders an hour before, when overdue, and a daily 8am agenda | CRM dashboard (win rate, KPI counters, score bands, top unworked leads), then scrolls to a lead's detail |
| 2 | Viewings · Part of SynCRM | Prove the introduction. **Protect the commission.** | Capture the client's details and signature on the phone, at the viewing. The form locks when it's done and prints on your letterhead, so "who found this buyer?" is settled before it starts. | Signatures drawn on screen · Locked once completed · PDF on your agency letterhead | Viewing form with the signature pad mid-signature (the signature path animates in) |
| 3 | SyncStay · Leases, rent and arrears | Know who owes what, **before you have to ask.** | Rent is charged automatically. Invoices and overdue reminders go out by email, and arrears are aged by days overdue. Landlords get statements without anyone building them by hand. | Lease expiry alerts 60 and 30 days ahead · Room-by-room inspections that lock on completion · Deposits held, applied or refunded, with a trail | Stay dashboard: Rent due this month, Collected so far, Total arrears, Occupancy, Leases ending soon |
| 4 | SyncWorth · Valuations to signed report | Valuations out the door **on time, signed and locked.** | From instruction to inspection to signed report, every job has an owner and a due date. Comparables live in your firm's own database, not in one valuer's head. | Inspect on the phone, photos included · Signing-valuer review with versioned corrections · Optional hold-until-paid on reports | Worth dashboard: Open jobs, Overdue, Due this week, Average turnaround, Unpaid fees |
| 5 | SyncFinance · Trust money, payouts and statements | Trust money **your auditor will thank you for.** | A proper double-entry ledger under a simple screen. Payouts need two people to approve, closed months stay closed, and USD and ZiG never mix. | Receipts, cash-up and landlord payouts · Mistakes reversed, never deleted · Trust report, cash book and debtors, ready for audit | Finance dashboard with trust and business balances by currency, plus a payout awaiting second approval |
| 6 | SyncDev · Developments, stands and sales | Never **double-sell a stand** again. | Load a development's stands in one line, reserve on the spot from the field, and let reservations lapse on their own. Buyers get statements showing what's paid, what's owed and what's next. | Bulk stand entry: "1–40, A1–A12" · Instalment plans with reminders · Buyer statements emailed as PDFs | Stand grid (available, reserved, sold colour-coded), then a buyer statement |
| 7 | SyncMedia · Posts and flyers from listings | From listing to **Instagram Story in a few taps.** | Pick a listing and a template, and SyncMedia builds on-brand posts, stories and A4 flyers in your agency's colours. No Canva, no waiting for a designer. | Feed, square, story, link banner and A4 flyer · Six templates, five themes · Your agency's own brand kit | Story-format brochure preview of a Borrowdale listing |

### 5.5 Works where you already work (`#integrations`)

- **Eyebrow:** "BEYOND THE MODULES". **H2:** "SyncEstate meets you **where the work happens.**"
- **Five cards** in a 3+2 grid. Each card has an icon, a title and two lines of copy. Hover lifts
  the card 2px and its border turns to accent.

| Card | Title | Copy |
|---|---|---|
| WhatsApp | Your CRM, **inside WhatsApp** | Open a chat and see who that number is in SynCRM. Create the lead, save the conversation to their timeline and set the follow-up, without leaving WhatsApp Web. |
| AI Copilot | Ask **"Who should I call today?"** | The SynCRM Copilot answers questions about your pipeline, finds leads and properties, moves stages and creates tasks, in plain English, on web and phone. |
| Portals | Landlords stop calling. **Tenants stop chasing.** | Invite-only portals show tenants their balance, receipts and repairs, and show landlords rent collected, arrears and statements. Each sees only what's theirs. |
| Sync Notify | Reach every tenant in arrears **in one send** | Send SMS and email to segments (tenants in arrears, instalment clients, unpaid invoices) with personalised placeholders and a delivery log. |
| PropertyBook | Bring your listings **across, not retyped** | Import your agency's live PropertyBook listings in batches, de-duplicated, with prices and statuses refreshed nightly. |

### 5.6 Who it's for (`#who`)

- **Eyebrow:** "WHO IT'S FOR". **H2:** "Built for every corner of **Zimbabwean property.**"
- **Four tall image cards** (aspect 3:4, horizontally scrollable on mobile with snap), each a
  cinematic lifestyle photo (§7). Each card has a title, one line of copy, and a module chip row.

| Card | Line | Chips |
|---|---|---|
| Sales agencies | From first enquiry to signed viewing form to paid commission. | SynCRM · SyncMedia |
| Property managers | Rent collected, arrears chased, landlords updated, without the spreadsheet. | SyncStay · SyncFinance |
| Valuation firms | Every job on time, every report signed and locked. | SyncWorth |
| Developers | Every stand, reservation and instalment, in real time. | SyncDev · SyncFinance |

### 5.7 Built in Zimbabwe (`#zimbabwe`)

- A full-width dark stage band.
- **H2:** "Built in Zimbabwe, **for how Zimbabwe does property.**"
- **Body:** "SyncEstate isn't a foreign CRM bent to fit. It was designed here, around the way local
  agencies actually work."
- **Six mono chips with icons:**
  - USD, ZiG and ZWL, never mixed
  - +263 numbers ready to call and SMS
  - PropertyBook and Property.co.zw lead sources
  - Stands, reservations and instalment plans
  - WhatsApp-first workflows
  - Branded PDFs on your letterhead

### 5.8 Why LayerSync (`#how`)

- **Eyebrow:** "HOW IT WORKS". **H2:** "We don't just sell software. **We transform agencies.**"
- **Body:** "SyncEstate is built by LayerSync, end-to-end digital transformation specialists. We
  set it up with you, bring your data across and get your team working in it." **[confirm: that
  LayerSync offers setup, data migration and team training as a service]**
- **Four steps** in a horizontal timeline. A green progress line draws in as it scrolls into view.
  1. **Chat to us.** Tell us how your agency works, on WhatsApp.
  2. **Pick your modules.** Start with what hurts most. Add the rest later.
  3. **Bring your data.** Leads by CSV, your rental portfolio from Excel, listings from PropertyBook,
     opening balances into Finance.
  4. **Go live.** On every desk and every phone in your agency.

### 5.9 App coming soon (`#app`)

- A split band.
- **Left:**
  - **H2:** "In your pocket today. **In the app stores soon.**"
  - **Body:** "SyncEstate works in any phone browser right now, and installs to your home screen
    like an app. Native iOS and Android apps are on the way."
  - **Two store badges**, App Store and Google Play. Use our own neutral badge design, not the
    official artwork: 50% opacity, a "COMING SOON" mono tag, non-interactive, `aria-disabled`.
- **Right:** the hero hands crop showing the mobile sign-in screen.

### 5.10 FAQ (`#faq`)

- **H2:** "Questions, **answered.**"
- An accordion: one open at a time, plus and minus rotating to an x, `<button aria-expanded>`, and
  the answer region labelled.

1. **Do I have to buy every module?** No. Each module is switched on separately and works on its
   own. Most agencies start with SynCRM and add more as they grow.
2. **Does it work on my phone?** Yes. SyncEstate runs in any modern phone browser and can be
   installed to your home screen. Native iOS and Android apps are coming soon.
3. **Can I bring my existing data?** Yes. Import leads from CSV, your rental portfolio from Excel,
   listings straight from PropertyBook, and opening balances into SyncFinance.
4. **Does it handle USD and ZiG?** Yes. Every amount carries its currency, and SyncFinance never
   mixes or converts them.
5. **Can my landlords and tenants log in?** Yes, through invite-only portals. Tenants see their own
   lease, payments and repairs; landlords see their own properties and statements.
6. **Who can see our data?** Only your agency. Inside it, roles decide who sees what. For example,
   accounts staff never see valuation figures in SyncWorth.
7. **What does it cost?** It depends on the modules you choose and the size of your team. Chat to us
   on WhatsApp and we'll put together a quote for your agency.

### 5.11 Final CTA

- A dark stage panel with a radial `--glow` and the hero hands photo faded to 30% at the bottom.
- **H2:** "Your competitors are still in five tabs. **You don't have to be.**"
- **Body:** "Get your agency running on SyncEstate. One chat is all it takes to start."
- **Button:** **Chat to us on WhatsApp**, large, magnetic: it follows the cursor (20% in x, 30% in
  y) and springs back.

### 5.12 Footer

- **Four columns:**
  1. The lockup and "Smarter real estate. Together.", then "Built in Zimbabwe by LayerSync,
     end-to-end digital transformation specialists."
  2. **Modules:** anchors to each chapter.
  3. **Company:** LayerSync (layersync.ai **[confirm URL]**), WhatsApp.
  4. **Account:** Log in, Privacy (`/privacy`), Terms (`/terms`).
- **Bottom row:** "© 2026 LayerSync. All rights reserved." on the left and the theme toggle on the
  right.

---

## 6. Phone screens (the "live" UI)

- Each screen is a React component that recreates a **real mobile app screen** using
  `mobile/lib/theme.ts` tokens:
  - colours, from that file;
  - 8/12/20 radii;
  - 11–28px type scale;
  - lucide icons.
- Each one is cross-checked against the matching `mobile/app/**` route before sign-off.
- **Content** is realistic sample data, Zimbabwe-flavoured:
  - Borrowdale, Avondale, Mount Pleasant, Greendale;
  - USD figures;
  - names like Tendai Moyo, Rudo Chikwanha, Farai Ndlovu;
  - "PropertyBook" as a lead source.
- **Size:** screens render at a 390×844 logical size and are scaled to fit the photo's screen
  quad.
- **Scrolling:**
  - **Desktop:** the screen scrolls with the mouse wheel while hovered. A soft hint ("scroll the
    screen") appears once.
  - **Touch:** no nested scroll. Screens auto-scroll slowly, and dots below the stage switch
    screens.
- **Accessibility:** each screen is `role="img"` with an `aria-label` describing it. The inner UI is
  `aria-hidden` and `inert`.

---

## 7. Photography (Higgsfield)

**Visual bible** (applies to every image):
- A near-black teal-charcoal background with a faint haze.
- A lime-green rim light (`#9bd83d`) from behind.
- Black Zimbabwean professionals in smart business wear.
- One generic modern frameless phone, no logos.
- 50mm look, shallow depth of field.
- Grade: deep teal shadows, neutral skin.
- The approved hero is passed as a reference image to every later generation, for consistency.

**Model:** GPT Image 2.5, quality "high", 2k (≈ 2.75 credits per image). It won the test against
Cinema Studio 2.5 and Soul Cinema:
- it kept the brief (two hands, nothing on the screen, straight-on);
- its green screen was the cleanest.

**Green-screen compositing:**
- Phones in H1 and H2 have a solid chroma-green screen.
- At build time a script:
  1. detects the screen region (strict green threshold, then flood fill from the centre);
  2. measures its four corners;
  3. exports a screen mask PNG.
- **Validated on the H1 test:** the mask fills 98.9% of its bounding box, with a screen aspect of
  2.14, matching a real phone.
- **At runtime:**
  - the screen component is placed with a CSS `matrix3d` from those corners;
  - the mask is applied so rounded corners, and any finger in front of the glass, stay on top;
  - a subtle glass sheen gradient is laid over the screen.
- The photo is shipped with the green replaced by a neutral dark, so it never flashes green while
  loading.

| ID | Shot | Aspect | Used in |
|---|---|---|---|
| H1 | Two hands, phone upright, straight-on, green screen (**test A approved candidate**) | 16:9 (plus 4:5 crop) | Hero, mobile chapters, app band, final CTA, OG |
| H2 | One hand from the right, phone at a slight 3/4 angle, thumb hovering near the lower edge (not touching), green screen | 4:5 | Module showcase stage |
| L1 | Sales agent at a viewing in a modern Harare home; client signing on the agent's phone; warm interior practicals, teal grade | 3:4 | Who it's for: Sales agencies |
| L2 | Property manager in an apartment doorway, phone in hand, mid-inspection | 3:4 | Property managers |
| L3 | Valuer outside a suburban house with a security wall and jacaranda, photographing it on a phone, golden hour then teal grade | 3:4 | Valuation firms |
| L4 | Developer on a serviced-stands site with survey pegs and graded roads, phone in hand, dusk | 3:4 | Developers |

**Budget:**
- About 6 final images plus about 3 retries each, roughly 50 credits, within the 80 approved.
- 8.25 credits spent so far on the test.
- Delivery: AVIF and WebP via `next/image`. The hero is ≤ 220KB at 1600w and loads with
  `priority`.

---

## 8. "The Sync": the WebGL moment

**Purpose:** show, rather than tell, five disconnected tools collapsing into SyncEstate.

- **Stage:**
  - The section is 260vh tall, with a sticky 100svh dark stage.
  - One `<canvas>` fills it, with device-pixel-ratio capped at 2 (1.5 above 2560px wide).
  - Raw WebGL, no library.
  - **One draw call:** `gl.POINTS` with additive blending, rendered with premultiplied alpha.
- **Particles:**
  - 9,000 on desktop, 4,500 under 768px, 2,500 when `navigator.hardwareConcurrency <= 4`.
  - Each particle carries:
    - `aStart`: its position in one of five chaos glyphs;
    - `aEnd`: its position in the SyncEstate mark;
    - `aSeed`: a random seed;
    - `aCluster`: which glyph it starts in, 0–4.
- **Chaos glyphs:** sampled once at init by drawing to an offscreen 2D canvas and reading the
  pixels. Each is drawn as a line icon at about 160px, spread in a loose pentagon around the stage
  centre:
  1. a chat bubble with a tick (WhatsApp);
  2. a spreadsheet grid;
  3. an envelope;
  4. a ruled notebook;
  5. a calculator keypad.
- **Target:** points sampled from `public/brand/mark.svg`, the SyncEstate "S" mark, at about 38% of
  stage height, centred.
- **Motion:** driven by scroll progress `p` (0–1 over the section) and passed in as `uProgress`.
  - **0–0.35, chaos:**
    - particles sit on their glyphs with jitter (2D simplex noise, amplitude 3px);
    - each glyph drifts slowly;
    - colour is desaturated grey `#5b6670`, with 12% of particles flickering red `#d92d20` (the
      problems).
  - **0.35–0.75, the sync:**
    - particles leave their glyphs along curl-noise paths toward their target, eased per particle
      with a stagger from `aSeed`, so the glyphs dissolve from the edges inward;
    - colour lerps to the brand green `#9bd83d`, with the brightest 15% of particles at `#d4f59a`.
  - **0.75–1, synced:**
    - particles settle into the mark;
    - a gentle breathing pulse (1.5% scale, 3.2s period);
    - a soft bloom halo, a radial `--glow` drawn as a CSS layer behind the canvas.
- **Cursor:**
  - within 120px, particles are pushed away (radial falloff) and spring back. Stiffness 60,
    damping 10, computed in the vertex shader from a `uMouse` uniform with a decaying `uMouseForce`.
  - On touch, a tap sends out one ripple.
- **Performance:**
  - The init happens in an IntersectionObserver when the section is within one viewport. Rendering
    pauses when the stage is off-screen or the tab is hidden.
  - The only per-frame CPU work is the uniforms; all positions are computed on the GPU.
  - The canvas resizes with a ResizeObserver.
- **Fallbacks:**
  - **`prefers-reduced-motion`:** no canvas. A static SVG of the mark with a halo, and the three
    copy states shown stacked as normal-flow text.
  - **No WebGL:** the same static fallback.
- **Accessibility:** the canvas is `aria-hidden`. The copy column is real text in reading order.

---

## 9. Motion system

- **Section reveals:** an element fades up 24px over 0.7s when 20% visible, with children staggered
  by 0.06s. Use Framer Motion `whileInView` with `once: true`.
- **Headlines:** masked line reveal, the same as the hero H1, with 0.9s duration.
- **Buttons:**
  - the rolling-text hover from §4;
  - the primary button's glow intensifies on hover;
  - press is scale 0.98.
- **Bento visuals:** module toggles flip on in sequence; notification toasts slide in from the
  right, staggered 0.25s.
- **`prefers-reduced-motion`:** all transforms are off, opacity fades only (0.2s), auto-scroll is
  off, and The Sync uses its static fallback.

---

## 10. Responsive

| Breakpoint | Changes |
|---|---|
| ≥ 1280 | Full layout, max content width 1200px, side gutters 32px |
| 1024–1279 | Bento compresses to 2 columns; showcase stays two-column |
| 768–1023 | Showcase becomes stacked chapters with a sticky chip bar; Who-it's-for becomes a 2×2 grid |
| < 768 | Single column; 16px gutters; H1 `clamp(40px, 11vw, 56px)`; hero photo crops to 4:5; full-width buttons; the Who-it's-for cards snap-scroll horizontally; the steps become a vertical timeline |

- No horizontal page scroll at any width.
- Tap targets are at least 44px.

---

## 11. Accessibility and quality bar

- Semantic `header` / `nav` / `main` / `section` (each section with `aria-labelledby`) / `footer`.
- A skip link to `#main`.
- Visible focus rings: 2px `--accent` with a 2px offset.
- Contrast is AA in both themes. Green **text** always uses `--accent-ink`, never `--accent`, on
  light backgrounds.
- The theme toggle and the accordion are fully keyboard operable. The showcase rail uses
  roving-tabindex tabs.
- **Performance targets** (mobile, 4G, mid-range Android):
  - LCP < 2.5s;
  - CLS < 0.05;
  - landing JavaScript (excluding the WebGL chunk, which is lazy-loaded) under 120KB gzip.
- **QA before the PR:**
  - Playwright screenshots at 1440, 1024 and 390 wide in both themes, plus reduced motion;
  - a horizontal-overflow check;
  - `npm run lint`, typecheck and `next build`.

---

## 12. WhatsApp CTA

- **Config:** `src/config/marketing.ts` exports `salesWhatsApp`, read from
  `NEXT_PUBLIC_SALES_WHATSAPP` with a fallback to LayerSync's number.
  **[confirm: number, in international format, e.g. 2637XXXXXXXX]**
- **Link:** `https://wa.me/<number>?text=<encoded message>`. It opens in a new tab with
  `rel="noopener"`.
- **Default message:** "Hi LayerSync! I run an estate agency and I'm interested in SyncEstate. Can
  we chat?"
- **Module message:** "Hi LayerSync! I'm interested in {Module} for my agency. Can we chat?"
- The buttons carry `data-cta="<location>"` so analytics can be added later without markup changes.

---

## 13. Files

```
src/app/page.tsx                    server component: redirects plus <Landing/>
src/components/landing/
  landing.tsx                       page assembly, theme root and no-flash script
  theme-toggle.tsx
  nav.tsx
  hero.tsx
  the-sync/the-sync.tsx             section, copy states and fallback
  the-sync/gl.ts                    WebGL setup, shaders, sampling
  hub-bento.tsx
  module-showcase.tsx
  integrations.tsx
  who-its-for.tsx
  zimbabwe.tsx
  how-it-works.tsx
  app-coming-soon.tsx
  faq.tsx
  final-cta.tsx
  footer.tsx
  phone/phone-stage.tsx             photo + matrix3d screen + mask
  phone/screens/*.tsx               hub, crm, lead, viewing, stay, worth, finance, dev-stands, media-story, sign-in
  content.ts                        all copy in one place
  landing.css                       tokens, grain, utilities
src/config/marketing.ts             WhatsApp number and messages
public/landing/                     photos (avif/webp), screen masks, corner JSON
scripts/landing/screen-quad.py      green-screen corner and mask extraction
```

---

## 14. Claim to source map (for review)

| Claim | Source in code |
|---|---|
| Lead scoring 0–100, Cold to On Fire, top unworked leads | `convex/leadScoring.ts`, dashboard |
| Duplicate detection and merge with audit trail | `convex/leadMerge.ts`, `mergeAudits` |
| Reminders 1h before, overdue, daily 8am agenda | `convex/activityReminders.ts`, `crons.ts` |
| Viewing forms: signature, lock, letterhead PDF | `convex/viewingForms.ts`, `viewingFormLib.ts` |
| Stay: auto rent charges, reminders, arrears ageing, 60/30-day alerts, inspections, deposits, statements | `convex/stay/*` |
| Worth: workflow, phone inspection, comparables, signing review, versioning, hold-until-paid | `convex/worth/*` |
| Finance: double-entry, two-person payout approval, month close, reversals, currencies never mixed | `convex/finance/*`, `docs/261029_sync-finance-and-notify.md` |
| Dev: bulk stands, reservations lapse, instalment plans, buyer statements | `convex/dev/*`, `docs/261029_sync-dev.md` |
| Media: five formats, six templates, five themes, brand kit | `src/lib/syncmedia/formats.ts` |
| Copilot: pipeline Q&A, stage moves, task creation | `src/lib/ai/copilot-tools.ts` |
| WhatsApp Web extension: lookup, create lead, save chat | `convex/whatsapp.ts` |
| Portals: tenant and landlord isolation | `convex/portal/*` |
| Notify: SMS and email segments, placeholders, delivery log | `convex/notify/*` |
| PropertyBook import, nightly refresh | `convex/propertyBook.ts`, `docs/propertybook-import.md` |
| Modules switched on per agency, sold separately | `convex/lib/modules.ts`, `docs/261029_sync-dev.md` |
| Push notifications and PWA install | `public/sw.js`, `public/manifest.json`, `convex/push.ts` |

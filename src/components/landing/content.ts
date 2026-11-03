/**
 * Every line of copy on the landing page, in one place.
 * Source of truth: docs/landing/MASTER_SPEC.md §5. Each product claim is
 * backed by built code; see the claim map in §14 before adding a new one.
 *
 * A headline is split into [plain, accent] so the accent phrase can take the
 * green mono treatment.
 */

export type Headline = readonly [plain: string, accent: string, after?: string];

export const hero = {
  eyebrow: "Built in Zimbabwe · by LayerSync",
  lines: ["Run your agency", "from your pocket."] as const,
  sub: "Leads, lettings, valuations, trust accounts and developments on one login. SyncEstate puts your whole operation on the phone in your hand, and the desk in your office.",
  primary: "Chat to us on WhatsApp",
  secondary: "See every module",
  micro: "Works on any phone today · Native iOS & Android apps coming soon",
};

export const sync = {
  states: [
    {
      eyebrow: "The old way",
      headline: ["Five tabs open. ", "Zero control."] as Headline,
      body: "WhatsApp for leads. Excel for rent. Gmail for mandates. A notebook for viewings. A calculator for commission. Every tab is a place where a deal slips, a payment hides or a dispute starts.",
    },
    {
      eyebrow: "Sound familiar?",
      headline: ["How is your agency ", "still working like this?"] as Headline,
      body: "It's not your team. It's the tools. Information scattered across five apps can't be found, checked or trusted.",
    },
    {
      eyebrow: "The SyncEstate way",
      headline: ["One app. ", "Every module. Synced."] as Headline,
      body: "Every lead, lease, repair, valuation, payment and stand in one place, on every phone in your agency.",
    },
  ],
  captions: [
    "Lead lost in a WhatsApp thread",
    "Rent roll in Excel_v7_FINAL.xlsx",
    "Signed mandate buried in Gmail",
    "Viewing notes in a notebook",
    "Commission split on a calculator",
  ],
};

export const hub = {
  eyebrow: "The Hub",
  headline: ["One login. ", "Every module you need.", " Nothing you don't."] as Headline,
  tiles: {
    attention: {
      title: "Everything that needs you, in one list",
      body: "The Hub pulls what needs attention from every module you use: unworked leads, new repair requests, overdue rent, valuations due, payouts waiting for approval.",
    },
    modules: {
      title: "Switch on only what you use",
      body: "Every module is sold and switched on separately, and each one works on its own. Start with SynCRM. Add SyncStay when you're ready.",
    },
    roles: {
      title: "The right screen for every role",
      body: "Directors, sales managers, property managers, accounts, marketing and valuers each see what their job needs, and nothing they shouldn't.",
      list: ["Director", "Sales manager", "Property manager", "Accounts", "Marketing", "Valuer"],
    },
    alerts: {
      title: "Alerts that find you",
      body: "Push notifications, a daily 8am agenda and email alerts for every module, so nothing waits for someone to remember.",
      toasts: [
        { module: "SyncStay", text: "New repair request · Unit 4B, cracked bedroom window" },
        { module: "SynCRM", text: "Follow up with Rudo Chikwanha in 1 hour" },
        { module: "SyncFinance", text: "Payout to landlord F. Ndlovu needs your approval" },
      ],
    },
  },
};

export type ScreenId =
  | "hub"
  | "crm"
  | "viewing"
  | "stay"
  | "worth"
  | "finance"
  | "dev"
  | "media"
  | "signin";

export type ModuleKey = "crm" | "viewings" | "stay" | "worth" | "finance" | "dev" | "media";

export type Chapter = {
  key: ModuleKey;
  name: string;
  eyebrow: string;
  headline: Headline;
  body: string;
  proof: readonly string[];
  screen: ScreenId;
  /** The module name used in the WhatsApp message. */
  askAbout: string;
};

export const showcase = {
  eyebrow: "Every module",
  headline: ["Your whole agency, ", "one tap away."] as Headline,
  sub: "Seven modules, one login. Scroll the phone to see each one at work.",
  chapters: [
    {
      key: "crm",
      name: "SynCRM",
      eyebrow: "Leads, listings and deals",
      headline: ["No lead goes ", "cold again."],
      body: "Every enquiry from PropertyBook, Facebook, WhatsApp or a walk-in lands in one pipeline, scored from Cold to On Fire. Your agents always know who to call next.",
      proof: [
        "Lead scoring and a “top unworked leads” list",
        "Duplicates caught by phone or email, merged with an audit trail",
        "Reminders an hour before, when overdue, and a daily 8am agenda",
      ],
      screen: "crm",
      askAbout: "SynCRM",
    },
    {
      key: "viewings",
      name: "Viewings",
      eyebrow: "Part of SynCRM",
      headline: ["Prove the introduction. ", "Protect the commission."],
      body: "Capture the client's details and signature on the phone, at the viewing. The form locks when it's done and prints on your letterhead, so “who found this buyer?” is settled before it starts.",
      proof: ["Signatures drawn on screen", "Locked once completed", "PDF on your agency letterhead"],
      screen: "viewing",
      askAbout: "SynCRM viewing forms",
    },
    {
      key: "stay",
      name: "SyncStay",
      eyebrow: "Property management, digitised",
      headline: ["Every property, every repair, ", "every inspection. Digitised."],
      body: "Each property, unit and lease lives in one digital file. Tenants log repair requests with photos from their portal, your team tracks them to done, and inspections happen room by room on the phone. Rent and arrears look after themselves.",
      proof: [
        "Digital maintenance requests with photos, an assignee, costs and landlord approval for big repairs",
        "Room-by-room inspections with conditions, photos and meter readings, locked and emailed to the landlord",
        "Rent charged automatically, arrears aged by days overdue, landlord statements built for you",
      ],
      screen: "stay",
      askAbout: "SyncStay",
    },
    {
      key: "worth",
      name: "SyncWorth",
      eyebrow: "Valuations to signed report",
      headline: ["Valuations out the door ", "on time, signed and locked."],
      body: "From instruction to inspection to signed report, every job has an owner and a due date. Comparables live in your firm's own database, not in one valuer's head.",
      proof: [
        "Inspect on the phone, photos included",
        "Signing-valuer review with versioned corrections",
        "Optional hold-until-paid on reports",
      ],
      screen: "worth",
      askAbout: "SyncWorth",
    },
    {
      key: "finance",
      name: "SyncFinance",
      eyebrow: "Trust money, payouts and statements",
      headline: ["Trust money ", "your auditor will thank you for."],
      body: "A proper double-entry ledger under a simple screen. Payouts need two people to approve, closed months stay closed, and USD and ZiG never mix.",
      proof: [
        "Receipts, cash-up and landlord payouts",
        "Mistakes reversed, never deleted",
        "Trust report, cash book and debtors, ready for audit",
      ],
      screen: "finance",
      askAbout: "SyncFinance",
    },
    {
      key: "dev",
      name: "SyncDev",
      eyebrow: "Developments, stands and sales",
      headline: ["Never ", "double-sell a stand", " again."],
      body: "Load a development's stands in one line, reserve on the spot from the field, and let reservations lapse on their own. Buyers get statements showing what's paid, what's owed and what's next.",
      proof: ["Bulk stand entry: “1–40, A1–A12”", "Instalment plans with reminders", "Buyer statements emailed as PDFs"],
      screen: "dev",
      askAbout: "SyncDev",
    },
    {
      key: "media",
      name: "SyncMedia",
      eyebrow: "Posts and flyers from listings",
      headline: ["From listing to ", "Instagram Story in a few taps."],
      body: "Pick a listing and a template, and SyncMedia builds on-brand posts, stories and A4 flyers in your agency's colours. No Canva, no waiting for a designer.",
      proof: ["Feed, square, story, link banner and A4 flyer", "Six templates, five themes", "Your agency's own brand kit"],
      screen: "media",
      askAbout: "SyncMedia",
    },
  ] satisfies Chapter[],
};

export const integrations = {
  eyebrow: "Beyond the modules",
  headline: ["SyncEstate meets you ", "where the work happens."] as Headline,
  cards: [
    {
      key: "whatsapp",
      title: ["Your CRM, ", "inside WhatsApp"] as Headline,
      body: "Open a chat and see who that number is in SynCRM. Create the lead, save the conversation to their timeline and set the follow-up, without leaving WhatsApp Web.",
    },
    {
      key: "copilot",
      title: ["Ask ", "“Who should I call today?”"] as Headline,
      body: "The SynCRM Copilot answers questions about your pipeline, finds leads and properties, moves stages and creates tasks, in plain English, on web and phone.",
    },
    {
      key: "portals",
      title: ["Landlords stop calling. ", "Tenants stop chasing."] as Headline,
      body: "Invite-only portals show tenants their balance, receipts and repair requests, and show landlords rent collected, arrears and statements. Each sees only what's theirs.",
    },
    {
      key: "notify",
      title: ["Reach every tenant in arrears ", "in one send"] as Headline,
      body: "Send SMS and email to segments (tenants in arrears, instalment clients, unpaid invoices) with personalised placeholders and a delivery log.",
    },
    {
      key: "commissions",
      title: ["Commission splits, ", "settled before the argument"] as Headline,
      body: "Set your agency's split rules once. When a deal is won, the commission record is created automatically and moves from pending to approved to paid, and every agent can see their own share.",
    },
  ],
};

export const who = {
  eyebrow: "Who it's for",
  headline: ["Built for every corner of ", "Zimbabwean property."] as Headline,
  cards: [
    {
      title: "Sales agencies",
      body: "From first enquiry to signed viewing form to paid commission.",
      chips: ["SynCRM", "SyncMedia"],
      image: "/landing/who-sales-v2.jpg",
      alt: "An estate agent holds out her phone while a smiling young couple sign on it in a sunlit Borrowdale living room",
    },
    {
      title: "Property managers",
      body: "Repairs logged and tracked, inspections done on the phone, rent and arrears under control.",
      chips: ["SyncStay", "SyncFinance"],
      image: "/landing/who-property-managers-v2.jpg",
      alt: "A property manager crouches to photograph a leaking pipe under a kitchen sink while the tenant looks on, reassured",
    },
    {
      title: "Valuation firms",
      body: "Every job on time, every report signed and locked.",
      chips: ["SyncWorth"],
      image: "/landing/who-valuers-v2.jpg",
      alt: "A valuer photographs a house with her phone under a jacaranda in bloom in Mount Pleasant at golden hour",
    },
    {
      title: "Developers",
      body: "Every stand, reservation and instalment, in real time.",
      chips: ["SyncDev", "SyncFinance"],
      image: "/landing/who-developers-v2.jpg",
      alt: "A developer in a hard hat smiles at his phone on a serviced stands site at dusk while his foreman points across the plots",
    },
  ],
};

export const zimbabwe = {
  headline: ["Built in Zimbabwe, ", "for how Zimbabwe does property."] as Headline,
  body: "SyncEstate isn't a foreign CRM bent to fit. It was designed here, around the way local agencies actually work.",
  chips: [
    "USD, ZiG and ZWL, never mixed",
    "+263 numbers ready to call and SMS",
    "PropertyBook and Property.co.zw lead sources",
    "Stands, reservations and instalment plans",
    "WhatsApp-first workflows",
    "Branded PDFs on your letterhead",
  ],
};

export const how = {
  eyebrow: "How it works",
  headline: ["We don't just sell software. ", "We transform agencies."] as Headline,
  body: "SyncEstate is built by LayerSync, end-to-end digital transformation specialists. We set it up with you, bring your data across and get your team working in it.",
  steps: [
    { title: "Chat to us.", body: "Tell us how your agency works, on WhatsApp." },
    { title: "Pick your modules.", body: "Start with what hurts most. Add the rest later." },
    { title: "Bring your data.", body: "Leads by CSV, your rental portfolio from Excel, opening balances into Finance." },
    { title: "Go live.", body: "On every desk and every phone in your agency." },
  ],
};

export const app = {
  headline: ["In your pocket today. ", "In the app stores soon."] as Headline,
  body: "SyncEstate works in any phone browser right now, and installs to your home screen like an app. Native iOS and Android apps are on the way.",
};

export const faq = {
  headline: ["Questions, ", "answered."] as Headline,
  items: [
    {
      q: "Do I have to buy every module?",
      a: "No. Each module is switched on separately and works on its own. Most agencies start with SynCRM and add more as they grow.",
    },
    {
      q: "Does it work on my phone?",
      a: "Yes. SyncEstate runs in any modern phone browser and can be installed to your home screen. Native iOS and Android apps are coming soon.",
    },
    {
      q: "Can I bring my existing data?",
      a: "Yes. Import leads from CSV, your rental portfolio from Excel, and opening balances into SyncFinance.",
    },
    {
      q: "Does it handle USD and ZiG?",
      a: "Yes. Every amount carries its currency, and SyncFinance never mixes or converts them.",
    },
    {
      q: "Can my landlords and tenants log in?",
      a: "Yes, through invite-only portals. Tenants see their own lease, payments and repair requests; landlords see their own properties and statements.",
    },
    {
      q: "Who can see our data?",
      a: "Only your agency. Inside it, roles decide who sees what. For example, accounts staff never see valuation figures in SyncWorth.",
    },
    {
      q: "What does it cost?",
      a: "It depends on the modules you choose and the size of your team. Chat to us on WhatsApp and we'll put together a quote for your agency.",
    },
  ],
};

export const finalCta = {
  headline: ["Your competitors are still in five tabs. ", "You don't have to be."] as Headline,
  body: "Get your agency running on SyncEstate. One chat is all it takes to start.",
};

export const footer = {
  tagline: "Smarter real estate. Together.",
  blurb: "Built in Zimbabwe by LayerSync, end-to-end digital transformation specialists.",
};

export const navLinks = [
  { label: "Modules", href: "#modules" },
  { label: "How it works", href: "#how" },
  { label: "Who it's for", href: "#who" },
  { label: "FAQ", href: "#faq" },
] as const;

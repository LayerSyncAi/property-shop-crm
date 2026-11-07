# SyncEstate VSL script

The spoken script for the landing-page video sales letter, one line per phrase. The
**name** keys the timeline (`timeline.json`) and is what `audio/vo_split.py --names`
expects, in this order. The source of truth is `script.json`; keep the two in step.

Voice: ElevenLabs **Jesse - Confident, Warm, Expressive Male** (`sXcl1NoQHcU7NRh6Na5D`),
model `eleven_multilingual_v2`, one take. Separate phrases with
`<break time="0.6s" />` (0.7–0.8s where the picture changes scene) so the take can be cut.
Spoken spellings are deliberate ("Sync C R M", "U S dollars", "Zig"); captions use the
written names.

| # | name | line |
|---|---|---|
| 1 | hook | If your agency still runs on WhatsApp, Excel and a notebook, this is for you. |
| 2 | pain1 | Leads get lost in chat threads. |
| 3 | pain2 | Rent hides in a spreadsheet called final, version seven. |
| 4 | pain3 | Signed mandates get buried in email, and commission gets worked out on a calculator. |
| 5 | agitate1 | It's not your team. It's the tools. |
| 6 | agitate2 | Five apps that don't talk to each other, and every gap is a deal that slips, a payment that hides, or a dispute waiting to start. |
| 7 | reveal | Meet Sync Estate. One app that runs your whole agency, from the phone in your pocket. |
| 8 | hub | One login. The Hub shows everything that needs you today: unworked leads, repair requests, overdue rent, and payouts waiting for approval. |
| 9 | crm | Sync C R M scores every enquiry from cold to on fire, so your agents always know who to call next. |
| 10 | viewings | Viewing forms are signed on the phone and locked, so nobody argues over who found the buyer. |
| 11 | stay | Sync Stay digitises property management. Repairs with photos, room-by-room inspections, and rent and arrears that look after themselves. |
| 12 | worth | Sync Worth gets valuations out the door on time, signed and locked. |
| 13 | finance | Sync Finance keeps trust money ready for audit, with two-person payout approval. And U S dollars and Zig never mix. |
| 14 | dev | With Sync Dev, you'll never double-sell a stand again. |
| 15 | media | And Sync Media turns a listing into an Instagram story in a few taps. |
| 16 | zim | It's built in Zimbabwe, for how Zimbabwe does property. |
| 17 | modules | Switch on only the modules you need. Start with one, and add the rest when you're ready. |
| 18 | how | And we don't just hand you software. LayerSync sets it up with you, brings your data across, and gets your team working in it. |
| 19 | payoff | Your competitors are still in five tabs. You don't have to be. |
| 20 | cta | Tap Get in touch, leave your name and number, and we'll pick it up with you on WhatsApp. |

Every claim maps to `src/components/landing/content.ts` and the claim map in
`docs/landing/MASTER_SPEC.md` §14. No prices, no app-store availability, no "AI matching".

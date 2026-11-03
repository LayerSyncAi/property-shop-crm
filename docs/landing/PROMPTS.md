# SyncEstate photography prompts

The image prompts behind the landing page photography (`public/landing/`).
Generated with **Seedream 5.0 Pro** on Higgsfield (`seedream_v5_pro`, 2k).

Reuse the structure for every new shot so the set stays one shoot.

## How we write a prompt

Every prompt has these parts, in this order. Leave none out.

1. **Intent:** one line saying what the photo is for and the moment it captures.
2. **Scene:** the place (a real Harare suburb), the time of day and season, and three or four concrete props or materials.
3. **Subjects:**
   - who they are: age, build, hair and the exact clothing, with colours;
   - what each one is doing with their hands;
   - each person's **facial expression**, in plain words ("calm, brow slightly furrowed", "a small, grateful smile");
   - where they stand in the frame.
4. **Camera:** focal length, aperture, camera height and angle, framing and what falls out of focus.
5. **Lighting:**
   - the key light's direction and colour temperature in kelvin;
   - fill and rim lights, including the lime-green brand rim (`#9BD83D`) where it fits the scene.
6. **Grade:** highlights, shadows (always deep teal-green), skin, and any brand accent.
7. **Finish:** "photorealistic, fine detail, subtle film grain, no text, no logos".

### Hard rules

- **People:** Black Zimbabwean professionals, mixing men and women, ages and roles across the set.
- **Settings:** recognisably Harare. Name the suburb, and use jacarandas, msasa trees, boundary walls and red earth where they fit.
- **Phones:**
  - Lifestyle shots: the screen faces **away** from the camera, so no fake interface shows.
  - Phone shots used for screen fitting: the screen is a flat, uniform **chroma-key green (#00FF00)** with no interface, text, glare or reflections. Nothing covers it: no finger or thumb on the glass.
  - No brand logos anywhere.
- **Length:** keep each part tight. A prompt runs about 150 to 230 words; past that, models start dropping details.

---

## H1: Hero, two hands (16:9) → `hero-v4.jpg`

The hands are a Zimbabwean businesswoman's, with a warm medium-brown complexion (changed from a man's on 2026-11-03 at Tadiwa's request).

What made the hero work, learned from earlier attempts:
- give the phone exact proportions (19.5:9, softly rounded corners);
- ask for a symmetrical composition centred left to right;
- say the rim light comes from **out-of-frame sources**, with no fixtures visible (Seedream 4.5 otherwise draws glowing tubes);
- describe the grip by its purpose ("the way you hold up a phone to show someone your screen").

```
Photorealistic commercial product photograph for a premium software launch, shot in a dark studio.
SUBJECT: the two hands of a Zimbabwean businesswoman with a warm medium-brown complexion rise from the bottom of the frame and hold a modern smartphone upright in portrait orientation, perfectly centred left to right, the way you hold up a phone to show someone your screen. Slender, elegant fingers with short, neat nails in a natural nude polish; a thin gold band on the right ring finger. The left hand wraps the left side and bottom-left corner, thumb lying flat along the left edge of the frame; the right hand wraps the right side and bottom-right corner, fingertips curled lightly behind the phone. Both thumbs stay on the metal frame; nothing touches or covers the screen. The cuffs of a tailored ivory blazer show at both wrists.
PHONE: modern frameless smartphone with 19.5:9 proportions, softly rounded corners, thin dark titanium frame, no notch, no logos. The screen faces the lens straight on, flat and parallel to the sensor. The whole display is one flat, evenly lit, matte, pure chroma-key green (#00FF00), edge to edge: no interface, no text, no reflection, no glare.
CAMERA: full-frame, 85mm lens, f/5.6, lens centred on the screen at the same height; the phone fills the central 55% of the frame height; symmetrical composition with equal dark space left and right.
LIGHTING: low-key. Lime-green (#9BD83D) rim light from out-of-frame sources behind the subject on both sides traces the knuckles, fingers and phone edges; no light fixtures visible anywhere. Soft, dim neutral front fill so skin texture reads naturally.
BACKGROUND: plain seamless near-black (#070B0D) with a faint deep-teal haze (#0F2A28) behind the phone; nothing else in frame.
FINISH: natural warm medium-brown skin with true texture, high micro-contrast, tack sharp, subtle film grain.
```

## H2 and H3: Stage phones (3:4) → `stage-v3.jpg`, `stage-alt-v3.jpg`

Generated with the approved hero (H1) passed as an **image reference**, so the studio, the light, the hands and the phone match. Only the hand and the angle change.

H2 (right hand, used in the module showcase):

```
Photorealistic commercial product photograph, the same shoot as the reference image: match its dark studio, near-black background with deep-teal haze, lime-green rim light, the same woman's warm medium-brown skin, slender fingers with nude nails and thin gold band, the ivory blazer cuff, and the same phone design exactly.
SUBJECT: this time a single right hand of the same woman rises from the bottom-right corner and holds the phone upright, leaning about 8 degrees to the left, screen facing the camera. Fingers wrap the right edge and the bottom; the thumb rests on the right edge of the metal frame. Nothing touches or covers the screen.
PHONE: 19.5:9 proportions, softly rounded corners, thin dark titanium frame, no notch, no logos. The whole display is one flat, evenly lit, matte, pure chroma-key green (#00FF00), edge to edge: no interface, no text, no reflection, no glare.
CAMERA: full-frame, 85mm lens, f/5.6, lens level with the screen; the phone is large and centred, filling about 65% of the frame height, its top edge about 12% below the top of the frame.
LIGHTING: low-key; lime-green (#9BD83D) rim light from out-of-frame sources behind, tracing the knuckles and phone edges; dim neutral front fill; no light fixtures visible.
BACKGROUND: plain seamless near-black (#070B0D) with a faint deep-teal haze behind the phone.
FINISH: tack sharp, high micro-contrast, subtle film grain.
```

H3 (left hand, used in the Hub bento and the app band) uses the same prompt, with SUBJECT replaced by:

```
SUBJECT: this time a single left hand of the same woman rises from the bottom-left of the frame and cradles the phone upright in a relaxed grip, turned in a gentle three-quarter view of about 15 degrees so its right edge sits slightly further from the camera. Fingers wrap the left edge and the bottom; the thumb rests on the left edge of the metal frame. Nothing touches or covers the screen.
```

## Light-theme twins → `hero-light-v4.jpg`, `stage-light-v3.jpg`, `stage-alt-light-v3.jpg`

Each is an **edit** of its dark photo, passed as the image reference, so the hands, the phone and its screen position stay put. The screen corners match the dark photo's to within 0.1%, so one crop fits both themes.

```
Edit the reference photo into its light-mode version, like the same product shot relit in a bright daylight studio.
KEEP EXACTLY: the same woman's hand(s), warm medium-brown skin, nude nails and ivory blazer cuff(s); the same pose, grip and tilt; the same phone design, position, size and angle; and the same flat, evenly lit, pure chroma-key green screen (#00FF00), edge to edge, with nothing covering it and no reflections.
CHANGE ONLY THE ENVIRONMENT AND LIGHT:
BACKGROUND: a plain seamless studio sweep in a soft, pale grey-green off-white (#F2F4F3), with a very faint mint glow (#E1ECDC) behind the phone; no objects, no dark areas, no vignette.
LIGHTING: high-key and airy. A large soft key light from the upper left (about 5600K) gives gentle, natural shadows on the hands; soft white fill from the right; a thin lime-green (#9BD83D) edge highlight along the phone's frame only.
FINISH: clean commercial look, true-to-life warm medium-brown skin texture, tack sharp, subtle grain.
```

## L1: Sales agencies (3:4) → `who-sales.jpg`

```
Photorealistic editorial lifestyle photograph: the moment a viewing turns into a deal.
SCENE: the sunlit open-plan living room of a modern home in Borrowdale, Harare, late afternoon. Floor-to-ceiling glass doors open onto a lawn, a swimming pool and msasa trees. Warm oak floor, cream linen sofa, a woven Binga basket on a low walnut table.
SUBJECTS: a Black Zimbabwean female estate agent, early 30s, natural hair in a neat low bun, tailored sage-green blazer over a white silk top, holds a smartphone out flat toward a young Black Zimbabwean couple. The wife, in a mustard knit top, signs on the phone screen with her index finger, smiling with relief. The husband, in a navy linen shirt, leans in with a hand on her shoulder, grinning. The agent watches them with a warm, confident, closed-mouth smile. Relaxed, unposed body language. The phone screen faces away from the camera.
CAMERA: 35mm lens, f/2, chest height, three-quarter angle; the three people fill the right two-thirds of the frame; the garden falls into soft bokeh.
LIGHTING: warm golden-hour sun (about 3200K) raking through the glass from frame left, soft bounce fill from the right, gentle highlights on cheekbones.
GRADE: warm highlights, deep teal-green shadows, natural skin tones, one lime-green accent from a cushion.
FINISH: photorealistic, fine skin texture, subtle film grain, no text, no logos.
```

## L2: Property managers (3:4) → `who-property-managers.jpg`

```
Photorealistic editorial lifestyle photograph: a repair request handled on the spot.
SCENE: the kitchen of a tidy, modern rental apartment in Avondale, Harare, mid-morning. White shaker cabinets, a grey quartz counter, a stainless sink, a window with a view of jacaranda branches.
SUBJECTS: a Black Zimbabwean male property manager, early 40s, short cropped hair and a neatly trimmed beard, navy quarter-zip over a light-blue collared shirt, crouches beside the open cupboard under the sink and photographs a dripping pipe with his smartphone held in both hands. His expression is attentive and calm, brow slightly furrowed in concentration. Standing beside him, a Black Zimbabwean female tenant in her late 20s, in a soft grey cardigan, arms loosely folded, explains the leak; she looks reassured, with a small, grateful smile. The phone screen faces away from the camera.
CAMERA: 35mm lens, f/2.2, low angle at about waist height, three-quarter view; both people in the right half of the frame; the window softly out of focus.
LIGHTING: bright, soft daylight (5600K) from the window behind, warm bounce from the cabinets, a faint lime-green rim on his shoulder.
GRADE: clean neutrals, deep teal-green shadows, natural skin tones.
FINISH: photorealistic, fine detail, subtle film grain, no text, no logos.
```

## L3: Valuation firms (3:4) → `who-valuers.jpg`

```
Photorealistic editorial lifestyle photograph: a valuer at work in a leafy Harare suburb.
SCENE: a quiet, tree-lined avenue in Mount Pleasant, Harare, at golden hour in October. A modern single-storey house sits behind a cream boundary wall with a dark steel gate; a large jacaranda tree in full purple bloom overhangs the street; fallen purple blossoms dot the tarmac.
SUBJECT: a Black Zimbabwean female property valuer, mid 40s, short natural hair, gold stud earrings, tailored camel trench coat over a black turtleneck, holds her smartphone up at eye level to photograph the house's facade. Her expression is focused and quietly confident, lips slightly pressed, eyes on the screen. She stands on the pavement in the left third of the frame, body turned three-quarters towards the house. The phone screen faces away from the camera.
CAMERA: 50mm lens, f/2.8, eye level from slightly behind her right shoulder; the house sharp enough to read, the far street in soft bokeh.
LIGHTING: low warm sun (about 3000K) from behind the house, glowing through the jacaranda petals and rimming her hair and shoulders; soft shade on her face.
GRADE: warm amber highlights, deep teal shadows, saturated but natural purple blossoms.
FINISH: photorealistic, fine detail, subtle film grain, no text, no logos.
```

## L4: Developers (3:4) → `who-developers.jpg`

```
Photorealistic editorial lifestyle photograph: a developer checking stand sales on site.
SCENE: a newly serviced residential stands development on the eastern edge of Harare at dusk. Freshly graded red-earth roads, survey pegs with orange tape marking the plots, a stack of bricks, two half-built brick houses and a water tower in the distance; Harare's low skyline on the horizon under a wide amber and violet sky.
SUBJECTS: a Black Zimbabwean male property developer, about 50, close-cropped grey-flecked hair, white hard hat, sleeves rolled on a crisp white shirt, stands on a plot holding his smartphone at chest height and smiles with quiet pride at what he sees on it. Beside him, a younger Black Zimbabwean site foreman in a hi-vis vest and work boots points out across the stands, mid-sentence, animated. The phone screen faces away from the camera.
CAMERA: 35mm lens, f/2.8, low angle at hip height, the two men in the left half of the frame, the stands and skyline stretching away to the right.
LIGHTING: the last warm light of sunset (about 2800K) from frame right rims both men; cool blue ambient fill from the sky.
GRADE: warm amber sky, deep teal shadows, rich red earth, natural skin tones.
FINISH: photorealistic, fine detail, subtle film grain, no text, no logos.
```

---

## In-app photos (Seedream 5.0 Pro, 1k)

These are the small photos shown inside the phone screens. They follow the same structure but are lit differently by purpose.
- **Inspection and repair photos** must look like what an inspector actually takes on a phone: handheld, deep depth of field, flat daylight, no styling.
- **Brochure photos** must look like professional listing photography: tilt-shift, straight verticals, golden hour.

### Cracked window (1:1) → `thumb-window-v2.jpg` (repair request, inspection)

```
Realistic smartphone photo taken by a property inspector to document damage for a repair request.
SCENE: the main bedroom window of a modern rental apartment in Avondale, Harare, mid-morning. A white aluminium sliding window frame; the lower-left glass pane has a clear diagonal crack running from the bottom corner, with a small spider-web impact point. Through the glass, softly out of focus: jacaranda branches and a pale blue sky.
CAMERA: shot handheld on a phone, about 60cm from the glass, straight on and slightly from below, the crack centred and in sharp focus; natural phone-camera look with deep depth of field.
LIGHTING: bright, even daylight from outside (about 5600K), no flash, no reflections of the photographer.
GRADE: true-to-life colours, clean whites, no stylisation.
FINISH: photorealistic, documentary, sharp detail on the crack, no people, no text, no watermark.
```

### Bedroom (1:1) → `thumb-bedroom-v2.jpg` (repair request, inspection, brochure)

```
Realistic smartphone photo taken by a property inspector during a routine inspection.
SCENE: the main bedroom of a tidy, modern rental apartment in Avondale, Harare, mid-morning. A neatly made double bed with white linen and a sage-green throw, a light oak bedside table with a ceramic lamp, cream walls, a light grey tiled floor, a large window with sheer white curtains on the left.
CAMERA: shot handheld on a phone from the doorway at standing eye level, slightly wide (about 24mm equivalent), the whole room visible, level horizon; natural phone-camera look with deep depth of field.
LIGHTING: soft daylight from the window (about 5600K), gentle shadows, no flash.
GRADE: true-to-life neutral colours, no stylisation.
FINISH: photorealistic, documentary, no people, no text, no watermark.
```

### Living room (1:1) → `thumb-living-v2.jpg` (inspection, brochure)

```
Realistic smartphone photo taken by a property inspector during a routine inspection.
SCENE: the open-plan living room of a modern rental apartment in Avondale, Harare, late morning. A charcoal fabric three-seater sofa with two mustard cushions, a low walnut coffee table, a woven Binga basket, a jute rug on light grey tiles, white walls, a sliding door onto a small balcony with potted plants.
CAMERA: shot handheld on a phone from a corner of the room at standing eye level, slightly wide (about 24mm equivalent), level horizon; natural phone-camera look with deep depth of field.
LIGHTING: soft daylight through the balcony door (about 5600K), no flash.
GRADE: true-to-life neutral colours, no stylisation.
FINISH: photorealistic, documentary, clean and well kept, no people, no text, no watermark.
```

### House front (1:1) → `thumb-house-v2.jpg` (SyncMedia brochure hero)

```
Professional real-estate listing photograph for a property brochure.
SCENE: the front of a modern four-bedroom family home in Borrowdale, Harare, at golden hour. Clean contemporary architecture: white rendered walls, a dark grey standing-seam roof, large floor-to-ceiling windows glowing with warm interior light, a natural stone feature wall, a wide paved driveway, a manicured green lawn, tall palms and a msasa tree, a low cream boundary wall with a dark steel gate.
CAMERA: full-frame, 24mm tilt-shift lens, f/8, shot from the edge of the lawn at chest height, verticals perfectly straight, the house filling two-thirds of the frame.
LIGHTING: warm low sun (about 3500K) from the left raking across the facade, deep blue-hour sky beginning on the right, interior lights on.
GRADE: rich but natural colours, warm highlights, clean whites, lush greens.
FINISH: photorealistic, crisp architectural detail, no people, no cars, no text, no watermark, no signage.
```

### Pool and garden (4:3) → `thumb-house-detail-v2.jpg` (SyncMedia brochure strip)

```
Professional real-estate listing photograph for a property brochure.
SCENE: the garden of a modern family home in Borrowdale, Harare, at golden hour: a rectangular swimming pool with clear turquoise water and a dark tiled edge, two white loungers on a light stone deck, a covered patio with a timber pergola, bougainvillea in pink bloom along a white boundary wall, and the house's glass doors glowing behind.
CAMERA: full-frame, 24mm lens, f/8, shot from the far corner of the pool at chest height, level horizon, the pool leading the eye to the house.
LIGHTING: warm low sun (about 3500K) from the right, soft reflections on the water.
GRADE: rich but natural colours, warm highlights, clean whites.
FINISH: photorealistic, crisp detail, no people, no text, no watermark.
```

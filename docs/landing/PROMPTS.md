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

## H1: Hero, two hands (16:9) → `hero.jpg`

The first attempt (and a Seedream 4.5 attempt) came back off-centre, with odd phone proportions, and 4.5 drew the "rim lights" as glowing tubes in the background. The fixes that worked:
- give the phone exact proportions (19.5:9, softly rounded corners);
- ask for a symmetrical composition centred left to right;
- say the rim light comes from **out-of-frame sources**, with no fixtures visible;
- describe the grip by its purpose ("the way you hold up a phone to show someone your screen").

```
Photorealistic commercial product photograph for a premium software launch, shot in a dark studio.
SUBJECT: a Black Zimbabwean businessman's two hands rise from the bottom of the frame and hold a modern smartphone upright in portrait orientation, perfectly centred left to right, the way you hold up a phone to show someone your screen. The left hand wraps the left side and bottom-left corner, thumb lying flat along the left edge of the frame; the right hand wraps the right side and bottom-right corner, fingertips curled lightly behind the phone. Both thumbs stay on the metal frame; nothing touches or covers the screen. Crisp white shirt cuffs under charcoal wool suit sleeves at both wrists.
PHONE: modern frameless smartphone with 19.5:9 proportions, softly rounded corners, thin dark titanium frame, no notch, no logos. The screen faces the lens straight on, flat and parallel to the sensor. The whole display is one flat, evenly lit, matte, pure chroma-key green (#00FF00), edge to edge: no interface, no text, no reflection, no glare.
CAMERA: full-frame, 85mm lens, f/5.6, lens centred on the screen at the same height; the phone fills the central 55% of the frame height; symmetrical composition with equal dark space left and right.
LIGHTING: low-key. Lime-green (#9BD83D) rim light from out-of-frame sources behind the subject on both sides traces the knuckles, fingers and phone edges; no light fixtures or light tubes visible anywhere. Soft, dim neutral front fill so skin texture and knuckle creases read.
BACKGROUND: plain seamless near-black (#070B0D) with a faint deep-teal haze (#0F2A28) behind the phone; nothing else in frame.
FINISH: natural deep brown skin tones, high micro-contrast, tack sharp, subtle film grain.
```

## H2 and H3: Stage phones (3:4) → `stage.jpg`, `stage-alt.jpg`

Generated with the approved hero (H1) passed as an **image reference**, so the studio, the light, the skin tone, the sleeve and the phone match. Only the hand and the angle change.

H2 (right hand, used in the module showcase):

```
Photorealistic commercial product photograph, the same shoot as the reference image: match its dark studio, near-black background with deep-teal haze, lime-green rim light, natural deep brown skin tone, charcoal suit sleeve with white shirt cuff, and the same phone design exactly.
SUBJECT: this time a single right hand of the same Black Zimbabwean businessman rises from the bottom-right corner and holds the phone upright, leaning about 8 degrees to the right, screen facing the camera. Fingers wrap the right edge and the bottom; the thumb rests on the right edge of the metal frame. Nothing touches or covers the screen.
PHONE: 19.5:9 proportions, softly rounded corners, thin dark titanium frame, no notch, no logos. The whole display is one flat, evenly lit, matte, pure chroma-key green (#00FF00), edge to edge: no interface, no text, no reflection, no glare.
CAMERA: full-frame, 85mm lens, f/5.6, lens level with the screen; the phone is large and centred, filling about 65% of the frame height, its top edge about 12% below the top of the frame.
LIGHTING: low-key; lime-green (#9BD83D) rim light from out-of-frame sources behind, tracing the knuckles and phone edges; dim neutral front fill; no light fixtures visible.
BACKGROUND: plain seamless near-black (#070B0D) with a faint deep-teal haze behind the phone.
FINISH: tack sharp, high micro-contrast, subtle film grain.
```

H3 (left hand, used in the Hub bento and the app band) uses the same prompt, with SUBJECT replaced by:

```
SUBJECT: this time a single left hand of the same Black Zimbabwean businessman rises from the bottom-left of the frame and cradles the phone upright in a relaxed grip, turned in a gentle three-quarter view of about 15 degrees so its right edge sits slightly further from the camera. Fingers wrap the left edge and the bottom; the thumb rests on the left edge of the metal frame. Nothing touches or covers the screen.
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

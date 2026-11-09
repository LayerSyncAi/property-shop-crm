import { formatShape } from "@/lib/syncmedia/formats";
import {
  BrandTile,
  CLIPPABLE,
  ContactLines,
  Placeholder,
  SANS,
  SERIF,
  Slot,
  ThumbStrip,
  photoFill,
  unit,
  usableFeatures,
  usablePhotos,
  type TemplateProps,
} from "./shared";

/**
 * Hard split between photo and a solid colour panel. The most graphic of the
 * set and the most legible at thumbnail size, because the colour block reads
 * before any of the type does.
 *
 * The split runs side-by-side on wide and square canvases and stacks on tall
 * ones, so neither half is ever squeezed into a sliver.
 */
export function Split({ doc, theme, preset, brand }: TemplateProps) {
  const s = unit(preset);
  const { isWide, isTall, aspect } = formatShape(preset);
  const horizontal = aspect > 0.95;
  const pad = isWide ? 54 : 68;
  const titleSize = isWide ? 56 : isTall ? 76 : 60;

  const photos = usablePhotos(doc, 3);
  const thumbs = photos.slice(1);

  // Sized so the list fits outright. The clip guard below is a backstop for a
  // freak title length, not the normal path — a bullet sliced through the
  // middle reads as a rendering fault, not as an intentional trim.
  const featureLimit = isWide ? 3 : horizontal ? 4 : thumbs.length > 0 ? 3 : 5;
  const features = usableFeatures(doc, featureLimit);
  // Stacking thumbnails costs the panel height it needs for the feature list,
  // so the photo half gives some back when there are extras. Without this the
  // clip guard silently drops all but one feature on a portrait canvas.
  const photoShare = horizontal ? "48%" : thumbs.length > 0 ? "38%" : "46%";
  const photoSide = { flex: `0 0 ${photoShare}` };

  // Extras split the photo half along its long edge, so the panel keeps its
  // full width and the split still reads as two blocks rather than a collage.
  const photo =
    photos[0] === undefined ? (
      <Placeholder theme={theme} scale={s} style={photoSide} />
    ) : thumbs.length > 0 ? (
      <div
        style={{
          ...photoSide,
          display: "flex",
          flexDirection: horizontal ? "column" : "row",
          gap: s(8),
        }}
      >
        <Slot
          id="hero"
          doc={doc}
          preset={preset}
          style={{ flex: "1.9 1 0", minHeight: 0, minWidth: 0, ...photoFill(photos[0]) }}
        >
          {null}
        </Slot>
        <Slot id="thumbs" doc={doc} preset={preset} style={{ flexShrink: 0 }}>
          <ThumbStrip
            photos={thumbs}
            vertical={!horizontal}
            thickness={s(horizontal ? 190 : 220)}
            radius="0px"
            gap={s(8)}
          />
        </Slot>
      </div>
    ) : (
      <Slot id="hero" doc={doc} preset={preset} style={{ ...photoSide, ...photoFill(photos[0]) }}>
        {null}
      </Slot>
    );

  const panel = (
    <div
      style={{
        flex: "1 1 0",
        minWidth: 0,
        minHeight: 0,
        backgroundColor: theme.accent,
        color: theme.onAccent,
        padding: s(pad),
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: s(28),
      }}
    >
      <Slot
        id="logo"
        doc={doc}
        preset={preset}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: s(20),
          flexShrink: 0,
        }}
      >
        {doc.showLogo ? (
          <BrandTile
            size={s(66)}
            bg="rgba(255,255,255,0.18)"
            fg={theme.onAccent}
            radius={s(16)}
            brand={brand}
          />
        ) : (
          <span />
        )}
        {doc.eyebrow ? (
          <span
            style={{
              fontFamily: SANS,
              fontSize: s(21),
              fontWeight: 800,
              letterSpacing: s(4),
              opacity: 0.85,
            }}
          >
            {doc.eyebrow.toUpperCase()}
          </span>
        ) : null}
      </Slot>

      <Slot
        id="headline"
        doc={doc}
        preset={preset}
        style={{ display: "flex", flexDirection: "column", gap: s(16), ...CLIPPABLE }}
      >
        <h1
          style={{
            margin: 0,
            fontFamily: SERIF,
            fontWeight: 700,
            fontSize: s(titleSize),
            lineHeight: 1.05,
          }}
        >
          {doc.title || "Property title"}
        </h1>

        {doc.location ? (
          <p
            style={{
              margin: 0,
              fontFamily: SANS,
              fontSize: s(27),
              opacity: 0.82,
              lineHeight: 1.3,
            }}
          >
            {doc.location}
          </p>
        ) : null}

        {features.length > 0 ? (
          <Slot
            id="features"
            doc={doc}
            preset={preset}
            style={{
              marginTop: s(12),
              paddingTop: s(22),
              borderTop: `${s(2)} solid rgba(255,255,255,0.25)`,
              display: "flex",
              flexDirection: "column",
              gap: s(11),
            }}
          >
            {features.map((feature, i) => (
              <span
                key={i}
                style={{
                  fontFamily: SANS,
                  fontSize: s(24),
                  fontWeight: 600,
                  lineHeight: 1.3,
                  opacity: 0.95,
                }}
              >
                {feature}
              </span>
            ))}
          </Slot>
        ) : null}
      </Slot>

      <Slot id="price" doc={doc} preset={preset} style={{ flexShrink: 0 }}>
        {doc.priceLabel ? (
          <p
            style={{
              margin: 0,
              fontFamily: SANS,
              fontSize: s(18),
              fontWeight: 700,
              letterSpacing: s(3),
              opacity: 0.7,
            }}
          >
            {doc.priceLabel.toUpperCase()}
          </p>
        ) : null}
        <p
          style={{
            margin: `${s(8)} 0 ${s(22)}`,
            fontFamily: SERIF,
            fontWeight: 700,
            fontSize: s(isWide ? 48 : 58),
            lineHeight: 1,
          }}
        >
          {doc.price || "—"}
        </p>
        <Slot
          id="contact"
          doc={doc}
          preset={preset}
          style={{
            paddingTop: s(20),
            borderTop: `${s(2)} solid rgba(255,255,255,0.25)`,
          }}
        >
          <ContactLines
            doc={doc}
            scale={s}
            color={theme.onAccent}
            mutedColor={theme.onAccent}
            behind={theme.accent}
            nameSize={25}
            detailSize={23}
          />
        </Slot>
      </Slot>
    </div>
  );

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: horizontal ? "row" : "column",
        backgroundColor: theme.page,
        overflow: "hidden",
      }}
    >
      {photo}
      {panel}
    </div>
  );
}

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
 * Magazine spread: a single hero photo above a quiet text block, closed by a
 * solid contact bar. Reads as a property listing sheet.
 *
 * Wide canvases put the photo beside the text instead of above it — stacking
 * inside 630px of height would leave the copy with nowhere to go.
 */
export function Editorial({ doc, theme, preset, brand }: TemplateProps) {
  const s = unit(preset);
  const { isWide, isTall, isPrint } = formatShape(preset);
  const features = usableFeatures(doc, isWide ? 3 : isTall || isPrint ? 6 : 4);
  const pad = isWide ? 56 : 72;
  const titleSize = isWide ? 54 : isTall ? 82 : isPrint ? 74 : 66;

  const header = (
    <Slot
      id="logo"
      doc={doc}
      preset={preset}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: `${s(pad)} ${s(pad)} ${s(pad * 0.5)}`,
        flexShrink: 0,
      }}
    >
      {doc.showLogo ? (
        <BrandTile
          size={s(72)}
          bg={theme.accent}
          fg={theme.onAccent}
          radius={s(16)}
          brand={brand}
        />
      ) : (
        <span />
      )}
      {doc.reference ? (
        <span
          style={{
            fontFamily: SANS,
            fontSize: s(22),
            fontWeight: 700,
            letterSpacing: s(3),
            color: theme.inkSoft,
          }}
        >
          {doc.reference.toUpperCase()}
        </span>
      ) : null}
    </Slot>
  );

  // Gives up height before the copy does, but never disappears entirely.
  const photoBox = { flex: "1 1 0", minHeight: s(200) };
  const photos = usablePhotos(doc, 4);
  const thumbs = photos.slice(1);

  const hero = (
    <Slot id="hero" doc={doc} preset={preset} style={photoBox}>
      {photos[0] ? (
        <div style={{ width: "100%", height: "100%", ...photoFill(photos[0]) }} />
      ) : (
        <Placeholder theme={theme} scale={s} style={{ width: "100%", height: "100%" }} />
      )}
    </Slot>
  );

  // One photo stays a clean full-width hero; extras become a rail beneath it
  // rather than being dropped.
  const photo =
    thumbs.length > 0 ? (
      <div
        style={{
          flex: "1 1 0",
          minHeight: s(240),
          display: "flex",
          flexDirection: "column",
          gap: s(10),
        }}
      >
        {hero}
        <Slot id="thumbs" doc={doc} preset={preset}>
          <ThumbStrip
            photos={thumbs}
            vertical={false}
            thickness={s(isWide ? 120 : 150)}
            radius={s(6)}
            gap={s(10)}
          />
        </Slot>
      </div>
    ) : (
      hero
    );

  const body = (
    <Slot
      id="headline"
      doc={doc}
      preset={preset}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: s(18),
        padding: `${s(pad * 0.72)} ${s(pad)}`,
        ...CLIPPABLE,
      }}
    >
      {doc.eyebrow ? (
        <span
          style={{
            fontFamily: SANS,
            fontSize: s(22),
            fontWeight: 800,
            letterSpacing: s(5),
            color: theme.accent,
          }}
        >
          {doc.eyebrow.toUpperCase()}
        </span>
      ) : null}

      <h1
        style={{
          margin: 0,
          fontFamily: SERIF,
          fontWeight: 700,
          fontSize: s(titleSize),
          lineHeight: 1.06,
          color: theme.ink,
        }}
      >
        {doc.title || "Property title"}
      </h1>

      {doc.location ? (
        <p
          style={{
            margin: 0,
            fontFamily: SANS,
            fontSize: s(28),
            color: theme.inkSoft,
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
          style={{ display: "flex", flexWrap: "wrap", gap: s(12), marginTop: s(6) }}
        >
          {features.map((feature, i) => (
            <span
              key={i}
              style={{
                fontFamily: SANS,
                fontSize: s(22),
                fontWeight: 600,
                color: theme.onAccentSoft,
                backgroundColor: theme.accentSoft,
                padding: `${s(11)} ${s(22)}`,
                borderRadius: s(999),
                whiteSpace: "nowrap",
              }}
            >
              {feature}
            </span>
          ))}
        </Slot>
      ) : null}
    </Slot>
  );

  const footer = (
    <div
      style={{
        backgroundColor: theme.accent,
        color: theme.onAccent,
        padding: `${s(pad * 0.62)} ${s(pad)}`,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: s(32),
        flexShrink: 0,
      }}
    >
      <Slot id="price" doc={doc} preset={preset} style={{ minWidth: 0 }}>
        {doc.priceLabel ? (
          <p
            style={{
              margin: 0,
              fontFamily: SANS,
              fontSize: s(19),
              fontWeight: 700,
              letterSpacing: s(3),
              opacity: 0.75,
            }}
          >
            {doc.priceLabel.toUpperCase()}
          </p>
        ) : null}
        <p
          style={{
            margin: `${s(8)} 0 0`,
            fontFamily: SERIF,
            fontWeight: 700,
            fontSize: s(isWide ? 46 : 58),
            lineHeight: 1,
          }}
        >
          {doc.price || "—"}
        </p>
      </Slot>

      <Slot id="contact" doc={doc} preset={preset} style={{ minWidth: 0 }}>
        <ContactLines
          doc={doc}
          scale={s}
          color={theme.onAccent}
          mutedColor={theme.onAccent}
          behind={theme.accent}
          align="right"
        />
      </Slot>
    </div>
  );

  if (isWide) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          backgroundColor: theme.page,
          overflow: "hidden",
        }}
      >
        <div style={{ width: "44%", display: "flex", flexDirection: "column" }}>{photo}</div>
        <div
          style={{
            width: "56%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          {header}
          {body}
          {footer}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: theme.page,
        overflow: "hidden",
      }}
    >
      {header}
      {photo}
      {body}
      {footer}
    </div>
  );
}

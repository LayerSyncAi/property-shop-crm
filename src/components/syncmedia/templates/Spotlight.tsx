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
 * A framed photo floating on a field of brand colour, with the price given the
 * largest type on the canvas. Built for the "just listed / price reduced"
 * post, where the number is the message.
 */
export function Spotlight({ doc, theme, preset, brand }: TemplateProps) {
  const s = unit(preset);
  const { isWide, isTall } = formatShape(preset);
  const features = usableFeatures(doc, isWide ? 3 : 4);
  const pad = isWide ? 50 : 66;
  const titleSize = isWide ? 44 : isTall ? 64 : 52;
  const priceSize = isWide ? 66 : isTall ? 104 : 82;

  const photos = usablePhotos(doc, 3);
  const thumbs = photos.slice(1);
  const frameStyle = {
    flex: "1 1 0",
    minHeight: s(200),
    minWidth: 0,
    borderRadius: s(28),
    border: `${s(10)} solid ${theme.onAccent}`,
  };

  const hero = photos[0] ? (
    <Slot
      id="hero"
      doc={doc}
      preset={preset}
      style={{
        ...frameStyle,
        boxShadow: `0 ${s(18)} ${s(46)} rgba(0,0,0,0.28)`,
        ...photoFill(photos[0]),
      }}
    >
      {null}
    </Slot>
  ) : (
    <Placeholder theme={theme} scale={s} style={frameStyle} />
  );

  // Extras get the same frame as the hero, at a size that reads as supporting
  // rather than competing.
  const frame =
    thumbs.length > 0 ? (
      <div
        style={{
          flex: "1 1 0",
          minHeight: s(240),
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          gap: s(12),
        }}
      >
        {hero}
        <Slot id="thumbs" doc={doc} preset={preset}>
          <ThumbStrip
            photos={thumbs}
            vertical={false}
            thickness={s(isWide ? 110 : 140)}
            radius={s(16)}
            gap={s(12)}
            border={`${s(6)} solid ${theme.onAccent}`}
          />
        </Slot>
      </div>
    ) : (
      hero
    );

  const copy = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: s(14),
        ...CLIPPABLE,
        textAlign: isWide ? "left" : "center",
        alignItems: isWide ? "flex-start" : "center",
        width: isWide ? "42%" : "100%",
      }}
    >
      <Slot id="headline" doc={doc} preset={preset}>
        <h1
          style={{
            margin: 0,
            fontFamily: SERIF,
            fontWeight: 700,
            fontSize: s(titleSize),
            lineHeight: 1.08,
            color: theme.onAccent,
          }}
        >
          {doc.title || "Property title"}
        </h1>

        {doc.location ? (
          <p
            style={{
              margin: `${s(14)} 0 0`,
              fontFamily: SANS,
              fontSize: s(25),
              color: theme.onAccent,
              opacity: 0.8,
            }}
          >
            {doc.location}
          </p>
        ) : null}
      </Slot>

      {features.length > 0 ? (
        <Slot
          id="features"
          doc={doc}
          preset={preset}
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: s(10),
            justifyContent: isWide ? "flex-start" : "center",
            marginTop: s(4),
          }}
        >
          {features.map((feature, i) => (
            <span
              key={i}
              style={{
                fontFamily: SANS,
                fontSize: s(21),
                fontWeight: 700,
                color: theme.onAccent,
                border: `${s(2)} solid rgba(255,255,255,0.4)`,
                padding: `${s(9)} ${s(20)}`,
                borderRadius: s(999),
                whiteSpace: "nowrap",
              }}
            >
              {feature}
            </span>
          ))}
        </Slot>
      ) : null}

      <Slot id="price" doc={doc} preset={preset} style={{ marginTop: s(14) }}>
        {doc.priceLabel ? (
          <p
            style={{
              margin: 0,
              fontFamily: SANS,
              fontSize: s(19),
              fontWeight: 700,
              letterSpacing: s(4),
              color: theme.onAccent,
              opacity: 0.7,
            }}
          >
            {doc.priceLabel.toUpperCase()}
          </p>
        ) : null}
        <p
          style={{
            margin: `${s(6)} 0 0`,
            fontFamily: SERIF,
            fontWeight: 700,
            fontSize: s(priceSize),
            lineHeight: 1,
            color: theme.onAccent,
          }}
        >
          {doc.price || "—"}
        </p>
      </Slot>
    </div>
  );

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: theme.accent,
        overflow: "hidden",
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
          padding: `${s(pad * 0.7)} ${s(pad)} ${s(pad * 0.4)}`,
          flexShrink: 0,
        }}
      >
        {doc.showLogo ? (
          <BrandTile
            size={s(62)}
            bg="rgba(255,255,255,0.18)"
            fg={theme.onAccent}
            radius={s(15)}
            brand={brand}
          />
        ) : (
          <span />
        )}
        {doc.eyebrow ? (
          <span
            style={{
              fontFamily: SANS,
              fontSize: s(22),
              fontWeight: 800,
              letterSpacing: s(4),
              color: theme.onAccent,
              opacity: 0.85,
            }}
          >
            {doc.eyebrow.toUpperCase()}
          </span>
        ) : null}
      </Slot>

      <div
        style={{
          flex: "1 1 0",
          minHeight: 0,
          display: "flex",
          flexDirection: isWide ? "row" : "column",
          alignItems: "stretch",
          gap: s(isWide ? 44 : 34),
          padding: `0 ${s(pad)}`,
        }}
      >
        {frame}
        {copy}
      </div>

      <div
        style={{
          marginTop: s(pad * 0.55),
          backgroundColor: theme.onAccent,
          color: theme.accent,
          padding: `${s(26)} ${s(pad)}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: s(24),
          flexShrink: 0,
        }}
      >
        <Slot id="contact" doc={doc} preset={preset} style={{ minWidth: 0 }}>
          <ContactLines
            doc={doc}
            scale={s}
            color={theme.accent}
            mutedColor={theme.accent}
            behind={theme.onAccent}
            nameSize={26}
            detailSize={24}
            extra={doc.reference}
          />
        </Slot>
      </div>
    </div>
  );
}

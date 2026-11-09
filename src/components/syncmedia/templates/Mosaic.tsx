import { formatShape } from "@/lib/syncmedia/formats";
import {
  BrandTile,
  CLIPPABLE,
  ContactLines,
  Placeholder,
  SANS,
  SERIF,
  Slot,
  photoFill,
  unit,
  usableFeatures,
  usablePhotos,
  type TemplateProps,
} from "./shared";

/**
 * The listing-sheet layout: a hero plus a thumbnail strip, then a two-column
 * feature list. Shows the most photos of any template, so it is what an agent
 * reaches for when the interior matters as much as the frontage.
 */
export function Mosaic({ doc, theme, preset, brand }: TemplateProps) {
  const s = unit(preset);
  const { isWide, isTall, isPrint } = formatShape(preset);
  const features = usableFeatures(doc, isWide ? 4 : 6);
  const pad = isWide ? 52 : 64;
  const titleSize = isWide ? 48 : isTall ? 74 : isPrint ? 66 : 58;
  const photos = usablePhotos(doc, 4);
  const thumbs = photos.slice(1);
  const heroRadius = s(24);

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
      {/* Brand band */}
      <div
        style={{
          backgroundColor: theme.accent,
          color: theme.onAccent,
          padding: `${s(pad * 0.5)} ${s(pad)}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: s(24),
          flexShrink: 0,
        }}
      >
        <Slot
          id="logo"
          doc={doc}
          preset={preset}
          style={{ display: "flex", alignItems: "center", gap: s(20) }}
        >
          {doc.showLogo ? (
            <BrandTile
              size={s(60)}
              bg="rgba(255,255,255,0.18)"
              fg={theme.onAccent}
              radius={s(14)}
              brand={brand}
            />
          ) : null}
          <span
            style={{
              fontFamily: SANS,
              fontSize: s(24),
              fontWeight: 800,
              letterSpacing: s(4),
            }}
          >
            {(doc.eyebrow || brand.orgName).toUpperCase()}
          </span>
        </Slot>
        {doc.reference ? (
          <span
            style={{
              fontFamily: SANS,
              fontSize: s(22),
              fontWeight: 700,
              letterSpacing: s(2),
              opacity: 0.85,
            }}
          >
            {doc.reference.toUpperCase()}
          </span>
        ) : null}
      </div>

      {/* Photo block */}
      <div
        style={{
          flex: "1 1 0",
          minHeight: s(190),
          display: "flex",
          flexDirection: isWide ? "row" : "column",
          gap: s(14),
          padding: `${s(pad * 0.5)} ${s(pad)} 0`,
        }}
      >
        <Slot
          id="hero"
          doc={doc}
          preset={preset}
          style={{ flex: "1 1 0", minHeight: 0, minWidth: 0, borderRadius: heroRadius }}
        >
          {photos[0] ? (
            <div
              style={{
                width: "100%",
                height: "100%",
                borderRadius: heroRadius,
                ...photoFill(photos[0]),
              }}
            />
          ) : (
            <Placeholder
              theme={theme}
              scale={s}
              style={{ width: "100%", height: "100%", borderRadius: heroRadius }}
            />
          )}
        </Slot>

        {thumbs.length > 0 ? (
          <Slot
            id="thumbs"
            doc={doc}
            preset={preset}
            style={{
              display: "flex",
              flexDirection: isWide ? "column" : "row",
              gap: s(14),
              flexShrink: 0,
              // A strip, not a second hero: fixed on the cross axis so the hero
              // keeps the space it earns.
              width: isWide ? s(220) : undefined,
              height: isWide ? undefined : s(190),
            }}
          >
            {thumbs.map((photo, i) => (
              <div
                key={`${photo.ref}-${i}`}
                style={{
                  flex: "1 1 0",
                  minWidth: 0,
                  minHeight: 0,
                  borderRadius: s(16),
                  ...photoFill(photo),
                }}
              />
            ))}
          </Slot>
        ) : null}
      </div>

      {/* Copy */}
      <Slot
        id="headline"
        doc={doc}
        preset={preset}
        style={{ padding: `${s(pad * 0.62)} ${s(pad)} ${s(pad * 0.4)}`, ...CLIPPABLE }}
      >
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
              margin: `${s(10)} 0 0`,
              fontFamily: SANS,
              fontSize: s(26),
              color: theme.inkSoft,
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
              marginTop: s(24),
              display: "grid",
              gridTemplateColumns: isWide ? "1fr 1fr 1fr 1fr" : "1fr 1fr",
              columnGap: s(28),
              rowGap: s(14),
            }}
          >
            {features.map((feature, i) => (
              <div
                key={i}
                style={{ display: "flex", alignItems: "baseline", gap: s(12), minWidth: 0 }}
              >
                <span
                  style={{
                    width: s(9),
                    height: s(9),
                    borderRadius: "50%",
                    backgroundColor: theme.accent,
                    flexShrink: 0,
                    transform: `translateY(${s(-3)})`,
                  }}
                />
                <span
                  style={{
                    fontFamily: SANS,
                    fontSize: s(23),
                    fontWeight: 600,
                    color: theme.ink,
                    lineHeight: 1.35,
                  }}
                >
                  {feature}
                </span>
              </div>
            ))}
          </Slot>
        ) : null}
      </Slot>

      {/* Price + contact */}
      <div
        style={{
          margin: `0 ${s(pad)} ${s(pad * 0.7)}`,
          padding: `${s(28)} ${s(32)}`,
          borderRadius: s(20),
          backgroundColor: theme.accentSoft,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: s(28),
          flexShrink: 0,
        }}
      >
        <Slot id="price" doc={doc} preset={preset} style={{ minWidth: 0 }}>
          {doc.priceLabel ? (
            <p
              style={{
                margin: 0,
                fontFamily: SANS,
                fontSize: s(18),
                fontWeight: 700,
                letterSpacing: s(3),
                color: theme.onAccentSoft,
                opacity: 0.8,
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
              fontSize: s(isWide ? 44 : 54),
              lineHeight: 1,
              color: theme.onAccentSoft,
            }}
          >
            {doc.price || "—"}
          </p>
        </Slot>
        <Slot id="contact" doc={doc} preset={preset} style={{ minWidth: 0 }}>
          <ContactLines
            doc={doc}
            scale={s}
            color={theme.onAccentSoft}
            mutedColor={theme.onAccentSoft}
            behind={theme.accentSoft}
            nameSize={25}
            detailSize={23}
            align="right"
          />
        </Slot>
      </div>
    </div>
  );
}

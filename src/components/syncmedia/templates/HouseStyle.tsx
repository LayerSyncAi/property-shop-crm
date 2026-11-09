import { formatShape } from "@/lib/syncmedia/formats";
import {
  BrandMark,
  CLIPPABLE,
  Placeholder,
  SANS,
  SERIF,
  Slot,
  ThumbStrip,
  WhatsAppBadge,
  photoFill,
  unit,
  usableFeatures,
  usablePhotos,
  type TemplateProps,
} from "./shared";

/**
 * The classic estate-agency one-pager: logo tab, centred headline, hero photo,
 * then a solid colour block carrying the features and the price.
 *
 * Proportions come from a printed 864×1080 brochure — the same 4:5 as the
 * portrait canvas — so on portrait these numbers are its measurements scaled
 * up, and the other formats scale from the same baseline. This is the default
 * layout because it is what agency marketing generally already looks like.
 */
export function HouseStyle({ doc, theme, preset, brand }: TemplateProps) {
  const s = unit(preset);
  const { isWide, isTall } = formatShape(preset);

  const photos = usablePhotos(doc, 4);
  const thumbs = photos.slice(1);
  const features = usableFeatures(doc, isWide ? 4 : 6);

  const pad = isWide ? 52 : 72;
  const titleText = doc.title.trim() || "Property title";

  /**
   * Real listing titles run to "Townhouse/Cluster for sale in Borrowdale", and
   * at a fixed display size they wrap to four lines and shove the photo off the
   * page, so the headline steps down as it lengthens.
   */
  const titleBase =
    titleText.length <= 14 ? 97 : titleText.length <= 26 ? 76 : titleText.length <= 40 ? 60 : 50;
  const titleSize = isWide ? titleBase * 0.62 : isTall ? titleBase * 1.15 : titleBase;
  const subSize = isWide ? 34 : isTall ? 58 : 52;
  const priceSize = isWide ? 60 : isTall ? 104 : 90;
  const featureSize = isWide ? 25 : 32;

  // Thumbnails straddle the seam: a little over half above it, sitting on the
  // hero, the rest below on the accent block.
  const thumbHeight = isWide ? 170 : isTall ? 290 : 254;
  const thumbLift = thumbHeight * 0.58;

  /**
   * "For Sale in Belvedere" under the headline — but only the parts the
   * headline doesn't already say. Listing titles routinely carry both the
   * purpose and the suburb, and repeating them underneath is most of what makes
   * this read as cluttered.
   */
  const alreadyInTitle = (value: string) => {
    const needle = value.trim().toLowerCase();
    return needle.length > 0 && titleText.toLowerCase().includes(needle);
  };
  const suburb = doc.location.split(",")[0] ?? "";
  const subtitleParts: string[] = [];
  if (doc.eyebrow.trim() && !alreadyInTitle(doc.eyebrow)) subtitleParts.push(doc.eyebrow.trim());
  if (suburb.trim() && !alreadyInTitle(suburb)) subtitleParts.push(`in ${suburb.trim()}`);
  const subtitle = subtitleParts.join(" ");

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
      {/* Brand tab, flush with the top edge */}
      {doc.showLogo ? (
        <div style={{ display: "flex", justifyContent: "center", flexShrink: 0 }}>
          <Slot
            id="logo"
            doc={doc}
            preset={preset}
            style={{
              backgroundColor: theme.accent,
              padding: `${s(20)} ${s(52)} ${s(26)}`,
              borderBottomLeftRadius: s(6),
              borderBottomRightRadius: s(6),
            }}
          >
            <BrandMark
              scale={s}
              color={theme.onAccent}
              brand={brand}
              onDark
              markHeight={isWide ? 52 : 76}
              wordSize={isWide ? 24 : 36}
            />
          </Slot>
        </div>
      ) : (
        <div style={{ height: s(pad * 0.5), flexShrink: 0 }} />
      )}

      {/* Headline */}
      <Slot
        id="headline"
        doc={doc}
        preset={preset}
        style={{
          padding: `${s(28)} ${s(pad)} ${s(26)}`,
          textAlign: "center",
          ...CLIPPABLE,
        }}
      >
        <h1
          style={{
            margin: 0,
            fontFamily: SERIF,
            fontWeight: 700,
            fontSize: s(titleSize),
            lineHeight: 1.02,
            color: theme.accent,
          }}
        >
          {titleText}
        </h1>
        {subtitle ? (
          <p
            style={{
              margin: `${s(10)} 0 0`,
              fontFamily: SERIF,
              fontStyle: "italic",
              fontWeight: 500,
              fontSize: s(subSize),
              lineHeight: 1.15,
              color: theme.accent,
            }}
          >
            {subtitle}
          </p>
        ) : null}
      </Slot>

      {/* Hero */}
      <Slot
        id="hero"
        doc={doc}
        preset={preset}
        style={{
          flex: "1 1 0",
          minHeight: s(240),
          margin: `0 ${s(pad)}`,
          borderRadius: s(16),
          overflow: "hidden",
          ...(photos[0] ? photoFill(photos[0]) : {}),
        }}
      >
        {photos[0] ? null : (
          <Placeholder theme={theme} scale={s} style={{ width: "100%", height: "100%" }} />
        )}
      </Slot>

      {/* Accent block */}
      <div
        style={{
          backgroundColor: theme.accent,
          color: theme.onAccent,
          flexShrink: 0,
          paddingBottom: s(30),
        }}
      >
        {/* The wrapper is deliberately a block, not a flex row: as a flex item
            the strip would size to its content, and its photos are flex-basis
            0, so it collapsed to three slivers instead of spanning the width. */}
        {thumbs.length > 0 ? (
          <Slot
            id="thumbs"
            doc={doc}
            preset={preset}
            style={{ margin: `${s(-thumbLift)} ${s(pad + 46)} 0` }}
          >
            <ThumbStrip
              photos={thumbs}
              vertical={false}
              thickness={s(thumbHeight)}
              radius={s(14)}
              gap={s(37)}
              border={`${s(10)} solid ${theme.page}`}
            />
          </Slot>
        ) : null}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: s(30),
            padding: `${s(30)} ${s(pad)} 0`,
          }}
        >
          {features.length > 0 ? (
            <Slot
              id="features"
              doc={doc}
              preset={preset}
              style={{
                display: "grid",
                gridTemplateColumns: features.length > 3 ? "1fr 1fr" : "1fr",
                columnGap: s(30),
                rowGap: s(10),
                minWidth: 0,
                ...CLIPPABLE,
              }}
            >
              {features.map((feature, i) => (
                <div
                  key={i}
                  style={{ display: "flex", alignItems: "baseline", gap: s(14), minWidth: 0 }}
                >
                  <span
                    style={{
                      width: s(10),
                      height: s(10),
                      borderRadius: "50%",
                      backgroundColor: theme.onAccent,
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: SANS,
                      fontSize: s(featureSize),
                      fontWeight: 400,
                      lineHeight: 1.3,
                    }}
                  >
                    {feature}
                  </span>
                </div>
              ))}
            </Slot>
          ) : (
            <span />
          )}

          <Slot
            id="price"
            doc={doc}
            preset={preset}
            style={{ textAlign: "center", flexShrink: 0 }}
          >
            {doc.priceLabel ? (
              <p
                style={{
                  margin: 0,
                  fontFamily: SANS,
                  fontSize: s(isWide ? 20 : 26),
                  fontWeight: 700,
                  letterSpacing: s(0.5),
                }}
              >
                {doc.priceLabel.toUpperCase()}:
              </p>
            ) : null}
            <p
              style={{
                margin: `${s(4)} 0 0`,
                fontFamily: SERIF,
                fontWeight: 700,
                fontSize: s(priceSize),
                lineHeight: 1.02,
              }}
            >
              {doc.price || "—"}
            </p>
          </Slot>
        </div>
      </div>

      {/* Contact bar */}
      <Slot
        id="contact"
        doc={doc}
        preset={preset}
        style={{
          backgroundColor: theme.page,
          color: theme.ink,
          padding: `${s(18)} ${s(pad)}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: s(14),
          flexShrink: 0,
        }}
      >
        {doc.agentName ? (
          <span style={{ fontFamily: SANS, fontSize: s(isWide ? 22 : 30), fontWeight: 700 }}>
            CONTACT {doc.agentName.split(" ")[0].toUpperCase()}
          </span>
        ) : null}
        {doc.agentPhone ? (
          <>
            {doc.agentName ? (
              <span style={{ fontFamily: SANS, fontSize: s(isWide ? 22 : 30), fontWeight: 500 }}>
                :
              </span>
            ) : null}
            {doc.whatsappContact ? (
              <WhatsAppBadge size={s(isWide ? 30 : 40)} bg={theme.accent} fg={theme.page} />
            ) : null}
            <span style={{ fontFamily: SANS, fontSize: s(isWide ? 22 : 30), fontWeight: 700 }}>
              {doc.agentPhone}
            </span>
          </>
        ) : null}
      </Slot>
    </div>
  );
}

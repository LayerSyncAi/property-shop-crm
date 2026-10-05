import { formatShape } from "@/lib/syncmedia/formats";
import {
  BrandTile,
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
 * Full-bleed photo with the copy set into a scrim at the foot of the frame.
 * The strongest option for Stories and WhatsApp Status, where the image is
 * doing the selling and the text is an annotation on it.
 */
export function Overlay({ doc, theme, preset, brand }: TemplateProps) {
  const s = unit(preset);
  const { isWide, isTall } = formatShape(preset);
  const features = usableFeatures(doc, isWide ? 3 : 4);
  const photos = usablePhotos(doc, 3);
  const thumbs = photos.slice(1);
  const pad = isWide ? 56 : 72;
  const titleSize = isWide ? 58 : isTall ? 92 : 74;

  // Fixed white-on-photo palette. The theme still drives the accent so the
  // eyebrow pill and price rule stay on-brand, but body text has to survive an
  // arbitrary photo underneath it — a light theme's dark ink would not.
  const onPhoto = "#ffffff";

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        backgroundColor: theme.ink,
        overflow: "hidden",
      }}
    >
      {photos[0] ? (
        <div style={{ position: "absolute", inset: 0, ...photoFill(photos[0]) }} />
      ) : (
        <Placeholder theme={theme} scale={s} style={{ position: "absolute", inset: 0 }} />
      )}

      {/* Two scrims: a soft one at the top to hold the logo, a deep one at the
          foot so the copy stays readable over a bright photo. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.05) 26%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.78) 76%, rgba(0,0,0,0.92) 100%)`,
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: s(pad),
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: s(24),
          }}
        >
          {doc.showLogo ? (
            <Slot id="logo" doc={doc} preset={preset}>
              <BrandTile
                size={s(76)}
                bg="rgba(255,255,255,0.16)"
                fg={onPhoto}
                radius={s(18)}
                brand={brand}
              />
            </Slot>
          ) : (
            <span />
          )}
          {doc.eyebrow ? (
            <Slot
              id="eyebrow"
              doc={doc}
              preset={preset}
              style={{
                fontFamily: SANS,
                fontSize: s(22),
                fontWeight: 800,
                letterSpacing: s(4),
                color: theme.onAccent,
                backgroundColor: theme.accent,
                padding: `${s(13)} ${s(26)}`,
                borderRadius: s(999),
              }}
            >
              {doc.eyebrow.toUpperCase()}
            </Slot>
          ) : null}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: s(20),
            maxWidth: isWide ? "72%" : "100%",
          }}
        >
          {/* Extra photos ride above the copy as framed insets — enough to show
              a second room without breaking the full-bleed effect. */}
          {thumbs.length > 0 ? (
            <Slot id="thumbs" doc={doc} preset={preset}>
              <ThumbStrip
                photos={thumbs}
                vertical={false}
                thickness={s(isWide ? 130 : 170)}
                radius={s(12)}
                gap={s(12)}
                border={`${s(4)} solid rgba(255,255,255,0.85)`}
              />
            </Slot>
          ) : null}

          <Slot id="headline" doc={doc} preset={preset}>
            <h1
              style={{
                margin: 0,
                fontFamily: SERIF,
                fontWeight: 700,
                fontSize: s(titleSize),
                lineHeight: 1.03,
                color: onPhoto,
                textShadow: "0 2px 18px rgba(0,0,0,0.35)",
              }}
            >
              {doc.title || "Property title"}
            </h1>

            {doc.location ? (
              <p
                style={{
                  margin: `${s(20)} 0 0`,
                  fontFamily: SANS,
                  fontSize: s(28),
                  color: "rgba(255,255,255,0.86)",
                  lineHeight: 1.3,
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
                fontFamily: SANS,
                fontSize: s(24),
                fontWeight: 600,
                color: "rgba(255,255,255,0.94)",
                lineHeight: 1.5,
              }}
            >
              {features.join("   ·   ")}
            </Slot>
          ) : null}

          <div
            style={{
              marginTop: s(10),
              paddingTop: s(28),
              borderTop: `${s(3)} solid rgba(255,255,255,0.28)`,
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: s(28),
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
                    color: "rgba(255,255,255,0.7)",
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
                  fontSize: s(isWide ? 50 : 62),
                  lineHeight: 1,
                  color: onPhoto,
                }}
              >
                {doc.price || "—"}
              </p>
            </Slot>

            <Slot id="contact" doc={doc} preset={preset} style={{ minWidth: 0 }}>
              <ContactLines
                doc={doc}
                scale={s}
                color={onPhoto}
                mutedColor="rgba(255,255,255,0.85)"
                behind="#111111"
                align="right"
              />
            </Slot>
          </div>
        </div>
      </div>
    </div>
  );
}

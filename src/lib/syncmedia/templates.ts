export type TemplateId =
  | "housestyle"
  | "editorial"
  | "overlay"
  | "mosaic"
  | "split"
  | "spotlight";

export interface BrochureTemplate {
  id: TemplateId;
  name: string;
  description: string;
  /**
   * The most photos this layout can place. Every layout renders however many
   * it is given up to this number — a single photo stays a clean hero, and
   * extras fill a thumbnail rail rather than being ignored.
   */
  photoSlots: number;
  /** Features beyond this are dropped rather than allowed to overflow. */
  featureSlots: number;
}

export const TEMPLATES: BrochureTemplate[] = [
  {
    id: "housestyle",
    name: "Classic",
    description: "Logo tab, centred headline, hero and three framed thumbs.",
    photoSlots: 4,
    featureSlots: 6,
  },
  {
    id: "editorial",
    name: "Editorial",
    description: "Hero photo over a clean text block. Extras become a rail below.",
    photoSlots: 4,
    featureSlots: 6,
  },
  {
    id: "overlay",
    name: "Overlay",
    description: "Full-bleed photo with text in a scrim. Extras sit as framed insets.",
    photoSlots: 3,
    featureSlots: 4,
  },
  {
    id: "mosaic",
    name: "Mosaic",
    description: "Hero plus a thumbnail strip. Shows the most photos.",
    photoSlots: 4,
    featureSlots: 6,
  },
  {
    id: "split",
    name: "Split",
    description: "Photo on one side, a solid colour panel on the other.",
    photoSlots: 3,
    featureSlots: 5,
  },
  {
    id: "spotlight",
    name: "Spotlight",
    description: "Framed photo on a colour field. Price-forward.",
    photoSlots: 3,
    featureSlots: 4,
  },
];

export function getTemplate(id: TemplateId): BrochureTemplate {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];
}

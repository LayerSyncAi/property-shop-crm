/**
 * Marketing-site settings for the SyncEstate landing page (src/app/page.tsx).
 *
 * The main call to action opens a WhatsApp chat with LayerSync, prefilled so
 * the team knows what the visitor is asking about.
 */

/** LayerSync's sales WhatsApp number, digits only in international format. */
export const salesWhatsApp = (process.env.NEXT_PUBLIC_SALES_WHATSAPP ?? "263775187682").replace(/\D/g, "");

export const DEFAULT_WHATSAPP_MESSAGE =
  "Hi LayerSync! I run an estate agency and I'm interested in SyncEstate. Can we chat?";

/** A wa.me link that opens a chat with LayerSync and the message typed in. */
export function whatsAppLink(message: string = DEFAULT_WHATSAPP_MESSAGE): string {
  return `https://wa.me/${salesWhatsApp}?text=${encodeURIComponent(message)}`;
}

/** The prefilled message for a visitor asking about one module. */
export function moduleWhatsAppMessage(moduleName: string): string {
  return `Hi LayerSync! I'm interested in ${moduleName} for my agency. Can we chat?`;
}

export const layerSyncUrl = "https://layersync.ai";

import { ConvexError } from "convex/values";

/**
 * Human-readable message for an error thrown by a Convex function. A
 * `ConvexError` carries its payload in `data` (the `message` is wrapped in
 * "[CONVEX M(...)] ... Uncaught ConvexError: ..."), while a plain `Error`
 * thrown server-side arrives with the "Uncaught Error:" prefix. Both are
 * stripped so toasts and inline errors read cleanly.
 */
export function getErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  if (error instanceof ConvexError) {
    const data: unknown = error.data;
    if (typeof data === "string") return data;
    if (data && typeof data === "object" && "message" in data && typeof (data as { message: unknown }).message === "string") {
      return (data as { message: string }).message;
    }
  }
  if (error instanceof Error && error.message) {
    const match = error.message.match(/Uncaught (?:ConvexError|Error): ([\s\S]*?)(?:\n|\s+at\s|$)/);
    return (match ? match[1] : error.message).trim() || fallback;
  }
  return fallback;
}

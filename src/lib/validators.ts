/**
 * Shared field validators for contact / lead forms. Return an error message or
 * undefined when the value is acceptable. Mirrors the server-side rules in
 * convex/leadEditLib.ts so the UI and the mutation agree.
 */

export function validateName(value: string): string | undefined {
  if (!value.trim()) return "Name is required";
  if (value.trim().length < 2) return "Name must be at least 2 characters";
  return undefined;
}

export function validatePhone(value: string): string | undefined {
  if (!value.trim()) return undefined; // Phone is optional
  const digits = value.replace(/\D/g, "");
  if (digits.length < 7) return "Please enter a valid phone number";
  return undefined;
}

export function validateEmail(value: string): string | undefined {
  if (!value.trim()) return undefined;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) return "Please enter a valid email address";
  return undefined;
}

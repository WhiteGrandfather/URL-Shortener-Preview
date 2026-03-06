export function validateUrl(value) {
  if (typeof value !== "string" || value.trim().length === 0) {
    return { valid: false, message: "URL is required" };
  }

  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    return { valid: false, message: "URL format is invalid" };
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    return { valid: false, message: "Only HTTP and HTTPS URLs are allowed" };
  }

  return { valid: true, normalizedUrl: parsed.toString() };
}

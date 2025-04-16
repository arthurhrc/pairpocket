const MAX_BODY_BYTES = 16_384; // 16 KB

export function stripTags(value: string): string {
  return value.replace(/<[^>]*>/g, "").trim();
}

export function sanitizeString(value: string): string {
  return stripTags(value).replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
}

export async function readBodyWithLimit(req: Request): Promise<unknown> {
  const contentLength = req.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > MAX_BODY_BYTES) {
    throw new PayloadTooLargeError();
  }

  const text = await req.text();
  if (text.length > MAX_BODY_BYTES) throw new PayloadTooLargeError();

  try {
    return JSON.parse(text);
  } catch {
    throw new Error("JSON inválido");
  }
}

export class PayloadTooLargeError extends Error {
  constructor() {
    super("Payload muito grande");
    this.name = "PayloadTooLargeError";
  }
}

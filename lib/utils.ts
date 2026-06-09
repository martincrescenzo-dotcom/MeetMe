import { randomBytes } from "crypto";

export function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 24) || "user";

  const suffix = randomBytes(2).toString("hex");
  return `${base}-${suffix}`;
}

export function generateEditToken(): string {
  return randomBytes(16).toString("hex");
}

export function normalizePhone(phone: string): string {
  const trimmed = phone.trim();
  const hasPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");
  return hasPlus ? `+${digits}` : digits;
}

export function buildWhatsAppURL(phone: string, message: string): string {
  const normalized = normalizePhone(phone).replace(/^\+/, "");
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

export function getBaseUrl(req: Request): string {
  const envBase = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "");
  if (envBase) return envBase;
  const host =
    req.headers.get("x-forwarded-host") ??
    req.headers.get("host") ??
    "localhost";
  const proto =
    req.headers.get("x-forwarded-proto") ??
    (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https");
  return `${proto}://${host}`;
}

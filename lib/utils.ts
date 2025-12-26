export function getMonthKey(date = new Date()) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function formatMoney(amountCents: number) {
  return `$${(amountCents / 100).toFixed(2)}`;
}

export function sanitizeUsername(value: string) {
  return value
    .trim()
    .replace(/[^a-zA-Z0-9 _.-]/g, "")
    .slice(0, 24);
}

export function sanitizeLocation(value: string) {
  return value.trim().replace(/[^a-zA-Z0-9 .,'-]/g, "").slice(0, 48);
}

export function sanitizeLinkUrl(value: string) {
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return "";
    }
    return url.toString();
  } catch {
    return "";
  }
}

export function getCountdownParts() {
  const now = new Date();
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  const diffMs = Math.max(end.getTime() - now.getTime(), 0);
  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds };
}

export function getSliderStep(value: number) {
  if (value < 10) return 0.1;
  if (value < 100) return 1;
  if (value < 500) return 5;
  return 10;
}

const crowns = new Intl.NumberFormat("cs-CZ", { maximumFractionDigits: 0 });
const currency = new Intl.NumberFormat("cs-CZ", {
  style: "currency",
  currency: "CZK",
  maximumFractionDigits: 0,
});

export function formatCzk(value: number) {
  return currency.format(value);
}

export function formatCzkSpan(min: number, max: number) {
  return `${crowns.format(min)} – ${crowns.format(max)} Kč`;
}

export function formatCzkRange(min: number, max: number) {
  return `${formatCzkSpan(min, max)} bez DPH`;
}

export function formatMeters(value: number) {
  const rounded = Math.round(value * 100) / 100;
  const text = new Intl.NumberFormat("cs-CZ", {
    minimumFractionDigits: Number.isInteger(rounded) ? 0 : 1,
    maximumFractionDigits: 2,
  }).format(rounded);
  return `${text} m`;
}

/** Text inputu v metrech (čárka i tečka). */
export function formatMeterInput(value: number) {
  const rounded = Math.round(value * 100) / 100;
  return new Intl.NumberFormat("cs-CZ", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(rounded);
}

export function parseMeterInput(raw: string) {
  const normalized = raw.trim().replace(/\s/g, "").replace(",", ".");
  if (!normalized || normalized === "." || normalized === "-") return null;
  const value = Number(normalized);
  if (!Number.isFinite(value)) return null;
  return Math.round(value * 100) / 100;
}

export function formatArea(value: number) {
  const text = new Intl.NumberFormat("cs-CZ", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value);
  return `${text} m²`;
}

export function formatPostalInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 5);
  if (digits.length <= 3) return digits;
  return `${digits.slice(0, 3)} ${digits.slice(3)}`;
}

export function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat("cs-CZ", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Prague",
  }).format(new Date(iso));
}

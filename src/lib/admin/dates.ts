const INPUT_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

export function fromSastInputValue(value: string): string | null | undefined {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (!INPUT_PATTERN.test(trimmed)) return undefined;

  const date = new Date(`${trimmed}:00+02:00`);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
}

export function toSastInputValue(value: string | null | undefined): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Johannesburg",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

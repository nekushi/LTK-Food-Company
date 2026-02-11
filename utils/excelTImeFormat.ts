export function cellDataToTime(time: number): string {
  // if (typeof time !== "number" || Number.isNaN(time)) return time;

  const totalSeconds = Math.round(time * 24 * 60 * 60);

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  const formatTime = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  return formatTime;
}

export function normalizeTime(value: number | null): string {
  if (value == null) return "---";

  const raw = String(value);

  if (/^\s+$/.test(raw)) return "---";

  // if (typeof value !== "number" || Number.isNaN(value)) return String(value);
  if (typeof value !== "number" || Number.isNaN(value)) return raw;

  if (/^\d{2}:\d{2}$/.test(raw)) return raw;

  if (
    typeof value !== "number" ||
    Number.isNaN(value) ||
    (value >= 0 && value < 1)
  ) {
    return cellDataToTime(value);
  }

  if (/^\d{1}:\d{2}$/.test(raw)) {
    const [h, m] = raw.split(":");
    return `${h.padStart(2, "0")}:${m}`;
  }

  // if (typeof value !== "number" || Number.isNaN(value)) return String(value);

  return "---";
}

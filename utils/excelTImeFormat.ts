export function cellDataToTime(time: any): any {
  if (typeof time !== "number" || Number.isNaN(time)) return time;

  const totalSeconds = Math.round(time * 24 * 60 * 60);

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  //   console.log(time);
  //   const excelTime = time * 24 * 60;
  //   console.log(excelTime);
  //   const hours = Math.floor(excelTime / 60);
  //   console.log(hours);
  //   const minutes =
  //     // Math.round(excelTime % 60) === 60 ? 0 : Math.round(excelTime % 60);
  //     // excelTime % 60;
  //     Math.floor((excelTime % 3600) / 60);
  //   console.log(minutes);

  const formatTime = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  return formatTime;
}

export function normalizeTime(value: any) {
  if (value == null) return "---";

  const raw = String(value);

  if (/^\s+$/.test(raw)) return "---";

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

  return "---";
}

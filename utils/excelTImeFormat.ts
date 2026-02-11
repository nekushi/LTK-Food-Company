export function formatLongWeirdTime(time: string): string {
  const numberTime = Number(time);

  const totalSeconds = Math.round(numberTime * 24 * 60 * 60);

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  const formatTime =
    `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`.trim();

  return formatTime;
}

export function formatNormalTime(hh: string, mm: string): string {
  const totalMinutes = Number(hh) * 60 + Number(mm);

  const totalSeconds = totalMinutes * 60;

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  const formatTime =
    `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`.trim();

  return formatTime;
}

export function convertToTimeFormat(value: string | null) {
  if (value === null || /^\s+$/.test(value)) return "---";
  else if (Number(value) >= 0 && Number(value) <= 1) {
    return formatLongWeirdTime(value);
  } else {
    const [hh, mm] = value.trim().split(":");
    return formatNormalTime(hh, mm);
  }
}

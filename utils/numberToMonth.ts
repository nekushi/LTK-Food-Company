// export function getMonth(month: string | undefined, store: string): string {
export function getMonth(month: string | undefined): string {
  if (month === undefined) return "";

  const date: Record<string, string> = {
    "01": "January",
    "02": "February",
    "03": "March",
    "04": "April",
    "05": "May",
    "06": "June",
    "07": "July",
    "08": "August",
    "09": "September",
    "10": "October",
    "11": "November",
    "12": "December",
  };

  let monthNumber;

  monthNumber = month.split(".")[1];
  return date[monthNumber];
}

export function getMonth(month: string | undefined, store: string): string {
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

  switch (store) {
    case "geo":
      monthNumber = month.split(".")[1];
      return date[monthNumber];
    case "pila":
      monthNumber = month.split(".")[0];
      return date[monthNumber];
    default:
      return "";
  }
}

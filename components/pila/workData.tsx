import { TypeAttendanceCardPila } from "@/index";

export default function EmployeeWorkDataPila({
  store,
  date,
  pilaAttendanceCard,
}: {
  store: string;
  date: string;
  pilaAttendanceCard: TypeAttendanceCardPila[];
}) {
  return (
    <>
      <h2>Hello world</h2>
      Date: {date}
      <pre>{JSON.stringify(pilaAttendanceCard, null, 2)}</pre>
    </>
  );
}

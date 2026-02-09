import { Schedule } from "@/index";
import { normalizeTime } from "@/utils/excelTImeFormat";

export default function WorkDataMonth({
  scheduleData,
}: {
  scheduleData: [string, Schedule];
}) {
  const [dateId, schedule] = scheduleData;

  return (
    <tr>
      <td className="pl-6 text-left">
        {dateId} / {schedule.week}
      </td>
      <td>{normalizeTime(schedule.in_out.morning.morning_in)}</td>
      <td>{normalizeTime(schedule.in_out.morning.morning_out)}</td>
      <td>{normalizeTime(schedule.in_out.afternoon.afternoon_in)}</td>
      <td>{normalizeTime(schedule.in_out.afternoon.afternoon_out)}</td>
      <td>{normalizeTime(schedule.in_out.overtime.overtime_in)}</td>
      <td>{normalizeTime(schedule.in_out.overtime.overtime_out)}</td>
    </tr>
    // <div>
    // {/* <h2>hello world</h2> */}
    // {/* <p>{JSON.stringify(schedule, null, 2)}</p> */}
    // {/* {scheduleData.map((data: any, i: number) => (
    //   <p key={dateId}>{dateId}</p>
    // ))} */}
    // </div>
  );
}

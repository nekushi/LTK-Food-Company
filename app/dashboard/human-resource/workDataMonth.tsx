import { Schedule } from "@/index";
import { convertToTimeFormat } from "@/utils/excelTImeFormat";

export default function WorkDataMonth({
  scheduleData,
}: {
  scheduleData: [string, Schedule];
}) {
  const [dateId, schedule] = scheduleData;

  return (
    <>
      {dateId && (
        <tr className="odd:bg-white even:bg-blue-50 *:text-sm *:font-normal *:text-slate-800 tabular-nums *:py-2 ">
          <td className="pl-6 text-left">
            {dateId} / {schedule.week}
          </td>
          <td>
            {convertToTimeFormat(String(schedule.in_out.morning.morning_in))}
          </td>
          <td>
            {convertToTimeFormat(String(schedule.in_out.morning.morning_out))}
          </td>
          <td>
            {convertToTimeFormat(
              String(schedule.in_out.afternoon.afternoon_in),
            )}
          </td>
          <td>
            {convertToTimeFormat(
              String(schedule.in_out.afternoon.afternoon_out),
            )}
          </td>
          <td>
            {convertToTimeFormat(String(schedule.in_out.overtime.overtime_in))}
          </td>
          <td>
            {convertToTimeFormat(String(schedule.in_out.overtime.overtime_out))}
          </td>
        </tr>
      )}
    </>
  );
}

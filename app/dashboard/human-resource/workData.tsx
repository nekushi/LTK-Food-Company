import { linkToEmployee } from "@/dal/geo";
import { InOut, TypeAttendanceCard, TypeSchedules, Schedule } from "@/index";
import { cellDataToTime, normalizeTime } from "@/utils/excelTImeFormat";

export default function EmployeeWorkData({
  data,
  onApprovedData,
}: {
  data: TypeAttendanceCard;
  onApprovedData: any;
}) {
  // const handleLinkDataClick = async () => {
  //   console.log(data.id);

  //   const res = await linkToEmployee(data);
  //   console.log(res);
  // };

  // console.log(data.schedules);

  // const newasd = data.schedules.map((asd: any) => asd);
  // console.log(newasd);

  return (
    <>
      <div className="border rounded p-4 my-2 space-x-2 space-y-2 flex flex-wrap *:basis-2/12 *:shrink-0">
        {/* <pre>{JSON.stringify(data, null, 2)}</pre> */}
        <p>Name: {data.name}</p>
        <p>Employee ID: {data.id}</p>
        <p>Depart: {data.depart}</p>
        <p>Date Range: {data.dateRange}</p>
        <p>Working Days: {data.workingDays}</p>
        <p>Attendance Days: {data.attendanceDays}</p>
        <p>Late Num: {data.lateNum}</p>
        <p>Early Num: {data.earlyNum}</p>
        <p>Absences Days: {data.absencesDays}</p>
        <p>Overtime Hours: {data.overtimeHours}</p>
        <p>Sick Hours: {data.sickHours}</p>
        <p>Leave Hours: {data.leaveHours}</p>
        <p>Daily Salary: {data.dailySalary}</p>
        <p>Overtime Pay: {data.overtimePay}</p>
        <p>Allowances: {data.allowances}</p>
        <p>Charges: {data.charges}</p>
        <p>Real Pay: {data.realPay}</p>
        <p>Device ID: {data.deviceId}</p>
        <p>Device ID: {data.employeeSignature}</p>
        {/* <p>Schedules: XD</p> */}
        <div>
          Schedules:{" "}
          {data.schedules.map((asd: TypeSchedules, i: number) => {
            <pre key={i}>{JSON.stringify(asd, null, 2)}</pre>;
            const [dateId, schedule] = Object.entries(asd)[0] as [
              string,
              Schedule,
            ];

            return (
              <div key={dateId}>
                <div>
                  Morning In:{" "}
                  {normalizeTime(schedule.in_out.morning.morning_in)}
                  {/* {schedule.in_out.morning.morning_in} */}
                  {/* {String(schedule.in_out.morning.morning_in).length === 6 &&
                  String(schedule.in_out.morning.morning_in) === "      "
                    ? "---"
                    : String(schedule.in_out.morning.morning_in).length !== 6 &&
                        /^\d{2}:\d{2}$/.test(
                          String(schedule.in_out.morning.morning_in),
                        )
                      ? schedule.in_out.morning.morning_in
                      : cellDataToTime(schedule.in_out.morning.morning_in)} */}
                </div>
              </div>
            );
          })}
        </div>
        {/* <p>Employee Signature: {(data.employeeSignature["10:01"], null, 2)}</p> */}
        {/* <button
          onClick={() => onApprovedData(data)}
          className="px-2 py-1 border rounded hover:bg-blue-200 active:bg-blue-100"
        >
          Link to {data.name}
        </button> */}
      </div>
    </>
  );
}

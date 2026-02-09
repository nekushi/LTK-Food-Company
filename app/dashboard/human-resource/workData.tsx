import { linkToEmployee } from "@/dal/geo";
import { InOut, TypeAttendanceCard, TypeSchedules, Schedule } from "@/index";
import { cellDataToTime, normalizeTime } from "@/utils/excelTImeFormat";
import { numberToMonth } from "@/utils/numberToMonth";
import WorkDataMonth from "./workDataMonth";

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
    <div className="relative mt-8 mx-12">
      <div className="flex flex-row justify-between items-center">
        <div>
          <p className="text-2xl font-semibold">{data.name}</p>
          <p className="text-xs font-medium text-gray-500">#{data.id}</p>
        </div>
        <div>
          <p className="font-semibold text-2xl">
            Month of {numberToMonth(data.dateRange.split(".")[1])}
          </p>
        </div>
      </div>
      <div className="relative bg-blue-100 border rounded-xl p-4 my-2">
        {/* <pre>{JSON.stringify(data, null, 2)}</pre> */}
        {/* <p>Depart: {data.depart}</p> */}
        {/* <p>Date Range: {data.dateRange}</p> */}
        <div className="p-4 space-x-2 space-y-2 flex flex-wrap *:basis-2/12 *:shrink-0">
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
          <p>Employee Signature: {data.employeeSignature}</p>
        </div>
        <div className="*:text-center">
          <table className="table-fixed w-full">
            <thead>
              <tr>
                <th>Date / Day</th>
                <th>Morning In</th>
                <th>Morning Out</th>
                <th>Afternoon In</th>
                <th>Afternoon Out</th>
                <th>Overtime In</th>
                <th>Overtime Out</th>
              </tr>
            </thead>
            <tbody>
              {data.schedules.map((asd: TypeSchedules) => {
                const [dateId, schedule] = Object.entries(asd)[0] as [
                  string,
                  Schedule,
                ];

                return (
                  <WorkDataMonth
                    key={dateId}
                    scheduleData={[dateId, schedule]}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <button
        onClick={() => onApprovedData(data)}
        className="px-2 py-1 border rounded hover:bg-blue-200 active:bg-blue-100"
      >
        Link to {data.name}
      </button>
    </div>
  );
}

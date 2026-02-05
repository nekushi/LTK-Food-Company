import { linkToEmployee } from "@/dal/geo";

export default function EmployeeWorkData({
  data,
  onApprovedData,
}: {
  data: any;
  onApprovedData: any;
}) {
  // const handleLinkDataClick = async () => {
  //   console.log(data.id);

  //   const res = await linkToEmployee(data);
  //   console.log(res);
  // };

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
        <p>Schedules: XD</p>
        {/* <div>
          Schedules: <pre>{JSON.stringify(data.schedules)}</pre>
        </div> */}
        <p>Employee Signature: {data.employeeSignature}</p>
        <button
          onClick={() => onApprovedData(data)}
          className="px-2 py-1 border rounded hover:bg-blue-200 active:bg-blue-100"
        >
          Link to {data.name}
        </button>
      </div>
    </>
  );
}

import { linkToEmployee } from "@/dal/geo";
import { getMonth } from "@/utils/numberToMonth";
import { MdDateRange, MdStars } from "react-icons/md";
import { FaCircleXmark } from "react-icons/fa6";
import { FaCheckCircle, FaCircleNotch } from "react-icons/fa";
import WorkDataMonth from "./workDataMonth";
import {
  TypeAttendanceCardGeo,
  TypeScheduleGeo,
  TypeSchedulesGeo,
} from "@/index";

export default function EmployeeWorkData({
  store,
  data,
  onApprovedData,
}: {
  store: string;
  data: TypeAttendanceCardGeo;
  onApprovedData: (data: TypeAttendanceCardGeo) => void;
}) {
  // const handleLinkDataClick = async () => {
  //   console.log(data.id);

  //   const res = await linkToEmployee(data);
  //   console.log(res);
  // };

  return (
    <div className="relative mt-8">
      <div className="flex flex-row justify-between">
        <div>
          <p className="text-xl font-semibold">{data.name}</p>
          <p className="text-sm text-slate-500">#{data.id}</p>
        </div>
        <div>
          <p className="font-semibold text-2xl tracking-tight">
            Month of {getMonth(data.dateRange, store)}
          </p>
        </div>
      </div>

      <div className="relative bg-blue-100 border border-blue-300 rounded-xl p-4 my-2 space-y-4">
        {/* STATS CARDS */}
        <div className="flex flex-nowrap justify-between bg-white *:w-full h-24 rounded-lg *:border-blue-300">
          <div className="rounded-md rounded-r-none border-r">
            <div className="ml-6 mt-6 flex flex-col">
              <div className="flex flex-row items-center gap-1 *:font-medium">
                <MdDateRange className="text-slate-800 inline align-middle text-xl" />{" "}
                <p className="text-sm text-slate-600">Total Days:</p>
              </div>
              <p className="tabular-nums font-semibold text-2xl indent-6">
                {data.workingDays}
              </p>
            </div>
          </div>
          <div className="border-r">
            <div className="ml-6 mt-6 flex flex-col">
              <div className="flex flex-row items-center gap-1 *:font-medium">
                <MdStars className="text-green-500 inline align-middle text-xl" />{" "}
                <p className="text-sm text-slate-600">Attendance Days:</p>
              </div>
              <p className="tabular-nums font-semibold text-2xl indent-6">
                {data.attendanceDays}
              </p>
            </div>
          </div>
          <div className="border-r">
            <div className="ml-6 mt-6 flex flex-col">
              <div className="flex flex-row items-center gap-1 *:font-medium">
                <FaCheckCircle className="text-green-400 inline align-middle text-xl" />{" "}
                <p className="text-sm text-slate-600">Early Num:</p>
              </div>
              <p className="tabular-nums font-semibold text-2xl indent-6">
                {data.earlyNum}
              </p>
            </div>
          </div>
          <div className="border-r">
            <div className="ml-6 mt-6 flex flex-col">
              <div className="flex flex-row items-center gap-1 *:font-medium">
                <FaCircleXmark className="text-red-400 inline align-middle text-xl" />{" "}
                <p className="text-sm text-slate-600">Absences Days:</p>
              </div>
              <p className="tabular-nums font-semibold text-2xl indent-6">
                {data.absencesDays}
              </p>
            </div>
          </div>
          <div>
            <div className="ml-6 mt-6 flex flex-col">
              <div className="flex flex-row items-center gap-1 *:font-medium *:text-slate-600">
                <FaCircleNotch className="inline align-middle text-xl" />{" "}
                <p className="text-sm">Overtime Hours:</p>
              </div>
              <p className="tabular-nums font-semibold text-2xl indent-6">
                {data.overtimeHours}
              </p>
            </div>
          </div>
        </div>

        {/* SCHEDULE TABLE */}
        <div className="*:text-center bg-white rounded-lg pt-4">
          <table className="table-fixed w-full border-collapse">
            <thead>
              <tr className="*:text-sm *:font-medium *:text-slate-600 capitalize tracking-normal *:pb-2 *:border-b *:border-slate-300">
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
              {data.schedules.map((singleData: TypeSchedulesGeo) => {
                const [dateId, schedule] = Object.entries(singleData)[0] as [
                  string,
                  TypeScheduleGeo,
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

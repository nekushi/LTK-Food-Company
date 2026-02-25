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
import { useState } from "react";

export default function EmployeeWorkDataGeo({
  store,
  data,
  onApprovedData,
}: {
  store: string;
  data: TypeAttendanceCardGeo;
  onApprovedData: (data: TypeAttendanceCardGeo) => void;
}) {
  // };

  const [calculatedMinutesMap, setCalculatedMinutesMap] = useState<
    Record<string, number>
  >({});

  const handleCalculateTotal = (dateId: string, minutes: number | null) => {
    setCalculatedMinutesMap((prev) => {
      const newMap = { ...prev };
      if (minutes === null) {
        delete newMap[dateId];
      } else {
        newMap[dateId] = minutes;
      }
      return newMap;
    });
  };

  const totalCalculatedMinutes = Object.values(calculatedMinutesMap).reduce(
    (acc, curr) => acc + curr,
    0,
  );

  const handleShowTotalSum = () => {
    if (totalCalculatedMinutes === 0) {
      alert("0 hours");
      return;
    }
    const sumHours = Math.floor(totalCalculatedMinutes / 60);
    const sumMins = totalCalculatedMinutes % 60;

    let timeStr = `${sumHours} hours`;
    if (sumMins > 0) {
      timeStr = `${sumHours} hours and ${sumMins} minutes`;
    }
    alert(timeStr);
  };

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
                <FaCircleXmark className="text-red-400 inline align-middle text-xl" />{" "}
                <p className="text-sm text-slate-600">Absences Days:</p>
              </div>
              <p className="tabular-nums font-semibold text-2xl indent-6">
                {data.absencesDays}
              </p>
            </div>
          </div>
          <div className="border-r">
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
          <div>
            <div
              className="ml-6 mt-6 flex flex-col cursor-pointer hover:underline text-blue-600"
              onClick={handleShowTotalSum}
              title="Click to show full calculation"
            >
              <div className="flex flex-row items-center gap-1 *:font-medium *:text-slate-600">
                <MdDateRange className="inline align-middle text-xl" />{" "}
                <p className="text-sm">Total Hours:</p>
              </div>
              <p className="tabular-nums font-semibold text-2xl indent-6">
                {totalCalculatedMinutes}
              </p>
            </div>
          </div>
          <div>
            <div
              className="ml-6 mt-6 flex flex-col cursor-pointer hover:underline text-blue-600"
              // onClick={handleShowTotalSum}
              title="Click to show full calculation"
            >
              <div className="flex flex-row items-center gap-1 *:font-medium *:text-slate-600">
                <MdDateRange className="inline align-middle text-xl" />{" "}
                <p className="text-sm">Net Pay:</p>
              </div>
              <p className="tabular-nums font-semibold text-2xl indent-6">
                {0}
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
                <th>Total Hours</th>
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
                    onCalculate={handleCalculateTotal}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onApprovedData(data)}
        className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-800 hover:bg-amber-100 hover:border-amber-300 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
      >
        Link to {data.name ?? "employee"}
      </button>
    </div>
  );
}

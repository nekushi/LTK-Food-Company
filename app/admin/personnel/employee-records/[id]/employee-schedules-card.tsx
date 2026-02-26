"use client";

import { useState } from "react";
import WorkDataMonth from "@/components/geo/workDataMonth";
import type { TypeScheduleGeo, TypeSchedulesGeo } from "@/index";
import { getMonth } from "@/utils/numberToMonth";

/** Work data item that has at least a schedules key (GEO card shape). */
interface WorkDataItemWithSchedules {
  schedules?: TypeSchedulesGeo[];
  dateRange?: string;
  name?: string;
  id?: string;
}

interface EmployeeSchedulesCardProps {
  dataItems: unknown[];
}

export default function EmployeeSchedulesCard({ dataItems }: EmployeeSchedulesCardProps) {
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
    const timeStr =
      sumMins > 0
        ? `${sumHours} hours and ${sumMins} minutes`
        : `${sumHours} hours`;
    alert(timeStr);
  };

  const items = (Array.isArray(dataItems) ? dataItems : []) as WorkDataItemWithSchedules[];
  const withSchedules = items.filter(
    (item) => item && Array.isArray(item.schedules) && item.schedules.length > 0,
  );

  if (withSchedules.length === 0) {
    return (
      <p className="italic text-amber-600">No work data with schedules recorded.</p>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2">
        <span className="text-sm font-medium text-amber-800">
          Total hours (minutes): {totalCalculatedMinutes}
        </span>
        <button
          type="button"
          onClick={handleShowTotalSum}
          className="text-sm font-medium text-amber-700 hover:text-amber-900 hover:underline"
        >
          Show full format
        </button>
      </div>
      {withSchedules.map((card, cardIdx) => {
        const schedules = card.schedules ?? [];
        const monthLabel =
          (card.dateRange ? getMonth(card.dateRange) : null) ||
          card.name ||
          `Card ${cardIdx + 1}`;

        return (
          <div
            key={cardIdx}
            className="rounded-xl border border-amber-200 bg-amber-50/40 p-6 shadow-sm"
          >
            <h3 className="mb-4 border-b border-amber-200 pb-3 text-lg font-semibold text-amber-900">
              Schedules — {monthLabel}
            </h3>

            <div className="overflow-x-auto *:text-center">
              <table className="w-full table-fixed border-collapse bg-white rounded-lg">
                <thead>
                  <tr className="*:border-b *:border-amber-200 *:pb-2 *:text-sm *:font-medium *:text-amber-800">
                    <th className="text-left pl-4">Date / Day</th>
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
                  {schedules.map((singleData, sIdx) => {
                    const entries = Object.entries(singleData);
                    if (entries.length === 0) return null;
                    const [dateId, schedule] = entries[0] as [
                      string,
                      TypeScheduleGeo,
                    ];
                    return (
                      <WorkDataMonth
                        key={`${cardIdx}-${sIdx}-${dateId}`}
                        scheduleData={[dateId, schedule]}
                        onCalculate={handleCalculateTotal}
                      />
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs text-amber-600">
              Right-click a row to Edit or Calculate.
            </p>
          </div>
        );
      })}
    </div>
  );
}


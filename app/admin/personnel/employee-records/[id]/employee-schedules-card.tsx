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

const DEDUCTION_SSS = 425;
const DEDUCTION_PHILHEALTH = 250;
const DEDUCTION_PAGIBIG = 200;

/** Full rendered time for display/accumulation (e.g. 4h 32m). Round-down is used only in pay calculation. */
function formatFullRenderedTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

interface RowResult {
  minutes: number;
  tardiness: number;
}

export default function EmployeeSchedulesCard({ dataItems }: EmployeeSchedulesCardProps) {
  /** Key: `${cardIdx}-${dateId}` -> { minutes, tardiness } */
  const [rowResultsMap, setRowResultsMap] = useState<Record<string, RowResult>>({});
  const [ratePerDay, setRatePerDay] = useState<string>("");
  const [hrsPerDay, setHrsPerDay] = useState<string>("8");

  const handleCalculateTotal = (
    cardIdx: number,
    dateId: string,
    minutes: number | null,
    tardinessMinutes?: number,
  ) => {
    setRowResultsMap((prev) => {
      const newMap = { ...prev };
      const key = `${cardIdx}-${dateId}`;
      if (minutes === null) {
        delete newMap[key];
      } else {
        newMap[key] = { minutes, tardiness: tardinessMinutes ?? 0 };
      }
      return newMap;
    });
  };

  const getCardTotalMinutes = (cardIdx: number): number => {
    return Object.entries(rowResultsMap)
      .filter(([key]) => key.startsWith(`${cardIdx}-`))
      .reduce((sum, [, val]) => sum + val.minutes, 0);
  };

  const getCardTardiness = (cardIdx: number): number => {
    return Object.entries(rowResultsMap)
      .filter(([key]) => key.startsWith(`${cardIdx}-`))
      .reduce((sum, [, val]) => sum + val.tardiness, 0);
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

  const ratePerDayNum = parseFloat(ratePerDay);
  const hrsPerDayNum = parseFloat(hrsPerDay) || 8;
  const canComputePay = Number.isFinite(ratePerDayNum) && ratePerDayNum > 0 && hrsPerDayNum > 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
        <span className="text-sm font-medium text-amber-800">
          Pay (for net pay below):
        </span>
        <label className="flex items-center gap-1.5 text-sm text-amber-800">
          <span>Rate/day (₱)</span>
          <input
            type="number"
            min={0}
            step={0.01}
            value={ratePerDay}
            onChange={(e) => setRatePerDay(e.target.value)}
            className="w-24 rounded border border-amber-200 px-2 py-1 text-amber-900"
          />
        </label>
        <label className="flex items-center gap-1.5 text-sm text-amber-800">
          <span>Hrs/day</span>
          <input
            type="number"
            min={0.1}
            step={0.5}
            value={hrsPerDay}
            onChange={(e) => setHrsPerDay(e.target.value)}
            className="w-20 rounded border border-amber-200 px-2 py-1 text-amber-900"
          />
        </label>
      </div>
      {withSchedules.map((card, cardIdx) => {
        const schedules = card.schedules ?? [];
        const monthLabel =
          (card.dateRange ? getMonth(card.dateRange) : null) ||
          card.name ||
          `Card ${cardIdx + 1}`;
        const cardTotalMinutes = getCardTotalMinutes(cardIdx);
        const cardTotalDisplay = formatFullRenderedTime(cardTotalMinutes);
        const minsLates = getCardTardiness(cardIdx);
        /** Round down only here, for pay calculation (accumulated rendered hours). */
        const renderedHours = Math.floor(cardTotalMinutes / 60);
        const ratePerHour = canComputePay ? ratePerDayNum / hrsPerDayNum : 0;
        const grossSalary = ratePerHour * renderedHours;
        const tardinessDeduction = minsLates * 1.25;
        const totalDeductions =
          tardinessDeduction + DEDUCTION_SSS + DEDUCTION_PHILHEALTH + DEDUCTION_PAGIBIG;
        const netPay = grossSalary - totalDeductions;

        const handleHeaderClick = () => {
          const total = getCardTotalMinutes(cardIdx);
          if (total === 0) {
            alert("0h (no calculated rows yet; right-click rows and choose Calculate).");
            return;
          }
          alert(`Total for this card: ${formatFullRenderedTime(total)} (tardiness: ${minsLates} min)`);
        };

        return (
          <div
            key={cardIdx}
            className="rounded-xl border border-amber-200 bg-amber-50/40 p-6 shadow-sm"
          >
            <h3 className="mb-2 border-b border-amber-200 pb-3 text-lg font-semibold text-amber-900">
              Schedules — {monthLabel}
            </h3>
            {canComputePay && (
              <div className="mb-4 rounded-lg border border-amber-200 bg-white px-4 py-3 text-sm">
                <div className="font-semibold text-amber-900">
                  Net pay: ₱{Math.max(0, netPay).toFixed(2)}
                </div>
                <div className="mt-1 space-y-0.5 text-amber-700">
                  <div>
                    Gross: ₱{ratePerHour.toFixed(2)}/hr × {renderedHours}h = ₱{grossSalary.toFixed(2)}
                  </div>
                  <div>
                    Deductions: tardiness {minsLates} min × 1.25 = ₱{tardinessDeduction.toFixed(2)}; SSS ₱{DEDUCTION_SSS}; PhilHealth ₱{DEDUCTION_PHILHEALTH}; PagIbig ₱{DEDUCTION_PAGIBIG} → total ₱{totalDeductions.toFixed(2)}
                  </div>
                </div>
              </div>
            )}
            <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
              <span className="font-medium text-amber-800">Total time (in hours):</span>
              <span className="font-semibold text-amber-900">{cardTotalDisplay}</span>
              <span className="text-amber-600">(tardiness: {minsLates} min)</span>
              <span className="text-amber-600">
                (click column header below to show details)
              </span>
            </div>

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
                    <th
                      className="cursor-pointer px-2 hover:bg-amber-100 hover:underline"
                      onClick={handleHeaderClick}
                      title="Click to show total for this card"
                    >
                      Total time (in hours)
                    </th>
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
                        onCalculate={(id, minutes, tardinessMinutes) => handleCalculateTotal(cardIdx, id, minutes, tardinessMinutes)}
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


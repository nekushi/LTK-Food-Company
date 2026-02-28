"use client";

import { useState } from "react";
import WorkDataMonth from "@/components/geo/workDataMonth";
import type { TypeScheduleGeo, TypeSchedulesGeo } from "@/index";
import { getMonth } from "@/utils/numberToMonth";
import { FiPrinter } from "react-icons/fi";

/** Work data item that has at least a schedules key (GEO card shape). */
interface WorkDataItemWithSchedules {
  schedules?: TypeSchedulesGeo[];
  dateRange?: string;
  name?: string;
  id?: string;
}

export interface DeductionEligibility {
  hasSss: boolean;
  hasPagIbig: boolean;
  hasPhilhealth: boolean;
}

interface EmployeeSchedulesCardProps {
  dataItems: unknown[];
  /** Only deduct SSS/PhilHealth/PagIbig if the employee has that benefit. Omit or pass undefined to deduct all (legacy). */
  deductionEligibility?: DeductionEligibility | null;
  /** For payslip header */
  employeeName?: string;
  employeeIdDisplay?: string;
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

export default function EmployeeSchedulesCard({
  dataItems,
  deductionEligibility,
  employeeName = "",
  employeeIdDisplay = "",
}: EmployeeSchedulesCardProps) {
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

  const hasSss = deductionEligibility?.hasSss ?? true;
  const hasPagIbig = deductionEligibility?.hasPagIbig ?? true;
  const hasPhilhealth = deductionEligibility?.hasPhilhealth ?? true;

  const getPayPeriodLabel = (card: WorkDataItemWithSchedules, cardIdx: number): string => {
    const monthPart = card.dateRange ? getMonth(card.dateRange) : null;
    const yearPart = card.dateRange?.split(".")[0] ?? "";
    if (monthPart && yearPart) return `${monthPart} ${yearPart}`;
    return card.name || `Period ${cardIdx + 1}`;
  };

  const buildOnePayslipHtml = (cardIdx: number): string => {
    const card = withSchedules[cardIdx];
    const periodLabel = getPayPeriodLabel(card, cardIdx);
    const rate = parseFloat(ratePerDay) || 0;
    const hrs = parseFloat(hrsPerDay) || 8;
    const ratePerHour = rate > 0 && hrs > 0 ? rate / hrs : 0;
    const companyName = "Company Payslip";
    const totalMinutes = getCardTotalMinutes(cardIdx);
    const tardinessMins = getCardTardiness(cardIdx);
    const renderedHours = Math.floor(totalMinutes / 60);
    const gross = ratePerHour * renderedHours;
    const tardinessDed = tardinessMins * 1.25;
    const govDed = (hasSss ? DEDUCTION_SSS : 0) + (hasPhilhealth ? DEDUCTION_PHILHEALTH : 0) + (hasPagIbig ? DEDUCTION_PAGIBIG : 0);
    const totalDed = tardinessDed + govDed;
    const net = Math.max(0, gross - totalDed);

    return `
      <div class="payslip" style="max-width:400px; margin:0 auto; border:1px solid #d4a574; padding:24px; font-family:system-ui,sans-serif; font-size:14px;">
        <div style="text-align:center; border-bottom:2px solid #b45309; padding-bottom:12px; margin-bottom:16px;">
          <h1 style="margin:0; font-size:18px; color:#92400e;">${companyName}</h1>
          <p style="margin:4px 0 0; font-size:12px; color:#78350f;">Pay slip (Net Pay Simulation)</p>
        </div>
        <table style="width:100%; margin-bottom:16px;">
          <tr><td style="padding:2px 0; color:#78350f;">Employee</td><td style="text-align:right; font-weight:600;">${employeeName || "—"}</td></tr>
          <tr><td style="padding:2px 0; color:#78350f;">Employee ID</td><td style="text-align:right;">${employeeIdDisplay || "—"}</td></tr>
          <tr><td style="padding:2px 0; color:#78350f;">Pay period</td><td style="text-align:right;">${periodLabel}</td></tr>
        </table>
        <table style="width:100%; border-collapse:collapse;">
          <thead><tr style="background:#fef3c7; border-bottom:1px solid #d4a574;"><th style="text-align:left; padding:8px;">Earnings / Deductions</th><th style="text-align:right; padding:8px;">Amount (₱)</th></tr></thead>
          <tbody>
            <tr style="border-bottom:1px solid #fde68a;"><td style="padding:8px;">Gross pay (${renderedHours} hrs × ₱${ratePerHour.toFixed(2)}/hr)</td><td style="text-align:right; padding:8px;">${gross.toFixed(2)}</td></tr>
            ${hasSss ? `<tr style="border-bottom:1px solid #fde68a;"><td style="padding:8px;">SSS</td><td style="text-align:right; padding:8px;">-${DEDUCTION_SSS.toFixed(2)}</td></tr>` : ""}
            ${hasPhilhealth ? `<tr style="border-bottom:1px solid #fde68a;"><td style="padding:8px;">PhilHealth</td><td style="text-align:right; padding:8px;">-${DEDUCTION_PHILHEALTH.toFixed(2)}</td></tr>` : ""}
            ${hasPagIbig ? `<tr style="border-bottom:1px solid #fde68a;"><td style="padding:8px;">Pag-IBIG</td><td style="text-align:right; padding:8px;">-${DEDUCTION_PAGIBIG.toFixed(2)}</td></tr>` : ""}
            <tr style="border-bottom:1px solid #fde68a;"><td style="padding:8px;">Tardiness (${tardinessMins} min)</td><td style="text-align:right; padding:8px;">-${tardinessDed.toFixed(2)}</td></tr>
            <tr style="border-bottom:1px solid #d4a574;"><td style="padding:8px; font-weight:600;">Total deductions</td><td style="text-align:right; padding:8px;">-${totalDed.toFixed(2)}</td></tr>
          </tbody>
        </table>
        <div style="margin-top:16px; padding:12px; background:#fef3c7; border:1px solid #d4a574; text-align:right;">
          <span style="color:#78350f;">Net pay</span><br/>
          <span style="font-size:20px; font-weight:700; color:#92400e;">₱${net.toFixed(2)}</span>
        </div>
        <p style="margin-top:12px; font-size:11px; color:#a16207;">Simulation only. Not an official payroll document.</p>
      </div>
    `;
  };

  const handlePrintOnePayslip = (cardIdx: number) => {
    const slipHtml = buildOnePayslipHtml(cardIdx);
    const periodLabel = getPayPeriodLabel(withSchedules[cardIdx], cardIdx);
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Payslip - ${periodLabel}</title></head><body>${slipHtml}</body></html>`;
    const win = window.open("", "_blank", "width=480,height=800");
    if (win) {
      win.document.write(html);
      win.document.close();
      win.focus();
      setTimeout(() => {
        win.print();
        win.close();
      }, 400);
    }
  };

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
        const govDeductions =
          (hasSss ? DEDUCTION_SSS : 0) +
          (hasPhilhealth ? DEDUCTION_PHILHEALTH : 0) +
          (hasPagIbig ? DEDUCTION_PAGIBIG : 0);
        const totalDeductions = tardinessDeduction + govDeductions;
        const netPay = grossSalary - totalDeductions;

        const deductionParts: string[] = [`tardiness ${minsLates} min × 1.25 = ₱${tardinessDeduction.toFixed(2)}`];
        if (hasSss) deductionParts.push(`SSS ₱${DEDUCTION_SSS}`);
        if (hasPhilhealth) deductionParts.push(`PhilHealth ₱${DEDUCTION_PHILHEALTH}`);
        if (hasPagIbig) deductionParts.push(`PagIbig ₱${DEDUCTION_PAGIBIG}`);
        deductionParts.push(`→ total ₱${totalDeductions.toFixed(2)}`);

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
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2 border-b border-amber-200 pb-3">
              <h3 className="text-lg font-semibold text-amber-900">
                Schedules — {monthLabel}
              </h3>
              <button
                type="button"
                onClick={() => handlePrintOnePayslip(cardIdx)}
                className="flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-100 px-3 py-1.5 text-sm font-medium text-amber-900 hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <FiPrinter className="text-sm" />
                Print payslip
              </button>
            </div>
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
                    Deductions: {deductionParts.join("; ")}
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


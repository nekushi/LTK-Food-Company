"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DayData {
  date: string;
  label: string;
  total: number;
}

function formatCurrency(value: number) {
  return `₱${value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-amber-200 bg-white px-3 py-2 shadow-md text-xs">
      <p className="font-semibold text-amber-900">{label}</p>
      <p className="text-emerald-700 font-medium">{formatCurrency(payload[0].value)}</p>
    </div>
  );
}

export default function BranchSalesCharts({
  past7Days,
  past30Days,
}: {
  past7Days: DayData[];
  past30Days: DayData[];
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 7-Day Chart */}
      <div className="rounded-xl border border-amber-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-amber-900 mb-4">Past 7 Days — All Branches</h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={past7Days} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#fde68a" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#92400e" }} />
              <YAxis tick={{ fontSize: 11, fill: "#92400e" }} tickFormatter={(v: number) => `₱${(v / 1000).toFixed(0)}k`} width={50} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#d97706"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "#d97706", stroke: "#fff", strokeWidth: 2 }}
                activeDot={{ r: 6, fill: "#b45309" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 30-Day Chart */}
      <div className="rounded-xl border border-amber-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-amber-900 mb-4">Past 30 Days — All Branches</h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={past30Days} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#fde68a" />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#92400e" }} interval={Math.ceil(past30Days.length / 8)} />
              <YAxis tick={{ fontSize: 11, fill: "#92400e" }} tickFormatter={(v: number) => `₱${(v / 1000).toFixed(0)}k`} width={50} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#059669"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5, fill: "#047857" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

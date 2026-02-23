import { TypeAttendanceCardPila } from "@/index";

export default function EmployeeWorkDataPila({
  store,
  date,
  pilaAttendanceCard,
}: {
  store: string;
  date: string;
  pilaAttendanceCard: TypeAttendanceCardPila[];
}) {
  return (
    <div className="space-y-12">
      {pilaAttendanceCard.map((employee, idx) => {
        // Calculate max logs dynamically to determine columns
        const maxLogs = Math.max(
          ...employee.schedules.map((s) => {
            const val = Object.values(s)[0].values;
            if (!val || val === "null") return 0;
            return val.split(/\s+/).filter(Boolean).length;
          }),
          0
        );
        const colsCount = Math.max(maxLogs, 1); // Ensure at least 1 column

        return (
          <div key={`${employee.id}-${idx}`} className="relative mt-8">
            <div className="flex flex-row justify-between">
              <div>
                <p className="text-xl font-semibold">{employee.name}</p>
                <p className="text-sm text-slate-500">#{employee.id} - {employee.role}</p>
              </div>
              <div>
                <p className="font-semibold text-2xl tracking-tight capitalize">
                  {store} Store
                </p>
                <p className="text-sm text-slate-500 text-right">Date: {date}</p>
              </div>
            </div>

            <div className="relative bg-blue-100 border border-blue-300 rounded-xl p-4 my-2 space-y-4">
              {/* SCHEDULE TABLE */}
              <div className="*:text-center bg-white rounded-lg pt-4 overflow-x-auto">
                <table className="table-fixed min-w-full border-collapse">
                  <thead>
                    <tr className="*:text-sm *:font-medium *:text-slate-600 capitalize tracking-normal *:pb-2 *:border-b *:border-slate-300">
                      <th className="w-24">Date / Day</th>
                      {Array.from({ length: colsCount }).map((_, i) => (
                        <th key={i}>Log {i + 1}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {employee.schedules.map((scheduleBlock, sIdx) => {
                      const [dayString, dataObj] = Object.entries(scheduleBlock)[0];
                      const val = dataObj.values;
                      const isNullOrEmpty = !val || val === "null";
                      const logs = isNullOrEmpty
                        ? []
                        : val.split(/\s+/).filter(Boolean);

                      return (
                        <tr
                          key={sIdx}
                          className="*:text-sm *:font-medium *:text-slate-600 capitalize tracking-normal *:py-3 *:border-b *:border-slate-200 last:*:border-0"
                        >
                          <td className="text-slate-800 border-r border-slate-200">
                            {dayString !== "null" ? dayString : "N/A"}
                          </td>
                          {Array.from({ length: colsCount }).map((_, i) => (
                            <td key={i}>{logs[i] || "—"}</td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            {/* Optional link button matching geo */}
            <button className="px-2 py-1 border rounded hover:bg-blue-200 active:bg-blue-100 text-sm font-medium text-slate-700">
              Link to {employee.name}
            </button>
          </div>
        );
      })}
    </div>
  );
}

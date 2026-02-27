"use client";

import { useState, useEffect } from "react";
import { FiClock, FiChevronDown, FiChevronUp, FiCheck, FiLink } from "react-icons/fi";
import { MdDateRange, MdStars } from "react-icons/md";
import { FaCircleXmark, FaCircleNotch } from "react-icons/fa6";
import { getEmployees } from "@/app/hr/employees/dal/get-employees";
import { linkToEmployees } from "@/dal/hr/linkToEmployee";
import { convertToTimeFormat } from "@/utils/excelTImeFormat";
import { TypeAttendanceCardGeo } from "@/index";
import { toast } from "react-toastify";

type InOut = {
  morning: { morning_in: string | null; morning_out: string | null };
  afternoon: { afternoon_in: string | null; afternoon_out: string | null };
  overtime: { overtime_in: string | null; overtime_out: string | null };
};

type AttendanceCard = {
  name?: string;
  id?: string;
  dateRange?: string;
  workingDays?: string;
  attendanceDays?: string;
  absencesDays?: string;
  overtimeHours?: string;
  schedules?: Record<string, { week: string; in_out: InOut }>[];
};

type EmployeeWithWork = {
  id: string;
  firstName: string;
  lastName: string;
  employeeId: string | null;
  branch: string | null;
  employeeWorkData: {
    id: string;
    data: AttendanceCard[];
  } | null;
};

function getMonthName(dateRange?: string): string {
  if (!dateRange) return "";
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  for (const m of months) {
    if (dateRange.toLowerCase().includes(m.toLowerCase())) return m;
  }
  const parts = dateRange.split(/[/\-]/);
  const monthNum = parseInt(parts[0], 10);
  if (monthNum >= 1 && monthNum <= 12) return months[monthNum - 1];
  return dateRange;
}

function ReadOnlyScheduleRow({
  dateId,
  schedule,
}: {
  dateId: string;
  schedule: { week: string; in_out: InOut };
}) {
  const fmt = (v: string | null) => convertToTimeFormat(v);

  return (
    <tr className="odd:bg-white even:bg-amber-50/50 *:text-sm *:font-normal *:text-slate-800 tabular-nums *:py-2">
      <td className="pl-6 text-left">
        {dateId} / {schedule.week}
      </td>
      <td className="px-2 text-center">{fmt(schedule.in_out.morning.morning_in)}</td>
      <td className="px-2 text-center">{fmt(schedule.in_out.morning.morning_out)}</td>
      <td className="px-2 text-center">{fmt(schedule.in_out.afternoon.afternoon_in)}</td>
      <td className="px-2 text-center">{fmt(schedule.in_out.afternoon.afternoon_out)}</td>
      <td className="px-2 text-center">{fmt(schedule.in_out.overtime.overtime_in)}</td>
      <td className="px-2 text-center">{fmt(schedule.in_out.overtime.overtime_out)}</td>
    </tr>
  );
}

function ReadOnlyCardView({
  card,
  onApprove,
  isApproved,
}: {
  card: AttendanceCard;
  onApprove: () => void;
  isApproved: boolean;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div className="rounded-xl border border-amber-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <p className="text-base font-semibold text-amber-900">{card.name ?? "Unknown"}</p>
          <p className="text-xs text-amber-600">
            #{card.id ?? "N/A"} &middot; Month of {getMonthName(card.dateRange)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onApprove}
            disabled={isApproved}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-1 ${
              isApproved
                ? "bg-green-100 text-green-700 border border-green-300 cursor-default"
                : "bg-amber-700 text-white hover:bg-amber-800"
            }`}
          >
            <FiCheck className="text-sm" />
            {isApproved ? "Approved" : "Approve"}
          </button>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-1 text-xs font-medium text-amber-600 hover:text-amber-800 transition-colors"
          >
            {open ? "Hide" : "Show"}
            {open ? <FiChevronUp className="text-sm" /> : <FiChevronDown className="text-sm" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="px-6 pb-6 space-y-4">
          <div className="grid grid-cols-4 gap-3">
            <div className="rounded-lg border border-amber-100 bg-amber-50/50 p-3">
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 mb-1">
                <MdDateRange className="text-base" /> Total Days
              </div>
              <p className="text-xl font-semibold tabular-nums">{card.workingDays ?? "—"}</p>
            </div>
            <div className="rounded-lg border border-amber-100 bg-amber-50/50 p-3">
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 mb-1">
                <MdStars className="text-base text-green-500" /> Attendance
              </div>
              <p className="text-xl font-semibold tabular-nums">{card.attendanceDays ?? "—"}</p>
            </div>
            <div className="rounded-lg border border-amber-100 bg-amber-50/50 p-3">
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 mb-1">
                <FaCircleXmark className="text-base text-red-400" /> Absences
              </div>
              <p className="text-xl font-semibold tabular-nums">{card.absencesDays ?? "—"}</p>
            </div>
            <div className="rounded-lg border border-amber-100 bg-amber-50/50 p-3">
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 mb-1">
                <FaCircleNotch className="text-base" /> Overtime
              </div>
              <p className="text-xl font-semibold tabular-nums">{card.overtimeHours ?? "—"}</p>
            </div>
          </div>

          {card.schedules && card.schedules.length > 0 && (
            <div className="overflow-x-auto rounded-lg border border-amber-100">
              <table className="table-fixed w-full border-collapse text-center">
                <thead>
                  <tr className="bg-amber-50 *:text-xs *:font-semibold *:text-amber-900 *:uppercase *:tracking-wider *:py-3 *:border-b *:border-amber-200">
                    <th className="text-left pl-6">Date / Day</th>
                    <th>Morning In</th>
                    <th>Morning Out</th>
                    <th>Afternoon In</th>
                    <th>Afternoon Out</th>
                    <th>Overtime In</th>
                    <th>Overtime Out</th>
                  </tr>
                </thead>
                <tbody>
                  {card.schedules.map((singleData) => {
                    const [dateId, schedule] = Object.entries(singleData)[0] as [
                      string,
                      { week: string; in_out: InOut },
                    ];
                    return (
                      <ReadOnlyScheduleRow key={dateId} dateId={dateId} schedule={schedule} />
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function LinkedCardView({ card }: { card: AttendanceCard }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-amber-200 bg-white shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-amber-50/50"
      >
        <span className="text-sm font-semibold text-amber-900">
          Month of {getMonthName(card.dateRange)}
        </span>
        <span className="flex items-center gap-1.5 text-xs font-medium text-amber-600">
          {open ? "Hide" : "Show"}
          {open ? <FiChevronUp className="text-sm" /> : <FiChevronDown className="text-sm" />}
        </span>
      </button>

      {open && (
        <div className="px-6 pb-6 space-y-4">
          <div className="grid grid-cols-4 gap-3">
            <div className="rounded-lg border border-amber-100 bg-amber-50/50 p-3">
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 mb-1">
                <MdDateRange className="text-base" /> Total Days
              </div>
              <p className="text-xl font-semibold tabular-nums">{card.workingDays ?? "—"}</p>
            </div>
            <div className="rounded-lg border border-amber-100 bg-amber-50/50 p-3">
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 mb-1">
                <MdStars className="text-base text-green-500" /> Attendance
              </div>
              <p className="text-xl font-semibold tabular-nums">{card.attendanceDays ?? "—"}</p>
            </div>
            <div className="rounded-lg border border-amber-100 bg-amber-50/50 p-3">
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 mb-1">
                <FaCircleXmark className="text-base text-red-400" /> Absences
              </div>
              <p className="text-xl font-semibold tabular-nums">{card.absencesDays ?? "—"}</p>
            </div>
            <div className="rounded-lg border border-amber-100 bg-amber-50/50 p-3">
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 mb-1">
                <FaCircleNotch className="text-base" /> Overtime
              </div>
              <p className="text-xl font-semibold tabular-nums">{card.overtimeHours ?? "—"}</p>
            </div>
          </div>

          {card.schedules && card.schedules.length > 0 && (
            <div className="overflow-x-auto rounded-lg border border-amber-100">
              <table className="table-fixed w-full border-collapse text-center">
                <thead>
                  <tr className="bg-amber-50 *:text-xs *:font-semibold *:text-amber-900 *:uppercase *:tracking-wider *:py-3 *:border-b *:border-amber-200">
                    <th className="text-left pl-6">Date / Day</th>
                    <th>Morning In</th>
                    <th>Morning Out</th>
                    <th>Afternoon In</th>
                    <th>Afternoon Out</th>
                    <th>Overtime In</th>
                    <th>Overtime Out</th>
                  </tr>
                </thead>
                <tbody>
                  {card.schedules.map((singleData) => {
                    const [dateId, schedule] = Object.entries(singleData)[0] as [
                      string,
                      { week: string; in_out: InOut },
                    ];
                    return (
                      <ReadOnlyScheduleRow key={dateId} dateId={dateId} schedule={schedule} />
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function StoreAttendancePage() {
  const [employees, setEmployees] = useState<EmployeeWithWork[]>([]);
  const [loading, setLoading] = useState(true);

  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [parsedCards, setParsedCards] = useState<TypeAttendanceCardGeo[]>([]);
  const [approvedCards, setApprovedCards] = useState<TypeAttendanceCardGeo[]>([]);
  const [isLinking, setIsLinking] = useState(false);

  const loadEmployees = () => {
    const storeName = localStorage.getItem("username") || "";
    getEmployees().then((all) => {
      const filtered = storeName
        ? (all as EmployeeWithWork[]).filter((e) => {
            if (!e.branch) return false;
            const branchLower = e.branch.toLowerCase();
            const storeLower = storeName.toLowerCase();
            return storeLower.includes(branchLower) || branchLower.includes(storeLower);
          })
        : (all as EmployeeWithWork[]);

      const withCards = filtered.filter(
        (e) =>
          e.employeeWorkData &&
          Array.isArray(e.employeeWorkData.data) &&
          e.employeeWorkData.data.length > 0,
      );
      setEmployees(withCards);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/excel/geo", {
        method: "POST",
        body: formData,
      });
      const results = await res.json();
      setParsedCards(results);
      setApprovedCards([]);
    } catch (error) {
      console.error("Failed to upload and parse Excel:", error);
      toast.error("Failed to upload and parse Excel");
    } finally {
      setIsUploading(false);
    }
  };

  const handleClear = () => {
    setFile(null);
    setParsedCards([]);
    setApprovedCards([]);
    const fileInput = document.getElementById("store-excel-upload") as HTMLInputElement | null;
    if (fileInput) fileInput.value = "";
  };

  const handleApprove = (card: TypeAttendanceCardGeo) => {
    setApprovedCards((prev) => {
      if (prev.some((c) => c.id === card.id && c.dateRange === card.dateRange)) return prev;
      return [...prev, card];
    });
  };

  const isCardApproved = (card: TypeAttendanceCardGeo) =>
    approvedCards.some((c) => c.id === card.id && c.dateRange === card.dateRange);

  const handleLinkToEmployees = async () => {
    if (approvedCards.length === 0) {
      toast.warning("No approved cards to link. Approve cards first.");
      return;
    }
    setIsLinking(true);
    try {
      const result = await linkToEmployees(approvedCards);
      if (result.success) {
        toast.success(result.message);
        handleClear();
        setLoading(true);
        loadEmployees();
      } else {
        toast.error(result.message ?? "Failed to link data");
      }
    } catch {
      toast.error("Something went wrong. Try again.");
    } finally {
      setIsLinking(false);
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-amber-900 flex items-center gap-2">
          <FiClock className="text-amber-700" />
          Attendance
        </h1>
        <p className="text-sm text-amber-700/80 mt-1">
          Upload Excel file, preview attendance cards, approve and link to employees.
        </p>
      </div>

      {/* Upload Section */}
      <div className="rounded-xl border border-amber-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="store-excel-upload" className="text-xs font-semibold text-amber-900">
              Excel File
            </label>
            <input
              id="store-excel-upload"
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="text-sm text-amber-900 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-amber-100 file:text-amber-800 hover:file:bg-amber-200"
            />
          </div>
          <div className="flex gap-2 self-end">
            <button
              type="button"
              onClick={handleUpload}
              disabled={!file || isUploading}
              className="mt-5 rounded-lg bg-amber-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50 transition"
            >
              {isUploading ? "Processing..." : "Upload & Parse"}
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="mt-5 rounded-lg border border-amber-200 bg-white px-4 py-2.5 text-sm font-medium text-amber-800 hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Parsed Cards (read-only with approve) */}
      {parsedCards.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-amber-900">
            Parsed Cards ({parsedCards.length})
          </h2>
          {parsedCards.map((card, idx) => (
            <ReadOnlyCardView
              key={`${card.id}-${idx}`}
              card={card as unknown as AttendanceCard}
              onApprove={() => handleApprove(card)}
              isApproved={isCardApproved(card)}
            />
          ))}
        </div>
      )}

      {/* Batch Link Section */}
      {approvedCards.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-amber-800 mb-3">
            {approvedCards.length} card{approvedCards.length !== 1 ? "s" : ""} approved &mdash;
            ready to link to employees
          </p>
          <button
            type="button"
            onClick={handleLinkToEmployees}
            disabled={isLinking}
            className="flex items-center gap-2 rounded-lg bg-amber-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-800 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50"
          >
            <FiLink className="text-sm" />
            {isLinking ? "Linking..." : "Link to employees"}
          </button>
        </div>
      )}

      {/* Existing Linked Records */}
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-700" />
        </div>
      ) : employees.length > 0 ? (
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-amber-900">
            Linked Attendance Records ({employees.length} employee{employees.length !== 1 ? "s" : ""})
          </h2>
          {employees.map((emp) => (
            <div key={emp.id} className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-amber-700 text-white size-9 flex items-center justify-center text-xs font-bold shrink-0">
                  {`${emp.firstName?.[0] ?? ""}${emp.lastName?.[0] ?? ""}`.toUpperCase() || "??"}
                </div>
                <div>
                  <p className="text-base font-semibold text-amber-900">
                    {emp.lastName}, {emp.firstName}
                  </p>
                  <p className="text-xs text-amber-600">
                    #{emp.employeeId || "N/A"} &middot; {emp.employeeWorkData!.data.length} card
                    {emp.employeeWorkData!.data.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <div className="space-y-3 pl-12">
                {emp.employeeWorkData!.data.map((card, idx) => (
                  <LinkedCardView key={idx} card={card} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-12 text-center flex flex-col items-center">
          <FiClock className="text-4xl text-amber-300 mb-4" />
          <h3 className="text-lg font-medium text-amber-900 mb-1">No Linked Records Yet</h3>
          <p className="text-amber-700/80 text-sm">
            Upload an Excel file, approve cards, and link them to employees.
          </p>
        </div>
      )}
    </div>
  );
}

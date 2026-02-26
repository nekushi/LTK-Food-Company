"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { updateAccountProfile } from "@/dal/accounts/update-account-profile";
import {
  FiArrowLeft,
  FiUser,
  FiShield,
  FiBriefcase,
  FiPhone,
  FiMail,
  FiMapPin,
  FiCalendar,
  FiHash,
  FiEdit2,
  FiX,
  FiSave,
} from "react-icons/fi";

const ROLE_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  ADMIN: { bg: "bg-purple-50", text: "text-purple-700", dot: "bg-purple-500" },
  HR: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  INVENTORY: { bg: "bg-teal-50", text: "text-teal-700", dot: "bg-teal-500" },
  STORE: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  DELIVERY: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
  },
};

interface AccountData {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  role: string;
}

interface EmployeeDataRow {
  id: string;
  dateHired: string;
  sss: string | null;
  pagIbig: string | null;
  philhealth: string | null;
  tin: string | null;
  contactNo: string | null;
  email: string | null;
  address: string | null;
}

interface ProfileClientProps {
  account: AccountData;
  employeeData: EmployeeDataRow | null;
  employeeId: string | null;
  /** When provided (e.g. from admin), used for the back link instead of /hr/accounts */
  backHref?: string;
  backLabel?: string;
}

const inputClass =
  "w-full rounded-md border border-amber-200 bg-white px-3 py-1.5 text-sm text-amber-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500";

export default function ProfileClient({
  account,
  employeeData,
  employeeId,
  backHref = "/hr/accounts",
  backLabel = "Back to Accounts",
}: ProfileClientProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [firstName, setFirstName] = useState(account.firstName);
  const [lastName, setLastName] = useState(account.lastName);
  const [username, setUsername] = useState(account.username);

  const [sss, setSss] = useState(employeeData?.sss ?? "");
  const [pagIbig, setPagIbig] = useState(employeeData?.pagIbig ?? "");
  const [philhealth, setPhilhealth] = useState(employeeData?.philhealth ?? "");
  const [tin, setTin] = useState(employeeData?.tin ?? "");
  const [contactNo, setContactNo] = useState(employeeData?.contactNo ?? "");
  const [email, setEmail] = useState(employeeData?.email ?? "");
  const [address, setAddress] = useState(employeeData?.address ?? "");

  const handleCancel = () => {
    setFirstName(account.firstName);
    setLastName(account.lastName);
    setUsername(account.username);
    setSss(employeeData?.sss ?? "");
    setPagIbig(employeeData?.pagIbig ?? "");
    setPhilhealth(employeeData?.philhealth ?? "");
    setTin(employeeData?.tin ?? "");
    setContactNo(employeeData?.contactNo ?? "");
    setEmail(employeeData?.email ?? "");
    setAddress(employeeData?.address ?? "");
    setEditing(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const result = await updateAccountProfile({
      accountId: account.id,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      username: username.trim(),
      sss: sss.trim(),
      pagIbig: pagIbig.trim(),
      philhealth: philhealth.trim(),
      tin: tin.trim(),
      contactNo: contactNo.trim(),
      email: email.trim(),
      address: address.trim(),
    });
    setSaving(false);

    if (result.success) {
      setEditing(false);
      router.refresh();
    }
  };

  const initials =
    `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase() || "??";
  const roleStyle = ROLE_COLORS[account.role] ?? {
    bg: "bg-gray-50",
    text: "text-gray-700",
    dot: "bg-gray-500",
  };
  const dateHired = employeeData?.dateHired
    ? new Date(employeeData.dateHired).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <div className="p-8 space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <Link
          href={backHref}
          className="flex items-center gap-2 text-sm text-amber-700 hover:text-amber-900 transition-colors"
        >
          <FiArrowLeft /> {backLabel}
        </Link>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-800 hover:bg-amber-100 transition-colors"
          >
            <FiEdit2 className="text-sm" />
            Edit Profile
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCancel}
              disabled={saving}
              className="flex items-center gap-2 rounded-lg border border-amber-200 bg-white px-4 py-2 text-sm font-medium text-amber-700 hover:bg-amber-50 transition-colors disabled:opacity-50"
            >
              <FiX className="text-sm" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-amber-700 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-800 transition-colors disabled:opacity-50"
            >
              <FiSave className="text-sm" />
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        )}
      </div>

      {/* Profile Header */}
      <div className="rounded-xl border border-amber-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="rounded-full bg-amber-700 text-white size-16 flex items-center justify-center text-xl font-bold shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            {editing ? (
              <div className="grid grid-cols-2 gap-3 max-w-md">
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First Name"
                  className={inputClass}
                />
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last Name"
                  className={inputClass}
                />
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  className={`${inputClass} col-span-2`}
                />
              </div>
            ) : (
              <>
                <h1 className="text-xl font-bold text-amber-900">
                  {firstName} {lastName}
                </h1>
                <p className="text-sm text-amber-600 mt-0.5">@{username}</p>
              </>
            )}
            <div className="mt-2 flex items-center gap-3">
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${roleStyle.bg} ${roleStyle.text}`}
              >
                <span className={`size-1.5 rounded-full ${roleStyle.dot}`} />
                {account.role}
              </span>
              {employeeId && (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  <FiHash className="text-[10px]" />
                  {employeeId}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Account + Employee Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-amber-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-amber-800 flex items-center gap-2 mb-4">
            <FiUser className="text-amber-600" />
            Account Information
          </h2>
          <div className="space-y-3">
            <InfoRow label="First Name" value={firstName} />
            <InfoRow label="Last Name" value={lastName} />
            <InfoRow label="Username" value={username} />
            <InfoRow label="Role" value={account.role} />
          </div>
        </div>

        <div className="rounded-xl border border-amber-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-amber-800 flex items-center gap-2 mb-4">
            <FiBriefcase className="text-amber-600" />
            Employee Details
          </h2>
          <div className="space-y-3">
            <InfoRow
              label="Date Hired"
              value={dateHired}
              icon={<FiCalendar className="text-amber-500" />}
            />
            {editing ? (
              <>
                <EditRow
                  label="SSS"
                  value={sss}
                  onChange={setSss}
                  icon={<FiShield className="text-amber-500" />}
                />
                <EditRow
                  label="Pag-IBIG"
                  value={pagIbig}
                  onChange={setPagIbig}
                  icon={<FiShield className="text-amber-500" />}
                />
                <EditRow
                  label="PhilHealth"
                  value={philhealth}
                  onChange={setPhilhealth}
                  icon={<FiShield className="text-amber-500" />}
                />
                <EditRow
                  label="TIN"
                  value={tin}
                  onChange={setTin}
                  icon={<FiShield className="text-amber-500" />}
                />
              </>
            ) : (
              <>
                <InfoRow
                  label="SSS"
                  value={sss}
                  icon={<FiShield className="text-amber-500" />}
                />
                <InfoRow
                  label="Pag-IBIG"
                  value={pagIbig}
                  icon={<FiShield className="text-amber-500" />}
                />
                <InfoRow
                  label="PhilHealth"
                  value={philhealth}
                  icon={<FiShield className="text-amber-500" />}
                />
                <InfoRow
                  label="TIN"
                  value={tin}
                  icon={<FiShield className="text-amber-500" />}
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="rounded-xl border border-amber-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-amber-800 flex items-center gap-2 mb-4">
          <FiPhone className="text-amber-600" />
          Contact Information
        </h2>
        {editing ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ContactEditCard
              label="Phone"
              icon={<FiPhone className="text-amber-600" />}
              value={contactNo}
              onChange={setContactNo}
            />
            <ContactEditCard
              label="Email"
              icon={<FiMail className="text-amber-600" />}
              value={email}
              onChange={setEmail}
            />
            <ContactEditCard
              label="Address"
              icon={<FiMapPin className="text-amber-600" />}
              value={address}
              onChange={setAddress}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ContactCard
              label="Phone"
              icon={<FiPhone className="text-amber-600" />}
              value={contactNo}
            />
            <ContactCard
              label="Email"
              icon={<FiMail className="text-amber-600" />}
              value={email}
            />
            <ContactCard
              label="Address"
              icon={<FiMapPin className="text-amber-600" />}
              value={address}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | null | undefined;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-amber-50 last:border-b-0">
      <span className="text-xs text-amber-600 flex items-center gap-1.5">
        {icon}
        {label}
      </span>
      <span
        className={`text-sm font-medium ${value ? "text-amber-900" : "text-amber-400 italic"}`}
      >
        {value || "N/A"}
      </span>
    </div>
  );
}

function EditRow({
  label,
  value,
  onChange,
  icon,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5 border-b border-amber-50 last:border-b-0">
      <span className="text-xs text-amber-600 flex items-center gap-1.5 shrink-0">
        {icon}
        {label}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="N/A"
        className="w-40 text-right rounded-md border border-amber-200 bg-white px-2 py-1 text-sm text-amber-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
      />
    </div>
  );
}

function ContactCard({
  label,
  icon,
  value,
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg bg-amber-50/50 border border-amber-100 p-4">
      <span className="mt-0.5 shrink-0">{icon}</span>
      <div>
        <p className="text-[11px] text-amber-600 font-medium uppercase tracking-wide">
          {label}
        </p>
        <p
          className={`text-sm font-medium mt-0.5 ${value ? "text-amber-900" : "text-amber-400 italic"}`}
        >
          {value || "N/A"}
        </p>
      </div>
    </div>
  );
}

function ContactEditCard({
  label,
  icon,
  value,
  onChange,
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg bg-amber-50/50 border border-amber-100 p-4">
      <span className="mt-0.5 shrink-0">{icon}</span>
      <div className="flex-1">
        <p className="text-[11px] text-amber-600 font-medium uppercase tracking-wide mb-1">
          {label}
        </p>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="N/A"
          className="w-full rounded-md border border-amber-200 bg-white px-2 py-1 text-sm text-amber-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
        />
      </div>
    </div>
  );
}

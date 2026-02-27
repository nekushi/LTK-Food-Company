export const dynamic = "force-dynamic";

import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";
import { getAccountProfile } from "../../../../../dal/accounts/get-account-profile";
import ProfileClient from "../../../../hr/accounts/[accountId]/profile-client";

export default async function AdminAccountProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { success, account, employeeData, employeeId } =
    await getAccountProfile(id);

  if (!success || !account) {
    return (
      <div className="p-8">
        <Link
          href="/admin/personnel/admin-info"
          className="flex items-center gap-2 text-sm text-amber-700 hover:text-amber-900 mb-6"
        >
          <FiArrowLeft /> Back to Admin Info
        </Link>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-12 text-center">
          <h3 className="text-lg font-medium text-amber-900 mb-1">
            Account Not Found
          </h3>
          <p className="text-amber-700/80 text-sm">
            The account you&apos;re looking for doesn&apos;t exist.
          </p>
        </div>
      </div>
    );
  }

  const serializedEmployeeData = employeeData
    ? {
        ...employeeData,
        dateHired: (
          employeeData as { dateHired: Date }
        ).dateHired.toISOString(),
      }
    : null;

  return (
    <ProfileClient
      account={account}
      employeeData={serializedEmployeeData}
      employeeId={employeeId}
      backHref="/admin/personnel/admin-info"
      backLabel="Back to Admin Info"
      // editOnlyEmployeeData
      // allowDelete
    />
  );
}

import Link from "next/link";
import { FaArrowRight } from "react-icons/fa";
import { FiMapPin } from "react-icons/fi";
import { getAdminStores } from "@/dal/admin/manage-branch";

export const dynamic = "force-dynamic";

export default async function ManageBranchListPage() {
  const { success, data: stores } = await getAdminStores();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-amber-900 mb-2">Manage Branch</h1>
      <p className="text-amber-800/80 mb-6">Select a branch below to view detailed reports, inventory, and request history.</p>

      {success && stores && stores.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {stores.map((store) => (
            <Link
              href={`/admin/branch/manage/${store.id}`}
              key={store.id}
              className="group flex flex-col justify-between rounded-xl border border-amber-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-amber-300 transition-all cursor-pointer"
            >
              <div>
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 mb-4">
                  <FiMapPin className="text-lg" />
                </div>
                <h3 className="text-lg font-bold text-amber-900 mb-1 group-hover:text-amber-700 transition-colors truncate">
                  {store.storeName}
                </h3>
                {store.fullName && (
                  <p className="text-sm text-amber-600/80 truncate">{store.fullName}</p>
                )}
              </div>

              <div className="mt-6 flex items-center justify-between text-sm font-medium text-amber-500 group-hover:text-amber-600">
                <span>View Profile</span>
                <FaArrowRight className="text-xs transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-12 text-center flex flex-col items-center">
          <FiMapPin className="text-4xl text-amber-300 mb-4" />
          <h3 className="text-lg font-medium text-amber-900 mb-1">No Branches Found</h3>
          <p className="text-amber-700/80">There are currently no store or branch accounts registered.</p>
        </div>
      )}
    </div>
  );
}

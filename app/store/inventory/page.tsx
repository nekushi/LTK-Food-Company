import { Suspense } from "react";
import { getBranchInventory } from "@/dal/store/get-branch-inventory";

export default async function BranchInventoryPage() {
  const inventory = await getBranchInventory();

  return (
    <div className="space-y-6 p-8">
      <div>
        <h1 className="text-2xl font-bold text-amber-900">Branch Inventory</h1>
        <p className="text-amber-800/80 mt-1 text-sm">
          A full list of all active inventory items assigned to your branch. This primarily includes all Issued stocks from the main inventory.
        </p>
      </div>

      <div className="rounded-xl border border-amber-200 bg-white shadow-sm overflow-hidden mt-8">
        <div className="border-b border-amber-200 bg-amber-50 px-6 py-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-amber-900">
            Inventory List
          </h2>
          <div className="text-sm font-medium text-amber-700">
            Total Items: {inventory.length}
          </div>
        </div>

        <div className="overflow-x-auto">
          {inventory.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-amber-600">
              <span className="text-4xl mb-4">📦</span>
              <p className="text-lg font-medium text-amber-800">No inventory found</p>
              <p className="text-sm mt-1 text-amber-600/80">
                It looks like your branch has no issued stocks yet.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white border-b border-amber-100/60 text-amber-900">
                <tr>
                  <th className="px-6 py-4 font-semibold">General Name</th>
                  <th className="px-6 py-4 font-semibold">Specific Name</th>
                  <th className="px-6 py-4 font-semibold">Recognition</th>
                  <th className="px-6 py-4 font-semibold">Stock Type</th>
                  <th className="px-6 py-4 font-semibold text-right">Qty</th>
                  <th className="px-6 py-4 font-semibold">Unit</th>
                  <th className="px-6 py-4 font-semibold">Month/Year</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-amber-50 hover:bg-amber-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-amber-900">
                      {item.productNameGeneral}
                    </td>
                    <td className="px-6 py-4 text-amber-800 text-xs">
                      {item.productNameSpecific}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 rounded-full">
                        {item.accountRecognition}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-amber-700 text-xs">
                      {item.typeOfStocks}
                    </td>
                    <td className="px-6 py-4 text-emerald-600 font-bold text-right">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 text-amber-600 text-xs">
                      {item.unitOfMeasurement}
                    </td>
                    <td className="px-6 py-4 text-amber-700 text-xs">
                      {item.periodMonth} {item.periodYear}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

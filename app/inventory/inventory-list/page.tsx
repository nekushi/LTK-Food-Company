import { MdDateRange } from "react-icons/md";

export default function InventoryPage() {
  return (
    <div className="bg-slate-50 h-full p-8">
      <h2 className="text-xl font-medium mb-4 after:content-[''] after:block after:w-16 after:h-1.5 after:bg-amber-400">
        Inventory
      </h2>
      {/* INVENTORY LIST */}
      <div className="border rounded-xl p-4 space-y-4">
        <div className="h-24">
          <div className="rounded-md h-full border w-1/4">
            <div className="ml-6 mt-6 flex flex-col">
              <div className="flex flex-row items-center gap-1 *:font-medium">
                <MdDateRange className="text-slate-800 inline align-middle text-xl" />{" "}
                <p className="text-sm text-slate-600">Total Days:</p>
              </div>
              <p className="tabular-nums font-semibold text-2xl indent-6">
                {54}
              </p>
            </div>
          </div>
        </div>
        <div className="border rounded-md">
          <table></table>
        </div>
      </div>
    </div>
  );
}

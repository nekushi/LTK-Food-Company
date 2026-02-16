import {
  getItemsInventory,
  ItemsReturnTypeInventory,
} from "@/dal/inventory/get-items";
import { Suspense } from "react";
import InventoryItemsPage from "./item-list";

export default async function InventoryItemsPageSSR() {
  const items: ItemsReturnTypeInventory[] = await getItemsInventory();

  return (
    // <div className="space-y-6 p-8">
    //   <h1 className="text-xl font-semibold text-amber-900">Items</h1>

    //   <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    //     <div className="rounded-xl border border-amber-200 bg-white p-4 shadow-sm">
    //       <span className="text-sm font-medium text-amber-700">
    //         Total items
    //       </span>
    //       <p className="mt-1 text-2xl font-semibold text-amber-900">
    //         {metrics.total}
    //       </p>
    //     </div>
    //     <div className="rounded-xl border border-amber-200 bg-white p-4 shadow-sm">
    //       <span className="text-sm font-medium text-amber-700">Beginning</span>
    //       <p className="mt-1 text-2xl font-semibold text-amber-900">
    //         {metrics.beginning}
    //       </p>
    //     </div>
    //     <div className="rounded-xl border border-amber-200 bg-white p-4 shadow-sm">
    //       <span className="text-sm font-medium text-amber-700">Additional</span>
    //       <p className="mt-1 text-2xl font-semibold text-amber-900">
    //         {metrics.additional}
    //       </p>
    //     </div>
    //     <div className="rounded-xl border border-amber-200 bg-white p-4 shadow-sm">
    //       <span className="text-sm font-medium text-amber-700">Issued</span>
    //       <p className="mt-1 text-2xl font-semibold text-amber-900">
    //         {metrics.issued}
    //       </p>
    //     </div>
    //   </div>

    //   <div className="flex flex-wrap items-center gap-4 rounded-xl border border-amber-200 bg-white p-4">
    //     <span className="text-sm font-medium text-amber-900">Filters</span>
    //     <div className="flex flex-wrap gap-3">
    //       <div>
    //         <label className="sr-only" htmlFor="filter-product-general">
    //           Product name (general)
    //         </label>
    //         <input
    //           id="filter-product-general"
    //           type="text"
    //           value={filterProductGeneral}
    //           onChange={(e) => setFilterProductGeneral(e.target.value)}
    //           placeholder="Product name (general)"
    //           className="rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm text-amber-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
    //         />
    //       </div>
    //       <div>
    //         <label className="sr-only" htmlFor="filter-month">
    //           Period (mm)
    //         </label>
    //         <select
    //           id="filter-month"
    //           value={filterMonth}
    //           onChange={(e) => setFilterMonth(e.target.value)}
    //           className="rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm text-amber-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
    //         >
    //           <option value="">All months</option>
    //           {months.map((m) => (
    //             <option key={m} value={m}>
    //               {m}
    //             </option>
    //           ))}
    //         </select>
    //       </div>
    //       <div>
    //         <label className="sr-only" htmlFor="filter-year">
    //           Period (yyyy)
    //         </label>
    //         <select
    //           id="filter-year"
    //           value={filterYear}
    //           onChange={(e) => setFilterYear(e.target.value)}
    //           className="rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm text-amber-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
    //         >
    //           <option value="">All years</option>
    //           {years.map((y) => (
    //             <option key={y} value={String(y)}>
    //               {y}
    //             </option>
    //           ))}
    //         </select>
    //       </div>
    //     </div>
    //   </div>

    //   <div className="max-w-[1800px] overflow-hidden rounded-xl border border-amber-200 bg-white shadow-sm">
    //     <div className="overflow-x-auto">
    //       <table className="w-max min-w-full table-auto text-left text-sm">
    //         <thead>
    //           <tr className="border-b border-amber-200 bg-amber-50">
    //             <th className="whitespace-nowrap px-5 py-4 font-semibold text-amber-900">
    //               Period
    //             </th>
    //             <th className="whitespace-nowrap px-5 py-4 font-semibold text-amber-900">
    //               Type of stocks
    //             </th>
    //             <th className="whitespace-nowrap px-5 py-4 font-semibold text-amber-900">
    //               VAT type
    //             </th>
    //             <th className="whitespace-nowrap px-5 py-4 font-semibold text-amber-900">
    //               Supplier
    //             </th>
    //             <th className="whitespace-nowrap px-5 py-4 font-semibold text-amber-900">
    //               TIN no
    //             </th>
    //             <th className="min-w-[120px] px-5 py-4 font-semibold text-amber-900">
    //               Product (general)
    //             </th>
    //             <th className="min-w-[140px] px-5 py-4 font-semibold text-amber-900">
    //               Product (specific)
    //             </th>
    //             <th className="whitespace-nowrap px-5 py-4 font-semibold text-amber-900">
    //               Item code
    //             </th>
    //             <th className="whitespace-nowrap px-5 py-4 font-semibold text-amber-900">
    //               Account recognition
    //             </th>
    //             <th className="whitespace-nowrap px-5 py-4 font-semibold text-amber-900">
    //               Measurement
    //             </th>
    //             <th className="whitespace-nowrap px-5 py-4 font-semibold text-amber-900">
    //               Qty
    //             </th>
    //             <th className="whitespace-nowrap px-5 py-4 font-semibold text-amber-900">
    //               Unit price
    //             </th>
    //             <th className="whitespace-nowrap px-5 py-4 font-semibold text-amber-900">
    //               Total price
    //             </th>
    //             <th className="whitespace-nowrap px-5 py-4 font-semibold text-amber-900">
    //               Vatable
    //             </th>
    //             <th className="whitespace-nowrap px-5 py-4 font-semibold text-amber-900">
    //               VAT
    //             </th>
    //             <th className="whitespace-nowrap px-5 py-4 font-semibold text-amber-900">
    //               EWT
    //             </th>
    //             <th className="whitespace-nowrap px-5 py-4 font-semibold text-amber-900">
    //               Net pay
    //             </th>
    //           </tr>
    //         </thead>
    //         <tbody>
    //           {filtered.length === 0 ? (
    //             <tr>
    //               <td
    //                 colSpan={16}
    //                 className="px-5 py-12 text-center text-amber-700"
    //               >
    //                 No items match the filters.
    //               </td>
    //             </tr>
    //           ) : (
    //             filtered.map((item: InventoryItem) => (
    //               <tr
    //                 key={item.id}
    //                 className="border-b border-amber-100 hover:bg-amber-50/50"
    //               >
    //                 <td className="whitespace-nowrap px-5 py-3 text-amber-900">
    //                   {formatPeriod(item.periodMonth, item.periodYear)}
    //                 </td>
    //                 <td className="whitespace-nowrap px-5 py-3 text-amber-900">
    //                   {item.typeOfStocks}
    //                 </td>
    //                 <td className="whitespace-nowrap px-5 py-3 text-amber-900">
    //                   {item.typeOfVatTaxpayer ?? "—"}
    //                 </td>
    //                 <td className="min-w-[100px] px-5 py-3 text-amber-900">
    //                   {item.supplierName}
    //                 </td>
    //                 <td className="whitespace-nowrap px-5 py-3 text-amber-900">
    //                   {item.tinNo ?? "—"}
    //                 </td>
    //                 <td className="min-w-[120px] px-5 py-3 text-amber-900">
    //                   {item.productNameGeneral}
    //                 </td>
    //                 <td className="min-w-[140px] px-5 py-3 text-amber-900">
    //                   {item.productNameSpecific}
    //                 </td>
    //                 <td className="whitespace-nowrap px-5 py-3 text-amber-900">
    //                   {item.itemCode ?? "—"}
    //                 </td>
    //                 <td className="whitespace-nowrap px-5 py-3 text-amber-900">
    //                   {item.accountingRecognition}
    //                 </td>
    //                 <td className="whitespace-nowrap px-5 py-3 text-amber-900">
    //                   {item.measurement}
    //                 </td>
    //                 <td className="whitespace-nowrap px-5 py-3 text-amber-900">
    //                   {item.quantity}
    //                 </td>
    //                 <td className="whitespace-nowrap px-5 py-3 text-amber-900">
    //                   {item.unitPrice.toFixed(2)}
    //                 </td>
    //                 <td className="whitespace-nowrap px-5 py-3 text-amber-900">
    //                   {item.totalPrice.toFixed(2)}
    //                 </td>
    //                 <td className="whitespace-nowrap px-5 py-3 text-amber-900">
    //                   {item.vatable.toFixed(2)}
    //                 </td>
    //                 <td className="whitespace-nowrap px-5 py-3 text-amber-900">
    //                   {item.vat.toFixed(2)}
    //                 </td>
    //                 <td className="whitespace-nowrap px-5 py-3 text-amber-900">
    //                   {item.ewt.toFixed(2)}
    //                 </td>
    //                 <td className="whitespace-nowrap px-5 py-3 font-medium text-amber-900">
    //                   {item.netPay.toFixed(2)}
    //                 </td>
    //               </tr>
    //             ))
    //           )}
    //         </tbody>
    //       </table>
    //     </div>
    //   </div>
    // </div>
    <Suspense fallback={<div>Loading...</div>}>
      <InventoryItemsPage items={items} />
    </Suspense>
  );
}

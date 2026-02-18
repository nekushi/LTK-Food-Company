"use client";

import { Activity, useMemo, useState } from "react";
import {
  MergedItemReturnTypeInventory,
  requestItems,
} from "@/dal/inventory/request-items";
import { ItemsReturnTypeInventory } from "@/dal/inventory/get-items";
import { toast } from "react-toastify";

const inputClass =
  "w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm text-amber-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500";
const labelClass = "mb-1 block text-sm font-medium text-amber-900";

// type RestItemsReturnTypeInventory = {
//   periodMonth: string;
//   periodYear: string;
//   supplierName: string;
//   tinNumber: string | null;
//   typeOfVatTaxpayer: string | null;
//   typeOfStocks: string;
//   itemCode: string | null;
//   unitPrice: number;
//   totalPrice: number;
//   vatable: number;
//   vat: number;
//   ewt: number;
//   netPay: number;
// };

// interface MergedItemReturnTypeInventory extends RestItemsReturnTypeInventory {
//   id: string;
//   productNameGeneral: string;
//   accountRecognition: string;
//   unitOfMeasurement: string;
//   quantity: number;
// }

export default function StoreRequestItemPage({
  items,
}: {
  items: ItemsReturnTypeInventory[];
}) {
  const [cart, setCart] = useState<MergedItemReturnTypeInventory[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalItem, setModalItem] = useState<ItemsReturnTypeInventory | null>(
    null,
  );
  const [formProductNameGeneral, setFormProductNameGeneral] = useState("");
  const [formProductNameSpecific, setFormProductNameSpecific] = useState("");
  const [formQuantity, setFormQuantity] = useState<number>(1);
  const [formUom, setFormUom] = useState("");
  const [formId, setFormId] = useState<string>("");
  const [formAccRecognition, setFormAccRecognition] = useState("");
  const [formPeriodMonth, setFormPeriodMonth] = useState("");
  const [formPeriodYear, setFormPeriodYear] = useState("");
  const [formSupplierName, setFormSupplierName] = useState("");
  const [formTinNumber, setFormTinNumber] = useState<string | null>();
  const [formTypeOfVatTaxpayer, setFormTypeOfVatTaxpayer] = useState<
    string | null
  >();
  const [formTypeOfStocks, setFormTypeOfStocks] = useState("");
  const [formItemCode, setFormItemCode] = useState<string | null>();
  const [formUnitPrice, setFormUnitPrice] = useState<number>(0);
  const [formTotalPrice, setFormTotalPrice] = useState<number>(0);
  const [formVatable, setFormVatable] = useState<number>(0);
  const [formVat, setFormVat] = useState<number>(0);
  const [formEwt, setFormEwt] = useState<number>(0);
  const [formNetPay, setFormNetPay] = useState<number>(0);

  // const openModal = (item: MergedItemReturnTypeInventory) => {
  const openModal = (item: ItemsReturnTypeInventory) => {
    setModalItem(item);
    setFormId(item.id);
    setFormProductNameGeneral(item.productNameGeneral);
    setFormAccRecognition(item.accountRecognition);
    setFormQuantity(1);
    setFormUom(item.unitOfMeasurement);
    setFormPeriodMonth(item.periodMonth);
    setFormPeriodYear(item.periodYear);
    setFormSupplierName(item.supplierName);
    setFormTinNumber(item.tinNumber || "");
    setFormTypeOfVatTaxpayer(item.typeOfVatTaxpayer || "");
    setFormTypeOfStocks(item.typeOfStocks);
    setFormItemCode(item.itemCode || "");
    setFormUnitPrice(item.unitPrice);
    setFormTotalPrice(item.totalPrice);
    setFormVatable(item.vatable);
    setFormVat(item.vat);
    setFormEwt(item.ewt);
    setFormNetPay(item.netPay);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalItem(null);
  };

  const addToCart = () => {
    const qty = Number(formQuantity);
    if (Number.isNaN(qty) || qty <= 0) return;
    const line: MergedItemReturnTypeInventory = {
      id: formId,
      productNameGeneral:
        (formProductNameGeneral.trim() || modalItem?.productNameGeneral) ?? "",
      productNameSpecific:
        (formProductNameSpecific.trim() || modalItem?.productNameSpecific) ??
        "",
      quantity: qty,
      unitOfMeasurement: (formUom.trim() || modalItem?.unitOfMeasurement) ?? "",
      accountRecognition:
        (formAccRecognition.trim() || modalItem?.accountRecognition) ?? "",
      periodMonth: (formPeriodMonth.trim() || modalItem?.periodMonth) ?? "",
      periodYear: (formPeriodYear.trim() || modalItem?.periodYear) ?? "",
      supplierName: (formSupplierName.trim() || modalItem?.supplierName) ?? "",
      tinNumber: (formTinNumber?.trim() || modalItem?.tinNumber) ?? "",
      typeOfVatTaxpayer:
        (formTypeOfVatTaxpayer?.trim() || modalItem?.typeOfVatTaxpayer) ?? "",
      typeOfStocks: (formTypeOfStocks.trim() || modalItem?.typeOfStocks) ?? "",
      itemCode: (formItemCode?.trim() || modalItem?.itemCode) ?? "",
      unitPrice:
        (Number(formUnitPrice.toFixed(2)) || modalItem?.unitPrice) ?? 0,
      totalPrice:
        (Number(formTotalPrice.toFixed(2)) || modalItem?.totalPrice) ?? 0,
      vatable: (Number(formVatable.toFixed(2)) || modalItem?.vatable) ?? 0,
      vat: (Number(formVat.toFixed(2)) || modalItem?.vat) ?? 0,
      ewt: (Number(formEwt.toFixed(2)) || modalItem?.ewt) ?? 0,
      netPay: (Number(formNetPay.toFixed(2)) || modalItem?.netPay) ?? 0,
    };

    setCart((prev) => [...prev, line]);
    toast.success("Added to cart");
    closeModal();
  };

  const removeFromCart = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const sendRequest = async () => {
    if (cart.length === 0) return;
    console.log("Send request", cart);
    const result = await requestItems(cart);

    if (result.success) {
      toast.success(result.message);
      setCart([]);
    }

    if (!result.success) {
      toast.error(result.message);
    }
  };

  return (
    <div className="space-y-6 p-8">
      <h1 className="text-xl font-semibold text-amber-900">Request item</h1>
      <p className="text-amber-800/80">
        Request available items from inventory. Click an item to add it to your
        cart, then send request.
      </p>

      {/* Available items – product name (general), quantity, uom */}
      <div className="overflow-hidden rounded-xl border border-amber-200 bg-white shadow-sm">
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-2">
          <h2 className="text-sm font-semibold text-amber-900">
            Available items (from inventory) (for reference)
          </h2>
          <p className="text-xs text-amber-700/80">
            Click a row to open the form and add to cart
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-full table-auto text-left text-sm">
            <thead>
              <tr className="border-b border-amber-200 bg-amber-50/70">
                <th className="whitespace-nowrap px-5 py-3 font-semibold text-amber-900">
                  Product name (general)
                </th>
                <th className="whitespace-nowrap px-5 py-3 font-semibold text-amber-900">
                  Account Recognition
                </th>
                <th className="whitespace-nowrap px-5 py-3 font-semibold text-amber-900">
                  Quantity
                </th>
                <th className="whitespace-nowrap px-5 py-3 font-semibold text-amber-900">
                  Unit of measurement
                </th>
                <th className="w-24 px-5 py-3 font-semibold text-amber-900">
                  Action
                </th>
                <Activity mode="hidden">
                  <th className="w-24 px-5 py-3 font-semibold text-amber-900">
                    Product Name Specific
                  </th>
                  <th className="w-24 px-5 py-3 font-semibold text-amber-900">
                    Period Month
                  </th>
                  <th className="w-24 px-5 py-3 font-semibold text-amber-900">
                    Period Year
                  </th>
                  <th className="w-24 px-5 py-3 font-semibold text-amber-900">
                    Supplier Name
                  </th>
                  <th className="w-24 px-5 py-3 font-semibold text-amber-900">
                    TIN Number
                  </th>
                  <th className="w-24 px-5 py-3 font-semibold text-amber-900">
                    Type of Vat Taxpayer
                  </th>
                  <th className="w-24 px-5 py-3 font-semibold text-amber-900">
                    Type of Stocks
                  </th>
                  <th className="w-24 px-5 py-3 font-semibold text-amber-900">
                    Item Code
                  </th>
                  <th className="w-24 px-5 py-3 font-semibold text-amber-900">
                    Unit Price
                  </th>
                  <th className="w-24 px-5 py-3 font-semibold text-amber-900">
                    Total Price
                  </th>
                  <th className="w-24 px-5 py-3 font-semibold text-amber-900">
                    Vatable
                  </th>
                  <th className="w-24 px-5 py-3 font-semibold text-amber-900">
                    VAT
                  </th>
                  <th className="w-24 px-5 py-3 font-semibold text-amber-900">
                    EWT
                  </th>
                  <th className="w-24 px-5 py-3 font-semibold text-amber-900">
                    Net Pay
                  </th>
                </Activity>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr
                  key={item.id}
                  className="cursor-pointer border-b border-amber-100 hover:bg-amber-50/50"
                  onClick={() => openModal(item)}
                >
                  <td className="px-5 py-3 text-amber-900">
                    {item.productNameGeneral}
                  </td>
                  <td className="px-5 py-3 text-amber-900">
                    {item.accountRecognition}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-amber-900">
                    {item.quantity}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-amber-900">
                    {item.unitOfMeasurement}
                  </td>
                  <td
                    className="px-5 py-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => openModal(item)}
                      className="rounded bg-amber-500 px-2 py-1 text-xs font-medium text-white hover:bg-amber-600"
                    >
                      Add to cart
                    </button>
                  </td>
                  <Activity mode="hidden">
                    <td className="whitespace-nowrap px-5 py-3 text-amber-900">
                      {item.productNameSpecific}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-amber-900">
                      {item.periodMonth}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-amber-900">
                      {item.periodYear}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-amber-900">
                      {item.supplierName}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-amber-900">
                      {item.tinNumber}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-amber-900">
                      {item.typeOfVatTaxpayer}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-amber-900">
                      {item.typeOfStocks}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-amber-900">
                      {item.itemCode}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-amber-900">
                      {item.unitPrice}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-amber-900">
                      {item.totalPrice}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-amber-900">
                      {item.vatable}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-amber-900">
                      {item.vat}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-amber-900">
                      {item.ewt}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-amber-900">
                      {item.netPay}
                    </td>
                  </Activity>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cart and Send request */}
      <div className="rounded-xl border border-amber-200 bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-amber-900">
          Your request (cart)
        </h2>
        {cart.length === 0 ? (
          <p className="text-sm text-amber-600/90">
            Cart is empty. Click an item above to add.
          </p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-amber-200 text-amber-900">
                    <th className="py-2 font-medium">Product name</th>
                    <th className="py-2 font-medium">Account Recognition</th>
                    <th className="py-2 font-medium">Quantity</th>
                    <th className="py-2 font-medium">Unit of measurement</th>
                    <th className="w-20" />
                  </tr>
                </thead>
                <tbody>
                  {cart.map((line, index) => (
                    <tr key={index} className="border-b border-amber-100">
                      <td className="py-2 text-amber-900 hidden">{line.id}</td>
                      <td className="py-2 text-amber-900">
                        {line.productNameGeneral}
                      </td>
                      <td className="py-2 text-amber-900">
                        {line.accountRecognition}
                      </td>
                      <td className="py-2 text-amber-900">{line.quantity}</td>
                      <td className="py-2 text-amber-900">
                        {line.unitOfMeasurement}
                      </td>
                      <td className="py-2">
                        <button
                          type="button"
                          onClick={() => removeFromCart(index)}
                          className="text-xs text-amber-600 hover:text-amber-800"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              type="button"
              onClick={sendRequest}
              className="mt-4 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
            >
              Send request
            </button>
          </>
        )}
      </div>

      {/* Modal form */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-amber-900/30 p-4"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-md rounded-xl border border-amber-200 bg-white p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-4 text-lg font-semibold text-amber-900">
              Add to cart
            </h3>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Product Name General</label>
                <input
                  type="text"
                  value={formProductNameGeneral}
                  readOnly
                  onChange={(e) => setFormProductNameGeneral(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Quantity</label>
                <input
                  type="number"
                  min="0.001"
                  step="any"
                  value={formQuantity}
                  onChange={(e) => setFormQuantity(Number(e.target.value))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Recognition</label>
                <input
                  type="text"
                  min="0.001"
                  step="any"
                  value={formAccRecognition}
                  readOnly
                  onChange={(e) => setFormAccRecognition(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Unit of measurement</label>
                <input
                  type="text"
                  value={formUom}
                  readOnly
                  onChange={(e) => setFormUom(e.target.value)}
                  className={inputClass}
                />
              </div>
              <Activity mode="hidden">
                <div>
                  <label className={labelClass}>Product Name Specific</label>
                  <input
                    type="text"
                    value={formProductNameSpecific}
                    readOnly
                    onChange={(e) => setFormProductNameGeneral(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Period Month</label>
                  <input
                    type="text"
                    value={formPeriodMonth}
                    readOnly
                    onChange={(e) => setFormUom(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Period Year</label>
                  <input
                    type="text"
                    value={formPeriodYear}
                    readOnly
                    onChange={(e) => setFormUom(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Supplier Name</label>
                  <input
                    type="text"
                    value={formSupplierName}
                    readOnly
                    onChange={(e) => setFormUom(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>TIN Number</label>
                  <input
                    type="text"
                    value={formTinNumber as string}
                    readOnly
                    onChange={(e) => setFormUom(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Type of Taxpayer</label>
                  <input
                    type="text"
                    value={formTypeOfVatTaxpayer as string}
                    readOnly
                    onChange={(e) => setFormUom(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Type of Stocks</label>
                  <input
                    type="text"
                    value={formTypeOfStocks}
                    readOnly
                    onChange={(e) => setFormUom(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Item Code</label>
                  <input
                    type="text"
                    value={formItemCode as string}
                    readOnly
                    onChange={(e) => setFormUom(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Unit Price</label>
                  <input
                    type="text"
                    value={formUnitPrice}
                    readOnly
                    onChange={(e) => setFormUom(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Total Price</label>
                  <input
                    type="text"
                    value={formTotalPrice}
                    readOnly
                    onChange={(e) => setFormUom(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Vatable</label>
                  <input
                    type="text"
                    value={formVatable}
                    readOnly
                    onChange={(e) => setFormUom(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Vat</label>
                  <input
                    type="text"
                    value={formVat}
                    readOnly
                    onChange={(e) => setFormUom(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Ewt</label>
                  <input
                    type="text"
                    value={formEwt}
                    readOnly
                    onChange={(e) => setFormUom(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Net Pay</label>
                  <input
                    type="text"
                    value={formNetPay}
                    readOnly
                    onChange={(e) => setFormUom(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </Activity>
            </div>
            <div className="mt-6 flex gap-2">
              <button
                type="button"
                onClick={addToCart}
                className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
              >
                Add to cart
              </button>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg border border-amber-200 bg-white px-4 py-2 text-sm font-medium text-amber-900 hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

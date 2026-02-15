export default function AddInventoryPage() {
  return (
    <div className="bg-slate-50 p-8 h-screen">
      {/* CARD START */}
      <div className="border border-blue-200 mx-auto w-5/6 rounded-2xl">
        <div className="relative border-b border-blue-200">
          <h1 className="p-4 text-xl tracking-wide font-semibold text-center bg-blue-50 rounded-t-2xl">
            Inventory Flow (In-and-Out)
          </h1>
          {/* <button className="absolute top-1/2 -translate-y-1/2 right-8">
            X
          </button> */}
        </div>
        {/* form */}
        <div className="">
          <form
            action=""
            className="h-auto flex flex-row flex-nowrap justify-between [&>div]:w-1/2"
          >
            <div className="border-r border-blue-200">
              {/* DATE MODIFIED */}
              <div className="py-4 px-8 space-x-2 border-b border-blue-200">
                <select
                  name="periodMonth"
                  id="periodMonth"
                  defaultValue={"january"}
                  className="border p-1 rounded"
                >
                  <option value="january">January</option>
                  <option value="february">February</option>
                  <option value="march">March</option>
                  <option value="april">April</option>
                  <option value="may">May</option>
                  <option value="june">June</option>
                  <option value="july">July</option>
                  <option value="august">August</option>
                  <option value="september">September</option>
                  <option value="october">October</option>
                  <option value="november">November</option>
                  <option value="december">December</option>
                </select>
                <select
                  name="stores"
                  id="stores"
                  defaultValue={2025}
                  className="border p-1 rounded"
                >
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                  <option value="2028">2028</option>
                  <option value="2029">2029</option>
                </select>
              </div>
              <div className="p-4 space-y-4">
                {/* STOCKS TYPE */}
                <div className="flex flex-col gap-1">
                  <h4 className="text-lg font-medium">Type of Stocks:</h4>
                  <label htmlFor="beginningStocks">
                    <input
                      id="beginningStocks"
                      type="radio"
                      placeholder="Enter Supplier Name"
                      name="stocks"
                      className="border border-slate-300 rounded p-2 bg-slate-100 accent-blue-300 size-4 align-middle"
                    />{" "}
                    Beginning Stocks
                  </label>
                  <label htmlFor="additionalStocks">
                    <input
                      id="additionalStocks"
                      type="radio"
                      placeholder="Enter Supplier Name"
                      name="stocks"
                      className="border border-slate-300 rounded p-2 bg-slate-100 accent-blue-300 size-4 align-middle"
                    />{" "}
                    Additional Stocks
                  </label>
                  <label htmlFor="issuedStocks">
                    <input
                      id="issuedStocks"
                      type="radio"
                      placeholder="Enter Supplier Name"
                      name="stocks"
                      className="border border-slate-300 rounded p-2 bg-slate-100 accent-blue-300 size-4 align-middle"
                    />{" "}
                    Issued Stocks
                  </label>
                </div>

                {/* VAT TYPE */}
                <div className="flex flex-col gap-1">
                  <h4 className="text-lg font-medium">Type of VAT-Taxpayer:</h4>
                  <div className="space-x-16">
                    <label htmlFor="vatReg">
                      <input
                        id="vatReg"
                        type="radio"
                        placeholder="Enter Supplier Name"
                        name="vatType"
                        className="border border-slate-300 rounded p-2 bg-slate-100 accent-blue-300 size-4 align-middle"
                      />{" "}
                      VAT Registered
                    </label>
                    <label htmlFor="nonVat">
                      <input
                        id="nonVat"
                        type="radio"
                        placeholder="Enter Supplier Name"
                        name="vatType"
                        className="border border-slate-300 rounded p-2 bg-slate-100 accent-blue-300 size-4 align-middle"
                      />{" "}
                      Non-VAT
                    </label>
                  </div>
                  {/* SUPPLIER NAME */}
                  <div className="flex flex-col gap-1 pt-2">
                    <label
                      htmlFor="supplierName"
                      className="text-md font-medium"
                    >
                      Supplier Name:
                    </label>
                    <input
                      id="supplierName"
                      type="text"
                      placeholder="Enter Supplier Name"
                      className="border border-slate-300 rounded p-2 bg-slate-100"
                    />
                  </div>
                  {/* TIN NUMBER */}
                  <div className="flex flex-col gap-1">
                    <label htmlFor="tinNumber" className="text-md font-medium">
                      TIN no:
                    </label>
                    <input
                      id="tinNumber"
                      type="text"
                      placeholder="Enter Tin no."
                      className="border border-slate-300 rounded p-2 bg-slate-100"
                    />
                  </div>

                  {/* PRODUCT NAMES */}
                  <div className="space-y-1 mt-2">
                    <div className="flex flex-row items-center gap-2">
                      <label
                        htmlFor="productNameGeneral"
                        className="text-md font-medium"
                      >
                        Product Name (General):{" "}
                      </label>
                      <input
                        id="productNameGeneral"
                        type="text"
                        placeholder="Enter general product name"
                        className="border border-slate-300 rounded p-2 bg-slate-100 grow"
                      />
                    </div>
                    <div className="flex flex-row items-center gap-2">
                      <label
                        htmlFor="productNameSpecific"
                        className="text-md font-medium"
                      >
                        Product Name (Specific):{" "}
                      </label>
                      <input
                        id="productNameSpecific"
                        type="text"
                        placeholder="Enter specific product name"
                        className="border border-slate-300 rounded p-2 bg-slate-100 grow"
                      />
                    </div>
                    <div className="flex flex-row items-center gap-2">
                      <label htmlFor="itemCode" className="text-md font-medium">
                        Item Code:{" "}
                      </label>
                      <input
                        id="itemCode"
                        type="text"
                        placeholder="Enter item code (optional)"
                        className="border border-slate-300 rounded p-2 bg-slate-100 grow"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* SECOND COLUMN */}
            <div className="space-y-4">
              {/* ACCOUNT RECOGNITION */}
              <div className="border-b border-blue-200 flex flex-col gap-1 p-4">
                <h4 className="text-md font-medium">Account Recognition:</h4>
                <label htmlFor="officeSupplies">
                  <input
                    id="officeSupplies"
                    type="radio"
                    name="accRecognition"
                    className="border border-slate-300 rounded p-2 bg-slate-100 accent-blue-300 size-4 align-middle"
                  />{" "}
                  Office Supplies
                </label>
                <label htmlFor="operationalSupplies">
                  <input
                    id="operationalSupplies"
                    type="radio"
                    name="accRecognition"
                    className="border border-slate-300 rounded p-2 bg-slate-100 accent-blue-300 size-4 align-middle"
                  />{" "}
                  Operational Supplies
                </label>
                <label htmlFor="janitorials">
                  <input
                    id="janitorials"
                    type="radio"
                    name="accRecognition"
                    className="border border-slate-300 rounded p-2 bg-slate-100 accent-blue-300 size-4 align-middle"
                  />{" "}
                  Janitorials
                </label>
                <label htmlFor="marketingSupplies">
                  <input
                    id="marketingSupplies"
                    type="radio"
                    name="accRecognition"
                    className="border border-slate-300 rounded p-2 bg-slate-100 accent-blue-300 size-4 align-middle"
                  />{" "}
                  Marketing Supplies
                </label>
              </div>
              {/* UNIT OF MEASUREMENTS */}
              <div className="p-4 pt-0 border-b border-blue-200">
                <label htmlFor="uom">
                  <h4 className="text- font-medium">Unit of Measurement: </h4>
                  <input
                    list="uoms"
                    name="uom"
                    id="uom"
                    placeholder="Enter or choose unit"
                    className="border px-2 py-1 bg-slate-100 rounded-md w-full"
                  />
                  <datalist id="uoms">
                    <option value="Per kilogram">kg</option>
                    <option value="Per piece">pcs</option>
                    <option value="Per pack">packs</option>
                    <option value="Per bundle">bundles</option>
                    <option value="Per gram">g</option>
                  </datalist>
                </label>
              </div>
              {/* QUANTITY AND COMPUTATIONS */}
              <div className="px-4 space-y-1">
                <label className="flex flex-row justify-between items-center">
                  <h4 className="text-md font-medium">Quantity: </h4>
                  <input
                    type="number"
                    name="quantity"
                    placeholder="00"
                    className="px-2 py-1 rounded-md border text-right"
                  />
                </label>
                <label className="flex flex-row justify-between items-center">
                  <h4 className="text-md font-medium">Unit Price: </h4>
                  <input
                    type="number"
                    name="unitPrice"
                    placeholder="in peso {₱}"
                    className="px-2 py-1 rounded-md border text-right"
                  />
                </label>
              </div>
              <div className="px-4 mb-8">
                <div className="flex flex-row flex-nowrap justify-between items-center">
                  <p className="text-md font-medium">Total Price</p>
                  <input
                    type="number"
                    disabled
                    placeholder="auto generated"
                    className="text-right"
                  />
                </div>
                <div className="flex flex-row flex-nowrap justify-between items-center">
                  <p className="text-md font-medium">Vatable</p>
                  <input
                    type="number"
                    disabled
                    placeholder="auto generated"
                    className="text-right"
                  />
                </div>
                <div className="flex flex-row flex-nowrap justify-between items-center">
                  <p className="text-md font-medium">VAT</p>
                  <input
                    type="number"
                    disabled
                    placeholder="auto generated"
                    className="text-right"
                  />
                </div>
                <div className="flex flex-row flex-nowrap justify-between items-center">
                  <p className="text-md font-medium">EWT</p>
                  <input
                    type="number"
                    disabled
                    placeholder="auto generated"
                    className="text-right"
                  />
                </div>
                <div className="flex flex-row flex-nowrap justify-between items-center">
                  <p className="text-md font-medium">Net Pay</p>
                  <input
                    type="number"
                    readOnly
                    defaultValue={4324}
                    placeholder="auto generated"
                    className="text-right"
                  />
                </div>
              </div>
              <div className="p-4 flex flex-col gap-2 *:py-2 *:rounded-lg">
                <button
                  type="reset"
                  className="border bg-amber-200 hover:bg-amber-300 active:bg-amber-400"
                >
                  Store for batch save
                </button>
                <button
                  type="submit"
                  className="border bg-green-200 hover:bg-green-300 active:bg-green-400"
                >
                  Save batched data
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

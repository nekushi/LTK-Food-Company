import Link from "next/link";
import ExcelForm from "./excel";

export default function HumanResource() {
  return (
    <div className="p-4">
      <div>
        <p>This is human resource page.</p>
        <Link
          href={"/dashboard/inventory"}
          className="border py-1 px-2 rounded"
        >
          Go to Inventory
        </Link>
        <Link href={"/dashboard/Delivery"} className="border py-1 px-2 rounded">
          Go to Delivery
        </Link>
      </div>

      <ExcelForm />
    </div>
  );
}

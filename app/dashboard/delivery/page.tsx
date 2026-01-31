import Link from "next/link";

export default function Delivery() {
  return (
    <div className="p-4">
      <p>This is delivery page.</p>
      <Link
        href={"/dashboard/human-resource"}
        className="border py-1 px-2 rounded"
      >
        Go to HR
      </Link>
      <Link href={"/dashboard/inventory"} className="border py-1 px-2 rounded">
        Go to Inventory
      </Link>
    </div>
  );
}

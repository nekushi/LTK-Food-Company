import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="p-4">
      <p>This is dashboard page.</p>
      <Link
        href={"/dashboard/human-resource"}
        className="border py-1 px-2 rounded"
      >
        Go to HR
      </Link>
      <Link href={"/dashboard/inventory/"} className="border py-1 px-2 rounded">
        Go to Inventory
      </Link>
      <Link href={"/dashboard/delivery/"} className="border py-1 px-2 rounded">
        Go to Delivery
      </Link>
    </div>
  );
}

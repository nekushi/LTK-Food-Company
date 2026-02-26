import { redirect } from "next/navigation";

export default function HumanResource() {
  redirect("/hr/accounts");
  return (
    <div>
      <h2>This is HR Dashboard</h2>
    </div>
  );
}

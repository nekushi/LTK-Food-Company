import ExcelForm from "../excel";

export default function Payroll() {
  return (
    <div className="p-4">
      <h2>This is payroll page.</h2>
      <h2 className="text-lg">Register Payroll</h2>
      <ExcelForm />
    </div>
  );
}

import ExcelForm from "./excel";

export default function Payroll() {
  return (
    <div className="p-4">
      <h2 className="text-lg">Generate Payroll</h2>
      <ExcelForm />
    </div>
  );
}

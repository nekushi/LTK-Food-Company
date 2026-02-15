import ExcelForm from "./excel";

export default function Payroll() {
  return (
    <div className="p-8">
      <h2 className="text-xl font-medium mb-4 after:content-[''] after:block after:w-16 after:h-1.5 after:bg-amber-400">
        Generate Payroll
      </h2>
      <ExcelForm />
    </div>
  );
}

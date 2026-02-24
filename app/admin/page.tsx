export default function AdminDashboardPage() {
  return (
    <div className="space-y-6 p-8">
      <div>
        <h1 className="text-xl font-semibold text-amber-900">Admin Dashboard</h1>
        <p className="text-amber-800/80">
          Welcome to the admin panel. Use the sidebar to navigate to the various management pages.
        </p>
      </div>

      <div className="rounded-xl border border-amber-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-medium text-amber-900 mb-4">Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-lg border border-amber-100 bg-amber-50 p-4">
            <h3 className="text-sm font-semibold text-amber-800">Total Branches</h3>
            <p className="text-2xl font-bold text-amber-900 mt-2">--</p>
          </div>
          <div className="rounded-lg border border-amber-100 bg-amber-50 p-4">
            <h3 className="text-sm font-semibold text-amber-800">Total Personnel</h3>
            <p className="text-2xl font-bold text-amber-900 mt-2">--</p>
          </div>
          <div className="rounded-lg border border-amber-100 bg-amber-50 p-4">
            <h3 className="text-sm font-semibold text-amber-800">Total Employees</h3>
            <p className="text-2xl font-bold text-amber-900 mt-2">--</p>
          </div>
        </div>
      </div>
    </div>
  );
}

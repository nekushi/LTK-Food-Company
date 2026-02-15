export default function DeliveryPage() {
  return (
    <div className="flex h-screen flex-col">
      <div className="grid grid-cols-1 gap-4 border-b border-amber-200 bg-white p-4 lg:grid-cols-3">
        <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3">
          <span className="text-sm font-medium text-amber-700">
            Destination
          </span>
          <p className="mt-1 font-semibold text-amber-900">—</p>
        </div>
        <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3">
          <span className="text-sm font-medium text-amber-700">Store name</span>
          <p className="mt-1 font-semibold text-amber-900">
            Store who requested item
          </p>
        </div>
        <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3">
          <span className="text-sm font-medium text-amber-700">Assignment</span>
          <p className="mt-1 font-semibold text-amber-900">
            Assigned by inventory
          </p>
        </div>
      </div>
      <div className="flex-1 bg-slate-200 p-4">
        <div className="flex h-full items-center justify-center rounded-xl border-2 border-dashed border-amber-400 bg-amber-50/30">
          <p className="text-center text-amber-800">
            Map placeholder — react-leaflet routing machine will go here.
          </p>
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { IoAnalytics, IoSettingsOutline } from "react-icons/io5";
import { RiCalendarScheduleLine } from "react-icons/ri";
import { FaRegUser } from "react-icons/fa";

import { TypeNavList } from "@/index";
import BtnLogout from "@/components/logouts/btnLogout";

const navLists: TypeNavList[] = [
  { name: "Dashboard", href: "/store", icon: <IoAnalytics /> },
  { name: "Inventory", href: "/store/inventory", icon: <IoAnalytics /> },
  { name: "Request Items", href: "/store/request-items", icon: <FaRegUser /> },
  { name: "History", href: "/store/history", icon: <RiCalendarScheduleLine /> },
  { name: "Delivery view", href: "/store/delivery-view", icon: <RiCalendarScheduleLine /> },
  { name: "Report", href: "/store/sales-report", icon: <RiCalendarScheduleLine /> },
  { name: "Settings", href: "", icon: <IoSettingsOutline /> },
];

export default function StoreLayoutSidebar({
  firstName,
  lastName,
  username,
}: {
  firstName: string;
  lastName: string;
  username: string;
}) {
  const path = usePathname();
  const displayName = username || "Store User";
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <aside className="h-full bg-amber-50 flex flex-col col-span-2 overflow-y-auto border-r border-amber-200">
      <div className="px-5 pt-5 pb-3">
        <h2 className="text-sm font-bold font-serif text-amber-800 tracking-wide">LTK Food Company</h2>
      </div>

      <div className="px-5 py-4 flex items-center gap-3 border-b border-amber-200">
        <div className="rounded-full bg-amber-700 text-white size-10 flex items-center justify-center text-sm font-bold shrink-0">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-amber-900 truncate">{displayName}</p>
          <p className="text-[11px] text-amber-600">Store</p>
        </div>
      </div>

      <nav className="px-3 py-4 space-y-1">
        {navLists.map((navList: TypeNavList) => {
          const isActive = path === navList.href || (navList.href !== "" && path.startsWith(`${navList.href}/`));
          return (
            <Link
              key={navList.name}
              href={navList.href || "#"}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-amber-200 font-semibold text-amber-900"
                  : "text-amber-800 hover:bg-amber-100"
              }`}
            >
              <span className="text-lg">{navList.icon}</span>
              {navList.name}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 mt-8">
        <BtnLogout />
      </div>
    </aside>
  );
}
